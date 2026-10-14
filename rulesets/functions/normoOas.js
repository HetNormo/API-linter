import { own, object, text, entries, array, diagnostic as d, camel, semver, validDate, timestamp,
  uri, webUrl, mediaType, isJsonMedia, hasType, operations, operationKind, parameters, schemas, shape, effectiveUrls } from '../lib/shared.js';

export const oasChecks = ['document','info','version','releaseDate','operationKind','statusCodes','getBody',
  'noContent','createdLocation','preconditions','mutationReview','bodySchema','problemMedia','problemFields',
  'problemExamples','problemLeak','defaultReview','stringMin','stringMax','stringBounds','dateExamples',
  'dateAdvice','propertyNames','enumCase','enumDynamic','enumReview','composition','securityApplied',
  'securityScheme','securityReferences','oauthUrls','oauthFlow','queryCredentials','parameterPurpose',
  'underscoreAdvice','pagination','paginationAdvice','paginationReview','foreignKey','headers','qosReview',
  'extensionConfig','majorVersion','serverHttps'];

const MATRIX={getResource:['200','404'],getSearch:['200','404','422'],put:['404','422'],patch:['404','422'],
  delete:['204','404'],postCreate:['201','422'],postSearch:['200','422'],head:['204','404'],options:['204']};
const KINDS={get:['resource','search'],post:['create','search','action'],put:['put'],patch:['patch'],delete:['delete'],head:['head'],options:['options'],trace:['trace']};
const PURPOSES={sort:['_sort','sort'],search:['_search','search'],expand:['_expand'],fields:['_fields'],cursor:['_cursor'],limit:['_limit']};
const RESERVED=new Set(['_links','_embedded']);
const ERR=/^[45](?:\d{2}|XX)$/;
const responses=e=>entries(e.op.responses).map(([code,value])=>({code,value,path:[...e.path,'responses',code]}));
const contents=r=>entries(r.value?.content).map(([type,value])=>({type,value,path:[...r.path,'content',type]}));
const errors=doc=>operations(doc).flatMap(e=>e.method==='head'?[]:responses(e).filter(r=>ERR.test(r.code)).map(r=>({...r,e})));
const allowedStatus=(s,n)=>!object(s)||(!own(s,'const')||s.const===n)&&(!Array.isArray(s.enum)||s.enum.includes(n))&&(!Number.isFinite(s.minimum)||n>=s.minimum)&&(!Number.isFinite(s.maximum)||n<=s.maximum);

export default function normoOas(doc, options, context={}) {
  const check=options?.check;
  if(!oasChecks.includes(check)) throw new TypeError(`Onbekende OpenAPI controle: ${String(check)}`);
  const prefix=array(context.path), out=[], add=(path,msg)=>out.push(d([...prefix,...path],msg));
  if(check==='document') {
    if(!object(doc)||!/^3\.(0|1)\.\d+$/.test(doc.openapi??'')) add(['openapi'],'Dit pakket ondersteunt OpenAPI 3.0.x en 3.1.x. Andere versies vragen kwalificatie; dit is geen beperking in de Normo norm zelf.');
    return out;
  }
  if(!object(doc)||typeof doc.openapi!=='string'||!doc.openapi.startsWith('3.')) return out;
  switch(check) {
    case 'info': {
      const fields=[['title'],['description'],['termsOfService'],['contact','name'],['contact','email'],['license','name'],['license','url'],['version'],['x-releaseDate']];
      for(const path of fields) {const v=path.reduce((o,k)=>o?.[k],doc.info);if(!text(v)) add(['info',...path],`Vul info.${path.join('.')} met een niet lege string.`);}
      for(const path of [['termsOfService'],['license','url']]) {const v=path.reduce((o,k)=>o?.[k],doc.info);if(text(v)&&!uri(v)) add(['info',...path],'Gebruik een absolute URI.');}
      const email=doc.info?.contact?.email;
      if(text(email)&&!/^[^\s@]+@[^\s@]+$/.test(email)) add(['info','contact','email'],'Gebruik een syntactisch herkenbaar e-mailadres; deze controle verifieert de mailbox niet.');
      break;
    }
    case 'version': if(!semver(doc.info?.version)) add(['info','version'],'Gebruik SemVer major.minor.patch, eventueel met prerelease en build metadata.'); break;
    case 'releaseDate': if(!validDate(doc.info?.['x-releaseDate'])) add(['info','x-releaseDate'],'Gebruik een bestaande kalenderdatum in YYYY-MM-DD notatie. Quote de datum in YAML.'); break;
    case 'operationKind':
      for(const e of operations(doc)) if(own(e.op,'x-normo-operation-kind')&&!KINDS[e.method].includes(e.op['x-normo-operation-kind'])) add([...e.path,'x-normo-operation-kind'],`Kies voor ${e.method.toUpperCase()}: ${KINDS[e.method].join(', ')}.`);
      break;
    case 'statusCodes':
      for(const e of operations(doc)) {
        const kind=operationKind(e), key=e.method==='get'?(kind==='resource'?'getResource':'getSearch'):e.method==='post'?(kind==='create'?'postCreate':'postSearch'):e.method;
        if(!MATRIX[key]) continue;
        const required=['401','403','500',...MATRIX[key]], missing=required.filter(code=>!own(e.op.responses,code));
        if(missing.length) add([...e.path,'responses'],`ID10 minimumset ontbreekt: ${missing.join(', ')}. Een default of statuscoderange vervangt in dit profiel de expliciete minimumcodes niet.`);
      }
      break;
    case 'getBody': for(const e of operations(doc)) if(e.method==='get'&&own(e.op,'requestBody')) add([...e.path,'requestBody'],'De Normo HTTP bijlage sluit een requestbody bij GET uit.'); break;
    case 'noContent':
      for(const e of operations(doc)) for(const r of responses(e)) if((e.method==='head'||/^(1(?:\d\d|XX)|204|304)$/.test(r.code))&&entries(r.value?.content).length) add([...r.path,'content'],'HEAD en status 1xx, 204 en 304 hebben geen responsebody. Documenteer zo nodig de headers.');
      break;
    case 'createdLocation':
      for(const e of operations(doc)) if(e.method==='post'&&operationKind(e)==='create'&&own(e.op.responses,'201')) {
        const r=e.op.responses['201'], headers=Object.keys(r?.headers??{}).map(s=>s.toLowerCase());
        if(!headers.includes('location')&&!headers.includes('x-object-id')) add([...e.path,'responses','201','headers'],'Documenteer Location of X-Object-ID bij een geslaagde creatie.');
      }
      break;
    case 'preconditions':
      for(const e of operations(doc)) {
        const ps=parameters(e), requires=ps.some(p=>p.value.in==='header'&&['if-match','if-unmodified-since'].includes(String(p.value.name??'').toLowerCase())&&p.value.required===true);
        if(own(e.op.responses,'428')&&!own(e.op.responses,'412')) add([...e.path,'responses'],'Documenteer ook 412 wanneer 428 voorkomt.');
        if(requires&&!['get','head','options'].includes(e.method)&&!own(e.op.responses,'428')) add([...e.path,'responses'],'Documenteer 428 bij een verplichte mutatiepreconditie.');
      }
      break;
    case 'mutationReview':
      for(const e of operations(doc)) if(['post','put','patch','delete'].includes(e.method)&&!(e.method==='post'&&['search','action'].includes(operationKind(e)))) for(const r of responses(e)) if(/^2\d\d$/.test(r.code)&&entries(r.value?.content).length&&r.value?.['x-normo-status-record']!==true) add([...r.path,'content'],'Controleer dat de mutatieresponse alleen een statusrecord bevat, niet de resource. x-normo-status-record documenteert een beoordeelde classificatie.');
      break;
    case 'bodySchema': {
      // Traverse content containers, not schema examples or defaults.
      const visit=(v,path=[],seen=new Set())=>{
        if(!object(v)||seen.has(v)) return;seen.add(v);
        for(const [k,c] of entries(v)) {
          if(k==='content') {for(const [type,m] of entries(c)) if(!own(m,'schema')) add([...path,k,type,'schema'],'Beschrijf iedere gedocumenteerde body met een schema. Een leeg schema {} blijft toegestaan, bijvoorbeeld voor JSON Merge Patch.');}
          if(['schema','schemas','example','examples','default','enum'].includes(k)||k.startsWith('x-')) continue;
          if(Array.isArray(c)) c.forEach((x,i)=>visit(x,[...path,k,i],seen)); else visit(c,[...path,k],seen);
        }seen.delete(v);
      };visit(doc);break;
    }
    case 'problemMedia':
      for(const r of errors(doc)) if(!contents(r).some(m=>mediaType(m.type)==='application/problem+json')) add([...r.path,'content'],'Documenteer application/problem+json bij foutresponses. HEAD blijft bodyloos.');
      break;
    case 'problemFields':
      for(const r of errors(doc)) for(const m of contents(r).filter(m=>mediaType(m.type)==='application/problem+json')) {
        if(!object(m.value?.schema)) continue;
        const s=shape(m.value.schema), base=[...m.path,'schema'];
        const missing=['type','title','status'].filter(k=>!s.required.includes(k));
        if(missing.length)add([...base,'required'],`Markeer ${missing.join(', ')} als verplicht in het Problem schema (Normo ID05).`);
        for(const [key,type] of [['type','string'],['title','string'],['status','integer']]) {
          if(!hasType(shape(s.properties[key]),type)) add([...base,'properties',key],`Het Problem veld ${key} heeft type ${type}.`);
        }
        const type=shape(s.properties.type);
        if(object(s.properties.type)&&!['uri','uri-reference'].includes(type.format)) add([...base,'properties','type','format'],'Leg de URI reference van type vast met format uri-reference of uri.');
        if(/^\d{3}$/.test(r.code)&&!allowedStatus(shape(s.properties.status),+r.code)) add([...base,'properties','status'],`Het status schema sluit HTTP ${r.code} uit.`);
      }
      break;
    case 'problemExamples':
      for(const r of errors(doc)) for(const m of contents(r).filter(m=>mediaType(m.type)==='application/problem+json')) {
        const examples=[];
        if(own(m.value,'example')) examples.push([m.value.example,[...m.path,'example']]);
        for(const [name,x] of entries(m.value?.examples)) if(own(x,'value')) examples.push([x.value,[...m.path,'examples',name,'value']]);
        if(own(m.value?.schema,'example')) examples.push([m.value.schema.example,[...m.path,'schema','example']]);
        array(m.value?.schema?.examples).forEach((v,i)=>examples.push([v,[...m.path,'schema','examples',i]]));
        for(const [v,path] of examples) {
          if(!object(v)||!text(v.type)||!uri(v.type,false)||!text(v.title)||!Number.isInteger(v.status)) add(path,'Het Problem voorbeeld bevat type als URI reference, title als string en status als integer.');
          else if(/^\d{3}$/.test(r.code)&&v.status!==+r.code) add([...path,'status'],`Voorbeeldstatus ${v.status} wijkt af van HTTP ${r.code}.`);
          if(object(v)&&own(v,'instance')&&!uri(v.instance,false)) add([...path,'instance'],'instance bevat een URI reference.');
        }
      }
      break;
    case 'problemLeak':
      for(const r of errors(doc)) {
        const seen=new Set();const scan=(v,path)=>{
          if(!object(v)||seen.has(v))return;seen.add(v);
          for(const [key,child]of entries(v)) {
            if(/^(stacktrace|stack_trace|connectionstring|connection_string)$/i.test(key)) add([...path,key],'Dit foutcontract bevat mogelijk technische implementatiegegevens; beoordeel schema en voorbeelden.');
            if(Array.isArray(child))child.forEach((c,i)=>scan(c,[...path,key,i]));else scan(child,[...path,key]);
          }seen.delete(v);
        };scan(r.value,r.path);
      }break;
    case 'defaultReview': for(const e of operations(doc)) if(own(e.op.responses,'default')) add([...e.path,'responses','default'],'Beoordeel de default response afzonderlijk; het contract duidt deze niet eenduidig als foutresponse aan.'); break;
    case 'stringMin': case 'stringMax': case 'stringBounds':
      for(const {value:s,path,bounds} of schemas(doc)) if(hasType(s,'string')) {
        if(check==='stringMin'&&(!Number.isInteger(bounds.minLength)||bounds.minLength<1)) add([...path,'minLength'],'Leg minLength vast op ten minste 1, ook bij een optioneel of nullable veld.');
        if(check==='stringMax'&&(!Number.isInteger(bounds.maxLength)||bounds.maxLength<1)) add([...path,'maxLength'],'Leg een positieve maxLength vast voor het stringtype.');
        if(check==='stringBounds'&&Number.isFinite(bounds.minLength)&&Number.isFinite(bounds.maxLength)&&bounds.maxLength<bounds.minLength) add([...path,'maxLength'],'maxLength is kleiner dan minLength.');
        if(check==='stringBounds'&&own(s,'length')) add([...path,'length'],'length is geen standaard JSON Schema lengteconstraint. Gebruik gelijke minLength en maxLength voor een vaste lengte.');
      }break;
    case 'dateExamples': case 'dateAdvice':
      for(const {value:s,path} of schemas(doc)) if(['date','date-time','time'].includes(s.format)) {
        const values=[];if(own(s,'example'))values.push([s.example,[...path,'example']]);if(own(s,'default'))values.push([s.default,[...path,'default']]);array(s.examples).forEach((x,i)=>values.push([x,[...path,'examples',i]]));
        for(const [v,p]of values) {
          if(v===null&&(s.nullable===true||array(s.type).includes('null')))continue;
          const full=s.format==='time'?`2000-01-01T${v}`:v;
          if(check==='dateExamples'&&!(s.format==='date'?validDate(v):timestamp(full))) add(p,'Het datum of tijdvoorbeeld heeft geen geldige, ondubbelzinnige notatie.');
          if(check==='dateAdvice'&&s.format!=='date'&&timestamp(full)&&!timestamp(full,3,true)) add(p,'Normo adviseert UTC met Z en drie millisecondecijfers. Dit is geen harde RFC 3339 eis.');
        }
      }break;
    case 'propertyNames':
      for(const {value:s,path} of schemas(doc)) for(const [key]of entries(s.properties)) if(!camel(key)&&!RESERVED.has(key)&&!uri(s['x-normo-reference-model'])) add([...path,'properties',key],'Gebruik camelCase of documenteer het leidende referentiemodel op dit schema.');
      break;
    case 'enumCase': case 'enumDynamic': case 'enumReview':
      for(const {value:s,path} of schemas(doc)) if(Array.isArray(s.enum)) {
        if(check==='enumDynamic'&&s['x-normo-enum-kind']==='dynamic') add([...path,'enum'],'Een dynamische waardenset hoort volgens ID21 niet in enum.');
        if(check==='enumCase'&&!uri(s['x-normo-enum-standard'])) s.enum.forEach((value,i)=>{if(typeof value==='string'&&!/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(value))add([...path,'enum',i],'Gebruik UPPER_SNAKE_CASE of documenteer de internationale enumstandaard.');});
        if(check==='enumReview'&&!uri(s['x-normo-enum-standard'])&&!['static','dynamic'].includes(s['x-normo-enum-kind'])) add([...path,'enum'],'Beoordeel of deze enum een statische set vertegenwoordigt. De machine leidt veranderlijkheid niet uit de waarden af.');
      }break;
    case 'composition': for(const {value:s,path} of schemas(doc)) for(const key of ['allOf','anyOf','oneOf']) if(own(s,key)) add([...path,key],'Normo ID24 raadt schemacompositie af vanwege toolinginteroperabiliteit; beoordeel deze constructie.'); break;
    case 'securityApplied': case 'securityScheme': case 'securityReferences':
      for(const e of operations(doc)) {
        const security=own(e.op,'security')?e.op.security:doc.security, path=own(e.op,'security')?[...e.path,'security']:['security'];
        if(check==='securityApplied'&&(!Array.isArray(security)||security.length===0||security.some(r=>object(r)&&Object.keys(r).length===0))) add(path,'Deze operatie heeft een anonieme toegangsroute of geen effectief security requirement. Operatieniveau overschrijft globale security.');
        array(security).forEach((requirement,i)=>{
          const names=Object.keys(requirement??{});
          if(check==='securityScheme'&&names.length&&!names.some(n=>['oauth2','openIdConnect'].includes(doc.components?.securitySchemes?.[n]?.type))) add([...path,i],'Documenteer OAuth2 of OpenID Connect in iedere toegestane alternatieve toegangsroute.');
          if(check==='securityReferences') for(const name of names) {
            const scheme=doc.components?.securitySchemes?.[name];
            if(!object(scheme)) {add([...path,i,name],'Dit security scheme is niet gedefinieerd.');continue;}
            if(scheme.type==='oauth2') {const scopes=new Set(entries(scheme.flows).flatMap(([,f])=>Object.keys(f?.scopes??{})));for(const scope of array(requirement[name]))if(!scopes.has(scope))add([...path,i,name],`OAuth scope ${scope} is niet in de flows gedefinieerd.`);}
          }
        });
      }break;
    case 'oauthUrls': case 'oauthFlow': case 'queryCredentials':
      for(const [name,s]of entries(doc.components?.securitySchemes)) {
        if(!object(s))continue;
        const p=['components','securitySchemes',name];
        if(check==='queryCredentials'&&s.type==='apiKey'&&s.in==='query')add(p,'Plaats authenticatiegegevens niet in queryparameters.');
        if(check==='oauthUrls') {
          if(s.type==='openIdConnect'&&!webUrl(s.openIdConnectUrl,true))add([...p,'openIdConnectUrl'],'Gebruik een absolute HTTPS discovery URL.');
          for(const [flow,f]of entries(s.flows))for(const key of ['authorizationUrl','tokenUrl','refreshUrl'])if(own(f,key)&&!webUrl(f[key],true))add([...p,'flows',flow,key],'Gebruik een absolute HTTPS OAuth URL.');
        }
        if(check==='oauthFlow')for(const flow of ['implicit','password'])if(own(s.flows,flow))add([...p,'flows',flow],'Gebruik bij voorkeur authorizationCode met PKCE of clientCredentials. PKCE gedrag vraagt een runtime controle.');
      }
      if(check==='queryCredentials')for(const e of operations(doc))for(const p of parameters(e))if(p.value.in==='query'&&/^(access_token|refresh_token|id_token)$/i.test(p.value.name??''))add(p.path,'Een bearer token hoort niet in de URL.');
      break;
    case 'parameterPurpose': case 'underscoreAdvice': case 'foreignKey':
      for(const e of operations(doc))for(const p of parameters(e)) {
        const purpose=p.value['x-normo-purpose'], name=p.value.name;
        if(check==='parameterPurpose'&&PURPOSES[purpose]&&(p.value.in!=='query'||!PURPOSES[purpose].includes(name)))add(p.path,`Voor ${purpose} gebruikt Normo queryparameter ${PURPOSES[purpose].join(' of ')}.`);
        if(check==='underscoreAdvice'&&p.value.in==='query'&&['sort','search'].includes(name))add([...p.path,'name'],`_${name} heeft de voorkeur; ${name} is eveneens toegestaan.`);
        if(check==='foreignKey'&&purpose==='foreignKey'&&(p.value.in!=='query'||e.method!=='get'||operationKind(e)!=='search'))add(p.path,'Zoeken via een externe sleutel gebruikt GET op de collectie met de sleutel als queryparameter.');
      }break;
    case 'pagination': case 'paginationAdvice': case 'paginationReview':
      for(const e of operations(doc)) {
        const ps=parameters(e).filter(p=>p.value.in==='query'), byName=Object.fromEntries(ps.map(p=>[p.value.name,p])), mode=e.op['x-normo-pagination'];
        const detected=mode==='cursor'||own(byName,'_cursor');
        if(mode==='legacy') {if(check==='paginationReview')add([...e.path,'x-normo-pagination'],'ID26 staat bestaande paginering voorlopig toe. Leg bestaande toepassing en acceptatie van de uitzondering vast in het reviewdossier.');continue;}
        if(check==='paginationReview'&&!detected&&ps.some(p=>['_limit','_page','page','offset','_offset'].includes(p.value.name)))add(e.path,'Mogelijke paginering herkend. Classificeer deze als cursor of als beoordeelde bestaande toepassing.');
        if(!detected)continue;
        if(check==='pagination') {
          for(const [key,type]of [['_cursor','string'],['_limit','integer']]) {
            const p=byName[key];if(!p){add([...e.path,'parameters'],`Documenteer de optionele ${key} queryparameter.`);continue;}
            if(p.value.required===true)add([...p.path,'required'],`${key} is optioneel.`);
            if(!hasType(shape(p.value.schema),type))add([...p.path,'schema'],`${key} heeft type ${type}.`);
          }
          const r=e.op.responses?.['200'];
          if(!entries(r?.content).some(([type,m])=>isJsonMedia(type)&&object(m?.schema)))add([...e.path,'responses','200','content'],'Documenteer een JSON response schema voor de cursorpagina.');
          for(const [type,m]of entries(r?.content))if(isJsonMedia(type)&&object(m?.schema)) {
            const s=shape(m.schema),base=[...e.path,'responses','200','content',type,'schema'];
            if(!hasType(shape(s.properties.nextCursor),'string'))add([...base,'properties','nextCursor'],'Documenteer nextCursor als optionele string.');
            if(s.required.includes('nextCursor'))add([...base,'required'],'nextCursor ontbreekt bij de laatste pagina en is daarom niet verplicht.');
            if(!Object.values(s.properties).some(v=>hasType(shape(v),'array')))add([...base,'properties'],'Een cursorresponse bevat een array met resultaten; de naam items is niet verplicht.');
          }
        }
        if(check==='paginationAdvice'&&byName._limit&&byName._limit.value.schema?.default!==100)add([...byName._limit.path,'schema','default'],'Normo adviseert een realistische standaardlimiet van 100.');
      }break;
    case 'headers':
      for(const e of operations(doc))for(const p of parameters(e))if(p.value.in==='header'&&String(p.value.name??'').toLowerCase()==='x-sender-id') {
        const s=shape(p.value.schema);
        if(!hasType(s,'string')||s.minLength!==13||s.maxLength!==13)add([...p.path,'schema'],'Documenteer X-Sender-ID als EAN13 string met minLength en maxLength 13.');
      }break;
    case 'qosReview':
      if(!text(doc.info?.['x-normo-qos']))add(['info'],'Verifieer de QoS informatie in OAS en servicebeschrijving. Een optionele x-normo-qos URI verwijst naar het reviewbewijs, niet naar een Normo verplicht veld.');
      break;
    case 'extensionConfig': {
      for(const {value:s,path}of schemas(doc)) {
        for(const key of ['x-normo-reference-model','x-normo-enum-standard'])if(own(s,key)&&!uri(s[key]))add([...path,key],'Deze lokale annotatie vraagt een absolute bron URI.');
        if(own(s,'x-normo-enum-kind')&&!['static','dynamic'].includes(s['x-normo-enum-kind']))add([...path,'x-normo-enum-kind'],'Gebruik static of dynamic.');
      }
      for(const e of operations(doc)) {
        if(own(e.op,'x-normo-pagination')&&!['cursor','legacy'].includes(e.op['x-normo-pagination']))add([...e.path,'x-normo-pagination'],'Gebruik cursor of legacy.');
        for(const p of parameters(e))if(own(p.value,'x-normo-purpose')&&![...Object.keys(PURPOSES),'filter','foreignKey'].includes(p.value['x-normo-purpose']))add([...p.path,'x-normo-purpose'],'Onbekende semantische parameterannotatie.');
        for(const r of responses(e))if(own(r.value,'x-normo-status-record')&&typeof r.value['x-normo-status-record']!=='boolean')add([...r.path,'x-normo-status-record'],'Gebruik een boolean voor de beoordeelde statusrecordclassificatie.');
      }
      if(own(doc.info,'x-normo-qos')&&!uri(doc.info['x-normo-qos']))add(['info','x-normo-qos'],'Gebruik een absolute URI naar de QoS documentatie.');
      break;
    }
    case 'majorVersion':
      for(const e of operations(doc).filter(e=>e.direction==='incoming'))for(const u of effectiveUrls(e)) {
        if(!u.valid)continue;
        const versions=u.path.split('/').filter(s=>/^v\d+$/.test(s));
        if(versions.length!==1)add(e.path,'De combinatie van effectieve server URL en pad bevat precies één v<major> segment.');
        else if(semver(doc.info?.version)&&versions[0].slice(1)!==doc.info.version.split('.')[0])add(e.path,'Het URI major versienummer wijkt af van info.version.');
      }break;
    case 'serverHttps':
      for(const e of operations(doc).filter(e=>e.direction==='incoming'))for(const u of effectiveUrls(e))if(u.url.startsWith('http:'))add(e.path,'Het effectieve endpoint gebruikt HTTP in plaats van HTTPS.');
      break;
  }
  // One rule can discover the same referenced constraint via several paths. Exact duplicate messages collapse.
  return [...new Map(out.map(r=>[JSON.stringify([r.path,r.message]),r])).values()];
}

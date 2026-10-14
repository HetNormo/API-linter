import { own, object, text, entries, array, diagnostic as d, camel, uuid, ptr, utf8Length,
  semver, timestamp, uri, webUrl, mediaType, isJsonMedia, contextString, walkValue } from '../lib/shared.js';

const KNOWN = new Set(['specversion','id','source','type','time','datacontenttype','dataversion','data','data_base64','dataschema','subject','dataref']);
const PAST = new Set(['sent','read','set','reset','run','paid','found','done','made','won','lost','given','taken','left','held','met','split','shut','put','cut','hit','built','brought','caught','written','withdrawn','bought','sold','broken','chosen','grown','kept','known','shown','taught','told','understood']);
export const eventChecks = [ 'document','specversion','id','uuid','source','sourceIdentifier','type','pastTense',
  'contentType','time','dataVersion','data','encoding','sizeLimit','sizeAdvice','contextNames','payloadNames',
  'subject','dataref','dataSchema','contextValues' ];

/** Spectral RulesetFunction. All rules select "$", so returned paths are absolute. */
export default function normoEvent(event, options, context = {}) {
  const check=options?.check;
  if (!eventChecks.includes(check)) throw new TypeError(`Onbekende eventcontrole: ${String(check)}`);
  const prefix=array(context.path), out=[], add=(path,msg)=>out.push(d([...prefix,...path],msg));
  if (check==='document') {
    if (!object(event)) add([], 'Gebruik één gestructureerd JSON CloudEvent als object, niet een batch, schema of AsyncAPI document.');
    else if (own(event,'openapi') || own(event,'asyncapi') || own(event,'$schema')) add([], 'Dit profiel lint een eventinstantie, niet een OpenAPI, AsyncAPI of JSON Schema document.');
    if (own(event,'data_base64')) add(['data_base64'],'Binaire eventdata vallen buiten dit JSON objectprofiel. Dit is een profielbeperking, geen CloudEvents verbod.');
    return out;
  }
  if (!object(event)) return out;
  const required=(key)=>{ if (!text(event[key])) {add([key],`${key} bevat een niet lege string.`);return false;} return true; };
  const supplied=key=>own(event,key)&&event[key]!==null; // CloudEvents JSON: optional null means unset
  switch(check) {
    case 'specversion': if (required('specversion')&&event.specversion!=='1.0') add(['specversion'],'specversion heeft de waarde "1.0".'); break;
    case 'id': required('id'); break;
    case 'uuid': if (text(event.id)&&!uuid(event.id)) add(['id'],'Gebruik bij voorkeur een UUID. Uniciteit van source en id vraagt een controle bij de producer.'); break;
    case 'source':
      if (required('source')&&(!uri(event.source)||!/^urn:[a-z0-9][a-z0-9-]{0,30}[a-z0-9]:[^:\s]+:[^:\s]+$/i.test(event.source))) add(['source'],'Gebruik urn:<type identifier>:<organization>:<logical name source system>.');
      break;
    case 'sourceIdentifier': {
      const m=typeof event.source==='string'&&/^urn:ean13:([^:]+):/i.exec(event.source);
      if(m&&!/^\d{13}$/.test(m[1])) add(['source'],'De ean13 identificatie telt precies dertien cijfers; deze controle verifieert geen register of controlecijfer.');
      break;
    }
    case 'type': if(required('type')&&!/^[^.\s]+\.[^.\s]+\.[^.\s]+$/.test(event.type)) add(['type'],'Gebruik <context designation>.<object>.<executed command>.'); break;
    case 'pastTense': {
      if(typeof event.type!=='string'||event.type.split('.').length!==3) break;
      const command=event.type.split('.')[2];
      if(!/ed$/i.test(command)&&!PAST.has(command.toLowerCase())&&!array(options.approvedCommands).includes(command)) add(['type'],'Controleer de verleden tijd van de actie. Deze taalkundige controle is een heuristiek, geen grammaticale bewijsvoering.');
      break;
    }
    case 'contentType':
      if(own(event,'data')&&!supplied('datacontenttype')) add(['datacontenttype'],'datacontenttype is verplicht zodra data aanwezig is.');
      else if(supplied('datacontenttype')&&!mediaType(event.datacontenttype)) add(['datacontenttype'],'Gebruik een geldige concrete MIME media type waarde, eventueel met parameters.');
      break;
    case 'time': if(required('time')&&!timestamp(event.time,6,true)) add(['time'],'Gebruik een geldige UTC datum en tijd met exact zes fractiecijfers: yyyy-mm-ddThh:mm:ss.ffffffZ.'); break;
    case 'dataVersion':
      if(own(event,'data')&&!supplied('dataversion')) add(['dataversion'],'dataversion is verplicht zodra data aanwezig is.');
      else if(supplied('dataversion')&&!semver(event.dataversion)) add(['dataversion'],'Gebruik SemVer major.minor.patch, eventueel met prerelease en build metadata.');
      break;
    case 'data':
      // Explicit interpretation E01: follow ID08's type table and non-empty attributes constraint.
      if(own(event,'data')&&(!object(event.data)||Object.keys(event.data).length===0)) add(['data'],'In dit profiel is data een niet leeg object. Zie interpretatie E01 voor de tegenstrijdige formulering in ID08.');
      break;
    case 'encoding':
      if(own(event,'data')&&mediaType(event.datacontenttype)&&!isJsonMedia(event.datacontenttype)&&typeof event.data!=='string') add(['data'],'Een niet JSON media type vraagt in de CloudEvents JSON serialisatie een string; dat valt buiten het gekozen objectprofiel.');
      break;
    case 'sizeLimit': case 'sizeAdvice': {
      const factor=options.bytesPerKB??1000, overhead=options.transportOverheadBytes??0;
      if(![1000,1024].includes(factor)||!Number.isSafeInteger(overhead)||overhead<0) throw new TypeError('Ongeldige grootteconfiguratie.');
      let bytes;
      try {bytes=utf8Length(JSON.stringify(event))+overhead;} catch {add([],'De eventinstantie is niet als JSON te serialiseren.');break;}
      const threshold=(check==='sizeLimit'?256:64)*factor;
      if(bytes>threshold&&(check==='sizeLimit'||bytes<=256*factor)) add([],`De compacte JSON representatie plus ingestelde overhead telt ${bytes} bytes, boven ${threshold}. Controleer daarnaast de feitelijke transportbytes.`);
      break;
    }
    case 'contextNames':
      for(const key of Object.keys(event)) if(!['data','data_base64'].includes(key)&&!/^[a-z0-9]{1,20}$/.test(key)) add([key],'Een contextnaam bestaat uit 1 tot 20 ASCII kleine letters of cijfers.');
      break;
    case 'payloadNames': {
      const exceptions=array(options.nameExemptions);
      for(const e of exceptions) if(!object(e)||!text(e.pointer)||!uri(e.source)) throw new TypeError('Een naamuitzondering vraagt pointer en absolute source URI.');
      if(object(event.data)) walkValue(event.data,(key,value,path)=>{
        if(!camel(key)&&!exceptions.some(e=>e.pointer===ptr(path))) add(path,'Gebruik camelCase voor payloadvelden of leg een specifiek referentiemodel vast in de rulesetconfiguratie.');
      },['data']);
      break;
    }
    case 'subject': if(supplied('subject')&&!text(event.subject)) add(['subject'],'subject is optioneel en bevat, indien gezet, een niet lege string.'); break;
    case 'dataref': if(supplied('dataref')&&!webUrl(event.dataref)) add(['dataref'],'dataref bevat een volledige HTTP of HTTPS URL. Bereikbaarheid en autorisatie vallen buiten deze controle.'); break;
    case 'dataSchema': if(supplied('dataschema')&&!uri(event.dataschema)) add(['dataschema'],'dataschema bevat een absolute URI. De linter haalt deze URI niet op en valideert de domeinpayload niet tegen het schema.'); break;
    case 'contextValues':
      for(const [key,value] of entries(event)) {
        if(['data','data_base64'].includes(key)||value===null) continue;
        if(typeof value==='string') {if(!contextString(value)) add([key],'CloudEvents contextstrings bevatten geen control characters, ongeldige surrogaten of Unicode noncharacters.');}
        else if(!KNOWN.has(key)&&!(typeof value==='boolean'||(Number.isInteger(value)&&value>=-2147483648&&value<=2147483647))) add([key],'Een generieke contextuitbreiding gebruikt een CloudEvents scalar type. Secundaire extensiemappings vragen een afzonderlijk profiel.');
      }
      break;
  }
  return out;
}

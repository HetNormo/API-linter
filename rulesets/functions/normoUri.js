import { object, array, diagnostic as d, operations, effectiveUrls, webUrl } from '../lib/shared.js';
export const uriChecks=['authority','hierarchy','case','variables'];
/** Optional central/national URI profile. Never selected by the default REST profile. */
export default function normoUri(doc, options, context={}) {
  const check=options?.check;
  if(!uriChecks.includes(check))throw new TypeError(`Onbekende URI controle: ${String(check)}`);
  if(!object(doc))return [];
  const out=[], prefix=array(context.path), add=(p,m)=>out.push(d([...prefix,...p],m));
  for(const e of operations(doc).filter(e=>e.direction==='incoming'))for(const u of effectiveUrls(e)) {
    if(check==='variables'&&u.unresolved)add(e.path,'Niet alle mogelijke servervariabelen zijn opgesomd. Alleen defaults en opgegeven enumwaarden zijn gecontroleerd.');
    if(check==='authority') {
      if(!webUrl(u.url,true)){add(e.path,'Het centrale profiel vraagt een absolute HTTPS server URL.');continue;}
      const host=new URL(u.url).hostname;
      if(!/^api\.(?:(?:acc|tst|dev)\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.energysector\.nl$/.test(host))add(e.path,'Gebruik api.[acc.|tst.|dev.]<routing>.energysector.nl; een extern prd segment ontbreekt.');
    }
    if(!u.valid)continue;
    const segments=u.path.split('/').filter(Boolean),vi=segments.findIndex(s=>/^v\d+$/.test(s));
    if(check==='hierarchy') {
      if(vi!==4||segments.length<6)add(e.path,'Controleer de centrale hiërarchie: drie NBility objectniveaus, API naam, v<major> en collectie. Afwijkende granulariteit vraagt een beoordeelde naamkeuze.');
      if(segments[vi]==='v0')add(e.path,'De centrale URI conventie begint bij major versie 1.');
    }
    if(check==='case') {
      // Template variable names are not transmitted literally. Resource identifiers may have their own grammar.
      const literal=u.path.replace(/\{[^{}]+\}/g,'');
      if(/[A-Z]/.test(literal))add(e.path,'Gebruik kleine letters in de letterlijke URI segmenten. Queryparameters en templatevariabelen vallen buiten deze lexicale controle.');
    }
  }
  return [...new Map(out.map(r=>[JSON.stringify(r),r])).values()];
}

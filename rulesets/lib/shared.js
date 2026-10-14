/** Pure helpers. No filesystem, network, clock or mutable global state. */
export const own = (v, k) => v != null && Object.prototype.hasOwnProperty.call(v, k);
export const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export const text = v => typeof v === 'string' && v.trim().length > 0;
export const entries = v => object(v) ? Object.entries(v) : [];
export const array = v => Array.isArray(v) ? v : [];
export const diagnostic = (path, message) => ({ path, message });
export const camel = v => /^[a-z][a-zA-Z0-9]*$/.test(v);
export const uuid = v => typeof v === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
export const hasType = (s, t) => object(s) && (s.type === t || array(s.type).includes(t));
export const ptr = path => '/' + path.map(s => String(s).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
export const utf8Length = value => new TextEncoder().encode(value).length;

export function semver(value) {
  if (typeof value !== 'string') return false;
  const m = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value);
  return !!m && (!m[4] || m[4].split('.').every(s => !/^[0-9]+$/.test(s) || s === '0' || s[0] !== '0'));
}

export function validDate(v) {
  const m = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  const days = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31,30,31,30,31,31,30,31,30,31];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= days[mo - 1];
}

/** Checks calendar date and clock ranges, not the historical leap-second registry. */
export function timestamp(v, fraction = null, utc = false) {
  const m = typeof v === 'string' && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/.exec(v);
  if (!m || !validDate(m[1]) || +m[2] > 23 || +m[3] > 59 || +m[4] > 60) return false;
  if (fraction !== null && (m[5] || '').length !== fraction) return false;
  if (utc && m[6] !== 'Z') return false;
  if (m[6] !== 'Z' && (+m[6].slice(1,3) > 23 || +m[6].slice(4) > 59)) return false;
  // UTC leap seconds only at the end of June or December. Other offsets are not inferred.
  if (+m[4] === 60 && !(m[6] === 'Z' && m[2] === '23' && m[3] === '59' && /-(06-30|12-31)$/.test(m[1]))) return false;
  return true;
}

/** RFC 3986 character-level URI check; network existence is deliberately not checked. */
export function uri(v, absolute = true) {
  if (!text(v) || /[^A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]/.test(v) || /%(?![0-9A-Fa-f]{2})/.test(v)) return false;
  if ((v.match(/#/g) || []).length > 1) return false;
  const scheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(v);
  if (absolute && !scheme) return false;
  if (!scheme && !v.startsWith('/') && v.split(/[/?#]/)[0].includes(':')) return false;
  try { new URL(v, 'https://reference.invalid/'); return true; } catch { return false; }
}
export function webUrl(v, httpsOnly = false) {
  if (!uri(v)) return false;
  try { const u = new URL(v); return (httpsOnly ? u.protocol === 'https:' : ['https:', 'http:'].includes(u.protocol)) && !!u.hostname && !u.username && !u.password; }
  catch { return false; }
}

export function mediaType(v) {
  if (!text(v) || /[\r\n]/.test(v)) return null;
  const token = "[!#$%&'*+.^_`|~0-9A-Za-z-]+";
  const quoted = '"(?:[^"\\\\\\x00-\\x1f\\x7f]|\\\\[\\x20-\\x7e])*"';
  const re = new RegExp(`^(${token})/(${token})(?:[ \\t]*;[ \\t]*${token}=(?:${token}|${quoted}))*[ \\t]*$`);
  const m = re.exec(v);
  return m && m[1] !== '*' && m[2] !== '*' ? `${m[1]}/${m[2]}`.toLowerCase() : null;
}
export const isJsonMedia = v => { const m = mediaType(v); return !!m && (m.endsWith('/json') || m.endsWith('+json')); };
export function contextString(v) {
  if (typeof v !== 'string') return false;
  for (const char of v) {
    const c = char.codePointAt(0);
    if (c <= 31 || (c >= 127 && c <= 159) || (c >= 0xfdd0 && c <= 0xfdef) ||
        (c & 0xffff) === 0xfffe || (c & 0xffff) === 0xffff || (c >= 0xd800 && c <= 0xdfff)) return false;
  }
  return true;
}

/** Traverse payload objects only. An ancestor set permits shared but non-cyclic children. */
export function walkValue(v, visit, path = [], ancestors = new Set()) {
  if (v === null || typeof v !== 'object' || ancestors.has(v)) return;
  if (path.length > 256) throw new RangeError('Documentdiepte groter dan 256; geen geldig lintresultaat.');
  ancestors.add(v);
  if (Array.isArray(v)) v.forEach((child, i) => walkValue(child, visit, [...path,i], ancestors));
  else for (const [key, child] of Object.entries(v)) { visit(key, child, [...path,key], v); walkValue(child, visit, [...path,key], ancestors); }
  ancestors.delete(v);
}

export const METHODS = ['get','put','post','delete','options','head','patch','trace'];
/** All Operation Objects, including callbacks, webhooks and reusable path items. */
export function operations(doc) {
  const out = [], ancestors = new Set();
  const visitItem = (item, path, url, inheritedServers = doc?.servers, direction = 'incoming') => {
    if (!object(item) || ancestors.has(item)) return;
    ancestors.add(item);
    const servers = own(item, 'servers') ? item.servers : inheritedServers;
    for (const method of METHODS) {
      const op = item[method];
      if (!object(op)) continue;
      const opPath = [...path, method];
      out.push({ op, method, item, path: opPath, url, direction,
        servers: own(op,'servers') ? op.servers : servers });
      for (const [cbName, cb] of entries(op.callbacks)) for (const [expression, callbackItem] of entries(cb)) {
        if (!expression.startsWith('x-') && expression !== '$ref') visitItem(callbackItem, [...opPath,'callbacks',cbName,expression], expression, servers, 'callback');
      }
    }
    ancestors.delete(item);
  };
  for (const [url,item] of entries(doc?.paths)) if (url.startsWith('/')) visitItem(item, ['paths',url],url);
  for (const [name,item] of entries(doc?.webhooks)) visitItem(item, ['webhooks',name], name, doc.servers, 'webhook');
  for (const [name,item] of entries(doc?.components?.pathItems)) visitItem(item, ['components','pathItems',name], name, doc.servers, 'template');
  for (const [name,cb] of entries(doc?.components?.callbacks)) for (const [expr,item] of entries(cb)) if (!expr.startsWith('x-') && expr !== '$ref') visitItem(item,['components','callbacks',name,expr],expr,doc.servers,'callback');
  return out;
}
export function parameters(opEntry) {
  const found = new Map();
  for (const [list, base] of [[opEntry.item.parameters,opEntry.path.slice(0,-1)], [opEntry.op.parameters,opEntry.path]]) {
    array(list).forEach((p,i) => { if (object(p)) found.set(`${p.in}\0${p.name}`, { value:p, path:[...base,'parameters',i] }); });
  }
  return [...found.values()];
}
export function operationKind(e) {
  if (text(e.op['x-normo-operation-kind'])) return e.op['x-normo-operation-kind'];
  if (e.method === 'get') return /\{[^/{}]+\}$/.test(e.url) ? 'resource' : 'search';
  if (e.method === 'post') return /\/search$/.test(e.url) ? 'search' : 'create';
  return e.method;
}

/** Conservative projection of unconditional allOf object members; not a JSON Schema solver. */
export function shape(s, seen = new Set()) {
  if (!object(s) || seen.has(s)) return { properties:{}, required:[] };
  seen.add(s);
  const r = { ...s, properties:{...s.properties}, required:[...array(s.required)] };
  for (const branch of array(s.allOf)) {
    const b = shape(branch,seen);
    for (const [key,value] of entries(b.properties)) r.properties[key] = own(r.properties,key) ? { allOf:[r.properties[key],value] } : value;
    r.required.push(...b.required);
    if (!r.type && b.type) r.type=b.type;
    for (const key of ['minLength','minimum']) if (Number.isFinite(b[key])) r[key]=Math.max(r[key] ?? -Infinity,b[key]);
    for (const key of ['maxLength','maximum']) if (Number.isFinite(b[key])) r[key]=Math.min(r[key] ?? Infinity,b[key]);
    for (const key of ['format','enum','const']) if (!own(r,key) && own(b,key)) r[key]=b[key];
  }
  r.required=[...new Set(r.required)]; seen.delete(s); return r;
}

/** Schema-aware traversal: never treats examples, defaults or arbitrary payload data as schemas. */
export function schemas(doc) {
  const out=[], active=new Set();
  function visit(s,path,inherited={}) {
    if (!object(s) || active.has(s)) return;
    if (path.length > 256) throw new RangeError('Schemadiepte groter dan 256; geen geldig lintresultaat.');
    active.add(s);
    const combined=shape(s), bounds={...inherited};
    for (const key of ['minLength','maxLength']) if (Number.isFinite(combined[key])) bounds[key]=key==='minLength' ? Math.max(bounds[key]??-Infinity,combined[key]) : Math.min(bounds[key]??Infinity,combined[key]);
    out.push({ value:s, path, bounds });
    for (const key of ['properties','patternProperties','$defs','definitions','dependentSchemas']) for (const [name,child] of entries(s[key])) visit(child,[...path,key,name]);
    for (const key of ['items','additionalProperties','additionalItems','unevaluatedProperties','unevaluatedItems','contains','propertyNames','not','if','then','else']) {
      if (Array.isArray(s[key])) s[key].forEach((child,i)=>visit(child,[...path,key,i]));
      else visit(s[key],[...path,key]);
    }
    for (const key of ['allOf','anyOf','oneOf','prefixItems']) array(s[key]).forEach((child,i)=>visit(child,[...path,key,i],key==='prefixItems'?{}:bounds));
    active.delete(s);
  }
  for (const [name,s] of entries(doc?.components?.schemas)) visit(s,['components','schemas',name]);
  function containers(v,path=[],seen=new Set()) {
    if (!object(v) || seen.has(v)) return;
    seen.add(v);
    for (const [key,child] of Object.entries(v)) {
      if (key==='schema') { visit(child,[...path,key]); continue; }
      if (['schemas','example','examples','default','enum','const'].includes(key)||key.startsWith('x-')) continue;
      if (Array.isArray(child)) child.forEach((c,i)=>containers(c,[...path,key,i],seen)); else containers(child,[...path,key],seen);
    }
    seen.delete(v);
  }
  containers(doc); return out;
}

export function serverVariants(server, max=256) {
  if (!object(server) || !text(server.url)) return { urls:[], unresolved:true };
  let urls=[server.url], unresolved=false;
  const names=[...new Set([...server.url.matchAll(/\{([^{}]+)\}/g)].map(m=>m[1]))];
  for (const name of names) {
    const def=server.variables?.[name];
    const values=[...new Set([...array(def?.enum), ...(typeof def?.default==='string' ? [def.default] : [])])];
    if (!values.length) {unresolved=true;continue;}
    if (!array(def?.enum).length) unresolved=true; // default alone does not enumerate all deployments
    if (urls.length*values.length>max) throw new RangeError('Meer dan 256 servervarianten; splits het servercontract.');
    urls=urls.flatMap(u=>values.map(v=>u.split(`{${name}}`).join(String(v))));
  }
  return {urls,unresolved};
}
export function effectiveUrls(e) {
  const servers=array(e.servers).length?e.servers:[{url:'/'}];
  return servers.flatMap((s,i)=>{
    const v=serverVariants(s);
    return v.urls.map(url=>{
      const absolute=webUrl(url);
      let basePath='';
      try { basePath=new URL(url,'https://relative.invalid').pathname; } catch { return {url,valid:false,index:i,unresolved:v.unresolved}; }
      return { url, valid:true, absolute, index:i, unresolved:v.unresolved, path:basePath.replace(/\/$/,'')+e.url };
    });
  });
}

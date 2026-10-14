import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Measures actual file bytes, not the transport's total wire representation. */
export function measureEvent(buffer,{kilobyte=1000,overhead=0}={}) {
  if(!Buffer.isBuffer(buffer)) throw TypeError('Geef een Buffer met de oorspronkelijke JSON bytes.');
  if(![1000,1024].includes(kilobyte)||!Number.isSafeInteger(overhead)||overhead<0) throw TypeError('Ongeldige grootteconfiguratie.');
  const text=new TextDecoder('utf-8',{fatal:true}).decode(buffer);
  const event=JSON.parse(text);
  if(!event||typeof event!=='object'||Array.isArray(event)) throw TypeError('Verwacht één JSON eventobject.');
  const total=buffer.length+overhead, compact=Buffer.byteLength(JSON.stringify(event),'utf8');
  return {fileBytes:buffer.length,compactJsonBytes:compact,overheadBytes:overhead,totalMeasuredBytes:total,
    recommendedMaximumBytes:64*kilobyte,maximumBytes:256*kilobyte,
    severity:total>256*kilobyte?'error':total>64*kilobyte?'warn':'none',
    scope:'Oorspronkelijke bestandsbytes plus opgegeven overhead. Geen meting van de volledige transportverbinding.'};
}
export function parseArguments(args) {
  const options={kilobyte:1000,overhead:0,failSeverity:'error'};let file;
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(['--kilobyte','--overhead','--fail-severity'].includes(arg)) {
      const value=args[++i];if(value===undefined) throw Error(`Waarde ontbreekt na ${arg}.`);
      if(arg==='--fail-severity') {if(!['error','warn'].includes(value)) throw Error('Kies error of warn.');options.failSeverity=value;}
      else {if(!/^\d+$/.test(value))throw Error(`${arg} vraagt een niet negatief geheel getal.`);options[arg==='--kilobyte'?'kilobyte':'overhead']=Number(value);}
    } else if(arg.startsWith('-')||file) throw Error(`Onverwacht argument: ${arg}`);
    else file=arg;
  }
  if(!file)throw Error('Gebruik: npm run check:size -- event.json [--overhead 1024] [--kilobyte 1000] [--fail-severity error|warn]');
  return {file,options};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const {file,options}=parseArguments(process.argv.slice(2));
    const result={file,...measureEvent(await readFile(file),options)};
    console.log(JSON.stringify(result,null,2));
    if(result.severity==='error'||(options.failSeverity==='warn'&&result.severity==='warn')) process.exitCode=1;
  } catch(error) {console.error(error.message);process.exitCode=2;}
}

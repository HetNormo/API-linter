import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url)), require=createRequire(import.meta.url);
const report={runner:'Spectral CLI integration',node:process.version,executedAt:new Date().toISOString(),cases:[]};
let temporary;
try {
  let pkgFile;
  try {pkgFile=require.resolve('@stoplight/spectral-cli/package.json');}
  catch {throw Error('Spectral CLI ontbreekt. Voer eerst npm install --ignore-scripts uit. Deze integratietests zijn niet uitgevoerd.');}
  const pkg=JSON.parse(await readFile(pkgFile,'utf8'));report.spectralVersion=pkg.version;
  if(pkg.version!=='6.17.0')throw Error(`Verwacht Spectral 6.17.0, gevonden ${pkg.version}.`);
  const bin=path.resolve(path.dirname(pkgFile),typeof pkg.bin==='string'?pkg.bin:pkg.bin.spectral);
  const cases=[
    ['event JSON','examples/event-valid.json','.spectral-events.yaml',[]],
    ['event zonder payload','examples/event-thin.json','.spectral-events.yaml',[]],
    ['OpenAPI JSON','examples/api-valid.json','.spectral.yaml',[]],
    ['OpenAPI YAML','examples/api-valid.yaml','.spectral.yaml',[]],
    ['OpenAPI componentreferenties','examples/api-references.json','.spectral.yaml',[]],
    ['centrale URI','examples/api-valid.json','rulesets/normo-central.yaml',[]],
    ['ongeldig event','examples/event-invalid.json','.spectral-events.yaml',['normo-event-time']],
    ['ongeldige API','examples/api-invalid.json','.spectral.yaml',['profile-api-effective-security']],
  ];
  temporary=await mkdtemp(path.join(tmpdir(),'normo-spectral-'));
  const referenceDoc=JSON.parse(await readFile(path.join(root,'examples/api-references.json'),'utf8'));
  referenceDoc.paths['/market-agreements'].get.responses['200'].content['application/json'].schema={$ref:'#/components/schemas/Missing'};
  const missingFile=path.join(temporary,'missing-ref.json');await writeFile(missingFile,JSON.stringify(referenceDoc));
  cases.push(['niet opgeloste referentie',missingFile,'.spectral.yaml',['invalid-ref']]);
  for(const [name,file,ruleset,expected] of cases) {
    // Houd stdout zuivere JSON, ook als Spectral geen bevindingen heeft.
    const child=spawnSync(process.execPath,[bin,'lint',file,'--ruleset',ruleset,'--format','json','--quiet','--fail-severity','error'],
      {cwd:root,encoding:'utf8',timeout:90000,maxBuffer:20*1024*1024});
    let diagnostics;
    try {diagnostics=JSON.parse(child.stdout??'');if(!Array.isArray(diagnostics))throw Error('Geen array');}
    catch {report.cases.push({name,passed:false,exitCode:child.status,reason:'Geen geldige JSON diagnostiek',stderr:child.stderr,stdout:child.stdout,error:child.error?.message});continue;}
    const errors=diagnostics.filter(d=>d.severity===0), codes=diagnostics.map(d=>d.code);
    const passed=!child.error&&(expected.length===0?child.status===0&&errors.length===0:child.status===1&&expected.every(c=>codes.includes(c)));
    report.cases.push({name,passed,exitCode:child.status,errors:errors.length,findings:diagnostics.length,expectedCodes:expected,diagnostics,stderr:child.stderr});
  }
  report.status=report.cases.every(c=>c.passed)?'passed':'failed';
  report.passed=report.cases.filter(c=>c.passed).length;report.total=report.cases.length;
  process.exitCode=report.status==='passed'?0:1;
} catch(error) {
  report.status=report.cases.length?'failed':'not-executed';report.reason=error.message;process.exitCode=2;
} finally {
  if(temporary)await rm(temporary,{recursive:true,force:true});
  await mkdir(path.join(root,'reports'),{recursive:true});
  await writeFile(path.join(root,'reports/local-integration.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,passed:report.passed,total:report.total,reason:report.reason,report:'reports/local-integration.json'},null,2));
}

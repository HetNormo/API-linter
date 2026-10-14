import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
const profiles = {
  oas: { file:'normo-oas.yaml', fn:'normoOas', extends:'spectral:oas', resolved:true },
  events: { file:'normo-events.yaml', fn:'normoEvent', resolved:false },
  central: { file:'normo-central.yaml', fn:'normoUri', extends:'./normo-oas.yaml', resolved:true },
};
const q = JSON.stringify;

/** Single source for generated YAML: rule-catalog.json and these profile settings. */
export async function renderRulesets() {
  const catalog = JSON.parse(await readFile(path.join(root,'rulesets/rule-catalog.json'),'utf8'));
  if(new Set(catalog.map(r=>r.code)).size!==catalog.length) throw Error('Dubbele regelcode.');
  const files = new Map();
  for(const [name,p] of Object.entries(profiles)) {
    const lines=['# Gegenereerd met npm run build:rulesets. Zie docs/BESLUITEN.md.'];
    if(p.extends) lines.push('extends:',`  - ${q(p.extends)}`);
    lines.push('functionsDir: "./functions"','functions:',`  - ${q(p.fn)}`,'rules:');
    for(const r of catalog.filter(r=>r.profile===name)) {
      lines.push(`  ${r.code}:`,
        `    description: ${q(`${r.reference}: ${r.description}.`)}`,
        `    documentationUrl: ${q(r.source)}`,
        '    message: "{{error}}"',`    severity: ${r.severity}`,
        '    given: "$"',`    resolved: ${p.resolved}`,
        '    then:',`      function: ${p.fn}`,'      functionOptions:',`        check: ${q(r.check)}`);
      if(name==='events'&&['sizeLimit','sizeAdvice'].includes(r.check))
        lines.push('        bytesPerKB: 1000','        transportOverheadBytes: 0');
    }
    files.set(path.join(root,'rulesets',p.file),lines.join('\n')+'\n');
  }
  return files;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {for(const [file,body] of await renderRulesets()) {await writeFile(file,body);console.log(path.relative(root,file));}}
  catch(error) {console.error(error.message);process.exitCode=1;}
}

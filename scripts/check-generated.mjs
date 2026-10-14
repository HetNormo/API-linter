import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { root, renderRulesets } from './generate-rulesets.mjs';
try {
  let different=false;
  for(const [file,expected] of await renderRulesets()) {
    if(await readFile(file,'utf8')!==expected) {
      console.error(`Afwijkend gegenereerd bestand: ${path.relative(root,file)}. Voer npm run build:rulesets uit.`);
      different=true;
    }
  }
  if(different) process.exitCode=1;
  else console.log('De drie rulesets stemmen overeen met de regelcatalogus.');
} catch(error) {console.error(error.message);process.exitCode=1;}

import { writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, read, metadata } from './lib/project.mjs';
import { planRelease } from './lib/changelog.mjs';
import { build } from './build.mjs';

const next = process.argv[2], dryRun = process.argv.includes('--dry-run');
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
try {
  const result = planRelease(metadata(), read('src/index.html'), read('CHANGELOG.md'), next, date);
  const checked = spawnSync(process.execPath, ['scripts/check.mjs'], { cwd: root, stdio: 'inherit' });
  if (checked.status !== 0) throw Error('Project checks failed. No release files changed.');
  const tested = spawnSync(process.execPath, ['--test', 'tests/*.test.*'], { cwd: root, stdio: 'inherit' });
  if (tested.status !== 0) throw Error('Tests failed. No release files changed.');
  if (dryRun) { console.log(`Dry run: would prepare ${next}; no files changed.`); process.exit(0); }
  const changes = { 'package.json': JSON.stringify(result.pkg, null, 2) + '\n', 'src/index.html': result.html, 'CHANGELOG.md': result.changelog };
  if(existsSync(path.join(root,'package-lock.json'))){const lock=JSON.parse(read('package-lock.json'));lock.version=result.pkg.version;if(lock.packages?.[''])lock.packages[''].version=result.pkg.version;changes['package-lock.json']=JSON.stringify(lock,null,2)+'\n';}
  const before = Object.fromEntries(Object.keys(changes).map(file => [file, read(file)]));
  try {
    for (const [file, content] of Object.entries(changes)) writeFileSync(path.join(root, file), content);
    build();
  } catch (error) {
    for (const [file, content] of Object.entries(before)) writeFileSync(path.join(root, file), content);
    build();
    throw error;
  }
  console.log(`Prepared ${next}. Review changes, commit, then create and push tag v${next}. Nothing was pushed automatically.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }

import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { read, metadata, sourceFiles, runtimeSource } from './lib/project.mjs';
import { validateChangelog } from './lib/changelog.mjs';

const { version } = metadata();
const files = sourceFiles();
assert(files.length > 10, 'Runtime script list is missing.');
assert.equal(new Set(files).size, files.length, 'Duplicate runtime script.');
for (const file of files) {
  assert(/^src\/js\/[\w/.-]+\.js$/.test(file) && !file.includes('..'));
  new Script(read(file), { filename: file });
}
new Script(runtimeSource());
for (const file of ['main.cjs', 'preload.cjs', 'fullscreen.cjs']) new Script(read('desktop/' + file), { filename: 'desktop/' + file });
assert(read('src/index.html').includes(`ALPHA ${version}`));
assert(!/@import|https?:\/\//.test(read('src/styles/main.css')));
validateChangelog(read('CHANGELOG.md'), version);
console.log(`Checked ${files.length} source files, offline styles and changelog ${version}.`);

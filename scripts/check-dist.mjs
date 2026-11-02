import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { renderBuild, outputFiles } from './build.mjs';
import { root, read } from './lib/project.mjs';

const expected = renderBuild().html;
for (const file of outputFiles) assert.equal(read('dist/' + file), expected, `dist/${file} is missing or stale. Run npm run build and commit dist/.`);
const actual = readdirSync(path.join(root, 'dist')).filter(file => file.endsWith('.html')).sort();
assert.deepEqual(actual, [...outputFiles].sort(), 'Remove obsolete HTML outputs by rebuilding.');
console.log('Published dist matches Grindoria sources.');

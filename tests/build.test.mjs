import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';
import { runtimeSource, metadata, sourceFiles } from '../scripts/lib/project.mjs';

test('offline build is deterministic and contains the declared runtime scripts', () => {
  const first = build(), second = build();
  assert.equal(first, second);
  assert(sourceFiles().includes('src/js/systems/career.js'));
  assert.equal(sourceFiles().at(-1), 'src/js/main.js');
  assert(first.includes(`ALPHA ${metadata().version}`));
  assert(!/<script[^>]+src=|<link[^>]+stylesheet|@import/.test(first));
  const match = first.match(/<script>\n([\s\S]*?)\n<\/script>/);
  assert(match);
  new vm.Script(match[1]);
  assert(match[1].includes('function castSkill'));
  assert(runtimeSource().includes("$('help').onclick=help"));
});

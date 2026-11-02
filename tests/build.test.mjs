import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';
import { runtimeSource, metadata, sourceFiles } from '../scripts/lib/project.mjs';

test('offline build is deterministic and contains all 16 runtime scripts', () => {
  const first = build(), second = build();
  assert.equal(first, second);
  assert.equal(sourceFiles().length, 16);
  assert(first.includes(`ALPHA ${metadata().version}`));
  assert(!/<script[^>]+src=|<link[^>]+stylesheet|@import/.test(first));
  const match = first.match(/<script>\n([\s\S]*?)\n<\/script>/);
  assert(match);
  new vm.Script(match[1]);
  assert(match[1].includes('function castSkill'));
  assert(runtimeSource().includes("$('help').onclick=help"));
});

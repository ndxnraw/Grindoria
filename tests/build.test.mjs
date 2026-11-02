import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build, renderBuild, outputFiles } from '../scripts/build.mjs';
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runtimeSource, metadata, sourceFiles } from '../scripts/lib/project.mjs';

test('offline build is deterministic and contains the declared runtime scripts', () => {
  const first = renderBuild().html, second = renderBuild().html;
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

test('builder emits only canonical HTML names and removes obsolete generated HTML', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'grindoria-build-'));
  try {
    writeFileSync(path.join(directory, 'obsolete.html'), 'outdated output');
    writeFileSync(path.join(directory, 'asset.txt'), 'keep asset');
    const html = build(directory);
    assert.deepEqual(readdirSync(directory).filter(file => file.endsWith('.html')).sort(), [...outputFiles].sort());
    for (const file of outputFiles) assert.equal(readFileSync(path.join(directory, file), 'utf8'), html);
    assert.equal(readFileSync(path.join(directory, 'asset.txt'), 'utf8'), 'keep asset');
    assert(html.includes('<title>Grindoria — Definitely not Metin</title>'));
    assert(html.includes('<small>Definitely not Metin</small>'));
  } finally {
    const absolute = path.resolve(directory), base = path.resolve(os.tmpdir());
    assert(absolute.startsWith(base + path.sep) && path.basename(absolute).startsWith('grindoria-build-'));
    rmSync(absolute, { recursive: true, force: true });
  }
});

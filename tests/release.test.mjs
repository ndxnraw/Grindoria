import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { planRelease, validateChangelog } from '../scripts/lib/changelog.mjs';
import { root, read, metadata } from '../scripts/lib/project.mjs';

const pkg = metadata(), html = read('src/index.html'), changelog = read('CHANGELOG.md');
const clean = changelog.replace(/## \[Unreleased\]\n[\s\S]*?(?=\n## \[)/, '## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n');
const pending = clean.replace('### Fixed\n\n## [', '### Fixed\n\n- Oprava testovacieho problému.\n\n## [');
const nextVersion = pkg.version.replace(/\d+$/, n => Number(n) + 1);

test('release moves entries, updates all version markers and preserves history', () => {
  const result = planRelease(pkg, html, pending, nextVersion, '2026-11-02');
  assert.equal(result.pkg.version, nextVersion);
  assert(result.html.includes(`ALPHA ${nextVersion}`));
  assert(result.changelog.includes(`## [${nextVersion}] - 2026-11-02`));
  assert(result.changelog.includes(`compare/v${pkg.version}...v${nextVersion}`));
  assert(result.changelog.includes('## [0.1.0] - 2026-11-02'));
  assert(!/^- \S/m.test(result.changelog.split(`## [${nextVersion}]`)[0]));
  assert.equal(validateChangelog(result.changelog, nextVersion)[0], nextVersion);
});

test('empty notes, invalid versions, downgrades and mismatched markers are rejected', () => {
  assert.throws(() => planRelease(pkg, html, clean, nextVersion, '2026-11-02'), /real bullet/);
  for (const version of [pkg.version, '0.2.9', '0.0.0', 'wat', '00.4.0', '0.4.0-beta']) {
    assert.throws(() => planRelease(pkg, html, pending, version, '2026-11-02'));
  }
  assert.throws(() => planRelease(pkg, html.replace(`ALPHA ${pkg.version}`, ''), pending, nextVersion, '2026-11-02'), /marker/);
  assert.throws(() => validateChangelog(changelog.replace('2026-11-02', '2026-02-30'), pkg.version), /date/);
  assert.equal(planRelease(pkg, html, pending, '1.0.0', '2026-11-02').pkg.version, '1.0.0');
});

test('Windows line endings are accepted', () => {
  const result = planRelease(pkg, html, pending.replace(/\n/g, '\r\n'), nextVersion, '2026-11-02');
  assert.equal(result.pkg.version, nextVersion);
});

test('release CLI dry run leaves files untouched; real run builds the new offline version', () => {
  const fixture = mkdtempSync(path.join(os.tmpdir(), 'grindoria-release-'));
  try {
    for (const dir of ['src', 'scripts', 'desktop']) cpSync(path.join(root, dir), path.join(fixture, dir), { recursive: true });
    writeFileSync(path.join(fixture, 'package.json'), JSON.stringify(pkg));
    writeFileSync(path.join(fixture, 'CHANGELOG.md'), pending);
    mkdirSync(path.join(fixture, 'tests'));
    mkdirSync(path.join(fixture, 'dist'));
    writeFileSync(path.join(fixture, 'dist/obsolete.html'), 'unchanged during dry run');
    writeFileSync(path.join(fixture, 'tests/smoke.test.cjs'), "require('node:test')('fixture checks',()=>{});\n");
    const run = args => spawnSync(process.execPath, ['scripts/release.mjs', ...args], { cwd: fixture, encoding: 'utf8', timeout: 30000 });
    const original = readFileSync(path.join(fixture, 'CHANGELOG.md'), 'utf8');
    const dryRun = run([nextVersion, '--dry-run']);
    assert.equal(dryRun.status, 0, dryRun.stdout + dryRun.stderr);
    assert.equal(readFileSync(path.join(fixture, 'CHANGELOG.md'), 'utf8'), original);
    assert.equal(JSON.parse(readFileSync(path.join(fixture, 'package.json'))).version, pkg.version);
    assert.equal(readFileSync(path.join(fixture, 'dist/obsolete.html'), 'utf8'), 'unchanged during dry run');
    const released = run([nextVersion]);
    assert.equal(released.status, 0, released.stdout + released.stderr);
    assert.equal(JSON.parse(readFileSync(path.join(fixture, 'package.json'))).version, nextVersion);
    assert(readFileSync(path.join(fixture, 'dist/Grindoria.html'), 'utf8').includes(`ALPHA ${nextVersion}`));
    assert.equal(validateChangelog(readFileSync(path.join(fixture, 'CHANGELOG.md'), 'utf8'), nextVersion)[0], nextVersion);
  } finally {
    const absolute = path.resolve(fixture), base = path.resolve(os.tmpdir());
    assert(absolute.startsWith(base + path.sep) && path.basename(absolute).startsWith('grindoria-release-'));
    rmSync(absolute, { recursive: true, force: true });
  }
});

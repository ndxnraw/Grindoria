import assert from 'node:assert/strict';

const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export function versionTuple(version) {
  assert(versionPattern.test(version), 'Use a stable semantic version, e.g. 0.3.2.');
  return version.split('.').map(Number);
}
function compareVersions(left, right) {
  const a = versionTuple(left), b = versionTuple(right);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return Math.sign(a[i] - b[i]);
  return 0;
}
export function validateChangelog(changelog, currentVersion) {
  changelog = changelog.replace(/\r\n/g, '\n');
  versionTuple(currentVersion);
  assert(changelog.includes('## [Unreleased]\n'), 'Missing Unreleased section.');
  const releases = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/gm)];
  assert(releases.length && releases[0][1] === currentVersion, 'Latest changelog version must match package.json.');
  assert.equal(new Set(releases.map(r => r[1])).size, releases.length, 'Duplicate changelog version.');
  for (let i = 0; i < releases.length; i++) {
    const release = releases[i], date = new Date(release[2] + 'T00:00:00Z');
    if (i > 0) assert(compareVersions(releases[i - 1][1], release[1]) > 0, 'Releases must be newest first.');
    assert(!Number.isNaN(date.valueOf()) && date.toISOString().startsWith(release[2]), 'Invalid release date.');
    const body = changelog.slice(release.index + release[0].length, releases[i + 1]?.index);
    assert(/^- \S/m.test(body), `Empty release ${release[1]}.`);
    assert(changelog.includes(`[${release[1]}]: https://github.com/ndxnraw/Grindoria/`), 'Missing version comparison link.');
  }
  return releases.map(r => r[1]);
}
export function planRelease(pkg, html, changelog, next, date) {
  changelog = changelog.replace(/\r\n/g, '\n');
  assert(compareVersions(next, pkg.version) > 0, 'Release version must increase.');
  validateChangelog(changelog, pkg.version);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date));
  const match = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[)/);
  assert(match && /^- \S/m.test(match[1]), 'Add a real bullet entry under Unreleased before releasing.');
  const header = `## [Unreleased]\n\n### Added\n\n### Changed\n\n### Fixed\n\n## [${next}] - ${date}\n${match[1].trimEnd()}\n`;
  let updated = changelog.replace(match[0], header);
  updated = updated.replace(/^\[Unreleased\]:.*$/m, `[Unreleased]: https://github.com/ndxnraw/Grindoria/compare/v${next}...HEAD`);
  updated = updated.trimEnd() + `\n[${next}]: https://github.com/ndxnraw/Grindoria/compare/v${pkg.version}...v${next}\n`;
  const nextHTML = html.replace(`ALPHA ${pkg.version}`, `ALPHA ${next}`);
  assert.notEqual(nextHTML, html, 'Missing game version marker.');
  validateChangelog(updated, next);
  return { pkg: { ...pkg, version: next }, html: nextHTML, changelog: updated };
}

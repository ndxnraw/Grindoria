import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { Script } from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { root, read, metadata, runtimeSource } from './lib/project.mjs';

export const outputFiles = ['index.html', 'Grindoria.html'];

export function renderBuild() {
  const { version } = metadata();
  const runtime = runtimeSource();
  new Script(runtime);
  const css = read('src/styles/main.css');
  assert(!/@import|https?:\/\//.test(css), 'Offline CSS must not load external resources.');
  let html = read('src/index.html');
  assert(html.includes(`ALPHA ${version}`), 'Game version differs from package.json.');
  html = html.replace('<link rel="stylesheet" href="styles/main.css">', () => `<style>\n${css}</style>`);
  const tagPattern = /<script src="[^"\n]+"><\/script>\s*/g;
  let inserted = false;
  html = html.replace(tagPattern, () => {
    if (inserted) return '';
    inserted = true;
    return `<script>\n${runtime.replace(/<\/script/gi, '<\\/script')}\n</script>\n`;
  });
  assert(inserted && !/<script[^>]+src=|<link[^>]+stylesheet|@import/.test(html));
  return { html, version };
}

export function build(directory = path.join(root, 'dist')) {
  const { html, version } = renderBuild();
  mkdirSync(directory, { recursive: true });
  const absoluteDirectory = path.resolve(directory);
  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html') || outputFiles.includes(entry.name)) continue;
    const stale = path.resolve(absoluteDirectory, entry.name);
    assert.equal(path.dirname(stale), absoluteDirectory, 'Stale output must stay inside dist.');
    unlinkSync(stale);
  }
  for (const file of outputFiles) writeFileSync(path.join(directory, file), html);
  console.log(`Built Grindoria ${version}: dist/Grindoria.html (${Buffer.byteLength(html)} bytes)`);
  return html;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();

import { mkdirSync, writeFileSync } from 'node:fs';
import { Script } from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { root, read, metadata, runtimeSource } from './lib/project.mjs';

export function build() {
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
  const directory = path.join(root, 'dist');
  mkdirSync(directory, { recursive: true });
  for (const file of ['index.html', 'Jade-Realm.html']) writeFileSync(path.join(directory, file), html);
  console.log(`Built JadeRealm ${version}: dist/Jade-Realm.html (${Buffer.byteLength(html)} bytes)`);
  return html;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();

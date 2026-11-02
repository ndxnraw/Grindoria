import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const read = file => readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
export const metadata = () => JSON.parse(read('package.json'));
export function sourceFiles() {
  return [...read('src/index.html').matchAll(/<script src="([^"\n]+)"><\/script>/g)]
    .map(match => 'src/' + match[1]);
}
export function runtimeSource() {
  return sourceFiles().map(file => `// ${file}\n${read(file)}`).join('\n\n');
}

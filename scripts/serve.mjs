import http from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { root } from './lib/project.mjs';

const source = path.join(root, 'src'), port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(source, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(source, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403); return res.end(); }
    if (!statSync(file).isFile()) throw Error('Not a file');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(readFileSync(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Grindoria: http://127.0.0.1:${port}`));

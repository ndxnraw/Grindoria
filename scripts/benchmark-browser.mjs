import http from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const optimized=fileURLToPath(new URL('../dist/Grindoria.html',import.meta.url));
const baseline=process.argv[2];
const runner=readFileSync(new URL('./lib/browser-benchmark.js',import.meta.url),'utf8');
http.createServer((req,res)=>{
 const route=new URL(req.url,'http://localhost').pathname;
 if(!['/before','/after'].includes(route)){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end('<title>Grindoria: meranie výkonu</title><h1>Meranie výkonu</h1><p>1 000 príšer a 5 000 predmetov. Samostatné testovacie úložisko.</p><a href="/after">Optimalizovaná zostava</a>'+(baseline?' · <a href="/before">Pôvodná zostava</a>':''));return;}
 if(route==='/before'&&!baseline){res.writeHead(404);res.end('Chýba cesta k pôvodnej zostave.');return;}
 const html=readFileSync(route==='/before'?baseline:optimized,'utf8').replace('</head>','<script>window.benchmarkRAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;</script></head>').replace('</body>','<script>'+runner+'</script></body>');
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);
}).listen(4174,'127.0.0.1',()=>console.log('Meranie: http://127.0.0.1:4174'));

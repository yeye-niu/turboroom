import http from 'node:http';
import https from 'node:https';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const backend = new URL(process.env.API_TARGET || 'http://127.0.0.1:8888');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
export function createServer(target = backend) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/meetroom/') || url.pathname.startsWith('/pic/')) {
        const headers = {...req.headers, host: target.host}; delete headers.connection;
        const upstream = (target.protocol === 'https:' ? https : http).request(new URL(url.pathname + url.search, target), {method:req.method,headers}, reply => {
          res.writeHead(reply.statusCode, {...reply.headers,'cache-control':'no-store'}); reply.pipe(res);
        });
        upstream.setTimeout(15000, () => upstream.destroy(new Error('timeout')));
        upstream.on('error', () => {
          if (!res.headersSent) res.writeHead(502, {'content-type':'application/json; charset=utf-8'});
          res.end(JSON.stringify({code:502,msg:'无法连接 Java 服务，请确认后端已启动及 API_TARGET 配置。'}));
        });
        req.on('aborted', () => upstream.destroy()); req.pipe(upstream); return;
      }
      if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
      const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
      if (!file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
      const data = await readFile(file);
      res.writeHead(200, {'content-type':mime[path.extname(file)] || 'application/octet-stream','x-content-type-options':'nosniff','cache-control':'no-cache','referrer-policy':'same-origin','content-security-policy':"default-src 'self'; img-src 'self' data: https: http:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {res.writeHead(404);res.end('Not found');}
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer().listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(`TurboRoom: http://localhost:${process.env.PORT || 3000} | Java: ${backend.origin}`));
}

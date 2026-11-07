// Lokaler Server, der das Verhalten von Cloudflare Pages für statische Auslieferung nachbildet (Prüfhilfe, kein Ersatz für die echte Umgebung):
//  - Datei vorhanden: ausliefern (Status 200)
//  - Verzeichnis mit index.html: mit Schrägstrich am Ende ausliefern, ohne Schrägstrich per 308 dorthin umleiten
//  - /index.html und /verzeichnis/index.html: per 308 auf die kurze Adresse
//  - Nicht vorhanden: liegt eine 404.html im Wurzelverzeichnis, antwortet der Server mit deren Inhalt und Status 404.
//    Ohne 404.html würde Cloudflare Pages die index.html mit Status 200 ausliefern (Einseiten-App-Modus). Das bildet dieser Server ebenfalls ab.
// Aufruf: node scripts/serve-pages-emulation.mjs [Ordner=dist] [Port=4180]
import { createServer } from 'node:http';
import { brotliCompressSync, constants } from 'node:zlib';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4180);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};
const has404 = existsSync(join(dir, '404.html'));

// Textdateien werden wie bei Cloudflare mit Brotli komprimiert ausgeliefert (sonst wären Größen und Ladezeiten in Messungen unrealistisch).
const packed = new Map();
const COMPRESSIBLE = /^(text\/|application\/(json|javascript|xml|manifest)|image\/svg)/;
let currentAccept = '';
const send = (res, status, body, type = 'text/html; charset=utf-8', extra = {}, accept = currentAccept) => {
  const headers = { 'Content-Type': type, 'Cache-Control': 'public, max-age=0, must-revalidate', ...extra };
  if (body.length > 0 && /\bbr\b/.test(accept) && COMPRESSIBLE.test(type)) {
    const key = type + ':' + body.length + ':' + Buffer.from(body).subarray(0, 64).toString('hex');
    if (!packed.has(key)) packed.set(key, brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } }));
    const z = packed.get(key);
    res.writeHead(status, { ...headers, 'Content-Encoding': 'br', Vary: 'Accept-Encoding', 'Content-Length': z.length });
    return res.end(z);
  }
  res.writeHead(status, headers);
  res.end(body);
};

createServer((req, res) => {
  currentAccept = String(req.headers['accept-encoding'] ?? '');
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  if (path.includes('..')) return send(res, 400, 'Bad request');
  const redirect = (to) => send(res, 308, '', 'text/plain', { Location: to + url.search });
  if (path.endsWith('/index.html')) return redirect(path.slice(0, -'index.html'.length));
  const file = normalize(join(dir, path));
  if (existsSync(file) && statSync(file).isFile()) return send(res, 200, readFileSync(file), TYPES[extname(file)] ?? 'application/octet-stream');
  if (existsSync(file) && statSync(file).isDirectory() && existsSync(join(file, 'index.html'))) {
    if (!path.endsWith('/')) return redirect(path + '/');
    return send(res, 200, readFileSync(join(file, 'index.html')));
  }
  if (has404) return send(res, 404, readFileSync(join(dir, '404.html')));
  return send(res, 200, readFileSync(join(dir, 'index.html')));
}).listen(port, '127.0.0.1', () => console.log(`Cloudflare-Pages-Nachbildung: http://127.0.0.1:${port}/ (Ordner ${dir}, 404.html: ${has404 ? 'ja' : 'nein'})`));

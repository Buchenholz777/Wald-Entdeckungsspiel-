/* Entdeckerzeit – Service Worker (Vorlage).
   Beim Build setzt Vite Version und Dateiliste in die beiden Konstanten unten ein (siehe vite.config.ts).
   Grundsätze:
   - Anwendungshülle, Katalog (im JS-Bündel), alle Suchbilder (SVG im Bündel), Schrift und Icons werden vorgeladen.
   - Neue Versionen warten im Hintergrund und werden erst beim nächsten Start aktiv (kein Wechsel mitten in einer Runde).
   - Kein Laufzeit-Caching fremder Dateien; es werden nie alte und neue Dateien gemischt. */

const VERSION = '__VERSION__';
const URLS = __URLS__;
const CACHE = 'entdeckerzeit-' + VERSION;
let firstInstall = false;

function abs(u) {
  return new URL(u, self.registration.scope).href;
}

self.addEventListener('install', (event) => {
  firstInstall = !self.registration.active;
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(URLS.map((u) => new Request(abs(u), { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('entdeckerzeit-') && k !== CACHE).map((k) => caches.delete(k)));
      if (firstInstall) await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (req.mode === 'navigate') {
        // Eine vorgeladene Inhaltsseite (zum Beispiel /waldschatzsuche/) wird unter ihrer eigenen Adresse beantwortet, nie mit der App-Hülle.
        const page = await cache.match(req, { ignoreSearch: true, ignoreVary: true });
        if (page) return page;
        // Nur die Startadresse bekommt die App-Hülle (Hash-Routen teilen sich dieses Dokument). Alles andere geht ins Netz,
        // damit das Hosting unbekannte Adressen mit seiner echten 404-Antwort beantwortet; ohne Netz bleibt dann die Hülle als Notlösung.
        const path = url.pathname.replace(/index\.html$/, '');
        const isStart = path === new URL(self.registration.scope).pathname;
        const shell = await cache.match(abs('./'), { ignoreVary: true });
        if (isStart && shell) return shell;
        try {
          return await fetch(req);
        } catch (e) {
          // Ohne Netz und ohne vorgeladene Seite: zurück zur Startadresse (die Hülle unter einer fremden Adresse fände ihre Dateien nicht).
          if (shell) return Response.redirect(abs('./'), 302);
          throw e;
        }
      }
      // ignoreVary: Der Server sendet Vary: Origin; der Vorlade-Eintrag soll trotzdem für jede Anfrage passen.
      const hit = await cache.match(req, { ignoreSearch: true, ignoreVary: true });
      if (hit) return hit;
      return fetch(req);
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'STATUS' && event.ports && event.ports[0]) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        const hits = await Promise.all(URLS.map((u) => cache.match(abs(u), { ignoreVary: true })));
        const cached = hits.filter(Boolean).length;
        event.ports[0].postMessage({ version: VERSION, total: URLS.length, cached, ready: cached === URLS.length });
      })(),
    );
  }
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
});

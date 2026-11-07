import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSeoFiles, transformHome } from './src/seo/build';

/**
 * Erzeugt nach dem Build `sw.js` und `precache-manifest.json`.
 * Das Manifest listet ALLE ausgelieferten Dateien (Hülle, Katalog-Bündel, Schrift, Icons).
 * Die Version ist ein Hash über alle Inhalte – ändert sich etwas, entsteht ein neuer Cache.
 */
function precachePlugin(): Plugin {
  return {
    name: 'entdeckerzeit-precache',
    apply: 'build',
    generateBundle(_options, bundle) {
      // Statisch ausgelieferte Seiten (Unterseiten, 404, Sitemap) aus der einen Quelle src/seo; sie kommen in die Vorlade-Liste (nur Inhaltsseiten).
      // Der Google-Tag wird aus der Quelle index.html übernommen (eine Stelle, nie doppelt).
      const indexHtml = readFileSync(fileURLToPath(new URL('./index.html', import.meta.url)), 'utf8');
      const find = (re: RegExp): string => Object.keys(bundle).find((k) => re.test(k)) ?? '';
      const seoFiles = buildSeoFiles(indexHtml, {
        css: find(/^assets\/index-.*\.css$/),
        bg: {
          wideWebp: find(/^assets\/wald-breit-1600-.*\.webp$/),
          wideJpg: find(/^assets\/wald-breit-1600-.*\.jpg$/),
          narrowWebp: find(/^assets\/wald-schmal-720-.*\.webp$/),
          narrowJpg: find(/^assets\/wald-schmal-720-.*\.jpg$/),
        },
      });
      const files: { url: string; hash: string }[] = [];
      for (const [fileName, item] of Object.entries(bundle)) {
        const source = item.type === 'chunk' ? item.code : item.source;
        const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
        files.push({ url: fileName, hash });
      }
      for (const f of seoFiles) {
        this.emitFile({ type: 'asset', fileName: f.fileName, source: f.source });
        // Inhaltsseiten werden unter ihrer Verzeichnis-Adresse vorgeladen („waldschatzsuche/“), denn so ruft der Browser sie auf.
        if (f.precache) files.push({ url: f.fileName.replace(/index\.html$/, ''), hash: createHash('sha256').update(f.source).digest('hex').slice(0, 12) });
      }
      // Dateien aus /public (Manifest, Icons, Beispielbild der Inhaltsseite) ergänzen – sie liegen nicht im Bundle.
      const publicFiles = ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/icon.svg', 'seo/beispiel-nadelzweig-720.webp'];
      for (const f of publicFiles) {
        try {
          const buf = readFileSync(fileURLToPath(new URL(`./public/${f}`, import.meta.url)));
          files.push({ url: f, hash: createHash('sha256').update(buf).digest('hex').slice(0, 12) });
        } catch {
          /* fehlende optionale Datei: wird nicht vorgeladen */
        }
      }
      files.sort((a, b) => a.url.localeCompare(b.url));
      const template = readFileSync(fileURLToPath(new URL('./src/pwa/sw-template.js', import.meta.url)), 'utf8');
      const version = createHash('sha256')
        .update(files.map((f) => `${f.url}:${f.hash}`).join('|'))
        .update(template)
        .digest('hex')
        .slice(0, 10);
      const urls = ['./', ...files.map((f) => f.url)];
      this.emitFile({
        type: 'asset',
        fileName: 'precache-manifest.json',
        source: JSON.stringify({ version, urls }, null, 2),
      });
      const sw = template
        .replace("'__VERSION__'", () => JSON.stringify(version))
        .replace('const URLS = __URLS__;', () => `const URLS = ${JSON.stringify(urls)};`);
      if (sw.includes('__VERSION__') || sw.includes('__URLS__')) throw new Error('Service-Worker-Platzhalter wurden nicht ersetzt');
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: sw });
    },
  };
}

/** Setzt Kopfdaten und statischen Inhalt der Startseite in index.html (Entwicklung und Build). */
function seoHomePlugin(): Plugin {
  return { name: 'wald-spiel-seo-home', transformIndexHtml: { order: 'pre', handler: (html) => transformHome(html) } };
}

export default defineConfig({
  base: './',
  plugins: [react(), seoHomePlugin(), precachePlugin()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
});

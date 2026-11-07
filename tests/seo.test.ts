import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildSeoFiles, extractAnalytics, renderSitemap, transformHome } from '../src/seo/build';
import { PAGES, PARENT_INFO, PLAY, SITE_URL, START_LINKS, absUrl, pageById } from '../src/seo/site';
import { ESCAPE_MINUTES, KEY_COUNT, SIZES } from '../src/domain/escape/types';

const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const assets = {
  css: 'assets/index-test.css',
  bg: { wideWebp: 'assets/w.webp', wideJpg: 'assets/w.jpg', narrowWebp: 'assets/n.webp', narrowJpg: 'assets/n.jpg' },
};
const files = buildSeoFiles(indexSource, assets);
const home = transformHome(indexSource);
const docs: { path: string; html: string }[] = [
  { path: '/', html: home },
  ...PAGES.filter((p) => p.id !== 'start').map((p) => ({ path: p.path, html: files.find((f) => f.fileName === `${p.path.replace(/^\/|\/$/g, '')}/index.html`)!.source })),
];
const count = (html: string, re: RegExp): number => (html.match(re) ?? []).length;
const text = (html: string): string => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('SEO: öffentliche Einstiegsseiten', () => {
  it('vier Seiten mit eindeutigen Adressen, Titeln und Beschreibungen in sinnvoller Länge', () => {
    expect(PAGES.map((p) => p.path)).toEqual(['/', '/waldschatzsuche/', '/wald-escape/', '/anleitung/']);
    expect(new Set(PAGES.map((p) => p.title)).size).toBe(4);
    expect(new Set(PAGES.map((p) => p.description)).size).toBe(4);
    for (const p of PAGES) {
      expect(p.title.length, p.title).toBeGreaterThanOrEqual(40);
      expect(p.title.length, p.title).toBeLessThanOrEqual(65);
      expect(p.description.length, p.description).toBeGreaterThanOrEqual(130);
      expect(p.description.length, p.description).toBeLessThanOrEqual(165);
    }
  });

  it('jedes Dokument hat genau einen Titel, eine Beschreibung, einen Canonical, eine sichtbare H1 und einen Google-Tag', () => {
    for (const d of docs) {
      const p = PAGES.find((x) => x.path === d.path)!;
      expect(count(d.html, /<title>/g), d.path).toBe(1);
      expect(count(d.html, /<meta name="description"/g), d.path).toBe(1);
      expect(count(d.html, /rel="canonical"/g), d.path).toBe(1);
      expect(d.html, d.path).toContain(`<link rel="canonical" href="${absUrl(p.path)}" />`);
      expect(count(d.html, /<h1[ >]/g), d.path).toBe(1);
      expect(d.html, d.path).toContain(p.h1);
      expect(d.html, d.path).toContain(`<title>${p.title}</title>`);
      expect(count(d.html, /googletagmanager\.com\/gtag\/js\?id=G-ERW5Y3F1W7/g), d.path).toBe(1);
      expect(count(d.html, /gtag\('config'/g), d.path).toBe(1);
      expect(d.html, d.path).not.toMatch(/name="keywords"/);
    }
  });

  it('Open Graph mit absoluten Adressen, Bildmaßen und Alternativtext, im HTML ohne JavaScript', () => {
    for (const d of docs) {
      expect(d.html, d.path).toContain(`<meta property="og:url" content="${absUrl(d.path)}" />`);
      expect(d.html, d.path).toContain(`<meta property="og:image" content="${SITE_URL}/og/wald-spiel-1200x630.jpg" />`);
      expect(d.html, d.path).toMatch(/og:image:width" content="1200"/);
      expect(d.html, d.path).toMatch(/og:image:height" content="630"/);
      expect(d.html, d.path).toMatch(/og:image:alt" content="[^"]{20,}"/);
      expect(d.html, d.path).toContain('twitter:card');
    }
  });

  it('JSON-LD ist gültiges JSON, die @id-Verweise lösen sich auf, der Detektivmodus kommt nicht als Spiel vor', () => {
    for (const d of docs) {
      const m = d.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(m, d.path).not.toBeNull();
      const ld = JSON.parse(m![1]);
      const graph: Record<string, unknown>[] = ld['@graph'];
      const ids = new Set(graph.map((n) => n['@id'] as string));
      const refs = JSON.stringify(graph).match(/"@id":"[^"]+"/g)!.map((s) => s.slice(7, -1));
      for (const r of refs) expect(ids.has(r), `${d.path}: ${r}`).toBe(true);
      const types = graph.map((n) => n['@type']);
      expect(types, d.path).toContain('WebSite');
      expect(types, d.path).toContain('WebApplication');
      expect(types, d.path).toContain('WebPage');
      expect(types.includes('BreadcrumbList'), d.path).toBe(d.path !== '/');
      expect(JSON.stringify(graph), d.path).not.toMatch(/aggregateRating|review|offers|Organization|Detektiv/i);
    }
  });

  it('die Startseite verlinkt alle öffentlichen Seiten und die Spielmodi mit echten Links', () => {
    for (const l of START_LINKS) expect(home).toContain(`<a href="${l.path}">${l.label}</a>`);
    expect(home).toContain(`<a href="${PLAY.treasure}">`);
    expect(home).toContain(`<a href="${PLAY.escape}">`);
    // Walddetektive: Ankündigung, kein Link und keine eigene Seite
    expect(home).toMatch(/Walddetektive – <strong>Bald verfügbar<\/strong>/);
    expect(PAGES.some((p) => /detektiv/i.test(p.path))).toBe(false);
    for (const t of PARENT_INFO.paragraphs) expect(home).toContain(t.replace(/&/g, '&amp;').replace(/"/g, '&quot;'));
  });

  it('alle internen Links führen auf vorhandene Seiten, Dateien oder Spiel-Einstiege', () => {
    const known = new Set([...PAGES.map((p) => p.path), PLAY.menu, PLAY.treasure, PLAY.escape, '/seo/beispiel-nadelzweig-720.webp', '/icons/icon.svg']);
    for (const d of docs) {
      for (const m of d.html.matchAll(/href="(\/[^"]*)"/g)) {
        const href = m[1];
        if (href.startsWith('/assets/') || href.startsWith('/icons/') || href === '/manifest.webmanifest') continue;
        expect(known.has(href), `${d.path}: ${href}`).toBe(true);
      }
    }
    // jede Inhaltsseite ist von der Startseite aus erreichbar
    for (const p of PAGES.filter((x) => x.id !== 'start')) expect(home).toContain(`href="${p.path}"`);
  });

  it('Unterseiten haben Brotkrumen, Navigation, Rücknavigation zum Spiel und Fußzeile', () => {
    for (const d of docs.filter((x) => x.path !== '/')) {
      expect(d.html, d.path).toContain('aria-label="Brotkrumen"');
      expect(d.html, d.path).toContain('aria-label="Hauptnavigation"');
      expect(d.html, d.path).toContain(`href="${PLAY.menu}"`);
      expect(d.html, d.path).toContain('class="seo-foot"');
    }
  });

  it('Wald Escape erklärt die aktuellen Zahlen aus den Spieldaten', () => {
    const t = text(docs.find((d) => d.path === '/wald-escape/')!.html);
    expect(t).toContain(`${KEY_COUNT} Schlüssel`);
    for (const s of [SIZES.small, SIZES.large]) {
      expect(t).toContain(s.label);
      expect(t).toContain(String(s.required));
      expect(t).toContain(String(s.offered));
      expect(t).toContain(`${s.defaultMinutes} Minuten`);
    }
    for (const m of ESCAPE_MINUTES) expect(t).toContain(String(m));
    expect(t).toMatch(/ab 4 Jahren mit erwachsener Begleitung/);
  });

  it('die Waldschatzsuche zeigt einen echten Beispielauftrag mit Bild, die Anleitung beantwortet die acht Fragen', () => {
    const treasure = docs.find((d) => d.path === '/waldschatzsuche/')!.html;
    expect(treasure).toContain('Finde einen kleinen Zweig, an dem noch Nadeln sitzen.');
    expect(treasure).toMatch(/<img src="\/seo\/beispiel-nadelzweig-720\.webp" width="720" height="600" alt="[^"]{20,}"/);
    const guide = text(docs.find((d) => d.path === '/anleitung/')!.html);
    for (const q of ['Für welches Alter', 'Was bereiten Erwachsene vor', 'startet und pausiert', 'Gegenstand fehlt', 'ohne Netz', 'Fortschritt gespeichert', 'Browserwechsel', 'Pflanzen und Tieren']) expect(guide).toContain(q);
    expect(guide).toContain('Für unterwegs bereit');
  });

  it('keine unbelegten Versprechen: weder „kostenlos“ noch „fachlich geprüft“ noch Rankingversprechen', () => {
    for (const d of docs) expect(text(d.html), d.path).not.toMatch(/kostenlos|fachlich geprüft|empfohlen von|Platz 1|garantiert/i);
  });

  it('die Sitemap enthält genau die öffentlichen Seiten mit absoluten Adressen, ohne Fragmente', () => {
    const xml = renderSitemap();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(PAGES.map((p) => absUrl(p.path)));
    for (const l of locs) expect(l).not.toContain('#');
    expect(files.find((f) => f.fileName === 'sitemap.xml')!.source).toBe(xml);
  });

  it('die 404-Seite ist abrufbar, nicht indexierbar und enthält keinen Canonical; sie wird nicht vorgeladen', () => {
    const nf = files.find((f) => f.fileName === '404.html')!;
    expect(nf.precache).toBe(false);
    expect(nf.source).toContain('<meta name="robots" content="noindex, follow" />');
    expect(nf.source).not.toContain('rel="canonical"');
    expect(files.filter((f) => f.precache).map((f) => f.fileName).sort()).toEqual(['anleitung/index.html', 'wald-escape/index.html', 'waldschatzsuche/index.html']);
  });

  it('der Google-Tag wird unverändert aus index.html übernommen', () => {
    expect(extractAnalytics(indexSource)).toContain('G-ERW5Y3F1W7');
    expect(count(indexSource, /googletagmanager/g)).toBe(1);
    expect(pageById('start').h1).toContain('Waldspiele für Kinder');
  });
});

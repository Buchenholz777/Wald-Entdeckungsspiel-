import {
  BODIES,
  EXAMPLE_IMAGE,
  NOT_FOUND,
  OG_IMAGE,
  PAGES,
  PLAY,
  SITE_NAME,
  SITE_URL,
  absUrl,
  pageById,
  startStaticHtml,
  type SeoPage,
} from './site';

/**
 * Erzeugt beim Build die statisch ausgelieferten Seiten: Kopfdaten und Inhalt der Startseite (im initialen HTML der App),
 * die drei Unterseiten mit echten Adressen, eine echte 404-Seite und die Sitemap. Reine Zeichenketten, keine Abhängigkeit von React.
 */

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface SeoAssets {
  /** Name der gebauten CSS-Datei, zum Beispiel „assets/index-abc.css“ */
  css: string;
  /** Hintergrund-Illustration (Waldweg) in beiden Zuschnitten */
  bg: { wideWebp: string; wideJpg: string; narrowWebp: string; narrowJpg: string };
}

/** Der Google-Tag steht unverändert am Anfang jedes Dokuments (aus index.html übernommen, nie doppelt). */
export function extractAnalytics(indexHtml: string): string {
  const m = indexHtml.match(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/);
  return m ? m[0] : '';
}

function jsonLd(page: SeoPage | { id: 'notfound' }, url: string, title: string, description: string): string {
  const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: 'de-DE' };
  const app = {
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#app`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: 'Waldspiele für Kinder von 2 bis 10 Jahren im Browser: Waldschatzsuche und Wald Escape für gemeinsame Entdeckungen im Wald.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Alle (Webbrowser)',
    browserRequirements: 'Benötigt JavaScript',
    inLanguage: 'de-DE',
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 2, suggestedMaxAge: 10 },
    image: absUrl(OG_IMAGE.path),
  };
  const graph: unknown[] = [website, app];
  if (page.id !== 'notfound') {
    const web: Record<string, unknown> = {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: 'de-DE',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#app` },
      primaryImageOfPage: { '@type': 'ImageObject', url: absUrl(OG_IMAGE.path), width: OG_IMAGE.width, height: OG_IMAGE.height },
    };
    if (page.id !== 'start') {
      web.breadcrumb = { '@id': `${url}#breadcrumb` };
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: pageById('start').nav, item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: page.nav, item: url },
        ],
      });
    }
    graph.push(web);
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

/** Titel, Beschreibung, Canonical, Open Graph und JSON-LD: genau einmal je Dokument. */
export function headMeta(page: SeoPage | { id: 'notfound'; title: string; description: string }, opts: { noindex?: boolean } = {}): string {
  const isNotFound = page.id === 'notfound';
  const url = isNotFound ? '' : absUrl((page as SeoPage).path);
  const og = absUrl(OG_IMAGE.path);
  const lines = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    ...(opts.noindex ? ['<meta name="robots" content="noindex, follow" />'] : []),
    ...(isNotFound ? [] : [`<link rel="canonical" href="${url}" />`]),
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="de_DE" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    ...(isNotFound ? [] : [`<meta property="og:url" content="${url}" />`]),
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${esc(OG_IMAGE.alt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${og}" />`,
    `<meta name="twitter:image:alt" content="${esc(OG_IMAGE.alt)}" />`,
    ...(isNotFound ? [] : [jsonLd(page as SeoPage, url, page.title, page.description)]),
  ];
  return lines.map((l) => `    ${l}`).join('\n');
}

/** index.html: Kopfdaten und statischer Inhalt der Startseite (für Entwicklung und Build gleich). */
export function transformHome(html: string): string {
  const home = pageById('start');
  return html.replace('<!--SEO_HEAD-->', headMeta(home).trimStart()).replace('<!--SEO_ROOT-->', startStaticHtml());
}

function nav(current: SeoPage): string {
  return `<ul>${PAGES.map((p) => `<li><a href="${p.path}"${p.id === current.id ? ' aria-current="page"' : ''}>${esc(p.nav)}</a></li>`).join('')}</ul>`;
}

function shell(opts: { head: string; analytics: string; assets: SeoAssets; body: string; bodyClass?: string }): string {
  const { assets: a } = opts;
  return `<!doctype html>
<html lang="de">
  <head>
    ${opts.analytics}
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#2c4a38" />
${opts.head}
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <link rel="stylesheet" href="/${a.css}" />
  </head>
  <body class="seo-body${opts.bodyClass ? ` ${opts.bodyClass}` : ''}">
    <div class="forest-bg" data-mode="calm" aria-hidden="true"><picture><source media="(max-width: 700px)" srcset="/${a.bg.narrowWebp}" type="image/webp" /><source media="(max-width: 700px)" srcset="/${a.bg.narrowJpg}" type="image/jpeg" /><source srcset="/${a.bg.wideWebp}" type="image/webp" /><img src="/${a.bg.wideJpg}" alt="" width="1600" height="1000" decoding="async" /></picture></div>
${opts.body}
  </body>
</html>
`;
}

function footer(): string {
  return `<footer class="seo-foot">
<p><a href="/">Start</a> · <a href="${pageById('schatzsuche').path}">Waldschatzsuche</a> · <a href="${pageById('escape').path}">Wald Escape</a> · <a href="${pageById('anleitung').path}">Anleitung</a></p>
<p class="muted">Spielstände, Funde und Einstellungen bleiben auf eurem Gerät. Für die Reichweitenmessung wird Google Analytics geladen; dabei werden Daten über den Seitenbesuch an Google übertragen.</p>
</footer>`;
}

/** Eine Unterseite mit Navigation, Brotkrumen, sichtbarer H1, Inhalt und Fußzeile. */
export function renderPage(page: SeoPage, analytics: string, assets: SeoAssets): string {
  const body = `    <a class="skip-link" href="#main">Zum Inhalt</a>
    <header class="seo-bar">
      <a class="seo-brand" href="/"><img src="/icons/icon.svg" width="32" height="32" alt="" /><span>${SITE_NAME}</span></a>
      <nav aria-label="Hauptnavigation">${nav(page)}</nav>
      <a class="btn btn-primary btn-compact" href="${PLAY.menu}">Zum Spiel</a>
    </header>
    <main id="main" class="seo-main" tabindex="-1">
      <nav class="crumbs" aria-label="Brotkrumen"><ol><li><a href="/">${esc(pageById('start').nav)}</a></li><li aria-current="page">${esc(page.nav)}</li></ol></nav>
      <article class="seo-article help-card">
<h1 class="h1">${esc(page.h1)}</h1>
${BODIES[page.id]()}
      </article>
${footer()}
    </main>`;
  return shell({ head: headMeta(page), analytics, assets, body });
}

/** Echte 404-Seite: Status 404 liefert das Hosting, wenn diese Datei als 404.html im Wurzelverzeichnis liegt. */
export function renderNotFound(analytics: string, assets: SeoAssets): string {
  const links = PAGES.map((p) => `<li><a href="${p.path}">${esc(p.nav)}</a></li>`).join('');
  const body = `    <main id="main" class="seo-main" tabindex="-1">
      <article class="seo-article help-card">
<h1 class="h1">${esc(NOT_FOUND.h1)}</h1>
<p class="lead">Vielleicht hat sich die Adresse geändert, oder sie ist nicht ganz richtig geschrieben. Von hier aus kommt ihr weiter:</p>
<ul>${links}</ul>
<p class="seo-cta"><a class="btn btn-primary" href="${PLAY.menu}">Zum Spiel</a></p>
      </article>
    </main>`;
  return shell({ head: headMeta({ id: 'notfound', title: NOT_FOUND.title, description: NOT_FOUND.description }, { noindex: true }), analytics, assets, body });
}

export function renderSitemap(): string {
  const urls = PAGES.map((p) => `  <url>\n    <loc>${absUrl(p.path)}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export interface SeoFile {
  fileName: string;
  source: string;
  /** In den Offline-Cache vorladen (die Inhaltsseiten) */
  precache: boolean;
}

/** Alle zusätzlich auszuliefernden Dateien (außer der bereits bestehenden index.html). */
export function buildSeoFiles(indexHtml: string, assets: SeoAssets): SeoFile[] {
  const analytics = extractAnalytics(indexHtml);
  const files: SeoFile[] = PAGES.filter((p) => p.id !== 'start').map((p) => ({
    fileName: `${p.path.replace(/^\/|\/$/g, '')}/index.html`,
    source: renderPage(p, analytics, assets),
    precache: true,
  }));
  // Die 404-Seite wird nicht vorgeladen: Das Hosting beantwortet ihren direkten Abruf womöglich selbst mit Status 404, und ein fehlgeschlagener
  // Vorlade-Eintrag würde die gesamte Offline-Installation scheitern lassen.
  files.push({ fileName: '404.html', source: renderNotFound(analytics, assets), precache: false });
  files.push({ fileName: 'sitemap.xml', source: renderSitemap(), precache: false });
  return files;
}

export { EXAMPLE_IMAGE };

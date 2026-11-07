// Erzeugt die Bilder der öffentlichen Einstiegsseiten:
//  - public/seo/beispiel-nadelzweig-720.webp: das echte Suchbild „Nadelzweig“ des Spiels (gleiche React-Zeichnung wie in der App), 720 × 600
//  - public/og/wald-spiel-1200x630.jpg: Vorschaubild für Suche und soziale Netzwerke (Ausschnitt der Waldillustration mit der suchenden Familie und dem Blattzeichen), 1200 × 630
// Aufruf: npm run images:seo
import { createServer } from 'vite';
import sharp from 'sharp';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(`${root}public/seo`, { recursive: true });
mkdirSync(`${root}public/og`, { recursive: true });

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { Illustration } = await vite.ssrLoadModule('/src/illustrations/Illustration.tsx');
  const { SvgDefs } = await vite.ssrLoadModule('/src/illustrations/kit.tsx');
  const h = React.createElement;
  const defsInner = renderToStaticMarkup(h(SvgDefs)).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  let svg = renderToStaticMarkup(h(Illustration, { illustrationKey: 'needle-twig', preset: 'settle', alt: 'Nadelzweig' }));
  svg = svg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1${defsInner}`).replace(/<svg /, '<svg width="720" height="600" ');
  await sharp(Buffer.from(svg)).webp({ quality: 82, effort: 6 }).toFile(`${root}public/seo/beispiel-nadelzweig-720.webp`);
} finally {
  await vite.close();
}

// Vorschaubild: Ausschnitt der breiten Waldillustration (enthält die kleine Familie rechts) plus das Blattzeichen
const bg = readFileSync(`${root}src/assets/forest/wald-breit-1600.jpg`);
const icon = await sharp(readFileSync(`${root}public/icons/icon-512.png`)).resize(220, 220).png().toBuffer();
const ring = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><circle cx="130" cy="130" r="128" fill="#fffdf4" fill-opacity="0.94"/></svg>');
await sharp(bg)
  .extract({ left: 400, top: 290, width: 1200, height: 630 })
  .composite([
    { input: ring, left: 60, top: 335 },
    { input: icon, left: 80, top: 355 },
  ])
  .jpeg({ quality: 84, mozjpeg: true, progressive: true })
  .toFile(`${root}public/og/wald-spiel-1200x630.jpg`);

for (const f of ['public/seo/beispiel-nadelzweig-720.webp', 'public/og/wald-spiel-1200x630.jpg']) console.log(`${f}: ${(statSync(`${root}${f}`).size / 1024).toFixed(0)} kB`);

// Rendert alle aktiven Suchbilder (oder eine Auswahl) als PNG und als Übersichtsblatt.
// Aufruf: node scripts/render-motifs.mjs <Ausgabeordner> [Schlüssel,Schlüssel,...|-] [Vorher-Ordner] [Vergleichsordner]
// Mit Vorher-Ordner entstehen im Vergleichsordner `_vorher-nachher.png` (alle Motive) und `baumpilz-vorher-nachher.png`.
// Nutzt Vite im Servermodus, damit dieselben React-Zeichnungen wie im Spiel gerendert werden.
import { createServer } from 'vite';
import sharp from 'sharp';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const outDir = resolve(process.argv[2] ?? 'render-out');
const only = process.argv[3] && process.argv[3] !== '-' ? process.argv[3].split(',') : null;
const vorherDir = process.argv[4] ? resolve(process.argv[4]) : null;
const sheetDir = process.argv[5] ? resolve(process.argv[5]) : outDir;
mkdirSync(sheetDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { Illustration } = await vite.ssrLoadModule('/src/illustrations/Illustration.tsx');
  const { SvgDefs } = await vite.ssrLoadModule('/src/illustrations/kit.tsx');
  const { templates } = await vite.ssrLoadModule('/src/catalog/templates.ts');
  const h = React.createElement;

  const defsMarkup = renderToStaticMarkup(h(SvgDefs));
  const defsInner = defsMarkup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

  const active = templates.filter((t) => !t.retired && (!only || only.includes(t.image.illustrationKey)));
  const W = 480;
  const H = 400;
  const tiles = [];
  for (const t of active) {
    const key = t.image.illustrationKey;
    let svg = renderToStaticMarkup(h(Illustration, { illustrationKey: key, preset: t.image.animationPreset, alt: t.image.alt }));
    svg = svg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1${defsInner}`);
    svg = svg.replace(/<svg /, `<svg width="${W}" height="${H}" `);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    writeFileSync(join(outDir, `${key}.png`), png);
    tiles.push({ key, png });
  }

  // Übersichtsblatt: 5 Spalten, Beschriftung darunter
  const cols = 5;
  const tw = 300;
  const th = 250;
  const lab = 30;
  const rows = Math.ceil(tiles.length / cols);
  const comps = [];
  for (let i = 0; i < tiles.length; i++) {
    const x = (i % cols) * tw;
    const y = Math.floor(i / cols) * (th + lab);
    const img = await sharp(tiles[i].png).resize(tw - 10, th - 8).png().toBuffer();
    comps.push({ input: img, left: x + 5, top: y + 4 });
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${lab}"><text x="${tw / 2}" y="20" font-family="Arial" font-size="15" text-anchor="middle" fill="#2c4a38">${tiles[i].key}</text></svg>`);
    comps.push({ input: label, left: x, top: y + th });
  }
  await sharp({ create: { width: cols * tw, height: rows * (th + lab), channels: 3, background: '#f6f1e4' } })
    .composite(comps)
    .png()
    .toFile(join(outDir, '_uebersicht.png'));
  if (vorherDir) {
    const pw = 220;
    const ph = 183;
    const pcols = 3;
    const prow = Math.ceil(tiles.length / pcols);
    const cell = pw * 2 + 20;
    const pcomps = [];
    for (let i = 0; i < tiles.length; i++) {
      const x = (i % pcols) * cell;
      const y = Math.floor(i / pcols) * (ph + 26);
      const vp = ['png', 'jpg'].map((e) => join(vorherDir, `${tiles[i].key}.${e}`)).find((p) => existsSync(p)) ?? '';
      if (vp) pcomps.push({ input: await sharp(readFileSync(vp)).resize(pw, ph).png().toBuffer(), left: x + 4, top: y + 2 });
      pcomps.push({ input: await sharp(tiles[i].png).resize(pw, ph).png().toBuffer(), left: x + pw + 8, top: y + 2 });
      const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${cell}" height="24"><text x="${cell / 2}" y="17" font-family="Arial" font-size="14" text-anchor="middle" fill="#2c4a38">${tiles[i].key} (links vorher, rechts nachher)</text></svg>`;
      pcomps.push({ input: Buffer.from(label), left: x, top: y + ph + 2 });
    }
    await sharp({ create: { width: pcols * cell, height: prow * (ph + 26), channels: 3, background: '#f6f1e4' } })
      .composite(pcomps)
      .png()
      .toFile(join(sheetDir, '_vorher-nachher.png'));
    const bp = ['png', 'jpg'].map((e) => join(vorherDir, `bracket-fungus.${e}`)).find((p) => existsSync(p));
    const bn = tiles.find((x) => x.key === 'bracket-fungus');
    if (bp && bn) {
      await sharp({ create: { width: 980, height: 400, channels: 3, background: '#f6f1e4' } })
        .composite([
          { input: await sharp(readFileSync(bp)).png().toBuffer(), left: 0, top: 0 },
          { input: bn.png, left: 500, top: 0 },
        ])
        .png()
        .toFile(join(sheetDir, 'baumpilz-vorher-nachher.png'));
    }
  }
  console.log(`${tiles.length} Motive gerendert nach ${outDir}`);
} finally {
  await vite.close();
}

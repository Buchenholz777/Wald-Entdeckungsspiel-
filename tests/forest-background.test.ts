import { existsSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Das Waldfoto wird lokal ausgeliefert, ist dokumentiert und hat Formate mit Rückfall. */

const dir = new URL('../src/assets/forest/', import.meta.url);
const FILES = ['wald-breit-1600.webp', 'wald-breit-1600.jpg', 'wald-schmal-720.webp', 'wald-schmal-720.jpg'];

describe('Waldhintergrund', () => {
  it('alle vier Bilddateien liegen im Projekt und sind klein genug für unterwegs', () => {
    for (const f of FILES) {
      const url = new URL(f, dir);
      expect(existsSync(url), f).toBe(true);
      const kb = statSync(url).size / 1024;
      expect(kb, f).toBeGreaterThan(5);
      expect(kb, f).toBeLessThan(400);
    }
  });

  it('die Komponente nutzt nur lokale Dateien (kein Hotlink) und bietet WebP mit JPEG-Rückfall, Breit- und Schmalformat', () => {
    const src = readFileSync(new URL('../src/ui/ForestBackground.tsx', import.meta.url), 'utf8');
    expect(src).not.toMatch(/https?:\/\//);
    expect(src).toMatch(/type="image\/webp"/);
    expect(src).toMatch(/type="image\/jpeg"/);
    expect(src).toMatch(/max-width: 700px/);
    expect(src).toMatch(/alt=""/); // reine Dekoration
    expect(src).toMatch(/aria-hidden="true"/);
    expect(src).toMatch(/width=\{1600\}/); // feste Maße: kein Layoutsprung
  });

  it('Rückfallfarbe, keine Animation und keine bewegten Hintergründe', () => {
    const css = readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8');
    const start = css.indexOf('Waldhintergrund (eigene Illustration');
    const block = css.slice(start, css.indexOf('Waldgeschenk, Konfetti', start));
    expect(block).toMatch(/--forest-fallback/);
    expect(block).not.toMatch(/animation|@keyframes|transition|parallax|background-attachment:\s*fixed/);
  });

  it('der Bildnachweis nennt Quelle, Urheberin und Lizenz', () => {
    const doc = readFileSync(new URL('../docs/BILDNACHWEIS.md', import.meta.url), 'utf8');
    expect(doc).toMatch(/eigene Illustration/i);
    expect(doc).toMatch(/make-forest-background\.mjs/);
    expect(doc).toMatch(/keine Fremdbilder|kein Fremdmaterial/i);
  });

  it('die Bilddateien stehen im Vorab-Cache der App, sobald gebaut wurde', () => {
    const manifest = new URL('../dist/precache-manifest.json', import.meta.url);
    if (!existsSync(manifest)) return; // vor dem ersten Build nichts zu prüfen
    const urls: string[] = JSON.parse(readFileSync(manifest, 'utf8')).urls;
    for (const stem of ['wald-breit-1600', 'wald-schmal-720']) {
      expect(urls.some((u) => u.includes(stem) && u.endsWith('.webp')), `${stem} webp`).toBe(true);
      expect(urls.some((u) => u.includes(stem) && u.endsWith('.jpg')), `${stem} jpg`).toBe(true);
    }
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Prüft die tatsächlichen Farbpaare aus src/styles/app.css (WCAG 2.2: 4,5:1 für Text, 3:1 für Bedienelemente und Fokus). */

const css = readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8');
const root = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')));
const tokens: Record<string, string> = {};
for (const m of root.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tokens[m[1]] = m[2];

function lum(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a: string, b: string): number {
  const [l1, l2] = [lum(tokens[a] ?? a), lum(tokens[b] ?? b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const TEXT: [string, string, string][] = [
  ['ink', 'cream', 'Fließtext auf Hintergrund'],
  ['ink', 'paper', 'Fließtext auf Karte'],
  ['forest', 'cream', 'Überschrift / Link'],
  ['forest', 'paper', 'Überschrift auf Karte'],
  ['forest', 'sage', 'Text auf Salbei (aufgeklappte Fläche, Wechselzeile)'],
  ['forest', 'sand', 'Text auf Sand'],
  ['ink', 'sand', 'Fließtext in der Entdeckerhilfe'],
  ['cream', 'forest', 'Text auf Hauptschaltfläche'],
  ['cream', 'ok', 'Text auf „Nächste Aufgabe“'],
  ['#d6e6d3', 'forest', 'Untertitel in gewählter Altersfläche'],
  ['muted', 'cream', 'Hinweistext auf Hintergrund'],
  ['muted', 'paper', 'Hinweistext auf Karte'],
  ['muted', 'sage', 'Hinweistext auf Salbei'],
  ['muted', 'sand', 'Hinweistext auf Sand'],
  ['ok', 'paper', 'Erfolgstext „Geschafft“'],
  ['ok', 'sage', 'Erfolgstext auf Salbei'],
  ['#7b2a17', '#f6dccf', 'Fehlermeldung'],
];

const NON_TEXT: [string, string, string][] = [
  ['focus', 'cream', 'Fokusrahmen auf Hintergrund'],
  ['focus', 'paper', 'Fokusrahmen auf Karte'],
  ['forest', 'cream', 'Rand der Auswahlfläche (Kreis, Schalter)'],
  ['forest', 'paper', 'Rand der Auswahlfläche auf Karte'],
  ['forest', 'sage', 'Schalter an auf Salbei'],
];

describe('Kontrast (Farbwerte aus app.css)', () => {
  it('liest die Farbwerte', () => {
    expect(Object.keys(tokens).length).toBeGreaterThan(10);
  });

  it.each(TEXT)('Text %s auf %s ≥ 4,5:1 (%s)', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT)('Bedienelement %s auf %s ≥ 3:1 (%s)', (fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});

describe('Kontrast auf dem Waldhintergrund (ungünstigster Fall: der Hintergrund wäre an dieser Stelle schwarz)', () => {
  /** Mischt eine halbtransparente Fläche über Schwarz, das ist der dunkelste denkbare Untergrund. */
  const overBlack = (rgb: [number, number, number], alpha: number) =>
    '#' + rgb.map((c) => Math.round(c * alpha).toString(16).padStart(2, '0')).join('');

  it('Titel, Einleitung und Kicker der Starttafel sind auch im ungünstigsten Fall lesbar', () => {
    const m = css.match(/\.hero-forest \{ background: rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)/);
    expect(m, 'Starttafel in app.css gefunden').not.toBeNull();
    const panel = overBlack([Number(m![1]), Number(m![2]), Number(m![3])], Number(m![4]));
    expect(ratio('forest', panel), 'Titel').toBeGreaterThanOrEqual(4.5);
    expect(ratio('#3f4f44', panel), 'Einleitung').toBeGreaterThanOrEqual(4.5);
    expect(ratio('#5d6b2f', panel), 'Kicker').toBeGreaterThanOrEqual(4.5);
  });

  it('die Spielansicht legt eine helle, fast deckende Fläche über das Foto', () => {
    const m = css.match(/data-mode='calm'\]::after \{ background: rgba\((\d+), (\d+), (\d+), ([0-9.]+)\)/);
    expect(m, 'Abdeckung gefunden').not.toBeNull();
    expect(Number(m![4])).toBeGreaterThanOrEqual(0.8);
  });

  it('Eingabeflächen am Einstieg sind fast deckend', () => {
    const m = css.match(/\.setup \.group, \.setup \.season-row \{ background: rgba\(\d+, \d+, \d+, ([0-9.]+)\)/);
    expect(Number(m![1])).toBeGreaterThanOrEqual(0.92);
  });
});

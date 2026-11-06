import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { templates } from '../src/catalog/templates';
import { Illustration } from '../src/illustrations/Illustration';
import { artRegistry } from '../src/illustrations/registry';
import type { AnimationPreset } from '../src/domain/types';

const PRESETS: AnimationPreset[] = ['float', 'sway', 'settle', 'grow', 'ripple', 'wave', 'bob', 'swing', 'flutter', 'draw'];

describe('Bildwelt', () => {
  it('jede Vorlage hat ein tatsächlich vorhandenes Suchbild (keine verwaisten Schlüssel)', () => {
    const missing = templates.filter((t) => !artRegistry[t.image.illustrationKey]).map((t) => t.id);
    expect(missing).toEqual([]);
  });

  it('es gibt keine Bilder ohne Aufgabe', () => {
    const used = new Set(templates.map((t) => t.image.illustrationKey));
    const orphans = Object.keys(artRegistry).filter((k) => !used.has(k));
    expect(orphans).toEqual([]);
  });

  it('jede Zeichnung rendert Inhalt (kein leerer Platzhalter) und trägt eine Bildbeschreibung', () => {
    for (const t of templates) {
      const html = renderToStaticMarkup(
        createElement(Illustration, { illustrationKey: t.image.illustrationKey, preset: t.image.animationPreset, alt: t.image.alt }),
      );
      expect(html, t.id).toContain('role="img"');
      expect(html, t.id).toContain(`aria-label="${t.image.alt.replace(/&/g, '&amp;')}"`);
      const shapes = html.match(/<(path|circle|ellipse|rect|g|text)\b/g) ?? [];
      expect(shapes.length, `${t.id} wirkt leer`).toBeGreaterThan(8);
    }
  });

  it('Animationsvorgaben sind gültig und bewegen ein vorhandenes Element', () => {
    for (const t of templates) {
      expect(PRESETS, t.id).toContain(t.image.animationPreset);
      const html = renderToStaticMarkup(
        createElement(Illustration, { illustrationKey: t.id, preset: t.image.animationPreset, play: true }),
      );
      const preset = t.image.animationPreset;
      if (preset === 'ripple') expect(html, t.id).toMatch(/class="rip/);
      else if (preset === 'draw') expect(html, t.id).toMatch(/class="draw"|class="mv"/);
      else expect(html, t.id).toMatch(/class="mv/);
    }
  });

  it('ähnliche Motive sind unterscheidbar angelegt (Ahorn/Eiche, Zapfen/Kastanie)', () => {
    const get = (id: string) => renderToStaticMarkup(createElement(Illustration, { illustrationKey: id, preset: 'float' }));
    expect(get('maple-leaf')).not.toBe(get('oak-leaf'));
    expect(get('cone')).not.toBe(get('chestnut'));
    const maple = templates.find((t) => t.id === 'maple-leaf')!;
    const oak = templates.find((t) => t.id === 'oak-leaf')!;
    expect(maple.image.recognitionFeatures.join()).toMatch(/spitz/i);
    expect(oak.image.recognitionFeatures.join()).toMatch(/rund/i);
  });
});

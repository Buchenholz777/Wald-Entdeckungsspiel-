import { describe, expect, it } from 'vitest';
import { templates } from '../src/catalog/templates';
import { generateRound } from '../src/domain/generator';
import { buildMission } from '../src/domain/mission';
import { infoWordCount, resolveInfo } from '../src/domain/resolve';
import { seededRng } from '../src/domain/rng';
import { AGE_GROUPS, SEASONS, type AgeGroup, type Theme } from '../src/domain/types';

const active = templates.filter((t) => !t.retired);

/** Richtwerte der Gesamtvorgabe: 2–3 etwa 35–60, 4–6 etwa 65–110, 7–10 etwa 100–160 Wörter (Richtwerte, mit Toleranz). */
const RANGE: Record<AgeGroup, [number, number]> = { '2-3': [32, 66], '4-6': [60, 120], '7-10': [92, 175] };

describe('Info zum Bild: drei Bausteine, altersgerecht', () => {
  it('jede auswählbare Aufgabe hat Was ist das, Woher kommt es, Was ist besonders und einen getrennten Suchhinweis', () => {
    for (const t of active) {
      for (const age of t.ageGroups) {
        const r = resolveInfo(t, age, t.environments[0], t.seasons[0]);
        expect(r.info.whatIsIt.length, `${t.id} ${age} whatIsIt`).toBeGreaterThan(10);
        expect(r.info.origin.length, `${t.id} ${age} origin`).toBeGreaterThan(10);
        expect(r.special?.length ?? 0, `${t.id} ${age} Besonderheit`).toBeGreaterThan(10);
        expect(r.info.whereToLook.length, `${t.id} ${age} Suchhinweis`).toBeGreaterThan(10);
        expect(r.moment?.length ?? 0, `${t.id} ${age} Entdeckermoment`).toBeGreaterThan(8);
        // Suchhinweis und Besonderheit sind verschiedene Texte
        expect(r.special).not.toBe(r.info.whereToLook);
      }
    }
  });

  it('die Besonderheit wiederholt nicht einfach Was ist das / Woher kommt es', () => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-zäöüß ]/g, '').trim();
    const bad: string[] = [];
    for (const t of active) {
      for (const age of t.ageGroups) {
        const r = resolveInfo(t, age, t.environments[0], t.seasons[0]);
        const sp = norm(r.special ?? '');
        for (const other of [r.info.whatIsIt, r.info.origin]) {
          const o = norm(other);
          if (sp && (o.includes(sp) || sp.includes(o))) bad.push(` : `);
        }
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('Textlänge liegt je Altersgruppe im Zielbereich', () => {
    const bad: string[] = [];
    for (const t of active) {
      for (const age of t.ageGroups) {
        const n = infoWordCount(resolveInfo(t, age, t.environments[0], t.seasons[0]));
        const [lo, hi] = RANGE[age];
        if (n < lo || n > hi) bad.push(`${t.id} ${age}: ${n} (soll ${lo}–${hi})`);
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('dieselbe Karte ist für 2–3, 4–6 und 7–10 unterschiedlich tief', () => {
    for (const id of ['cone', 'hazelnut', 'moss', 'chestnut', 'acorn', 'beechnut', 'mushroom']) {
      const t = templates.find((x) => x.id === id)!;
      const [a, b, c] = AGE_GROUPS.map((age) => resolveInfo(t, age, t.environments[0], t.seasons[0]));
      const wa = infoWordCount(a);
      const wb = infoWordCount(b);
      const wc = infoWordCount(c);
      expect(wa, id).toBeLessThan(wb);
      expect(wb, id).toBeLessThan(wc);
      expect(a.info.whatIsIt).not.toBe(b.info.whatIsIt);
      expect(c.extra, `${id}: 7–10 braucht einen Zusatzgedanken`).toBeTruthy();
      expect(a.extra).toBeUndefined();
      expect(b.extra).toBeUndefined();
    }
  });

  it('Info enthält keine erfundenen Heilwirkungen, Essbarkeitsversprechen oder Merksätze', () => {
    for (const t of active) {
      for (const age of t.ageGroups) {
        const r = resolveInfo(t, age, t.environments[0], t.seasons[0]);
        const text = [r.info.whatIsIt, r.info.origin, r.special, r.extra].join(' ');
        expect(text, t.id).not.toMatch(/heilt|Heilmittel|gesund für|schmeckt|lecker|Nordseite|essbar sind|kannst du essen/i);
      }
    }
  });

  it('der Zapfen-Beispieltext für 2–3 entspricht dem Ton der Vorgabe', () => {
    const t = templates.find((x) => x.id === 'cone')!;
    const r = resolveInfo(t, '2-3', 'forest', 'autumn');
    expect(r.info.whatIsIt).toMatch(/Zapfen/);
    expect(r.info.whatIsIt).toMatch(/Schuppen/);
    expect(r.info.origin).toMatch(/Nadelb/);
    expect(r.special).toMatch(/Samen/);
    expect(r.moment).toMatch(/Schuppen/);
  });

  it('4–6: Bilderrätsel nur bei geeigneten Funden und nur für diese Altersgruppe', () => {
    const acorn = templates.find((x) => x.id === 'acorn')!;
    expect(resolveInfo(acorn, '4-6', 'forest', 'autumn').riddle?.text).toMatch(/Hütchen/);
    expect(resolveInfo(acorn, '4-6', 'forest', 'autumn').riddle?.name).toBe('Eine Eichel');
    expect(resolveInfo(acorn, '2-3', 'forest', 'autumn').riddle).toBeUndefined();
    expect(resolveInfo(acorn, '7-10', 'forest', 'autumn').riddle).toBeUndefined();
  });
});

describe('Mission: Titel und Einleitung passen zu den tatsächlichen Aufgaben', () => {
  it('jede erzeugte Mission hat einen Waldtitel und einen Vorlesesatz, der die erste Station nennt', () => {
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        const r = generateRound({
          age, environment: 'forest', season, seasonSource: 'auto', context: ['conifers', 'chestnut', 'mud'], boost: false,
          count: age === '2-3' ? 3 : 5, seed: 5, rng: seededRng(5),
        }).round!;
        expect(r.mission?.title, `${season}/${age}`).toBeTruthy();
        expect(r.mission!.title).not.toMatch(/Strand|Park|Garten|Stadt|Wiese|Spielplatz|Berg|Ufer|See\b/);
        expect(r.mission!.intro).toContain(r.tasks[0].prompt);
      }
    }
  });

  it('Titelregeln: ein Leitmotiv steht nur im Titel, wenn mindestens zwei Stationen und die Hälfte dazu passen', () => {
    const mk = (templateId: string) => ({ templateId, prompt: 'x' }) as never;
    const themes = (id: string): Theme[] => (id === 'a' || id === 'b' ? ['pattern'] : id === 'c' ? ['water'] : []);
    expect(buildMission('4-6', [mk('a'), mk('b')], themes).title).toBe('Muster, die Geschichten erzählen');
    expect(buildMission('4-6', [mk('a'), mk('c')], themes).title).toBe('Waldgeheimnisse entdecken');
    expect(buildMission('4-6', [mk('a'), mk('b'), mk('c'), mk('c'), mk('d')], themes).title).toBe('Waldgeheimnisse entdecken');
    expect(buildMission('4-6', [mk('a')], themes).title).toBe('Waldgeheimnisse entdecken');
  });
});

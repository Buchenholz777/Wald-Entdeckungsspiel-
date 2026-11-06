import { describe, expect, it } from 'vitest';
import { templates } from '../src/catalog/templates';
import { generateRound, replaceTask, type GenerateParams } from '../src/domain/generator';
import { THEME_INFO } from '../src/domain/meta';
import { likelihoodFor } from '../src/domain/resolve';
import { tally } from './distribution';
import { seededRng } from '../src/domain/rng';
import { AGE_GROUPS, FOREST, SEASONS, THEMES, type AgeGroup, type ContextTag, type Season, type Theme } from '../src/domain/types';

function params(over: Partial<GenerateParams> = {}): GenerateParams {
  const seed = over.seed ?? 1;
  return {
    age: '4-6',
    environment: FOREST,
    season: 'autumn',
    seasonSource: 'auto',
    context: [],
    boost: false,
    count: 5,
    seed,
    rng: seededRng(seed),
    now: 1_700_000_000_000,
    ...over,
  };
}

const byId = (id: string) => templates.find((t) => t.id === id)!;
const ALL_CONTEXT: ContextTag[] = ['conifers', 'beech', 'oak', 'maple', 'hazel', 'chestnut', 'fern', 'mud'];

describe('Generator (nur Wald)', () => {
  it('liefert für alle Jahreszeiten × Altersgruppen und 1–5 Stationen korrekte Runden ohne doppelte Konzepte', () => {
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        for (let count = 1; count <= 5; count++) {
          for (const context of [[], ALL_CONTEXT]) {
            const { round, poolConcepts } = generateRound(params({ season, age, count, context, seed: count * 7 }));
            expect(round, `${season}/${age}`).not.toBeNull();
            const r = round!;
            expect(r.environment).toBe(FOREST);
            expect(r.tasks.length).toBe(Math.min(count, poolConcepts));
            const concepts = r.tasks.map((t) => t.conceptId);
            expect(new Set(concepts).size).toBe(concepts.length);
            for (const task of r.tasks) {
              const tpl = byId(task.templateId);
              expect(tpl.ageGroups).toContain(age);
              expect(tpl.environments).toEqual([FOREST]);
              expect(tpl.seasons).toContain(season);
              expect(tpl.quantityByAge[age]).toContain(task.target);
            }
          }
        }
      }
    }
  });

  it('auch ein von außen übergebener anderer Ort ändert nichts: es wird immer eine Waldmission', () => {
    const r = generateRound(params({ environment: 'beach', seed: 3 })).round!;
    expect(r.environment).toBe(FOREST);
    for (const t of r.tasks) expect(byId(t.templateId).environments).toEqual([FOREST]);
  });

  it('ein fester Seed liefert reproduzierbare Ergebnisse', () => {
    const a = generateRound(params({ seed: 42 })).round!;
    const b = generateRound(params({ seed: 42 })).round!;
    expect(a.tasks.map((t) => [t.templateId, t.target])).toEqual(b.tasks.map((t) => [t.templateId, t.target]));
    const c = generateRound(params({ seed: 43 })).round!;
    expect(c.tasks.map((t) => t.templateId)).not.toEqual(a.tasks.map((t) => t.templateId));
  });

  it('Rosskastanie, Ahorn, Eichenblatt, Galle, Farn und Spuren erscheinen nur mit bestätigtem Kontext', () => {
    const bound = ['maple-leaf', 'oak-leaf', 'maple-seed', 'chestnut', 'chestnut-husk', 'gall', 'fern-frond', 'fern-spores', 'animal-track', 'deer-track', 'dog-track'];
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        for (let seed = 1; seed <= 20; seed++) {
          const r = generateRound(params({ season, age, seed, context: [] })).round!;
          for (const t of r.tasks) expect(bound, `${season}/${age}: ${t.templateId}`).not.toContain(t.templateId);
        }
      }
    }
  });

  it('mit bestätigtem Kontext sind die Stationen möglich', () => {
    const seen = new Set<string>();
    for (const season of SEASONS) {
      for (let seed = 1; seed <= 500; seed++) {
        const r = generateRound(params({ season, age: '7-10', context: ALL_CONTEXT, seed })).round!;
        r.tasks.forEach((t) => seen.add(t.templateId));
      }
    }
    for (const id of ['maple-leaf', 'oak-leaf', 'chestnut', 'acorn', 'cone', 'gnawed-cone', 'gnawed-nut', 'fern-spores', 'gall', 'deer-track']) {
      expect(seen.has(id), id).toBe(true);
    }
  });

  it('2–3 Jahre erhalten nur Einzel- oder kleine Zählaufgaben, nie Vergleiche oder Kleinteile mit Menge > 1', () => {
    for (const season of SEASONS) {
      for (let seed = 1; seed <= 12; seed++) {
        const r = generateRound(params({ season, age: '2-3', count: 5, seed, context: ALL_CONTEXT })).round!;
        for (const t of r.tasks) {
          expect(t.mode).not.toBe('compare');
          expect(t.target).toBeLessThanOrEqual(2);
          if (byId(t.templateId).smallParts) expect(t.target).toBe(1);
        }
      }
    }
  });

  it('„Mehr zählen“ erhöht nur Mengen ausdrücklich geeigneter Aufgaben', () => {
    let boosted = 0;
    for (let seed = 1; seed <= 80; seed++) {
      const r = generateRound(params({ season: 'autumn', age: '7-10', boost: true, context: ALL_CONTEXT, seed })).round!;
      for (const t of r.tasks) {
        const tpl = byId(t.templateId);
        if (t.target > Math.max(...tpl.quantityByAge['7-10']!)) {
          boosted++;
          expect(tpl.countingBoostMaxByAge?.['7-10']).toBeGreaterThanOrEqual(t.target);
        }
        if (tpl.completionMode !== 'count') expect(t.target).toBe(tpl.completionMode === 'compare' ? 2 : 1);
      }
    }
    expect(boosted).toBeGreaterThan(0);
  });

  it('ohne „Mehr zählen“ bleibt jede Menge im Standardbereich', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const r = generateRound(params({ age: '4-6', boost: false, seed, context: ['chestnut', 'oak'] })).round!;
      for (const t of r.tasks) expect(t.target).toBeLessThanOrEqual(3);
    }
  });

  it('zu kleiner Pool: ehrliche kleinere Mission mit Hinweis, ohne ungültige Auffüller', () => {
    const tiny = templates.filter((t) => ['moss', 'needle-twig'].includes(t.id));
    const res = generateRound(params({ age: '2-3', count: 5, catalog: tiny }));
    expect(res.round!.tasks).toHaveLength(2);
    expect(res.round!.notice).toMatch(/nur 2 passende Stationen/);
  });

  it('leerer Pool: keine Mission, keine Endlosschleife', () => {
    const res = generateRound(params({ catalog: [] }));
    expect(res.round).toBeNull();
    expect(res.reason).toBe('empty');
  });

  it('bevorzugt andere Konzepte als in der letzten Mission', () => {
    const base = generateRound(params({ seed: 5, count: 3 })).round!;
    const avoid = base.tasks.map((t) => t.conceptId);
    const overlapWith = (list?: string[]) => {
      let o = 0;
      for (let seed = 100; seed < 180; seed++) {
        const r = generateRound(params({ seed, count: 3, avoidConcepts: list })).round!;
        o += r.tasks.filter((t) => avoid.includes(t.conceptId)).length;
      }
      return o;
    };
    expect(overlapWith(avoid)).toBeLessThan(overlapWith(undefined));
  });

  it('beginnt mit einem konkreten, häufigen Fund (kein Vergleich, kein Tier)', () => {
    for (const season of SEASONS) {
      for (let seed = 1; seed <= 20; seed++) {
        const r = generateRound(params({ season, seed })).round!;
        const first = byId(r.tasks[0].templateId);
        expect(first.completionMode).not.toBe('compare');
        expect(first.family).not.toBe('animals');
        const anyCommon = r.tasks.some((t) => t.mode !== 'compare' && t.family !== 'animals' && likelihoodFor(byId(t.templateId), FOREST, season) === 'common');
        if (anyCommon) expect(likelihoodFor(first, FOREST, season)).toBe('common');
      }
    }
  });

  it('grammatisch korrekte Mengenformulierung aus festen Mustern', () => {
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const r = generateRound(params({ season: 'autumn', age: '4-6', seed })).round!;
      for (const t of r.tasks) {
        if (t.templateId === 'cone' && t.target === 3) {
          expect(t.prompt).toBe('Entdecke 3 Zapfen mit vielen Schuppen.');
          found = true;
        }
        if (t.templateId === 'cone' && t.target === 1) expect(t.prompt).toBe('Entdecke einen Zapfen mit vielen Schuppen.');
        expect(t.prompt).not.toContain('{n}');
      }
    }
    expect(found).toBe(true);
  });
});

describe('Waldkatalog: nur Wald, keine Füllaufgaben', () => {
  const retiredIds = new Set(templates.filter((t) => t.retired).map((t) => t.id));
  const BANNED_PROMPTS = /Himmel|Zeig mir einen Baum|etwas Rundes|etwas Langes|etwas Schönes|etwas Interessantes|Boden unter euch|Strand|Stadt|Park|Wiese|Garten|Spielplatz|Berg|See\b|Bach|Ufer|Schnee|Pfütze|Schatten|Sand|Muschel|Haus|Bank|Fenster|Tür|Fahrrad|Zaun/;

  it('ausgemusterte Vorlagen werden nie gezogen und nie als Tausch angeboten; keine Ortsworte in Aufträgen', () => {
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        for (let seed = 1; seed <= 30; seed++) {
          const r = generateRound(params({ season, age, seed, count: 5, context: ALL_CONTEXT })).round!;
          for (const t of r.tasks) {
            expect(retiredIds.has(t.templateId), `${season}/${age}: ${t.templateId}`).toBe(false);
            expect(t.prompt, t.templateId).not.toMatch(BANNED_PROMPTS);
          }
          const res = replaceTask(r, r.tasks[0].uid, seededRng(seed));
          if (res.round) for (const t of res.round.tasks) expect(retiredIds.has(t.templateId)).toBe(false);
        }
      }
    }
  });

  it('eine Dreier-Mission für 2–3 Jahre besteht ohne Zusatzangaben aus konkreten Funden (nie Baum, Stock, Himmel)', () => {
    for (const season of SEASONS) {
      const t = tally({ age: '2-3', season, context: [], count: 3, runs: 300 });
      for (const r of t.rounds) {
        expect(r.length).toBe(3);
        for (const id of r) expect(retiredIds.has(id)).toBe(false);
      }
      for (const forbidden of ['tree', 'twig-plain', 'sky']) expect(t.share[forbidden] ?? 0).toBe(0);
    }
  });

  it('Zapfen, Moos und Kastanie erscheinen in 2–3 tatsächlich, wenn ihre Bedingungen erfüllt sind', () => {
    const autumn = tally({ age: '2-3', season: 'autumn', context: ['conifers', 'chestnut'], count: 3 });
    expect(autumn.share.cone ?? 0).toBeGreaterThan(0.1);
    expect(autumn.share.moss ?? 0).toBeGreaterThan(0.1);
    expect(autumn.share.chestnut ?? 0).toBeGreaterThan(0.1);
    const winter = tally({ age: '2-3', season: 'winter', context: ['conifers', 'chestnut'], count: 3 });
    expect(winter.share.cone ?? 0).toBeGreaterThan(0.1);
    expect(winter.share.moss ?? 0).toBeGreaterThan(0.1);
    expect(winter.share.chestnut ?? 0).toBe(0); // frische Herbstfunde nicht im Winter
  });

  it('Saisonfunde fehlen außerhalb ihrer Zeit: kein frisches Grün im Winter, keine Herbstfrüchte im Frühling und Sommer', () => {
    const winterOut = ['green-leaf', 'fern-frond', 'fern-spores', 'tree-seedling', 'spider-web', 'mushroom', 'leaf-mine', 'gall', 'maple-seed', 'chestnut', 'chestnut-husk', 'hazelnut', 'beechnut'];
    const t = tally({ age: '7-10', season: 'winter', context: ALL_CONTEXT, count: 5, runs: 300 });
    for (const id of winterOut) expect(t.templates[id] ?? 0, `Winter ${id}`).toBe(0);
    for (const season of ['spring', 'summer'] as const) {
      const s = tally({ age: '7-10', season, context: ALL_CONTEXT, count: 5, runs: 300 });
      for (const id of ['chestnut', 'acorn', 'acorn-cup', 'hazelnut', 'gnawed-nut', 'beechnut', 'beech-husk', 'dry-leaf', 'yellow-leaf', 'red-leaf']) {
        expect(s.templates[id] ?? 0, `${season} ${id}`).toBe(0);
      }
    }
  });

  it('ohne Baumartenangaben gibt es trotzdem konkrete Fruchtfunde; nur Rosskastanie und Artenblätter bleiben aus', () => {
    const noCtx = tally({ age: '4-6', season: 'autumn', context: [], count: 5, runs: 400 });
    for (const c of ['chestnut', 'husk', 'gall']) expect(noCtx.share[c] ?? 0, c).toBe(0);
    for (const c of ['acorn', 'cone', 'beechnut', 'hazelnut']) expect(noCtx.share[c] ?? 0, `${c} sollte vorkommen`).toBeGreaterThan(0.03);
    // bestätigte Baumart macht den Fund wahrscheinlicher
    const withOak = tally({ age: '4-6', season: 'autumn', context: ['oak'], count: 5, runs: 400 });
    expect(withOak.share.acorn ?? 0).toBeGreaterThan(noCtx.share.acorn ?? 0);
  });

  it('verwandte Motive werden nie in einer Mission gedoppelt: Eichel/Eichelhütchen, ganzer/abgenagter Zapfen, Buchecker/Hülle, Nuss/Nussschale', () => {
    const pairs = [['acorn', 'acorn-cup'], ['cone', 'gnawed-cone'], ['cone-compare', 'gnawed-cone'], ['cone', 'cone-compare'], ['beechnut', 'beech-husk'], ['hazelnut', 'gnawed-nut']];
    for (const season of SEASONS) {
      for (let seed = 1; seed <= 150; seed++) {
        const ids = generateRound(params({ season, age: '7-10', seed, context: ALL_CONTEXT })).round!.tasks.map((t) => t.templateId);
        for (const [a, b] of pairs) expect(ids.includes(a) && ids.includes(b), `${season}/${seed}: ${a} + ${b}`).toBe(false);
      }
    }
  });

  it('kein einzelnes Motiv dominiert: weder als Einstieg noch über alle Missionen', () => {
    for (const age of AGE_GROUPS) {
      for (const season of SEASONS) {
        const t = tally({ age, season, context: [], count: age === '2-3' ? 3 : 5, runs: 400 });
        const starts: Record<string, number> = {};
        for (const r of t.rounds) starts[r[0]] = (starts[r[0]] ?? 0) + 1;
        const topStart = Math.max(...Object.values(starts)) / t.rounds.length;
        const topShare = Math.max(...Object.values(t.share));
        expect(topStart, `${age}/${season}: häufigster Einstieg ${(topStart * 100).toFixed(0)} %`).toBeLessThan(0.5);
        expect(topShare, `${age}/${season}: häufigstes Konzept ${(topShare * 100).toFixed(0)} %`).toBeLessThan(age === '2-3' ? 0.92 : 0.8);
      }
    }
  });

  it('neue konkrete Gegenstände werden tatsächlich gezogen und sind nicht wegen alter Gewichte unsichtbar', () => {
    const seenOk = new Set<string>();
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        const t = tally({ age, season, context: ALL_CONTEXT, count: age === '2-3' ? 3 : 5, runs: 300 });
        Object.keys(t.templates).forEach((id) => seenOk.add(id));
      }
    }
    for (const t of templates.filter((x) => !x.retired)) expect(seenOk.has(t.id), `${t.id} kommt nie vor`).toBe(true);
  });

  it('Spuren erscheinen nur mit bestätigtem weichen Untergrund', () => {
    for (const season of SEASONS) {
      const t = tally({ age: '7-10', season, context: [], count: 5, runs: 150 });
      expect(t.share.track ?? 0, season).toBe(0);
    }
    const mud = tally({ age: '7-10', season: 'spring', context: ['mud'], count: 5, runs: 300 });
    expect(mud.share.track ?? 0).toBeGreaterThan(0.1);
  });

  it('keine Mission besteht nur aus Blattvarianten oder nur aus seltenen Nussfunden', () => {
    const t = tally({ age: '4-6', season: 'autumn', context: ALL_CONTEXT, count: 5, runs: 500 });
    const fruits = new Set(['chestnut', 'acorn', 'acornCup', 'hazelnut', 'beechnut', 'beechHusk', 'cone', 'mapleSeed', 'husk']);
    for (const r of t.rounds) {
      const tpls = r.map((id) => templates.find((x) => x.id === id)!);
      expect(new Set(tpls.map((x) => x.conceptId)).size).toBe(tpls.length);
      expect(tpls.filter((x) => fruits.has(x.conceptId)).length).toBeLessThanOrEqual(3);
    }
  });
});

describe('Leitmotive und Missionstitel', () => {
  const titles = new Set([...Object.values(THEME_INFO).map((i) => i.title), 'Waldgeheimnisse entdecken']);

  it('jede aktive Vorlage gehört zu mindestens einem Leitmotiv', () => {
    for (const t of templates.filter((x) => !x.retired)) expect(t.themes.length, t.id).toBeGreaterThan(0);
  });

  it('Titel kommen aus der festen Liste und das Leitmotiv wird nur genannt, wenn mindestens die Hälfte der Stationen dazu passt', () => {
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        for (let seed = 1; seed <= 60; seed++) {
          const count = age === '2-3' ? 3 : 5;
          const r = generateRound(params({ season, age, seed, count, context: ALL_CONTEXT })).round!;
          expect(titles.has(r.mission!.title), r.mission!.title).toBe(true);
          if (r.mission!.theme) {
            const n = r.tasks.filter((t) => byId(t.templateId).themes.includes(r.mission!.theme as Theme)).length;
            expect(n, `${season}/${age}/${seed}`).toBeGreaterThanOrEqual(Math.max(2, Math.ceil(r.tasks.length / 2)));
            expect(r.mission!.title).toBe(THEME_INFO[r.mission!.theme as Theme].title);
          } else {
            expect(r.mission!.title).toBe('Waldgeheimnisse entdecken');
          }
        }
      }
    }
  });

  it('die meisten Missionen tragen ein Leitmotiv, und alle Leitmotive kommen im Lauf der Zeit vor', () => {
    const seen = new Set<Theme>();
    let themed = 0;
    let total = 0;
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        for (let seed = 1; seed <= 80; seed++) {
          const r = generateRound(params({ season, age, seed, count: age === '2-3' ? 3 : 5, context: ALL_CONTEXT })).round!;
          total++;
          if (r.mission!.theme) {
            themed++;
            seen.add(r.mission!.theme);
          }
        }
      }
    }
    expect(themed / total, `Anteil mit Leitmotiv: ${themed}/${total}`).toBeGreaterThan(0.8);
    expect([...seen].sort()).toEqual([...THEMES].sort());
  });

  it('ohne Zusatzangaben tragen mindestens zwei Drittel der Missionen ein Leitmotiv', () => {
    let themed = 0;
    let total = 0;
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        for (let seed = 1; seed <= 60; seed++) {
          const r = generateRound(params({ season, age, seed, count: age === '2-3' ? 3 : 5, context: [] })).round!;
          total++;
          if (r.mission!.theme) themed++;
        }
      }
    }
    expect(themed / total, `Anteil mit Leitmotiv: ${themed}/${total}`).toBeGreaterThan(0.66);
  });

  it('das Leitmotiv der letzten Mission wird nach Möglichkeit nicht gleich wiederholt', () => {
    const repeat = (avoid?: Theme) => {
      let same = 0;
      for (let seed = 1; seed <= 120; seed++) {
        const r = generateRound(params({ season: 'autumn', age: '7-10', context: ALL_CONTEXT, seed, avoidTheme: avoid })).round!;
        if (r.mission!.theme === 'growth') same++;
      }
      return same;
    };
    expect(repeat('growth')).toBeLessThan(repeat(undefined));
  });

  it('eine Mission verspricht nie „Wie aus Kleinem ein Baum wird“, wenn kein Samen, keine Frucht und kein Anfang vorkommt', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const r = generateRound(params({ season: 'winter', age: '4-6', context: [], seed })).round!;
      if (r.mission!.theme === 'growth') {
        const growth = r.tasks.filter((t) => byId(t.templateId).themes.includes('growth'));
        expect(growth.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('Aufgabentausch', () => {
  const scenario = (age: AgeGroup = '4-6', season: Season = 'autumn') => generateRound(params({ age, season, seed: 9, count: 5, context: ALL_CONTEXT })).round!;

  it('ersetzt nur die gewählte Station, erhält anderen Fortschritt und schließt das Konzept aus', () => {
    const round = scenario();
    const withProgress = {
      ...round,
      tasks: round.tasks.map((t, i) => (i === 1 ? { ...t, status: 'done' as const, found: t.target } : t)),
    };
    const target = withProgress.tasks[2];
    const res = replaceTask(withProgress, target.uid, seededRng(3));
    expect(res.round).not.toBeNull();
    const next = res.round!;
    expect(next.tasks[2].uid).not.toBe(target.uid);
    expect(next.tasks[2].conceptId).not.toBe(target.conceptId);
    expect(next.excludedConcepts).toContain(target.conceptId);
    expect(next.tasks[2].status).toBe('open');
    expect(next.tasks[2].found).toBe(0);
    expect(next.tasks[1]).toEqual(withProgress.tasks[1]);
    expect(next.tasks[0]).toEqual(withProgress.tasks[0]);
    const concepts = next.tasks.map((t) => t.conceptId);
    expect(new Set(concepts).size).toBe(concepts.length);
    expect(next.mission?.title).toBeTruthy();
  });

  it('ersetzte oder ausgeschlossene Konzepte kehren nie zurück', () => {
    let round = scenario();
    const removed: string[] = [];
    for (let i = 0; i < 40; i++) {
      const target = round.tasks[0];
      removed.push(target.conceptId);
      const res = replaceTask(round, target.uid, seededRng(i + 1));
      if (!res.round) break;
      round = res.round;
      for (const r of removed) expect(round.tasks.map((t) => t.conceptId)).not.toContain(r);
    }
    expect(removed.length).toBeGreaterThan(3);
  });

  it('der Tausch hält Alters-, Jahreszeit- und Kontextregeln ein', () => {
    for (const age of AGE_GROUPS) {
      const round = generateRound(params({ age, season: 'winter', seed: 9, count: 5 })).round!;
      const res = replaceTask(round, round.tasks[0].uid, seededRng(2));
      if (!res.round) continue;
      const t = byId(res.round.tasks[0].templateId);
      expect(t.ageGroups).toContain(age);
      expect(t.environments).toEqual([FOREST]);
      expect(t.seasons).toContain('winter');
      expect(t.requiredContext).toEqual([]);
    }
  });

  it('ausgeschöpfte Alternativen führen zu einem Ergebnis ohne Endlosschleife', () => {
    let round = generateRound(params({ age: '2-3', season: 'winter', count: 3, seed: 4 })).round!;
    let steps = 0;
    for (; steps < 200; steps++) {
      const res = replaceTask(round, round.tasks[0].uid, seededRng(steps + 11));
      if (!res.round) {
        expect(res.reason).toBe('no-alternative');
        break;
      }
      round = res.round;
    }
    expect(steps).toBeLessThan(200);
  });
});

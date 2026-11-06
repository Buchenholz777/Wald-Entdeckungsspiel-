import { describe, expect, it } from 'vitest';
import {
  ESCAPE_KEY,
  ESCAPE_PHASES,
  addFound,
  addPause,
  canPlayEscape,
  clearSlot,
  continueFree,
  createEscape,
  createEscapePersistence,
  describeClue,
  describePool,
  endEarly,
  escapePool,
  formatClock,
  giveHint,
  invariantsHold,
  isRunning,
  keyTasks,
  makeClues,
  markCelebrated,
  needsCelebration,
  openVault,
  openWithHelp,
  permutations,
  placeAt,
  placeSymbol,
  poolNotice,
  remainingAt,
  removePause,
  resultLine,
  sanitizeEscape,
  settle,
  swapTask,
  undoFound,
  countSolutions,
  ESCAPE_TEMPLATE_IDS,
  poolGroups,
  type EscapeMission,
  type EscapeParams,
  type SymbolId,
} from '../src/domain/escape';
import { SYMBOLS } from '../src/domain/escape/types';
import { seededRng } from '../src/domain/rng';
import { generateRound } from '../src/domain/generator';
import { isFullyFound } from '../src/domain/gift';
import { addFound as addFoundRound } from '../src/domain/round';
import { sanitizeSettings } from '../src/domain/storage';
import type { KeyValueStore } from '../src/domain/storage';
import { templatesById } from '../src/catalog/templates';
import { giftsById } from '../src/catalog/gifts';
import type { Season } from '../src/domain/types';

const T0 = 1_700_000_000_000;
const MIN = 60_000;
const P = (over: Partial<EscapeParams> = {}): EscapeParams => ({ age: '7-10', season: 'autumn', seasonSource: 'auto', context: [], minutes: 15, ...over });

function mission(over: Partial<EscapeParams> = {}, seed = 7, now = T0): EscapeMission {
  const r = createEscape(P(over), seed, now);
  if (!r.ok) throw new Error('Mission nicht möglich');
  return r.mission;
}

/** Erfüllt eine Karte vollständig (bei Zählaufgaben mehrfach) zum Zeitpunkt `at`. */
function finish(m: EscapeMission, index: number, at: number): EscapeMission {
  let x = m;
  const uid = m.tasks[index].uid;
  for (let i = 0; i < 12; i++) x = addFound(x, uid, at);
  return x;
}

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('Wald Escape: Altersfreigabe und Kandidaten', () => {
  it('ab 4 Jahren; 2–3 Jahre starten keine Zeitmission', () => {
    expect(canPlayEscape('2-3')).toBe(false);
    expect(canPlayEscape(null)).toBe(false);
    expect(canPlayEscape('4-6')).toBe(true);
    expect(canPlayEscape('7-10')).toBe(true);
  });

  it('die Positivliste enthält nur vorhandene aktive Waldvorlagen ohne Tiere, Pilze, Spuren, Vergleiche', () => {
    for (const id of ESCAPE_TEMPLATE_IDS) {
      const t = templatesById[id];
      expect(t, id).toBeDefined();
      expect(t.retired, id).toBeFalsy();
      expect(['animals', 'tracks', 'fungi']).not.toContain(t.family);
      expect(t.completionMode, id).not.toBe('compare');
    }
  });

  it('fünf verschiedene Konzepte, Alters-/Saison-/Kontextfilter und eigene Symbole je Karte (feste Seeds)', () => {
    for (const age of ['4-6', '7-10'] as const) {
      for (const season of ['spring', 'autumn', 'winter'] as Season[]) {
        for (let seed = 1; seed <= 25; seed++) {
          const m = mission({ age, season }, seed);
          expect(m.tasks.length, `${age}/${season}/${seed}`).toBe(5);
          expect(new Set(m.tasks.map((t) => t.conceptId)).size).toBe(5);
          expect(new Set(m.tasks.map((t) => t.symbol)).size).toBe(5);
          for (const t of m.tasks) {
            const tpl = templatesById[t.templateId];
            expect(tpl.ageGroups).toContain(age);
            expect(tpl.seasons).toContain(season);
            expect(tpl.requiredContext).toEqual([]); // ohne bestätigten Kontext nie ein Kontext-Fund
            expect(t.target).toBeLessThanOrEqual(age === '4-6' ? 2 : 3);
            expect(t.status).toBe('open');
          }
          expect(invariantsHold(m)).toBe(true);
        }
      }
    }
  });

  it('dieselbe Auswahl mit demselben Seed ergibt dieselbe Mission (nicht beim Rendern neu gelost)', () => {
    const a = mission({}, 11);
    const b = mission({}, 11);
    expect(a.tasks.map((t) => [t.templateId, t.symbol, t.target])).toEqual(b.tasks.map((t) => [t.templateId, t.symbol, t.target]));
  });

  it('bestätigte Baumarten erweitern den Pool (Kontext ist nie Voraussetzung, aber erlaubt)', () => {
    const plain = describePool(P());
    const rich = describePool(P({ context: ['maple', 'oak', 'chestnut', 'fern'] }));
    expect(rich.groups).toBeGreaterThan(plain.groups);
  });

  it('kleine Pools werden ehrlich behandelt: 4 Karten sagen es, unter drei startet nichts, das Ziel bleibt drei Schlüssel', () => {
    const summer = describePool(P({ season: 'summer' }));
    expect(summer.cards).toBe(4);
    expect(poolNotice(summer)).toBe('Heute stehen 4 Waldschätze zur Wahl. Ihr braucht 3.');
    const m = mission({ season: 'summer' }, 3);
    expect(m.tasks.length).toBe(4);
    expect(m.requiredKeys).toBe(3);
    // drei Konzepte: kein Auffüllen, ausdrückliche Erklärung
    expect(poolNotice({ cards: 3, groups: 3 })).toMatch(/genau 3/);
    expect(poolNotice({ cards: 3, groups: 3 })).toMatch(/alle drei/);
    // unter drei: keine Mission
    expect(createEscape(P({ season: 'summer' }), 1, T0).ok).toBe(true);
    expect(poolNotice({ cards: 0, groups: 2 })).toMatch(/zu wenige/);
  });

  it('mit einem leeren Katalog entsteht keine Mission statt einer geschwächten', () => {
    expect(poolGroups([])).toBe(0);
    expect(escapePool(P({ season: 'summer' })).length).toBeGreaterThan(0);
  });
});

describe('Wald Escape: Uhr mit eigener Zeit', () => {
  it('beginnt erst beim Erzeugen mit 10, 15 oder 20 Minuten', () => {
    for (const minutes of [10, 15, 20] as const) {
      const m = mission({ minutes });
      expect(m.clock.durationMs).toBe(minutes * MIN);
      expect(remainingAt(m, T0)).toBe(minutes * MIN);
      expect(remainingAt(m, T0 + 5 * MIN)).toBe(minutes * MIN - 5 * MIN);
    }
  });

  it('rechnet aus Zeitpunkten: ein verzögerter oder fehlender Tick ändert nichts', () => {
    const m = mission();
    // 7 Minuten ohne jeden Zwischenschritt (zum Beispiel gesperrtes Telefon)
    expect(remainingAt(m, T0 + 7 * MIN)).toBe(8 * MIN);
    // viele kleine Schritte ergeben dasselbe
    let x = m;
    for (let s = 1; s <= 420; s++) x = settle(x, T0 + s * 1000);
    expect(remainingAt(x, T0 + 420_000)).toBe(8 * MIN);
  });

  it('Pause hält die Uhr an und Weitersuchen nimmt dieselbe Restzeit wieder auf', () => {
    let m = mission();
    m = addPause(m, 'manual', T0 + 2 * MIN);
    expect(isRunning(m)).toBe(false);
    expect(remainingAt(m, T0 + 60 * MIN)).toBe(13 * MIN);
    m = removePause(m, 'manual', T0 + 60 * MIN);
    expect(isRunning(m)).toBe(true);
    expect(remainingAt(m, T0 + 61 * MIN)).toBe(12 * MIN);
  });

  it('überlagerte Pausengründe: Schließen eines Dialogs startet die Uhr nicht, solange noch ein Grund besteht', () => {
    let m = mission();
    m = addPause(m, 'manual', T0 + MIN);
    m = addPause(m, 'dialog', T0 + MIN);
    m = removePause(m, 'dialog', T0 + 5 * MIN);
    expect(isRunning(m)).toBe(false);
    expect(remainingAt(m, T0 + 30 * MIN)).toBe(14 * MIN);
    m = addPause(m, 'menu', T0 + 30 * MIN);
    m = removePause(m, 'manual', T0 + 30 * MIN);
    expect(isRunning(m)).toBe(false); // Hauptmenü hält weiter
    m = removePause(m, 'menu', T0 + 31 * MIN);
    expect(isRunning(m)).toBe(true);
    expect(remainingAt(m, T0 + 31 * MIN)).toBe(14 * MIN);
  });

  it('doppelte Pausenereignisse und schnelle Wechsel erzeugen weder Zeit noch Fehler', () => {
    let m = mission();
    for (let i = 0; i < 6; i++) {
      m = addPause(m, 'dialog', T0 + MIN);
      m = addPause(m, 'dialog', T0 + MIN);
      m = removePause(m, 'dialog', T0 + MIN);
      m = removePause(m, 'dialog', T0 + MIN);
    }
    expect(remainingAt(m, T0 + MIN)).toBe(14 * MIN);
    expect(m.pauses).toEqual([]);
  });

  it('bei exakt null und danach ist die Zeit abgelaufen: 00:00, nie negativ, nie mehr als die Startdauer', () => {
    const m = mission({ minutes: 10 });
    expect(settle(m, T0 + 10 * MIN - 1).phase).toBe('searching');
    const over = settle(m, T0 + 10 * MIN);
    expect(over.phase).toBe('timeup');
    expect(over.outcome).toBe('expired');
    expect(remainingAt(over, T0 + 99 * MIN)).toBe(0);
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(14 * MIN + 32_000)).toBe('14:32');
    expect(formatClock(1)).toBe('00:01');
  });

  it('Gerätezeit rückwärts schenkt keine Zeit und lässt nie mehr als die Startdauer zu', () => {
    const m = mission({ minutes: 10 });
    const back = remainingAt(m, T0 - 5 * MIN);
    expect(back).toBeLessThanOrEqual(10 * MIN);
    expect(back).toBe(10 * MIN);
    const s = settle(m, T0 - 5 * MIN);
    expect(remainingAt(s, T0 - 5 * MIN + 1000)).toBe(10 * MIN - 1000);
  });

  it('Hauptmenü (Pause) und Reload: laufende Suche rechnet die echte Zeit ab, eine Pause bleibt eine Pause', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    let m = mission();
    expect(p.save(m)).toBe('ok');
    const running = p.load(T0 + 4 * MIN);
    expect(running.status).toBe('ok');
    expect(remainingAt(running.mission!, T0 + 4 * MIN)).toBe(11 * MIN);
    m = { ...addPause(m, 'menu', T0 + 3 * MIN), rev: 2 };
    p.save(m);
    const paused = p.load(T0 + 90 * MIN).mission!;
    expect(paused.phase).toBe('searching');
    expect(remainingAt(paused, T0 + 90 * MIN)).toBe(12 * MIN);
    expect(isRunning(paused)).toBe(false);
  });

  it('lief die Uhr während einer lange geschlossenen Seite ab, zeigt der Neustart die Zeitablauf-Ansicht', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    p.save(mission({ minutes: 10 }));
    const m = p.load(T0 + 3 * 60 * MIN).mission!;
    expect(m.phase).toBe('timeup');
    expect(m.outcome).toBe('expired');
  });

  it('ein offener Dialog ist nach dem Neuladen eine bewusste Pause (die Uhr startet nie ungefragt)', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    p.save(addPause(mission(), 'dialog', T0 + MIN));
    const m = p.load(T0 + 20 * MIN).mission!;
    expect(m.pauses).toEqual(['manual']);
    expect(remainingAt(m, T0 + 20 * MIN)).toBe(14 * MIN);
  });
});

describe('Wald Escape: Schlüssel und Zeitergebnis', () => {
  it('beliebige drei von fünf Karten liefern genau drei Schlüssel; zwei reichen nicht; die übrigen bleiben freiwillig', () => {
    const m = mission();
    let x = finish(m, 4, T0 + 10_000);
    expect(x.keys.length).toBe(1);
    x = finish(x, 1, T0 + 20_000);
    expect(x.keys.length).toBe(2);
    expect(x.phase).toBe('searching');
    x = finish(x, 3, T0 + 30_000);
    expect(x.keys.length).toBe(3);
    expect(x.phase).toBe('combination');
    expect(x.tasks.filter((t) => t.status === 'open').length).toBe(2);
    expect(x.keys.map((k) => k.symbol)).toEqual([m.tasks[4].symbol, m.tasks[1].symbol, m.tasks[3].symbol]);
    expect(invariantsHold(x)).toBe(true);
  });

  it('Doppeltippen auf eine fertige Karte gibt keinen weiteren Schlüssel', () => {
    let m = mission();
    m = finish(m, 0, T0 + 1000);
    const again = finish(m, 0, T0 + 2000);
    expect(again.keys.length).toBe(1);
    expect(again.tasks).toEqual(m.tasks);
    expect(again.keys).toEqual(m.keys);
  });

  it('Zählaufgaben zählen jeden Tipp einmal und höchstens bis zur Zielmenge', () => {
    const m = mission({ age: '7-10' }, 5);
    const i = m.tasks.findIndex((t) => t.target > 1);
    if (i >= 0) {
      let x = addFound(m, m.tasks[i].uid, T0);
      expect(x.tasks[i].found).toBe(1);
      expect(x.keys.length).toBe(m.tasks[i].target === 1 ? 1 : 0);
      x = finish(x, i, T0);
      expect(x.tasks[i].found).toBe(m.tasks[i].target);
      expect(x.keys.length).toBe(1);
    }
  });

  it('der dritte Fund knapp vor null ist rechtzeitig und friert die echte Restzeit ein', () => {
    let m = mission({ minutes: 10 });
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    m = finish(m, 2, T0 + 10 * MIN - 1);
    expect(m.phase).toBe('combination');
    expect(m.outcome).toBe('onTime');
    expect(m.clock.resumedAt).toBeNull();
    expect(remainingAt(m, T0 + 50 * MIN)).toBe(1); // die Uhr steht: das Rätsel kostet keine Suchzeit
  });

  it('der dritte Fund bei oder nach null ist nicht rechtzeitig; der Fund selbst zählt aber', () => {
    for (const at of [T0 + 10 * MIN, T0 + 10 * MIN + 5000]) {
      let m = mission({ minutes: 10 });
      m = finish(m, 0, T0 + 1000);
      m = finish(m, 1, T0 + 2000);
      m = finish(m, 2, at);
      expect(m.outcome).toBe('expired');
      expect(m.phase).toBe('combination');
      expect(m.keys.length).toBe(3);
    }
  });

  it('die Kombinationsphase verbraucht keine Suchzeit: lange Beschäftigung ändert das Ergebnis nicht', () => {
    let m = mission({ minutes: 10 });
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    m = finish(m, 2, T0 + 3000);
    const later = settle(m, T0 + 600 * MIN);
    expect(later.phase).toBe('combination');
    expect(later.outcome).toBe('onTime');
  });

  it('Zeit abgelaufen: Funde bleiben, „Ohne Zeitdruck weitersuchen“ gibt keine neue Zeit und nie das Rechtzeitig-Ergebnis', () => {
    let m = mission({ minutes: 10 });
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    m = settle(m, T0 + 11 * MIN);
    expect(m.phase).toBe('timeup');
    expect(m.keys.length).toBe(2);
    m = continueFree(m, T0 + 12 * MIN);
    expect(m.phase).toBe('free');
    expect(isRunning(m)).toBe(false);
    expect(remainingAt(m, T0 + 99 * MIN)).toBe(0);
    m = finish(m, 3, T0 + 20 * MIN);
    expect(m.phase).toBe('combination');
    expect(m.outcome).toBe('expired');
  });

  it('keine unmöglichen Zustände: Phasen und Ergebnis passen zusammen (viele zufällige Verläufe)', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rng = seededRng(seed);
      let m = mission({ minutes: 10 }, seed);
      let t = T0;
      for (let step = 0; step < 40 && m.phase !== 'opened'; step++) {
        t += Math.floor(rng() * 90_000);
        const r = rng();
        const i = Math.floor(rng() * m.tasks.length);
        if (r < 0.4) m = addFound(m, m.tasks[i].uid, t);
        else if (r < 0.55) m = undoFound(m, m.tasks[i].uid, t);
        else if (r < 0.65) m = addPause(m, 'manual', t);
        else if (r < 0.75) m = removePause(m, 'manual', t);
        else if (r < 0.8) m = continueFree(m, t);
        else if (r < 0.85) m = swapTask(m, m.tasks[i].uid, t) ?? m;
        else if (m.phase === 'combination') m = openWithHelp(m, [], t);
        else m = settle(m, t);
        expect(invariantsHold(m), `seed ${seed} step ${step}`).toBe(true);
        expect(ESCAPE_PHASES).toContain(m.phase);
        expect(m.clock.remainingMs).toBeGreaterThanOrEqual(0);
        expect(m.clock.remainingMs).toBeLessThanOrEqual(m.clock.durationMs);
        if (m.phase === 'timeup') expect(m.outcome).toBe('expired');
        if (m.phase === 'opened') expect(m.keys.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('Wald Escape: Austausch und Rückgängig', () => {
  it('Austausch ersetzt nur die offene Karte, schließt das Konzept aus und lässt Funde, Schlüssel und Teilfortschritt unberührt', () => {
    let m = mission({}, 4);
    m = finish(m, 0, T0 + 1000);
    const partial = m.tasks.findIndex((t, i) => i > 0 && t.target > 1);
    if (partial > 0) m = addFound(m, m.tasks[partial].uid, T0 + 2000);
    const idx = m.tasks.findIndex((t, i) => i > 0 && i !== partial && t.status === 'open');
    const old = m.tasks[idx];
    const swapped = swapTask(m, old.uid, T0 + 3000)!;
    expect(swapped).not.toBeNull();
    expect(swapped.tasks[idx].uid).not.toBe(old.uid);
    expect(swapped.tasks[idx].conceptId).not.toBe(old.conceptId);
    expect(swapped.excludedConcepts).toContain(old.conceptId);
    expect(swapped.tasks[0]).toEqual(m.tasks[0]);
    expect(swapped.keys).toEqual(m.keys);
    if (partial > 0) expect(swapped.tasks[partial].found).toBe(1);
    expect(new Set(swapped.tasks.map((t) => t.symbol)).size).toBe(swapped.tasks.length);
    expect(new Set(swapped.tasks.map((t) => t.conceptId)).size).toBe(swapped.tasks.length);
    // eine fertige Karte lässt sich nicht tauschen
    expect(swapTask(m, m.tasks[0].uid, T0 + 4000)).toBeNull();
  });

  it('ausgetauschte Konzepte kehren nie zurück; ohne Alternative bleibt alles unverändert und das Ziel drei Schlüssel', () => {
    let m = mission({ season: 'summer' }, 2); // 4 Karten
    const seen = new Set(m.tasks.map((t) => t.conceptId));
    let n = 0;
    while (n++ < 10) {
      const open = m.tasks.find((t) => t.status === 'open')!;
      const next = swapTask(m, open.uid, T0);
      if (!next) break;
      const fresh = next.tasks.find((t) => !m.tasks.some((o) => o.uid === t.uid))!;
      expect(m.excludedConcepts).not.toContain(fresh.conceptId);
      seen.add(fresh.conceptId);
      m = next;
    }
    expect(m.requiredKeys).toBe(3);
    expect(m.tasks.length).toBeGreaterThanOrEqual(4);
  });

  it('Rückgängig nimmt einen Fund zurück, entfernt den Schlüssel und lässt andere Karten bestehen', () => {
    let m = mission();
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    const u = undoFound(m, m.tasks[0].uid, T0 + 3000);
    expect(u.keys.map((k) => k.uid)).toEqual([m.tasks[1].uid]);
    expect(u.tasks[0].status).toBe('open');
    expect(u.tasks[1].status).toBe('done');
    // nichts zu tun: keine Veränderung
    const noop = undoFound(u, u.tasks[2].uid, T0 + 4000);
    expect(noop.tasks).toEqual(u.tasks);
    expect(noop.keys).toEqual(u.keys);
  });

  it('Rückgängig nach dem dritten Fund führt zurück in die Suche und verwendet höchstens die eingefrorene Restzeit', () => {
    let m = mission({ minutes: 10 });
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    m = finish(m, 2, T0 + 4 * MIN);
    expect(m.outcome).toBe('onTime');
    const back = undoFound(m, m.tasks[2].uid, T0 + 30 * MIN);
    expect(back.phase).toBe('searching');
    expect(back.solution).toBeNull();
    expect(back.input).toEqual([null, null, null]);
    expect(back.keys.length).toBe(2);
    expect(isRunning(back)).toBe(false); // wartet auf „Weitersuchen“
    expect(remainingAt(back, T0 + 99 * MIN)).toBe(10 * MIN - 4 * MIN);
    const go = removePause(back, 'manual', T0 + 31 * MIN);
    expect(remainingAt(go, T0 + 31 * MIN)).toBe(6 * MIN);
  });

  it('eine eingetretene Zeitüberschreitung wird durch Rückgängig nie wieder rechtzeitig', () => {
    let m = mission({ minutes: 10 });
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    m = finish(m, 2, T0 + 12 * MIN); // nach Ablauf
    expect(m.outcome).toBe('expired');
    const back = undoFound(m, m.tasks[2].uid, T0 + 13 * MIN);
    expect(back.phase).toBe('free');
    expect(isRunning(back)).toBe(false);
    const again = finish(back, 3, T0 + 14 * MIN);
    expect(again.outcome).toBe('expired');
  });
});

describe('Wald Escape: Symbolrätsel', () => {
  function atCombination(age: '4-6' | '7-10', seed: number): EscapeMission {
    let m = mission({ age }, seed);
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    return finish(m, 2, T0 + 3000);
  }

  it('die Lösung besteht genau aus den drei erhaltenen Symbolen', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const m = atCombination(seed % 2 ? '4-6' : '7-10', seed);
      expect([...m.solution!].sort()).toEqual(m.keys.map((k) => k.symbol).sort());
    }
  });

  it('7–10: zwei Hinweise lassen genau eine der sechs Reihenfolgen zu, nennen nur erhaltene Symbole', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 150; seed++) {
      const m = atCombination('7-10', seed);
      const owned = m.keys.map((k) => k.symbol);
      expect(m.clues!.length).toBe(2);
      expect(countSolutions(owned, m.clues!), `seed ${seed}`).toBe(1);
      for (const c of m.clues!) {
        expect(owned).toContain(c.a);
        if (c.b) expect(owned).toContain(c.b);
        seen.add(describeClue(c));
      }
      // die einzige Lösung ist die gespeicherte Reihenfolge
      const only = permutations(owned).filter((p) => countSolutions(p, m.clues!) === 1);
      expect(only.some((p) => p.join() === m.solution!.join())).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(8);
  });

  it('die beiden Hinweise handeln in der Regel von zwei verschiedenen Symbolen', () => {
    let different = 0;
    const total = 120;
    for (let seed = 1; seed <= total; seed++) {
      const m = atCombination('7-10', seed);
      if (m.clues![0].a !== m.clues![1].a) different++;
    }
    expect(different / total).toBeGreaterThan(0.9);
  });

  it('das Beispiel aus der Aufgabe: Blatt, Eichel, Zapfen → Zapfen – Eichel – Blatt', () => {
    const symbols: SymbolId[] = ['leaf', 'acorn', 'cone'];
    const solution: SymbolId[] = ['cone', 'acorn', 'leaf'];
    const clues = [
      { kind: 'mid', a: 'acorn' },
      { kind: 'leftOf', a: 'cone', b: 'leaf' },
    ] as const;
    expect(countSolutions(symbols, [...clues])).toBe(1);
    expect(describeClue(clues[0])).toBe('Die Eichel liegt in der Mitte.');
    expect(describeClue(clues[1])).toBe('Der Zapfen liegt links vom Blatt.');
    expect(makeClues(solution, seededRng(3)).length).toBe(2);
    expect(describeClue({ kind: 'rightOf', a: 'cone', b: 'acorn' })).toBe('Der Zapfen liegt rechts von der Eichel.');
  });

  it('4–6: Streifen als Vorbild, keine Hinweise nötig; Eingabe wird nachgebaut', () => {
    const m = atCombination('4-6', 5);
    expect(m.clues).toBeNull();
    let x = m;
    for (const s of m.solution!) x = placeSymbol(x, s);
    expect(x.input).toEqual(m.solution);
    const res = openVault(x, [], T0 + 5000);
    expect(res.ok).toBe(true);
    expect(res.mission.phase).toBe('opened');
  });

  it('falsche Reihenfolge: kein Fehlerzustand, keine Sperre, Belegung bleibt; Entfernen und Tauschen gehen beliebig oft', () => {
    const m = atCombination('7-10', 9);
    const [a, b, c] = m.solution!;
    let x = m;
    for (const s of [b, a, c]) x = placeSymbol(x, s);
    const wrong = openVault(x, [], T0);
    expect(wrong.ok).toBe(false);
    expect(wrong.mission.phase).toBe('combination');
    expect(wrong.mission.input).toEqual([b, a, c]);
    x = clearSlot(clearSlot(wrong.mission, 0), 1);
    expect(x.input).toEqual([null, null, c]);
    x = placeAt(x, 0, a);
    x = placeAt(x, 1, b);
    expect(openVault(x, [], T0).ok).toBe(true);
    // fremde Symbole und Doppelte werden nicht gesetzt
    const foreign = SYMBOLS.find((s) => !m.keys.some((k) => k.symbol === s))!;
    expect(placeSymbol(m, foreign).input).toEqual([null, null, null]);
    expect(placeSymbol(placeSymbol(m, a), a).input).toEqual([a, null, null]);
    // unvollständige Belegung öffnet nie
    expect(openVault(placeSymbol(m, a), [], T0).ok).toBe(false);
  });

  it('Tipp und Hilfsauflösung führen immer weiter; „Gemeinsam öffnen“ öffnet mit drei Schlüsseln', () => {
    const m = atCombination('7-10', 21);
    expect(giveHint(giveHint(giveHint(m))).hints).toBe(2);
    const helped = openWithHelp(m, [], T0 + 9000);
    expect(helped.phase).toBe('opened');
    expect(helped.helped).toBe(true);
    expect(helped.input).toEqual(m.solution);
    // vor dem dritten Schlüssel öffnet nichts
    const early = finish(mission(), 0, T0);
    expect(openWithHelp(early, [], T0).phase).toBe('searching');
    expect(openVault(early, [], T0).ok).toBe(false);
  });
});

describe('Wald Escape: Geschenk, Abschluss, Korrektur', () => {
  function opened(received: string[] = []): EscapeMission {
    let m = mission({}, 13);
    m = finish(m, 0, T0 + 1000);
    m = finish(m, 1, T0 + 2000);
    m = finish(m, 2, T0 + 3000);
    return openWithHelp(m, received, T0 + 4000);
  }

  it('genau ein Geschenk pro Mission, gespeichert beim Öffnen; erneutes Öffnen vergibt kein zweites', () => {
    const m = opened();
    expect(m.gift && giftsById[m.gift.id]).toBeTruthy();
    expect(needsCelebration(m)).toBe(true);
    const celebrated = markCelebrated(m);
    expect(needsCelebration(celebrated)).toBe(false);
    expect(markCelebrated(celebrated)).toBe(celebrated); // keine Konfetti-Wiederholung
    const again = openWithHelp(celebrated, ['anderes'], T0 + 9000);
    expect(again.phase).toBe('opened');
    expect(again.gift).toEqual(celebrated.gift);
  });

  it('rechtzeitig und ohne Zeitdruck zeigen unterschiedliche ehrliche Texte, aber ein gleichwertiges Geschenk', () => {
    const timely = opened();
    expect(timely.outcome).toBe('onTime');
    expect(resultLine(timely)).toBe('Tresor geöffnet! Ihr habt alle drei Schlüssel rechtzeitig gefunden.');
    let late = mission({ minutes: 10 }, 13);
    late = finish(late, 0, T0 + 1000);
    late = finish(late, 1, T0 + 2000);
    late = settle(late, T0 + 11 * MIN);
    late = continueFree(late, T0 + 12 * MIN);
    late = finish(late, 2, T0 + 13 * MIN);
    late = openWithHelp(late, [], T0 + 14 * MIN);
    expect(late.outcome).toBe('expired');
    expect(resultLine(late)).toBe('Tresor geöffnet! Gemeinsam habt ihr das Waldgeheimnis entdeckt.');
    expect(resultLine(late)).not.toMatch(/rechtzeitig/);
    expect(late.gift && giftsById[late.gift.id]).toBeTruthy();
    expect(Object.keys(late.gift!).sort()).toEqual(Object.keys(timely.gift!).sort());
  });

  it('bereits gelesene Geschenke werden bevorzugt vermieden (gemeinsamer Geschenkspeicher)', () => {
    const first = opened().gift!.id;
    const second = opened([first]).gift!.id;
    expect(second).not.toBe(first);
  });

  it('Korrektur nach der Öffnung: Das Geschenk bleibt lesbar und es gibt kein zweites; keine falsche Vollständigkeit', () => {
    const m = markCelebrated(opened());
    const back = undoFound(m, m.keys[2].uid, T0 + 20_000);
    expect(back.phase).not.toBe('opened');
    expect(back.keys.length).toBe(2);
    expect(back.gift).toEqual(m.gift);
    const done = finish(back, 4, T0 + 21_000);
    expect(done.phase).toBe('combination');
    const reopened = openWithHelp(done, ['x'], T0 + 22_000);
    expect(reopened.gift).toEqual(m.gift);
    expect(needsCelebration(reopened)).toBe(false);
  });

  it('vorzeitiges Beenden ist ein ehrlicher Teilabschluss ohne Geschenk', () => {
    let m = mission();
    m = finish(m, 0, T0 + 1000);
    const e = endEarly(m, T0 + 2000);
    expect(e.phase).toBe('ended');
    expect(e.gift).toBeUndefined();
    expect(keyTasks(e).length).toBe(1);
    expect(openWithHelp(e, [], T0).phase).toBe('ended');
  });
});

describe('Spielmodus und Einstellungen', () => {
  it('Standard ist „Waldschätze suchen“ mit 15 Minuten; unbekannte Werte fallen darauf zurück', () => {
    expect(sanitizeSettings(undefined).mode).toBe('treasure');
    expect(sanitizeSettings(undefined).escapeMinutes).toBe(15);
    expect(sanitizeSettings({ mode: 'kaputt', escapeMinutes: 7 }).mode).toBe('treasure');
    expect(sanitizeSettings({ mode: 'kaputt', escapeMinutes: 7 }).escapeMinutes).toBe(15);
    expect(sanitizeSettings({ mode: 'escape', escapeMinutes: 20 })).toMatchObject({ mode: 'escape', escapeMinutes: 20 });
    expect(sanitizeSettings({ mode: 'detective' }).mode).toBe('detective');
  });

  it('ältere gespeicherte Einstellungen ohne Modus bleiben gültig (nichts geht verloren)', () => {
    const old = { age: '4-6', giftsReceived: ['eichelhaeher'], motionOff: true, taskCount: 3 };
    const s = sanitizeSettings(old);
    expect(s.age).toBe('4-6');
    expect(s.giftsReceived).toEqual(['eichelhaeher']);
    expect(s.motionOff).toBe(true);
    expect(s.mode).toBe('treasure');
  });

  it('die Waldschätze-Runde bleibt unverändert: Wald Escape berührt weder Regeln noch Speicher der Runde', () => {
    const r = generateRound({ age: '7-10', environment: 'forest', season: 'autumn', seasonSource: 'auto', context: [], boost: false, count: 5, seed: 3, rng: seededRng(3) }).round!;
    expect(r.tasks.length).toBe(5);
    // Drei erfüllte Karten beenden eine normale Fünferrunde NICHT (anders als bei Wald Escape)
    let x = r;
    for (const t of r.tasks.slice(0, 3)) for (let i = 0; i < 6; i++) x = addFoundRound(x, t.uid);
    expect(isFullyFound(x)).toBe(false);
  });
});

describe('Wald Escape: Speicherung', () => {
  it('speichert und lädt eine laufende Mission verlustfrei (Karten, Symbole, Texte, Bildverweise)', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    let m = mission({}, 17);
    m = finish(m, 0, T0 + 1000);
    expect(p.save(m)).toBe('ok');
    const loaded = p.load(T0 + 2000).mission!;
    expect(loaded.tasks.map((t) => [t.uid, t.symbol, t.prompt, t.found, t.status])).toEqual(m.tasks.map((t) => [t.uid, t.symbol, t.prompt, t.found, t.status]));
    expect(loaded.keys).toEqual(m.keys);
    expect(loaded.seed).toBe(m.seed);
  });

  it('eine vor dem Update gespeicherte Mission zeigt die aktuellen Bildangaben, behält aber Fortschritt und Schlüssel', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    let m = mission({}, 19);
    m = finish(m, 1, T0 + 1000);
    const old = JSON.parse(JSON.stringify(m)) as EscapeMission;
    old.tasks[1].image = { ...old.tasks[1].image, alt: 'Alte Beschreibung', illustrationKey: old.tasks[1].image.illustrationKey };
    store.setItem(ESCAPE_KEY, JSON.stringify({ v: 1, savedAt: 1, mission: old }));
    const loaded = p.load(T0 + 2000).mission!;
    expect(loaded.tasks[1].image.alt).toBe(m.tasks[1].image.alt);
    expect(loaded.keys.length).toBe(1);
  });

  it('beschädigter, fremder oder gesperrter Speicher führt nie zum Absturz', () => {
    const store = memoryStore();
    store.setItem(ESCAPE_KEY, '{kaputt');
    expect(createEscapePersistence(store).load(T0).status).toBe('corrupt');
    expect(store.getItem(ESCAPE_KEY)).toBeNull();
    store.setItem(ESCAPE_KEY, JSON.stringify({ v: 1, mission: { mode: 'escape', tasks: 'nein' } }));
    expect(createEscapePersistence(store).load(T0).status).toBe('corrupt');
    const none = createEscapePersistence(null);
    expect(none.load(T0).status).toBe('blocked');
    expect(none.save(mission())).toBe('blocked');
    const full = createEscapePersistence({ getItem: () => null, setItem: () => { throw new Error('voll'); }, removeItem: () => undefined });
    expect(full.save(mission())).toBe('failed');
    expect(sanitizeEscape(null)).toBeNull();
    expect(sanitizeEscape({ mode: 'escape', v: 2 })).toBeNull();
  });

  it('ein veralteter Tab überschreibt nie einen jüngeren Stand', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    const m1 = mission({}, 23);
    expect(p.save(m1)).toBe('ok');
    const tabB = { ...finish(m1, 0, T0 + 1000), rev: m1.rev + 1 };
    expect(p.save(tabB)).toBe('ok');
    // Tab A (noch auf rev 1) möchte beim Schließen speichern
    expect(p.save(m1)).toBe('stale');
    expect(p.load(T0 + 5000).mission!.keys.length).toBe(1);
    // eine später begonnene neue Mission ersetzt die alte, eine ältere nicht die neuere
    const newer = mission({}, 24, T0 + 60_000);
    expect(p.save(newer)).toBe('ok');
    expect(p.save(tabB)).toBe('stale');
    // Löschen ist immer möglich
    expect(p.save(null)).toBe('ok');
    expect(p.load(T0).status).toBe('empty');
  });

  it('die Escape-Mission und die Waldschätze-Runde sind getrennte Spielstände', () => {
    expect(ESCAPE_KEY).not.toBe('entdeckerzeit:v1:round');
    expect(ESCAPE_KEY).toBe('entdeckerzeit:v1:escape');
  });
});

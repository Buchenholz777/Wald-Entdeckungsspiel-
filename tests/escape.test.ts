import { describe, expect, it } from 'vitest';
import {
  ESCAPE_KEY,
  ESCAPE_PHASES,
  ESCAPE_TEMPLATE_IDS,
  SIZES,
  addFound,
  addPause,
  canPlayEscape,
  checkAttempt,
  clearSlot,
  completedTasks,
  continueFree,
  countSolutions,
  createEscape,
  createEscapePersistence,
  defaultSize,
  describeClue,
  describePool,
  endEarly,
  escapePool,
  formatClock,
  giveHint,
  invariantsHold,
  isLegacy,
  isRunning,
  keyGroups,
  makeClues,
  markCelebrated,
  minutesNote,
  missingText,
  needsCelebration,
  openVault,
  openWithHelp,
  permutations,
  placeAt,
  placeSymbol,
  poolGroups,
  poolNotice,
  progressOf,
  progressText,
  remainingAt,
  removePause,
  requiredOf,
  resultLine,
  ruleText,
  sanitizeEscape,
  settle,
  swapTask,
  timeupText,
  toEscapeMinutes,
  undoFound,
  type EscapeMission,
  type EscapeParams,
  type SymbolId,
} from '../src/domain/escape';
import { seededRng } from '../src/domain/rng';
import { generateRound } from '../src/domain/generator';
import { isFullyFound } from '../src/domain/gift';
import { addFound as addFoundRound } from '../src/domain/round';
import { DEFAULT_SETTINGS, sanitizeSettings } from '../src/domain/storage';
import type { KeyValueStore } from '../src/domain/storage';
import { conceptGroup, templatesById } from '../src/catalog/templates';
import { giftsById } from '../src/catalog/gifts';
import type { ContextTag, Season } from '../src/domain/types';

const T0 = 1_700_000_000_000;
const MIN = 60_000;
const ALL_CTX: ContextTag[] = ['conifers', 'beech', 'oak', 'maple', 'hazel', 'chestnut', 'fern', 'hornbeam', 'linden', 'alder'];
const P = (over: Partial<EscapeParams> = {}): EscapeParams => ({ age: '7-10', season: 'autumn', seasonSource: 'auto', context: [], minutes: 20, tasksPerKey: 2, ...over });

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

/** Erfüllt die ersten `n` Karten nacheinander im Abstand von einer Sekunde. */
function finishN(m: EscapeMission, n: number, start = T0 + 1000): EscapeMission {
  let x = m;
  for (let i = 0; i < n; i++) x = finish(x, i, start + i * 1000);
  return x;
}

/** Eine Mission (7–10), die mindestens eine Zählaufgabe mit Zielmenge über 1 enthält. */
function withCountTask(): EscapeMission {
  for (let seed = 1; seed < 200; seed++) {
    const m = mission({ age: '7-10' }, seed);
    if (m.tasks.some((t) => t.target > 1)) return m;
  }
  throw new Error('keine Zählaufgabe gefunden');
}

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('Wald Escape: Altersfreigabe, Größen und Kandidaten', () => {
  it('ab 4 Jahren; 2–3 Jahre starten keine Zeitmission (auch das abgebildete Kleinkind ändert das nicht)', () => {
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
      expect(t.family, id).not.toBe('animals');
      // Spuren und Pilze nur als ausdrücklich seltene Alternativen (Nussschale, abgenagter Zapfen, Baumpilz am Holz), nie als Pflicht
      if (['tracks', 'fungi'].includes(t.family)) expect(['gnawed-nut', 'gnawed-cone', 'bracket-fungus'], id).toContain(id);
      expect(t.completionMode, id).not.toBe('compare');
    }
  });

  it('die neuen Motive sind vollständig: Vorlage, Kontextbindung und Quelle', () => {
    for (const id of ['y-twig', 'leaf-vein-net', 'hornbeam-fruit', 'linden-fruit', 'alder-cone']) expect(ESCAPE_TEMPLATE_IDS).toContain(id);
    expect(templatesById['hornbeam-fruit'].requiredContext).toEqual(['hornbeam']);
    expect(templatesById['linden-fruit'].requiredContext).toEqual(['linden']);
    expect(templatesById['alder-cone'].requiredContext).toEqual(['alder']);
    expect(templatesById['y-twig'].requiredContext).toEqual([]);
  });

  it('Größen: klein 2 je Schlüssel = 6 Aufgaben (8 Karten angestrebt), groß 3 je Schlüssel = 9 (12 Karten); Standard nach Alter; immer drei Schlüssel', () => {
    expect(SIZES.small).toMatchObject({ tasksPerKey: 2, required: 6, offered: 8, defaultMinutes: 20 });
    expect(SIZES.large).toMatchObject({ tasksPerKey: 3, required: 9, offered: 12, defaultMinutes: 30 });
    expect(defaultSize('4-6')).toBe('small');
    expect(defaultSize('7-10')).toBe('large');
    expect(ruleText(2)).toBe('2 Entdeckungen pro Schlüssel · 3 Schlüssel · insgesamt 6 Aufgaben');
    expect(ruleText(3)).toBe('3 Entdeckungen pro Schlüssel · 3 Schlüssel · insgesamt 9 Aufgaben');
  });

  it('die Mission bietet im Herbst 8 bzw. 12 Karten mit lauter verschiedenen Konzeptgruppen, Alters-, Saison- und Kontextfilter (feste Seeds)', () => {
    for (const age of ['4-6', '7-10'] as const) {
      for (const season of ['spring', 'autumn', 'winter'] as Season[]) {
        for (const tasksPerKey of [2, 3] as const) {
          for (let seed = 1; seed <= 12; seed++) {
            const m = mission({ age, season, tasksPerKey }, seed);
            const need = tasksPerKey * 3;
            expect(m.tasks.length, `${age}/${season}/${tasksPerKey}/${seed}`).toBeGreaterThanOrEqual(need);
            expect(m.tasks.length).toBeLessThanOrEqual(tasksPerKey === 3 ? 12 : 8);
            expect(new Set(m.tasks.map((t) => conceptGroup(t.conceptId))).size).toBe(m.tasks.length);
            expect(m.keySymbols.length).toBe(3);
            expect(new Set(m.keySymbols).size).toBe(3);
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
    }
  });

  it('dieselbe Auswahl mit demselben Seed ergibt dieselbe Mission (nicht beim Rendern neu gelost)', () => {
    const a = mission({}, 11);
    const b = mission({}, 11);
    expect(a.tasks.map((t) => [t.templateId, t.target])).toEqual(b.tasks.map((t) => [t.templateId, t.target]));
    expect(a.keySymbols).toEqual(b.keySymbols);
  });

  it('bestätigte Baumarten erweitern den Pool', () => {
    const plain = describePool(P());
    const rich = describePool(P({ context: ALL_CTX }));
    expect(rich.groups).toBeGreaterThan(plain.groups);
  });

  it('ehrliche Kartenzahlen: eine große Mission mit weniger als neun Konzepten wird nie still verkleinert', () => {
    // Sommer ohne Baumangaben: acht Konzepte. Die kleine Mission geht, die große nicht.
    const smallSummer = describePool(P({ season: 'summer', tasksPerKey: 2 }));
    expect(smallSummer.cards).toBe(8);
    expect(poolNotice(smallSummer, 8)).toBeNull();
    const largeSummer = describePool(P({ season: 'summer', tasksPerKey: 3 }));
    expect(largeSummer.cards).toBe(0);
    expect(largeSummer.groups).toBeLessThan(9);
    expect(createEscape(P({ season: 'summer', tasksPerKey: 3 }), 1, T0).ok).toBe(false);
    expect(poolNotice(largeSummer, 12)).toMatch(/braucht ihr 9/);
    // Mit bestätigten Baumarten wird sie möglich.
    expect(createEscape(P({ season: 'summer', tasksPerKey: 3, context: ALL_CTX }), 1, T0).ok).toBe(true);
    // Genau neun Konzepte: alle neun werden gebraucht und das wird gesagt.
    const exact = describePool(P({ season: 'spring', tasksPerKey: 3 }));
    expect(exact.cards).toBe(9);
    expect(poolNotice(exact, 12)).toBe('Heute stehen genau 9 Aufgaben zur Wahl. Ihr braucht alle 9.');
    const m = mission({ season: 'spring', tasksPerKey: 3 }, 2);
    expect(m.tasks.length).toBe(9);
    expect(requiredOf(m)).toBe(9);
    // Zwischen neun und zwölf: ehrlich weniger Karten
    expect(poolNotice({ cards: 11, groups: 11, required: 9 }, 12)).toBe('Heute stehen 11 Aufgaben zur Wahl. Ihr braucht 9.');
  });

  it('mit einem leeren Pool entsteht keine Mission statt einer geschwächten', () => {
    expect(poolGroups([])).toBe(0);
    expect(escapePool(P({ season: 'summer' })).length).toBeGreaterThan(0);
  });
});

describe('Wald Escape: Fortschrittsrechnung (eine zentrale Funktion)', () => {
  const at = (tpk: 2 | 3, done: number) => progressOf({ tasksPerKey: tpk, completed: Array.from({ length: done }, (_, i) => ({ uid: `u${i}`, templateId: 't', at: i })) });

  it('kleine Mission (6 Aufgaben): Fragmente und Schlüssel bei jedem Stand', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((n) => [at(2, n).keys, at(2, n).fragments])).toEqual([[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0]]);
    expect(at(2, 6).complete).toBe(true);
    expect(at(2, 5).complete).toBe(false);
    expect(at(2, 5)).toMatchObject({ done: 5, required: 6, missing: 1 });
  });

  it('große Mission (9 Aufgaben): Fragmente und Schlüssel bei jedem Stand', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [at(3, n).keys, at(3, n).fragments])).toEqual([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 0]].slice(0, 9).concat([[3, 0]]));
    expect(at(3, 8)).toMatchObject({ keys: 2, fragments: 2, missing: 1, complete: false });
    expect(at(3, 9).complete).toBe(true);
  });

  it('Texte: „4 von 6 Aufgaben · 2 von 3 Schlüsseln“ und „fehlt noch 1 Entdeckung“', () => {
    expect(progressText(at(2, 4))).toBe('4 von 6 Aufgaben · 2 von 3 Schlüsseln');
    expect(missingText(at(2, 5))).toBe('Für den nächsten Schlüssel fehlt noch 1 Entdeckung.');
    expect(missingText(at(3, 3))).toBe('Für den nächsten Schlüssel fehlen noch 3 Entdeckungen.');
    expect(missingText(at(2, 6))).toMatch(/Alle drei Schlüssel/);
  });

  it('Zeitablauf-Text nennt echte Zahlen und beschreibt Teilfortschritt ohne zu übertreiben', () => {
    expect(timeupText(at(2, 5))).toBe('Ihr habt 5 von 6 Aufgaben und 2 von 3 Schlüsseln geschafft. Der nächste Schlüssel ist schon halb fertig!');
    expect(timeupText(at(3, 7))).toBe('Ihr habt 7 von 9 Aufgaben und 2 von 3 Schlüsseln geschafft. Der nächste Schlüssel ist schon zu einem Drittel fertig!');
    expect(timeupText(at(3, 8))).toMatch(/zu zwei Dritteln fertig/);
    expect(timeupText(at(2, 4))).toBe('Ihr habt 4 von 6 Aufgaben und 2 von 3 Schlüsseln geschafft. Der nächste Schlüssel wartet noch auf seine erste Entdeckung.');
  });

  it('keyGroups: drei Plätze, Fragmente in der Reihenfolge des Abschlusses, Schlüssel erst bei voller Gruppe', () => {
    const m = finishN(mission(), 3);
    const g = keyGroups(m);
    expect(g.length).toBe(3);
    expect(g.map((x) => x.fragments.length)).toEqual([2, 1, 0]);
    expect(g.map((x) => x.complete)).toEqual([true, false, false]);
    expect(g[0].fragments.map((f) => f.uid)).toEqual([m.tasks[0].uid, m.tasks[1].uid]);
    expect(g.map((x) => x.symbol)).toEqual(m.keySymbols);
  });
});

describe('Wald Escape: Uhr mit eigener Zeit', () => {
  it('beginnt erst beim Erzeugen; Zeitwahl 10/15/20/30 mit Standard 20 und ehrlicher Kennzeichnung', () => {
    for (const minutes of [10, 15, 20, 30] as const) {
      const m = mission({ minutes });
      expect(m.clock.durationMs).toBe(minutes * MIN);
      expect(remainingAt(m, T0)).toBe(minutes * MIN);
      expect(remainingAt(m, T0 + 5 * MIN)).toBe(minutes * MIN - 5 * MIN);
    }
    expect(toEscapeMinutes(null)).toBe(20);
    expect(toEscapeMinutes(7)).toBe(20);
    expect(toEscapeMinutes(30)).toBe(30);
    expect(minutesNote(10, 6)).toBe('Bewusst kurz, für 6 Aufgaben sehr knapp');
    expect(minutesNote(10, 9)).toBe('Bewusst kurz, für 9 Aufgaben sehr knapp');
    expect(minutesNote(15, 6)).toBe('Zügig');
    expect(minutesNote(20, 6)).toBe('Empfohlen für 6 Aufgaben');
    expect(minutesNote(30, 9)).toBe('Empfohlen für 9 Aufgaben');
  });

  it('rechnet aus Zeitpunkten: ein verzögerter oder fehlender Tick ändert nichts', () => {
    const m = mission({ minutes: 15 });
    expect(remainingAt(m, T0 + 7 * MIN)).toBe(8 * MIN);
    let x = m;
    for (let s = 1; s <= 420; s++) x = settle(x, T0 + s * 1000);
    expect(remainingAt(x, T0 + 420_000)).toBe(8 * MIN);
  });

  it('Pause hält die Uhr an und Weitersuchen nimmt dieselbe Restzeit wieder auf', () => {
    let m = mission({ minutes: 15 });
    m = addPause(m, 'manual', T0 + 2 * MIN);
    expect(isRunning(m)).toBe(false);
    expect(remainingAt(m, T0 + 60 * MIN)).toBe(13 * MIN);
    m = removePause(m, 'manual', T0 + 60 * MIN);
    expect(isRunning(m)).toBe(true);
    expect(remainingAt(m, T0 + 61 * MIN)).toBe(12 * MIN);
  });

  it('überlagerte Pausengründe: Schließen eines Dialogs startet die Uhr nicht, solange noch ein Grund besteht', () => {
    let m = mission({ minutes: 15 });
    m = addPause(m, 'manual', T0 + MIN);
    m = addPause(m, 'dialog', T0 + MIN);
    m = removePause(m, 'dialog', T0 + 5 * MIN);
    expect(isRunning(m)).toBe(false);
    expect(remainingAt(m, T0 + 30 * MIN)).toBe(14 * MIN);
    m = addPause(m, 'menu', T0 + 30 * MIN);
    m = removePause(m, 'manual', T0 + 30 * MIN);
    expect(isRunning(m)).toBe(false);
    m = removePause(m, 'menu', T0 + 31 * MIN);
    expect(isRunning(m)).toBe(true);
    expect(remainingAt(m, T0 + 31 * MIN)).toBe(14 * MIN);
  });

  it('doppelte Pausenereignisse und schnelle Wechsel erzeugen weder Zeit noch Fehler', () => {
    let m = mission({ minutes: 15 });
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
    expect(remainingAt(m, T0 - 5 * MIN)).toBe(10 * MIN);
    const s = settle(m, T0 - 5 * MIN);
    expect(remainingAt(s, T0 - 5 * MIN + 1000)).toBe(10 * MIN - 1000);
  });

  it('Hauptmenü (Pause) und Reload: laufende Suche rechnet die echte Zeit ab, eine Pause bleibt eine Pause', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    let m = mission({ minutes: 15 });
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
    p.save(addPause(mission({ minutes: 15 }), 'dialog', T0 + MIN));
    const m = p.load(T0 + 20 * MIN).mission!;
    expect(m.pauses).toEqual(['manual']);
    expect(remainingAt(m, T0 + 20 * MIN)).toBe(14 * MIN);
  });
});

describe('Wald Escape: Fragmente, Schlüssel und Zeitergebnis', () => {
  it('kleine Mission: jede erledigte Karte ist ein Fragment; erst die 6. beendet die Suche; drei Funde lösen nichts aus', () => {
    const m = mission();
    let x = m;
    const seen: [number, number, string][] = [];
    for (let i = 0; i < 6; i++) {
      x = finish(x, i, T0 + 10_000 + i * 1000);
      const p = progressOf(x);
      seen.push([p.keys, p.fragments, x.phase]);
    }
    expect(seen).toEqual([
      [0, 1, 'searching'],
      [1, 0, 'searching'],
      [1, 1, 'searching'],
      [2, 0, 'searching'],
      [2, 1, 'searching'],
      [3, 0, 'combination'],
    ]);
    expect(x.outcome).toBe('onTime');
    expect(invariantsHold(x)).toBe(true);
    // Die alte Regel „3 Funde = 3 Schlüssel“ greift nicht: nach 3 Funden läuft die Sanduhr weiter.
    const three = finishN(m, 3);
    expect(three.phase).toBe('searching');
    expect(isRunning(three)).toBe(true);
    // Karten dürfen in beliebiger Reihenfolge erledigt werden; die Reihenfolge der Abschlüsse bestimmt die Gruppen.
    const mixed = finish(finish(m, 5, T0 + 1000), 2, T0 + 2000);
    expect(keyGroups(mixed)[0].fragments.map((f) => f.uid)).toEqual([m.tasks[5].uid, m.tasks[2].uid]);
  });

  it('große Mission: neun Aufgaben, drei je Schlüssel; erst die 9. beendet die Suche', () => {
    const m = mission({ tasksPerKey: 3 });
    let x = m;
    for (let i = 0; i < 8; i++) {
      x = finish(x, i, T0 + 10_000 + i * 1000);
      expect(x.phase).toBe('searching');
    }
    expect(progressOf(x)).toMatchObject({ done: 8, keys: 2, fragments: 2, missing: 1 });
    x = finish(x, 8, T0 + 30_000);
    expect(x.phase).toBe('combination');
    expect(progressOf(x).keys).toBe(3);
    expect(invariantsHold(x)).toBe(true);
  });

  it('Doppeltippen auf eine fertige Karte gibt kein weiteres Fragment', () => {
    let m = mission();
    m = finish(m, 0, T0 + 1000);
    const again = finish(m, 0, T0 + 2000);
    expect(progressOf(again).done).toBe(1);
    expect(again.tasks).toEqual(m.tasks);
    expect(again.completed).toEqual(m.completed);
  });

  it('Zählaufgabe oder Vergleich ist erst nach vollständiger Erledigung genau ein Fragment', () => {
    const m = withCountTask();
    const i = m.tasks.findIndex((t) => t.target > 1);
    expect(i).toBeGreaterThanOrEqual(0);
    let x = addFound(m, m.tasks[i].uid, T0);
    expect(x.tasks[i].found).toBe(1);
    expect(progressOf(x).done).toBe(0); // Teilfunde zählen kein Fragment
    x = finish(x, i, T0);
    expect(x.tasks[i].found).toBe(m.tasks[i].target);
    expect(progressOf(x).done).toBe(1);
  });

  it('die sechste Aufgabe knapp vor null ist rechtzeitig und friert die echte Restzeit ein', () => {
    let m = mission({ minutes: 10 });
    m = finishN(m, 5);
    m = finish(m, 5, T0 + 10 * MIN - 1);
    expect(m.phase).toBe('combination');
    expect(m.outcome).toBe('onTime');
    expect(m.clock.resumedAt).toBeNull();
    expect(remainingAt(m, T0 + 50 * MIN)).toBe(1);
  });

  it('die neunte Aufgabe bei oder nach null ist nicht rechtzeitig; die Aufgabe selbst zählt aber', () => {
    for (const at of [T0 + 10 * MIN, T0 + 10 * MIN + 5000]) {
      let m = mission({ minutes: 10, tasksPerKey: 3 });
      m = finishN(m, 8);
      m = finish(m, 8, at);
      expect(m.outcome).toBe('expired');
      expect(m.phase).toBe('combination');
      expect(progressOf(m).keys).toBe(3);
    }
  });

  it('die fünfte Aufgabe rechtzeitig, die sechste zu spät: das Ergebnis richtet sich nach der letzten', () => {
    let m = mission({ minutes: 10 });
    m = finishN(m, 5, T0 + 1000);
    m = finish(m, 5, T0 + 10 * MIN + 1);
    expect(m.outcome).toBe('expired');
  });

  it('die Kombinationsphase verbraucht keine Suchzeit: lange Beschäftigung ändert das Ergebnis nicht', () => {
    let m = mission({ minutes: 10 });
    m = finishN(m, 6);
    const later = settle(m, T0 + 600 * MIN);
    expect(later.phase).toBe('combination');
    expect(later.outcome).toBe('onTime');
  });

  it('Zeit abgelaufen: Fortschritt bleibt, „Ohne Zeitdruck weitersuchen“ gibt keine neue Zeit und nie das Rechtzeitig-Ergebnis', () => {
    let m = mission({ minutes: 10 });
    m = finishN(m, 5);
    m = settle(m, T0 + 11 * MIN);
    expect(m.phase).toBe('timeup');
    expect(progressOf(m)).toMatchObject({ done: 5, keys: 2, fragments: 1 });
    m = continueFree(m, T0 + 12 * MIN);
    expect(m.phase).toBe('free');
    expect(isRunning(m)).toBe(false);
    expect(remainingAt(m, T0 + 99 * MIN)).toBe(0);
    m = finish(m, 5, T0 + 20 * MIN);
    expect(m.phase).toBe('combination');
    expect(m.outcome).toBe('expired');
  });

  it('keine unmöglichen Zustände: Phasen und Ergebnis passen zusammen (viele zufällige Verläufe, beide Größen)', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rng = seededRng(seed);
      let m = mission({ minutes: 10, tasksPerKey: seed % 2 ? 2 : 3 }, seed);
      let t = T0;
      for (let step = 0; step < 60 && m.phase !== 'opened'; step++) {
        t += Math.floor(rng() * 90_000);
        const r = rng();
        const i = Math.floor(rng() * m.tasks.length);
        if (r < 0.45) m = addFound(m, m.tasks[i].uid, t);
        else if (r < 0.55) m = undoFound(m, m.tasks[i].uid, t);
        else if (r < 0.65) m = addPause(m, 'manual', t);
        else if (r < 0.72) m = removePause(m, 'manual', t);
        else if (r < 0.77) m = continueFree(m, t);
        else if (r < 0.82) m = swapTask(m, m.tasks[i].uid, t) ?? m;
        else if (m.phase === 'combination') m = openWithHelp(m, [], t);
        else m = settle(m, t);
        expect(invariantsHold(m), `seed ${seed} step ${step}`).toBe(true);
        expect(ESCAPE_PHASES).toContain(m.phase);
        expect(m.clock.remainingMs).toBeGreaterThanOrEqual(0);
        expect(m.clock.remainingMs).toBeLessThanOrEqual(m.clock.durationMs);
        if (m.phase === 'timeup') expect(m.outcome).toBe('expired');
        if (m.phase === 'opened') expect(progressOf(m).complete).toBe(true);
      }
    }
  });
});

describe('Wald Escape: Austausch und Rückgängig', () => {
  it('Austausch ersetzt nur die offene Karte, schließt das Konzept aus und lässt Fortschritt unberührt', () => {
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
    expect(swapped.completed).toEqual(m.completed);
    if (partial > 0) expect(swapped.tasks[partial].found).toBe(1);
    expect(new Set(swapped.tasks.map((t) => conceptGroup(t.conceptId))).size).toBe(swapped.tasks.length);
    expect(swapTask(m, m.tasks[0].uid, T0 + 4000)).toBeNull(); // eine fertige Karte lässt sich nicht tauschen
  });

  it('ohne Alternative bleibt alles unverändert und das Ziel (drei Schlüssel, 9 Aufgaben) bleibt erreichbar', () => {
    const m = mission({ season: 'spring', tasksPerKey: 3 }, 2); // genau neun Konzepte
    expect(m.tasks.length).toBe(9);
    expect(swapTask(m, m.tasks[0].uid, T0)).toBeNull();
    expect(requiredOf(m)).toBe(9);
  });

  it('Rückgängig leitet Fragmente und Schlüssel neu ab: 6 → 5 Aufgaben ergibt 2 Schlüssel und 1 Fragment', () => {
    const m = finishN(mission(), 6);
    expect(m.phase).toBe('combination');
    const back = undoFound(m, m.completed[5].uid, T0 + 30 * MIN);
    expect(back.phase).toBe('searching');
    expect(progressOf(back)).toMatchObject({ done: 5, keys: 2, fragments: 1, complete: false });
    expect(back.solution).toBeNull();
    expect(back.input).toEqual([null, null, null]);
    expect(isRunning(back)).toBe(false); // wartet auf „Weitersuchen“
    // Eine frühere Karte zurücknehmen schiebt die Gruppen neu: 5 → 4 Aufgaben = 2 Schlüssel, 0 Fragmente
    const earlier = undoFound(back, back.completed[0].uid, T0 + 31 * MIN);
    expect(progressOf(earlier)).toMatchObject({ done: 4, keys: 2, fragments: 0 });
  });

  it('Rückgängig bei der großen Mission: 9 → 8 Aufgaben ergibt 2 Schlüssel und 2 Fragmente', () => {
    const m = finishN(mission({ tasksPerKey: 3 }), 9);
    const back = undoFound(m, m.completed[8].uid, T0 + 30 * MIN);
    expect(progressOf(back)).toMatchObject({ done: 8, keys: 2, fragments: 2, missing: 1 });
    expect(back.phase).toBe('searching');
  });

  it('ein zurückgenommener Teilfund einer Zählaufgabe verändert kein Fragment', () => {
    let m = withCountTask();
    const i = m.tasks.findIndex((t) => t.target > 1);
    m = addFound(m, m.tasks[i].uid, T0);
    const u = undoFound(m, m.tasks[i].uid, T0 + 1000);
    expect(u.tasks[i].found).toBe(0);
    expect(progressOf(u).done).toBe(0);
  });

  it('Rückgängig nach der sechsten Aufgabe verwendet höchstens die eingefrorene Restzeit', () => {
    let m = mission({ minutes: 10 });
    m = finishN(m, 5);
    m = finish(m, 5, T0 + 4 * MIN);
    expect(m.outcome).toBe('onTime');
    const back = undoFound(m, m.tasks[5].uid, T0 + 30 * MIN);
    expect(back.phase).toBe('searching');
    expect(isRunning(back)).toBe(false);
    expect(remainingAt(back, T0 + 99 * MIN)).toBe(10 * MIN - 4 * MIN);
    const go = removePause(back, 'manual', T0 + 31 * MIN);
    expect(remainingAt(go, T0 + 31 * MIN)).toBe(6 * MIN);
  });

  it('eine eingetretene Zeitüberschreitung wird durch Rückgängig nie wieder rechtzeitig', () => {
    let m = mission({ minutes: 10 });
    m = finishN(m, 5);
    m = finish(m, 5, T0 + 12 * MIN);
    expect(m.outcome).toBe('expired');
    const back = undoFound(m, m.tasks[5].uid, T0 + 13 * MIN);
    expect(back.phase).toBe('free');
    expect(isRunning(back)).toBe(false);
    const again = finish(back, 5, T0 + 14 * MIN);
    expect(again.outcome).toBe('expired');
  });
});

describe('Wald Escape: Symbolrätsel', () => {
  function atCombination(age: '4-6' | '7-10', seed: number): EscapeMission {
    return finishN(mission({ age }, seed), 6);
  }

  it('die Lösung besteht genau aus den drei festen Schlüsselsymbolen der Mission', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const m = atCombination(seed % 2 ? '4-6' : '7-10', seed);
      expect([...m.solution!].sort()).toEqual([...m.keySymbols].sort());
    }
  });

  it('die Schlüsselsymbole stehen bei Missionsbeginn fest und ändern sich weder durch Fortschritt noch durch Rückgängig', () => {
    const m = mission({}, 9);
    const done = finishN(m, 6);
    expect(done.keySymbols).toEqual(m.keySymbols);
    expect(undoFound(done, done.completed[5].uid, T0 + 10 * MIN).keySymbols).toEqual(m.keySymbols);
  });

  it('7–10: zwei Hinweise lassen genau eine der sechs Reihenfolgen zu, nennen nur vorhandene Symbole', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 150; seed++) {
      const m = atCombination('7-10', seed);
      const owned = m.keySymbols;
      expect(m.clues!.length).toBe(2);
      expect(countSolutions(owned, m.clues!), `seed ${seed}`).toBe(1);
      for (const c of m.clues!) {
        expect(owned).toContain(c.a);
        if (c.b) expect(owned).toContain(c.b);
        seen.add(describeClue(c));
      }
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

  it('Fehlversuch: ein konkreter Hinweis gegen die echte Lösung, mit richtigem Platz, ohne richtigen Platz und bei richtiger Folge', () => {
    const solution: SymbolId[] = ['drop', 'mushroom', 'cone'];
    // Beispiel aus dem Auftrag: Zapfen – Pilz – Tropfen
    const one = checkAttempt(solution, ['cone', 'mushroom', 'drop'], 'strip');
    expect(one.correct).toEqual([false, true, false]);
    expect(one.firstWrong).toBe(0);
    expect(one.message).toBe('Der Pilz in der Mitte stimmt schon. Schau auf das erste Zeichen.');
    // stimmt nur der dritte Platz: Hinweis nennt ihn und zeigt auf den ersten falschen
    expect(checkAttempt(solution, ['mushroom', 'drop', 'cone'], 'clues').message).toBe('Der Zapfen ganz rechts stimmt schon. Schau auf das erste Zeichen.');
    // kein Platz passt: erster Platz plus Vorlagestreifen (4–6) bzw. Hinweise (7–10)
    const none: (SymbolId | null)[] = ['mushroom', 'cone', 'drop'];
    expect(checkAttempt(solution, none, 'strip').message).toBe('Noch passt kein Platz. Schau auf den ersten Platz und den Vorlagestreifen.');
    expect(checkAttempt(solution, none, 'clues').message).toBe('Noch passt kein Platz. Schau auf den ersten Platz und die Hinweise.');
    expect(checkAttempt(solution, none, 'strip').correct).toEqual([false, false, false]);
    // richtige Folge: nichts zu sagen
    const ok = checkAttempt(solution, solution, 'strip');
    expect(ok).toMatchObject({ allRight: true, firstWrong: -1, message: '' });
  });

  it('der Hinweis verrät nie die ganze Lösung und gilt für jede mögliche falsche Folge', () => {
    const solution: SymbolId[] = ['sun', 'moon', 'leaf'];
    for (const p of permutations(solution)) {
      const r = checkAttempt(solution, p, 'strip');
      if (p.join() === solution.join()) {
        expect(r.allRight).toBe(true);
        continue;
      }
      expect(r.message.length).toBeGreaterThan(10);
      // genau ein Satz zum Stand und ein Satz zur nächsten Stelle; nie die komplette Reihenfolge
      expect(r.message.split(/(?<=[.!?])\s+/).length).toBe(2);
      expect(r.message).not.toContain('–');
      expect(r.correct.filter(Boolean).length).not.toBe(2);
    }
  });

  it('4–6: Streifen als Vorbild, keine Hinweise nötig; Eingabe wird nachgebaut', () => {
    const m = atCombination('4-6', 5);
    expect(m.clues).toBeNull();
    let x = m;
    for (const s of m.solution!) x = placeSymbol(x, s);
    expect(x.input).toEqual(m.solution);
    const res = openVault(x, [], T0 + 50_000);
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
    const foreign = (['leaf', 'cone', 'acorn', 'star', 'mushroom', 'sun', 'moon', 'drop'] as SymbolId[]).find((s) => !m.keySymbols.includes(s))!;
    expect(placeSymbol(m, foreign).input).toEqual([null, null, null]);
    expect(placeSymbol(placeSymbol(m, a), a).input).toEqual([a, null, null]);
    expect(openVault(placeSymbol(m, a), [], T0).ok).toBe(false);
  });

  it('Tipp und Hilfsauflösung führen immer weiter; vor der letzten Aufgabe öffnet nichts', () => {
    const m = atCombination('7-10', 21);
    expect(giveHint(giveHint(giveHint(m))).hints).toBe(2);
    const helped = openWithHelp(m, [], T0 + 90_000);
    expect(helped.phase).toBe('opened');
    expect(helped.helped).toBe(true);
    expect(helped.input).toEqual(m.solution);
    const early = finishN(mission(), 5);
    expect(openWithHelp(early, [], T0).phase).toBe('searching');
    expect(openVault(early, [], T0).ok).toBe(false);
  });
});

describe('Wald Escape: Geschenk, Abschluss, Korrektur', () => {
  function opened(received: string[] = []): EscapeMission {
    return openWithHelp(finishN(mission({}, 13), 6), received, T0 + 40_000);
  }

  it('genau ein Geschenk pro Mission, gespeichert beim Öffnen; erneutes Öffnen vergibt kein zweites', () => {
    const m = opened();
    expect(m.gift && giftsById[m.gift.id]).toBeTruthy();
    expect(needsCelebration(m)).toBe(true);
    const celebrated = markCelebrated(m);
    expect(needsCelebration(celebrated)).toBe(false);
    expect(markCelebrated(celebrated)).toBe(celebrated);
    const again = openWithHelp(celebrated, ['anderes'], T0 + 90_000);
    expect(again.phase).toBe('opened');
    expect(again.gift).toEqual(celebrated.gift);
  });

  it('rechtzeitig und ohne Zeitdruck zeigen unterschiedliche ehrliche Texte, aber ein gleichwertiges Geschenk', () => {
    const timely = opened();
    expect(timely.outcome).toBe('onTime');
    expect(resultLine(timely)).toBe('Tresor geöffnet! Ihr habt alle drei Schlüssel rechtzeitig gefunden.');
    let late = mission({ minutes: 10 }, 13);
    late = finishN(late, 5);
    late = settle(late, T0 + 11 * MIN);
    late = continueFree(late, T0 + 12 * MIN);
    late = finish(late, 5, T0 + 13 * MIN);
    late = openWithHelp(late, [], T0 + 14 * MIN);
    expect(late.outcome).toBe('expired');
    expect(resultLine(late)).toBe('Tresor geöffnet! Gemeinsam habt ihr das Waldgeheimnis entdeckt.');
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
    const back = undoFound(m, m.completed[5].uid, T0 + 120_000);
    expect(back.phase).not.toBe('opened');
    expect(progressOf(back)).toMatchObject({ done: 5, keys: 2, fragments: 1 });
    expect(back.gift).toEqual(m.gift);
    const done = finish(back, 5, T0 + 121_000);
    expect(done.phase).toBe('combination');
    const reopened = openWithHelp(done, ['x'], T0 + 122_000);
    expect(reopened.gift).toEqual(m.gift);
    expect(needsCelebration(reopened)).toBe(false);
  });

  it('vorzeitiges Beenden ist ein ehrlicher Teilabschluss ohne Geschenk', () => {
    const m = finishN(mission(), 1);
    const e = endEarly(m, T0 + 20_000);
    expect(e.phase).toBe('ended');
    expect(e.gift).toBeUndefined();
    expect(completedTasks(e).length).toBe(1);
    expect(openWithHelp(e, [], T0).phase).toBe('ended');
  });
});

describe('Frühere Missionen und Einstellungen', () => {
  function legacyRaw(): Record<string, unknown> {
    const m = mission({}, 3);
    const symbols = ['leaf', 'cone', 'acorn', 'star', 'mushroom', 'sun', 'moon', 'drop'];
    const tasks = m.tasks.map((t, i) => ({ ...t, symbol: symbols[i % symbols.length] }));
    for (const i of [0, 1]) tasks[i] = { ...tasks[i], found: tasks[i].target, status: 'done' as const };
    const { keySymbols: _k, completed: _c, tasksPerKey: _t, rules: _r, keyCount: _n, ...rest } = m;
    void [_k, _c, _t, _r, _n];
    return {
      ...rest,
      v: 1,
      tasks,
      requiredKeys: 3,
      keys: [0, 1].map((i) => ({ uid: tasks[i].uid, symbol: tasks[i].symbol, templateId: tasks[i].templateId, at: T0 + 1000 + i })),
    };
  }

  it('eine frühere Mission (ein Fund = ein Schlüssel) bleibt mit ihrer Regel fortsetzbar und wird nicht auf 6 oder 9 umgedeutet', () => {
    const m = sanitizeEscape(legacyRaw())!;
    expect(m).not.toBeNull();
    expect(isLegacy(m)).toBe(true);
    expect(m.rules).toBe(1);
    expect(m.tasksPerKey).toBe(1);
    expect(requiredOf(m)).toBe(3);
    expect(progressOf(m)).toMatchObject({ done: 2, keys: 2, required: 3 });
    expect(m.keySymbols.slice(0, 2)).toEqual(['leaf', 'cone']);
    expect(new Set(m.keySymbols).size).toBe(3);
    // der dritte Fund schließt sie wie früher ab
    const finished = finish(m, 2, T0 + 5000);
    expect(finished.phase).toBe('combination');
    expect(invariantsHold(finished)).toBe(true);
  });

  it('eine abgeschlossene frühere Mission bekommt nachträglich weder Geschenk noch Konfetti', () => {
    const raw = legacyRaw();
    const m = sanitizeEscape({ ...raw, phase: 'ended' })!;
    expect(m.phase).toBe('ended');
    expect(m.gift).toBeUndefined();
    expect(needsCelebration(m)).toBe(false);
  });

  it('Standard ist „Waldschätze suchen“; Größe und Zeit sind anfangs nicht gewählt (null), unbekannte Werte fallen darauf zurück', () => {
    expect(sanitizeSettings(undefined).mode).toBe('treasure');
    expect(sanitizeSettings(undefined).escapeMinutes).toBeNull();
    expect(sanitizeSettings(undefined).escapeSize).toBeNull();
    expect(DEFAULT_SETTINGS.escapeMinutes).toBeNull();
    expect(sanitizeSettings({ mode: 'kaputt', escapeSize: 'small', escapeMinutes: 7 })).toMatchObject({ mode: 'treasure', escapeMinutes: null, escapeSize: 'small' });
    expect(sanitizeSettings({ mode: 'escape', escapeSize: 'large', escapeMinutes: 30 })).toMatchObject({ mode: 'escape', escapeMinutes: 30, escapeSize: 'large' });
    // Walddetektive ist noch nicht spielbar: Eine gespeicherte Auswahl öffnet wieder Waldschätze suchen.
    expect(sanitizeSettings({ mode: 'detective' }).mode).toBe('treasure');
  });

  it('alter Standardwert 15 Minuten (ohne Größenangabe) war nie eine bewusste Wahl und gilt nicht weiter', () => {
    expect(sanitizeSettings({ mode: 'escape', escapeMinutes: 15 }).escapeMinutes).toBeNull();
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
    let x = r;
    for (const t of r.tasks.slice(0, 3)) for (let i = 0; i < 6; i++) x = addFoundRound(x, t.uid);
    expect(isFullyFound(x)).toBe(false);
  });
});

describe('Wald Escape: Speicherung', () => {
  it('speichert und lädt eine laufende Mission verlustfrei (Karten, Symbole, Fragmente, Texte, Bildverweise)', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    let m = mission({ minutes: 20 }, 17);
    m = finishN(m, 3);
    expect(p.save(m)).toBe('ok');
    const loaded = p.load(T0 + 20_000).mission!;
    expect(loaded.tasks.map((t) => [t.uid, t.prompt, t.found, t.status])).toEqual(m.tasks.map((t) => [t.uid, t.prompt, t.found, t.status]));
    expect(loaded.completed).toEqual(m.completed);
    expect(loaded.keySymbols).toEqual(m.keySymbols);
    expect(loaded.tasksPerKey).toBe(2);
    expect(loaded.rules).toBe(2);
    expect(loaded.seed).toBe(m.seed);
  });

  it('eine vor dem Update gespeicherte Mission zeigt die aktuellen Bildangaben, behält aber Fortschritt', () => {
    const store = memoryStore();
    const p = createEscapePersistence(store);
    let m = mission({}, 19);
    m = finish(m, 1, T0 + 1000);
    const old = JSON.parse(JSON.stringify(m)) as EscapeMission;
    old.tasks[1].image = { ...old.tasks[1].image, alt: 'Alte Beschreibung' };
    store.setItem(ESCAPE_KEY, JSON.stringify({ v: 1, savedAt: 1, mission: old }));
    const loaded = p.load(T0 + 2000).mission!;
    expect(loaded.tasks[1].image.alt).toBe(m.tasks[1].image.alt);
    expect(progressOf(loaded).done).toBe(1);
  });

  it('ein alter Stand mit fehlenden Bilddaten bleibt mit den verfügbaren Namen lesbar', () => {
    let m = finishN(mission({}, 29), 1);
    const raw = JSON.parse(JSON.stringify(m)) as EscapeMission & Record<string, unknown>;
    delete (raw.tasks[0] as unknown as Record<string, unknown>).image;
    raw.tasks[0].templateId = 'gibt-es-nicht-mehr';
    const loaded = sanitizeEscape(raw)!;
    expect(loaded).not.toBeNull();
    expect(loaded.tasks[0].title).toBe(m.tasks[0].title);
    expect(loaded.tasks[0].image.alt.length).toBeGreaterThan(3);
    expect(loaded.tasks[0].image.illustrationKey).toBe('');
    expect(loaded.completed.length).toBe(1);
    m = loaded;
    expect(completedTasks(m)[0].title).toBe(raw.tasks[0].title);
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
    expect(p.save(m1)).toBe('stale');
    expect(progressOf(p.load(T0 + 5000).mission!).done).toBe(1);
    const newer = mission({}, 24, T0 + 60_000);
    expect(p.save(newer)).toBe('ok');
    expect(p.save(tabB)).toBe('stale');
    expect(p.save(null)).toBe('ok');
    expect(p.load(T0).status).toBe('empty');
  });

  it('die Escape-Mission und die Waldschätze-Runde sind getrennte Spielstände', () => {
    expect(ESCAPE_KEY).not.toBe('entdeckerzeit:v1:round');
    expect(ESCAPE_KEY).toBe('entdeckerzeit:v1:escape');
  });
});

import { CATALOG_VERSION } from '../../catalog/templates';
import { chooseGift } from '../gift';
import { seededRng } from '../rng';
import { addPause, removePause, settle } from './clock';
import { generateCandidates, pickKeySymbols, pickReplacement, poolInfo as computePoolInfo, type PoolInfo } from './candidates';
import { progressOf } from './progress';
import { makeClues, makeSolution } from './puzzle';
import { KEY_COUNT, requiredTasks, type EscapeMission, type EscapeParams, type EscapeTask, type SymbolId } from './types';

/**
 * Zustandsübergänge von Wald Escape. Jede Funktion rechnet zuerst die Uhr auf `now` ab (`settle`) und gibt
 * eine neue Mission zurück (oder dieselbe, wenn nichts zu tun ist). Keine Oberfläche, keine Zeitgeber.
 * Schlüssel und Fragmente kommen ausschließlich aus `progressOf` (src/domain/escape/progress.ts).
 */

const ACTIVE = ['searching', 'timeup', 'free'] as const;
const isActive = (m: EscapeMission) => (ACTIVE as readonly string[]).includes(m.phase);

export function paramsOf(m: EscapeMission): EscapeParams {
  return { age: m.age, season: m.season, seasonSource: m.seasonSource, context: m.context, minutes: m.minutes, tasksPerKey: (m.tasksPerKey === 1 ? 2 : m.tasksPerKey) as 2 | 3 };
}

/** Nötige Aufträge dieser Mission (6, 9 oder bei einer alten Mission 3). */
export const requiredOf = (m: Pick<EscapeMission, 'tasksPerKey'>): number => requiredTasks(m.tasksPerKey);

/* ---------------- Start ---------------- */

export type { PoolInfo };
export const describePool = (p: EscapeParams): PoolInfo => computePoolInfo(p);

/** Ehrlicher Hinweis zur Kartenzahl vor dem Start (null, wenn die angestrebte Auswahl vollständig ist). */
export function poolNotice(info: PoolInfo, target: number): string | null {
  if (info.cards === 0) {
    return `Für diese Auswahl gibt es gerade nur ${info.groups} verschiedene passende Aufgaben. Für diese Größe braucht ihr ${info.required}. Ändert die Jahreszeit oder die Angaben, wählt die kleinere Größe oder spielt die entspannte Waldschatzsuche.`;
  }
  if (info.cards === info.required) return `Heute stehen genau ${info.cards} Aufgaben zur Wahl. Ihr braucht alle ${info.required}.`;
  if (info.cards < target) return `Heute stehen ${info.cards} Aufgaben zur Wahl. Ihr braucht ${info.required}.`;
  return null;
}

export type CreateResult = { ok: true; mission: EscapeMission } | { ok: false; groups: number };

/** Neue Mission. Die Uhr beginnt erst hier, beim bewussten Start (`now`). Karten, Texte, Bilder und die drei Schlüsselsymbole werden festgelegt. */
export function createEscape(p: EscapeParams, seed: number, now: number): CreateResult {
  const rng = seededRng(seed);
  const res = generateCandidates(p, rng);
  if (!res) return { ok: false, groups: computePoolInfo(p).groups };
  const durationMs = p.minutes * 60_000;
  return {
    ok: true,
    mission: {
      v: 2,
      id: `e${now.toString(36)}${Math.floor(rng() * 1e6).toString(36)}`,
      mode: 'escape',
      rules: 2,
      catalogVersion: CATALOG_VERSION,
      createdAt: now,
      updatedAt: now,
      rev: 1,
      age: p.age,
      season: p.season,
      seasonSource: p.seasonSource,
      context: [...p.context],
      minutes: p.minutes,
      seed,
      keyCount: KEY_COUNT,
      tasksPerKey: p.tasksPerKey,
      cardCount: res.tasks.length,
      tasks: res.tasks,
      excludedConcepts: [],
      swaps: 0,
      activeIndex: 0,
      keySymbols: pickKeySymbols(rng),
      completed: [],
      phase: 'searching',
      pauses: [],
      clock: { durationMs, remainingMs: durationMs, resumedAt: now },
      outcome: 'open',
      solution: null,
      clues: null,
      input: [null, null, null],
      hints: 0,
      helped: false,
    },
  };
}

/* ---------------- Funde ---------------- */

function replaceTask(m: EscapeMission, i: number, t: EscapeTask): EscapeMission {
  const tasks = m.tasks.slice();
  tasks[i] = t;
  return { ...m, tasks };
}

function solutionSeed(m: EscapeMission): number {
  let h = m.seed >>> 0;
  for (const s of m.keySymbols) h = (Math.imul(h ^ (s.charCodeAt(0) * 131 + s.length), 0x9e3779b1) + 0x7f4a7c15) >>> 0;
  return h;
}

/** Alle Schlüssel sind fertig: Suchzeit endet (rechtzeitig oder nach Ablauf), Symbolrätsel beginnt ohne Countdown. */
function toCombination(m: EscapeMission): EscapeMission {
  const rng = seededRng(solutionSeed(m));
  const solution = makeSolution(m.keySymbols.slice(), rng);
  const clues = m.age === '7-10' ? makeClues(solution, rng) : null;
  return {
    ...m,
    // Nur wer in der laufenden Suchphase fertig wird, war rechtzeitig. In „timeup“ oder „free“ bleibt es bei „abgelaufen“.
    outcome: m.phase === 'searching' ? 'onTime' : 'expired',
    phase: 'combination',
    pauses: [],
    clock: { ...m.clock, resumedAt: null },
    solution,
    clues,
    input: [null, null, null],
    hints: 0,
    helped: false,
  };
}

/**
 * „Gefunden!“ / „Eins gefunden“. Erst der ganze Auftrag liefert ein Fragment; Doppeltippen auf eine fertige Karte nie ein zweites.
 * Beim letzten nötigen Auftrag (6. oder 9., bei alten Missionen der 3.) endet die Suchzeit.
 */
export function addFound(m: EscapeMission, uid: string, now: number): EscapeMission {
  const s = settle(m, now);
  if (!isActive(s)) return s;
  const i = s.tasks.findIndex((t) => t.uid === uid);
  if (i < 0) return s;
  const t = s.tasks[i];
  if (t.status !== 'open') return s;
  const found = Math.min(t.target, t.found + 1);
  let n = replaceTask(s, i, { ...t, found, status: found >= t.target ? 'done' : 'open' });
  if (found >= t.target && !n.completed.some((c) => c.uid === uid) && n.completed.length < requiredOf(n)) {
    n = { ...n, completed: [...n.completed, { uid, templateId: t.templateId, at: now }] };
  }
  return progressOf(n).complete ? toCombination(n) : n;
}

/** Zurück in die Suchphase, wenn ein Fund zurückgenommen wurde. Es gibt nie neue Zeit: höchstens die eingefrorene Restzeit. */
function backToSearch(m: EscapeMission): EscapeMission {
  const base = { ...m, solution: null, clues: null, input: [null, null, null] as (SymbolId | null)[], hints: 0 as const, helped: false };
  if (m.outcome === 'onTime') {
    // Die Restzeit steht still; erst „Weitersuchen“ startet sie wieder.
    return { ...base, phase: 'searching', outcome: 'open', pauses: ['manual'], clock: { ...m.clock, resumedAt: null } };
  }
  return { ...base, phase: 'free' };
}

/**
 * Rückgängig: nimmt einen Fund zurück. Wird ein vollständiger Auftrag wieder offen, entfällt sein Fragment; Schlüssel und Fragmente
 * werden danach aus den vollständigen Aufträgen neu abgeleitet. Andere Funde bleiben immer; ein schon vergebenes Geschenk bleibt erhalten.
 */
export function undoFound(m: EscapeMission, uid: string, now: number): EscapeMission {
  const s = settle(m, now);
  if (s.phase === 'ended') return s;
  const i = s.tasks.findIndex((t) => t.uid === uid);
  if (i < 0) return s;
  const t = s.tasks[i];
  if (t.status !== 'done' && t.found <= 0) return s;
  const wasDone = t.status === 'done';
  let n = replaceTask(s, i, { ...t, found: Math.max(0, t.found - 1), status: 'open' });
  if (wasDone) n = { ...n, completed: n.completed.filter((c) => c.uid !== uid) };
  if (wasDone && (n.phase === 'combination' || n.phase === 'opened') && !progressOf(n).complete) n = backToSearch(n);
  return n;
}

export function setActive(m: EscapeMission, index: number): EscapeMission {
  const i = Math.max(0, Math.min(m.tasks.length - 1, index));
  return i === m.activeIndex ? m : { ...m, activeIndex: i };
}

/** „Andere Spur suchen“: ersetzt nur die offene Karte. Gibt null zurück, wenn es keine Alternative gibt. */
export function swapTask(m: EscapeMission, uid: string, now: number): EscapeMission | null {
  const s = settle(m, now);
  if (!isActive(s)) return null;
  const i = s.tasks.findIndex((t) => t.uid === uid);
  if (i < 0 || s.tasks[i].status !== 'open') return null;
  const old = s.tasks[i];
  const rng = seededRng((s.seed ^ Math.imul(s.swaps + 1, 0x9e3779b1)) >>> 0);
  const repl = pickReplacement(paramsOf(s), s.tasks.map((t) => t.conceptId), s.excludedConcepts, rng, old.templateId);
  if (!repl) return null;
  return { ...replaceTask(s, i, repl), excludedConcepts: [...s.excludedConcepts, old.conceptId], swaps: s.swaps + 1 };
}

/** Können die fehlenden Aufträge noch alle erreicht werden? (Karten wechseln nie die Zahl; falsch nur bei beschädigtem Stand.) */
export function canStillComplete(m: EscapeMission): boolean {
  const need = requiredOf(m) - m.completed.length;
  return m.tasks.filter((t) => t.status === 'open').length >= need;
}

/* ---------------- Zeit und Pausen ---------------- */

export { addPause, removePause, settle };

/** „Ohne Zeitdruck weitersuchen“: dieselben Karten und Funde, kein neuer Countdown, nie nachträglich „rechtzeitig“. */
export function continueFree(m: EscapeMission, now: number): EscapeMission {
  const s = settle(m, now);
  return s.phase === 'timeup' ? { ...s, phase: 'free' } : s;
}

/** „Für heute beenden“: ehrlicher Teilabschluss. */
export function endEarly(m: EscapeMission, now: number): EscapeMission {
  const s = settle(m, now);
  if (s.phase === 'opened' || s.phase === 'ended') return s;
  return { ...s, phase: 'ended', pauses: [], clock: { ...s.clock, resumedAt: null } };
}

/* ---------------- Symbolrätsel ---------------- */

export function placeSymbol(m: EscapeMission, symbol: SymbolId): EscapeMission {
  if (m.phase !== 'combination' || !m.keySymbols.includes(symbol) || m.input.includes(symbol)) return m;
  const i = m.input.indexOf(null);
  if (i < 0) return m;
  const input = m.input.slice();
  input[i] = symbol;
  return { ...m, input };
}

export function placeAt(m: EscapeMission, slot: number, symbol: SymbolId): EscapeMission {
  if (m.phase !== 'combination' || slot < 0 || slot > 2 || !m.keySymbols.includes(symbol)) return m;
  const input = m.input.map((s) => (s === symbol ? null : s));
  input[slot] = symbol;
  return { ...m, input };
}

export function clearSlot(m: EscapeMission, slot: number): EscapeMission {
  if (m.phase !== 'combination' || m.input[slot] == null) return m;
  const input = m.input.slice();
  input[slot] = null;
  return { ...m, input };
}

export function giveHint(m: EscapeMission): EscapeMission {
  return m.phase === 'combination' && m.hints < 2 ? { ...m, hints: (m.hints + 1) as 1 | 2 } : m;
}

/** Die erledigten Karten in der Reihenfolge des Abschlusses. */
export function completedTasks(m: EscapeMission): EscapeTask[] {
  return m.completed.map((c) => m.tasks.find((t) => t.uid === c.uid)).filter((t): t is EscapeTask => Boolean(t));
}

/** Die Tresortür öffnet sich: genau ein Geschenk pro Mission, einmal gespeichert; ein späteres Öffnen vergibt kein zweites. */
function toOpened(m: EscapeMission, received: string[], now: number): EscapeMission {
  const gift = m.gift ?? { id: chooseGift({ tasks: completedTasks(m), seed: m.seed }, received), celebrated: false, at: now };
  return { ...m, phase: 'opened', gift };
}

export type OpenResult = { mission: EscapeMission; ok: boolean };

/** „Tresor öffnen“: nur die richtige Reihenfolge öffnet, und nur bei drei fertigen Schlüsseln. Falsche Eingaben bleiben stehen und kosten nichts. */
export function openVault(m: EscapeMission, received: string[], now: number): OpenResult {
  if (m.phase !== 'combination' || !m.solution || !progressOf(m).complete || m.input.some((s) => s === null)) return { mission: m, ok: false };
  const right = m.input.every((s, i) => s === m.solution![i]);
  return right ? { mission: toOpened(m, received, now), ok: true } : { mission: m, ok: false };
}

/** „Gemeinsam öffnen“: transparente Hilfsauflösung. Gleiches Geschenk, gleiche Erfolgsaussage über die Suchzeit. */
export function openWithHelp(m: EscapeMission, received: string[], now: number): EscapeMission {
  if (m.phase !== 'combination' || !m.solution || !progressOf(m).complete) return m;
  return toOpened({ ...m, input: m.solution.slice(), helped: true }, received, now);
}

/* ---------------- Abschluss ---------------- */

export function needsCelebration(m: EscapeMission): boolean {
  return m.phase === 'opened' && Boolean(m.gift) && !m.gift!.celebrated;
}

export function markCelebrated(m: EscapeMission): EscapeMission {
  return m.gift && !m.gift.celebrated ? { ...m, gift: { ...m.gift, celebrated: true } } : m;
}

export function resultLine(m: EscapeMission): string {
  return m.outcome === 'onTime' ? 'Tresor geöffnet! Ihr habt alle drei Schlüssel rechtzeitig gefunden.' : 'Tresor geöffnet! Gemeinsam habt ihr das Waldgeheimnis entdeckt.';
}

/** Eine Mission, die der Spieler noch fortsetzen kann (nicht geöffnet, nicht beendet). */
export function isLive(m: EscapeMission | null): m is EscapeMission {
  return m !== null && m.phase !== 'opened' && m.phase !== 'ended';
}

/** Alte Mission mit früherer Regel (ein Fund = ein Schlüssel). Sie bleibt fortsetzbar; neue Missionen verwenden Fundgruppen. */
export const isLegacy = (m: Pick<EscapeMission, 'rules'>): boolean => m.rules === 1;

/** Stimmt die innere Ordnung? Für Tests und defensive Wiederherstellung. */
export function invariantsHold(m: EscapeMission): boolean {
  const p = progressOf(m);
  if (m.phase === 'timeup' && m.outcome !== 'expired') return false;
  if ((m.phase === 'combination' || m.phase === 'opened') && !p.complete) return false;
  if (m.outcome === 'onTime' && m.phase === 'timeup') return false;
  if (m.completed.length > requiredOf(m)) return false;
  if (new Set(m.completed.map((c) => c.uid)).size !== m.completed.length) return false;
  // jede erledigte Karte ist auch wirklich erledigt, und umgekehrt
  for (const c of m.completed) if (m.tasks.find((t) => t.uid === c.uid)?.status !== 'done') return false;
  if (m.tasks.filter((t) => t.status === 'done').length < m.completed.length) return false;
  if (new Set(m.keySymbols).size !== KEY_COUNT) return false;
  if (new Set(m.tasks.map((t) => t.conceptId)).size !== m.tasks.length) return false;
  return true;
}

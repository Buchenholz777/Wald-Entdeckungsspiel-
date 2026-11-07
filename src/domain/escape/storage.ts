import { templatesById } from '../../catalog/templates';
import { giftsById } from '../../catalog/gifts';
import type { KeyValueStore } from '../storage';
import type { ContextTag, Season } from '../types';
import { createResetGuard } from '../resetGuard';
import { settle } from './clock';
import { ESCAPE_PHASES, KEY_COUNT, SYMBOLS, requiredTasks, toEscapeMinutes, type Completed, type EscapeMission, type PauseReason, type SymbolId, type TasksPerKey, type TimeOutcome } from './types';

/**
 * Eigene, versionierte Speicherung der Escape-Mission (unabhängig von der Waldschätze-Runde: Beide Spielstände
 * bestehen nebeneinander). Beschädigter, fehlender oder gesperrter Speicher führt nie zum Absturz.
 *
 * Regelversionen: Eine Mission aus der früheren Fassung (Schema 1: ein Fund = ein Schlüssel, drei Funde) wird beim Laden NICHT
 * auf sechs oder neun Aufgaben umgedeutet. Sie bleibt mit der Regel 1 (`rules: 1`, `tasksPerKey: 1`) kompatibel fortsetzbar, ihre Funde,
 * Schlüssel, Zeit und Geschenke bleiben erhalten; abgeschlossene Missionen bekommen rückwirkend nichts. Neue Missionen verwenden Regel 2.
 */

/** Version des Speicher-Umschlags (Schlüssel `entdeckerzeit:v1:escape`). */
export const ESCAPE_VERSION = 1;
export const ESCAPE_KEY = `entdeckerzeit:v${ESCAPE_VERSION}:escape`;

export type EscapeLoadStatus = 'ok' | 'empty' | 'corrupt' | 'blocked';

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const CONTEXTS: ContextTag[] = ['conifers', 'maple', 'oak', 'chestnut', 'sand', 'gravel', 'shadow', 'puddles', 'snow', 'hazel', 'beech', 'mud', 'fern', 'hornbeam', 'linden', 'alder'];
const OUTCOMES: TimeOutcome[] = ['open', 'onTime', 'expired'];
const isSymbol = (v: unknown): v is SymbolId => typeof v === 'string' && (SYMBOLS as readonly string[]).includes(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Drei verschiedene Schlüsselsymbole: die bekannten zuerst, der Rest deterministisch aus dem Vorrat. */
function completeSymbols(known: SymbolId[]): SymbolId[] {
  const out = [...new Set(known)].slice(0, KEY_COUNT);
  for (const s of SYMBOLS) if (out.length < KEY_COUNT && !out.includes(s)) out.push(s);
  return out;
}

/** Strukturprüfung. `null`, wenn die Mission nicht brauchbar ist. Bildangaben kommen immer aus dem aktuellen Katalog. */
export function sanitizeEscape(raw: unknown): EscapeMission | null {
  if (!isObj(raw) || raw.mode !== 'escape') return null;
  const legacy = raw.v === 1;
  if (raw.v !== 2 && !legacy) return null;
  if (typeof raw.id !== 'string' || !finite(raw.createdAt) || !finite(raw.updatedAt) || !finite(raw.rev) || !finite(raw.seed)) return null;
  if (raw.age !== '4-6' && raw.age !== '7-10') return null;
  if (!SEASONS.includes(raw.season as Season)) return null;
  if (!ESCAPE_PHASES.includes(raw.phase as never) || !OUTCOMES.includes(raw.outcome as TimeOutcome)) return null;
  if (!Array.isArray(raw.tasks) || raw.tasks.length < 3 || raw.tasks.length > 12) return null;
  if (!isObj(raw.clock) || !finite(raw.clock.durationMs) || !finite(raw.clock.remainingMs) || (raw.clock.resumedAt !== null && !finite(raw.clock.resumedAt))) return null;
  if (!Array.isArray(raw.input) || raw.input.length !== 3) return null;
  for (const t of raw.tasks) {
    if (!isObj(t) || typeof t.uid !== 'string' || typeof t.prompt !== 'string' || typeof t.templateId !== 'string') return null;
    if (!finite(t.target) || t.target < 1 || t.target > 10 || !finite(t.found) || t.found < 0 || t.found > t.target) return null;
    if (!['open', 'done'].includes(t.status as string) || !['single', 'count'].includes(t.mode as string)) return null;
    if (!isObj(t.info) || typeof t.info.whatIsIt !== 'string' || typeof t.info.origin !== 'string' || typeof t.info.whereToLook !== 'string') return null;
    // Bilddaten dürfen in alten Ständen fehlen oder unvollständig sein: Sie werden unten aus dem Katalog oder mit einem ruhigen Ersatz ergänzt.
  }
  const rawTasks = raw.tasks as unknown as (EscapeMission['tasks'][number] & { symbol?: SymbolId })[];
  const uids = new Set(rawTasks.map((t) => t.uid));

  let tasksPerKey: TasksPerKey;
  let completed: Completed[];
  let keySymbols: SymbolId[];
  if (legacy) {
    // Frühere Fassung: `keys` (Reihenfolge des Erhalts) und je Karte ein Symbol
    if (!Array.isArray(raw.keys) || raw.keys.length > 3) return null;
    for (const k of raw.keys) if (!isObj(k) || typeof k.uid !== 'string' || !isSymbol(k.symbol) || !uids.has(k.uid)) return null;
    const keys = raw.keys as unknown as { uid: string; symbol: SymbolId; templateId: string; at: number }[];
    tasksPerKey = 1;
    completed = keys.map((k) => ({ uid: k.uid, templateId: k.templateId, at: finite(k.at) ? k.at : 0 }));
    keySymbols = completeSymbols([...keys.map((k) => k.symbol), ...rawTasks.map((t) => t.symbol).filter(isSymbol)]);
  } else {
    if (raw.tasksPerKey !== 1 && raw.tasksPerKey !== 2 && raw.tasksPerKey !== 3) return null;
    if (!Array.isArray(raw.completed) || !Array.isArray(raw.keySymbols) || raw.keySymbols.length !== KEY_COUNT || !raw.keySymbols.every(isSymbol) || new Set(raw.keySymbols).size !== KEY_COUNT) return null;
    tasksPerKey = raw.tasksPerKey as TasksPerKey;
    if (raw.completed.length > requiredTasks(tasksPerKey)) return null;
    for (const c of raw.completed) if (!isObj(c) || typeof c.uid !== 'string' || !uids.has(c.uid)) return null;
    completed = (raw.completed as { uid: string; templateId?: unknown; at?: unknown }[]).map((c) => ({ uid: c.uid, templateId: typeof c.templateId === 'string' ? c.templateId : rawTasks.find((t) => t.uid === c.uid)!.templateId, at: finite(c.at) ? c.at : 0 }));
    keySymbols = raw.keySymbols as SymbolId[];
  }
  if (new Set(completed.map((c) => c.uid)).size !== completed.length) return null;
  const need = requiredTasks(tasksPerKey);
  const solution = Array.isArray(raw.solution) && raw.solution.length === 3 && raw.solution.every(isSymbol) ? (raw.solution as SymbolId[]) : null;
  const m = raw as unknown as EscapeMission;
  if ((m.phase === 'combination' || m.phase === 'opened') && (completed.length < need || !solution)) return null;
  const minutes = toEscapeMinutes(m.minutes);
  const durationMs = minutes * 60_000;
  // Gerätezeit-Murks oder ein verändertes Speicherfeld dürfen nie mehr Zeit schenken als die gewählte Dauer
  const remainingMs = Math.min(durationMs, Math.max(0, m.clock.remainingMs));
  // Ein offener Dialog existiert nach dem Neuladen nicht mehr: Die Pause bleibt als bewusste Pause stehen (die Uhr startet nie ungefragt).
  const rawPauses: unknown[] = Array.isArray(m.pauses) ? m.pauses : [];
  const pauses: PauseReason[] = [...new Set(rawPauses.map((p) => (p === 'dialog' ? 'manual' : p)).filter((p): p is PauseReason => p === 'manual' || p === 'menu'))];
  const g = (raw as { gift?: unknown }).gift;
  const gift = isObj(g) && typeof g.id === 'string' && giftsById[g.id] ? { id: g.id, celebrated: g.celebrated === true, at: finite(g.at) ? g.at : 0 } : undefined;
  const clues = Array.isArray(m.clues) && m.clues.length === 2 ? m.clues : null;
  const activeIndex = finite(m.activeIndex) ? Math.max(0, Math.min(rawTasks.length - 1, Math.round(m.activeIndex))) : 0;
  const tasks = rawTasks.map((t) => {
    const { symbol: _s, ...clean } = t;
    void _s;
    const tpl = templatesById[clean.templateId];
    if (tpl) return { ...clean, image: tpl.image } as EscapeMission['tasks'][number];
    // Unbekannte Vorlage und lückenhafte Bilddaten: Namen und Texte der Karte bleiben lesbar, das Bild ist dann ein ruhiger Ersatz.
    const img = isObj(clean.image) ? (clean.image as Partial<EscapeMission['tasks'][number]['image']>) : {};
    const image = {
      illustrationKey: typeof img.illustrationKey === 'string' ? img.illustrationKey : '',
      animationPreset: img.animationPreset ?? 'settle',
      variantTags: Array.isArray(img.variantTags) ? img.variantTags : [],
      recognitionFeatures: Array.isArray(img.recognitionFeatures) ? img.recognitionFeatures : [],
      alt: typeof img.alt === 'string' ? img.alt : clean.title ?? clean.prompt,
    };
    return { ...clean, image } as EscapeMission['tasks'][number];
  });
  const out: EscapeMission & { keys?: unknown } = {
    ...m,
    v: 2,
    rules: legacy ? 1 : 2,
    minutes,
    keyCount: 3,
    tasksPerKey,
    context: Array.isArray(m.context) ? m.context.filter((c) => CONTEXTS.includes(c)) : [],
    excludedConcepts: Array.isArray(m.excludedConcepts) ? m.excludedConcepts.filter((c) => typeof c === 'string') : [],
    swaps: finite(m.swaps) ? m.swaps : 0,
    cardCount: finite(m.cardCount) ? m.cardCount : tasks.length,
    activeIndex,
    // Bildangaben (Schlüssel, Beschreibung, Merkmale) kommen immer aus dem aktuellen Katalog: Ein Update zeigt nie ein fehlendes oder veraltetes Bild.
    tasks,
    keySymbols,
    completed,
    pauses,
    clock: { durationMs, remainingMs, resumedAt: m.clock.resumedAt },
    solution,
    clues,
    input: (raw.input as unknown[]).map((s) => (isSymbol(s) ? s : null)),
    hints: m.hints === 1 || m.hints === 2 ? m.hints : 0,
    helped: m.helped === true,
    gift,
  };
  delete out.keys; // frühere Fassung
  return out;
}

/** Zur Seite gelegte, nicht lesbare Kopie (wird beim Reset mit entfernt). */
export const ESCAPE_UNREADABLE_KEY = `${ESCAPE_KEY}:unlesbar`;

/** `reset`: In einem anderen Tab wurde zurückgesetzt; dieser Tab schreibt nichts, bis er den Reset übernommen hat. */
export type EscapeSaveResult = 'ok' | 'stale' | 'failed' | 'blocked' | 'reset';

export interface EscapePersistence {
  /** Wurde in einem anderen Tab zurückgesetzt? */
  resetPending(): boolean;
  acknowledgeReset(): void;
  available: boolean;
  /** Lädt die Mission und rechnet die Uhr auf `now` ab (eine laufende Suche verliert die tatsächlich vergangene Zeit). */
  load(now: number): { status: EscapeLoadStatus; mission: EscapeMission | null };
  /** Speichert, es sei denn, im Speicher liegt ein jüngerer Stand (zum Beispiel aus einem anderen Tab). */
  save(m: EscapeMission | null): EscapeSaveResult;
  /** Liest den gespeicherten Stand (für den Vergleich mit anderen Tabs). */
  peek(now: number): EscapeMission | null;
}

function olderThan(stored: EscapeMission, mine: EscapeMission): boolean {
  // „stored ist jünger“: gleiche Mission mit höherem Zähler, oder eine später begonnene Mission
  if (stored.id === mine.id) return stored.rev > mine.rev;
  return stored.createdAt > mine.createdAt;
}

export function createEscapePersistence(store: KeyValueStore | null): EscapePersistence {
  const read = (now: number): { status: EscapeLoadStatus; mission: EscapeMission | null } => {
    if (!store) return { status: 'blocked', mission: null };
    try {
      const text = store.getItem(ESCAPE_KEY);
      if (text === null) return { status: 'empty', mission: null };
      const parsed: unknown = JSON.parse(text);
      const m = isObj(parsed) ? sanitizeEscape(parsed.mission) : null;
      if (!m) throw new Error('Struktur');
      return { status: 'ok', mission: settle(m, now) };
    } catch {
      // Ein nicht lesbarer Stand wird nicht stillschweigend gelöscht, sondern zur Seite gelegt (nur zur Sicherheit, nie als neue Funde übernommen).
      try {
        const text = store?.getItem(ESCAPE_KEY);
        if (text) store?.setItem(ESCAPE_UNREADABLE_KEY, text);
        store?.removeItem(ESCAPE_KEY);
      } catch {
        /* ignorieren */
      }
      return { status: 'corrupt', mission: null };
    }
  };
  const guard = createResetGuard(store);
  return {
    resetPending: () => guard.stale(),
    acknowledgeReset: () => guard.acknowledge(),
    available: store !== null,
    load: read,
    peek: (now) => read(now).mission,
    save(m) {
      if (!store) return 'blocked';
      if (guard.stale()) return 'reset';
      try {
        if (m === null) {
          store.removeItem(ESCAPE_KEY);
          return 'ok';
        }
        const text = store.getItem(ESCAPE_KEY);
        if (text !== null) {
          try {
            const parsed: unknown = JSON.parse(text);
            const stored = isObj(parsed) ? sanitizeEscape(parsed.mission) : null;
            if (stored && olderThan(stored, m)) return 'stale';
          } catch {
            /* beschädigter alter Stand: überschreiben */
          }
        }
        store.setItem(ESCAPE_KEY, JSON.stringify({ v: ESCAPE_VERSION, savedAt: Date.now(), mission: m }));
        return 'ok';
      } catch {
        return 'failed';
      }
    },
  };
}

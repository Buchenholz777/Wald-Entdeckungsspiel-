import { templatesById } from '../../catalog/templates';
import { giftsById } from '../../catalog/gifts';
import type { KeyValueStore } from '../storage';
import type { ContextTag, Season } from '../types';
import { settle } from './clock';
import { ESCAPE_PHASES, SYMBOLS, toEscapeMinutes, type EscapeMission, type PauseReason, type SymbolId, type TimeOutcome } from './types';

/**
 * Eigene, versionierte Speicherung der Escape-Mission (unabhängig von der Waldschätze-Runde: Beide Spielstände
 * bestehen nebeneinander). Beschädigter, fehlender oder gesperrter Speicher führt nie zum Absturz.
 */

export const ESCAPE_VERSION = 1;
export const ESCAPE_KEY = `entdeckerzeit:v${ESCAPE_VERSION}:escape`;

export type EscapeLoadStatus = 'ok' | 'empty' | 'corrupt' | 'blocked';

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];
const CONTEXTS: ContextTag[] = ['conifers', 'maple', 'oak', 'chestnut', 'sand', 'gravel', 'shadow', 'puddles', 'snow', 'hazel', 'beech', 'mud', 'fern'];
const OUTCOMES: TimeOutcome[] = ['open', 'onTime', 'expired'];
const isSymbol = (v: unknown): v is SymbolId => typeof v === 'string' && (SYMBOLS as readonly string[]).includes(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Strukturprüfung. `null`, wenn die Mission nicht brauchbar ist. Bildangaben kommen immer aus dem aktuellen Katalog. */
export function sanitizeEscape(raw: unknown): EscapeMission | null {
  if (!isObj(raw) || raw.mode !== 'escape' || raw.v !== ESCAPE_VERSION) return null;
  if (typeof raw.id !== 'string' || !finite(raw.createdAt) || !finite(raw.updatedAt) || !finite(raw.rev) || !finite(raw.seed)) return null;
  if (raw.age !== '4-6' && raw.age !== '7-10') return null;
  if (!SEASONS.includes(raw.season as Season)) return null;
  if (!ESCAPE_PHASES.includes(raw.phase as never) || !OUTCOMES.includes(raw.outcome as TimeOutcome)) return null;
  if (!Array.isArray(raw.tasks) || raw.tasks.length < 3 || raw.tasks.length > 5) return null;
  if (!isObj(raw.clock) || !finite(raw.clock.durationMs) || !finite(raw.clock.remainingMs) || (raw.clock.resumedAt !== null && !finite(raw.clock.resumedAt))) return null;
  if (!Array.isArray(raw.keys) || raw.keys.length > 3 || !Array.isArray(raw.input) || raw.input.length !== 3) return null;
  for (const t of raw.tasks) {
    if (!isObj(t) || typeof t.uid !== 'string' || typeof t.prompt !== 'string' || typeof t.templateId !== 'string') return null;
    if (!finite(t.target) || t.target < 1 || t.target > 10 || !finite(t.found) || t.found < 0 || t.found > t.target) return null;
    if (!['open', 'done'].includes(t.status as string) || !['single', 'count'].includes(t.mode as string) || !isSymbol(t.symbol)) return null;
    if (!isObj(t.info) || typeof t.info.whatIsIt !== 'string' || typeof t.info.origin !== 'string' || typeof t.info.whereToLook !== 'string') return null;
    if (!isObj(t.image) || typeof t.image.illustrationKey !== 'string' || typeof t.image.alt !== 'string') return null;
  }
  const tasks = raw.tasks as unknown as EscapeMission['tasks'];
  const keys = raw.keys as unknown as EscapeMission['keys'];
  for (const k of keys) if (!isObj(k) || typeof k.uid !== 'string' || !isSymbol(k.symbol) || !tasks.some((t) => t.uid === k.uid)) return null;
  const input = (raw.input as unknown[]).map((s) => (isSymbol(s) ? s : null));
  const solution = Array.isArray(raw.solution) && raw.solution.length === 3 && raw.solution.every(isSymbol) ? (raw.solution as SymbolId[]) : null;
  const m = raw as unknown as EscapeMission;
  const phase = m.phase;
  if ((phase === 'combination' || phase === 'opened') && (keys.length < 3 || !solution)) return null;
  const durationMs = toEscapeMinutes(m.minutes) * 60_000;
  // Gerätezeit-Murks oder ein verändertes Speicherfeld dürfen nie mehr Zeit schenken als die gewählte Dauer
  const remainingMs = Math.min(durationMs, Math.max(0, m.clock.remainingMs));
  // Ein offener Dialog existiert nach dem Neuladen nicht mehr: Die Pause bleibt als bewusste Pause stehen (die Uhr startet nie ungefragt).
  const rawPauses: unknown[] = Array.isArray(m.pauses) ? m.pauses : [];
  const pauses: PauseReason[] = [...new Set(rawPauses.map((p) => (p === 'dialog' ? 'manual' : p)).filter((p): p is PauseReason => p === 'manual' || p === 'menu'))];
  const g = (raw as { gift?: unknown }).gift;
  const gift = isObj(g) && typeof g.id === 'string' && giftsById[g.id] ? { id: g.id, celebrated: g.celebrated === true, at: finite(g.at) ? g.at : 0 } : undefined;
  const clues = Array.isArray(m.clues) && m.clues.length === 2 ? m.clues : null;
  const activeIndex = finite(m.activeIndex) ? Math.max(0, Math.min(tasks.length - 1, Math.round(m.activeIndex))) : 0;
  return {
    ...m,
    minutes: toEscapeMinutes(m.minutes),
    requiredKeys: 3,
    context: Array.isArray(m.context) ? m.context.filter((c) => CONTEXTS.includes(c)) : [],
    excludedConcepts: Array.isArray(m.excludedConcepts) ? m.excludedConcepts.filter((c) => typeof c === 'string') : [],
    swaps: finite(m.swaps) ? m.swaps : 0,
    cardCount: finite(m.cardCount) ? m.cardCount : tasks.length,
    activeIndex,
    // Bildangaben (Schlüssel, Beschreibung, Merkmale) kommen immer aus dem aktuellen Katalog: Ein Update zeigt nie ein fehlendes oder veraltetes Bild.
    tasks: tasks.map((t) => {
      const tpl = templatesById[t.templateId];
      return tpl ? { ...t, image: tpl.image } : t;
    }),
    keys,
    pauses,
    clock: { durationMs, remainingMs, resumedAt: m.clock.resumedAt },
    solution,
    clues,
    input,
    hints: m.hints === 1 || m.hints === 2 ? m.hints : 0,
    helped: m.helped === true,
    gift,
  };
}

export type EscapeSaveResult = 'ok' | 'stale' | 'failed' | 'blocked';

export interface EscapePersistence {
  available: boolean;
  /** Lädt die Mission und rechnet die Uhr auf `now` ab (eine laufende Suche verliert die tatsächlich vergangene Zeit). */
  load(now: number): { status: EscapeLoadStatus; mission: EscapeMission | null };
  /** Speichert, es sei denn, im Speicher liegt ein jüngerer Stand (zum Beispiel aus einem anderen Tab). */
  save(m: EscapeMission | null): EscapeSaveResult;
  /** Liest ohne Abrechnen den gespeicherten Stand (für den Vergleich mit anderen Tabs). */
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
      try {
        store?.removeItem(ESCAPE_KEY);
      } catch {
        /* ignorieren */
      }
      return { status: 'corrupt', mission: null };
    }
  };
  return {
    available: store !== null,
    load: read,
    peek: (now) => read(now).mission,
    save(m) {
      if (!store) return 'blocked';
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

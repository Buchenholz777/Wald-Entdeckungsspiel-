import { KEY_COUNT, requiredTasks, type Completed, type EscapeMission, type SymbolId, type TasksPerKey } from './types';

/**
 * Die EINE zentrale Fortschrittsfunktion: Schlüssel und Fragmente werden ausschließlich aus der Liste der vollständig
 * erledigten Aufträge und der Regel `tasksPerKey` abgeleitet. Nirgends sonst wird `count / 2` oder `count >= 3` gerechnet.
 * Animationen und Oberfläche sind nie die Quelle des Spielzustands.
 */

export interface EscapeProgress {
  /** Vollständig erledigte, unterschiedliche Aufträge */
  done: number;
  /** Insgesamt nötige Aufträge (Schlüssel × Aufträge je Schlüssel) */
  required: number;
  tasksPerKey: TasksPerKey;
  /** Ganze Schlüssel */
  keys: number;
  /** Fragmente des gerade entstehenden Schlüssels (0 … tasksPerKey − 1) */
  fragments: number;
  /** Wie viele Entdeckungen für den nächsten Schlüssel noch fehlen (0, wenn alles fertig ist) */
  missing: number;
  /** Alle Schlüssel fertig */
  complete: boolean;
}

export function progressOf(m: Pick<EscapeMission, 'completed' | 'tasksPerKey'>): EscapeProgress {
  const tpk = m.tasksPerKey;
  const required = requiredTasks(tpk);
  const done = Math.min(m.completed.length, required);
  const keys = Math.min(KEY_COUNT, Math.floor(done / tpk));
  const complete = keys >= KEY_COUNT;
  const fragments = complete ? 0 : done % tpk;
  return { done, required, tasksPerKey: tpk, keys, fragments, missing: complete ? 0 : tpk - fragments, complete };
}

export interface KeyGroup {
  index: number;
  symbol: SymbolId;
  /** Die Aufträge, die zu diesem Schlüssel beigetragen haben (höchstens tasksPerKey) */
  fragments: Completed[];
  complete: boolean;
}

/** Die drei Schlüsselplätze mit ihren Fragmenten, in der tatsächlichen Reihenfolge der Abschlüsse. */
export function keyGroups(m: Pick<EscapeMission, 'completed' | 'tasksPerKey' | 'keySymbols'>): KeyGroup[] {
  const tpk = m.tasksPerKey;
  return Array.from({ length: KEY_COUNT }, (_, i) => {
    const fragments = m.completed.slice(i * tpk, (i + 1) * tpk);
    return { index: i, symbol: m.keySymbols[i], fragments, complete: fragments.length >= tpk };
  });
}

/** „4 von 6 Aufgaben · 2 von 3 Schlüsseln“ */
export function progressText(p: EscapeProgress): string {
  return `${p.done} von ${p.required} Aufgaben · ${p.keys} von ${KEY_COUNT} Schlüsseln`;
}

/** „Für den nächsten Schlüssel fehlt noch 1 Entdeckung“ (leer, wenn alles fertig ist) */
export function missingText(p: EscapeProgress): string {
  if (p.complete) return 'Alle drei Schlüssel sind fertig.';
  return p.missing === 1 ? 'Für den nächsten Schlüssel fehlt noch 1 Entdeckung.' : `Für den nächsten Schlüssel fehlen noch ${p.missing} Entdeckungen.`;
}

/** Wie weit der gerade entstehende Schlüssel ist, in Worten (für Zeitablauf und Ansagen). */
export function partialWords(p: EscapeProgress): string {
  if (p.complete || p.fragments === 0) return 'Der nächste Schlüssel wartet noch auf seine erste Entdeckung';
  if (p.tasksPerKey === 2) return 'Der nächste Schlüssel ist schon halb fertig';
  return p.fragments === 1 ? 'Der nächste Schlüssel ist schon zu einem Drittel fertig' : 'Der nächste Schlüssel ist schon zu zwei Dritteln fertig';
}

/** „Die Sanduhr ist durch. Ihr habt 5 von 6 Aufgaben und 2 von 3 Schlüsseln geschafft. Der letzte Schlüssel ist schon halb fertig!“ */
export function timeupText(p: EscapeProgress): string {
  return `Ihr habt ${p.done} von ${p.required} Aufgaben und ${p.keys} von ${KEY_COUNT} Schlüsseln geschafft. ${partialWords(p)}${p.fragments > 0 ? '!' : '.'}`;
}

/** Kurze Beschreibung der Regel für Beschriftungen: „2 Entdeckungen pro Schlüssel · 3 Schlüssel · insgesamt 6 Aufgaben“ */
export function ruleText(tasksPerKey: TasksPerKey): string {
  return `${tasksPerKey} ${tasksPerKey === 1 ? 'Entdeckung' : 'Entdeckungen'} pro Schlüssel · ${KEY_COUNT} Schlüssel · insgesamt ${requiredTasks(tasksPerKey)} Aufgaben`;
}

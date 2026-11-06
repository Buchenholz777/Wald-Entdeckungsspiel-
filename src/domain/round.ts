import type { Round, RoundTask } from './types';

/** Reine Zustandsfunktionen für die Entdeckerrunde. Jede gibt eine neue Runde zurück. */

function updateTask(round: Round, uid: string, fn: (t: RoundTask) => RoundTask): Round {
  const i = round.tasks.findIndex((t) => t.uid === uid);
  if (i < 0) return round;
  const next = fn(round.tasks[i]);
  if (next === round.tasks[i]) return round;
  const tasks = round.tasks.slice();
  tasks[i] = next;
  return { ...round, tasks };
}

/** „Gefunden!“ / „Eins gefunden“: erhöht um genau eins, nie über die Zielmenge. */
export function addFound(round: Round, uid: string): Round {
  return updateTask(round, uid, (t) => {
    if (t.status !== 'open' || t.mode === 'compare') return t;
    const found = Math.min(t.target, t.found + 1);
    if (found === t.found) return t;
    return { ...t, found, status: found >= t.target ? 'done' : 'open' };
  });
}

/** Vergleich: ein Stück als angeschaut markieren bzw. wieder abwählen. */
export function toggleSeen(round: Round, uid: string, index: 0 | 1): Round {
  return updateTask(round, uid, (t) => {
    if (t.mode !== 'compare' || t.status !== 'open' || !t.seen) return t;
    const seen: [boolean, boolean] = [t.seen[0], t.seen[1]];
    seen[index] = !seen[index];
    return { ...t, seen, found: seen.filter(Boolean).length };
  });
}

/** Vergleich: erst nach dem Anschauen beider Dinge als ganzer Vergleich abschließen. */
export function completeCompare(round: Round, uid: string): Round {
  return updateTask(round, uid, (t) => {
    if (t.mode !== 'compare' || t.status !== 'open' || !t.seen) return t;
    if (!(t.seen[0] && t.seen[1])) return t;
    return { ...t, status: 'done', found: 2 };
  });
}

/** Rückgängig: auch nach Abschluss und auch für ausgelassene Aufgaben. */
export function undo(round: Round, uid: string): Round {
  return updateTask(round, uid, (t) => {
    if (t.status === 'skipped') return { ...t, status: 'open' };
    if (t.mode === 'compare') {
      if (t.status === 'done') return { ...t, status: 'open' };
      if (!t.seen) return t;
      const seen: [boolean, boolean] = [t.seen[0], t.seen[1]];
      if (seen[1]) seen[1] = false;
      else if (seen[0]) seen[0] = false;
      else return t;
      return { ...t, seen, found: seen.filter(Boolean).length };
    }
    if (t.found <= 0 && t.status !== 'done') return t;
    const found = Math.max(0, t.found - 1);
    return { ...t, found, status: 'open' };
  });
}

/** Ausgelassene Aufgabe: nie als gefunden gewertet. */
export function skip(round: Round, uid: string): Round {
  return updateTask(round, uid, (t) => {
    if (t.status === 'skipped') return t;
    return { ...t, status: 'skipped' };
  });
}

export function canUndo(t: RoundTask): boolean {
  if (t.status === 'skipped' || t.status === 'done') return true;
  return t.found > 0;
}

export function setActive(round: Round, index: number): Round {
  const i = Math.max(0, Math.min(round.tasks.length - 1, index));
  return i === round.activeIndex ? round : { ...round, activeIndex: i };
}

export interface Progress {
  total: number;
  done: number;
  skipped: number;
  open: number;
  resolved: number;
}

export function progress(round: Round): Progress {
  const total = round.tasks.length;
  const done = round.tasks.filter((t) => t.status === 'done').length;
  const skipped = round.tasks.filter((t) => t.status === 'skipped').length;
  return { total, done, skipped, open: total - done - skipped, resolved: done + skipped };
}

/** Nächste offene Aufgabe nach `from` (zyklisch), sonst -1. */
export function nextOpenIndex(round: Round, from: number): number {
  const n = round.tasks.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + step) % n;
    if (round.tasks[i].status === 'open') return i;
  }
  return -1;
}

export function finishRound(round: Round): Round {
  return round.finished ? round : { ...round, finished: true };
}

export function reopenRound(round: Round): Round {
  return round.finished ? { ...round, finished: false } : round;
}

export function summaryText(p: Progress): string {
  const parts = [`${p.done} entdeckt`];
  if (p.skipped > 0) parts.push(`${p.skipped} ausgelassen`);
  if (p.open > 0) parts.push(`${p.open} offen`);
  return parts.join(', ');
}

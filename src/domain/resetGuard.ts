/**
 * Marke für „Spiele und Einstellungen zurücksetzen“. Ein Reset schreibt einen Zeitstempel unter diesem Schlüssel.
 * Jede Speicherschicht merkt sich beim Start den damaligen Stand. Liegt später ein neuerer Stempel im Speicher, wurde in einem anderen Tab
 * zurückgesetzt: Dieser (ältere) Tab schreibt dann keinen Spielstand mehr zurück, bis er den Reset übernommen hat.
 * So bringt ein alter Tab nie einen gelöschten Spielstand wieder.
 */

import type { KeyValueStore } from './storage';

export const RESET_KEY = 'entdeckerzeit:v1:reset';

export function readResetStamp(store: KeyValueStore | null): number {
  if (!store) return 0;
  try {
    const n = Number(store.getItem(RESET_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export interface ResetGuard {
  /** Wurde seit dem Start (oder der letzten Übernahme) anderswo zurückgesetzt? */
  stale(): boolean;
  /** Der Reset wurde übernommen: Schreiben ist wieder erlaubt. */
  acknowledge(): void;
}

export function createResetGuard(store: KeyValueStore | null): ResetGuard {
  let known = readResetStamp(store);
  return {
    stale: () => readResetStamp(store) > known,
    acknowledge: () => {
      known = readResetStamp(store);
    },
  };
}

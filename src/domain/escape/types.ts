import type { AgeGroup, ContextTag, RoundTask, Season, SeasonSource } from '../types';

/**
 * Wald Escape – „Knackt den Waldtresor!“: gemeinsame Zeitmission mit fünf Suchkarten, drei Schlüsseln und einer Symbolkombination.
 * Alles hier ist reine Spiellogik ohne Oberfläche. Die Uhr wird immer aus Zeitpunkten berechnet (nie aus gezählten Ticks)
 * und bekommt die aktuelle Zeit als Parameter, damit Tests mit einer eigenen Uhr arbeiten können.
 */

export const ESCAPE_MINUTES = [10, 15, 20] as const;
export type EscapeMinutes = (typeof ESCAPE_MINUTES)[number];
export const ESCAPE_DEFAULT_MINUTES: EscapeMinutes = 15;
export const ESCAPE_MINUTES_LABEL: Record<EscapeMinutes, string> = {
  10: 'Kurze Zeitmission',
  15: 'Unser Waldabenteuer',
  20: 'Mehr Zeit zum Entdecken',
};

/** Anzahl der Schlüssel, die für den Tresor gebraucht werden. Sie sinkt nie, auch bei kleinem Pool nicht. */
export const REQUIRED_KEYS = 3;
/** Normale Zahl der Suchkarten */
export const CARD_COUNT = 5;

export type EscapeAge = Exclude<AgeGroup, '2-3'>;
/** Wald Escape ist ab 4 Jahren mit erwachsener Begleitung gedacht. */
export function canPlayEscape(age: AgeGroup | null): age is EscapeAge {
  return age === '4-6' || age === '7-10';
}

export function toEscapeMinutes(n: number): EscapeMinutes {
  return n === 10 || n === 20 ? n : 15;
}

/* ---------------- Symbolschlüssel ---------------- */

export const SYMBOLS = ['leaf', 'cone', 'acorn', 'star', 'mushroom', 'sun', 'moon', 'drop'] as const;
export type SymbolId = (typeof SYMBOLS)[number];

export interface SymbolInfo {
  /** Name ohne Artikel, für Beschriftungen („Blatt“) */
  name: string;
  article: 'der' | 'die' | 'das';
}

/** Zeichen des digitalen Schlosses, keine zusätzlichen Suchaufgaben. */
export const SYMBOL_INFO: Record<SymbolId, SymbolInfo> = {
  leaf: { name: 'Blatt', article: 'das' },
  cone: { name: 'Zapfen', article: 'der' },
  acorn: { name: 'Eichel', article: 'die' },
  star: { name: 'Stern', article: 'der' },
  mushroom: { name: 'Pilz', article: 'der' },
  sun: { name: 'Sonne', article: 'die' },
  moon: { name: 'Mond', article: 'der' },
  drop: { name: 'Tropfen', article: 'der' },
};

/** Hinweis im Rätsel: Die Symbolreihenfolge ist links nach rechts. */
export interface Clue {
  kind: 'mid' | 'left' | 'right' | 'leftOf' | 'rightOf' | 'next';
  a: SymbolId;
  b?: SymbolId;
}

/* ---------------- Mission ---------------- */

/** Warum die Suchzeit steht. Sie läuft nur, wenn keiner dieser Gründe vorliegt. */
export type PauseReason = 'manual' | 'menu' | 'dialog';

/**
 * Fachliche Phasen (Vorbereitung ist noch keine Mission):
 *  searching – Suchzeit (läuft oder steht wegen Pause)
 *  timeup – Zeit abgelaufen, Entscheidung offen
 *  free – Suchen ohne Zeitdruck
 *  combination – drei Schlüssel, Symbolrätsel ohne Countdown
 *  opened – Tresor geöffnet, Geschenk
 *  ended – vorzeitig beendet (ehrlicher Teilabschluss)
 */
export type EscapePhase = 'searching' | 'timeup' | 'free' | 'combination' | 'opened' | 'ended';
export const ESCAPE_PHASES: EscapePhase[] = ['searching', 'timeup', 'free', 'combination', 'opened', 'ended'];

/** Ergebnis der Zeitphase: offen, rechtzeitig geschafft oder abgelaufen. Nie beides. */
export type TimeOutcome = 'open' | 'onTime' | 'expired';

export interface EscapeTask extends RoundTask {
  /** Symbolschlüssel, den diese Karte beim Erfüllen liefert (eindeutig innerhalb der Mission) */
  symbol: SymbolId;
}

export interface EscapeKey {
  uid: string;
  symbol: SymbolId;
  templateId: string;
  at: number;
}

export interface EscapeClock {
  durationMs: number;
  /** Restzeit zum Zeitpunkt `resumedAt` (oder jetzt, wenn die Uhr steht) */
  remainingMs: number;
  /** Zeitpunkt, ab dem die Uhr zuletzt lief; null = Uhr steht */
  resumedAt: number | null;
}

export interface EscapeGift {
  id: string;
  celebrated: boolean;
  at: number;
}

export interface EscapeMission {
  v: 1;
  id: string;
  mode: 'escape';
  catalogVersion: string;
  createdAt: number;
  updatedAt: number;
  /** Zähler gegen veraltete Browser-Tabs */
  rev: number;
  age: EscapeAge;
  season: Season;
  seasonSource: SeasonSource;
  context: ContextTag[];
  minutes: EscapeMinutes;
  seed: number;
  requiredKeys: number;
  /** Anzahl der Karten beim Start (3, 4 oder 5) */
  cardCount: number;
  tasks: EscapeTask[];
  excludedConcepts: string[];
  swaps: number;
  activeIndex: number;
  /** Erhaltene Schlüssel in der Reihenfolge des Erhalts */
  keys: EscapeKey[];
  phase: EscapePhase;
  pauses: PauseReason[];
  clock: EscapeClock;
  outcome: TimeOutcome;
  /** Korrekte Reihenfolge der drei Symbole (nur in der Kombinationsphase) */
  solution: SymbolId[] | null;
  /** Zwei Hinweise für 7–10 (eindeutige Lösung), sonst null */
  clues: Clue[] | null;
  /** Aktuelle Belegung der drei Plätze */
  input: (SymbolId | null)[];
  hints: 0 | 1 | 2;
  /** Tresor wurde mit „Gemeinsam öffnen“ geöffnet */
  helped: boolean;
  gift?: EscapeGift;
}

export interface EscapeParams {
  age: EscapeAge;
  season: Season;
  seasonSource: SeasonSource;
  context: ContextTag[];
  minutes: EscapeMinutes;
}

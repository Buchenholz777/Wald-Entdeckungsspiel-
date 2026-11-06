import type { AgeGroup, ContextTag, RoundTask, Season, SeasonSource } from '../types';

/**
 * Wald Escape – „Knackt den Waldtresor!“: gemeinsame Zeitmission mit Wahlkarten, Schlüsselfragmenten, drei Schlüsseln
 * und einer Symbolkombination. Alles hier ist reine Spiellogik ohne Oberfläche. Die Uhr wird immer aus Zeitpunkten berechnet
 * (nie aus gezählten Ticks) und bekommt die aktuelle Zeit als Parameter, damit Tests mit einer eigenen Uhr arbeiten können.
 *
 * Begriffe: Suchaufgabe (ein konkreter Auftrag) · Fundmenge (Exemplare innerhalb eines Auftrags) · Fragment (ein vollständig
 * erledigter, unterschiedlicher Auftrag) · Schlüssel (2 oder 3 Fragmente) · Tresorziel (immer 3 Schlüssel).
 */

export const ESCAPE_MINUTES = [10, 15, 20, 30] as const;
export type EscapeMinutes = (typeof ESCAPE_MINUTES)[number];

/** Anzahl der Tresorschlüssel. Sie ist immer drei. */
export const KEY_COUNT = 3;
/** Alte Bezeichnung, weiterhin verwendet (gleichbedeutend mit KEY_COUNT). */
export const REQUIRED_KEYS = KEY_COUNT;

/** Aufgaben pro Schlüssel: 2 (kleine Mission), 3 (große Mission). 1 gibt es nur in alten, kompatibel fortgesetzten Missionen. */
export type TasksPerKey = 1 | 2 | 3;
export type NewTasksPerKey = 2 | 3;

export type EscapeSize = 'small' | 'large';

export interface SizeInfo {
  size: EscapeSize;
  tasksPerKey: NewTasksPerKey;
  /** Insgesamt nötige unterschiedliche Aufgaben */
  required: number;
  /** Angestrebte offene Auswahl */
  offered: number;
  label: string;
  /** Standard-Suchzeit in Minuten */
  defaultMinutes: EscapeMinutes;
}

export const SIZES: Record<EscapeSize, SizeInfo> = {
  small: { size: 'small', tasksPerKey: 2, required: 6, offered: 8, label: 'Kleine Schlüsselmission', defaultMinutes: 20 },
  large: { size: 'large', tasksPerKey: 3, required: 9, offered: 12, label: 'Große Schlüsselmission', defaultMinutes: 30 },
};

export const requiredTasks = (tasksPerKey: TasksPerKey): number => KEY_COUNT * tasksPerKey;

export function sizeOf(tasksPerKey: NewTasksPerKey): SizeInfo {
  return tasksPerKey === 3 ? SIZES.large : SIZES.small;
}

/** Escape ist ab 4 Jahren mit erwachsener Begleitung gedacht; das abgebildete Kleinkind ändert das nicht. */
export type EscapeAge = Exclude<AgeGroup, '2-3'>;
export function canPlayEscape(age: AgeGroup | null): age is EscapeAge {
  return age === '4-6' || age === '7-10';
}

/** Standardgröße je Altersgruppe: 4–6 klein (sechs Aufgaben), 7–10 groß (neun Aufgaben). Erwachsene dürfen frei wählen. */
export function defaultSize(age: EscapeAge): EscapeSize {
  return age === '7-10' ? 'large' : 'small';
}

export function toEscapeMinutes(n: unknown): EscapeMinutes {
  return n === 10 || n === 15 || n === 20 || n === 30 ? n : 20;
}

/** Ehrliche Kennzeichnung der Zeitwahl. Die Zeiten sind Ausgangswerte, nicht mit Familien erprobt. */
export function minutesNote(minutes: EscapeMinutes, requiredTasksCount: number): string {
  if (minutes === 10) return `Bewusst kurz, für ${requiredTasksCount} Aufgaben sehr knapp`;
  if (minutes === 15) return 'Zügig';
  if (minutes === 20) return 'Empfohlen für 6 Aufgaben';
  return 'Empfohlen für 9 Aufgaben';
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
 *  combination – alle Schlüssel fertig, Symbolrätsel ohne Countdown
 *  opened – Tresor geöffnet, Geschenk
 *  ended – vorzeitig beendet (ehrlicher Teilabschluss)
 */
export type EscapePhase = 'searching' | 'timeup' | 'free' | 'combination' | 'opened' | 'ended';
export const ESCAPE_PHASES: EscapePhase[] = ['searching', 'timeup', 'free', 'combination', 'opened', 'ended'];

/** Ergebnis der Zeitphase: offen, rechtzeitig geschafft oder abgelaufen. Nie beides. */
export type TimeOutcome = 'open' | 'onTime' | 'expired';

/** Eine Suchkarte. Sie trägt kein eigenes Symbol: Die drei Schlüsselsymbole stehen fest bei der Mission. */
export type EscapeTask = RoundTask;

/** Ein vollständig erledigter Auftrag in der Reihenfolge des Abschlusses (stabile ID der Karte). */
export interface Completed {
  uid: string;
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

/** Regelversion der Mission: 1 = frühere Regel (ein Fund = ein Schlüssel, drei Funde), 2 = Fundgruppen (2 oder 3 Aufträge je Schlüssel). */
export type EscapeRules = 1 | 2;

export interface EscapeMission {
  /** Schema der gespeicherten Mission */
  v: 2;
  id: string;
  mode: 'escape';
  /** Regelversion; alte Missionen bleiben mit Regel 1 kompatibel fortsetzbar */
  rules: EscapeRules;
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
  keyCount: 3;
  tasksPerKey: TasksPerKey;
  /** Anzahl der Karten beim Start */
  cardCount: number;
  tasks: EscapeTask[];
  excludedConcepts: string[];
  swaps: number;
  activeIndex: number;
  /** Die drei festen Schlüsselsymbole (bei Missionsbeginn ausgewählt und gespeichert) */
  keySymbols: SymbolId[];
  /** Vollständig erledigte Aufträge in der Reihenfolge des Abschlusses; Schlüssel und Fragmente werden daraus abgeleitet */
  completed: Completed[];
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
  tasksPerKey: NewTasksPerKey;
}

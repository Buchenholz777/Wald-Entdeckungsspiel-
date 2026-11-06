import type { Rng } from '../rng';
import { SYMBOL_INFO, type Clue, type SymbolId } from './types';

/**
 * Das Symbolrätsel. 4–6: Die Lösung steht als Streifen sichtbar daneben (nachbauen, keine Gedächtnisprüfung).
 * 7–10: zwei kurze Hinweise, die zusammen genau EINE Reihenfolge zulassen (alle sechs Möglichkeiten werden geprüft).
 */

export function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items.slice()];
  const out: T[][] = [];
  items.forEach((x, i) => {
    const rest = items.filter((_, j) => j !== i);
    for (const p of permutations(rest)) out.push([x, ...p]);
  });
  return out;
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Zufällige Reihenfolge der drei erhaltenen Symbole. */
export function makeSolution(symbols: SymbolId[], rng: Rng): SymbolId[] {
  return shuffle(symbols, rng);
}

export function satisfies(order: SymbolId[], c: Clue): boolean {
  const ia = order.indexOf(c.a);
  const ib = c.b === undefined ? -1 : order.indexOf(c.b);
  switch (c.kind) {
    case 'mid':
      return ia === 1;
    case 'left':
      return ia === 0;
    case 'right':
      return ia === order.length - 1;
    case 'leftOf':
      return ia >= 0 && ib >= 0 && ia < ib;
    case 'rightOf':
      return ia >= 0 && ib >= 0 && ia > ib;
    case 'next':
      return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
  }
}

/** Wie viele der sechs Reihenfolgen erfüllen alle Hinweise? Genau 1 ist die Zielvorgabe. */
export function countSolutions(symbols: SymbolId[], clues: Clue[]): number {
  return permutations(symbols).filter((p) => clues.every((c) => satisfies(p, c))).length;
}

/** Alle Hinweise, die für die Lösung stimmen. */
function trueClues(solution: SymbolId[]): Clue[] {
  const out: Clue[] = [];
  for (const a of solution) {
    out.push({ kind: 'mid', a }, { kind: 'left', a }, { kind: 'right', a });
    for (const b of solution) {
      if (a === b) continue;
      out.push({ kind: 'leftOf', a, b }, { kind: 'rightOf', a, b }, { kind: 'next', a, b });
    }
  }
  return out.filter((c) => satisfies(solution, c));
}

/**
 * Zwei Hinweise mit genau einer Lösung. Es werden nur Symbole genannt, die die Familie wirklich erhalten hat.
 * Bevorzugt wird die Mischung „Mitte + links von“ (wie im Beispiel); sonst irgendein eindeutiges Paar.
 */
export function makeClues(solution: SymbolId[], rng: Rng): Clue[] {
  const pool = shuffle(trueClues(solution), rng);
  const pairs: [Clue, Clue][] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      if (countSolutions(solution, [pool[i], pool[j]]) === 1) pairs.push([pool[i], pool[j]]);
    }
  }
  if (pairs.length === 0) throw new Error('Kein eindeutiges Rätsel gefunden');
  const mixed = (x: Clue, y: Clue) => x.kind !== y.kind && [x.kind, y.kind].some((k) => k === 'mid') && [x.kind, y.kind].some((k) => k === 'leftOf' || k === 'rightOf');
  // am liebsten zwei verschiedene Symbole als Thema der Hinweise („Die Eichel liegt in der Mitte. Der Zapfen liegt links vom Blatt.“)
  const best = pairs.filter(([x, y]) => mixed(x, y) && x.a !== y.a);
  const nice = pairs.filter(([x, y]) => mixed(x, y));
  const different = pairs.filter(([x, y]) => x.a !== y.a);
  const pick = (best.length > 0 ? best : nice.length > 0 ? nice : different.length > 0 ? different : pairs)[0];
  // Der Hinweis über die Mitte steht zuerst
  return pick[0].kind === 'mid' ? [pick[0], pick[1]] : pick[1].kind === 'mid' ? [pick[1], pick[0]] : [pick[0], pick[1]];
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const nom = (s: SymbolId) => `${SYMBOL_INFO[s].article} ${SYMBOL_INFO[s].name}`;
/** Dativ nach „von“/„neben“: dem/der */
function dat(s: SymbolId): string {
  return `${SYMBOL_INFO[s].article === 'die' ? 'der' : 'dem'} ${SYMBOL_INFO[s].name}`;
}
function vonDat(s: SymbolId): string {
  const i = SYMBOL_INFO[s];
  return i.article === 'die' ? `von der ${i.name}` : `vom ${i.name}`;
}

export function describeClue(c: Clue): string {
  const a = cap(nom(c.a));
  switch (c.kind) {
    case 'mid':
      return `${a} liegt in der Mitte.`;
    case 'left':
      return `${a} liegt ganz links.`;
    case 'right':
      return `${a} liegt ganz rechts.`;
    case 'leftOf':
      return `${a} liegt links ${vonDat(c.b!)}.`;
    case 'rightOf':
      return `${a} liegt rechts ${vonDat(c.b!)}.`;
    case 'next':
      return `${a} liegt direkt neben ${dat(c.b!)}.`;
  }
}

/** Kleiner Tipp: sagt, welches Symbol ganz links hingehört, ohne die ganze Reihenfolge zu verraten. */
/** Ergebnis eines Versuchs, gegen die tatsächliche Lösung dieser Runde ausgewertet. */
export interface AttemptCheck {
  /** je Platz: steht dort das richtige Zeichen? */
  correct: boolean[];
  allRight: boolean;
  /** der erste Platz, der nicht stimmt (−1, wenn alles stimmt) */
  firstWrong: number;
  /** ein kurzer, konkreter Hinweis, der den nächsten Schritt offenlässt (leer, wenn alles stimmt) */
  message: string;
}

const PLACE_WORD = ['ganz links', 'in der Mitte', 'ganz rechts'];
const ORDINAL = ['erste', 'zweite', 'dritte'];

/**
 * Wertet die eingelegte Folge gegen die Lösung aus. Der Hinweis nennt, was schon stimmt, und zeigt auf genau eine Stelle; er verrät
 * die Lösung nicht. Beispiel: Lösung Tropfen – Pilz – Zapfen, eingelegt Zapfen – Pilz – Tropfen → „Der Pilz in der Mitte stimmt schon.
 * Schau auf das erste Zeichen.“ Passt noch kein Platz, geht es zum ersten Platz und zur Hilfe der Altersstufe (Streifen bei 4–6, Hinweise bei 7–10).
 */
export function checkAttempt(solution: SymbolId[], input: (SymbolId | null)[], aid: 'strip' | 'clues'): AttemptCheck {
  const correct = solution.map((s, i) => input[i] === s);
  const allRight = correct.every(Boolean);
  const firstWrong = correct.indexOf(false);
  if (allRight) return { correct, allRight, firstWrong: -1, message: '' };
  const firstRight = correct.indexOf(true);
  const message =
    firstRight >= 0
      ? `${cap(nom(solution[firstRight]))} ${PLACE_WORD[firstRight]} stimmt schon. Schau auf das ${ORDINAL[firstWrong]} Zeichen.`
      : `Noch passt kein Platz. Schau auf den ersten Platz und ${aid === 'strip' ? 'den Vorlagestreifen' : 'die Hinweise'}.`;
  return { correct, allRight, firstWrong, message };
}

export function tipText(solution: SymbolId[]): string {
  return `Tipp: Ganz links gehört ${nom(solution[0])} hin.`;
}

export function solutionText(solution: SymbolId[]): string {
  return solution.map((s) => SYMBOL_INFO[s].name).join(' – ');
}

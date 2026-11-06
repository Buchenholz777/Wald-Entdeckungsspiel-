import { gifts } from '../catalog/gifts';
import { templatesById } from '../catalog/templates';
import { seededRng, weightedPick, type Rng } from './rng';
import type { Round } from './types';

/**
 * Abschlussprüfung und Geschenkvergabe. Reine Funktionen ohne Oberfläche:
 *  – Eine Mission ist vollständig gefunden, wenn JEDE ihrer vereinbarten Aufgaben `done` ist.
 *    Die vereinbarte Zahl ist `tasks.length`: Der Tausch ersetzt eine Aufgabe, Auslassen und Offenlassen zählen nie als gefunden.
 *    Eine Zählaufgabe ist erst bei ihrer Zielmenge `done`, ein Vergleich nach gemeinsamer Bestätigung.
 *  – Das Geschenk wird beim ersten Mal, an dem die Mission vollständig ist, in genau diesem Zustandsübergang vergeben.
 */
export function isFullyFound(round: Round): boolean {
  return round.tasks.length >= 1 && round.tasks.every((t) => t.status === 'done');
}

/** Anzahl vollständig erfüllter Aufgaben und vereinbarte Gesamtzahl, z. B. „3 von 3“. */
export function foundCounts(round: Round): { done: number; total: number } {
  return { done: round.tasks.filter((t) => t.status === 'done').length, total: round.tasks.length };
}

/**
 * Wählt ein Geschenk: ungelesene bevorzugt, unter diesen solche, die zu den Konzepten der Mission passen.
 * Sind alle bekannt, werden die am längsten nicht erhaltenen wieder angeboten. Die Zufallsfunktion kommt vom Missions-Seed,
 * damit dieselbe Mission immer dasselbe Ergebnis hätte (gespeichert wird es trotzdem sofort).
 */
export function chooseGift(round: Pick<Round, 'tasks' | 'seed'>, received: string[], rng: Rng = seededRng((round.seed ^ 0x9e3779b1) >>> 0)): string {
  const concepts = new Set(round.tasks.map((t) => t.conceptId));
  const themes = new Set(round.tasks.flatMap((t) => templatesById[t.templateId]?.themes ?? []));
  const unread = gifts.filter((g) => !received.includes(g.id));
  // Wenn alles bekannt ist: die Geschenke, die am längsten zurückliegen (Anfang der Liste = am ältesten erhalten)
  const pool = unread.length > 0 ? unread : [...gifts].sort((a, b) => received.indexOf(a.id) - received.indexOf(b.id)).slice(0, Math.max(3, Math.ceil(gifts.length / 3)));
  const picked = weightedPick(
    pool,
    (g) => 1 + g.concepts.filter((c) => concepts.has(c)).length * 4 + g.themes.filter((t) => themes.has(t)).length,
    rng,
  );
  return (picked ?? pool[0]).id;
}

/** Ergebnis der Vergabe als neue Mission: unverändert, wenn es nichts zu vergeben gibt oder das Geschenk schon vergeben wurde. */
export function withGift(round: Round, received: string[], now: number = Date.now()): Round {
  if (round.gift || !round.giftEligible || !isFullyFound(round)) return round;
  return { ...round, gift: { id: chooseGift(round, received), celebrated: false, at: now } };
}

/** Die Feier (Konfetti und Karte) ist noch nicht gezeigt worden. */
export function needsCelebration(round: Round): boolean {
  return Boolean(round.gift) && !round.gift!.celebrated && isFullyFound(round);
}

export function markCelebrated(round: Round): Round {
  return round.gift && !round.gift.celebrated ? { ...round, gift: { ...round.gift, celebrated: true } } : round;
}

/** Merkt ein erhaltenes Geschenk in der Reihenfolge des Erhalts, ohne Doppelte. */
export function rememberGift(received: string[], id: string): string[] {
  return received.includes(id) ? received : [...received, id];
}

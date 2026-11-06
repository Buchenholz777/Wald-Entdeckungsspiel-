import { conceptGroup, templates as defaultTemplates } from '../../catalog/templates';
import { isEligible, materialize, type RoundParams } from '../generator';
import { likelihoodFor, promptFor, titleFor } from '../resolve';
import { weightedPick, type Rng } from '../rng';
import { FOREST, type Family, type Season, type TaskTemplate } from '../types';
import { CARD_COUNT, REQUIRED_KEYS, SYMBOLS, type EscapeAge, type EscapeParams, type EscapeTask, type SymbolId } from './types';

/**
 * Kandidaten für eine faire Zeitmission. Das normale Suchspiel behält seine eigenen Auswahlregeln;
 * für Wald Escape gilt eine ausdrückliche Positivliste einfacher, eindeutiger Einzelbeobachtungen.
 *
 * Bewusst NICHT dabei (stark glücksabhängig, schwer zu prüfen oder nur mit Anfassen/Aufschneiden/Hochheben zu erfüllen):
 * lebende Tiere und Spinnennetze, Tierfährten, Pilze und Baumpilze, Flechten, Gallen, Blattminen, Blattskelette,
 * Farn-Sporen (Unterseite), angenagte Nussschalen und Zapfen, der Zapfenvergleich (zwei Formen nötig).
 * Eine Aufgabe „Y-Zweig“ gibt es im Katalog nicht und wurde nicht neu erfunden.
 */
export const ESCAPE_TEMPLATE_IDS: readonly string[] = [
  'cone',
  'acorn',
  'acorn-cup',
  'hazelnut',
  'beechnut',
  'beech-husk',
  'needle-twig',
  'moss',
  'leaf-hole',
  'maple-leaf',
  'oak-leaf',
  'maple-seed',
  'chestnut',
  'chestnut-husk',
  'fern-frond',
  'beech-bud',
];

/** Obergrenze der Zielmenge: überschaubare kleine Mengen, keine Zusatzketten im Countdown. */
export const MAX_TARGET: Record<EscapeAge, number> = { '4-6': 2, '7-10': 3 };

function roundParams(p: EscapeParams): RoundParams {
  return { age: p.age, environment: FOREST, season: p.season, seasonSource: p.seasonSource, context: p.context, boost: false };
}

/** Alle zulässigen Vorlagen für Alter, Jahreszeit und Kontext (harte Filter). */
export function escapePool(p: EscapeParams, catalog: TaskTemplate[] = defaultTemplates): TaskTemplate[] {
  return catalog.filter((t) => ESCAPE_TEMPLATE_IDS.includes(t.id) && t.completionMode !== 'compare' && isEligible(t, roundParams(p)));
}

/** Zahl der unterschiedlichen Konzepte im Pool (so viele Karten sind höchstens möglich). */
export function poolGroups(pool: TaskTemplate[]): number {
  return new Set(pool.map((t) => conceptGroup(t.conceptId))).size;
}

const FAMILY_SOFT_CAP = 2;

/** Wählt `count` Vorlagen aus verschiedenen Konzepten ohne Zurücklegen; Familien werden gemischt, Häufiges bevorzugt. */
export function pickTemplates(pool: TaskTemplate[], count: number, rng: Rng, p: EscapeParams, excludeGroups: Set<string> = new Set()): TaskTemplate[] {
  const chosen: TaskTemplate[] = [];
  const used = new Set(excludeGroups);
  const families = new Map<Family, number>();
  for (let i = 0; i < count; i++) {
    const groups = new Map<string, TaskTemplate[]>();
    for (const t of pool) {
      const g = conceptGroup(t.conceptId);
      if (used.has(g)) continue;
      groups.set(g, [...(groups.get(g) ?? []), t]);
    }
    const entries = [...groups.entries()];
    if (entries.length === 0) break;
    const pick = weightedPick(
      entries,
      ([, list]) => {
        const best = list[0];
        let w = list.some((t) => likelihoodFor(t, FOREST, p.season) === 'common') ? 2 : 1;
        if (list.some((t) => t.softContext.some((c) => p.context.includes(c)))) w *= 2;
        if ((families.get(best.family) ?? 0) >= FAMILY_SOFT_CAP) w *= 0.2;
        return w;
      },
      rng,
    );
    if (!pick) break;
    const t = pick[1][Math.floor(rng() * pick[1].length)];
    chosen.push(t);
    used.add(pick[0]);
    families.set(t.family, (families.get(t.family) ?? 0) + 1);
  }
  return chosen;
}

/** Wandelt eine Vorlage in eine Karte um: konkreter Auftrag mit begrenzter Menge, Texte und Bild als Snapshot. */
export function toEscapeTask(t: TaskTemplate, p: EscapeParams, rng: Rng, symbol: SymbolId, replacedFrom?: string): EscapeTask {
  const base = materialize(t, roundParams(p), rng, replacedFrom);
  const cap = MAX_TARGET[p.age];
  if (base.target <= cap) return { ...base, symbol };
  const prompt = promptFor(t, p.age, cap);
  return { ...base, target: cap, prompt, title: titleFor(prompt), symbol };
}

/** Ein noch freies Symbol (nicht auf einer Karte und nicht in einem erhaltenen Schlüssel). */
export function freeSymbol(used: SymbolId[], rng: Rng): SymbolId {
  const free = SYMBOLS.filter((s) => !used.includes(s));
  return free[Math.floor(rng() * free.length)] ?? SYMBOLS[0];
}

export interface CandidateResult {
  tasks: EscapeTask[];
  /** Wie viele verschiedene Konzepte der Pool hergibt */
  groups: number;
}

/**
 * Die Karten einer Mission. Weniger als drei verschiedene Konzepte: keine Mission (Aufrufer erklärt das).
 * Bei drei oder vier Karten bleibt das Ziel trotzdem drei Schlüssel.
 */
export function generateCandidates(p: EscapeParams, rng: Rng, catalog: TaskTemplate[] = defaultTemplates): CandidateResult | null {
  const pool = escapePool(p, catalog);
  const groups = poolGroups(pool);
  if (groups < REQUIRED_KEYS) return null;
  const picked = pickTemplates(pool, Math.min(CARD_COUNT, groups), rng, p);
  const order = [...SYMBOLS];
  // feste Zuordnung: jede Karte bekommt ein eigenes Symbol
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { tasks: picked.map((t, i) => toEscapeTask(t, p, rng, order[i])), groups };
}

/** Eine Ersatzkarte für „Andere Spur suchen“: anderes Konzept als alle aktuellen und ausgeschlossenen. */
export function pickReplacement(
  p: EscapeParams,
  currentConcepts: string[],
  excluded: string[],
  usedSymbols: SymbolId[],
  rng: Rng,
  replacedFrom: string,
  catalog: TaskTemplate[] = defaultTemplates,
): EscapeTask | null {
  const skip = new Set([...currentConcepts, ...excluded].map(conceptGroup));
  const pool = escapePool(p, catalog);
  const picked = pickTemplates(pool, 1, rng, p, skip)[0];
  if (!picked) return null;
  return toEscapeTask(picked, p, rng, freeSymbol(usedSymbols, rng), replacedFrom);
}

export type { Season };

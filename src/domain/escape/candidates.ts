import { conceptGroup, templates as defaultTemplates } from '../../catalog/templates';
import { isEligible, materialize, type RoundParams } from '../generator';
import { likelihoodFor, promptFor, titleFor } from '../resolve';
import { weightedPick, type Rng } from '../rng';
import { FOREST, type Family, type TaskTemplate } from '../types';
import { shuffle } from './puzzle';
import { KEY_COUNT, SYMBOLS, requiredTasks, sizeOf, type EscapeAge, type EscapeParams, type EscapeTask, type SymbolId } from './types';

/**
 * Kandidaten für eine faire Zeitmission. Das normale Suchspiel behält seine eigenen Auswahlregeln;
 * für Wald Escape gilt eine ausdrückliche Positivliste einfacher, eindeutiger Einzelbeobachtungen.
 *
 * Bewusst NICHT dabei (stark glücksabhängig, schwer zu prüfen oder nur mit Anfassen/Aufschneiden/Hochheben zu erfüllen):
 * lebende Tiere und Spinnennetze, Tierfährten, Pilze mit Hut, Gallen, Blattminen, Farn-Sporen (Unterseite), der Zapfenvergleich
 * (zwei Formen nötig). Harztropfen und Fraßmuster an Holz wurden nicht aufgenommen: Für beide liegen keine geprüften Fachquellen
 * und keine naturgetreuen Bilder vor.
 * Seltenere Alternativen (Flechte, Baumpilz am Holz, Blattskelett, Nussschale mit Öffnung, abgenagter Zapfen) stehen auf der Liste,
 * werden aber seltener angeboten und sind nie Pflicht: Es werden mehr Karten angeboten, als gebraucht werden.
 */
export const ESCAPE_TEMPLATE_IDS: readonly string[] = [
  'cone',
  'gnawed-cone',
  'acorn',
  'acorn-cup',
  'hazelnut',
  'gnawed-nut',
  'beechnut',
  'beech-husk',
  'needle-twig',
  'y-twig',
  'moss',
  'leaf-hole',
  'leaf-vein-net',
  'leaf-skeleton',
  'lichen',
  'bracket-fungus',
  'maple-leaf',
  'oak-leaf',
  'maple-seed',
  'chestnut',
  'chestnut-husk',
  'fern-frond',
  'beech-bud',
  'hornbeam-fruit',
  'linden-fruit',
  'alder-cone',
];

/** Seltenere Funde: Sie stehen zur Wahl, werden aber nicht bevorzugt. */
const RARE: readonly string[] = ['leaf-skeleton', 'lichen', 'bracket-fungus', 'gnawed-nut', 'gnawed-cone'];

/** Obergrenze der Zielmenge innerhalb eines Auftrags: überschaubare kleine Mengen, keine Zusatzketten im Countdown. */
export const MAX_TARGET: Record<EscapeAge, number> = { '4-6': 2, '7-10': 3 };

function roundParams(p: EscapeParams): RoundParams {
  return { age: p.age, environment: FOREST, season: p.season, seasonSource: p.seasonSource, context: p.context, boost: false };
}

/** Alle zulässigen Vorlagen für Alter, Jahreszeit und Kontext (harte Filter). */
export function escapePool(p: Pick<EscapeParams, 'age' | 'season' | 'seasonSource' | 'context'>, catalog: TaskTemplate[] = defaultTemplates): TaskTemplate[] {
  const rp: RoundParams = { age: p.age, environment: FOREST, season: p.season, seasonSource: p.seasonSource, context: p.context, boost: false };
  return catalog.filter((t) => ESCAPE_TEMPLATE_IDS.includes(t.id) && t.completionMode !== 'compare' && isEligible(t, rp));
}

/** Zahl der unterschiedlichen Konzepte im Pool (so viele verschiedene Aufträge sind höchstens möglich). */
export function poolGroups(pool: TaskTemplate[]): number {
  return new Set(pool.map((t) => conceptGroup(t.conceptId))).size;
}

const FAMILY_SOFT_CAP = 3;

/** Wählt `count` Vorlagen aus verschiedenen Konzepten ohne Zurücklegen; Familien werden gemischt, Häufiges und bestätigte Baumarten bevorzugt. */
export function pickTemplates(pool: TaskTemplate[], count: number, rng: Rng, p: Pick<EscapeParams, 'season' | 'context'>, excludeGroups: Set<string> = new Set()): TaskTemplate[] {
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
        if ((families.get(best.family) ?? 0) >= FAMILY_SOFT_CAP) w *= 0.25;
        if (list.every((t) => RARE.includes(t.id))) w *= 0.35;
        return w;
      },
      rng,
    );
    if (!pick) break;
    // Innerhalb einer Konzeptgruppe bevorzugt die häufigere Vorlage (die Ganzform vor der Sonderform)
    const main = pick[1].filter((t) => !RARE.includes(t.id));
    const list = main.length > 0 && rng() > 0.2 ? main : pick[1];
    const t = list[Math.floor(rng() * list.length)];
    chosen.push(t);
    used.add(pick[0]);
    families.set(t.family, (families.get(t.family) ?? 0) + 1);
  }
  return chosen;
}

/** Wandelt eine Vorlage in eine Karte um: konkreter Auftrag mit begrenzter Menge, Texte und Bild als Snapshot. */
export function toEscapeTask(t: TaskTemplate, p: EscapeParams, rng: Rng, replacedFrom?: string): EscapeTask {
  const base = materialize(t, roundParams(p), rng, replacedFrom);
  const cap = MAX_TARGET[p.age];
  if (base.target <= cap) return base;
  const prompt = promptFor(t, p.age, cap);
  return { ...base, target: cap, prompt, title: titleFor(prompt) };
}

/** Die drei festen Schlüsselsymbole der Mission (bei Missionsbeginn ausgewählt, danach nie geändert). */
export function pickKeySymbols(rng: Rng): SymbolId[] {
  return shuffle([...SYMBOLS], rng).slice(0, KEY_COUNT);
}

export interface PoolInfo {
  /** Wie viele Karten angeboten werden können (0 = diese Größe ist nicht möglich) */
  cards: number;
  /** Verschiedene zulässige Konzepte im Pool */
  groups: number;
  /** Insgesamt nötige Aufträge der gewählten Größe */
  required: number;
}

/** Wie viele Karten bietet eine Mission dieser Größe? Weniger als nötig: keine Mission; weniger als angestrebt: ehrlich weniger. */
export function poolInfo(p: EscapeParams, catalog: TaskTemplate[] = defaultTemplates): PoolInfo {
  const groups = poolGroups(escapePool(p, catalog));
  const required = requiredTasks(p.tasksPerKey);
  const target = sizeOf(p.tasksPerKey).offered;
  return { cards: groups < required ? 0 : Math.min(target, groups), groups, required };
}

export interface CandidateResult {
  tasks: EscapeTask[];
  /** Wie viele verschiedene Konzepte der Pool hergibt */
  groups: number;
}

/**
 * Die Karten einer Mission (8 bei der kleinen, 12 bei der großen Größe, oder ehrlich weniger, mindestens so viele wie nötig).
 * Weniger verschiedene Konzepte als nötig: keine Mission (der Aufrufer erklärt das). Das Ziel sinkt nie.
 */
export function generateCandidates(p: EscapeParams, rng: Rng, catalog: TaskTemplate[] = defaultTemplates): CandidateResult | null {
  const pool = escapePool(p, catalog);
  const groups = poolGroups(pool);
  const need = requiredTasks(p.tasksPerKey);
  if (groups < need) return null;
  const picked = pickTemplates(pool, Math.min(sizeOf(p.tasksPerKey).offered, groups), rng, p);
  return { tasks: picked.map((t) => toEscapeTask(t, p, rng)), groups };
}

/** Eine Ersatzkarte für „Andere Spur suchen“: anderes Konzept als alle aktuellen und ausgeschlossenen. */
export function pickReplacement(
  p: EscapeParams,
  currentConcepts: string[],
  excluded: string[],
  rng: Rng,
  replacedFrom: string,
  catalog: TaskTemplate[] = defaultTemplates,
): EscapeTask | null {
  const skip = new Set([...currentConcepts, ...excluded].map(conceptGroup));
  const pool = escapePool(p, catalog);
  const picked = pickTemplates(pool, 1, rng, p, skip)[0];
  if (!picked) return null;
  return toEscapeTask(picked, p, rng, replacedFrom);
}

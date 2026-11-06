import { CATALOG_VERSION, conceptGroup, templates as defaultTemplates } from '../catalog/templates';
import { buildMission } from './mission';
import { likelihoodFor, promptFor, resolveInfo, titleFor } from './resolve';
import { weightedPick, type Rng } from './rng';
import {
  FOREST,
  THEMES,
  type AgeGroup,
  type ContextTag,
  type Environment,
  type Family,
  type Round,
  type RoundTask,
  type Season,
  type SeasonSource,
  type TaskTemplate,
  type Theme,
} from './types';

export interface RoundParams {
  age: AgeGroup;
  /** Immer „forest“; das Feld bleibt für gespeicherte Runden und die Datenstruktur erhalten. */
  environment: Environment;
  season: Season;
  seasonSource: SeasonSource;
  context: ContextTag[];
  boost: boolean;
}

export interface GenerateParams extends RoundParams {
  count: number;
  rng: Rng;
  seed: number;
  /** Konzepte der letzten Runde: werden bevorzugt vermieden, nicht verboten */
  avoidConcepts?: string[];
  /** Leitmotiv der letzten Mission: wird nach Möglichkeit nicht gleich wiederholt */
  avoidTheme?: Theme;
  /** nur für Tests: Leitmotiv festlegen */
  leadTheme?: Theme;
  now?: number;
  id?: string;
  catalog?: TaskTemplate[];
}

export interface GenerateResult {
  round: Round | null;
  /** Anzahl unterschiedlicher zulässiger Konzepte für diese Auswahl */
  poolConcepts: number;
  reason?: 'empty';
}

/** Harte Grenzen: Alter, Ort, Jahreszeit, Kontext. Nie aufgeweicht. */
export function isEligible(t: TaskTemplate, p: RoundParams): boolean {
  // Ausgemusterte Allgemeinaufgaben (Himmel, Baum, Form ohne Gegenstand …) werden nie neu gezogen oder getauscht.
  if (t.retired) return false;
  if (!t.ageGroups.includes(p.age)) return false;
  if (!t.environments.includes(FOREST)) return false;
  if (!t.seasons.includes(p.season)) return false;
  if (!t.requiredContext.every((tag) => p.context.includes(tag))) return false;
  if (!t.quantityByAge[p.age]?.length) return false;
  return true;
}

export function eligibleTemplates(p: RoundParams, catalog: TaskTemplate[] = defaultTemplates): TaskTemplate[] {
  return catalog.filter((t) => isEligible(t, p));
}

export function distinctConcepts(list: TaskTemplate[]): number {
  return new Set(list.map((t) => conceptGroup(t.conceptId))).size;
}

/** Mengenwahl innerhalb der Vorlage, konservativ: kleinere Mengen sind wahrscheinlicher. */
export function pickQuantity(t: TaskTemplate, age: AgeGroup, boost: boolean, rng: Rng): number {
  if (t.completionMode === 'single') return 1;
  if (t.completionMode === 'compare') return 2;
  const base = t.quantityByAge[age] ?? [1];
  const baseMax = Math.max(...base);
  const boostMax = boost && age !== '2-3' ? t.countingBoostMaxByAge?.[age] : undefined;
  if (boostMax && boostMax > baseMax) {
    const options: number[] = [];
    for (let n = baseMax + 1; n <= boostMax; n++) options.push(n);
    return options[Math.floor(rng() * options.length)];
  }
  return weightedPick(base, (n) => base.length - base.indexOf(n), rng) ?? 1;
}

/** Früchte und Spuren höchstens zweimal je Mission; sonst genügt ein weiches Limit, damit kleine Pools nicht immer dieselben Funde erzwingen. */
const FAMILY_CAP = (family: Family, age: AgeGroup): number => (family === 'abstract' ? (age === '2-3' ? 1 : 2) : family === 'fruits' || family === 'tracks' ? 2 : 3);

interface Pick {
  t: TaskTemplate;
  common: boolean;
}

/** Wählt ohne Zurücklegen die nächste Vorlage. Weiche Ziele treten bei kleinem Pool zurück. */
function pickNext(
  candidates: TaskTemplate[],
  chosen: Pick[],
  slotsLeft: number,
  totalCount: number,
  p: RoundParams,
  avoid: Set<string>,
  rng: Rng,
  lead?: Theme,
): Pick | undefined {
  const usedConcepts = new Set(chosen.map((c) => conceptGroup(c.t.conceptId)));
  let pool = candidates.filter((t) => !usedConcepts.has(conceptGroup(t.conceptId)));
  if (pool.length === 0) return undefined;

  // weich: Die Mission trägt ihr Leitmotiv. Mindestens die Hälfte der Stationen kommt aus dem Leitmotiv,
  // solange der Pool das hergibt. Die ersten Stationen bleiben offen, die letzten füllen auf.
  if (lead && totalCount >= 3) {
    const themeNeed = Math.max(2, Math.ceil(totalCount / 2));
    const themedSoFar = chosen.filter((c) => c.t.themes?.includes(lead)).length;
    if (themedSoFar + slotsLeft <= themeNeed) {
      const themed = pool.filter((t) => t.themes.includes(lead));
      if (themed.length > 0) pool = themed;
    }
  }

  // weich: nicht eine Vergleichsstation nach der anderen (höchstens zwei bei fünf, eine bei weniger Stationen)
  const maxCompare = totalCount >= 5 ? 2 : 1;
  if (chosen.filter((c) => c.t.completionMode === 'compare').length >= maxCompare) {
    const singles = pool.filter((t) => t.completionMode !== 'compare');
    if (singles.length > 0) pool = singles;
  }

  // weich: höchstens zwei Aufgaben je Familie (Formenaufgaben für die Kleinen seltener)
  const familyCount = new Map<Family, number>();
  for (const c of chosen) familyCount.set(c.t.family, (familyCount.get(c.t.family) ?? 0) + 1);
  const capped = pool.filter((t) => (familyCount.get(t.family) ?? 0) < FAMILY_CAP(t.family, p.age));
  if (capped.length > 0) pool = capped;

  // weich: bei einer Fünferrunde mindestens drei häufige Aufgaben
  const needCommon = totalCount >= 5 ? 3 : 0;
  const commonSoFar = chosen.filter((c) => c.common).length;
  if (commonSoFar + slotsLeft <= needCommon) {
    const commons = pool.filter((t) => likelihoodFor(t, FOREST, p.season) === 'common');
    if (commons.length > 0) pool = commons;
  }

  // Jedes Konzept zählt gleich viel, egal wie viele Varianten es hat (sonst gewinnen Blattfarben immer).
  const perConcept = new Map<string, number>();
  for (const c of pool) perConcept.set(conceptGroup(c.conceptId), (perConcept.get(conceptGroup(c.conceptId)) ?? 0) + 1);
  const t = weightedPick(
    pool,
    (c) => {
      let w = likelihoodFor(c, FOREST, p.season) === 'common' ? 2 : 1;
      // Tierbegegnungen sind freiwillige Beobachtungen und kein Standardfund.
      if (c.family === 'animals') w *= 0.4;
      if (lead && c.themes?.includes(lead)) w *= 2.5;
      // Bestätigte Baumarten machen passende Funde wahrscheinlicher, sind aber nie Voraussetzung.
      if (c.softContext?.some((tag) => p.context.includes(tag))) w *= 3;
      w /= perConcept.get(conceptGroup(c.conceptId)) ?? 1;
      return avoid.has(c.conceptId) ? w * 0.25 : w;
    },
    rng,
  );
  if (!t) return undefined;
  return { t, common: likelihoodFor(t, FOREST, p.season) === 'common' };
}

/** Wählt das Leitmotiv der Mission: nur Motive, für die der Pool genug verschiedene Funde hat; das letzte Motiv wird gemieden. */
export function chooseLeadTheme(pool: TaskTemplate[], count: number, avoid: Theme | undefined, rng: Rng): Theme | undefined {
  if (count < 3) return undefined;
  const need = Math.max(2, Math.ceil(count / 2));
  const options: { theme: Theme; w: number }[] = [];
  for (const theme of THEMES) {
    const concepts = new Set(pool.filter((t) => t.themes.includes(theme)).map((t) => t.conceptId));
    // Nur Leitmotive mit etwas Spielraum: Sonst würden immer dieselben wenigen Funde erzwungen.
    if (concepts.size < need + 2) continue;
    options.push({ theme, w: concepts.size * (theme === avoid ? 0.2 : 1) });
  }
  return weightedPick(options, (o) => o.w, rng)?.theme;
}

let uidCounter = 0;
function newUid(rng: Rng): string {
  uidCounter += 1;
  return `t${uidCounter.toString(36)}${Math.floor(rng() * 1e6).toString(36)}`;
}

export function materialize(t: TaskTemplate, p: RoundParams, rng: Rng, replacedFrom?: string): RoundTask {
  const target = pickQuantity(t, p.age, p.boost, rng);
  const prompt = promptFor(t, p.age, target);
  const resolved = resolveInfo(t, p.age, FOREST, p.season);
  return {
    uid: newUid(rng),
    templateId: t.id,
    conceptId: t.conceptId,
    family: t.family,
    mode: t.completionMode,
    target,
    prompt,
    title: titleFor(prompt),
    unit: t.unit,
    compareLabels: t.compareLabels,
    hint: t.hint,
    info: resolved.info,
    special: resolved.special,
    extra: resolved.extra,
    talk: resolved.talk,
    moment: resolved.moment,
    riddle: resolved.riddle,
    image: t.image,
    status: 'open',
    found: 0,
    seen: t.completionMode === 'compare' ? [false, false] : undefined,
    replacedFrom,
  };
}

/**
 * Der Einstieg ist ein konkreter, bevorzugt häufiger Fund. Vergleiche, Formenaufgaben, reine
 * Naturschauspiele (Wellen) und Tierbegegnungen stehen nie am Anfang. Unter den passenden Kandidaten entscheidet die Zufallsfunktion,
 * damit nicht jede Runde mit demselben Motiv beginnt.
 */
/**
 * Gut auffindbare Einstiege (Fassung 4.2): Familien stehen am Waldweg und sollen mit einem Fund beginnen, den sie meist schnell sehen:
 * ein Blatt auf dem Boden, ein Nadelzweig, Moos, ein Zapfen, eine Eichel, ein gegabelter Zweig. Seltenere Funde (Blattskelett, Flechte,
 * Baumpilz, Spuren, Netze, Fraßspuren, Gallen, Hüllen und Knospen) bleiben als spätere oder freiwillige Entdeckung interessant, stehen aber nie
 * am Anfang. „Häufig“ im Katalog (Jahreszeit) reicht dafür nicht: Das Blattskelett gilt im Herbst als häufig, ist aber schwer zu finden.
 */
const EASY_OPENERS: Record<string, number> = {
  'leaf-vein-net': 3,
  'leaf-hole': 2,
  'needle-twig': 2,
  moss: 2,
  cone: 2,
  acorn: 2,
  'y-twig': 2,
  hazelnut: 1,
  beechnut: 1,
  chestnut: 1,
  'fern-frond': 1,
  'maple-leaf': 2,
  'oak-leaf': 1.5,
};
export const isEasyOpener = (templateId: string): boolean => templateId in EASY_OPENERS;

function openingFirst(picks: Pick[], rng: Rng): Pick[] {
  if (picks.length < 2) return picks;
  const easy = picks.filter((p) => isEasyOpener(p.t.id));
  let first: Pick | undefined;
  if (easy.length > 0) {
    first = weightedPick(easy, (p) => EASY_OPENERS[p.t.id], rng);
  } else {
    const concrete = picks.filter((p) => p.t.completionMode !== 'compare' && p.t.family !== 'abstract' && p.t.family !== 'water' && p.t.family !== 'animals');
    const pool = concrete.length > 0 ? concrete : picks;
    const common = pool.filter((p) => p.common);
    const choices = common.length > 0 ? common : pool;
    first = choices[Math.floor(rng() * choices.length)];
  }
  if (!first) return picks;
  return [first, ...picks.filter((p) => p !== first)];
}

/** Hat die Auswahl keinen gut auffindbaren Einstieg, wird die letzte Wahl durch einen passenden aus dem Pool ersetzt (derselbe Filter wie sonst). */
function ensureEasyOpener(chosen: Pick[], pool: TaskTemplate[], rng: Rng, p: RoundParams): Pick[] {
  if (chosen.length < 2 || chosen.some((c) => isEasyOpener(c.t.id))) return chosen;
  const used = new Set(chosen.map((c) => conceptGroup(c.t.conceptId)));
  const candidates = pool.filter((t) => isEasyOpener(t.id) && !used.has(conceptGroup(t.conceptId)) && t.completionMode !== 'compare');
  const pick = weightedPick(candidates, (t) => EASY_OPENERS[t.id], rng);
  if (!pick) return chosen;
  const out = chosen.slice(0, -1);
  out.push({ t: pick, common: likelihoodFor(pick, FOREST, p.season) === 'common' });
  return out;
}
export function generateRound(params: GenerateParams): GenerateResult {
  const catalog = params.catalog ?? defaultTemplates;
  const pool = eligibleTemplates(params, catalog);
  const poolConcepts = distinctConcepts(pool);
  if (pool.length === 0) return { round: null, poolConcepts: 0, reason: 'empty' };

  const count = Math.max(1, Math.min(5, Math.round(params.count)));
  const avoid = new Set(params.avoidConcepts ?? []);
  const lead = params.leadTheme ?? chooseLeadTheme(pool, count, params.avoidTheme, params.rng);
  const chosen: Pick[] = [];
  for (let slot = 0; slot < count; slot++) {
    const next = pickNext(pool, chosen, count - slot, count, params, avoid, params.rng, lead);
    if (!next) break; // Pool erschöpft: ehrliche kleinere Runde, kein Auffüllen
    chosen.push(next);
  }
  const ordered = openingFirst(ensureEasyOpener(chosen, pool, params.rng, params), params.rng);
  const tasks = ordered.map((c) => materialize(c.t, params, params.rng));

  let notice: string | undefined;
  if (tasks.length < count) {
    notice =
      tasks.length === 1
        ? 'Für diese Auswahl gibt es gerade nur eine passende Station. Mit „Mission anpassen“ könnt ihr Jahreszeit oder Angaben ändern.'
        : `Für diese Auswahl gibt es gerade nur ${tasks.length} passende Stationen. Mit „Mission anpassen“ könnt ihr Jahreszeit oder Angaben ändern.`;
  }

  const round: Round = {
    id: params.id ?? `r${(params.now ?? Date.now()).toString(36)}${Math.floor(params.rng() * 1e6).toString(36)}`,
    catalogVersion: CATALOG_VERSION,
    createdAt: params.now ?? Date.now(),
    age: params.age,
    environment: FOREST,
    season: params.season,
    seasonSource: params.seasonSource,
    context: [...params.context],
    requestedCount: count,
    boost: params.boost,
    seed: params.seed,
    tasks,
    excludedConcepts: [],
    activeIndex: 0,
    notice,
    mission: buildMission(params.age, tasks, (id) => catalog.find((t) => t.id === id)?.themes, lead),
    finished: false,
    giftEligible: true,
  };
  return { round, poolConcepts };
}

/** Alles, was „Tausch rückgängig“ braucht: die ersetzte Aufgabe mit ihrem Zählstand und die vorherige Ausschlussliste. */
export interface SwapUndo {
  /** uid der neuen Aufgabe (die wieder verschwindet) */
  newUid: string;
  /** die ursprüngliche Aufgabe, unverändert mit Teilfortschritt */
  previous: RoundTask;
  previousExcluded: string[];
}

export interface ReplaceResult {
  round: Round | null;
  reason?: 'no-alternative';
  undo?: SwapUndo;
}

/**
 * „Tausch rückgängig“: stellt genau die ersetzte Aufgabe wieder her, bei einer Zählaufgabe samt vorherigem Teilfortschritt, und die frühere
 * Ausschlussliste. Alle anderen Aufgaben, ihre Funde und der Missionstitel bleiben unberührt. Ohne passende neue Aufgabe geschieht nichts.
 */
export function restoreSwap(round: Round, undo: SwapUndo): Round {
  const i = round.tasks.findIndex((t) => t.uid === undo.newUid);
  if (i < 0) return round;
  const tasks = round.tasks.slice();
  tasks[i] = undo.previous;
  return { ...round, tasks, excludedConcepts: undo.previousExcluded };
}

/**
 * „Hier nicht zu finden“: ersetzt nur die gewählte Aufgabe. Dasselbe Konzept wird für diese Runde ausgeschlossen.
 * Gleiche Alters-, Orts-, Jahreszeit- und Kontextregeln wie bei der ersten Auswahl. Kein stilles Aufweichen.
 */
export function replaceTask(round: Round, uid: string, rng: Rng, catalog: TaskTemplate[] = defaultTemplates): ReplaceResult {
  const index = round.tasks.findIndex((t) => t.uid === uid);
  if (index < 0) return { round: null, reason: 'no-alternative' };
  const old = round.tasks[index];
  const excluded = new Set([...round.excludedConcepts, old.conceptId].map(conceptGroup));
  const others = round.tasks.filter((_, i) => i !== index);
  const usedConcepts = new Set(others.map((t) => conceptGroup(t.conceptId)));
  const p: RoundParams = {
    age: round.age,
    environment: FOREST,
    season: round.season,
    seasonSource: round.seasonSource,
    context: round.context,
    boost: round.boost,
  };
  const candidates = eligibleTemplates(p, catalog).filter((t) => !excluded.has(conceptGroup(t.conceptId)) && !usedConcepts.has(conceptGroup(t.conceptId)));
  if (candidates.length === 0) return { round: null, reason: 'no-alternative' };

  const lead = round.mission?.theme;
  const chosen: Pick[] = others.map((t) => ({
    t: { family: t.family, conceptId: t.conceptId, completionMode: t.mode, themes: catalog.find((c) => c.id === t.templateId)?.themes ?? [] } as TaskTemplate,
    common: false,
  }));
  const next = pickNext(candidates, chosen, 1, round.tasks.length, p, new Set(), rng, lead);
  if (!next) return { round: null, reason: 'no-alternative' };

  const replacement = materialize(next.t, p, rng, old.templateId);
  const tasks = round.tasks.slice();
  tasks[index] = replacement;
  return {
    round: {
      ...round,
      tasks,
      excludedConcepts: [...excluded],
      notice: undefined,
      // Missionstitel und Einleitung bleiben beim Tausch erhalten; nur diese eine Aufgabe wechselt.
      mission: round.mission,
    },
    undo: { newUid: replacement.uid, previous: old, previousExcluded: round.excludedConcepts },
  };
}

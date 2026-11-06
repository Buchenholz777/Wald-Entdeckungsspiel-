import { generateRound } from '../src/domain/generator';
import { seededRng } from '../src/domain/rng';
import { FOREST, type AgeGroup, type ContextTag, type Environment, type Season } from '../src/domain/types';

export interface Tally {
  runs: number;
  /** Anteil der Runden, in denen das Konzept vorkommt */
  share: Record<string, number>;
  /** Aufgaben-IDs, die gezogen wurden */
  templates: Record<string, number>;
  rounds: string[][];
}

/** Zieht viele Runden mit festen Seeds und zählt, welche Konzepte tatsächlich erscheinen. */
export function tally(opts: { age: AgeGroup; environment?: Environment; season: Season; context?: ContextTag[]; count?: number; runs?: number; boost?: boolean }): Tally {
  const runs = opts.runs ?? 400;
  const concepts: Record<string, number> = {};
  const templates: Record<string, number> = {};
  const rounds: string[][] = [];
  for (let seed = 1; seed <= runs; seed++) {
    const r = generateRound({
      age: opts.age,
      environment: opts.environment ?? FOREST,
      season: opts.season,
      seasonSource: 'auto',
      context: opts.context ?? [],
      boost: opts.boost ?? false,
      count: opts.count ?? (opts.age === '2-3' ? 3 : 5),
      seed,
      rng: seededRng(seed * 7919),
      now: 1_700_000_000_000,
    }).round;
    if (!r) continue;
    rounds.push(r.tasks.map((t) => t.templateId));
    for (const c of new Set(r.tasks.map((t) => t.conceptId))) concepts[c] = (concepts[c] ?? 0) + 1;
    for (const t of r.tasks) templates[t.templateId] = (templates[t.templateId] ?? 0) + 1;
  }
  const share = Object.fromEntries(Object.entries(concepts).map(([k, v]) => [k, v / runs]));
  return { runs, share, templates, rounds };
}

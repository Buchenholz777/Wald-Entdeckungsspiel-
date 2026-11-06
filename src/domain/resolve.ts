import { concepts } from '../catalog/concepts';
import { extras, thinkQuestions } from '../catalog/extras';
import { infos } from '../catalog/infos';
import type { AgeGroup, DiscoveryTexts, Environment, Likelihood, Season, TaskTemplate } from './types';

/** Redaktionelle Einschätzung der Fundwahrscheinlichkeit für Ort und Jahreszeit. */
export function likelihoodFor(t: TaskTemplate, env: Environment, season: Season): Likelihood {
  const byEnv = t.availabilityByEnv?.[env];
  if (byEnv) return byEnv;
  return t.availabilityBySeason?.[season] ?? t.availability;
}

export function promptFor(t: TaskTemplate, age: AgeGroup, n: number): string {
  const p = t.promptByAge?.[age] ?? t.prompt;
  if (n <= 1 || !p.many) return p.one;
  return p.many.replace('{n}', String(n));
}

export function titleFor(prompt: string): string {
  return prompt.replace(/\.$/, '');
}

export interface ResolvedInfo {
  /** whatIsIt und origin sind Teil der Info; whereToLook ist der getrennte Suchhinweis */
  info: DiscoveryTexts;
  /** „Was ist daran besonders?“ */
  special?: string;
  /** Zusatzgedanke, nur 7–10 */
  extra?: string;
  /** Freiwilliger Beobachtungsimpuls nach dem Fund */
  moment?: string;
  /** Bilderrätsel, nur 4–6 */
  riddle?: { text: string; name: string };
  talk?: string;
}

/**
 * Wählt die Texte passend zu Alter, Ort und Jahreszeit.
 * 2–3 Jahre: ein kurzer Satz je Baustein. 4–6: konkrete Zusammenhänge. 7–10: zusätzlich ein Zusatzgedanke.
 * Der Suchhinweis (whereToLook) wird bewusst getrennt von „Was ist das / Woher / Was ist besonders“ geführt.
 */
export function resolveInfo(t: TaskTemplate, age: AgeGroup, env: Environment, season: Season): ResolvedInfo {
  const concept = concepts[t.conceptId];
  if (!concept) throw new Error(`Konzept fehlt: ${t.conceptId}`);
  const ex = extras[t.conceptId];
  const o = t.infoOverride;
  // Die ausgearbeiteten Objektinfos (drei Bausteine je Altersgruppe) haben Vorrang. Alte Vorlagen ohne Eintrag
  // (ausgemustert, nur noch für gespeicherte Runden) behalten ihre früheren Texte.
  const rich = infos[t.id]?.[age];
  if (age === '2-3') {
    const base = concept.young;
    const oy = o?.young;
    if (!base) throw new Error(`Texte für 2–3 fehlen: ${t.conceptId}`);
    return {
      info: {
        whatIsIt: rich?.what ?? oy?.whatIsIt ?? base.whatIsIt,
        origin: rich?.origin ?? oy?.origin ?? base.origin,
        whereToLook: oy?.whereToLook ?? base.whereToLook,
      },
      special: rich?.secret ?? o?.special?.young ?? ex?.sy,
      moment: o?.moment?.young ?? ex?.my,
    };
  }
  const om = o?.mid;
  let where = om?.whereToLook ?? concept.lookByEnv?.[env] ?? concept.mid.whereToLook;
  if (!om?.whereToLook) {
    const seasonal = concept.lookBySeason?.[season];
    if (seasonal) where = `${where} ${seasonal}`;
  }
  const extra =
    age === '7-10'
      ? rich?.more ?? ([o?.extra ?? ex?.ex ?? concept.extra, thinkQuestions[t.conceptId]].filter(Boolean).join(' ') || undefined)
      : undefined;
  return {
    info: {
      whatIsIt: rich?.what ?? om?.whatIsIt ?? concept.mid.whatIsIt,
      origin: rich?.origin ?? om?.origin ?? concept.mid.origin,
      whereToLook: where,
    },
    special: rich?.secret ?? o?.special?.mid ?? ex?.sm,
    extra,
    moment: o?.moment?.mid ?? ex?.mm,
    riddle: age === '4-6' && ex?.rid ? { text: ex.rid[0], name: ex.rid[1] } : undefined,
    talk: concept.talk,
  };
}

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Wörter der Info (ohne Suchhinweis): Was ist das, Woher, Besonderheit, bei 7–10 der Zusatzgedanke. */
export function infoWordCount(r: ResolvedInfo): number {
  return words([r.info.whatIsIt, r.info.origin, r.special ?? '', r.extra ?? ''].join(' '));
}

/** Wörter der drei Basis-Bausteine inklusive Suchhinweis (ältere Zählweise). */
export function wordCount(texts: DiscoveryTexts): number {
  return words(Object.values(texts).join(' '));
}

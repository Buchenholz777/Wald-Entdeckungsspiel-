import { giftsById } from '../catalog/gifts';
import { templates } from '../catalog/templates';
import { FOREST, GAME_MODES, THEMES, type AgeGroup, type ContextTag, type Environment, type GameMode, type Round, type Settings, type Theme } from './types';

/**
 * Versionierte lokale Speicherung. Alles ist abgesichert: blockierter, voller oder beschädigter
 * Browserspeicher führt nie zum Absturz, die Runde bleibt im Arbeitsspeicher nutzbar.
 */

export const STORAGE_VERSION = 1;
export const ROUND_KEY = `entdeckerzeit:v${STORAGE_VERSION}:round`;
export const SETTINGS_KEY = `entdeckerzeit:v${STORAGE_VERSION}:settings`;
/** Gespeicherte Runden früherer Orte (vor dem Wald-Umbau): bleiben erhalten und werden nur noch angezeigt. */
export const ARCHIVE_KEY = `entdeckerzeit:v${STORAGE_VERSION}:archive`;

export type LoadStatus = 'ok' | 'empty' | 'corrupt' | 'blocked' | 'archived';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function browserStore(): KeyValueStore | null {
  try {
    const s = window.localStorage;
    const probe = '__entdeckerzeit_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export const DEFAULT_SETTINGS: Settings = {
  age: null,
  environment: null,
  taskCount: null,
  boost: false,
  context: [],
  motionOff: false,
  showMoreEnvironments: false,
  lastRoundConcepts: [],
  lastRoundTheme: null,
  legacyNoticePending: false,
  giftsReceived: [],
  mode: 'treasure',
  escapeMinutes: null,
  escapeSize: null,
};

const templatesById = new Map(templates.map((t) => [t.id, t]));

const AGES: AgeGroup[] = ['2-3', '4-6', '7-10'];
const ENVS: Environment[] = ['forest', 'park', 'city', 'beach', 'meadow', 'garden', 'playground', 'mountain', 'water'];
const CONTEXTS: ContextTag[] = ['conifers', 'maple', 'oak', 'chestnut', 'sand', 'gravel', 'shadow', 'puddles', 'snow', 'hazel', 'beech', 'mud', 'fern', 'hornbeam', 'linden', 'alder'];

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function sanitizeSettings(raw: unknown): Settings {
  const out: Settings = { ...DEFAULT_SETTINGS };
  if (!isObj(raw)) return out;
  if (AGES.includes(raw.age as AgeGroup)) out.age = raw.age as AgeGroup;
  // Es gibt nur noch den Wald. Ein früher gewählter anderer Ort wird nicht übernommen (die Altdaten bleiben unberührt).
  out.environment = null;
  if (THEMES.includes(raw.lastRoundTheme as Theme)) out.lastRoundTheme = raw.lastRoundTheme as Theme;
  out.legacyNoticePending = raw.legacyNoticePending === true;
  if (Array.isArray(raw.giftsReceived)) {
    const seen: string[] = [];
    for (const id of raw.giftsReceived) if (typeof id === 'string' && giftsById[id] && !seen.includes(id)) seen.push(id);
    out.giftsReceived = seen;
  }
  // „Walddetektive“ ist noch nicht spielbar: Eine aus einer älteren Sitzung gespeicherte Auswahl öffnet wieder „Waldschätze suchen“.
  if (GAME_MODES.includes(raw.mode as GameMode) && raw.mode !== 'detective') out.mode = raw.mode as GameMode;
  // Ältere Einstellungen kennen die Größe noch nicht: Ihr früherer Standardwert (15) war nie eine bewusste Wahl und gilt nicht weiter.
  if ('escapeSize' in raw) {
    if (raw.escapeMinutes === 10 || raw.escapeMinutes === 15 || raw.escapeMinutes === 20 || raw.escapeMinutes === 30) out.escapeMinutes = raw.escapeMinutes;
    if (raw.escapeSize === 'small' || raw.escapeSize === 'large') out.escapeSize = raw.escapeSize;
  }
  if (typeof raw.taskCount === 'number' && raw.taskCount >= 1 && raw.taskCount <= 5) out.taskCount = Math.round(raw.taskCount);
  out.boost = raw.boost === true;
  out.motionOff = raw.motionOff === true;
  out.showMoreEnvironments = raw.showMoreEnvironments === true;
  if (Array.isArray(raw.context)) out.context = raw.context.filter((c): c is ContextTag => CONTEXTS.includes(c as ContextTag));
  if (Array.isArray(raw.lastRoundConcepts)) out.lastRoundConcepts = raw.lastRoundConcepts.filter((c): c is string => typeof c === 'string').slice(0, 12);
  return out;
}

/** Strukturprüfung einer gespeicherten Runde. Gibt `null` zurück, wenn sie nicht brauchbar ist. */
export function sanitizeRound(raw: unknown): Round | null {
  if (!isObj(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  if (!AGES.includes(raw.age as AgeGroup)) return null;
  if (!ENVS.includes(raw.environment as Environment)) return null;
  if (!['spring', 'summer', 'autumn', 'winter'].includes(raw.season as string)) return null;
  if (!Array.isArray(raw.tasks) || raw.tasks.length < 1 || raw.tasks.length > 5) return null;
  for (const t of raw.tasks) {
    if (!isObj(t)) return null;
    if (typeof t.uid !== 'string' || typeof t.prompt !== 'string') return null;
    if (typeof t.target !== 'number' || t.target < 1 || t.target > 10) return null;
    if (typeof t.found !== 'number' || t.found < 0 || t.found > t.target) return null;
    if (!['open', 'done', 'skipped'].includes(t.status as string)) return null;
    if (!['single', 'count', 'compare'].includes(t.mode as string)) return null;
    if (!isObj(t.info) || typeof t.info.whatIsIt !== 'string' || typeof t.info.origin !== 'string' || typeof t.info.whereToLook !== 'string') return null;
    if (!isObj(t.image) || typeof t.image.illustrationKey !== 'string' || typeof t.image.alt !== 'string') return null;
    if (t.mode === 'compare' && !(Array.isArray(t.seen) && t.seen.length === 2)) return null;
  }
  const r = raw as unknown as Round;
  const activeIndex = typeof r.activeIndex === 'number' ? Math.max(0, Math.min(r.tasks.length - 1, Math.round(r.activeIndex))) : 0;
  // Waldgeschenk: nur ein bekanntes Geschenk mit gültigen Feldern wird übernommen, sonst gilt die Runde als ohne Geschenk.
  const g = (raw as { gift?: unknown }).gift;
  const gift =
    isObj(g) && typeof g.id === 'string' && giftsById[g.id]
      ? { id: g.id, celebrated: g.celebrated === true, at: typeof g.at === 'number' ? g.at : 0 }
      : undefined;
  return {
    ...r,
    // Bildangaben (Schlüssel, Beschreibung, Erkennungsmerkmale) kommen immer aus dem aktuellen Katalog: Eine vor einem Update
    // gespeicherte Runde zeigt so das neue, naturgetreue Suchbild mit passender Beschreibung. Aufgaben, Zähler und Geschenk bleiben unberührt.
    tasks: r.tasks.map((t) => {
      const tpl = templatesById.get(t.templateId);
      return tpl ? { ...t, image: tpl.image } : t;
    }),
    context: Array.isArray(r.context) ? r.context.filter((c) => CONTEXTS.includes(c)) : [],
    excludedConcepts: Array.isArray(r.excludedConcepts) ? r.excludedConcepts.filter((c) => typeof c === 'string') : [],
    activeIndex,
    finished: r.finished === true,
    // Ältere Runden (ohne Feld) sind nicht geschenkberechtigt: Sie bekommen nie rückwirkend Konfetti oder Geschenk.
    giftEligible: r.giftEligible === true,
    gift,
  };
}

export interface Persistence {
  /** `archived`: Die gespeicherte Runde gehörte zu einem früheren Ort. Sie wurde ins Archiv verschoben (nicht gelöscht). */
  loadRound(): { status: LoadStatus; round: Round | null };
  loadArchive(): Round | null;
  saveRound(round: Round | null): boolean;
  loadSettings(): { status: LoadStatus; settings: Settings };
  saveSettings(settings: Settings): boolean;
  available: boolean;
}

export function createPersistence(store: KeyValueStore | null): Persistence {
  return {
    available: store !== null,
    loadRound() {
      if (!store) return { status: 'blocked', round: null };
      try {
        const text = store.getItem(ROUND_KEY);
        if (text === null) return { status: 'empty', round: null };
        const parsed: unknown = JSON.parse(text);
        if (!isObj(parsed) || parsed.v !== STORAGE_VERSION) throw new Error('Version');
        const round = sanitizeRound(parsed.round);
        if (!round) throw new Error('Struktur');
        if (round.environment !== FOREST) {
          // Frühere Runde eines anderen Ortes: nicht löschen und nicht umdeuten, sondern unverändert archivieren.
          store.setItem(ARCHIVE_KEY, text);
          store.removeItem(ROUND_KEY);
          return { status: 'archived', round: null };
        }
        return { status: 'ok', round };
      } catch {
        try {
          store.removeItem(ROUND_KEY);
        } catch {
          /* ignorieren */
        }
        return { status: 'corrupt', round: null };
      }
    },
    loadArchive() {
      if (!store) return null;
      try {
        const text = store.getItem(ARCHIVE_KEY);
        if (text === null) return null;
        const parsed: unknown = JSON.parse(text);
        if (!isObj(parsed)) return null;
        return sanitizeRound(parsed.round);
      } catch {
        return null;
      }
    },
    saveRound(round) {
      if (!store) return false;
      try {
        if (round === null) store.removeItem(ROUND_KEY);
        else store.setItem(ROUND_KEY, JSON.stringify({ v: STORAGE_VERSION, savedAt: Date.now(), round }));
        return true;
      } catch {
        return false;
      }
    },
    loadSettings() {
      if (!store) return { status: 'blocked', settings: { ...DEFAULT_SETTINGS } };
      try {
        const text = store.getItem(SETTINGS_KEY);
        if (text === null) return { status: 'empty', settings: { ...DEFAULT_SETTINGS } };
        const parsed: unknown = JSON.parse(text);
        if (!isObj(parsed) || parsed.v !== STORAGE_VERSION) throw new Error('Version');
        return { status: 'ok', settings: sanitizeSettings(parsed.settings) };
      } catch {
        return { status: 'corrupt', settings: { ...DEFAULT_SETTINGS } };
      }
    },
    saveSettings(settings) {
      if (!store) return false;
      try {
        store.setItem(SETTINGS_KEY, JSON.stringify({ v: STORAGE_VERSION, settings }));
        return true;
      } catch {
        return false;
      }
    },
  };
}

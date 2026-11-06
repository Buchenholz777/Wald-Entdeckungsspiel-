import type { AgeGroup, ContextTag, Environment, Season, Theme } from './types';

/** Das Spiel kennt nur noch den Wald. Es gibt keine Ortsauswahl. */
export const ENVIRONMENTS: { id: Environment; label: string }[] = [{ id: 'forest', label: 'Wald' }];

/** Bezeichnungen früherer Orte, nur für die schreibgeschützte Ansicht alter, archivierter Runden. */
export const ENVIRONMENT_LONG: Record<Environment, string> = {
  forest: 'Wald',
  park: 'Park',
  city: 'Stadt & Wohnviertel',
  beach: 'Strand',
  meadow: 'Wiese',
  garden: 'Garten',
  playground: 'Spielplatz',
  mountain: 'Berge & Wanderweg',
  water: 'See & Bachufer',
};

export const SEASON_LABEL: Record<Season, string> = {
  spring: 'Frühling',
  summer: 'Sommer',
  autumn: 'Herbst',
  winter: 'Winter',
};

export const AGE_LABEL: Record<AgeGroup, string> = {
  '2-3': '2–3 Jahre',
  '4-6': '4–6 Jahre',
  '7-10': '7–10 Jahre',
};

export const AGE_SUBLINE: Record<AgeGroup, string> = {
  '2-3': 'Schauen und zeigen',
  '4-6': 'Zählen und vergleichen',
  '7-10': 'Genau hinschauen',
};

export const DEFAULT_TASK_COUNT: Record<AgeGroup, number> = { '2-3': 3, '4-6': 5, '7-10': 5 };

export const CONTEXT_LABEL: Record<ContextTag, string> = {
  conifers: 'Nadelbäume vorhanden',
  maple: 'Ahorn vorhanden',
  oak: 'Eiche vorhanden',
  chestnut: 'Rosskastanie vorhanden',
  sand: 'Sand vorhanden',
  gravel: 'Kies vorhanden',
  shadow: 'Sonne/Schatten sichtbar',
  puddles: 'Pfützen vorhanden',
  snow: 'Schnee vorhanden',
  hazel: 'Haselstrauch vorhanden',
  beech: 'Buche vorhanden',
  mud: 'Weicher Boden oder Matsch',
  fern: 'Farn vorhanden',
};

/** Kontextangaben im Wald (jede muss mindestens eine Vorlage freischalten). Frühere Orte bieten nichts mehr an. */
export const CONTEXT_BY_ENV: Record<Environment, ContextTag[]> = {
  forest: ['conifers', 'beech', 'oak', 'maple', 'hazel', 'chestnut', 'fern', 'mud'],
  park: [],
  city: [],
  beach: [],
  meadow: [],
  garden: [],
  playground: [],
  mountain: [],
  water: [],
};

/**
 * Leitmotive der Waldmissionen: Titel und Vorlesesatz (nur wenn jede Station passt) sowie `focus`,
 * die Wendung für gemischte Missionen („Heute suchen wir vor allem …“).
 */
export const THEME_INFO: Record<Theme, { title: string; line: string; focus: string }> = {
  growth: { title: 'Wie aus Kleinem ein Baum wird', line: 'Heute suchen wir Samen, Früchte und kleine Anfänge: Hier fängt vieles an, was später groß wird.', focus: 'Samen, Früchte und kleine Anfänge' },
  gnawed: { title: 'Wer hat hier geknabbert?', line: 'Heute suchen wir Spuren, die Tiere hinterlassen haben. Wer es war, könnt ihr nur vermuten.', focus: 'Spuren, die Tiere hinterlassen haben' },
  water: { title: 'Das kleine Wald-Wasserwunder', line: 'Heute suchen wir Dinge, die Feuchtigkeit lieben und im Wald viel Wasser halten.', focus: 'Dinge, die Feuchtigkeit lieben' },
  decay: { title: 'Aus Alt wird Neues', line: 'Heute suchen wir, wie im Wald aus Altem wieder Neues wird.', focus: 'Zeichen dafür, wie aus Altem wieder Neues wird' },
  pattern: { title: 'Muster, die Geschichten erzählen', line: 'Heute suchen wir Muster im Wald. Jedes erzählt ein Stück Geschichte.', focus: 'Muster im Wald' },
  year: { title: 'Der Wald im Jahreslauf', line: 'Heute schauen wir, woran man die Jahreszeit im Wald erkennt.', focus: 'Zeichen der Jahreszeit' },
};

/** Einfacher Produktvorschlag nach lokalem Gerätemonat – keine Naturvorhersage. */
export function suggestSeason(date: Date = new Date()): Season {
  const m = date.getMonth(); // 0 = Januar
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

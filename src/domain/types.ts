// Gemeinsame Typen für Katalog, Generator und Rundenstatus.

export type AgeGroup = '2-3' | '4-6' | '7-10';
export const AGE_GROUPS: AgeGroup[] = ['2-3', '4-6', '7-10'];

export type Environment =
  | 'forest'
  | 'park'
  | 'city'
  | 'beach'
  | 'meadow'
  | 'garden'
  | 'playground'
  | 'mountain'
  | 'water';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

/** Freiwillige Kontextangaben. Unbekannt = nicht erfüllt. */
export type ContextTag =
  | 'conifers'
  | 'maple'
  | 'oak'
  | 'chestnut'
  | 'sand'
  | 'gravel'
  | 'shadow'
  | 'puddles'
  | 'snow'
  | 'hazel'
  | 'beech'
  | 'mud'
  | 'fern'
  | 'hornbeam'
  | 'linden'
  | 'alder';

/** Leitmotive der Waldmissionen (redaktionell, siehe docs/SPIELKONZEPT.md). */
export type Theme = 'growth' | 'gnawed' | 'water' | 'decay' | 'pattern' | 'year';
export const THEMES: Theme[] = ['growth', 'gnawed', 'water', 'decay', 'pattern', 'year'];

/** Das Spiel kennt nur noch den Wald. Die Konstante bleibt für gespeicherte Runden und die Datenstruktur. */
export const FOREST: Environment = 'forest';

export type CompletionMode = 'single' | 'count' | 'compare';
export type Likelihood = 'common' | 'situational';
export type LearningFocus = 'discover' | 'count' | 'compare' | 'shape' | 'color' | 'pattern';

export type Family =
  | 'plants'
  | 'trees'
  | 'ground'
  | 'abstract'
  | 'urban'
  | 'play'
  | 'water'
  | 'sky'
  | 'beach'
  | 'rock'
  | 'animals'
  | 'fruits'
  | 'tracks'
  | 'fungi'
  | 'decay';

export type AnimationPreset =
  | 'float'
  | 'sway'
  | 'settle'
  | 'grow'
  | 'ripple'
  | 'wave'
  | 'bob'
  | 'swing'
  | 'flutter'
  | 'draw';

/** Texte in drei Altersstufen. 2–3: ein kurzer Satz je Baustein. */
export interface DiscoveryTexts {
  whatIsIt: string;
  origin: string;
  whereToLook: string;
}

export interface ConceptInfo {
  conceptId: string;
  /** Name für Hilfsüberschriften und Bildübersicht */
  label: string;
  /** 2–3 Jahre; Pflicht, sobald eine Vorlage des Konzepts für 2–3 zugelassen ist */
  young?: DiscoveryTexts;
  mid: DiscoveryTexts; // 4–6
  /** Optionaler zusätzlicher, nachvollziehbarer Zusammenhang für 7–10 */
  extra?: string;
  /** Orts- oder saisonspezifische Suchhinweise (Ergänzung zu whereToLook) */
  lookByEnv?: Partial<Record<Environment, string>>;
  lookBySeason?: Partial<Record<Season, string>>;
  /** Offener Gesprächsimpuls, kein Quiz */
  talk?: string;
  /** Interne Belege, nie im Kindertext */
  factSources: string[];
}

export interface ImagePackage {
  /** Schlüssel der mitgelieferten Illustration (SVG-Komponente) */
  illustrationKey: string;
  /** Standbild = dieselbe Illustration ohne Bewegung */
  animationPreset: AnimationPreset;
  variantTags: string[];
  recognitionFeatures: string[];
  alt: string;
}

/** Zusatztexte je Konzept (Besonderheit, Entdeckermoment, Rätsel, Zusatzgedanke für 7–10) */
export interface ConceptExtras {
  /** „Was ist daran besonders?“ für 2–3 Jahre */
  sy: string;
  /** … für 4–6 und 7–10 */
  sm: string;
  /** Entdeckermoment für 2–3 */
  my: string;
  /** Entdeckermoment für 4–10 */
  mm: string;
  /** Zusatzgedanke für 7–10 (ersetzt `extra` des Konzepts) */
  ex?: string;
  /** Bilderrätsel für 4–6: Text und Name */
  rid?: [string, string];
}

export interface TaskTemplate {
  id: string;
  /** Nummer der Ausgangsidee im Anhang A */
  sourceNo: number;
  conceptId: string;
  family: Family;
  environments: Environment[];
  seasons: Season[];
  minAge: 2 | 4 | 7;
  ageGroups: AgeGroup[];
  difficulty: 1 | 2 | 3;
  focus: LearningFocus;
  completionMode: CompletionMode;
  /** Zulässige Zielmengen je Altersgruppe */
  quantityByAge: Partial<Record<AgeGroup, number[]>>;
  /** Obergrenze bei „Mehr zählen“; nur ausdrücklich markierte Vorlagen */
  countingBoostMaxByAge?: Partial<Record<AgeGroup, number>>;
  requiredContext: ContextTag[];
  /** Freiwillige Angaben, die die Vorlage wahrscheinlicher machen, ohne sie vorauszusetzen */
  softContext: ContextTag[];
  /** Redaktionelle Einschätzung, keine Garantie */
  availability: Likelihood;
  availabilityBySeason?: Partial<Record<Season, Likelihood>>;
  availabilityByEnv?: Partial<Record<Environment, Likelihood>>;
  interaction: 'look';
  /** Leitmotive, zu denen der Fund erzählerisch passt (Waldmissionen) */
  themes: Theme[];
  /** Ausgemustert: wird nie neu gezogen oder getauscht, bleibt aber für gespeicherte Runden erhalten */
  retired?: boolean;
  /** Auftrag; {n} wird durch die Zielmenge ersetzt (nur bei many) */
  prompt: { one: string; many?: string };
  promptByAge?: Partial<Record<AgeGroup, { one: string; many?: string }>>;
  /** Dativ Plural für „1 von 3 Blättern gefunden“ */
  unit?: string;
  /** Beschriftungen der beiden Vergleichsstücke */
  compareLabels?: [string, string];
  hint?: string;
  /** Kleinteile (Samen, Nüsse, Steinchen, Schalen) – nie als Sammelauftrag für 2–3 */
  smallParts?: boolean;
  /** Passt die Konzepttexte an die konkrete Variante an (z. B. Ahornblatt statt Blatt) */
  infoOverride?: {
    young?: Partial<DiscoveryTexts>;
    mid?: Partial<DiscoveryTexts>;
    extra?: string;
    /** Besonderheit („Was ist daran besonders?“) passend zur Variante */
    special?: { young?: string; mid?: string };
    /** Kleiner Entdeckermoment nach dem Fund */
    moment?: { young?: string; mid?: string };
  };
  image: ImagePackage;
}

/* ---------------- Rundenstatus ---------------- */

export type TaskStatus = 'open' | 'done' | 'skipped';

export interface RoundTask {
  uid: string;
  templateId: string;
  conceptId: string;
  family: Family;
  mode: CompletionMode;
  target: number;
  prompt: string;
  /** Kurzer Titel für die Aufgabenliste */
  title: string;
  unit?: string;
  compareLabels?: [string, string];
  hint?: string;
  /** Suchhinweis (whereToLook) steht getrennt von den Infotexten */
  info: DiscoveryTexts;
  /** „Was ist daran besonders?“ (fehlt bei Runden aus früheren Katalogständen) */
  special?: string;
  extra?: string;
  talk?: string;
  /** Freiwilliger Beobachtungsimpuls nach dem Fund */
  moment?: string;
  /** Kleines Bilderrätsel (4–6): Antippen zeigt den Namen */
  riddle?: { text: string; name: string };
  image: ImagePackage;
  status: TaskStatus;
  found: number;
  /** Vergleich: welche Stücke wurden angeschaut */
  seen?: [boolean, boolean];
  replacedFrom?: string;
}

export type SeasonSource = 'auto' | 'manual';

export interface Round {
  id: string;
  catalogVersion: string;
  createdAt: number;
  age: AgeGroup;
  environment: Environment;
  season: Season;
  seasonSource: SeasonSource;
  context: ContextTag[];
  requestedCount: number;
  boost: boolean;
  seed: number;
  tasks: RoundTask[];
  excludedConcepts: string[];
  activeIndex: number;
  /** Hinweis zu einem kleineren Pool o. Ä. */
  notice?: string;
  /** Titel und Vorlesesatz der Mission, passend zu den tatsächlich gezogenen Aufgaben */
  mission?: { title: string; intro: string; theme?: Theme };
  /** „Runde beenden“ wurde gewählt oder alle Aufgaben sind erledigt */
  finished: boolean;
  /** Nur Missionen ab Katalogstand 4 können ein Waldgeschenk auslösen; ältere, auch vollständig gefundene Runden nie rückwirkend. */
  giftEligible?: boolean;
  /**
   * Das Waldgeschenk dieser Mission. Es wird genau einmal vergeben (beim vollständigen Fund), dauerhaft gespeichert
   * und nie wieder entfernt, auch nicht durch „Rückgängig“. `celebrated` verhindert eine zweite Konfetti-Feier.
   */
  gift?: { id: string; celebrated: boolean; at: number };
}

export interface Settings {
  age: AgeGroup | null;
  environment: Environment | null;
  taskCount: number | null;
  boost: boolean;
  context: ContextTag[];
  /** „Bewegung aus“ */
  motionOff: boolean;
  showMoreEnvironments: boolean;
  /** Letzte Runde: Konzepte, die in einer neuen Runde vermieden werden sollen */
  lastRoundConcepts: string[];
  /** Leitmotiv der letzten Mission (wird nach Möglichkeit nicht gleich wiederholt) */
  lastRoundTheme: Theme | null;
  /** Eine frühere Runde eines anderen Ortes wurde archiviert; die Info im Hauptmenü wird einmal gezeigt */
  legacyNoticePending: boolean;
  /** IDs bereits erhaltener Waldgeschenke, in der Reihenfolge des Erhalts (ohne Doppelte) */
  giftsReceived: string[];
  /** Zuletzt gewählter Spielmodus auf dem Startbildschirm (startet nie etwas von allein) */
  mode: GameMode;
  /** Zuletzt bewusst gewählte Suchzeit für Wald Escape in Minuten (10, 15, 20 oder 30); null = Standard der gewählten Größe */
  escapeMinutes: number | null;
  /** Zuletzt bewusst gewählte Größe von Wald Escape (klein: 6 Aufgaben, groß: 9 Aufgaben); null = Standard des Alters */
  escapeSize: 'small' | 'large' | null;
}

/** Die drei Spielmodi: Waldschätze suchen, Walddetektive, Wald Escape. */
export const GAME_MODES = ['treasure', 'detective', 'escape'] as const;
export type GameMode = (typeof GAME_MODES)[number];

import type {
  AgeGroup,
  AnimationPreset,
  CompletionMode,
  ContextTag,
  Environment,
  Family,
  LearningFocus,
  Likelihood,
  Season,
  TaskTemplate,
  Theme,
} from '../domain/types';

/**
 * Strukturierter Katalog aus den 90 Ausgangsideen (Anhang A).
 * Die Tabelle des Anhangs ist Startvorgabe; redaktionelle Anpassungen stehen in docs/INHALTSNOTIZ.md.
 *
 * Kürzel Orte:   W Wald · P Park · S Stadt · T Strand · M Wiese · G Garten · K Spielplatz · B Berge · U See/Bach
 * Kürzel Saison: F Frühling · S Sommer · H Herbst · W Winter
 */

const ENV_CODE: Record<string, Environment> = {
  W: 'forest',
  P: 'park',
  S: 'city',
  T: 'beach',
  M: 'meadow',
  G: 'garden',
  K: 'playground',
  B: 'mountain',
  U: 'water',
};
const SEASON_CODE: Record<string, Season> = { F: 'spring', S: 'summer', H: 'autumn', W: 'winter' };
const ALL_ENVS: Environment[] = ['forest', 'park', 'city', 'beach', 'meadow', 'garden', 'playground', 'mountain', 'water'];
const ALL_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

const envs = (code: string): Environment[] => (code === 'ALL' ? ALL_ENVS : [...code].map((ch) => ENV_CODE[ch]));
const seasons = (code: string): Season[] => (code === 'ALL' ? ALL_SEASONS : [...code].map((ch) => SEASON_CODE[ch]));

type Q = Partial<Record<AgeGroup, number[]>>;

interface Spec {
  n: number;
  id: string;
  c: string; // conceptId
  f: Family;
  e: string; // Orte
  s?: string; // Jahreszeiten (Standard: alle)
  min: 2 | 4 | 7;
  ex?: AgeGroup[]; // ausdrücklich ausgeschlossene Altersgruppen
  d: 1 | 2 | 3;
  k: LearningFocus;
  m?: CompletionMode;
  p: string;
  pm?: string;
  u?: string;
  lab?: [string, string];
  q?: Q;
  bo?: Partial<Record<AgeGroup, number>>;
  x?: ContextTag[];
  a: 'H' | 'O';
  /** Ausgemustert (siehe docs/INHALTSNOTIZ.md, Inhaltsvorgabe v2) */
  ret?: boolean;
  as?: Partial<Record<Season, 'H' | 'O'>>;
  ae?: Partial<Record<Environment, 'H' | 'O'>>;
  h?: string;
  sm?: boolean;
  o?: TaskTemplate['infoOverride'];
  pre: AnimationPreset;
  alt: string;
  tags: string[];
  feat: string[];
  /** Eigene Altersformulierung des Auftrags */
  pa?: Partial<Record<AgeGroup, { one: string; many?: string }>>;
}

const L = (v: 'H' | 'O'): Likelihood => (v === 'H' ? 'common' : 'situational');

function build(s: Spec): TaskTemplate {
  const base: AgeGroup[] = s.min === 2 ? ['2-3', '4-6', '7-10'] : s.min === 4 ? ['4-6', '7-10'] : ['7-10'];
  const ageGroups = base.filter((a) => !s.ex?.includes(a));
  const mode: CompletionMode = s.m ?? 'single';
  const fixed = mode === 'compare' ? [2] : [1];
  const quantityByAge: Q = {};
  for (const a of ageGroups) quantityByAge[a] = s.q?.[a] ?? fixed;
  const availabilityBySeason: Partial<Record<Season, Likelihood>> | undefined = s.as
    ? Object.fromEntries(Object.entries(s.as).map(([k, v]) => [k, L(v as 'H' | 'O')]))
    : undefined;
  const availabilityByEnv: Partial<Record<Environment, Likelihood>> | undefined = s.ae
    ? Object.fromEntries(Object.entries(s.ae).map(([k, v]) => [k, L(v as 'H' | 'O')]))
    : undefined;
  return {
    id: s.id,
    sourceNo: s.n,
    conceptId: s.c,
    family: s.f,
    environments: envs(s.e),
    seasons: seasons(s.s ?? 'ALL'),
    minAge: s.min,
    ageGroups,
    difficulty: s.d,
    focus: s.k,
    completionMode: mode,
    quantityByAge,
    countingBoostMaxByAge: s.bo,
    requiredContext: s.x ?? [],
    softContext: [],
    availability: L(s.a),
    availabilityBySeason,
    availabilityByEnv,
    interaction: 'look',
    themes: [],
    retired: s.ret,
    prompt: { one: s.p, many: s.pm },
    promptByAge: s.pa,
    unit: s.u,
    compareLabels: s.lab,
    hint: s.h,
    smallParts: s.sm,
    infoOverride: s.o,
    image: {
      illustrationKey: s.id,
      animationPreset: s.pre,
      variantTags: s.tags,
      recognitionFeatures: s.feat,
      alt: s.alt,
    },
  };
}

const LEAF_Q: Q = { '2-3': [1, 2], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4, 5] };
const LEAF_BOOST = { '4-6': 5, '7-10': 10 } as const;
const GROUND_LEAF_HINT = 'Schaut auf den Boden. Ein Blatt muss nicht aufgehoben werden.';
const NOT_PICK = 'Bitte nur anschauen und nicht pflücken.';

const specs: Spec[] = [
  /* ---- 01–10: Formen, Muster, Licht ---- */
  { n: 1, id: 'round-thing', ret: true, c: 'round', f: 'abstract', e: 'ALL', min: 2, d: 1, k: 'shape', p: 'Entdecke etwas Rundes.', a: 'O',
    h: 'Ein rundes Ding muss nicht eingesammelt werden. Zeigen genügt.', pre: 'settle',
    alt: 'Ein roter Ball, ein Wagenrad und eine Blütenmitte, alle ganz rund, neben einem hellen Kreis zum Vergleichen',
    tags: ['kreis', 'beispiele'], feat: ['Keine Ecken', 'Rand überall gleich weit von der Mitte'] },
  { n: 2, id: 'long-thing', ret: true, c: 'long', f: 'abstract', e: 'ALL', min: 2, d: 1, k: 'shape', p: 'Entdecke etwas Langes.', a: 'O',
    h: 'Etwas Langes muss nicht mitgenommen werden. Zeigen genügt.', pre: 'grow',
    alt: 'Ein langer Ast, ein langer Grashalm und ein langes Zaunbrett nebeneinander, alle viel länger als breit',
    tags: ['lang', 'beispiele'], feat: ['Viel länger als breit', 'Schmale Form'] },
  { n: 3, id: 'straight-line', ret: true, c: 'straightLine', f: 'abstract', e: 'ALL', min: 4, d: 1, k: 'shape', p: 'Finde eine gerade Linie in eurer Umgebung.', a: 'H',
    pre: 'draw', alt: 'Eine gerade Linie, daneben ein Zaun, ein Halm und eine Hauskante als Beispiele',
    tags: ['linie', 'gerade'], feat: ['Keine Kurve', 'Geht einfach geradeaus'] },
  { n: 4, id: 'curved-line', ret: true, c: 'curvedLine', f: 'abstract', e: 'ALL', min: 4, d: 1, k: 'shape', p: 'Entdecke eine gebogene Linie.', a: 'O',
    pre: 'draw', alt: 'Eine geschwungene Linie, daneben ein gebogener Ast, ein Weg mit Kurve und ein Regenbogen als Beispiele',
    tags: ['linie', 'gebogen'], feat: ['Hat einen Bogen', 'Wie eine Welle oder Kurve'] },
  { n: 5, id: 'repeating-pattern', ret: true, c: 'pattern', f: 'abstract', e: 'ALL', min: 4, d: 2, k: 'pattern', p: 'Finde ein Muster, das sich wiederholt.', a: 'O',
    h: 'Gesucht wird ein Muster an Boden, Zaun, Mauer oder Rinde, nicht an Menschen.', pre: 'grow',
    alt: 'Ein Streifenmuster, ein Pflastermuster und ein Rindenmuster als Beispiele für Wiederholung',
    tags: ['muster', 'wiederholung'], feat: ['Gleiche Form kehrt immer wieder', 'Regelmäßige Abstände'] },
  { n: 6, id: 'two-colors', ret: true, c: 'twoColors', f: 'abstract', e: 'ALL', min: 4, d: 2, k: 'color', p: 'Finde etwas, das zwei Farben hat.', a: 'O',
    pre: 'grow', alt: 'Eine gelbe Blüte mit brauner Mitte, ein zweifarbiger Ball und ein blau-weißes Schild als Beispiele',
    tags: ['farben', 'beispiele'], feat: ['Zwei klar unterscheidbare Farben', 'Oft mit einer Grenze dazwischen'] },
  { n: 7, id: 'light-dark', ret: true, c: 'lightDark', f: 'abstract', e: 'ALL', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche eine helle und eine dunkle Fläche.',
    lab: ['Eine helle Fläche', 'Eine dunkle Fläche'], a: 'H', pre: 'grow',
    alt: 'Links eine helle, rechts eine dunkle Fläche, daneben ein heller und ein dunkler Stein',
    tags: ['vergleich', 'hell-dunkel'], feat: ['Eine Fläche ist deutlich heller', 'Die andere deutlich dunkler'] },
  { n: 8, id: 'tall-low', ret: true, c: 'tallLow', f: 'abstract', e: 'ALL', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Finde etwas Hohes und etwas Niedriges.',
    lab: ['Etwas Hohes', 'Etwas Niedriges'], a: 'H', h: 'Nur schauen. Klettern ist nicht nötig.', pre: 'grow',
    alt: 'Ein hoher Baum und daneben ein niedriger Busch und Gras im Vergleich',
    tags: ['vergleich', 'hoch-niedrig'], feat: ['Eines reicht weit nach oben', 'Das andere bleibt nah am Boden'] },
  { n: 9, id: 'ground-shadow', c: 'shadow', f: 'sky', e: 'ALL', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Schatten auf dem Boden.', x: ['shadow'], a: 'O',
    pre: 'grow', alt: 'Ein kleiner Baum im Sonnenschein, dessen dunkler Schatten auf dem Boden liegt',
    tags: ['schatten', 'sonne'], feat: ['Dunkle Fläche auf dem Boden', 'Hat die Form des Gegenstands'] },
  { n: 10, id: 'puddle', c: 'puddle', f: 'water', e: 'WPSGKBU', min: 2, d: 1, k: 'discover', p: 'Finde eine Pfütze zum Anschauen.', x: ['puddles'], a: 'O',
    h: 'Ihr müsst nicht hineintreten. Anschauen genügt.', pre: 'ripple',
    alt: 'Eine Pfütze auf dem Boden, in der sich Wolken und ein Stück Himmel spiegeln',
    tags: ['wasser', 'pfütze'], feat: ['Flache Wasserfläche auf dem Boden', 'Spiegelt Himmel und Umgebung'] },

  /* ---- 11–19: Bäume und Baumteile ---- */
  { n: 11, id: 'tree', ret: true, c: 'tree', f: 'trees', e: 'WPSGKBU', min: 2, d: 1, k: 'discover', p: 'Zeig mir einen Baum.', a: 'H',
    ae: { city: 'O', playground: 'O', mountain: 'O', water: 'O' }, pre: 'sway',
    alt: 'Ein Laubbaum mit braunem Stamm und runder grüner Krone',
    tags: ['laubbaum', 'standard'], feat: ['Dicker Stamm', 'Viele Äste', 'Runde Krone'] },
  { n: 12, id: 'fallen-twig', ret: true, c: 'twig', f: 'plants', e: 'WPGBU', min: 2, d: 1, k: 'discover', p: 'Entdecke einen heruntergefallenen Zweig.',
    pm: 'Entdecke {n} heruntergefallene Zweige.', u: 'Zweigen', m: 'count', q: { '2-3': [1, 2], '4-6': [1, 2, 3], '7-10': [1, 2, 3] }, a: 'H',
    h: 'Schaut auf den Boden am Weg. Ein Zweig muss nicht mitgenommen werden.', pre: 'settle',
    alt: 'Ein heruntergefallener, brauner Zweig mit einigen Seitentrieben liegt auf dem Boden',
    tags: ['zweig', 'boden'], feat: ['Dünner brauner Ast', 'Kleine Seitentriebe'] },
  { n: 13, id: 'bark', c: 'bark', f: 'trees', e: 'WPGBU', min: 2, d: 1, k: 'pattern', p: 'Finde eine Baumrinde mit tiefen Rillen.', a: 'H',
    h: 'Die Rinde bitte nicht ablösen. Anschauen genügt.', pre: 'grow',
    alt: 'Ein Stück Baumstamm mit tiefen Rillen in der braunen Rinde',
    tags: ['rinde', 'stamm'], feat: ['Rillen und Furchen', 'Braune, raue Oberfläche'] },
  { n: 14, id: 'moss', c: 'moss', f: 'plants', e: 'WPGBU', min: 2, d: 1, k: 'discover', p: 'Entdecke ein grünes Moospolster.', a: 'O',
    h: 'Das Moos bleibt an seinem Platz. Ansehen genügt.', pre: 'grow',
    alt: 'Ein Baumstamm mit einem dicken, weichen, grünen Moospolster',
    tags: ['moos', 'moospolster', 'stamm'], feat: ['Weiches grünes Polster', 'Wächst dicht an Stamm oder Stein'] },
  { n: 15, id: 'fallen-leaf', c: 'leaf', f: 'plants', e: 'WPMGBU', min: 2, d: 1, k: 'count', m: 'count', p: 'Finde ein Blatt auf dem Boden.', pm: 'Finde {n} Blätter auf dem Boden.', u: 'Blättern',
    q: LEAF_Q, bo: LEAF_BOOST, a: 'O', as: { autumn: 'H' }, h: GROUND_LEAF_HINT, pre: 'float',
    alt: 'Drei herabgefallene Blätter in Grün, Gelb und Orange mit sichtbaren Blattadern',
    tags: ['blatt', 'herbstfarben', 'blattadern'], feat: ['Umriss mit Spitze', 'Feine Blattadern', 'Kleiner Stiel'] },
  { n: 16, id: 'grass', ret: true, c: 'grass', f: 'plants', e: 'PMGKBU', min: 2, d: 1, k: 'discover', p: 'Zeig mir Gras.', a: 'H', pre: 'sway',
    alt: 'Ein Büschel Gras mit vielen schmalen, grünen Halmen',
    tags: ['gras', 'wiese'], feat: ['Viele schmale Halme', 'Dicht beieinander'] },
  { n: 17, id: 'conifer', ret: true, c: 'tree', f: 'trees', e: 'WPGB', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Nadelbaum.', x: ['conifers'], a: 'H', pre: 'sway',
    o: {
      young: { whatIsIt: 'Ein Nadelbaum hat Nadeln statt Blättern.', origin: 'Er wächst aus einem Samen, der in einem Zapfen reift.', whereToLook: 'Schaut mal, wo dunkelgrüne Bäume stehen.' },
      mid: {
        whatIsIt: 'Ein Nadelbaum hat spitze Nadeln statt breiter Blätter und oft eine Krone wie ein Dreieck.',
        origin: 'Nadelbäume wachsen aus Samen, die in Zapfen entstehen. Viele behalten ihre Nadeln auch im Winter.',
        whereToLook: 'Schaut nach dunkelgrünen Bäumen mit spitzer Krone, zum Beispiel am Weg, im Park oder im Garten.',
      },
    },
    alt: 'Ein Nadelbaum mit spitzer, dreieckiger Krone und dunkelgrünen Nadelzweigen',
    tags: ['nadelbaum', 'kontext-nadelbäume'], feat: ['Spitze, dreieckige Krone', 'Nadeln statt Blätter'] },
  { n: 18, id: 'forked-twig', c: 'twig', f: 'plants', e: 'WPGBU', min: 2, d: 1, k: 'shape', p: 'Finde einen Zweig, der sich wie ein Y teilt.', a: 'O',
    h: 'Der Zweig bleibt liegen. Zeigen genügt.', pre: 'settle',
    o: {
      young: { whatIsIt: 'Dieser Zweig teilt sich wie ein Y.', origin: 'So ist er gewachsen: Aus einem Ast werden zwei.' },
      mid: { whatIsIt: 'Ein gegabelter Zweig teilt sich wie ein Y in zwei Arme.' },
    },
    alt: 'Ein brauner Zweig, der sich in der Mitte wie ein Y gabelt',
    tags: ['zweig', 'gabel'], feat: ['Teilt sich in zwei Arme', 'Form wie ein Y'] },
  { n: 19, id: 'tree-stump', c: 'stump', f: 'trees', e: 'WPGB', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Baumstumpf.', a: 'O',
    h: 'Nur vom Weg aus anschauen. Daraufsteigen ist nicht nötig.', pre: 'grow',
    alt: 'Ein Baumstumpf mit hellen Jahresringen auf der Schnittfläche',
    tags: ['stumpf', 'jahresringe'], feat: ['Flache runde Schnittfläche', 'Ringe im Holz'] },

  /* ---- 20–29: Blattvarianten ---- */
  { n: 20, id: 'leaf-hole', c: 'leaf', f: 'plants', e: 'WPMGBU', s: 'FSH', min: 4, d: 2, k: 'discover', p: 'Finde ein Blatt mit einem Loch.', a: 'O', h: GROUND_LEAF_HINT, pre: 'float',
    o: { mid: { whatIsIt: 'Dieses Blatt hat ein Loch. Dafür kann es viele Gründe geben.' }, extra: 'Manchmal fressen Raupen oder Käfer an Blättern. Löcher können auch durch Wind oder Hagel entstehen.' },
    alt: 'Ein grünes Blatt mit einem runden Loch in der Mitte',
    tags: ['blatt', 'loch'], feat: ['Gut sichtbares Loch', 'Rest des Blattes bleibt intakt'] },
  { n: 21, id: 'leaf-veins', c: 'leaf', f: 'plants', e: 'WPMGBU', s: 'FSH', min: 4, d: 2, k: 'pattern', p: 'Entdecke die feinen Linien auf einem Blatt.', a: 'H',
    h: 'Das Blatt kann am Strauch bleiben. Genau hinschauen genügt.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Die feinen Linien auf einem Blatt heißen Blattadern. Sie sehen aus wie kleine Wege.',
        origin: 'Durch die Adern fließt Wasser ins Blatt. Sie geben dem Blatt auch Halt.',
      },
    },
    alt: 'Ein großes grünes Blatt, auf dem feine helle Blattadern deutlich zu sehen sind',
    tags: ['blatt', 'blattadern', 'detail'], feat: ['Mittelader in der Mitte', 'Feine Seitenadern wie Äste'] },
  { n: 22, id: 'leaf-big-small', c: 'leaf', f: 'plants', e: 'WPMGBU', s: 'FSH', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche ein großes und ein kleines Blatt.',
    lab: ['Ein großes Blatt', 'Ein kleines Blatt'], a: 'H', h: 'Die Blätter können liegen bleiben. Vergleichen genügt.', pre: 'float',
    o: { mid: { whatIsIt: 'Blätter können ganz verschieden groß sein. Manche sind klein wie ein Daumennagel, andere viel größer.' } },
    alt: 'Ein großes und ein kleines grünes Blatt nebeneinander zum Vergleichen',
    tags: ['blatt', 'vergleich', 'größe'], feat: ['Gleiche Blattform in zwei Größen', 'Deutlicher Größenunterschied'] },
  { n: 23, id: 'green-leaf', c: 'leaf', f: 'plants', e: 'WPMGBU', s: 'FS', min: 2, d: 1, k: 'color', m: 'count', p: 'Finde ein grünes Blatt.', pm: 'Finde {n} grüne Blätter.', u: 'grünen Blättern',
    q: { '2-3': [1, 2], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4] }, a: 'H', h: NOT_PICK, pre: 'float',
    o: {
      young: { whatIsIt: 'Das ist ein grünes Blatt.', origin: 'Es wächst an einer Pflanze und hilft ihr beim Wachsen.' },
      mid: { whatIsIt: 'Dieses Blatt ist grün, weil es Blattgrün enthält. Damit nutzt die Pflanze das Licht.', origin: 'Das Blatt wächst an einem Baum, Busch oder einer anderen Pflanze und hilft ihr beim Wachsen.' },
    },
    alt: 'Ein kräftig grünes Blatt mit hellen Blattadern',
    tags: ['blatt', 'grün'], feat: ['Kräftiges Grün', 'Helle Blattadern'] },
  { n: 24, id: 'dry-leaf', c: 'leaf', f: 'plants', e: 'WPGBU', s: 'HW', min: 2, d: 1, k: 'color', m: 'count', p: 'Entdecke ein trockenes Blatt auf dem Boden.', pm: 'Entdecke {n} trockene Blätter auf dem Boden.', u: 'trockenen Blättern',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4] }, a: 'O', h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      young: { whatIsIt: 'Ein trockenes Blatt ist braun und raschelt.', origin: 'Es ist am Baum gewachsen, abgefallen und dann getrocknet.' },
      mid: {
        whatIsIt: 'Ein trockenes Blatt ist braun und knistert leise. Es hat kein Grün mehr.',
        origin: 'Es ist an einem Baum gewachsen, im Herbst abgefallen und dann getrocknet.',
      },
    },
    alt: 'Ein trockenes, braunes Blatt mit eingerolltem Rand und dunklen Adern',
    tags: ['blatt', 'braun', 'trocken'], feat: ['Braune Farbe', 'Leicht eingerollter Rand'] },
  { n: 25, id: 'yellow-leaf', c: 'leaf', f: 'plants', e: 'WPGBU', s: 'H', min: 2, d: 1, k: 'color', m: 'count', p: 'Finde ein gelbes Blatt auf dem Boden.', pm: 'Finde {n} gelbe Blätter auf dem Boden.', u: 'gelben Blättern',
    q: { '2-3': [1], '4-6': [1, 2], '7-10': [1, 2, 3] }, a: 'O', h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      young: { whatIsIt: 'Dieses Blatt ist gelb.', origin: 'Im Herbst verschwindet das Grün im Blatt. Dann sieht man das Gelb.', whereToLook: 'Schaut mal auf den Boden unter Bäumen.' },
      mid: {
        whatIsIt: 'Dieses Blatt ist gelb gefärbt.',
        origin: 'Im Herbst baut der Baum das Grün im Blatt ab. Dann wird das Gelb sichtbar.',
        whereToLook: 'Schaut unter Bäumen und Büschen auf den Boden. Gelbe Blätter sind nicht überall zu finden.',
      },
    },
    alt: 'Ein leuchtend gelbes Blatt mit hellen Blattadern',
    tags: ['blatt', 'gelb', 'herbst'], feat: ['Leuchtendes Gelb', 'Blattadern bleiben sichtbar'] },
  { n: 26, id: 'red-leaf', c: 'leaf', f: 'plants', e: 'WPGBU', s: 'H', min: 2, d: 1, k: 'color', m: 'count', p: 'Finde ein rotes Blatt.', pm: 'Finde {n} rote Blätter.', u: 'roten Blättern',
    q: { '2-3': [1], '4-6': [1, 2], '7-10': [1, 2, 3] }, a: 'O', h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      young: { whatIsIt: 'Dieses Blatt ist rot.', origin: 'Manche Blätter werden im Herbst rot.', whereToLook: 'Schaut mal auf den Boden unter Bäumen.' },
      mid: {
        whatIsIt: 'Dieses Blatt hat sich rot gefärbt.',
        origin: 'Manche Blätter bilden im Herbst rote Farbstoffe. Deshalb leuchten sie rot.',
        whereToLook: 'Schaut unter Bäumen und Sträuchern auf den Boden. Rote Blätter sind nicht überall zu finden.',
      },
    },
    alt: 'Ein tiefrotes Blatt mit dunkleren Blattadern',
    tags: ['blatt', 'rot', 'herbst'], feat: ['Kräftiges Rot', 'Dunklere Adern'] },
  { n: 27, id: 'leaf-two-shapes', c: 'leaf', f: 'plants', e: 'WPMGBU', s: 'FSH', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche zwei Blätter mit verschiedenen Formen.',
    lab: ['Das erste Blatt', 'Das zweite Blatt'], a: 'H', h: 'Die Blätter können liegen bleiben. Vergleichen genügt.', pre: 'float',
    o: { mid: { whatIsIt: 'Blätter haben ganz verschiedene Formen: rund, lang, spitz oder mit Zacken.', origin: 'Jede Pflanzenart hat ihre eigene Blattform. Daran kann man viele Pflanzen unterscheiden.' } },
    alt: 'Zwei Blätter mit verschiedenen Formen: ein rundliches Blatt und ein langes, schmales Blatt',
    tags: ['blatt', 'vergleich', 'form'], feat: ['Ein rundliches Blatt', 'Ein langes, schmales Blatt'] },
  { n: 28, id: 'maple-leaf', c: 'leaf', f: 'plants', e: 'WPGBU', s: 'H', min: 7, d: 3, k: 'discover', m: 'count', p: 'Finde ein gefallenes Ahornblatt.', pm: 'Finde {n} gefallene Ahornblätter.', u: 'Ahornblättern',
    q: { '7-10': [1, 2, 3, 4, 5] }, bo: { '7-10': 10 }, x: ['maple'], a: 'H', h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      mid: {
        whatIsIt: 'Das ist ein Ahornblatt. Es hat spitze Zacken wie ein Stern.',
        origin: 'Es wächst an einem Ahorn und fällt im Herbst vom Baum.',
        whereToLook: 'Schaut unter einem Ahorn auf den Boden. Der Baum muss in der Nähe stehen.',
      },
      extra: 'Ahornblätter haben meist fünf Lappen und hängen an langen Stielen. Die Samen des Ahorns haben zwei Flügel und drehen sich beim Fallen.',
    },
    alt: 'Ein gelb-oranges Ahornblatt mit fünf spitzen Lappen und langem Stiel',
    tags: ['ahorn', 'blatt', 'spitz', 'kontext-ahorn'], feat: ['Fünf spitze Lappen', 'Spitze Zähne am Rand', 'Langer Stiel'] },
  { n: 29, id: 'oak-leaf', c: 'leaf', f: 'plants', e: 'WPGBU', s: 'H', min: 7, d: 3, k: 'discover', m: 'count', p: 'Finde ein gefallenes Eichenblatt.', pm: 'Finde {n} gefallene Eichenblätter.', u: 'Eichenblättern',
    q: { '7-10': [1, 2, 3, 4, 5] }, bo: { '7-10': 10 }, x: ['oak'], a: 'H', h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      mid: {
        whatIsIt: 'Das ist ein Eichenblatt. Der Rand ist wellig, mit runden Buchten.',
        origin: 'Es wächst an einer Eiche und fällt im Herbst vom Baum.',
        whereToLook: 'Schaut unter einer Eiche auf den Boden. Der Baum muss in der Nähe stehen.',
      },
      extra: 'Eichenblätter haben runde Lappen ohne Spitzen. So unterscheiden sie sich gut vom spitzen Ahornblatt.',
    },
    alt: 'Ein goldbraunes Eichenblatt mit runden, welligen Lappen',
    tags: ['eiche', 'blatt', 'rund', 'kontext-eiche'], feat: ['Runde Lappen', 'Wellenförmiger Rand', 'Kurzer Stiel'] },

  /* ---- 30–34: weiteres aus Wald und Park ---- */
  { n: 30, id: 'cone', c: 'cone', f: 'fruits', e: 'WPGB', min: 2, d: 1, k: 'count', m: 'count', p: 'Finde einen Zapfen auf dem Boden.', pm: 'Finde {n} Zapfen auf dem Boden.', u: 'Zapfen',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4, 5] }, bo: LEAF_BOOST, x: ['conifers'], a: 'O', h: 'Ein Zapfen muss nicht mitgenommen werden. Zeigen genügt.', pre: 'settle',
    alt: 'Ein brauner Zapfen mit vielen übereinanderliegenden Schuppen',
    tags: ['zapfen', 'nadelbaum', 'kontext-nadelbäume'], feat: ['Viele Schuppen', 'Länglich-eiförmige Form', 'Braune Farbe'] },
  { n: 31, id: 'root', c: 'root', f: 'trees', e: 'WPGBU', min: 4, d: 2, k: 'discover', p: 'Entdecke eine Wurzel, die über dem Boden sichtbar ist.', a: 'O',
    h: 'Nur vom Weg aus schauen. Nicht graben und nicht stolpern.', pre: 'grow',
    alt: 'Ein Baumstamm, dessen dicke Wurzeln über dem Boden zu sehen sind',
    tags: ['wurzel', 'stamm'], feat: ['Dicke Wurzel auf dem Boden', 'Geht in den Stamm über'] },
  { n: 32, id: 'lying-wood', ret: true, c: 'wood', f: 'trees', e: 'WPGBU', min: 2, d: 1, k: 'discover', p: 'Finde ein Stück liegendes Holz.', a: 'O',
    h: 'Das Holz bleibt liegen. Nicht bewegen, stapeln oder daraufsteigen.', pre: 'settle',
    alt: 'Ein Stück Holz liegt auf dem Waldboden, mit Rinde und Jahresringen am Ende',
    tags: ['holz', 'boden'], feat: ['Länglicher Holzstamm', 'Rinde und Schnittfläche'] },
  { n: 33, id: 'twig-bud', c: 'bud', f: 'plants', e: 'WPGBU', s: 'FW', min: 4, d: 2, k: 'discover', p: 'Entdecke eine Knospe an einem Zweig.', a: 'O', as: { spring: 'H' },
    h: 'Bitte nur anschauen und nicht abbrechen.', pre: 'grow',
    alt: 'Ein Zweig mit kleinen, dicken Knospen; an manchen öffnen sich schon erste grüne Blättchen',
    tags: ['knospe', 'frühling'], feat: ['Kleine, dicke Verdickung am Zweig', 'Grüne Spitzen kommen heraus'] },
  { n: 34, id: 'bark-compare', c: 'bark', f: 'trees', e: 'WPGBU', min: 7, d: 3, k: 'compare', m: 'compare', p: 'Vergleiche die Rindenmuster zweier Bäume.',
    lab: ['Der erste Baum', 'Der zweite Baum'], a: 'H', h: 'Die Rinde nicht ablösen. Anschauen genügt.', pre: 'grow',
    o: { mid: { whatIsIt: 'Die Rinde ist die äußere Hülle eines Baumes. Zwei Bäume können ganz unterschiedliche Rinde haben.' } },
    alt: 'Zwei Baumstämme nebeneinander: einer mit tiefen Rillen, einer mit glatter heller Rinde',
    tags: ['rinde', 'vergleich'], feat: ['Eine Rinde mit tiefen Furchen', 'Eine Rinde, die glatter ist'] },

  /* ---- 35–48: Stadt, Garten, Straße ---- */
  { n: 35, id: 'bench', c: 'bench', f: 'urban', e: 'PSGKBU', min: 2, d: 1, k: 'discover', p: 'Entdecke eine Bank.', a: 'O',
    ae: { park: 'H', city: 'H', playground: 'H' }, h: 'Ihr müsst euch nicht daraufsetzen.', pre: 'bob',
    alt: 'Eine Holzbank mit Rückenlehne und Metallbeinen',
    tags: ['bank', 'holz'], feat: ['Sitzfläche und Rückenlehne', 'Vier Beine'] },
  { n: 36, id: 'door', c: 'door', f: 'urban', e: 'SG', min: 2, d: 1, k: 'discover', p: 'Zeig mir eine Tür.', a: 'H', ae: { garden: 'O' },
    h: 'Bitte nur von außen anschauen, keine fremden Grundstücke betreten.', pre: 'grow',
    alt: 'Eine rote Haustür mit Klinke und kleinem Fenster, umgeben von hellem Mauerwerk',
    tags: ['tür', 'haus'], feat: ['Rechteckige Form', 'Klinke oder Griff'] },
  { n: 37, id: 'window', c: 'window', f: 'urban', e: 'SG', min: 2, d: 1, k: 'discover', p: 'Entdecke ein Fenster.', a: 'H', ae: { garden: 'O' },
    h: 'Nur von außen anschauen. Hineinsehen ist nicht nötig.', pre: 'grow',
    alt: 'Ein Fenster mit weißem Rahmen und Fensterbank in einer Hauswand',
    tags: ['fenster', 'haus'], feat: ['Rahmen mit Glasflächen', 'Fensterbank'] },
  { n: 38, id: 'bicycle', c: 'bicycle', f: 'urban', e: 'SPK', min: 2, d: 1, k: 'discover', p: 'Finde ein abgestelltes Fahrrad.', a: 'O',
    h: 'Das Fahrrad nicht anfassen. Bleibt im Gehbereich.', pre: 'bob',
    alt: 'Ein Fahrrad mit zwei Rädern, Lenker und Sattel, das am Boden steht',
    tags: ['fahrrad'], feat: ['Zwei Räder', 'Lenker und Sattel'] },
  { n: 39, id: 'round-sign', c: 'sign', f: 'urban', e: 'SPKBU', min: 4, d: 2, k: 'shape', p: 'Entdecke ein rundes Schild.', a: 'O',
    h: 'Schaut nur vom Gehbereich aus. Ihr müsst nicht die Straße wechseln.', pre: 'grow',
    alt: 'Ein rundes blaues Schild mit weißem Rand auf einem Pfosten',
    tags: ['schild', 'rund'], feat: ['Runde Form', 'Auf einem Pfosten'] },
  { n: 40, id: 'house-number', c: 'number', f: 'urban', e: 'S', min: 4, d: 1, k: 'discover', p: 'Finde eine Hausnummer.', a: 'H',
    h: 'Anschauen genügt. Ihr müsst die Zahl nicht lesen.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Eine Hausnummer ist die Zahl, die an einem Haus steht.',
        origin: 'Menschen nummerieren Häuser, damit man sie leichter findet.',
        whereToLook: 'Schaut an Hauswänden und Türen. Anschauen genügt, ihr müsst die Zahl nicht lesen.',
      },
    },
    alt: 'Ein Emailleschild mit der Zahl 12 an einer hellen Hauswand',
    tags: ['hausnummer', 'zahl'], feat: ['Eine Zahl auf einem Schild', 'Neben der Haustür'] },
  { n: 41, id: 'sign-letter', c: 'sign', f: 'urban', e: 'SPKBU', min: 7, d: 3, k: 'shape', p: 'Entdecke einen Buchstaben auf einem Schild.', a: 'O',
    h: 'Ein Schild genügt. Nach Namen oder Anzeigen müsst ihr nicht suchen.', pre: 'grow',
    o: { mid: { whatIsIt: 'Ein Buchstabe ist ein Zeichen der Schrift. Aus Buchstaben entstehen Wörter.', origin: 'Menschen schreiben Wörter auf Schilder, damit alle sie lesen können.' } },
    alt: 'Ein Wegweiser-Schild mit großen Buchstaben auf einem Holzpfosten',
    tags: ['schild', 'buchstabe'], feat: ['Große Buchstaben', 'Auf einem Schild'] },
  { n: 42, id: 'number', c: 'number', f: 'urban', e: 'SPKBU', min: 4, d: 2, k: 'discover', p: 'Finde eine Zahl in eurer Umgebung.', a: 'O',
    h: 'Auf Schildern, Türen oder Geräten. Nicht auf Autos oder Personen.', pre: 'grow',
    alt: 'Drei Zahlen 1, 2 und 3 auf farbigen Schildern nebeneinander',
    tags: ['zahl'], feat: ['Eine Ziffer oder Zahl', 'Auf einem Schild oder einer Tür'] },
  { n: 43, id: 'paving-pattern', c: 'pavement', f: 'urban', e: 'SPGKU', min: 4, d: 2, k: 'pattern', p: 'Entdecke ein Muster im Pflaster.', a: 'O',
    h: 'Bleibt auf dem Weg. Ihr müsst nicht auf die Fahrbahn.', pre: 'grow',
    alt: 'Ein Gehweg aus grauen und roten Pflastersteinen, die ein Muster bilden',
    tags: ['pflaster', 'muster'], feat: ['Steine nebeneinander', 'Wiederkehrende Form'] },
  { n: 44, id: 'cover-grate', c: 'cover', f: 'urban', e: 'SPK', min: 4, d: 2, k: 'discover', p: 'Finde einen Deckel oder ein Gitter im Gehweg.', a: 'O',
    h: 'Nur anschauen. Nichts öffnen und nicht auf die Fahrbahn gehen.', pre: 'grow',
    alt: 'Ein runder Metalldeckel mit Muster und ein Gitter im Gehweg',
    tags: ['deckel', 'gitter'], feat: ['Runder Deckel mit Muster', 'Gitter mit Schlitzen'] },
  { n: 45, id: 'street-tree', ret: true, c: 'tree', f: 'trees', e: 'S', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Straßenbaum.', a: 'O', pre: 'sway',
    h: 'Bleibt im Gehbereich. Ein Straßenbaum steht am Rand des Weges.',
    o: {
      young: { whereToLook: 'Schaut am Straßenrand: Manchmal steht dort ein Baum.' },
      mid: { whereToLook: 'Schaut am Gehweg oder auf dem Platz. Bleibt auf dem Gehweg und geht nicht auf die Straße.' },
    },
    alt: 'Ein Baum, der in einem kleinen Beet am Gehweg steht',
    tags: ['baum', 'straße'], feat: ['Baum in einer Baumscheibe', 'Steht am Gehweg'] },
  { n: 46, id: 'planter', c: 'planter', f: 'urban', e: 'SPG', min: 2, d: 1, k: 'discover', p: 'Finde einen bepflanzten Topf oder Kasten.', a: 'O',
    h: 'Nichts anfassen oder betreten. Anschauen genügt.', pre: 'sway',
    alt: 'Ein Blumentopf aus Ton mit einer grünen Pflanze und roten Blüten',
    tags: ['topf', 'pflanze'], feat: ['Topf oder Kasten', 'Pflanze darin'] },
  { n: 47, id: 'fence', c: 'fence', f: 'urban', e: 'SPGKM', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Zaun.', a: 'O',
    h: 'Bitte nicht klettern. Anschauen genügt.', pre: 'grow',
    alt: 'Ein Holzzaun mit senkrechten Latten',
    tags: ['zaun', 'holz'], feat: ['Senkrechte Latten', 'Waagerechte Querlatten'] },
  { n: 48, id: 'hedge', c: 'hedge', f: 'plants', e: 'PSGKM', min: 2, d: 1, k: 'discover', p: 'Finde eine Hecke.', a: 'O',
    h: 'Bitte nicht hineingreifen. Anschauen genügt.', pre: 'sway',
    alt: 'Eine dichte, grüne Hecke, an einer Seite gerade geschnitten',
    tags: ['hecke', 'grün'], feat: ['Dicht gewachsene Büsche', 'Gleichmäßig geschnittene Oberkante'] },

  /* ---- 49–56: Spielplatz, Himmel ---- */
  { n: 49, id: 'slide', c: 'slide', f: 'play', e: 'K', min: 2, d: 1, k: 'discover', p: 'Zeig mir eine Rutsche.', a: 'O', h: 'Anschauen genügt. Ihr müsst nicht rutschen.', pre: 'bob',
    alt: 'Eine Rutsche mit Leiter und glatter Rutschfläche',
    tags: ['rutsche', 'spielgerät'], feat: ['Glatte schräge Fläche', 'Leiter oder Treppe'] },
  { n: 50, id: 'swing', c: 'swing', f: 'play', e: 'K', min: 2, d: 1, k: 'discover', p: 'Entdecke eine Schaukel.', a: 'O',
    h: 'Bleibt außerhalb des Schwingbereichs. Anschauen genügt.', pre: 'swing',
    alt: 'Eine Schaukel mit Gestell, zwei Ketten und einem Sitz',
    tags: ['schaukel', 'spielgerät'], feat: ['Sitz an zwei Ketten', 'Gestell oben'] },
  { n: 51, id: 'sand-area', c: 'sand', f: 'ground', e: 'KG', min: 2, d: 1, k: 'discover', p: 'Finde eine Sandfläche.', x: ['sand'], a: 'O', pre: 'grow',
    alt: 'Ein Sandkasten mit hellem Sand, einem Eimer und einer Schaufel',
    tags: ['sand', 'sandkasten', 'kontext-sand'], feat: ['Heller, körniger Sand', 'Von einem Rand umgeben'] },
  { n: 52, id: 'footprint-sand', c: 'footprint', f: 'ground', e: 'KT', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Fußabdruck im Sand.', x: ['sand'], a: 'O',
    h: 'Schaut nur. Ihr müsst nicht in den Sand laufen.', pre: 'grow',
    alt: 'Ein Fußabdruck mit fünf Zehen im hellen Sand',
    tags: ['fußspur', 'sand', 'kontext-sand'], feat: ['Fünf Zehenabdrücke', 'Vertiefung im Sand'] },
  { n: 53, id: 'round-play-part', c: 'playRound', f: 'play', e: 'K', min: 2, d: 1, k: 'shape', p: 'Finde ein rundes Teil an einem Spielgerät.', a: 'O',
    h: 'Vom Boden aus schauen. Ihr müsst nicht klettern.', pre: 'grow',
    alt: 'Ein Holzhäuschen am Spielplatz mit rundem Fenster und einem Lenkrad',
    tags: ['spielgerät', 'rund'], feat: ['Rundes Fenster', 'Lenkrad'] },
  { n: 54, id: 'play-board', ret: true, c: 'playBoard', f: 'play', e: 'K', min: 2, d: 1, k: 'discover', p: 'Entdecke ein Holzbrett an einem Spielgerät.', a: 'O',
    h: 'Nur anschauen. Klettern ist nicht nötig.', pre: 'grow',
    alt: 'Ein Spielgerät aus Holzbrettern mit sichtbarer Maserung',
    tags: ['holz', 'brett', 'spielgerät'], feat: ['Flache Bretter', 'Holzmaserung'] },
  { n: 55, id: 'play-size-compare', c: 'playSize', f: 'play', e: 'K', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche zwei unterschiedlich große Spielgeräte.',
    lab: ['Das größere Gerät', 'Das kleinere Gerät'], a: 'H', h: 'Benutzen müsst ihr die Geräte nicht.', pre: 'grow',
    alt: 'Ein großes Klettergerüst und eine kleine Wippe im Größenvergleich',
    tags: ['spielgerät', 'vergleich'], feat: ['Ein Gerät ist deutlich größer', 'Eines ist kleiner'] },
  { n: 56, id: 'sky', ret: true, c: 'sky', f: 'sky', e: 'ALL', min: 2, ex: ['7-10'], d: 1, k: 'discover', p: 'Zeig mir den Himmel über euch.', a: 'H',
    h: 'Bitte nicht direkt in die Sonne schauen.', pre: 'wave',
    alt: 'Ein blauer Himmel mit weißen Wolken und einem Stück Sonne am Rand',
    tags: ['himmel', 'wolken'], feat: ['Blaue Fläche', 'Weiße Wolken'] },

  /* ---- 57–58: Blüte, Kastanie ---- */
  { n: 57, id: 'blossom', c: 'blossom', f: 'plants', e: 'PMGBU', s: 'FS', min: 2, d: 1, k: 'count', m: 'count', p: 'Entdecke eine Blüte.', pm: 'Entdecke {n} Blüten.', u: 'Blüten',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4] }, a: 'O', h: NOT_PICK, pre: 'sway',
    alt: 'Eine Blume mit weißen Blütenblättern und gelber Mitte an einem grünen Stängel',
    tags: ['blüte', 'blume'], feat: ['Bunte Blütenblätter', 'Mitte in anderer Farbe'] },
  { n: 58, id: 'chestnut', c: 'chestnut', f: 'fruits', e: 'WPG', s: 'H', min: 2, d: 1, k: 'count', m: 'count', p: 'Finde eine braune Kastanie auf dem Boden.', pm: 'Finde {n} braune Kastanien auf dem Boden.', u: 'Kastanien',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4, 5] }, bo: { '4-6': 5, '7-10': 10 }, x: ['chestnut'], a: 'O', as: { autumn: 'H' }, sm: true,
    h: 'Nur anschauen und liegen lassen, nicht in den Mund nehmen. Kastanien sind nicht zum Essen.', pre: 'settle',
    alt: 'Eine glänzende braune Kastanie mit hellem Fleck, daneben die grüne stachelige Hülle',
    tags: ['kastanie', 'rosskastanie', 'kontext-kastanie'], feat: ['Glänzend braun', 'Heller Fleck', 'Stachelige grüne Hülle'] },

  /* ---- 59–70: Strand ---- */
  { n: 59, id: 'beach-sand', ret: true, c: 'sand', f: 'beach', e: 'T', min: 2, d: 1, k: 'discover', p: 'Entdecke Sand auf dem Strand.', x: ['sand'], a: 'H', pre: 'grow',
    o: {
      young: { whereToLook: 'Schaut mal am Strand auf den Boden.' },
      mid: { whereToLook: 'Schaut am Strand auf den Boden. Nicht jeder Strand ist sandig.' },
    },
    alt: 'Ein Strandstück mit hellem Sand und kleinen Wellen am Rand',
    tags: ['sand', 'strand', 'kontext-sand'], feat: ['Heller, feiner Sand', 'Am Wasserrand'] },
  { n: 60, id: 'shell', ret: true, c: 'shell', f: 'beach', e: 'T', min: 2, d: 1, k: 'count', m: 'count', p: 'Finde eine Muschelschale zum Anschauen.', pm: 'Finde {n} Muschelschalen zum Anschauen.', u: 'Muschelschalen',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4] }, a: 'O', sm: true, h: 'Nur anschauen. Die Schale muss nicht aufgenommen werden.', pre: 'settle',
    alt: 'Eine fächerförmige Muschelschale mit feinen Rillen auf Sand',
    tags: ['muschel', 'schale'], feat: ['Fächerform', 'Feine Rillen'] },
  { n: 61, id: 'seaweed', c: 'seaweed', f: 'beach', e: 'T', min: 4, d: 2, k: 'discover', p: 'Entdecke angeschwemmten Tang.', a: 'O',
    h: 'Nur von Weitem anschauen. Nichts anfassen oder auseinanderziehen.', pre: 'wave',
    alt: 'Ein dunkelgrüner Tang-Büschel mit langen, welligen Bändern am Spülsaum im Sand',
    tags: ['tang', 'strand', 'spülsaum'], feat: ['Lange wellige Bänder', 'Dunkelgrün bis braun'] },
  { n: 62, id: 'driftwood', c: 'wood', f: 'beach', e: 'T', min: 4, d: 2, k: 'discover', p: 'Finde Treibholz zum Anschauen.', a: 'O',
    h: 'Nichts anfassen oder bewegen. Anschauen genügt.', pre: 'settle',
    o: {
      mid: {
        whatIsIt: 'Treibholz ist Holz, das im Wasser getrieben ist. Es ist oft glatt und hell.',
        origin: 'Es stammt von Bäumen. Wellen haben es glatt geschliffen und an den Strand gespült.',
        whereToLook: 'Schaut am Strand dort, wo das Wasser Dinge anspült. Bitte nichts anfassen oder bewegen.',
      },
    },
    alt: 'Ein heller, glatt geschliffener Holzstamm liegt am Strand im Sand',
    tags: ['treibholz', 'strand'], feat: ['Glatt und hell', 'Ohne Rinde'] },
  { n: 63, id: 'big-stone', ret: true, c: 'stone', f: 'beach', e: 'T', min: 2, d: 1, k: 'discover', p: 'Entdecke einen großen Stein am Strand.', a: 'O',
    h: 'Zeigen genügt. Der Stein bleibt liegen.', pre: 'settle',
    o: { mid: { whereToLook: 'Schaut am Strand: Manchmal liegen große Steine am Rand oder im Sand.' }, young: { whereToLook: 'Schaut mal am Strand auf den Boden.' } },
    alt: 'Ein großer, grauer, abgerundeter Stein im Sand',
    tags: ['stein', 'strand', 'groß'], feat: ['Groß und rund', 'Graue Farbe'] },
  { n: 64, id: 'shell-ridges', c: 'shell', f: 'beach', e: 'T', min: 2, d: 1, k: 'pattern', p: 'Finde eine Muschelschale mit deutlichen Rillen.', a: 'O', sm: true,
    h: 'Nichts anfassen müssen. Genau hinschauen genügt.', pre: 'grow',
    o: { mid: { whatIsIt: 'Die Rillen sind feine Linien auf der Schale.', origin: 'Sie entstehen, wenn die Muschel wächst. Dabei legt sich eine neue Schicht an.' } },
    alt: 'Eine große Muschelschale, auf der die gebogenen Rillen deutlich zu sehen sind',
    tags: ['muschel', 'rillen', 'detail'], feat: ['Feine Rillen von der Spitze zum Rand', 'Fächerform'] },
  { n: 65, id: 'shell-compare', c: 'shell', f: 'beach', e: 'T', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche zwei Muschelschalen mit verschiedenen Formen.',
    lab: ['Die erste Muschelschale', 'Die zweite Muschelschale'], a: 'O', sm: true, h: 'Die Schalen bleiben liegen. Anschauen genügt.', pre: 'grow',
    o: { mid: { whatIsIt: 'Muschelschalen sehen sehr verschieden aus: rund, lang, glatt oder gerillt.' } },
    alt: 'Zwei Muschelschalen: eine runde, gerillte und eine längliche, glatte',
    tags: ['muschel', 'vergleich'], feat: ['Eine runde, gerillte Schale', 'Eine längliche, glatte Schale'] },
  { n: 66, id: 'waves', c: 'waves', f: 'water', e: 'T', min: 2, d: 1, k: 'discover', p: 'Entdecke Wellen aus sicherer Entfernung.', a: 'O',
    h: 'Bleibt in dem Bereich, den die Erwachsenen ausgewählt haben.', pre: 'wave',
    alt: 'Blaue Wellen mit weißen Schaumkronen, die auf einen Strand zulaufen',
    tags: ['wellen', 'wasser'], feat: ['Wellenberge und -täler', 'Weiße Schaumkronen'] },
  { n: 67, id: 'beach-bird', c: 'bird', f: 'animals', e: 'T', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Vogel am Strand.', a: 'O',
    h: 'Nicht verfolgen oder füttern. Ein Vogel muss nicht dabei sein.', pre: 'flutter',
    alt: 'Eine Möwe mit weißem Körper und grauen Flügeln, die am Strand steht',
    tags: ['vogel', 'möwe'], feat: ['Weiß mit grauen Flügeln', 'Gelber Schnabel'] },
  { n: 68, id: 'sand-ripples', c: 'sandPattern', f: 'ground', e: 'T', min: 4, d: 2, k: 'pattern', p: 'Finde Linien oder kleine Hügel im Sand.', x: ['sand'], a: 'O',
    h: 'Bleibt auf dem Weg. Dünen werden nicht betreten.', pre: 'wave',
    alt: 'Heller Sand mit wellenförmigen Linien und kleinen Hügeln',
    tags: ['sand', 'rippeln', 'kontext-sand'], feat: ['Wellenförmige Linien', 'Kleine Hügel'] },
  { n: 69, id: 'footprint-compare', c: 'footprint', f: 'ground', e: 'TK', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche zwei Fußspuren im Sand.', x: ['sand'],
    lab: ['Die erste Fußspur', 'Die zweite Fußspur'], a: 'O', h: 'Schaut nur. Ihr müsst nicht in den Sand laufen.', pre: 'grow',
    o: { mid: { whatIsIt: 'Zwei Fußspuren können unterschiedlich groß sein.' } },
    alt: 'Zwei Fußabdrücke im Sand: ein großer und ein kleiner',
    tags: ['fußspur', 'vergleich', 'kontext-sand'], feat: ['Ein großer Abdruck', 'Ein kleiner Abdruck'] },
  { n: 70, id: 'pebbles', c: 'stone', f: 'beach', e: 'T', min: 4, d: 2, k: 'count', m: 'count', p: 'Entdecke unterschiedlich helle Kiesel.', pm: 'Entdecke {n} unterschiedlich helle Kiesel.', u: 'Kieseln',
    q: { '4-6': [2, 3], '7-10': [2, 3, 4] }, x: ['gravel'], a: 'O', sm: true, h: 'Nur anschauen. Die Kiesel müssen nicht aufgehoben werden.', pre: 'settle',
    o: {
      mid: {
        whatIsIt: 'Kiesel sind kleine, glatte Steine. Manche sind hell, manche dunkel.',
        origin: 'Wasser hat sie rund geschliffen. Sie bestehen aus verschiedenem Gestein und haben deshalb unterschiedliche Farben.',
        whereToLook: 'Schaut dort, wo am Strand viele kleine Steine liegen. Zählen genügt, aufheben ist nicht nötig.',
      },
    },
    alt: 'Mehrere runde Kiesel in hellem Grau, Beige und dunklem Grau nebeneinander',
    tags: ['kiesel', 'steine', 'kontext-kies', 'hell-dunkel'], feat: ['Runde, glatte Form', 'Verschiedene Helligkeit'] },

  /* ---- 71–78: Berge, Weg ---- */
  { n: 71, id: 'trail-marker', c: 'trailMarker', f: 'urban', e: 'BW', min: 4, d: 2, k: 'discover', p: 'Finde eine Wegmarkierung.', a: 'O',
    h: 'Bleibt auf dem Weg. Die Markierung wird nicht verändert.', pre: 'grow',
    alt: 'Ein Holzpfosten mit einem rot-weißen Farbzeichen am Wanderweg',
    tags: ['markierung', 'wanderweg'], feat: ['Farbzeichen an Pfosten oder Baum', 'Meist rot-weiß'] },
  { n: 72, id: 'big-rock', c: 'rock', f: 'rock', e: 'B', min: 2, d: 1, k: 'discover', p: 'Entdecke einen großen Felsen am Weg.', a: 'O',
    h: 'Nur vom Weg aus zeigen. Nicht klettern.', pre: 'grow',
    alt: 'Ein großer grauer Felsen am Wegrand mit Moos und Rissen',
    tags: ['fels', 'groß'], feat: ['Sehr groß und grau', 'Risse und Kanten'] },
  { n: 73, id: 'rock-pattern', c: 'rock', f: 'rock', e: 'B', min: 4, d: 2, k: 'pattern', p: 'Finde ein Muster auf einer Felsfläche.', a: 'O',
    h: 'Nur vom Weg aus anschauen. Nicht klettern und nichts abkratzen.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Auf Felsen sieht man manchmal Streifen, Risse oder bunte Flecken. Das sind Muster.',
        origin: 'Sie entstehen durch Schichten im Gestein, durch Risse und durch Flechten, die auf dem Fels wachsen.',
        whereToLook: 'Schaut vom Weg aus auf die Felsfläche. Bitte nicht klettern und nichts abkratzen.',
      },
    },
    alt: 'Eine Felsfläche mit hellen und dunklen Streifen und kleinen gelben Flecken',
    tags: ['fels', 'muster'], feat: ['Streifen im Gestein', 'Risse und Flecken'] },
  { n: 74, id: 'mountain', c: 'mountain', f: 'rock', e: 'B', min: 2, d: 1, k: 'shape', p: 'Schau dir die Form eines sichtbaren Berges an.', a: 'O',
    h: 'Ihr müsst nirgendwohin gehen. Schaut vom Weg aus.', pre: 'grow',
    alt: 'Ein Berg mit hellem Gipfel und blauem Himmel dahinter',
    tags: ['berg', 'gipfel'], feat: ['Spitzer Gipfel', 'Schräge Flanken'] },
  { n: 75, id: 'path-bend', c: 'path', f: 'ground', e: 'B', min: 4, d: 1, k: 'shape', p: 'Entdecke eine Biegung im Wanderweg.', a: 'H',
    h: 'Bleibt auf dem Weg und geht nicht weiter, als ihr euch vorgenommen habt.', pre: 'draw',
    o: { mid: { whatIsIt: 'Eine Biegung im Weg ist eine Kurve, in der der Weg die Richtung ändert.', whereToLook: 'Schaut auf den Weg vor euch. Bleibt dabei auf dem Weg.' } },
    alt: 'Ein heller Wanderweg, der sich in einer Kurve durch eine grüne Wiese windet',
    tags: ['weg', 'kurve'], feat: ['Weg ändert die Richtung', 'Helle Spur im Gras'] },
  { n: 76, id: 'gravel-path', c: 'stone', f: 'ground', e: 'BWPU', min: 2, d: 1, k: 'discover', p: 'Finde einen Kies- oder Schotterabschnitt auf eurem Weg.', x: ['gravel'], a: 'O', sm: true,
    h: 'Bleibt auf dem Weg. Der Kies muss nicht aufgehoben werden.', pre: 'grow',
    o: {
      young: { whatIsIt: 'Kies sind viele kleine Steine.', origin: 'Menschen streuen Kies auf Wege.', whereToLook: 'Schaut mal auf den Weg.' },
      mid: {
        whatIsIt: 'Kies besteht aus vielen kleinen Steinen. Auf Wegen knirscht er unter den Schuhen.',
        origin: 'Menschen streuen Kies auf Wege, damit sie fest sind. Auch Bäche tragen Kies mit sich.',
        whereToLook: 'Schaut auf den Weg. Kies liegt oft dort, wo der Weg befestigt ist.',
      },
    },
    alt: 'Ein Weg aus hellen Kieselsteinen in verschiedenen Grautönen',
    tags: ['kies', 'weg', 'kontext-kies'], feat: ['Viele kleine Steine', 'Graue und beige Töne'] },
  { n: 77, id: 'trail-grass', ret: true, c: 'grass', f: 'plants', e: 'B', s: 'FSH', min: 2, d: 1, k: 'discover', p: 'Entdecke Gras direkt am Wanderweg.', a: 'O', pre: 'sway',
    h: 'Schaut vom Weg aus. Ihr müsst nicht ins Gras gehen.',
    o: { young: { whereToLook: 'Schaut mal an den Rand vom Weg.' }, mid: { whereToLook: 'Schaut am Rand des Weges. Bleibt auf dem Weg, ihr müsst nicht ins Gras treten.' } },
    alt: 'Grashalme, die am Rand eines hellen Weges wachsen',
    tags: ['gras', 'weg'], feat: ['Schmale grüne Halme', 'Am Wegrand'] },
  { n: 78, id: 'low-plant', ret: true, c: 'lowPlant', f: 'plants', e: 'BWPMGU', s: 'FSH', min: 2, d: 1, k: 'discover', p: 'Finde eine niedrige Pflanze am Weg.', a: 'O', h: NOT_PICK, pre: 'sway',
    alt: 'Eine niedrige Pflanze mit dreiblättrigen Blättern und einer kleinen weißen Blüte dicht am Boden',
    tags: ['pflanze', 'niedrig'], feat: ['Bleibt nah am Boden', 'Kleine Blätter'] },
  { n: 79, id: 'hand-leaf', c: 'leaf', f: 'plants', e: 'WPGBU', s: 'FSH', min: 4, d: 2, k: 'shape', p: 'Entdecke ein Blatt, das ein bisschen wie eine Hand aussieht.', a: 'O',
    h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      mid: {
        whatIsIt: 'Manche Blätter haben Teile, die wie Finger einer Hand aussehen.',
        origin: 'Diese Form bekommt das Blatt beim Wachsen. Jede Pflanzenart hat ihre eigene Form.',
      },
    },
    alt: 'Ein grünes Blatt mit fünf fingerartigen Lappen, die wie eine Hand aussehen',
    tags: ['blatt', 'hand', 'form'], feat: ['Fünf fingerartige Teile', 'Alle gehen von einem Punkt aus'] },

  /* ---- 80–90: Schnee, Wasser, Wiese ---- */
  { n: 80, id: 'snow', c: 'snow', f: 'ground', e: 'WPSMGKBU', s: 'WF', min: 2, d: 1, k: 'discover', p: 'Finde Schnee zum Anschauen.', x: ['snow'], a: 'O',
    h: 'Bleibt auf sicherem Boden. Auf Eis geht ihr nicht.', pre: 'grow',
    alt: 'Eine weiße Schneefläche mit kleinen glitzernden Flocken und einem Zweig',
    tags: ['schnee', 'winter', 'kontext-schnee'], feat: ['Weiße Fläche', 'Kleine Flocken'] },
  { n: 81, id: 'water-surface', ret: true, c: 'water', f: 'water', e: 'U', min: 2, d: 1, k: 'discover', p: 'Schau dir die Wasseroberfläche an.', a: 'H',
    h: 'Bleibt an Land auf eurem sicheren Platz.', pre: 'ripple',
    alt: 'Eine blaue Wasserfläche mit kleinen Ringwellen',
    tags: ['wasser', 'oberfläche'], feat: ['Blaue Fläche', 'Kleine Wellenringe'] },
  { n: 82, id: 'reflection', c: 'water', f: 'water', e: 'U', min: 4, d: 2, k: 'discover', p: 'Entdecke eine Spiegelung im Wasser.', a: 'O',
    h: 'Bleibt an Land auf eurem sicheren Platz.', pre: 'ripple',
    o: {
      mid: {
        whatIsIt: 'Eine Spiegelung entsteht, wenn sich etwas in glattem Wasser zeigt.',
        origin: 'Glattes Wasser wirft das Licht zurück. Deshalb sieht man Bäume oder Himmel darin.',
        whereToLook: 'Schaut vom sicheren Platz aufs Wasser. Bei Wind kräuselt es sich, dann ist die Spiegelung verschwommen.',
      },
    },
    alt: 'Ein See, in dem sich ein Baum und die Wolken spiegeln',
    tags: ['spiegelung', 'wasser'], feat: ['Bild steht auf dem Kopf im Wasser', 'Glatte Wasseroberfläche'] },
  { n: 83, id: 'reed', c: 'reed', f: 'plants', e: 'U', s: 'FSH', min: 2, d: 1, k: 'discover', p: 'Finde Schilf oder hohe Uferhalme zum Anschauen.', a: 'O',
    h: 'Nicht betreten, nichts abschneiden und nicht ins Wasser folgen.', pre: 'sway',
    alt: 'Hohe Schilfhalme mit braunen Rispen am Ufer eines Sees',
    tags: ['schilf', 'ufer'], feat: ['Hohe, schmale Halme', 'Braune Rispen oben'] },
  { n: 84, id: 'shore-stone', ret: true, c: 'stone', f: 'ground', e: 'U', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Stein am Uferweg.', a: 'O', sm: true,
    h: 'Bleibt auf dem Weg. Zum Wasser hinuntersteigen ist nicht nötig.', pre: 'settle',
    o: { young: { whereToLook: 'Schaut mal auf den Weg am Wasser.' }, mid: { whereToLook: 'Schaut am Uferweg auf den Boden. Bleibt auf dem Weg und steigt nicht zum Wasser hinunter.' } },
    alt: 'Ein runder grauer Stein am Rand eines Weges, dahinter Gras',
    tags: ['stein', 'ufer'], feat: ['Runder grauer Stein', 'Liegt am Wegrand'] },
  { n: 85, id: 'stream-bend', c: 'bendWater', f: 'water', e: 'U', min: 4, d: 2, k: 'shape', p: 'Finde eine sichtbare Biegung im Bach oder Uferverlauf.', a: 'O',
    h: 'Schaut vom sicheren Weg aus. Nicht zum Wasser hinuntersteigen.', pre: 'draw',
    alt: 'Ein Bach, der sich in einer Kurve durch eine grüne Wiese schlängelt',
    tags: ['bach', 'kurve'], feat: ['Wasser ändert die Richtung', 'Kurve im Uferverlauf'] },
  { n: 86, id: 'water-path', ret: true, c: 'path', f: 'ground', e: 'U', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Weg am Wasser.', a: 'H',
    h: 'Nur der Weg, den ihr gemeinsam ausgewählt habt.', pre: 'draw',
    o: {
      young: { whatIsIt: 'Das ist ein Weg am Wasser.', whereToLook: 'Schaut mal, wo euer Weg am Wasser entlangführt.' },
      mid: {
        whatIsIt: 'Ein Weg am Wasser führt am Ufer entlang.',
        origin: 'Menschen legen Wege am Ufer an, damit man dort sicher gehen kann.',
        whereToLook: 'Schaut, wo euer Weg am Wasser entlangführt. Bleibt auf dem Weg.',
      },
    },
    alt: 'Ein heller Weg, der an einem See entlangführt, daneben Gras und Bäume',
    tags: ['weg', 'ufer'], feat: ['Heller Weg', 'Wasser daneben'] },
  { n: 87, id: 'acorn', c: 'acorn', f: 'fruits', e: 'WPGBU', s: 'HW', min: 2, d: 1, k: 'count', m: 'count', p: 'Entdecke eine Eichel mit einem Hütchen.', pm: 'Entdecke {n} Eicheln mit Hütchen.', u: 'Eicheln',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4, 5] }, bo: { '4-6': 5, '7-10': 10 }, x: ['oak'], a: 'O', as: { autumn: 'H' }, sm: true,
    h: 'Nur anschauen und liegen lassen, nicht in den Mund nehmen. Eicheln sind nicht zum Essen.', pre: 'settle',
    alt: 'Eine Eichel mit braunem Körper und gemustertem Hütchen',
    tags: ['eichel', 'eiche', 'kontext-eiche'], feat: ['Länglicher brauner Körper', 'Hütchen aus Schuppen'] },
  { n: 88, id: 'grass-seeds', c: 'grass', f: 'plants', e: 'MPGBU', s: 'SH', min: 4, d: 2, k: 'discover', p: 'Finde einen Halm mit Samenstand.', a: 'O',
    h: 'Bitte nicht abreißen und nichts probieren.', pre: 'sway',
    o: {
      mid: {
        whatIsIt: 'Das ist ein Halm mit Samenstand. Oben sitzen viele kleine Samen.',
        origin: 'Gräser bilden im Sommer Blüten, daraus werden Samen. Der Wind trägt sie weiter.',
        whereToLook: 'Schaut auf Wiesen und am Wegrand. Bitte nicht abreißen und nichts probieren.',
      },
    },
    alt: 'Ein hoher Grashalm mit einer Ähre aus vielen kleinen Samen',
    tags: ['gras', 'samen'], feat: ['Hoher Halm', 'Ähre mit vielen Körnchen'] },
  { n: 89, id: 'insect', c: 'insect', f: 'animals', e: 'MPG', s: 'FSH', min: 4, d: 2, k: 'discover', p: 'Entdecke ein Insekt auf einer Pflanze.', a: 'O',
    h: 'Nicht fangen und nicht anfassen. Ein Insekt muss nicht dabei sein.', pre: 'flutter',
    alt: 'Ein roter Marienkäfer mit schwarzen Punkten sitzt auf einem grünen Blatt',
    tags: ['insekt', 'käfer'], feat: ['Sechs Beine', 'Kleiner Körper'] },
  { n: 90, id: 'blossom-compare', c: 'blossom', f: 'plants', e: 'MPG', s: 'FS', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche zwei verschieden große Blüten.',
    lab: ['Die größere Blüte', 'Die kleinere Blüte'], a: 'O', h: NOT_PICK, pre: 'sway',
    o: { mid: { whatIsIt: 'Blüten können verschieden groß sein. Manche sind winzig, andere deutlich größer.' } },
    alt: 'Zwei Blüten im Größenvergleich: eine große gelbe Blüte und eine kleine weiße Blüte',
    tags: ['blüte', 'vergleich', 'größe'], feat: ['Eine große Blüte', 'Eine kleinere Blüte'] },

  /* ---- Ergänzungen der Inhaltsvorgabe v2: konkrete Funde und Spuren (Nummern ab 101) ---- */
  { n: 101, id: 'hazelnut', c: 'hazelnut', f: 'fruits', e: 'WPGBU', s: 'H', min: 2, d: 1, k: 'count', m: 'count', p: 'Finde eine Haselnuss auf dem Boden.', pm: 'Finde {n} Haselnüsse auf dem Boden.', u: 'Haselnüssen',
    q: { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4] }, x: ['hazel'], a: 'O', sm: true,
    h: 'Nur anschauen und liegen lassen, nicht probieren.', pre: 'settle',
    alt: 'Eine runde hellbraune Haselnuss mit hellem Fleck unten, daneben die grüne, gezackte Fruchthülle',
    tags: ['haselnuss', 'nuss', 'kontext-hasel'], feat: ['Rund, mit kleiner Spitze', 'Helle, matte Stelle unten', 'Grüne, gezackte Hülle'] },
  { n: 102, id: 'beechnut', c: 'beechnut', f: 'fruits', e: 'WPGB', s: 'H', min: 2, d: 1, k: 'discover', p: 'Entdecke eine Buchecker – schau dir die kleine dreieckige Form an.', x: ['beech'], a: 'O', sm: true,
    h: 'Nur anschauen und liegen lassen, nicht probieren.', pre: 'settle',
    alt: 'Eine braune, dreikantige Buchecker mit glatter Schale, daneben die aufgesprungene stachelige Hülle',
    tags: ['buchecker', 'buche', 'nuss', 'dreikantig', 'kontext-buche'], feat: ['Kantige, ungefähr dreieckige Form', 'Glatte braune Schale', 'Stachelige Hülle daneben'] },
  { n: 103, id: 'cone-compare', c: 'cone', f: 'fruits', e: 'WPGB', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Finde zwei Zapfen und vergleiche ihre Form.',
    lab: ['Der längliche Zapfen', 'Der rundlichere Zapfen'], x: ['conifers'], a: 'O', h: 'Die Zapfen bleiben liegen. Vergleichen genügt.', pre: 'settle',
    o: {
      mid: {
        whatIsIt: 'Zapfen gibt es länglich und eher rund. Vergleicht, wie lang und wie dick sie sind.',
        origin: 'Jede Nadelbaumart hat ihre eigene Zapfenform. Auch das Alter und das Wetter machen Zapfen etwas verschieden.',
      },
      extra: 'Die Form hilft, Nadelbäume zu unterscheiden. Lange, schlanke Zapfen und kurze, rundliche Zapfen gehören oft zu verschiedenen Arten.',
    },
    alt: 'Zwei Zapfen nebeneinander: ein langer, schlanker und ein kurzer, rundlicher',
    tags: ['zapfen', 'vergleich', 'form', 'kontext-nadelbäume'], feat: ['Ein länglicher, schlanker Zapfen', 'Ein kurzer, rundlicher Zapfen', 'Beide aus Schuppen'] },
  { n: 104, id: 'white-shell', c: 'shell', f: 'beach', e: 'T', min: 2, d: 1, k: 'color', p: 'Entdecke eine weiße Muschelschale.', a: 'O', sm: true,
    h: 'Nur anschauen. Die Schale muss nicht aufgenommen werden.', pre: 'settle',
    o: {
      young: { whatIsIt: 'Das ist eine weiße Muschelschale.' },
      mid: { whatIsIt: 'Das ist eine weiße Muschelschale. Sie ist hell wie Sand oder Milch.', origin: 'Eine leere Schale bleibt zurück, wenn die Muschel nicht mehr lebt. Sonne und Salz können sie mit der Zeit heller machen.' },
    },
    alt: 'Eine fast weiße Muschelschale mit feinen Rillen auf hellem Sand',
    tags: ['muschel', 'weiß', 'schale'], feat: ['Fast weiße Farbe', 'Feine Rillen', 'Fächerform'] },
  { n: 105, id: 'smooth-stone', c: 'stone', f: 'rock', e: 'TUBWP', min: 2, d: 1, k: 'color', p: 'Entdecke einen hellen, glatten Stein.', a: 'O', sm: true,
    h: 'Nur anschauen. Der Stein bleibt liegen.', pre: 'settle',
    o: {
      young: { whatIsIt: 'Das ist ein heller, glatter Stein.', whereToLook: 'Schaut mal auf den Boden am Weg.' },
      mid: {
        whatIsIt: 'Dieser Stein ist hell und ganz glatt, ohne Ecken und Kanten.',
        whereToLook: 'Schaut dort, wo Steine liegen, am Weg oder am Ufer. Bleibt dabei auf dem Weg.',
      },
    },
    alt: 'Ein heller, rundlich glatter Stein neben einem kleineren dunklen Stein',
    tags: ['stein', 'hell', 'glatt'], feat: ['Helle Farbe', 'Glatte, gerundete Oberfläche', 'Keine scharfen Kanten'] },
  { n: 106, id: 'snail-shell-spiral', c: 'snailShell', f: 'beach', e: 'T', min: 2, d: 1, k: 'shape', p: 'Entdecke ein längliches Schneckenhaus mit Spirale.', a: 'O', sm: true,
    h: 'Nur leere Häuschen anschauen. Sitzt noch eine Schnecke darin, lasst sie in Ruhe.', pre: 'settle',
    o: {
      young: { whatIsIt: 'Das ist ein kleines Schneckenhaus. Es ist lang und gedreht.', whereToLook: 'Schaut mal auf den Sand und an den Rand vom Wasser.' },
      mid: {
        whatIsIt: 'Das ist ein längliches Schneckenhaus. Es windet sich wie eine Spirale nach oben.',
        whereToLook: 'Schaut am Strand dort, wo das Wasser Dinge anspült. Solche Häuschen sind oft ziemlich klein.',
      },
    },
    alt: 'Ein längliches, spiralig gewundenes Schneckenhaus in Beige und Braun, das auf Sand liegt',
    tags: ['schneckenhaus', 'spirale', 'länglich'], feat: ['Länglich, spitz zulaufend', 'Windungen wie eine Spirale', 'Öffnung unten'] },
  { n: 107, id: 'snail-shell', c: 'snailShell', f: 'ground', e: 'WPGMBU', min: 2, d: 1, k: 'shape', p: 'Finde ein Schneckenhaus mit Spirale.', a: 'O', sm: true,
    h: 'Nur leere Häuschen anschauen. Sitzt noch eine Schnecke darin, lasst sie in Ruhe.', pre: 'settle',
    alt: 'Ein rundes Schneckenhaus mit braunen Streifen und einer Spirale, die sich nach innen dreht',
    tags: ['schneckenhaus', 'spirale', 'rund'], feat: ['Spirale, die nach innen läuft', 'Runde Form', 'Öffnung am Rand'] },
  { n: 108, id: 'shell-vs-snail', c: 'snailShell', f: 'beach', e: 'T', min: 7, d: 3, k: 'compare', m: 'compare', p: 'Vergleiche eine Muschelschale und ein Schneckenhaus.',
    lab: ['Eine Muschelschale', 'Ein Schneckenhaus'], a: 'O', sm: true, h: 'Beides bleibt liegen. Anschauen genügt.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Eine Muschel hat zwei Schalen, ein Schneckenhaus ist in einem Stück gewunden.',
        origin: 'Muscheln und Schnecken sind verwandte Weichtiere. Beide bauen ihr Haus aus Kalk.',
        whereToLook: 'Schaut am Strand dort, wo das Wasser Dinge anspült. Bleibt auf dem Weg.',
      },
      extra: 'Bei der Muschel verbindet ein Scharnier die beiden Hälften, die Schnecke wächst in ihrem Haus in einer Spirale nach.',
    },
    alt: 'Links eine fächerförmige Muschelschale, rechts ein spiralig gewundenes Schneckenhaus',
    tags: ['muschel', 'schnecke', 'vergleich'], feat: ['Muschel: Fächer mit Rillen, zwei Hälften', 'Schneckenhaus: Spirale in einem Stück'] },
  { n: 109, id: 'animal-track', c: 'track', f: 'tracks', e: 'WPMGBU', min: 4, ex: ['7-10'], d: 2, k: 'discover', p: 'Suche einen gut sichtbaren Tierabdruck im weichen Boden.', x: ['mud'], a: 'O',
    h: 'Nur auf dem Weg schauen. Ihr müsst der Spur nicht folgen.', pre: 'grow',
    alt: 'Mehrere Pfotenabdrücke mit vier Zehen und einem Ballen hintereinander im weichen Boden',
    tags: ['spur', 'tierabdruck', 'kontext-matsch'], feat: ['Vier Zehen und ein Ballen', 'Mehrere Abdrücke hintereinander', 'Vertieft im weichen Boden'] },
  { n: 110, id: 'deer-track', c: 'track', f: 'tracks', e: 'WPMBU', min: 7, d: 3, k: 'discover', p: 'Suche eine Spur mit zwei länglichen Abdrücken, die zu einem Reh passen könnte.', x: ['mud'], a: 'O',
    h: 'Nur auf dem Weg schauen. Ihr müsst der Spur nicht folgen.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Diese Spur zeigt zwei längliche, spitz zulaufende Abdrücke nebeneinander. Das könnte zu einem Reh passen.',
        origin: 'Rehe laufen auf zwei Hufhälften, den Schalen. Sie drücken sich als zwei Spitzen in den Boden.',
        whereToLook: 'Schaut auf weichen Boden am Weg, am Waldrand oder an Wiesen. Ob wirklich ein Reh dort war, wisst ihr nicht sicher.',
      },
      extra: 'Ein Hund hinterlässt dagegen meist Zehen, Ballen und oft kleine Krallenpunkte. Spuren können durch Regen und Gangart verschieden aussehen.',
    },
    alt: 'Ein Abdruck aus zwei länglichen, spitz zulaufenden Hälften nebeneinander im weichen Boden',
    tags: ['spur', 'reh', 'schalen', 'kontext-matsch'], feat: ['Zwei längliche Hälften nebeneinander', 'Spitze nach vorn', 'Keine Zehen oder Ballen'] },
  { n: 111, id: 'dog-track', c: 'track', f: 'tracks', e: 'WPMBU', min: 7, d: 3, k: 'discover', p: 'Suche einen Abdruck mit Ballen und Zehen, der zu einem Hund passen könnte.', x: ['mud'], a: 'O',
    h: 'Nur auf dem Weg schauen. Ihr müsst der Spur nicht folgen.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Dieser Abdruck zeigt einen großen Ballen und vier Zehen, oft mit Krallenpunkten. Das könnte zu einem Hund passen.',
        origin: 'Hunde laufen auf den Zehen. Ihre Krallen sind nicht einziehbar, deshalb sieht man sie oft im Abdruck.',
        whereToLook: 'Schaut auf weichen Boden an Wegen und Wiesen. Ob wirklich ein Hund dort war, wisst ihr nicht sicher.',
      },
      extra: 'Auch Füchse hinterlassen ähnliche Abdrücke. Es hilft, mehrere Abdrücke hintereinander zu betrachten.',
    },
    alt: 'Ein Pfotenabdruck mit großem dreilappigem Ballen, vier Zehen und kleinen Krallenpunkten',
    tags: ['spur', 'hund', 'ballen', 'kontext-matsch'], feat: ['Großer Ballen', 'Vier Zehen', 'Krallenpunkte vor den Zehen'] },
  { n: 112, id: 'bird-track', c: 'track', f: 'tracks', e: 'T', min: 4, d: 2, k: 'discover', p: 'Suche eine Spur im Sand, die zu einem Vogel passen könnte.', x: ['sand'], a: 'O',
    h: 'Nur schauen. Bleibt auf dem Weg und folgt keinem Tier.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Diese Spur hat drei lange Zehen, die nach vorn zeigen. Das könnte zu einem Vogel passen.',
        origin: 'Vögel laufen auf ihren Zehen. Möwen haben zwischen den Zehen eine Haut, die Schwimmhaut.',
        whereToLook: 'Schaut auf feuchten, festen Sand am Strand. Ob wirklich ein Vogel dort war, wisst ihr nicht sicher.',
      },
    },
    alt: 'Ein Vogelabdruck im Sand mit drei langen Zehen nach vorn, verbunden durch Schwimmhäute',
    tags: ['spur', 'vogel', 'sand', 'kontext-sand'], feat: ['Drei lange Zehen nach vorn', 'Schwimmhaut dazwischen', 'Vertiefung im Sand'] },
  { n: 113, id: 'feather', ret: true, c: 'feather', f: 'animals', e: 'WPMGTBUK', min: 2, d: 1, k: 'discover', p: 'Finde eine Feder.', a: 'O',
    h: 'Nur anschauen. Eine Feder muss nicht aufgehoben werden.', pre: 'float',
    alt: 'Eine graue Feder mit weißer Spitze, mit einem Schaft in der Mitte und feinen Ästen zu beiden Seiten',
    tags: ['feder', 'vogel'], feat: ['Schaft in der Mitte', 'Feine Äste zu beiden Seiten', 'Leicht gebogene Form'] },
  { n: 114, id: 'mushroom', c: 'mushroom', f: 'plants', e: 'WPMGB', s: 'SH', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Pilz mit Hut und Stiel.', a: 'O',
    h: 'Pilze nie anfassen, pflücken oder probieren. Ansehen genügt.', pre: 'grow',
    alt: 'Ein roter Pilz mit weißen Punkten und ein kleinerer brauner Pilz im Gras, beide mit Hut und Stiel',
    tags: ['pilz', 'hut', 'stiel'], feat: ['Hut oben', 'Stiel darunter', 'Pilze gibt es in vielen Farben'] },
  { n: 115, id: 'molehill', c: 'molehill', f: 'ground', e: 'MPG', min: 2, d: 1, k: 'discover', p: 'Entdecke einen Maulwurfshügel.', a: 'O',
    h: 'Nur ansehen. Tretet den Hügel nicht platt.', pre: 'grow',
    alt: 'Ein Hügel aus dunkler, lockerer Erde auf einer grünen Wiese, daneben ein zweiter, kleinerer Hügel',
    tags: ['maulwurf', 'hügel', 'erde'], feat: ['Haufen aus dunkler, lockerer Erde', 'Mitten im Gras', 'Oft mehrere nebeneinander'] },
  { n: 116, id: 'dandelion', c: 'dandelion', f: 'plants', e: 'MPG', s: 'FS', min: 2, d: 1, k: 'discover', p: 'Entdecke eine Pusteblume.', a: 'O', as: { spring: 'H' },
    h: 'Nur ansehen. Sie muss nicht gepflückt werden.', pre: 'sway',
    alt: 'Eine Pusteblume: eine runde Kugel aus feinen weißen Schirmchen auf einem Stängel, daneben eine gelbe Löwenzahnblüte',
    tags: ['pusteblume', 'löwenzahn', 'samen'], feat: ['Runde, flauschige Kugel', 'Feine Schirmchen', 'Langer Stängel'] },
  /* ---- Ergänzungen der Spielkonzept-Vorgabe (Nummern ab 117): weitere konkrete Funde aus dem Katalog der Umgebungen ---- */
  { n: 117, id: 'serrated-leaf', c: 'leaf', f: 'plants', e: 'WPSMGBU', s: 'FSH', min: 4, d: 2, k: 'shape', p: 'Finde ein Blatt mit gezacktem Rand.', a: 'O', as: { autumn: 'H' },
    h: GROUND_LEAF_HINT, pre: 'float',
    o: {
      mid: { whatIsIt: 'Dieses Blatt hat einen gezackten Rand, wie eine kleine Säge. Die Zacken sind gut zu sehen.' },
      special: { mid: 'Bei vielen Bäumen und Sträuchern gehört der Blattrand zum Erkennen dazu: glatt, gezackt oder gelappt.' },
      moment: { mid: 'Fahrt mit dem Finger in der Luft den Rand entlang. Wie viele Zacken zählt ihr?' },
    },
    alt: 'Ein grünes Blatt mit fein gezacktem Rand, deutlichen Blattadern und kurzem Stiel',
    tags: ['blatt', 'gezackt', 'rand'], feat: ['Rand mit vielen kleinen Zacken', 'Deutliche Blattadern', 'Spitzes Ende'] },
  { n: 118, id: 'chestnut-husk', c: 'husk', f: 'fruits', e: 'WPG', s: 'H', min: 2, d: 1, k: 'discover', p: 'Entdecke eine aufgeplatzte, stachelige Fruchthülle.', x: ['chestnut'], a: 'O', as: { autumn: 'H' },
    h: 'Die Stacheln pieken. Nur anschauen, nicht anfassen.', pre: 'settle',
    alt: 'Eine grüne, stachelige Kastanienhülle, aufgeplatzt, mit weißem Inneren und einer braunen Kastanie darin',
    tags: ['fruchthülle', 'kastanie', 'stachelig', 'kontext-kastanie'], feat: ['Grün mit vielen kurzen Stacheln', 'In Klappen aufgeplatzt', 'Weißliches Innere'] },
  { n: 119, id: 'maple-seed', c: 'mapleSeed', f: 'fruits', e: 'WPGBU', s: 'SH', min: 2, d: 1, k: 'shape', p: 'Finde eine Ahornfrucht mit zwei Flügeln.', x: ['maple'], a: 'O', sm: true,
    h: 'Nur anschauen. Die Frucht muss nicht aufgehoben werden.', pre: 'float',
    alt: 'Eine Ahornfrucht aus zwei hellbraunen Flügeln mit je einer kleinen Nuss in der Mitte',
    tags: ['ahorn', 'frucht', 'flügel', 'kontext-ahorn'], feat: ['Zwei Flügel wie ein V', 'Zwei kleine Nüsse in der Mitte', 'Hellbraun mit feinen Adern'] },
  { n: 120, id: 'shell-hole', c: 'shell', f: 'beach', e: 'T', min: 4, d: 2, k: 'discover', p: 'Finde eine Muschelschale mit einem kleinen Loch.', a: 'O', sm: true,
    h: 'Nur anschauen. Die Schale bleibt liegen.', pre: 'settle',
    o: { mid: { whatIsIt: 'Diese Muschelschale hat ein kleines, rundes Loch.', origin: 'Woher das Loch kommt, ist oft nicht sicher. Es kann viele Gründe haben.' } },
    alt: 'Eine helle Muschelschale mit feinen Rillen und einem kleinen runden Loch nahe der Spitze',
    tags: ['muschel', 'loch', 'schale'], feat: ['Kleines rundes Loch', 'Feine Rillen', 'Fächerform'] },
  { n: 121, id: 'long-shell', c: 'shell', f: 'beach', e: 'T', min: 2, d: 1, k: 'shape', p: 'Finde eine längliche Muschelschale.', a: 'O', sm: true,
    h: 'Nur anschauen. Die Schale bleibt liegen.', pre: 'settle',
    o: {
      young: { whatIsIt: 'Das ist eine lange Muschelschale.' },
      mid: { whatIsIt: 'Diese Muschelschale ist länglich und fast glatt. Sie ist viel länger als breit.' },
    },
    alt: 'Eine längliche, bläulich dunkle Muschelschale mit feinen Wachstumslinien',
    tags: ['muschel', 'länglich', 'schale'], feat: ['Viel länger als breit', 'Glatt mit feinen Wachstumslinien'] },
  { n: 122, id: 'striped-stone', c: 'stone', f: 'rock', e: 'TUBWPK', min: 2, d: 1, k: 'pattern', p: 'Entdecke einen Stein mit einem hellen Streifen.', a: 'O', sm: true,
    h: 'Nur anschauen. Der Stein bleibt liegen.', pre: 'settle',
    o: {
      young: { whatIsIt: 'Dieser Stein hat einen hellen Streifen.', whereToLook: 'Schaut mal auf den Boden am Weg.' },
      mid: {
        whatIsIt: 'Dieser Stein hat einen hellen Streifen quer über die dunkle Fläche.',
        whereToLook: 'Schaut auf Steine am Weg oder am Ufer. Bleibt dabei auf dem Weg.',
      },
      special: { young: 'Solche Streifen sind oft schon im Gestein.', mid: 'Solche Streifen sind oft Adern aus anderem Gestein, das sich einmal in einem Riss gebildet hat.' },
    },
    alt: 'Ein dunkelgrauer, glatter Stein mit einem deutlichen hellen Streifen quer über die Mitte',
    tags: ['stein', 'streifen'], feat: ['Heller Streifen quer über den Stein', 'Dunkler, glatter Untergrund'] },
  { n: 123, id: 'shoe-print', c: 'footprint', f: 'ground', e: 'KT', min: 4, d: 2, k: 'pattern', p: 'Entdecke einen Schuhabdruck im feuchten Sand.', x: ['sand'], a: 'O',
    h: 'Nur schauen. Ihr müsst nicht in den Sand laufen und folgt keiner Spur.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Ein Schuhabdruck zeigt das Profil der Sohle: Rillen, Wellen oder Punkte.',
        origin: 'Wer über feuchten Sand läuft, drückt die Sohle hinein. Das Muster der Sohle bleibt sichtbar.',
      },
      special: { mid: 'Bei feuchtem Sand erkennt man Abdrücke besser als bei trockenem, weil er nicht gleich zurückrieselt.' },
      moment: { mid: 'Welches Muster hat die Sohle? Gibt es Rillen, Kreise oder Wellen?' },
    },
    alt: 'Ein Schuhabdruck im feuchten Sand mit Wellenprofil und runder Ferse',
    tags: ['schuhabdruck', 'sand', 'sohle', 'kontext-sand'], feat: ['Profil aus Wellen und Rillen', 'Runde Ferse, breiter Ballen', 'Vertieft im Sand'] },
  { n: 124, id: 'lichen', c: 'lichen', f: 'plants', e: 'WPGBU', min: 4, d: 2, k: 'color', p: 'Entdecke eine Flechte auf einem Stein oder an einem Ast.', a: 'O',
    h: 'Flechten bleiben an ihrem Platz. Nur anschauen, nichts abkratzen.', pre: 'grow',
    alt: 'Ein grauer Stein mit gelbgrünen und hellgrauen, krustigen Flechten-Flecken (so ähnlich sehen Flechten auch auf Rinde aus)',
    tags: ['flechte', 'stein', 'kruste'], feat: ['Flache, krustige Flecken', 'Gelbgrün oder grau', 'Fest mit dem Stein verbunden'] },
  { n: 125, id: 'clover', c: 'clover', f: 'plants', e: 'MPGB', s: 'FSH', min: 4, d: 2, k: 'shape', p: 'Finde ein Kleeblatt mit drei Blättchen.', a: 'O', h: NOT_PICK, pre: 'sway',
    alt: 'Ein Kleeblatt mit drei runden Blättchen, daneben ein zweites kleineres Kleeblatt und eine weiße Blüte',
    tags: ['klee', 'dreiblättrig'], feat: ['Drei runde Blättchen', 'Heller Streifen auf jedem Blättchen'] },

  /* ---- Waldkatalog (Nummern ab 126): Fundstücke, Fraßspuren, Zerfall, Muster ---- */
  { n: 126, id: 'acorn-cup', c: 'acornCup', f: 'fruits', e: 'W', s: 'HW', min: 4, d: 2, k: 'shape', p: 'Finde einen Eichelbecher – das kleine Hütchen ohne Eichel.', x: ['oak'], a: 'O', sm: true,
    h: 'Nur anschauen und liegen lassen.', pre: 'settle',
    alt: 'Ein leerer Eichelbecher aus braunen Schuppen mit dunkler Öffnung, daneben ein zweiter, der auf der Seite liegt',
    tags: ['eichelbecher', 'eiche', 'hütchen', 'kontext-eiche'], feat: ['Becher aus kleinen Schuppen', 'Leer, mit runder Öffnung', 'Kleiner Stiel unten'] },
  { n: 127, id: 'beech-husk', c: 'beechHusk', f: 'fruits', e: 'W', s: 'HW', min: 4, d: 2, k: 'shape', p: 'Finde eine leere, stachelige Buchenhülle, die aufgesprungen ist.', x: ['beech'], a: 'O', sm: true,
    h: 'Nur anschauen und liegen lassen.', pre: 'settle',
    alt: 'Eine aufgesprungene braune Buchenhülle mit weichen Stacheln, in der Mitte leer und hell ausgekleidet',
    tags: ['buchenhülle', 'buche', 'stachelig', 'kontext-buche'], feat: ['Aufgesprungen wie ein kleiner Stern', 'Kurze, weiche Stacheln außen', 'Innen hell und leer'] },
  { n: 128, id: 'gnawed-nut', c: 'gnawedNut', f: 'tracks', e: 'W', s: 'HW', min: 4, d: 2, k: 'discover', p: 'Finde eine Haselnussschale mit einem Loch.',
    pa: { '7-10': { one: 'Suche eine angenagte Nussschale. Wer könnte hier geknabbert haben?' } }, x: ['hazel'], a: 'O', sm: true,
    h: 'Nur anschauen. Die Schale bleibt liegen, und niemand folgt einer Spur ins Gebüsch.', pre: 'grow',
    alt: 'Eine Haselnussschale mit einem runden, dunklen Loch, daneben zwei Schalenhälften',
    tags: ['nussschale', 'haselnuss', 'loch', 'geknabbert', 'kontext-hasel'], feat: ['Rundes Loch in der Schale', 'Feine Nagespuren am Rand', 'Daneben aufgebrochene Schalenhälften'] },
  { n: 129, id: 'gnawed-cone', c: 'gnawedCone', f: 'tracks', e: 'W', min: 4, d: 2, k: 'discover', p: 'Finde einen Zapfen, an dem fast alle Schuppen fehlen.',
    pa: { '7-10': { one: 'Finde einen abgenagten Zapfen. Wer könnte hier geknabbert haben?' } }, x: ['conifers'], a: 'O',
    h: 'Nur anschauen. Der Zapfen bleibt liegen.', pre: 'grow',
    alt: 'Ein Zapfen, von dem nur die nackte Spindel mit kleinen Ansätzen und wenige Schuppen an der Spitze übrig sind, daneben lose Schuppen',
    tags: ['zapfen', 'abgenagt', 'spindel', 'geknabbert', 'kontext-nadelbäume'], feat: ['Nackte Mittelspindel', 'Wenige Schuppen oben', 'Lose Schuppen am Boden'] },
  { n: 131, id: 'leaf-skeleton', c: 'leafSkeleton', f: 'decay', e: 'W', s: 'FHW', min: 4, d: 2, k: 'pattern', p: 'Finde ein Blatt, von dem nur noch die feinen Adern übrig sind.', a: 'O', as: { autumn: 'H' },
    h: GROUND_LEAF_HINT, pre: 'settle',
    alt: 'Ein Blatt, von dem nur noch das feine Netz aus Adern und der Stiel übrig sind',
    tags: ['blattskelett', 'adern', 'zerfall'], feat: ['Feines Netz aus Adern', 'Fast keine Blattfläche mehr', 'Mittelrippe und Stiel'] },
  { n: 132, id: 'fern-frond', c: 'fern', f: 'plants', e: 'W', s: 'FSH', min: 2, d: 1, k: 'shape', p: 'Entdecke einen Farnwedel mit vielen kleinen Fiederblättchen.', x: ['fern'], a: 'O', as: { summer: 'H' },
    h: NOT_PICK, pre: 'sway',
    alt: 'Ein grüner Farnwedel mit vielen paarigen Fiederblättchen links und rechts der Mittelrippe, die zur Spitze hin kleiner werden',
    tags: ['farn', 'wedel', 'fieder', 'kontext-farn'], feat: ['Viele Fiederblättchen links und rechts', 'Zur Spitze hin kleiner', 'Fein gefiedert'] },
  { n: 133, id: 'fern-spores', c: 'fern', f: 'plants', e: 'W', s: 'SH', min: 7, d: 3, k: 'pattern', p: 'Schau dir die Unterseite eines Farnwedels an: Siehst du braune Punkte in Reihen?', x: ['fern'], a: 'O',
    h: 'Schaut von der Seite oder hebt einen Wedel am Weg nur kurz an. Nichts abreißen.', pre: 'grow',
    o: {
      mid: {
        whatIsIt: 'Auf der Unterseite mancher Farnwedel sitzen kleine braune Punkte in Reihen. Das sind Sporenhäufchen.',
        origin: 'Farne haben keine Blüten und keine Samen. In den Häufchen reifen winzige Sporen, die der Wind verteilt.',
        whereToLook: 'Schaut im Sommer und Herbst an Farnen am Weg. Nicht alle Wedel haben Häufchen, ihr müsst nur genau schauen.',
      },
      special: { mid: 'Aus einer Spore kann ein neuer Farn wachsen, ohne dass es eine Blüte gibt.' },
      moment: { mid: 'Wie liegen die Punkte: in Reihen, in Haufen oder am Rand? Zählt eine Reihe.' },
    },
    alt: 'Die Unterseite eines hellgrünen Farnwedels mit vielen kleinen braunen Punkten in zwei Reihen auf jedem Fiederblättchen',
    tags: ['farn', 'sporen', 'unterseite', 'kontext-farn'], feat: ['Braune Punkte in Reihen', 'Auf der Blattunterseite', 'Viele kleine Fiederblättchen'] },
  { n: 134, id: 'rotting-wood', c: 'rottingWood', f: 'decay', e: 'W', min: 4, d: 2, k: 'discover', p: 'Entdecke Holz, das schon weich und bröckelig geworden ist.', a: 'O',
    h: 'Nur vom Weg aus schauen. Nicht draufsteigen und nichts aufbrechen: Darin wohnen viele kleine Tiere.', pre: 'settle',
    alt: 'Ein liegender, brauner Holzstamm mit Rissen, bröckeligen Stellen und einem Moospolster, davor kleine Holzkrümel',
    tags: ['totholz', 'zerfall', 'morsch', 'holz'], feat: ['Risse und bröckelige Stellen', 'Dunkles, weiches Holz', 'Krümel am Boden'] },
  { n: 135, id: 'bracket-fungus', c: 'bracketFungus', f: 'fungi', e: 'W', min: 4, d: 2, k: 'shape', p: 'Entdecke einen Pilz, der seitlich an einem Baumstamm wächst.', a: 'O', as: { autumn: 'H' },
    h: 'Pilze nie anfassen oder probieren. Ansehen genügt.', pre: 'grow',
    alt: 'Zwei halbrunde, gestufte Konsolenpilze mit hellen und dunklen Streifen, die seitlich an einem braunen Baumstamm sitzen',
    tags: ['baumpilz', 'konsole', 'stamm', 'pilz'], feat: ['Halbrund wie ein Regal', 'Streifen in hellen und dunklen Bändern', 'Sitzt seitlich am Stamm'] },
  { n: 136, id: 'leaf-aging', c: 'litter', f: 'decay', e: 'W', s: 'FHW', min: 4, d: 2, k: 'compare', m: 'compare', p: 'Vergleiche ein noch ganzes Blatt mit einem alten, schon zerfallenden Blatt.',
    lab: ['Das ganze Blatt', 'Das alte Blatt'], a: 'O', as: { autumn: 'H' }, h: GROUND_LEAF_HINT, pre: 'settle',
    alt: 'Links ein farbiges, ganzes Blatt, rechts ein dunkles, braunes Blatt mit Löchern und ausgefransten Rändern',
    tags: ['laub', 'vergleich', 'zerfall', 'blatt'], feat: ['Ein ganzes, farbiges Blatt', 'Ein dunkles Blatt mit Löchern und Fransen'] },
  { n: 137, id: 'gall', c: 'gall', f: 'plants', e: 'W', s: 'SH', min: 7, d: 3, k: 'discover', p: 'Suche an einem Eichenblatt kleine, runde Kugeln. Das könnten Gallen sein.', x: ['oak'], a: 'O',
    h: 'Nur anschauen. Am Blatt wird nichts abgerissen.', pre: 'grow',
    alt: 'Ein grünes Eichenblatt mit drei kleinen, runden, hellbraunen Kugeln, die wie Perlen darauf sitzen',
    tags: ['galle', 'eichenblatt', 'kugel', 'kontext-eiche'], feat: ['Kleine, runde Kugeln am Blatt', 'Hellbraun und glatt', 'Sitzen fest am Blatt'] },
  { n: 138, id: 'leaf-mine', c: 'leafMine', f: 'plants', e: 'W', s: 'SH', min: 7, d: 3, k: 'pattern', p: 'Suche ein Blatt mit hellen Schlangenlinien: Das könnte eine Blattmine sein.', a: 'O',
    h: 'Nur anschauen. Am Blatt wird nichts abgerissen.', pre: 'draw',
    alt: 'Ein grünes Blatt mit einer hellen, geschlängelten Linie im Inneren, die zum Ende hin breiter wird',
    tags: ['blattmine', 'schlangenlinie', 'blatt'], feat: ['Helle, geschlängelte Linie im Blatt', 'Wird zum Ende hin breiter', 'Blattoberfläche bleibt ganz'] },
  { n: 139, id: 'wood-grain', c: 'woodGrain', f: 'trees', e: 'W', min: 4, d: 2, k: 'pattern', p: 'Entdecke Holz mit deutlicher Maserung, zum Beispiel an einem gebrochenen Ast.', a: 'O',
    h: 'Nur anschauen. Nichts abbrechen.', pre: 'draw',
    alt: 'Ein Stück helles Holz mit vielen geschwungenen Linien, die um einen dunklen Astknoten herumlaufen',
    tags: ['holz', 'maserung', 'astknoten', 'muster'], feat: ['Geschwungene Linien im Holz', 'Dunkler Astknoten', 'Linien biegen um den Knoten'] },
  { n: 140, id: 'tree-rings', c: 'stump', f: 'trees', e: 'W', min: 4, d: 2, k: 'pattern', p: 'Finde Jahresringe auf einer glatten Schnittfläche.', a: 'O',
    h: 'Nur vom Weg aus anschauen. Daraufsteigen ist nicht nötig.', pre: 'draw',
    o: {
      mid: {
        whatIsIt: 'Auf der Schnittfläche eines Stammes liegen Ringe wie Kreise ineinander. Das sind die Jahresringe.',
        origin: 'Ein Baum wächst jedes Jahr ein Stück dicker. So entsteht außen ein neuer Ring.',
        whereToLook: 'Schaut auf Baumstümpfe oder auf abgesägte Stämme am Weg. Zählt die Ringe nicht im Boden, nur von oben.',
      },
      special: { mid: 'Breite und schmale Ringe erzählen, wie gut das Jahr für den Baum war.' },
      extra: 'Jedes Jahr hat der Baum erst helles, dann dunkleres Holz gebildet. Daran sieht man einen Ring. Im Winter wächst der Baum kaum.',
      moment: { mid: 'Welche Ringe sind breit und welche schmal? Fahrt mit dem Finger in der Luft von der Mitte nach außen.' },
    },
    alt: 'Eine runde Baumscheibe mit vielen Ringen ineinander, einem Punkt in der Mitte und einem kleinen Riss',
    tags: ['jahresringe', 'baumscheibe', 'stumpf'], feat: ['Viele Ringe ineinander', 'Punkt in der Mitte', 'Dunkle Rinde außen'] },
  { n: 141, id: 'tree-seedling', c: 'seedling', f: 'plants', e: 'W', s: 'FSH', min: 2, d: 1, k: 'discover', p: 'Finde einen ganz kleinen Baum, der gerade erst aus dem Boden wächst.', a: 'O',
    h: 'Nur anschauen und nicht ausreißen. Er wird einmal ein großer Baum.', pre: 'grow',
    alt: 'Ein winziger Baumkeimling mit dünnem Stängel, zwei runden Keimblättern und zwei ersten kleinen Blättern auf dunklem Waldboden',
    tags: ['keimling', 'sämling', 'baum', 'klein'], feat: ['Dünner Stängel', 'Zwei runde Keimblätter', 'Erste kleine Blättchen'] },
  { n: 142, id: 'spider-web', c: 'web', f: 'animals', e: 'W', s: 'FSH', min: 2, d: 1, k: 'pattern', p: 'Entdecke ein Spinnennetz.', a: 'O', as: { autumn: 'H' },
    h: 'Nur anschauen. Nicht berühren und keine Spinne stören.', pre: 'draw',
    alt: 'Ein rundes Spinnennetz mit geraden Speichen und feinen Kreisen dazwischen, mit glitzernden Tropfen, zwischen zwei Zweigen gespannt',
    tags: ['spinnennetz', 'netz', 'speichen', 'tau'], feat: ['Gerade Speichen von der Mitte', 'Feine Spiralen dazwischen', 'Zwischen zwei Zweigen gespannt'] },
  { n: 143, id: 'needle-twig', c: 'needleTwig', f: 'trees', e: 'W', min: 2, d: 1, k: 'shape', p: 'Finde einen kleinen Zweig, an dem noch Nadeln sitzen.', a: 'O',
    h: 'Die Nadeln bleiben am Zweig. Nur anschauen, nicht abzupfen.', pre: 'settle',
    alt: 'Ein kleiner brauner Nadelzweig, an dem ringsum viele kurze grüne Nadeln sitzen',
    tags: ['nadelzweig', 'nadeln', 'nadelbaum', 'kontext-nadelbäume'], feat: ['Viele kurze Nadeln rundum', 'Dünner brauner Zweig', 'Nadeln sitzen noch fest'] },
  { n: 144, id: 'beech-bud', c: 'beechBud', f: 'plants', e: 'W', s: 'FHW', min: 4, d: 2, k: 'shape', p: 'Entdecke eine lange spitze Knospe wie im Bild.', a: 'O',
    h: 'Bitte nur anschauen und nicht abbrechen. Ein kleiner Zweig am Weg genügt.', pre: 'grow',
    alt: 'Ein dünner Zweig mit langen, schlanken, spitzen rotbraunen Knospen, die abwechselnd rechts und links sitzen',
    tags: ['knospe', 'buche', 'spitz', 'zweig', 'kontext-buche'], feat: ['Lang und schlank', 'Spitz zulaufend', 'Rotbraune Schuppen'] },
];

/**
 * Redaktioneller Waldzuschnitt (siehe docs/WALDKATALOG.md):
 * – Nur Vorlagen, die im Wald vorkommen und kindgerecht zu einem Fund oder einer Spur führen, sind aktiv.
 * – Alles andere ist ausgemustert (`retired`): Es wird nie neu gezogen, bleibt aber für gespeicherte alte Runden erhalten.
 * – Pro Vorlage steht fest, zu welchen Leitmotiven sie erzählerisch passt.
 */
const NOT_FOR_FOREST = new Set([
  'ground-shadow', 'puddle', 'snow', 'trail-marker', 'gravel-path', 'smooth-stone', 'striped-stone', 'snail-shell',
  // Fassung 4.0: allgemeine Rinden-, Baum-, Boden- und Stockaufträge sind keine Suchaufgaben mehr
  'bark', 'bark-compare', 'root', 'tree-stump', 'tree-rings', 'forked-twig', 'wood-grain', 'rotting-wood', 'twig-bud', 'tree-seedling',
  // Allgemeine Blattaufträge nach Farbe, Größe oder Rand: ähnliche Blätter sind keine eigenen Grundkonzepte
  'fallen-leaf', 'green-leaf', 'yellow-leaf', 'red-leaf', 'dry-leaf', 'leaf-two-shapes', 'leaf-big-small', 'leaf-veins', 'serrated-leaf', 'hand-leaf', 'leaf-aging',
]);

const THEME_OF: Record<string, Theme[]> = {
  // Wie aus Kleinem ein Baum wird
  acorn: ['growth', 'year'], 'acorn-cup': ['growth'], beechnut: ['growth', 'year'], 'beech-husk': ['growth'], 'maple-seed': ['growth', 'year'],
  cone: ['growth', 'pattern'], 'cone-compare': ['growth', 'pattern'], 'twig-bud': ['growth', 'year'], 'tree-seedling': ['growth', 'year'],
  'forked-twig': ['growth', 'pattern'], 'tree-stump': ['growth', 'decay'], 'tree-rings': ['growth', 'pattern'], root: ['growth', 'water'],
  chestnut: ['growth', 'year'], 'chestnut-husk': ['growth'], hazelnut: ['growth', 'gnawed', 'year'],
  // Wer hat hier geknabbert?
  'gnawed-nut': ['gnawed'], 'gnawed-cone': ['gnawed'], 'leaf-hole': ['gnawed'], 'leaf-mine': ['gnawed', 'pattern'], gall: ['gnawed', 'pattern'],
  'animal-track': ['gnawed'], 'deer-track': ['gnawed'], 'dog-track': ['gnawed'],
  // Das kleine Wald-Wasserwunder
  moss: ['water'], 'fern-frond': ['water', 'pattern'], 'fern-spores': ['water', 'pattern'], lichen: ['water', 'pattern', 'decay'],
  mushroom: ['water', 'decay', 'year'], 'rotting-wood': ['water', 'decay'], 'spider-web': ['water', 'pattern'],
  // Aus Alt wird Neues
  'bracket-fungus': ['decay'], 'leaf-skeleton': ['decay', 'gnawed', 'pattern'], 'leaf-aging': ['decay', 'year'], 'dry-leaf': ['decay', 'year'],
  // Muster, die Geschichten erzählen
  bark: ['pattern'], 'bark-compare': ['pattern'], 'leaf-veins': ['pattern'], 'wood-grain': ['pattern'], 'serrated-leaf': ['pattern'],
  'leaf-two-shapes': ['pattern'],
  // Der Wald im Jahreslauf
  'fallen-leaf': ['year'], 'green-leaf': ['year'], 'yellow-leaf': ['year'], 'red-leaf': ['year'], 'leaf-big-small': ['year', 'pattern'],
  'hand-leaf': ['year'], 'maple-leaf': ['year', 'pattern'], 'oak-leaf': ['year', 'pattern'],
};

Object.assign(THEME_OF, {
  'needle-twig': ['growth', 'year'],
  'beech-bud': ['growth', 'year'],
  // Weniger Doppelzuordnungen: Ein Fund soll nicht in jeder Mission als „passend“ erzwungen werden.
  lichen: ['water', 'pattern'],
  mushroom: ['water', 'decay'],
  'leaf-skeleton': ['decay', 'pattern'],
});
// Auch Laub, Nadeln und leere Hüllen werden am Waldboden zersetzt: Sie passen zu „Aus Alt wird Neues“.
for (const id of ['maple-leaf', 'oak-leaf', 'acorn-cup', 'beech-husk', 'needle-twig']) THEME_OF[id] = [...new Set([...(THEME_OF[id] ?? []), 'decay' as Theme])];

const PRUNED_YOUNG_Q: Partial<Record<AgeGroup, number[]>> = { '2-3': [1], '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4, 5] };

/**
 * Konkretisierung der Aufträge (Fassung 4.0): Der Auftrag nennt einen begrenzten, erkennbaren Gegenstand oder eine
 * markante Spur. Baumarten sind freiwillig: Sie machen passende Funde wahrscheinlicher (`softContext`), sind aber nur dort
 * Voraussetzung, wo ohne sie nichts gefunden werden kann (Rosskastanie, Ahorn, Eiche für Blatt und Galle, Farn, weicher Boden).
 */
const PATCH: Record<string, Partial<TaskTemplate>> = {
  acorn: { prompt: { one: 'Finde eine Eichel mit einem Hütchen.', many: 'Finde {n} Eicheln mit Hütchen.' }, requiredContext: [], softContext: ['oak'], availability: 'situational', availabilityBySeason: { autumn: 'situational', winter: 'situational' } },
  'acorn-cup': { prompt: { one: 'Entdecke ein einzelnes Eichelhütchen.' }, requiredContext: [], softContext: ['oak'] },
  beechnut: { prompt: { one: 'Finde eine braune Buchecker mit drei Kanten.' }, requiredContext: [], softContext: ['beech'] },
  'beech-husk': { prompt: { one: 'Entdecke eine leere Hülle, die sich in vier Teile geöffnet hat.' }, requiredContext: [], softContext: ['beech'] },
  hazelnut: { prompt: { one: 'Entdecke eine Haselnuss auf dem Boden.', many: 'Entdecke {n} Haselnüsse auf dem Boden.' }, requiredContext: [], softContext: ['hazel'] },
  'gnawed-nut': { prompt: { one: 'Finde eine Nussschale mit einer Öffnung.' }, requiredContext: [], softContext: ['hazel'] },
  cone: { prompt: { one: 'Entdecke einen Zapfen mit vielen Schuppen.', many: 'Entdecke {n} Zapfen mit vielen Schuppen.' }, requiredContext: [], softContext: ['conifers'] },
  'gnawed-cone': { prompt: { one: 'Entdecke einen Zapfen, an dem viele Schuppen fehlen.' }, requiredContext: [], softContext: ['conifers'] },
  'cone-compare': { prompt: { one: 'Vergleiche einen länglichen und einen rundlicheren Zapfen.' }, requiredContext: [], softContext: ['conifers'] },
  'needle-twig': { requiredContext: [], softContext: ['conifers'] },
  'beech-bud': { requiredContext: [], softContext: ['beech'] },
  'maple-seed': { minAge: 4, ageGroups: ['4-6', '7-10'], quantityByAge: { '4-6': [1], '7-10': [1] }, prompt: { one: 'Finde eine Ahornfrucht mit zwei Flügeln.' } },
  'maple-leaf': {
    minAge: 2, ageGroups: ['2-3', '4-6', '7-10'], difficulty: 1, quantityByAge: { ...PRUNED_YOUNG_Q }, countingBoostMaxByAge: { '4-6': 5, '7-10': 10 },
    prompt: { one: 'Entdecke ein gefallenes Blatt mit dieser Handform.', many: 'Entdecke {n} gefallene Blätter mit dieser Handform.' }, unit: 'Blättern',
  },
  'oak-leaf': {
    minAge: 4, ageGroups: ['4-6', '7-10'], difficulty: 2, quantityByAge: { '4-6': [1, 2, 3], '7-10': [1, 2, 3, 4, 5] }, countingBoostMaxByAge: { '4-6': 5, '7-10': 10 },
    prompt: { one: 'Finde ein gefallenes Eichenblatt wie dieses.', many: 'Finde {n} gefallene Eichenblätter wie dieses.' },
  },
  'leaf-skeleton': { prompt: { one: 'Entdecke ein Blatt, von dem fast nur das feine Netz übrig ist.' } },
  'leaf-mine': { prompt: { one: 'Entdecke ein Blatt mit einer solchen hellen Spur.' } },
  gall: { prompt: { one: 'Entdecke eine kleine runde Galle an einem Blatt.' } },
  moss: { prompt: { one: 'Entdecke ein grünes Moospolster wie ein kleines Kissen.' } },
  'fern-frond': { prompt: { one: 'Entdecke ein Farnblatt mit vielen kleinen Seitenblättern.' } },
  'fern-spores': { prompt: { one: 'Entdecke die kleinen Gruppen auf diesem Farnblatt.' } },
  'bracket-fungus': { prompt: { one: 'Entdecke einen Pilz, der seitlich am Holz wächst.' } },
  lichen: { prompt: { one: 'Entdecke eine Flechte mit solchen kleinen Lappen.' } },
  'animal-track': { prompt: { one: 'Entdecke einen Tierabdruck im weichen Boden.' } },
};

/**
 * Eng verwandte Konzepte gelten für die Auswahl als eine Gruppe: Eine Mission zeigt nie zugleich die Eichel und den
 * leeren Eichelbecher, den ganzen und den abgenagten Zapfen, die Buchecker und ihre leere Hülle, die Haselnuss und die Nussschale.
 */
export const CONCEPT_GROUP: Record<string, string> = { acornCup: 'acorn', gnawedCone: 'cone', beechHusk: 'beechnut', gnawedNut: 'hazelnut' };
export const conceptGroup = (conceptId: string): string => CONCEPT_GROUP[conceptId] ?? conceptId;

function curateForest(t: TaskTemplate): TaskTemplate {
  const forestable = t.environments.includes('forest') && !NOT_FOR_FOREST.has(t.id);
  if (t.retired || !forestable) return { ...t, retired: true };
  return { ...t, ...PATCH[t.id], environments: ['forest'], themes: THEME_OF[t.id] ?? [] };
}

export const templates: TaskTemplate[] = specs.map(build).map(curateForest);

export const templatesById: Record<string, TaskTemplate> = Object.fromEntries(templates.map((t) => [t.id, t]));

/** Katalogstand für gespeicherte Runden. Bei inhaltlichen Änderungen erhöhen. */
export const CATALOG_VERSION = '4.0.0';

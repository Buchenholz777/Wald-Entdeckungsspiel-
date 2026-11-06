import type { ConceptInfo, Environment, Season } from '../domain/types';

/**
 * Entdeckerhilfe je Konzept: „Was ist das?“, „Woher kommt es?“, „Hier könnt ihr schauen“.
 * Varianten (z. B. Ahornblatt) verfeinern einzelne Felder über `infoOverride` an der Vorlage.
 * Die Kindertexte enthalten keine Quellenangaben; Belege stehen intern in `factSources`.
 */

type Trio = [string, string, string];

interface Def {
  label: string;
  y?: Trio;
  m: Trio;
  x?: string;
  env?: Partial<Record<Environment, string>>;
  season?: Partial<Record<Season, string>>;
  talk?: string;
  src: string[];
}

const list: ConceptInfo[] = [];

function c(conceptId: string, d: Def): void {
  list.push({
    conceptId,
    label: d.label,
    young: d.y ? { whatIsIt: d.y[0], origin: d.y[1], whereToLook: d.y[2] } : undefined,
    mid: { whatIsIt: d.m[0], origin: d.m[1], whereToLook: d.m[2] },
    extra: d.x,
    lookByEnv: d.env,
    lookBySeason: d.season,
    talk: d.talk,
    factSources: d.src,
  });
}

const GEN = 'Redaktionell aus Allgemeinwissen verfasst; Gegenprüfung durch Fachlektorat steht aus.';

/* ---------- Formen, Muster, Beobachtungen ---------- */

c('round', {
  label: 'Etwas Rundes',
  y: ['Rund ist wie ein Ball.', 'Runde Dinge gibt es in der Natur und gebaut von Menschen.', 'Schaut mal: Ein Stein, ein Rad oder eine Blütenmitte kann rund sein.'],
  m: [
    'Etwas Rundes hat keine Ecken. Von der Seite sieht es aus wie ein Kreis.',
    'Manches Runde entsteht in der Natur, anderes bauen Menschen, zum Beispiel Räder.',
    'Schaut euch um: Vielleicht ist ein Stein, ein Schild oder ein Rad rund.',
  ],
  x: 'Ein Kreis ist überall gleich weit von seiner Mitte entfernt. Findet ihr etwas Flaches und etwas Dickes, das rund ist?',
  talk: 'Was ist das Runde, das ihr entdeckt habt: flach wie ein Teller oder dick wie ein Ball?',
  src: [GEN, 'Geometrie: Kreis und Kugel (Schulwissen)'],
});

c('long', {
  label: 'Etwas Langes',
  y: ['Lang heißt: viel länger als breit.', 'Ein Ast oder ein Grashalm ist lang.', 'Schaut mal: Ein Ast, ein Zaun oder ein Halm kann lang sein.'],
  m: [
    'Etwas Langes ist viel länger als breit, so wie ein Stock oder ein Seil.',
    'Manches Lange wächst, zum Beispiel Gräser. Anderes stellen Menschen her, zum Beispiel Zaunlatten.',
    'Schaut euch um: Vielleicht entdeckt ihr einen langen Ast, einen Zaun oder einen Weg.',
  ],
  x: 'Ihr könnt Längen vergleichen, ohne zu messen: Was ist länger als euer Arm, was ist kürzer?',
  src: [GEN],
});

c('straightLine', {
  label: 'Eine gerade Linie',
  m: [
    'Eine gerade Linie hat keine Kurve. Sie führt einfach geradeaus.',
    'Gerade Linien entstehen oft beim Bauen, etwa bei Zäunen und Hauskanten. In der Natur sind sie seltener, zum Beispiel bei manchen Halmen.',
    'Schaut euch die Kanten von Häusern, Bänken oder Zäunen an. Auch ein Halm kann ziemlich gerade sein.',
  ],
  x: 'Fahrt mit dem Finger in der Luft an der Linie entlang. Wo hört sie auf, wo würde sie weitergehen?',
  src: [GEN],
});

c('curvedLine', {
  label: 'Eine gebogene Linie',
  m: [
    'Eine gebogene Linie hat eine Kurve, so wie ein Bogen oder eine Welle.',
    'Biegungen entstehen zum Beispiel, wenn ein Ast wächst, Wasser fließt oder Menschen einen Weg schwungvoll anlegen.',
    'Schaut euch einen Ast, den Rand eines Weges oder die Rundung eines Gegenstands an.',
  ],
  x: 'Kurven können eng oder weit sein. Welche Biegung, die ihr seht, ist die weiteste?',
  src: [GEN],
});

c('pattern', {
  label: 'Ein Muster',
  m: [
    'Ein Muster ist etwas, das sich immer wieder gleich wiederholt, zum Beispiel Streifen oder Punkte.',
    'Muster entstehen in der Natur, etwa bei Rinde oder Blättern. Menschen legen sie auch selbst, zum Beispiel beim Pflastern.',
    'Schaut auf den Boden, auf einen Zaun, eine Mauer oder auf Rinde. Vielleicht wiederholt sich dort etwas.',
  ],
  x: 'Was wiederholt sich in eurem Muster: eine Form, eine Farbe oder beides?',
  src: [GEN, 'Stiftung Lesen: Naturmaterialien entdecken (Farbe, Form, Anzahl als Vergleichsebenen)'],
});

c('twoColors', {
  label: 'Etwas mit zwei Farben',
  m: [
    'Wir suchen etwas, das zwei Farben hat, zum Beispiel Gelb und Braun.',
    'Viele Pflanzen haben mehrere Farben, etwa eine Blüte mit andersfarbiger Mitte. Menschen malen Dinge auch zweifarbig an.',
    'Schaut bei Blüten, Blättern, Schildern oder Spielgeräten. Vielleicht entdeckt ihr etwas mit zwei Farben.',
  ],
  x: 'Welche zwei Farben seht ihr? Gibt es einen Rand, an dem die eine Farbe in die andere übergeht?',
  src: [GEN],
});

c('lightDark', {
  label: 'Hell und dunkel',
  m: [
    'Eine helle Fläche sieht heller aus, eine dunkle Fläche sieht dunkler aus.',
    'Hell und dunkel entstehen durch Farbe, Material und Licht. Wo Schatten liegt, wird es dunkler.',
    'Schaut zum Beispiel auf einen hellen Stein und einen dunklen Stamm oder auf zwei Wände.',
  ],
  x: 'Wird dieselbe Fläche heller, wenn die Sonne darauf scheint? Schaut an verschiedenen Stellen nach.',
  src: [GEN],
});

c('tallLow', {
  label: 'Hoch und niedrig',
  m: [
    'Etwas Hohes reicht weit nach oben. Etwas Niedriges bleibt nah am Boden.',
    'Pflanzen und Gebäude sind unterschiedlich hoch, zum Beispiel ein Baum und ein Grashalm.',
    'Schaut zum Beispiel auf einen Baum und das Gras davor oder auf ein Haus und eine Bank. Nur schauen, nicht klettern.',
  ],
  x: 'Was ist höher als ihr, was ist niedriger? Wie verändert sich das Bild, wenn ihr euch daneben stellt?',
  src: [GEN],
});

c('shadow', {
  label: 'Ein Schatten',
  y: ['Ein Schatten ist eine dunkle Stelle.', 'Er entsteht, wenn etwas das Licht aufhält.', 'Schaut mal auf den Boden neben einem Baum oder einer Bank.'],
  m: [
    'Ein Schatten ist eine dunkle Stelle, die entsteht, wenn etwas das Licht aufhält.',
    'Die Sonne scheint auf einen Gegenstand. Dahinter kommt kein Licht an, dort liegt der Schatten.',
    'Schaut auf den Boden neben Bäumen, Bänken oder Zäunen. Dort liegt oft ein Schatten.',
  ],
  x: 'Ein Schatten zeigt immer von der Sonne weg und wandert im Lauf des Tages mit. Wohin zeigt er jetzt?',
  talk: 'Was fällt dir an der Form des Schattens auf?',
  src: [GEN],
});

c('puddle', {
  label: 'Eine Pfütze',
  y: ['Eine Pfütze ist Wasser auf dem Boden.', 'Sie entsteht, wenn es geregnet hat.', 'Schaut auf den Weg: Steht dort Wasser? Ihr müsst nicht hineintreten.'],
  m: [
    'Eine Pfütze ist eine kleine Stelle, auf der Wasser stehen geblieben ist.',
    'Regen sammelt sich in einer Mulde und versickert nur langsam. Später verdunstet das Wasser.',
    'Schaut auf Wege und Mulden im Boden. Ihr könnt von hier aus schauen und müsst nicht hineintreten.',
  ],
  x: 'In einer Pfütze spiegelt sich oft der Himmel. Was erkennt ihr darin?',
  src: [GEN],
});

/* ---------- Bäume und Pflanzen ---------- */

c('tree', {
  label: 'Ein Baum',
  y: ['Ein Baum hat einen Stamm und viele Äste.', 'Er wächst aus einem kleinen Samen.', 'Schaut mal nach oben: Bäume stehen zum Beispiel im Wald oder am Wegrand.'],
  m: [
    'Ein Baum hat einen dicken Stamm, viele Äste und meist Blätter oder Nadeln.',
    'Ein Baum wächst aus einem Samen. Er braucht viele Jahre, bis er groß ist.',
    'Schaut euch um: Bäume stehen an Wegen, im Wald, im Park und manchmal auch am Straßenrand.',
  ],
  x: 'Bäume nehmen mit den Wurzeln Wasser aus der Erde auf und mit den Blättern Licht auf. So wachsen sie jedes Jahr ein Stück.',
  env: {
    forest: 'Im Wald stehen viele Bäume dicht beieinander. Schaut auf Stämme und Kronen.',
    park: 'Im Park stehen Bäume oft einzeln auf Wiesen oder an den Wegen.',
    city: 'Schaut am Straßenrand oder im Hof: Manchmal steht dort ein einzelner Baum.',
    playground: 'Oft stehen Bäume am Rand des Spielplatzes und spenden Schatten.',
  },
  season: {
    winter: 'Im Winter haben viele Bäume keine Blätter. Dann seht ihr ihre Äste besonders gut.',
    autumn: 'Im Herbst färben sich viele Baumblätter bunt.',
  },
  talk: 'Welche Form hat der Baum, den ihr entdeckt habt?',
  src: [GEN, 'Stiftung Kinder forschen: Herbstspaziergang'],
});

c('twig', {
  label: 'Ein Zweig',
  y: ['Ein Zweig ist ein dünner Ast.', 'Er wächst an einem Baum oder Busch.', 'Schaut mal auf den Boden unter Bäumen und Büschen.'],
  m: [
    'Ein Zweig ist ein dünner Ast. An ihm wachsen oft Blätter.',
    'Zweige wachsen an Bäumen und Büschen. Bei Wind oder wenn sie alt sind, brechen sie manchmal ab.',
    'Schaut auf den Boden unter Bäumen und Büschen. Dort liegen oft Zweige. Ihr müsst keinen aufheben.',
  ],
  x: 'Zweige wachsen jedes Jahr ein Stück weiter, oft an der Spitze. So entstehen verzweigte Äste.',
  talk: 'Wie sieht die Oberfläche von eurem Zweig aus: glatt oder rau?',
  src: [GEN],
});

c('bark', {
  label: 'Baumrinde',
  y: ['Die Rinde ist die Außenseite vom Baum.', 'Sie schützt den Baum wie eine Jacke.', 'Schaut euch die Stämme am Weg an.'],
  m: [
    'Die Rinde ist die äußere Hülle eines Baumes. Sie kann glatt oder rau sein.',
    'Sie entsteht am Baum und schützt ihn wie eine Jacke vor Kälte und Hitze.',
    'Schaut euch die Stämme am Weg an. Die Rinde kann ganz unterschiedliche Muster haben. Bitte nicht ablösen.',
  ],
  x: 'Jede Baumart hat eine eigene Rindenstruktur. Daran lassen sich manche Bäume sogar im Winter erkennen.',
  talk: 'Wie fühlt sich die Rinde an, wenn ihr sie mit der Hand berührt: weich, rau, rissig?',
  src: [GEN, 'Nationalpark Schwarzwald: Weiß-Tanne (Rindenbeschreibung)'],
});

c('moss', {
  label: 'Moos',
  y: ['Moos ist weich und grün.', 'Es wächst auf Stämmen, Steinen und Boden.', 'Schaut mal an feuchte, schattige Stellen.'],
  m: [
    'Moos ist eine kleine, weiche, meist grüne Pflanze, die wie ein Polster aussieht.',
    'Moos hat keine richtigen Wurzeln. Es wächst auf Stämmen, Steinen und Boden und nimmt Regenwasser auf.',
    'Schaut an feuchte, schattige Stellen: an einen Baumstamm, einen Stein oder den Boden. Bitte nur anschauen.',
  ],
  x: 'Moos kann viel Wasser speichern wie ein kleiner Schwamm.',
  src: [GEN, 'NABU: Moose (Überblick)'],
});

c('leaf', {
  label: 'Ein Blatt',
  y: ['Das ist ein Blatt. Es gehört zu einer Pflanze.', 'Es ist an einer Pflanze gewachsen und später heruntergefallen.', 'Schaut einmal auf den Boden unter Bäumen.'],
  m: [
    'Das ist ein Blatt. Es gehört zu einer Pflanze und hat oft feine Linien, die Blattadern.',
    'Das Blatt ist an einem Baum oder Busch gewachsen und später heruntergefallen.',
    'Schaut einmal auf den Boden unter Bäumen und Büschen.',
  ],
  x: 'Im Herbst bauen viele Bäume das Blattgrün ab. Dann werden gelbe und orange Farbstoffe sichtbar, manche Blätter färben sich auch rot.',
  env: {
    meadow: 'Schaut am Rand der Wiese unter Büschen und Bäumen nach.',
    garden: 'Schaut unter Bäumen und Sträuchern im Garten.',
    mountain: 'Schaut am Wegrand unter Bäumen und Sträuchern.',
    water: 'Schaut am Weg unter Bäumen und Büschen am Ufer. Bleibt dabei auf dem Weg.',
  },
  season: {
    autumn: 'Im Herbst liegen dort oft viele Blätter.',
    spring: 'Im Frühling sind die Blätter an den Zweigen noch frisch und zart.',
    winter: 'Im Winter liegen oft nur noch braune, trockene Blätter am Boden.',
  },
  talk: 'Was fällt dir an deinem Blatt auf: Farbe, Form oder Rand?',
  src: [GEN, 'Stiftung Kinder forschen: Herbstspaziergang', 'Umweltbundesamt: Jahreszeitliche Entwicklungsphasen'],
});

c('grass', {
  label: 'Gras',
  y: ['Gras ist grün und dünn.', 'Es wächst aus der Erde nach oben.', 'Schaut auf die Wiese oder an den Wegrand.'],
  m: [
    'Gras besteht aus vielen schmalen Halmen, die dicht beieinander wachsen.',
    'Gras wächst aus der Erde und wird von Wind und Regen bewegt. Viele Tiere finden dort ein Zuhause.',
    'Schaut auf Wiesen, Wegränder und Rasenflächen. Gras wächst fast überall, wo Licht hinkommt.',
  ],
  x: 'Anders als bei den meisten Pflanzen wächst Gras von unten nach. Deshalb erholt es sich nach dem Mähen schnell.',
  season: { winter: 'Im Winter ist Gras oft blass, gelblich oder braun.' },
  src: [GEN],
});

c('stump', {
  label: 'Ein Baumstumpf',
  y: ['Ein Baumstumpf ist der Rest von einem Baum.', 'Der Baum wurde gefällt oder ist abgebrochen.', 'Schaut mal am Wegrand oder im Wald.'],
  m: [
    'Ein Baumstumpf ist der Teil des Stammes, der unten stehen bleibt.',
    'Wenn ein Baum gefällt wird oder abbricht, bleibt der Stumpf im Boden zurück.',
    'Schaut am Wegrand oder im Wald. Bitte nicht daraufsteigen, ein Anschauen reicht.',
  ],
  x: 'Auf der Schnittfläche seht ihr oft Ringe. Meist steht ein Ring für ein Jahr Wachstum.',
  src: [GEN],
});

c('cone', {
  label: 'Ein Zapfen',
  y: ['Das ist ein Zapfen. Er hat viele Schuppen.', 'Zapfen wachsen an Nadelbäumen.', 'Vielleicht entdeckt ihr einen unter einem Nadelbaum.'],
  m: [
    'Das ist ein Zapfen. Schau dir seine vielen Schuppen an.',
    'Solche Zapfen wachsen an Nadelbäumen. Zwischen den Schuppen entwickeln sich Samen.',
    'Vielleicht entdeckt ihr einen Zapfen auf dem Boden unter einem Nadelbaum. Ihr müsst ihn nicht mitnehmen.',
  ],
  x: 'Fichtenzapfen fallen meist im Ganzen herunter. Tannenzapfen stehen aufrecht und zerfallen oft schon im Baum, ganze Tannenzapfen liegen deshalb selten am Boden.',
  talk: 'Wie sind die Schuppen angeordnet: eher glatt oder eher abstehend?',
  src: ['Geprüft 2026-11-04: Nationalpark Schwarzwald, Weiß-Tanne (Tannenzapfen stehen aufrecht und zerfallen, Fichtenzapfen fallen im Ganzen)', GEN],
});

c('root', {
  label: 'Eine Wurzel',
  m: [
    'Eine Wurzel hält den Baum fest und holt Wasser aus der Erde.',
    'Wurzeln wachsen meist unter der Erde. Manche Wurzeln breiten sich so weit aus, dass man sie über dem Boden sieht.',
    'Schaut am Fuß eines Baumes nach, vom Weg aus. Sucht nicht im Boden und achtet auf Stolperstellen.',
  ],
  x: 'Die Wurzeln eines Baumes reichen oft so weit wie seine Krone breit ist.',
  src: [GEN],
});

c('wood', {
  label: 'Holz',
  y: ['Holz kommt von Bäumen.', 'Äste und Stämme bestehen aus Holz.', 'Schaut mal auf den Boden unter Bäumen.'],
  m: [
    'Holz ist der Stoff, aus dem Äste und Stämme bestehen.',
    'Holz wächst im Baum. Wenn ein Ast oder Baum abbricht, bleibt das Holz liegen.',
    'Schaut auf den Boden unter Bäumen und am Wegrand. Bitte nichts bewegen oder stapeln.',
  ],
  x: 'Liegendes Holz bietet vielen Pilzen, Insekten und anderen Lebewesen ein Zuhause.',
  talk: 'Wie sieht das Holz aus: hell oder dunkel, glatt oder rau?',
  src: [GEN],
});

c('bud', {
  label: 'Eine Knospe',
  m: [
    'Eine Knospe ist eine kleine Verpackung. In ihr warten junge Blätter oder Blüten.',
    'Bäume und Sträucher legen Knospen schon im Sommer und Herbst an. Im Frühling öffnen sie sich.',
    'Schaut vom Weg aus an Zweige von Bäumen und Büschen. Bitte nicht abbrechen.',
  ],
  x: 'Die Schuppen der Knospe schützen die zarten Blätter im Inneren vor der Kälte.',
  src: [GEN, 'Umweltbundesamt: Jahreszeitliche Entwicklungsphasen'],
});

c('blossom', {
  label: 'Eine Blüte',
  y: ['Eine Blüte ist der bunte Teil einer Pflanze.', 'Aus Blüten können später Früchte oder Samen werden.', 'Schaut mal auf die Wiese oder an Sträucher.'],
  m: [
    'Eine Blüte ist der Teil einer Pflanze, der oft bunt ist und duftet.',
    'Insekten besuchen Blüten. Danach können Samen oder Früchte entstehen.',
    'Schaut auf Wiesen, in Beete und an Sträucher. Bitte nur anschauen und nicht pflücken.',
  ],
  x: 'Mit ihren Farben und ihrem Duft locken Blüten Insekten an. Diese tragen Blütenstaub von Blüte zu Blüte.',
  src: [GEN],
});

c('chestnut', {
  label: 'Eine Kastanie',
  y: ['Das ist eine Kastanie. Sie ist braun und glänzt.', 'Sie wächst an einem großen Baum, der Rosskastanie.', 'Schaut mal auf den Boden unter einer Rosskastanie.'],
  m: [
    'Das ist eine Kastanie: ein glänzender, brauner Samen mit einem hellen Fleck.',
    'Sie wächst an einer Rosskastanie. Der Samen steckt in einer grünen, stacheligen Hülle, die im Herbst aufplatzt.',
    'Schaut unter einer Rosskastanie auf den Boden. Bitte nur anschauen, zählen und liegen lassen. Sie sind nicht zum Essen.',
  ],
  x: 'Rosskastanien haben große Blätter aus mehreren Teilen, die wie eine Hand aussehen. Sie sind nicht mit den essbaren Maronen verwandt.',
  src: ['Geprüft 2026-11-04 (Ratgeberseiten, u. a. Plantura, t-online): Rosskastanie ist nicht essbar, gering giftig; nicht verwandt mit der Esskastanie', GEN, 'Stiftung Kinder forschen: Herbstspaziergang'],
});

c('acorn', {
  label: 'Eine Eichel',
  y: ['Das ist eine Eichel. Sie hat ein kleines Hütchen.', 'Sie wächst an einer Eiche.', 'Schaut mal auf den Boden unter einer Eiche.'],
  m: [
    'Das ist eine Eichel: die Frucht der Eiche, mit einem kleinen Hütchen aus Schuppen.',
    'Eicheln reifen im Herbst an Eichen. Aus einer Eichel kann ein neuer Baum wachsen.',
    'Schaut unter einer Eiche auf den Boden. Bitte nur anschauen, zählen und liegen lassen. Sie sind nicht zum Essen.',
  ],
  x: 'Tiere wie Eichhörnchen und Eichelhäher verstecken Eicheln. Nicht alle werden wiedergefunden, so können neue Eichen wachsen.',
  src: [GEN, 'Stiftung Kinder forschen: Herbstspaziergang'],
});

c('lowPlant', {
  label: 'Eine niedrige Pflanze',
  y: ['Diese Pflanze bleibt klein.', 'Sie wächst aus der Erde.', 'Schaut mal am Wegrand nach unten.'],
  m: [
    'Niedrige Pflanzen bleiben nah am Boden, zum Beispiel Klee oder kleine Kräuter.',
    'Sie wachsen aus Samen oder aus Wurzeln, die schon im Boden sind.',
    'Schaut am Wegrand nach unten. Bitte nur anschauen, nicht pflücken und nicht vom Weg abgehen.',
  ],
  x: 'Niedrige Pflanzen sind oft widerstandsfähig, weil sie wenig Wind abbekommen und viel Licht am Boden nutzen.',
  src: [GEN],
});

c('reed', {
  label: 'Schilf und Uferhalme',
  y: ['Schilf ist hoch und dünn.', 'Es wächst am Wasser.', 'Schaut mal vom Weg aus ans Ufer.'],
  m: [
    'Schilf ist eine hohe Pflanze mit langen, schmalen Blättern und festen Halmen.',
    'Schilf wächst am Rand von Seen und Bächen, wo der Boden feucht ist.',
    'Schaut vom Weg aus zum Ufer. Bitte nicht ins Wasser gehen und nichts abschneiden.',
  ],
  x: 'Im Schilf finden viele Vögel und Insekten Schutz.',
  src: [GEN, 'NABU: Lebensraum Wasser (Überblick)'],
});

c('insect', {
  label: 'Ein Insekt',
  m: [
    'Insekten sind kleine Tiere mit sechs Beinen, zum Beispiel Käfer, Bienen oder Schmetterlinge.',
    'Sie schlüpfen aus Eiern, wachsen und leben oft auf Pflanzen. Viele besuchen Blüten.',
    'Schaut auf Blüten und Blättern. Insekten nicht anfassen oder fangen. Wenn ihr keines seht, ist das auch gut.',
  ],
  x: 'Viele Insekten helfen Pflanzen, weil sie Blütenstaub weitertragen.',
  src: [GEN],
});

c('snow', {
  label: 'Schnee',
  y: ['Schnee ist kalt und weiß.', 'Er fällt als Flocken vom Himmel.', 'Schaut mal auf Wiesen und Wege.'],
  m: [
    'Schnee besteht aus winzigen Eiskristallen. Sie fallen als Flocken vom Himmel.',
    'Wenn es in den Wolken kalt genug ist, gefriert das Wasser zu Eiskristallen. Sie wachsen und fallen als Schnee.',
    'Schaut auf Wiesen, Dächer und Wege. Nur von dort aus anschauen, wo ihr sicher steht.',
  ],
  x: 'Jede Schneeflocke kann ein bisschen anders aussehen. Unter einer Lupe erkennt man die Kristalle.',
  src: [GEN],
});

/* ---------- Stadt ---------- */

c('bench', {
  label: 'Eine Bank',
  y: ['Auf einer Bank kann man sitzen.', 'Menschen bauen Bänke aus Holz oder Metall.', 'Schaut mal am Weg entlang.'],
  m: [
    'Auf einer Bank können mehrere Menschen sitzen und sich ausruhen.',
    'Menschen bauen Bänke zum Beispiel aus Holz oder Metall.',
    'Schaut an Wegen und Plätzen. Vielleicht entdeckt ihr eine Bank.',
  ],
  env: {
    park: 'Im Park stehen Bänke oft an Wegen oder in der Nähe eines Spielplatzes.',
    city: 'In der Stadt stehen Bänke oft an Haltestellen, Plätzen und kleinen Grünflächen.',
    playground: 'Am Spielplatz stehen Bänke oft am Rand, damit Erwachsene zuschauen können.',
    water: 'Am Ufer stehen Bänke oft an Aussichtsstellen am Weg.',
    mountain: 'Am Wanderweg stehen Bänke oft an Aussichtsstellen.',
    garden: 'Schaut in den Garten: Manchmal steht dort eine Bank an der Terrasse oder unter einem Baum.',
  },
  src: [GEN],
});

c('door', {
  label: 'Eine Tür',
  y: ['Durch eine Tür geht man hinein oder hinaus.', 'Menschen bauen Türen aus Holz, Metall oder Glas.', 'Schaut mal an die Häuser am Weg.'],
  m: [
    'Durch eine Tür kommt man in ein Haus oder in einen Raum.',
    'Menschen bauen Türen aus Holz, Metall oder Glas. Sie öffnen sich mit einer Klinke oder einem Griff.',
    'Schaut an Häusern entlang. Bitte nur von außen anschauen und keine fremden Grundstücke betreten.',
  ],
  src: [GEN],
});

c('window', {
  label: 'Ein Fenster',
  y: ['Durch ein Fenster kommt Licht ins Haus.', 'Menschen bauen Fenster aus Glas und Rahmen.', 'Schaut mal an die Häuser am Weg.'],
  m: [
    'Ein Fenster lässt Licht ins Haus. Man kann durch das Glas hinaussehen.',
    'Menschen bauen Fenster aus Glas und einem Rahmen aus Holz, Kunststoff oder Metall.',
    'Schaut an den Häusern hoch. Bitte nur von außen anschauen und nicht hineinsehen.',
  ],
  src: [GEN],
});

c('bicycle', {
  label: 'Ein Fahrrad',
  y: ['Ein Fahrrad hat zwei Räder.', 'Menschen bauen Fahrräder aus Metall und Gummi.', 'Schaut mal, wo Fahrräder abgestellt sind.'],
  m: [
    'Ein Fahrrad hat zwei Räder, einen Lenker und Pedale.',
    'Menschen bauen Fahrräder aus Metall und Gummi. Beim Treten drehen sich die Räder.',
    'Schaut an Fahrradständern, Zäunen und Hauswänden. Bitte nichts anfassen und nicht auf die Straße gehen.',
  ],
  x: 'Die Kette überträgt die Kraft von den Pedalen auf das Hinterrad.',
  src: [GEN],
});

c('sign', {
  label: 'Ein Schild',
  m: [
    'Ein Schild zeigt etwas mit Bildern, Zahlen oder Buchstaben. Manche Schilder sind rund.',
    'Menschen stellen Schilder auf, damit alle etwas Wichtiges wissen, zum Beispiel wohin ein Weg führt.',
    'Schaut vom Gehweg oder Weg aus. Bitte nicht auf die Straße gehen, um ein Schild zu finden.',
  ],
  x: 'Schilder verwenden bestimmte Farben und Formen, damit man sie schnell versteht.',
  src: [GEN],
});

c('number', {
  label: 'Eine Zahl',
  m: [
    'Eine Zahl sagt, wie viele es sind oder an welcher Stelle etwas steht.',
    'Menschen schreiben Zahlen an Häuser, Schilder und Türen, damit man sich zurechtfindet.',
    'Schaut an Häusern, Schildern oder Türen. Ihr müsst die Zahl nicht lesen, anschauen reicht.',
  ],
  x: 'An der Hausnummer erkennen Post und Rettungsdienst, welches Haus gemeint ist.',
  src: [GEN],
});

c('pavement', {
  label: 'Ein Muster im Pflaster',
  m: [
    'Ein Pflaster besteht aus vielen Steinen, die nebeneinander liegen.',
    'Menschen legen Pflastersteine nebeneinander. So entsteht ein fester Boden, oft mit schönem Muster.',
    'Schaut auf den Weg vor euren Füßen. Bleibt dabei auf dem Gehweg oder Weg.',
  ],
  x: 'Manche Pflastersteine sind so geformt, dass sie ineinandergreifen. Das macht den Boden stabil.',
  src: [GEN],
});

c('cover', {
  label: 'Ein Deckel oder Gitter im Gehweg',
  m: [
    'Ein Deckel oder Gitter im Boden schützt eine Öffnung darunter.',
    'Unter manchen Deckeln liegen Leitungen. Durch Gitter fließt Regenwasser ab.',
    'Schaut auf den Boden am Wegrand. Bitte nur anschauen und nichts öffnen.',
  ],
  src: [GEN],
});

c('planter', {
  label: 'Ein Pflanzgefäß',
  y: ['In einem Topf wachsen Pflanzen.', 'Menschen füllen Erde hinein und säen oder pflanzen etwas.', 'Schaut mal vor Türen und an Wegen.'],
  m: [
    'Ein Pflanzgefäß ist ein Topf oder Kasten mit Erde, in dem Pflanzen wachsen.',
    'Menschen füllen Erde hinein und pflanzen oder säen etwas. Dann gießen sie die Pflanzen.',
    'Schaut vor Häusern, an Wegen oder auf Plätzen. Bitte nichts anfassen oder betreten.',
  ],
  src: [GEN],
});

c('fence', {
  label: 'Ein Zaun',
  y: ['Ein Zaun steht am Rand.', 'Menschen bauen Zäune aus Holz oder Metall.', 'Schaut mal am Rand von Wegen und Gärten.'],
  m: [
    'Ein Zaun steht am Rand eines Gartens, Spielplatzes oder Weges und zeigt eine Grenze.',
    'Menschen bauen Zäune aus Holz, Metall oder Draht, damit etwas geschützt bleibt.',
    'Schaut am Rand von Gärten, Spielplätzen und Wegen. Bitte nicht klettern.',
  ],
  src: [GEN],
});

c('hedge', {
  label: 'Eine Hecke',
  y: ['Eine Hecke besteht aus Büschen.', 'Die Büsche wachsen dicht nebeneinander.', 'Schaut mal am Rand von Gärten und Wegen.'],
  m: [
    'Eine Hecke ist eine Reihe von Büschen, die dicht nebeneinander wachsen.',
    'Menschen pflanzen Hecken als Grenze oder Sichtschutz. Vögel und Insekten finden dort Schutz.',
    'Schaut am Rand von Gärten, Parks und Wegen. Bitte nicht hineingreifen.',
  ],
  src: [GEN],
});

/* ---------- Spielplatz ---------- */

c('slide', {
  label: 'Eine Rutsche',
  y: ['Auf einer Rutsche geht es nach unten.', 'Menschen bauen sie aus Metall, Kunststoff oder Holz.', 'Schaut mal auf dem Spielplatz.'],
  m: [
    'Eine Rutsche ist eine glatte Fläche, auf der man nach unten rutschen kann.',
    'Menschen bauen Rutschen aus Metall, Kunststoff oder Holz.',
    'Schaut auf dem Spielplatz. Anschauen genügt, ihr müsst nicht rutschen.',
  ],
  x: 'Rutschen sind glatt, damit die Reibung gering ist und man leicht nach unten gleitet.',
  src: [GEN],
});

c('swing', {
  label: 'Eine Schaukel',
  y: ['Eine Schaukel schwingt hin und her.', 'Menschen bauen sie aus Holz, Metall und Seilen oder Ketten.', 'Schaut mal auf dem Spielplatz.'],
  m: [
    'Eine Schaukel hängt an Ketten oder Seilen und schwingt hin und her.',
    'Menschen bauen sie aus einem Gestell, Ketten und einem Sitz.',
    'Schaut auf dem Spielplatz. Bleibt außerhalb des Schwingbereichs.',
  ],
  src: [GEN],
});

c('sand', {
  label: 'Sand',
  y: ['Sand besteht aus ganz kleinen Körnern.', 'Sand entsteht aus zerriebenem Gestein.', 'Schaut mal, wo der Boden sandig aussieht.'],
  m: [
    'Sand besteht aus unzähligen winzigen Körnern.',
    'Sand entsteht, wenn Gestein über lange Zeit in sehr kleine Stücke zerrieben wird.',
    'Schaut in Sandkästen und auf Spielplätzen oder an sandigen Stellen im Garten.',
  ],
  x: 'Feuchter Sand hält zusammen, trockener Sand rieselt. Das liegt am Wasser zwischen den Körnern.',
  src: [GEN],
});

c('footprint', {
  label: 'Eine Fußspur',
  y: ['Eine Fußspur ist ein Abdruck.', 'Sie entsteht, wenn jemand über weichen Sand läuft.', 'Schaut mal auf den Sand.'],
  m: [
    'Eine Fußspur ist ein Abdruck im weichen Sand.',
    'Sie entsteht, wenn ein Fuß in den Sand drückt. Später verwischt sie wieder.',
    'Schaut auf weichen Sand, zum Beispiel im Sandkasten oder am Strand.',
  ],
  x: 'Anhand von Spuren kann man erkennen, wie groß ein Fuß war und in welche Richtung jemand gegangen ist.',
  src: [GEN],
});

c('playRound', {
  label: 'Ein rundes Teil am Spielgerät',
  y: ['Das Teil ist rund wie ein Rad.', 'Menschen bauen es an Spielgeräte.', 'Schaut mal auf das Gerüst und an die Wand.'],
  m: [
    'Manche Spielgeräte haben runde Teile, zum Beispiel ein Lenkrad oder ein rundes Fenster.',
    'Menschen bauen sie ein, damit es zum Spielen einlädt.',
    'Schaut am Klettergerüst oder Spielhaus. Anschauen genügt, ihr müsst nicht klettern.',
  ],
  src: [GEN],
});

c('playBoard', {
  label: 'Ein Holzbrett am Spielgerät',
  y: ['Das ist ein Brett aus Holz.', 'Es stammt aus einem Baum.', 'Schaut mal am Spielgerät.'],
  m: [
    'Ein Holzbrett ist ein flaches Stück Holz.',
    'Aus Baumstämmen sägt man Bretter. Man baut daraus zum Beispiel Spielhäuser.',
    'Schaut an Spielgeräten und Zäunen. Bitte nur anschauen und nicht klettern.',
  ],
  src: [GEN],
});

c('playSize', {
  label: 'Spielgeräte vergleichen',
  m: [
    'Manche Spielgeräte sind groß, andere klein.',
    'Menschen bauen sie unterschiedlich groß, damit viele Kinder passende Geräte finden.',
    'Schaut euch zwei Geräte an, zum Beispiel eine Rutsche und eine Wippe. Benutzen müsst ihr sie nicht.',
  ],
  x: 'Vergleicht auch die Höhe und die Länge. Welches Gerät ist breiter, welches ist höher?',
  src: [GEN],
});

/* ---------- Himmel ---------- */

c('sky', {
  label: 'Der Himmel',
  y: ['Der Himmel ist über uns.', 'Dort sind Wolken, Sonne oder Sterne.', 'Schaut mal nach oben.'],
  m: [
    'Der Himmel ist alles, was wir über uns sehen.',
    'Der Himmel ist die Luft über uns. Dort ziehen Wolken, Vögel und manchmal Flugzeuge vorbei.',
    'Schaut vom Standplatz aus nach oben. Bitte nicht direkt in die Sonne schauen.',
  ],
  x: 'Die Luft streut das blaue Licht der Sonne stark, deshalb sieht der Himmel oft blau aus. Wolken bestehen aus winzigen Wassertröpfchen.',
  talk: 'Welche Farbe hat der Himmel heute? Welche Formen haben die Wolken?',
  src: [GEN],
});

/* ---------- Strand ---------- */

c('shell', {
  label: 'Eine Muschelschale',
  y: ['Das ist eine Muschelschale.', 'Eine Muschel hat sie als Haus gebaut.', 'Schaut mal auf den Sand.'],
  m: [
    'Das ist eine Muschelschale. Sie besteht aus zwei Teilen und hat oft feine Rillen.',
    'Muscheln sind Tiere im Wasser. Die Schale wächst mit ihnen und bleibt zurück, wenn sie nicht mehr leben.',
    'Schaut auf den Sand am Strand. Bitte nur anschauen und liegen lassen.',
  ],
  x: 'Die Rillen zeigen, wie die Schale gewachsen ist. Manche Muscheln wachsen im Laufe des Lebens immer weiter.',
  src: [GEN, 'NABU: Lebensraum Wattenmeer'],
});

c('seaweed', {
  label: 'Tang',
  m: [
    'Tang sind große Algen aus dem Meer. Sie sehen aus wie lange, nasse Bänder.',
    'Tang wächst im Wasser und wird bei Stürmen oder Wellen an den Strand gespült.',
    'Schaut am Spülsaum, wo das Wasser Dinge an den Strand bringt. Bitte nur von Weitem anschauen und nichts auseinanderziehen.',
  ],
  x: 'Im Tang leben kleine Tiere. Er ist ein Teil des Lebensraums am Strand.',
  src: [GEN, 'NABU: Lebensraum Wattenmeer (Spülsaum)'],
});

c('stone', {
  label: 'Ein Stein',
  y: ['Das ist ein Stein. Er ist hart.', 'Steine sind Stücke von Gestein.', 'Schaut mal auf den Boden am Weg.'],
  m: [
    'Ein Stein ist ein hartes Stück Gestein. Er kann klein oder groß, glatt oder rau sein.',
    'Steine entstehen über sehr lange Zeit. Wasser und Wind machen sie mit der Zeit glatter und kleiner.',
    'Schaut auf den Boden am Weg. Bitte nur zeigen, nicht tragen.',
  ],
  x: 'Steine bestehen aus Mineralien, und die Mischung macht sie bunt: dunkel, hell, gestreift oder gesprenkelt.',
  src: [GEN],
});

c('waves', {
  label: 'Wellen',
  y: ['Wellen sind Wasser, das sich bewegt.', 'Der Wind schiebt das Wasser.', 'Schaut mal aufs Wasser.'],
  m: [
    'Wellen sind kleine Berge und Täler aus Wasser, die sich bewegen.',
    'Meist entstehen Wellen durch Wind, der über das Wasser streicht.',
    'Schaut vom sicheren Platz aus aufs Wasser. Bleibt dabei weit genug entfernt.',
  ],
  x: 'Je stärker und länger der Wind weht, desto höher können die Wellen werden.',
  src: [GEN],
});

c('bird', {
  label: 'Ein Vogel',
  y: ['Ein Vogel hat Federn und Flügel.', 'Er schlüpft aus einem Ei.', 'Vielleicht seht ihr einen am Strand.'],
  m: [
    'Ein Vogel hat Federn, einen Schnabel und Flügel. Viele können fliegen.',
    'Vögel schlüpfen aus Eiern. Am Meer leben zum Beispiel Möwen.',
    'Schaut am Strand und am Himmel. Bitte nicht füttern oder verfolgen. Ein Vogel muss nicht dabei sein.',
  ],
  x: 'Vögel am Strand finden Futter im Wasser oder im Sand. Füttern ist nicht gut für sie.',
  src: [GEN],
});

c('sandPattern', {
  label: 'Linien oder Hügel im Sand',
  m: [
    'Im Sand gibt es oft kleine Linien oder Hügel, die wie Wellen aussehen.',
    'Wind und Wasser formen den Sand. So entstehen kleine Rillen und Erhebungen.',
    'Schaut auf feuchten und trockenen Sand. Bleibt auf eurem Weg und betretet keine Dünen.',
  ],
  src: [GEN],
});

/* ---------- Berge, Weg, Wasser ---------- */

c('trailMarker', {
  label: 'Eine Wegmarkierung',
  m: [
    'Eine Wegmarkierung ist ein Zeichen, das den Weg zeigt, zum Beispiel ein Farbstrich oder ein Schild.',
    'Menschen bringen Markierungen an Bäumen, Steinen oder Pfählen an, damit niemand vom Weg abkommt.',
    'Schaut auf Bäume, Steine und Pfähle am Weg. Bleibt auf dem Weg und verändert die Markierung nicht.',
  ],
  x: 'Die Zeichen sind oft einheitlich, damit Wandernde sie schnell erkennen.',
  src: [GEN, 'Deutscher Alpenverein: Wandern mit Kindern'],
});

c('rock', {
  label: 'Ein Fels',
  y: ['Ein Fels ist ein ganz großer Stein.', 'Er steht schon sehr lange da.', 'Schaut mal vom Weg aus.'],
  m: [
    'Ein Fels ist ein sehr großer Stein, der fest im Boden steht.',
    'Felsen sind sehr alt. Wind, Wasser und Frost verändern sie ganz langsam.',
    'Schaut vom Weg aus. Bitte nicht klettern.',
  ],
  x: 'Auf Felsen wachsen oft Flechten, die wie bunte Flecken aussehen.',
  src: [GEN],
});

c('mountain', {
  label: 'Ein Berg',
  y: ['Ein Berg ist sehr hoch.', 'Er ist über sehr lange Zeit entstanden.', 'Schaut mal in die Ferne.'],
  m: [
    'Ein Berg ragt hoch über das Land hinaus.',
    'Berge sind über sehr lange Zeit entstanden, weil sich die Erdoberfläche an manchen Stellen angehoben hat.',
    'Schaut in die Ferne. Ihr müsst keine Aussichtskante aufsuchen.',
  ],
  x: 'Berge verändern sich langsam durch Wind, Wetter und Wasser.',
  src: [GEN],
});

c('path', {
  label: 'Ein Weg',
  y: ['Ein Weg führt von hier nach dort.', 'Menschen legen Wege an oder gehen sie immer wieder.', 'Schaut mal vor eure Füße.'],
  m: [
    'Ein Weg ist eine feste Spur, auf der man gut gehen kann. Er kann gerade sein oder Kurven machen.',
    'Menschen legen Wege an oder gehen sie so oft, dass eine feste Spur entsteht.',
    'Schaut auf den Weg, auf dem ihr gerade seid. Bleibt dabei auf dem Weg.',
  ],
  x: 'Wege folgen oft dem Gelände. Sie machen Kurven, um nicht zu steil zu werden.',
  src: [GEN],
});

c('water', {
  label: 'Wasser',
  y: ['Wasser ist nass und glitzert.', 'Es kommt als Regen vom Himmel.', 'Schaut mal vom Weg aus aufs Wasser.'],
  m: [
    'Die Wasseroberfläche ist die Fläche, die oben zu sehen ist. Sie kann glatt oder wellig sein.',
    'Regen und Quellen füllen Bäche und Seen. Wind kann das Wasser kräuseln.',
    'Schaut vom sicheren Platz an Land. Ihr müsst dafür nicht näher ans Wasser gehen.',
  ],
  x: 'Wenn die Wasseroberfläche ganz glatt ist, spiegelt sich die Umgebung darin.',
  src: [GEN],
});

c('bendWater', {
  label: 'Eine Biegung im Bach oder Ufer',
  m: [
    'Eine Biegung im Bach ist eine Kurve, in der das Wasser die Richtung ändert.',
    'Wasser fließt dorthin, wo der Boden am leichtesten nachgibt. So entstehen Kurven im Lauf der Zeit.',
    'Schaut vom bestehenden Weg aus. Bitte nicht zum Wasser hinuntersteigen.',
  ],
  x: 'Außen in der Kurve fließt das Wasser schneller und trägt Erde ab. Innen lagert es Sand und Kies ab.',
  src: [GEN],
});

/* ---------- Infos zu neuen Bild-Konzepten der Katalog-Bereinigung ---------- */

/* ---------- Inhaltsvorgabe v2: konkrete Funde und Spuren ---------- */

c('hazelnut', {
  label: 'Eine Haselnuss',
  y: ['Das ist eine Haselnuss. Sie ist rund und braun.', 'Sie wächst an einem Haselstrauch.', 'Schaut mal auf den Boden unter einem Haselstrauch.'],
  m: [
    'Das ist eine Haselnuss: eine runde, hellbraune Nuss mit einer kleinen Spitze und einer hellen Stelle unten.',
    'Sie wächst an einem Haselstrauch, zuerst in einer grünen, zackigen Hülle. Im Herbst fällt die reife Nuss heraus.',
    'Schaut im Herbst unter Haselsträuchern auf den Boden, zum Beispiel am Wegrand. Bitte nur anschauen und nicht probieren.',
  ],
  x: 'Eichhörnchen und viele andere Tiere sammeln Haselnüsse als Vorrat. Die helle Stelle unten ist die Stelle, an der die Nuss in der Hülle saß.',
  src: ['Redaktionell aus Allgemeinwissen (Haselstrauch, Corylus avellana); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('beechnut', {
  label: 'Eine Buchecker',
  y: ['Das ist eine Buchecker. Sie hat drei Kanten wie ein kleines Dreieck.', 'Sie wächst an einer Buche.', 'Schaut mal auf den Boden unter einer Buche.'],
  m: [
    'Das ist eine Buchecker: eine kleine braune Nuss mit drei Kanten, die ungefähr wie ein Dreieck aussieht.',
    'Sie wächst an der Buche. Zwei Bucheckern sitzen zusammen in einer stacheligen Hülle, die im Herbst aufspringt.',
    'Schaut im Herbst unter Buchen auf den Boden. Nicht jedes Jahr gibt es viele. Bitte nur anschauen und nicht probieren.',
  ],
  x: 'Roh enthalten Bucheckern Stoffe, die Bauchweh machen können. Tiere wie Eichelhäher und Mäuse fressen sie gern.',
  src: ['Geprüft 2026-11-04 (Ratgeberseiten, u. a. Plantura, Gartenjournal): Frucht der Rotbuche, dreikantig, zwei Nüsse je stacheliger Fruchthülle, roh leicht giftig. Aussage „vier Klappen“ nicht bestätigt und deshalb nicht verwendet.', GEN],
});

c('snailShell', {
  label: 'Ein Schneckenhaus',
  y: ['Das ist ein Schneckenhaus. Es ist gedreht wie eine Spirale.', 'Die Schnecke baut ihr Haus selbst und trägt es mit sich.', 'Schaut mal auf den Boden, wo es feucht und bewachsen ist.'],
  m: [
    'Ein Schneckenhaus ist das Haus einer Schnecke. Es ist wie eine Spirale gewunden.',
    'Die Schnecke baut es selbst aus Kalk. Leere Häuschen bleiben zurück.',
    'Schaut am Wegrand, unter Büschen und am Strand. Nur leere Häuser anschauen, bewohnte lasst in Ruhe.',
  ],
  x: 'Eine Muschel hat zwei Schalen mit einem Scharnier. Ein Schneckenhaus hat nur eine Öffnung und windet sich spiralig nach innen.',
  env: { beach: 'Schaut am Strand dort, wo das Wasser Dinge anspült. Solche Häuschen sind oft klein und länglich gewunden.' },
  src: ['Redaktionell aus Allgemeinwissen (Schnecken, Muscheln: Weichtiere mit Kalkgehäuse); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('track', {
  label: 'Eine Spur',
  m: [
    'Eine Spur ist ein Abdruck, den ein Tier im weichen Boden hinterlassen hat.',
    'Das Tier drückt beim Laufen seine Füße hinein. Regen oder Wind verwischen den Abdruck später.',
    'Schaut auf weichen Boden am Weg, zum Beispiel nach Regen. Folgt keiner Spur ins Dickicht.',
  ],
  x: 'Spuren zeigen, wie ein Tier läuft: auf Zehen wie Hund und Vogel oder auf Hufen wie das Reh. Eine genaue Bestimmung ist oft schwierig.',
  env: { beach: 'Schaut auf feuchten, festen Sand. Bleibt auf dem Weg und betretet keine Dünen.' },
  talk: 'Wie viele Zehen könnt ihr zählen? Wohin ist das Tier wohl gelaufen?',
  src: ['Geprüft 2026-11-04 (Ratgeber Fährten und Spuren u. a. Deutsche Wildtier Stiftung, Deutscher Jagdverband): Reh = zwei Schalen ohne Zehen; Hund = Ballen mit vier Zehen und meist sichtbaren Krallen; Abdrücke nicht sicher zuzuordnen („könnte zu … passen“).', GEN],
});

c('feather', {
  label: 'Eine Feder',
  y: ['Das ist eine Feder. Sie ist leicht und weich.', 'Sie stammt von einem Vogel.', 'Schaut mal auf den Boden, auch am Wasser und auf Wiesen.'],
  m: [
    'Das ist eine Feder von einem Vogel. In der Mitte hat sie einen festen Schaft und zu beiden Seiten feine Äste.',
    'Vögel verlieren ihre Federn, wenn sie neue bekommen, oder wenn sich eine beim Putzen löst. Dann liegt sie am Boden.',
    'Schaut auf Wegen, Wiesen und am Wasser. Bitte nur anschauen, eine Feder muss nicht aufgehoben werden.',
  ],
  x: 'Mit den feinen Ästen hakt sich die Feder zu einer glatten Fläche. Wenn ihr vorsichtig seht, erkennt ihr die feinen Linien.',
  src: ['Redaktionell aus Allgemeinwissen (Federn der Vögel, Mauser); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('mushroom', {
  label: 'Ein Pilz',
  y: ['Das ist ein Pilz. Er hat einen Hut und einen Stiel.', 'Pilze wachsen aus dem Boden oder aus Holz.', 'Schaut mal auf den Waldboden. Nur anschauen, nie anfassen.'],
  m: [
    'Ein Pilz hat oben einen Hut und darunter einen Stiel. Es gibt ihn in vielen Farben.',
    'Pilze sind weder Pflanzen noch Tiere. Den größten Teil sieht man nicht, er wächst unter der Erde.',
    'Schaut im Sommer und Herbst im Wald. Manche Pilze sind giftig: nie anfassen oder probieren.',
  ],
  x: 'Das Geflecht unter der Erde heißt Myzel. Es ist oft viel größer als der Pilz, den man oben sieht.',
  src: ['Redaktionell aus Allgemeinwissen (Pilze als eigenes Reich, Fruchtkörper und Myzel); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('molehill', {
  label: 'Ein Maulwurfshügel',
  y: ['Das ist ein Hügel aus Erde.', 'Ein Maulwurf hat ihn gemacht.', 'Schaut mal auf die Wiese. Hier liegt Erde im Gras.'],
  m: [
    'Ein Maulwurfshügel ist ein kleiner Haufen aus lockerer, dunkler Erde mitten im Gras.',
    'Ein Maulwurf lebt unter der Erde und gräbt dort Gänge. Die Erde, die dabei übrig bleibt, schiebt er nach oben.',
    'Schaut auf Wiesen, in Parks und in Gärten. Den Maulwurf selbst seht ihr nur selten. Bitte tretet den Hügel nicht platt.',
  ],
  x: 'Der Maulwurf sieht sehr schlecht, aber er riecht und fühlt hervorragend. Seine breiten Vorderpfoten sind richtige Grabschaufeln.',
  src: ['Redaktionell aus Allgemeinwissen (Maulwurf, Europäischer Maulwurf); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('dandelion', {
  label: 'Eine Pusteblume',
  y: ['Das ist eine Pusteblume. Sie ist wie eine weiße Kugel.', 'Sie wird aus einer gelben Blume.', 'Schaut mal auf die Wiese und an den Wegrand.'],
  m: [
    'Eine Pusteblume ist eine runde Kugel aus vielen feinen Schirmchen auf einem langen Stängel.',
    'Zuerst blüht der Löwenzahn gelb. Später entsteht daraus die Pusteblume. Jedes Schirmchen trägt einen Samen und fliegt mit dem Wind davon.',
    'Schaut im Frühling und Sommer auf Wiesen, am Wegrand und im Park. Sie muss nicht gepflückt werden.',
  ],
  x: 'Jedes Schirmchen ist ein kleiner Fallschirm. Der Wind kann die Samen weit tragen, so wächst Löwenzahn an vielen Stellen.',
  src: ['Redaktionell aus Allgemeinwissen (Löwenzahn, Fruchtstand); Gegenprüfung durch Fachlektorat steht aus.'],
});
c('husk', {
  label: 'Eine Fruchthülle',
  y: ['Das ist eine Hülle mit Stacheln.', 'Darin war eine Kastanie.', 'Schaut mal unter einer Rosskastanie auf den Boden.'],
  m: [
    'Das ist die Fruchthülle einer Kastanie. Sie ist grün und hat viele kurze Stacheln.',
    'Sie schützt die Kastanie, solange sie wächst. Im Herbst platzt sie auf und die Kastanie fällt heraus.',
    'Schaut im Herbst unter Rosskastanien auf den Boden. Die Stacheln pieken, bitte nur anschauen.',
  ],
  x: 'Innen ist die Hülle weißlich und weich gepolstert. Das schützt die Kastanie, bis sie reif ist und herausfällt.',
  src: ['Redaktionell aus Allgemeinwissen (Rosskastanie, Fruchthülle); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('mapleSeed', {
  label: 'Eine Ahornfrucht',
  y: ['Das ist eine Frucht vom Ahorn. Sie hat zwei Flügel.', 'Sie wächst am Ahornbaum.', 'Schaut mal unter einem Ahorn auf den Boden.'],
  m: [
    'Das ist eine Ahornfrucht. Zwei Flügel sitzen an einer kleinen Nuss.',
    'Sie wächst am Ahorn und fällt im Spätsommer und Herbst herunter. Der Wind trägt sie davon.',
    'Schaut unter einem Ahorn auf den Boden. Der Baum muss in der Nähe stehen. Bitte nur anschauen.',
  ],
  x: 'Ahornfrüchte bestehen meist aus zwei Hälften. Beim Fallen drehen sie sich und gleiten langsamer zu Boden. So kommen sie weiter weg vom Baum.',
  src: ['Redaktionell aus Allgemeinwissen (Spaltfrucht der Ahornarten, Flügelfrucht); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('lichen', {
  label: 'Eine Flechte',
  m: [
    'Eine Flechte sieht aus wie ein flacher, krustiger Fleck auf Stein oder Rinde, oft gelb, grün oder grau.',
    'Sie wächst sehr langsam. Es gibt sie fast überall, wo es hell und wenig nass ist, auch auf Felsen.',
    'Schaut auf gut sichtbare Steine am Weg. Flechten bleiben an ihrem Platz, bitte nichts abkratzen.',
  ],
  x: 'Eine Flechte besteht aus einem Pilz und einer Alge, die zusammenleben. Der Pilz gibt Halt, die Alge macht aus Licht Nahrung.',
  src: ['Redaktionell aus Allgemeinwissen (Flechten als Lebensgemeinschaft aus Pilz und Alge); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('clover', {
  label: 'Ein Kleeblatt',
  m: [
    'Klee hat drei runde Blättchen an einem Stiel. Oft ist darauf ein heller Streifen zu sehen.',
    'Klee wächst auf Wiesen und am Wegrand. Er bildet kleine, runde Blüten, die Insekten gern besuchen.',
    'Schaut auf Wiesen, am Wegrand und im Park. Bitte nur anschauen, nicht pflücken.',
  ],
  x: 'Klee gehört zu den Pflanzen, die mit Bakterien in den Wurzeln zusammenleben. Sie machen den Boden nährstoffreicher.',
  src: ['Redaktionell aus Allgemeinwissen (Klee, Knöllchenbakterien); Gegenprüfung durch Fachlektorat steht aus.'],
});

/* ---------- Waldkatalog (Katalogstand 3.0.0) ---------- */

const FORST_GEN = 'Redaktionell aus Allgemeinwissen verfasst; Gegenprüfung durch Fachlektorat steht aus.';

c('acornCup', {
  label: 'Ein Eichelbecher',
  m: [
    'Das ist ein Eichelbecher: das kleine, schuppige Hütchen, in dem eine Eichel gesessen hat.',
    'Wenn die Eichel reif ist, löst sie sich vom Becher. Danach liegen Eichel und Becher oft getrennt auf dem Boden.',
    'Schaut im Herbst und Winter unter einer Eiche auf den Boden. Bitte nur anschauen und liegen lassen.',
  ],
  x: 'Eichelbecher und Eicheln helfen, Eichenarten zu unterscheiden: Bei manchen Arten sind die Becher glatter, bei anderen zottiger.',
  src: [FORST_GEN],
});

c('beechHusk', {
  label: 'Eine Buchenhülle',
  m: [
    'Das ist die leere Hülle von Bucheckern. Sie ist stachelig und in mehrere Teile aufgesprungen.',
    'In der Hülle wachsen meist zwei Bucheckern zusammen. Im Herbst springt sie auf, und die Nüsse fallen heraus.',
    'Schaut im Herbst und Winter unter Buchen auf den Boden. Bitte nur anschauen und liegen lassen.',
  ],
  x: 'In Jahren, in denen eine Buche besonders viele Früchte trägt, sprechen Fachleute von einem Mastjahr. Dann liegen viele Hüllen am Boden.',
  src: ['Geprüft 2026-11-06 (Ratgeberseiten, u. a. Plantura, Gartenjournal): Frucht der Rotbuche, zwei dreikantige Nüsse je stacheliger Hülle, Mastjahre. „Vier Klappen“ nicht bestätigt, deshalb nicht genannt.', FORST_GEN],
});

c('gnawedNut', {
  label: 'Eine angenagte Nussschale',
  m: [
    'Diese Nussschale hat ein Loch oder eine Bruchkante. Jemand hat die Nuss geöffnet und gefressen.',
    'Mäuse, Eichhörnchen und Vögel knacken Nüsse auf, jedes Tier auf seine Art. Welches es hier war, wisst ihr nicht sicher.',
    'Schaut im Herbst und Winter unter Haselsträuchern auf den Boden. Bleibt auf dem Weg und lasst die Schale liegen.',
  ],
  x: 'Ein glatter, runder Lochrand könnte zu einer Haselmaus passen, ein rauer Rand zu anderen Mäusen, eine gesprengte Schale zu einem Eichhörnchen. Sicher ist das nicht.',
  src: ['Geprüft 2026-11-06 (NABU/ANL Nussjagd-Bestimmungshilfen): Haselmaus = fast kreisrundes Loch, glatter Rand, Zahnspuren parallel; Rötel-/Waldmaus = rauer Rand, Zahnspuren senkrecht; Eichhörnchen und Vögel = Schale in zwei Hälften. Zuordnung bleibt unsicher („könnte … passen“).'],
});

c('gnawedCone', {
  label: 'Ein abgenagter Zapfen',
  m: [
    'Bei diesem Zapfen fehlen fast alle Schuppen. Übrig ist die Mittelspindel mit kleinen Stummeln.',
    'Jemand hat die Schuppen abgezupft oder abgenagt, um an die Samen zu kommen. Das könnten zum Beispiel Eichhörnchen oder Mäuse gewesen sein.',
    'Schaut unter Nadelbäumen auf den Boden, auch im Winter. Bleibt auf dem Weg und lasst den Zapfen liegen.',
  ],
  x: 'Ein Eichhörnchen zupft die Schuppen ab, der Zapfen sieht danach zerzaust aus. Mäuse nagen die Schuppen ab, dann ist er glatter. Sicher ist das nicht, die Spur kann auch von anderen Tieren stammen.',
  src: ['Geprüft 2026-11-06 (Unterrichtsmaterial zu Fraßspuren, u. a. Klett/Raabe): Eichhörnchen zupfen Schuppen ab (zerzauster Zapfen), Mäuse nagen sie glatt ab. Zuordnung bleibt unsicher.'],
});

c('leafSkeleton', {
  label: 'Ein Blattskelett',
  m: [
    'Von diesem Blatt sind nur noch die feinen Adern übrig. Es sieht aus wie ein zartes Netz.',
    'Kleine Tiere, Pilze und Regen haben die weiche Blattfläche nach und nach abgebaut. Die festen Adern bleiben am längsten.',
    'Schaut im Herbst, Winter und Frühling im Laub auf dem Waldboden. Bitte nur anschauen, es zerfällt leicht.',
  ],
  x: 'Die Adern bestehen aus festeren Fasern als die Blattfläche und halten deshalb länger. Zersetzer wie Pilze, Bakterien und Bodentiere machen aus dem Laub Schritt für Schritt Humus.',
  src: ['Redaktionell aus Allgemeinwissen (Laubzersetzung, Humus; vgl. Umweltbundesamt, Humus); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('fern', {
  label: 'Ein Farn',
  y: ['Das ist ein Farn. Er hat ganz viele kleine Blättchen.', 'Farne wachsen gern im feuchten, schattigen Wald.', 'Schaut mal am Wegrand, wo es schattig ist.'],
  m: [
    'Ein Farn hat große, fein gefiederte Wedel. An jedem Stängel sitzen links und rechts viele kleine Blättchen.',
    'Farne haben keine Blüten. Sie vermehren sich über winzige Sporen, die der Wind verteilt.',
    'Schaut im Frühling bis Herbst an feuchten, schattigen Stellen im Wald. Bitte nur anschauen.',
  ],
  x: 'Ein Farn braucht Feuchtigkeit, um sich zu vermehren: Aus der Spore wächst zuerst ein winziges Pflänzchen, aus dem später der Farn entsteht.',
  src: ['Geprüft 2026-11-06 (u. a. Naturpark Nassau, Sporenpflanzen; Schulbuchmaterial Moose und Farne): Farne vermehren sich über Sporen in Sporenhäufchen (Sori) an der Blattunterseite.', FORST_GEN],
});

c('rottingWood', {
  label: 'Zerfallendes Holz',
  m: [
    'Dieses Holz ist weich, dunkel und bröckelig geworden. Es zerfällt langsam.',
    'Pilze, Bakterien und viele kleine Tiere zersetzen totes Holz Stück für Stück. Das dauert oft viele Jahre.',
    'Schaut im Wald an liegenden Ästen und Stämmen. Bleibt auf dem Weg und lasst alles an seinem Platz.',
  ],
  x: 'Je mehr totes Holz im Wald liegt, desto mehr Arten können dort leben. Fachleute nennen es Totholz. Aus seinen Nährstoffen wird wieder Waldboden.',
  src: ['Geprüft 2026-11-06 (u. a. Pilze als Zersetzer im Stoffkreislauf, LfU Bayern Kryptogamen); Totholz als Lebensraum (WSL) aus Allgemeinwissen, Gegenprüfung durch Fachlektorat steht aus.'],
});

c('bracketFungus', {
  label: 'Ein Baumpilz',
  m: [
    'Das ist ein Baumpilz. Er sitzt seitlich am Stamm wie ein kleines Regal.',
    'Ein Pilz ist weder Pflanze noch Tier. Der Hauptteil lebt als feines Geflecht im Holz, der sichtbare Teil ist nur sein Fruchtkörper.',
    'Schaut an Stämmen und Baumstümpfen im Wald, auch im Winter. Bitte nicht anfassen und nicht abbrechen.',
  ],
  x: 'Manche Baumpilze leben an toten Stämmen, andere an noch lebenden Bäumen. Aus dem Fruchtkörper werden Sporen verbreitet, und viele Käfer und andere Tiere nutzen ihn als Lebensraum.',
  src: ['Redaktionell aus Allgemeinwissen (Pilze als Zersetzer, Fruchtkörper und Myzel); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('litter', {
  label: 'Ganzes und altes Laub',
  m: [
    'Ein ganzes Blatt ist noch heil und hat seine Farbe. Ein altes Blatt ist dunkel, dünn und hat Löcher oder Fransen.',
    'Wenn Blätter lange am Boden liegen, bauen Regen, Pilze und kleine Tiere sie nach und nach ab.',
    'Schaut im Wald im Laub auf dem Boden. Es genügt, zwei Blätter anzusehen. Wühlt nichts auf.',
  ],
  x: 'Im Laub liegen oft mehrere Schichten: oben ganzes, darunter dunkleres, schon zerfallendes Laub. Je tiefer, desto weiter ist es abgebaut. Dort leben viele winzige Bodentiere.',
  src: ['Redaktionell aus Allgemeinwissen (Laubstreu, Humus; vgl. Umweltbundesamt, Humus); Gegenprüfung durch Fachlektorat steht aus.'],
});

c('gall', {
  label: 'Eine Galle',
  m: [
    'Das sind kleine, runde Kugeln auf dem Blatt: Gallen.',
    'Ein winziges Insekt, zum Beispiel eine Gallwespe, legt ein Ei ins Blatt. Das Blatt bildet daraufhin die Kugel, in der die Larve heranwächst.',
    'Schaut im Sommer und Herbst an Eichenblättern, besonders auf der Unterseite. Bitte nichts abreißen.',
  ],
  x: 'Es gibt viele Arten von Gallen mit verschiedenen Formen, auf Eichen zum Beispiel Linsen- und Kugelgallen. Jede Art Gallwespe lässt das Blatt etwas anderes wachsen.',
  src: ['Geprüft 2026-11-06 (Gartenjournal, WSL Waldschutz Eichenlinsengallwespe): Larven leben in Gallen, Schaden am Baum meist gering. „Meist“ bewusst so formuliert.'],
});

c('leafMine', {
  label: 'Eine Blattmine',
  m: [
    'Hier hat sich eine winzige Larve durch das Blatt gefressen und eine helle Schlangenlinie hinterlassen. Das nennt man Blattmine.',
    'Die Larve lebt zwischen Ober- und Unterseite des Blattes und frisst nur das weiche Gewebe dazwischen.',
    'Schaut im Sommer und Herbst an Blättern von Büschen und Bäumen am Weg. Bitte nichts abreißen.',
  ],
  x: 'Es gibt viele Arten von Blattminierern, vor allem kleine Falter, Käfer und Fliegen. Jede Art frisst eigene Formen, manche Gänge, manche Flecken.',
  src: ['Geprüft 2026-11-06 (Galathea 32, Blattminen: Larven fressen im Blattinneren, Gang- und Platzminen). Aussage zum Schaden am Baum bewusst weggelassen.'],
});

c('woodGrain', {
  label: 'Holzmaserung',
  m: [
    'Das ist die Maserung: Linien im Holz, die der Wuchs des Baumes gezeichnet hat.',
    'Jedes Jahr wächst der Baum ein Stück dicker. Dadurch entstehen Schichten, die man als Linien und Wellen sieht.',
    'Schaut auf gebrochene Äste, Stümpfe oder abgefallene Holzstücke am Weg. Bitte nichts abbrechen.',
  ],
  x: 'Jede Baumart hat eine eigene Maserung. Deshalb sehen Möbel aus Eiche anders aus als aus Kiefer. Auch Wind und Standort verändern, wie ein Baum wächst.',
  src: [FORST_GEN],
});

c('seedling', {
  label: 'Ein junger Baum',
  y: ['Das ist ein ganz junger Baum. Er ist noch winzig.', 'Er ist aus einem Samen gewachsen, zum Beispiel einer Eichel.', 'Schaut mal auf den Waldboden, dort wo es hell ist.'],
  m: [
    'Das ist ein Baumkeimling. Er hat einen dünnen Stängel, oft zwei rundliche Keimblätter und erste kleine Blättchen.',
    'Er ist aus einem Samen gewachsen, zum Beispiel einer Buchecker, einer Eichel oder einer Ahornfrucht.',
    'Schaut im Frühling und Sommer auf den Waldboden, besonders unter großen Bäumen. Bitte nicht ausreißen.',
  ],
  x: 'Ein Keimling lebt zuerst vom Vorrat im Samen. Dann muss er mit seinen Blättern selbst Licht einfangen. Unter dichtem Blätterdach ist es dunkel, deshalb wachsen viele nur langsam.',
  src: [FORST_GEN],
});

c('web', {
  label: 'Ein Spinnennetz',
  y: ['Das ist ein Spinnennetz. Es ist aus ganz feinen Fäden.', 'Eine Spinne hat die Fäden gesponnen.', 'Schaut mal zwischen Zweigen und Blättern.'],
  m: [
    'Ein Radnetz hat gerade Speichen von der Mitte und feine Kreise dazwischen.',
    'Die Spinne spinnt die Fäden selbst. Viele Spinnen bauen ihr Netz immer wieder neu oder bessern es aus.',
    'Schaut zwischen Zweigen, an Büschen und an Wegrändern. Nach Tau oder Nebel sieht man Netze besonders gut. Bitte nicht berühren.',
  ],
  x: 'Spinnenfäden sind im Verhältnis zu ihrer Dicke sehr reißfest. Nicht jede Spinne baut ein Radnetz: Manche jagen ohne Netz oder spinnen andere Formen.',
  src: [FORST_GEN],
});

c('needleTwig', {
  label: 'Ein Nadelzweig',
  y: ['Das ist ein Zweig mit Nadeln.', 'Er gehört zu einem Nadelbaum.', 'Schaut mal unter Nadelbäumen auf den Boden.'],
  m: [
    'Das ist ein kleiner Zweig, an dem noch Nadeln sitzen.',
    'Er stammt von einem Nadelbaum und ist heruntergefallen.',
    'Schaut auf dem Weg und am Wegrand unter Nadelbäumen. Bitte nur anschauen und keine Nadeln abzupfen.',
  ],
  x: 'Nadeln sind die Blätter von Nadelbäumen.',
  src: ['Redaktionell aus Allgemeinwissen (Nadeln als Blätter, Verdunstungsschutz, Streu); Gegenprüfung durch Fachlektorat steht aus. Nadelstellung nach gängigen Bestimmungsbüchern.'],
});

c('beechBud', {
  label: 'Eine Buchenknospe',
  m: [
    'Das ist eine lange, spitze Knospe.',
    'Sie sitzt an einem dünnen Zweig einer Buche.',
    'Schaut am Wegrand an kleinen Zweigen, die tief genug hängen. Bitte nur anschauen und nichts abbrechen.',
  ],
  x: 'In der Knospe warten schon die nächsten Blätter.',
  src: ['LfL Bayern, Gewöhnliche Buche (Q2); Knospenanlage nach Fachliteratur zur Knospenbildung (Studer, Elemente der Naturwissenschaft), Buchenspezifisches nicht gesondert belegt. Hainbuchenknospe kürzer (NABU).'],
});

c('yTwig', {
  label: 'Ein Zweig mit Gabelung',
  m: [
    'Das ist ein Zweig, der sich in zwei Äste teilt. Die Gabel sieht aus wie ein Y.',
    'Der Zweig ist an einem Baum oder Strauch gewachsen. Vielleicht ist er heruntergefallen.',
    'Schaut am Weg und am Wegrand auf kleine Zweige am Boden oder tief hängende Zweige. Bitte nur anschauen und nichts abbrechen.',
  ],
  x: 'An jeder Gabel hat ein Zweig zwei neue Triebe gebildet.',
  src: [FORST_GEN],
});

c('veinNet', {
  label: 'Ein Blatt mit Adernetz',
  m: [
    'Das ist ein Blatt, auf dem man die Adern gut sieht. Sie bilden ein feines Netz.',
    'Die Adern sind die Leitungen des Blattes. Durch sie fließt Wasser hinein, und Zucker fließt hinaus.',
    'Schaut auf den Boden am Weg. Ein Blatt, das nicht zu feucht und nicht zu dunkel ist, zeigt die Adern am besten. Bitte nur anschauen oder vorsichtig hochhalten und wieder hinlegen.',
  ],
  x: 'Die dicke Ader in der Mitte trägt die dünneren Seitenadern. Dazwischen liegt ein feines Netz.',
  src: [FORST_GEN],
});

c('hornbeamFruit', {
  label: 'Eine Hainbuchenfrucht',
  m: [
    'Das ist die Frucht einer Hainbuche. Ein kleines Nüsschen sitzt in einem Flügelblatt mit drei Zipfeln.',
    'Sie ist an einer Hainbuche gewachsen und im Herbst oder Winter heruntergefallen.',
    'Schaut unter Hainbuchen auf den Boden, auch an Hecken am Wegrand. Bitte nur anschauen. Das Nüsschen bleibt im Wald.',
  ],
  x: 'Das Flügelblatt hilft dem Wind, die Frucht ein Stück vom Baum weg zu tragen.',
  src: ['LWF/LfL Bayern, Hainbuche (Früchte: Nüsschen mit dreilappigem Flügelblatt, Windverbreitung); wald.rlp.de, Hainbuche. Beide Quellen und die Formulierung sind vor Veröffentlichung noch durch ein Fachlektorat zu prüfen.'],
});

c('lindenFruit', {
  label: 'Ein Lindenfruchtstand',
  m: [
    'Das ist ein kleiner Fruchtstand einer Linde. An einem Stiel hängen mehrere kleine runde Nüsschen. Ein langes schmales Flügelblatt gehört dazu.',
    'Er ist im Sommer an einer Linde gewachsen. Im Herbst oder Winter fällt er herunter.',
    'Schaut unter Linden auf den Boden. Bitte nur anschauen. Die Nüsschen bleiben im Wald.',
  ],
  x: 'Das Flügelblatt dreht sich beim Fallen. So kann der Wind den Fruchtstand ein Stück tragen.',
  src: ['LWF/LfL Bayern, Winterlinde (Fruchtstand mit Hochblatt als Flugorgan, Nüsschen); weitere Sachbeschreibungen von waldwissen.net und forstlichen Fachseiten. Gegenprüfung durch Fachlektorat steht aus; Flugweiten werden bewusst nicht genannt.'],
});

c('alderCone', {
  label: 'Ein Erlenzäpfchen',
  m: [
    'Das sind kleine dunkle Zäpfchen an einem Zweig. Sie wachsen an einem Laubbaum, der Erle.',
    'Aus den Zäpfchen sind im Herbst kleine Samen herausgefallen. Die leeren Zäpfchen bleiben oft bis in den Winter am Zweig.',
    'Schaut an Bächen, feuchten Stellen und Waldrändern nach Erlen. Bitte nur anschauen und nichts abbrechen.',
  ],
  x: 'Die Erle ist ein Laubbaum, aber ihre Früchte sehen aus wie winzige Zapfen. Sie sind verholzt.',
  src: ['wald.rlp.de, Schwarzerle; SDW-Steckbrief Schwarzerle (Fruchtstände zapfenähnlich, verholzt, oft bis in den Winter am Baum); Gegenprüfung durch Fachlektorat steht aus.'],
});

export const concepts: Record<string, ConceptInfo> = Object.fromEntries(list.map((x) => [x.conceptId, x]));

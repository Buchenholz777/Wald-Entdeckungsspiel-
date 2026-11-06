import type { AgeGroup } from '../domain/types';

/**
 * Objektinfos je Vorlage und Altersgruppe: drei ausgearbeitete Bausteine.
 *  what   = „Das habt ihr vor euch“ (was ist es, woran erkennt man es)
 *  origin = „So ist es entstanden“ (wo wächst es, woher kommt es)
 *  secret = „Sein kleines Waldgeheimnis“ (was ist besonders, welche Rolle hat es im Wald)
 *  more   = nur 7–10: Zusatzgedanke oder offene Frage
 * Der Suchhinweis steht getrennt in concepts.ts. Keine Quelle ersetzt die Prüfung: Belege siehe docs/WALDKATALOG.md.
 * Sätze über Tiere nennen nie ein Tier als gesehen; Deutungen von Spuren stehen immer als Vermutung („könnte … passen“).
 */
export interface Info3 {
  what: string;
  origin: string;
  secret: string;
  more?: string;
}

type Triple = [string, string, string];
type Quad = [string, string, string, string];

interface Entry {
  y?: Triple;
  m?: Triple;
  o?: Quad;
}

const raw: Record<string, Entry> = {
  acorn: {
    y: [
      'Schau, eine Eichel! Sie trägt ein kleines Hütchen aus vielen winzigen Schuppen.',
      'Sie ist an einer Eiche gewachsen und im Herbst heruntergefallen. Innen steckt ein Samen.',
      'Aus so einem Samen kann eine neue Eiche wachsen. Manche Waldtiere fressen Eicheln auch gern. Wir lassen sie heute im Wald liegen.',
    ],
    m: [
      'Eine Eichel ist die Frucht der Eiche. Unten sitzt die glatte braune Nuss, oben das Hütchen aus kleinen Schuppen. Dieses Hütchen heißt Fruchtbecher.',
      'Eichen tragen ihre Eicheln im Herbst. Dann lösen sich die Früchte und fallen auf den Waldboden. In jeder Eichel steckt ein Samen, aus dem eine junge Eiche wachsen kann.',
      'Das Geheimnis: Für viele Tiere sind Eicheln ein wertvolles Futter, zum Beispiel für den Eichelhäher. Er versteckt Eicheln als Vorrat. Findet er manche nicht wieder, können dort neue Eichen wachsen. Heute bleibt die Eichel im Wald.',
    ],
    o: [
      'Die Eichel ist eine Nussfrucht. Sie sitzt zum Teil in einem schuppigen Fruchtbecher, der sich beim Reifen löst. Form und Größe von Eicheln und Bechern helfen, Eichenarten zu unterscheiden.',
      'Eichen blühen im Frühjahr, die Früchte reifen bis zum Herbst. Jahre mit besonders vielen Eicheln wechseln mit Jahren, in denen kaum welche wachsen. Fällt eine Eichel auf geeigneten Boden und bekommt genug Licht und Wasser, kann sie keimen.',
      'Eicheln sind Nahrung für viele Tiere, etwa für Eichelhäher, Mäuse und Wildschweine. Der Eichelhäher legt Verstecke an und findet nicht alle wieder. So kann eine Eichel manchmal weit weg vom Mutterbaum im Boden landen und keimen.',
      'Überlegt: Warum ist es für einen Baum vorteilhaft, wenn nicht alle seine Samen direkt unter ihm landen?',
    ],
  },
  'acorn-cup': {
    m: [
      'Das ist ein Eichelhütchen, der Fruchtbecher einer Eichel. Er sieht aus wie ein kleiner Napf aus lauter winzigen Schuppen. Die Eichel selbst fehlt meistens.',
      'Der Becher umgibt die Eichel, solange sie wächst. Ist sie reif, löst sie sich und fällt heraus. Der leere Becher bleibt zurück oder fällt später hinterher.',
      'Das Hütchen hat die junge Eichel geschützt, bis sie reif war. An ihm kannst du sehen, dass hier einmal eine Eichel gewachsen ist. Später zerfällt der Becher im Laub und wird Teil des Waldbodens.',
    ],
    o: [
      'Der Fruchtbecher, botanisch Cupula, besteht aus vielen verwachsenen Schuppen und umschließt die Eichel zu einem Teil. Bei verschiedenen Eichenarten sehen die Becher verschieden aus, bei manchen glatter, bei anderen eher zottig.',
      'Der Becher wächst gemeinsam mit der Eichel heran. Zur Reife trocknet er, und die Eichel löst sich. Becher und Eichel liegen danach oft getrennt am Boden, deshalb findet man leere Becher auch dort, wo die Eicheln längst fort sind.',
      'Ein leerer Becher erzählt zweierlei: Hier ist eine Eichel gereift, und sie ist nicht mehr da. Vielleicht hat ein Tier sie gefressen oder weggetragen, vielleicht keimt sie irgendwo. Welche Möglichkeit stimmt, sieht man dem Becher nicht an.',
      'Was könntet ihr in der Umgebung beobachten, das zu einer dieser Möglichkeiten passt?',
    ],
  },
  beechnut: {
    y: [
      'Das ist eine Buchecker. Sie ist klein und braun und hat drei Kanten.',
      'Sie ist an einer Buche gewachsen. Meist wachsen zwei Bucheckern zusammen in einer stacheligen Hülle.',
      'In jeder Buchecker steckt ein Samen für eine neue Buche. Viele Waldtiere fressen Bucheckern gern. Wir lassen sie liegen und essen sie nicht.',
    ],
    m: [
      'Bucheckern sind die Früchte der Rotbuche. Sie sind klein, glänzend braun und haben drei scharfe Kanten, ungefähr wie ein kleines Dreieck.',
      'Meist wachsen zwei zusammen in einer stacheligen Hülle. Im Herbst springt die Hülle auf, und die Nüsschen fallen heraus. Nicht jedes Jahr tragen Buchen gleich viele Früchte.',
      'In einem Jahr mit sehr vielen Bucheckern, einem Mastjahr, gibt es reichlich Futter für Mäuse, Eichelhäher und andere Waldtiere. Bucheckern, die liegen bleiben, können zu jungen Buchen werden. Roh sind sie nicht zum Essen gedacht, wir schauen sie nur an.',
    ],
    o: [
      'Die Buchecker ist ein Nüsschen mit drei Kanten und dünner, glatter Schale. Meist sitzen zwei Nüsschen in einem Fruchtbecher, der sich zur Reife in der Regel in vier Lappen öffnet.',
      'Rotbuchen bilden nicht jedes Jahr gleich viele Früchte. In Mastjahren, die nur alle paar Jahre vorkommen, hängen die Bäume voll. Die Früchte reifen im Spätsommer und Herbst und fallen bis in den Spätherbst.',
      'Für viele Tiere sind Bucheckern ein fettreiches Futter. Was gefressen wird, ist weg. Was versteckt, vergessen oder liegen gelassen wird, kann im nächsten Frühjahr keimen. Roh enthalten Bucheckern Stoffe, die leicht giftig wirken können, darum bleiben sie liegen.',
      'Überlegt: Warum könnte es für den Wald gut sein, dass Buchen nicht jedes Jahr gleich viele Früchte tragen?',
    ],
  },
  'beech-husk': {
    m: [
      'Das ist die leere Hülle von Bucheckern. Sie ist außen mit weichen Stacheln besetzt und hat sich meist in vier Teile geöffnet.',
      'Die Hülle wuchs an der Buche und schützte zwei Nüsschen, solange sie reiften. Im Herbst trocknete sie, und die Teile klappten auseinander. Dann fielen die Bucheckern heraus.',
      'Die leere Hülle erzählt, dass hier Bucheckern gereift sind. Vielleicht haben Tiere sie geholt, vielleicht liegen sie noch irgendwo im Laub. Die Hülle selbst zerfällt später und wird zu Waldboden.',
    ],
    o: [
      'Die Fruchthülle der Rotbuche, Cupula genannt, ist holzig und mit weichen Stacheln besetzt. Sie öffnet sich zur Reife meist in vier Klappen und gibt zwei, manchmal drei Bucheckern frei.',
      'Während der Reifung schützt die Hülle die Früchte vor Austrocknung und Beschädigung. Im Herbst trocknet sie, die Klappen spreizen sich, und die Nüsschen fallen heraus.',
      'Leere Hüllen zeigen, wie ein Buchenjahr war: Liegen viele am Boden, hat die Buche vermutlich viele Früchte getragen. Ob eine Hülle von Tieren geleert wurde oder von allein aufsprang, sieht man ihr aber nicht an. Beides kommt vor.',
      'Zählt, wie viele Hüllen ihr in der Nähe findet. Was könnte das über das Buchenjahr verraten?',
    ],
  },
  hazelnut: {
    y: [
      'Das ist eine Haselnuss. Sie ist rund und hat eine feste braune Schale.',
      'Sie ist an einem Haselstrauch gewachsen und im Herbst heruntergefallen. Unten hat sie einen hellen Fleck.',
      'In der Schale steckt ein Samen. Daraus kann ein neuer Haselstrauch wachsen. Manche Waldtiere mögen den Samen als Futter. Wir lassen die Nuss im Wald.',
    ],
    m: [
      'Die Haselnuss trägt eine feste braune Schale mit einem hellen Fleck unten. Sie wächst an einem Haselstrauch.',
      'Im Herbst fallen die reifen Nüsse aus ihrer grünen, gezackten Hülle zu Boden. In der Schale liegt ein Samen, aus dem unter passenden Bedingungen ein neuer Strauch wachsen kann.',
      'Für manche Waldtiere ist dieser Samen Nahrung. An einer leeren Nussschale können Spuren zurückbleiben. Eine Öffnung verrät aber nicht immer sicher, welches Tier sie gemacht hat. Schaut euch den Rand an: Ist er glatt, gesplittert oder fein benagt? Heute bleibt die Nuss im Wald.',
    ],
    o: [
      'Die Haselnuss ist die Frucht des Haselstrauchs. Sie hat eine harte, glatte Schale mit einem hellen, matten Fleck am Grund, dort saß sie in ihrem grünen, zerschlitzten Fruchtbecher.',
      'Haselsträucher blühen sehr früh im Jahr mit hängenden Kätzchen, deren Pollen der Wind trägt. Die Nüsse reifen bis zum Spätsommer und Herbst. Dann fallen sie zu Boden oder werden von Tieren weggetragen.',
      'Nüsse sind energiereiches Futter für Eichhörnchen, Mäuse, Eichelhäher und andere Tiere. Was verschleppt und nicht gefressen wird, kann keimen. Die Schale einer geöffneten Nuss kann Hinweise geben, wer sie geöffnet hat, aber nicht immer eindeutig.',
      'Wie könnten sich Tiere im Winter merken, wo Nüsse versteckt sind? Was glaubt ihr?',
    ],
  },
  'gnawed-nut': {
    m: [
      'Das ist eine leere Nussschale mit einer Öffnung. Jemand hat die Nuss geöffnet und den Samen darin gefressen.',
      'Viele Tiere mögen Nüsse, zum Beispiel Mäuse, Eichhörnchen und Vögel. Jedes öffnet die Schale auf seine Art: Manche nagen ein Loch, andere brechen sie auf.',
      'An der Schale können Spuren bleiben, etwa ein glatter, ein rauer oder ein gesplitterter Rand. Sie sind kleine Hinweise, aber kein sicherer Beweis. Welches Tier es war, wissen wir nicht. Schaut euch den Rand an und überlegt, was ihr seht.',
    ],
    o: [
      'Eine Nussschale mit Öffnung ist eine Fraßspur. Bei Haselnüssen hängt die Form des Lochs und der Bruchstelle von der Art des Fressers ab.',
      'Nach Beschreibungen von Naturschutzverbänden hinterlassen Haselmäuse oft ein fast rundes, glattes Loch mit Zahnspuren parallel zum Rand. Andere Mäuse nagen ein raueres Loch mit Spuren quer zum Rand. Eichhörnchen und manche Vögel sprengen die Schale meist in zwei Hälften.',
      'Das sind Anhaltspunkte, keine Gewissheit. Lochränder verändern sich durch Alter und Wetter, und mehrere Tiere können ähnliche Spuren machen. Die Spur ist ein Hinweis, das Tier bleibt eine Vermutung.',
      'Formuliert eure Vermutung mit „könnte passen“ und sucht einen zweiten Hinweis. Welcher wäre das?',
    ],
  },
  cone: {
    y: [
      'Schau, ein Zapfen! Seine vielen Schuppen liegen ein bisschen wie kleine Dächer übereinander.',
      'Er ist an einem Nadelbaum gewachsen, zum Beispiel an einer Fichte oder Kiefer.',
      'Zwischen seinen Schuppen können Samen heranwachsen. Manche Waldtiere holen sich solche Samen als Nahrung. Vielleicht entdeckt ihr an einem anderen Zapfen sogar Knabberspuren!',
    ],
    m: [
      'Ein Zapfen ist die Frucht eines Nadelbaums. Viele feste Schuppen sitzen spiralförmig um eine Mitte, ungefähr wie Dachziegel.',
      'Zwischen den Schuppen entwickeln sich Samen, geschützt wie unter einem Dach. Sind sie reif, öffnen sich die Schuppen bei trockenem Wetter, und die Samen können herausfallen. Fichtenzapfen fallen später im Ganzen herunter.',
      'Für Eichhörnchen, Mäuse und manche Vögel sind die Samen ein wichtiges Futter. Manchmal sieht man an einem liegenden Zapfen, dass jemand die Schuppen abgenagt hat. Wir lassen den Zapfen heute im Wald liegen.',
    ],
    o: [
      'Zapfen sind die Fruchtstände von Nadelbäumen. Verholzte Schuppen sitzen spiralig an einer Spindel. Die Form unterscheidet sich je nach Baumart: Fichtenzapfen sind länglich und hängen, Kiefernzapfen eher eiförmig.',
      'Die Samen reifen geschützt zwischen den Schuppen. Trockene Luft lässt die Schuppen aufklappen, feuchte schließt sie wieder. Fichtenzapfen fallen im Ganzen zu Boden. Tannenzapfen stehen aufrecht und zerfallen am Baum, ganze Tannenzapfen liegen deshalb selten am Boden.',
      'Man kann einen Zapfen mit einer Vorratskammer vergleichen: Der Baum packt viele Samen in eine feste Hülle. Trotzdem holen sich Eichhörnchen, Mäuse und Vögel die Samen. Was nicht gefunden wird, kann keimen.',
      'Warum öffnen sich die Schuppen wohl bei trockenem Wetter? Überlegt, was das für die Samen bedeuten könnte.',
    ],
  },
  'gnawed-cone': {
    m: [
      'Dieser Zapfen sieht angeknabbert aus: Viele Schuppen fehlen, und in der Mitte ist die nackte Spindel zu sehen.',
      'Unter den Schuppen liegen die Samen. Manche Tiere zupfen oder nagen die Schuppen ab, um an die Samen zu kommen. Das können zum Beispiel Eichhörnchen oder Mäuse sein.',
      'Der Zapfen hat die Samen geschützt, bis ein hungriger Besucher kam. Für das Tier waren sie eine Mahlzeit. Welches Tier hier war, wissen wir nicht sicher. Vielleicht entdeckt ihr in der Nähe lose Schuppen.',
    ],
    o: [
      'Ein Zapfen, an dem viele Schuppen fehlen, ist eine Fraßspur. Von den Schuppen sind oft nur kurze Stummel an der Spindel geblieben.',
      'Nach Lehrmaterial zu Fraßspuren zupft das Eichhörnchen die Schuppen ab, der Zapfen sieht danach zerzaust aus. Mäuse nagen die Schuppen ab, dann wirkt die Spindel glatter. Auch Vögel können Zapfen bearbeiten.',
      'Der Zapfen zeigt, wie wichtig Samen als Nahrung im Wald sind. Wer ihn geöffnet hat, bleibt eine Vermutung, denn Wetter und Zeit verändern Spuren, und mehrere Tiere hinterlassen ähnliche Bilder.',
      'Was würdet ihr noch suchen, um eure Vermutung zu prüfen, ohne einem Tier nachzugehen?',
    ],
  },
  'cone-compare': {
    m: [
      'Ihr vergleicht zwei Zapfen: einen länglichen und einen rundlicheren. Beide bestehen aus vielen festen Schuppen.',
      'Verschiedene Nadelbäume haben verschiedene Zapfen. Fichten tragen lange, schlanke Zapfen, Kiefern kleinere, eher eiförmige. Auch an einem Baum sind Zapfen nicht alle gleich.',
      'Die Form hilft, Bäume zu unterscheiden, und jeder Zapfen birgt Samen, die der Wind oder Tiere verbreiten können. Schaut genau: Welcher Zapfen hat die breiteren Schuppen? Welcher wirkt schwerer?',
    ],
    o: [
      'Zapfenformen unterscheiden sich je nach Baumart: Fichtenzapfen sind lang und walzenförmig, Kiefernzapfen eiförmig bis rundlich mit verdickten Schuppenspitzen, Lärchenzapfen klein und eiförmig.',
      'Zapfen reifen meist über Monate. Fichtenzapfen hängen und fallen im Ganzen, Kiefernzapfen öffnen sich bei Trockenheit und fallen oft erst später. Ob ihr beide Formen findet, hängt von den Bäumen am Weg ab.',
      'Die Form verrät etwas über die Baumart, aber nicht immer sicher: Zapfen derselben Art können verschieden groß sein und durch Alter oder Fraß anders aussehen. Ein Vergleich ist ein Beobachtungsanfang, keine Bestimmung.',
      'Merkt euch drei Unterschiede. Welcher fällt am meisten auf?',
    ],
  },
  'maple-seed': {
    m: [
      'Das ist die Frucht eines Ahorns. Zwei Flügel sitzen an kleinen Nüsschen, ungefähr wie ein V.',
      'Die Früchte wachsen im Sommer am Baum und fallen im Herbst. Weil sie Flügel haben, drehen sie sich beim Fallen und gleiten ein Stück durch die Luft.',
      'Der Wind kann die Früchte ein Stück vom Mutterbaum wegtragen. So haben junge Ahorne mehr Platz und Licht. Die Drehung erinnert an einen kleinen Propeller, das ist ein Vergleich. Wir lassen die Frucht liegen.',
    ],
    o: [
      'Die Ahornfrucht ist eine geflügelte Spaltfrucht: Zwei Nüsschen, jedes mit einem Flügel, hängen zusammen und trennen sich später. Form und Winkel der Flügel unterscheiden Ahornarten.',
      'Die Früchte reifen vom Sommer bis in den Herbst. Beim Fallen versetzt der Flügel die Frucht in Drehung. Das bremst den Fall ein wenig, und der Wind kann sie weiter tragen.',
      'Der Flügel ist ein Mittel der Windverbreitung. Je weiter ein Samen vom Mutterbaum landet, desto weniger konkurriert er mit ihm um Licht und Wasser. Man kann die Drehung mit einem kleinen Hubschrauber vergleichen, aber das ist nur ein Vergleich.',
      'Was würde sich ändern, wenn der Flügel größer oder kleiner wäre? Welche Folgen hätte das für den Samen?',
    ],
  },
  'needle-twig': {
    y: [
      'Das ist ein kleiner Zweig mit vielen Nadeln. Sie sitzen rundherum.',
      'Er gehört zu einem Nadelbaum, zum Beispiel einer Fichte. Vielleicht ist er heruntergefallen.',
      'Nadeln sind die Blätter von Nadelbäumen. Viele Nadelbäume behalten sie auch im Winter. Wir lassen den Zweig im Wald liegen.',
    ],
    m: [
      'Ein Nadelzweig trägt viele kurze Nadeln, die rundherum am Zweig sitzen. Sie sind steif und meist dunkelgrün.',
      'Nadeln sind die Blätter von Nadelbäumen wie Fichte oder Kiefer. Zweige können abbrechen, zum Beispiel bei Wind oder Schnee, und fallen dann auf den Waldboden.',
      'Nadeln sind klein und haben eine feste Oberfläche. So verdunsten sie wenig Wasser, und viele Nadelbäume bleiben auch im Winter grün. Alte Nadeln fallen irgendwann ab und werden zu Waldboden. Bitte zupft keine Nadeln ab.',
    ],
    o: [
      'Ein Nadelzweig trägt die Nadeln einzeln oder in Büscheln, je nach Baum: Fichtennadeln sitzen einzeln rundum, Kiefernnadeln zu zweit, Lärchennadeln in Büscheln.',
      'Bei den meisten Nadelbäumen lebt eine Nadel mehrere Jahre, dann fällt sie ab. Lärchen werfen ihre Nadeln jeden Herbst ab. Zweige brechen außerdem durch Wind, Nassschnee oder Alter und liegen dann am Boden.',
      'Die Nadel hat wenig Oberfläche und eine feste Haut, so geht wenig Wasser verloren. Abgefallene Nadeln bilden mit anderem Laub die Streuschicht, die von Pilzen und Bodentieren zersetzt wird und zum Humus beiträgt.',
      'Findet ihr Nadeln, die einzeln sitzen, und solche, die zu mehreren zusammenhängen? Was könnte das über die Bäume verraten?',
    ],
  },
  'beech-bud': {
    m: [
      'Eine Buchenknospe ist lang, schlank und läuft vorn spitz zu. Sie sitzt am Zweig und ist rotbraun.',
      'Knospen entstehen schon im Jahr vorher. In ihnen warten winzige Blätter, gut verpackt in Schuppen. Im Frühling öffnen sie sich, und die Blätter entfalten sich.',
      'Die Schuppen der Knospe sind wie eine feste Jacke: Sie schützen das Zarte im Inneren vor Kälte und Austrocknung. Eine Knospe ist ein Paket, in dem die nächsten Blätter schon bereitliegen.',
    ],
    o: [
      'Die Knospe der Rotbuche ist deutlich länger als dick, spitz und von vielen rotbraunen Schuppen bedeckt. Sie sitzt abwechselnd an dünnen Zweigen. Bei der Hainbuche sind die Knospen kürzer und gedrungener.',
      'Bäume legen ihre Knospen schon im Sommer und Herbst an. Im Inneren liegen gefaltete Blattanlagen, die im Winter ruhen. Wärme und länger werdende Tage lösen im Frühjahr den Austrieb aus.',
      'Die nächsten Blätter sind in der Knospe schon fertig angelegt. Die Schuppen schützen sie vor Kälte und Austrocknung. So kann der Baum im Frühling schnell Blätter entfalten, sobald die Bedingungen passen.',
      'Wie würde der Baum im Frühling wohl starten, wenn seine Blätter erst dann angelegt würden?',
    ],
  },
  'oak-leaf': {
    m: [
      'Ein Eichenblatt hat runde Lappen mit Buchten dazwischen, ungefähr wie eine Welle. Der Stiel ist kurz.',
      'Es ist an einer Eiche gewachsen und im Herbst herabgefallen. Im Herbst werden Eichenblätter gelb bis braun, manche bleiben lange am Baum hängen.',
      'Blätter sind die Werkstatt des Baums: Mit Licht, Wasser und Luft entsteht dort Zucker als Baustoff. Die runden Lappen unterscheiden das Eichenblatt gut vom spitzen Ahornblatt. Nicht alle Eichenarten haben genau dieselbe Form.',
    ],
    o: [
      'Das Blatt der heimischen Stiel- und Traubeneiche hat tiefe Buchten und abgerundete Lappen ohne Spitzen. Die Unterseite ist heller als die Oberseite. Beide Arten unterscheiden sich in kleinen Merkmalen, etwa darin, ob das Blatt einen längeren Stiel hat.',
      'Eichenblätter sprießen im Frühling und werden im Herbst braun. Viele Eichen behalten ihr trockenes Laub noch lange, bevor es fällt.',
      'Den ganzen Sommer lang fangen die Blätter Licht ein und stellen daraus mit Wasser und Kohlendioxid Zucker her. Fällt das Laub, wird es Nahrung für Pilze, Bakterien und Bodentiere. So schließt sich ein Kreislauf.',
      'Welche Merkmale würdet ihr nennen, um ein Eichenblatt von einem Ahornblatt zu unterscheiden?',
    ],
  },
  'maple-leaf': {
    y: [
      'Schau, ein Blatt wie eine Hand! Es hat spitze Zacken.',
      'Es ist an einem Ahorn gewachsen und im Herbst heruntergefallen.',
      'Die Blätter fangen Sonnenlicht ein. Im Herbst werden sie gelb oder rot. Unter dem Laub finden kleine Waldtiere ein Versteck. Wir lassen das Blatt liegen.',
    ],
    m: [
      'Ein Ahornblatt sieht aus wie eine Hand mit fünf spitzen Fingern. Es hängt an einem langen Stiel.',
      'Es wuchs an einem Ahorn und fällt im Herbst, wenn der Baum seine Blätter abwirft. Vorher färben sich viele Ahornblätter gelb, orange oder rot.',
      'Die Farbe kommt daher, dass der Baum im Herbst das grüne Blattgrün abbaut. Dann werden andere Farbstoffe sichtbar. Das Laub am Boden wird später zu Waldboden. Nicht alle Ahornarten haben genau dieselbe Form.',
    ],
    o: [
      'Ahornblätter sind handförmig gelappt, beim Berg-Ahorn mit fünf spitzen, grob gezähnten Lappen. Sie sitzen gegenüber am Zweig und hängen an langen Stielen.',
      'Im Herbst baut der Baum das grüne Chlorophyll ab. Gelbe und orange Farbstoffe, die schon im Blatt waren, werden sichtbar. Rote Farbstoffe, Anthocyane, werden im Herbst neu gebildet. Zuletzt entsteht am Stielansatz eine Trennschicht, und das Blatt fällt.',
      'Vor dem Laubfall holt der Baum wertvolle Stoffe aus dem Blatt zurück. Das Laub am Boden wird von Pilzen, Bakterien und Bodentieren zersetzt. Wozu Anthocyane im Herbst dienen, ist für Fachleute nicht in jedem Detail geklärt.',
      'Welche Farben seht ihr an eurem Blatt? Was könnte hinter den Farbunterschieden stecken?',
    ],
  },
  'leaf-hole': {
    m: [
      'Dieses Blatt hat ein Loch. Das Loch kann rund, eckig oder ausgefranst sein.',
      'Löcher in Blättern haben viele Ursachen. Manchmal haben Raupen oder Käfer ein Stück gefressen. Auch Wind oder Hagel können ein Blatt beschädigen.',
      'Ein Loch ist nicht immer Fraß. Sieht der Rand wie angeknabbert aus, war vielleicht ein hungriges Insekt da. Welches, wissen wir nicht. Blätter sind Futter für viele kleine Tiere, und von ihnen leben wieder andere Tiere.',
    ],
    o: [
      'Ein Loch im Blatt ist ein Hinweis, aber keine Antwort. Untersucht die Ränder: Glatte, runde Ränder, ausgefranste Kanten oder braune Säume können verschiedene Ursachen haben.',
      'Typische Verursacher sind Raupen, Käfer, Blattwespenlarven oder Schnecken. Aber auch Hagel, Wind oder Pilzkrankheiten können Löcher und Risse erzeugen. Aus einem einzelnen Loch lässt sich die Ursache oft nicht sicher bestimmen.',
      'Blätter sind Nahrung für viele Tiere. Ein angefressenes Blatt zeigt ein Stück der Nahrungskette: Pflanze, Insekt, und dann Vögel oder andere Tiere, die Insekten fressen. Einem gesunden Baum schadet das meist wenig.',
      'Welcher weitere Hinweis würde eine Vermutung stärken: noch ein Loch, ein bestimmter Rand oder etwas ganz anderes?',
    ],
  },
  'leaf-skeleton': {
    m: [
      'Von diesem Blatt ist fast nur das feine Netz aus Adern übrig. Es sieht aus wie ein zartes Gitter aus Spitze.',
      'Die weichen Teile des Blattes wurden abgebaut, zum Beispiel von kleinen Lebewesen und Pilzen und durch Wetter. Die festeren Adern bleiben länger.',
      'So wird aus altem Laub Schritt für Schritt wieder Waldboden. Was vom Blatt zerfällt, wird zu Nährstoffen, die neue Pflanzen brauchen. Wir lassen das zarte Blatt liegen.',
    ],
    o: [
      'Ein Blattskelett besteht nur noch aus dem Netz der Blattadern und dem Stiel. Die Blattfläche dazwischen ist abgebaut.',
      'Wie lange das dauert und was genau passiert ist, lässt sich nicht allgemein sagen. Pilze, Bakterien, kleine Bodentiere und Regen spielen beim Abbau von Laub eine Rolle. Die Adern bestehen aus festeren Fasern und halten länger.',
      'Laub, Nadeln und anderes Pflanzenmaterial bilden am Waldboden eine Streuschicht. Daraus entsteht mit der Zeit Humus. Humus speichert Nährstoffe und Wasser und lockert den Boden. Das Blattskelett zeigt diesen Vorgang mitten im Gang.',
      'Warum sind die Adern wohl stabiler als die Blattfläche?',
    ],
  },
  'leaf-mine': {
    o: [
      'Eine Blattmine ist ein heller Gang im Inneren eines Blattes. Die Blattoberseite bleibt meist ganz, nur darunter schimmert eine Spur durch, oft in Schlangenlinien.',
      'Kleine Larven, zum Beispiel von winzigen Faltern, Käfern oder Fliegen, leben zwischen Ober- und Unterseite des Blattes und fressen dort das weiche Gewebe. Dabei hinterlassen sie ihre Spur.',
      'Die Spur wird zum Ende hin oft breiter, weil die Larve wächst. Jede Art frisst ihre eigene Form, deshalb kann man Minen oft an ihrer Gestalt unterscheiden. An einem Blatt lässt sich so die Geschichte eines winzigen Tiers lesen, das man nicht sieht.',
      'Welche Form hat die Mine, Gang, Fleck oder Spirale? Wo beginnt sie, wo endet sie?',
    ],
  },
  gall: {
    o: [
      'Eine Galle ist eine kleine Wucherung an einer Pflanze. Bei Eichen sitzen zum Beispiel runde Kugeln oder flache Scheiben am Blatt, oft auf der Unterseite.',
      'Eine Gallwespe legt ein Ei in das Blatt. Die Pflanze bildet um die Larve eine Wucherung. In ihr lebt die Larve geschützt und findet Nahrung.',
      'Es gibt viele Gallarten, jede mit eigener Form. Für die Larve ist die Galle Haus und Vorratskammer zugleich. Dem Baum macht eine einzelne Galle meist wenig aus. Wir lassen sie ungeöffnet, damit die Bewohner ungestört bleiben.',
      'Warum könnte eine feste Außenhaut für das Tier im Inneren nützlich sein?',
    ],
  },
  moss: {
    y: [
      'Schau, ein Moospolster! Es sieht aus wie ein kleines grünes Kissen.',
      'Moos wächst gern, wo es feucht und schattig ist, zum Beispiel auf Holz, auf Steinen oder auf dem Boden.',
      'Moos kann Wasser aufnehmen wie ein kleiner Schwamm. Kleine Tiere finden darin ein Plätzchen. Wir lassen es, wie es ist.',
    ],
    m: [
      'Moos besteht aus winzigen Pflänzchen, die dicht beieinander ein weiches Polster bilden. Jedes Pflänzchen hat kleine grüne Blättchen.',
      'Moose haben keine richtigen Wurzeln. Sie nehmen Wasser mit ihrer ganzen Oberfläche auf und halten sich mit feinen Fäden fest. Deshalb wachsen sie auch auf Stein oder Holz.',
      'Ein Moospolster kann viel Wasser festhalten und gibt es langsam wieder ab. Zwischen den Pflänzchen leben viele winzige Tiere. Bei Trockenheit werden manche Moose braun und wieder grün, wenn Regen kommt. Nicht jedes Moos ist immer feucht.',
    ],
    o: [
      'Moose sind kleine Landpflanzen ohne echte Wurzeln und ohne Blüten. Ihre Pflänzchen bestehen aus Stämmchen und winzigen Blättchen. In Mitteleuropa gibt es viele Arten mit unterschiedlichen Ansprüchen.',
      'Moose nehmen Wasser und gelöste Stoffe großenteils direkt über ihre Oberfläche auf. Sie vermehren sich über Sporen, die in kleinen Kapseln auf dünnen Stielen reifen. Feine Fäden, die Rhizoide, halten sie am Untergrund.',
      'Ein Moospolster wirkt wie ein Schwamm: Es nimmt Regenwasser auf und gibt es langsam ab. Das hilft kleinen Lebewesen und trägt zum Wasserhaushalt am Boden bei. Moose zeigen allerdings nicht verlässlich eine Himmelsrichtung an, das ist ein verbreiteter Irrtum.',
      'Wo in eurer Umgebung ist das Moos am dicksten? Was haben diese Stellen gemeinsam?',
    ],
  },
  'fern-frond': {
    y: [
      'Schau, ein Farn! Sein Blatt besteht aus vielen kleinen Seitenblättern.',
      'Farne wachsen gern im Wald, wo es schattig und feucht ist.',
      'Farne haben keine Blüten und keine Samen. Sie machen winzige Körnchen, die Sporen heißen. Im Frühling rollen sich die jungen Blätter langsam auf. Wir lassen den Farn stehen.',
    ],
    m: [
      'Ein Farnblatt, Wedel genannt, hat eine Mittelrippe und viele kleine Seitenblättchen, die Fiedern. Sie werden zur Spitze hin kleiner.',
      'Farne wachsen gern an feuchten, schattigen Stellen. Im Frühling rollen sich die jungen Wedel wie eine Schnecke auf. Farne gibt es schon sehr lange auf der Erde.',
      'Farne haben keine Blüten und keine Samen. Sie vermehren sich mit winzigen Sporen, die der Wind verteilt. Bei vielen Farnen sitzen sie in kleinen Gruppen auf der Blattunterseite. Nicht an jedem Wedel sind sie zu sehen.',
    ],
    o: [
      'Der Wedel ist bei vielen Farnen ein- bis mehrfach gefiedert: An der Mittelrippe sitzen Fiedern, die wieder in kleinere Teile gegliedert sein können.',
      'Farne sind Sporenpflanzen. Statt Blüten und Samen bilden sie Sporen, die in kleinen Behältern reifen. Aus einer Spore wächst zuerst ein winziges, flaches Pflänzchen. Erst später entsteht daraus der Farn, den wir kennen.',
      'Farne gehören zu den ältesten Pflanzengruppen an Land. Weil ihre Vermehrung Feuchtigkeit braucht, wachsen viele gern an schattigen, feuchten Stellen. Im Winter sterben viele Wedel ab, einige bleiben länger grün.',
      'Wie ist der Wedel gebaut? Zählt die Fiedern auf einer Seite, wenn ihr mögt.',
    ],
  },
  'fern-spores': {
    o: [
      'Auf der Unterseite mancher Farnwedel sitzen kleine Häufchen, oft in Reihen oder an den Rändern der Fiedern. Das sind Gruppen von Sporenbehältern, Sori genannt.',
      'Farne bilden keine Samen. In den Sori reifen sehr viele winzige Sporen. Sind sie reif, öffnen sich die Behälter, und der Wind verteilt die Sporen.',
      'Aus einer Spore, die auf feuchten Boden fällt, wächst nicht gleich ein Farn, sondern erst ein winziges flaches Pflänzchen. Erst später entwickelt sich daraus der bekannte Wedel. Nicht jeder Wedel trägt Sori, und ihr Aussehen kann helfen, die Farnart zu erkennen.',
      'Wie sind die Gruppen angeordnet: in Reihen, am Rand oder verteilt? Dafür muss kein Wedel gedreht werden, ein Blick von der Seite genügt.',
    ],
  },
  'bracket-fungus': {
    m: [
      'Dieser Pilz wächst seitlich an Holz, wie ein kleines Regal oder ein halber Teller. Oft hat er helle und dunkle Streifen.',
      'Der Teil, den du siehst, ist nur der Fruchtkörper. Der Rest des Pilzes ist ein feines Geflecht im Holz, das man nicht sieht. Der Fruchtkörper bildet Sporen zur Vermehrung.',
      'Pilze sind weder Pflanzen noch Tiere. Manche Baumpilze helfen mit, abgestorbenes Holz abzubauen, so werden Stoffe frei, die der Wald wieder nutzen kann. Käfer und andere Tiere leben in und auf dem Pilz. Wir berühren ihn nicht.',
    ],
    o: [
      'Konsolenpilze wachsen als halbrunde oder fächerförmige Fruchtkörper seitlich an Holz. Die Oberseite zeigt oft Zonen in verschiedenen Farben, die Unterseite trägt Poren oder Lamellen, aus denen Sporen fallen.',
      'Das eigentliche Pilzgeflecht, das Myzel, wächst im Holz und kann viel größer sein als der sichtbare Fruchtkörper. Fruchtkörper entstehen, wenn Wetter und Zustand des Holzes passen. Manche leben mehrere Jahre.',
      'Einige Baumpilze leben von totem Holz und bauen es ab, andere befallen lebende Bäume. Ohne genaue Bestimmung lässt sich das nicht sagen. Viele Insekten nutzen Fruchtkörper als Nahrung oder Wohnung. Das sichtbare Stück ist nur ein Teil eines großen Netzes.',
      'Was lässt sich aus der Stelle am Holz schließen, und was nicht?',
    ],
  },
  lichen: {
    m: [
      'Eine Flechte sieht aus wie ein flacher graugrüner Fleck mit kleinen Lappen, ein bisschen wie ein Blatt aus Papier.',
      'Eine Flechte ist keine Pflanze und kein Moos. Sie besteht aus zwei Lebewesen, die zusammenleben: ein Pilz und eine winzige Alge.',
      'Der Pilz gibt Halt und Schutz, die Alge macht aus Licht Nahrung. Gemeinsam schaffen sie es, auf Rinde oder Stein zu wachsen. Flechten wachsen sehr langsam. Wir lassen sie an ihrem Platz.',
    ],
    o: [
      'Blattflechten bilden flache, gelappte Lager, die an Blätter erinnern und sich meist leicht vom Untergrund abheben. Daneben gibt es Krusten- und Strauchflechten.',
      'Eine Flechte ist eine Lebensgemeinschaft aus einem Pilz und einer Alge oder einem Cyanobakterium. Der Pilz bildet den Körper, der Partner betreibt Photosynthese. Flechten sind weder Moose noch Pflanzen.',
      'Die Partnerschaft erlaubt es Flechten, Orte zu besiedeln, an denen beide Partner allein kaum leben könnten. Viele wachsen nur Millimeter im Jahr, und manche Arten reagieren empfindlich auf die Luftqualität. Eine Himmelsrichtung verraten sie nicht verlässlich.',
      'Sucht ein zweites Lager: Gleicht es dem ersten in Farbe und Form?',
    ],
  },
  mushroom: {
    y: [
      'Das ist ein Pilz mit Hut und Stiel.',
      'Er wächst im Wald auf dem Boden oder an Holz. Den größten Teil sieht man nicht.',
      'Unter der Erde hat der Pilz ganz feine Fäden. Pilze sind weder Pflanzen noch Tiere. Wir schauen ihn nur an und fassen ihn nicht an.',
    ],
    m: [
      'Der Teil mit Hut und Stiel, den du siehst, ist der Fruchtkörper des Pilzes. Es gibt ihn in vielen Farben und Formen.',
      'Der größte Teil des Pilzes ist ein feines Geflecht aus Fäden im Boden oder Holz. Der Fruchtkörper wächst nur zeitweise, vor allem wenn es feucht ist. Unter dem Hut entstehen Sporen.',
      'Pilze sind weder Pflanzen noch Tiere. Viele zersetzen Laub und Holz, andere leben mit Baumwurzeln zusammen. Sie gehören zum Kreislauf im Wald. Manche sind giftig, deshalb schauen wir nur und fassen nichts an.',
    ],
    o: [
      'Der sichtbare Teil eines Pilzes mit Hut und Stiel ist der Fruchtkörper. Unter dem Hut tragen Lamellen oder Röhren die Sporen.',
      'Das Myzel, ein Netz aus feinen Fäden, wächst im Boden oder Holz und ist oft viel größer als der Fruchtkörper. Wenn Feuchtigkeit und Wärme passen, wächst daraus ein Fruchtkörper, manchmal in wenigen Tagen.',
      'Pilze bilden ein eigenes Reich, getrennt von Pflanzen und Tieren. Manche Arten zersetzen Laub und Holz, andere leben in Partnerschaft mit Baumwurzeln. Welche Rolle ein bestimmter Pilz spielt, lässt sich ohne genaue Bestimmung nicht sagen. Ob ein Pilz giftig ist, erkennt man nie an einem Bild.',
      'Was könnte der Fruchtkörper für den Pilz bedeuten, wenn man ihn mit einer Frucht an einem Baum vergleicht?',
    ],
  },
  'spider-web': {
    y: [
      'Schau, ein Spinnennetz! Es ist aus ganz feinen Fäden gebaut.',
      'Eine Spinne hat die Fäden selbst gesponnen.',
      'Das Netz fängt kleine Tiere wie Mücken. So findet die Spinne ihr Futter. Vielleicht glitzern Tautropfen darauf. Wir fassen das Netz nicht an.',
    ],
    m: [
      'Ein Radnetz hat gerade Speichen von der Mitte und feine Kreise dazwischen. Es ist zwischen Zweigen gespannt.',
      'Die Spinne spinnt die Fäden aus ihrem Körper. Viele Spinnen bessern ihr Netz immer wieder aus oder bauen es neu.',
      'Das Netz fängt kleine Insekten. Die Fäden sind dünn, aber im Verhältnis zur Dicke sehr reißfest. Nach Tau oder Nebel glitzern Tropfen darauf. Nicht jede Spinne baut ein Radnetz, manche jagen ohne Netz. Wir berühren es nicht.',
    ],
    o: [
      'Ein Radnetz besteht aus Rahmenfäden, Speichen und einer Fangspirale. Die Spirale ist klebrig, Speichen und Rahmen sind es nicht.',
      'Die Spinne baut das Netz Faden für Faden aus Spinnseide, die sie in Drüsen im Hinterleib herstellt. Sie legt zuerst Rahmen und Speichen an und spannt dann die Fangspirale. Viele Spinnen erneuern ihr Netz häufig.',
      'Das Netz ist Falle und Fühler zugleich: Schwingungen zeigen der Spinne, wenn etwas hängen bleibt. Spinnen fressen viele Insekten und werden selbst von Vögeln gefressen, sie sind ein Teil der Nahrungskette im Wald.',
      'Wo hängt das Netz, und was könnte diese Stelle für die Spinne gut machen?',
    ],
  },
  chestnut: {
    y: [
      'Das ist eine Kastanie. Sie ist braun und glänzt wie poliert.',
      'Sie ist an einer Rosskastanie gewachsen. Ihre grüne Hülle hatte viele Stacheln.',
      'In der Kastanie steckt ein Samen. Aus ihm kann ein neuer Kastanienbaum wachsen. Sie ist nicht zum Essen. Wir schauen sie nur an.',
    ],
    m: [
      'Eine Rosskastanie ist glänzend braun und hat einen hellen Fleck. Sie ist viel größer als eine Haselnuss.',
      'Sie wächst an der Rosskastanie. Im Herbst platzt die grüne, stachelige Hülle auf, und die Kastanie fällt heraus. Der Baum hat große Blätter, die wie Hände aussehen.',
      'Der Samen kann zu einem neuen Baum werden. Rosskastanien sind nicht mit den essbaren Esskastanien verwandt und nicht zum Essen gedacht. Wir lassen die Kastanie im Wald liegen.',
    ],
    o: [
      'Die Rosskastanie hat große, glänzende Samen mit hellem Nabelfleck. Der Baum stammt ursprünglich aus Südosteuropa und wird bei uns oft in Parks angepflanzt. Im Mischwald ist er nicht überall zu erwarten.',
      'Die grüne Hülle ist stachelig und springt im Herbst in Klappen auf. Die Samen fallen heraus. Innen ist die Hülle weißlich und gepolstert.',
      'Rosskastanie und Esskastanie sehen ähnlich aus, sind aber nicht verwandt. Rosskastanien sind nicht zum Essen, sie enthalten Stoffe, die Beschwerden machen können. Aus dem Samen kann bei passendem Boden ein neuer Baum wachsen.',
      'Wie unterscheiden sich die Blätter einer Rosskastanie von denen einer Eiche?',
    ],
  },
  'chestnut-husk': {
    y: [
      'Das ist eine Hülle mit vielen Stacheln. Sie ist aufgeplatzt.',
      'Eine Kastanie hat darin gesessen. Die Hülle ist an der Rosskastanie gewachsen.',
      'Die Stacheln haben die Kastanie beschützt, solange sie wuchs. Jetzt ist die Hülle offen. Wir fassen sie nicht an, die Stacheln pieken.',
    ],
    m: [
      'Das ist die Fruchthülle einer Rosskastanie: grün oder bräunlich mit vielen kurzen Stacheln. Sie ist aufgeplatzt.',
      'Die Hülle umgibt die Kastanie, solange sie wächst. Im Herbst trocknet sie, platzt auf und gibt die glänzende Kastanie frei. Innen ist sie hell und weich.',
      'So hatte die Kastanie Schutz, bis sie reif war. Die leere Hülle erzählt, dass hier eine Kastanie gereift ist. Später zerfällt sie im Laub und wird Teil des Waldbodens. Wir lassen sie liegen.',
    ],
    o: [
      'Die Fruchthülle der Rosskastanie ist eine dickwandige Kapsel mit kurzen Stacheln. Sie springt meist in drei Klappen auf, innen ist sie weißlich und weich gepolstert. Sie enthält ein bis drei Samen.',
      'Die Kapselfrucht reift von Sommer bis Herbst und fällt auf den Boden, oft zusammen mit den Samen. Die Stacheln sind Teil der Hülle.',
      'Die Hülle zeigt, wie Pflanzen Samen schützen: außen stachelig, innen gepolstert. Dass die Stacheln Fressfeinde abhalten, ist einleuchtend, aber nicht für jede Art belegt. Auch das gehört zur Naturbeobachtung: Eine Vermutung ist noch kein Beweis.',
      'Welche Eigenschaften der Hülle würden einen Samen vor Austrocknung und Beschädigung schützen?',
    ],
  },
  'animal-track': {
    m: [
      'Das ist der Abdruck eines Tierfußes im weichen Boden. Man sieht eine Vertiefung mit kleinen Zehen und manchmal Krallen.',
      'Wenn ein Tier über weichen Boden läuft, drückt es seinen Fuß hinein. Nach Regen und im Matsch bleiben solche Abdrücke gut sichtbar.',
      'Abdrücke erzählen, wie ein Tier unterwegs war: auf Zehen oder auf Hufen, groß oder klein. Welches Tier es war, lässt sich oft nicht sicher sagen. Wir folgen der Spur nicht, wir schauen nur.',
    ],
  },
  'deer-track': {
    o: [
      'Zwei längliche, vorn spitze Abdrücke nebeneinander, die Schalen, könnten zu einem Reh passen. Sie sind oft schmal, leicht gespreizt und zeigen keine Zehen und Krallen.',
      'Rehe laufen auf den Spitzen ihrer Zehen, die durch Hufe geschützt sind. Die beiden mittleren Zehen tragen das Gewicht und drücken sich als Schalen in den Boden. Die Seitenzehen sieht man meist nur bei sehr tiefem Boden.',
      'Spuren zeigen, was ein Tier getan hat, nicht immer, welches Tier es war. Auch andere Huftiere können ähnliche Abdrücke hinterlassen, und Regen und Gangart verändern das Bild. „Könnte passen“ ist ehrlicher als eine feste Behauptung.',
      'Welche Beobachtungen würden eure Vermutung sicherer machen, zum Beispiel mehrere Abdrücke hintereinander?',
    ],
  },
  'dog-track': {
    o: [
      'Ein großer Ballen, vier Zehen und oft Krallenpunkte davor könnten zu einem Hund passen. Der Abdruck wirkt eher rundlich und breit.',
      'Hunde laufen auf den Zehen. Ihre Krallen sind nicht einziehbar, darum zeigen sie sich oft im Abdruck. Füchse hinterlassen ähnliche, meist schmalere Abdrücke.',
      'Eine einzelne Spur reicht nicht für eine sichere Bestimmung. Bodenfeuchte, Tempo und Alter der Spur verändern den Abdruck. Ihr könnt Hinweise sammeln: Größe, Zahl der Zehen, Krallen. Danach bleibt es bei „könnte passen“.',
      'Wie viele Zehen zählt ihr, und was verrät die Größe? Was lässt sich daraus sicher sagen, was nicht?',
    ],
  },
};

export type InfoTable = Record<string, Partial<Record<AgeGroup, Info3>>>;

export const infos: InfoTable = Object.fromEntries(
  Object.entries(raw).map(([id, e]) => {
    const per: Partial<Record<AgeGroup, Info3>> = {};
    if (e.y) per['2-3'] = { what: e.y[0], origin: e.y[1], secret: e.y[2] };
    if (e.m) per['4-6'] = { what: e.m[0], origin: e.m[1], secret: e.m[2] };
    if (e.o) per['7-10'] = { what: e.o[0], origin: e.o[1], secret: e.o[2], more: e.o[3] };
    return [id, per];
  }),
);

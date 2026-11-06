import type { AgeGroup, Theme } from '../domain/types';

/**
 * Waldgeschenke: kleine Naturgeschichten für den Abschluss einer vollständig erfüllten Mission.
 * Jedes Geschenk hat eine stabile ID, einen Titel, ein Motiv (eine vorhandene eigene Zeichnung), Themen, verwandte Konzepte
 * (nur für die Auswahl) und je einen eigenen Text für 2–3, 4–6 und 7–10 Jahre.
 * Regeln: reale Zusammenhänge in erzählendem Ton, Vergleiche als Vergleiche, keine erfundenen Tiergespräche,
 * kein Auftrag, ein Tier aufzuspüren, Verstecke zu öffnen oder etwas zu essen, und nie die Behauptung, das Tier sei gesehen worden.
 * Quellen-IDs siehe docs/WALDGESCHENKE.md (G = Geschenkquellen, Q = Waldrecherche, V = in dieser Fassung zusätzlich geprüft).
 */
export interface Gift {
  id: string;
  title: string;
  /** Schlüssel einer vorhandenen Zeichnung (illustrationKey) */
  motif: string;
  themes: Theme[];
  /** Konzepte, zu denen das Geschenk gut passt; nur eine Vorliebe bei der Auswahl, nie ein Muss */
  concepts: string[];
  text: Record<AgeGroup, string>;
  sources: string[];
}

export const gifts: Gift[] = [
  {
    id: 'eichelhaeher',
    title: 'Der Vogel, der beim Waldpflanzen hilft',
    motif: 'acorn',
    themes: ['growth', 'year'],
    concepts: ['acorn', 'acornCup', 'hazelnut', 'beechnut'],
    sources: ['G1', 'G2', 'V1'],
    text: {
      '2-3':
        'Im Wald lebt ein Vogel, der Eicheln versteckt. Er heißt Eichelhäher. Er legt sich einen Vorrat an, damit er im Winter Futter hat. Manche Eicheln findet er nicht wieder. Aus einer vergessenen Eichel kann eine kleine Eiche wachsen.',
      '4-6':
        'Im Wald lebt ein Vogel, der Eicheln versteckt: der Eichelhäher. Er legt sich Vorräte an, damit er später wieder Nahrung findet. Manche Eicheln werden nicht mehr gefressen. Wenn die Bedingungen passen, kann daraus eine kleine Eiche wachsen. So können neue Bäume auch ein Stück entfernt von der alten Eiche entstehen. Der Vogel hat also Futter versteckt – und dabei kann er nebenbei bei der Ausbreitung von Eichen helfen. Vielleicht sieht eine winzige Eichel am Weg für euch jetzt schon ein bisschen anders aus!',
      '7-10':
        'Der Eichelhäher sammelt im Herbst Eicheln und vergräbt sie einzeln im Boden, verteilt auf viele Stellen. Mit diesen Verstecken überbrückt er die nahrungsarme Zeit. Einen Teil davon findet er wieder, andere nicht. Fachleute beschreiben dieses Vergessen als Teil einer erfolgreichen Verbreitungsstrategie der Eiche: Eine Eichel, die im Boden bleibt, kann keimen, manchmal weit entfernt vom Mutterbaum und mit mehr Licht als unter dem dichten Blätterdach. Eine Absicht des Vogels ist das nicht, sondern eine Nebenwirkung seines Vorratsverhaltens, von der beide profitieren. Wie viele Eicheln ein einzelner Vogel versteckt, schwankt stark, und genaue Zahlen lassen sich schwer belegen. Zum Nachdenken: Was würde geschehen, wenn der Häher jede Eichel wiederfände?',
    },
  },
  {
    id: 'eichhoernchen-winter',
    title: 'Das Eichhörnchen schläft nicht den ganzen Winter',
    motif: 'hazelnut',
    themes: ['gnawed', 'year'],
    concepts: ['hazelnut', 'gnawedNut', 'cone', 'gnawedCone'],
    sources: ['G3', 'G4', 'V2'],
    text: {
      '2-3':
        'Das Eichhörnchen schläft im Winter nicht die ganze Zeit. Es ruht viel in seinem warmen Nest, das heißt Kobel. Manchmal kommt es heraus und sucht Futter. Dabei helfen ihm die Verstecke vom Herbst. Nicht jedes findet es wieder.',
      '4-6':
        'Viele Tiere halten im Winter Winterschlaf. Das Eichhörnchen macht es anders: Es hält eine Winterruhe. Dann bleibt es viel in seinem Kobel, einem warmen Nest aus Zweigen und weichem Material. An manchen Tagen kommt es heraus und sucht Nahrung. Im Herbst hat es Nüsse und Samen an vielen Stellen versteckt. Nicht jedes Versteck findet es wieder. Was liegen bleibt, kann im Frühling zu einer neuen Pflanze werden. Eichhörnchen finden ihr Futter selbst im Wald, wir müssen sie nicht füttern.',
      '7-10':
        'Eichhörnchen halten keinen echten Winterschlaf. Ihre Körpertemperatur bleibt hoch, deshalb brauchen sie auch im Winter Nahrung. Statt zu schlafen, ruhen sie lange in ihrem gut isolierten Kobel und verlassen ihn oft nur für kurze Zeit, um Futter zu suchen. Im Herbst legen sie Vorräte in vielen kleinen Verstecken im Boden an, auf viele Stellen verteilt, so geht nicht alles verloren, wenn ein Versteck von einem anderen Tier entdeckt wird. Beim Wiederfinden hilft ihnen unter anderem der Geruchssinn, doch nicht jedes Versteck wird gefunden. Aus vergessenen Nüssen und Samen können neue Pflanzen wachsen. Zum Nachdenken: Warum könnte es günstiger sein, Vorräte an vielen Stellen statt an einer einzigen zu verstecken?',
    },
  },
  {
    id: 'ahorn-flieger',
    title: 'Die kleinen Windflieger des Ahorns',
    motif: 'maple-seed',
    themes: ['growth', 'year'],
    concepts: ['mapleSeed', 'leaf'],
    sources: ['Q3'],
    text: {
      '2-3':
        'Der Ahorn hat Früchte mit zwei Flügeln. Wenn sie vom Baum fallen, drehen sie sich. Sie schweben langsam nach unten. Der Wind kann sie ein Stück weit tragen. So landen die Samen nicht alle direkt unter dem Baum.',
      '4-6':
        'Eine Ahornfrucht ist ein kleiner Flieger. An zwei Nüsschen hängen Flügel. Fällt die Frucht vom Baum, beginnt sie sich zu drehen. Das bremst den Fall, und der Wind kann sie ein Stück weitertragen. Warum ist das nützlich? Direkt unter dem großen Baum ist wenig Licht und wenig Platz. Wenn die Früchte etwas weiter fliegen, haben junge Ahorne bessere Chancen. Wer eine Ahornfrucht fallen sieht, kann ihre Drehung beobachten.',
      '7-10':
        'Die Frucht des Ahorns ist eine geflügelte Spaltfrucht: Zwei Nüsschen mit je einem Flügel hängen zusammen und trennen sich später. Beim Fallen gerät die Frucht in Drehung. Das erzeugt zusätzlichen Auftrieb, der Fall wird langsamer, und der Wind kann die Frucht über einige Strecke tragen. Man kann das mit einem kleinen Hubschrauber vergleichen, aber das ist nur ein Bild. Für den Baum ist es nützlich, wenn seine Samen verteilt landen, denn unter dem Mutterbaum konkurrieren Keimlinge mit ihm um Licht und Wasser. Nicht jede Ahornart sieht gleich aus: Form und Winkel der Flügel unterscheiden sich. Zum Nachdenken: Was würde sich ändern, wenn die Flügel größer oder kleiner wären?',
    },
  },
  {
    id: 'zapfen-spuren',
    title: 'Was ein abgenagter Zapfen verraten kann',
    motif: 'gnawed-cone',
    themes: ['gnawed'],
    concepts: ['cone', 'gnawedCone', 'gnawedNut', 'needleTwig'],
    sources: ['Q5', 'Q6', 'V3'],
    text: {
      '2-3':
        'Manchmal liegt ein Zapfen im Wald, an dem Schuppen fehlen. Dann hat vielleicht ein hungriger Besucher gegessen. Unter den Schuppen liegen Samen. Das ist Futter für kleine Waldtiere. Welches Tier es war, wissen wir nicht.',
      '4-6':
        'Ein Zapfen ist wie ein Vorratsschrank aus Schuppen. Unter jeder Schuppe können Samen liegen. Manche Tiere wissen, dass dort Futter steckt. Sie zupfen oder nagen die Schuppen ab, um an die Samen zu kommen. Danach bleibt vom Zapfen oft nur die Mitte übrig. So kann ein Zapfen erzählen, dass jemand zu Besuch war. Wer es war, können wir meist nur vermuten. Es können zum Beispiel Eichhörnchen oder Mäuse sein. Wir müssen das Tier nicht suchen. Es reicht, die Spur zu entdecken und zu überlegen.',
      '7-10':
        'Ein Zapfen ist ein Samenspeicher, und Tiere nutzen ihn. Nach Lehrmaterial zu Fraßspuren zupft das Eichhörnchen die Schuppen ab, der Zapfen wirkt danach zerzaust, Mäuse nagen sie ab, dann ist die Spindel glatter. Auch Vögel bearbeiten Zapfen. Das sind Anhaltspunkte, kein Beweis: Wetter, Alter und mehrere mögliche Verursacher verwischen das Bild. Wer Fraßspuren deutet, formuliert deshalb eine Vermutung („könnte zu einem Eichhörnchen passen“) und sucht einen zweiten Hinweis, etwa lose Schuppen in der Nähe. Dass der Wald so viele Spuren hinterlässt, zeigt, wie viele Tiere von Samen leben, auch wenn wir sie nie zu Gesicht bekommen. Zum Nachdenken: Welche Hinweise würden eine Vermutung stärker machen?',
    },
  },
  {
    id: 'totholz',
    title: 'Wenn ein Baum stirbt, beginnt neues Leben',
    motif: 'bracket-fungus',
    themes: ['decay'],
    concepts: ['bracketFungus', 'leafSkeleton', 'mushroom', 'lichen'],
    sources: ['Q1', 'V4'],
    text: {
      '2-3':
        'Ein alter Baum ist umgefallen oder abgestorben. Für uns sieht er vielleicht kaputt aus. Für viele kleine Tiere ist er ein Zuhause und ein Futterplatz. Käfer, Pilze und Moose leben im und am Holz. So geht im Wald nichts verloren.',
      '4-6':
        'Wenn ein Baum abstirbt, ist das nicht das Ende. Totes Holz ist ein Lebensraum. Käfer bohren Gänge hinein, Pilze wachsen im Holz, Moose und Flechten siedeln sich an. Später ziehen Vögel in Baumhöhlen ein. Das Holz wird nach und nach weich und zerfällt. So werden die Stoffe aus dem Baum wieder frei und können neuen Pflanzen nützen. Wir schauen nur von außen zu, denn im Holz wohnen viele Tiere, die wir nicht stören wollen.',
      '7-10':
        'Abgestorbenes Holz, in der Fachsprache Totholz, gehört zu den artenreichsten Lebensräumen im Wald. Viele Käferarten, Pilze, Moose, Flechten und andere Lebewesen sind darauf angewiesen, als Nahrung oder als Wohnort. Oft beginnen bestimmte Käfer und Pilze am festen Holz, später folgen weitere Arten, bis zuletzt nur noch Mulm und Humus bleiben. Im Totholz stecken Nährstoffe, die so allmählich in den Boden zurückkehren. Wie lange das dauert, hängt von Baumart, Dicke, Feuchtigkeit und Lage ab. Auch Vögel und andere Tiere finden in alten Stämmen Höhlen und Verstecke. Wer Totholz im Wald liegen lässt, lässt also Lebensraum liegen. Zum Nachdenken: Welche Anzeichen von Leben könntet ihr an einem alten Stamm von außen entdecken, ohne etwas zu verändern?',
    },
  },
  {
    id: 'moos-speicher',
    title: 'Das Moos als kleiner Wasserspeicher',
    motif: 'moss',
    themes: ['water'],
    concepts: ['moss', 'fern', 'lichen'],
    sources: ['Q7', 'Q11'],
    text: {
      '2-3':
        'Moos ist ein kleiner Wasserspeicher. Wenn es regnet, saugt es sich voll. Danach gibt es das Wasser langsam wieder ab. Das hilft kleinen Tieren und Pflanzen in der Nähe. Ein Moospolster ist ein bisschen wie ein weicher grüner Schwamm.',
      '4-6':
        'Moos hat keine richtigen Wurzeln. Es nimmt Wasser mit seinen winzigen Blättchen auf, ungefähr so, wie ein Schwamm Wasser aufsaugt. Das ist nur ein Vergleich, aber er passt gut. In einem dichten Polster bleibt das Wasser eine Weile hängen und tropft nur langsam wieder heraus. Zwischen den Pflänzchen leben viele winzige Tiere. Manche Moose werden bei Trockenheit braun und schlafen nur, bis es wieder regnet. Nicht jedes Moos ist immer nass, und es zeigt auch nicht verlässlich nach Norden.',
      '7-10':
        'Moose sind kleine Landpflanzen ohne echte Wurzeln. Viele nehmen Wasser und gelöste Stoffe großenteils über ihre Oberfläche auf. In einem dichten Polster bleibt Wasser durch feine Hohlräume zwischen den Pflänzchen hängen und wird nur langsam wieder abgegeben, bei manchen Arten kann ein Polster ein Mehrfaches seines trockenen Gewichts an Wasser aufnehmen. So trägt Moos zur Wasserbilanz am Waldboden bei. Es gibt in Mitteleuropa aber viele Moosarten mit sehr unterschiedlichen Ansprüchen, und manche überstehen Trockenheit in einer Art Ruhezustand. Deshalb ist die Vorstellung vom Moos als ständig feuchtem Schwamm zu einfach. Zum Nachdenken: Wo in eurer Umgebung wächst das dickste Moos, und was haben diese Stellen gemeinsam?',
    },
  },
  {
    id: 'flechte-team',
    title: 'Eine Flechte ist ein Team',
    motif: 'lichen',
    themes: ['water', 'pattern'],
    concepts: ['lichen', 'moss', 'bracketFungus'],
    sources: ['Q8'],
    text: {
      '2-3':
        'Eine Flechte ist ein Team aus zwei Lebewesen. Ein Pilz und eine winzige Alge leben zusammen. Die Alge macht aus Licht Nahrung. Der Pilz gibt Halt und Schutz. Eine Flechte ist kein Moos.',
      '4-6':
        'Eine Flechte sieht aus wie ein einziges Lebewesen, aber sie besteht aus zweien: einem Pilz und einer winzigen Alge. Sie leben zusammen wie ein Team. Der Pilz gibt Halt und Schutz, die Alge macht mit Licht Nahrung. Gemeinsam schaffen sie es, auf Rinde, Ästen und sogar auf Stein zu wachsen. Das tun sie sehr langsam. Eine Flechte ist also weder ein Moos noch eine gewöhnliche Pflanze. Wir lassen sie an ihrem Platz, denn sie wächst nur sehr langsam nach.',
      '7-10':
        'Eine Flechte ist eine Lebensgemeinschaft, eine Symbiose: Ein Pilz bildet den Körper, ein Partner aus Algen oder Cyanobakterien betreibt Photosynthese und liefert Nahrung. Ohne den Partner könnte der Pilz in dieser Form kaum leben, und der Partner allein könnte viele Orte nicht besiedeln. Deshalb wachsen Flechten auf Rinde, Holz und Stein. Man unterscheidet Krusten-, Blatt- und Strauchflechten nach ihrer Form: Krusten kleben fest am Untergrund, Blattflechten sind gelappt, Strauchflechten wachsen wie winzige Büsche. Auf welchem Untergrund eine Flechte lebt, hängt von der Art ab. Viele wachsen nur Millimeter im Jahr, und manche Arten reagieren empfindlich auf die Luftqualität. Flechten sind keine Moose, und sie zeigen nicht verlässlich eine Himmelsrichtung. Zum Nachdenken: Welche Vorteile hat jeder Partner von der Gemeinschaft?',
    },
  },
  {
    id: 'farn-sporen',
    title: 'Farne brauchen keine Blüten',
    motif: 'fern-spores',
    themes: ['water', 'pattern'],
    concepts: ['fern', 'moss'],
    sources: ['Q9', 'V5'],
    text: {
      '2-3':
        'Farne haben keine Blüten und keine Samen. Sie machen winzige Körnchen, die man Sporen nennt. Der Wind verteilt sie. Wenn eine Spore einen feuchten Platz findet, kann daraus ein neuer Farn werden.',
      '4-6':
        'Eine Blume bildet Blüten und daraus Samen. Ein Farn macht es ganz anders. Auf der Unterseite mancher Farnblätter sitzen kleine Gruppen von Sporenbehältern. Sie sehen aus wie winzige Pünktchen. Wenn die Sporen reif sind, öffnen sich die Behälter, und der Wind trägt die Sporen fort. Aus einer Spore wächst zuerst nur ein ganz kleines Pflänzchen. Erst danach wächst daraus ein Farn mit großen Blättern. Das klappt am besten an feuchten Stellen. Nicht jedes Farnblatt zeigt Sporen, ihr müsst nicht danach suchen.',
      '7-10':
        'Farne sind Sporenpflanzen: Statt Blüten und Samen bilden sie Sporen, die in kleinen Behältern auf der Blattunterseite reifen, oft in Gruppen, die Sori heißen. Der Wind verteilt die Sporen. Aus einer Spore wächst ein winziges, flaches Pflänzchen, der Vorkeim. Erst nach dessen Befruchtung, für die Feuchtigkeit nötig ist, entsteht der Farn, den wir kennen. Das erklärt, warum viele Farne an schattigen, feuchten Stellen wachsen. Sporen sind viel kleiner als Samen und haben keinen Nährstoffvorrat dabei, sie müssen deshalb schnell einen geeigneten feuchten Platz finden. Das gelingt nur wenigen, darum bilden Farne sehr viele davon. Nicht jeder Wedel trägt Sori, und ihre Anordnung kann helfen, die Art zu erkennen. Farne gehören zu den ältesten Pflanzengruppen an Land. Zum Nachdenken: Warum ist Feuchtigkeit für diese Art der Vermehrung so wichtig?',
    },
  },
  {
    id: 'humus',
    title: 'Wie aus altem Laub neuer Waldboden wird',
    motif: 'leaf-skeleton',
    themes: ['decay'],
    concepts: ['leafSkeleton', 'leaf', 'needleTwig', 'mushroom'],
    sources: ['Q10', 'Q11'],
    text: {
      '2-3':
        'Im Herbst fallen Blätter vom Baum. Sie bleiben nicht für immer liegen. Kleine Tiere und Pilze fressen und zersetzen sie. Dabei wird dunkle, krümelige Erde. In dieser Erde können neue Pflanzen wachsen.',
      '4-6':
        'Jedes Jahr fallen Blätter und Nadeln auf den Waldboden. Dort bleiben sie nicht lange ganz. Pilze, Bakterien und viele kleine Bodentiere zersetzen sie Stück für Stück. Zuerst bleiben Blattskelette übrig, später nur dunkle, krümelige Erde, der Humus. Humus hält Wasser und Nährstoffe fest, und Wurzeln können davon aufnehmen. So wird aus altem Laub wieder Waldboden, in dem neue Pflanzen wachsen können. Im Wald wird also viel wieder verwendet.',
      '7-10':
        'Laub, Nadeln, abgestorbene Wurzeln und anderes Pflanzenmaterial bilden am Waldboden die Streuschicht. Pilze, Bakterien und Bodentiere zersetzen sie, ein Teil des Materials wird dabei zu Humus umgebaut. Organische Substanz verbessert die Bodenstruktur, hält Nährstoffe und kann Wasser speichern. Regenwürmer, Asseln, Springschwänze und Pilze arbeiten dabei wie in einer Kette: Jedes Lebewesen verwertet, was das vorige übrig lässt. So kehren Nährstoffe in den Boden zurück, aus dem Bäume sie wieder aufnehmen. Der Boden besteht aber nicht nur aus Humus, sondern auch aus Mineralien, Wasser, Luft und Lebewesen. Wie schnell der Abbau geht, hängt von Baumart, Feuchtigkeit und Temperatur ab: Eichen- und Buchenlaub zerfällt anders als Nadeln. Zum Nachdenken: Was würde im Wald geschehen, wenn Laub nie zersetzt würde?',
    },
  },
  {
    id: 'herbstfarben',
    title: 'Warum manche Blätter im Herbst bunt werden',
    motif: 'maple-leaf',
    themes: ['year'],
    concepts: ['leaf', 'mapleSeed'],
    sources: ['V6'],
    text: {
      '2-3':
        'Im Sommer sind die Blätter grün. Im Herbst geht das Grün langsam weg. Dann sieht man Gelb und Orange. Manche Blätter werden auch rot. Danach fallen sie vom Baum.',
      '4-6':
        'Im Sommer macht das grüne Blattgrün aus Licht Nahrung für den Baum. Im Herbst baut der Baum das Blattgrün ab und holt wertvolle Stoffe aus dem Blatt zurück. Wenn das Grün verschwindet, kommen gelbe und orange Farben zum Vorschein, die schon vorher im Blatt waren. Rot entsteht neu im Herbst, bei manchen Bäumen mehr, bei anderen kaum. Am Stielansatz bildet sich eine dünne Trennschicht, und das Blatt fällt ab. So verliert der Baum im Winter weniger Wasser.',
      '7-10':
        'Die grüne Farbe kommt vom Chlorophyll. Im Herbst wird es abgebaut, und der Baum zieht Nährstoffe wie Stickstoff in Zweige und Stamm zurück. Gelbe und orange Carotinoide waren schon im Blatt und werden nun sichtbar. Rote Anthocyane werden im Herbst neu gebildet. Kühle Nächte und sonnige Tage begünstigen eine kräftige Färbung, deshalb sehen die Herbstfarben jedes Jahr etwas anders aus. Zuletzt entsteht am Stielansatz ein Trenngewebe, das Blatt fällt, und der Baum verliert im Winter weniger Wasser. Wozu die roten Farbstoffe dienen, ist unter Fachleuten nicht in jedem Detail geklärt. Zum Nachdenken: Warum könnte es nützlich sein, Stoffe aus dem Blatt zurückzuholen, bevor es fällt?',
    },
  },
  {
    id: 'knospen-paket',
    title: 'Das Paket für den Frühling',
    motif: 'beech-bud',
    themes: ['growth', 'year'],
    concepts: ['beechBud', 'leaf', 'needleTwig'],
    sources: ['Q2', 'V7'],
    text: {
      '2-3':
        'Schon im Herbst hat ein Baum seine Knospen. In jeder Knospe sind kleine Blätter ganz fest eingepackt. Im Winter ruhen sie. Wenn es im Frühling warm wird, öffnen sich die Knospen. Dann kommen die grünen Blätter heraus.',
      '4-6':
        'Eine Knospe ist wie ein kleines Paket. Schon im Sommer und Herbst legt der Baum sie an. Innen liegen winzige Blätter, fest gefaltet. Außen schützen viele feste Schuppen vor Kälte und Austrocknung. Den Winter über ruht alles. Wenn es im Frühling wärmer wird und die Tage länger werden, öffnet sich die Knospe, und die Blätter entfalten sich. So kann der Baum im Frühling schnell loslegen. Das Paket war die ganze Zeit schon fertig.',
      '7-10':
        'Bäume legen ihre Knospen schon im Jahr vorher an. Zuerst entstehen Knospenschuppen, die später die Hülle bilden, danach die Anlagen der Blätter, die im Winter gefaltet in der Knospe überdauern. Die Schuppen schützen vor Kälte und Austrocknung. Wärme und länger werdende Tage lösen im Frühjahr den Austrieb aus, und die vorbereiteten Blätter können sich in kurzer Zeit entfalten. Die Rotbuche hat lange, schlanke, spitze Knospen, die Hainbuche kürzere. Ein Teil der Entwicklung des Frühlings hat also schon im vorigen Sommer stattgefunden. Im Winter, wenn keine Blätter stören, sieht man die Knospen besonders gut, und an ihrer Form lassen sich manche Baumarten erkennen. Auch das ist nur eine Hilfe und keine Garantie. Zum Nachdenken: Was wäre für den Baum nachteilig, wenn er seine Blätter erst im Frühling anlegen würde?',
    },
  },
  {
    id: 'pilz-geflecht',
    title: 'Der Pilz unter der Erde',
    motif: 'mushroom',
    themes: ['water', 'decay'],
    concepts: ['mushroom', 'bracketFungus', 'rottingWood'],
    sources: ['Q1', 'V8'],
    text: {
      '2-3':
        'Ein Pilz im Wald ist mehr, als man sieht. Den Hut und den Stiel sehen wir. Der größte Teil ist ein Geflecht aus feinen Fäden. Es steckt unter der Erde oder im Holz. Pilze sind keine Pflanzen und keine Tiere.',
      '4-6':
        'Wenn du einen Pilz siehst, siehst du nur einen kleinen Teil. Das ist der Fruchtkörper, er macht Sporen zum Vermehren. Der größte Teil des Pilzes ist ein Geflecht aus ganz feinen Fäden, das Myzel. Es wächst im Boden oder im Holz und kann viel größer sein als der Pilz, den wir sehen. Pilze sind weder Pflanzen noch Tiere, sie sind ein eigenes Reich. Viele helfen, Laub und Holz abzubauen, und machen daraus wieder Nahrung für neue Pflanzen. Der Fruchtkörper wächst nur eine Zeit lang, vor allem wenn es feucht ist.',
      '7-10':
        'Der Fruchtkörper, den wir als Pilz kennen, ist vergleichbar mit einer Frucht: Er bildet Sporen und dient der Vermehrung. Der eigentliche Pilz ist das Myzel, ein Geflecht feiner Zellfäden, das im Boden oder im Holz lebt und sehr ausgedehnt sein kann. Es entzieht seiner Umgebung Nährstoffe: Manche Pilze zersetzen totes Pflanzenmaterial, andere leben in Partnerschaft mit Baumwurzeln. Welche Lebensweise ein bestimmter Pilz hat, lässt sich nur mit genauer Bestimmung sagen. Fruchtkörper entstehen bei passender Witterung, daher sieht man sie nicht immer. Ob ein Pilz giftig ist, erkennt man nie an einem Bild, deshalb bleiben Pilze reine Beobachtungsmotive. Zum Nachdenken: Warum ist der unsichtbare Teil des Pilzes für den Wald so wichtig?',
    },
  },
];

export const giftsById: Record<string, Gift> = Object.fromEntries(gifts.map((g) => [g.id, g]));

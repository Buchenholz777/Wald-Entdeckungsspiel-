# Waldkatalog (Katalogstand 4.0.0)

Entdeckerzeit kennt nur den Wald. Dieses Dokument beschreibt Zuschnitt, Auswahl, Prüfstand und Grenzen. Texte stehen vollständig in `OBJEKTINFOS.md` und `WALDGESCHENKE.md`, Zahlen in `KATALOGABDECKUNG.md` und `ZIEHVERTEILUNG.md`.

## Was jetzt gesucht wird

Jede Aufgabe nennt einen begrenzten, erkennbaren Gegenstand oder eine markante Spur:

| Gruppe | Aufgaben |
|---|---|
| Früchte, Samen, Hüllen | Eichel mit Hütchen · einzelnes Eichelhütchen · braune Buchecker mit drei Kanten · Hülle, die sich in vier Teile geöffnet hat · Haselnuss · Rosskastanie und ihre Hülle (nur mit bestätigter Art) · Ahornfrucht mit zwei Flügeln |
| Zapfen und Nadeln | Zapfen mit vielen Schuppen · Zapfen, an dem viele Schuppen fehlen · länglicher und rundlicherer Zapfen (Vergleich) · kleiner Zweig, an dem noch Nadeln sitzen |
| Knospen und Blätter | lange spitze Buchenknospe · gefallenes Eichenblatt · Blatt mit Handform (Ahorn) · Blatt mit Loch · Blattskelett · helle Spur einer Blattmine · kleine runde Galle |
| Moose, Farne, Flechten, Pilze | Moospolster wie ein kleines Kissen · Farnblatt mit vielen Seitenblättern · Sporengruppen am Farn · Flechte mit kleinen Lappen · Pilz, der seitlich am Holz wächst · Pilz mit Hut und Stiel |
| Spuren, Zusatz | Nussschale mit Öffnung · Tierabdruck im weichen Boden (Reh/Hund ab 7 Jahren als „könnte passen“) · Spinnennetz (freiwillige Zusatzbeobachtung) |

**Ausgemustert** (nie gezogen, für alte Runden erhalten): alle Vorlagen ohne Waldbezug, Baumrinde und Rindenvergleich, Wurzel, Baumstumpf, Jahresringe, Y-Zweig, Holzmaserung, zerfallendes Holz, Keimling, allgemeine Blattaufträge nach Farbe, Größe, Rand oder Adern, Schnee, Pfütze und Schatten. Gefallene Knospenschuppen und ein Insekten-Fraßmuster am offenen Holz wurden bewusst **nicht** aufgenommen (Prüfung und passendes Bild stehen aus).

## Auswahl

- Harte Grenzen: Alter, Jahreszeit und nur dort Kontext, wo ohne die Art nichts zu finden ist (Rosskastanie, Ahorn, Eichenblatt und Galle, Farn, weicher Boden). Baumartenangaben für Eiche, Buche, Hasel und Nadelbäume sind **freiwillig** und machen die passenden Funde dreimal so wahrscheinlich.
- Ohne Zusatzangaben bietet jede Kombination aus Jahreszeit und Alter mindestens 4 (2–3) bzw. 9 (4–10) verschiedene Funde. Ist der Pool klein, wird die Mission ehrlich kürzer.
- Verwandte Motive werden nie zugleich gezogen (Eichel/Eichelhütchen, ganzer/abgenagter/vergleichender Zapfen, Buchecker/Hülle, Haselnuss/Nussschale).
- Höchstens zwei Vergleichsaufgaben (bei fünf Aufgaben), Früchte und Spuren höchstens zweimal je Mission.
- Leitmotive (Wie aus Kleinem ein Baum wird · Wer hat hier geknabbert? · Das kleine Wald-Wasserwunder · Aus Alt wird Neues · Muster, die Geschichten erzählen · Der Wald im Jahreslauf) geben den Missionstitel, aber nur, wenn mindestens die Hälfte der gezogenen Aufgaben dazu passt. Sonst heißt die Mission „Waldgeheimnisse entdecken“.
- Im Winter keine grünen Farne, kein frisches Grün, keine frischen Herbstfrüchte; Winterkandidaten sind Zapfen, Nadelzweige, Knospen, alte Hüllen, Eichelhütchen, Flechten, Baumpilze, Blattskelette.

## Rücksicht im Wald

Alle Hinweise bleiben auf dem Weg. Nichts wird gesammelt, gegessen, abgerissen, abgekratzt oder aufgebrochen. Keine Stämme werden umgedreht, keine Nester oder Tierbauten gesucht. Pilze sind reine Beobachtungsmotive. Fraßspuren und Abdrücke werden immer als Vermutung formuliert („könnte … passen“), und kein Text behauptet, ein Tier sei gesehen worden. Tests prüfen diese Formulierungen.

## Quellenstand

Die Quellen der Vorgabe wurden **nicht vollständig im Volltext gelesen**. Das Quellenverzeichnis `src/catalog/giftSources.ts` (dokumentiert in `WALDGESCHENKE.md`) führt für jede Quelle, ob sie gelesen, nur über Websuche gestützt oder nicht gelesen wurde. Über Websuche bestätigt sind unter anderem: Eichelhäher vergräbt Vorräte und findet nicht alle wieder; Eichhörnchen halten Winterruhe im Kobel mit Vorräten an vielen Stellen; Buchenhülle meist vierlappig mit meist zwei Nüsschen; Haselnuss-Fraßspuren (NABU/ANL); Zapfenfraß von Eichhörnchen und Mäusen (Unterrichtsmaterial); Farn-Sporengruppen an der Blattunterseite; Flechte als Pilz-Alge-Gemeinschaft; Pilze als Zersetzer, Fruchtkörper und Myzel; Herbstfärbung und Laubfall. **Buchenspezifische Angaben zur Knospenform und zum Zeitpunkt der Blattanlage** sind nur allgemein belegt und deshalb allgemein formuliert. Ein Fachlektorat steht aus.

## Prüfstand und Grenzen

- Bestanden: `npm test` (Katalog, Generator mit festen Seeds, Leitmotive, Abschlussprüfung und Geschenkvergabe in allen Zuständen, Speicherung, Hintergrund, Kontrast), Produktionsbuild, Layout bei 320/360/390/430 px und Desktop ohne seitlichen Überlauf, Ablauf im Browser: Mission → Konfetti → Geschenk → Neuladen → Fundsammlung → Rückgängig → erneut finden → Hauptmenü → „Unsere Waldgeheimnisse“.
- **Offline mit gestopptem Server:** nicht geprüft. Der eingebettete Browser lässt keinen Service Worker zu, und die Chrome-Erweiterung war nicht verbunden. Geprüft wurde nur, dass alle Dateien der Offline-Liste (Hintergrund, Skripte, Schriften) im Build vorhanden sind. Geschenke, Konfetti und Texte liegen im Skriptbündel.
- Keine Tests auf echten Geräten, keine Prüfung mit Kindern, keine Screenreader-Tests.
- Die Zeichnungen sind eigene SVG-Illustrationen („So kann es aussehen“), keine Fotos, und nicht von Fachleuten auf Erkennbarkeit geprüft. Buchenhülle, abgenagter Zapfen, Blattskelett und Flechte sind Annäherungen.
- Der Hintergrund ist ein Stimmungsbild (Herbstlaub am Weg), für alle Jahreszeiten gleich, und keine Aussage über den aktuellen Wald.

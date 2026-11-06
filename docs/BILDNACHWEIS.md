# Bildnachweis

## Hintergrund „Lichter Waldweg“ (eigene Illustration)

Der Hintergrund ist eine **eigene Illustration** dieses Projekts, kein Foto und kein Fremdmaterial: ein lichtdurchfluteter Waldweg mit freundlichen Baumgruppen, einer kleinen Lichtung und wenigen Details am Rand (Farn, Gras, Blumen, kleine Pilze, bunte Blätter, eine Eichel). Er ist ein Stimmungsbild, keine Ansicht eines echten Waldes, mit einer kleinen suchenden Familie (siehe unten), ohne Tiere und Schrift.

| Angabe | Wert |
|---|---|
| Erzeugung | `scripts/make-forest-background.mjs` zeichnet die Szene als SVG (deterministisch, fester Zufallswert) und rendert sie mit `sharp` zu WebP und JPEG |
| Aufruf | `npm run images:forest` |
| Rechte | eigene Erstellung im Rahmen dieses Projekts, keine Fremdbilder, keine Lizenzpflichten |
| Frühere Fassung | Bis Katalogstand 3.0.0 war ein CC0-Waldfoto (Angela Huster, Wikimedia Commons) eingebunden. Es wurde wegen der zu dokumentarischen, dunklen Wirkung ersetzt und aus Projekt und Auslieferung entfernt. |

### Ausgelieferte Dateien (`src/assets/forest/`)

| Datei | Größe | Verwendung |
|---|---|---|
| `wald-breit-1600.webp` / `.jpg` | 1600 × 1000 | Bildschirme ab 700 px Breite |
| `wald-schmal-720.webp` / `.jpg` | 720 × 900 | schmale Bildschirme (Hochformat) |

WebP wird bevorzugt, JPEG ist der Rückfall (`<picture>`). Die Dateien werden mit Hash-Namen gebaut und stehen im Offline-Cache. Es gibt keinen Fremdzugriff. Fällt das Bild aus, bleibt die ruhige Grundfläche `--forest-fallback`. Keine Animation, kein Parallax, kein Video.

## Familie im Waldhintergrund (eigene Zeichnung)

In der **feststehenden Waldillustration** (siehe oben) sucht eine **eigens gezeichnete, fiktive Familie** gerade selbst im Wald: ein schlanker Vater (braune Haare mit Undercut und längerem Deckhaar, voller gepflegter Bart, blaugrüne Augen, salbeigrüne Overshirt-Jacke, ein Handy in der Hand), eine **schwangere** Mutter (lange braune Haare, braune Augen, terrakottafarbene Jacke über cremefarbenem Oberteil, das sich über den runden Bauch spannt, eine Hand auf dem Bauch) und ein kleiner Junge von etwa zwei bis zweieinhalb Jahren (Kleinkindproportionen mit großem, rundem Kopf und kurzen Beinen, dunkelblonder Undercut, blaue Augen, ockergelbe Jacke, dunkelblaue Hose). Alle drei schauen suchend nach unten, einer zeigt auf den Boden. Es sind nur diese drei Personen; kein Foto, keine Schrift, und die Zeichnung stellt keine reale Familie dar.

Sie gehört **nicht** zur Bedienoberfläche, sondern ist Teil des Hintergrundbildes: klein, von Gras und Farn teilweise verdeckt, nicht vor den Inhalten. Man findet sie, wenn man genau hinsieht oder scrollt und die Karten den Blick darauf freigeben. Am Desktop steht sie rechts auf der Lichtung neben der Inhaltsspalte, auf dem Telefon mitten auf dem Weg. Während einer Suche, in Spiel und Hilfe, ist der Hintergrund stark zurückgenommen, die Familie also kaum zu sehen.

| Angabe | Wert |
|---|---|
| Erzeugung | `scripts/family-figures.mjs` (Figuren als SVG-Code) wird von `scripts/make-forest-background.mjs` in die Szene gesetzt; der Rest des Bildes ist unverändert (eigener Zufallsstrom) |
| Aufruf | `npm run images:forest` |
| Rechte | eigene Erstellung im Rahmen dieses Projekts, keine Fremdbilder, keine Lizenzpflichten |
| Dateien | dieselben wie der Hintergrund (`src/assets/forest/`), kein zusätzliches Bild, nichts Neues im Offline-Paket |
| Grenzen | Stilisierte Flachillustration in kleiner Größe; Gesichter bewusst nur klein und teilweise verdeckt. Wirkung nur am Bildschirmfenster beurteilt, nicht mit Familien. |

Das Altersfenster von Wald Escape (ab 4 Jahren) ändert das abgebildete Kleinkind nicht.
## Gegenstandsbilder

Alle 30 Suchmotive (Eichel, Eichelhütchen, Buchecker, Hülle, Nussschale, Zapfen, Nadelzweig, Knospe, Blätter, Moos, Farn, Flechte, Pilze, Spuren …) sind **eigene naturgetreue Zeichnungen aus Code** (SVG mit Verläufen und Lichtfiltern), erstellt für dieses Projekt:

| Angabe | Wert |
|---|---|
| Quellen | `src/illustrations/real-kit.tsx` (Baukasten), `real-frucht.tsx`, `real-blatt.tsx`, `real-boden.tsx`; Filter und Untergründe in `kit.tsx` |
| Vorlagen | keine fremden Bilder, Fotos oder Vektorvorlagen; die Formen entstehen aus Formeln und festen Zufallswerten |
| Rechte | eigene Erstellung, keine Lizenzpflichten, keine Wasserzeichen, keine Hotlinks, kein Bilderzeugungs-Dienst zur Laufzeit |
| Auslieferung | Die Bilder stecken im JavaScript-Paket und stehen damit im Offline-Cache (kein einzelner Bildfund kann fehlen); sie sind beliebig scharf skalierbar (auch in der Vergrößerung) |
| Frühere Fassung | die Bilderbuch-Zeichnungen in `forest.tsx` u. a. bleiben nur für ausgemusterte Vorlagen alter Runden im Code; für die 30 aktiven Motive werden sie überschrieben |

Die Bilder sind ein **Beispiel** („So kann es aussehen“), keine Bestimmungsabbildung und keine Prüfung des Fundes. Welche Art das Beispiel zeigt und welche Grenzen es gibt, steht je Motiv in `docs/BILDBEWERTUNG.md`. Vergleich mit der früheren Fassung: `docs/vergleich/`.

## Spieloberfläche von Wald Escape

Sanduhr, Waldtresor mit drei Schloss-Zuständen und die acht Symbolschlüssel (Blatt, Zapfen, Eichel, Stern, Pilz, Sonne, Mond, Tropfen) sind eigene, freundlich stilisierte SVG-Zeichnungen aus Code (`src/ui/escape/EscapeArt.tsx`), keine Fremdbilder, keine Dateien zum Nachladen, keine Lizenzpflichten. Sie sind Spieloberfläche, keine naturkundlichen Suchbilder; die Suchkarten zeigen weiter die naturgetreuen Gegenstandsbilder.

## Geschenkbilder

Die Waldgeschenke verwenden die vorhandenen eigenen Suchmotive als kleines Bild (siehe `docs/WALDGESCHENKE.md`). Es gibt kein Fremdmaterial.

## Schriften

Fredoka und Nunito über `@fontsource-variable` (SIL Open Font License), lokal gebündelt.

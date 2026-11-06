# Bildnachweis

## Hintergrund „Lichter Waldweg“ (eigene Illustration)

Der Hintergrund ist eine **eigene Illustration** dieses Projekts, kein Foto und kein Fremdmaterial: ein lichtdurchfluteter Waldweg mit freundlichen Baumgruppen, einer kleinen Lichtung und wenigen Details am Rand (Farn, Gras, Blumen, kleine Pilze, bunte Blätter, eine Eichel). Er ist ein Stimmungsbild, keine Ansicht eines echten Waldes, ohne Figuren, Tiere, Gesichter und Schrift.

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

## Familien-Illustration im Hauptmenü (eigene Zeichnung)

Im Kopfbereich des Hauptmenüs steht eine **eigens gezeichnete, fiktive Familie** auf einem sicheren, sonnigen Waldweg: ein schlanker Vater (braune Haare mit Undercut und längerem Deckhaar, voller gepflegter Bart, blaugrüne Augen, salbeigrüne Overshirt-Jacke), eine Mutter (lange braune Haare, braune Augen, terrakottafarbene Jacke über cremefarbenem Oberteil) und ein kleiner Junge von etwa zwei bis zweieinhalb Jahren (Kleinkindproportionen mit großem, rundem Kopf und kurzen Beinen, dunkelblonder Undercut, blaue Augen, ockergelbe Jacke, dunkelblaue Hose, grüne Stiefel). Sie zeigen gemeinsam auf ein Moospolster und einen Zapfen am Boden. Es sind nur diese drei Personen, kein Foto, keine KI-Gesichter nach realen Vorbildern, keine Schrift im Bild; die Zeichnung ist eine eigenständige Gestaltung und stellt keine reale Familie dar.

| Angabe | Wert |
|---|---|
| Erzeugung | `scripts/make-family.mjs` zeichnet Figuren und Szene als SVG (reiner Code, deterministisch) und rendert sie mit `sharp` zu WebP und JPEG; die Quell-SVGs liegen daneben |
| Aufruf | `npm run images:family` |
| Rechte | eigene Erstellung im Rahmen dieses Projekts, keine Fremdbilder, keine Lizenzpflichten |
| Verwendung | nur im Hauptmenü, in `src/ui/FamilyHero.tsx`; im Spiel (auch während einer Suche) gibt es das Bild nicht, dort bleibt der ruhige Waldhintergrund unverändert |
| Zuschnitte | `familie-breit-1000` (1000 × 560, Tablet und Desktop, Figuren in der Mitte, Wortmarke, Überschrift und Moduswahl bleiben frei) und `familie-schmal-720` (720 × 600, eigener Ausschnitt für Smartphones bis 600 px Breite, Gesichter in brauchbarer mittlerer Größe) |
| Einbindung | `<picture>` mit WebP und JPEG-Rückfall, feste Maße (kein Layoutsprung), Waldgrün als Rückfallfläche, Hash-Namen im Offline-Cache (geprüft: alle vier Dateien im Service-Worker-Cache, Seite lädt bei gestopptem Server mit Familienbild) |
| Bildbeschreibung | „Gezeichnete Familie auf einem sonnigen Waldweg: Vater, kleiner Sohn und Mutter zeigen gemeinsam auf ein Moospolster und einen Zapfen am Boden.“ |
| Grenzen | Stilisierte Flachillustration; die Zeigehände haben eine natürliche Armlänge und berühren die Funde nicht. Wirkung der Gesichter nur am Bildschirmfenster beurteilt, nicht mit Familien. |

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

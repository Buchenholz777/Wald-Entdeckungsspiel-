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

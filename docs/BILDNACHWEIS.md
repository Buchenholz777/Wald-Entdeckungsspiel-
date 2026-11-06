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

Alle Suchmotive (Eichel, Eichelhütchen, Buchecker, Hülle, Nussschale, Zapfen, Nadelzweig, Knospe, Blätter, Moos, Farn, Flechte, Pilze, Spuren …) sind eigene SVG-Zeichnungen aus diesem Projekt (`src/illustrations/`), ohne fremde Vorlagen oder Fotos. Sie sind naturgetreu gedacht und als „So kann es aussehen“ gekennzeichnet, nicht als Bestimmungsabbildung.

## Geschenkbilder

Die Waldgeschenke verwenden die vorhandenen eigenen Suchmotive als kleines Bild (siehe `docs/WALDGESCHENKE.md`). Es gibt kein Fremdmaterial.

## Schriften

Fredoka und Nunito über `@fontsource-variable` (SIL Open Font License), lokal gebündelt.

# Bildbewertung: Können Kinder damit draußen suchen?

Leitfrage je Motiv: **Kann ein Kind diesen Gegenstand im Wald anhand dieses Bildes wiedererkennen, auch wenn es den Namen noch nicht kennt?**
Geprüft wurden Silhouette und Größenverhältnisse, Farbe, Oberfläche, aufgabenentscheidende Merkmale, Sichtbarkeit des ganzen Objekts, Verwechslungsgefahr und Lesbarkeit auf einem schmalen Bildschirm (Ansicht bei 320 bis 430 Pixeln Breite).

Vergleichsbilder: [`vergleich/_vorher-nachher.jpg`](vergleich/_vorher-nachher.jpg) (alle 30 Motive, links vorher, rechts nachher), [`vergleich/baumpilz-vorher-nachher.jpg`](vergleich/baumpilz-vorher-nachher.jpg) (Baumpilz), Einzelbilder der früheren Fassung in `vergleich/vorher/`. Neu erzeugen mit `npm run images:render`.

## Befund vorher

Alle 30 Motive waren flache Bilderbuch-Zeichnungen mit dicker Kontur, gleichmäßigen Mustern und Pastellfarben. Nichts davon war falsch, aber vieles half beim Vergleichen mit echten Fundstücken wenig: regelmäßige Ringe statt Pilzzonen, ein Kreis mit Zacken statt einer Rosskastanienschale, drei gleiche Pyramiden statt Bucheckern, ein grünes Federbild statt eines Farnwedels, ein einfacher Tierpfotenumriss statt eines vertieften Abdrucks im Boden.

## Neue Bildsprache

Die Gegenstände sind jetzt **naturkundliche Sachillustrationen aus Code** (SVG): unregelmäßige Umrisse aus festen Zufallswerten, mehrschichtige Verläufe, Licht von links oben, Oberflächenrelief (Körnung, Poren, Rindenrisse), weiche Kontaktschatten, echte Aufbauformeln (überlappende Schuppen in Spiralen, Fiederung, Adernbild). Der Hintergrund des Spiels und die Oberfläche bleiben freundlich illustriert. Die Gegenstände stehen auf ruhigem Untergrund (Waldboden, Moosgrün, Rinde, Matsch); bei Detailaufgaben zeigt eine Lupe den vergrößerten Ausschnitt neben dem ganzen Gegenstand (Farn-Sporen, Blattmine).

Gezeichnet wird ausdrücklich ein **Beispiel**. Die Aufgaben suchen allgemein („einen Zapfen“, „einen Pilz“), nicht eine bestimmte Art. Die Karte sagt weiterhin „So kann es aussehen. Euer Fund darf etwas anders sein.“

## Bewertung je Motiv

| Motiv | Beispiel im Bild | Verbessert (Erkennungsmerkmale) | Verwechslung / Grenze |
|---|---|---|---|
| `cone` Zapfen | Fichtenzapfen | echte, dachziegelartig überlappende Schuppen in Spiralen, schlanke Form, Stielansatz, Licht und Schatten | Kiefern- und Tannenzapfen sehen anders aus; `cone-compare` zeigt das |
| `cone-compare` | Fichte (lang, schlank) und Kiefer (kurz, eiförmig, Rautenschilde) | Der Unterschied „länglich“ gegen „rundlich“ ist wirklich sichtbar, beide aus Schuppen | Arten sind nur Beispiele für die beiden Formen |
| `gnawed-cone` | abgenagter Fichtenzapfen | nackte, helle Spindel mit kurzen Stummeln, wenige Schuppen an der Spitze, lose Schuppen am Boden | Wer es war, bleibt offen (Text) |
| `acorn` | Stieleichel | schlanke Nuss mit Längsstreifen, Glanz, Spitze; Becher aus filzigen Schuppen, kurzer Stiel; liegend wie am Boden | Nuss und Becher als zwei verschiedene Strukturen |
| `acorn-cup` | leerer Becher, schräg | runde Öffnung, leeres Inneres, Schuppen, Stiel; daneben eine einzelne Nuss | Becher größer als die Nuss gezeigt |
| `chestnut` | Rosskastanie | glänzendes Mahagoni mit Flammenmuster, heller, matter Fleck | nicht mehr mit der Hülle in einem Bild vermischt |
| `chestnut-husk` | aufgeplatzte Hülle | zwei Klappen mit kurzen grünen Stacheln, samtig-weißliches Innere, Kastanie darin | |
| `hazelnut` | Haselnuss | rundlich-eiförmig, helle matte Ansatzfläche unten, kleine Spitze; daneben die grüne, gezackte, blattartige Hülle | |
| `gnawed-nut` | Haselnussschale | rundes, sauberes Loch mit feinen Nagerillen am Rand, daneben zwei aufgebrochene Hälften | Wer es war, bleibt offen |
| `beechnut` | Buchecker | dreikantig: zwei Flächen und eine Kante, hellerer Ansatz, glatte Schale; nicht rund wie eine Kastanie | |
| `beech-husk` | aufgesprungene Buchenhülle | vier Klappen als Stern, weiche gebogene Stacheln, Innenseite hellbraun, leere Mulde in der Mitte | |
| `maple-seed` | Ahornfrucht | zwei Flügel im V, zwei Nüsschen in der Mitte, feine Längsadern, kräftiger Rand | Flügelwinkel ist je nach Art verschieden (hier etwa 85 Grad) |
| `maple-leaf` | Spitzahorn im Herbst | fünf spitze Lappen mit Zähnen, langer Stiel, gelb bis orange, Aderung vom Stielansatz | andere Ahornarten haben rundere Lappen |
| `oak-leaf` | Stieleiche im Herbst | verkehrt eiförmig, runde Lappen mit Buchten, kurzer Stiel, goldbraun | |
| `leaf-hole` | Rotbuche | gerade Seitenadern, leicht welliger Rand; unregelmäßiges Fraßloch mit braunem Rand, durch das der Boden zu sehen ist | |
| `gall` | Gallen an einem Eichenblatt | runde, glatte, hellbraune Kugeln, die fest am grünen Blatt sitzen | Gallen gibt es in vielen Formen |
| `leaf-mine` | Mine an einem Buchenblatt | helle, geschlängelte, zum Ende breitere Spur mit dunkler Kotlinie; Lupe | Minen anderer Insekten sehen anders aus |
| `leaf-skeleton` | Blattskelett | feines Aderngerüst mit Quervernetzung, nur wenige Gewebereste, Stiel; dunkler Untergrund | |
| `fern-frond` | Wurmfarn-ähnlicher Wedel | doppelt gefiedert, Fiedern kürzer zur Spitze, eingerollte Spitze, Stiel mit Spreuschuppen | |
| `fern-spores` | Wedelunterseite | blasse Unterseite, zwei Reihen brauner Sporenhäufchen je Fiederblättchen, Lupe mit Ausschnitt | |
| `moss` | Polstermoos | viele kleine Triebe in Grüntönen, gewölbtes Polster, einzelne Kapselstielchen | von Flechte und Farn deutlich verschieden |
| `lichen` | Blattflechte auf Rinde | flache, gelappte, hellgrüne Rosetten mit dunklen Fruchtscheibchen, auf Rinde | wächst auch auf Stein; nicht flauschig wie Moos |
| `mushroom` | brauner Hutpilz mit Jungpilz | gewölbter Hut mit Faserzeichnung, Lamellen, heller Stiel | Art nicht bestimmt, nichts über Essbarkeit |
| `bracket-fungus` | fächerförmige Baumpilze (Beispiel: ähnlich der Schmetterlings-Tramete) | halbrunde, dünne Fächer mit hellen und dunklen Bändern, hellem Rand und heller Unterkante, mehrere übereinander am Holz; Holz dunkel und ruhig | Art nicht bestimmt, nichts über Essbarkeit |
| `spider-web` | Radnetz mit Tau | gerade Speichen, feine Spirale, Tautropfen, zwischen Zweigen, dunkler ruhiger Grund | |
| `needle-twig` | Fichtenzweig | Nadeln rundum an braunem Zweig, hellere junge Spitze, Endknospe | Kiefer und Tanne haben andere Nadelstellung |
| `beech-bud` | Buchenzweig | lange, spitze, rotbraune Knospen mit Schuppen, wechselständig am Zweig | |
| `y-twig` | Zweig mit Gabelung | brauner Zweig, der sich in zwei Äste teilt (Y), Knospen an den Spitzen, kleine Korkporen | |
| `leaf-vein-net` | Laubblatt mit Adernetz | helle Mittelader, Seitenadern zum Rand, feine Quervernetzung, Stiel | Aderung nach Rotbuche; andere Blätter sehen anders aus |
| `hornbeam-fruit` | Hainbuchenfrucht | dreilappiges Flügelblatt, mittlerer Lappen am längsten, gesägter Rand, kleines gerilltes Nüsschen in der Mitte | Lappenform und Nüsschen vereinfacht, nicht nach Messwerten |
| `linden-fruit` | Lindenfruchtstand | langes schmales Flügelblatt, Stiel mit dem Blatt verwachsen, mehrere kleine runde graubraune Nüsschen | Zahl der Nüsschen vereinfacht |
| `alder-cone` | Erlenzäpfchen am Zweig | dunkler Zweig mit mehreren kleinen eiförmigen, verholzten Zäpfchen auf kurzen Stielen, Schuppenmuster | Erle ist ein Laubbaum, Zäpfchen sehen nadelbaumähnlich aus |
| `animal-track` | Pfotenspur | vier Zehen, ein Ballen, mehrere Abdrücke hintereinander, vertieft im Matsch mit Lichtkante | allgemein gehalten, keine Artzuordnung |
| `deer-track` | Rehspur | zwei längliche, vorn spitze Hälften, keine Zehen | Zuordnung bleibt eine Vermutung (Aufgabentext) |
| `dog-track` | Hundespur | großer dreilappiger Ballen, vier Zehen, Krallenpunkte | Zuordnung bleibt eine Vermutung (Aufgabentext) |

## Fachliche Hinweise

- Bild, Aufgabe, Beschreibung (`alt`) und Erkennungsmerkmale wurden abgeglichen und angepasst (Kastanie ohne Hülle, Buchecker ohne Hülle, Pilz nicht mehr der rote Fliegenpilz, Flechte auf Rinde, Baumpilz mit mehreren Fächern). Der Test `tests/images.test.ts` sichert die wichtigsten Widersprüche ab.
- Ahornblatt (Spitzahorn) und Ahornfrucht sind bewusst als Beispiele beschrieben. Es wird nicht behauptet, alle Ahornarten sähen so aus.
- Keine Aussage über Essbarkeit oder sichere Artbestimmung. Die Infotexte sagen weiter: nur anschauen.

## Grenzen (ehrlich)

- Die Bilder sind eigene Zeichnungen aus Code, keine Fotos. Sie sind deutlich naturnäher als vorher, ersetzen aber kein Foto und keine Bestimmungsliteratur. Fotos hätten Urheber und Lizenz je Bild gebraucht und lagen nicht vor.
- Die Qualität wurde am Bildschirm in Browser und Rendervorschau beurteilt, nicht von einer Fachperson für Botanik oder Mykologie. Eine solche Durchsicht (besonders Farn, Flechte, Baumpilz, Buchecker) ist empfehlenswert.
- Auf echten Geräten (verschiedene Telefone) wurden die Bilder hier nicht geprüft, nur die Emulation der Breiten 320, 360, 390 und 430 Pixel.

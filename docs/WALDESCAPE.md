# Wald Escape – „Knackt den Waldtresor!“

Dritter Spielmodus von Wald-Spiel: eine gemeinsame Zeitmission mit freier Aufgabenwahl, drei Symbolschlüsseln und einem kleinen Symbolrätsel. Gemeint ist ein freundlicher digitaler Waldtresor, keine Flucht aus dem echten Wald. Alles läuft lokal im Browser (kein Backend, kein Login, kein Standort).

## Die drei Modi

| Modus | Stand in dieser Fassung |
|---|---|
| Waldschätze suchen | unverändert (eigene Regeln, eigener Spielstand) |
| Walddetektive | **nicht vorhanden.** Im Repository gab es nie einen Detektivmodus. Die Kachel steht da, erklärt das ehrlich und führt zu den anderen Modi. Sie startet nichts und wird nicht als funktionsfähig ausgegeben. |
| Wald Escape | neu, vollständig (diese Seite) |

Die Moduswahl steht direkt unter dem Wald-Spiel-Kopf (Optionsfelder, Pfeiltasten, „Gewählt“ als Text). Ein Moduswechsel startet nie etwas und löscht nie einen Spielstand. Standard beim Erstbesuch ist „Waldschätze suchen“.

## Regeln

- **Alter:** ab 4 Jahren mit erwachsener Begleitung (Schwerpunkt 7–10). Das sind Produktentscheidungen, keine Entwicklungsnormen. Bei 2–3 Jahren erklärt die Kachel den Modus und zeigt den Hinweis „Wald Escape ist für Kinder ab 4 Jahren …“; es gibt keine Zeitmission und keine defekte Schaltfläche, aber einen Knopf „Zur Waldschatzsuche wechseln“. Das Alter wird nie heimlich geändert; eine später geänderte Altersauswahl verändert keine gespeicherte Mission.
- **Suchzeit:** 10 („Kurze Zeitmission“), 15 („Unser Waldabenteuer“, Standard) oder 20 Minuten („Mehr Zeit zum Entdecken“). Die Zeiten sind Spielvarianten, ihre Schwierigkeit wurde nicht mit Kindern geprüft.
- **Start:** Die Uhr beginnt erst beim bewussten Tippen auf „Sanduhr starten“. Einstellungen und der erste Aufruf kosten keine Zeit.
- **Karten:** normalerweise fünf Suchkarten, frei wählbar. Drei vollständig erfüllte, verschiedene Karten liefern drei Schlüssel; die anderen bleiben freiwillig. Eine fertige Karte liefert nie einen zweiten Schlüssel.
- **Zeit zählt nur bei der Suche.** Sie steht bei bewusster Pause, im Hauptmenü, bei geöffneter Info, Vergrößerung oder Austauschfrage, im Symbolrätsel und nach Zeitablauf. Ein gesperrtes oder im Hintergrund liegendes Telefon zählt als weiterlaufende Suche (Zeitpunkte, kein Tick); bei einer echten Pause bitte „Pause“ tippen.
- **Dritter Fund:** Ist zu diesem Zeitpunkt noch positive Suchzeit da, ist die Zeitaufgabe geschafft („Suchzeit geschafft“) und die Sanduhr bleibt stehen. Bei exakt null oder später gilt die Zeit als abgelaufen.
- **Symbolrätsel (kein Countdown):** 4–6 Jahre: Die richtige Reihenfolge steht als Streifen daneben und wird nachgebaut. 7–10 Jahre: zwei Hinweise („Die Eichel liegt in der Mitte. Der Zapfen liegt links vom Blatt.“); der Generator prüft alle sechs Reihenfolgen, genau eine erfüllt beide Hinweise, und es werden nur erhaltene Symbole genannt. Falsche Reihenfolge: freundlicher Hinweis, keine Strafe, keine Sperre, die Belegung bleibt. Hilfen: „Tipp“, „Lösungsbeispiel“, „Gemeinsam öffnen“ (kostet nichts, ändert nichts am Zeitergebnis).
- **Zeit abgelaufen:** „Die Sanduhr ist durch – der Tresor wartet auf euch!“ mit den echten Zahlen. „Ohne Zeitdruck weitersuchen“ (dieselben Karten und Funde, keine neue Zeit, nie nachträglich „rechtzeitig“), „Für heute beenden“ (ehrlicher Teilabschluss ohne Geschenk), „Hauptmenü“.
- **Abschluss:** Tresor öffnet sich, einmal Konfetti, ein Waldgeschenk aus der vorhandenen Geschenkbibliothek (`docs/WALDGESCHENKE.md`, gemeinsames „Unsere Waldgeheimnisse“). Rechtzeitig: „Tresor geöffnet! Ihr habt alle drei Schlüssel rechtzeitig gefunden.“ Sonst: „Tresor geöffnet! Gemeinsam habt ihr das Waldgeheimnis entdeckt.“ Gleiche Geschenkqualität. Genau ein Geschenk pro Mission, auch nach Reload, Doppeltippen oder Rückgängig.
- **Austausch („Andere Spur suchen“):** ersetzt nur die offene Karte, schließt das Konzept für diese Mission aus, kostet nichts und keine Zeit (Dialog pausiert). Der Teilfortschritt der ersetzten Karte wird vorher angezeigt. Gibt es keine Alternative, bleibt alles unverändert.
- **Rückgängig:** nimmt einen Fund und seinen Schlüssel zurück. Nach dem dritten Fund geht es zurück in die Suche, mit höchstens der eingefrorenen Restzeit und erst nach „Weitersuchen“. Eine eingetretene Zeitüberschreitung wird nie wieder rechtzeitig.
- **Leitplanken:** alle bleiben zusammen, Anschauen und Zeigen genügt, nichts einsammeln, essen, abreißen, ablösen oder anfassen; die Aufgaben stammen aus dem vorhandenen, sicherheitsgeprüften Katalog.

## Kandidaten (Positivliste)

`src/domain/escape/candidates.ts`: nur einfache, eindeutige Einzelbeobachtungen, mit den harten Filtern Alter, Jahreszeit, erforderlicher Kontext (freiwillige Baumart ist nie Voraussetzung, erweitert aber den Pool). Familien werden weich gemischt, Häufiges und bestätigte Baumarten bevorzugt. Zielmengen: 4–6 höchstens 2, 7–10 höchstens 3.

Zapfen, Eichel, Eichelhütchen, Haselnuss, Buchecker, Buchenhülle, Nadelzweig, Moospolster, Blatt mit Loch, Ahornblatt*, Eichenblatt*, Ahornfrucht*, Kastanie*, Kastanienhülle*, Farnwedel*, Buchenknospe (*nur mit bestätigtem Kontext).

Nicht dabei: lebende Tiere, Spinnennetze, Tierspuren, Pilze und Baumpilze, Flechten, Gallen, Blattminen, Blattskelette, Farn-Sporen, angenagte Nussschalen und Zapfen, Zapfenvergleich (stark glücksabhängig, schwer zu prüfen oder nur mit Anfassen/Hochheben zu erfüllen). Die Aufgabe „Y-Zweig“ aus der Vorlage gibt es im Katalog nicht; sie wurde nicht neu erfunden.

Pool je Jahreszeit ohne Kontext: Frühling 5, Sommer 4, Herbst 8, Winter 5 verschiedene Konzepte. Bei vier Karten steht vor dem Start „Heute stehen 4 Waldschätze zur Wahl. Ihr braucht 3.“, bei drei Karten wird erklärt, dass alle drei gebraucht werden, unter drei startet keine Mission. Das Schlüsselziel bleibt immer drei. Fünf Karten-Snapshots (Texte, Mengen, Bilder, Symbole) werden beim Start gespeichert und nie neu gelost.

## Technik

| Datei | Inhalt |
|---|---|
| `src/domain/escape/types.ts` | Mission, Phasen, Symbole, Uhr |
| `src/domain/escape/clock.ts` | Uhr aus Zeitpunkten, Pausengründe (`manual`, `menu`, `dialog`) |
| `src/domain/escape/candidates.ts` | Positivliste, Kandidatenauswahl, Ersatzkarte |
| `src/domain/escape/puzzle.ts` | Lösung, eindeutige Hinweise, Texte |
| `src/domain/escape/mission.ts` | alle Zustandsübergänge, Geschenk, Abschluss |
| `src/domain/escape/storage.ts` | eigene versionierte Speicherung (`entdeckerzeit:v1:escape`) |
| `src/ui/useEscape.ts` | Hook: speichert nach jeder Aktion, Anzeige-Takt, Tab-Abgleich |
| `src/ui/escape/*`, `src/ui/ModeSwitch.tsx` | Oberfläche |
| `src/styles/escape.css` | Gestaltung |

**Phasen:** `searching` (läuft oder pausiert) → `timeup` → `free` → `combination` → `opened`, daneben `ended`. Unmögliche Kombinationen (zum Beispiel „Zeit abgelaufen“ und „rechtzeitig“, geöffneter Tresor ohne drei Schlüssel) werden von `invariantsHold` geprüft und in einem Zufallsverlaufstest über 60 Seeds nie erreicht.

**Zeit:** `remainingAt(mission, now)` rechnet aus der gespeicherten Restzeit und dem Zeitpunkt des letzten Starts. Jede Aktion rechnet zuerst die Uhr ab (`settle`). Gerätezeit rückwärts schenkt nie Zeit (verstrichene Zeit zählt dann als 0), die Restzeit liegt immer zwischen 0 und der gewählten Dauer. Die Anzeige tickt nur für die Optik.

**Speicherung:** unabhängig von der Waldschätze-Runde. Nach jeder Aktion gespeichert. Laden rechnet die vergangene Zeit ab; ein beim Neuladen offener Dialog wird zur bewussten Pause (die Uhr startet nie ungefragt). Veraltete Tabs überschreiben nie einen jüngeren Stand (`rev`, `createdAt`). Bildverweise und Beschreibungen kommen beim Laden immer aus dem aktuellen Katalog. Beschädigter oder gesperrter Speicher führt zu einer Meldung statt zu einem Absturz.

## Bilder und Animationen

Sanduhr, Waldtresor (drei Schloss-Zustände: zu, bereit, offen), acht Symbolschlüssel (Blatt, Zapfen, Eichel, Stern, Pilz, Sonne, Mond, Tropfen) entstehen als eigener, freundlich stilisierter SVG-Code in `src/ui/escape/EscapeArt.tsx`. Es gibt keine Fremdbilder und keine Dateien nachzuladen; alles steckt im Offline-Paket. Jedes Symbol unterscheidet sich durch Form und Farbe, der Name steht immer als Text daneben. Die Suchbilder sind die vorhandenen naturgetreuen Zeichnungen.

Animationen (CSS, kurz, nie nötig für einen Zustandswechsel): Sandstrom und Füllstände der Sanduhr, kurzes Aufleuchten des neuen Schlüsselplatzes, leuchtende Schlösser, Deckel des Tresors beim Öffnen, einmaliges Konfetti. Bei reduzierter Bewegung und „Bewegung aus“ gelten dieselben Zustände als Standbild; bei ausgeblendetem Fenster pausieren die Animationen (die Suchzeit läuft davon unabhängig).

## Prüfstand

- `tests/escape.test.ts` (Uhr, Kandidaten, Schlüssel, Rätsel, Zeitablauf, Geschenk, Korrektur, Speicherung, Tabs, Modus) und `tests/contrast.test.ts` (Kontrast der Escape-Farben).
- Im Browser (Emulation 320, 360, 390, 430 und Desktop) durchgespielt: Verlauf 1 (rechtzeitig → Rätsel → Tresor → Geschenk), Verlauf 2 (Zeit abgelaufen → ohne Zeitdruck → Tresor → Geschenk ohne „rechtzeitig“), Verlauf 3 (Pause, Info, Hauptmenü, Neuladen mit gleicher Restzeit und unveränderten Funden).
- Produktionsstand mit Service Worker vollständig gecacht (14 von 14 Dateien), Server gestoppt, danach offline neu geladen: Mission lief weiter, Info, Vergrößerung, Austausch, drei Schlüssel, Rätsel, Geschenk und erneutes Laden funktionierten.

## Grenzen

- Walddetektive existiert in diesem Repository nicht (siehe oben).
- Echte Geräte (Telefone, Tablets) und Bildschirmleser wurden nicht geprüft, nur die Viewport-Emulation; keine WCAG-Zertifizierung.
- Zeiten und Aufgabenmischung wurden nicht mit Kindern getestet.
- Die Zeitmessung nutzt die Gerätezeit; eine manuelle Änderung der Uhrzeit wird defensiv behandelt (keine negative oder verlängerte Restzeit), aber nicht als Betrug erkannt.
- Vorlesen (Sprachausgabe) ist in der Escape-Info nicht eingebaut; die Texte lassen sich vorlesen, die Funktion wurde nicht übernommen.

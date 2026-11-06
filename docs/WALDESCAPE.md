# Wald Escape – „Knackt den Waldtresor!“

Dritter Spielmodus von Wald-Spiel: eine gemeinsame Zeitmission mit freier Aufgabenwahl, drei Symbolschlüsseln (jeder aus 2 oder 3 verschiedenen Entdeckungen) und einem kleinen Symbolrätsel. Gemeint ist ein freundlicher digitaler Waldtresor, keine Flucht aus dem echten Wald. Alles läuft lokal im Browser (kein Backend, kein Login, kein Standort).

## Die drei Modi

| Modus | Stand in dieser Fassung |
|---|---|
| Waldschätze suchen | unverändert (eigene Regeln, eigener Spielstand) |
| Walddetektive | **nicht vorhanden.** Im Repository gab es nie einen Detektivmodus. Die Karte steht an zweiter Stelle, trägt den Hinweis „Bald verfügbar“ direkt über dem Titel und ist als deaktiviertes Optionsfeld gekennzeichnet: Antippen und Tastatur wechseln und starten nichts, der gewählte spielbare Modus bleibt aktiv (siehe `docs/UX_BENCHMARK_UMSETZUNG.md`). Eine früher gespeicherte Auswahl „Walddetektive“ öffnet wieder Waldschätze suchen. |
| Wald Escape | neu, vollständig (diese Seite) |

Die Moduswahl steht direkt unter dem Wald-Spiel-Kopf (Optionsfelder, Pfeiltasten, „Gewählt“ als Text). Ein Moduswechsel startet nie etwas und löscht nie einen Spielstand. Standard beim Erstbesuch ist „Waldschätze suchen“.

## Regeln

- **Alter:** ab 4 Jahren mit erwachsener Begleitung (Schwerpunkt 7–10). Das sind Produktentscheidungen, keine Entwicklungsnormen. Bei 2–3 Jahren erklärt die Kachel den Modus und zeigt den Hinweis „Wald Escape ist für Kinder ab 4 Jahren …“; es gibt keine Zeitmission und keine defekte Schaltfläche, aber einen Knopf „Zur Waldschatzsuche wechseln“. Das Alter wird nie heimlich geändert; eine später geänderte Altersauswahl verändert keine gespeicherte Mission.
- **Fundgruppen (Fassung 4.1):** Das Tresorziel ist immer **drei Schlüssel**. Ein Schlüssel entsteht erst aus **zwei** (kleine Mission) oder **drei** (große Mission) *unterschiedlichen, vollständig erledigten* Suchaufgaben. Das ergibt **6** bzw. **9** Aufgaben. Jede vollständig erledigte Aufgabe ist ein **Fragment**; erst die volle Gruppe zeigt den Schlüssel. Eine Zählaufgabe oder ein Vergleich ist genau ein Fragment, und zwar erst, wenn sie vollständig erledigt ist. Teilfunde zählen nicht. Eine fertige Karte liefert nie ein zweites Fragment (Doppeltippen ändert nichts).
- **Größe:** „Kleine Schlüsselmission“ (2 Entdeckungen je Schlüssel, insgesamt 6 Aufgaben) und „Große Schlüsselmission“ (3 je Schlüssel, insgesamt 9). Standard: 4–6 Jahre klein, 7–10 Jahre groß; Erwachsene wählen frei. Die Auswahl wird erst gespeichert, wenn sie bewusst getroffen wird; ein Standardwert gilt nie als gewählt.
- **Suchzeit:** 10, 15, 20 oder 30 Minuten. Standard 20 (sechs Aufgaben) bzw. 30 Minuten (neun Aufgaben). Ehrliche Kennzeichnung im Auswahlfeld: 10 „Bewusst kurz, für 6 (9) Aufgaben sehr knapp“, 15 „Zügig“, 20 „Empfohlen für 6 Aufgaben“, 30 „Empfohlen für 9 Aufgaben“. Alle Zeiten sind Ausgangswerte und wurden nicht mit Familien erprobt.
- **Start:** Die Uhr beginnt erst beim bewussten Tippen auf „Sanduhr starten“. Einstellungen und der erste Aufruf kosten keine Zeit.
- **Karten:** angestrebt werden **8** (klein) bzw. **12** (groß) Suchkarten, frei wählbar. Gibt der Pool weniger verschiedene Konzepte her, steht das ehrlich vor dem Start („Heute stehen 11 Aufgaben zur Wahl. Ihr braucht 9.“, „genau 9 … alle 9“). Eine große Mission wird nie still verkleinert und startet mit weniger als neun verschiedenen Konzepten nicht (Hinweis: Jahreszeit oder Angaben ändern, kleine Größe oder Waldschatzsuche wählen).
- **Anzeige:** drei Schlüsselplätze, jeder mit zwei bzw. drei sichtbaren Fragmentpositionen (belegt = Bild mit Häkchen, frei = gestrichelt mit Nummer, nicht nur Farbe); darüber „4 von 6 Aufgaben · 2 von 3 Schlüsseln“, darunter „Für den nächsten Schlüssel fehlt noch 1 Entdeckung.“ Die Übersicht „Eure Waldaufgaben“ (Miniaturen und ausklappbare Liste mit Zuordnung zu Schlüssel und Entdeckung) pausiert nicht; die Karte wechselt nie automatisch.
- **Rückmeldung:** Ein neues Fragment setzt sich ruhig an seinen Platz (kurzes Einblenden). „Schlüssel 1 geschafft!“ erscheint erst, wenn die volle Gruppe erledigt ist; Konfetti gibt es nur bei der Tresoröffnung. Bei reduzierter Bewegung und „Bewegung aus“ stehen dieselben Zustände ohne Bewegung.
- **Zeit zählt nur bei der Suche.** Sie steht bei bewusster Pause, im Hauptmenü, bei geöffneter Info, Vergrößerung oder Austauschfrage, im Symbolrätsel und nach Zeitablauf. Ein gesperrtes oder im Hintergrund liegendes Telefon zählt als weiterlaufende Suche (Zeitpunkte, kein Tick); bei einer echten Pause bitte „Pause“ tippen.
- **Letzte nötige Aufgabe (die 6. bzw. 9. gültige):** Ist zu diesem Zeitpunkt noch positive Suchzeit da, ist die Zeitaufgabe geschafft („Suchzeit geschafft“) und die Sanduhr bleibt stehen. Bei exakt null oder später gilt die Zeit als abgelaufen. Vorher stoppt nichts: Weder drei Funde noch der dritte Teilfund lösen etwas aus (die frühere Regel „3 Funde = 3 Schlüssel“ greift für neue Missionen nicht).
- **Symbolrätsel (kein Countdown):** 4–6 Jahre: Die richtige Reihenfolge steht als Streifen daneben und wird nachgebaut. 7–10 Jahre: zwei Hinweise („Die Eichel liegt in der Mitte. Der Zapfen liegt links vom Blatt.“); der Generator prüft alle sechs Reihenfolgen, genau eine erfüllt beide Hinweise, und es werden nur erhaltene Symbole genannt. Falsche Reihenfolge: freundlicher Hinweis, keine Strafe, keine Sperre, die Belegung bleibt. Hilfen: „Tipp“, „Lösungsbeispiel“, „Gemeinsam öffnen“ (kostet nichts, ändert nichts am Zeitergebnis).
- **Zeit abgelaufen:** „Die Sanduhr ist durch – der Tresor wartet auf euch!“ mit den echten Zahlen, zum Beispiel „Ihr habt 5 von 6 Aufgaben und 2 von 3 Schlüsseln geschafft. Der nächste Schlüssel ist schon halb fertig!“ („zu einem Drittel“ bzw. „zu zwei Dritteln“ bei der großen Mission; nie mehr behauptet, als stimmt). „Ohne Zeitdruck weitersuchen“ (dieselben Karten und Funde, keine neue Zeit, nie nachträglich „rechtzeitig“), „Für heute beenden“ (ehrlicher Teilabschluss ohne Geschenk), „Hauptmenü“.
- **Abschluss:** Tresor öffnet sich, einmal Konfetti, ein Waldgeschenk aus der vorhandenen Geschenkbibliothek (`docs/WALDGESCHENKE.md`, gemeinsames „Unsere Waldgeheimnisse“). Rechtzeitig: „Tresor geöffnet! Ihr habt alle drei Schlüssel rechtzeitig gefunden.“ Sonst: „Tresor geöffnet! Gemeinsam habt ihr das Waldgeheimnis entdeckt.“ Gleiche Geschenkqualität. Genau ein Geschenk pro Mission, auch nach Reload, Doppeltippen oder Rückgängig.
- **Austausch („Andere Spur suchen“):** ersetzt nur die offene Karte, schließt das Konzept für diese Mission aus, kostet nichts und keine Zeit (Dialog pausiert). Der Teilfortschritt der ersetzten Karte wird vorher angezeigt. Gibt es keine Alternative, bleibt alles unverändert.
- **Rückgängig:** nimmt einen Fund zurück; Fragmente und Schlüssel werden danach **neu aus den vollständig erledigten Aufgaben abgeleitet** (nicht einzeln hoch- oder heruntergezählt). Beispiele: 6 → 5 Aufgaben ergibt 2 Schlüssel und 1 Fragment; 9 → 8 ergibt 2 Schlüssel und 2 Fragmente. Nach der letzten nötigen Aufgabe geht es zurück in die Suche, mit höchstens der eingefrorenen Restzeit und erst nach „Weitersuchen“. Eine eingetretene Zeitüberschreitung wird nie wieder rechtzeitig. Ein bereits vergebenes Geschenk bleibt lesbar; es gibt nie ein zweites.
- **Frühere Missionen:** Eine vor dieser Fassung gespeicherte Mission („ein Fund = ein Schlüssel“, drei Funde) wird beim Laden **nicht auf 6 oder 9 umgedeutet**. Sie behält Regel 1 (`rules: 1`, `tasksPerKey: 1`), ihre Funde, Schlüssel, Restzeit und ihr Geschenk, bleibt fortsetzbar und ist im Hauptmenü mit „frühere Regel“ gekennzeichnet. Abgeschlossene frühere Missionen bekommen rückwirkend weder Geschenk noch Konfetti. Neue Missionen verwenden Regel 2 (Schema 2, `entdeckerzeit:v1:escape` unverändert).
- **Leitplanken:** alle bleiben zusammen, Anschauen und Zeigen genügt, nichts einsammeln, essen, abreißen, ablösen oder anfassen; die Aufgaben stammen aus dem vorhandenen, sicherheitsgeprüften Katalog.

## Kandidaten (Positivliste)

`src/domain/escape/candidates.ts`: nur einfache, eindeutige Einzelbeobachtungen, mit den harten Filtern Alter, Jahreszeit, erforderlicher Kontext (freiwillige Baumart ist nie Voraussetzung, erweitert aber den Pool). Familien werden weich gemischt, Häufiges und bestätigte Baumarten bevorzugt. Zielmengen: 4–6 höchstens 2, 7–10 höchstens 3.

Zapfen, Eichel, Eichelhütchen, Haselnuss, Buchecker, Buchenhülle, Nadelzweig, **Zweig mit Y-Gabelung**, Moospolster, Blatt mit Loch, **Blatt mit Adernetz**, Ahornblatt*, Eichenblatt*, Ahornfrucht*, Kastanie*, Kastanienhülle*, Farnwedel*, Buchenknospe, **Hainbuchenfrucht***, **Lindenfruchtstand***, **Erlenzäpfchen*** (*nur mit bestätigtem Baum; fett = neu in Katalog 4.1.0). Seltener angeboten, nie Pflicht: Flechte, Baumpilz am Holz, Blattskelett, Nussschale mit Öffnung, abgenagter Zapfen.

Eng verwandte Konzepte zählen als **eine Gruppe**, damit eine Mission nie zwei fast gleiche Aufgaben stellt: Eichel/Eichelhütchen, Zapfen/abgenagter Zapfen, Buchecker/Buchenhülle, Haselnuss/Nussschale, Kastanie/Kastanienhülle, Blattskelett/Blatt mit Adernetz.

Nicht dabei: lebende Tiere, Spinnennetze, Tierspuren, Pilze mit Hut, Gallen, Blattminen, Farn-Sporen, Zapfenvergleich (stark glücksabhängig, schwer zu prüfen oder nur mit Anfassen/Hochheben zu erfüllen). **Harztropfen und Fraßmuster an Holz** wurden bewusst nicht aufgenommen: Für beide liegen keine geprüften Fachquellen und keine naturgetreuen Bilder vor.

### Neue Motive und Quellen

Fünf neue Suchbilder (eigene, naturgetreu gezeichnete Illustrationen in `src/illustrations/real-blatt.tsx`) mit je vollständigen Infotexten für 4–6 und 7–10 Jahre (Das habt ihr vor euch, So ist es entstanden, Waldgeheimnis, Zusatzgedanke) und Suchhinweis: `y-twig` (Zweig mit Gabelung), `leaf-vein-net` (Blatt mit Adernetz), `hornbeam-fruit`, `linden-fruit`, `alder-cone`. Hainbuche, Linde und Erle sind als Baumangaben unter „Mission anpassen“ wählbar und **Voraussetzung** für ihre Früchte (ohne die Art findet man sie nicht). Quellen: LWF/LfL Bayern (Hainbuche: Nüsschen mit dreilappigem Flügelblatt, Windverbreitung; Winterlinde: Fruchtstand mit Hochblatt als Flugorgan), wald.rlp.de und SDW-Steckbrief (Schwarzerle: verholzte, zapfenähnliche Fruchtstände, oft bis in den Winter am Baum). Die Recherche stützte sich auf diese und weitere forstliche Sachseiten; eine Gegenprüfung durch ein Fachlektorat steht aus. Bewusst nicht genannt: Flugweiten und genaue Maße. Blattader und Zweiggabel (`y-twig`, `leaf-vein-net`) beruhen auf Allgemeinwissen (Quelle: allgemeine Forst-/Botanikgrundlagen, wie `FORST_GEN`).

Gewachsener Pool (verschiedene Konzeptgruppen, ohne bestätigte Baumart): Frühling 9, Sommer 8, Herbst 12, Winter 11. Mit allen Baumangaben: Frühling 11, Sommer 11, Herbst 18, Winter 14. Folge: Die kleine Mission (8 Karten) gibt es immer; die große (9 nötig) ist im **Sommer ohne Baumangaben nicht möglich** (8 Konzepte) und das sagt die App vor dem Start, statt eine zu kleine Mission anzubieten. Im Herbst und Winter stehen 12 bzw. 11 Karten zur Wahl.

Die Karten-Snapshots (Texte, Mengen, Bilder) und die drei Schlüsselsymbole werden beim Start gespeichert und nie neu gelost.

### Beispielmissionen (echt erzeugt, Seed 2026, Herbst, ohne Baumangaben, nach Alter und Größe)

**Sechser** (klein, 4–6 Jahre, 20 Minuten): 8 Karten (Buchenhülle, Blattskelett, Nadelzweig, Moos, Eichel, Haselnuss ×2, Buchenknospe, Blatt mit Loch). Schlüsselsymbole Tropfen, Sonne, Mond. Verlauf bei durchgespielten Karten: 1 Aufgabe = 0 Schlüssel, 1 Fragment · 2 = 1 Schlüssel · 3 = 1 + 1 Fragment · 4 = 2 Schlüssel · 5 = 2 + 1 Fragment · **6 = 3 Schlüssel, Sanduhr stoppt, Symbolrätsel**.

**Neuner** (groß, 7–10 Jahre, 30 Minuten): 12 Karten (Buchenhülle, Blattskelett, Nadelzweig, Moos, Eichel ×3, Haselnuss ×3, Buchenknospe, Blatt mit Loch, Y-Zweig, Flechte, Baumpilz, Zapfen ×3). Schlüsselsymbole Blatt, Mond, Eichel. Verlauf: 1 = 0 Schlüssel/1 Fragment · 2 = 0/2 · 3 = 1/0 · … · 8 = 2 Schlüssel + 2 Fragmente · **9 = 3 Schlüssel, Sanduhr stoppt**.

Beide wurden im Browser (Produktionsstand) ebenfalls von Hand durchgespielt: die große Mission bis zum Tresor mit Geschenk, einschließlich Rückgängig von 9 auf 8 Aufgaben (2 Schlüssel, 2 Fragmente, Pause mit eingefrorener Restzeit), die kleine bis zum Start und ersten Fragment.

## Technik

| Datei | Inhalt |
|---|---|
| `src/domain/escape/types.ts` | Mission, Phasen, Symbole, Uhr |
| `src/domain/escape/clock.ts` | Uhr aus Zeitpunkten, Pausengründe (`manual`, `menu`, `dialog`) |
| `src/domain/escape/progress.ts` | **die eine zentrale Fortschrittsfunktion** (`progressOf`, `keyGroups`) und die Texte („4 von 6 Aufgaben · 2 von 3 Schlüsseln“, Zeitablauf, Regelzeile). Schlüssel und Fragmente werden nur hier aus der Liste der erledigten Aufgaben abgeleitet; Oberfläche und Animation sind nie die Quelle des Zustands. |
| `src/domain/escape/candidates.ts` | Positivliste, Konzeptgruppen, Kandidatenauswahl (8/12 Karten), Ersatzkarte |
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

- `tests/escape.test.ts` (65 Prüfungen): Größen und Pools, Fragmentrechnung für 0–6 bzw. 0–9 Aufgaben, Zählaufgabe = ein Fragment, Zeitgrenzen (Aufgabe 6/9 knapp vor und bei null), 3 Funde lösen nichts aus, Rückgängig 6→5 und 9→8, Geschenk bleibt und kein zweites, Rätsel, Zufallsverläufe in beiden Größen, frühere Missionen (Regel 1), Einstellungsmigration, Speicherung. Dazu `tests/contrast.test.ts` (Kontrast der Escape-Farben) und `tests/catalog.test.ts`/`tests/generator.test.ts` für die neuen Motive.
- Im Browser (Emulation 320, 360, 390, 430 und Desktop) durchgespielt: Verlauf 1 (rechtzeitig → Rätsel → Tresor → Geschenk), Verlauf 2 (Zeit abgelaufen → ohne Zeitdruck → Tresor → Geschenk ohne „rechtzeitig“), Verlauf 3 (Pause, Info, Hauptmenü, Neuladen mit gleicher Restzeit und unveränderten Funden).
- Produktionsstand mit Service Worker vollständig gecacht (14 von 14 Dateien), Server gestoppt, danach offline neu geladen: Mission lief weiter, Info, Vergrößerung, Austausch, drei Schlüssel, Rätsel, Geschenk und erneutes Laden funktionierten.

## Grenzen

- Walddetektive existiert in diesem Repository nicht (siehe oben).
- Echte Geräte (Telefone, Tablets) und Bildschirmleser wurden nicht geprüft, nur die Viewport-Emulation; keine WCAG-Zertifizierung.
- Zeiten und Aufgabenmischung wurden nicht mit Kindern getestet; ob 20 bzw. 30 Minuten für sechs bzw. neun Aufgaben passen, ist offen.
- Die neuen Motive (Hainbuche, Linde, Erle, Y-Zweig, Adernetz) sind selbst gezeichnete Sachillustrationen; Aussehen und Fachtexte sind nicht von einer Fachperson gegengeprüft. Die Fachseiten wurden per Websuche gesichtet, nicht vollständig gelesen.
- Im Sommer ohne Baumangaben gibt es keine große Mission (8 Konzepte statt 9 nötig).
- Die Fragmentanimation wurde nur im Browser-Vorschaufenster (Emulation) gesehen, nicht auf echten Geräten.
- Die Zeitmessung nutzt die Gerätezeit; eine manuelle Änderung der Uhrzeit wird defensiv behandelt (keine negative oder verlängerte Restzeit), aber nicht als Betrug erkannt.
- Vorlesen (Sprachausgabe) ist in der Escape-Info nicht eingebaut; die Texte lassen sich vorlesen, die Funktion wurde nicht übernommen.

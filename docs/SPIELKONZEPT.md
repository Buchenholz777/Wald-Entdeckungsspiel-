# Spielkonzept „Eure kleine Entdeckermission“

> **Aktueller Stand (Katalog 3.0.0): Entdeckerzeit ist ein reines Wald-Spiel „Waldgeheimnisse entdecken“.** Es gibt keine Ortsauswahl mehr. Der Einstieg besteht aus einer kurzen Waldeinladung, der Altersauswahl, der sichtbaren Jahreszeit (Vorschlag nach Datum, änderbar), optional „Mission anpassen“ und „Waldmission starten“. Missionstitel stammen aus sechs Leitmotiven (siehe `WALDKATALOG.md`), nicht mehr aus Orten. Die Abschnitte unten beschreiben Ablauf, Navigation und Bildwelt des Vorgängerstandes 2.1.0; **Aussagen zu mehreren Orten, „Geheimnisse im Sand“, „Waldschätze“ und Ortskacheln gelten nicht mehr.** Ablauf, Hauptmenü-Verhalten, Info-Button, Altersstufen und Rücksichtsregeln gelten weiter.

## Stand 2.1.0 (Vorgänger, mehrere Orte)

Diese Vorgabe konkretisiert die Inhaltsvorgabe v2 (`INHALTSNOTIZ.md`) und ersetzt bei Widersprüchen ältere Vorgaben zu Aufgabenqualität, Bildsprache und Navigation. Der gemeinsame Suchmodus bleibt, es gibt keinen Wettkampfmodus und keine zusätzliche Modusauswahl.

## Ablauf

1. **Hauptmenü:** Alter, Ort, Jahreszeitvorschlag, optional „Runde anpassen“. Läuft eine Mission, steht oben **„Mission fortsetzen“** mit Titel, Alter, Ort, Jahreszeit und tatsächlichem Fortschritt. „Mission starten“ bzw. „Neue Mission starten“ ist eine eigene, bewusste Aktion.
2. **Mission:** Titel und ein Vorlesesatz werden erst aus den tatsächlich gezogenen Aufgaben abgeleitet (`src/domain/mission.ts`). „Waldschätze auf der Spur“ gibt es nur mit einem Baumfrucht-Fund (Zapfen, Nuss, Kastanie, Eichel …), „Geheimnisse im Sand“ nur mit einem Sand- oder Schalenmotiv, „Die Muster-Expedition“ nur bei mindestens zwei Musteraufgaben, „Spuren am Weg“ nur mit Spur. Nach einem Tausch werden Titel und Satz neu bestimmt.
3. **Station:** Erkennen (großes Beispielbild, kurzer Auftrag) → draußen suchen (optionaler „Such-Hinweis“) → bestätigen („Gefunden!“, „Eins gefunden“, Vergleich „Geschafft!“) → **Kleiner Entdeckermoment** (freiwilliger Beobachtungsimpuls, kein Quiz, kein Textfeld). Nach einem Fund zeigt die Stationsleiste (3 oder 5 Stempel) ein Häkchen. „Weiter entdecken“ wird ausdrücklich getippt, nichts bewegt sich automatisch.
4. **Fundsammlung:** Am Ende (auch bei Teilabschluss) zeigt die Runde die tatsächlich entdeckten Motive mit Status, ausgelassene und offene bleiben erkennbar (gedämpft, mit Beschriftung). Dazu eine warme gemeinsame Abschlusszeile. Buttons: „Neue Mission“, „Zum Hauptmenü“, „Zurück zur Mission“.

## Alter ändert Aufgabe, Sprache und Tiefe

| Alter | Aufgaben | Info zum Bild (Wörter gesamt) | Besonderheiten |
|---|---|---|---|
| 2–3 | ein konkreter Fund, meist Menge 1; Zapfen, Moos, Kastanie, Eichel, Haselnuss, Buchecker, Muschelschale als Beobachtungsfunde | etwa 17–40 (Ziel 20–35) | Entdeckermoment, z. B. „Siehst du seine vielen Schuppen?“ |
| 4–6 | Einzelfunde, Zweiervergleiche, kleine Zählmengen, sichtbare Merkmale | etwa 33–70 (Ziel 35–65) | zusätzlich **Bilderrätsel** („Ich habe ein kleines Hütchen. Findest du mich?“, Antippen zeigt den Namen) bei Eichel, Kastanie, Haselnuss, Buchecker, Schneckenhaus |
| 7–10 | Details, Vergleiche, Spuren lesen („könnte … passen“), Muschel gegen Schneckenhaus | etwa 55–105 (Ziel 60–100) | zusätzlich ein Zusammenhang und eine freiwillige Denkfrage („Zum Nachdenken“) |

Die Wortbereiche werden in `tests/info.test.ts` für jede auswählbare Aufgabe und jede Altersgruppe geprüft. Die Texte sind je Alter eigens formuliert (`src/catalog/concepts.ts`, `src/catalog/extras.ts`), nicht gekürzt.

## Info-Button am Bild

- Eigenständiger Button oben rechts auf dem Bild (48 × 48 px, `aria-label` „Info zu: …“), nicht in der Vergrößerungs-Schaltfläche verschachtelt. Antippen des Motivs öffnet die Vergrößerung („So kann es aussehen. Euer Fund darf etwas anders sein.“).
- Infoblatt: **Was ist das? · Woher kommt es? · Was ist daran besonders?** (bei 7–10 zusätzlich „Zum Nachdenken“). Der **Such-Hinweis** („Wo könnt ihr schauen?“, Sicherheitshinweis) ist eine eigene Hilfe unter dem Auftrag.
- Verfügbar vor dem Fund, ändert nie Zähler oder aktive Aufgabe. Escape, Schließen-Button, Fokusführung und Hintergrundklick (löst nie eine Aktion in der Karte aus) funktionieren.
- „Was ist daran besonders?“ erklärt nachvollziehbare Zusammenhänge, keine erfundene Absicht der Natur, keine Heilwirkung, keine Essbarkeit.

## Navigation (zwingend)

- **„Hauptmenü“** (Haus-Symbol + Text) steht in der oberen, mitlaufenden Leiste auf Spiel, Fundsammlung, Hilfe und Bildübersicht. In jedem Dialog (Info, Bild, Mehr, Beenden, keine Alternative) gibt es zusätzlich „Zum Hauptmenü“.
- Ins Hauptmenü gehen **pausiert und speichert** die Mission, ohne Nachfrage. Das Menü öffnet sich tatsächlich und springt nicht zurück. Ein Neuladen auf `#/` bleibt im Menü. Nur ein Kaltstart ohne Adresszusatz nimmt eine laufende Mission wieder auf.
- „Neue Mission starten“ bei laufender Mission: ein Dialog mit **„Runde behalten“** (bleibt im Menü, Runde unverändert) und „Neue Mission starten“ (genau eine neue Runde).
- „Mission beenden“ ist eine andere Aktion (Menü „Mehr“) und führt zur Fundsammlung auch einer Teilrunde.
- Verlauf: Ein offener Dialog belegt genau einen Eintrag. Browser-Zurück schließt zuerst den Dialog, vom Spiel führt Zurück ins Hauptmenü. Wiederholtes Öffnen von Info und Bild lässt den Verlauf nicht wachsen. Aus einem Dialog ins Menü ersetzt den Dialog-Eintrag, damit keine Kette entsteht.

## Bildwelt

- Alle Suchbilder sind **eigene SVG-Zeichnungen** im Projekt (keine Fotos, keine externen Bilder, keine Bild-API). Es bestehen daher keine Fremdlizenzen. Quelle: `src/illustrations/`.
- Für diese Vorgabe wurde der Stil naturalistischer: Verläufe und weiche Schatten, feine Körnung und Oberflächenstruktur (Blatt, Nuss, Zapfen, Schale, Stein, Holz), dünnere Konturen, plastische Blattadern. Sie wirken über gemeinsame Bausteine (`Leaf`, `Pebble`, `Plastic`, `ConeShape`, `Scallop` …) auf alle Motive, die sie benutzen.
- Nicht umgestellt sind Motive aus Stadt und Spielplatz, einfache Formenmotive und einzelne ältere Zeichnungen; sie stehen weiter im bisherigen, schlichteren Stil. Echte Fotos wurden nicht verwendet, weil keine rechtlich geklärten, freigestellten Aufnahmen vorlagen.
- Spuren zeigen eigene Formen (Rehspur: zwei längliche Schalen; Hundeabdruck: Ballen, vier Zehen, Krallenpunkte; Vogelspur: drei Zehen mit Schwimmhaut; Schuhabdruck mit Sohlenprofil).
- Muschelschale (zwei Hälften, Fächer oder länglich) und Schneckenhaus (Spirale) sind getrennte Konzepte (`shell`, `snailShell`). Haselnuss, Buchecker, Eichel und Rosskastanie haben eigene Konzepte, Formen und Texte.

## Katalogänderungen dieser Vorgabe

- Federn sind nicht mehr auswählbar (keine Federn, Nester, Eier als Standardfunde). Tierbeobachtungen (Vogel, Insekt) werden schwächer gewichtet.
- Neu: gezackter Blattrand, aufgeplatzte Kastanienhülle, Ahornfrucht mit zwei Flügeln, Muschelschale mit Loch, längliche Muschelschale, Stein mit hellem Streifen, Schuhabdruck im feuchten Sand, Flechte auf Stein, Kleeblatt mit drei Blättchen (Nr. 117–125).
- Generator: Der Einstieg ist ein zufällig gewählter, konkreter, bevorzugt häufiger Fund (nie Vergleich, Formenaufgabe oder Wellen).

## Prüfstand

Siehe Abschnitt „Prüfstand“ in der `README.md`.

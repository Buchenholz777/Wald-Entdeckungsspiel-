# UX-Benchmark: Umsetzung der fünf Änderungen (Fassung 4.2)

Quelle: Benchmark-Bericht `output/pdf/Benchmark-Wald-Spiel.pdf` (Stand vor Fassung 4.1) und die Bilder `Benchmark-Mobiler-Einstieg.jpg`, `Benchmark-Walddetektive.jpg`, `Benchmark-Suchkarte.jpg`. Aktive Fassung ist dieses Projekt (Wald-Spiel mit Waldschätze suchen, Walddetektive-Karte, Wald Escape, Tresor, Waldgeschenke); der Ordner `entdeckerzeit/` im Arbeitsordner ist die frühere Fassung und wurde nicht verändert.

## Was sich geändert hat

| # | Änderung | Wo |
|---|---|---|
| 1 | Drei Karten in der Spielauswahl. „Walddetektive“ bleibt in der Mitte, trägt direkt über dem Titel den Hinweis **„Bald verfügbar“** (dunkle Schrift auf hellem Gelb, Kontrast über 7:1, gestrichelter Rahmen) und ist als deaktiviertes Optionsfeld gekennzeichnet: Antippen und Tastatur wechseln und starten nichts, der bisher gewählte spielbare Modus bleibt aktiv. Der Hinweis steht im Beschriftungstext der Karte und wird mit dem Namen vorgelesen. Eine aus einer älteren Sitzung gespeicherte Auswahl „Walddetektive“ öffnet wieder „Waldschätze suchen“; alle Spielstände bleiben. Die frühere Ankündigungsseite entfällt. | `src/ui/ModeSwitch.tsx`, `src/domain/storage.ts`, `src/styles/escape.css` |
| 2 | Suchsatz vor dem Bild: Überschrift mit der konkreten Aufgabe, darunter Zählstand und „Erkennbar an: …“ (zwei Bildmerkmale), dann das Bild. Die Missionseinleitung ist aufklappbar („Über diese Mission“). Bildvergrößerung, Suchhinweis und die Fundfrage bleiben. Auf der Startseite heißt die Hauptaktion bei laufender Runde des gewählten Modus **„Weiterspielen“** (öffnet genau diesen Spielstand), **„Neue Runde“** steht getrennt daneben (mit Rückfrage); ohne Runde bleibt „Waldmission starten“ bzw. „Sanduhr starten“ nach der Alterswahl. | `src/ui/RoundScreen.tsx`, `src/ui/SetupScreen.tsx`, `src/ui/escape/EscapeSetup.tsx`, `src/styles/app.css` |
| 3 | Gut auffindbarer Einstieg: Eine neue Runde beginnt mit einem Fund aus einer kleinen, bewusst gewählten Liste (Blatt mit Adernetz oder Loch, Nadelzweig, Moos, Zapfen, Eichel, Y-Zweig, Ahorn- und Eichenblatt …). Das Blattskelett und andere seltene Funde (Flechte, Baumpilz, Netz, Spuren, Gallen) stehen nie am Anfang, bleiben aber als spätere Aufgabe möglich. Hat die Auswahl keinen solchen Einstieg, wird die letzte Wahl durch einen passenden aus dem Pool ersetzt (gleiche Alters-, Jahreszeit- und Kontextfilter, gleiche Stationszahl). **„Hier nicht zu finden“** ersetzt nur diese Aufgabe, Missionstitel und Einleitung bleiben. Bis zur nächsten Spielaktion steht **„Tausch rückgängig“** da und stellt die frühere Aufgabe samt Zählstand und Ausschlussliste wieder her. „Rückgängig“ für einen bestätigten Fund bleibt unverändert. Gespeicherte Runden werden beim Laden nie neu gewürfelt. | `src/domain/generator.ts` (`isEasyOpener`, `restoreSwap`), `src/ui/useGame.ts`, `src/ui/RoundScreen.tsx` |
| 4 | Tresor nach einem Fehlversuch: `checkAttempt` wertet die eingelegte Folge gegen die echte Lösung aus und gibt genau einen kurzen Hinweis, zum Beispiel „Der Pilz in der Mitte stimmt schon. Schau auf das erste Zeichen.“ oder, wenn kein Platz passt, „Noch passt kein Platz. Schau auf den ersten Platz und den Vorlagestreifen.“ (bei 7–10 Jahren „… und die Hinweise“). Die Plätze zeigen zusätzlich zur Farbe „✓ passt“ bzw. „! Hier schauen“. Es gibt keine zweite Fehlermeldung; der Hinweis verschwindet, sobald die Belegung geändert wird. Pause, zeitfreier Rätselabschluss, Tipp und „Gemeinsam öffnen“ bleiben. Die Regeln für Schlüssel und Fundgruppen gelten unverändert. | `src/domain/escape/puzzle.ts`, `src/ui/escape/EscapeScreen.tsx`, `src/ui/useEscape.ts` |
| 5 | Abschluss mit den eigenen Entdeckungen: Nach dem Öffnen steht zuerst „Das habt ihr entdeckt“ mit Bild und kurzem Namen jeder tatsächlich bestätigten Aufgabe, nach Schlüsseln gruppiert (bei Fundgruppen 6 oder 9 Entdeckungen, bei einer früheren Mission 3). Darunter eine kleine Beobachtungsfrage zu einem dieser Funde (zum Beispiel „Welche Form hatte das Loch in eurem Blatt?“), danach das vorhandene Waldgeschenk. Die Frage hängt nur vom gespeicherten Seed ab: Beim erneuten Öffnen erscheinen dieselben Funde, dieselbe Frage und dasselbe Geschenk. Alte Stände mit fehlenden oder unbekannten Bilddaten bleiben mit den vorhandenen Namen lesbar (ruhiger Bildersatz statt Fehler). | `src/ui/escape/EscapeScreen.tsx`, `src/domain/escape/storage.ts` |

Nachtrag: Das Familienbild steht **nicht mehr im Kopfbereich**, sondern klein im feststehenden Waldhintergrund (siehe `docs/BILDNACHWEIS.md`); der lange Einladungstext ist auf dem Telefon wieder da. Der zwischenzeitliche Knopf „Alles auf Anfang“ im Hauptmenü ist durch „Spiele und Einstellungen zurücksetzen“ in der Hilfe ersetzt (siehe `docs/RESET.md`).

Zusätzlich behoben: Bei 160 % Textgröße überlappten Marke und Hauptmenü-Taste, und die fünf Stationspunkte ragten über den Rand. Beides bricht jetzt um bzw. schrumpft.

## Tatsächlich geprüft

Im lokalen Browser (Produktionsbau über `npm run preview`, Emulation 360 × 800, 390 × 844, 320 und Desktop 1280):

- **Modusauswahl:** drei Karten in der Reihenfolge Waldschätze, Walddetektive, Wald Escape; Badge direkt über dem Titel; Antippen der Detektivkarte und Fokus per Tastatur ändern nichts; beide spielbaren Modi lassen sich wählen und zurückwechseln; gespeicherte Auswahl „Walddetektive“ (aus einem Stand der bisherigen Version) öffnet Waldschätze suchen; bei 160 % Textgröße liegt das Badge einzeilig in der Karte, ohne waagerechtes Scrollen.
- **Suchkarte (390 × 844):** Aufgabenüberschrift beginnt bei rund 234 CSS-Pixeln (vorher 768), die feste Fundtaste bei 705; mit einer künstlich sehr langen Überschrift und 160 % Textgröße bleibt der Satz sichtbar und es gibt keinen waagerechten Überlauf.
- **Normale Runde:** Fund bestätigen → Fund zurücknehmen → Aufgabe tauschen → Tausch rückgängig (alte Aufgabe wieder da) → erneut tauschen → andere Aktion (Rückgängig-Knopf verschwindet) → Fund bestätigen → Seite neu laden → fortsetzen: Aufgabe, Titel, Stationen und Gesamtfortschritt stimmen. Eine gleichzeitig laufende Escape-Mission blieb unberührt (beide Spielstände nebeneinander); im Hauptmenü stehen „Weiterspielen“ und „Neue Runde“.
- **Escape:** Sechser-Mission bis zum Rätsel gespielt, zwei falsche Folgen (einmal mit richtigem Platz, einmal ohne), Hinweis und Markierungen geprüft, Änderung blendet den Hinweis aus, dann die richtige Folge; Abschluss zeigt genau die sechs bestätigten Aufgaben in drei Schlüsselgruppen, Beobachtungsfrage, Geschenk; erneutes Öffnen über „Ansehen“ liefert identische Funde, Frage und Geschenk.
- **Alter Spielstand:** ein künstlich auf das frühere Schema 1 umgeschriebener Escape-Stand mit fehlendem und unbekanntem Bild lud ohne Fehler und blieb mit den Namen lesbar.
- **Offline:** nach vollständig gefülltem Cache (18 Dateien, davon 4 Familienbilder) und gestopptem Server: Neuladen, Fortsetzen, Fund bestätigen, Tausch und Tausch rückgängig, Bilder und Familienbild funktionierten.
- **Automatisch:** 235 Prüfungen (231 laufen, 4 übersprungen), darunter neu: Einstieg nie ein seltener Fund über alle Jahreszeiten und Altersgruppen, Tausch + Rückgängig stellt die Runde Bit für Bit wieder her (inklusive Zählstand), `checkAttempt` für alle sechs Reihenfolgen, Alt-Stand mit fehlenden Bilddaten, gespeicherte Auswahl „Walddetektive“.

## Vorher / Nachher

| | Vorher (Benchmark) | Nachher (390 × 844) |
|---|---|---|
| Mobile Startseite | `docs/ux-benchmark/vorher/start-mobil.jpg` | `docs/ux-benchmark/nachher/start-mobil-390.jpg` |
| Suchkarte | `docs/ux-benchmark/vorher/suchkarte-mobil.jpg` | `docs/ux-benchmark/nachher/suchkarte-mobil-390.jpg` |
| Walddetektive-Karte | `docs/ux-benchmark/vorher/walddetektive.jpg` | im Bild der Startseite, Karte mit Badge |
| Tresor, Fehlversuch | – | `docs/ux-benchmark/nachher/escape-fehlversuch-mobil-390.jpg` (Stand der Markierungen; der Hinweistext steht inzwischen direkt über den Plätzen) |
| Abschluss | – | `docs/ux-benchmark/nachher/escape-abschluss-mobil-390.jpg` |

## Offene Prüfpunkte

- Feldtest am Waldweg: Ob Familien **ohne Hilfe in 30 Sekunden starten** und **nach fünf Sekunden sagen oder zeigen können, wonach sie suchen**, sind Zielwerte, keine Ergebnisse des Browsertests.
- Echte Geräte, Bildschirmleser (VoiceOver, TalkBack) und Tastatur-Durchgang mit echter Hardware wurden nicht geprüft; geprüft sind Emulation, DOM-Zustand und die Beschriftungstexte.
- Die Reihenfolge der Beobachtungsfragen und ihre Formulierung sind nicht mit Kindern erprobt.
- Die im Benchmark angeregte Vorlesetaste ist bewusst nicht Teil dieser Änderungen und bleibt ein eigener Versuch.
- Veröffentlichung: nicht erfolgt. Der Stand liegt geprüft im Arbeitsbaum bzw. als lokaler Commit; Push und Cloudflare-Build folgen getrennt.

# Wald-Spiel – Draußen spielen. Gemeinsam staunen.

Kleine Entdeckermissionen für Waldspaziergänge mit Kindern von 2 bis 10 Jahren. Erwachsene wählen das Alter, die App stellt eine **Waldmission** aus ein bis fünf konkreten Aufgaben zusammen („Finde eine Eichel mit einem Hütchen“, „Entdecke einen Zapfen, an dem viele Schuppen fehlen“). Sind alle Aufgaben vollständig gefunden, gibt es kurz Konfetti und ein **Waldgeschenk**: eine kleine, sachlich geprüfte Naturgeschichte. Es gibt nur den Wald, keine Ortsauswahl. Alles läuft lokal im Browser: kein Backend, kein Login, kein Standort, keine externen Bilder oder Schriften. Die sichtbare Marke ist **Wald-Spiel** (früher *Entdeckerzeit*). Technische Namen (Speicherschlüssel entdeckerzeit:v1:*, Cache-Präfix, Projektordner) bleiben unverändert, damit gespeicherte Runden und Installationen nicht verloren gehen.

## Stack

React 19 · TypeScript 7 · Vite 8 · Vitest 5 · `sharp` (nur zum Erzeugen des Hintergrunds) · Schriften Fredoka und Nunito (lokal über `@fontsource-variable`).

## Start, Build, Test

```bash
npm install
npm run dev            # Entwicklungsserver (kein Service Worker)
npm run build          # Typprüfung + Produktionsbuild nach dist/
npm run preview        # Produktionsbuild auf http://127.0.0.1:4173
npm test               # Katalog-, Generator-, Geschenk-, Speicher-, Bild-, Hintergrund- und Kontrasttests
npm run docs:generate  # docs/KATALOGABDECKUNG, ZIEHVERTEILUNG, BILDZUORDNUNG, OBJEKTINFOS, WALDGESCHENKE neu schreiben
npm run images:render  # alle Suchbilder als PNG und Vorher/Nachher-Blatt nach docs/vergleich (Vorlage: docs/vergleich/vorher)
npm run images:forest  # Hintergrund „Lichter Waldweg“ neu zeichnen und exportieren
```

Interne Bildübersicht aller Motive: `…/#/intern/bilder` (nicht verlinkt). Die Windows-Startdatei `Entdeckerzeit starten.bat` baut bei Bedarf und öffnet die Seite. **Nach einer neuen Version** zeigt ein Browser mit gespeicherter alter Fassung sie erst nach dem Schließen aller Tabs oder über den Hinweis „Jetzt aktualisieren“ im Hauptmenü.

## Drei Spielmodi

Direkt unter dem Kopf wählt ihr: **Waldschätze suchen** (das entspannte Suchspiel), **Walddetektive** (in dieser Fassung noch nicht vorhanden, die Kachel sagt das ehrlich) und **Wald Escape – Knackt den Waldtresor!** (gemeinsame Zeitmission: drei Schlüssel, jeder aus 2 oder 3 verschiedenen Entdeckungen, also 6 oder 9 Aufgaben; kleines Symbolrätsel, Waldtresor mit Geschenk). Spielregeln, Zeitlogik, Katalogfilter, Bilder und Prüfstand von Wald Escape: docs/WALDESCAPE.md. Jeder Modus hat seinen eigenen Spielstand; Moduswechsel startet oder löscht nie etwas.

## Was die App kann

- **Hintergrund:** eigene Illustration „Lichter Waldweg“ (warmes Licht, freundliche Bäume, Lichtung, kleine Waldfunde am Rand), WebP mit JPEG-Rückfall, Quer- und Hochformat, ruhige Rückfallfläche, keine Animation. Am Einstieg gut sichtbar, im Spiel stark zurückgenommen. Auswahlflächen stehen auf fast deckenden hellen Karten.
- **Aufgaben:** konkrete Funde und Spuren (Eichel, Eichelhütchen, Buchecker, aufgeplatzte Buchenhülle, Haselnuss, Nussschale mit Öffnung, Zapfen, abgenagter Zapfen, Zapfenformen, Ahornfrucht, Nadelzweig, Buchenknospe, Eichen- und Ahornblatt, Blattskelett, Blattmine, Galle, Moos, Farn, Farn-Sporen, Baumpilz, Flechte, Tierabdruck …). Allgemeine Rinden-, Baum-, Boden-, Wurzel- und Stockaufträge sind ausgemustert. Baumarten sind freiwillig: Eine bestätigte Art macht passende Funde wahrscheinlicher, ohne sie vorauszusetzen.
- **Info am Bild:** drei ausgearbeitete Bausteine je Altersgruppe („Das habt ihr vor euch“, „So ist es entstanden“, „Sein kleines Waldgeheimnis“), bei 7–10 zusätzlich eine Denkfrage.
- **Abschluss:** `isFullyFound` (jede vereinbarte Aufgabe `done`) → genau ein Waldgeschenk, einmal Konfetti, Geschenkkarte, „Unseren Fundschatz ansehen“, „Neue Waldmission“, „Hauptmenü“. Das Geschenk bleibt unter „Unsere Waldgeheimnisse“ im Hauptmenü lesbar. Rückgängig nimmt Fortschritt zurück, nie das Geschenk. Details: `docs/WALDGESCHENKE.md`.
- **Hauptmenü** von überall (Spiel, Info, Hilfe, Bildvergrößerung, Geschenk): pausiert und speichert ohne Nachfrage.
- **Altes:** Der Katalog behält frühere Vorlagen als *ausgemustert* (nie gezogen, für alte Runden erhalten). Eine gespeicherte Runde eines früheren Ortes wird unverändert archiviert und im Hauptmenü einmal erklärt. Ältere, schon abgeschlossene Runden bekommen **nie rückwirkend** Konfetti oder Geschenk (`giftEligible`).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/catalog/templates.ts` | Alle Vorlagen. `curateForest` setzt Waldzuschnitt, Leitmotive und die konkreten Aufträge (`PATCH`). |
| `src/catalog/infos.ts` | Objektinfos je Vorlage und Altersgruppe |
| `src/catalog/concepts.ts`, `extras.ts` | Suchhinweise, Entdeckermomente, Bilderrätsel, interne Belege |
| `src/catalog/gifts.ts`, `giftSources.ts` | Waldgeschenke (3 Altersfassungen) und Quellenverzeichnis mit Prüfstand |
| `src/domain/generator.ts` | Auswahl mit Leitmotiv, Aufgabentausch |
| `src/domain/gift.ts` | Abschlussprüfung, Geschenkauswahl und -vergabe (rein, idempotent) |
| `src/domain/storage.ts` | versionierte Speicherung, Archiv früherer Runden |
| `src/illustrations/` | alle Suchbilder als eigene SVG-Zeichnungen, Waldmotive in `forest.tsx` |
| `src/ui/` | Oberfläche; `Confetti.tsx`, `GiftCard.tsx`, `ForestBackground.tsx` |
| `scripts/make-forest-background.mjs` | zeichnet und exportiert den Hintergrund |
| `docs/` | `WALDKATALOG`, `WALDGESCHENKE`, `OBJEKTINFOS`, `BILDNACHWEIS`, `SPIELKONZEPT`, erzeugte Übersichten |

## Offline-Prüfung

1. `npm run build && npm run preview`, Seite auf `http://127.0.0.1:4173` öffnen.
2. Warten, bis „Für unterwegs bereit“ erscheint (nur wenn **alle** vorgeladenen Dateien im Cache liegen).
3. Server beenden, Seite neu laden: Mission fortsetzen, neu starten, Aufgabe tauschen, Info öffnen und Mission mit Geschenk abschließen müssen weiter funktionieren. **In der aktuellen Fassung wurde das nicht mit gestopptem Server geprüft** (siehe `docs/WALDKATALOG.md`).

## Katalogpflege

- **Neue Vorlage:** Zeile in `specs`, Leitmotiv in `THEME_OF`, Auftrag ggf. in `PATCH`, Zeichnung unter gleichem Schlüssel, Info in `infos.ts`, Suchhinweis in `concepts.ts`. Tests melden Lücken.
- **Neues Geschenk:** Eintrag in `gifts.ts` mit drei Altersfassungen und Quellen-IDs aus `giftSources.ts`.
- `CATALOG_VERSION` bei inhaltlichen Änderungen erhöhen; danach `npm test` und `npm run docs:generate`.

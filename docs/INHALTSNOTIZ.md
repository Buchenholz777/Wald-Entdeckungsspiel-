# Inhaltsnotiz: redaktionelle Änderungen am Anhang A

> **Historisch.** Diese Notiz beschreibt die Entwicklung bis Katalogstand 2.1.0 mit neun Orten. Seit 3.0.0 gilt nur noch der Wald; der aktuelle Zuschnitt, die Leitmotive und der Quellenstand stehen in `WALDKATALOG.md`. Die frühere Neun-Orte-Abdeckung ist kein Abnahmekriterium mehr.

Die 90 Ausgangsideen sind vollständig im Katalog (`src/catalog/templates.ts`, Feld `sourceNo`). Die Tabellenwerte wurden gegen die strengeren Regeln des Entwicklungs-Prompts geprüft. Abweichungen:

| Nr. | Änderung | Grund |
|---|---|---|
| 11 / 17 / 45 | gemeinsames Konzept `tree`; 17 und 45 mit eigenen Texten | Bereinigung laut Anhang: ein Baum erscheint pro Runde nur einmal |
| 12 / 18 | Konzept `twig`; 12 als Zählvorlage (1–3) | Zweig-Konzept; Zählen unproblematisch, Zweige müssen nicht aufgehoben werden |
| 13 / 34 | Konzept `bark`; 34 erst ab 7 Jahren | Vergleich zweier Rinden ist anspruchsvoll |
| 15, 20–29, 79 | gemeinsames Konzept `leaf` | nie zwei Blattaufgaben in einer Runde |
| 15, 23–26 | Zählvorlagen; für 2–3 höchstens 2 (15, 23) bzw. 1 | Altersregel „meist 1, höchstens 2“ |
| 28, 29 | nur 7–10, nur mit bestätigter Art (Ahorn/Eiche), Zählvorlagen bis 5, „Mehr zählen“ bis 10 | Tabelle: Ab 7; Prompt: Arten nur mit Kontext |
| 30 | Zählvorlage; „Zapfen“, nicht „Tannenzapfen“; Zusatz für 7–10 erklärt Tanne vs. Fichte | Leitplanke zu Zapfenbegriffen (Beleg: Nationalpark Schwarzwald) |
| 56 | nicht für 7–10 | Der Auftrag „Zeig mir den Himmel“ ist als erste Aufgabe für Ältere unterfordernd |
| 57 | Zählvorlage 1–3 (4–6) bzw. 1–4 (7–10) | Blüten dürfen gezählt, aber nicht gepflückt werden |
| 58, 87 | Zählvorlagen, nur ab 4, `smallParts`; Hinweis „nicht zum Essen“ | Kleinteile nicht für 2–3; Kastanie/Eichel nicht essbar |
| 60, 64, 65 | Konzept `shell`; 60 zählbar (4–6: bis 3) | Schalen-Konzept |
| 62 | Konzept `wood` (mit 32), eigene Texte für Treibholz | Holz-Konzept laut Anhang |
| 63, 70, 76, 84 | Konzept `stone`; 70 als Zählvorlage mit Mindestmenge 2 („unterschiedlich hell“) | Stein-Konzept; ein einzelner Kiesel ergibt keinen Helligkeitsvergleich |
| 69 / 52 | Konzept `footprint` (Vergleich 69 erst ab 4) | Fußspur-Konzept |
| 75 / 86 | Konzept `path` | Weg-Konzept |
| 77 / 88 / 16 | Konzept `grass` | Gras-Konzept |
| 41 / 39 | Konzept `sign`; 40 / 42 Konzept `number` | Anhang: „nicht mit Hausnummer doppeln“ |
| 67 | Schwierigkeit 1, Verfügbarkeit „situationsabhängig“ | Tierbeobachtung nie als zwingender Abschluss |
| 9, 10, 51, 52, 59, 68, 69, 70, 76, 80 | an Kontextangaben gebunden (Schatten, Pfützen, Sand, Kies, Schnee) | Schnee/Pfütze/Schatten/Sand nie aus Jahreszeit gefolgert |

## Ergänzungen und Entscheidungen

- **Kontextangaben** je Ort stehen in `src/domain/meta.ts` (`CONTEXT_BY_ENV`). Ein Test stellt sicher, dass jede Kontextbedingung an jedem Ort der Vorlage auch auswählbar ist und jede angebotene Angabe mindestens eine Aufgabe freischaltet.
- **Zusätzliche Vorlagen** waren nicht nötig: Jede Kernkombination (9 Orte × 4 Jahreszeiten × 3 Altersgruppen) bietet ohne Kontext mindestens 5 unterschiedliche Konzepte (siehe `KATALOGABDECKUNG.md`).
- **Abstrakte Aufgaben** (Rund, Lang, Linien, Muster …), in v1 seltener gezogen, jetzt ausgemustert; früher (Gewicht ×0,5, für 2–3 Jahre ×0,35), höchstens eine bzw. zwei pro Runde und nie als Einstieg.
- **Texte:** Die Kindertexte wurden redaktionell aus Allgemeinwissen verfasst. Geprüft gegen Quellen wurden die heikelsten Aussagen (Tannen-/Fichtenzapfen; Rosskastanie nicht essbar), siehe `factSources` in `src/catalog/concepts.ts`. Alle übrigen Konzepte tragen den Vermerk „Gegenprüfung durch Fachlektorat steht aus“. Ein Fachlektorat wurde **nicht** durchgeführt.

---

# Inhaltsvorgabe v2: konkrete Funde und Spuren (Katalogstand 2.0.0)

**Leitidee:** „Wir suchen einen bestimmten, erkennbaren Fund oder eine konkrete Spur – etwas, wofür wir wirklich genauer hinschauen müssen.“ Diese Vorgabe hat bei Konflikten Vorrang vor der früheren Vorgabe „besonders einfache Einstiegsaufgaben“ und den früheren Alterszuordnungen. Sie darf bei künftigen Katalogänderungen nicht zurückgedreht werden. Die Tests in `tests/catalog.test.ts` und `tests/generator.test.ts` schlagen an, wenn Ausgemustertes zurückkehrt.

## Ausgemustert (`retired`: nie neu gezogen oder getauscht, für gespeicherte Runden technisch erhalten)

| Nr. | Bisherige Aufgabe | Ersatz |
|---|---|---|
| 1–8 | etwas Rundes / Langes, gerade und gebogene Linie, Muster, zwei Farben, hell/dunkel, hoch/niedrig | konkrete ortstypische Aufträge (Y-Zweig, Zapfen, Muschelrillen, Schneckenhaus …) |
| 11, 17, 45 | Baum, Nadelbaum, Straßenbaum | Baumrinde mit tiefen Rillen, Zapfen, Moospolster, Pilz |
| 12 | Zweig (beliebig) | Zweig, der sich wie ein Y teilt (Nr. 18, jetzt auch für 2–3) |
| 16, 77, 78 | Gras, Gras am Weg, niedrige Pflanze | Pusteblume, Halm mit Samenstand |
| 32, 54, 59, 60, 63, 84 | liegendes Holz, Holzbrett, Sand am Strand, beliebige Muschelschale, großer Stein, Stein am Ufer | weiße Muschelschale, Muschelschale mit Rillen, heller glatter Stein |
| 56 | Himmel | – |
| 81, 86 | Wasseroberfläche, Weg am Wasser | Spiegelung (Nr. 82), Bachbiegung (Nr. 85), Schilf (Nr. 83) |

## Neu (Nr. 101–116) und überarbeitet

- **Wald:** Haselnuss (Kontext „Haselstrauch“), Buchecker (Kontext „Buche“, gelegentlich), Zapfenvergleich, Pilz, Feder, Schneckenhaus, Moospolster, Y-Zweig, braune Kastanie, Eichel mit Hütchen. Kastanie, Eichel und Haselnuss sind jetzt **auch für 2–3 Jahre** zugelassen, nur als einzelner Fund zum Anschauen (nie Sammelauftrag), nur im Herbst und nur mit bestätigter Art.
- **Strand:** weiße Muschelschale, Muschelschale mit Rillen (jetzt ab 2), längliches Schneckenhaus mit Spirale, Vergleich Muschel/Schneckenhaus (ab 7), heller glatter Stein, Vogelspur im Sand (Kontext „Sand“).
- **Spuren:** Tierabdruck im weichen Boden (4–6), mögliche Rehspur und Hundeabdruck (7–10, immer „könnte … passen“). Alle brauchen die freiwillige Angabe „Weicher Boden oder Matsch“ bzw. „Sand“, sie werden nie aus dem Kalender abgeleitet.
- **Wiese und Garten:** Maulwurfshügel, Pusteblume (Frühling/Sommer), Feder; Hecke und Zaun jetzt auch an der Wiese.
- **Stadt und Spielplatz:** unverändert konkret (Bank, Tür, Fenster, Fahrrad, Schild, Zahl, Pflaster, Deckel, Topf, Zaun, Hecke, Rutsche, Schaukel, Sandkasten …); keine Naturfunde vorausgesetzt.
- Neue Kontextangaben: *Haselstrauch vorhanden*, *Buche vorhanden*, *Weicher Boden oder Matsch* (nur dort angeboten, wo sie Aufgaben freischalten).

## Konzept-IDs

`shell` (Muschelschale, ohne Schneckenhäuser) · `snailShell` (Schneckenhaus, auch der Vergleich) · `hazelnut` · `beechnut` · `chestnut` · `acorn` · `cone` (auch Zapfenvergleich) · `track` (alle Tierspuren, damit nie zwei Spuren in einer Runde) · `feather` · `mushroom` · `molehill` · `dandelion`. Die Familien `fruits` (Zapfen, Nüsse, Kastanien, Eicheln) und `tracks` begrenzen, wie viele ähnliche Funde in einer Runde vorkommen (höchstens zwei).

## Generatorregeln seit v2

- Ausgemusterte Vorlagen werden in `isEligible` ausgeschlossen. Das gilt für neue Runden und für den Tausch.
- Der Einstieg ist ein konkreter, häufiger Fund, nie ein Vergleich. Es wird nicht mehr nach dem einfachsten Motiv sortiert.
- Jedes Konzept zählt gleich, egal wie viele Varianten es hat (sonst dominieren Blattfarben). Häufige Funde ×2 statt ×3.
- Mindestens drei häufige Funde bei Fünferrunden (weiches Ziel); kleine Runden werden nicht auf häufige Funde gezwungen (sonst käme in kleinen Pools immer dasselbe).
- Die tatsächliche Verteilung steht in `ZIEHVERTEILUNG.md` (400 Runden je Kombination, feste Seeds).

## Quellenprüfung

Geprüft am 2026-11-04: Zapfen (Tanne zerfällt, Fichte fällt im Ganzen), Rosskastanie nicht essbar, Buchecker (dreikantig, zwei Nüsse je Hülle, roh leicht giftig; die Aussage „vier Klappen“ wurde nicht bestätigt und deshalb nicht verwendet), Spuren (Reh: zwei Schalen ohne Zehen; Hund: Ballen mit vier Zehen und meist sichtbaren Krallen). Alle anderen neuen Texte sind redaktionell aus Allgemeinwissen und tragen den Vermerk „Gegenprüfung durch Fachlektorat steht aus“.

## Gespeicherte Runden

Laufende Runden speichern Texte, Mengen und Bildschlüssel selbst. Sie bleiben unverändert und werden nicht gelöscht. Die neue Auswahl gilt nur für neu gestartete Runden. Die Bilder ausgemusterter Vorlagen bleiben deshalb in der Bildwelt enthalten.

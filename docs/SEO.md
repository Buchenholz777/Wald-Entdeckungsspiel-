# SEO und öffentliche Einstiegsseiten (Fassung 4.3)

Stand: 7. November 2026. Quelle der Wahrheit für Titel, Beschreibungen, Überschriften, Navigation, Sitemap und die statischen Seiten ist `src/seo/site.ts`.

## Quellstand

Gebaut wird aus diesem Repository (`Wald-Entdeckungsspiel-`, Branch `main`, Cloudflare Pages: `npm run build`, Ausgabe `dist`). Der Ordner `entdeckerzeit/` im Arbeitsordner ist die frühere Fassung und wurde nicht verändert. Die Beschreibungen folgen dem tatsächlichen Stand: drei Moduskarten mit „Bald verfügbar“ bei Walddetektive, Wald Escape mit Fundgruppen (2 bzw. 3 Aufgaben je Schlüssel, 6 bzw. 9 Aufgaben, 8 bzw. 12 Karten, Sanduhr 10/15/20/30 Minuten) und Waldgeschenken. Die Zahlen der Escape-Seite kommen aus `domain/escape/types.ts` und die Altersangaben aus `domain/meta.ts`.

## Bestätigte Ausgangsbefunde (7. November 2026, `curl` gegen die Live-Domain)

| Befund | URL | Auswirkung | Korrektur |
|---|---|---|---|
| Startseite lieferte einen leeren `div#root`, keinen Inhalt, keine H1, keine Links; kein Canonical, kein JSON-LD, kein `og:url`/`og:image` | `https://www.wald-spiel.de/` | Inhalt nur nach JavaScript-Rendering sichtbar; keine Vorschaubilder für soziale Netzwerke | Statischer Inhalt, Canonical, Open Graph, JSON-LD im initialen HTML (`index.html` + `src/seo`) |
| `robots.txt`, `sitemap.xml` und jede unbekannte Adresse (`/waldschatzsuche/`, `/gibt-es-nicht-xyz`) antworteten mit **200** und der App-Hülle (HTML) | `/robots.txt`, `/sitemap.xml`, `/…` | Soft-404: Crawler erhalten HTML statt robots/Sitemap, ungültige Adressen wirken wie Seiten | echte `robots.txt` und `sitemap.xml`, `404.html` (Cloudflare Pages liefert sie mit Status 404 und schaltet damit den Einseiten-Fallback ab) |
| Keine eigenen Adressen für Spielarten und Anleitung | – | Nur eine indexierbare Seite | `/waldschatzsuche/`, `/wald-escape/`, `/anleitung/` als echte Seiten |
| `http://www.` leitet per 301 auf `https://www.` | `http://www.wald-spiel.de/` | in Ordnung | – |
| `http://wald-spiel.de/` leitet per 302 (nginx 1.6.2, anderer Server) auf `http://www.wald-spiel.de` und von dort per 301 auf https | `http://wald-spiel.de/` | zwei Sprünge, der erste temporär | externer Schritt (siehe unten) |
| `https://wald-spiel.de/` antwortet nicht (Zeitüberschreitung nach 20 s); der Apex-Name zeigt per DNS auf einen anderen Server als `www` (CNAME auf `wald-entdeckungsspiel.pages.dev`) | `https://wald-spiel.de/` | Besucher und Links ohne „www“ landen im Leeren | externer Schritt (siehe unten) |
| Google-Analytics-Tag (`G-ERW5Y3F1W7`) steht genau einmal am Anfang des `<head>`; Einwilligungssteuerung gibt es nicht | alle | Messung startet ohne Zustimmung | siehe „Datenschutz und Messung“ |

Search-Console-Daten standen nicht zur Verfügung; Aussagen zur Indexierung beruhen nur auf den Abrufen. JavaScript-Rendering allein ist kein Beleg für einen Indexierungsfehler.

## Öffentliche URLs

Prioritäten sind eine qualitative Einschätzung (keine Suchvolumina vorhanden). Jede Seite hat genau einen Titel, eine Beschreibung, einen Canonical, eine sichtbare H1 und JSON-LD.

| Pfad | Hauptkeyword (Ergänzend) | Title (Zeichen) | Description (Zeichen) | H1 | Aufgabe |
|---|---|---|---|---|---|
| `/` | Waldspiele für Kinder (Spiele im Wald mit Kindern, Waldspaziergang mit Kindern, Waldspiel App) | Waldspiele für Kinder von 2 bis 10 Jahren – Wald-Spiel (54) | Waldspiele für Kinder von 2 bis 10 Jahren. Entdeckt gemeinsam Blätter, Zapfen und kleine Spuren. Wählt eure Waldmission und startet direkt im Browser. (150) | Waldspiele für Kinder – gemeinsam draußen entdecken | Angebot erklären, Spiel wählen, Elternbereich, Links auf die drei Seiten |
| `/waldschatzsuche/` | Waldschatzsuche für Kinder (Schatzsuche im Wald, Suchspiel im Wald, Natur entdecken mit Kindern) | Waldschatzsuche für Kinder – direkt starten – Wald-Spiel (56) | Macht euren Waldspaziergang zur Schatzsuche. Wählt passende Suchaufgaben für eure Kinder, schaut gemeinsam genau hin und bestätigt eure Entdeckungen. (149) | Waldschatzsuche für Kinder | echter Beispielauftrag mit Bild, Alter, Fund bestätigen, fehlender Gegenstand, Pause |
| `/wald-escape/` | Escape-Spiel im Wald für Kinder (Wald Escape, Outdoor Escape für Familien, Waldtresor) | Escape-Spiel im Wald für Kinder – Wald Escape (45) | Sucht gemeinsam Waldschätze, erspielt Schlüssel und öffnet den Waldtresor. Entdeckt Wald Escape für Kinder ab vier Jahren mit erwachsener Begleitung. (149) | Wald Escape – gemeinsam den Waldtresor öffnen | Fundgruppen, Sanduhr, Pausen, Zeitablauf, Rätsel mit den aktuellen Zahlen |
| `/anleitung/` | Wald-Spiel Anleitung (Wald-Spiel offline, Alter, auf dem Handy) | Wald-Spiel Anleitung – Alter, Ablauf und Offline-Nutzung (56) | So nutzt ihr Wald-Spiel beim Waldspaziergang. Erfahrt, welches Spiel zum Alter passt, wie ihr eine Runde startet und die Offline-Nutzung vorbereitet. (149) | So spielt ihr Wald-Spiel | acht Familienfragen, Regeln beim Beobachten, Datenhinweis |

Walddetektive hat **keine** Seite, keine Sitemap-Zeile und keine Auszeichnung als verfügbares Spiel; die Startseite nennt es mit „Bald verfügbar“. Nicht umgesetzt, weil die Erwartung nicht erfüllt würde: „Waldbingo“, „Schnitzeljagd“, „zum Ausdrucken“, „GPS-Schatzsuche“ (kein Bingokarten-Download, kein PDF, keine GPS-Funktion). „Kostenlos“ steht nirgends, weil es nicht als Betreiberaussage bestätigt ist.

**Suchintention (zwei öffentliche Suchen am 7. November 2026, Beobachtung):** Für Waldspiele und Waldschatzsuche liefern Ratgeberseiten von Familienportalen, Verbänden und Verlagen vor allem Ideensammlungen, Druckvorlagen und Schnitzeljagd-Anleitungen mit Bastelmaterial. Für „Escape im Wald“ erscheinen vorwiegend buchbare Outdoor-Escape-Angebote (Orte, Gruppen, Termine) und Lehrmaterial. Als Informationslücke fällt auf: ein Spiel, das ohne Material, Vorbereitung und Buchung direkt auf dem Handy mit einem konkreten Suchauftrag beginnt. Darauf zielen die Seiten.

## Umsetzung

| Datei | Inhalt |
|---|---|
| `src/seo/site.ts` | Seitenliste (Pfad, Title, Description, H1, lastmod), gemeinsame Texte der Startseite (React und statisches HTML), die Seiteninhalte als HTML |
| `src/seo/build.ts` | Kopfdaten (Title, Description, Canonical, Open Graph, Twitter-Karte, JSON-LD), Unterseiten, 404-Seite, Sitemap |
| `index.html` | Platzhalter `<!--SEO_HEAD-->` und `<!--SEO_ROOT-->`, der Google-Tag bleibt unverändert am Anfang |
| `vite.config.ts` | `seoHomePlugin` (Startseite, auch im Dev-Server) und Erweiterung des Precache-Plugins: erzeugt `waldschatzsuche/`, `wald-escape/`, `anleitung/`, `404.html`, `sitemap.xml`; nimmt die Inhaltsseiten und das Beispielbild in die Offline-Liste auf (nicht die 404-Seite, damit ein 404-Status die Installation nicht scheitern lässt) |
| `src/pwa/sw-template.js` | Navigationen zu vorgeladenen Seiten werden unter ihrer eigenen Adresse beantwortet (vorher bekam jede Adresse die App-Hülle). Nur die Startadresse bekommt die Hülle, unbekannte Adressen gehen ins Netz (echte 404), ohne Netz zurück zur Startadresse |
| `public/robots.txt`, `public/_headers` | `Allow: /` mit Sitemap-Adresse; lange Caches für gehashte Dateien |
| `public/og`, `public/seo`, `scripts/make-seo-images.mjs` | Vorschaubild 1200 × 630 (Ausschnitt der Waldillustration mit Blattzeichen) und das echte Suchbild „Nadelzweig“ der Waldschatzsuche-Seite (`npm run images:seo`) |
| `src/ui/SetupScreen.tsx`, `App.tsx` | H1 „Waldspiele für Kinder – gemeinsam draußen entdecken“, Elternbereich mit echten Links; Einstieg `#/modus/waldschaetze` und `#/modus/escape` wählt nur den Modus und zeigt das Hauptmenü (kein Start, kein Ersetzen eines Spielstands, bei laufender Runde steht „Weiterspielen“) |
| `scripts/serve-pages-emulation.mjs` | Prüfhilfe: bildet Verzeichnis-Index, 308 auf Schrägstrich, 404.html mit Status 404 und Brotli nach (kein Ersatz für Cloudflare) |

Hash-Routen und Spielzustände (`#/runde`, `#/escape`, `#/hilfe` …) teilen sich das Dokument `/` und stehen nicht in der Sitemap; es gibt kein globales `noindex`. Alte Lesezeichen und die installierte App (`start_url ./`) funktionieren unverändert. Die Unterseiten laden keine Spiellogik (kein JavaScript außer dem Analytics-Tag).

## Geprüft (tatsächlich ausgeführt)

- **Tests:** `tests/seo.test.ts` (12 Prüfungen: eindeutige Titel und Beschreibungslängen, je Dokument genau ein Title/Description/Canonical/H1/Google-Tag, Open Graph mit absoluten Adressen, JSON-LD als gültiges JSON mit auflösbaren `@id`, keine Bewertungen/Preise/Organisation/Detektiv, interne Links, Sitemap = Seitenliste, 404 mit `noindex` ohne Canonical, Escape-Zahlen aus den Spieldaten, keine Versprechen wie „kostenlos“) und die bestehenden Tests: 253 Prüfungen bestanden (4 übersprungen), Typprüfung und Build sauber.
- **Direktaufrufe in der Pages-Nachbildung** (`curl`): `/`, `/waldschatzsuche/`, `/wald-escape/`, `/anleitung/`, `/robots.txt`, `/sitemap.xml`, Bilder → 200 mit passendem Inhaltstyp; ohne Schrägstrich und `…/index.html` → 308 auf die Adresse mit Schrägstrich; `/gibt-es-nicht-xyz` und `/assets/fehlt.js` → 404. Das belegt das Verhalten der Nachbildung, **nicht** die echte Cloudflare-Umgebung.
- **Browser (Produktionsbau, 390 × 844):** Seiten sichtbar und lesbar, kein waagerechter Überlauf; Startseite mit Überschrift, drei Karten (Badge „Bald verfügbar“), Elternbereich und Links; von `/waldschatzsuche/` zum Spiel: Modus „Waldschätze“ gewählt, laufende Runde erhalten, „Weiterspielen“; von `/wald-escape/` zum Spiel: Modus „Wald Escape“ gewählt, Runde im anderen Modus erhalten, Escape-Mission von Hand bis zum Tresor mit Geschenk gespielt (6 bestätigte Aufgaben); alte Hash-Adressen `#/runde`, `#/hilfe`, `#/escape`, `#/abschluss`, `#/intern/bilder` funktionieren.
- **Offline** (Server gestoppt, Cache vollständig, „Für unterwegs bereit“): `/waldschatzsuche/?utm_source=test` und `/anleitung/` laden mit Beispielbild aus dem Cache, der Canonical zeigt die saubere Adresse; vom Menü aus lässt sich die laufende Runde fortsetzen; eine unbekannte Adresse führt zurück zur Startadresse. Cache: 18 Einträge, darunter die drei Seiten.
- **Lighthouse 12.8.2** (7. November 2026, Chrome headless, Emulation „mobil“, simulierte Drosselung, gegen die lokale Pages-Nachbildung mit Brotli; reine **Labormessung**, keine Felddaten): Startseite Leistung 79, Barrierefreiheit 100, Bewährte Verfahren 100, SEO 100 – FCP 2,4 s, **LCP 4,7 s**, TBT 100 ms, CLS 0,018 (LCP-Element: der Einladungstext, der erst mit dem JavaScript-Start der App neu gezeichnet wird; JS 206 KB komprimiert). `/waldschatzsuche/`: Leistung 93, FCP 1,4 s, LCP 1,7 s, CLS 0,02. `/wald-escape/`: Leistung 100, FCP 1,4 s, LCP 1,5 s, CLS 0,007. Ohne Kompression (erste Messung der Startseite) lagen LCP bei 7,5 s und Leistung bei 62: Die Auslieferung muss komprimiert erfolgen (Cloudflare tut das).

## Nicht geprüft / offen

- Echte Cloudflare-Antworten nach der Veröffentlichung (Statuscodes, 404-Seite, Brotli, Header, Verzeichnis-Weiterleitung), Rich Results Test und Schema.org-Validator (beide brauchen die öffentliche URL), PageSpeed Insights, Search Console, Felddaten (LCP/INP/CLS beim 75. Perzentil), echtes Mobilgerät.
- **LCP der Startseite im Labor 4,7 s über dem Ziel von 2,5 s.** Hebel: Der JavaScript-Bündel (Katalog, alle Suchbilder als Code, Escape) wird komplett vor der Spielauswahl geladen. Nächster Schritt wäre, Suchbilder und Katalog erst beim Rundenstart nachzuladen (Chunks wären wie alle Dateien im Offline-Cache). Das ist ein größerer Umbau und wurde ohne Felddaten nicht begonnen. Die statischen Unterseiten erreichen das Ziel im Labor.
- JSON-LD ist als gültiges JSON und mit auflösbaren Verweisen geprüft; die Google-Darstellung als Software-Anwendung verlangt Angebot und Bewertung. Beides fehlt bewusst (keine erfundenen Preise oder Bewertungen). `WebApplication` bleibt semantisch sinnvoll, löst aber voraussichtlich keine besondere Darstellung aus. Für FAQ-Inhalte gibt es keine Google-FAQ-Auszeichnung (Format laut Googles Dokumentation seit Mai 2026 eingestellt).
- Eine Organisation wird nicht ausgezeichnet: Betreiberangaben liegen nicht vor.

## Datenschutz und Messung

- Beim Aufruf jeder Seite lädt der Google-Tag und sendet ohne Einwilligung eine Seitenaufruf-Messung (im Lighthouse-Lauf sichtbar: `page_view` mit Host `127.0.0.1`). Der Datenhinweis der Hilfe, die Anleitung und die Fußzeile der Unterseiten sagen das offen. **Abweichung:** Eine Einwilligungssteuerung und eine Datenschutzerklärung/ein Impressum gibt es nicht; für eine Seite für Familien ist beides vor einer Veröffentlichung zu klären (Einwilligung vor dem Laden des Tags, TTDSG/DSGVO).
- Meine lokalen Tests haben Seitenaufrufe mit den Hosts `localhost` und `127.0.0.1` an die Property gesendet. In Google Analytics lassen sie sich über einen Datenfilter für interne/Entwickler-Zugriffe oder die Hostname-Dimension ausschließen. Der Tag ist nicht doppelt geladen (je Dokument genau einmal, getestet).
- Zusätzliche Ereignisse (Klick von einer Einstiegsseite zum Spiel, erfolgreicher Rundenstart) wurden **nicht** ergänzt: Ohne Einwilligungssteuerung wäre jede weitere Datenerfassung nicht vom vorhandenen Rahmen gedeckt. Vorschlag nach Einführung der Einwilligung: genau zwei Ereignisse ohne Namen und Fundlisten, `landing_to_game_click` (Parameter: Seite, Modus) und `round_started` (Parameter: Modus, Altersgruppe); ein Klick und ein Start bleiben so unterscheidbar.

## Externe Schritte nach der Veröffentlichung

1. **Cloudflare / DNS:** `www.wald-spiel.de` bleibt Hauptadresse (CNAME auf `wald-entdeckungsspiel.pages.dev`). Der Apex `wald-spiel.de` zeigt noch auf einen anderen Server (nginx, nur http): In Cloudflare den Apex als Eintrag (proxied) anlegen und eine Weiterleitungsregel einrichten: `https://wald-spiel.de/*` → `https://www.wald-spiel.de/$1` (301, Pfad und Query erhalten); „Immer HTTPS verwenden“ aktivieren. Die Pages-Datei `_redirects` kann keine Hostnamen umleiten.
2. **Nach dem Deployment prüfen:** `curl -sI` auf alle vier Adressen (200, `text/html`), `robots.txt` (`text/plain`), `sitemap.xml` (XML), eine unbekannte Adresse (404), `…/waldschatzsuche` (Weiterleitung auf `…/`), Quelltext der Seiten ohne JavaScript, Rich Results Test und Schema.org-Validator je Seite, `og:image` in einer Link-Vorschau.
3. **Search Console:** Domain-Property `wald-spiel.de` per DNS-TXT-Eintrag bestätigen (den Token gibt Search Console aus; hier wurde nichts erfunden), `https://www.wald-spiel.de/sitemap.xml` einreichen, die vier URLs prüfen lassen. Search Console braucht keinen zusätzlichen Code auf der Website.
4. **Recht:** Impressum, Datenschutzerklärung und Einwilligung für Analytics (siehe oben).

## Auswertung nach vier und acht Wochen (Vorschlag)

Search Console: Klicks, Impressionen, CTR und Suchanfragen je Einstiegsseite, Marken- (`wald-spiel`) und allgemeine Begriffe getrennt, durchschnittliche Position nur ergänzend. Gleich lange Zeiträume vergleichen (vier Wochen vor und nach der Veröffentlichung, danach acht), nach Gerät trennen, Saison (Herbst/Winter, Ferienzeiten) und geringe Datenmengen berücksichtigen; Schwankungen sind Beobachtungen, keine Ergebnisse. Core Web Vitals aus dem Chrome-Nutzerbericht, sobald genug Besuche vorliegen. Feldtest am Waldweg: Starten Familien ohne Hilfe in 30 Sekunden, und können sie nach fünf Sekunden sagen, wonach sie suchen? (Zielwerte, keine Ergebnisse.)

## Sinnvolle spätere Inhalte (aus beobachteten Lücken, nicht umgesetzt)

- Ratgeber „Waldspiele für kleine Kinder (2–3 Jahre)“ mit Spielen, die ohne Lesen auskommen, erst wenn Suchanfragen oder Rückfragen das stützen.
- Jahreszeiten-Seiten („Waldspiele im Herbst: Zapfen, Eicheln, Blätter“) mit echten Aufgaben der Jahreszeit.
- Ein kurzer Elternratgeber „Sicher im Wald mit Kindern“ auf Basis der vorhandenen Regeln (mit belegten Quellen).
- Bingokarte oder PDF zum Ausdrucken nur, wenn sie wirklich gebaut wird.

# Spiele und Einstellungen zurücksetzen

Schaltfläche **„Spiele und Einstellungen zurücksetzen“** in der Hilfe, im Bereich „Zurücksetzen“ unter dem Datenhinweis (eigene Karte mit gestricheltem Rahmen, getrennt von allen Start- und Fortsetzen-Aktionen). Das Hauptmenü verlinkt dorthin über „Hilfe & Datenhinweis“.

## Dialog

Titel „Spiele und Einstellungen zurücksetzen?“, Text: „Alle laufenden und pausierten Spiele auf diesem Gerät werden gelöscht. Deine Spieleinstellungen werden auf die Standardwerte zurückgesetzt. Gesammelte Waldgeschenke bleiben in deiner Sammlung.“ Aktionen „Abbrechen“ (anfänglicher Fokus, schließt und ändert nichts) und „Jetzt zurücksetzen“. Escape schließt den Dialog, Browser-Zurück ebenfalls. Der Reset läuft erst nach „Jetzt zurücksetzen“ und höchstens einmal, auch bei schnellem Mehrfachtippen (Sperre und deaktivierte Taste).

## Was erfasst wird (`src/domain/reset.ts`, zentrale Aktion `performReset`)

| Speicherbereich | Behandlung |
|---|---|
| `entdeckerzeit:v1:round` | gelöscht (Waldschätze-Runde mit aktiver Aufgabe, Teilfunden, Stand; auch eine abgeschlossene letzte Runde) |
| `entdeckerzeit:v1:escape` | gelöscht (Wald-Escape-Mission: Timer, Pause, Schlüssel und Fragmente, offenes Symbolrätsel, Hinweise, ausstehende Feier) |
| `entdeckerzeit:v1:escape:unlesbar` | gelöscht (zur Seite gelegte, nicht lesbare Escape-Kopie, ein Stand, der sonst nie wieder geladen würde) |
| `entdeckerzeit:v1:settings` | gezielt auf `DEFAULT_SETTINGS` gesetzt: Alter, Aufgabenzahl, „Mehr zählen“, Waldkontexte, Moduswahl, Escape-Dauer, Escape-Größe (Aufgaben pro Schlüssel), „Bewegung aus“ und Abwechslungsgedächtnis; die Jahreszeit wird wieder aus dem Datum vorgeschlagen (sie wird nicht gespeichert) |
| `giftsReceived` im selben Objekt | bleibt (Waldgeschenke / „Unsere Waldgeheimnisse“) |
| `legacyNoticePending` im selben Objekt | bleibt (Hinweis auf die Archivrunde) |
| `entdeckerzeit:v1:archive` | bleibt (Archivrunde eines früheren Ortes, nicht fortsetzbar) |
| Offline-Dateien, Service Worker | bleiben (Bereitstellung) |
| Systemeinstellung „reduzierte Bewegung“ | gilt weiter (Betriebssystem-Merkmal, wird nicht gespeichert) |
| `entdeckerzeit:v1:reset` | neu: Reset-Marke (Zeitstempel) für andere Tabs |

„Walddetektive“ hat keinen eigenen Spielstand (der Modus ist noch nicht spielbar). Es gibt kein `localStorage.clear()`; fremde Schlüssel auf derselben Adresse bleiben unberührt. Ein Vorleseschalter wird nicht gespeichert, es gibt also nichts zurückzusetzen.

## Ablauf und Absicherung

1. `performReset` schreibt zuerst die Reset-Marke, löscht die Spielstände, schreibt die Einstellungen (Sammlung bleibt) und schreibt die Marke ein zweites Mal als Letztes. Danach liest die Funktion alles erneut und prüft: Spielstände weg, Einstellungen wie erwartet, Marke da. Nur dann gilt der Reset als erfolgreich (Meldung „Spiele und Einstellungen wurden zurückgesetzt.“). Schlägt Schreiben oder Prüfung fehl, bleibt der Arbeitsspeicher unverändert und der Dialog nennt den tatsächlichen Stand mit dem Hinweis, die Seite neu zu laden. Ist der Browserspeicher blockiert, steht in der Meldung ausdrücklich, dass der Reset nur für die offene Seite gilt.
2. Danach leeren beide Spielmodi ihren Arbeitsspeicher (`applyReset` in `useGame` und `useEscape`): keine Runde, keine Mission (damit endet der Anzeige-Takt, kein Timer, keine Pause, kein Rätsel, keine Feier), Auswahl und Einstellungen wie beim Erstbesuch. Das Hauptmenü erscheint mit der Rückmeldung; es gibt keine Fortsetzen-Aktion.
3. **Mehrere Tabs:** Jede Speicherschicht merkt sich beim Start die Reset-Marke (`src/domain/resetGuard.ts`). Wurde später anderswo zurückgesetzt, schreibt der ältere Tab nichts mehr (Runde, Mission und Einstellungen: `false` bzw. `'reset'`), übernimmt den Reset beim Speicherereignis, Fokus oder Sichtbarwerden und zeigt „Die Spiele wurden in einem anderen Fenster zurückgesetzt.“
4. **Alte Adressen:** `#/runde`, `#/abschluss` und `#/escape` ohne dazugehörigen Spielstand führen immer zurück ins Hauptmenü (auch live, nicht nur beim Laden).

## Geprüft

Automatisch (`tests/reset.test.ts`, 9 Prüfungen): Umfang, Sammlung und Archiv bleiben, Bestand nach erneutem Laden, Fehler bei nicht ausgeführtem Löschen und bei Schreibfehler, blockierter Speicher, doppelter Reset, älterer Tab schreibt nichts zurück und darf nach Übernahme wieder normal speichern, später geöffneter Tab ist nicht „älter“.

Im Browser (Produktionsbau, 390 × 844, zwei Tabs): Laufende Waldmission und pausierte bzw. mit offenem Symbolrätsel gespeicherte Escape-Mission, geänderte Einstellungen (Alter, Kontext, Rundenzahl, Escape-Dauer und -Größe, „Bewegung aus“) und ein Waldgeschenk. Dialogtext und -aktionen wörtlich, Fokus auf „Abbrechen“, Escape und „Abbrechen“ ändern nichts. Bestätigter Reset mit dreifachem Antippen: genau ein Durchlauf, Standardwerte im Hauptmenü (Waldschätze gewählt, kein Alter, Bewegung an), keine Fortsetzen-Aktion, nur noch Marke und Einstellungen im Speicher, Geschenk weiterhin im Geschenkbuch lesbar. Zweiter Tab mit altem Rätsel: übernahm den Reset live (Hauptmenü, Standardmodus, Hinweis), und eine Aktion im alten Tab brachte nichts zurück. Nach Neuladen kehrten `#/runde`, `#/abschluss` und `#/escape` ins Hauptmenü zurück; Tab- bzw. Fokuswechsel brachte nichts wieder. Offline (Server gestoppt, Cache vollständig): Seite lädt, Runde starten, Reset und Geschenkbuch funktionieren.

## Grenzen

- Nur Browser-Emulation, keine echten Geräte; die Zwei-Tab-Prüfung lief in zwei Tabs desselben Browserprofils.
- Ein nicht lesbar gespeicherter Einstellungsstand kann seine Sammlung nicht behalten (sie ist dann nicht mehr auslesbar).
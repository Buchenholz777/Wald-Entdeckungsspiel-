import { ESCAPE_KEY, ESCAPE_UNREADABLE_KEY } from './escape/storage';
import { RESET_KEY, readResetStamp } from './resetGuard';
import { DEFAULT_SETTINGS, ROUND_KEY, SETTINGS_KEY, STORAGE_VERSION, sanitizeSettings, type KeyValueStore } from './storage';
import type { Settings } from './types';

/**
 * „Spiele und Einstellungen zurücksetzen“ – die eine zentrale Reset-Aktion.
 *
 * Erfasst gezielt (kein pauschales `localStorage.clear()`):
 *  – `entdeckerzeit:v1:round`          laufende oder abgeschlossene Runde „Waldschätze suchen“ (aktive Aufgabe, Teilfunde, Stand)
 *  – `entdeckerzeit:v1:escape`         Wald-Escape-Mission (Timer, Pausen, Schlüssel und Fragmente, offenes Symbolrätsel, Hinweise)
 *  – `entdeckerzeit:v1:escape:unlesbar` zur Seite gelegte, nicht lesbare Escape-Kopie (ein Stand, der sonst nie wieder geladen würde)
 *  – `entdeckerzeit:v1:settings`       Einstellungen: auf die Standardwerte des Erstbesuchs (`DEFAULT_SETTINGS`), nur gezielt
 *  – `entdeckerzeit:v1:reset`          Reset-Marke, damit ein älterer Tab nichts Gelöschtes zurückschreibt
 * „Walddetektive“ hat keinen eigenen Spielstand (der Modus ist noch nicht spielbar).
 *
 * Bleibt erhalten: die Waldgeschenke (`giftsReceived` im Einstellungsobjekt), die Archivrunde eines früheren Ortes
 * (`entdeckerzeit:v1:archive`) samt Hinweiskennzeichen sowie Offline-Dateien und Service Worker (gehören zur Bereitstellung).
 */

export type ResetOutcome =
  | { ok: true; persisted: boolean; stamp: number; settings: Settings }
  | { ok: false; reason: 'write' | 'verify'; detail: string };

/** Die Einstellungen nach dem Reset: Standardwerte, aber Sammlung und Archivhinweis bleiben. */
export function settingsAfterReset(previous: Settings): Settings {
  return { ...DEFAULT_SETTINGS, giftsReceived: [...previous.giftsReceived], legacyNoticePending: previous.legacyNoticePending };
}

function readStoredSettings(store: KeyValueStore): Settings {
  try {
    const text = store.getItem(SETTINGS_KEY);
    if (text === null) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null && (parsed as { v?: unknown }).v === STORAGE_VERSION) return sanitizeSettings((parsed as { settings?: unknown }).settings);
  } catch {
    /* unlesbar: Standardwerte, die Sammlung ist dann nicht mehr lesbar */
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Führt den Reset im Speicher aus und prüft anschließend durch erneutes Lesen, dass er Bestand hat.
 * Ohne Speicher (blockiert) gibt es nichts zu löschen: Erfolg mit `persisted: false` (nur der Arbeitsspeicher wird zurückgesetzt).
 */
export function performReset(store: KeyValueStore | null): ResetOutcome {
  if (!store) return { ok: true, persisted: false, stamp: 0, settings: { ...DEFAULT_SETTINGS } };
  try {
    const next = settingsAfterReset(readStoredSettings(store));
    // Zuerst die Marke: Ab jetzt schreibt kein älterer Tab mehr Spielstände zurück.
    const stamp = Math.max(Date.now(), readResetStamp(store) + 1);
    store.setItem(RESET_KEY, String(stamp));
    store.removeItem(ROUND_KEY);
    store.removeItem(ESCAPE_KEY);
    store.removeItem(ESCAPE_UNREADABLE_KEY);
    store.setItem(SETTINGS_KEY, JSON.stringify({ v: STORAGE_VERSION, settings: next }));
    // Die Marke ein zweites Mal, jetzt als Letztes: Ein anderer Tab, der schon auf die erste reagiert hat, liest so garantiert auch die neuen Einstellungen.
    const finalStamp = stamp + 1;
    store.setItem(RESET_KEY, String(finalStamp));

    // Prüfung: Alles, was gelöscht sein soll, ist wirklich weg; die Einstellungen sind die erwarteten.
    const leftovers = [ROUND_KEY, ESCAPE_KEY, ESCAPE_UNREADABLE_KEY].filter((k) => store.getItem(k) !== null);
    if (leftovers.length > 0) return { ok: false, reason: 'verify', detail: `Noch vorhanden: ${leftovers.join(', ')}` };
    if (readResetStamp(store) !== finalStamp) return { ok: false, reason: 'verify', detail: 'Reset-Marke nicht gespeichert' };
    const back = readStoredSettings(store);
    if (JSON.stringify(back) !== JSON.stringify(next)) return { ok: false, reason: 'verify', detail: 'Einstellungen nicht wie erwartet gespeichert' };
    return { ok: true, persisted: true, stamp: finalStamp, settings: next };
  } catch (e) {
    return { ok: false, reason: 'write', detail: e instanceof Error ? e.message : 'Schreiben nicht möglich' };
  }
}

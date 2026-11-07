import { describe, expect, it } from 'vitest';
import { ESCAPE_KEY, ESCAPE_UNREADABLE_KEY, createEscape, createEscapePersistence } from '../src/domain/escape';
import { generateRound } from '../src/domain/generator';
import { performReset, settingsAfterReset } from '../src/domain/reset';
import { RESET_KEY, readResetStamp } from '../src/domain/resetGuard';
import { seededRng } from '../src/domain/rng';
import { ARCHIVE_KEY, DEFAULT_SETTINGS, ROUND_KEY, SETTINGS_KEY, createPersistence, sanitizeSettings, type KeyValueStore } from '../src/domain/storage';
import type { Round, Settings } from '../src/domain/types';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

const T0 = 1_700_000_000_000;

function aRound(): Round {
  return generateRound({ age: '4-6', environment: 'forest', season: 'autumn', seasonSource: 'auto', context: ['oak'], boost: false, count: 5, seed: 5, rng: seededRng(5) }).round!;
}

const CHANGED: Settings = {
  ...DEFAULT_SETTINGS,
  age: '7-10',
  taskCount: 4,
  boost: true,
  context: ['oak', 'beech'],
  motionOff: true,
  mode: 'escape',
  escapeMinutes: 15,
  escapeSize: 'small',
  lastRoundConcepts: ['acorn'],
  lastRoundTheme: 'growth',
  giftsReceived: ['eichelhaeher'],
  legacyNoticePending: true,
};

/** Ein Gerät mit laufender Runde, laufender Escape-Mission, geänderten Einstellungen, Archiv und unlesbarer Kopie. */
function filledStore() {
  const store = memoryStore();
  const p = createPersistence(store);
  p.saveRound(aRound());
  p.saveSettings(CHANGED);
  const e = createEscape({ age: '7-10', season: 'autumn', seasonSource: 'auto', context: [], minutes: 20, tasksPerKey: 2 }, 3, T0);
  if (!e.ok) throw new Error('keine Mission');
  createEscapePersistence(store).save(e.mission);
  store.setItem(ARCHIVE_KEY, JSON.stringify({ v: 1, round: { id: 'alt' } }));
  store.setItem(ESCAPE_UNREADABLE_KEY, '{kaputt');
  store.setItem('fremd:schluessel', 'bleibt');
  return { store, p };
}

describe('Spiele und Einstellungen zurücksetzen', () => {
  it('löscht laufende Spiele und setzt die Einstellungen auf die Standardwerte, Sammlung und Archiv bleiben', () => {
    const { store } = filledStore();
    const out = performReset(store);
    expect(out.ok).toBe(true);
    expect(store.getItem(ROUND_KEY)).toBeNull();
    expect(store.getItem(ESCAPE_KEY)).toBeNull();
    expect(store.getItem(ESCAPE_UNREADABLE_KEY)).toBeNull();
    const settings = sanitizeSettings(JSON.parse(store.getItem(SETTINGS_KEY)!).settings);
    // Standardwerte eines Erstbesuchs (inklusive Moduswahl, Größe, Dauer, Bewegung, Auswahl)
    expect(settings).toEqual({ ...DEFAULT_SETTINGS, giftsReceived: ['eichelhaeher'], legacyNoticePending: true });
    expect(settings.mode).toBe('treasure');
    expect(settings.age).toBeNull();
    expect(settings.escapeMinutes).toBeNull();
    expect(settings.escapeSize).toBeNull();
    expect(settings.motionOff).toBe(false);
    expect(settings.context).toEqual([]);
    // gezielt statt pauschal: Archiv und fremde Schlüssel bleiben
    expect(store.getItem(ARCHIVE_KEY)).not.toBeNull();
    expect(store.getItem('fremd:schluessel')).toBe('bleibt');
  });

  it('settingsAfterReset ändert nur die Spieleinstellungen: Geschenke und Archivhinweis bleiben', () => {
    const next = settingsAfterReset(CHANGED);
    expect(next.giftsReceived).toEqual(['eichelhaeher']);
    expect(next.legacyNoticePending).toBe(true);
    expect({ ...next, giftsReceived: [], legacyNoticePending: false }).toEqual(DEFAULT_SETTINGS);
  });

  it('der Reset hat nach erneutem Laden Bestand: nichts ist fortsetzbar, die Standardwerte sind da', () => {
    const { store } = filledStore();
    performReset(store);
    const fresh = createPersistence(store);
    expect(fresh.loadRound()).toEqual({ status: 'empty', round: null });
    expect(createEscapePersistence(store).load(T0 + 1)).toEqual({ status: 'empty', mission: null });
    const s = fresh.loadSettings();
    expect(s.status).toBe('ok');
    expect(s.settings.mode).toBe('treasure');
    expect(s.settings.giftsReceived).toEqual(['eichelhaeher']);
  });

  it('meldet den tatsächlichen Stand: Speicher, der das Löschen nicht ausführt, ist ein Fehler, keine Erfolgsmeldung', () => {
    const { store } = filledStore();
    const stubborn: KeyValueStore = { getItem: (k) => store.getItem(k), setItem: (k, v) => store.setItem(k, v), removeItem: () => undefined };
    const out = performReset(stubborn);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe('verify');
  });

  it('meldet einen Schreibfehler ehrlich', () => {
    const store = memoryStore();
    const failing: KeyValueStore = { getItem: () => null, setItem: () => { throw new Error('voll'); }, removeItem: () => undefined };
    const out = performReset(failing);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.reason).toBe('write');
    void store;
  });

  it('blockierter Speicher: nichts zu löschen, ausdrücklich nicht gespeichert', () => {
    const out = performReset(null);
    expect(out).toMatchObject({ ok: true, persisted: false });
    if (out.ok) expect(out.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('zweimal hintereinander ist harmlos (doppelte Ausführung) und die Marke wächst', () => {
    const { store } = filledStore();
    const a = performReset(store);
    const b = performReset(store);
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(b.stamp).toBeGreaterThan(a.stamp);
    expect(readResetStamp(store)).toBe(b.ok ? b.stamp : 0);
  });

  it('ein älterer Tab bringt nach dem Reset nichts zurück: Runde, Escape-Mission und Einstellungen werden nicht geschrieben', () => {
    const { store, p: tabA } = filledStore();
    // Tab B ist mit dem alten Stand geöffnet (Persistenz und Zustand im Speicher)
    const tabB = createPersistence(store);
    const escB = createEscapePersistence(store);
    const roundInB = tabB.loadRound().round!;
    const missionInB = escB.load(T0 + 1).mission!;
    // Tab A setzt zurück
    expect(performReset(store).ok).toBe(true);
    tabA.acknowledgeReset();
    expect(tabB.resetPending()).toBe(true);
    expect(escB.resetPending()).toBe(true);
    // Tab B versucht zu speichern (zum Beispiel ein später Timer-Tick oder ein Fund)
    expect(tabB.saveRound(roundInB)).toBe(false);
    expect(tabB.saveSettings(CHANGED)).toBe(false);
    expect(escB.save({ ...missionInB, rev: missionInB.rev + 1 })).toBe('reset');
    expect(store.getItem(ROUND_KEY)).toBeNull();
    expect(store.getItem(ESCAPE_KEY)).toBeNull();
    expect(sanitizeSettings(JSON.parse(store.getItem(SETTINGS_KEY)!).settings).mode).toBe('treasure');
    // Nach der Übernahme des Resets darf Tab B wieder normal speichern (ein neues Spiel)
    tabB.acknowledgeReset();
    escB.acknowledgeReset();
    expect(tabB.resetPending()).toBe(false);
    expect(tabB.saveRound(aRound())).toBe(true);
    expect(store.getItem(ROUND_KEY)).not.toBeNull();
  });

  it('ein erst nach dem Reset geöffneter Tab ist nicht „älter“', () => {
    const { store } = filledStore();
    performReset(store);
    const late = createPersistence(store);
    expect(late.resetPending()).toBe(false);
    expect(late.saveRound(aRound())).toBe(true);
    expect(store.data.has(RESET_KEY)).toBe(true);
  });
});

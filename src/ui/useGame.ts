import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generateRound, replaceTask, restoreSwap, type SwapUndo } from '../domain/generator';
import { markCelebrated, rememberGift, withGift } from '../domain/gift';
import { CONTEXT_BY_ENV, DEFAULT_TASK_COUNT, suggestSeason } from '../domain/meta';
import { freshSeed, seededRng } from '../domain/rng';
import * as R from '../domain/round';
import { browserStore, createPersistence, DEFAULT_SETTINGS, type LoadStatus } from '../domain/storage';
import { FOREST, type AgeGroup, type ContextTag, type Round, type Season, type Settings } from '../domain/types';

export interface Draft {
  age: AgeGroup | null;
  /** Nur gesetzt, wenn bewusst gewählt; sonst gilt der Standard des Alters */
  taskCount: number | null;
  boost: boolean;
  context: ContextTag[];
  /** Bewusste Jahreszeit-Wahl nur für die nächste Mission */
  seasonOverride: Season | null;
}

export interface StorageNotice {
  kind: 'corrupt' | 'blocked' | 'write-failed';
  text: string;
}

export type StartResult = { ok: true } | { ok: false; reason: 'missing' | 'empty' };

function draftFromSettings(s: Settings): Draft {
  return {
    age: s.age,
    taskCount: s.taskCount,
    boost: s.boost,
    context: s.context.filter((c) => CONTEXT_BY_ENV[FOREST].includes(c)),
    seasonOverride: null,
  };
}

/** Zentraler Spielzustand: Runde, Einstellungen, Speicherung. Die Spiellogik selbst liegt in src/domain. */
export function useGame() {
  const persistence = useMemo(() => createPersistence(browserStore()), []);
  const initial = useMemo(() => {
    const r = persistence.loadRound();
    const s = persistence.loadSettings();
    return { r, s };
  }, [persistence]);

  const [round, setRoundState] = useState<Round | null>(initial.r.round);
  const [settings, setSettings] = useState<Settings>(() => {
    // Wurde eine Runde eines früheren Ortes archiviert, zeigt das Hauptmenü genau einmal eine kurze Info.
    if (initial.r.status === 'archived' && !initial.s.settings.legacyNoticePending) {
      const next = { ...initial.s.settings, legacyNoticePending: true };
      persistence.saveSettings(next);
      return next;
    }
    return initial.s.settings;
  });
  const [archive] = useState<Round | null>(() => persistence.loadArchive());
  const [draft, setDraft] = useState<Draft>(() => draftFromSettings(initial.s.settings));
  const [notice, setNotice] = useState<StorageNotice | null>(() => {
    const st: LoadStatus = initial.r.status;
    if (st === 'corrupt') return { kind: 'corrupt', text: 'Die gespeicherte Mission konnte nicht gelesen werden. Ihr könnt eine neue Waldmission starten.' };
    if (!persistence.available) return { kind: 'blocked', text: 'Dieses Gerät speichert gerade nichts. Die Mission bleibt offen, solange diese Seite geöffnet ist.' };
    return null;
  });
  const [announce, setAnnounce] = useState('');
  const first = useRef(true);

  // Runde sichern, sobald sie sich ändert
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ok = persistence.saveRound(round);
    if (!ok && persistence.available) {
      setNotice((n) => n ?? { kind: 'write-failed', text: 'Das Speichern hat nicht geklappt. Die Mission bleibt offen, solange diese Seite geöffnet ist.' });
    }
  }, [round, persistence]);

  const saveSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((s) => {
        // Der gespeicherte Stand ist die Grundlage: Ein zweiter, älterer Tab überschreibt so nie Einstellungen
        // (Spielmodus, Geschenkbuch, Suchzeit) aus dem jüngeren Tab. Nur die geänderten Felder kommen dazu.
        const stored = persistence.loadSettings();
        const base = stored.status === 'ok' ? stored.settings : s;
        const next = { ...base, ...patch };
        persistence.saveSettings(next);
        return next;
      });
    },
    [persistence],
  );

  // Ein Zustandsübergang, der die Mission vollständig macht, vergibt im selben Schritt genau ein Waldgeschenk.
  const receivedRef = useRef(settings.giftsReceived);
  receivedRef.current = settings.giftsReceived;
  // „Tausch rückgängig“ steht nur bis zur nächsten Spielaktion bereit (nur im Arbeitsspeicher, nie gespeichert).
  const [swapUndo, setSwapUndo] = useState<SwapUndo | null>(null);
  const setRound = useCallback((fn: (r: Round) => Round) => {
    setSwapUndo(null);
    setRoundState((r) => (r ? withGift(fn(r), receivedRef.current) : r));
  }, []);

  // Das vergebene Geschenk sofort im Geschenkbuch merken (idempotent).
  const giftId = round?.gift?.id;
  useEffect(() => {
    if (giftId && !settings.giftsReceived.includes(giftId)) saveSettings({ giftsReceived: rememberGift(settings.giftsReceived, giftId) });
  }, [giftId, settings.giftsReceived, saveSettings]);

  const patchDraft = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      next.context = next.context.filter((c) => CONTEXT_BY_ENV[FOREST].includes(c));
      if (next.age === '2-3') next.boost = false;
      return next;
    });
  }, []);

  const suggested: Season = suggestSeason(new Date());
  const effectiveSeason: Season = draft.seasonOverride ?? suggested;
  const effectiveCount = draft.taskCount ?? (draft.age ? DEFAULT_TASK_COUNT[draft.age] : 3);

  const startRound = useCallback(
    (now = new Date()): StartResult => {
      if (!draft.age) return { ok: false, reason: 'missing' };
      const season = draft.seasonOverride ?? suggestSeason(now);
      const seed = freshSeed();
      const count = draft.taskCount ?? DEFAULT_TASK_COUNT[draft.age];
      const result = generateRound({
        age: draft.age,
        environment: FOREST,
        season,
        seasonSource: draft.seasonOverride ? 'manual' : 'auto',
        context: draft.context,
        boost: draft.boost && draft.age !== '2-3',
        count,
        seed,
        rng: seededRng(seed),
        avoidConcepts: settings.lastRoundConcepts,
        avoidTheme: settings.lastRoundTheme ?? undefined,
        now: now.getTime(),
      });
      if (!result.round) return { ok: false, reason: 'empty' };
      setRoundState(result.round);
      setSwapUndo(null);
      saveSettings({
        age: draft.age,
        environment: null,
        taskCount: draft.taskCount,
        boost: draft.boost,
        context: draft.context,
        lastRoundConcepts: result.round.tasks.map((t) => t.conceptId),
        lastRoundTheme: result.round.mission?.theme ?? null,
      });
      setDraft((d) => ({ ...d, seasonOverride: null }));
      setAnnounce('Neue Waldmission gestartet.');
      return { ok: true };
    },
    [draft, settings.lastRoundConcepts, settings.lastRoundTheme, saveSettings],
  );

  /** „Noch eine Runde“ mit den Einstellungen der letzten Runde. */
  const repeatRound = useCallback((): StartResult => {
    if (!round) return { ok: false, reason: 'missing' };
    const seed = freshSeed();
    const result = generateRound({
      age: round.age,
      environment: FOREST,
      season: round.seasonSource === 'manual' ? round.season : suggestSeason(new Date()),
      seasonSource: round.seasonSource,
      context: round.context.filter((c) => CONTEXT_BY_ENV[FOREST].includes(c)),
      boost: round.boost,
      count: round.requestedCount,
      seed,
      rng: seededRng(seed),
      avoidConcepts: round.tasks.map((t) => t.conceptId),
      avoidTheme: round.mission?.theme,
    });
    if (!result.round) return { ok: false, reason: 'empty' };
    setRoundState(result.round);
    setSwapUndo(null);
    saveSettings({ lastRoundConcepts: result.round.tasks.map((t) => t.conceptId), lastRoundTheme: result.round.mission?.theme ?? null });
    setAnnounce('Neue Waldmission gestartet.');
    return { ok: true };
  }, [round, saveSettings]);

  const discardRound = useCallback(() => {
    setRoundState(null);
  }, []);

  /** „Hier nicht zu finden“. Gibt false zurück, wenn es keine passende Alternative gibt. */
  const swapTask = useCallback(
    (uid: string): boolean => {
      if (!round) return false;
      const seed = freshSeed();
      const res = replaceTask(round, uid, seededRng(seed));
      if (!res.round) return false;
      setRoundState(res.round);
      setSwapUndo(res.undo ?? null);
      const idx = res.round.tasks.findIndex((t) => t.uid !== uid && !round.tasks.some((o) => o.uid === t.uid));
      setAnnounce(`Neue Station: ${res.round.tasks[idx >= 0 ? idx : round.activeIndex].prompt}`);
      return true;
    },
    [round],
  );

  /** „Tausch rückgängig“: bringt die ersetzte Aufgabe samt Zählstand zurück. */
  const undoSwap = useCallback(() => {
    if (!swapUndo) return;
    setRoundState((r) => (r ? restoreSwap(r, swapUndo) : r));
    setSwapUndo(null);
    setAnnounce('Tausch rückgängig gemacht. Die frühere Aufgabe ist wieder da.');
  }, [swapUndo]);

  return {
    round,
    swapUndo,
    undoSwap,
    setRound,
    settings,
    saveSettings,
    draft,
    patchDraft,
    suggested,
    effectiveSeason,
    effectiveCount,
    startRound,
    repeatRound,
    discardRound,
    swapTask,
    notice,
    dismissNotice: () => setNotice(null),
    announce,
    setAnnounce,
    archive,
    /** Die Feier (Konfetti und Geschenkkarte) wurde gezeigt: sofort speichern, damit sie nie wiederholt startet. */
    markCelebrated: () => setRoundState((r) => (r ? markCelebrated(r) : r)),
    /** Die Info zur archivierten Runde wurde gelesen; das Archiv selbst bleibt erhalten. */
    dismissLegacyNotice: () => saveSettings({ legacyNoticePending: false }),
    persistenceAvailable: persistence.available,
    actions: R,
    defaults: DEFAULT_SETTINGS,
  };
}

export type Game = ReturnType<typeof useGame>;

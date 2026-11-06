import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ESCAPE_KEY,
  addFound,
  addPause,
  clearSlot,
  continueFree,
  createEscape,
  createEscapePersistence,
  endEarly,
  giveHint,
  isRunning,
  markCelebrated,
  needsCelebration,
  openVault,
  openWithHelp,
  placeAt,
  placeSymbol,
  remainingAt,
  removePause,
  setActive,
  settle,
  swapTask,
  undoFound,
  type EscapeMission,
  type EscapeParams,
  type PauseReason,
  type SymbolId,
} from '../domain/escape';
import { freshSeed } from '../domain/rng';
import { browserStore, type LoadStatus } from '../domain/storage';
import { rememberGift } from '../domain/gift';
import type { Settings } from '../domain/types';

export type StartEscapeResult = { ok: true } | { ok: false; reason: 'few'; groups: number };

/**
 * Zustand von Wald Escape. Die Spiellogik liegt vollständig in src/domain/escape (mit eigener, injizierbarer Uhr);
 * dieser Hook hält nur den Zustand, speichert nach jeder Aktion, zeigt die Uhr an und hält den Tab aktuell.
 * Die Anzeige tickt bloß für die Optik: Die Restzeit kommt immer aus Zeitpunkten (`remainingAt`), nie aus der Tickzahl.
 */
export function useEscape(settings: Settings, saveSettings: (patch: Partial<Settings>) => void) {
  const persistence = useMemo(() => createEscapePersistence(browserStore()), []);
  const initial = useMemo(() => persistence.load(Date.now()), [persistence]);
  const [mission, setMissionState] = useState<EscapeMission | null>(initial.mission);
  const ref = useRef<EscapeMission | null>(initial.mission);
  const [now, setNow] = useState(() => Date.now());
  const [announce, setAnnounce] = useState('');
  const [notice, setNotice] = useState<string | null>(() => {
    const st: LoadStatus | 'empty' = initial.status;
    if (st === 'corrupt') return 'Die gespeicherte Wald-Escape-Mission konnte nicht gelesen werden. Ihr könnt eine neue starten.';
    if (!persistence.available) return 'Dieses Gerät speichert gerade nichts. Die Mission bleibt offen, solange diese Seite geöffnet ist.';
    return null;
  });
  const receivedRef = useRef(settings.giftsReceived);
  receivedRef.current = settings.giftsReceived;

  const adopt = useCallback((m: EscapeMission | null) => {
    ref.current = m;
    setMissionState(m);
  }, []);

  /** Wendet eine Spiellogik-Funktion auf den aktuellen Stand an, nummeriert neu und speichert sofort. */
  const commit = useCallback(
    (fn: (m: EscapeMission, t: number) => EscapeMission | null): boolean => {
      const prev = ref.current;
      if (!prev) return false;
      const t = Date.now();
      const next = fn(prev, t);
      if (!next || next === prev) {
        setNow(t);
        return false;
      }
      const stamped: EscapeMission = { ...next, rev: prev.rev + 1, updatedAt: t };
      const res = persistence.save(stamped);
      if (res === 'stale') {
        // Ein anderer Tab hat einen jüngeren Stand gespeichert: Er gilt, dieser Tab überschreibt nichts.
        adopt(persistence.peek(Date.now()));
        setNotice('Wald Escape wurde in einem anderen Fenster weitergespielt. Hier seht ihr jetzt den neuesten Stand.');
        return false;
      }
      if (res === 'failed') setNotice((n) => n ?? 'Das Speichern hat nicht geklappt. Die Mission bleibt offen, solange diese Seite geöffnet ist.');
      adopt(stamped);
      setNow(t);
      return true;
    },
    [persistence, adopt],
  );

  // Anzeige-Takt: nur solange die Suche läuft. Fällige Zeitabläufe werden im Zustand festgehalten.
  const running = mission !== null && isRunning(mission);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const m = ref.current;
      const t = Date.now();
      setNow(t);
      if (m && m.phase === 'searching' && remainingAt(m, t) <= 0) {
        commit((x, tt) => settle(x, tt));
        setAnnounce('Die Sanduhr ist durch. Der Tresor wartet auf euch.');
      }
    };
    const id = window.setInterval(tick, 250);
    const onWake = () => tick();
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('focus', onWake);
    window.addEventListener('pageshow', onWake);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
      window.removeEventListener('pageshow', onWake);
    };
  }, [running, commit]);

  // Anderer Tab hat gespeichert: jüngeren Stand übernehmen (nie zurückschreiben).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ESCAPE_KEY) return;
      adopt(persistence.peek(Date.now()));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [persistence, adopt]);

  // Das vergebene Geschenk sofort im gemeinsamen Geschenkbuch merken (idempotent).
  const giftId = mission?.gift?.id;
  useEffect(() => {
    if (giftId && !settings.giftsReceived.includes(giftId)) saveSettings({ giftsReceived: rememberGift(settings.giftsReceived, giftId) });
  }, [giftId, settings.giftsReceived, saveSettings]);

  const start = useCallback(
    (p: EscapeParams): StartEscapeResult => {
      const t = Date.now();
      const res = createEscape(p, freshSeed(), t);
      if (!res.ok) return { ok: false, reason: 'few', groups: res.groups };
      persistence.save(null); // bewusst ersetzt: der alte Spielstand ist weg, das Ersetzen wurde vorher bestätigt
      persistence.save(res.mission);
      adopt(res.mission);
      setNow(t);
      saveSettings({ escapeMinutes: p.minutes, mode: 'escape' });
      setAnnounce('Die Sanduhr läuft. Findet drei Waldschätze.');
      return { ok: true };
    },
    [persistence, adopt, saveSettings],
  );

  const act = useMemo(
    () => ({
      found: (uid: string) => {
        const before = ref.current?.keys.length ?? 0;
        const changed = commit((m, t) => addFound(m, uid, t));
        const m = ref.current;
        if (changed && m) {
          if (m.phase === 'combination') setAnnounce(m.outcome === 'onTime' ? 'Dritter Schlüssel! Alle drei Schlüssel rechtzeitig gefunden. Jetzt der Tresor.' : 'Dritter Schlüssel! Jetzt der Tresor.');
          else if (m.keys.length > before) setAnnounce(`Schlüssel ${m.keys.length} von 3 gefunden.`);
          else setAnnounce('Eins gefunden.');
        }
      },
      undo: (uid: string) => {
        commit((m, t) => undoFound(m, uid, t));
        setAnnounce('Rückgängig gemacht.');
      },
      swap: (uid: string): boolean => {
        const ok = commit((m, t) => swapTask(m, uid, t));
        if (ok) setAnnounce('Neue Suchkarte.');
        return ok;
      },
      select: (i: number) => void commit((m) => setActive(m, i)),
      pause: () => {
        commit((m, t) => addPause(m, 'manual', t));
        setAnnounce('Pausiert.');
      },
      resume: () => {
        commit((m, t) => removePause(m, 'manual', t));
        setAnnounce('Weiter geht es.');
      },
      /** Ein echter Dialog (Info, Hilfe, Vergrößerung, Austausch) pausiert automatisch. */
      dialog: (open: boolean) => void commit((m, t) => (open ? addPause(m, 'dialog', t) : removePause(m, 'dialog', t))),
      /** Bewusstes Verlassen zum Hauptmenü: pausiert sofort. */
      leave: () => void commit((m, t) => addPause(m, 'menu' as PauseReason, t)),
      /** „Wald Escape fortsetzen“: nimmt nur den Menü-Grund weg. Eine bewusste Pause bleibt bestehen. */
      enter: () => void commit((m, t) => removePause(m, 'menu' as PauseReason, t)),
      free: () => {
        commit((m, t) => continueFree(m, t));
        setAnnounce('Ihr sucht jetzt ohne Zeitdruck weiter.');
      },
      end: () => void commit((m, t) => endEarly(m, t)),
      place: (s: SymbolId) => void commit((m) => placeSymbol(m, s)),
      placeAt: (slot: number, s: SymbolId) => void commit((m) => placeAt(m, slot, s)),
      clear: (slot: number) => void commit((m) => clearSlot(m, slot)),
      hint: () => void commit((m) => giveHint(m)),
      /** „Tresor öffnen“: true, wenn die Reihenfolge stimmt. */
      open: (): boolean => {
        let ok = false;
        commit((m, t) => {
          const r = openVault(m, receivedRef.current, t);
          ok = r.ok;
          return r.ok ? r.mission : m;
        });
        setAnnounce(ok ? 'Der Tresor ist offen!' : 'Das war noch nicht die richtige Reihenfolge. Ihr könnt es gleich wieder versuchen.');
        return ok;
      },
      helpOpen: () => {
        commit((m, t) => openWithHelp(m, receivedRef.current, t));
        setAnnounce('Der Tresor ist offen!');
      },
      celebrated: () => void commit((m) => markCelebrated(m)),
      discard: () => {
        persistence.save(null);
        adopt(null);
      },
      dismissNotice: () => setNotice(null),
    }),
    [commit, persistence, adopt],
  );

  const remainingMs = mission ? remainingAt(mission, now) : 0;
  return { mission, now, remainingMs, running, announce, setAnnounce, notice, act, start, persistenceAvailable: persistence.available, celebrate: mission ? needsCelebration(mission) : false };
}

export type Escape = ReturnType<typeof useEscape>;

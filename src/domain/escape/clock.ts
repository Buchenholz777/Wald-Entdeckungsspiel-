import type { EscapeMission, PauseReason } from './types';

/**
 * Die Suchuhr. Sie läuft nur in der Phase „searching“ und nur, wenn kein Pausengrund vorliegt.
 * Die Restzeit wird immer aus Zeitpunkten berechnet (`resumedAt` und der damals gespeicherten Restzeit),
 * nie aus gezählten Ticks: Ein verzögertes oder fehlendes Intervall ändert nichts am Ergebnis.
 */

export function isRunning(m: Pick<EscapeMission, 'phase' | 'pauses'>): boolean {
  return m.phase === 'searching' && m.pauses.length === 0;
}

/**
 * Restzeit in Millisekunden zum Zeitpunkt `now`. Nie negativ und nie größer als die gewählte Dauer.
 * Geht die Gerätezeit rückwärts (jetzt vor dem letzten Start), zählt die Zwischenzeit als 0: Es entsteht kein Zeitgewinn.
 */
export function remainingAt(m: Pick<EscapeMission, 'clock'>, now: number): number {
  const c = m.clock;
  if (c.resumedAt === null) return clamp(c.remainingMs, 0, c.durationMs);
  const elapsed = Math.max(0, now - c.resumedAt);
  return clamp(c.remainingMs - elapsed, 0, c.durationMs);
}

function clamp(v: number, lo: number, hi: number): number {
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo;
}

/**
 * Bringt die Uhr auf den Stand `now`: rechnet die verstrichene Zeit ab und wechselt bei Restzeit 0 in „timeup“.
 * Jede fachliche Aktion ruft zuerst diese Funktion auf, damit nie eine veraltete Anzeige maßgeblich ist.
 */
export function settle(m: EscapeMission, now: number): EscapeMission {
  if (m.phase !== 'searching') return m;
  const rem = remainingAt(m, now);
  if (rem <= 0) {
    // „Bei exakt null ist die Zeit abgelaufen.“
    return { ...m, phase: 'timeup', outcome: 'expired', pauses: [], clock: { ...m.clock, remainingMs: 0, resumedAt: null } };
  }
  const resumedAt = m.pauses.length === 0 ? now : null;
  if (rem === m.clock.remainingMs && resumedAt === m.clock.resumedAt) return m;
  return { ...m, clock: { ...m.clock, remainingMs: rem, resumedAt } };
}

/** Setzt die Pausengründe (nach dem Abrechnen der bisherigen Zeit) und startet oder stoppt die Uhr entsprechend. */
function withPauses(m: EscapeMission, pauses: PauseReason[], now: number): EscapeMission {
  const s = settle(m, now);
  if (s.phase !== 'searching') return s;
  const same = s.pauses.length === pauses.length && s.pauses.every((p) => pauses.includes(p));
  if (same) return s;
  return { ...s, pauses, clock: { ...s.clock, resumedAt: pauses.length === 0 ? now : null } };
}

/** Fügt einen Pausengrund hinzu (Hauptmenü, Info/Hilfe/Vergrößerung/Austausch, bewusste Pause). Doppelte Gründe zählen einmal. */
export function addPause(m: EscapeMission, reason: PauseReason, now: number): EscapeMission {
  if (m.phase !== 'searching') return m;
  const s = settle(m, now);
  if (s.phase !== 'searching' || s.pauses.includes(reason)) return s;
  return withPauses(s, [...s.pauses, reason], now);
}

/** Entfernt einen Pausengrund. Die Uhr läuft erst weiter, wenn KEIN Grund mehr übrig ist. */
export function removePause(m: EscapeMission, reason: PauseReason, now: number): EscapeMission {
  if (m.phase !== 'searching') return m;
  const s = settle(m, now);
  if (s.phase !== 'searching' || !s.pauses.includes(reason)) return s;
  return withPauses(s, s.pauses.filter((p) => p !== reason), now);
}

/** Anzeige: Sekunden, aufgerundet („00:01“ bleibt sichtbar, solange noch Zeit ist). */
export function displaySeconds(remainingMs: number): number {
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function formatClock(remainingMs: number): string {
  const s = displaySeconds(remainingMs);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/** Zugängliche Zeitangabe: „14 Minuten 32 Sekunden“. */
export function spokenClock(remainingMs: number): string {
  const s = displaySeconds(remainingMs);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  const parts: string[] = [];
  if (mm > 0) parts.push(`${mm} ${mm === 1 ? 'Minute' : 'Minuten'}`);
  if (ss > 0 || mm === 0) parts.push(`${ss} ${ss === 1 ? 'Sekunde' : 'Sekunden'}`);
  return parts.join(' ');
}

import { useId } from 'react';
import type { SymbolId } from '../../domain/escape/types';

/**
 * Spieloberfläche von Wald Escape: Symbolschlüssel, Sanduhr und Waldtresor. Sie sind freundlich stilisiert
 * (keine naturkundlichen Suchbilder), vollständig aus Code gezeichnet und brauchen keine Datei und kein Netz.
 * Jedes Symbol unterscheidet sich durch Form UND Farbe; der Name steht immer als Text daneben.
 */

const INK = '#3b2a1a';

export function SymbolIcon({ symbol, size = 44 }: { symbol: SymbolId; size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="sym" data-symbol={symbol}>
      {SHAPES[symbol]}
    </svg>
  );
}

const SHAPES: Record<SymbolId, React.ReactNode> = {
  leaf: (
    <g>
      <path d="M24 5 C38 11 41 27 26 42 C10 30 9 13 24 5 Z" fill="#6fae4a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 9 C23 20 25 30 26 39" fill="none" stroke="#d6ecb4" strokeWidth="2" strokeLinecap="round" />
      <path d="M24.5 18 L32 14 M24.5 25 L33 21 M24.5 32 L31 29 M24 22 L16 18 M24.5 29 L17 26" fill="none" stroke="#d6ecb4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M26 42 L28 46" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  cone: (
    <g>
      <path d="M24 4 C35 10 38 26 31 38 C28 43 20 43 17 38 C10 26 13 10 24 4 Z" fill="#9a6a3c" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 15 Q24 20 32 15 M13.5 22 Q24 28 34.5 22 M14 29 Q24 35 34 29 M18 36 Q24 40 30 36 M24 6 L24 40" fill="none" stroke="#e1bd8a" strokeWidth="1.7" strokeLinecap="round" />
    </g>
  ),
  acorn: (
    <g>
      <path d="M24 44 C14 38 12 28 13 22 L35 22 C36 28 34 38 24 44 Z" fill="#c8923f" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M10 22 C9 12 17 8 24 8 C31 8 39 12 38 22 Z" fill="#7a5632" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M15 15 L18 19 M22 12 L25 17 M30 14 L28 19 M12 20 L14 20 M34 20 L36 20" fill="none" stroke="#e3c79b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 8 L24 3" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  star: (
    <g>
      <path d="M24 4 L29.6 16.4 L43 18 L33 27.2 L35.8 40.6 L24 33.8 L12.2 40.6 L15 27.2 L5 18 L18.4 16.4 Z" fill="#f4c940" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 11 L27 18.5 M17 20 L21 24" fill="none" stroke="#fff3b8" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  mushroom: (
    <g>
      <path d="M19 26 L18 40 C18 44 30 44 30 40 L29 26 Z" fill="#f2e6cc" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M5 27 C5 14 14 6 24 6 C34 6 43 14 43 27 C43 29 41 29 40 29 L8 29 C7 29 5 29 5 27 Z" fill="#c9553a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="16" cy="19" r="3" fill="#fff4dc" />
      <circle cx="28" cy="14" r="2.6" fill="#fff4dc" />
      <circle cx="33" cy="23" r="2.4" fill="#fff4dc" />
    </g>
  ),
  sun: (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M24 3.5 L24 9" stroke={INK} strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${i * 45} 24 24)`} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M24 3.5 L24 9" stroke="#f08a2a" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${i * 45} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="12" fill="#f7cb3c" stroke={INK} strokeWidth="2.2" />
      <path d="M18 20 Q20 16 24 16" fill="none" stroke="#fff3b8" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  moon: (
    <g>
      <path d="M32 6 C20 7 12 15 12 25 C12 36 21 43 32 42 C26 39 22 33 22 25 C22 17 26 10 32 6 Z" fill="#9db4d6" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="19" cy="22" r="1.6" fill="#7a92b8" />
      <circle cx="21" cy="32" r="2" fill="#7a92b8" />
      <path d="M37 10 L37 16 M34 13 L40 13" stroke="#f4c940" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
  drop: (
    <g>
      <path d="M24 4 C32 15 38 22 38 29 C38 37 31 43 24 43 C17 43 10 37 10 29 C10 22 16 15 24 4 Z" fill="#4f9fd8" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M17 29 C17 34 20 37 24 38" fill="none" stroke="#c7e6fa" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),
};

/* ---------------- Sanduhr ---------------- */

export type HourglassState = 'running' | 'paused' | 'done' | 'expired';

/**
 * Kleine Sanduhr. `fraction` ist der Anteil der verbleibenden Zeit (1 = voll, 0 = leer): oben nimmt der Sand ab, unten zu.
 * Der dünne Sandstrom läuft nur bei laufender Suche. Bei Pause, Erfolg und Zeitablauf steht alles still (auch ohne Animation vollständig lesbar).
 */
export function Hourglass({ fraction, state, size = 64 }: { fraction: number; state: HourglassState; size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const f = Math.max(0, Math.min(1, fraction));
  const topH = 36 * f;
  const botH = 36 * (1 - f);
  const stream = state === 'running' && f > 0.002 && f < 1;
  return (
    <svg viewBox="0 0 80 120" width={size} height={(size * 120) / 80} className={`hourglass hg-${state}`} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}t`}>
          <path d="M18 18 H62 C62 40 46 50 42 60 L38 60 C34 50 18 40 18 18 Z" />
        </clipPath>
        <clipPath id={`${id}b`}>
          <path d="M38 60 L42 60 C46 70 62 80 62 102 H18 C18 80 34 70 38 60 Z" />
        </clipPath>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2cf7a" />
          <stop offset="1" stopColor="#d9a43e" />
        </linearGradient>
      </defs>
      {/* Glas */}
      <path d="M18 18 H62 C62 40 46 50 42 60 C46 70 62 80 62 102 H18 C18 80 34 70 38 60 C34 50 18 40 18 18 Z" fill="#eaf4f3" fillOpacity="0.75" />
      {/* Sand oben (nimmt ab) und unten (nimmt zu) */}
      <g clipPath={`url(#${id}t)`}>
        <rect className="sand-top" x="16" y={58 - topH} width="48" height={topH + 2} fill={`url(#${id}s)`} />
      </g>
      <g clipPath={`url(#${id}b)`}>
        <rect className="sand-bottom" x="16" y={102 - botH} width="48" height={botH + 1} fill={`url(#${id}s)`} />
      </g>
      {stream && <line className="sand-stream" x1="40" y1="56" x2="40" y2={102 - botH} stroke="#e2b552" strokeWidth="1.6" strokeLinecap="round" />}
      <path d="M18 18 H62 C62 40 46 50 42 60 C46 70 62 80 62 102 H18 C18 80 34 70 38 60 C34 50 18 40 18 18 Z" fill="none" stroke="#6c5a44" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 24 C25 33 31 40 36 46" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
      {/* Holzplatten */}
      <rect x="10" y="10" width="60" height="9" rx="3.5" fill="#a4723e" stroke="#4d3320" strokeWidth="2" />
      <rect x="10" y="101" width="60" height="9" rx="3.5" fill="#a4723e" stroke="#4d3320" strokeWidth="2" />
      <path d="M14 13 H66 M14 104 H66" stroke="#d3a46a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Waldtresor ---------------- */

export type LockState = 'locked' | 'ready' | 'open';
export type VaultState = 'closed' | 'ready' | 'open';

/**
 * Kleiner, freundlicher Waldtresor (Holztruhe mit Moos und drei Schlössern). Das Schloss-Zeichen ist Spieloberfläche, kein Suchbild.
 * `state`: geschlossen, bereit (drei Schlüssel da, Schlösser leuchten) oder geöffnet (Deckel offen, warmes Licht).
 */
export function Vault({ state, locks, size = 220 }: { state: VaultState; locks: [LockState, LockState, LockState]; size?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const open = state === 'open';
  return (
    <svg viewBox="0 0 240 190" width={size} height={(size * 190) / 240} className={`vault vault-${state}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b98450" />
          <stop offset="1" stopColor="#8a5c32" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.9" r="0.7">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset="1" stopColor="#fff2b0" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <rect x="30" y="86" width="180" height="82" rx="10" />
        </clipPath>
      </defs>
      <ellipse cx="120" cy="174" rx="92" ry="9" fill="#2a1c0e" opacity="0.28" />
      {/* Inneres Licht beim Öffnen */}
      <ellipse className="vault-glow" cx="120" cy="92" rx="70" ry="46" fill={`url(#${id}g)`} opacity={open ? 1 : 0} />
      {/* Deckel (dreht sich beim Öffnen nach hinten) */}
      <g className="vault-lid" style={{ transformOrigin: '30px 90px', transform: open ? 'rotate(-26deg)' : 'rotate(0deg)' }}>
        <path d="M30 88 C30 52 66 36 120 36 C174 36 210 52 210 88 Z" fill={`url(#${id}w)`} stroke="#4d3320" strokeWidth="3" strokeLinejoin="round" />
        <path d="M54 88 C54 62 80 50 120 50 M186 88 C186 62 160 50 120 50" fill="none" stroke="#6b4425" strokeOpacity="0.5" strokeWidth="2" />
        <path d="M30 88 H210" stroke="#4d3320" strokeWidth="3" />
        <path d="M44 62 C60 48 84 42 110 41" fill="none" stroke="#e0b985" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        {/* Moos am Deckel */}
        <path d="M70 44 C76 38 88 38 92 43 C98 37 110 38 112 44 C104 47 80 48 70 44 Z" fill="#6fae4a" stroke="#2f6a2c" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      {/* Truhenkörper */}
      <rect x="30" y="86" width="180" height="82" rx="10" fill={`url(#${id}w)`} stroke="#4d3320" strokeWidth="3" />
      <g clipPath={`url(#${id}c)`}>
        <path d="M30 112 H210 M30 140 H210" stroke="#6b4425" strokeOpacity="0.55" strokeWidth="2" />
        <rect x="56" y="86" width="12" height="82" fill="#6b7a52" stroke="#3f4a30" strokeWidth="2" />
        <rect x="172" y="86" width="12" height="82" fill="#6b7a52" stroke="#3f4a30" strokeWidth="2" />
      </g>
      {/* drei Schlösser */}
      {locks.map((s, i) => {
        const cx = 68 + i * 52;
        return (
          <g key={i} className={`lock lock-${s}`} transform={`translate(${cx} 128)`}>
            {s === 'ready' && <circle r="19" fill="#fff2b0" opacity="0.55" className="lock-glow" />}
            <path d={s === 'open' ? 'M-8 -6 V-14 a8 8 0 0 1 16 0 V-12' : 'M-8 -6 V-14 a8 8 0 0 1 16 0 V-6'} fill="none" stroke="#e9e3d2" strokeWidth="3.4" strokeLinecap="round" />
            <rect x="-13" y="-6" width="26" height="22" rx="5" fill={s === 'open' ? '#8bc468' : s === 'ready' ? '#f2c14b' : '#d1a24a'} stroke="#4d3320" strokeWidth="2.4" />
            <circle cx="0" cy="3" r="3.2" fill="#4d3320" />
            <path d="M0 4 V10" stroke="#4d3320" strokeWidth="2.6" strokeLinecap="round" />
          </g>
        );
      })}
      {/* kleine Sterne beim Öffnen */}
      {open && (
        <g className="vault-sparkles" fill="#f4c940" stroke="#a8761c" strokeWidth="1">
          <path d="M120 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
          <path d="M70 34 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          <path d="M176 32 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
        </g>
      )}
    </svg>
  );
}

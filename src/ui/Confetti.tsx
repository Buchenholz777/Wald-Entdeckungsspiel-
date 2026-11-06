import { useEffect, useMemo } from 'react';

/**
 * Kurzer, einmaliger Konfettiregen (rund drei Sekunden): warme Farben, kleine Papier- und Blattformen.
 * Reine CSS-Animation ohne Bibliothek und ohne Netz. Die Ebene fängt keine Klicks ab (pointer-events: none),
 * läuft nie in einer Schleife und endet von selbst. Bei „Bewegung aus“ oder reduzierter Bewegung wird sie gar nicht gezeigt.
 */
const COLORS = ['#f2c14b', '#e9894a', '#cf4c3b', '#7bb661', '#58994a', '#f8dc7a', '#d9b88a', '#fff3c4', '#e1735c'];

interface Piece {
  k: number;
  left: number;
  w: number;
  h: number;
  c: string;
  r: string;
  d: number;
  delay: number;
  x: number;
  rot: number;
}

function build(count: number): Piece[] {
  let s = 20261106;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: count }, (_, k) => {
    const leaf = k % 4 === 0;
    const w = leaf ? 12 + rnd() * 8 : 7 + rnd() * 7;
    return {
      k,
      left: rnd() * 100,
      w,
      h: leaf ? w * 1.5 : w * (0.6 + rnd() * 0.9),
      c: COLORS[k % COLORS.length],
      r: leaf ? '0 100% 0 100%' : rnd() > 0.7 ? '50%' : '2px',
      d: 2.2 + rnd() * 0.8,
      delay: rnd() * 0.6,
      x: (rnd() - 0.5) * 160,
      rot: 240 + rnd() * 480,
    };
  });
}

export function Confetti({ onDone }: { onDone: () => void }) {
  const pieces = useMemo(() => build(72), []);
  useEffect(() => {
    const t = window.setTimeout(onDone, 3800);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div className="confetti" aria-hidden="true" data-testid="confetti">
      {pieces.map((p) => (
        <i
          key={p.k}
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.c,
              borderRadius: p.r,
              animationDuration: `${p.d}s`,
              animationDelay: `${p.delay}s`,
              '--x': `${p.x}px`,
              '--rot': `${p.rot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Soll bewegt gefeiert werden? Nein bei „Bewegung aus“, reduzierter Bewegung und ausgeblendetem Browserfenster. */
export function canCelebrateWithMotion(motionOff: boolean): boolean {
  if (motionOff) return false;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  } catch {
    /* ignorieren */
  }
  return typeof document === 'undefined' || !document.hidden;
}

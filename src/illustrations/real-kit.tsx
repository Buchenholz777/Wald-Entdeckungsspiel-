import type { ReactNode } from 'react';
import { det, shade, useGid } from './kit';

/**
 * Baukasten für die naturgetreuen Suchbilder („Sachillustration“):
 * unregelmäßige, aus festen Zufallswerten berechnete Formen, mehrschichtige Verläufe, Oberflächenrelief durch Licht von links oben,
 * feine Strukturen und weiche Kontaktschatten. Alles ist reiner Code (SVG), skaliert scharf und liegt komplett im Offline-Paket.
 * Die Zufallswerte sind fest (`det`), damit jedes Motiv bei jedem Aufruf gleich aussieht.
 */

export type Pt = [number, number];

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Glatte Kurve durch Punkte (Catmull-Rom als Bézier). */
export function smoothPath(pts: Pt[], closed = true, t = 1): string {
  const n = pts.length;
  const at = (i: number): Pt => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += ` C${f(p1[0] + ((p2[0] - p0[0]) / 6) * t)},${f(p1[1] + ((p2[1] - p0[1]) / 6) * t)} ${f(p2[0] - ((p3[0] - p1[0]) / 6) * t)},${f(p2[1] - ((p3[1] - p1[1]) / 6) * t)} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/** Unregelmäßige Ellipse (kein Kreis aus dem Zirkel). */
export function blob(cx: number, cy: number, rx: number, ry: number, seed: number, jitter = 0.07, n = 16, rot = 0): string {
  const r = det(seed);
  const pts: Pt[] = [];
  const ca = Math.cos((rot * Math.PI) / 180);
  const sa = Math.sin((rot * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * jitter;
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    pts.push([cx + x * ca - y * sa, cy + x * sa + y * ca]);
  }
  return smoothPath(pts, true);
}

/** Weicher Kontaktschatten unter einem Gegenstand. */
export function Shadow({ cx, cy, rx, ry, o = 0.32, rot = 0, blur = 'nx-b4' }: { cx: number; cy: number; rx: number; ry: number; o?: number; rot?: number; blur?: 'nx-b1' | 'nx-b2' | 'nx-b4' }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#2a1c0e" opacity={o} filter={`url(#${blur})`} transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined} />;
}

/** Schatten in der Form des Gegenstands: wird in Bildschirmrichtung (rechts unten) versetzt und weich gezeichnet. */
export function SilShadow({ d, transform, dx = 5, dy = 8, o = 0.34, blur = 'nx-b2' }: { d: string; transform?: string; dx?: number; dy?: number; o?: number; blur?: 'nx-b1' | 'nx-b2' | 'nx-b4' }) {
  return (
    <g transform={`translate(${dx} ${dy})`}>
      <path d={d} transform={transform} fill="#241608" opacity={o} filter={`url(#${blur})`} />
    </g>
  );
}

/** Fläche mit Oberflächenrelief (Körnung, Poren, Rinde …) im Licht von links oben. */
export function Textured({ d, fill, kind = 'bump', opacity = 1 }: { d: string; fill: string; kind?: 'bump' | 'bump-lg' | 'bump-v' | 'bump-velvet'; opacity?: number }) {
  return <path d={d} fill={fill} filter={`url(#nx-${kind})`} opacity={opacity} />;
}

/** Rundum-Schattierung: Licht links oben, Schatten rechts unten, über einer fertigen Form (Clip auf die Form). */
export function Volume({ d, hi = 0.35, lo = 0.4, dir = 'tl' }: { d: string; hi?: number; lo?: number; dir?: 'tl' | 'top' | 'left' }) {
  const g = useGid('vo');
  const [x1, y1, x2, y2] = dir === 'tl' ? [0, 0, 1, 1] : dir === 'top' ? [0.5, 0, 0.5, 1] : [0, 0.5, 1, 0.5];
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={g} x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0" stopColor="#fff" stopOpacity={hi} />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#1a0e04" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0e04" stopOpacity={lo} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${g})`} />
    </g>
  );
}

/** Rundlicher Körper mit eigenem Verlauf (Nuss, Kugel, Kappe): helle Mitte links oben, dunkler Rand rechts unten. */
export function Orb({ d, base, hi = 0.32, lo = 0.34, cx = 0.36, cy = 0.3, r = 0.85, stroke, sw = 0.8 }: { d: string; base: string; hi?: number; lo?: number; cx?: number; cy?: number; r?: number; stroke?: string; sw?: number }) {
  const g = useGid('ob');
  return (
    <g>
      <defs>
        <radialGradient id={g} cx={cx} cy={cy} r={r}>
          <stop offset="0" stopColor={shade(base, hi)} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -lo)} />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#${g})`} stroke={stroke} strokeWidth={stroke ? sw : 0} strokeLinejoin="round" />
    </g>
  );
}

/** Glanzlicht: kleine helle, weiche Fläche. */
export function Gloss({ cx, cy, rx, ry, rot = -30, o = 0.7 }: { cx: number; cy: number; rx: number; ry: number; rot?: number; o?: number }) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o} filter="url(#nx-b1)" />
    </g>
  );
}

/** Clip-Hilfe: zeigt Kinder nur innerhalb einer Form. */
export function Clip({ d, id, children }: { d: string; id: string; children: ReactNode }) {
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </g>
  );
}

/** Zufallsbeiwerk-Helfer: gleichmäßig verteilte Zahl im Bereich. */
export function rng(seed: number) {
  const r = det(seed);
  return {
    next: r,
    between: (a: number, b: number) => a + r() * (b - a),
    jitter: (v: number, amt: number) => v + (r() - 0.5) * 2 * amt,
    pick: <T,>(list: T[]): T => list[Math.floor(r() * list.length)],
  };
}

/** Punkt auf einer Bézierkurve zweiter Ordnung. */
export function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

/** Steigung (Winkel in Grad) einer Bézierkurve zweiter Ordnung. */
export function quadAngle(p0: Pt, p1: Pt, p2: Pt, t: number): number {
  const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** Lupe: zeigt eine vergrößerte Ansicht (gleiche Zeichnung, größer, um einen Mittelpunkt) im Kreis. */
export function Loupe({ cx, cy, r, focus, zoom, children }: { id?: string; cx: number; cy: number; r: number; focus: Pt; zoom: number; children: ReactNode }) {
  const id = useGid('lp');
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx + 1.5} cy={cy + 2.5} r={r + 1} fill="#2a1c0e" opacity="0.28" filter="url(#nx-b2)" />
      <circle cx={cx} cy={cy} r={r} fill="#f4efe0" />
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-focus[0]} ${-focus[1]})`}>{children}</g>
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fffaf0" strokeWidth={3.2} />
      <circle cx={cx} cy={cy} r={r + 1.6} fill="none" stroke="#5b4636" strokeOpacity="0.55" strokeWidth={1} />
    </g>
  );
}

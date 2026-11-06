import type { ReactElement } from 'react';
import { C, LEAF_BROWN, LEAF_GREEN, LEAF_ORANGE, Leaf, Mv, Plastic, Speckle, Thick, det, type Art } from './kit';
import { ConeShape } from './nature';

/**
 * Waldmotive: Eichelbecher, Buchenhülle, Fraßspuren, Blattskelett, Farn, Totholz, Baumpilz, Jahresringe,
 * Gallen, Blattminen, Keimling, Spinnennetz. Eigene Zeichnungen im Stil der übrigen Bildwelt:
 * naturnahe Farben, weiche Licht- und Schattenverläufe, kein Gesicht, keine Tiere, keine Schrift.
 */

/* ---------------- Eichelbecher ---------------- */

function AcornCup({ x, y, rot = 0, s = 1, tilt = false }: { x: number; y: number; rot?: number; s?: number; tilt?: boolean }) {
  const bowl = 'M-36,-14 C-40,16 -20,34 0,38 C20,34 40,16 36,-14 Z';
  const rows: ReactElement[] = [];
  let k = 0;
  for (let r = 0; r < 4; r++) {
    for (let cx = -30 + (r % 2) * 7; cx <= 30; cx += 14) {
      const cy = -6 + r * 9;
      rows.push(<path key={k++} d={`M${cx - 6},${cy - 2} L${cx},${cy + 4} L${cx + 6},${cy - 2}`} stroke={C.b5} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />);
    }
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,36 Q3,46 -2,52" stroke={C.b5} strokeWidth={5} fill="none" strokeLinecap="round" />
      <clipPath id="il-cup-clip">
        <path d={bowl} />
      </clipPath>
      <path d={bowl} fill={C.b3} stroke={C.b5} strokeWidth={2.2} strokeLinejoin="round" />
      <g clipPath="url(#il-cup-clip)">{rows}</g>
      <Plastic d={bowl} hi={0.32} lo={0.34} speck={0.22} />
      {/* Öffnung: leerer Becher, innen dunkel und glatt */}
      <ellipse cx={0} cy={-14} rx={36} ry={tilt ? 14 : 10} fill="#5b3b20" stroke={C.b5} strokeWidth={2.2} />
      <ellipse cx={0} cy={tilt ? -12 : -13} rx={27} ry={tilt ? 9 : 6} fill="#7a5130" opacity={0.9} />
      <path d="M-30,-16 C-18,-22 14,-22 28,-16" stroke={C.b1} strokeWidth={2} fill="none" opacity={0.5} strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Buchenhülle ---------------- */

function BeechHusk({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  const valve = 'M0,0 C-22,-8 -26,-40 0,-62 C26,-40 22,-8 0,0 Z';
  const rnd = det(5);
  const bristles: ReactElement[] = [];
  for (let i = 0; i < 16; i++) {
    const t = 0.1 + rnd() * 0.8;
    const yy = -t * 56;
    const half = 11 * Math.sin(Math.PI * Math.min(1, t * 1.1)) + 3;
    const side = i % 2 ? 1 : -1;
    const bx = side * half * (0.4 + rnd() * 0.5);
    bristles.push(<path key={i} d={`M${bx.toFixed(1)},${yy.toFixed(1)} q${(side * 5).toFixed(1)},-6 ${(side * 8).toFixed(1)},-3`} stroke="#4d3320" strokeWidth={1.6} fill="none" strokeLinecap="round" />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={22} ry={18} fill="#e8d3a6" stroke={C.b5} strokeWidth={2.2} />
      <ellipse cx={-3} cy={-2} rx={13} ry={9} fill="#cdb27c" opacity={0.7} />
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={valve} fill="#8a6a3a" stroke={C.b5} strokeWidth={2.2} strokeLinejoin="round" />
          <Plastic d={valve} hi={0.32} lo={0.3} speck={0.2} />
          <path d="M0,-6 C-6,-22 -6,-40 0,-54" stroke="#cbb07c" strokeWidth={2.4} fill="none" opacity={0.7} strokeLinecap="round" />
          {bristles}
        </g>
      ))}
    </g>
  );
}

/* ---------------- Nuss mit Fraßloch ---------------- */

function NutShell({ x, y, s = 1, rot = 0, hole = false }: { x: number; y: number; s?: number; rot?: number; hole?: boolean }) {
  const body = 'M0,-40 C26,-36 38,-10 32,14 C27,34 10,42 0,40 C-12,42 -30,32 -33,12 C-37,-12 -24,-36 0,-40 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={body} fill="#c9985a" stroke="#6a4520" strokeWidth={2.2} strokeLinejoin="round" />
      <Plastic d={body} hi={0.5} lo={0.34} speck={0.16} />
      <path d="M-24,-14 C-26,4 -18,22 -6,32 M-10,-30 C-16,-8 -14,14 -4,36 M8,-32 C12,-10 12,14 6,36" stroke="#a87a42" strokeWidth={1.6} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M-16,34 C-10,40 10,40 16,34 C12,26 -12,26 -16,34 Z" fill="#e6cfa0" stroke="#6a4520" strokeWidth={1.8} strokeLinejoin="round" />
      {hole && (
        <>
          {/* unregelmäßiges, dunkles Fraßloch mit hellem, abgenagtem Rand (kein Gesicht) */}
          <path d="M-4,-14 C6,-21 21,-16 23,-3 C24,9 13,15 2,11 C-9,7 -11,-8 -4,-14 Z" fill="#e0bf86" stroke="#6a4520" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M-1,-11 C7,-16 18,-12 19,-3 C20,6 11,11 3,8 C-6,5 -7,-6 -1,-11 Z" fill="#33200e" />
          <path d="M-8,-8 l5,2 M-9,-1 l5,1 M-6,6 l5,-2 M22,-8 l-4,2 M22,2 l-4,0" stroke="#8a5c2c" strokeWidth={1.1} fill="none" opacity={0.75} strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function NutHalf({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  const half = 'M-30,-4 C-30,-26 -12,-38 6,-36 C20,-34 30,-22 32,-4 C16,0 -12,2 -30,-4 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={half} fill="#c9985a" stroke="#6a4520" strokeWidth={2.2} strokeLinejoin="round" />
      <Plastic d={half} hi={0.4} lo={0.32} speck={0.16} />
      <path d="M-30,-4 C-12,2 16,0 32,-4" stroke="#3e2610" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-26,-8 L-22,-2 L-17,-8 L-12,-1 L-6,-7 L0,0 L6,-7 L12,-1 L19,-7 L25,-2 L29,-7" stroke="#e6cfa0" strokeWidth={1.8} fill="none" strokeLinejoin="round" opacity={0.85} />
    </g>
  );
}

/* ---------------- Abgenagter Zapfen ---------------- */

function GnawedCone({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const scales: ReactElement[] = [];
  // Reste der Schuppen nur noch an der Spitze (oben); darunter die nackte Spindel mit Ansatzstellen
  for (let row = 0; row < 3; row++) {
    for (let xx = -22 + (row % 2) * 9; xx <= 22; xx += 18) {
      const yy = -60 + row * 11;
      scales.push(
        <g key={`${row}-${xx}`}>
          <path d={`M${xx - 10},${yy - 4} Q${xx},${yy + 14} ${xx + 10},${yy - 4} Q${xx + 2},${yy - 8} ${xx - 10},${yy - 4} Z`} fill={C.b3} stroke={C.b5} strokeWidth={1.8} strokeLinejoin="round" />
        </g>,
      );
    }
  }
  const stubs: ReactElement[] = [];
  for (let row = 0; row < 9; row++) {
    const yy = -26 + row * 9.5;
    stubs.push(<path key={`l${row}`} d={`M-6,${yy} q-5,2 -8,-1`} stroke="#6a4a2a" strokeWidth={2.4} fill="none" strokeLinecap="round" />);
    stubs.push(<path key={`r${row}`} d={`M6,${yy + 4.5} q5,2 8,-1`} stroke="#6a4a2a" strokeWidth={2.4} fill="none" strokeLinecap="round" />);
  }
  const core = 'M-7,-34 L7,-34 L5,66 L-5,66 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={core} fill="#a98456" stroke={C.b5} strokeWidth={2} strokeLinejoin="round" />
      <Plastic d={core} hi={0.4} lo={0.3} speck={0.2} />
      {stubs}
      <path d="M-5,-30 L-4,62" stroke="#d3b583" strokeWidth={1.6} opacity={0.7} strokeLinecap="round" />
      {scales}
    </g>
  );
}

function LooseScale({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-9,-3 Q0,13 9,-3 Q2,-8 -9,-3 Z" fill={C.b3} stroke={C.b5} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M-5,0 Q0,6 5,0" stroke={C.b1} strokeWidth={1.4} fill="none" opacity={0.7} strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Blattskelett ---------------- */

function LeafSkeleton({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const rnd = det(21);
  const side: ReactElement[] = [];
  const net: ReactElement[] = [];
  const outline = 'M0,-70 C34,-52 44,-14 34,22 C26,48 10,64 0,70 C-10,64 -26,48 -34,22 C-44,-14 -34,-52 0,-70 Z';
  for (let i = 0; i < 9; i++) {
    const yy = -52 + i * 12.5;
    const w = 12 + 30 * Math.sin(((i + 1.2) / 10.2) * Math.PI);
    side.push(<path key={`a${i}`} d={`M0,${yy + 6} C${w * 0.5},${yy + 2} ${w * 0.9},${yy - 2} ${w},${yy - 9}`} />);
    side.push(<path key={`b${i}`} d={`M0,${yy + 6} C${-w * 0.5},${yy + 2} ${-w * 0.9},${yy - 2} ${-w},${yy - 9}`} />);
  }
  for (let i = 0; i < 40; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * 26;
    const cx = Math.cos(a) * d;
    const cy = -6 + Math.sin(a) * d * 2.1;
    net.push(<path key={i} d={`M${cx.toFixed(1)},${cy.toFixed(1)} q${(rnd() * 12 - 6).toFixed(1)},${(rnd() * 12 - 6).toFixed(1)} ${(rnd() * 16 - 8).toFixed(1)},${(rnd() * 16 - 8).toFixed(1)}`} />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* Rest der Blattfläche: nur noch hauchdünne Fetzen am Rand */}
      <path d={outline} fill="#d9bd8a" opacity={0.22} />
      <path d={outline} fill="none" stroke="#a67c52" strokeWidth={1.6} strokeDasharray="5 6" opacity={0.7} strokeLinecap="round" />
      <path d="M0,76 L0,-68" stroke="#8a6238" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M0,70 Q3,82 -1,90" stroke="#8a6238" strokeWidth={3} fill="none" strokeLinecap="round" />
      <g stroke="#9a7144" strokeWidth={1.9} fill="none" strokeLinecap="round">
        {side}
      </g>
      <g stroke="#b48a5a" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.75}>
        {net}
      </g>
      <path d="M0,76 L0,-68" stroke="#e5c999" strokeWidth={1} opacity={0.6} strokeLinecap="round" />
    </g>
  );
}

/* ---------------- Farn ---------------- */

function FernFrond({ x, y, rot = 0, s = 1, under = false }: { x: number; y: number; rot?: number; s?: number; under?: boolean }) {
  const pairs = 10;
  const pinnae: ReactElement[] = [];
  const spine = (t: number): [number, number] => [Math.sin(t * 0.9) * 8 * t, 90 - t * 170];
  for (let i = 0; i < pairs; i++) {
    const t = i / (pairs - 1);
    const [px, py] = spine(0.06 + t * 0.92);
    const len = 52 * (1 - t * 0.8) + 6;
    const w = 7.5 * (1 - t * 0.5);
    for (const side of [-1, 1]) {
      const shape = `M0,0 C${len * 0.2},${-w * 1.2} ${len * 0.75},${-w} ${len},0 C${len * 0.75},${w * 0.8} ${len * 0.2},${w * 1.1} 0,0 Z`;
      const lobes: ReactElement[] = [];
      const lobeN = Math.max(3, Math.round(len / 9));
      for (let j = 1; j < lobeN; j++) {
        const lx = (j / lobeN) * len * 0.92;
        lobes.push(<path key={j} d={`M${lx},${-w * 0.8} L${lx},${w * 0.7}`} stroke={under ? '#6f8f56' : '#2f6a3a'} strokeWidth={1} opacity={0.55} />);
      }
      // Sporenhäufchen: kleine braune Punkte in zwei Reihen beidseits der Mittelrippe
      const sori: ReactElement[] = [];
      if (under) {
        for (let j = 1; j < lobeN; j++) {
          const lx = (j / lobeN) * len * 0.92 - 2;
          sori.push(<circle key={`a${j}`} cx={lx} cy={-w * 0.45} r={1.7 + (1 - t) * 0.5} fill="#8a5a2a" />);
          sori.push(<circle key={`b${j}`} cx={lx} cy={w * 0.4} r={1.7 + (1 - t) * 0.5} fill="#8a5a2a" />);
        }
      }
      pinnae.push(
        <g key={`${i}${side}`} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)})`}>
          <g transform={side < 0 ? 'scale(-1 1)' : undefined}>
            <g transform={`rotate(${-(24 + t * 22)})`}>
              <path d={shape} fill={under ? '#a9c987' : '#4f9a4c'} stroke={under ? '#6f8f56' : '#2b5e33'} strokeWidth={1.3} strokeLinejoin="round" />
              <path d={`M0,0 L${len},0`} stroke={under ? '#7f9f64' : '#2b5e33'} strokeWidth={1.1} opacity={0.7} />
              {lobes}
              {sori}
            </g>
          </g>
        </g>,
      );
    }
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,90 Q-4,70 -3,50 M0,90 Q4,100 8,108" stroke="#5b4a2a" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      {pinnae}
      <path d={`M0,90 ${Array.from({ length: 12 }, (_, i) => spine(0.04 + (i / 11) * 0.95)).map(([a, b]) => `L${a.toFixed(1)},${b.toFixed(1)}`).join(' ')}`} stroke={under ? '#7f9f64' : '#2b5e33'} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/* ---------------- Totholz, Pilz ---------------- */

function RottingLog({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const body = 'M-86,-18 C-70,-30 -40,-26 -10,-30 C30,-34 60,-28 84,-20 L90,-4 L84,8 L88,22 C60,34 20,30 -14,34 C-50,36 -76,30 -90,20 L-84,4 Z';
  const rnd = det(9);
  const crumbs: ReactElement[] = [];
  for (let i = 0; i < 22; i++) {
    crumbs.push(<circle key={i} cx={-84 + rnd() * 170} cy={34 + rnd() * 10} r={1.2 + rnd() * 2.2} fill={i % 3 ? '#6b4a2e' : '#9a7448'} opacity={0.85} />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {crumbs}
      <path d={body} fill="#8a6540" stroke="#3f2a16" strokeWidth={2.4} strokeLinejoin="round" />
      <Speckle d={body} opacity={0.45} color="#2a1a0a" />
      <Plastic d={body} hi={0.3} lo={0.34} speck={0.2} />
      {/* Risse und faserige, helle Stellen */}
      <g fill="none" strokeLinecap="round">
        <path d="M-72,-8 C-50,-12 -36,-4 -18,-10 C0,-16 16,-8 38,-12" stroke="#3f2a16" strokeWidth={2.2} opacity={0.7} />
        <path d="M-60,10 C-40,6 -20,14 4,8 C26,2 48,10 70,6" stroke="#3f2a16" strokeWidth={2} opacity={0.65} />
        <path d="M-30,-22 L-26,-6 M20,-26 L26,-8 M52,-20 L58,-4" stroke="#3f2a16" strokeWidth={1.8} opacity={0.6} />
        <path d="M-66,0 C-44,-2 -26,4 -4,0 M4,16 C24,12 44,20 66,16" stroke="#cfae78" strokeWidth={1.8} opacity={0.7} />
      </g>
      {/* kleiner Moospolster, der auf dem weichen Holz wächst */}
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={46 + (i % 3) * 8} cy={-26 + Math.floor(i / 3) * -6 + (i % 2) * 3} r={8 - (i % 3)} fill={i % 2 ? '#6aa04e' : '#58994a'} stroke="#2c5e34" strokeWidth={1.2} />
        ))}
      </g>
    </g>
  );
}

function Shelf({ x, y, w = 56, s = 1, rot = 0 }: { x: number; y: number; w?: number; s?: number; rot?: number }) {
  const cap = `M0,0 C0,-${w * 0.55} ${w},-${w * 0.55} ${w},0 C${w * 0.7},${w * 0.16} ${w * 0.3},${w * 0.16} 0,0 Z`;
  const bands = [0.78, 0.58, 0.38];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M2,2 C${w * 0.3},${w * 0.2} ${w * 0.7},${w * 0.2} ${w - 2},2 L${w - 6},9 C${w * 0.6},${w * 0.24} ${w * 0.4},${w * 0.24} 6,9 Z`} fill="#efe3c3" stroke="#6a5030" strokeWidth={1.8} strokeLinejoin="round" />
      <clipPath id={`il-shelf-${Math.round(x)}-${Math.round(y)}`}>
        <path d={cap} />
      </clipPath>
      <path d={cap} fill="#a47a48" stroke="#4d3320" strokeWidth={2.2} strokeLinejoin="round" />
      <g clipPath={`url(#il-shelf-${Math.round(x)}-${Math.round(y)})`} fill="none" strokeLinecap="round">
        {bands.map((b, i) => (
          <path key={b} d={`M${w * (1 - b) * 0.5},0 C${w * (1 - b) * 0.5},-${w * 0.5 * b} ${w - w * (1 - b) * 0.5},-${w * 0.5 * b} ${w - w * (1 - b) * 0.5},0`} stroke={i % 2 ? '#c9a46c' : '#6f4a26'} strokeWidth={3.4} opacity={0.75} />
        ))}
        <path d={`M2,-2 C${w * 0.1},-${w * 0.42} ${w * 0.9},-${w * 0.42} ${w - 2},-2`} stroke="#f1e2bc" strokeWidth={2.4} opacity={0.9} />
      </g>
      <Plastic d={cap} hi={0.3} lo={0.3} speck={0.16} />
    </g>
  );
}

/* ---------------- Jahresringe, Maserung ---------------- */

function RingsSlice({ x, y, r = 70, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  const rings: ReactElement[] = [];
  const widths = [0.12, 0.2, 0.3, 0.38, 0.5, 0.58, 0.66, 0.78, 0.88];
  widths.forEach((w, i) => {
    const wob = (k: number) => 1 + Math.sin(k * 2.1 + i) * 0.02 + (i % 3) * 0.005;
    const pts: string[] = [];
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      pts.push(`${(Math.cos(a) * r * w * wob(k) * 1.04 + 0.02 * r).toFixed(1)},${(Math.sin(a) * r * w * 0.96 * wob(k + 3)).toFixed(1)}`);
    }
    rings.push(<path key={i} d={`M${pts.join(' L')} Z`} fill="none" stroke={i % 2 ? '#8a5f34' : '#b98a55'} strokeWidth={i % 2 ? 2 : 1.4} opacity={0.9} strokeLinejoin="round" />);
  });
  const outer = `M${Array.from({ length: 28 }, (_, k) => {
    const a = (k / 28) * Math.PI * 2;
    const rr = r * (1 + Math.sin(k * 1.7) * 0.015);
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr * 0.97).toFixed(1)}`;
  }).join(' L')} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={outer} fill="#5a3b20" stroke="#3a2512" strokeWidth={4} strokeLinejoin="round" />
      <path d={outer} fill="#e0bd86" transform="scale(0.93)" />
      <Speckle d={outer} opacity={0.14} />
      {rings}
      <circle cx={r * 0.02} cy={0} r={3} fill="#7a4f28" />
      <path d={`M${r * 0.05},0 L${r * 0.62},-${r * 0.1}`} stroke="#6a4222" strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />
      <path d={`M${r * 0.05},0 L${r * 0.62},-${r * 0.1}`} stroke="#3a2512" strokeWidth={0.9} strokeLinecap="round" opacity={0.7} />
      <Plastic d={outer} hi={0.18} lo={0.22} speck={0.1} />
    </g>
  );
}

function WoodBlock({ x, y }: { x: number; y: number }) {
  const body = 'M-92,-48 L92,-52 L96,48 L-96,50 Z';
  const rnd = det(14);
  const lines: ReactElement[] = [];
  for (let i = 0; i < 17; i++) {
    const yy = -46 + i * 5.7;
    const k = (rnd() - 0.5) * 3;
    // Linien laufen um den Ast herum (Astauge bei x=26, y=0)
    const dist = Math.abs(yy);
    const bend = Math.max(0, 22 - dist * 1.1) * (yy < 0 ? -1 : 1) * 0.65;
    lines.push(<path key={i} d={`M-92,${yy + k} C-40,${yy - 3 + k} -10,${yy + k} 26,${yy + bend + k} C62,${yy + k} 80,${yy - 2 + k} 94,${yy + k}`} stroke={i % 3 === 0 ? '#7a5128' : '#a8793f'} strokeWidth={i % 3 === 0 ? 1.8 : 1.2} fill="none" opacity={0.85} />);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id="il-wood-clip">
        <path d={body} />
      </clipPath>
      <path d={body} fill="#d3a766" stroke="#4d3320" strokeWidth={2.6} strokeLinejoin="round" />
      <g clipPath="url(#il-wood-clip)">
        {lines}
        <ellipse cx={26} cy={0} rx={11} ry={8} fill="#8a5a2c" stroke="#5a3a1c" strokeWidth={1.8} />
        <ellipse cx={26} cy={0} rx={6} ry={4.4} fill="#5a3a1c" opacity={0.8} />
        <ellipse cx={26} cy={0} rx={17} ry={12.5} fill="none" stroke="#7a5128" strokeWidth={1.4} opacity={0.8} />
      </g>
      <Plastic d={body} hi={0.25} lo={0.25} speck={0.12} />
    </g>
  );
}

/* ---------------- Keimling, Netz, Galle, Mine ---------------- */

function Seedling({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const cot = 'M0,0 C-14,-4 -26,-18 -24,-30 C-12,-34 -2,-22 0,0 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 C-2,-24 2,-44 0,-66" stroke="#9aa05a" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M0,0 C-2,-24 2,-44 0,-66" stroke="#c4c97e" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* zwei Keimblätter */}
      <g transform="translate(0 -40) rotate(-12)">
        <path d={cot} fill="#8cc15a" stroke="#3b7a3a" strokeWidth={1.9} strokeLinejoin="round" />
        <path d="M-2,-2 L-18,-24 M-2,-2 L-10,-28" stroke="#cfe9a6" strokeWidth={1.2} opacity={0.8} strokeLinecap="round" />
      </g>
      <g transform="translate(0 -40) scale(-1 1) rotate(-12)">
        <path d={cot} fill="#7bb661" stroke="#3b7a3a" strokeWidth={1.9} strokeLinejoin="round" />
        <path d="M-2,-2 L-18,-24 M-2,-2 L-10,-28" stroke="#cfe9a6" strokeWidth={1.2} opacity={0.8} strokeLinecap="round" />
      </g>
      {/* erste richtige Blättchen oben */}
      <g transform="translate(0 -66) rotate(-30)">
        <path d="M0,0 C-8,-6 -10,-18 -2,-26 C6,-18 6,-6 0,0 Z" fill="#6aa04e" stroke="#2c5e34" strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M-1,-2 L-2,-22" stroke="#bfe19a" strokeWidth={1} />
      </g>
      <g transform="translate(0 -66) rotate(32)">
        <path d="M0,0 C-8,-6 -10,-18 -2,-26 C6,-18 6,-6 0,0 Z" fill="#7bb661" stroke="#2c5e34" strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M-1,-2 L-2,-22" stroke="#bfe19a" strokeWidth={1} />
      </g>
    </g>
  );
}

function Web({ x, y, r = 78 }: { x: number; y: number; r?: number }) {
  const spokes = 13;
  const lines: ReactElement[] = [];
  const dots: ReactElement[] = [];
  const rnd = det(33);
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + 0.2;
    lines.push(<path key={`s${i}`} d={`M0,0 L${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r * 0.92).toFixed(1)}`} />);
  }
  for (let ring = 1; ring <= 7; ring++) {
    const rr = (ring / 7.4) * r;
    const pts: string[] = [];
    for (let i = 0; i <= spokes; i++) {
      const a = ((i % spokes) / spokes) * Math.PI * 2 + 0.2;
      const sag = i === 0 ? 0 : 0.96 + 0.04 * Math.sin(i * 2);
      pts.push(`${(Math.cos(a) * rr * sag).toFixed(1)},${(Math.sin(a) * rr * 0.92 * sag).toFixed(1)}`);
      if (i < spokes && ring % 2) dots.push(<circle key={`d${ring}-${i}`} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr * 0.92} r={1.5 + rnd() * 1.1} fill="#fff" opacity={0.95} stroke="#8aaec0" strokeWidth={0.6} />);
    }
    lines.push(<path key={`r${ring}`} d={`M${pts.join(' L')}`} />);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <g stroke="#8a95a0" strokeWidth={1.1} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.95}>
        {lines}
      </g>
      {dots}
    </g>
  );
}

function Gall({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={r} fill="#d9a05b" stroke="#7a4a1c" strokeWidth={1.8} />
      <Plastic d={`M${-r},0 a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`} hi={0.55} lo={0.36} speck={0.12} />
      <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.22} fill="#fff" opacity={0.5} />
    </g>
  );
}

/* ---------------- Nadelzweig, Buchenknospe, Blattflechte ---------------- */

function NeedleTwig({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const rnd = det(41);
  const needles: ReactElement[] = [];
  for (let i = 0; i < 26; i++) {
    const t = 0.06 + (i / 26) * 0.9;
    const px = -86 + t * 172;
    const py = Math.sin(t * 3.1) * -5;
    for (const side of [-1, 1]) {
      for (const k of [0, 1]) {
        const ang = side * (38 + rnd() * 34) + (k ? 12 * side : 0) - 90 * 0;
        const len = 15 + rnd() * 7 - Math.abs(t - 0.5) * 6;
        const a = ((ang - 90 * side * 0) * Math.PI) / 180;
        const ex = px + Math.sin(a) * len * 0.5 + 6 * (t - 0.5) * 0;
        const ey = py + side * -Math.cos(a) * len * 0.9;
        needles.push(
          <path key={`${i}${side}${k}`} d={`M${px.toFixed(1)},${py.toFixed(1)} L${(px + (ex - px) + 8).toFixed(1)},${(py + (ey - py)).toFixed(1)}`} stroke={k ? '#3f7a45' : '#2f6a3a'} strokeWidth={2.6} strokeLinecap="round" />,
        );
      }
    }
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Thick d="M-92,6 Q-30,-6 6,-2 T92,-8" w={5} fill="#8a6540" line="#4d3320" edge={2.4} />
      {needles}
      <path d="M-86,3 Q-30,-8 4,-4" stroke="#d9bd8a" strokeWidth={1.2} fill="none" opacity={0.6} strokeLinecap="round" />
    </g>
  );
}

function BeechTwig({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const nodes: [number, number][] = [[-84, 18], [-48, -6], [-8, 14], [30, -10], [66, 8]];
  const path = `M${nodes.map(([a, b]) => `${a},${b}`).join(' L')}`;
  const bud = (nx: number, ny: number, up: boolean, len: number) => {
    const dir = up ? -1 : 1;
    const bodyD = `M-5,0 C-7,${dir * len * 0.45} -3,${dir * len * 0.85} 0,${dir * len} C3,${dir * len * 0.85} 7,${dir * len * 0.45} 5,0 Z`;
    return (
      <g key={`${nx}${ny}`} transform={`translate(${nx} ${ny}) rotate(${up ? 24 : -22})`}>
        <path d={bodyD} fill="#a8643a" stroke="#5a3418" strokeWidth={1.8} strokeLinejoin="round" />
        <Plastic d={bodyD} hi={0.35} lo={0.3} speck={0.15} />
        {[0.25, 0.45, 0.65, 0.82].map((f2) => (
          <path key={f2} d={`M-4.6,${dir * len * f2} Q0,${dir * len * (f2 + 0.08)} 4.6,${dir * len * f2}`} stroke="#5a3418" strokeWidth={1.1} fill="none" opacity={0.7} />
        ))}
        <path d={`M0,${dir * len * 0.9} L0,${dir * len}`} stroke="#3a210f" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={path} fill="none" stroke="#5a3a20" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#9a7348" strokeWidth={5.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#c9a672" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} transform="translate(-1 -1.4)" />
      {bud(nodes[1][0], nodes[1][1] - 2, true, 40)}
      {bud(nodes[2][0], nodes[2][1] + 2, false, 36)}
      {bud(nodes[3][0], nodes[3][1] - 2, true, 42)}
      {bud(nodes[4][0], nodes[4][1] + 2, false, 34)}
      {bud(nodes[0][0] + 6, nodes[0][1] - 2, true, 32)}
    </g>
  );
}

function FoliOseLichen({ x, y, r, rot = 0, c1 = '#b9c7a2', c2 = '#8fa07a' }: { x: number; y: number; r: number; rot?: number; c1?: string; c2?: string }) {
  const lobes: ReactElement[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    lobes.push(
      <g key={i} transform={`rotate(${a})`}>
        <path d={`M0,0 C${-r * 0.32},${-r * 0.3} ${-r * 0.34},${-r * 0.86} ${-r * 0.1},${-r * 0.98} C${r * 0.05},${-r * 1.04} ${r * 0.28},${-r * 0.9} ${r * 0.3},${-r * 0.6} C${r * 0.3},${-r * 0.3} ${r * 0.14},${-r * 0.1} 0,0 Z`} fill={i % 2 ? c1 : shadeLichen(c1)} stroke={c2} strokeWidth={1.4} strokeLinejoin="round" />
        <path d={`M0,${-r * 0.14} Q${-r * 0.04},${-r * 0.5} ${-r * 0.02},${-r * 0.82}`} stroke="#ffffff" strokeWidth={1} opacity={0.35} fill="none" strokeLinecap="round" />
      </g>,
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {lobes}
      <circle r={r * 0.2} fill={c2} opacity={0.75} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={Math.cos(i * 2.1) * r * 0.16} cy={Math.sin(i * 2.1) * r * 0.16} r={r * 0.07} fill="#8a6a3a" stroke="#4d3320" strokeWidth={0.8} />
      ))}
    </g>
  );
}
const shadeLichen = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const m = (v: number) => Math.round(v * 0.92)
    .toString(16)
    .padStart(2, '0');
  return `#${m((n >> 16) & 255)}${m((n >> 8) & 255)}${m(n & 255)}`;
};

/* ---------------- Registry ---------------- */

export const forestArt: Record<string, Art> = {
  'acorn-cup': {
    bg: 'cream',
    draw: () => (
      <>
        <Mv origin={[100, 110]}>
          <AcornCup x={100} y={92} s={1.3} />
        </Mv>
        <AcornCup x={186} y={150} s={0.68} rot={74} tilt />
      </>
    ),
  },
  'beech-husk': {
    bg: 'cream',
    draw: () => (
      <>
        <Mv origin={[110, 100]}>
          <BeechHusk x={108} y={104} s={1.12} rot={14} />
        </Mv>
        <g transform="translate(192 156) rotate(24)">
          <path d="M0,0 C-8,-4 -10,-18 0,-26 C10,-18 8,-4 0,0 Z" fill="#8a6a3a" stroke={C.b5} strokeWidth={1.8} strokeLinejoin="round" />
        </g>
      </>
    ),
  },
  'gnawed-nut': {
    bg: 'cream',
    draw: () => (
      <>
        <Mv origin={[90, 100]}>
          <NutShell x={84} y={100} s={1.25} rot={-8} hole />
        </Mv>
        <NutHalf x={186} y={140} s={0.9} rot={8} />
        <NutHalf x={196} y={168} s={0.85} rot={190} />
      </>
    ),
  },
  'gnawed-cone': {
    bg: 'green',
    draw: () => (
      <>
        <LooseScale x={36} y={160} rot={-20} />
        <LooseScale x={186} y={166} rot={30} />
        <LooseScale x={206} y={150} rot={-50} />
        <LooseScale x={54} y={176} rot={140} />
        <Mv origin={[120, 100]}>
          <GnawedCone x={116} y={96} rot={-22} s={1.12} />
        </Mv>
      </>
    ),
  },
  'leaf-skeleton': {
    bg: 'earth',
    draw: () => (
      <Mv origin={[120, 100]}>
        <LeafSkeleton x={120} y={92} rot={-12} s={1.12} />
      </Mv>
    ),
  },
  'fern-frond': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 180]}>
        <FernFrond x={116} y={86} rot={-4} s={1} />
      </Mv>
    ),
  },
  'fern-spores': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 180]}>
        <FernFrond x={116} y={86} rot={4} s={1} under />
      </Mv>
    ),
  },
  'rotting-wood': {
    bg: 'earth',
    draw: () => (
      <Mv origin={[120, 120]}>
        <RottingLog x={120} y={104} rot={-4} s={1.1} />
      </Mv>
    ),
  },
  'bracket-fungus': {
    bg: 'green',
    draw: () => {
      const trunk = 'M50,0 L190,0 L190,200 L50,200 Z';
      return (
        <>
          <path d={trunk} fill="#6f4a2b" />
          <Speckle d={trunk} opacity={0.35} />
          <g stroke="#3f2a16" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round">
            <path d="M74,0 C70,60 78,120 72,200 M104,0 C108,70 100,130 106,200 M140,0 C136,60 144,120 138,200 M168,0 C172,70 164,130 170,200" />
          </g>
          <Plastic d={trunk} hi={0.18} lo={0.3} speck={0.14} />
          <Mv origin={[120, 100]}>
            <Shelf x={104} y={118} w={80} s={1} />
            <Shelf x={92} y={64} w={64} s={1} rot={-3} />
          </Mv>
        </>
      );
    },
  },
  'leaf-aging': {
    bg: 'earth',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="ovate" x={64} y={100} rot={-28} s={1.12} colors={LEAF_ORANGE} />
        <g>
          <Leaf kind="ovate" x={176} y={104} rot={24} s={1.12} colors={{ ...LEAF_BROWN, fill: '#7a5430', edge: '#3e2a16', vein: '#a98456' }} hole={{ x: -4, y: -8, r: 5 }} />
          <g transform="translate(176 104) rotate(24) scale(1.12)" fill="#e8dcc0" opacity={0.95}>
            <ellipse cx={14} cy={10} rx={5} ry={4} />
            <ellipse cx={-14} cy={22} rx={4} ry={3.4} />
            <path d="M20,-24 C26,-20 28,-12 22,-10 C16,-14 16,-20 20,-24 Z" />
          </g>
        </g>
      </Mv>
    ),
  },
  gall: {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="oak" x={116} y={96} rot={-12} s={1.2} colors={{ ...LEAF_GREEN, fill: '#6aa04e' }} />
        <Gall x={96} y={104} r={9} />
        <Gall x={128} y={90} r={11} />
        <Gall x={146} y={122} r={8} />
      </Mv>
    ),
  },
  'leaf-mine': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="ovate" x={118} y={96} rot={-10} s={1.55} colors={{ ...LEAF_GREEN, fill: '#6aa04e' }} />
        <g transform="translate(118 96) rotate(-10) scale(1.55)" fill="none" stroke="#f1e8b4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-14,28 C-20,18 -8,12 -12,4 C-16,-4 -2,-8 4,-2 C10,4 16,-4 12,-12" strokeWidth={1.4} />
          <path d="M12,-12 C10,-18 16,-24 22,-20" strokeWidth={2.4} />
          <path d="M22,-20 C30,-18 28,-6 22,-4" strokeWidth={3.6} />
          <path d="M-14,28 C-20,18 -8,12 -12,4 C-16,-4 -2,-8 4,-2 C10,4 16,-4 12,-12" stroke="#b8a860" strokeWidth={0.6} />
        </g>
      </Mv>
    ),
  },
  'wood-grain': {
    bg: 'earth',
    draw: () => (
      <Mv origin={[120, 100]}>
        <WoodBlock x={120} y={100} />
      </Mv>
    ),
  },
  'tree-rings': {
    bg: 'earth',
    draw: () => (
      <Mv origin={[120, 100]}>
        <RingsSlice x={120} y={98} r={76} />
      </Mv>
    ),
  },
  'tree-seedling': {
    bg: 'earth',
    draw: () => (
      <>
        <path d="M0,160 C50,148 190,148 240,160 V200 H0 Z" fill="#6f4a2b" opacity={0.85} />
        <path d="M0,160 C50,148 190,148 240,160" stroke="#4d3320" strokeWidth={2} fill="none" />
        <g transform="translate(36 162) rotate(-18)">
          <Leaf kind="ovate" x={0} y={0} s={0.5} colors={LEAF_BROWN} />
        </g>
        <g transform="translate(204 164) rotate(30)">
          <Leaf kind="round" x={0} y={0} s={0.45} colors={{ ...LEAF_ORANGE, fill: '#b47a3c' }} />
        </g>
        <Mv origin={[120, 160]}>
          <Seedling x={120} y={160} s={1.45} />
        </Mv>
      </>
    ),
  },
  'spider-web': {
    bg: 'sky',
    shadow: false,
    draw: () => (
      <>
        <Thick d="M-6,40 Q70,32 150,8" w={6} fill={C.b3} line={C.b5} edge={3} />
        <Thick d="M246,170 Q190,150 150,120" w={6} fill={C.b3} line={C.b5} edge={3} />
        <Mv origin={[120, 100]}>
          <Web x={120} y={96} r={80} />
        </Mv>
      </>
    ),
  },
  'needle-twig': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <NeedleTwig x={122} y={104} rot={-14} s={1.2} />
      </Mv>
    ),
  },
  'beech-bud': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <BeechTwig x={122} y={102} rot={-8} s={1.22} />
      </Mv>
    ),
  },
  /* Blattflechte mit Lappen auf einem Ast (ersetzt die frühere Krustenflechte auf Stein) */
  lichen: {
    bg: 'cream',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 100]}>
        <g transform="rotate(-10 120 100)">
          <rect x={-10} y={72} width={260} height={56} rx={14} fill="#7b5a3a" stroke="#43301c" strokeWidth={2.4} />
          <path d="M-6,86 C60,80 120,92 246,84 M-6,104 C70,100 140,110 246,100 M-6,118 C60,114 140,122 246,116" stroke="#4d3320" strokeWidth={2} fill="none" opacity={0.55} />
          <FoliOseLichen x={70} y={98} r={44} rot={8} />
          <FoliOseLichen x={160} y={92} r={34} rot={-14} c1="#c9d4b4" c2="#98a884" />
          <FoliOseLichen x={206} y={112} r={20} rot={22} />
        </g>
      </Mv>
    ),
  },
  /* Zwei Zapfenformen: länglich und rundlich (ersetzt das Größenbild des Zapfenvergleichs) */
  'cone-compare': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 110]}>
        <g transform="translate(72 100) rotate(-22) scale(0.74 1.22)">
          <ConeShape x={0} y={0} rot={0} s={1} />
        </g>
        <g transform="translate(176 118) rotate(18) scale(1.2 0.92)">
          <ConeShape x={0} y={0} rot={0} s={0.74} />
        </g>
      </Mv>
    ),
  },
};

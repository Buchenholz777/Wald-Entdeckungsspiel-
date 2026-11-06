import type { ReactElement } from 'react';
import { C, GrassBlades, Ground, Flower, Mv, Pebble, Plastic, Thick, Union, det, type Art } from './kit';
import { ConeShape } from './nature';
import { Scallop } from './shore';

/** Konkrete Funde und Spuren der Inhaltsvorgabe v2: Nüsse, Zapfen, Schalen, Federn, Pilze, Abdrücke. */

/* ---------- Nüsse ---------- */

function Hazelnut({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,-38 C6,-36 20,-26 26,-8 C32,10 22,30 0,32 C-22,30 -32,10 -26,-8 C-20,-26 -6,-36 0,-38 Z" fill="#c68a46" stroke="#6b4423" strokeWidth={2} strokeLinejoin="round" />
      <Plastic d="M0,-38 C6,-36 20,-26 26,-8 C32,10 22,30 0,32 C-22,30 -32,10 -26,-8 C-20,-26 -6,-36 0,-38 Z" hi={0.5} lo={0.34} speck={0.14} />
      <path d="M-14,-18 C-4,-30 10,-28 14,-20 C4,-24 -6,-22 -14,-18 Z" fill="#f0c78a" opacity={0.8} />
      <path d="M-18,-4 C-22,6 -16,20 -8,26 M6,-26 C12,-8 12,10 6,26 M18,-14 C24,0 20,16 14,24" stroke="#9a6430" strokeWidth={2} fill="none" opacity={0.6} strokeLinecap="round" />
      <ellipse cx={0} cy={26} rx={17} ry={7.5} fill="#ecdab2" stroke="#6b4423" strokeWidth={2.4} />
      <path d="M-9,25 Q0,28 9,25" stroke="#c9ae7c" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </g>
  );
}

function HazelHusk({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-36,8 L-32,-26 L-19,-12 L-11,-38 L0,-16 L11,-38 L19,-12 L32,-26 L36,8 C32,28 -32,28 -36,8 Z" fill={C.g2} stroke={C.g5} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-26,6 C-24,-6 -16,-12 -8,-12 M24,6 C22,-6 14,-12 8,-12" stroke={C.g1} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d="M-20,16 Q0,24 20,16" stroke={C.g5} strokeWidth={2.2} fill="none" opacity={0.5} strokeLinecap="round" />
    </g>
  );
}

function BeechNut({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,-34 L33,24 Q0,40 -33,24 Z" fill="#9a6232" stroke="#4d2c12" strokeWidth={2.2} strokeLinejoin="round" />
      <Plastic d="M0,-34 L33,24 Q0,40 -33,24 Z" hi={0.4} lo={0.32} speck={0.18} />
      <path d="M0,-34 L33,24 Q16,33 0,34 Z" fill="#6e4220" opacity={0.55} />
      <path d="M0,-28 L-25,21 Q-14,29 -2,31 Z" fill="#c78a52" opacity={0.55} />
      <path d="M0,-30 L0,32 M0,-30 L-29,22 M0,-30 L29,22" stroke="#d9a468" strokeWidth={2.2} fill="none" opacity={0.75} strokeLinecap="round" />
      <path d="M-8,-18 C-12,-4 -14,6 -16,14" stroke="#fff" strokeWidth={2.4} fill="none" opacity={0.4} strokeLinecap="round" />
    </g>
  );
}

function BeechHusk({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const spikes: ReactElement[] = [];
  for (let i = 0; i < 18; i++) {
    const a = (-170 + (i / 17) * 160) * (Math.PI / 180);
    const x1 = Math.cos(a) * 36;
    const y1 = Math.sin(a) * 26 - 4;
    spikes.push(<path key={i} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${(Math.cos(a) * 48).toFixed(1)},${(Math.sin(a) * 38 - 6).toFixed(1)}`} stroke="#5a4b26" strokeWidth={3} strokeLinecap="round" />);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {spikes}
      <path d="M-38,2 C-38,-30 38,-30 38,2 C38,26 -38,26 -38,2 Z" fill="#8b7a4a" stroke="#4d4020" strokeWidth={3} strokeLinejoin="round" />
      <path d="M-24,-6 C-14,-16 14,-16 24,-6" stroke="#c4b27a" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M-4,-20 Q0,0 -2,20" stroke="#4d4020" strokeWidth={2.4} fill="none" opacity={0.6} />
    </g>
  );
}

/* ---------- Schneckenhäuser ---------- */

function SnailTurret({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const w = [26, 23, 20, 16, 12, 7];
  const ys = w.map((_, i) => 32 - i * 17);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Union fill="#e6d2a8" line="#6f5230" w={5}>
        {w.map((r, i) => (
          <ellipse key={i} cx={0} cy={ys[i]} rx={r} ry={11} />
        ))}
      </Union>
      {w.map((r, i) => (
        <path key={i} d={`M${-r + 2},${ys[i] + 1} Q0,${ys[i] + 11} ${r - 2},${ys[i] - 5}`} stroke="#a47e50" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ))}
      {w.map((r, i) => (
        <path key={`b${i}`} d={`M${-r + 6},${ys[i] - 4} Q${-r / 2},${ys[i] - 9} ${0},${ys[i] - 8}`} stroke="#fff" strokeWidth={2.2} fill="none" opacity={0.55} strokeLinecap="round" />
      ))}
      <ellipse cx={8} cy={40} rx={13} ry={8.5} fill="#d6b784" stroke="#6f5230" strokeWidth={2.8} transform="rotate(-12 8 40)" />
      <ellipse cx={9} cy={40.5} rx={7.5} ry={4.6} fill="#4d3320" transform="rotate(-12 9 40.5)" />
    </g>
  );
}

function SnailRound({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  let d = '';
  for (let i = 0; i <= 90; i++) {
    const t = (i / 90) * Math.PI * 4.2;
    const r = 2 + t * 2.7;
    d += `${i === 0 ? 'M' : 'L'}${(2 + Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)} `;
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <circle r={42} fill="#dfb274" stroke="#6b4423" strokeWidth={2.2} />
      <Plastic d="M-42,0 a42,42 0 1,0 84,0 a42,42 0 1,0 -84,0" hi={0.45} lo={0.32} speck={0.14} />
      <circle cx={-12} cy={-14} r={20} fill="#fff" opacity={0.2} />
      <path d="M-40,6 C-36,-24 -12,-40 14,-40 M-30,28 C-12,40 20,40 34,22" stroke="#a46f35" strokeWidth={5} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d={d} stroke="#7a4e26" strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={30} cy={28} rx={19} ry={13} transform="rotate(35 30 28)" fill="#ebcb92" stroke="#6b4423" strokeWidth={3} />
      <ellipse cx={31} cy={29} rx={11} ry={7} transform="rotate(35 31 29)" fill="#3d2815" />
    </g>
  );
}

/* ---------- Abdrücke ---------- */

const PRINT = { fill: '#a98456', edge: '#6e4f2c', rim: '#f6e7c9' };

function PawPrint({ x, y, s = 1, rot = 0, claws = false, fill = PRINT.fill, edge = PRINT.edge, rim = PRINT.rim }: { x: number; y: number; s?: number; rot?: number; claws?: boolean; fill?: string; edge?: string; rim?: string }) {
  const toes = [
    [-23, -13, -28],
    [-8, -27, -9],
    [8, -27, 9],
    [23, -13, 28],
  ];
  const shapes = (
    <>
      <path d="M-17,8 C-19,-2 -9,-7 0,-5 C9,-7 19,-2 17,8 C15,19 8,25 0,22 C-8,25 -15,19 -17,8 Z" />
      {toes.map(([cx, cy, r], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={6.6} ry={9} transform={`rotate(${r} ${cx} ${cy})`} />
      ))}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g fill={rim} transform="translate(1.6 2.2)">
        {shapes}
      </g>
      <g fill={fill} stroke={edge} strokeWidth={2.6} strokeLinejoin="round">
        {shapes}
      </g>
      {claws &&
        toes.map(([cx, cy, r], i) => (
          <path key={`c${i}`} d={`M${cx - 2.4},${cy - 10} L${cx},${cy - 17} L${cx + 2.4},${cy - 10} Z`} transform={`rotate(${r} ${cx} ${cy})`} fill={edge} />
        ))}
      <path d="M-9,10 C-6,4 6,4 9,10" stroke={edge} strokeWidth={1.8} fill="none" opacity={0.5} strokeLinecap="round" />
    </g>
  );
}

function HoofPrint({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  const half = 'M0,-32 C10,-22 13,8 6,28 C2,35 -5,33 -7,26 C-9,8 -6,-20 0,-32 Z';
  const one = (dx: number, a: number) => (
    <g transform={`translate(${dx} 0) rotate(${a})`}>
      <path d={half} fill={PRINT.rim} transform="translate(1.6 2.2)" />
      <path d={half} fill={PRINT.fill} stroke={PRINT.edge} strokeWidth={2.8} strokeLinejoin="round" />
      <path d="M-3,-14 C-4,0 -3,12 -2,20" stroke={PRINT.edge} strokeWidth={1.8} fill="none" opacity={0.45} strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {one(-10, 4)}
      <g transform="scale(-1 1)">{one(-10, 4)}</g>
    </g>
  );
}

function BirdPrint({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  const sand = { fill: '#d6b273', edge: '#9a7536', rim: '#fff3d1' };
  const web = 'M0,16 L-30,-22 Q-13,-14 0,-36 Q13,-14 30,-22 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={web} fill={sand.rim} transform="translate(1.6 2.2)" />
      <path d={web} fill={sand.fill} stroke={sand.edge} strokeWidth={2.6} strokeLinejoin="round" />
      <g stroke={sand.edge} strokeWidth={6} strokeLinecap="round">
        <path d="M0,16 L-30,-22 M0,16 L0,-36 M0,16 L30,-22 M0,16 L0,30" />
      </g>
      <g stroke={sand.fill} strokeWidth={2.6} strokeLinecap="round">
        <path d="M0,16 L-30,-22 M0,16 L0,-36 M0,16 L30,-22 M0,16 L0,30" />
      </g>
      <circle cx={0} cy={16} r={5} fill={sand.edge} opacity={0.35} />
    </g>
  );
}

/* ---------- Sonstiges ---------- */

function Toadstool({ x, y, s = 1, cap = C.r2, capEdge = C.r3, dots = true }: { x: number; y: number; s?: number; cap?: string; capEdge?: string; dots?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-13,0 C-11,-24 -10,-36 -12,-50 L12,-50 C10,-36 11,-24 13,0 C6,7 -6,7 -13,0 Z" fill="#f6efdc" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-6,-6 C-7,-22 -6,-34 -7,-46" stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
      <path d="M-50,-46 C-30,-38 30,-38 50,-46 C30,-52 -30,-52 -50,-46 Z" fill="#efe3c4" stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M-50,-46 C-50,-88 -22,-106 0,-106 C22,-106 50,-88 50,-46 C30,-38 -30,-38 -50,-46 Z" fill={cap} stroke={capEdge} strokeWidth={2.2} strokeLinejoin="round" />
      <Plastic d="M-50,-46 C-50,-88 -22,-106 0,-106 C22,-106 50,-88 50,-46 C30,-38 -30,-38 -50,-46 Z" hi={0.45} lo={0.32} speck={0.1} />
      <path d="M-34,-70 C-28,-86 -12,-96 4,-98" stroke="#fff" strokeWidth={5} fill="none" opacity={0.35} strokeLinecap="round" />
      {dots &&
        [
          [-24, -66, 7],
          [2, -86, 8],
          [26, -70, 7],
          [-6, -56, 5.4],
          [34, -52, 4.6],
          [-38, -52, 4.6],
        ].map(([cx, cy, r], i) => <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.82} fill="#fffaf0" opacity={0.95} />)}
    </g>
  );
}

export const findsArt: Record<string, Art> = {
  hazelnut: {
    bg: 'cream',
    draw: () => (
      <>
        <Mv origin={[110, 110]}>
          <Hazelnut x={96} y={98} s={1.5} rot={-6} />
          <HazelHusk x={184} y={132} s={0.95} />
        </Mv>
      </>
    ),
  },
  beechnut: {
    bg: 'cream',
    draw: () => (
      <>
        <BeechHusk x={176} y={116} s={1} />
        <Mv origin={[100, 110]}>
          <BeechNut x={92} y={98} s={1.55} rot={-8} />
          <BeechNut x={160} y={150} s={0.7} rot={52} />
        </Mv>
      </>
    ),
  },
  'cone-compare': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 110]}>
        <ConeShape x={78} y={96} rot={-30} s={1.0} />
        <ConeShape x={188} y={136} rot={42} s={0.52} />
      </Mv>
    ),
  },
  'white-shell': {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 V200 H0 Z" fill={C.sand2} opacity={0.5} />
        <Mv origin={[120, 110]}>
          <Scallop x={120} y={108} s={1.3} rot={-6} fill="#fffdf8" rib="#e4ddd0" edge="#8f897c" />
        </Mv>
      </>
    ),
  },
  'smooth-stone': {
    bg: 'sand',
    draw: () => (
      <>
        <Pebble x={46} y={150} rx={16} ry={11} fill="#6e6a64" dark="#2e2c28" light="#a09b92" rot={-8} />
        <Pebble x={206} y={146} rx={20} ry={13} fill="#a39d92" dark="#4f4a42" light="#d4cfc4" rot={6} />
        <Mv origin={[120, 120]}>
          <Pebble x={122} y={106} rx={60} ry={42} fill="#ece7db" dark="#8d877a" light="#ffffff" rot={-4} />
          <path d="M82,84 C96,70 126,66 150,74" stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  'snail-shell-spiral': {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 V200 H0 Z" fill={C.sand2} opacity={0.5} />
        <Mv origin={[120, 110]}>
          <SnailTurret x={118} y={96} rot={-24} s={1.32} />
        </Mv>
      </>
    ),
  },
  'snail-shell': {
    bg: 'green',
    draw: () => (
      <>
        <Ground y={152} />
        <GrassBlades x={40} y={156} count={4} h={24} spread={20} />
        <GrassBlades x={204} y={156} count={4} h={24} spread={20} />
        <Mv origin={[120, 110]}>
          <SnailRound x={120} y={104} rot={-8} s={1.5} />
        </Mv>
      </>
    ),
  },
  'shell-vs-snail': {
    bg: 'sand',
    draw: () => (
      <Mv origin={[120, 110]}>
        <Scallop x={66} y={104} s={0.9} rot={-6} />
        <SnailRound x={172} y={106} rot={-14} s={1.0} />
      </Mv>
    ),
  },
  'animal-track': {
    bg: 'earth',
    draw: () => (
      <>
        <path d="M0,160 C60,150 180,150 240,160 V200 H0 Z" fill="#cdb084" opacity={0.5} />
        <Mv origin={[120, 110]}>
          <PawPrint x={52} y={156} s={0.62} rot={22} />
          <PawPrint x={96} y={118} s={0.62} rot={32} />
          <PawPrint x={142} y={132} s={0.62} rot={24} />
          <PawPrint x={184} y={88} s={0.62} rot={34} />
        </Mv>
      </>
    ),
  },
  'deer-track': {
    bg: 'earth',
    draw: () => (
      <>
        <path d="M0,160 C60,150 180,150 240,160 V200 H0 Z" fill="#cdb084" opacity={0.5} />
        <Mv origin={[120, 110]}>
          <HoofPrint x={170} y={74} s={0.8} rot={12} />
          <HoofPrint x={104} y={118} s={1.6} rot={8} />
        </Mv>
      </>
    ),
  },
  'dog-track': {
    bg: 'earth',
    draw: () => (
      <>
        <path d="M0,160 C60,150 180,150 240,160 V200 H0 Z" fill="#cdb084" opacity={0.5} />
        <Mv origin={[120, 110]}>
          <PawPrint x={176} y={62} s={0.9} rot={20} claws />
          <PawPrint x={102} y={126} s={2.0} rot={10} claws />
        </Mv>
      </>
    ),
  },
  'bird-track': {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 V200 H0 Z" fill={C.sand2} opacity={0.5} />
        <Mv origin={[120, 110]}>
          <BirdPrint x={176} y={66} s={0.7} rot={16} />
          <BirdPrint x={104} y={124} s={1.5} rot={8} />
        </Mv>
      </>
    ),
  },
  feather: {
    bg: 'sky',
    draw: () => {
      const barbs: ReactElement[] = [];
      for (let i = 0; i < 13; i++) {
        const yy = -62 + i * 9.6;
        const w = 26 - Math.abs(i - 6) * 1.6;
        barbs.push(
          <path
            key={i}
            d={`M1,${yy + 8} L${w},${yy - 8} M1,${yy + 8} L${-w * 0.8},${yy - 6}`}
            stroke="#6f7b8a"
            strokeWidth={2}
            fill="none"
            opacity={0.65}
            strokeLinecap="round"
          />,
        );
      }
      return (
        <Mv origin={[120, 100]}>
          <g transform="translate(116 100) rotate(32) scale(1.2)">
            <path d="M2,-82 C28,-64 32,-14 14,36 C9,50 4,62 1,72 L-3,72 C-10,56 -24,34 -26,6 C-27,-30 -14,-64 2,-82 Z" fill="#d7dce2" stroke="#56626f" strokeWidth={3.2} strokeLinejoin="round" />
            <path d="M2,-82 C16,-70 24,-52 27,-34 C14,-44 -14,-44 -25,-34 C-20,-56 -10,-72 2,-82 Z" fill="#ffffff" opacity={0.95} />
            <path d="M-26,6 L-22,10 L-26,14" stroke="#56626f" strokeWidth={2.2} fill="none" strokeLinejoin="round" />
            {barbs}
            <path d="M1,-80 L1,96" stroke="#f0e8d6" strokeWidth={4.6} strokeLinecap="round" />
            <path d="M1,-80 L1,96" stroke="#7d6e58" strokeWidth={1.6} strokeLinecap="round" opacity={0.75} />
          </g>
        </Mv>
      );
    },
  },  mushroom: {
    bg: 'green',
    draw: () => (
      <>
        <Ground y={158} fill={C.g2} />
        <GrassBlades x={36} y={164} count={5} h={28} spread={22} />
        <GrassBlades x={206} y={164} count={5} h={28} spread={22} />
        <Mv origin={[110, 164]}>
          <Toadstool x={98} y={164} s={1.12} />
          <Toadstool x={180} y={166} s={0.55} cap="#a9733d" capEdge="#5d3a1b" dots={false} />
        </Mv>
      </>
    ),
  },
  molehill: {
    bg: 'green',
    draw: () => {
      const r = det(41);
      const crumbs: ReactElement[] = [];
      for (let i = 0; i < 26; i++) {
        const cx = 70 + r() * 100;
        const cy = 100 + r() * 46;
        const inside = ((cx - 120) / 66) ** 2 + ((cy - 140) / 56) ** 2 < 0.8;
        if (inside) crumbs.push(<circle key={i} cx={cx} cy={cy} r={3 + r() * 5} fill={r() > 0.5 ? '#86603b' : '#4f3622'} opacity={0.8} />);
      }
      return (
        <>
          <Ground y={150} fill={C.g2} />
          <GrassBlades x={34} y={160} count={5} h={26} spread={22} />
          <GrassBlades x={210} y={158} count={5} h={26} spread={22} />
          <Mv origin={[120, 150]}>
            <path d="M44,156 C52,108 88,86 120,86 C152,86 188,108 196,156 Z" fill="#6b4a30" stroke="#3d2815" strokeWidth={3.4} strokeLinejoin="round" />
            <path d="M62,128 C74,104 96,96 118,96" stroke="#9a7048" strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />
            {crumbs}
            <path d="M176,160 C180,140 196,130 208,132 C218,134 224,146 226,160 Z" fill="#6b4a30" stroke="#3d2815" strokeWidth={2.8} strokeLinejoin="round" />
          </Mv>
        </>
      );
    },
  },
  dandelion: {
    bg: 'green',
    draw: () => {
      const rays: ReactElement[] = [];
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        const ex = Math.cos(a) * 33;
        const ey = Math.sin(a) * 33;
        rays.push(
          <g key={i}>
            <path d={`M0,0 L${ex.toFixed(1)},${ey.toFixed(1)}`} stroke="#a9a290" strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={(Math.cos(a) * 36).toFixed(1)} cy={(Math.sin(a) * 36).toFixed(1)} r={3.4} fill="#fff" stroke="#b8b19e" strokeWidth={1.4} />
          </g>,
        );
      }
      return (
        <>
          <Ground y={168} />
          <GrassBlades x={36} y={174} count={4} h={26} spread={20} />
          <Mv origin={[100, 176]}>
            <Thick d="M100,176 C96,150 104,124 100,100" w={5} fill={C.g3} line={C.g5} edge={2.6} />
            <path d="M100,172 C80,168 62,150 56,136 C64,130 72,136 74,128 C82,132 88,142 100,150 Z" fill={C.g2} stroke={C.g5} strokeWidth={2.4} strokeLinejoin="round" />
            <g transform="translate(100 66)">
              <circle r={30} fill="#fff" opacity={0.7} />
              {rays}
              <circle r={6} fill="#8a826c" stroke="#5b5442" strokeWidth={2} />
            </g>
          </Mv>
          <Mv origin={[184, 176]} cls="mv2">
            <Thick d="M184,176 C182,160 186,150 184,138" w={4} fill={C.g3} line={C.g5} edge={2.4} />
            <Flower x={184} y={126} r={17} petals={16} petal={C.y1} edge={C.y3} center={C.y3} centerEdge="#a87810" />
          </Mv>
        </>
      );
    },
  },
};

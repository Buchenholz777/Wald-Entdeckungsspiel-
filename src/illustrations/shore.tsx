import type { ReactElement } from 'react';
import { C, Cloud, GrassBlades, Ground, Hills, Mv, Pebble, Plastic, Sun, Thick, det, type Art } from './kit';

/** Strand, Wasser, Berge und Wege. */

function wavePath(y: number, amp: number, period = 40, from = -20, to = 260): string {
  let d = `M${from},${y}`;
  const n = Math.ceil((to - from) / period);
  for (let i = 0; i < n; i++) d += ` q${period / 4},${-amp} ${period / 2},0 t${period / 2},0`;
  return d;
}

export function Foot({ x, y, s = 1, rot = 0, left = false }: { x: number; y: number; s?: number; rot?: number; left?: boolean }) {
  const flip = left ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * flip} ${s})`}>
      <g fill="#c9a05a" stroke="#9a6f2e" strokeWidth={2.6} strokeLinejoin="round">
        <path d="M-15,-6 C-19,-26 -4,-34 6,-30 C18,-26 18,-4 14,10 C12,24 8,31 0,31 C-10,31 -14,14 -15,-6 Z" />
        <path d="M-9,44 C-14,36 -9,30 0,30 C9,30 13,36 9,44 C6,50 -6,50 -9,44 Z" />
      </g>
      <g fill="#c9a05a" stroke="#9a6f2e" strokeWidth={2.2}>
        <circle cx={-12} cy={-36} r={5.6} />
        <circle cx={-3} cy={-42} r={5} />
        <circle cx={6} cy={-42} r={4.6} />
        <circle cx={14} cy={-37} r={4.2} />
        <circle cx={19} cy={-29} r={3.6} />
      </g>
      <path d="M-12,-14 C-13,-24 -4,-30 4,-28" stroke="#fff4d6" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M-4,38 C-8,34 -2,30 4,32" stroke="#fff4d6" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
}

export function Scallop({ x, y, s = 1, rot = 0, ribs = 11, growth = false, fill = '#f6ddc6', rib = '#dca78b', edge = '#9b6a4f', hole = false }: { x: number; y: number; s?: number; rot?: number; ribs?: number; growth?: boolean; fill?: string; rib?: string; edge?: string; hole?: boolean }) {
  const outline = 'M0,44 C-52,36 -66,-10 -44,-38 C-24,-60 24,-60 44,-38 C66,-10 52,36 0,44 Z';
  const lines: ReactElement[] = [];
  for (let i = 0; i < ribs; i++) {
    const a = ((i / (ribs - 1)) * 2 - 1) * 68 * (Math.PI / 180);
    lines.push(<path key={i} d={`M0,42 L${(Math.sin(a) * 66).toFixed(1)},${(42 - Math.cos(a) * 104).toFixed(1)}`} stroke={rib} strokeWidth={growth ? 4.4 : 3.2} strokeLinecap="round" />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <clipPath id="il-scallop-clip">
        <path d={outline} />
      </clipPath>
      <path d="M-16,40 L-26,52 L26,52 L16,40 Z" fill={fill} stroke={edge} strokeWidth={3} strokeLinejoin="round" />
      <path d={outline} fill={fill} />
      <Plastic d={outline} hi={0.4} lo={0.2} speck={0.08} />
      <g clipPath="url(#il-scallop-clip)">
        {lines}
        {growth &&
          [28, 52, 76].map((r) => (
            <path key={r} d={`M${-r * 0.9},${44 - r * 0.45} Q0,${44 - r * 1.25} ${r * 0.9},${44 - r * 0.45}`} stroke={edge} strokeWidth={1.8} fill="none" opacity={0.5} />
          ))}
        <path d="M-30,-30 C-14,-46 14,-46 30,-30" stroke="#fff" strokeWidth={5} fill="none" opacity={0.45} strokeLinecap="round" />
      </g>
      <path d={outline} fill="none" stroke={edge} strokeWidth={2.2} strokeLinejoin="round" />
      {hole && (
        <>
          <ellipse cx={10} cy={-8} rx={6.5} ry={6} fill={edge} />
          <ellipse cx={10} cy={-8} rx={4.6} ry={4.2} fill="#e9dcc4" />
        </>
      )}
    </g>
  );
}

function SeaStrip() {
  return (
    <g>
      <rect x={0} y={0} width={240} height={44} fill={C.w1} />
      <path d={wavePath(44, 5, 40)} stroke="#fff" strokeWidth={4} fill="none" opacity={0.8} />
      <path d="M0,0 V40 q10,6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 V0 Z" fill={C.w2} opacity={0.55} />
    </g>
  );
}

function Mountains({ y = 118 }: { y?: number }) {
  return (
    <g>
      <path d={`M0,${y} L50,${y - 50} L84,${y - 22} L118,${y - 64} L160,${y - 14} L196,${y - 44} L240,${y} Z`} fill="#b7c6d9" stroke="#8aa0b8" strokeWidth={2.4} strokeLinejoin="round" />
      <path d={`M-10,${y + 40} L70,${y - 62} L96,${y - 34} L128,${y - 92} L190,${y + 6} L240,${y - 30} L250,${y + 40} Z`} fill="#8aa0b8" stroke="#5f7893" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M128,${y - 92} L160,${y - 44} L146,${y - 52} L134,${y - 40} L122,${y - 54} L104,${y - 46} Z`} fill="#fff" stroke="#c9d6e4" strokeWidth={2} strokeLinejoin="round" />
      <path d={`M70,${y - 62} L86,${y - 40} L74,${y - 44} L62,${y - 34} Z`} fill="#fff" stroke="#c9d6e4" strokeWidth={2} strokeLinejoin="round" />
      <path d={`M128,${y - 92} L150,${y - 20} L190,${y + 6} L150,${y + 40} L120,${y - 10} Z`} fill="#5f7893" opacity={0.28} />
    </g>
  );
}

export const shoreArt: Record<string, Art> = {
  'beach-sand': {
    bg: 'sand',
    draw: () => {
      const r = det(21);
      const specks = [];
      for (let i = 0; i < 70; i++) specks.push(<circle key={i} cx={r() * 240} cy={70 + r() * 130} r={0.9 + r() * 1.4} fill={C.sand3} opacity={0.7} />);
      return (
        <>
          <SeaStrip />
          <path d="M0,50 C60,60 180,60 240,50 V70 C180,80 60,80 0,70 Z" fill={C.sand3} opacity={0.5} />
          <Mv origin={[120, 120]}>
            <path d="M0,84 C40,76 90,98 130,90 C170,82 210,96 240,86 V200 H0 Z" fill={C.sand2} opacity={0.65} />
            <path d="M0,130 C50,118 100,142 150,128 C190,118 220,132 240,126" stroke={C.sand3} strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
            {specks}
          </Mv>
        </>
      );
    },
  },
  'footprint-sand': {
    bg: 'sand',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 110]}>
        <Foot x={120} y={104} s={1.6} rot={12} />
      </Mv>
    ),
  },
  'footprint-compare': {
    bg: 'sand',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 110]}>
        <Foot x={74} y={108} s={1.35} rot={-8} />
        <Foot x={178} y={134} s={0.72} rot={10} left />
      </Mv>
    ),
  },
  'sand-ripples': {
    bg: 'sand',
    shadow: false,
    draw: () => (
      <>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i}>
            <path d={wavePath(34 + i * 24, 7 + (i % 3) * 2, 44 - (i % 2) * 8)} stroke={C.sand3} strokeWidth={6} fill="none" opacity={0.75} strokeLinecap="round" />
            <path d={wavePath(30 + i * 24, 7 + (i % 3) * 2, 44 - (i % 2) * 8)} stroke="#fff6dc" strokeWidth={3} fill="none" opacity={0.85} strokeLinecap="round" />
          </g>
        ))}
        <Mv origin={[120, 100]}>
          <path d="M34,152 C44,128 76,126 88,152 Z" fill={C.sand2} stroke={C.sand3} strokeWidth={3} strokeLinejoin="round" />
          <path d="M44,146 C52,132 66,132 74,146" stroke="#fff6dc" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M150,70 C160,48 188,48 198,70 Z" fill={C.sand2} stroke={C.sand3} strokeWidth={3} strokeLinejoin="round" />
        </Mv>
      </>
    ),
  },
  shell: {
    bg: 'sand',
    draw: () => (
      <Mv origin={[120, 110]}>
        <Scallop x={120} y={106} s={1.35} rot={-8} />
      </Mv>
    ),
  },
  'shell-ridges': {
    bg: 'sand',
    draw: () => (
      <Mv origin={[120, 110]}>
        <Scallop x={120} y={110} s={1.6} rot={4} ribs={9} growth />
      </Mv>
    ),
  },
  'shell-compare': {
    bg: 'sand',
    draw: () => (
      <Mv origin={[120, 110]}>
        <g transform="translate(70 100)">
          <circle r={42} fill="#f3cdb0" stroke="#9b6a4f" strokeWidth={3.4} />
          {[34, 26, 18, 10].map((r) => (
            <circle key={r} r={r} fill="none" stroke="#c9967a" strokeWidth={2.2} opacity={0.85} />
          ))}
          <path d="M-30,-22 C-18,-36 12,-38 26,-28" stroke="#fff" strokeWidth={5} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M-12,38 L-18,48 H18 L12,38 Z" fill="#f3cdb0" stroke="#9b6a4f" strokeWidth={3} strokeLinejoin="round" />
        </g>
        <g transform="translate(176 104) rotate(-24)">
          <path d="M-46,4 C-40,-20 34,-24 52,0 C38,24 -38,26 -46,4 Z" fill="#6b7ea0" stroke="#34405c" strokeWidth={3.4} strokeLinejoin="round" />
          {[-30, -16, -2, 12, 26].map((x) => (
            <path key={x} d={`M${x},-14 Q${x + 5},2 ${x},16`} stroke="#34405c" strokeWidth={1.8} fill="none" opacity={0.55} />
          ))}
          <path d="M-34,-4 C-10,-14 18,-14 40,-4" stroke="#a9b8d4" strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>
      </Mv>
    ),
  },
  seaweed: {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,120 C60,108 120,128 180,114 C210,108 230,112 240,114 V200 H0 Z" fill={C.sand2} opacity={0.55} />
        <Mv origin={[120, 120]}>
          <path d="M30,150 C50,120 70,130 90,110 C110,90 130,110 150,92 C170,76 186,86 204,70" stroke="#2c4a2a" strokeWidth={16} fill="none" strokeLinecap="round" />
          <path d="M30,150 C50,120 70,130 90,110 C110,90 130,110 150,92 C170,76 186,86 204,70" stroke="#5c7a3a" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M40,160 C70,148 100,160 130,146 C160,132 180,146 214,130" stroke="#3a3420" strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M40,160 C70,148 100,160 130,146 C160,132 180,146 214,130" stroke="#8a7a3a" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d="M36,140 C60,150 76,138 100,150" stroke="#2c4a2a" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M36,140 C60,150 76,138 100,150" stroke="#6f9a46" strokeWidth={5} fill="none" strokeLinecap="round" />
          {[[70, 128], [112, 108], [160, 90], [180, 142], [100, 158]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={4.4} fill="#a6b560" stroke="#2c4a2a" strokeWidth={2} />
          ))}
          <path d="M44,146 C62,124 80,134 96,116" stroke="#bfd78a" strokeWidth={2.4} fill="none" opacity={0.7} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  'big-stone': {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,140 180,140 240,150 V200 H0 Z" fill={C.sand2} opacity={0.6} />
        <Mv origin={[120, 150]}>
          <path d="M34,152 C26,110 54,64 112,58 C176,52 214,96 206,144 C204,160 186,166 160,166 H70 C48,166 36,162 34,152 Z" fill={C.s2} stroke={C.s4} strokeWidth={3.6} strokeLinejoin="round" />
          <path d="M52,112 C58,84 84,70 112,70 C96,80 82,98 78,118 Z" fill={C.s1} opacity={0.7} />
          <path d="M150,70 C176,76 196,100 196,140 C180,120 164,100 150,70 Z" fill={C.s3} opacity={0.35} />
          <path d="M96,120 q18,-10 34,2 M138,132 q12,-6 24,0" stroke={C.s4} strokeWidth={2.2} fill="none" opacity={0.5} strokeLinecap="round" />
        </Mv>
        <Pebble x={30} y={176} rx={8} ry={5} />
        <Pebble x={206} y={178} rx={10} ry={6} />
      </>
    ),
  },
  pebbles: {
    bg: 'sand',
    draw: () => (
      <Mv origin={[120, 110]}>
        <Pebble x={44} y={108} rx={26} ry={20} fill="#efe9dc" dark="#9c9588" light="#fff" rot={-10} />
        <Pebble x={102} y={90} rx={22} ry={17} fill="#cfc7b8" dark="#7f786b" light="#efeadf" rot={8} />
        <Pebble x={152} y={122} rx={26} ry={19} fill="#9d978c" dark="#4f4a42" light="#c9c4b8" rot={-6} />
        <Pebble x={202} y={92} rx={20} ry={16} fill="#5d5a54" dark="#2a2825" light="#8a8780" rot={12} />
        <Pebble x={86} y={142} rx={14} ry={10} fill="#bdb09a" dark="#756a58" light="#e6dcc8" />
      </Mv>
    ),
  },
  waves: {
    bg: 'sky',
    draw: () => (
      <>
        <Sun x={196} y={34} r={13} />
        <Mv origin={[120, 100]}>
          <path d={`${wavePath(70, 10, 48)} V200 H-20 Z`} fill={C.w1} />
          <path d={`${wavePath(70, 10, 48)}`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`${wavePath(104, 12, 56)} V200 H-20 Z`} fill={C.w2} />
          <path d={`${wavePath(104, 12, 56)}`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`${wavePath(142, 14, 64)} V200 H-20 Z`} fill={C.w3} />
          <path d={`${wavePath(142, 14, 64)}`} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
        </Mv>
        <path d="M0,184 C60,176 180,176 240,184 V200 H0 Z" fill={C.sand2} />
      </>
    ),
  },
  'beach-bird': {
    bg: 'sky',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 V200 H0 Z" fill={C.sand2} />
        <path d="M0,146 C60,138 180,138 240,146" stroke={C.w2} strokeWidth={5} fill="none" opacity={0.8} />
        <Mv origin={[120, 150]}>
          <g transform="translate(118 90)">
            <path d="M-4,40 L-6,60 M6,40 L8,60" stroke="#e08a2e" strokeWidth={4} strokeLinecap="round" />
            <path d="M-12,60 H-2 M2,60 H14" stroke="#e08a2e" strokeWidth={4} strokeLinecap="round" />
            <path d="M-46,10 C-50,-10 -36,-26 -10,-26 C20,-26 44,-12 44,12 C44,32 24,44 -8,44 C-30,44 -44,30 -46,10 Z" fill="#fff" stroke={C.ink} strokeWidth={3.2} strokeLinejoin="round" />
            <path d="M-36,24 C-34,40 -8,42 12,36 C-6,32 -26,28 -36,24 Z" fill="#e8e4de" opacity={0.7} />
            <path d="M-8,-14 C14,-20 36,-4 44,12 C24,16 2,10 -8,-14 Z" fill="#9aa5b5" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
            <path d="M22,2 C34,6 40,10 44,12" stroke="#2b3544" strokeWidth={3.4} fill="none" strokeLinecap="round" />
            <path d="M-46,10 L-64,2 L-62,16 Z" fill="#fff" stroke={C.ink} strokeWidth={2.8} strokeLinejoin="round" />
            <circle cx={-34} cy={-22} r={13} fill="#fff" stroke={C.ink} strokeWidth={3.2} />
            <path d="M-45,-22 L-62,-18 L-46,-14 Z" fill="#f2c14b" stroke="#a87a10" strokeWidth={2.4} strokeLinejoin="round" />
            <circle cx={-37} cy={-25} r={2.6} fill={C.ink} />
          </g>
        </Mv>
      </>
    ),
  },
  'trail-marker': {
    bg: 'green',
    draw: () => (
      <>
        <Ground y={164} />
        <GrassBlades x={50} y={170} count={5} h={28} spread={22} />
        <GrassBlades x={190} y={170} count={5} h={28} spread={22} />
        <Mv origin={[120, 168]}>
          <rect x={102} y={16} width={36} height={154} rx={7} fill={C.b3} stroke={C.b5} strokeWidth={3.4} />
          <path d="M110,20 V166 M124,20 V166" stroke={C.b5} strokeWidth={2} opacity={0.4} />
          <rect x={102} y={50} width={36} height={14} fill="#fff" />
          <rect x={102} y={64} width={36} height={16} fill="#d33f33" />
          <rect x={102} y={80} width={36} height={14} fill="#fff" />
          <rect x={102} y={50} width={36} height={44} fill="none" stroke={C.b5} strokeWidth={2.6} />
          <path d="M102,16 H138" stroke={C.b1} strokeWidth={4} opacity={0.6} />
        </Mv>
      </>
    ),
  },
  'big-rock': {
    bg: 'sky',
    draw: () => (
      <>
        <Hills y={154} c1={C.g1} c2={C.g2} />
        <Mv origin={[120, 160]}>
          <path d="M28,166 C22,120 40,72 78,54 C108,40 150,40 176,60 C208,86 214,130 208,166 Z" fill={C.s2} stroke={C.s4} strokeWidth={3.6} strokeLinejoin="round" />
          <path d="M44,150 C40,110 52,78 82,64 C70,92 68,120 74,150 Z" fill={C.s1} opacity={0.75} />
          <path d="M176,60 C204,84 210,128 206,160 C190,130 176,100 176,60 Z" fill={C.s4} opacity={0.35} />
          <path d="M96,64 L110,96 L98,128 M140,56 L152,92 L140,124" stroke={C.s4} strokeWidth={2.6} fill="none" opacity={0.55} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={92} cy={160} rx={26} ry={8} fill={C.g3} stroke={C.g5} strokeWidth={2.4} />
        </Mv>
        <GrassBlades x={40} y={170} count={4} h={22} spread={18} />
        <GrassBlades x={206} y={170} count={4} h={22} spread={18} />
      </>
    ),
  },
  'rock-pattern': {
    bg: 'stone',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 100]}>
        <clipPath id="il-rock-clip">
          <rect x={16} y={16} width={208} height={168} rx={16} />
        </clipPath>
        <g clipPath="url(#il-rock-clip)">
          <rect x={16} y={16} width={208} height={168} fill={C.s2} />
          <path d="M0,60 L240,20 V54 L0,100 Z" fill={C.s1} opacity={0.85} />
          <path d="M0,112 L240,70 V92 L0,136 Z" fill={C.s3} opacity={0.75} />
          <path d="M0,150 L240,116 V150 L0,190 Z" fill={C.s1} opacity={0.8} />
          <path d="M60,16 L90,80 L72,130 L96,184 M170,16 L150,70 L176,120 L160,184" stroke={C.s4} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
          {[[44, 52, 10], [122, 104, 12], [190, 46, 9], [150, 150, 11], [64, 150, 8]].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#d6cc6a" stroke="#8d8532" strokeWidth={2} opacity={0.95} />
              <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.4} fill="#efe9a0" opacity={0.7} />
            </g>
          ))}
        </g>
        <rect x={16} y={16} width={208} height={168} rx={16} fill="none" stroke={C.s4} strokeWidth={3.4} />
      </Mv>
    ),
  },
  mountain: {
    bg: 'sky',
    shadow: false,
    draw: () => (
      <>
        <Sun x={196} y={34} r={13} />
        <Mv origin={[120, 100]} cls="mv2">
          <Cloud x={62} y={44} s={0.9} />
        </Mv>
        <Mv origin={[120, 150]}>
          <Mountains y={130} />
        </Mv>
        <Hills y={156} c1={C.g2} c2={C.g3} />
        <path d="M30,186 q8,-18 16,0 M180,184 q6,-14 12,0" stroke={C.g5} strokeWidth={3} fill="none" opacity={0.5} />
      </>
    ),
  },
  'path-bend': {
    bg: 'green',
    shadow: false,
    draw: () => (
      <>
        <Hills y={96} c1={C.g1} c2={C.g2} />
        <path d="M0,100 H240 V200 H0 Z" fill={C.g2} opacity={0.0} />
        <Thick className="draw" pathLength={1} d="M70,200 C56,168 168,160 138,132 C112,108 150,100 160,88" w={34} fill={C.b1} line={C.b3} edge={5} />
        <path d="M70,196 C58,170 164,160 134,132" stroke={C.b2} strokeWidth={2.4} strokeDasharray="2 9" strokeLinecap="round" fill="none" opacity={0.7} />
        <GrassBlades x={30} y={176} count={5} h={30} spread={28} />
        <GrassBlades x={206} y={176} count={5} h={30} spread={28} />
        <GrassBlades x={190} y={134} count={4} h={20} spread={18} />
      </>
    ),
  },
  'gravel-path': {
    bg: 'stone',
    shadow: false,
    draw: () => {
      const r = det(33);
      const tones: [string, string][] = [
        [C.s1, C.s3],
        [C.s2, C.s4],
        ['#e3d8c3', '#8f8368'],
        ['#c4b79f', '#6f6350'],
        ['#a9a499', '#55514a'],
      ];
      const stones: ReactElement[] = [];
      for (let i = 0; i < 70; i++) {
        const [f, d] = tones[Math.floor(r() * tones.length)];
        stones.push(<Pebble key={i} x={22 + r() * 196} y={22 + r() * 156} rx={7 + r() * 8} ry={5 + r() * 6} fill={f} dark={d} light="#fff" rot={r() * 180} />);
      }
      return (
        <Mv origin={[120, 100]}>
          <rect x={10} y={10} width={220} height={180} rx={18} fill="#cfc8ba" />
          {stones}
        </Mv>
      );
    },
  },
  'water-surface': {
    bg: 'water',
    shadow: false,
    draw: () => (
      <>
        <rect x={0} y={0} width={240} height={200} rx={26} fill={C.w1} opacity={0.65} />
        {[40, 72, 104, 136, 168].map((y, i) => (
          <path key={y} d={wavePath(y, 4, 36 + (i % 2) * 10, -10 - i * 7)} stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
        ))}
        <Mv origin={[120, 100]}>
          {[16, 32, 50].map((r, i) => (
            <ellipse key={r} className={`rip d${i}`} cx={118} cy={102} rx={r * 1.7} ry={r * 0.6} fill="none" stroke="#fff" strokeWidth={3.4} opacity={0.9 - i * 0.15} />
          ))}
        </Mv>
        <path d="M0,0 H240 V30 q-20,10 -40,0 t-40,0 t-40,0 t-40,0 t-40,0 t-40,0 Z" fill={C.w2} opacity={0.4} />
      </>
    ),
  },
  reflection: {
    bg: 'water',
    shadow: false,
    draw: () => {
      const scene = (
        <>
          <Cloud x={56} y={38} s={0.9} />
          <Cloud x={168} y={50} s={0.65} />
          <path d="M0,100 C40,76 80,84 110,92 C150,74 196,80 240,100 Z" fill={C.g2} />
          <g transform="translate(150 100)">
            <path d="M-4,0 L-4,-34 L4,-34 L4,0 Z" fill={C.b3} stroke={C.b5} strokeWidth={2.4} />
            <circle cx={0} cy={-52} r={24} fill={C.g3} stroke={C.g5} strokeWidth={3} />
            <circle cx={-16} cy={-40} r={14} fill={C.g3} stroke={C.g5} strokeWidth={2.6} />
            <circle cx={16} cy={-40} r={14} fill={C.g3} stroke={C.g5} strokeWidth={2.6} />
            <circle cx={-6} cy={-58} r={12} fill={C.g1} opacity={0.5} />
          </g>
        </>
      );
      return (
        <>
          <rect x={0} y={0} width={240} height={100} rx={26} fill={C.sky1} />
          <rect x={0} y={74} width={240} height={26} fill={C.sky1} />
          {scene}
          <rect x={0} y={100} width={240} height={100} rx={26} fill={C.w2} />
          <rect x={0} y={100} width={240} height={30} fill={C.w2} />
          <Mv origin={[120, 100]}>
            <g transform="translate(0 200) scale(1 -1)" opacity={0.55}>
              {scene}
            </g>
          </Mv>
          <rect x={0} y={100} width={240} height={100} rx={26} fill={C.w2} opacity={0.28} />
          {[116, 134, 152, 172].map((y, i) => (
            <path key={y} d={wavePath(y, 3, 30 + i * 6, -10 - i * 5)} stroke="#fff" strokeWidth={2.6} fill="none" opacity={0.7} strokeLinecap="round" />
          ))}
          <path d="M0,100 H240" stroke="#fff" strokeWidth={3} opacity={0.5} />
          <Mv origin={[70, 150]} cls="mv2">
            <ellipse className="rip" cx={70} cy={150} rx={26} ry={6} fill="none" stroke="#fff" strokeWidth={2.6} opacity={0.8} />
            <ellipse className="rip d1" cx={70} cy={150} rx={14} ry={3} fill="none" stroke="#fff" strokeWidth={2.6} opacity={0.8} />
          </Mv>
        </>
      );
    },
  },
  reed: {
    bg: 'water',
    draw: () => {
      const stalk = (x: number, top: number, lean: number, h: number) => (
        <g key={x}>
          <path d={`M${x},176 C${x + lean * 0.3},${176 - h * 0.5} ${x + lean * 0.7},${top + 40} ${x + lean},${top}`} stroke={C.g5} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d={`M${x},176 C${x + lean * 0.3},${176 - h * 0.5} ${x + lean * 0.7},${top + 40} ${x + lean},${top}`} stroke="#b7cf7a" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={`M${x + lean * 0.5},${top + 80} C${x + lean * 0.5 + 24},${top + 70} ${x + lean * 0.5 + 40},${top + 90} ${x + lean * 0.5 + 44},${top + 120}`} stroke={C.g4} strokeWidth={4.4} fill="none" strokeLinecap="round" />
          <ellipse cx={x + lean} cy={top - 8} rx={6.6} ry={20} fill="#8a6a3e" stroke="#4d3320" strokeWidth={2.6} transform={`rotate(${lean * 0.5} ${x + lean} ${top - 8})`} />
          <path d={`M${x + lean - 2},${top - 22} v26`} stroke="#c8a56a" strokeWidth={2} opacity={0.8} />
        </g>
      );
      return (
        <>
          <path d="M0,160 H240 V200 H0 Z" fill={C.w2} />
          <path d={wavePath(166, 3, 34)} stroke="#fff" strokeWidth={2.6} fill="none" opacity={0.8} />
          <Mv origin={[120, 176]}>
            {stalk(70, 40, -14, 136)}
            {stalk(104, 26, 8, 150)}
            {stalk(136, 48, 16, 128)}
            {stalk(168, 38, -8, 138)}
          </Mv>
          <path d={wavePath(180, 3, 40, -10)} stroke="#fff" strokeWidth={2.6} fill="none" opacity={0.7} />
        </>
      );
    },
  },
  'shore-stone': {
    bg: 'green',
    draw: () => (
      <>
        <path d="M0,60 H240 V80 q-20,8 -40,0 t-40,0 t-40,0 t-40,0 t-40,0 t-40,0 Z" fill={C.w2} opacity={0.8} />
        <Ground y={90} fill={C.g2} />
        <path d="M0,150 C60,134 150,152 240,138 V200 H0 Z" fill={C.b1} stroke={C.b2} strokeWidth={2.4} />
        <Mv origin={[120, 160]}>
          <Pebble x={118} y={140} rx={48} ry={34} fill={C.s2} dark={C.s4} light={C.s1} rot={-4} />
        </Mv>
        <GrassBlades x={44} y={150} count={5} h={30} spread={24} />
        <GrassBlades x={204} y={150} count={5} h={30} spread={24} />
      </>
    ),
  },
  'stream-bend': {
    bg: 'green',
    shadow: false,
    draw: () => (
      <>
        <Thick className="draw" pathLength={1} d="M-20,48 C70,34 120,64 112,100 C104,138 150,158 260,150" w={36} fill={C.w2} line={C.w3} edge={5} />
        <path d="M-10,44 C64,32 112,62 104,98" stroke="#fff" strokeWidth={3} strokeDasharray="6 12" fill="none" opacity={0.8} strokeLinecap="round" />
        <Pebble x={150} y={172} rx={10} ry={7} />
        <Pebble x={60} y={96} rx={8} ry={6} />
        <GrassBlades x={40} y={160} count={5} h={28} spread={26} />
        <GrassBlades x={190} y={96} count={5} h={28} spread={26} />
        <GrassBlades x={200} y={30} count={4} h={22} spread={20} />
      </>
    ),
  },
  'water-path': {
    bg: 'green',
    shadow: false,
    draw: () => (
      <>
        <path d="M0,0 H240 V70 C200,88 150,60 100,76 C60,88 30,70 0,78 Z" fill={C.w2} />
        <path d="M0,70 C30,62 60,80 100,68 C150,52 200,80 240,62" stroke="#fff" strokeWidth={3.4} fill="none" opacity={0.85} strokeLinecap="round" />
        <path d={wavePath(34, 4, 36)} stroke="#fff" strokeWidth={2.6} fill="none" opacity={0.7} />
        <Thick className="draw" pathLength={1} d="M-10,150 C60,120 120,150 170,128 C210,112 230,116 250,108" w={26} fill={C.b1} line={C.b3} edge={5} />
        <GrassBlades x={40} y={180} count={5} h={26} spread={24} />
        <GrassBlades x={190} y={184} count={5} h={26} spread={24} />
        <g transform="translate(206 82)">
          <circle r={14} fill={C.g3} stroke={C.g5} strokeWidth={2.6} />
          <circle cx={-6} cy={-5} r={6} fill={C.g1} opacity={0.5} />
        </g>
      </>
    ),
  },
};

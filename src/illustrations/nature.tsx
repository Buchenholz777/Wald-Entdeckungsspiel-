import type { ReactElement } from 'react';
import {
  C,
  Cloud,
  Flower,
  GrassBlades,
  Ground,
  HandLeaf,
  Hills,
  LEAF_BROWN,
  LEAF_GOLD,
  LEAF_GREEN,
  LEAF_GREEN_DARK,
  LEAF_ORANGE,
  LEAF_RED,
  LEAF_YELLOW,
  Leaf,
  Mv,
  Pebble,
  Plastic,
  Sun,
  Thick,
  Union,
  det,
  type Art,
} from './kit';

/* ---------- Wiederverwendbare Teile ---------- */

function TreeBroad({ x, y, s = 1, crown = C.g2, crownDark = C.g3 }: { x: number; y: number; s?: number; crown?: string; crownDark?: string }) {
  // (x, y) = Fußpunkt des Stammes
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14,0 C-12,-26 -10,-46 -16,-70 L18,-70 C12,-46 14,-26 16,0 Z" fill={C.b3} stroke={C.b5} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-4,0 C-3,-26 -2,-46 -6,-68 L2,-68 C0,-46 2,-26 3,0 Z" fill={C.b2} opacity={0.6} />
      <path d="M-4,-52 Q-24,-64 -34,-84 M6,-56 Q22,-68 34,-90" stroke={C.b5} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M-4,-52 Q-24,-64 -34,-84 M6,-56 Q22,-68 34,-90" stroke={C.b3} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Union fill={crown} line={C.g5} w={5}>
        <circle cx={0} cy={-112} r={40} />
        <circle cx={-38} cy={-92} r={28} />
        <circle cx={38} cy={-92} r={28} />
        <circle cx={-18} cy={-132} r={26} />
        <circle cx={22} cy={-130} r={26} />
      </Union>
      <circle cx={-18} cy={-126} r={20} fill={C.g1} opacity={0.5} />
      <circle cx={-44} cy={-98} r={13} fill={C.g1} opacity={0.4} />
      <circle cx={16} cy={-132} r={14} fill={C.g1} opacity={0.35} />
      <path d="M-50,-84 Q-34,-68 -12,-76 Q6,-66 28,-76 Q50,-70 56,-88 Q54,-70 36,-66 Q10,-58 -14,-62 Q-40,-60 -50,-84 Z" fill={crownDark} opacity={0.55} />
      <circle cx={-6} cy={-96} r={2.4} fill={C.g5} opacity={0.5} />
      <circle cx={22} cy={-110} r={2.4} fill={C.g5} opacity={0.5} />
      <circle cx={-26} cy={-112} r={2.4} fill={C.g5} opacity={0.5} />
    </g>
  );
}

function Log({ x, y, moss = false, bleached = false }: { x: number; y: number; moss?: boolean; bleached?: boolean }) {
  const bark = bleached ? '#d9c7a5' : C.b3;
  const barkDark = bleached ? '#8e7a58' : C.b5;
  const barkLight = bleached ? '#efe3c8' : C.b2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-86,-26 C-60,-34 40,-34 70,-26 L70,26 C40,34 -60,34 -86,26 Z" fill={bark} stroke={barkDark} strokeWidth={2} strokeLinejoin="round" />
      <path d="M-86,-26 C-60,-34 40,-34 70,-26 L70,26 C40,34 -60,34 -86,26 Z" fill="#2a1a0a" opacity={0.3} filter="url(#il-fibre-h)" />
      <path d="M-84,-14 C-40,-22 20,-22 68,-14" stroke={barkLight} strokeWidth={5} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M-70,6 C-30,-2 30,2 60,6 M-76,18 C-30,12 20,16 62,19" stroke={barkDark} strokeWidth={2.2} fill="none" opacity={0.55} strokeLinecap="round" />
      <ellipse cx={70} cy={0} rx={16} ry={28} fill={C.b1} stroke={barkDark} strokeWidth={3.2} />
      <ellipse cx={70} cy={0} rx={10} ry={19} fill="none" stroke={C.b3} strokeWidth={2} opacity={0.8} />
      <ellipse cx={70} cy={0} rx={5} ry={9} fill="none" stroke={C.b3} strokeWidth={2} opacity={0.8} />
      {moss && (
        <g>
          <path
            d="M-82,-24 C-70,-46 -52,-38 -40,-44 C-28,-52 -12,-38 0,-42 C14,-48 24,-34 34,-36 C26,-26 6,-24 -10,-24 C-30,-22 -60,-22 -82,-24 Z"
            fill={C.g3}
            stroke={C.g5}
            strokeWidth={2.6}
            strokeLinejoin="round"
          />
          <path d="M-76,-30 C-64,-44 -50,-36 -42,-40 C-30,-46 -16,-36 -4,-38" fill="none" stroke={C.g1} strokeWidth={4} opacity={0.7} strokeLinecap="round" />
          {[-70, -58, -46, -32, -20, -6, 8, 22].map((cx, i) => (
            <circle key={cx} cx={cx} cy={-34 - (i % 3) * 3} r={2.4} fill={C.g1} opacity={0.9} />
          ))}
          <ellipse cx={-52} cy={-22} rx={14} ry={7} fill={C.g2} stroke={C.g5} strokeWidth={2} />
        </g>
      )}
    </g>
  );
}

function BarkTrunk({ x, y, w, h, smooth = false }: { x: number; y: number; w: number; h: number; smooth?: boolean }) {
  const fissures: string[] = [];
  const count = Math.max(3, Math.round(w / 16));
  for (let i = 0; i < count; i++) {
    const fx = x + (w * (i + 0.5)) / count;
    const wob = i % 2 ? 5 : -5;
    fissures.push(`M${fx},${y + 4} C${fx + wob},${y + h * 0.25} ${fx - wob},${y + h * 0.5} ${fx + wob * 0.6},${y + h * 0.7} S${fx - wob * 0.4},${y + h * 0.92} ${fx},${y + h - 2}`);
  }
  if (smooth) {
    const marks: ReactElement[] = [];
    const r = det(5);
    for (let i = 0; i < 9; i++) {
      const my = y + 14 + i * (h / 9.5);
      const mw = 10 + r() * 14;
      const mx = x + 8 + r() * (w - mw - 16);
      marks.push(<path key={i} d={`M${mx},${my} q${mw / 2},-4 ${mw},0`} stroke="#3b3a36" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />);
    }
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={10} fill="#f1ecdf" stroke={C.ink} strokeWidth={3} />
        <rect x={x + 6} y={y + 4} width={w * 0.25} height={h - 8} rx={6} fill="#fff" opacity={0.55} />
        {marks}
        <path d={`M${x + w * 0.7},${y + 6} L${x + w * 0.7},${y + h - 6}`} stroke="#d4cdb8" strokeWidth={5} opacity={0.6} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={C.b2} stroke={C.b5} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#2a1a0a" opacity={0.28} filter="url(#il-fibre-v)" />
      <rect x={x + 5} y={y + 4} width={w * 0.22} height={h - 8} rx={6} fill={C.b1} opacity={0.5} />
      {fissures.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={C.b5} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d={d} stroke={C.b3} strokeWidth={2.4} fill="none" strokeLinecap="round" transform="translate(3 0)" />
        </g>
      ))}
    </g>
  );
}

/* ---------- Motive ---------- */

/** Ein Zapfen mit erkennbaren Schuppen. (x, y) ist die Mitte, `rot` dreht in Grad, `s` skaliert. */
export function ConeShape({ x, y, rot = -52, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const scales: ReactElement[] = [];
  let k = 0;
  for (let row = 0; row < 12; row++) {
    const yy = -58 + row * 10.5;
    const off = row % 2 ? 9 : 0;
    for (let xx = -36 + off; xx <= 36; xx += 18) {
      const tone = row < 4 ? C.b2 : row < 8 ? C.b3 : C.b4;
      scales.push(
        <g key={k++}>
          <path d={`M${xx - 10},${yy - 4} Q${xx},${yy + 14} ${xx + 10},${yy - 4} Q${xx + 2},${yy - 8} ${xx - 10},${yy - 4} Z`} fill={tone} stroke={C.b5} strokeWidth={1.8} strokeLinejoin="round" />
          <path d={`M${xx - 6},${yy} Q${xx},${yy + 7} ${xx + 6},${yy}`} stroke={C.b1} strokeWidth={1.6} fill="none" opacity={0.7} strokeLinecap="round" />
        </g>,
      );
    }
  }
  const outline = 'M0,-64 C22,-52 31,-22 29,10 C27,38 14,56 0,64 C-14,56 -27,38 -29,10 C-31,-22 -22,-52 0,-64 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0,62 Q4,76 -2,84" stroke={C.b5} strokeWidth={5} fill="none" strokeLinecap="round" />
      <clipPath id="il-cone-clip">
        <path d={outline} />
      </clipPath>
      <path d={outline} fill={C.b4} />
      <g clipPath="url(#il-cone-clip)">{scales}</g>
      <Plastic d={outline} hi={0.3} lo={0.34} speck={0.22} />
      <path d={outline} fill="none" stroke={C.b5} strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}
export const natureArt: Record<string, Art> = {
  'fallen-leaf': {
    bg: 'green',
    draw: () => (
      <>
        <Mv origin={[120, 110]}>
          <Leaf kind="ovate" x={64} y={104} rot={-34} s={0.95} colors={LEAF_GREEN} />
          <Leaf kind="round" x={122} y={92} rot={8} s={1.02} colors={LEAF_YELLOW} />
          <Leaf kind="long" x={178} y={108} rot={42} s={0.95} colors={LEAF_ORANGE} />
        </Mv>
      </>
    ),
  },
  'leaf-hole': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="ovate" x={118} y={96} rot={10} s={1.45} colors={LEAF_GREEN} hole={{ x: 4, y: -6, r: 8 }} />
      </Mv>
    ),
  },
  'leaf-veins': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="ovate" x={118} y={96} rot={-8} s={1.5} colors={{ ...LEAF_GREEN, vein: '#e9f6c8' }} veinW={2.4} />
      </Mv>
    ),
  },
  'leaf-big-small': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="round" x={86} y={98} rot={-14} s={1.32} colors={LEAF_GREEN} />
        <Leaf kind="round" x={178} y={124} rot={18} s={0.52} colors={LEAF_GREEN} />
      </Mv>
    ),
  },
  'green-leaf': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="round" x={118} y={98} rot={-12} s={1.4} colors={LEAF_GREEN_DARK} />
      </Mv>
    ),
  },
  'dry-leaf': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="ovate" x={116} y={98} rot={24} s={1.4} colors={{ ...LEAF_BROWN, vein: '#8a5b30' }} />
        <path d="M82,68 Q96,60 104,74 Q92,78 82,68 Z" fill={C.b3} stroke={C.b5} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M150,124 Q160,132 154,144 Q146,138 150,124 Z" fill={C.b3} stroke={C.b5} strokeWidth={2.2} strokeLinejoin="round" />
      </Mv>
    ),
  },
  'yellow-leaf': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="ovate" x={118} y={98} rot={14} s={1.45} colors={LEAF_YELLOW} />
      </Mv>
    ),
  },
  'red-leaf': {
    bg: 'rose',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="round" x={118} y={98} rot={-10} s={1.4} colors={LEAF_RED} />
      </Mv>
    ),
  },
  'leaf-two-shapes': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="round" x={72} y={98} rot={-16} s={1.1} colors={LEAF_GREEN_DARK} />
        <Leaf kind="long" x={170} y={96} rot={20} s={1.15} colors={LEAF_GREEN} />
      </Mv>
    ),
  },
  'maple-leaf': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="maple" x={118} y={96} rot={-6} s={1.5} colors={LEAF_ORANGE} veinW={2} />
      </Mv>
    ),
  },
  'oak-leaf': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="oak" x={118} y={96} rot={10} s={1.5} colors={LEAF_GOLD} veinW={2} />
      </Mv>
    ),
  },
  'hand-leaf': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 110]}>
        <HandLeaf x={118} y={128} rot={-6} s={1.05} colors={LEAF_GREEN} />
      </Mv>
    ),
  },

  tree: {
    bg: 'sky',
    draw: () => (
      <>
        <Sun x={196} y={36} r={14} />
        <Hills y={158} c1={C.g1} c2={C.g2} />
        <Mv origin={[120, 166]}>
          <TreeBroad x={120} y={168} s={0.98} />
        </Mv>
      </>
    ),
  },
  conifer: {
    bg: 'sky',
    draw: () => {
      const tier = (apex: number, base: number, w: number, fill: string) => (
        <g key={apex}>
          <path
            d={`M120,${apex} L${120 - w},${base} Q${120 - w / 2},${base + 9} 120,${base + 3} Q${120 + w / 2},${base + 9} ${120 + w},${base} Z`}
            fill={fill}
            stroke={C.g5}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path d={`M120,${apex + 2} L${120 + w},${base} Q${120 + w / 2},${base + 9} 120,${base + 3} Z`} fill={C.g5} opacity={0.22} />
          <path d={`M${120 - w * 0.55},${base - 6} L${120 - w * 0.2},${base - 14} M${120 + w * 0.2},${base - 14} L${120 + w * 0.55},${base - 6} M${120 - w * 0.25},${apex + (base - apex) * 0.45} L120,${apex + (base - apex) * 0.3}`} stroke={C.g1} strokeWidth={2} strokeLinecap="round" opacity={0.7} fill="none" />
        </g>
      );
      return (
        <>
          <Hills y={160} c1={C.g1} c2={C.g2} />
          <Mv origin={[120, 168]}>
            <rect x={112} y={134} width={16} height={34} rx={3} fill={C.b3} stroke={C.b5} strokeWidth={3} />
            {tier(70, 138, 52, C.g4)}
            {tier(44, 108, 42, C.g3)}
            {tier(18, 78, 32, C.g4)}
          </Mv>
        </>
      );
    },
  },
  'street-tree': {
    bg: 'sky',
    draw: () => (
      <>
        <rect x={0} y={150} width={240} height={50} fill="#d6d1c7" />
        <path d="M0,150 H240" stroke={C.s3} strokeWidth={4} />
        {[0, 40, 80, 120, 160, 200].map((x) => (
          <path key={x} d={`M${x},150 V200 M${x},176 H${x + 40}`} stroke={C.s2} strokeWidth={2} fill="none" />
        ))}
        <ellipse cx={120} cy={172} rx={38} ry={9} fill={C.b4} stroke={C.b5} strokeWidth={2.5} />
        <Mv origin={[120, 170]}>
          <TreeBroad x={120} y={172} s={0.88} crown={C.g2} />
        </Mv>
      </>
    ),
  },
  bark: {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <BarkTrunk x={56} y={18} w={128} h={164} />
      </Mv>
    ),
  },
  'bark-compare': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <BarkTrunk x={26} y={20} w={80} h={160} />
        <BarkTrunk x={134} y={20} w={80} h={160} smooth />
      </Mv>
    ),
  },
  moss: {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 120]}>
        <Log x={112} y={118} moss />
      </Mv>
    ),
  },
  'lying-wood': {
    bg: 'green',
    draw: () => (
      <>
        <GrassBlades x={34} y={150} count={4} h={24} spread={20} />
        <GrassBlades x={206} y={152} count={4} h={22} spread={20} />
        <Mv origin={[120, 120]}>
          <Log x={112} y={122} />
        </Mv>
      </>
    ),
  },
  driftwood: {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 L240,200 L0,200 Z" fill={C.sand2} opacity={0.7} />
        <Mv origin={[120, 120]}>
          <g transform="rotate(-8 112 122)">
            <Log x={112} y={122} bleached />
            <ellipse cx={30} cy={118} rx={7} ry={4} fill="#a38e68" stroke="#8e7a58" strokeWidth={1.6} />
          </g>
        </Mv>
      </>
    ),
  },
  'fallen-twig': {
    bg: 'green',
    draw: () => (
      <>
        <GrassBlades x={50} y={156} count={4} h={22} spread={18} />
        <Mv origin={[120, 110]}>
          <g transform="rotate(-8 120 110)">
            <Thick d="M26,140 Q96,118 214,74" w={9} fill={C.b3} line={C.b5} />
            <Thick d="M82,126 Q104,100 126,84" w={5} fill={C.b3} line={C.b5} />
            <Thick d="M130,106 Q150,92 150,66" w={5} fill={C.b3} line={C.b5} />
            <Thick d="M170,90 Q196,100 204,122" w={4.5} fill={C.b3} line={C.b5} />
            <path d="M40,134 Q96,116 200,80" stroke={C.b1} strokeWidth={2.2} fill="none" opacity={0.7} strokeLinecap="round" />
            <circle cx={62} cy={131} r={2.4} fill={C.b5} opacity={0.7} />
            <circle cx={150} cy={96} r={2.4} fill={C.b5} opacity={0.7} />
          </g>
        </Mv>
      </>
    ),
  },
  'forked-twig': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 166]}>
        <Thick d="M120,176 L120,112" w={12} fill={C.b3} line={C.b5} />
        <Thick d="M120,114 Q106,80 74,44" w={9} fill={C.b3} line={C.b5} />
        <Thick d="M120,114 Q134,80 168,36" w={9} fill={C.b3} line={C.b5} />
        <Thick d="M100,82 Q82,80 66,92" w={4.5} fill={C.b3} line={C.b5} />
        <Thick d="M144,80 Q160,82 172,96" w={4.5} fill={C.b3} line={C.b5} />
        <path d="M118,168 L118,118 M106,100 Q92,70 80,56 M134,96 Q146,68 162,50" stroke={C.b1} strokeWidth={2.2} fill="none" opacity={0.65} strokeLinecap="round" />
      </Mv>
    ),
  },
  'twig-bud': {
    bg: 'green',
    draw: () => {
      const bud = (x: number, y: number, r: number, open: boolean) => (
        <g transform={`translate(${x} ${y}) rotate(${r})`} key={`${x}-${y}`}>
          {open && (
            <>
              <path d="M0,-6 C-12,-14 -16,-30 -8,-40 C-2,-32 0,-20 0,-6Z" fill={C.g2} stroke={C.g5} strokeWidth={2.2} strokeLinejoin="round" />
              <path d="M0,-6 C12,-14 16,-30 8,-40 C2,-32 0,-20 0,-6Z" fill={C.g1} stroke={C.g5} strokeWidth={2.2} strokeLinejoin="round" />
            </>
          )}
          <path d="M-6,4 C-8,-10 -4,-20 0,-26 C4,-20 8,-10 6,4 Z" fill={open ? C.b2 : '#c9b26a'} stroke={C.b5} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M-2,2 C-3,-8 -1,-16 0,-20" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.55} strokeLinecap="round" />
        </g>
      );
      return (
        <Mv origin={[120, 150]}>
          <Thick d="M24,150 Q100,126 216,70" w={9} fill={C.b3} line={C.b5} />
          <Thick d="M120,118 Q130,98 150,84" w={5} fill={C.b3} line={C.b5} />
          {bud(70, 134, -18, false)}
          {bud(112, 120, -26, false)}
          {bud(168, 98, -30, true)}
          {bud(150, 84, -10, true)}
          {bud(206, 76, -40, false)}
        </Mv>
      );
    },
  },
  'tree-stump': {
    bg: 'green',
    draw: () => (
      <>
        <GrassBlades x={40} y={166} count={5} h={26} spread={22} />
        <GrassBlades x={202} y={166} count={5} h={26} spread={22} />
        <Mv origin={[120, 150]}>
          <path d="M66,100 C64,128 56,150 44,166 C80,172 160,172 196,166 C184,150 176,128 174,100 Z" fill={C.b3} stroke={C.b5} strokeWidth={3.2} strokeLinejoin="round" />
          <path d="M80,108 C80,132 74,150 66,164 M100,112 C100,136 98,152 96,168 M126,112 C126,136 128,152 130,168 M152,108 C152,132 158,150 166,164" stroke={C.b5} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round" />
          <ellipse cx={120} cy={100} rx={56} ry={22} fill={C.b1} stroke={C.b5} strokeWidth={3.2} />
          {[44, 33, 23, 14, 6].map((rx, i) => (
            <ellipse key={rx} cx={120 + (i % 2 ? 1 : -1)} cy={100} rx={rx} ry={rx * 0.38} fill="none" stroke={C.b3} strokeWidth={2.2} opacity={0.85} />
          ))}
          <path d="M120,100 L168,96" stroke={C.b4} strokeWidth={2} opacity={0.6} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  root: {
    bg: 'green',
    draw: () => (
      <>
        <path d="M0,142 C60,134 180,134 240,142 L240,200 L0,200 Z" fill={C.b2} opacity={0.5} />
        <Mv origin={[120, 140]}>
          <rect x={96} y={10} width={48} height={120} rx={6} fill={C.b3} stroke={C.b5} strokeWidth={3} />
          <path d="M108,16 V126 M122,16 V126 M134,22 V122" stroke={C.b5} strokeWidth={3} opacity={0.5} strokeLinecap="round" />
          <Thick d="M100,126 C86,138 60,140 28,160" w={14} fill={C.b3} line={C.b5} />
          <Thick d="M140,126 C154,138 180,140 212,160" w={14} fill={C.b3} line={C.b5} />
          <Thick d="M114,132 C112,150 100,164 84,184" w={11} fill={C.b3} line={C.b5} />
          <Thick d="M128,132 C130,150 142,164 160,184" w={11} fill={C.b3} line={C.b5} />
          <path d="M96,120 C84,132 62,134 36,150" stroke={C.b1} strokeWidth={2.2} fill="none" opacity={0.6} strokeLinecap="round" />
        </Mv>
        <GrassBlades x={40} y={144} count={4} h={20} spread={16} />
        <GrassBlades x={206} y={146} count={4} h={20} spread={16} />
      </>
    ),
  },
  cone: {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <ConeShape x={120} y={100} rot={-52} s={1} />
      </Mv>
    ),
  },
  chestnut: {
    bg: 'cream',
    draw: () => {
      const spikes: ReactElement[] = [];
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2;
        const x1 = Math.cos(a) * 34;
        const y1 = Math.sin(a) * 34;
        spikes.push(<path key={i} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${(Math.cos(a) * 44).toFixed(1)},${(Math.sin(a) * 44).toFixed(1)}`} stroke={C.g5} strokeWidth={3.2} strokeLinecap="round" />);
      }
      const nut = 'M0,-34 C28,-36 40,-8 34,16 C30,34 12,40 0,38 C-14,40 -32,32 -36,12 C-40,-12 -26,-32 0,-34 Z';
      return (
        <>
          <g transform="translate(78 100)">
            {spikes}
            <circle r={36} fill={C.g2} stroke={C.g5} strokeWidth={3} />
            <circle cx={-10} cy={-10} r={20} fill={C.g1} opacity={0.5} />
            <path d="M-20,12 L-26,20 M-8,22 L-10,32 M14,20 L18,28" stroke={C.g5} strokeWidth={2.2} fill="none" opacity={0.5} strokeLinecap="round" />
            <path d="M6,-34 Q12,-10 6,14" stroke="#f2f6df" strokeWidth={4} fill="none" opacity={0.85} strokeLinecap="round" />
          </g>
          <Mv origin={[160, 114]}>
            <g transform="translate(164 112)">
              <path d={nut} fill="#8a3f1d" stroke="#4a1f0c" strokeWidth={2} strokeLinejoin="round" />
              <Plastic d={nut} hi={0.55} lo={0.38} speck={0.14} />
              <path d="M-24,-18 C-14,-30 8,-30 18,-22 C6,-26 -12,-24 -24,-18 Z" fill="#d38a52" opacity={0.85} />
              <path d="M-24,-4 C-26,8 -20,22 -8,26" stroke="#b7612f" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round" />
              <path d="M-14,22 C-16,10 -4,6 6,8 C16,10 20,22 12,32 C4,38 -12,34 -14,22 Z" fill="#ead3ab" stroke="#4a1f0c" strokeWidth={2.4} strokeLinejoin="round" />
              <path d="M-6,16 C-2,12 6,12 9,17" stroke="#fff" strokeWidth={2} fill="none" opacity={0.6} strokeLinecap="round" />
            </g>
          </Mv>
        </>
      );
    },
  },
  acorn: {
    bg: 'cream',
    draw: () => {
      const one = (x: number, y: number, s: number, r: number) => (
        <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <path d="M-22,-6 C-26,22 -8,40 0,50 C8,40 26,22 22,-6 Z" fill="#c68a4a" stroke={C.b5} strokeWidth={2} strokeLinejoin="round" />
          <Plastic d="M-22,-6 C-26,22 -8,40 0,50 C8,40 26,22 22,-6 Z" hi={0.5} lo={0.3} speck={0.12} />
          <path d="M-14,2 C-16,18 -8,30 -2,38" stroke="#e8b878" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
          <path d="M-28,-4 C-32,-32 -12,-44 0,-44 C12,-44 32,-32 28,-4 C14,2 -14,2 -28,-4 Z" fill={C.b3} stroke={C.b5} strokeWidth={2} strokeLinejoin="round" />
          <Plastic d="M-28,-4 C-32,-32 -12,-44 0,-44 C12,-44 32,-32 28,-4 C14,2 -14,2 -28,-4 Z" hi={0.3} lo={0.3} speck={0.2} />
          {[
            [-18, -8], [-6, -8], [6, -8], [18, -8], [-12, -17], [0, -17], [12, -17], [-18, -26], [-6, -26], [6, -26], [18, -26], [-6, -35], [6, -35],
          ].map(([cx, cy], i) => (
            <path key={i} d={`M${cx - 4.5},${cy - 3} L${cx},${cy + 2} L${cx + 4.5},${cy - 3}`} stroke={C.b5} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
          ))}
          <path d="M-8,-40 Q0,-36 8,-40" stroke={C.b1} strokeWidth={2.6} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M0,-44 Q2,-54 8,-58" stroke={C.b5} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
      return (
        <>
          <Mv origin={[100, 110]}>{one(104, 98, 1.5, -6)}</Mv>
          {one(180, 142, 0.82, 72)}
        </>
      );
    },
  },
  blossom: {
    bg: 'green',
    draw: () => (
      <>
        <GrassBlades x={50} y={170} count={5} h={34} spread={30} />
        <GrassBlades x={192} y={170} count={5} h={34} spread={30} />
        <Mv origin={[120, 172]}>
          <Thick d="M120,172 C116,140 124,112 120,82" w={6} fill={C.g3} line={C.g5} edge={3} />
          <path d="M120,146 C100,142 88,128 86,114 C104,114 118,128 120,146 Z" fill={C.g2} stroke={C.g5} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M120,134 C140,132 154,120 156,106 C138,106 122,118 120,134 Z" fill={C.g3} stroke={C.g5} strokeWidth={2.6} strokeLinejoin="round" />
          <Flower x={120} y={66} r={30} petals={9} />
        </Mv>
      </>
    ),
  },
  'blossom-compare': {
    bg: 'green',
    draw: () => (
      <>
        <GrassBlades x={120} y={176} count={7} h={26} spread={90} />
        <Mv origin={[120, 176]}>
          <Thick d="M70,176 C66,146 74,120 70,96" w={6} fill={C.g3} line={C.g5} edge={3} />
          <Flower x={70} y={74} r={34} petals={12} petal={C.y1} edge={C.y3} center={C.b3} centerEdge={C.b5} />
          <Thick d="M178,176 C176,160 180,150 178,136" w={4} fill={C.g3} line={C.g5} edge={2.4} />
          <Flower x={178} y={122} r={15} petals={8} />
        </Mv>
      </>
    ),
  },
  grass: {
    bg: 'sky',
    draw: () => (
      <>
        <Ground y={164} />
        <Mv origin={[120, 168]}>
          <GrassBlades x={120} y={170} count={13} h={118} spread={110} />
          <GrassBlades x={92} y={172} count={6} h={64} spread={50} color={C.g2} light={C.g1} />
          <GrassBlades x={150} y={172} count={6} h={72} spread={56} color={C.g2} light={C.g1} />
          <path d="M52,176 C60,160 90,158 120,160 C150,158 182,160 190,176 C150,184 92,184 52,176 Z" fill={C.g3} stroke={C.g5} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M70,170 C90,164 120,164 150,168" stroke={C.g1} strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  'trail-grass': {
    bg: 'green',
    draw: () => (
      <>
        <path d="M70,200 C80,150 120,130 126,80 C128,56 120,34 130,0 L176,0 C168,40 176,70 170,100 C160,140 130,160 140,200 Z" fill={C.b1} stroke={C.b2} strokeWidth={3} />
        <path d="M100,200 C108,160 140,140 146,100" stroke={C.b2} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" fill="none" opacity={0.6} />
        <Mv origin={[60, 180]}>
          <GrassBlades x={56} y={184} count={9} h={78} spread={64} />
          <GrassBlades x={26} y={150} count={5} h={52} spread={34} />
        </Mv>
        <Mv origin={[190, 150]} cls="mv2">
          <GrassBlades x={196} y={170} count={8} h={70} spread={56} />
        </Mv>
      </>
    ),
  },
  'grass-seeds': {
    bg: 'sky',
    draw: () => {
      const ear = (x: number, y: number, rot: number, s: number, c1: string, c2: string) => {
        const grains: ReactElement[] = [];
        for (let i = 0; i < 9; i++) {
          const gy = -i * 9;
          const side = i % 2 ? 1 : -1;
          grains.push(
            <g key={i}>
              <path d={`M0,${gy} L${side * 5},${gy - 22}`} stroke={C.b3} strokeWidth={1.4} strokeLinecap="round" />
              <ellipse cx={side * 5} cy={gy - 4} rx={4.6} ry={8} fill={c1} stroke={C.b5} strokeWidth={1.8} transform={`rotate(${side * 14} ${side * 5} ${gy - 4})`} />
            </g>,
          );
        }
        return (
          <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
            {grains}
            <ellipse cx={0} cy={-80} rx={4} ry={8} fill={c2} stroke={C.b5} strokeWidth={1.8} />
          </g>
        );
      };
      return (
        <>
          <Ground y={168} />
          <Mv origin={[120, 172]}>
            <Thick d="M90,176 C92,140 84,100 88,70" w={4} fill={C.g3} line={C.g5} edge={2.4} />
            <Thick d="M160,176 C158,140 164,110 160,80" w={4} fill={C.g3} line={C.g5} edge={2.4} />
            <Thick d="M122,176 C120,130 130,80 138,40" w={5} fill={C.g3} line={C.g5} edge={2.8} />
            <path d="M122,140 C104,132 90,134 76,148 C96,152 112,150 122,140 Z" fill={C.g2} stroke={C.g5} strokeWidth={2.4} strokeLinejoin="round" />
            {ear(88, 74, -4, 0.62, '#e2c97a', '#e8d38a')}
            {ear(160, 84, 4, 0.62, '#d9bf70', '#e8d38a')}
            {ear(138, 46, 8, 0.82, '#ecd185', '#f2dd98')}
          </Mv>
        </>
      );
    },
  },
  'low-plant': {
    bg: 'green',
    draw: () => {
      const clover = (x: number, y: number, s: number, rot: number) => (
        <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
          <Union fill={C.g2} line={C.g5} w={4.4}>
            <circle cx={0} cy={-16} r={13} />
            <circle cx={-15} cy={9} r={13} />
            <circle cx={15} cy={9} r={13} />
          </Union>
          <path d="M-6,-20 L0,-10 L6,-20 M-20,6 L-12,10 L-18,18 M20,6 L12,10 L18,18" stroke={C.g1} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
      return (
        <>
          <Ground y={156} fill={C.g2} />
          <GrassBlades x={48} y={160} count={5} h={30} spread={26} />
          <Mv origin={[120, 160]}>
            <Thick d="M122,168 C120,150 122,138 120,126" w={3.6} fill={C.g3} line={C.g5} edge={2} />
            {clover(120, 108, 1.15, 0)}
            <path d="M150,170 C150,160 158,152 166,150" stroke={C.g5} strokeWidth={3} fill="none" />
            {clover(172, 138, 0.62, 18)}
            <path d="M88,172 C86,160 78,152 72,150" stroke={C.g5} strokeWidth={3} fill="none" />
            <Flower x={66} y={140} r={11} petals={8} />
          </Mv>
        </>
      );
    },
  },
  insect: {
    bg: 'green',
    draw: () => (
      <>
        <Leaf kind="ovate" x={118} y={110} rot={72} s={1.9} colors={LEAF_GREEN} />
        <Mv origin={[120, 90]}>
          <g transform="translate(118 84)">
            <g stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" fill="none">
              <path d="M-14,-4 L-26,-10 M-16,4 L-28,8 M-10,12 L-20,22 M14,-4 L26,-10 M16,4 L28,8 M10,12 L20,22" />
              <path d="M-5,-30 L-12,-42 M5,-30 L12,-42" />
            </g>
            <ellipse cx={0} cy={0} rx={22} ry={24} fill={C.r2} stroke={C.ink} strokeWidth={3} />
            <ellipse cx={-8} cy={-8} rx={9} ry={11} fill="#fff" opacity={0.3} />
            <path d="M0,-24 L0,24" stroke={C.ink} strokeWidth={2.4} />
            {[[-11, -6], [11, -6], [-12, 10], [12, 10], [0, 16]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={3.8} fill={C.ink} />
            ))}
            <path d="M-14,-24 C-14,-38 14,-38 14,-24 Z" fill={C.ink} />
            <circle cx={-5} cy={-31} r={2.2} fill="#fff" />
            <circle cx={5} cy={-31} r={2.2} fill="#fff" />
          </g>
        </Mv>
      </>
    ),
  },
  sky: {
    bg: 'sky',
    shadow: false,
    draw: () => (
      <>
        <Sun x={190} y={42} r={16} />
        <Mv origin={[120, 100]}>
          <Cloud x={72} y={74} s={1.5} />
        </Mv>
        <Mv origin={[120, 100]} cls="mv2">
          <Cloud x={162} y={118} s={1.1} />
        </Mv>
        <Cloud x={46} y={146} s={0.7} fill="#f4fafd" />
      </>
    ),
  },
  'ground-shadow': {
    bg: 'cream',
    draw: () => (
      <>
        <Sun x={50} y={36} r={14} />
        <Ground y={140} fill={C.g1} line={C.g3} />
        <Mv origin={[88, 150]}>
          <path d="M92,150 L190,160 C206,162 214,170 206,176 C196,184 150,178 126,170 C112,166 100,160 92,150 Z" fill={C.g5} opacity={0.34} />
          <ellipse cx={176} cy={168} rx={32} ry={9} fill={C.g5} opacity={0.18} />
        </Mv>
        <TreeBroad x={88} y={152} s={0.6} />
      </>
    ),
  },
  puddle: {
    bg: 'stone',
    draw: () => (
      <>
        <path d="M0,60 C80,40 160,40 240,60 L240,200 L0,200 Z" fill={C.b1} opacity={0.65} />
        <GrassBlades x={34} y={128} count={5} h={28} spread={24} />
        <GrassBlades x={208} y={132} count={5} h={28} spread={24} />
        <path d="M30,114 C30,84 90,70 130,72 C186,74 214,92 208,120 C202,148 150,160 108,156 C56,152 30,140 30,114 Z" fill={C.w2} stroke={C.w3} strokeWidth={3} strokeLinejoin="round" />
        <path d="M44,112 C46,92 96,84 130,86 C176,88 196,100 192,118 C188,134 150,144 112,140 C70,138 42,128 44,112 Z" fill={C.sky1} opacity={0.85} />
        <Cloud x={92} y={110} s={0.7} />
        <Cloud x={150} y={122} s={0.45} />
        <Mv origin={[140, 118]}>
          <ellipse className="rip" cx={150} cy={116} rx={30} ry={8} fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.85} />
          <ellipse className="rip d2" cx={150} cy={116} rx={16} ry={4} fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.85} />
        </Mv>
        <Pebble x={216} y={150} rx={9} ry={6} />
        <Pebble x={26} y={156} rx={8} ry={5} />
      </>
    ),
  },
  snow: {
    bg: 'snow',
    draw: () => {
      const flake = (x: number, y: number, s: number) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${s})`} stroke="#7fa6c4" strokeWidth={2.4} strokeLinecap="round" fill="none">
          {[0, 60, 120].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path d="M0,-12 L0,12 M-4,-8 L0,-4 L4,-8 M-4,8 L0,4 L4,8" />
            </g>
          ))}
        </g>
      );
      return (
        <>
          <path d="M0,120 C40,100 100,110 130,118 C170,100 220,104 240,118 L240,200 L0,200 Z" fill="#fff" stroke="#c4d6e6" strokeWidth={3} />
          <path d="M0,150 C60,138 120,146 160,152 C200,140 230,148 240,152 L240,200 L0,200 Z" fill="#e8f1f8" />
          <path d="M30,140 C60,132 90,136 112,142" stroke="#bcd3e6" strokeWidth={3} fill="none" strokeLinecap="round" />
          <Mv origin={[120, 100]}>
            <Thick d="M170,150 Q190,110 214,92" w={5} fill={C.b3} line={C.b5} edge={3} />
            <path d="M176,128 C186,118 200,116 210,116 C204,126 190,130 176,128 Z" fill="#fff" stroke="#c4d6e6" strokeWidth={2.2} />
            {flake(58, 54, 1.1)}
            {flake(120, 38, 0.8)}
            {flake(186, 62, 1)}
            {flake(86, 96, 0.7)}
            {flake(150, 88, 0.9)}
          </Mv>
        </>
      );
    },
  },
};

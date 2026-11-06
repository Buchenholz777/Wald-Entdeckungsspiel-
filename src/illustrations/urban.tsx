import { C, Flower, GrassBlades, Ground, Mv, det, type Art } from './kit';

const WALL = '#f3e4cf';
const WALL_EDGE = '#c9ae8c';

function Wall({ y = 0 }: { y?: number }) {
  return (
    <g>
      <rect x={0} y={y} width={240} height={200 - y} fill={WALL} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M0,${y + 14 + i * 28} H240`} stroke={WALL_EDGE} strokeWidth={1.4} opacity={0.5} />
      ))}
    </g>
  );
}

export const urbanArt: Record<string, Art> = {
  bench: {
    bg: 'green',
    draw: () => (
      <>
        <Ground y={158} fill={C.g1} line={C.g3} />
        <Mv origin={[120, 170]}>
          {/* Beine */}
          <g stroke={C.s4} strokeWidth={7} strokeLinecap="round" fill="none">
            <path d="M52,112 L44,168 M188,112 L196,168" />
            <path d="M64,112 L72,168 M176,112 L168,168" />
          </g>
          <g stroke={C.s2} strokeWidth={3} strokeLinecap="round" fill="none">
            <path d="M52,112 L44,168 M188,112 L196,168 M64,112 L72,168 M176,112 L168,168" />
          </g>
          {/* Sitzfläche */}
          <path d="M34,112 L206,112 L212,126 L28,126 Z" fill={C.b2} stroke={C.b5} strokeWidth={3} strokeLinejoin="round" />
          <path d="M38,119 H202" stroke={C.b5} strokeWidth={2} opacity={0.6} />
          {/* Rückenlehne */}
          {[56, 74, 92].map((y) => (
            <rect key={y} x={36} y={y - 22} width={168} height={14} rx={3} fill={C.b3} stroke={C.b5} strokeWidth={3} />
          ))}
          <rect x={42} y={34} width={156} height={4} rx={2} fill={C.b1} opacity={0.6} />
          <path d="M52,36 V112 M188,36 V112" stroke={C.s4} strokeWidth={6} strokeLinecap="round" opacity={0.0} />
        </Mv>
      </>
    ),
  },
  door: {
    bg: 'cream',
    draw: () => (
      <>
        <Wall />
        <Mv origin={[120, 170]}>
          <rect x={64} y={20} width={112} height={156} rx={8} fill="#fff" stroke={C.ink} strokeWidth={3} />
          <rect x={74} y={30} width={92} height={146} rx={4} fill="#c9503f" stroke="#6d2018" strokeWidth={3} />
          <rect x={84} y={42} width={72} height={46} rx={4} fill="#f3e6b5" stroke="#6d2018" strokeWidth={2.6} />
          <path d="M120,42 V88 M84,65 H156" stroke="#6d2018" strokeWidth={2.4} />
          <rect x={84} y={100} width={72} height={64} rx={4} fill="none" stroke="#a2392b" strokeWidth={3} />
          <circle cx={150} cy={118} r={5.5} fill={C.y2} stroke={C.y3} strokeWidth={2} />
          <rect x={146} y={122} width={9} height={16} rx={4} fill={C.y2} stroke={C.y3} strokeWidth={2} opacity={0} />
          <rect x={84} y={46} width={20} height={34} rx={3} fill="#fff" opacity={0.28} />
        </Mv>
        <rect x={52} y={176} width={136} height={14} rx={3} fill={C.s2} stroke={C.s4} strokeWidth={2.6} />
      </>
    ),
  },
  window: {
    bg: 'cream',
    draw: () => (
      <>
        <Wall />
        <Mv origin={[120, 100]}>
          <rect x={58} y={28} width={124} height={120} rx={6} fill="#fff" stroke={C.ink} strokeWidth={3} />
          <rect x={68} y={38} width={104} height={100} rx={3} fill={C.sky2} stroke={C.s3} strokeWidth={2.4} />
          <path d="M120,38 V138 M68,88 H172" stroke="#fff" strokeWidth={6} />
          <path d="M120,38 V138 M68,88 H172" stroke={C.s3} strokeWidth={1.4} />
          <path d="M74,44 L98,44 L74,70 Z M128,44 L146,44 L128,62 Z" fill="#fff" opacity={0.5} />
          <rect x={48} y={148} width={144} height={12} rx={3} fill="#fff" stroke={C.ink} strokeWidth={3} />
          <rect x={52} y={160} width={136} height={5} fill={WALL_EDGE} opacity={0.6} />
        </Mv>
      </>
    ),
  },
  bicycle: {
    bg: 'stone',
    draw: () => {
      const wheel = (cx: number) => (
        <g>
          <circle cx={cx} cy={128} r={36} fill="none" stroke={C.ink} strokeWidth={7} />
          <circle cx={cx} cy={128} r={36} fill="none" stroke={C.s1} strokeWidth={2.4} />
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={cx} y1={128} x2={cx + Math.cos((i / 10) * Math.PI * 2) * 34} y2={128 + Math.sin((i / 10) * Math.PI * 2) * 34} stroke={C.s3} strokeWidth={1.2} />
          ))}
          <circle cx={cx} cy={128} r={5} fill={C.s2} stroke={C.ink} strokeWidth={2.4} />
        </g>
      );
      return (
        <>
          <path d="M0,166 H240" stroke={C.s3} strokeWidth={4} />
          <Mv origin={[120, 166]}>
            {wheel(64)}
            {wheel(176)}
            <g stroke="#c9503f" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M64,128 L100,84 M64,128 L118,128 M100,84 L118,128 M100,84 L160,80 M118,128 L156,90 M176,128 L156,90" />
            </g>
            <g stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55}>
              <path d="M64,128 L100,84 M64,128 L118,128 M100,84 L118,128 M100,84 L160,80 M118,128 L156,90 M176,128 L156,90" />
            </g>
            <path d="M94,76 Q106,70 118,76" stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" />
            <path d="M100,84 L100,76" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
            <path d="M160,80 L158,66 Q152,60 146,64 M158,66 Q166,60 172,66" stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
            <circle cx={118} cy={128} r={9} fill={C.s2} stroke={C.ink} strokeWidth={2.6} />
            <path d="M118,128 L110,142 M118,128 L126,114" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
            <path d="M64,128 L118,128" stroke={C.s4} strokeWidth={1.6} strokeDasharray="3 3" />
          </Mv>
        </>
      );
    },
  },
  'round-sign': {
    bg: 'sky',
    draw: () => (
      <>
        <Ground y={166} />
        <Mv origin={[120, 168]}>
          <rect x={114} y={106} width={12} height={62} rx={3} fill={C.s2} stroke={C.s4} strokeWidth={3} />
          <circle cx={120} cy={70} r={50} fill="#fff" stroke={C.ink} strokeWidth={3.6} />
          <circle cx={120} cy={70} r={42} fill="#2f6fb8" />
          <path d="M120,96 V50 M104,64 L120,46 L136,64" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M88,46 Q96,32 112,28" stroke="#fff" strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  'house-number': {
    bg: 'cream',
    draw: () => (
      <>
        <Wall />
        <Mv origin={[120, 100]}>
          <rect x={52} y={52} width={136} height={96} rx={14} fill="#fff" stroke="#1e4f92" strokeWidth={5} />
          <rect x={60} y={60} width={120} height={80} rx={8} fill="#2a63b0" />
          <text x={120} y={118} textAnchor="middle" fontSize={64} fontWeight={800} fill="#fff" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
            12
          </text>
          <circle cx={68} cy={68} r={3} fill="#c8d6ec" />
          <circle cx={172} cy={68} r={3} fill="#c8d6ec" />
          <circle cx={68} cy={132} r={3} fill="#c8d6ec" />
          <circle cx={172} cy={132} r={3} fill="#c8d6ec" />
        </Mv>
      </>
    ),
  },
  'sign-letter': {
    bg: 'sky',
    draw: () => (
      <>
        <Ground y={168} />
        <Mv origin={[120, 168]}>
          <rect x={112} y={90} width={16} height={78} rx={3} fill={C.b3} stroke={C.b5} strokeWidth={3} />
          <path d="M34,28 H176 L204,56 L176,84 H34 Z" fill="#f7efd6" stroke={C.b5} strokeWidth={3.4} strokeLinejoin="round" />
          <path d="M42,36 H172 L194,56 L172,76 H42 Z" fill="none" stroke={C.g4} strokeWidth={2.4} opacity={0.6} />
          <text x={104} y={72} textAnchor="middle" fontSize={44} fontWeight={800} fill="#2c5e34" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
            A
          </text>
          <circle cx={46} cy={56} r={3.4} fill={C.b5} />
        </Mv>
      </>
    ),
  },
  number: {
    bg: 'cream',
    draw: () => {
      const plate = (x: number, y: number, n: string, bg: string, rot: number) => (
        <g transform={`translate(${x} ${y}) rotate(${rot})`}>
          <rect x={-30} y={-34} width={60} height={68} rx={12} fill={bg} stroke={C.ink} strokeWidth={3.4} />
          <text x={0} y={18} textAnchor="middle" fontSize={52} fontWeight={800} fill="#fff" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
            {n}
          </text>
        </g>
      );
      return (
        <Mv origin={[120, 100]}>
          {plate(54, 92, '1', '#3a78c2', -6)}
          {plate(120, 100, '2', '#d9604c', 3)}
          {plate(186, 94, '3', '#4f9a52', -3)}
        </Mv>
      );
    },
  },
  'paving-pattern': {
    bg: 'stone',
    shadow: false,
    draw: () => {
      const tiles = [];
      for (let r = 0; r < 8; r++) {
        for (let i = -1; i < 7; i++) {
          const x = 14 + i * 34 + (r % 2 ? -17 : 0);
          const tone = (r + i) % 3 === 0 ? '#c97a64' : (r + i) % 3 === 1 ? '#b9b3a8' : '#a39d92';
          tiles.push(<rect key={`${r}-${i}`} x={x} y={22 + r * 20} width={32} height={18} rx={3} fill={tone} stroke="#7d776c" strokeWidth={1.8} />);
        }
      }
      return (
        <Mv origin={[120, 100]}>
          <clipPath id="il-pave-clip">
            <rect x={18} y={20} width={204} height={162} rx={14} />
          </clipPath>
          <g clipPath="url(#il-pave-clip)">{tiles}</g>
          <rect x={18} y={20} width={204} height={162} rx={14} fill="none" stroke={C.ink} strokeWidth={3} />
        </Mv>
      );
    },
  },
  'cover-grate': {
    bg: 'stone',
    draw: () => (
      <Mv origin={[120, 100]}>
        <circle cx={80} cy={100} r={52} fill="#6e6a66" stroke="#2f2d2b" strokeWidth={4} />
        <circle cx={80} cy={100} r={44} fill="none" stroke="#8a8680" strokeWidth={3} />
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 5 }).map((__, col) => {
            const x = 52 + col * 14;
            const y = 72 + row * 14;
            const inside = (x - 80) ** 2 + (y - 100) ** 2 < 38 ** 2;
            return inside ? <circle key={`${row}-${col}`} cx={x} cy={y} r={4} fill="#8a8680" stroke="#2f2d2b" strokeWidth={1.2} /> : null;
          }),
        )}
        <rect x={146} y={60} width={78} height={80} rx={6} fill="#4a4743" stroke="#2f2d2b" strokeWidth={3.4} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={154} y={68 + i * 11} width={62} height={5} rx={2.5} fill="#1e1d1b" />
        ))}
      </Mv>
    ),
  },
  planter: {
    bg: 'cream',
    draw: () => (
      <>
        <Ground y={166} fill={C.b1} line={C.b3} />
        <Mv origin={[120, 168]}>
          <path d="M84,112 H156 L146,172 H94 Z" fill="#cf7650" stroke="#7d3b1f" strokeWidth={3.4} strokeLinejoin="round" />
          <rect x={78} y={104} width={84} height={16} rx={4} fill="#dd8a63" stroke="#7d3b1f" strokeWidth={3.4} />
          <path d="M90,126 L96,166" stroke="#f0b595" strokeWidth={5} opacity={0.6} strokeLinecap="round" />
          <ellipse cx={120} cy={106} rx={34} ry={5} fill={C.b4} />
          <path d="M120,106 C116,90 118,70 124,52 M112,102 C100,88 86,80 70,80 M128,100 C142,86 158,78 172,80" stroke={C.g5} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M120,92 C100,92 84,80 76,64 C96,62 114,74 120,92 Z" fill={C.g2} stroke={C.g5} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M122,84 C144,84 160,72 168,56 C148,54 128,66 122,84 Z" fill={C.g3} stroke={C.g5} strokeWidth={2.6} strokeLinejoin="round" />
          <Flower x={124} y={44} r={18} petals={7} petal={C.r1} edge={C.r3} center={C.y2} centerEdge={C.y3} />
          <Flower x={80} y={60} r={11} petals={6} petal={C.r1} edge={C.r3} center={C.y2} centerEdge={C.y3} />
          <Flower x={170} y={54} r={12} petals={6} petal={C.r1} edge={C.r3} center={C.y2} centerEdge={C.y3} />
        </Mv>
      </>
    ),
  },
  fence: {
    bg: 'green',
    draw: () => (
      <>
        <Ground y={160} fill={C.g1} line={C.g3} />
        <Mv origin={[120, 168]}>
          {[22, 52, 82, 112, 142, 172, 202].map((x) => (
            <path key={x} d={`M${x - 11},170 V54 L${x},42 L${x + 11},54 V170 Z`} fill="#f0e3c4" stroke={C.b5} strokeWidth={3} strokeLinejoin="round" />
          ))}
          <rect x={8} y={76} width={224} height={13} rx={3} fill={C.b2} stroke={C.b5} strokeWidth={3} />
          <rect x={8} y={130} width={224} height={13} rx={3} fill={C.b2} stroke={C.b5} strokeWidth={3} />
          {[22, 52, 82, 112, 142, 172, 202].map((x) => (
            <g key={x}>
              <circle cx={x} cy={82} r={2} fill={C.b5} />
              <circle cx={x} cy={136} r={2} fill={C.b5} />
            </g>
          ))}
        </Mv>
        <GrassBlades x={60} y={170} count={4} h={20} spread={20} />
        <GrassBlades x={180} y={170} count={4} h={20} spread={20} />
      </>
    ),
  },
  hedge: {
    bg: 'sky',
    draw: () => {
      const r = det(11);
      const dots = [];
      for (let i = 0; i < 70; i++) {
        const x = 34 + r() * 172;
        const y = 70 + r() * 90;
        dots.push(<circle key={i} cx={x} cy={y} r={3 + r() * 4} fill={r() > 0.5 ? C.g1 : C.g4} opacity={r() > 0.5 ? 0.7 : 0.55} />);
      }
      return (
        <>
          <Ground y={162} fill={C.g1} line={C.g3} />
          <Mv origin={[120, 166]}>
            <path d="M28,166 V84 C28,66 44,60 60,62 C76,52 100,56 114,60 C130,52 160,56 176,62 C196,60 212,68 212,86 V166 Z" fill={C.g3} stroke={C.g5} strokeWidth={3.4} strokeLinejoin="round" />
            <path d="M34,90 C50,72 100,70 120,74" stroke={C.g1} strokeWidth={5} fill="none" opacity={0.5} strokeLinecap="round" />
            {dots}
          </Mv>
        </>
      );
    },
  },
  slide: {
    bg: 'sky',
    draw: () => (
      <>
        <Ground y={164} fill={C.g1} line={C.g3} />
        <Mv origin={[120, 168]}>
          {/* Gerüst */}
          <rect x={36} y={56} width={10} height={112} rx={3} fill="#3a78c2" stroke="#1e4f92" strokeWidth={2.6} />
          <rect x={84} y={56} width={10} height={112} rx={3} fill="#3a78c2" stroke="#1e4f92" strokeWidth={2.6} />
          <rect x={30} y={54} width={70} height={10} rx={3} fill="#e3a52d" stroke="#9a6a12" strokeWidth={2.6} />
          <path d="M36,56 L36,40 L94,40 L94,56" fill="none" stroke="#1e4f92" strokeWidth={4} strokeLinejoin="round" />
          {/* Leiter */}
          {[78, 98, 118, 138, 156].map((y) => (
            <rect key={y} x={50} y={y} width={30} height={5} rx={2} fill="#e3a52d" stroke="#9a6a12" strokeWidth={1.8} />
          ))}
          {/* Rutsche */}
          <path d="M98,58 C140,60 170,100 206,160 L226,160 C186,90 150,48 98,44 Z" fill="#e3a52d" stroke="#9a6a12" strokeWidth={3} strokeLinejoin="round" />
          <path d="M100,56 C142,58 172,100 208,160 L222,160 C184,94 148,52 100,50 Z" fill="#f8dc7a" />
          <path d="M104,52 C146,54 176,96 210,156" stroke="#fff" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  swing: {
    bg: 'sky',
    draw: () => (
      <>
        <Ground y={164} fill={C.g1} line={C.g3} />
        <path d="M40,172 L100,34 M200,172 L140,34" stroke="#1e4f92" strokeWidth={10} strokeLinecap="round" />
        <path d="M40,172 L100,34 M200,172 L140,34" stroke="#3a78c2" strokeWidth={5} strokeLinecap="round" />
        <rect x={86} y={26} width={68} height={12} rx={5} fill="#3a78c2" stroke="#1e4f92" strokeWidth={3} />
        <Mv origin={[120, 38]}>
          <path d="M104,38 L100,128 M136,38 L140,128" stroke={C.s4} strokeWidth={5} strokeLinecap="round" />
          <path d="M104,38 L100,128 M136,38 L140,128" stroke={C.s1} strokeWidth={1.6} strokeDasharray="1 5" strokeLinecap="round" />
          <rect x={88} y={126} width={64} height={14} rx={7} fill="#e3a52d" stroke="#9a6a12" strokeWidth={3} />
          <path d="M96,131 H144" stroke="#f8dc7a" strokeWidth={3} strokeLinecap="round" />
        </Mv>
      </>
    ),
  },
  'sand-area': {
    bg: 'green',
    draw: () => (
      <>
        <Mv origin={[120, 130]}>
          <path d="M42,96 H198 L226,150 H14 Z" fill={C.sand2} stroke={C.b5} strokeWidth={3} strokeLinejoin="round" />
          <path d="M60,104 C80,98 120,108 140,102 M50,126 C80,118 130,128 180,120" stroke={C.sand3} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8} />
          <path d="M14,150 H226 V170 H14 Z" fill={C.b3} stroke={C.b5} strokeWidth={3} strokeLinejoin="round" />
          <path d="M14,157 H226" stroke={C.b5} strokeWidth={2} opacity={0.6} />
          <path d="M42,96 H198" stroke={C.b3} strokeWidth={9} strokeLinecap="round" />
          <path d="M42,96 H198" stroke={C.b2} strokeWidth={4} strokeLinecap="round" />
          <g transform="translate(150 106)">
            <path d="M-16,-22 H16 L12,10 H-12 Z" fill="#d9604c" stroke="#8c2e22" strokeWidth={2.8} strokeLinejoin="round" />
            <path d="M-16,-22 C-12,-34 12,-34 16,-22" fill="none" stroke="#8c2e22" strokeWidth={2.6} />
            <ellipse cx={0} cy={-22} rx={16} ry={4} fill="#e8866f" stroke="#8c2e22" strokeWidth={2.2} />
          </g>
          <g transform="translate(86 120) rotate(-28)">
            <rect x={-3} y={-8} width={6} height={32} rx={3} fill="#3a78c2" stroke="#1e4f92" strokeWidth={2.2} />
            <path d="M-12,-8 H12 L10,-22 H-10 Z" fill="#4f9a52" stroke="#2c5e34" strokeWidth={2.4} strokeLinejoin="round" />
          </g>
        </Mv>
      </>
    ),
  },
  'round-play-part': {
    bg: 'cream',
    draw: () => (
      <>
        <rect x={20} y={32} width={200} height={140} rx={8} fill={C.b2} stroke={C.b5} strokeWidth={3.4} />
        {[56, 80, 104, 128, 152].map((y) => (
          <path key={y} d={`M22,${y} H218`} stroke={C.b5} strokeWidth={2} opacity={0.5} />
        ))}
        <circle cx={68} cy={92} r={30} fill="#f3e6b5" stroke={C.b5} strokeWidth={5} />
        <circle cx={68} cy={92} r={22} fill={C.sky2} stroke="#3a78c2" strokeWidth={3} />
        <path d="M54,80 L70,78" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        <Mv origin={[164, 100]}>
          <g transform="translate(164 100)">
            <circle r={30} fill="none" stroke="#9a6a12" strokeWidth={8} />
            <circle r={30} fill="none" stroke="#e3a52d" strokeWidth={4} />
            {[0, 45, 90, 135].map((a) => (
              <line key={a} x1={0} y1={-40} x2={0} y2={40} stroke="#e3a52d" strokeWidth={5} strokeLinecap="round" transform={`rotate(${a})`} />
            ))}
            {[0, 45, 90, 135].map((a) => (
              <circle key={`k${a}`} cx={0} cy={-42} r={4.4} fill="#9a6a12" transform={`rotate(${a})`} />
            ))}
            <circle r={9} fill="#9a6a12" stroke={C.b5} strokeWidth={2.4} />
          </g>
        </Mv>
      </>
    ),
  },
  'play-board': {
    bg: 'cream',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 100]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={22} y={28 + i * 29} width={196} height={26} rx={5} fill={i % 2 ? C.b2 : '#cf9f68'} stroke={C.b5} strokeWidth={3} />
            <path d={`M34,${36 + i * 29} q40,-5 80,0 t78,2 M40,${46 + i * 29} q50,4 100,0`} stroke={C.b3} strokeWidth={1.8} fill="none" opacity={0.7} strokeLinecap="round" />
            <circle cx={32} cy={41 + i * 29} r={2.6} fill={C.b5} />
            <circle cx={208} cy={41 + i * 29} r={2.6} fill={C.b5} />
          </g>
        ))}
        <ellipse cx={150} cy={74} rx={8} ry={4.4} fill="none" stroke={C.b5} strokeWidth={1.8} opacity={0.7} />
      </Mv>
    ),
  },
  'play-size-compare': {
    bg: 'sky',
    draw: () => (
      <>
        <Ground y={164} fill={C.g1} line={C.g3} />
        <Mv origin={[100, 168]}>
          <rect x={26} y={44} width={9} height={122} rx={3} fill="#3a78c2" stroke="#1e4f92" strokeWidth={2.4} />
          <rect x={84} y={44} width={9} height={122} rx={3} fill="#3a78c2" stroke="#1e4f92" strokeWidth={2.4} />
          <path d="M20,44 H100" stroke="#9a6a12" strokeWidth={9} strokeLinecap="round" />
          <path d="M20,44 H100" stroke="#e3a52d" strokeWidth={4} strokeLinecap="round" />
          <path d="M35,70 H84 M35,100 H84 M35,130 H84" stroke="#e3a52d" strokeWidth={5} strokeLinecap="round" />
          <path d="M26,44 L26,26 L93,26 L93,44" fill="none" stroke="#1e4f92" strokeWidth={3.4} strokeLinejoin="round" />
        </Mv>
        <Mv origin={[176, 168]} cls="mv2">
          <path d="M140,150 L212,150 L176,164 Z" fill="#d9604c" stroke="#8c2e22" strokeWidth={2.6} strokeLinejoin="round" opacity={0} />
          <g transform="rotate(-9 166 142)">
            <rect x={122} y={134} width={88} height={11} rx={5} fill="#e3a52d" stroke="#9a6a12" strokeWidth={3} />
            <path d="M154,145 L166,168 L178,145 Z" fill="#3a78c2" stroke="#1e4f92" strokeWidth={3} strokeLinejoin="round" />
            <rect x={128} y={120} width={6} height={14} rx={2} fill="#9a6a12" />
            <rect x={198} y={120} width={6} height={14} rx={2} fill="#9a6a12" />
          </g>
        </Mv>
      </>
    ),
  },
};

import { C, Flower, Mv, Pebble, Thick, Union, type Art } from './kit';

/** Formen, Linien, Muster: gezeichnete Beispiele, die zeigen, dass viele reale Dinge passen können. */

export const shapesArt: Record<string, Art> = {
  'round-thing': {
    bg: 'cream',
    draw: () => (
      <>
        <circle cx={120} cy={100} r={78} fill="none" stroke={C.y2} strokeWidth={3} strokeDasharray="3 9" strokeLinecap="round" opacity={0.7} />
        <Mv origin={[120, 100]}>
          {/* Ball */}
          <g transform="translate(78 78)">
            <circle r={26} fill={C.r2} stroke={C.r3} strokeWidth={3} />
            <path d="M-24,-8 Q0,-16 24,-8 M-24,8 Q0,16 24,8" stroke="#fff" strokeWidth={5} fill="none" opacity={0.85} />
            <ellipse cx={-9} cy={-12} rx={8} ry={5} fill="#fff" opacity={0.4} />
          </g>
          {/* Rad */}
          <g transform="translate(168 84)">
            <circle r={30} fill="none" stroke={C.b5} strokeWidth={9} />
            <circle r={30} fill="none" stroke={C.b2} strokeWidth={5} />
            {[0, 45, 90, 135].map((a) => (
              <line key={a} x1={0} y1={-26} x2={0} y2={26} stroke={C.b3} strokeWidth={4} strokeLinecap="round" transform={`rotate(${a})`} />
            ))}
            <circle r={7} fill={C.b3} stroke={C.b5} strokeWidth={2.4} />
          </g>
          {/* Sonne / Blütenmitte */}
          <g transform="translate(122 142)">
            <circle r={24} fill={C.y2} stroke={C.y3} strokeWidth={3} />
            <circle r={13} fill={C.b3} stroke={C.b5} strokeWidth={2.4} />
            <circle cx={-8} cy={-9} r={6} fill="#fff" opacity={0.3} />
          </g>
        </Mv>
      </>
    ),
  },
  'long-thing': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Thick d="M24,62 Q80,48 214,66" w={11} fill={C.b3} line={C.b5} />
        <path d="M70,54 Q74,44 82,42" stroke={C.b5} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M24,70 Q80,56 212,72" stroke={C.b1} strokeWidth={2} fill="none" opacity={0.7} />
        <path d="M24,106 C80,86 150,126 216,100 C150,114 90,98 24,112 Z" fill={C.g2} stroke={C.g5} strokeWidth={3} strokeLinejoin="round" />
        <path d="M34,108 C90,94 150,118 206,102" stroke={C.g1} strokeWidth={2} fill="none" />
        <rect x={24} y={134} width={192} height={24} rx={5} fill={C.b2} stroke={C.b5} strokeWidth={3} />
        <path d="M32,142 H208 M32,150 H208" stroke={C.b3} strokeWidth={2} opacity={0.7} />
        <circle cx={40} cy={146} r={2.6} fill={C.b5} />
        <circle cx={200} cy={146} r={2.6} fill={C.b5} />
      </Mv>
    ),
  },
  'straight-line': {
    bg: 'cream',
    draw: () => (
      <>
        <path className="draw" pathLength={1} d="M30,54 L210,54" stroke={C.r2} strokeWidth={8} strokeLinecap="round" fill="none" />
        <circle cx={30} cy={54} r={6} fill={C.r3} />
        <circle cx={210} cy={54} r={6} fill={C.r3} />
        <g>
          {[40, 68, 96, 124, 152, 180].map((x) => (
            <path key={x} d={`M${x},152 L${x},104 L${x + 10},96 L${x + 20},104 L${x + 20},152 Z`} fill={C.b1} stroke={C.b5} strokeWidth={2.6} strokeLinejoin="round" />
          ))}
          <rect x={28} y={112} width={176} height={9} rx={2.4} fill={C.b2} stroke={C.b5} strokeWidth={2.4} />
          <rect x={28} y={134} width={176} height={9} rx={2.4} fill={C.b2} stroke={C.b5} strokeWidth={2.4} />
        </g>
        <path d="M24,160 H216" stroke={C.g4} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
      </>
    ),
  },
  'curved-line': {
    bg: 'cream',
    draw: () => (
      <>
        <path className="draw" pathLength={1} d="M26,70 C56,20 90,20 120,70 C150,120 184,120 214,70" stroke={C.r2} strokeWidth={8} strokeLinecap="round" fill="none" />
        <g fill="none" strokeWidth={7} strokeLinecap="round">
          <path d="M44,176 C44,120 196,120 196,176" stroke={C.r2} />
          <path d="M56,176 C56,132 184,132 184,176" stroke={C.y2} />
          <path d="M68,176 C68,144 172,144 172,176" stroke={C.g3} />
          <path d="M80,176 C80,156 160,156 160,176" stroke={C.sky3} />
        </g>
      </>
    ),
  },
  'repeating-pattern': {
    bg: 'cream',
    draw: () => {
      const stripes = [];
      for (let i = 0; i < 8; i++) stripes.push(<rect key={i} x={32 + i * 22} y={26} width={11} height={42} fill={i % 2 ? C.sky2 : C.sky3} />);
      const bricks = [];
      for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) bricks.push(<rect key={`${r}-${i}`} x={32 + i * 30 + (r % 2 ? -15 : 0)} y={82 + r * 16} width={28} height={14} rx={2} fill={C.r1} stroke={C.r3} strokeWidth={1.8} />);
      const dots = [];
      for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) dots.push(<circle key={`${r}-${i}`} cx={43 + i * 22 + (r % 2 ? 11 : 0)} cy={142 + r * 20} r={7} fill={r % 2 ? C.y2 : C.g3} stroke={C.ink} strokeWidth={1.6} />);
      return (
        <Mv origin={[120, 100]}>
          <clipPath id="il-pat-clip">
            <rect x={32} y={26} width={176} height={42} rx={8} />
          </clipPath>
          <g clipPath="url(#il-pat-clip)">{stripes}</g>
          <rect x={32} y={26} width={176} height={42} rx={8} fill="none" stroke={C.ink} strokeWidth={2.6} />
          <clipPath id="il-pat-clip2">
            <rect x={32} y={82} width={176} height={48} rx={8} />
          </clipPath>
          <g clipPath="url(#il-pat-clip2)">{bricks}</g>
          <rect x={32} y={82} width={176} height={48} rx={8} fill="none" stroke={C.ink} strokeWidth={2.6} />
          <rect x={32} y={136} width={176} height={46} rx={8} fill="#fffaf0" stroke={C.ink} strokeWidth={2.6} />
          {dots}
        </Mv>
      );
    },
  },
  'two-colors': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Flower x={66} y={94} r={32} petals={10} petal={C.y1} edge={C.y3} center={C.b3} centerEdge={C.b5} />
        <g transform="translate(150 66)">
          <clipPath id="il-two-ball">
            <circle r={28} />
          </clipPath>
          <circle r={28} fill={C.sky3} />
          <g clipPath="url(#il-two-ball)">
            <rect x={-30} y={-30} width={60} height={30} fill={C.y2} />
          </g>
          <circle r={28} fill="none" stroke={C.ink} strokeWidth={3} />
          <ellipse cx={-10} cy={-12} rx={8} ry={5} fill="#fff" opacity={0.4} />
        </g>
        <g transform="translate(150 140)">
          <rect x={-34} y={-24} width={68} height={48} rx={10} fill="#fff" stroke={C.ink} strokeWidth={3} />
          <rect x={-28} y={-18} width={56} height={36} rx={6} fill="#3a78c2" />
          <path d="M-18,0 H12 M4,-8 L14,0 L4,8" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </Mv>
    ),
  },
  'light-dark': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 100]}>
        <rect x={22} y={34} width={94} height={128} rx={16} fill="#f6efd8" stroke={C.ink} strokeWidth={3} />
        <rect x={124} y={34} width={94} height={128} rx={16} fill="#4b4a47" stroke={C.ink} strokeWidth={3} />
        <circle cx={44} cy={58} r={9} fill={C.y1} stroke={C.y3} strokeWidth={2.2} />
        <Pebble x={69} y={118} rx={26} ry={19} fill="#ece6d6" dark={C.s3} light="#fff" />
        <Pebble x={171} y={118} rx={26} ry={19} fill="#3a3936" dark="#1d1c1a" light="#6a6863" />
        <circle cx={196} cy={58} r={9} fill="#34404f" stroke="#202833" strokeWidth={2.2} />
        <path d="M193,55 q3,-3 6,0" stroke="#7a8aa0" strokeWidth={1.6} fill="none" />
      </Mv>
    ),
  },
  'tall-low': {
    bg: 'sky',
    draw: () => (
      <>
        <path d="M0,160 C60,152 180,152 240,160 L240,200 L0,200 Z" fill={C.g2} />
        <Mv origin={[78, 166]}>
          <path d="M70,170 C72,130 70,92 68,64" stroke={C.b5} strokeWidth={18} fill="none" strokeLinecap="butt" />
          <path d="M70,170 C72,130 70,92 68,64" stroke={C.b3} strokeWidth={12} fill="none" strokeLinecap="butt" />
          <Union fill={C.g2} line={C.g5} w={5}>
            <circle cx={70} cy={40} r={28} />
            <circle cx={44} cy={66} r={21} />
            <circle cx={96} cy={66} r={21} />
            <circle cx={70} cy={76} r={21} />
          </Union>
          <circle cx={58} cy={30} r={11} fill={C.g1} opacity={0.5} />
          <circle cx={36} cy={60} r={7} fill={C.g1} opacity={0.4} />
        </Mv>
        <Mv origin={[170, 166]} cls="mv2">
          <Union fill={C.g3} line={C.g5} w={4.4}>
            <circle cx={168} cy={148} r={14} />
            <circle cx={150} cy={152} r={11} />
            <circle cx={188} cy={152} r={11} />
          </Union>
          <circle cx={163} cy={143} r={6} fill={C.g1} opacity={0.5} />
        </Mv>
        <path d="M204,166 q-2,-12 4,-20 M210,166 q0,-10 8,-14 M198,166 q-4,-8 -2,-16" stroke={C.g4} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M110,40 H124 M110,166 H124 M117,40 V166" stroke={C.inkSoft} strokeWidth={0} />
      </>
    ),
  },
};


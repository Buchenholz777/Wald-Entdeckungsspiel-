import type { ReactNode } from 'react';
import type { Environment, Season } from '../domain/types';
import { C, Cloud, Flower, GrassBlades, Leaf, LEAF_GREEN, LEAF_ORANGE, LEAF_YELLOW, Sun, Union } from './kit';

/** Kleine Szenen für Ortskacheln, Kopfbild und Jahreszeiten. Dekorativ, deshalb ohne Bildbeschreibung. */

function Tile({ bg, children }: { bg: [string, string]; children: ReactNode }) {
  const id = `sc-${bg[0].slice(1)}${bg[1].slice(1)}`;
  return (
    <svg viewBox="0 0 120 90" className="scene" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
      </defs>
      <rect width="120" height="90" fill={`url(#${id})`} />
      {children}
    </svg>
  );
}

const Fir = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-3} y={-6} width={6} height={10} fill={C.b3} />
    <path d="M0,-52 L-14,-26 H14 Z" fill={C.g4} stroke={C.g5} strokeWidth={1.6} strokeLinejoin="round" />
    <path d="M0,-40 L-18,-12 H18 Z" fill={C.g3} stroke={C.g5} strokeWidth={1.6} strokeLinejoin="round" />
    <path d="M0,-26 L-22,0 H22 Z" fill={C.g4} stroke={C.g5} strokeWidth={1.6} strokeLinejoin="round" />
  </g>
);

const Round = ({ x, y, s = 1, fill = C.g2 }: { x: number; y: number; s?: number; fill?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-3} y={-22} width={6} height={26} rx={2} fill={C.b3} stroke={C.b5} strokeWidth={1.4} />
    <Union fill={fill} line={C.g5} w={2.8}>
      <circle cx={0} cy={-36} r={16} />
      <circle cx={-13} cy={-26} r={11} />
      <circle cx={13} cy={-26} r={11} />
    </Union>
    <circle cx={-5} cy={-42} r={7} fill={C.g1} opacity={0.5} />
  </g>
);

export const envScenes: Record<Environment, () => ReactNode> = {
  forest: () => (
    <Tile bg={['#e6f2d3', '#cfe5b0']}>
      <path d="M0,70 C30,62 90,62 120,70 V90 H0 Z" fill={C.g2} />
      <Fir x={26} y={72} s={0.8} />
      <Fir x={92} y={72} s={0.9} />
      <Round x={60} y={74} s={0.95} />
      <path d="M44,84 q6,-3 12,0 M76,82 q5,-2 10,0" stroke={C.g5} strokeWidth={1.6} fill="none" opacity={0.5} />
    </Tile>
  ),
  park: () => (
    <Tile bg={['#e4f1fa', '#cde6f3']}>
      <Sun x={98} y={20} r={8} />
      <path d="M0,66 C30,56 90,58 120,66 V90 H0 Z" fill={C.g2} />
      <path d="M34,90 C44,76 70,74 80,66 L92,66 C82,76 62,82 56,90 Z" fill={C.b1} stroke={C.b2} strokeWidth={1.4} />
      <Round x={28} y={72} s={0.8} />
      <g transform="translate(86 70)">
        <rect x={-18} y={-12} width={36} height={4} rx={1.5} fill={C.b3} stroke={C.b5} strokeWidth={1.2} />
        <rect x={-18} y={-22} width={36} height={4} rx={1.5} fill={C.b3} stroke={C.b5} strokeWidth={1.2} />
        <path d="M-14,-8 V4 M14,-8 V4" stroke={C.s4} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </Tile>
  ),
  city: () => (
    <Tile bg={['#e8f1f8', '#d3e4f0']}>
      {[
        [8, 34, 30, '#e8c9a8'],
        [40, 24, 34, '#d99a80'],
        [76, 38, 34, '#e9d8a6'],
      ].map(([x, y, w, f], i) => (
        <g key={i}>
          <path d={`M${x},${68} V${y} L${(x as number) + (w as number) / 2},${(y as number) - 12} L${(x as number) + (w as number)},${y} V68 Z`} fill={f as string} stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
          <rect x={(x as number) + 6} y={(y as number) + 8} width={7} height={8} rx={1.2} fill="#fff" stroke={C.ink} strokeWidth={1.2} />
          <rect x={(x as number) + (w as number) - 13} y={(y as number) + 8} width={7} height={8} rx={1.2} fill="#fff" stroke={C.ink} strokeWidth={1.2} />
          <rect x={(x as number) + (w as number) / 2 - 4} y={52} width={8} height={16} rx={1.6} fill={C.r2} stroke={C.ink} strokeWidth={1.2} />
        </g>
      ))}
      <rect x={0} y={68} width={120} height={22} fill="#cfc9bd" />
      <path d="M0,68 H120" stroke={C.s3} strokeWidth={2} />
      <path d="M0,80 H120" stroke="#fff" strokeWidth={2} strokeDasharray="8 8" opacity={0.8} />
    </Tile>
  ),
  beach: () => (
    <Tile bg={['#e1f2f5', '#c3e3ec']}>
      <Sun x={96} y={18} r={8} />
      <path d="M0,36 H120 V50 q-10,5 -20,0 t-20,0 t-20,0 t-20,0 t-20,0 t-20,0 Z" fill={C.w2} />
      <path d="M0,50 q10,-5 20,0 t20,0 t20,0 t20,0 t20,0 t20,0" stroke="#fff" strokeWidth={2.4} fill="none" />
      <path d="M0,56 C40,50 80,58 120,52 V90 H0 Z" fill={C.sand2} />
      <path d="M34,76 C40,64 56,64 62,76 Z M48,76 L48,66 M40,76 L42,67 M56,76 L54,67" fill="#f6ddc6" stroke="#9b6a4f" strokeWidth={1.4} strokeLinejoin="round" />
      <circle cx={88} cy={78} r={4} fill={C.s2} stroke={C.s4} strokeWidth={1.4} />
    </Tile>
  ),
  meadow: () => (
    <Tile bg={['#eaf5dd', '#d6ebbb']}>
      <path d="M0,58 C30,50 90,52 120,58 V90 H0 Z" fill={C.g2} />
      <GrassBlades x={22} y={80} count={5} h={22} spread={18} />
      <GrassBlades x={98} y={82} count={5} h={22} spread={18} />
      <path d="M40,82 V62 M64,84 V56 M84,80 V64" stroke={C.g5} strokeWidth={2} />
      <Flower x={40} y={58} r={8} petals={7} petal="#fff" />
      <Flower x={64} y={50} r={9} petals={8} petal={C.y1} edge={C.y3} center={C.b3} centerEdge={C.b5} />
      <Flower x={84} y={60} r={7} petals={7} petal={C.r1} edge={C.r3} />
    </Tile>
  ),
  garden: () => (
    <Tile bg={['#fdf1e0', '#f7e1c2']}>
      <path d="M0,60 C30,54 90,54 120,60 V90 H0 Z" fill={C.g2} />
      {[10, 28, 46, 64, 82, 100].map((x) => (
        <path key={x} d={`M${x - 5},62 V32 L${x},27 L${x + 5},32 V62 Z`} fill="#f0e3c4" stroke={C.b5} strokeWidth={1.4} strokeLinejoin="round" />
      ))}
      <rect x={4} y={38} width={112} height={5} rx={1.4} fill={C.b2} stroke={C.b5} strokeWidth={1.2} />
      <rect x={4} y={52} width={112} height={5} rx={1.4} fill={C.b2} stroke={C.b5} strokeWidth={1.2} />
      <path d="M30,84 V70 M60,84 V66 M90,84 V70" stroke={C.g5} strokeWidth={2} />
      <Flower x={30} y={68} r={7} petals={6} petal={C.r1} edge={C.r3} center={C.y2} centerEdge={C.y3} />
      <Flower x={60} y={64} r={8} petals={9} petal={C.y1} edge={C.y3} center={C.b3} centerEdge={C.b5} />
      <Flower x={90} y={68} r={7} petals={6} petal="#fff" />
    </Tile>
  ),
  playground: () => (
    <Tile bg={['#e4f1fa', '#cde6f3']}>
      <path d="M0,66 C30,58 90,58 120,66 V90 H0 Z" fill={C.g1} />
      <rect x={14} y={30} width={4} height={40} rx={1.4} fill="#3a78c2" />
      <rect x={34} y={30} width={4} height={40} rx={1.4} fill="#3a78c2" />
      <rect x={10} y={29} width={32} height={5} rx={1.6} fill="#e3a52d" stroke="#9a6a12" strokeWidth={1.2} />
      <path d="M38,32 C56,34 66,52 78,70 H88 C74,46 58,26 38,26 Z" fill="#e3a52d" stroke="#9a6a12" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M92,70 L102,26 M112,70 L102,26" stroke="#1e4f92" strokeWidth={3} strokeLinecap="round" />
      <path d="M97,28 L96,52 M107,28 L108,52" stroke={C.s4} strokeWidth={1.4} />
      <rect x={93} y={51} width={18} height={4} rx={2} fill="#d9604c" stroke="#8c2e22" strokeWidth={1.2} />
    </Tile>
  ),
  mountain: () => (
    <Tile bg={['#e6f1fa', '#d3e6f3']}>
      <Sun x={96} y={18} r={8} />
      <path d="M0,70 L30,34 L48,52 L66,24 L96,62 L112,46 L120,56 V90 H0 Z" fill="#8aa0b8" stroke="#5f7893" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M66,24 L76,40 L68,36 L62,42 L56,36 Z M30,34 L36,43 L30,40 L26,44 Z" fill="#fff" />
      <path d="M0,74 C30,66 70,70 120,66 V90 H0 Z" fill={C.g2} />
      <Fir x={20} y={84} s={0.5} />
      <Fir x={100} y={84} s={0.5} />
    </Tile>
  ),
  water: () => (
    <Tile bg={['#e3f3f6', '#c9e6ee']}>
      <path d="M0,40 C30,34 90,34 120,40 V90 H0 Z" fill={C.w2} />
      <path d="M0,50 q8,-4 16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0 M0,64 q10,-4 20,0 t20,0 t20,0 t20,0 t20,0 t20,0" stroke="#fff" strokeWidth={2} fill="none" opacity={0.85} />
      <path d="M0,40 C30,34 90,34 120,40 V32 C90,26 30,26 0,32 Z" fill={C.g2} />
      {[88, 98, 108].map((x, i) => (
        <g key={x}>
          <path d={`M${x},58 C${x},44 ${x + 2},34 ${x + 2},${24 + i * 3}`} stroke={C.g5} strokeWidth={2} fill="none" />
          <ellipse cx={x + 2} cy={20 + i * 3} rx={2.4} ry={7} fill="#8a6a3e" stroke="#4d3320" strokeWidth={1} />
        </g>
      ))}
    </Tile>
  ),
};

/** Kopfbild der Startseite: sanfte Hügel, ein Baum, fallende Blätter, eine kleine Sonne. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 240 110" className="hero-art" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf3d8" />
          <stop offset="1" stopColor="#f2e8c3" />
        </linearGradient>
      </defs>
      <rect width="240" height="110" rx="24" fill="url(#hero-sky)" />
      <Sun x={196} y={32} r={13} />
      <Cloud x={52} y={30} s={0.7} />
      <path d="M0,86 C40,64 90,66 130,80 C170,66 210,66 240,80 V110 H0 Z" fill={C.g1} />
      <path d="M0,96 C50,78 100,84 150,94 C190,82 220,84 240,92 V110 H0 Z" fill={C.g2} />
      <g transform="translate(60 98)">
        <rect x={-4} y={-30} width={8} height={32} rx={3} fill={C.b3} stroke={C.b5} strokeWidth={2} />
        <Union fill={C.g2} line={C.g5} w={4}>
          <circle cx={0} cy={-48} r={20} />
          <circle cx={-16} cy={-36} r={14} />
          <circle cx={16} cy={-36} r={14} />
        </Union>
        <circle cx={-6} cy={-54} r={9} fill={C.g1} opacity={0.5} />
      </g>
      <Leaf kind="maple" x={130} y={44} rot={-24} s={0.32} colors={LEAF_ORANGE} veins={false} />
      <Leaf kind="ovate" x={158} y={66} rot={30} s={0.3} colors={LEAF_YELLOW} />
      <Leaf kind="round" x={104} y={72} rot={-10} s={0.26} colors={LEAF_GREEN} />
      <GrassBlades x={190} y={104} count={6} h={24} spread={30} />
    </svg>
  );
}

/** Kleine Jahreszeit-Symbole. */
export function SeasonGlyph({ season }: { season: Season }) {
  switch (season) {
    case 'spring':
      return (
        <svg viewBox="0 0 24 24" className="glyph" aria-hidden="true" focusable="false">
          <path d="M12 21 V11" stroke={C.g4} strokeWidth="2" strokeLinecap="round" />
          <path d="M12 14 C7 14 5 11 5 8 C9 8 12 10 12 14 Z" fill={C.g2} stroke={C.g5} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M12 11 C16 11 19 8 19 5 C15 5 12 7 12 11 Z" fill={C.g1} stroke={C.g5} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case 'summer':
      return (
        <svg viewBox="0 0 24 24" className="glyph" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="5" fill={C.y1} stroke={C.y3} strokeWidth="1.6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.6" x2="12" y2="5" stroke={C.y3} strokeWidth="1.8" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />
          ))}
        </svg>
      );
    case 'autumn':
      return (
        <svg viewBox="0 0 24 24" className="glyph" aria-hidden="true" focusable="false">
          <path d="M12 3 L14 8 L19 7 L17 12 L21 15 L15 16 L13 21 H11 L9 16 L3 15 L7 12 L5 7 L10 8 Z" fill={C.o1} stroke="#8f4a14" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M12 21 V12" stroke="#8f4a14" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'winter':
      return (
        <svg viewBox="0 0 24 24" className="glyph" aria-hidden="true" focusable="false">
          <g stroke="#4f84ad" strokeWidth="1.8" strokeLinecap="round" fill="none">
            {[0, 60, 120].map((a) => (
              <g key={a} transform={`rotate(${a} 12 12)`}>
                <path d="M12 3 V21 M9.5 5.5 L12 8 L14.5 5.5 M9.5 18.5 L12 16 L14.5 18.5" />
              </g>
            ))}
          </g>
        </svg>
      );
  }
}

/** Kleines Markenzeichen: ein Blatt in einem Kreis. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="19" fill={C.g1} stroke={C.g5} strokeWidth="2" />
      <path d="M20 8 C28 14 30 24 22 31 C14 24 12 14 20 8 Z" fill={C.g3} stroke={C.g5} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 12 V32" stroke={C.g1} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

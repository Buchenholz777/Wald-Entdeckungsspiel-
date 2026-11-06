import type { ReactElement } from 'react';
import { C, LEAF_GREEN, Leaf, Mv, Pebble, Plastic, Speckle, Union, det, shade, type Art } from './kit';
import { natureArt } from './nature';
import { Scallop } from './shore';

/** Weitere konkrete Funde (Spielkonzept-Vorgabe): gezackte Blätter, Fruchthüllen, Ahornfrüchte, Schalen, Steine, Abdrücke, Flechten. */

function MapleSeed({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const wing = 'M0,0 C-10,-24 -9,-60 6,-82 C22,-62 22,-26 10,0 Z';
  const veins = 'M3,-6 C0,-30 2,-56 6,-76 M5,-10 C-2,-26 -4,-44 -4,-58 M7,-10 C12,-28 14,-48 14,-62';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g transform="rotate(-24)">
        <path d={wing} fill="#d9bb7c" stroke="#8a6a34" strokeWidth={1.8} strokeLinejoin="round" />
        <path d={wing} fill="#fff" opacity={0.12} />
        <Speckle d={wing} opacity={0.2} />
        <path d={veins} stroke="#a47e42" strokeWidth={1.2} fill="none" opacity={0.75} strokeLinecap="round" />
      </g>
      <g transform="rotate(24)">
        <path d={wing} fill="#cfae6c" stroke="#8a6a34" strokeWidth={1.8} strokeLinejoin="round" />
        <Speckle d={wing} opacity={0.2} />
        <path d={veins} stroke="#a47e42" strokeWidth={1.2} fill="none" opacity={0.75} strokeLinecap="round" />
      </g>
      <ellipse cx={-6} cy={4} rx={9} ry={11} fill="#8a6a3a" stroke="#4d3a1c" strokeWidth={1.8} />
      <ellipse cx={7} cy={4} rx={9} ry={11} fill="#7d5f32" stroke="#4d3a1c" strokeWidth={1.8} />
      <Plastic d="M-15,4 a9,11 0 1,0 18,0 a9,11 0 1,0 -18,0" hi={0.4} lo={0.3} />
      <Plastic d="M-2,4 a9,11 0 1,0 18,0 a9,11 0 1,0 -18,0" hi={0.4} lo={0.3} />
    </g>
  );
}

function Mussel({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const shell = 'M-52,2 C-44,-24 40,-28 56,0 C42,26 -42,28 -52,2 Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={shell} fill="#5f7096" stroke="#2f3b57" strokeWidth={2} strokeLinejoin="round" />
      <Plastic d={shell} hi={0.5} lo={0.35} speck={0.1} />
      {[-34, -20, -6, 8, 22, 36].map((px) => (
        <path key={px} d={`M${px},-17 Q${px + 6},2 ${px},19`} stroke="#2f3b57" strokeWidth={1.4} fill="none" opacity={0.5} />
      ))}
      <path d="M-40,-4 C-14,-17 20,-17 44,-4" stroke="#b6c3df" strokeWidth={4} fill="none" opacity={0.55} strokeLinecap="round" />
      <path d="M-52,2 C-56,6 -58,10 -56,14" stroke="#2f3b57" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

function ShoeSole({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  const fore = 'M-26,-62 C-34,-40 -30,-12 -16,-4 C0,2 20,-2 26,-18 C32,-40 26,-66 0,-68 C-12,-68 -22,-66 -26,-62 Z';
  const heel = 'M-18,14 C-22,30 -18,48 0,50 C18,48 22,30 18,14 C10,8 -10,8 -18,14 Z';
  const wave = (y0: number) => `M-30,${y0} q7.5,-6 15,0 t15,0 t15,0 t15,0`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g fill="#f7e9c7" transform="translate(1.8 2.4)">
        <path d={fore} />
        <path d={heel} />
      </g>
      <g fill="#c4a062" stroke="#8a6a32" strokeWidth={2.2} strokeLinejoin="round">
        <path d={fore} />
        <path d={heel} />
      </g>
      <clipPath id="il-sole-fore">
        <path d={fore} />
      </clipPath>
      <clipPath id="il-sole-heel">
        <path d={heel} />
      </clipPath>
      <g clipPath="url(#il-sole-fore)" stroke="#8a6a32" strokeWidth={2.4} fill="none" opacity={0.75} strokeLinecap="round">
        {[-54, -42, -30, -18, -6].map((yy) => (
          <path key={yy} d={wave(yy)} />
        ))}
      </g>
      <g clipPath="url(#il-sole-heel)" stroke="#8a6a32" strokeWidth={2.4} fill="none" opacity={0.75}>
        <ellipse cx={0} cy={30} rx={7} ry={7} />
        <ellipse cx={0} cy={30} rx={13} ry={14} />
      </g>
      <Plastic d={fore} hi={0.2} lo={0.2} speck={0.15} />
      <Plastic d={heel} hi={0.2} lo={0.2} speck={0.15} />
    </g>
  );
}

function LichenPatch({ x, y, r, base, edge, seed }: { x: number; y: number; r: number; base: string; edge: string; seed: number }) {
  const rnd = det(seed);
  const blobs: ReactElement[] = [];
  const dots: ReactElement[] = [];
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * r * 0.7;
    blobs.push(<circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={r * (0.35 + rnd() * 0.3)} />);
  }
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * r * 0.8;
    dots.push(<circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={1.6 + rnd() * 1.2} fill={shade(edge, -0.2)} opacity={0.8} />);
  }
  return (
    <g>
      <Union fill={base} line={edge} w={2.4}>
        {blobs}
      </Union>
      <g fill="#fff" opacity={0.18}>
        <circle cx={x - r * 0.2} cy={y - r * 0.25} r={r * 0.35} />
      </g>
      {dots}
    </g>
  );
}

export const findsArt2: Record<string, Art> = {
  'serrated-leaf': {
    bg: 'green',
    draw: () => (
      <Mv origin={[120, 100]}>
        <Leaf kind="serrated" x={118} y={98} rot={-14} s={1.5} colors={{ ...LEAF_GREEN, fill: '#6aa04e', vein: '#d3e8a8' }} veinW={2} />
      </Mv>
    ),
  },
  'chestnut-husk': {
    bg: 'cream',
    draw: () => {
      const spikesAlong = (cx: number, cy: number, rx: number, ry: number, from: number, to: number, n: number, len: number): ReactElement[] => {
        const out: ReactElement[] = [];
        for (let i = 0; i < n; i++) {
          const th = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180;
          const x1 = cx + Math.cos(th) * rx;
          const y1 = cy + Math.sin(th) * ry;
          const x2 = cx + Math.cos(th) * (rx + len);
          const y2 = cy + Math.sin(th) * (ry + len);
          out.push(<path key={`${cx}-${i}`} d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`} stroke="#4f7a3a" strokeWidth={2.6} strokeLinecap="round" />);
        }
        return out;
      };
      const valve = 'M-48,28 C-52,-22 52,-22 48,28 C22,12 -22,12 -48,28 Z';
      const cupBack = 'M-54,0 C-30,-16 30,-16 54,0 C30,12 -30,12 -54,0 Z';
      const cupFront = 'M-54,0 C-30,12 30,12 54,0 C56,46 -56,46 -54,0 Z';
      return (
        <Mv origin={[120, 110]}>
          <g transform="translate(112 112)">
            <g transform="translate(-34 -50) rotate(-42)">
              {spikesAlong(0, 28, 49, 36, 194, 346, 15, 9)}
              <path d={valve} fill="#7fae5a" stroke="#4f7a3a" strokeWidth={2} strokeLinejoin="round" />
              <Plastic d={valve} hi={0.4} lo={0.3} speck={0.2} />
              <path d="M-40,26 C-20,12 20,12 40,26" stroke="#efe9d2" strokeWidth={6} fill="none" opacity={0.9} strokeLinecap="round" />
            </g>
            {spikesAlong(0, 4, 56, 44, 14, 166, 22, 11)}
            <path d={cupBack} fill="#efe9d2" stroke="#6d8a4e" strokeWidth={2} strokeLinejoin="round" />
            <ellipse cx={4} cy={-6} rx={25} ry={21} fill="#8a3f1d" stroke="#4a1f0c" strokeWidth={1.8} />
            <Plastic d="M-21,-6 a25,21 0 1,0 50,0 a25,21 0 1,0 -50,0" hi={0.55} lo={0.4} speck={0.12} />
            <ellipse cx={-6} cy={-16} rx={9} ry={3.6} fill="#e0a56c" opacity={0.8} />
            <path d={cupFront} fill="#7fae5a" stroke="#4f7a3a" strokeWidth={2} strokeLinejoin="round" />
            <Plastic d={cupFront} hi={0.4} lo={0.34} speck={0.2} />
            <path d="M-48,6 C-24,18 24,18 48,6" stroke="#efe9d2" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
          </g>
        </Mv>
      );
    },
  },
  'maple-seed': {
    bg: 'cream',
    draw: () => (
      <Mv origin={[120, 110]}>
        <MapleSeed x={112} y={146} rot={6} s={1.35} />
      </Mv>
    ),
  },
  'shell-hole': {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 V200 H0 Z" fill={C.sand2} opacity={0.5} />
        <Mv origin={[120, 110]}>
          <Scallop x={120} y={108} s={1.3} rot={-4} fill="#f4e6d2" rib="#d9b79a" edge="#98745a" hole />
        </Mv>
      </>
    ),
  },
  'long-shell': {
    bg: 'sand',
    draw: () => (
      <>
        <path d="M0,150 C60,142 180,142 240,150 V200 H0 Z" fill={C.sand2} opacity={0.5} />
        <Mv origin={[120, 110]}>
          <Mussel x={120} y={104} rot={-14} s={1.75} />
        </Mv>
      </>
    ),
  },
  'striped-stone': {
    bg: 'sand',
    draw: () => (
      <>
        <Pebble x={206} y={150} rx={16} ry={11} fill="#8f8a80" dark="#3a3631" light="#d4cfc4" rot={8} />
        <Mv origin={[120, 120]}>
          <g transform="translate(118 108)">
            <clipPath id="il-stripe-clip">
              <ellipse rx={62} ry={44} />
            </clipPath>
            <ellipse rx={62} ry={44} fill="#52504b" stroke="#2c2a27" strokeWidth={1.8} />
            <g clipPath="url(#il-stripe-clip)">
              <rect x={-90} y={-9} width={180} height={17} fill="#efeae0" transform="rotate(-16)" />
              <rect x={-90} y={-12} width={180} height={3} fill="#bdb8ac" transform="rotate(-16)" opacity={0.7} />
            </g>
            <Plastic d="M-62,0 a62,44 0 1,0 124,0 a62,44 0 1,0 -124,0" hi={0.4} lo={0.4} speck={0.3} />
          </g>
        </Mv>
      </>
    ),
  },
  'shoe-print': {
    bg: 'sand',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 110]}>
        <ShoeSole x={120} y={92} rot={14} s={1.12} />
      </Mv>
    ),
  },
  lichen: {
    bg: 'stone',
    shadow: false,
    draw: () => (
      <Mv origin={[120, 100]}>
        <clipPath id="il-lichen-clip">
          <rect x={14} y={14} width={212} height={172} rx={22} />
        </clipPath>
        <g clipPath="url(#il-lichen-clip)">
          <rect x={14} y={14} width={212} height={172} fill="#9d9a92" />
          <path d="M14,70 C80,50 150,90 226,60 V14 H14 Z" fill="#b6b3aa" opacity={0.7} />
          <path d="M14,150 C70,132 160,170 226,140 V186 H14 Z" fill="#7d7a73" opacity={0.6} />
          <rect x={14} y={14} width={212} height={172} fill="#1e1a14" opacity={0.28} filter="url(#il-speckle)" />
          <LichenPatch x={78} y={78} r={30} base="#c9c76a" edge="#8d8a30" seed={3} />
          <LichenPatch x={160} y={66} r={22} base="#c8cdb0" edge="#8c9478" seed={7} />
          <LichenPatch x={148} y={134} r={34} base="#b4bb55" edge="#757c2a" seed={11} />
          <LichenPatch x={62} y={150} r={20} base="#d9d7c4" edge="#a29f88" seed={19} />
        </g>
        <rect x={14} y={14} width={212} height={172} rx={22} fill="none" stroke="#5f5c55" strokeWidth={2} />
      </Mv>
    ),
  },
  clover: natureArt['low-plant'],
};

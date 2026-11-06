import type { ReactNode } from 'react';
import { shade, useGid, Pebble, type Art } from './kit';
import { blob, Gloss, rng, Shadow, smoothPath, type Pt } from './real-kit';

/* ============================================================================================
   Moos, Flechte, Pilz, Baumpilz, Spinnennetz und Spuren im weichen Boden, naturgetreu gezeichnet.
   Beispiele: Die Spiele suchen allgemein „Moos“, „Flechte“, „Pilz“, „Baumpilz“ usw. Art und Farbe dürfen abweichen.
   Der Baumpilz zeigt Schmetterlings-Tramete-ähnliche Fächer (dünn, in hellen und dunklen Bändern) als Beispiel;
   die Art ist nicht bestimmt, und nichts davon sagt etwas über Essbarkeit.
   ============================================================================================ */

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/* --------------------------------- Moos --------------------------------- */

function MossArt() {
  const r = rng(41);
  const id = useGid('ms');
  const mound = blob(120, 112, 84, 44, 3, 0.07, 22);
  const BANDS = 6;
  const TONES = ['#2f6a2c', '#437f33', '#5e9a3c', '#7bb347'];
  const buckets: string[][] = Array.from({ length: BANDS }, () => ['', '', '', '']);
  const caps: ReactNode[] = [];
  const N = 520;
  for (let i = 0; i < N; i++) {
    // Punkt im Hügel (flache Ellipse), nach oben gewölbt
    const a = r.next() * Math.PI * 2;
    const rad = Math.sqrt(r.next());
    const x = 120 + Math.cos(a) * 82 * rad;
    const y = 112 + Math.sin(a) * 42 * rad;
    const h = Math.sqrt(Math.max(0, 1 - rad * rad)); // Höhe über dem Boden (0 am Rand)
    const band = Math.max(0, Math.min(BANDS - 1, Math.floor(((y - 70) / 90) * BANDS)));
    const lightness = Math.min(3, Math.max(0, Math.floor(h * 2.4 + (x < 120 ? 0.9 : 0) + r.next() * 1.3 - (y > 128 ? 0.8 : 0))));
    const base = y - h * 4;
    // kleine Triebe: drei bis vier kurze, gebogene Blättchen, die nach oben auseinanderstreben
    const n = 3 + Math.floor(r.next() * 2);
    for (let k = 0; k < n; k++) {
      const spread = ((k / (n - 1)) - 0.5) * 2.4 + r.between(-0.3, 0.3);
      const L = 5 + r.next() * 4 + h * 2;
      const ex = x + Math.sin(spread) * L * 0.9;
      const ey = base - Math.cos(spread) * L;
      buckets[band][lightness] += ` M${f(x)},${f(base + 1)} Q${f(x + Math.sin(spread) * L * 0.2)},${f(base - L * 0.6)} ${f(ex)},${f(ey)}`;
    }
  }
  // einzelne Sporenkapseln auf dünnen, rotbraunen Stielen
  for (let i = 0; i < 9; i++) {
    const a = r.next() * Math.PI * 2;
    const rad = Math.sqrt(r.next()) * 0.8;
    const x = 120 + Math.cos(a) * 78 * rad;
    const y = 108 + Math.sin(a) * 36 * rad;
    const L = 20 + r.next() * 10;
    const lean = r.between(-4, 4);
    caps.push(
      <g key={i}>
        <path d={`M${f(x)},${f(y)} Q${f(x + lean * 0.4)},${f(y - L * 0.5)} ${f(x + lean)},${f(y - L)}`} fill="none" stroke="#8a5a2a" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx={x + lean} cy={y - L - 1.8} rx={1.5} ry={2.6} fill="#a8682c" transform={`rotate(${lean * 3} ${x + lean} ${y - L})`} />
      </g>,
    );
  }
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.38" cy="0.28" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#08140a" stopOpacity="0.5" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <path d={mound} />
        </clipPath>
      </defs>
      <ellipse cx={126} cy={136} rx={92} ry={20} fill="#241608" opacity="0.38" filter="url(#nx-b4)" />
      <path d={mound} fill="#244d22" />
      <g clipPath={`url(#${id}c)`}>
        <path d={mound} fill="#16300f" filter="url(#nx-bump-lg)" opacity="0.55" />
      </g>
      {buckets.map((bs, band) =>
        bs.map((d, tone) =>
          d ? (
            <path key={`${band}-${tone}`} d={d} fill="none" stroke={TONES[tone]} strokeWidth={1.25} strokeLinecap="round" />
          ) : null,
        ),
      )}
      {caps}
      <path d={mound} fill={`url(#${id})`} />
    </g>
  );
}

/* --------------------------------- Rinde --------------------------------- */

function BarkPanel({ tone = '#5e5043', id }: { tone?: string; id: string }) {
  const r = rng(77);
  const cracks: string[] = [];
  const ridges: string[] = [];
  for (let i = 0; i < 16; i++) {
    const x0 = 6 + i * 15.5 + r.between(-4, 4);
    let d = `M${f(x0)},-4`;
    let x = x0;
    for (let y = 14; y <= 206; y += 16) {
      x += r.between(-3.6, 3.6);
      d += ` L${f(x)},${y}`;
    }
    cracks.push(d);
    ridges.push(d.replace(/(\d+\.?\d*),/g, (_m, g1) => `${(parseFloat(g1) + 3.4).toFixed(1)},`));
  }
  return (
    <g>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(tone, 0.18)} />
          <stop offset="1" stopColor={shade(tone, -0.3)} />
        </linearGradient>
        <clipPath id={`${id}k`}>
          <rect width="240" height="200" rx="26" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}k)`}>
        <rect width="240" height="200" fill={`url(#${id}g)`} />
        <rect width="240" height="200" fill="#241a12" filter="url(#nx-bump-v)" opacity="0.6" />
        {cracks.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#17100a" strokeOpacity="0.62" strokeWidth={1.5 + (i % 3) * 0.7} strokeLinejoin="round" />
        ))}
        {ridges.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#a08c76" strokeOpacity="0.2" strokeWidth="1.4" strokeLinejoin="round" />
        ))}
        <rect width="240" height="200" fill="#000" opacity="0.18" />
      </g>
    </g>
  );
}

/* --------------------------------- Flechte (Blattflechte auf Rinde) --------------------------------- */

function lobeShape(cx: number, cy: number, a: number, ri: number, ro: number, half: number, r: ReturnType<typeof rng>): string {
  const p = (ang: number, rad: number): Pt => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
  const pts: Pt[] = [
    p(a - half * 0.55, ri),
    p(a - half * 1.02, (ri + ro) / 2),
    p(a - half * 0.82 + r.between(-0.03, 0.03), ro * 0.97),
    p(a + r.between(-0.04, 0.04), ro * (1.03 + r.next() * 0.04)),
    p(a + half * 0.82 + r.between(-0.03, 0.03), ro * 0.97),
    p(a + half * 1.02, (ri + ro) / 2),
    p(a + half * 0.55, ri),
  ];
  return smoothPath(pts, true, 0.9);
}

function Rosette({ cx, cy, R, seed, tone }: { cx: number; cy: number; R: number; seed: number; tone: [string, string, string] }) {
  const r = rng(seed);
  const rings = 4;
  const lobes: ReactNode[] = [];
  const shadowD = blob(cx, cy, R * 1.02, R * 0.98, seed, 0.06, 20);
  for (let k = 0; k < rings; k++) {
    const ro = R * (1 - k * 0.2);
    const ri = ro * 0.42;
    const n = 11 + k * 2;
    const off = r.next() * Math.PI;
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * Math.PI * 2 + r.between(-0.07, 0.07);
      const half = (Math.PI / n) * 1.28;
      const ron = ro * (0.9 + r.next() * 0.14);
      const d = lobeShape(cx, cy, a, ri, ron, half, r);
      const t = tone[Math.min(2, k > 2 ? 2 : k === 0 ? 0 : 1)];
      lobes.push(
        <g key={`${k}-${i}`}>
          <path d={d} fill="#14100a" opacity="0.4" transform="translate(0.7 1)" />
          <path d={d} fill={shade(t, r.between(-0.08, 0.1))} />
          <path d={d} fill="none" stroke={shade(t, 0.5)} strokeOpacity="0.55" strokeWidth="0.8" strokeLinejoin="round" />
          <path d={`M${f(cx + Math.cos(a) * ri)},${f(cy + Math.sin(a) * ri)} L${f(cx + Math.cos(a) * ron * 0.92)},${f(cy + Math.sin(a) * ron * 0.92)}`} stroke={shade(t, -0.35)} strokeOpacity="0.4" strokeWidth="0.6" />
        </g>,
      );
    }
  }
  const core = blob(cx, cy, R * 0.3, R * 0.28, seed + 3, 0.12, 12);
  return (
    <g>
      <path d={shadowD} fill="#0e0a06" opacity="0.5" filter="url(#nx-b2)" transform="translate(1.5 2.5)" />
      <g filter="url(#nx-bump)">{lobes}</g>
      <path d={core} fill={shade(tone[2], -0.12)} />
      <path d={core} fill="#3a3010" filter="url(#nx-bump-lg)" opacity="0.5" />
      {/* kleine dunkle Fruchtscheibchen in der Mitte */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = r.next() * Math.PI * 2;
        const q = r.next() * R * 0.2;
        return <ellipse key={i} cx={cx + Math.cos(a) * q} cy={cy + Math.sin(a) * q} rx={1.9} ry={1.5} fill="#6a4a22" stroke="#d8d8a8" strokeOpacity="0.6" strokeWidth="0.5" />;
      })}
    </g>
  );
}

function LichenArt() {
  const id = useGid('lc');
  const tone: [string, string, string] = ['#d0d8b4', '#c0c98d', '#a9b36a'];
  return (
    <g>
      <BarkPanel id={id} tone="#5a4c40" />
      <Rosette cx={112} cy={102} R={58} seed={5} tone={tone} />
      <Rosette cx={196} cy={146} R={25} seed={9} tone={['#d6dcc0', '#c8cf9c', '#b4bd78']} />
      <Rosette cx={44} cy={160} R={19} seed={13} tone={['#cfd6b6', '#bfc790', '#a8b268']} />
      {/* feine, krustige Fleckchen */}
      {[[198, 52, 4], [214, 78, 2.6], [30, 42, 3.6], [168, 26, 2.4], [60, 124, 2.4]].map(([x, y, rr], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.8} fill="#b4b88a" opacity="0.8" filter="url(#nx-fuzz)" />
      ))}
    </g>
  );
}

/* --------------------------------- Pilz --------------------------------- */

function MushroomShape({ x, y, s = 1, cap = 58, stem = 70, seed = 2, young = false }: { x: number; y: number; s?: number; cap?: number; stem?: number; seed?: number; young?: boolean }) {
  const id = useGid('mu');
  const r = rng(seed);
  const capH = young ? cap * 0.62 : cap * 0.46;
  const stemTop = -stem + capH * 0.2;
  const stemD = `M${f(-9.5)},${f(stemTop)} Q${f(-11)},${f(-stem * 0.45)} ${f(-14)},-3 Q${f(-15)},4 ${f(-6)},5 Q0,7 ${f(6)},5 Q${f(15)},4 ${f(13)},-3 Q${f(10.5)},${f(-stem * 0.45)} ${f(9.5)},${f(stemTop)} Z`;
  const capTop = young
    ? `M${f(-cap * 0.5)},${f(-stem + capH * 0.2)} C${f(-cap * 0.5)},${f(-stem - capH * 0.9)} ${f(cap * 0.5)},${f(-stem - capH * 0.9)} ${f(cap * 0.5)},${f(-stem + capH * 0.2)} Q0,${f(-stem + capH * 0.55)} ${f(-cap * 0.5)},${f(-stem + capH * 0.2)} Z`
    : `M${f(-cap * 0.5)},${f(-stem + capH * 0.25)} C${f(-cap * 0.56)},${f(-stem - capH * 0.95)} ${f(cap * 0.56)},${f(-stem - capH * 0.95)} ${f(cap * 0.5)},${f(-stem + capH * 0.25)} Q${f(cap * 0.3)},${f(-stem + capH * 0.5)} 0,${f(-stem + capH * 0.42)} Q${f(-cap * 0.3)},${f(-stem + capH * 0.5)} ${f(-cap * 0.5)},${f(-stem + capH * 0.25)} Z`;
  const gillY = -stem + capH * 0.3;
  const fibres: ReactNode[] = [];
  for (let i = 0; i < 46; i++) {
    const a = r.between(-1.55, 1.55);
    const rr = r.between(0.2, 0.98);
    fibres.push(
      <path key={i} d={`M${f(Math.sin(a) * cap * 0.12)},${f(-stem - capH * 0.75)} Q${f(Math.sin(a) * cap * 0.34)},${f(-stem - capH * 0.5)} ${f(Math.sin(a) * cap * 0.5 * rr)},${f(gillY - capH * 0.1 - (1 - Math.abs(Math.sin(a))) * capH * 0.2)}`} fill="none" stroke="#3a1c08" strokeOpacity={0.1 + r.next() * 0.14} strokeWidth={0.6 + r.next() * 0.7} />,
    );
  }
  const gills: ReactNode[] = [];
  if (!young) {
    for (let i = -22; i <= 22; i++) {
      const gx = (i / 22) * cap * 0.46;
      gills.push(<path key={i} d={`M${f(gx * 0.18)},${f(gillY + 1)} L${f(gx)},${f(gillY + 3 - Math.abs(i) * 0.04)}`} stroke={shade('#a8805a', i % 2 ? -0.1 : 0.1)} strokeWidth="0.7" strokeOpacity="0.85" />);
    }
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6eedb" />
          <stop offset="0.55" stopColor="#e2d4b2" />
          <stop offset="1" stopColor="#a8967a" />
        </linearGradient>
        <radialGradient id={`${id}c`} cx="0.4" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#b2703a" />
          <stop offset="0.5" stopColor="#7c4624" />
          <stop offset="1" stopColor="#3e1f0e" />
        </radialGradient>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8a868" stopOpacity="0.7" />
          <stop offset="0.35" stopColor="#d8a868" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}k`}>
          <path d={capTop} />
        </clipPath>
        <clipPath id={`${id}t`}>
          <path d={stemD} />
        </clipPath>
      </defs>
      <ellipse cx={4} cy={4} rx={cap * 0.52} ry={5} fill="#1a0e04" opacity="0.4" filter="url(#nx-b2)" />
      <path d={stemD} fill={`url(#${id}s)`} />
      <g clipPath={`url(#${id}t)`}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${f(-9 + i * 1.6)},${f(stemTop)} L${f(-12 + i * 2.2)},4`} stroke="#8a7650" strokeOpacity={0.12 + (i % 3) * 0.06} strokeWidth="0.6" />
        ))}
        <path d={stemD} fill="#5a4a2a" filter="url(#nx-bump-velvet)" opacity="0.28" />
        <ellipse cx={0} cy={stemTop + 4} rx={14} ry={5} fill="#241608" opacity="0.5" filter="url(#nx-b2)" />
      </g>
      {!young && (
        <g>
          {/* Lamellen unter dem Hut */}
          <path d={`M${f(-cap * 0.5)},${f(gillY - 1)} Q0,${f(gillY + capH * 0.34)} ${f(cap * 0.5)},${f(gillY - 1)} Q0,${f(gillY + capH * 0.05)} ${f(-cap * 0.5)},${f(gillY - 1)} Z`} fill="#c6a47c" />
          {gills}
        </g>
      )}
      <path d={capTop} fill={`url(#${id}c)`} />
      <g clipPath={`url(#${id}k)`}>
        {fibres}
        <path d={capTop} fill="#2a1204" filter="url(#nx-bump)" opacity="0.22" />
        <path d={capTop} fill={`url(#${id}m)`} />
        <ellipse cx={0} cy={gillY} rx={cap * 0.5} ry={capH * 0.2} fill="#14080a" opacity="0.35" filter="url(#nx-b2)" />
      </g>
      <path d={capTop} fill="none" stroke="#2a1204" strokeOpacity="0.5" strokeWidth="0.8" />
      <Gloss cx={-cap * 0.18} cy={-stem - capH * 0.55} rx={cap * 0.2} ry={capH * 0.1} rot={-18} o={0.45} />
    </g>
  );
}

function MushroomArt() {
  const r = rng(6);
  const litter: ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const x = r.between(14, 226);
    const y = r.between(166, 192);
    litter.push(<path key={i} d={blob(x, y, r.between(7, 15), r.between(2.4, 4.4), i + 5, 0.1, 8, r.between(-20, 20))} fill={shade(r.next() > 0.5 ? '#8a6a3a' : '#a07a44', r.between(-0.2, 0.15))} opacity="0.9" />);
  }
  return (
    <g>
      <ellipse cx={118} cy={172} rx={104} ry={20} fill="#5a4426" />
      <ellipse cx={118} cy={172} rx={104} ry={20} fill="#2a1c0a" filter="url(#nx-bump-lg)" opacity="0.5" />
      <ellipse cx={118} cy={166} rx={100} ry={14} fill="#7a5c34" opacity="0.5" filter="url(#nx-b4)" />
      {litter}
      <MushroomShape x={102} y={176} s={1.45} cap={60} stem={62} seed={3} />
      <MushroomShape x={182} y={178} s={1.0} cap={44} stem={38} seed={9} young />
    </g>
  );
}

/* --------------------------------- Baumpilz (Fächer, Beispiel) --------------------------------- */

interface Shelf {
  ax: number;
  ay: number;
  a: number;
  b: number;
  rot: number;
  seed: number;
}

function shelfOutline(s: Shelf, k = 1, grow = 0): string {
  const r = rng(s.seed);
  const ph = r.between(0, 6.28);
  const pts: Pt[] = [];
  // Ansatzkante oben (leicht gebogen), dann der gewellte, halbrunde Außenrand
  const N = 26;
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * Math.PI;
    const wob = 1 + 0.05 * Math.sin(th * 7 + ph) + 0.03 * Math.sin(th * 13 + ph * 2);
    const rr = k * wob;
    pts.push([s.ax + Math.cos(th) * (s.a * rr + grow), s.ay + Math.sin(th) * (s.b * rr + grow * 0.6) * 1]);
  }
  // Rückweg entlang der Ansatzkante
  const back: Pt[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    back.push([s.ax - s.a * k * (1 - t * 2) * 0.99, s.ay - Math.sin(t * Math.PI) * 2.4]);
  }
  const all = [...pts, ...back.slice(1, -1).reverse()];
  // Drehung um den Ansatzpunkt
  const ca = Math.cos((s.rot * Math.PI) / 180);
  const sa = Math.sin((s.rot * Math.PI) / 180);
  const rotated = all.map(([x, y]) => [s.ax + (x - s.ax) * ca - (y - s.ay) * sa, s.ay + (x - s.ax) * sa + (y - s.ay) * ca] as Pt);
  return smoothPath(rotated, true, 0.9);
}

function BracketShelf({ s, zones }: { s: Shelf; zones: { k: number; c: string }[] }) {
  const id = useGid('bk');
  const outer = shelfOutline(s, 1);
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={outer} />
        </clipPath>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0c0804" stopOpacity="0.38" />
        </linearGradient>
      </defs>
      {/* Schatten auf der Rinde */}
      <path d={shelfOutline(s, 1, 0)} transform="translate(2 7)" fill="#0a0604" opacity="0.5" filter="url(#nx-b2)" />
      {/* helle Unterseite (Poren) als schmaler Rand unter dem Fächer */}
      <path d={outer} transform="translate(0 3.2)" fill="#ebe0c4" />
      <path d={outer} transform="translate(0 3.2)" fill="#8a7a58" filter="url(#nx-bump)" opacity="0.4" />
      <path d={outer} transform="translate(0 1.6)" fill="#cbbb96" />
      <g clipPath={`url(#${id}c)`}>
        {zones.map((z, i) => (
          <path key={i} d={shelfOutline(s, z.k)} fill={z.c} />
        ))}
        <path d={outer} fill="#1c120a" filter="url(#nx-bump-velvet)" opacity="0.32" />
        {/* feine Zonenränder */}
        {zones.slice(1).map((z, i) => (
          <path key={i} d={shelfOutline(s, z.k)} fill="none" stroke="#1c120a" strokeOpacity="0.28" strokeWidth="0.7" />
        ))}
        <path d={outer} fill={`url(#${id}l)`} />
      </g>
      <path d={outer} fill="none" stroke="#2a1c10" strokeOpacity="0.45" strokeWidth="0.8" strokeLinejoin="round" />
    </g>
  );
}

function BracketArt() {
  const id = useGid('bf');
  const zonesA = [
    { k: 1, c: '#efe7d3' },
    { k: 0.95, c: '#9a7448' },
    { k: 0.86, c: '#cfae78' },
    { k: 0.76, c: '#7b8890' },
    { k: 0.65, c: '#4b3626' },
    { k: 0.54, c: '#b88a50' },
    { k: 0.42, c: '#8a8f8e' },
    { k: 0.3, c: '#5a4030' },
    { k: 0.16, c: '#cdb98a' },
  ];
  const zonesB = [
    { k: 1, c: '#f1ead8' },
    { k: 0.94, c: '#6e5a48' },
    { k: 0.84, c: '#b99a68' },
    { k: 0.72, c: '#4e3a2a' },
    { k: 0.6, c: '#8c97a0' },
    { k: 0.48, c: '#b07c42' },
    { k: 0.36, c: '#6a4a34' },
    { k: 0.2, c: '#a8a89a' },
  ];
  const shelves: { s: Shelf; z: typeof zonesA }[] = [
    { s: { ax: 100, ay: 38, a: 36, b: 24, rot: -4, seed: 3 }, z: zonesB },
    { s: { ax: 168, ay: 58, a: 40, b: 26, rot: 6, seed: 5 }, z: zonesA },
    { s: { ax: 70, ay: 80, a: 46, b: 30, rot: 3, seed: 7 }, z: zonesA },
    { s: { ax: 150, ay: 102, a: 52, b: 34, rot: -3, seed: 9 }, z: zonesB },
    { s: { ax: 88, ay: 126, a: 54, b: 34, rot: 4, seed: 11 }, z: zonesA },
    { s: { ax: 176, ay: 142, a: 40, b: 26, rot: -6, seed: 13 }, z: zonesB },
  ];
  return (
    <g>
      <BarkPanel id={id} tone="#5c4e42" />
      {shelves.map((sh, i) => (
        <BracketShelf key={i} s={sh.s} zones={sh.z} />
      ))}
    </g>
  );
}

/* --------------------------------- Spinnennetz mit Tau --------------------------------- */

function WebArt() {
  const r = rng(52);
  const cx = 120;
  const cy = 98;
  const R = 82;
  const spokes = 24;
  const ang: number[] = [];
  const rad: number[] = [];
  for (let i = 0; i < spokes; i++) {
    ang.push((i / spokes) * Math.PI * 2 + r.between(-0.06, 0.06));
    rad.push(R * (0.88 + r.next() * 0.16) * (1 + Math.cos(ang[i] - 1.1) * 0.08));
  }
  const px = (i: number, k: number): Pt => [cx + Math.cos(ang[i % spokes]) * k * rad[i % spokes], cy + Math.sin(ang[i % spokes]) * k * rad[i % spokes] * 0.94];
  let spokesD = '';
  for (let i = 0; i < spokes; i++) {
    const p = px(i, 1);
    spokesD += ` M${f(cx)},${f(cy)} L${f(p[0])},${f(p[1])}`;
  }
  // Rahmenfäden
  let frameD = '';
  for (let i = 0; i < spokes; i++) {
    const a = px(i, 1);
    const b = px(i + 1, 1);
    frameD += ` M${f(a[0])},${f(a[1])} Q${f((a[0] + b[0]) / 2 + (cx - (a[0] + b[0]) / 2) * 0.08)},${f((a[1] + b[1]) / 2 + (cy - (a[1] + b[1]) / 2) * 0.08)} ${f(b[0])},${f(b[1])}`;
  }
  // Fangspirale und Tautropfen
  let spiralD = '';
  const drops: ReactNode[] = [];
  const turns = 15;
  for (let t = 0; t < turns; t++) {
    const k = 0.1 + (t / turns) * 0.86;
    for (let i = 0; i < spokes; i++) {
      const kk = k + (i / spokes) * (0.86 / turns);
      const kk2 = k + ((i + 1) / spokes) * (0.86 / turns);
      const a = px(i, kk);
      const b = px(i + 1, kk2);
      const sag = 0.1 + r.next() * 0.05;
      const mx = (a[0] + b[0]) / 2 + (cx - (a[0] + b[0]) / 2) * sag;
      const my = (a[1] + b[1]) / 2 + (cy - (a[1] + b[1]) / 2) * sag + 0.6;
      spiralD += ` M${f(a[0])},${f(a[1])} Q${f(mx)},${f(my)} ${f(b[0])},${f(b[1])}`;
      if (t > 1 && r.next() > 0.46) {
        const rr = 0.9 + r.next() * 1.0;
        drops.push(
          <g key={`${t}-${i}`}>
            <circle cx={a[0]} cy={a[1]} r={rr} fill="#cfe6ee" fillOpacity="0.35" stroke="#eaf6fa" strokeOpacity="0.8" strokeWidth="0.3" />
            <circle cx={a[0] - rr * 0.3} cy={a[1] - rr * 0.3} r={rr * 0.32} fill="#fff" />
          </g>,
        );
      }
    }
  }
  const bokeh: ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    bokeh.push(<circle key={i} cx={r.between(10, 230)} cy={r.between(10, 190)} r={r.between(8, 22)} fill={r.next() > 0.5 ? '#9ac47a' : '#c8d89a'} opacity={r.between(0.08, 0.2)} filter="url(#nx-b4)" />);
  }
  return (
    <g>
      {bokeh}
      {/* zwei Zweige, an denen das Netz hängt */}
      <path d="M-6,34 Q60,26 130,10 T250,-2" fill="none" stroke="#3a281a" strokeWidth="5" strokeLinecap="round" />
      <path d="M-6,34 Q60,26 130,10 T250,-2" fill="none" stroke="#7a5c3a" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" transform="translate(0 -1.4)" />
      <path d="M246,196 Q186,172 168,150" fill="none" stroke="#3a281a" strokeWidth="4" strokeLinecap="round" />
      <g filter="url(#nx-b1)" opacity="0.5">
        <path d={frameD} fill="none" stroke="#d8ecf2" strokeWidth="1.1" />
      </g>
      <path d={spokesD} fill="none" stroke="#e4f0f4" strokeOpacity="0.85" strokeWidth="0.5" strokeLinecap="round" />
      <path d={frameD} fill="none" stroke="#e4f0f4" strokeOpacity="0.9" strokeWidth="0.55" strokeLinecap="round" />
      <path d={spiralD} fill="none" stroke="#e4f0f4" strokeOpacity="0.75" strokeWidth="0.42" strokeLinecap="round" />
      <ellipse cx={cx} cy={cy} rx={3.2} ry={3} fill="#f0f8fa" fillOpacity="0.7" />
      {drops}
    </g>
  );
}

/* --------------------------------- Spuren im weichen Boden --------------------------------- */

/** Matschfläche mit vertieften Abdrücken: Die Formen sind Löcher in der Fläche, ihre Kanten werden durch Licht von links oben abgesetzt. */
function MudScene({ prints, children }: { prints: string[]; children?: ReactNode }) {
  const id = useGid('md');
  const holes = prints.join(' ');
  const mud = `M-4,-4 H244 V204 H-4 Z ${holes}`;
  const r = rng(61);
  const crumbs: ReactNode[] = [];
  for (let i = 0; i < 26; i++) {
    crumbs.push(<ellipse key={i} cx={r.between(8, 232)} cy={r.between(8, 192)} rx={r.between(1.5, 4)} ry={r.between(1, 2.6)} fill={shade('#8a6e4a', r.between(-0.2, 0.2))} opacity="0.6" />);
  }
  return (
    <g>
      <defs>
        <clipPath id={`${id}k`}>
          <rect width="240" height="200" rx="26" />
        </clipPath>
        <radialGradient id={`${id}g`} cx="0.5" cy="0.45" r="0.8">
          <stop offset="0" stopColor="#b69a72" />
          <stop offset="1" stopColor="#8a6f4c" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}k)`}>
        {/* Grund der Abdrücke: dunkler, feuchter Matsch */}
        <rect width="240" height="200" fill="#4a3822" />
        <path d={holes} fill="#2a1d10" filter="url(#nx-b2)" />
        <path d={mud} fill={`url(#${id}g)`} fillRule="evenodd" filter="url(#nx-dent)" />
        <path d={mud} fill="#3a2a16" fillRule="evenodd" filter="url(#nx-bump-lg)" opacity="0.32" />
        {crumbs}
        {children}
      </g>
    </g>
  );
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number, rot: number): string {
  const a = (rot * Math.PI) / 180;
  const dx = Math.cos(a) * rx;
  const dy = Math.sin(a) * rx;
  return `M${f(cx - dx)},${f(cy - dy)} A${f(rx)},${f(ry)} ${f(rot)} 1,1 ${f(cx + dx)},${f(cy + dy)} A${f(rx)},${f(ry)} ${f(rot)} 1,1 ${f(cx - dx)},${f(cy - dy)} Z`;
}

/** Pfotenabdruck mit vier Zehen und einem Ballen (Beispiel; viele Tiere hinterlassen ähnliche Abdrücke). */
function pawPath(x: number, y: number, rot: number, s: number, claws = false): string {
  const a = (rot * Math.PI) / 180;
  const tr = (px: number, py: number): Pt => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
  const parts: string[] = [];
  // Ballen: dreilappig, Spitze nach hinten
  const pad: Pt[] = [tr(-10, 6), tr(-7, 0), tr(0, -1), tr(7, 0), tr(10, 6), tr(5, 11), tr(0, 9), tr(-5, 11)];
  parts.push(smoothPath(pad, true));
  const toes: [number, number, number, number, number][] = [
    [-12, -10, 4.4, 6, -22],
    [-4.4, -17, 4.6, 6.6, -6],
    [4.4, -17, 4.6, 6.6, 6],
    [12, -10, 4.4, 6, 22],
  ];
  for (const [tx, ty, rx, ry, rr] of toes) {
    const [cx, cy] = tr(tx, ty);
    parts.push(ellipsePath(cx, cy, rx * s, ry * s, rot + rr + 90));
    if (claws) {
      const [c1x, c1y] = tr(tx * 1.12, ty - ry - 2.8);
      parts.push(ellipsePath(c1x, c1y, 1.2 * s, 2.6 * s, rot + rr + 90));
    }
  }
  return parts.join(' ');
}

/** Huf eines Rehs: zwei längliche, vorn spitze Hälften (Schalen). */
function hoofPath(x: number, y: number, rot: number, s: number): string {
  const a = (rot * Math.PI) / 180;
  const tr = (px: number, py: number): Pt => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
  const half = (sx: number): string => {
    const pts: Pt[] = [tr(sx * 1.8, -27), tr(sx * 5.4, -18), tr(sx * 10.6, -3), tr(sx * 11, 9), tr(sx * 7.4, 16), tr(sx * 2.4, 15.5), tr(sx * 1.8, 2)];
    return smoothPath(pts, true, 0.9);
  };
  return `${half(-1)} ${half(1)}`;
}

function TrackArt() {
  // vier Abdrücke in einer Spur: links/rechts versetzt, leicht unterschiedlich tief
  const prints = [pawPath(52, 150, -38, 1.0), pawPath(98, 128, -30, 1.0), pawPath(142, 96, -38, 1.0), pawPath(188, 70, -32, 1.0)];
  return (
    <MudScene prints={prints}>
      <Pebble x={40} y={50} rx={10} ry={7} rot={-12} />
      <Pebble x={208} y={158} rx={8} ry={6} rot={20} />
      <Pebble x={34} y={110} rx={5} ry={4} rot={0} />
      <path d="M170,176 q14,-10 28,-4" fill="none" stroke="#6a4a22" strokeWidth="2" strokeLinecap="round" />
    </MudScene>
  );
}

function DeerTrackArt() {
  const prints = [hoofPath(78, 130, 24, 1.5), hoofPath(168, 84, 18, 1.5)];
  return (
    <MudScene prints={prints}>
      <Pebble x={36} y={60} rx={9} ry={6} rot={-8} />
      <Pebble x={206} y={160} rx={7} ry={5} rot={14} />
      <Pebble x={40} y={170} rx={5} ry={4} rot={0} />
    </MudScene>
  );
}

function DogTrackArt() {
  // großer Abdruck mit Krallenspuren, dahinter ein zweiter
  const prints = [pawPath(98, 130, -18, 2.0, true), pawPath(190, 70, -22, 1.9, true)];
  return (
    <MudScene prints={prints}>
      <Pebble x={30} y={52} rx={9} ry={6} rot={-6} />
      <Pebble x={214} y={156} rx={8} ry={5} rot={16} />
      <Pebble x={150} y={176} rx={5} ry={4} rot={0} />
    </MudScene>
  );
}

/* ============================================================================================ */

export const realBoden: Record<string, Art> = {
  moss: { bg: 'litter', shadow: false, draw: () => <MossArt /> },
  lichen: { bg: 'bark', shadow: false, draw: () => <LichenArt /> },
  mushroom: { bg: 'leafy', shadow: false, draw: () => <MushroomArt /> },
  'bracket-fungus': { bg: 'bark', shadow: false, draw: () => <BracketArt /> },
  'spider-web': { bg: 'dusk', shadow: false, draw: () => <WebArt /> },
  'animal-track': { bg: 'mud', shadow: false, draw: () => <TrackArt /> },
  'deer-track': { bg: 'mud', shadow: false, draw: () => <DeerTrackArt /> },
  'dog-track': { bg: 'mud', shadow: false, draw: () => <DogTrackArt /> },
};

void Shadow;

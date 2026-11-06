/** Zufallsfunktion im Bereich [0, 1). Injizierbar, damit Tests reproduzierbar sind. */
export type Rng = () => number;

/** Kleiner, schneller, deterministischer Generator (mulberry32). */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Frischer Seed für eine neue Runde (nur zum Speichern, nie als einzige Quelle der Wahrheit). */
export function freshSeed(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }
  return Math.floor(Math.random() * 4294967296);
}

/** Gewichtete Auswahl. Gewichte ≤ 0 werden nie gewählt, solange ein positives existiert. */
export function weightedPick<T>(items: T[], weight: (item: T) => number, rng: Rng): T | undefined {
  if (items.length === 0) return undefined;
  const weights = items.map((it) => Math.max(0, weight(it)));
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[Math.floor(rng() * items.length)];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  return items[items.length - 1];
}

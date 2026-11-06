import type { Art } from './kit';
import { findsArt } from './finds';
import { findsArt2 } from './finds2';
import { forestArt } from './forest';
import { realBlatt } from './real-blatt';
import { realBoden } from './real-boden';
import { realFrucht } from './real-frucht';
import { natureArt } from './nature';
import { shapesArt } from './shapes';
import { shoreArt } from './shore';
import { urbanArt } from './urban';

/** Tafeln ohne Bewegung: Rinde, Matsch und Netz bleiben ein ruhiges Standbild. */
const STILL = new Set(['lichen', 'bracket-fungus', 'spider-web', 'animal-track', 'deer-track', 'dog-track']);

function tag(rec: Record<string, Art>): Record<string, Art> {
  return Object.fromEntries(Object.entries(rec).map(([k, a]) => [k, STILL.has(k) ? { ...a, still: true } : { ...a, object: true }]));
}

/** Alle Suchbilder, nach `illustrationKey` (= Vorlagen-ID). */
export const artRegistry: Record<string, Art> = {
  ...shapesArt,
  ...natureArt,
  ...urbanArt,
  ...shoreArt,
  ...findsArt,
  ...findsArt2,
  ...forestArt,
  // Naturgetreue Suchbilder ersetzen die früheren Zeichnungen derselben Schlüssel (auch in gespeicherten Runden).
  ...tag({ ...realFrucht, ...realBlatt, ...realBoden }),
};

/** Wahr, wenn ein Bild keine Bewegung hat (dann gibt es auch keinen Wiederholen-Knopf). */
export const isStillArt = (key: string): boolean => artRegistry[key]?.still === true;

import type { Art } from './kit';
import { findsArt } from './finds';
import { findsArt2 } from './finds2';
import { forestArt } from './forest';
import { natureArt } from './nature';
import { shapesArt } from './shapes';
import { shoreArt } from './shore';
import { urbanArt } from './urban';

/** Alle Suchbilder, nach `illustrationKey` (= Vorlagen-ID). */
export const artRegistry: Record<string, Art> = {
  ...shapesArt,
  ...natureArt,
  ...urbanArt,
  ...shoreArt,
  ...findsArt,
  ...findsArt2,
  ...forestArt,
};

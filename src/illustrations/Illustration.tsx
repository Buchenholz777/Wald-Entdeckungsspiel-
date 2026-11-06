import type { AnimationPreset } from '../domain/types';
import { C, Scene } from './kit';
import { artRegistry } from './registry';

interface Props {
  illustrationKey: string;
  preset: AnimationPreset;
  /** Beschreibung für Screenreader; ohne Wert gilt das Bild als dekorativ */
  alt?: string;
  /** true: die sanfte Bewegung läuft (nur auf der aktiven Suchkarte); sonst ruhiges Standbild */
  play?: boolean;
  /** Ändert sich der Wert, startet die Bewegung erneut */
  playId?: number | string;
  className?: string;
}

/** Fallback, falls ein Schlüssel unbekannt ist: ruhiges Bild, kein Absturz. */
function Missing() {
  return (
    <Scene>
      <circle cx={120} cy={96} r={34} fill="none" stroke={C.inkSoft} strokeWidth={4} strokeDasharray="4 8" />
      <path d="M104,96 H136 M120,80 V112" stroke={C.inkSoft} strokeWidth={4} strokeLinecap="round" />
    </Scene>
  );
}

export function Illustration({ illustrationKey, preset, alt, play = false, playId, className }: Props) {
  const art = artRegistry[illustrationKey];
  return (
    <svg
      key={playId}
      className={`illu${className ? ` ${className}` : ''}`}
      viewBox="0 0 240 200"
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      focusable="false"
      data-preset={preset}
      data-play={play ? 'true' : 'false'}
      data-key={illustrationKey}
      data-real={art?.object || art?.still ? 'true' : undefined}
    >
      {art ? (
        <Scene bg={art.bg} shadow={art.shadow !== false}>
          {art.object ? <g className="mv">{art.draw()}</g> : art.draw()}
        </Scene>
      ) : (
        <Missing />
      )}
    </svg>
  );
}

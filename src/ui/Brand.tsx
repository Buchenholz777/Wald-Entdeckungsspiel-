import { Logo } from '../illustrations/scenes';

export const BRAND_NAME = 'Wald-Spiel';
export const BRAND_TAGLINE = 'Draußen spielen. Gemeinsam staunen.';

/**
 * Wortmarke „Wald-Spiel“: Blattzeichen und Schrift. Der Bindestrich ist ein gewöhnlicher Bindestrich
 * (nur in der Markenfarbe), kein Minuszeichen. Die Marke ist kein Knopf: Ein Klick darauf ändert nichts,
 * den Weg ins Hauptmenü zeigt immer die eigene Schaltfläche „Hauptmenü“.
 */
export function Wordmark({ size = 'md', tagline = false }: { size?: 'sm' | 'md' | 'lg'; tagline?: boolean }) {
  return (
    <span className={`wordmark wordmark-${size}`}>
      <Logo size={size === 'lg' ? 40 : size === 'md' ? 32 : 26} />
      <span className="wordmark-text">
        <span className="wordmark-name">
          Wald<span className="wordmark-dash">-</span>Spiel
        </span>
        {tagline && <span className="wordmark-tag">{BRAND_TAGLINE}</span>}
      </span>
    </span>
  );
}

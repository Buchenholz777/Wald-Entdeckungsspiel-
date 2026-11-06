import narrowJpg from '../assets/forest/wald-schmal-720.jpg';
import narrowWebp from '../assets/forest/wald-schmal-720.webp';
import wideJpg from '../assets/forest/wald-breit-1600.jpg';
import wideWebp from '../assets/forest/wald-breit-1600.webp';

/**
 * Waldfoto als ruhiger Hintergrund (CC0, siehe docs/BILDNACHWEIS.md). Das Bild liegt hinter dem Inhalt,
 * hat feste Maße (kein Layoutsprung) und fällt bei einem Ladefehler auf die Waldgrün-Fläche zurück.
 * Am Einstieg ist es gut sichtbar, im Spiel und in der Hilfe stark zurückgenommen (CSS: .forest-bg[data-mode]).
 * Keine Animation, kein Parallax, kein Ton.
 */
export function ForestBackground({ mode }: { mode: 'entry' | 'calm' }) {
  return (
    <div className="forest-bg" data-mode={mode} aria-hidden="true">
      <picture>
        <source media="(max-width: 700px)" srcSet={narrowWebp} type="image/webp" />
        <source media="(max-width: 700px)" srcSet={narrowJpg} type="image/jpeg" />
        <source srcSet={wideWebp} type="image/webp" />
        <img
          src={wideJpg}
          alt=""
          width={1600}
          height={1000}
          decoding="async"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
      </picture>
    </div>
  );
}

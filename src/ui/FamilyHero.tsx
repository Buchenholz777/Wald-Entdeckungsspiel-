import narrowJpg from '../assets/familie/familie-schmal-720.jpg';
import narrowWebp from '../assets/familie/familie-schmal-720.webp';
import wideJpg from '../assets/familie/familie-breit-1000.jpg';
import wideWebp from '../assets/familie/familie-breit-1000.webp';

/**
 * Die gezeichnete Familie im Kopfbereich des Hauptmenüs (eigene, fiktive Illustration, keine Fotos, keine Schrift im Bild).
 * Zwei Zuschnitte: ein näherer, quadratischerer Ausschnitt für Smartphones und ein breiter für Tablet und Desktop.
 * Das Bild hat feste Maße (kein Layoutsprung), wird lokal ausgeliefert und liegt im Offline-Paket. Fällt es aus, bleibt die Waldgrün-Fläche stehen.
 * Es erscheint nur im Hauptmenü, nie im Spiel: Während einer Suche gibt es dieses Bild nicht (der ruhige Spielhintergrund bleibt unberührt).
 */
export function FamilyHero() {
  return (
    <figure className="family-hero">
      <picture>
        <source media="(max-width: 600px)" srcSet={narrowWebp} type="image/webp" />
        <source media="(max-width: 600px)" srcSet={narrowJpg} type="image/jpeg" />
        <source srcSet={wideWebp} type="image/webp" />
        <img
          src={wideJpg}
          alt="Gezeichnete Familie auf einem sonnigen Waldweg: Vater, kleiner Sohn und Mutter zeigen gemeinsam auf ein Moospolster und einen Zapfen am Boden."
          width={1000}
          height={560}
          decoding="async"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
      </picture>
    </figure>
  );
}

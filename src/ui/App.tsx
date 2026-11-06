import { useEffect, useRef, useState } from 'react';
import { SvgDefs } from '../illustrations/kit';
import { ForestBackground } from './ForestBackground';
import { Logo } from '../illustrations/scenes';
import { IconHome } from './icons';
import { usePwa } from '../pwa/status';
import { Gallery } from './Gallery';
import { HelpScreen } from './HelpScreen';
import { RoundScreen } from './RoundScreen';
import { SetupScreen } from './SetupScreen';
import { SummaryScreen } from './SummaryScreen';
import { useGame } from './useGame';
import { useRoute, type Route } from './useRoute';

export function App() {
  const game = useGame();
  const [route, go] = useRoute();
  const pwa = usePwa();
  const main = useRef<HTMLElement>(null);
  const prevRoute = useRef<Route | null>(null);

  const round = game.round;
  const [legacyLink, setLegacyLink] = useState(false);

  // Einstiegsroute: laufende Mission fortsetzen, ungültige oder alte Ziele einmalig ins Hauptmenü leiten
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, '');
    const known = ['/', '/runde', '/abschluss', '/hilfe', '/intern/bilder'];
    if (!raw) {
      // Kaltstart ohne Adresszusatz: laufende Mission wieder aufnehmen. Ein ausdrücklich gewähltes Hauptmenü (#/) bleibt stehen.
      if (round && prevRoute.current === null) go(round.finished ? '/abschluss' : '/runde', true);
    } else if (!known.includes(raw)) {
      // Alte Adresse (zum Beispiel ein früherer Ort): genau eine Meldung, danach saubere Adresse, keine Weiterleitungskette.
      setLegacyLink(true);
      go('/', true);
    } else if ((raw === '/runde' || raw === '/abschluss') && !round) {
      go('/', true);
    }
    if (new URLSearchParams(window.location.search).has('ort') || new URLSearchParams(window.location.search).has('env')) {
      setLegacyLink(true);
      try {
        window.history.replaceState(null, '', `${window.location.pathname}#/`);
      } catch {
        /* ignorieren */
      }
    }
    // nur beim ersten Rendern
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bewegung und Sichtbarkeit als Merkmale am Dokument (CSS pausiert/entfernt Animationen)
  useEffect(() => {
    document.documentElement.dataset.motion = game.settings.motionOff ? 'off' : 'on';
  }, [game.settings.motionOff]);
  useEffect(() => {
    const onVis = () => {
      document.documentElement.dataset.hidden = document.hidden ? 'true' : 'false';
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Bei Seitenwechsel den Fokus auf die Überschrift setzen
  useEffect(() => {
    if (prevRoute.current !== null && prevRoute.current !== route) {
      const h = main.current?.querySelector<HTMLElement>('[data-focus-target]');
      h?.focus({ preventScroll: true });
    }
    prevRoute.current = route;
  }, [route]);

  const hasRound = round !== null;
  let screen;
  if (route === '/hilfe') screen = <HelpScreen game={game} go={go} pwa={pwa} back={() => (window.history.length > 1 ? window.history.back() : go('/'))} />;
  else if (route === '/intern/bilder') screen = <Gallery back={() => go('/')} />;
  else if (route === '/runde' && hasRound) screen = <RoundScreen game={game} go={go} />;
  else if (route === '/abschluss' && hasRound) screen = <SummaryScreen game={game} go={go} />;
  else screen = <SetupScreen game={game} go={go} pwa={pwa} legacyLink={legacyLink} />;
  const onMenu = screen.type === SetupScreen;

  return (
    <>
      <ForestBackground mode={onMenu ? 'entry' : 'calm'} />
      <SvgDefs />
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); main.current?.focus(); }}>
        Zum Inhalt
      </a>
      <div className="app-bar">
        <span className="brand">
          <Logo size={26} />
          <span className="brand-name">Entdeckerzeit</span>
        </span>
        {route !== '/' && (
          <button type="button" className="btn btn-secondary home-btn" onClick={() => go('/')}>
            <IconHome /> Hauptmenü
          </button>
        )}
      </div>
      <main id="main" ref={main} tabIndex={-1} className={`main route-${route.replace(/\W+/g, '-')}`}>
        {screen}
      </main>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {game.announce}
      </div>
    </>
  );
}

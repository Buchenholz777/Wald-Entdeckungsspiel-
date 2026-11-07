import { useEffect, useRef, useState } from 'react';
import { SvgDefs } from '../illustrations/kit';
import { ForestBackground } from './ForestBackground';
import { Wordmark } from './Brand';
import { IconHome } from './icons';
import { usePwa } from '../pwa/status';
import { Gallery } from './Gallery';
import { HelpScreen } from './HelpScreen';
import { RoundScreen } from './RoundScreen';
import { EscapeScreen } from './escape/EscapeScreen';
import { SetupScreen } from './SetupScreen';
import { isLive } from '../domain/escape';
import { performReset, type ResetOutcome } from '../domain/reset';
import { SummaryScreen } from './SummaryScreen';
import { useEscape } from './useEscape';
import { useGame } from './useGame';
import { useRoute, type Route } from './useRoute';

export function App() {
  const game = useGame();
  const esc = useEscape(game.settings, game.saveSettings);
  const [route, go] = useRoute();
  const pwa = usePwa();
  const main = useRef<HTMLElement>(null);
  const prevRoute = useRef<Route | null>(null);

  const round = game.round;
  const [legacyLink, setLegacyLink] = useState(false);

  // Einstiegsroute: laufende Mission fortsetzen, ungültige oder alte Ziele einmalig ins Hauptmenü leiten
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, '');
    const known = ['/', '/runde', '/abschluss', '/hilfe', '/intern/bilder', '/escape'];
    if (raw === '/modus/waldschaetze' || raw === '/modus/escape') {
      // Einstieg von den öffentlichen Seiten: nur den Modus wählen und das Hauptmenü zeigen. Es startet nichts und ersetzt keinen Spielstand;
      // bei einer laufenden Runde dieses Modus steht dort „Weiterspielen“ als Hauptaktion.
      game.saveSettings({ mode: raw === '/modus/escape' ? 'escape' : 'treasure' });
      go('/', true);
      return;
    }
    if (!raw) {
      // Kaltstart ohne Adresszusatz: Eine laufende oder abgelaufene Wald-Escape-Suche hat Vorrang (sie ist zeitkritisch),
      // sonst wird die laufende Waldschätze-Runde wieder aufgenommen. Ein ausdrücklich gewähltes Hauptmenü (#/) bleibt stehen.
      const em = esc.mission;
      const escHot = em && isLive(em) && ((em.phase === 'searching' && em.pauses.length === 0) || em.phase === 'timeup');
      if (escHot && prevRoute.current === null) go('/escape', true);
      else if (round && prevRoute.current === null) go(round.finished ? '/abschluss' : '/runde', true);
    } else if (!known.includes(raw)) {
      // Alte Adresse (zum Beispiel ein früherer Ort): genau eine Meldung, danach saubere Adresse, keine Weiterleitungskette.
      setLegacyLink(true);
      go('/', true);
    } else if ((raw === '/runde' || raw === '/abschluss') && !round) {
      go('/', true);
    } else if (raw === '/escape' && !esc.mission) {
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

  // Eine Spiel-Adresse ohne dazugehörigen Spielstand (zum Beispiel nach „Spiele und Einstellungen zurücksetzen“, auch aus einem anderen Tab)
  // führt immer zurück ins Hauptmenü: Die Adresse zeigt nie ein Spiel, das es nicht mehr gibt.
  useEffect(() => {
    if (((route === '/runde' || route === '/abschluss') && !round) || (route === '/escape' && !esc.mission)) go('/', true);
  }, [route, round, esc.mission, go]);

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

  // Wald Escape: Die Suchzeit steht, sobald das Spiel verlassen wird (Hauptmenü, Hilfe, Zurück), und läuft nur auf der Escape-Seite.
  const escId = esc.mission?.id;
  const escAct = esc.act;
  useEffect(() => {
    if (!escId) return;
    if (route === '/escape') escAct.enter();
    else escAct.leave();
  }, [route, escId, escAct]);

  /**
   * Zentrale Reset-Aktion: Speicher gezielt zurücksetzen und prüfen (performReset), erst dann Arbeitsspeicher beider Spielmodi leeren.
   * Die Erfolgsmeldung steht erst nach geprüftem Speicherstand. Fehler lassen den Zustand unverändert und werden dem Dialog gemeldet.
   */
  const resetAll = (): ResetOutcome => {
    const out = performReset(game.store);
    if (out.ok) {
      game.applyReset(out.settings);
      esc.applyReset();
      game.setFlash(
        out.persisted
          ? 'Spiele und Einstellungen wurden zurückgesetzt.'
          : 'Spiele und Einstellungen wurden zurückgesetzt. Dieses Gerät speichert nichts: Das gilt nur, solange diese Seite offen ist.',
      );
      game.setAnnounce('Spiele und Einstellungen wurden zurückgesetzt.');
    }
    return out;
  };

  const hasRound = round !== null;
  let screen;
  if (route === '/hilfe') screen = <HelpScreen game={game} go={go} pwa={pwa} reset={resetAll} back={() => (window.history.length > 1 ? window.history.back() : go('/'))} />;
  else if (route === '/intern/bilder') screen = <Gallery back={() => go('/')} />;
  else if (route === '/runde' && hasRound) screen = <RoundScreen game={game} go={go} />;
  else if (route === '/abschluss' && hasRound) screen = <SummaryScreen game={game} go={go} />;
  else if (route === '/escape' && esc.mission) screen = <EscapeScreen esc={esc} motionOff={game.settings.motionOff} go={go} />;
  else screen = <SetupScreen game={game} esc={esc} go={go} pwa={pwa} legacyLink={legacyLink} />;
  const onMenu = screen.type === SetupScreen;

  return (
    <>
      <ForestBackground mode={onMenu ? 'entry' : 'calm'} />
      <SvgDefs />
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); main.current?.focus(); }}>
        Zum Inhalt
      </a>
      {/* Im Hauptmenü trägt der Einstiegsbereich selbst die Marke; in Spiel, Hilfe und Fundsammlung steht sie klein in der Kopfleiste. */}
      {!onMenu && (
        <div className="app-bar">
          <Wordmark size="sm" />
          <button type="button" className="btn btn-secondary home-btn" onClick={() => go('/')}>
            <IconHome /> Hauptmenü
          </button>
        </div>
      )}
      <main id="main" ref={main} tabIndex={-1} className={`main route-${route.replace(/\W+/g, '-')}${onMenu ? ' is-entry' : ''}`}>
        {screen}
      </main>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {game.announce}
      </div>
    </>
  );
}

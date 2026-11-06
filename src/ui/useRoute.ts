import { useCallback, useEffect, useState } from 'react';

export type Route = '/' | '/runde' | '/abschluss' | '/hilfe' | '/intern/bilder';

const ROUTES: Route[] = ['/', '/runde', '/abschluss', '/hilfe', '/intern/bilder'];

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return (ROUTES as string[]).includes(raw) ? (raw as Route) : '/';
}

/**
 * Einfaches Hash-Routing: Zurück-Taste und Neuladen funktionieren, ohne dass eine Runde verloren geht.
 * Ein offener Dialog belegt genau einen Verlaufseintrag (state.dlg). Wird aus einem Dialog heraus
 * navigiert, ersetzt die Navigation diesen Eintrag. So entsteht keine Kette aus Dialog-Einträgen.
 */
export function useRoute(): [Route, (r: Route, replace?: boolean) => void] {
  const [route, setRoute] = useState<Route>(() => {
    // Ein beim Neuladen übrig gebliebener Dialog-Eintrag wird bereinigt.
    try {
      if (window.history.state?.dlg) window.history.replaceState(null, '', window.location.href);
    } catch {
      /* ignorieren */
    }
    return parse();
  });

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
      window.removeEventListener('hashchange', onChange);
      window.removeEventListener('popstate', onChange);
    };
  }, []);

  const go = useCallback((r: Route, replace = false) => {
    const fromDialog = Boolean(window.history.state?.dlg);
    if (replace || fromDialog) {
      window.history.replaceState(null, '', `#${r}`);
      setRoute(r);
    } else {
      window.location.hash = r;
      setRoute(r);
    }
    window.scrollTo(0, 0);
  }, []);

  return [route, go];
}

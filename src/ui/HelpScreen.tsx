import { useRef, useState } from 'react';
import type { ResetOutcome } from '../domain/reset';
import { offlineLabel, type PwaInfo } from '../pwa/status';
import { IconBack } from './icons';
import { Modal } from './Modal';
import type { Game } from './useGame';
import type { Route } from './useRoute';

interface Props {
  game: Game;
  go: (r: Route) => void;
  pwa: PwaInfo;
  back: () => void;
  /** Zentrale Reset-Aktion (in der App): löscht laufende Spiele, setzt Einstellungen zurück, meldet den tatsächlichen Stand */
  reset: () => ResetOutcome;
}

/**
 * „Spiele und Einstellungen zurücksetzen“: eigener, vom Spielstart getrennter Bereich im Datenbereich der Hilfe.
 * Der Dialog beginnt mit dem Fokus auf „Abbrechen“, schließt mit Escape und führt den Reset erst nach „Jetzt zurücksetzen“ aus,
 * auch bei schnellem Mehrfachtippen nur einmal.
 */
function ResetSection({ reset, go }: { reset: () => ResetOutcome; go: (r: Route) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const [working, setWorking] = useState(false);

  const close = () => {
    setOpen(false);
    setError(null);
  };
  const confirm = () => {
    if (busy.current) return; // doppeltes Antippen
    busy.current = true;
    setWorking(true);
    const out = reset();
    if (!out.ok) {
      busy.current = false;
      setWorking(false);
      setError(
        `Das Zurücksetzen konnte nicht sicher gespeichert werden (${out.detail}). Der Stand in diesem Browser ist möglicherweise nur teilweise zurückgesetzt. Bitte ladet die Seite neu und prüft, was noch da ist.`,
      );
      return;
    }
    setOpen(false);
    busy.current = false;
    setWorking(false);
    go('/');
  };

  return (
    <section className="help-card reset-card" aria-labelledby="reset-title">
      <h2 id="reset-title">Zurücksetzen</h2>
      <p className="muted">Beendet alle angefangenen Spiele auf diesem Gerät und stellt die Einstellungen auf den Anfang zurück.</p>
      <button type="button" className="btn btn-secondary reset-btn" onClick={() => setOpen(true)}>
        Spiele und Einstellungen zurücksetzen
      </button>
      <Modal open={open} onClose={close} title="Spiele und Einstellungen zurücksetzen?" onHome={undefined}>
        <p>Alle laufenden und pausierten Spiele auf diesem Gerät werden gelöscht. Deine Spieleinstellungen werden auf die Standardwerte zurückgesetzt. Gesammelte Waldgeschenke bleiben in deiner Sammlung.</p>
        {error && (
          <p className="notice-inline" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={close} data-autofocus>
            Abbrechen
          </button>
          <button type="button" className="btn btn-secondary" onClick={confirm} disabled={working} aria-disabled={working}>
            Jetzt zurücksetzen
          </button>
        </div>
      </Modal>
    </section>
  );
}

export function HelpScreen({ game, pwa, back, go, reset }: Props) {
  const off = offlineLabel(pwa.offline);
  const motionOff = game.settings.motionOff;

  return (
    <div className="screen help">
      <header className="help-head">
        <button type="button" className="btn btn-quiet" onClick={back}>
          <IconBack /> Zurück
        </button>
        <h1 className="h1" tabIndex={-1} data-focus-target>
          Hilfe
        </h1>
      </header>

      <section className="help-card">
        <h2>So geht’s</h2>
        <ol className="steps">
          <li>Wählt das Alter des jüngsten Kindes. Die Jahreszeit schlagen wir euch nach dem Datum vor, ihr könnt sie ändern.</li>
          <li>Tippt auf „Waldmission starten“. Ihr bekommt ein paar Stationen mit kleinen Waldgeheimnissen.</li>
          <li>Schaut gemeinsam im Wald. Wenn ihr etwas entdeckt habt, tippt auf „Gefunden!“. Mit „Weiter entdecken“ geht ihr zur nächsten Station.</li>
          <li>Das Handy kann zwischendurch wieder in die Tasche. Eure Waldmission bleibt gespeichert, ihr findet sie im Hauptmenü unter „Waldmission fortsetzen“.</li>
        </ol>
      </section>

      <section className="help-card">
        <h2>Die Spielmodi</h2>
        <dl className="defs">
          <dt>Waldschätze suchen</dt>
          <dd>Das entspannte Suchspiel ohne Zeitdruck: eine Waldmission aus ein bis fünf Aufgaben.</dd>
          <dt>Walddetektive</dt>
          <dd>Ist in dieser Fassung noch nicht dabei und kommt später.</dd>
          <dt>Wald Escape: Knackt den Waldtresor!</dt>
          <dd>Ab 4 Jahren mit erwachsener Begleitung. Ihr wählt zwischen einer kleinen Mission (6 Aufgaben) und einer großen (9 Aufgaben) und bekommt dafür 8 bzw. 12 Karten zur Wahl. Für jeden Schlüssel müsst ihr 2 (klein) oder 3 (groß) verschiedene Dinge entdecken; drei Schlüssel öffnen den Tresor. Die Sanduhr läuft 10, 15, 20 oder 30 Minuten. Mit den drei Schlüsseln löst ihr in Ruhe ein kleines Symbolrätsel und öffnet den Waldtresor. Die Zeit läuft nur bei der Suche: Infos lesen, Bilder vergrößern, Karten tauschen und Pausen kosten keine Suchzeit. Wenn das Telefon gesperrt wird, läuft die Sanduhr weiter, tippt bei einer echten Suchpause auf „Pause“. Ist die Zeit abgelaufen, könnt ihr ohne Zeitdruck weitersuchen und den Tresor trotzdem öffnen; es gibt dann dasselbe Geschenk, nur ohne die Aussage „rechtzeitig“.</dd>
        </dl>
      </section>

      <section className="help-card">
        <h2>Gemeinsam entdecken</h2>
        <ul>
          <li>Anschauen, zeigen und gemeinsam zählen genügt. Nichts muss eingesammelt werden.</li>
          <li>Erwachsene wählen den sicheren Platz und bestätigen, was entdeckt wurde.</li>
          <li>Nichts essen oder probieren, auch keine Beeren, Pilze, Eicheln oder Bucheckern. Tiere nicht anfassen, fangen oder füttern.</li>
          <li>Moos, Flechten, Rinde und Pilze bleiben, wie sie sind. Nichts abkratzen, abreißen oder ausreißen.</li>
          <li>Keine Baumstämme umdrehen, kein Totholz aufbrechen, keine Nester oder Tierbauten suchen. Dort wohnen Tiere.</li>
          <li>Bleibt auf den Wegen. Keine Station führt in Dickicht, an Gewässer oder an gefährliche Ränder.</li>
          <li>Gerade bei den Kleinsten: Kleine Dinge wie Samen, Nüsse oder Steinchen gehören nicht in den Mund.</li>
        </ul>
      </section>

      <section className="help-card">
        <h2>Stationen und Hilfen</h2>
        <dl className="defs">
          <dt>Info zum Bild</dt>
          <dd>Erklärt, was ihr vor euch habt, wie es entstanden ist und welches kleine Waldgeheimnis darin steckt. Der Suchhinweis steht getrennt. Ihr könnt sie jederzeit öffnen, auch vor dem Fund.</dd>
          <dt>Hier nicht zu finden</dt>
          <dd>Tauscht nur diese eine Station aus. Die anderen und ihr Fortschritt bleiben, wie sie sind.</dd>
          <dt>Rückgängig</dt>
          <dd>Nimmt den letzten Fund zurück, auch nach einem Abschluss.</dd>
          <dt>Mission anpassen</dt>
          <dd>Hier stellt ihr die Zahl der Stationen ein und könnt freiwillig sagen, was ihr seht, zum Beispiel Nadelbäume, Buchen, Eichen oder Farn. Nur dann kommen dazu passende Stationen vor.</dd>
          <dt>Waldgeschenk</dt>
          <dd>Sind alle Stationen einer Mission gefunden, regnet kurz Konfetti, und ihr bekommt eine kleine Naturgeschichte geschenkt. Ausgelassene oder offene Stationen zählen nicht als gefunden. Eure Geschenke könnt ihr im Hauptmenü unter „Unsere Waldgeheimnisse“ jederzeit wieder lesen.</dd>
          <dt>Waldmission pausieren</dt>
          <dd>Mit „Hauptmenü“ pausiert ihr jederzeit, ohne Rückfrage. Der Fortschritt bleibt gespeichert.</dd>
        </dl>
      </section>

      <section className="help-card">
        <h2>Bewegung</h2>
        <label className="switch-row">
          <input type="checkbox" checked={motionOff} onChange={(e) => game.saveSettings({ motionOff: e.target.checked })} />
          <span className="switch" aria-hidden="true" />
          <span>
            <span className="switch-title">Bewegung aus</span>
            <span className="muted block">Zeigt die Bilder immer ruhig. Das ist auch so, wenn euer Gerät reduzierte Bewegung eingestellt hat.</span>
          </span>
        </label>
      </section>

      <section className="help-card">
        <h2>Für unterwegs</h2>
        <p className={`offline-status tone-${off.tone}`} role="status">
          <span className="dot" aria-hidden="true" />
          <strong>{off.short}</strong>
        </p>
        <p>{off.long}</p>
        {pwa.updateWaiting && <p className="muted">Eine neue Version ist bereit. Sie wird beim nächsten Start geladen, eure laufende Waldmission bleibt unberührt.</p>}
        {pwa.canInstall && (
          <button type="button" className="btn btn-secondary" onClick={pwa.install}>
            Als App installieren
          </button>
        )}
        <p className="muted">Installieren ist freiwillig. Auf dem iPhone: in Safari auf „Teilen“ tippen und „Zum Home-Bildschirm“ wählen.</p>
      </section>

      <section className="help-card">
        <h2>Datenhinweis</h2>
        <p>
          Eure laufende Waldmission und eure letzten Einstellungen werden nur auf diesem Gerät im Browser gespeichert. Es gibt kein Konto, keinen Standort, keine Fotos und keine Werbung. Spielstände und Funde verlassen das Gerät nicht. Für die Reichweitenmessung wird beim Aufruf der Seite Google Analytics geladen: Dabei werden Daten über den Seitenbesuch (zum Beispiel ungefährer Ort, Gerät und Browser) an Google übertragen.
        </p>
        <p className="muted">Wenn euer Browser das Speichern blockiert, bleibt die Mission nur so lange offen, wie diese Seite geöffnet ist.</p>
      </section>

      <ResetSection reset={reset} go={go} />

      <section className="help-card">
        <h2>Zu den Inhalten</h2>
        <p>
          Die Stationen sind für Wälder in Mitteleuropa gedacht, vor allem für Deutschland, Österreich und die Schweiz. Ob ihr etwas findet, hängt von Wald, Wetter und Jahreszeit ab, und es gibt nie eine Garantie. Die Jahreszeit ist ein Vorschlag nach dem Datum und lässt sich ändern. Die Texte sind redaktionell geprüft, aber nicht von Fachleuten gegengelesen; bei Tierspuren und Fraßspuren bleibt immer offen, welches Tier es war.
        </p>
        <p className="muted">
          Der Hintergrund „Lichter Waldweg“ und alle Zeichnungen sind eigene Bilder dieses Projekts. Der Hintergrund ist ein Stimmungsbild, keine Ansicht eines echten Waldes.
        </p>
      </section>
    </div>
  );
}

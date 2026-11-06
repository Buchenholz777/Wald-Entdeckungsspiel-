import { offlineLabel, type PwaInfo } from '../pwa/status';
import { IconBack } from './icons';
import type { Game } from './useGame';
import type { Route } from './useRoute';

interface Props {
  game: Game;
  go: (r: Route) => void;
  pwa: PwaInfo;
  back: () => void;
}

export function HelpScreen({ game, pwa, back }: Props) {
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
          <dd>Ab 4 Jahren mit erwachsener Begleitung. Ihr bekommt fünf Karten zur Wahl und braucht drei davon, bevor die Sanduhr abgelaufen ist (10, 15 oder 20 Minuten). Jeder Fund schenkt einen Symbolschlüssel. Mit den drei Schlüsseln löst ihr in Ruhe ein kleines Symbolrätsel und öffnet den Waldtresor. Die Zeit läuft nur bei der Suche: Infos lesen, Bilder vergrößern, Karten tauschen und Pausen kosten keine Suchzeit. Wenn das Telefon gesperrt wird, läuft die Sanduhr weiter, tippt bei einer echten Suchpause auf „Pause“. Ist die Zeit abgelaufen, könnt ihr ohne Zeitdruck weitersuchen und den Tresor trotzdem öffnen; es gibt dann dasselbe Geschenk, nur ohne die Aussage „rechtzeitig“.</dd>
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
          Eure laufende Waldmission und eure letzten Einstellungen werden nur auf diesem Gerät im Browser gespeichert. Es gibt kein Konto, keinen Standort, keine Fotos, keine Werbung und kein Tracking. Es werden keine Daten an Dritte gesendet.
        </p>
        <p className="muted">Wenn euer Browser das Speichern blockiert, bleibt die Mission nur so lange offen, wie diese Seite geöffnet ist.</p>
      </section>

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

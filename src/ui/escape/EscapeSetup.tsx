import { ESCAPE_MINUTES, ESCAPE_MINUTES_LABEL, canPlayEscape, describePool, isLive, poolNotice, remainingAt, formatClock, REQUIRED_KEYS, toEscapeMinutes, type EscapeMinutes, type EscapeParams } from '../../domain/escape';
import type { AgeGroup, ContextTag, Season } from '../../domain/types';
import type { Escape } from '../useEscape';
import type { Game } from '../useGame';

/** Die Einführung zum Vorlesen. Die Waldpost und der Tresor sind der spielerische Rahmen. */
export const ESCAPE_STORY =
  'Die Waldpost hat einen geheimnisvollen Tresor für euch hinterlassen. Darin wartet ein besonderes Waldgeheimnis! Findet drei Waldschätze, bevor die Sanduhr abgelaufen ist. Jeder Fund schenkt euch einen Schlüssel. Zusammen könnt ihr den Tresor öffnen!';

/** Parameter der nächsten Escape-Mission aus der gemeinsamen Einstellungsoberfläche (null, wenn das Alter nicht passt oder fehlt). */
export function escapeParams(game: Game): EscapeParams | null {
  const { draft } = game;
  if (!canPlayEscape(draft.age)) return null;
  return {
    age: draft.age,
    season: game.effectiveSeason as Season,
    seasonSource: draft.seasonOverride ? 'manual' : 'auto',
    context: draft.context as ContextTag[],
    minutes: toEscapeMinutes(game.settings.escapeMinutes),
  };
}

/** Alles, was nur für Wald Escape auf dem Startbildschirm steht: Geschichte, Zeitwahl, ehrliche Erklärung, Altershinweis. */
export function EscapeIntro({ age }: { age: AgeGroup | null }) {
  return (
    <section className="mode-intro" aria-label="Wald Escape: Knackt den Waldtresor!">
      <h2 className="mode-intro-title">Wald Escape: Knackt den Waldtresor!</h2>
      <p>{ESCAPE_STORY}</p>
      <p className="muted">Wald Escape ist für Kinder ab 4 Jahren mit erwachsener Begleitung gedacht, am besten ab 7. Ihr spielt gemeinsam: Ein Fund zählt für das ganze Team.</p>
      {age === '2-3' && (
        <p className="age-note" role="status">
          Wald Escape ist für Kinder ab 4 Jahren mit erwachsener Begleitung gedacht. Für euch wartet die Waldschatzsuche.
        </p>
      )}
    </section>
  );
}

export function EscapeDuration({ value, onChange }: { value: number; onChange: (m: EscapeMinutes) => void }) {
  const current = toEscapeMinutes(value);
  return (
    <fieldset className="group duration">
      <legend className="group-title">Wie lange soll die Sanduhr laufen?</legend>
      <div className="duration-grid">
        {ESCAPE_MINUTES.map((n) => (
          <label key={n} className="choice">
            <input type="radio" name="escape-minutes" value={n} checked={current === n} onChange={() => onChange(n)} />
            <span className="choice-face">
              <span className="choice-main">{n} Minuten</span>
              <span className="choice-sub">{ESCAPE_MINUTES_LABEL[n]}{n === 15 ? ' (Standard)' : ''}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="muted">Die Zeiten sind Spielvarianten. Sie wurden nicht mit Kindern auf ihre Schwierigkeit geprüft.</p>
    </fieldset>
  );
}

/** Transparenter Start: Regeln in einfachen Worten, ehrliche Kartenzahl, Sicherheitszeile. */
export function EscapeRules({ params }: { params: EscapeParams | null }) {
  const info = params ? describePool(params) : null;
  const cards = info ? (info.cards || 5) : 5;
  const notice = info ? poolNotice(info) : null;
  return (
    <section className="mode-rules" aria-label="So läuft Wald Escape">
      <p>
        Ihr findet {REQUIRED_KEYS} von {cards} Waldschätzen. Die Zeit zählt nur während der Suchphase. Infos lesen und Pausen kosten keine Suchzeit. Das letzte Symbolrätsel löst ihr anschließend in Ruhe.
      </p>
      <p className="muted">Alle bleiben zusammen. Anschauen und Zeigen genügt.</p>
      <p className="muted">Wird das Telefon gesperrt, läuft die Sanduhr weiter. Wenn ihr wirklich eine Suchpause macht, tippt auf „Pause“.</p>
      {notice && (
        <p className="notice-inline" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}

/** Eine vorhandene Mission: „Wald Escape fortsetzen“ statt einer zweiten daneben. */
export function EscapeResume({ esc, onContinue, onView }: { esc: Escape; onContinue: () => void; onView: () => void }) {
  const m = esc.mission;
  if (!m) return null;
  const live = isLive(m);
  const rem = formatClock(remainingAt(m, esc.now));
  const status = (() => {
    if (m.phase === 'timeup') return 'Zeit abgelaufen, ihr entscheidet in Ruhe, wie es weitergeht';
    if (m.phase === 'free') return 'Suchen ohne Zeitdruck';
    if (m.phase === 'combination') return 'Alle drei Schlüssel sind da, der Tresor wartet';
    if (m.phase === 'opened') return 'Tresor geöffnet';
    if (m.phase === 'ended') return 'Für heute beendet';
    return `Die Sanduhr steht im Hauptmenü, ${rem} Suchzeit übrig`;
  })();
  return (
    <section className="resume" aria-label="Wald-Escape-Mission">
      <div>
        <p className="resume-title">{live ? 'Eure Wald-Escape-Mission läuft noch' : 'Eure letzte Wald-Escape-Mission'}</p>
        <p className="resume-sub">
          {m.minutes} Minuten · {m.keys.length} von {REQUIRED_KEYS} Schlüsseln
          <br />
          {status}
        </p>
      </div>
      {live ? (
        <button type="button" className="btn btn-primary btn-compact" onClick={onContinue}>
          Wald Escape fortsetzen
        </button>
      ) : (
        <button type="button" className="btn btn-secondary btn-compact" onClick={onView}>
          Ansehen
        </button>
      )}
    </section>
  );
}

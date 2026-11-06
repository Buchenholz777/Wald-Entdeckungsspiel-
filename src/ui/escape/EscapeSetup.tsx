import {
  ESCAPE_MINUTES,
  KEY_COUNT,
  SIZES,
  canPlayEscape,
  defaultSize,
  describePool,
  formatClock,
  isLegacy,
  isLive,
  minutesNote,
  poolNotice,
  progressOf,
  progressText,
  remainingAt,
  requiredTasks,
  ruleText,
  sizeOf,
  type EscapeAge,
  type EscapeMinutes,
  type EscapeParams,
  type EscapeSize,
  type NewTasksPerKey,
} from '../../domain/escape';
import type { AgeGroup, ContextTag, Season } from '../../domain/types';
import type { Escape } from '../useEscape';
import type { Game } from '../useGame';

/** Die Einführung zum Vorlesen. Die Waldpost und der Tresor sind der spielerische Rahmen. */
export const ESCAPE_STORY =
  'Die Waldpost hat einen geheimnisvollen Tresor für euch hinterlassen. Darin wartet ein besonderes Waldgeheimnis! Für jeden Schlüssel müsst ihr zwei oder drei verschiedene Dinge im Wald entdecken. Habt ihr drei Schlüssel zusammen, bevor die Sanduhr abgelaufen ist, könnt ihr den Tresor öffnen!';

/** Die gewählte Größe: ausdrückliche Wahl oder die Standardgröße zum Alter. */
export function escapeSizeFor(game: Game): EscapeSize {
  const age = game.draft.age;
  if (game.settings.escapeSize) return game.settings.escapeSize;
  return canPlayEscape(age) ? defaultSize(age) : 'small';
}

/** Die gewählte Suchzeit: ausdrückliche Wahl oder der Standard der Größe (20 Minuten bei sechs, 30 bei neun Aufgaben). */
export function escapeMinutesFor(game: Game, size: EscapeSize): EscapeMinutes {
  const m = game.settings.escapeMinutes;
  return m === 10 || m === 15 || m === 20 || m === 30 ? m : SIZES[size].defaultMinutes;
}

/** Parameter der nächsten Escape-Mission aus der gemeinsamen Einstellungsoberfläche (null, wenn das Alter nicht passt oder fehlt). */
export function escapeParams(game: Game): EscapeParams | null {
  const { draft } = game;
  if (!canPlayEscape(draft.age)) return null;
  const size = escapeSizeFor(game);
  return {
    age: draft.age,
    season: game.effectiveSeason as Season,
    seasonSource: draft.seasonOverride ? 'manual' : 'auto',
    context: draft.context as ContextTag[],
    minutes: escapeMinutesFor(game, size),
    tasksPerKey: SIZES[size].tasksPerKey,
  };
}

/** Alles, was nur für Wald Escape auf dem Startbildschirm steht: Geschichte, ehrliche Erklärung, Altershinweis. */
export function EscapeIntro({ age }: { age: AgeGroup | null }) {
  return (
    <section className="mode-intro" aria-label="Wald Escape: Knackt den Waldtresor!">
      <h2 className="mode-intro-title">Wald Escape: Knackt den Waldtresor!</h2>
      <p>{ESCAPE_STORY}</p>
      <p className="muted">Wald Escape ist für Kinder ab 4 Jahren mit erwachsener Begleitung gedacht, am besten ab 7. Ihr spielt gemeinsam: Eine Entdeckung zählt für das ganze Team.</p>
      {age === '2-3' && (
        <p className="age-note" role="status">
          Wald Escape ist für Kinder ab 4 Jahren mit erwachsener Begleitung gedacht. Für euch wartet die Waldschatzsuche.
        </p>
      )}
    </section>
  );
}

/** Größe der Mission: zwei oder drei Entdeckungen je Schlüssel. Immer drei Schlüssel. */
export function EscapeSizePicker({ value, age, onChange }: { value: EscapeSize; age: AgeGroup | null; onChange: (s: EscapeSize) => void }) {
  const suggested: EscapeSize | null = canPlayEscape(age) ? defaultSize(age) : null;
  return (
    <fieldset className="group duration">
      <legend className="group-title">Wie groß soll die Mission sein?</legend>
      <div className="duration-grid">
        {(['small', 'large'] as const).map((s) => {
          const info = SIZES[s];
          return (
            <label key={s} className="choice">
              <input type="radio" name="escape-size" value={s} checked={value === s} onChange={() => onChange(s)} />
              <span className="choice-face">
                <span className="choice-main">{info.label}</span>
                <span className="choice-sub">
                  {info.tasksPerKey} Entdeckungen pro Schlüssel · {KEY_COUNT} Schlüssel · insgesamt {info.required} Aufgaben{suggested === s ? ' (Standard für dieses Alter)' : ''}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function EscapeDuration({ value, size, onChange }: { value: EscapeMinutes; size: EscapeSize; onChange: (m: EscapeMinutes) => void }) {
  const required = SIZES[size].required;
  return (
    <fieldset className="group duration">
      <legend className="group-title">Wie lange soll die Sanduhr laufen?</legend>
      <div className="duration-grid">
        {ESCAPE_MINUTES.map((n) => (
          <label key={n} className="choice">
            <input type="radio" name="escape-minutes" value={n} checked={value === n} onChange={() => onChange(n)} />
            <span className="choice-face">
              <span className="choice-main">{n} Minuten</span>
              <span className="choice-sub">
                {minutesNote(n, required)}
                {n === SIZES[size].defaultMinutes ? ' (Standard)' : ''}
              </span>
            </span>
          </label>
        ))}
      </div>
      <p className="muted">Die Zeiten sind Ausgangswerte. Sie wurden noch nicht mit Familien erprobt und können für euch zu kurz oder zu lang sein.</p>
    </fieldset>
  );
}

/** Transparenter Start: Regeln in einfachen Worten, ehrliche Kartenzahl, Sicherheitszeile. */
export function EscapeRules({ params }: { params: EscapeParams | null }) {
  const tpk: NewTasksPerKey = params?.tasksPerKey ?? 2;
  const info = params ? describePool(params) : null;
  const target = sizeOf(tpk).offered;
  const notice = info ? poolNotice(info, target) : null;
  const need = requiredTasks(tpk);
  return (
    <section className="mode-rules" aria-label="So läuft Wald Escape">
      <p>
        <strong>{ruleText(tpk)}.</strong> Ihr wählt aus {info && info.cards > 0 ? info.cards : target} Waldaufgaben {need} verschiedene aus. Die Zeit zählt nur während der Suchphase. Infos lesen und Pausen kosten keine Suchzeit. Das letzte Symbolrätsel löst ihr anschließend in Ruhe.
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
export function EscapeResume({ esc, onView }: { esc: Escape; onView: () => void }) {
  const m = esc.mission;
  if (!m) return null;
  const live = isLive(m);
  const rem = formatClock(remainingAt(m, esc.now));
  const p = progressOf(m);
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
          {m.minutes} Minuten · {progressText(p)}
          {isLegacy(m) && ' · frühere Regel'}
          <br />
          {status}
        </p>
      </div>
      {live ? null : (
        <button type="button" className="btn btn-secondary btn-compact" onClick={onView}>
          Ansehen
        </button>
      )}
    </section>
  );
}

export type { EscapeAge };

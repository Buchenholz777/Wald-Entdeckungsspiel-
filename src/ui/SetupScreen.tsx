import { useEffect, useRef, useState } from 'react';
import { gifts, giftsById, type Gift } from '../catalog/gifts';
import { AGE_LABEL, AGE_SUBLINE, CONTEXT_BY_ENV, CONTEXT_LABEL, DEFAULT_TASK_COUNT, SEASON_LABEL } from '../domain/meta';
import { progress } from '../domain/round';
import { AGE_GROUPS, FOREST, SEASONS, type AgeGroup } from '../domain/types';
import { Illustration } from '../illustrations/Illustration';
import { SeasonGlyph } from '../illustrations/scenes';
import { Wordmark } from './Brand';
import { EscapeDuration, EscapeIntro, EscapeResume, EscapeRules, EscapeSizePicker, escapeMinutesFor, escapeParams, escapeSizeFor } from './escape/EscapeSetup';
import { ModeSwitch } from './ModeSwitch';
import { isLive, progressOf, progressText } from '../domain/escape';
import type { Escape } from './useEscape';
import { GiftCard } from './GiftCard';
import type { Game } from './useGame';
import { IconArrow, IconChevron, IconHelp, IconUndo } from './icons';
import { Modal } from './Modal';
import type { Route } from './useRoute';
import { offlineLabel, type PwaInfo } from '../pwa/status';

interface Props {
  game: Game;
  esc: Escape;
  go: (r: Route) => void;
  pwa: PwaInfo;
  /** Hinweis zu einem alten Link (höchstens einmal) */
  legacyLink?: boolean;
}

const contextOptions = CONTEXT_BY_ENV[FOREST];
const HERO_FINDS = ['acorn', 'cone', 'maple-leaf'];

export function SetupScreen({ game, esc, go, pwa, legacyLink }: Props) {
  const { draft, patchDraft, round, archive } = game;
  const mode = game.settings.mode;
  const escParams = escapeParams(game);
  const escSize = escapeSizeFor(game);
  const escMinutes = escapeMinutesFor(game, escSize);
  const liveEsc = isLive(esc.mission) ? esc.mission : null;
  const [confirmEsc, setConfirmEsc] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [errors, setErrors] = useState<{ age?: string; empty?: string }>({});
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [openGift, setOpenGift] = useState<string | null>(null);
  const receivedGifts = game.settings.giftsReceived.map((id) => giftsById[id]).filter((g): g is Gift => Boolean(g));
  const giftAge: AgeGroup = draft.age ?? game.settings.age ?? '4-6';
  const ageRef = useRef<HTMLFieldSetElement>(null);

  const running = round && !round.finished ? round : null;
  const finishedRound = round && round.finished ? round : null;
  const suggestedLabel = SEASON_LABEL[game.suggested];
  const seasonLabel = SEASON_LABEL[game.effectiveSeason];
  const legacyPending = game.settings.legacyNoticePending && archive !== null;

  useEffect(() => {
    if (draft.age) setErrors((e) => ({ ...e, age: undefined }));
  }, [draft.age]);

  const begin = () => {
    if (!draft.age) {
      setErrors({ age: 'Bitte wählt zuerst das Alter des jüngsten Kindes.' });
      ageRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      ageRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
      return;
    }
    if (running) {
      setConfirmNew(true);
      return;
    }
    doStart();
  };

  const doStart = () => {
    const res = game.startRound();
    if (res.ok) go('/runde');
    else if (res.reason === 'empty') setErrors({ empty: 'Dafür haben wir gerade keine passende Station. Ändert die Jahreszeit oder die Angaben unter „Mission anpassen“.' });
  };

  /* Wald Escape: Die Uhr beginnt erst hier, beim bewussten Start. Eine laufende Mission wird nur nach einer klaren Entscheidung ersetzt. */
  const beginEscape = () => {
    if (!draft.age) {
      setErrors({ age: 'Bitte wählt zuerst das Alter des jüngsten Kindes.' });
      ageRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      ageRef.current?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
      return;
    }
    if (!escParams) return;
    if (liveEsc) {
      setConfirmEsc(true);
      return;
    }
    doStartEscape();
  };
  const doStartEscape = () => {
    if (!escParams) return;
    const res = esc.start(escParams);
    if (res.ok) {
      setErrors({});
      go('/escape');
    } else {
      setErrors({ empty: 'Für diese Auswahl gibt es gerade zu wenige passende Waldschätze für eine Zeitmission. Ändert die Jahreszeit oder die Angaben unter „Mission anpassen“, oder spielt die entspannte Waldschatzsuche.' });
    }
  };
  const continueEscape = () => {
    esc.act.enter();
    go('/escape');
  };
  const switchMode = (next: typeof mode) => game.saveSettings({ mode: next });

  /** „Alles auf Anfang“: beendet alle angefangenen Spiele beider Spielmodi. Geschenkbuch und Einstellungen bleiben. */
  const resetAll = () => {
    game.discardRound();
    esc.act.discard();
    setConfirmReset(false);
    setConfirmEsc(false);
    setConfirmNew(false);
    setErrors({});
    game.setAnnounce('Alles auf Anfang. Alle angefangenen Spiele wurden abgebrochen.');
  };

  const toggleContext = (tag: (typeof contextOptions)[number]) => {
    const has = draft.context.includes(tag);
    patchDraft({ context: has ? draft.context.filter((c) => c !== tag) : [...draft.context, tag] });
  };

  const off = offlineLabel(pwa.offline);

  return (
    <div className="screen setup">
      <header className="hero hero-forest">
        <div className="hero-brand">
          <Wordmark size="lg" tagline />
          {/* Drei Dinge, die im Spiel wirklich vorkommen: reine Zierde, deshalb ohne Bildbeschreibung */}
          <ul className="hero-finds" aria-hidden="true">
            {HERO_FINDS.map((key) => (
              <li key={key}>
                <Illustration illustrationKey={key} preset="settle" />
              </li>
            ))}
          </ul>
        </div>
        <h1 className="h1" tabIndex={-1} data-focus-target>
          <span className="h1-line">Der Wald steckt voller Wunder.</span> <span className="h1-line">Entdeckt sie zusammen!</span>
        </h1>
        <p className="lead">
          Zapfen, Waldfrüchte und kleine Spuren: Geht gemeinsam auf Entdeckermission und erfahrt, welche Geheimnisse im Wald stecken. Wählt das Alter eures Kindes – und los geht’s!
        </p>
      </header>

      <ModeSwitch mode={mode} onChange={switchMode} />

      {mode === 'escape' && <EscapeIntro age={draft.age} />}
      {pwa.updateWaiting && (
        <div className="notice" role="status">
          <p>Eine neue Version von Wald-Spiel ist bereit. Eure Waldmission bleibt dabei gespeichert.</p>
          <button type="button" className="btn btn-primary btn-compact" onClick={pwa.applyUpdate}>
            Jetzt aktualisieren
          </button>
        </div>
      )}

      {legacyLink && !legacyPending && (
        <div className="notice" role="status">
          <p>Aus Entdeckerzeit ist Wald-Spiel geworden, und es spielt jetzt nur im Wald. Euer alter Link führt hierher, ins Hauptmenü.</p>
        </div>
      )}

      {game.notice && (
        <div className="notice" role="status">
          <p>{game.notice.text}</p>
          <button type="button" className="btn btn-quiet" onClick={game.dismissNotice}>
            Verstanden
          </button>
        </div>
      )}

      {legacyPending && (
        <div className="notice" role="status">
          <p>Aus Entdeckerzeit ist Wald-Spiel geworden, und es spielt jetzt nur im Wald. Eure frühere Runde ist sicher gespeichert, ihr könnt sie ansehen. Starten könnt ihr eine neue Waldmission.</p>
          <div className="notice-actions">
            <button type="button" className="btn btn-secondary btn-compact" onClick={() => setArchiveOpen(true)}>
              Frühere Runde ansehen
            </button>
            <button type="button" className="btn btn-quiet" onClick={game.dismissLegacyNotice}>
              Verstanden
            </button>
          </div>
        </div>
      )}

      {mode === 'escape' && esc.mission && <EscapeResume esc={esc} onView={continueEscape} />}
      {esc.notice && mode === 'escape' && (
        <div className="notice" role="status">
          <p>{esc.notice}</p>
          <button type="button" className="btn btn-quiet" onClick={esc.act.dismissNotice}>
            Verstanden
          </button>
        </div>
      )}

      {mode === 'treasure' && running && (
        <section className="resume" aria-label="Laufende Waldmission">
          <div>
            <p className="resume-title">{running.mission?.title ?? 'Eure Waldmission läuft noch'}</p>
            <p className="resume-sub">
              {AGE_LABEL[running.age]} · {SEASON_LABEL[running.season]}
              <br />
              {progress(running).done} von {running.tasks.length} Stationen geschafft
              {progress(running).skipped > 0 ? `, ${progress(running).skipped} ausgelassen` : ''}
            </p>
          </div>
        </section>
      )}
      {mode === 'treasure' && finishedRound && (
        <section className="resume" aria-label="Letzte Waldmission">
          <div>
            <p className="resume-title">Eure letzte Waldmission ist abgeschlossen</p>
            <p className="resume-sub">{progress(finishedRound).done} von {finishedRound.tasks.length} Stationen entdeckt</p>
          </div>
          <button type="button" className="btn btn-secondary btn-compact" onClick={() => go('/abschluss')}>
            Fundsammlung ansehen
          </button>
        </section>
      )}

      {mode !== 'detective' && (
      <fieldset className="group" ref={ageRef} aria-describedby={errors.age ? 'err-age' : undefined}>
        <legend className="group-title">Wie alt ist das jüngste Kind?</legend>
        <div className="age-grid">
          {AGE_GROUPS.map((a) => (
            <label key={a} className="choice">
              <input type="radio" name="age" value={a} checked={draft.age === a} onChange={() => patchDraft({ age: a as AgeGroup })} />
              <span className="choice-face">
                <span className="choice-main">{AGE_LABEL[a]}</span>
                <span className="choice-sub">{AGE_SUBLINE[a]}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.age && (
          <p id="err-age" className="field-error" role="alert">
            {errors.age}
          </p>
        )}
      </fieldset>
      )}

      {mode !== 'detective' && (
      <section className="season-row" aria-label="Jahreszeit">
        <div className="season-line">
          <SeasonGlyph season={game.effectiveSeason} />
          <span>
            <span className="season-name">{seasonLabel}</span>
            <span className="season-hint"> {draft.seasonOverride && draft.seasonOverride !== game.suggested ? `(Vorschlag: ${suggestedLabel})` : '(Vorschlag)'}</span>
          </span>
          <span aria-hidden="true">·</span>
          <button type="button" className="link-btn" aria-expanded={seasonOpen} aria-controls="season-picker" onClick={() => setSeasonOpen((o) => !o)}>
            ändern
          </button>
        </div>
        {seasonOpen && (
          <fieldset className="season-picker" id="season-picker">
            <legend className="sr-only">Jahreszeit wählen</legend>
            {SEASONS.map((s) => (
              <label key={s} className="chip">
                <input
                  type="radio"
                  name="season"
                  value={s}
                  checked={game.effectiveSeason === s}
                  onChange={() => patchDraft({ seasonOverride: s === game.suggested ? null : s })}
                />
                <span className="chip-face">
                  <SeasonGlyph season={s} />
                  {SEASON_LABEL[s]}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </section>
      )}

      {mode === 'escape' && draft.age !== '2-3' && (
        <EscapeSizePicker value={escSize} age={draft.age} onChange={(size) => game.saveSettings({ escapeSize: size, escapeMinutes: null })} />
      )}
      {mode === 'escape' && draft.age !== '2-3' && (
        <EscapeDuration value={escMinutes} size={escSize} onChange={(minutes) => game.saveSettings({ escapeMinutes: minutes, escapeSize: escSize })} />
      )}

      {mode !== 'detective' && (
      <section className="adjust">
        <button type="button" className="adjust-toggle" aria-expanded={adjustOpen} aria-controls="adjust-panel" onClick={() => setAdjustOpen((o) => !o)}>
          Mission anpassen
          <IconChevron open={adjustOpen} />
        </button>
        {adjustOpen && (
          <div id="adjust-panel" className="adjust-panel">
            {mode === 'treasure' && (
            <fieldset className="subgroup">
              <legend className="sub-title">Wie viele Stationen?</legend>
              <div className="count-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label key={n} className="chip chip-round">
                    <input type="radio" name="count" value={n} checked={game.effectiveCount === n} onChange={() => patchDraft({ taskCount: n === (draft.age ? DEFAULT_TASK_COUNT[draft.age] : 3) ? null : n })} />
                    <span className="chip-face">{n}</span>
                  </label>
                ))}
              </div>
              <p className="muted">Standard: {draft.age ? DEFAULT_TASK_COUNT[draft.age] : 'je nach Alter 3 oder 5'}.</p>
            </fieldset>
            )}

            {mode === 'treasure' && draft.age && draft.age !== '2-3' && (
              <label className="switch-row">
                <input type="checkbox" checked={draft.boost} onChange={(e) => patchDraft({ boost: e.target.checked })} />
                <span className="switch" aria-hidden="true" />
                <span>
                  <span className="switch-title">Mehr zählen</span>
                  <span className="muted block">Größere Mengen, aber nur bei Fundstücken, die sich zum Zählen eignen.</span>
                </span>
              </label>
            )}

            <fieldset className="subgroup">
              <legend className="sub-title">Was seht ihr hier? (freiwillig)</legend>
              <p className="muted">Nur wenn ihr es seht, schlagen wir dazu passende Stationen vor.</p>
              <div className="chip-wrap">
                {contextOptions.map((tag) => (
                  <label key={tag} className="chip">
                    <input type="checkbox" checked={draft.context.includes(tag)} onChange={() => toggleContext(tag)} />
                    <span className="chip-face">{CONTEXT_LABEL[tag]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </section>
      )}

      {mode === 'escape' && <EscapeRules params={escParams} />}
      {mode === 'escape' && draft.age === '2-3' && (
        <div className="mode-intro-actions">
          <button type="button" className="btn btn-primary" onClick={() => switchMode('treasure')}>
            Zur Waldschatzsuche wechseln
          </button>
        </div>
      )}

      {errors.empty && (
        <p className="field-error" role="alert">
          {errors.empty}
        </p>
      )}

      {receivedGifts.length > 0 && (
        <section className="resume gift-book" aria-label="Unsere Waldgeheimnisse">
          <div>
            <p className="resume-title">Unsere Waldgeheimnisse</p>
            <p className="resume-sub">
              {receivedGifts.length} von {gifts.length} Waldgeschenken erhalten
            </p>
          </div>
          <button type="button" className="btn btn-secondary btn-compact" onClick={() => setBookOpen(true)}>
            Ansehen
          </button>
        </section>
      )}

      <footer className="setup-foot">
        <p className={`offline-line tone-${off.tone}`}>
          <span className="dot" aria-hidden="true" />
          {off.short}
        </p>
        <button type="button" className="link-btn" onClick={() => go('/hilfe')}>
          <IconHelp /> Hilfe &amp; Datenhinweis
        </button>
        {(round || esc.mission) && (
          <button type="button" className="link-btn" onClick={() => setConfirmReset(true)}>
            <IconUndo /> Alles auf Anfang
          </button>
        )}
      </footer>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Alles auf Anfang?" onHome={undefined}>
        <p>
          Alle angefangenen Spiele werden abgebrochen und zurückgestellt:
        </p>
        <ul className="reset-list">
          {round && (
            <li>
              Waldschätze suchen: {running ? `die laufende Waldmission (${progress(running).done} von ${running.tasks.length} Stationen geschafft)` : 'die letzte, abgeschlossene Waldmission'}
            </li>
          )}
          {esc.mission && (
            <li>
              Wald Escape: {liveEsc ? `die laufende Mission (${progressText(progressOf(liveEsc))})` : 'die letzte Mission mit ihrem Abschluss'}
            </li>
          )}
        </ul>
        <p className="muted">Eure gesammelten Waldgeheimnisse (Waldgeschenke) und eure Einstellungen bleiben erhalten. Das lässt sich nicht rückgängig machen.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={() => setConfirmReset(false)}>
            Nein, alles behalten
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetAll}>
            Ja, alles auf Anfang
          </button>
        </div>
      </Modal>

      {mode === 'treasure' && (
        <div className="action-bar">
          {running ? (
            <div className="action-split">
              {/* Bei einer laufenden Runde ist „Weiterspielen“ die Hauptaktion und öffnet genau diesen Spielstand; „Neue Runde“ ist die getrennte Nebenaktion (mit Rückfrage). */}
              <button type="button" className="btn btn-primary btn-big" onClick={() => go('/runde')}>
                Weiterspielen <IconArrow />
              </button>
              <button type="button" className="btn btn-secondary btn-big" onClick={begin}>
                Neue Runde
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary btn-big" onClick={begin}>
              Waldmission starten
            </button>
          )}
        </div>
      )}
      {mode === 'escape' && draft.age !== '2-3' && (
        <div className="action-bar">
          {liveEsc ? (
            <div className="action-split">
              <button type="button" className="btn btn-primary btn-big" onClick={continueEscape}>
                Weiterspielen <IconArrow />
              </button>
              <button type="button" className="btn btn-secondary btn-big" onClick={beginEscape}>
                Neue Runde
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary btn-big" onClick={beginEscape}>
              Sanduhr starten
            </button>
          )}
        </div>
      )}

      <Modal open={confirmEsc} onClose={() => setConfirmEsc(false)} title="Neue Wald-Escape-Mission?" onHome={undefined}>
        <p>
          Eure Wald-Escape-Mission läuft noch ({liveEsc ? progressText(progressOf(liveEsc)) : ''}). Mit einer neuen Mission wird sie ersetzt. Waldschätze suchen bleibt unberührt.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={() => setConfirmEsc(false)}>
            Behalten
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setConfirmEsc(false);
              doStartEscape();
            }}
          >
            Neue Mission, Sanduhr starten
          </button>
        </div>
      </Modal>

      <Modal open={confirmNew} onClose={() => setConfirmNew(false)} title="Neue Waldmission starten?" onHome={undefined}>
        <p>
          Eure Waldmission läuft noch ({running ? progress(running).done : 0} von {running?.tasks.length ?? 0} Stationen geschafft). Mit einer neuen Waldmission wird die laufende ersetzt.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={() => setConfirmNew(false)}>
            Behalten
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setConfirmNew(false);
              doStart();
            }}
          >
            Neue Waldmission
          </button>
        </div>
      </Modal>

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Unsere Waldgeheimnisse" className="modal-info" onHome={undefined}>
        <p className="muted">Hier könnt ihr die Waldgeschenke aus euren Missionen noch einmal lesen. Es sind Geschichten aus dem Wald, keine Fundlisten: Welche Tiere und Pflanzen darin vorkommen, habt ihr nicht unbedingt gesehen.</p>
        <ul className="gift-list">
          {[...receivedGifts].reverse().map((g) => (
            <li key={g.id}>
              <button type="button" className="menu-item" aria-expanded={openGift === g.id} onClick={() => setOpenGift((o) => (o === g.id ? null : g.id))}>
                <span>{g.title}</span>
              </button>
              {openGift === g.id && <GiftCard gift={g} age={giftAge} />}
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={() => setBookOpen(false)}>
            Schließen
          </button>
        </div>
      </Modal>

      <Modal open={archiveOpen} onClose={() => setArchiveOpen(false)} title="Eure frühere Runde" onHome={undefined}>
        {archive ? (
          <>
            <p className="muted">
              Diese Runde stammt aus der Zeit vor dem Wald-Umbau. Sie bleibt gespeichert und wird nur angezeigt. {AGE_LABEL[archive.age]}, {SEASON_LABEL[archive.season]}.
            </p>
            <ul className="archive-list">
              {archive.tasks.map((t) => (
                <li key={t.uid}>
                  {t.title}: {t.status === 'done' ? 'geschafft' : t.status === 'skipped' ? 'ausgelassen' : 'offen'}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Keine frühere Runde gefunden.</p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={() => setArchiveOpen(false)}>
            Schließen
          </button>
        </div>
      </Modal>
    </div>
  );
}

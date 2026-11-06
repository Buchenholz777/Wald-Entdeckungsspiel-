import { useEffect, useRef, useState } from 'react';
import { concepts } from '../../catalog/concepts';
import { giftsById } from '../../catalog/gifts';
import {
  KEY_COUNT,
  SYMBOL_INFO,
  completedTasks,
  describeClue,
  formatClock,
  keyGroups,
  missingText,
  progressOf,
  progressText,
  requiredOf,
  resultLine,
  solutionText,
  spokenClock,
  timeupText,
  tipText,
  type EscapeMission,
  type EscapeTask,
} from '../../domain/escape';
import { SEASON_LABEL } from '../../domain/meta';
import { Illustration } from '../../illustrations/Illustration';
import { isStillArt } from '../../illustrations/registry';
import { Confetti, canCelebrateWithMotion } from '../Confetti';
import { GiftCard } from '../GiftCard';
import { IconArrow, IconCheck, IconChevron, IconHome, IconInfo, IconReplay, IconUndo, IconZoom } from '../icons';
import { Modal } from '../Modal';
import type { Route } from '../useRoute';
import type { Escape } from '../useEscape';
import { Hourglass, SymbolIcon, Vault, type LockState } from './EscapeArt';

interface Props {
  esc: Escape;
  motionOff: boolean;
  go: (r: Route) => void;
}

const subject = (t: EscapeTask) => concepts[t.conceptId]?.label ?? t.title;

function counterText(t: EscapeTask): string {
  if (t.status === 'done') return 'Geschafft';
  if (t.target === 1) return 'Noch nicht gefunden';
  return `${t.found} von ${t.target} ${t.unit ?? 'Dingen'} gefunden`;
}

function shortStatus(t: EscapeTask): string {
  if (t.status === 'done') return 'Geschafft';
  if (t.target === 1) return 'Offen';
  return `${t.found} von ${t.target}`;
}

export function EscapeScreen({ esc, motionOff, go }: Props) {
  const m = esc.mission!;
  if (m.phase === 'combination') return <Combination esc={esc} m={m} go={go} />;
  if (m.phase === 'opened' || m.phase === 'ended') return <Result esc={esc} m={m} motionOff={motionOff} go={go} />;
  return <Search esc={esc} m={m} go={go} />;
}

/* ============================ Suchphase ============================ */

type SearchDialog = null | 'zoom' | 'info' | 'swap' | 'noalt' | 'help';

/** Wo steht eine erledigte Karte? Schlüssel- und Fragmentnummer (1-basiert), aus der Reihenfolge der Abschlüsse abgeleitet. */
function placeOf(m: EscapeMission, uid: string): { key: number; fragment: number } | null {
  const i = m.completed.findIndex((c) => c.uid === uid);
  if (i < 0) return null;
  return { key: Math.floor(i / m.tasksPerKey) + 1, fragment: (i % m.tasksPerKey) + 1 };
}

/**
 * Genau drei Schlüsselplätze. Jeder zeigt seine 2–3 Fragmentpositionen: belegt = Häkchen und Bild, frei = gestrichelt mit Nummer
 * (nicht nur Farbe). Ein Schlüssel erscheint erst, wenn seine ganze Gruppe erledigt ist. Die Zahlen kommen aus `progressOf`.
 */
function KeySlots({ m, newestKey, newestFragment }: { m: EscapeMission; newestKey: number | null; newestFragment: string | null }) {
  const p = progressOf(m);
  const groups = keyGroups(m);
  return (
    <section className="key-slots" aria-label="Eure Schlüssel">
      <p className="key-count" id="key-count">
        {progressText(p)}
      </p>
      <ol className="slots" aria-labelledby="key-count">
        {groups.map((g) => {
          const info = g.complete ? SYMBOL_INFO[g.symbol] : null;
          const current = !p.complete && g.index === p.keys;
          const positions = Array.from({ length: m.tasksPerKey }, (_, f) => g.fragments[f] ?? null);
          return (
            <li
              key={g.index}
              className={`slot${g.complete ? ' slot-full' : ''}${current ? ' slot-current' : ''}${newestKey === g.index ? ' slot-new' : ''}`}
              aria-label={g.complete ? `Schlüssel ${g.index + 1}: ${info!.name}, fertig` : `Schlüssel ${g.index + 1}: ${g.fragments.length} von ${m.tasksPerKey} Entdeckungen`}
            >
              <span className="slot-art" aria-hidden="true">
                {g.complete ? <SymbolIcon symbol={g.symbol} size={38} /> : <LockMark />}
              </span>
              <span className="slot-label">
                <strong>{g.complete ? info!.name : `Schlüssel ${g.index + 1}`}</strong>
                <span className="slot-sub">{g.complete ? 'fertig' : `${g.fragments.length} von ${m.tasksPerKey}`}</span>
              </span>
              <span className="frags" aria-hidden="true">
                {positions.map((c, f) => {
                  const task = c ? m.tasks.find((t) => t.uid === c.uid) : null;
                  return (
                    <span key={f} className={`frag${c ? ' frag-full' : ''}${c && c.uid === newestFragment ? ' frag-new' : ''}`}>
                      {c ? (
                        <>
                          {task && <Illustration illustrationKey={task.image.illustrationKey} preset={task.image.animationPreset} />}
                          <span className="frag-check">
                            <IconCheck size={12} />
                          </span>
                        </>
                      ) : (
                        <span className="frag-no">{f + 1}</span>
                      )}
                    </span>
                  );
                })}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="key-missing">{missingText(p)}</p>
    </section>
  );
}

function LockMark() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" focusable="false">
      <path d="M12 18 V13 a8 8 0 0 1 16 0 V18" fill="none" stroke="#8a7a62" strokeWidth="3" strokeLinecap="round" />
      <rect x="8" y="18" width="24" height="18" rx="5" fill="#e6dcc6" stroke="#8a7a62" strokeWidth="2.6" />
      <circle cx="20" cy="26" r="2.6" fill="#8a7a62" />
    </svg>
  );
}

function TimePanel({ esc, m }: { esc: Escape; m: EscapeMission }) {
  const pausedManually = m.pauses.includes('manual');
  const state = m.phase === 'timeup' ? 'expired' : m.phase === 'free' ? 'expired' : esc.running ? 'running' : 'paused';
  const fraction = m.phase === 'searching' ? esc.remainingMs / m.clock.durationMs : 0;
  const low = esc.running && esc.remainingMs <= 60_000 && esc.remainingMs > 0;
  const free = m.phase === 'free';
  const label = m.phase === 'timeup' ? 'Zeit abgelaufen' : free ? 'Ohne Zeitdruck' : pausedManually || m.pauses.length > 0 ? 'Pausiert' : low ? 'Noch etwa eine Minute' : 'Suchzeit läuft';
  return (
    <section className={`time-panel${low ? ' time-low' : ''}${free ? ' time-free' : ''}`} aria-label="Sanduhr">
      <Hourglass fraction={fraction} state={state === 'expired' ? 'expired' : state} size={52} />
      <div className="time-text">
        {free ? (
          <p className="time-clock time-clock-free">Suchen ohne Zeitdruck</p>
        ) : (
          <p className="time-clock" role="timer" aria-label={`Verbleibende Suchzeit: ${spokenClock(esc.remainingMs)}`} aria-live="off">
            {formatClock(esc.remainingMs)}
          </p>
        )}
        <p className="time-label">{label}</p>
      </div>
      {m.phase === 'searching' && !pausedManually && (
        <button type="button" className="btn btn-secondary btn-compact time-pause" onClick={esc.act.pause}>
          Pause
        </button>
      )}
    </section>
  );
}

function Search({ esc, m, go }: { esc: Escape; m: EscapeMission; go: (r: Route) => void }) {
  const A = esc.act;
  const task = m.tasks[m.activeIndex] ?? m.tasks[0];
  const still = isStillArt(task.image.illustrationKey);
  const [dialog, setDialog] = useState<SearchDialog>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [play, setPlay] = useState(true);
  const [playId, setPlayId] = useState(0);
  const [newestKey, setNewestKey] = useState<number | null>(null);
  const [newestFragment, setNewestFragment] = useState<string | null>(null);
  const [keyBanner, setKeyBanner] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const prog = progressOf(m);
  const prevDone = useRef(prog.done);
  const prevKeys = useRef(prog.keys);

  // Ein echter Dialog pausiert die Suchzeit automatisch und gibt sie beim Schließen wieder frei.
  useEffect(() => {
    A.dialog(dialog !== null);
    return () => {
      if (dialog !== null) A.dialog(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog !== null]);

  useEffect(() => {
    setPlay(true);
    setPlayId((n) => n + 1);
    setSearchOpen(false);
    setDialog(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.uid]);

  // Ruhige Rückmeldung: Ein neues Fragment setzt sich nur an seinen Platz. Erst eine volle Gruppe zeigt „Schlüssel n geschafft!“.
  // Die Zahlen kommen aus der Fortschrittsfunktion; die Animation ist nie die Quelle des Zustands.
  useEffect(() => {
    const done = prog.done;
    const keys = prog.keys;
    let timer: number | undefined;
    if (done > prevDone.current) {
      const last = m.completed[done - 1];
      if (keys > prevKeys.current) {
        setNewestKey(keys - 1);
        setKeyBanner(`Schlüssel ${keys} geschafft!`);
        timer = window.setTimeout(() => {
          setNewestKey(null);
          setKeyBanner(null);
        }, 2200);
      } else if (last) {
        setNewestFragment(last.uid);
        timer = window.setTimeout(() => setNewestFragment(null), 900);
      }
    }
    prevDone.current = done;
    prevKeys.current = keys;
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [prog.done, prog.keys, m.completed]);

  const paused = m.phase === 'searching' && m.pauses.includes('manual');
  const timeup = m.phase === 'timeup';
  const nextOpen = m.tasks.findIndex((t, i) => i !== m.activeIndex && t.status === 'open');
  const close = () => setDialog(null);
  const home = () => {
    A.leave();
    setDialog(null);
    go('/');
  };

  const onMain = () => {
    if (task.status === 'open') A.found(task.uid);
    else if (nextOpen >= 0) A.select(nextOpen);
  };
  const mainLabel = task.status !== 'open' ? 'Weiter entdecken' : task.target === 1 ? 'Gefunden!' : 'Eins gefunden';
  const doSwap = () => {
    const ok = A.swap(task.uid);
    setDialog(ok ? null : 'noalt');
  };

  return (
    <div className="screen escape-screen">
      <header className="esc-head">
        <h1 className="esc-title" tabIndex={-1} data-focus-target>
          Wald Escape <span className="esc-sub">Knackt den Waldtresor!</span>
        </h1>
        <p className="context-line">
          {m.minutes} Minuten · {SEASON_LABEL[m.season]} · {requiredOf(m)} Aufgaben für {KEY_COUNT} Schlüssel
        </p>
      </header>

      <TimePanel esc={esc} m={m} />
      <KeySlots m={m} newestKey={newestKey} newestFragment={newestFragment} />
      {keyBanner && (
        <p className="key-banner" aria-hidden="true">
          {keyBanner}
        </p>
      )}

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {esc.announce}
      </div>

      {esc.notice && (
        <p className="notice-inline" role="status">
          {esc.notice} <button type="button" className="btn btn-quiet" onClick={A.dismissNotice}>Verstanden</button>
        </p>
      )}

      {timeup && (
        <section className="timeup" aria-label="Zeit abgelaufen">
          <h2 className="timeup-title">Die Sanduhr ist durch – der Tresor wartet auf euch!</h2>
          <p>{timeupText(prog)}</p>
          <p>Möchtet ihr in Ruhe weitersuchen?</p>
          <div className="timeup-actions">
            <button type="button" className="btn btn-primary btn-big" onClick={A.free}>
              Ohne Zeitdruck weitersuchen
            </button>
            <button type="button" className="btn btn-secondary" onClick={A.end}>
              Für heute beenden
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => { A.leave(); go('/'); }}>
              <IconHome /> Hauptmenü
            </button>
          </div>
          <p className="muted">Die Funde und Schlüssel bleiben. Eine neue Zeitmission startet ihr im Hauptmenü.</p>
        </section>
      )}

      {paused && (
        <section className="pause-panel" aria-label="Pausiert">
          <h2 className="pause-title">Pausiert</h2>
          <p className="pause-clock">{formatClock(esc.remainingMs)}</p>
          <p className="muted">Die Sanduhr steht. Nehmt euch alle Zeit, die ihr braucht.</p>
          <div className="timeup-actions">
            <button type="button" className="btn btn-primary btn-big" onClick={A.resume}>
              Weitersuchen
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { A.leave(); go('/'); }}>
              <IconHome /> Hauptmenü
            </button>
          </div>
        </section>
      )}

      {!timeup && !paused && (
        <>
          <nav className="esc-cards" aria-label={`Eure ${m.tasks.length} Waldaufgaben zur Wahl`}>
            <p className="esc-cards-title">
              Eure Waldaufgaben <span className="muted">(ihr braucht {requiredOf(m)} von {m.tasks.length})</span>
            </p>
            <ol>
              {m.tasks.map((t, i) => (
                <li key={t.uid}>
                  <button
                    type="button"
                    className={`esc-card-btn status-${t.status}${i === m.activeIndex ? ' is-active' : ''}`}
                    aria-current={i === m.activeIndex ? 'true' : undefined}
                    aria-label={`Karte ${i + 1}: ${t.title}. ${shortStatus(t)}`}
                    onClick={() => A.select(i)}
                  >
                    <span className="thumb">
                      <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} />
                    </span>
                    <span className="esc-card-state" aria-hidden="true">
                      {t.status === 'done' ? <IconCheck size={16} /> : t.target > 1 && t.found > 0 ? `${t.found}/${t.target}` : i + 1}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button type="button" className="help-toggle" aria-expanded={listOpen} aria-controls="esc-task-list" onClick={() => setListOpen((o) => !o)}>
              Übersicht: Eure Waldaufgaben
              <IconChevron open={listOpen} />
            </button>
            {listOpen && (
              <ul id="esc-task-list" className="task-list">
                {m.tasks.map((t, i) => {
                  const where = placeOf(m, t.uid);
                  return (
                    <li key={t.uid}>
                      <button type="button" className={`task-row status-${t.status}${i === m.activeIndex ? ' is-active' : ''}`} onClick={() => A.select(i)}>
                        <span className="task-row-thumb" aria-hidden="true">
                          <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} />
                        </span>
                        <span className="task-row-text">
                          <strong>{t.title}</strong>
                          <span className="muted">
                            {where ? `Geschafft · Schlüssel ${where.key}, Entdeckung ${where.fragment}` : t.target > 1 && t.found > 0 ? `${t.found} von ${t.target} ${t.unit ?? 'Dingen'}` : 'Noch offen'}
                          </span>
                        </span>
                        {t.status === 'done' && <IconCheck size={18} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <article className={`card status-${task.status}`} aria-labelledby="esc-task-title">
            <div className="card-art">
              <button type="button" className="art-btn" onClick={() => setDialog('zoom')} aria-label={`Bild vergrößern: ${task.image.alt}`}>
                <Illustration illustrationKey={task.image.illustrationKey} preset={task.image.animationPreset} play={play} playId={playId} />
                <span className="art-hint">
                  <IconZoom /> Größer ansehen
                </span>
              </button>
              <button type="button" className="icon-btn info-btn" onClick={() => setDialog('info')} aria-label={`Info zu: ${subject(task)}`}>
                <IconInfo />
              </button>
              {!still && (
                <button type="button" className="icon-btn replay-btn" onClick={() => { setPlay(true); setPlayId((n) => n + 1); }} aria-label="Bewegung noch einmal ansehen">
                  <IconReplay />
                </button>
              )}
              {task.status === 'done' && (
                <span className="done-badge" aria-hidden="true">
                  <IconCheck size={30} />
                </span>
              )}
            </div>
            <p className="example-note">So kann es aussehen. Euer Fund darf etwas anders sein.</p>
            <div className="card-body">
              <h2 id="esc-task-title" className="task-title">
                {task.prompt}
              </h2>
              <p className={`counter${task.status === 'done' ? ' counter-done' : ''}`}>
                {task.status === 'done' && <IconCheck size={20} />}
                {counterText(task)}
              </p>
              <p className="key-promise">
                <IconCheck size={22} />
                <span>
                  {(() => {
                    const where = placeOf(m, task.uid);
                    if (where) return <>Geschafft: Entdeckung {where.fragment} von {m.tasksPerKey} für <strong>Schlüssel {where.key}</strong>.</>;
                    return m.tasksPerKey > 1 ? <>{m.tasksPerKey} verschiedene Entdeckungen ergeben einen Schlüssel.</> : <>Diese Entdeckung ergibt einen Schlüssel.</>;
                  })()}
                </span>
              </p>
              <button type="button" className="help-toggle" aria-expanded={searchOpen} aria-controls="esc-search-panel" onClick={() => setSearchOpen((o) => !o)}>
                Such-Hinweis
                <IconChevron open={searchOpen} />
              </button>
              {searchOpen && (
                <div id="esc-search-panel" className="discover">
                  <p className="search-text">{task.info.whereToLook}</p>
                  {task.hint && <p className="search-hint">{task.hint}</p>}
                </div>
              )}
              <p className="muted">Alle bleiben zusammen. Anschauen und Zeigen genügt.</p>
            </div>
          </article>

          <div className="action-bar action-bar-round">
            <button type="button" className={`btn btn-primary btn-big${task.status !== 'open' ? ' btn-next' : ''}`} onClick={onMain} disabled={task.status !== 'open' && nextOpen < 0}>
              {mainLabel}
              {task.status !== 'open' && <IconArrow />}
            </button>
            <div className="action-row">
              <button type="button" className="btn btn-secondary" onClick={() => A.undo(task.uid)} disabled={task.status !== 'done' && task.found === 0}>
                <IconUndo /> Rückgängig
              </button>
              {task.status === 'open' && (
                <button type="button" className="btn btn-secondary" onClick={() => setDialog('swap')}>
                  Andere Spur suchen
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <Modal open={dialog === 'zoom'} onClose={close} title={task.title} className="modal-zoom" onHome={home}>
        <div className="zoom-art">
          <Illustration illustrationKey={task.image.illustrationKey} preset={task.image.animationPreset} alt={task.image.alt} play={play} playId={`z${playId}`} />
        </div>
        <section className="features" aria-label="So kann es aussehen">
          <h3>So kann es aussehen</h3>
          <ul>
            {task.image.recognitionFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="muted">Euer Fund darf anders aussehen. Das Bild ist nur ein Beispiel. Die Suchzeit steht, solange dieses Fenster offen ist.</p>
        </section>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={close}>
            Fertig
          </button>
        </div>
      </Modal>

      <Modal open={dialog === 'info'} onClose={close} title={`Info: ${subject(task)}`} className="modal-info" onHome={home}>
        <div className="info-motif">
          <Illustration illustrationKey={task.image.illustrationKey} preset={task.image.animationPreset} />
        </div>
        <p className="muted">Die Suchzeit steht, solange ihr lest.</p>
        <div className="info-sections">
          <section>
            <h3>Das habt ihr vor euch</h3>
            <p>{task.info.whatIsIt}</p>
          </section>
          <section>
            <h3>So ist es entstanden</h3>
            <p>{task.info.origin}</p>
          </section>
          {task.special && (
            <section>
              <h3>Sein kleines Waldgeheimnis</h3>
              <p>{task.special}</p>
            </section>
          )}
          {task.extra && (
            <section className="info-think">
              <h3>Zum Nachdenken</h3>
              <p>{task.extra}</p>
            </section>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={close}>
            Fertig
          </button>
        </div>
      </Modal>

      <Modal open={dialog === 'swap'} onClose={close} title="Andere Spur suchen?" onHome={home}>
        <p>Diese Karte wird durch eine andere ersetzt: „{task.title}“. Die Suchzeit steht, bis ihr euch entschieden habt. Es kostet nichts.</p>
        {task.found > 0 && (
          <p className="notice-inline">
            Bisher gefunden: {task.found} von {task.target}. Dieser Teilfortschritt geht bei der ersetzten Karte verloren. Alle anderen Funde und Schlüssel bleiben.
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={doSwap}>
            Andere Spur suchen
          </button>
          <button type="button" className="btn btn-secondary" onClick={close}>
            Doch behalten
          </button>
        </div>
      </Modal>

      <Modal open={dialog === 'noalt'} onClose={close} title="Keine andere Spur übrig" onHome={home}>
        <p>Dazu fällt uns gerade nichts Passendes mehr ein. Ihr habt noch {m.tasks.filter((t) => t.status === 'open').length} offene Karten zur Wahl, und ihr braucht insgesamt {requiredOf(m)} Aufgaben für {KEY_COUNT} Schlüssel. Wählt eine andere Karte oder beendet für heute.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={close}>
            Zurück zu den Karten
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => { setDialog(null); A.end(); }}>
            Für heute beenden
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ============================ Kombination ============================ */

type CombDialog = null | 'correct';

function KeyStrip({ order }: { order: EscapeMission['input'] }) {
  return (
    <ol className="strip" aria-label="Reihenfolge von links nach rechts">
      {order.map((s, i) => (
        <li key={i} className="strip-item">
          <span className="strip-no" aria-hidden="true">
            {i + 1}
          </span>
          {s ? <SymbolIcon symbol={s} size={44} /> : <LockMark />}
          <span className="strip-name">{s ? SYMBOL_INFO[s].name : 'leer'}</span>
        </li>
      ))}
    </ol>
  );
}

function Combination({ esc, m, go }: { esc: Escape; m: EscapeMission; go: (r: Route) => void }) {
  const A = esc.act;
  const [wrong, setWrong] = useState(false);
  const [dialog, setDialog] = useState<CombDialog>(null);
  const solution = m.solution!;
  const full = m.input.every((s) => s !== null);
  const young = m.age === '4-6';
  const owned = m.keySymbols;
  const close = () => setDialog(null);
  const home = () => {
    setDialog(null);
    A.leave();
    go('/');
  };

  const tryOpen = () => {
    const ok = A.open();
    setWrong(!ok);
  };

  return (
    <div className="screen escape-screen">
      <header className="esc-head">
        <h1 className="esc-title" tabIndex={-1} data-focus-target>
          Der Waldtresor wartet! <span className="esc-sub">Drei Schlüssel sind da</span>
        </h1>
        <p className="success-line" role="status">
          {m.outcome === 'onTime' ? 'Suchzeit geschafft. Alle drei Schlüssel rechtzeitig gefunden.' : 'Alle drei Schlüssel sind gefunden.'}
        </p>
        <p className="muted">Jetzt gibt es keinen Countdown mehr. Löst das Symbolrätsel in Ruhe.</p>
      </header>

      <div className="vault-wrap">
        <Vault state="ready" locks={['ready', 'ready', 'ready']} size={150} />
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {esc.announce}
      </div>

      <section className="comb-help" aria-label="So öffnet ihr den Tresor">
        {young ? (
          <>
            <p className="comb-lead">Setzt eure drei Waldschlüssel so ein wie auf dem Streifen!</p>
            <KeyStrip order={solution} />
          </>
        ) : (
          <>
            <p className="comb-lead">Setzt die drei Waldschlüssel von links nach rechts in die richtige Reihenfolge. Diese Hinweise helfen euch:</p>
            <ul className="clues">
              {m.clues!.map((c, i) => (
                <li key={i}>{describeClue(c)}</li>
              ))}
            </ul>
            {m.hints >= 1 && <p className="hint-box">{tipText(solution)}</p>}
            {m.hints >= 2 && (
              <div className="hint-box">
                <p>Lösungsbeispiel: {solutionText(solution)}</p>
                <KeyStrip order={solution} />
              </div>
            )}
          </>
        )}
      </section>

      <section aria-label="Eure Tresorplätze">
        <h2 className="comb-h">Eure Tresorplätze (links nach rechts)</h2>
        <ol className="comb-slots" role="group" aria-label="Tresorplätze von links nach rechts">
          {m.input.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={`comb-slot${s ? ' filled' : ''}`}
                onClick={() => (s ? A.clear(i) : undefined)}
                aria-label={s ? `Platz ${i + 1}: ${SYMBOL_INFO[s].name}. Antippen zum Entfernen.` : `Platz ${i + 1}: noch leer`}
              >
                <span className="comb-no" aria-hidden="true">
                  {i + 1}
                </span>
                {s ? <SymbolIcon symbol={s} size={52} /> : <LockMark />}
                <span className="comb-name">{s ? SYMBOL_INFO[s].name : 'leer'}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Eure drei Waldschlüssel">
        <h2 className="comb-h">Eure drei Waldschlüssel (antippen zum Einsetzen)</h2>
        <ul className="tray">
          {owned.map((s) => {
            const placed = m.input.includes(s);
            return (
              <li key={s}>
                <button type="button" className="tray-key" disabled={placed} onClick={() => { A.place(s); setWrong(false); }} aria-label={placed ? `${SYMBOL_INFO[s].name}: schon eingesetzt` : `${SYMBOL_INFO[s].name} einsetzen`}>
                  <SymbolIcon symbol={s} size={48} />
                  <span>{SYMBOL_INFO[s].name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {wrong && (
        <p className="wrong-note" role="status">
          Schaut noch einmal auf die Reihenfolge. Ihr könnt es gleich wieder versuchen.
        </p>
      )}

      <div className="action-bar action-bar-round">
        <button type="button" className="btn btn-primary btn-big" onClick={tryOpen} disabled={!full}>
          Tresor öffnen
        </button>
      </div>

      <div className="comb-more">
        <div className="action-row">
          {!young && m.hints < 2 && (
            <button type="button" className="btn btn-secondary" onClick={A.hint}>
              {m.hints === 0 ? 'Tipp' : 'Lösungsbeispiel'}
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={A.helpOpen}>
            Gemeinsam öffnen
          </button>
        </div>
        <button type="button" className="btn btn-quiet" onClick={() => setDialog('correct')}>
          Einen Fund doch zurücknehmen
        </button>
      </div>

      <Modal open={dialog === 'correct'} onClose={close} title="Einen Fund zurücknehmen?" onHome={home}>
        <p>Wenn ihr einen Fund zurücknehmt, geht es zurück zur Suche. Die Zeit läuft dabei nicht neu los: Es gibt höchstens die Restzeit von vorhin, und erst nach „Weitersuchen“. Die anderen Funde bleiben.</p>
        <ul className="correct-list">
          {completedTasks(m).map((t) => (
            <li key={t.uid}>
              <span className="correct-name">
                <strong>Schlüssel {placeOf(m, t.uid)?.key}:</strong> {t.title}
              </span>
              <button type="button" className="btn btn-secondary btn-compact" onClick={() => { setDialog(null); A.undo(t.uid); }}>
                <IconUndo /> Zurücknehmen
              </button>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={close}>
            Nein, weiter zum Tresor
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ============================ Abschluss ============================ */

function Result({ esc, m, motionOff, go }: { esc: Escape; m: EscapeMission; motionOff: boolean; go: (r: Route) => void }) {
  const A = esc.act;
  const opened = m.phase === 'opened';
  const gift = m.gift ? giftsById[m.gift.id] : undefined;
  const [confetti, setConfetti] = useState(false);
  const [lidOpen, setLidOpen] = useState(!canCelebrateWithMotion(motionOff));
  const [finds, setFinds] = useState(false);
  const found = completedTasks(m);
  const prog = progressOf(m);

  // Der Tresor öffnet sich einmal sanft; das Konfetti läuft genau einmal pro Mission (Zustand wird sofort gespeichert).
  useEffect(() => {
    if (!opened) return;
    if (!lidOpen) {
      const t = window.setTimeout(() => setLidOpen(true), 120);
      return () => window.clearTimeout(t);
    }
  }, [opened, lidOpen]);
  useEffect(() => {
    if (!esc.celebrate) return;
    setConfetti(canCelebrateWithMotion(motionOff));
    A.celebrated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esc.celebrate]);

  return (
    <div className="screen escape-screen escape-result">
      <header className="esc-head">
        <h1 className="esc-title" tabIndex={-1} data-focus-target>
          {opened ? 'Der Waldtresor ist offen!' : 'Für heute beendet'}
        </h1>
        {opened ? (
          <p className="success-line" role="status">
            {resultLine(m)}
          </p>
        ) : (
          <p className="success-line" role="status">
            Ihr habt {progressText(prog)} geschafft. Das ist ein schöner Anfang!
          </p>
        )}
        {opened && m.outcome === 'onTime' && <p className="badge-time">Alle drei Schlüssel rechtzeitig gefunden</p>}
      </header>

      <div className="vault-wrap">
        <Vault state={opened && lidOpen ? 'open' : opened ? 'ready' : 'closed'} locks={opened ? ['open', 'open', 'open'] : prog.complete ? ['ready', 'ready', 'ready'] : ([0, 1, 2].map((i): LockState => (i < prog.keys ? 'open' : 'locked')) as [LockState, LockState, LockState])} size={200} />
      </div>
      {confetti && <Confetti onDone={() => setConfetti(false)} />}

      {opened && gift && (
        <section aria-label="Euer Waldgeschenk" className="gift-section">
          <h2 className="collection-title">Euer Waldgeschenk</h2>
          <GiftCard gift={gift} age={m.age} />
        </section>
      )}

      {!opened && (
        <p className="muted">Ein Waldgeschenk gibt es, wenn ihr alle drei Schlüssel gefunden und den Tresor geöffnet habt. Ihr könnt jederzeit eine neue Wald-Escape-Mission starten.</p>
      )}

      {finds && (
        <section aria-label="Eure Funde" className="finds-section">
          <h2 className="collection-title">Eure Waldaufgaben</h2>
          <ul className="collection">
            {found.map((t) => {
              const where = placeOf(m, t.uid);
              return (
                <li key={t.uid} className="find find-done">
                  <div className="find-art">
                    <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} />
                    <span className="find-stamp" aria-hidden="true">
                      <IconCheck size={22} />
                    </span>
                  </div>
                  <p className="find-title">{t.title}</p>
                  <p className="find-status">{where ? `Schlüssel ${where.key} · Entdeckung ${where.fragment}` : ''}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="summary-actions">
        {found.length > 0 && (
          <button type="button" className="btn btn-primary btn-big" onClick={() => setFinds((f) => !f)} aria-expanded={finds}>
            {finds ? 'Fundschatz ausblenden' : 'Unseren Fundschatz ansehen'}
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            go('/');
          }}
        >
          Neue Wald-Escape-Mission
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => go('/')}>
          <IconHome /> Hauptmenü
        </button>
      </div>
    </div>
  );
}


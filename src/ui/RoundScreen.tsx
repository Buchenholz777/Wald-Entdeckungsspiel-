import { useEffect, useState } from 'react';
import { concepts } from '../catalog/concepts';
import { ENVIRONMENT_LONG, SEASON_LABEL } from '../domain/meta';
import { giftsById } from '../catalog/gifts';
import { foundCounts, needsCelebration } from '../domain/gift';
import { canUndo, nextOpenIndex, progress } from '../domain/round';
import { Confetti, canCelebrateWithMotion } from './Confetti';
import { GiftCard } from './GiftCard';
import type { RoundTask } from '../domain/types';
import { Illustration } from '../illustrations/Illustration';
import { isStillArt } from '../illustrations/registry';
import { IconArrow, IconCheck, IconChevron, IconHelp, IconInfo, IconMenu, IconReplay, IconSkip, IconSound, IconUndo, IconZoom } from './icons';
import { Modal } from './Modal';
import type { Game } from './useGame';
import type { Route } from './useRoute';
import { useSpeech } from './useSpeech';

interface Props {
  game: Game;
  go: (r: Route) => void;
}

export function counterText(t: RoundTask): string {
  if (t.status === 'done') return 'Geschafft';
  if (t.status === 'skipped') return 'Ausgelassen';
  if (t.mode === 'compare') return `${t.found} von 2 angeschaut`;
  if (t.target === 1) return 'Noch nicht gefunden';
  return `${t.found} von ${t.target} ${t.unit ?? 'Dingen'} gefunden`;
}

function shortStatus(t: RoundTask): string {
  if (t.status === 'done') return 'Geschafft';
  if (t.status === 'skipped') return 'Ausgelassen';
  if (t.mode === 'compare') return `${t.found} von 2 angeschaut`;
  if (t.target === 1) return 'Offen';
  return `${t.found} von ${t.target}`;
}

/** Name des Fundes für Beschriftungen, z. B. „Ein Zapfen“. */
function subject(t: RoundTask): string {
  return concepts[t.conceptId]?.label ?? t.title;
}

export function RoundScreen({ game, go }: Props) {
  const round = game.round!;
  const { actions: A } = game;
  const task = round.tasks[round.activeIndex] ?? round.tasks[0];
  const still = isStillArt(task.image.illustrationKey);
  const prog = progress(round);

  const [play, setPlay] = useState(true);
  const [playId, setPlayId] = useState(0);
  const [dialog, setDialog] = useState<null | 'zoom' | 'info' | 'menu' | 'noalt' | 'gift'>(null);
  const [confetti, setConfetti] = useState(false);
  const counts = foundCounts(round);
  const gift = round.gift ? giftsById[round.gift.id] : undefined;
  const celebrate = needsCelebration(round);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [riddleOpen, setRiddleOpen] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);
  const speech = useSpeech();

  // Beim Wechsel der Aufgabe: Bewegung einmal abspielen, Hinweise wieder einklappen
  useEffect(() => {
    setPlay(true);
    setPlayId((n) => n + 1);
    setSearchOpen(false);
    setRiddleOpen(false);
    setDialog(null);
    setConfirmEnd(false);
    speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.uid]);

  // Der große Moment: genau einmal, sobald die Mission vollständig gefunden ist. Das Geschenk steht dann schon im gespeicherten
  // Zustand; „celebrated“ wird sofort gespeichert, damit Doppeltippen, Neuladen und Rückkehr nie erneut feiern.
  useEffect(() => {
    if (!celebrate) return;
    setDialog('gift');
    setConfetti(canCelebrateWithMotion(game.settings.motionOff));
    game.markCelebrated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  const replay = () => {
    setPlay(true);
    setPlayId((n) => n + 1);
  };
  const close = () => {
    setDialog(null);
    setConfirmEnd(false);
  };
  /** Aus einem Dialog direkt ins Hauptmenü: Dialog zu, Runde bleibt gespeichert. */
  const home = () => {
    setDialog(null);
    go('/');
  };

  const next = nextOpenIndex(round, round.activeIndex);
  const otherOpen = next >= 0 && next !== round.activeIndex;
  const allResolved = prog.open === 0;
  const announce = (text: string) => game.setAnnounce(text);

  const onMain = () => {
    if (task.status !== 'open') {
      if (otherOpen) {
        game.setRound((r) => A.setActive(r, next));
        announce('Nächste Station.');
      } else {
        game.setRound(A.finishRound);
        go('/abschluss');
      }
      return;
    }
    if (task.mode === 'compare') {
      game.setRound((r) => A.completeCompare(r, task.uid));
      announce(`Geschafft: ${task.title}. ${prog.done + 1} von ${prog.total} Stationen geschafft.`);
      return;
    }
    const willFinish = task.found + 1 >= task.target;
    game.setRound((r) => A.addFound(r, task.uid));
    announce(willFinish ? `Geschafft: ${task.title}. ${prog.done + 1} von ${prog.total} Stationen geschafft.` : `${task.found + 1} von ${task.target} gefunden.`);
  };

  const onUndo = () => {
    game.setRound((r) => A.undo(r, task.uid));
    announce('Rückgängig gemacht.');
  };

  const onSwap = () => {
    if (!game.swapTask(task.uid)) setDialog('noalt');
  };

  const onSkipHere = () => {
    game.setRound((r) => A.skip(r, task.uid));
    setDialog(null);
    announce(`Ausgelassen: ${task.title}.`);
  };

  const mainLabel = (() => {
    if (task.status !== 'open') return otherOpen ? 'Weiter entdecken' : 'Zur Fundsammlung';
    if (task.mode === 'compare') return 'Geschafft!';
    if (task.target === 1) return 'Gefunden!';
    return 'Eins gefunden';
  })();
  const mainDisabled = task.status === 'open' && task.mode === 'compare' && !(task.seen?.[0] && task.seen?.[1]);
  const showCheck = task.status === 'done';
  const moment = task.moment ?? task.talk ?? 'Was fällt dir an deinem Fund auf?';

  const infoText = [task.info.whatIsIt, task.info.origin, task.special ?? '', task.extra ?? ''].filter(Boolean).join(' ');
  const readAloud = () => {
    if (speech.speaking) {
      speech.stop();
      return;
    }
    speech.speak(infoText);
  };

  return (
    <div className="screen round">
      <header className="round-head">
        <h1 className="sr-only" tabIndex={-1} data-focus-target>
          {round.mission?.title ?? 'Entdeckermission'}
        </h1>
        <p className="context-line">
          {ENVIRONMENT_LONG[round.environment]} · {SEASON_LABEL[round.season]}
        </p>
        <div className="head-actions">
          <button type="button" className="icon-btn" onClick={() => go('/hilfe')} aria-label="Hilfe">
            <IconHelp />
          </button>
          <button type="button" className="icon-btn" onClick={() => setDialog('menu')} aria-label="Mehr">
            <IconMenu />
          </button>
        </div>
      </header>

      <section aria-label="Fortschritt" className="progress-wrap">
        <p className="progress-text" id="round-progress">
          {prog.done} von {prog.total} Stationen geschafft
          {prog.skipped > 0 ? ` · ${prog.skipped} ausgelassen` : ''}
        </p>
        <ol className="stations" role="progressbar" aria-valuemin={0} aria-valuemax={prog.total} aria-valuenow={prog.done} aria-labelledby="round-progress">
          {round.tasks.map((t, i) => (
            <li key={t.uid} className={`station station-${t.status}${i === round.activeIndex ? ' station-active' : ''}`}>
              <span className="stamp" aria-hidden="true">
                {t.status === 'done' ? <IconCheck size={20} /> : t.status === 'skipped' ? <IconSkip /> : i + 1}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {round.notice && (
        <p className="notice-inline" role="status">
          {round.notice}
        </p>
      )}

      <article className={`card status-${task.status}`} aria-labelledby="task-title">
        {/* Der konkrete Suchsatz steht zuerst, vor dem Bild: genau eine Aufgabe, ihr Stand und woran man sie erkennt */}
        <div className="card-head">
          <h2 id="task-title" className="task-title">
            {task.prompt}
          </h2>
          <p className={`counter${task.status === 'done' ? ' counter-done' : ''}`}>
            {task.status === 'done' && <IconCheck size={20} />}
            {counterText(task)}
          </p>
          {task.image.recognitionFeatures.length > 0 && (
            <p className="task-clue">
              <span className="task-clue-label">Erkennbar an:</span> {task.image.recognitionFeatures.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>
        <div className="card-art">
          <button type="button" className="art-btn" onClick={() => setDialog('zoom')} aria-label={`Bild vergrößern: ${task.image.alt}`}>
            <Illustration illustrationKey={task.image.illustrationKey} preset={task.image.animationPreset} play={play} playId={playId} />
            <span className="art-hint">
              <IconZoom /> Größer ansehen
            </span>
          </button>
          {/* Info und Wiederholen sind eigene Bedienelemente neben dem Bildknopf, nie darin verschachtelt */}
          <button type="button" className="icon-btn info-btn" onClick={() => setDialog('info')} aria-label={`Info zu: ${subject(task)}`}>
            <IconInfo />
          </button>
          {!still && (
            <button type="button" className="icon-btn replay-btn" onClick={replay} aria-label="Bewegung noch einmal ansehen">
              <IconReplay />
            </button>
          )}
          {showCheck && (
            <span className="done-badge" aria-hidden="true">
              <IconCheck size={30} />
            </span>
          )}
        </div>
        <p className="example-note">So kann es aussehen. Euer Fund darf etwas anders sein.</p>

        <div className="card-body">
          {task.riddle && (
            <div className="riddle">
              <p>
                <span className="riddle-label">Rätsel:</span> {task.riddle.text}
              </p>
              {riddleOpen ? (
                <p className="riddle-answer">{task.riddle.name}</p>
              ) : (
                <button type="button" className="btn btn-quiet" onClick={() => setRiddleOpen(true)}>
                  Name zeigen
                </button>
              )}
            </div>
          )}

          {task.mode === 'compare' && task.compareLabels && task.seen && (
            <div className="compare" role="group" aria-label="Was habt ihr schon angeschaut?">
              {([0, 1] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  className="compare-chip"
                  aria-pressed={task.seen![i]}
                  disabled={task.status !== 'open'}
                  onClick={() => game.setRound((r) => A.toggleSeen(r, task.uid, i))}
                >
                  <span className="compare-box" aria-hidden="true">
                    {task.seen![i] && <IconCheck size={18} />}
                  </span>
                  <span>
                    {task.compareLabels![i]}
                    <span className="block compare-sub">{task.seen![i] ? 'angeschaut' : 'noch nicht angeschaut'}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {mainDisabled && <p className="muted">Tippt an, was ihr schon angeschaut habt. Dann könnt ihr den Vergleich abschließen.</p>}

          <button type="button" className="help-toggle" aria-expanded={searchOpen} aria-controls="search-panel" onClick={() => setSearchOpen((o) => !o)}>
            Such-Hinweis
            <IconChevron open={searchOpen} />
          </button>
          {searchOpen && (
            <div id="search-panel" className="discover">
              <p className="search-text">{task.info.whereToLook}</p>
              {task.hint && <p className="search-hint">{task.hint}</p>}
            </div>
          )}

          {task.status === 'done' && (
            <aside className="moment" aria-label="Kleiner Entdeckermoment">
              <p className="moment-label">Kleiner Entdeckermoment</p>
              <p>{moment}</p>
            </aside>
          )}
        </div>
      </article>

      {round.mission && (
        <section className="mission mission-fold" aria-label="Mission">
          <button type="button" className="help-toggle" aria-expanded={missionOpen} aria-controls="mission-panel" onClick={() => setMissionOpen((o) => !o)}>
            Über diese Mission
            <IconChevron open={missionOpen} />
          </button>
          {missionOpen && (
            <div id="mission-panel" className="mission-panel">
              <p className="mission-title">{round.mission.title}</p>
              <p className="mission-intro">{round.mission.intro}</p>
            </div>
          )}
        </section>
      )}

      <nav className="tasklist" aria-label="Alle Stationen">
        <h3 className="tasklist-title">Eure Stationen</h3>
        <ol>
          {round.tasks.map((t, i) => (
            <li key={t.uid}>
              <button
                type="button"
                className={`task-row status-${t.status}${i === round.activeIndex ? ' is-active' : ''}`}
                aria-current={i === round.activeIndex ? 'true' : undefined}
                onClick={() => game.setRound((r) => A.setActive(r, i))}
              >
                <span className="thumb">
                  <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} />
                </span>
                <span className="row-text">
                  <span className="row-title">{t.title}</span>
                  <span className="row-status">
                    {t.status === 'done' && <IconCheck size={16} />}
                    {t.status === 'skipped' && <IconSkip />}
                    {shortStatus(t)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="action-bar action-bar-round">
        {game.swapUndo && (
          <div className="swap-undo" role="status">
            <span>Die Aufgabe wurde getauscht.</span>
            <button type="button" className="btn btn-quiet" onClick={game.undoSwap}>
              <IconUndo /> Tausch rückgängig
            </button>
          </div>
        )}
        <button type="button" className={`btn btn-primary btn-big${task.status !== 'open' ? ' btn-next' : ''}`} onClick={onMain} disabled={mainDisabled}>
          {mainLabel}
          {task.status !== 'open' && <IconArrow />}
        </button>
        <div className="action-row">
          <button type="button" className="btn btn-secondary" onClick={onUndo} disabled={!canUndo(task)}>
            <IconUndo /> Rückgängig
          </button>
          {task.status === 'open' ? (
            <button type="button" className="btn btn-secondary" onClick={onSwap}>
              Hier nicht zu finden
            </button>
          ) : (
            allResolved &&
            otherOpen === false && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  game.setRound(A.finishRound);
                  go('/abschluss');
                }}
              >
                Mission beenden
              </button>
            )
          )}
        </div>
      </div>

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
          <p className="muted">Euer Fund darf anders aussehen. Das Bild ist nur ein Beispiel.</p>
        </section>
        <div className="modal-actions">
          {!still && (
            <button type="button" className="btn btn-secondary" onClick={replay}>
              <IconReplay /> Bewegung noch einmal
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={close}>
            Fertig
          </button>
        </div>
      </Modal>

      <Modal open={dialog === 'info'} onClose={close} title={`Info: ${subject(task)}`} className="modal-info" onHome={home}>
        <div className="info-motif">
          <Illustration illustrationKey={task.image.illustrationKey} preset={task.image.animationPreset} />
        </div>
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
          {speech.available && (
            <button type="button" className="btn btn-quiet" onClick={readAloud}>
              <IconSound /> {speech.speaking ? 'Vorlesen beenden' : 'Vorlesen'}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={close}>
            Fertig
          </button>
        </div>
      </Modal>

      <Modal open={dialog === 'menu'} onClose={close} title={confirmEnd ? 'Mission beenden?' : 'Mehr'} onHome={home}>
        {confirmEnd ? (
          <>
            <p>
              Bisher: {prog.done} von {prog.total} Stationen geschafft{prog.skipped ? `, ${prog.skipped} ausgelassen` : ''}. Ihr seht gleich eure Fundsammlung. Wenn ihr wollt, könnt ihr danach weitermachen.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={close}>
                Weiter entdecken
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  game.setRound(A.finishRound);
                  setDialog(null);
                  go('/abschluss');
                }}
              >
                Mission beenden
              </button>
            </div>
          </>
        ) : (
          <ul className="menu-list">
            <li>
              <button type="button" className="menu-item" onClick={() => { setDialog(null); go('/hilfe'); }}>
                <span>Hilfe</span>
                <span className="muted block">So funktioniert Wald-Spiel</span>
              </button>
            </li>
            <li>
              <button type="button" className="menu-item" onClick={() => setConfirmEnd(true)}>
                <span>Mission beenden</span>
                <span className="muted block">Zeigt, was ihr bisher entdeckt habt.</span>
              </button>
            </li>
          </ul>
        )}
      </Modal>
      <Modal open={dialog === 'gift'} onClose={close} title="Euer Waldgeschenk" className="modal-gift" onHome={home} closeLabel="Geschenk schließen">
        {confetti && <Confetti onDone={() => setConfetti(false)} />}
        <p className="success-line" role="status">
          Ihr habt alle Waldschätze entdeckt!
        </p>
        <p className="success-count">
          {counts.done} von {counts.total}
        </p>
        {gift && <GiftCard gift={gift} age={round.age} />}
        <div className="modal-actions gift-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setDialog(null);
              game.setRound(A.finishRound);
              go('/abschluss');
            }}
          >
            Unseren Fundschatz ansehen
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setDialog(null);
              if (game.repeatRound().ok) go('/runde');
              else go('/');
            }}
          >
            Neue Waldmission
          </button>
        </div>
      </Modal>
      <Modal open={dialog === 'noalt'} onClose={close} title="Keine passende Alternative" onHome={home}>
        <p>Dazu fällt uns gerade nichts Passendes mehr ein. Ihr könnt diese Station für diese Waldmission auslassen und mit den anderen weitermachen.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onSkipHere}>
            Für diese Mission auslassen
          </button>
          <button type="button" className="btn btn-secondary" onClick={close}>
            Doch weitersuchen
          </button>
        </div>
      </Modal>
    </div>
  );
}

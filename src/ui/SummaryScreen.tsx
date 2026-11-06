import { useState } from 'react';
import { giftsById } from '../catalog/gifts';
import { templatesById } from '../catalog/templates';
import { foundCounts, isFullyFound } from '../domain/gift';
import { Confetti, canCelebrateWithMotion } from './Confetti';
import { GiftCard } from './GiftCard';
import { SEASON_LABEL } from '../domain/meta';
import { progress, summaryText } from '../domain/round';
import { connectionLine } from '../domain/mission';
import { Illustration } from '../illustrations/Illustration';
import { IconBack, IconCheck, IconHome, IconSkip } from './icons';
import type { Game } from './useGame';
import type { Route } from './useRoute';

interface Props {
  game: Game;
  go: (r: Route) => void;
}

function closingLine(done: number, skipped: number, open: number): string {
  if (done === 0) return 'Diesmal habt ihr noch nichts gefunden. Das macht nichts, vielleicht klappt es bei der nächsten Mission.';
  if (skipped === 0 && open === 0) return done === 1 ? 'Gemeinsam habt ihr einen Fund entdeckt. Toll gemacht!' : `Gemeinsam habt ihr ${done} Funde entdeckt. Toll gemacht!`;
  return `Gemeinsam habt ihr ${done} ${done === 1 ? 'Fund' : 'Funde'} entdeckt. Ausgelassenes und Offenes zählt nicht als gefunden, und das ist völlig in Ordnung.`;
}

export function SummaryScreen({ game, go }: Props) {
  const round = game.round!;
  const prog = progress(round);
  const [problem, setProblem] = useState<string | null>(null);
  const complete = prog.open === 0;
  const fully = isFullyFound(round);
  const counts = foundCounts(round);
  const gift = round.gift ? giftsById[round.gift.id] : undefined;
  const [confetti, setConfetti] = useState(false);
  // Nur wirklich gefundene Stationen zählen: Der Zusammenhang wird nur genannt, wenn mindestens zwei davon dazu passen.
  const connection = connectionLine(round.tasks.filter((t) => t.status === 'done'), (id) => templatesById[id]?.themes);

  const again = () => {
    const res = game.repeatRound();
    if (res.ok) {
      setProblem(null);
      go('/runde');
    } else {
      setProblem('Mit diesen Einstellungen gibt es gerade keine passende Waldmission. Ändert im Hauptmenü die Jahreszeit oder die Angaben.');
    }
  };

  return (
    <div className="screen summary">
      <header className="summary-head">
        <p className="context-line">
          {round.mission?.title ? `${round.mission.title} · ` : ''}
          Wald · {SEASON_LABEL[round.season]}
        </p>
        <h1 className="h1" tabIndex={-1} data-focus-target>
          {complete ? 'Das habt ihr entdeckt!' : 'Eure Waldmission ist beendet'}
        </h1>
        <p className="lead summary-count">{summaryText(prog)}</p>
        <p className="muted">{closingLine(prog.done, prog.skipped, prog.open)}</p>
        {fully && (
          <p className="success-line" role="status">
            Ihr habt alle Waldschätze entdeckt! <span className="success-count-inline">{counts.done} von {counts.total}</span>
          </p>
        )}
        {connection && <p className="connection">{connection}</p>}
      </header>

      {gift && (
        <section aria-label="Euer Waldgeschenk" className="gift-section">
          <h2 className="collection-title">Euer Waldgeschenk</h2>
          {!fully && (
            <p className="muted">Dieses Geschenk habt ihr schon bekommen. Es bleibt euch, auch wenn eine Station wieder offen ist.</p>
          )}
          <GiftCard gift={gift} age={round.age} />
          {fully && canCelebrateWithMotion(game.settings.motionOff) && (
            <button type="button" className="btn btn-quiet" onClick={() => setConfetti(true)}>
              Konfetti noch einmal
            </button>
          )}
          {confetti && <Confetti onDone={() => setConfetti(false)} />}
        </section>
      )}

      <section aria-label="Eure Fundsammlung">
        <h2 className="collection-title">Eure Fundsammlung</h2>
        <ul className="collection">
          {round.tasks.map((t) => (
            <li key={t.uid} className={`find find-${t.status}`}>
              <div className="find-art">
                <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} />
                <span className="find-stamp" aria-hidden="true">
                  {t.status === 'done' ? <IconCheck size={22} /> : t.status === 'skipped' ? <IconSkip /> : '?'}
                </span>
              </div>
              <p className="find-title">{t.title}</p>
              <p className="find-status">
                {t.status === 'done' && 'Entdeckt'}
                {t.status === 'skipped' && 'Ausgelassen'}
                {t.status === 'open' && 'Noch offen'}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {problem && (
        <p className="field-error" role="alert">
          {problem}
        </p>
      )}

      <div className="summary-actions">
        <button type="button" className="btn btn-primary btn-big" onClick={again}>
          Neue Waldmission
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => go('/')}>
          <IconHome /> Zum Hauptmenü
        </button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            game.setRound(game.actions.reopenRound);
            go('/runde');
          }}
        >
          <IconBack /> Zurück zur Mission
        </button>
      </div>
    </div>
  );
}

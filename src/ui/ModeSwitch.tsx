import type { GameMode } from '../domain/types';
import { SymbolIcon } from './escape/EscapeArt';

/** Die drei Spielmodi mit ihren kurzen Erklärungen. Der Text steht immer sichtbar da, nicht nur beim Darüberfahren. */
export const MODES: { id: GameMode; name: string; text: string; soon?: boolean }[] = [
  { id: 'treasure', name: 'Waldschätze suchen', text: 'Entspannt suchen und den Wald kennenlernen.' },
  { id: 'detective', name: 'Walddetektive', text: 'Genauer hinschauen und kleine Waldgeheimnisse lösen.', soon: true },
  { id: 'escape', name: 'Wald Escape', text: 'Drei Schlüssel finden und gemeinsam den Waldtresor knacken.' },
];

/** Genauer Wortlaut des Hinweises auf der noch nicht spielbaren Karte. */
export const SOON_BADGE = 'Bald verfügbar';

function ModeIcon({ id }: { id: GameMode }) {
  if (id === 'treasure') return <SymbolIcon symbol="acorn" size={30} />;
  if (id === 'escape') return <SymbolIcon symbol="star" size={30} />;
  return (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true" focusable="false" className="sym">
      <circle cx="20" cy="20" r="12" fill="#dff0f6" stroke="#3b2a1a" strokeWidth="2.4" />
      <path d="M13 17 Q15 12 20 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M29 29 L42 42" stroke="#3b2a1a" strokeWidth="5.4" strokeLinecap="round" />
      <path d="M29 29 L42 42" stroke="#a4723e" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Auswahl des Spielmodus direkt unter dem Header: eine Gruppe von Optionsfeldern (native Tastaturbedienung mit Pfeiltasten).
 * Der gewählte Modus ist mit Text („Gewählt“) und Rahmen markiert, nicht nur mit Farbe. Ein Wechsel startet nie etwas.
 * „Walddetektive“ ist sichtbar, trägt den Hinweis „Bald verfügbar“ direkt über dem Titel und ist als Optionsfeld deaktiviert:
 * Antippen oder Tastatur wechselt nichts und startet nichts; der bisher gewählte spielbare Modus bleibt aktiv.
 * Der Hinweis steht im Beschriftungstext der Karte und wird deshalb zusammen mit dem Namen vorgelesen.
 */
export function ModeSwitch({ mode, onChange }: { mode: GameMode; onChange: (m: GameMode) => void }) {
  return (
    <fieldset className="modes">
      <legend className="modes-title">Was möchtet ihr spielen?</legend>
      <div className="modes-grid">
        {MODES.map((m) => (
          <label key={m.id} className={`mode-tile${m.soon ? ' mode-soon' : ''}`}>
            <input type="radio" name="mode" value={m.id} checked={!m.soon && mode === m.id} disabled={m.soon} onChange={() => !m.soon && onChange(m.id)} />
            <span className="mode-face">
              <span className="mode-badge-row">{m.soon && <span className="mode-badge">{SOON_BADGE}</span>}</span>
              <span className="mode-top">
                <ModeIcon id={m.id} />
                <span className="mode-name">{m.name}</span>
              </span>
              <span className="mode-text">{m.text}</span>
              <span className="mode-state" aria-hidden="true">
                {!m.soon && mode === m.id ? '✓ Gewählt' : ' '}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

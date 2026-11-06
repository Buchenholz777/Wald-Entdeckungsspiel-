import { useMemo, useState } from 'react';
import { concepts } from '../catalog/concepts';
import { CATALOG_VERSION, templates } from '../catalog/templates';
import { SEASON_LABEL, THEME_INFO } from '../domain/meta';
import { Illustration } from '../illustrations/Illustration';

/** Interne Bildübersicht zur visuellen Qualitätskontrolle: erreichbar unter #/intern/bilder. */
export function Gallery({ back }: { back: () => void }) {
  const [playAll, setPlayAll] = useState(false);
  const [playTick, setPlayTick] = useState(0);
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Aktive Waldmotive zuerst, ausgemusterte (nur für alte Runden) danach
    const sorted = [...templates].sort((a, b) => Number(Boolean(a.retired)) - Number(Boolean(b.retired)));
    if (!q) return sorted;
    return sorted.filter((t) => [t.id, t.conceptId, t.prompt.one, ...t.image.variantTags].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="screen gallery">
      <header className="help-head">
        <button type="button" className="btn btn-quiet" onClick={back}>
          Zurück
        </button>
        <h1 className="h1" tabIndex={-1} data-focus-target>
          Bildübersicht (intern)
        </h1>
        <p className="muted">
          {templates.filter((t) => !t.retired).length} aktive Waldbilder (dazu {templates.filter((t) => t.retired).length} ausgemusterte für alte Runden) · Katalogstand {CATALOG_VERSION}. Jedes Bild links als Standbild, rechts klein wie auf einem Smartphone.
        </p>
        <div className="gallery-tools">
          <label>
            <span className="sr-only">Filter</span>
            <input className="field" type="search" placeholder="Filter: Name, Konzept, Merkmal" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setPlayAll(true);
              setPlayTick((n) => n + 1);
            }}
          >
            Alle Bewegungen abspielen
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => setPlayAll(false)}>
            Standbilder
          </button>
        </div>
      </header>

      <ul className="gallery-grid">
        {list.map((t) => (
          <li key={t.id} className="gallery-item">
            <div className="gallery-art">
              <div className="gallery-big">
                <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} alt={t.image.alt} play={playAll} playId={playTick} />
              </div>
              <div className="gallery-small">
                <Illustration illustrationKey={t.image.illustrationKey} preset={t.image.animationPreset} />
              </div>
            </div>
            <h2 className="gallery-title">
              {String(t.sourceNo).padStart(3, '0')} · {t.prompt.one}
              {t.retired && <span className="badge-retired"> ausgemustert</span>}
            </h2>
            <dl className="gallery-meta">
              <dt>ID / Konzept</dt>
              <dd>
                {t.id} / {t.conceptId} ({concepts[t.conceptId]?.label})
              </dd>
              <dt>Bewegung</dt>
              <dd>{t.image.animationPreset}</dd>
              <dt>Varianten</dt>
              <dd>{t.image.variantTags.join(', ')}</dd>
              <dt>Erkennungsmerkmale</dt>
              <dd>{t.image.recognitionFeatures.join(' · ')}</dd>
              <dt>Alter</dt>
              <dd>{t.ageGroups.join(', ')}</dd>
              <dt>Leitmotive</dt>
              <dd>{t.themes.map((x) => THEME_INFO[x].title).join(' · ') || '–'}</dd>
              <dt>Jahreszeiten</dt>
              <dd>{t.seasons.length === 4 ? 'ganzjährig' : t.seasons.map((s) => SEASON_LABEL[s]).join(', ')}</dd>
              {t.requiredContext.length > 0 && (
                <>
                  <dt>Kontext</dt>
                  <dd>{t.requiredContext.join(', ')}</dd>
                </>
              )}
              <dt>Bildbeschreibung</dt>
              <dd>{t.image.alt}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

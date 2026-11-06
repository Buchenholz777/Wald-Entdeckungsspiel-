import { describe, expect, it } from 'vitest';
import { concepts } from '../src/catalog/concepts';
import { templates } from '../src/catalog/templates';
import { CONTEXT_BY_ENV, ENVIRONMENTS } from '../src/domain/meta';
import { eligibleTemplates, distinctConcepts } from '../src/domain/generator';
import { resolveInfo } from '../src/domain/resolve';
import { AGE_GROUPS, SEASONS, type AgeGroup, type TaskTemplate } from '../src/domain/types';

const SMALL_PART_WORDS = /(sammel|einsammeln|aufheben|aufhebt|mitnehmen|nehmt mit|pflück|probier|essen)/i;

describe('Katalog: Struktur', () => {
  it('enthält alle 90 Ausgangsideen genau einmal, dazu eigene Ergänzungen ab Nr. 101', () => {
    const nos = templates.map((t) => t.sourceNo).sort((a, b) => a - b);
    expect(nos.filter((n) => n <= 90)).toEqual(Array.from({ length: 90 }, (_, i) => i + 1));
    const extra = nos.filter((n) => n > 90);
    expect(extra.length).toBeGreaterThanOrEqual(16);
    expect(extra.every((n) => n >= 101)).toBe(true);
    expect(new Set(nos).size).toBe(nos.length);
    expect(new Set(templates.map((t) => t.id)).size).toBe(templates.length);
  });

  it('Wald-Umbau: aktiv sind nur Vorlagen für den Wald, alles andere ist ausgemustert (und bleibt für alte Runden erhalten)', () => {
    const active = templates.filter((t) => !t.retired);
    expect(active.length).toBeGreaterThanOrEqual(28);
    for (const t of active) expect(t.environments, t.id).toEqual(['forest']);
    // Allgemeine Aufgaben (Inhaltsvorgabe v2) und alle Orte außer Wald sind weiterhin nicht aktiv.
    const mustBeRetired = [
      'round-thing', 'long-thing', 'straight-line', 'curved-line', 'repeating-pattern', 'two-colors', 'light-dark', 'tall-low',
      'tree', 'conifer', 'street-tree', 'fallen-twig', 'grass', 'trail-grass', 'low-plant', 'lying-wood', 'play-board', 'sky', 'feather',
      'beach-sand', 'shell', 'big-stone', 'shore-stone', 'water-surface', 'water-path',
      'bench', 'door', 'window', 'bicycle', 'slide', 'swing', 'driftwood', 'seaweed', 'waves', 'mountain', 'reflection', 'reed', 'blossom', 'clover', 'molehill', 'dandelion',
      'snow', 'puddle', 'ground-shadow', 'trail-marker', 'gravel-path', 'smooth-stone', 'striped-stone', 'snail-shell',
      // Fassung 4.0: allgemeine Rinden-, Baum-, Boden-, Wurzel- und Stockaufträge und Blattfarben-Varianten
      'bark', 'bark-compare', 'root', 'tree-stump', 'tree-rings', 'forked-twig', 'wood-grain', 'rotting-wood', 'twig-bud', 'tree-seedling',
      'fallen-leaf', 'green-leaf', 'yellow-leaf', 'red-leaf', 'dry-leaf', 'leaf-two-shapes', 'leaf-big-small', 'leaf-veins', 'serrated-leaf', 'hand-leaf', 'leaf-aging',
    ];
    for (const id of mustBeRetired) expect(templates.find((t) => t.id === id)?.retired, id).toBe(true);
    // Sichtbare Texte der aktiven Vorlagen nennen keinen anderen Ort.
    const OTHER_PLACES = /Strand|Stadt|Wiese|Garten|Spielplatz|Park\b|Berge|Gipfel|Seeufer|Bachufer|Sand\b|Muschel|Meer/;
    for (const t of active) {
      const text = [t.prompt.one, t.prompt.many ?? '', t.image.alt, t.hint ?? '', ...Object.values(t.promptByAge ?? {}).map((p) => p?.one ?? '')].join(' ');
      expect(text, t.id).not.toMatch(OTHER_PLACES);
    }
  });

  it('der Waldkatalog enthält die vorgesehenen Fundstücke, Fraßspuren, Zersetzer und Muster', () => {
    const ids = new Set(templates.filter((t) => !t.retired).map((t) => t.id));
    for (const id of [
      'acorn', 'acorn-cup', 'beechnut', 'beech-husk', 'hazelnut', 'gnawed-nut', 'maple-seed', 'cone', 'gnawed-cone', 'cone-compare', 'needle-twig', 'beech-bud',
      'leaf-skeleton', 'leaf-hole', 'maple-leaf', 'oak-leaf', 'leaf-mine', 'gall',
      'moss', 'lichen', 'fern-frond', 'fern-spores', 'bracket-fungus', 'animal-track', 'deer-track', 'dog-track', 'spider-web', 'mushroom', 'chestnut',
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('jede Aufgabe nennt einen begrenzten Gegenstand oder eine konkrete Spur, nie Baum, Boden, Gras oder Stock allgemein', () => {
    const GENERIC = /^(Entdecke|Finde|Zeig mir|Suche)\s+(einen?|die|das)?\s*(Baumrinde|Rinde|Baum|Boden|Waldboden|Gras|Stock|Ast|Holz|Wurzel)\b/i;
    for (const t of templates.filter((x) => !x.retired)) {
      for (const p of [t.prompt.one, ...Object.values(t.promptByAge ?? {}).map((q) => q?.one ?? '')]) {
        expect(p, `${t.id}: ${p}`).not.toMatch(GENERIC);
        expect(p, `${t.id}: ${p}`).not.toMatch(/Waldschatz Rinde|raue Rinde|beliebig/i);
      }
    }
  });

  it('Muschelschalen und Schneckenhäuser sind getrennte Konzepte, Nuss- und Fruchtmotive haben eigene Konzept-IDs', () => {
    const concept = (id: string) => templates.find((t) => t.id === id)!.conceptId;
    expect(concept('white-shell')).toBe('shell');
    expect(concept('snail-shell-spiral')).toBe('snailShell');
    expect(concept('snail-shell')).toBe('snailShell');
    expect(concept('shell-vs-snail')).toBe('snailShell');
    const nuts = ['chestnut', 'acorn', 'hazelnut', 'beechnut'].map(concept);
    expect(new Set(nuts).size).toBe(4);
    expect(new Set(['hazelnut', 'beechnut', 'chestnut', 'acorn'].map((id) => templates.find((t) => t.id === id)!.image.alt)).size).toBe(4);
  });

  it('jede Vorlage verweist auf ein vorhandenes Konzept', () => {
    for (const t of templates) expect(concepts[t.conceptId], t.id).toBeDefined();
  });

  it('Mengen sind je Altersgruppe zulässig und passen zum Abschlussmodus', () => {
    for (const t of templates) {
      for (const age of t.ageGroups) {
        const q = t.quantityByAge[age];
        expect(q?.length, `${t.id} ${age}`).toBeGreaterThan(0);
        for (const n of q!) {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(10);
        }
        if (t.completionMode === 'single') expect(q).toEqual([1]);
        if (t.completionMode === 'compare') expect(q).toEqual([2]);
        if (t.completionMode === 'count') {
          expect(t.prompt.many, `${t.id} braucht Pluralmuster`).toContain('{n}');
          expect(t.unit, `${t.id} braucht Einheit`).toBeTruthy();
        }
      }
      if (t.completionMode === 'compare') expect(t.compareLabels, t.id).toHaveLength(2);
    }
  });

  it('Mengenobergrenzen halten die Altersregeln ein', () => {
    for (const t of templates) {
      if (t.ageGroups.includes('2-3')) expect(Math.max(...t.quantityByAge['2-3']!), t.id).toBeLessThanOrEqual(2);
      if (t.ageGroups.includes('4-6')) expect(Math.max(...t.quantityByAge['4-6']!), t.id).toBeLessThanOrEqual(3);
      const boost = t.countingBoostMaxByAge;
      if (boost?.['4-6']) expect(boost['4-6']).toBeLessThanOrEqual(5);
      if (boost?.['7-10']) expect(boost['7-10']).toBeLessThanOrEqual(10);
      expect(boost?.['2-3']).toBeUndefined();
    }
  });

  it('2–3 Jahre: keine Artenbestimmung, kein Vergleich, keine Sammelaufträge für Kleinteile', () => {
    for (const t of templates.filter((x) => x.ageGroups.includes('2-3'))) {
      expect(t.completionMode, t.id).not.toBe('compare');
      expect(t.difficulty, t.id).toBe(1);
      expect(t.id).not.toMatch(/oak-leaf/);
      if (t.smallParts) expect(Math.max(...t.quantityByAge['2-3']!), `${t.id} Kleinteile`).toBe(1);
      expect(`${t.prompt.one} ${t.prompt.many ?? ''}`).not.toMatch(SMALL_PART_WORDS);
    }
  });

  it('Kastanie, Eichel, Haselnuss, Zapfen und Moos sind für 2–3 zugelassen, aber nur als einzelner Fund zum Anschauen', () => {
    for (const id of ['chestnut', 'acorn', 'hazelnut', 'beechnut', 'cone', 'moss', 'fern-frond', 'needle-twig', 'maple-leaf']) {
      const t = templates.find((x) => x.id === id)!;
      expect(t.ageGroups, id).toContain('2-3');
      expect(t.quantityByAge['2-3'], id).toEqual([1]);
    }
    for (const id of ['oak-leaf', 'maple-seed', 'acorn-cup', 'deer-track', 'dog-track', 'cone-compare', 'gnawed-nut', 'gnawed-cone', 'fern-spores', 'gall', 'leaf-mine']) {
      expect(templates.find((x) => x.id === id)!.ageGroups, id).not.toContain('2-3');
    }
  });

  it('Spuren sind an bestätigten Untergrund gebunden und werden nicht aus dem Kalender abgeleitet', () => {
    const need = (id: string) => templates.find((t) => t.id === id)!.requiredContext;
    for (const id of ['animal-track', 'deer-track', 'dog-track']) expect(need(id)).toContain('mud');
    const soft = (id: string) => templates.find((t) => t.id === id)!.softContext;
    expect(soft('hazelnut')).toContain('hazel');
    expect(soft('gnawed-nut')).toContain('hazel');
    expect(soft('beechnut')).toContain('beech');
    expect(soft('beech-husk')).toContain('beech');
    for (const id of ['chestnut', 'hazelnut', 'beechnut']) expect(templates.find((x) => x.id === id)!.seasons, id).toEqual(['autumn']);
    for (const id of ['acorn', 'acorn-cup', 'beech-husk', 'gnawed-nut']) expect(templates.find((x) => x.id === id)!.seasons, id).toEqual(['autumn', 'winter']);
  });

  it('Tierartzuordnungen vermitteln keine falsche Sicherheit', () => {
    for (const id of ['deer-track', 'dog-track']) {
      const t = templates.find((x) => x.id === id)!;
      const text = `${t.prompt.one} ${resolveInfo(t, '7-10', t.environments[0], t.seasons[0]).info.whatIsIt}`;
      expect(text, id).toMatch(/könnte|passen/i);
    }
    // Fraßspuren: Wer es war, bleibt eine Vermutung und wird nie als Beobachtung behauptet.
    for (const id of ['gnawed-nut', 'gnawed-cone']) {
      const t = templates.find((x) => x.id === id)!;
      const r = resolveInfo(t, '7-10', t.environments[0], t.seasons[0]);
      expect(`${t.promptByAge?.['7-10']?.one ?? ''} ${r.extra}`, id).toMatch(/könnte|könnten|passen/i);
      const all = [r.info.whatIsIt, r.info.origin, r.special, r.extra].join(' ');
      expect(all, id).not.toMatch(/habt ihr gesehen|war hier ein|ist hier gewesen|hat hier gesessen/i);
    }
  });

  it('Kontexte: nur wo ohne die Art nichts zu finden ist, ist sie Voraussetzung; sonst macht sie Funde nur wahrscheinlicher', () => {
    const find = (id: string) => templates.find((t) => t.id === id)!;
    // Voraussetzung
    expect(find('maple-leaf').requiredContext).toContain('maple');
    expect(find('maple-seed').requiredContext).toContain('maple');
    expect(find('oak-leaf').requiredContext).toContain('oak');
    expect(find('gall').requiredContext).toContain('oak');
    expect(find('chestnut').requiredContext).toContain('chestnut');
    expect(find('chestnut-husk').requiredContext).toContain('chestnut');
    expect(find('fern-frond').requiredContext).toContain('fern');
    expect(find('fern-spores').requiredContext).toContain('fern');
    // freiwillig: ohne Angaben ist eine allgemeine Waldmission möglich
    for (const id of ['acorn', 'acorn-cup']) expect([find(id).requiredContext, find(id).softContext], id).toEqual([[], ['oak']]);
    for (const id of ['cone', 'gnawed-cone', 'cone-compare', 'needle-twig']) expect([find(id).requiredContext, find(id).softContext], id).toEqual([[], ['conifers']]);
    for (const id of ['beechnut', 'beech-husk', 'beech-bud']) expect([find(id).requiredContext, find(id).softContext], id).toEqual([[], ['beech']]);
  });

  it('jede Kontextbedingung ist im Wald auch auswählbar', () => {
    for (const t of templates.filter((x) => !x.retired)) {
      for (const tag of t.requiredContext) expect(CONTEXT_BY_ENV.forest, `${t.id} braucht ${tag}`).toContain(tag);
    }
  });

  it('jede angebotene Kontextangabe schaltet mindestens eine Vorlage frei, und es werden keine Sand-, Schnee-, Pfützen- oder Schattenangaben mehr angeboten', () => {
    for (const tag of CONTEXT_BY_ENV.forest) {
      expect(templates.some((t) => !t.retired && (t.requiredContext.includes(tag) || t.softContext.includes(tag))), tag).toBe(true);
    }
    for (const gone of ['sand', 'gravel', 'shadow', 'puddles', 'snow']) expect(CONTEXT_BY_ENV.forest).not.toContain(gone);
    for (const env of ['park', 'city', 'beach', 'meadow', 'garden', 'playground', 'mountain', 'water'] as const) expect(CONTEXT_BY_ENV[env]).toEqual([]);
    expect(ENVIRONMENTS).toEqual([{ id: 'forest', label: 'Wald' }]);
  });

  it('Rücksicht: Hinweise nennen nie Sammeln, Essen, Abreißen, Umdrehen oder Stören', () => {
    for (const t of templates.filter((x) => !x.retired)) {
      const hint = `${t.hint ?? ''}`;
      expect(hint, t.id).not.toMatch(/sammelt|einsammeln|esst|mitnehmen|nehmt mit|pflückt|abreißt|umdreht|aufbrecht/i);
      const texts = AGE_GROUPS.filter((a) => t.ageGroups.includes(a)).map((a) => resolveInfo(t, a, 'forest', t.seasons[0]).info.whereToLook).join(' ');
      expect(texts, t.id).not.toMatch(/pflückt|esst|nehmt mit|dreht (den|die|das) .* um|stochert|grabt/i);
    }
  });
});

describe('Katalog: Entdeckerhilfe', () => {
  const combos: { t: TaskTemplate; age: AgeGroup }[] = [];
  for (const t of templates) for (const age of t.ageGroups) combos.push({ t, age });

  it('alle drei Bausteine sind für jede angebotene Vorlage und Altersgruppe ausgearbeitet', () => {
    for (const { t, age } of combos) {
      for (const env of t.environments) {
        for (const season of t.seasons) {
          const { info } = resolveInfo(t, age, env, season);
          for (const key of ['whatIsIt', 'origin', 'whereToLook'] as const) {
            expect(info[key].trim().length, `${t.id} ${age} ${key}`).toBeGreaterThan(8);
            expect(info[key], `${t.id} ${key}`).toMatch(/[.!?]$/);
          }
        }
      }
    }
  });

  it('Kinderlichen Texte enthalten keine Quellenangaben und keine Sammelaufforderung', () => {
    for (const { t, age } of combos) {
      const { info } = resolveInfo(t, age, t.environments[0], t.seasons[0]);
      const all = Object.values(info).join(' ');
      expect(all, t.id).not.toMatch(/https?:|www\.|Quelle:/i);
      if (age === '2-3') expect(all, t.id).not.toMatch(/sammel|einsammeln|aufheben|mitnehmen/i);
    }
  });

  it('aktive Objektinfos sind echte kleine Erklärungen: mehrere Sätze, je nach Alter tiefer', () => {
    const sentences = (r: ReturnType<typeof resolveInfo>) =>
      [r.info.whatIsIt, r.info.origin, r.special, r.extra].join(' ').split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 2).length;
    const min: Record<AgeGroup, number> = { '2-3': 4, '4-6': 6, '7-10': 8 };
    for (const t of templates.filter((x) => !x.retired)) {
      for (const age of t.ageGroups) {
        const r = resolveInfo(t, age, 'forest', t.seasons[0]);
        expect(sentences(r), `${t.id} ${age}`).toBeGreaterThanOrEqual(min[age]);
        expect(r.info.whatIsIt.split(/\s+/).length, `${t.id} ${age} Baustein 1`).toBeGreaterThanOrEqual(6);
        expect(r.info.origin.split(/\s+/).length, `${t.id} ${age} Baustein 2`).toBeGreaterThanOrEqual(6);
        expect((r.special ?? '').split(/\s+/).length, `${t.id} ${age} Baustein 3`).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it('die drei Altersfassungen eines Motivs sind verschiedene Texte, nicht derselbe Absatz gekürzt', () => {
    for (const t of templates.filter((x) => !x.retired && x.ageGroups.length === 3)) {
      const parts = AGE_GROUPS.map((a) => resolveInfo(t, a, 'forest', t.seasons[0]).info.whatIsIt);
      expect(new Set(parts).size, t.id).toBe(3);
    }
  });

  it('Konzepte, die für 2–3 zugelassen sind, haben Texte für 2–3', () => {
    for (const t of templates.filter((x) => x.ageGroups.includes('2-3'))) {
      expect(concepts[t.conceptId].young, t.id).toBeDefined();
    }
  });

  it('jede Vorlage hat ein vollständiges Bildpaket', () => {
    for (const t of templates) {
      expect(t.image.illustrationKey).toBe(t.id);
      expect(t.image.alt.length, t.id).toBeGreaterThan(20);
      expect(t.image.recognitionFeatures.length, t.id).toBeGreaterThanOrEqual(2);
      expect(t.image.variantTags.length, t.id).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Katalog: Abdeckung (Jahreszeit × Alter, Wald)', () => {
  const rows: string[] = [];
  const ALL_CTX = CONTEXT_BY_ENV.forest;
  for (const season of SEASONS) {
    for (const age of AGE_GROUPS) {
      const a = distinctConcepts(eligibleTemplates({ age, environment: 'forest', season, seasonSource: 'auto', context: [], boost: false }));
      const b = distinctConcepts(eligibleTemplates({ age, environment: 'forest', season, seasonSource: 'auto', context: ALL_CTX, boost: false }));
      rows.push(`${season.padEnd(7)} ${age.padEnd(5)} ohne Angaben ${String(a).padStart(2)} · mit allen Angaben ${String(b).padStart(2)} Konzepte`);
    }
  }

  it('ohne Zusatzangaben bietet jede Kombination mindestens die Standardmissionsgröße an unterschiedlichen Konzepten', () => {
    const tooSmall: string[] = [];
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        const n = distinctConcepts(eligibleTemplates({ age, environment: 'forest', season, seasonSource: 'auto', context: [], boost: false }));
        const need = age === '2-3' ? 3 : 5;
        if (n < need) tooSmall.push(`${season}/${age}: ${n} (< ${need})`);
      }
    }
    expect(tooSmall, tooSmall.join('\n')).toEqual([]);
  });

  it('mit allen Angaben bietet jede Kombination mindestens vier (2–3) bzw. fünf verschiedene Konzepte', () => {
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        const pool = eligibleTemplates({ age, environment: 'forest', season, seasonSource: 'auto', context: ALL_CTX, boost: false });
        expect(distinctConcepts(pool), `${season}/${age}`).toBeGreaterThanOrEqual(age === '2-3' ? 4 : 5);
      }
    }
  });

  it('gibt die Abdeckung nachvollziehbar aus', () => {
    console.log('\nKatalogabdeckung Wald (Konzepte):\n' + rows.join('\n'));
    expect(rows).toHaveLength(4 * 3);
  });
});

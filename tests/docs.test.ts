import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { concepts } from '../src/catalog/concepts';
import { CATALOG_VERSION, templates } from '../src/catalog/templates';
import { CONTEXT_BY_ENV, CONTEXT_LABEL, SEASON_LABEL, THEME_INFO } from '../src/domain/meta';
import { distinctConcepts, eligibleTemplates, generateRound } from '../src/domain/generator';
import { gifts } from '../src/catalog/gifts';
import { giftSources } from '../src/catalog/giftSources';
import { infoWordCount, resolveInfo, wordCount } from '../src/domain/resolve';
import { seededRng } from '../src/domain/rng';
import { AGE_GROUPS, FOREST, SEASONS, THEMES, type AgeGroup, type ContextTag, type Season } from '../src/domain/types';
import { tally } from './distribution';

/**
 * Erzeugt docs/KATALOGABDECKUNG.md, docs/ZIEHVERTEILUNG.md, docs/BILDZUORDNUNG.md und docs/WALDKATALOG.md aus dem echten Katalog.
 * Ausführen mit: npm run docs:generate
 */
const write = process.env.WRITE_DOCS === '1';
const active = templates.filter((t) => !t.retired);
const ALL_CTX = CONTEXT_BY_ENV[FOREST];

describe.skipIf(!write)('Dokumentation erzeugen', () => {
  it('schreibt die Abdeckungsübersicht', () => {
    const lines = [
      '# Katalogabdeckung (Wald)',
      '',
      `Katalogstand ${CATALOG_VERSION}. Anzahl **unterschiedlicher Konzepte** je Jahreszeit und Altersgruppe, einmal **ohne** Kontextangaben und einmal mit **allen** freiwilligen Angaben (Nadelbäume, Buche, Eiche, Ahorn, Hasel, Rosskastanie, Farn, weicher Boden).`,
      'Dieser Wert ist die Obergrenze der Missionsgröße. Standardmission: 3 Stationen (2–3 Jahre) bzw. 5 Stationen. Ist der Pool kleiner, wird die Mission ehrlich kürzer, nie mit Füllaufgaben aufgefüllt.',
      '',
      '| Jahreszeit | Alter | ohne Angaben | mit allen Angaben |',
      '|---|---|---:|---:|',
    ];
    let min = 99;
    for (const season of SEASONS) {
      for (const age of AGE_GROUPS) {
        const a = distinctConcepts(eligibleTemplates({ age, environment: FOREST, season, seasonSource: 'auto', context: [], boost: false }));
        const b = distinctConcepts(eligibleTemplates({ age, environment: FOREST, season, seasonSource: 'auto', context: ALL_CTX, boost: false }));
        min = Math.min(min, a);
        lines.push(`| ${SEASON_LABEL[season]} | ${age} | ${a} | ${b} |`);
      }
    }
    lines.push('', `Kleinster Wert ohne Angaben: **${min}** Konzepte.`, '', '## Konzepte je Leitmotiv (alle Angaben bestätigt)', '', '| Leitmotiv | ' + SEASONS.map((s) => SEASON_LABEL[s]).join(' | ') + ' |', '|---|' + SEASONS.map(() => '---:').join('|') + '|');
    for (const theme of THEMES) {
      const cells = SEASONS.map((season) => {
        const pool = eligibleTemplates({ age: '7-10', environment: FOREST, season, seasonSource: 'auto', context: ALL_CTX, boost: false }).filter((t) => t.themes.includes(theme));
        return String(distinctConcepts(pool));
      });
      lines.push(`| ${THEME_INFO[theme].title} (7–10) | ${cells.join(' | ')} |`);
    }
    // Wortzahlen der Entdeckerhilfe
    const stats: string[] = ['', '## Länge der Entdeckerhilfe (Was ist das, Woher, Was ist besonders, bei 7–10 Zusatzgedanke)', '', '| Altersgruppe | Vorlagen | Min | Median | Max |', '|---|---:|---:|---:|---:|'];
    for (const age of AGE_GROUPS) {
      const counts = active
        .filter((t) => t.ageGroups.includes(age))
        .map((t) => wordCount(resolveInfo(t, age, FOREST, t.seasons[0]).info))
        .sort((a, b) => a - b);
      stats.push(`| ${age} | ${counts.length} | ${counts[0]} | ${counts[Math.floor(counts.length / 2)]} | ${counts[counts.length - 1]} |`);
    }
    mkdirSync('docs', { recursive: true });
    writeFileSync('docs/KATALOGABDECKUNG.md', lines.concat(stats).join('\n') + '\n', 'utf8');
    expect(min).toBeGreaterThan(0);
  });

  it('schreibt die Ziehverteilung, Leitmotive und Beispielmissionen', () => {
    const labelCtx = (c: ContextTag[]) => (c.length ? c.map((x) => CONTEXT_LABEL[x]).join(', ') : 'ohne Zusatzangaben');
    const cases: { age: AgeGroup; season: Season; context: ContextTag[] }[] = [
      { age: '2-3', season: 'autumn', context: [] },
      { age: '2-3', season: 'autumn', context: ['conifers', 'chestnut', 'oak', 'hazel', 'beech'] },
      { age: '2-3', season: 'winter', context: ['conifers'] },
      { age: '2-3', season: 'spring', context: ['fern'] },
      { age: '4-6', season: 'autumn', context: ['conifers', 'chestnut', 'oak', 'hazel', 'beech'] },
      { age: '4-6', season: 'spring', context: ['mud', 'fern'] },
      { age: '4-6', season: 'summer', context: [] },
      { age: '4-6', season: 'winter', context: [] },
      { age: '7-10', season: 'autumn', context: ['conifers', 'maple', 'oak', 'hazel', 'beech', 'mud'] },
      { age: '7-10', season: 'summer', context: ['fern', 'oak'] },
      { age: '7-10', season: 'winter', context: ['conifers', 'hazel', 'beech'] },
      { age: '7-10', season: 'spring', context: [] },
    ];
    const lines = [
      '# Ziehverteilung und Beispielmissionen (Wald)',
      '',
      'Je Kombination wurden 400 Missionen mit festen Seeds (1–400) erzeugt. Die Tabellen zeigen, in wie viel Prozent der Missionen ein **Konzept** vorkommt, und welche **Leitmotive** die Missionen tragen. Dient zur Kontrolle der Gewichte.',
      '',
    ];
    for (const c of cases) {
      const t = tally({ ...c, runs: 400 });
      const count = c.age === '2-3' ? 3 : 5;
      const themeCount: Record<string, number> = {};
      for (let seed = 1; seed <= 400; seed++) {
        const r = generateRound({ age: c.age, environment: FOREST, season: c.season, seasonSource: 'auto', context: c.context, boost: false, count, seed, rng: seededRng(seed * 7919), now: 1_700_000_000_000 }).round!;
        const key = r.mission?.title ?? '?';
        themeCount[key] = (themeCount[key] ?? 0) + 1;
      }
      lines.push(`## ${c.age} Jahre · ${SEASON_LABEL[c.season]} · ${labelCtx(c.context)}`, '', '| Konzept | Anteil der Missionen |', '|---|---:|');
      for (const [k, v] of Object.entries(t.share).sort((a, b) => b[1] - a[1])) lines.push(`| ${concepts[k]?.label ?? k} (\`${k}\`) | ${(v * 100).toFixed(0)} % |`);
      lines.push('', '| Missionstitel | Anteil |', '|---|---:|');
      for (const [k, v] of Object.entries(themeCount).sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${((v / 400) * 100).toFixed(0)} % |`);
      lines.push('', 'Beispielmissionen (Seeds 1–3):', '');
      for (const seed of [1, 2, 3]) {
        const r = generateRound({ age: c.age, environment: FOREST, season: c.season, seasonSource: 'auto', context: c.context, boost: false, count, seed, rng: seededRng(seed * 7919), now: 1_700_000_000_000 }).round!;
        lines.push(`- Seed ${seed}: **${r.mission?.title}** – ${r.tasks.map((x) => x.prompt).join(' · ')}`);
      }
      lines.push('');
    }
    writeFileSync('docs/ZIEHVERTEILUNG.md', lines.join('\n'), 'utf8');
    expect(lines.length).toBeGreaterThan(40);
  });

  it('schreibt Objektinfos und Waldgeschenke mit Quellenzuordnung', () => {
    const lines = [
      '# Objektinfos (Katalogstand ' + CATALOG_VERSION + ')',
      '',
      'Alle aktiven Motive mit den drei Bausteinen je Altersgruppe: **Das habt ihr vor euch**, **So ist es entstanden**, **Sein kleines Waldgeheimnis** (7–10 zusätzlich „Zum Nachdenken“). Der Suchhinweis steht getrennt. Wortzahlen in Klammern.',
      '',
    ];
    for (const t of active) {
      lines.push(`## ${t.prompt.one}`, '', `\`${t.id}\` · Leitmotive: ${t.themes.map((x) => THEME_INFO[x].title).join('; ')}`, '');
      for (const age of t.ageGroups) {
        const r = resolveInfo(t, age, FOREST, t.seasons[0]);
        lines.push(`### ${age} Jahre (${infoWordCount(r)} Wörter)`, '', `- **Das habt ihr vor euch:** ${r.info.whatIsIt}`, `- **So ist es entstanden:** ${r.info.origin}`, `- **Sein kleines Waldgeheimnis:** ${r.special}`);
        if (r.extra) lines.push(`- **Zum Nachdenken:** ${r.extra}`);
        lines.push(`- *Suchhinweis:* ${r.info.whereToLook}`, '');
      }
    }
    writeFileSync('docs/OBJEKTINFOS.md', lines.join('\n'), 'utf8');

    const g = [
      '# Waldgeschenke (Katalogstand ' + CATALOG_VERSION + ')',
      '',
      `${gifts.length} vollständig ausgearbeitete Geschenke mit eigener Fassung für 2–3, 4–6 und 7–10 Jahre. Pro vollständig erfüllter Mission wird genau eines vergeben, ungelesene werden bevorzugt, passende zu den Funden werden vorgezogen.`,
      'Die Texte erzählen reale Naturzusammenhänge. Sie behaupten nie, ein Tier sei gesehen worden, und verlangen nie, etwas aufzuspüren, zu öffnen, zu sammeln oder zu essen.',
      '',
    ];
    for (const gift of gifts) {
      g.push(`## ${gift.title}`, '', `\`${gift.id}\` · Motiv: \`${gift.motif}\` · Themen: ${gift.themes.map((x) => THEME_INFO[x].title).join('; ')} · Quellen: ${gift.sources.join(', ')}`, '');
      for (const age of AGE_GROUPS) g.push(`**${age} Jahre** (${gift.text[age].split(/\s+/).length} Wörter)`, '', gift.text[age], '');
    }
    g.push('## Quellenverzeichnis und Prüfstand', '', '| ID | Quelle | Geprüft | Hinweis |', '|---|---|---|---|');
    const used = new Set(gifts.flatMap((x) => x.sources));
    for (const s of giftSources.filter((x) => used.has(x.id))) g.push(`| ${s.id} | ${s.url ? `[${s.title}](${s.url})` : s.title} | ${s.checked} | ${s.note} |`);
    g.push('', 'Quellen der Vorgabe, die als „nicht gelesen“ stehen, wurden nicht im Volltext geprüft. Die Aussagen wurden über die unter „V“ genannten Belege oder aus Allgemeinwissen gestützt; ein Fachlektorat steht aus.', '');
    writeFileSync('docs/WALDGESCHENKE.md', g.join('\n'), 'utf8');
    expect(g.length).toBeGreaterThan(50);
  });

  it('schreibt die Bildzuordnung und den Waldkatalog', () => {
    const lines = [
      '# Zuordnung Station ↔ Bildvariante (Wald)',
      '',
      'Jede aktive Vorlage hat genau ein eigenes Suchbild (`illustrationKey` = Vorlagen-ID). Das **Standbild** ist dieselbe Zeichnung in Ruhelage; die **Bewegung** wird über `animationPreset` gesteuert.',
      'Interne Ansicht zur Sichtkontrolle: `#/intern/bilder`. Alle Bilder sind eigene Zeichnungen (siehe `BILDNACHWEIS.md`).',
      '',
      '| Nr. | Vorlage / Bild | Konzept | Leitmotive | Jahreszeiten | Bewegung | Varianten | Erkennungsmerkmale | Alter | Kontext |',
      '|---:|---|---|---|---|---|---|---|---|---|',
    ];
    for (const t of active) {
      lines.push(
        `| ${t.sourceNo} | \`${t.id}\` – ${t.prompt.one} | ${t.conceptId} (${concepts[t.conceptId].label}) | ${t.themes.map((x) => THEME_INFO[x].title).join('; ')} | ${t.seasons.map((s) => SEASON_LABEL[s]).join(', ')} | ${t.image.animationPreset} | ${t.image.variantTags.join(', ')} | ${t.image.recognitionFeatures.join('; ')} | ${t.ageGroups.join(', ')} | ${t.requiredContext.map((c) => CONTEXT_LABEL[c]).join(', ') || '–'} |`,
      );
    }
    const retired = templates.filter((t) => t.retired);
    lines.push('', '## Ausgemusterte Vorlagen (nur noch für alte, gespeicherte Runden)', '', retired.map((t) => `\`${t.id}\``).join(', '), '');
    writeFileSync('docs/BILDZUORDNUNG.md', lines.join('\n') + '\n', 'utf8');
    expect(lines.length).toBeGreaterThan(40);
  });
});

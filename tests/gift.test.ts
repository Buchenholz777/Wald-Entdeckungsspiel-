import { describe, expect, it } from 'vitest';
import { gifts, giftsById } from '../src/catalog/gifts';
import { giftSourcesById } from '../src/catalog/giftSources';
import { templates } from '../src/catalog/templates';
import { generateRound, replaceTask, type GenerateParams } from '../src/domain/generator';
import { chooseGift, foundCounts, isFullyFound, markCelebrated, needsCelebration, rememberGift, withGift } from '../src/domain/gift';
import { addFound, completeCompare, finishRound, skip, toggleSeen, undo } from '../src/domain/round';
import { seededRng } from '../src/domain/rng';
import { ARCHIVE_KEY, ROUND_KEY, createPersistence, sanitizeRound, sanitizeSettings } from '../src/domain/storage';
import { AGE_GROUPS, FOREST, type AgeGroup, type Round } from '../src/domain/types';
import { artRegistry } from '../src/illustrations/registry';

function mission(count: number, age: AgeGroup = '4-6', seed = 3): Round {
  const p: GenerateParams = { age, environment: FOREST, season: 'autumn', seasonSource: 'auto', context: ['conifers', 'oak', 'beech', 'hazel', 'maple', 'mud', 'fern'], boost: false, count, seed, rng: seededRng(seed), now: 1_700_000_000_000 };
  return generateRound(p).round!;
}

/** Findet eine Aufgabe vollständig, so wie es die Oberfläche tut: Einzelfund, Zählen bis zum Ziel, Vergleich nach beiden Stücken. */
function findTask(r: Round, index: number, received: string[] = []): Round {
  const t = r.tasks[index];
  let cur = r;
  if (t.mode === 'compare') {
    cur = toggleSeen(cur, t.uid, 0);
    cur = toggleSeen(cur, t.uid, 1);
    cur = completeCompare(cur, t.uid);
  } else {
    for (let i = 0; i < t.target; i++) cur = addFound(cur, t.uid);
  }
  return withGift(cur, received, 1_700_000_100_000);
}

describe('Abschlussprüfung', () => {
  it.each([1, 2, 3, 4, 5])('Mission mit %i Aufgaben: erst nach der letzten vollständig erfüllten Aufgabe gibt es ein Geschenk', (n) => {
    let r = mission(n);
    expect(r.giftEligible).toBe(true);
    const total = r.tasks.length;
    for (let i = 0; i < total; i++) {
      expect(r.gift, `vor Aufgabe ${i + 1}`).toBeUndefined();
      expect(isFullyFound(r)).toBe(false);
      r = findTask(r, i);
      if (i < total - 1) expect(r.gift, `nach ${i + 1}/${total}`).toBeUndefined();
    }
    expect(isFullyFound(r)).toBe(true);
    expect(r.gift).toBeDefined();
    expect(r.gift!.celebrated).toBe(false);
    expect(needsCelebration(r)).toBe(true);
    expect(foundCounts(r)).toEqual({ done: total, total });
  });

  it('eine Zählaufgabe ist erst bei ihrer Zielmenge erfüllt, ein Vergleich zählt als eine Aufgabe', () => {
    // Mission mit Zählaufgabe suchen
    let found = false;
    for (let seed = 1; seed < 400 && !found; seed++) {
      let r = mission(3, '7-10', seed);
      const idx = r.tasks.findIndex((t) => t.mode === 'count' && t.target >= 2);
      if (idx < 0) continue;
      found = true;
      const t = r.tasks[idx];
      for (let i = 0; i < t.target - 1; i++) r = addFound(r, t.uid);
      expect(r.tasks[idx].status, 'noch nicht erfüllt').toBe('open');
      r = addFound(r, t.uid);
      expect(r.tasks[idx].status).toBe('done');
      r = addFound(r, t.uid); // Überzählen
      expect(r.tasks[idx].found).toBe(t.target);
    }
    expect(found).toBe(true);
    let cmp = false;
    for (let seed = 1; seed < 400 && !cmp; seed++) {
      let r = mission(3, '4-6', seed);
      const idx = r.tasks.findIndex((t) => t.mode === 'compare');
      if (idx < 0) continue;
      cmp = true;
      const t = r.tasks[idx];
      r = toggleSeen(r, t.uid, 0);
      r = completeCompare(r, t.uid);
      expect(r.tasks[idx].status, 'beide Stücke sind nötig').toBe('open');
      r = toggleSeen(r, t.uid, 1);
      r = completeCompare(r, t.uid);
      expect(r.tasks[idx].status).toBe('done');
      expect(foundCounts(r).total).toBe(3);
    }
    expect(cmp).toBe(true);
  });

  it('ausgelassene oder offene Aufgaben lösen nie ein Geschenk aus, auch nicht durch „Mission beenden“', () => {
    let r = mission(3);
    r = findTask(r, 0);
    r = findTask(r, 1);
    r = skip(r, r.tasks[2].uid);
    r = withGift(finishRound(r), []);
    expect(isFullyFound(r)).toBe(false);
    expect(r.gift).toBeUndefined();
    expect(needsCelebration(r)).toBe(false);
    // alles auslassen
    let all = mission(3);
    for (const t of all.tasks) all = skip(all, t.uid);
    all = withGift(finishRound(all), []);
    expect(all.gift).toBeUndefined();
    expect(foundCounts(all)).toEqual({ done: 0, total: 3 });
  });

  it('der Aufgabentausch ändert die vereinbarte Zahl nicht; die Mission ist erst mit dem Fund der ersetzten Aufgabe vollständig', () => {
    let r = mission(3);
    r = findTask(r, 0);
    r = findTask(r, 1);
    const swapped = replaceTask(r, r.tasks[2].uid, seededRng(9)).round!;
    expect(swapped.tasks).toHaveLength(3);
    expect(swapped.gift).toBeUndefined();
    const done = findTask(swapped, 2);
    expect(done.gift).toBeDefined();
  });

  it('eine bewusst vor Beginn angenommene kleinere Mission ist ihr eigenes Ziel; es wird nie nachträglich verkleinert', () => {
    const tiny = templates.filter((t) => ['moss', 'needle-twig'].includes(t.id));
    const r = generateRound({ age: '2-3', environment: FOREST, season: 'summer', seasonSource: 'auto', context: [], boost: false, count: 5, seed: 1, rng: seededRng(1), catalog: tiny }).round!;
    expect(r.tasks).toHaveLength(2);
    let cur = findTask(r, 0);
    expect(cur.gift).toBeUndefined();
    cur = findTask(cur, 1);
    expect(cur.gift).toBeDefined();
  });
});

describe('Geschenk: genau einmal, dauerhaft, idempotent', () => {
  it('Doppeltippen und wiederholte Prüfung vergeben kein zweites Geschenk und ändern das erste nicht', () => {
    let r = mission(3);
    r = findTask(r, 0);
    r = findTask(r, 1);
    r = findTask(r, 2);
    const first = r.gift!;
    const again = withGift(addFound(addFound(r, r.tasks[2].uid), r.tasks[2].uid), [first.id], 9_999);
    expect(again.gift).toEqual(first);
    expect(withGift(r, [])).toBe(r);
  });

  it('die Feier wird durch markCelebrated beendet und kehrt nie zurück (Neuladen, Zurück, Zusammenfassung)', () => {
    let r = mission(3);
    for (let i = 0; i < 3; i++) r = findTask(r, i);
    expect(needsCelebration(r)).toBe(true);
    r = markCelebrated(r);
    expect(needsCelebration(r)).toBe(false);
    const reloaded = sanitizeRound(JSON.parse(JSON.stringify(r)))!;
    expect(reloaded.gift).toEqual(r.gift);
    expect(needsCelebration(reloaded)).toBe(false);
    expect(markCelebrated(reloaded)).toBe(reloaded);
  });

  it('Rückgängig nach dem Erfolg: Aufgabe wieder offen, Geschenk bleibt lesbar, erneutes Erfüllen vergibt nichts Neues', () => {
    let r = mission(3);
    for (let i = 0; i < 3; i++) r = findTask(r, i);
    r = markCelebrated(r);
    const gift = r.gift!;
    r = undo(r, r.tasks[2].uid);
    expect(r.tasks[2].status).not.toBe('done');
    expect(isFullyFound(r), 'keine vollständige Mission behaupten').toBe(false);
    expect(needsCelebration(r)).toBe(false);
    expect(r.gift).toEqual(gift);
    expect(giftsById[r.gift!.id]).toBeDefined();
    r = findTask(r, 2, [gift.id]);
    expect(isFullyFound(r)).toBe(true);
    expect(r.gift).toEqual(gift);
    expect(needsCelebration(r), 'keine zweite Feier').toBe(false);
  });

  it('alte, auch vollständig gefundene Runden bekommen nie rückwirkend Geschenk oder Konfetti', () => {
    let r = mission(3);
    r = { ...r, giftEligible: undefined };
    for (let i = 0; i < 3; i++) r = findTask(r, i);
    expect(isFullyFound(r)).toBe(true);
    expect(r.gift).toBeUndefined();
    const stored = sanitizeRound(JSON.parse(JSON.stringify({ ...r, giftEligible: undefined, gift: undefined })))!;
    expect(stored.giftEligible).toBe(false);
    expect(withGift(stored, [])).toBe(stored);
  });

  it('beschädigte Geschenkdaten in gespeicherten Runden werden verworfen statt zu stören', () => {
    let r = mission(3);
    for (let i = 0; i < 3; i++) r = findTask(r, i);
    const bad = JSON.parse(JSON.stringify(r));
    bad.gift = { id: 'gibt-es-nicht', celebrated: true, at: 1 };
    expect(sanitizeRound(bad)!.gift).toBeUndefined();
    bad.gift = 'kaputt';
    expect(sanitizeRound(bad)!.gift).toBeUndefined();
  });

  it('Geschenkbuch in den Einstellungen: bekannte IDs, ohne Doppelte, in Reihenfolge', () => {
    const s = sanitizeSettings({ giftsReceived: ['eichelhaeher', 'unbekannt', 'totholz', 'eichelhaeher', 5] });
    expect(s.giftsReceived).toEqual(['eichelhaeher', 'totholz']);
    expect(rememberGift(['a'], 'a')).toEqual(['a']);
    expect(rememberGift(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('die Speicherung bewahrt Geschenk und Feierstatus über einen Neustart', () => {
    const data = new Map<string, string>();
    const store = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) };
    const p = createPersistence(store);
    let r = mission(3);
    for (let i = 0; i < 3; i++) r = findTask(r, i);
    r = markCelebrated(r);
    expect(p.saveRound(r)).toBe(true);
    const loaded = createPersistence(store).loadRound();
    expect(loaded.status).toBe('ok');
    expect(loaded.round!.gift).toEqual(r.gift);
    expect(isFullyFound(loaded.round!)).toBe(true);
    expect(data.has(ROUND_KEY)).toBe(true);
    expect(data.has(ARCHIVE_KEY)).toBe(false);
  });
});

describe('Auswahl des Geschenks', () => {
  it('bevorzugt ungelesene Geschenke und läuft nach zwölf Missionen nicht leer', () => {
    const received: string[] = [];
    for (let seed = 1; seed <= gifts.length; seed++) {
      const r = mission(3, '4-6', seed);
      const id = chooseGift(r, received);
      expect(received, `Seed ${seed}`).not.toContain(id);
      received.push(id);
    }
    expect(new Set(received).size).toBe(gifts.length);
    // alles bekannt: es gibt weiter ein gültiges Geschenk
    for (let seed = 100; seed < 130; seed++) expect(giftsById[chooseGift(mission(3, '4-6', seed), received)]).toBeDefined();
  });

  it('dieselbe Mission ergibt immer dasselbe Ergebnis; ein Geschenk passt bevorzugt zu den Funden', () => {
    const r = mission(5, '7-10', 11);
    expect(chooseGift(r, [])).toBe(chooseGift(r, []));
    const counts: Record<string, number> = {};
    for (let seed = 1; seed <= 300; seed++) {
      const m = mission(3, '4-6', seed);
      if (!m.tasks.some((t) => t.conceptId === 'moss')) continue;
      const id = chooseGift(m, []);
      counts[id] = (counts[id] ?? 0) + 1;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect((counts['moos-speicher'] ?? 0) / total, 'Moos-Funde führen öfter zum Moos-Geschenk').toBeGreaterThan(1 / gifts.length);
  });
});

describe('Geschenk-Bibliothek', () => {
  const sentenceCount = (s: string) => s.split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 2).length;
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

  it('enthält mindestens zwölf vollständig ausgearbeitete, verschiedene Geschenke mit Altersvarianten und Quellen', () => {
    expect(gifts.length).toBeGreaterThanOrEqual(12);
    expect(new Set(gifts.map((g) => g.id)).size).toBe(gifts.length);
    expect(new Set(gifts.map((g) => g.title)).size).toBe(gifts.length);
    for (const g of gifts) {
      expect(g.title.length, g.id).toBeGreaterThan(10);
      expect(g.sources.length, g.id).toBeGreaterThan(0);
      expect(artRegistry[g.motif], `${g.id}: Motiv ${g.motif}`).toBeDefined();
      const texts = AGE_GROUPS.map((a) => g.text[a]);
      expect(new Set(texts).size, `${g.id}: drei verschiedene Fassungen`).toBe(3);
    }
    // keine Titel ohne Text, kein derselbe Absatz unter anderem Titel
    const all = gifts.flatMap((g) => AGE_GROUPS.map((a) => g.text[a]));
    expect(new Set(all).size).toBe(all.length);
  });

  it('Umfang nach Alter: 2–3 etwa 4–6 kurze Sätze, 4–6 etwa 70–120 Wörter, 7–10 etwa 110–180 Wörter (Richtwerte mit Toleranz)', () => {
    const bad: string[] = [];
    for (const g of gifts) {
      const y = g.text['2-3'];
      const m = g.text['4-6'];
      const o = g.text['7-10'];
      if (sentenceCount(y) < 4 || sentenceCount(y) > 7) bad.push(`${g.id} 2–3: ${sentenceCount(y)} Sätze`);
      if (words(y) > 75) bad.push(`${g.id} 2–3: ${words(y)} Wörter`);
      if (words(m) < 60 || words(m) > 135) bad.push(`${g.id} 4–6: ${words(m)} Wörter`);
      if (words(o) < 105 || words(o) > 200) bad.push(`${g.id} 7–10: ${words(o)} Wörter`);
      if (words(y) >= words(m) || words(m) >= words(o)) bad.push(`${g.id}: Altersstufen werden nicht tiefer`);
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('jede genannte Quellen-ID ist im Quellenverzeichnis dokumentiert', () => {
    for (const g of gifts) for (const s of g.sources) expect(giftSourcesById[s], `${g.id}: ${s}`).toBeDefined();
  });

  it('Rücksicht und Ehrlichkeit: nichts Gesehenes behauptet, keine Aufträge zum Aufspüren, Öffnen, Sammeln oder Essen', () => {
    const FORBIDDEN = /ihr habt (den|die|das|einen|eine) .{0,30}(gesehen|entdeckt)|habt ihr gesehen|geht (zum|zur|zu den)|folgt dem|sucht (nach )?(dem|der|den) (nest|vogel|tier)|öffnet (den|die|das|ein)|sammelt ihr|sammelt (sie|es|ihn) (ein|auf)|nehmt .{0,20} mit|esst|probiert|schmeckt|heilt|Superkraft/i;
    for (const g of gifts) {
      for (const a of AGE_GROUPS) expect(g.text[a], `${g.id} ${a}`).not.toMatch(FORBIDDEN);
    }
  });

  it('keine Waldmythen: Moos zeigt nicht Norden, Flechten sind keine Moose, Pilze sind keine Pflanzen', () => {
    for (const g of gifts) for (const a of AGE_GROUPS) expect(g.text[a], `${g.id} ${a}`).not.toMatch(/zeigt (immer |zuverlässig )?nach Norden|Moos wächst (immer )?auf der Nordseite|Pilze sind Pflanzen|Flechte ist ein Moos/i);
    expect(gifts.find((g) => g.id === 'flechte-team')!.text['2-3']).toMatch(/kein Moos/);
    expect(gifts.find((g) => g.id === 'pilz-geflecht')!.text['4-6']).toMatch(/weder Pflanzen noch Tiere/);
  });

  it('die Pflichtbeispiele sind vorhanden: Eichelhäher als Vorbild für 4–6 und Eichhörnchen mit Winterruhe', () => {
    const jay = gifts.find((g) => g.id === 'eichelhaeher')!;
    expect(jay.text['4-6']).toMatch(/Eichelhäher/);
    expect(jay.text['4-6']).toMatch(/nebenbei bei der Ausbreitung von Eichen helfen/);
    expect(gifts.find((g) => g.id === 'eichhoernchen-winter')!.text['7-10']).toMatch(/keinen echten Winterschlaf/);
  });
});

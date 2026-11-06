import { describe, expect, it } from 'vitest';
import { generateRound } from '../src/domain/generator';
import { artRegistry } from '../src/illustrations/registry';
import { seededRng } from '../src/domain/rng';
import {
  addFound,
  canUndo,
  completeCompare,
  finishRound,
  nextOpenIndex,
  progress,
  reopenRound,
  skip,
  summaryText,
  toggleSeen,
  undo,
} from '../src/domain/round';
import { ARCHIVE_KEY, DEFAULT_SETTINGS, ROUND_KEY, SETTINGS_KEY, createPersistence, sanitizeRound, sanitizeSettings, type KeyValueStore } from '../src/domain/storage';
import type { Round, RoundTask } from '../src/domain/types';

function task(over: Partial<RoundTask> = {}): RoundTask {
  return {
    uid: 'a',
    templateId: 'fallen-leaf',
    conceptId: 'leaf',
    family: 'plants',
    mode: 'count',
    target: 3,
    prompt: 'Finde 3 Blätter auf dem Boden.',
    title: 'Finde 3 Blätter auf dem Boden',
    unit: 'Blättern',
    info: { whatIsIt: 'Das ist ein Blatt.', origin: 'Es wuchs an einer Pflanze.', whereToLook: 'Schaut auf den Boden.' },
    image: { illustrationKey: 'fallen-leaf', animationPreset: 'float', variantTags: [], recognitionFeatures: [], alt: 'Ein Blatt, das auf dem Boden liegt' },
    status: 'open',
    found: 0,
    ...over,
  };
}

function round(tasks: RoundTask[]): Round {
  return {
    id: 'r1',
    catalogVersion: '1.0.0',
    createdAt: 1,
    age: '4-6',
    environment: 'forest',
    season: 'autumn',
    seasonSource: 'auto',
    context: [],
    requestedCount: tasks.length,
    boost: false,
    seed: 1,
    tasks,
    excludedConcepts: [],
    activeIndex: 0,
    finished: false,
  };
}

describe('Zählen', () => {
  it('„3 Blätter“ zählt exakt von 0 auf 3 und überzählt nie', () => {
    let r = round([task()]);
    const steps: number[] = [];
    for (let i = 0; i < 6; i++) {
      r = addFound(r, 'a');
      steps.push(r.tasks[0].found);
    }
    expect(steps).toEqual([1, 2, 3, 3, 3, 3]);
    expect(r.tasks[0].status).toBe('done');
  });

  it('Rückgängig funktioniert auch nach Abschluss und stellt Offen-Status wieder her', () => {
    let r = round([task({ found: 2 })]);
    r = addFound(r, 'a');
    expect(r.tasks[0].status).toBe('done');
    r = undo(r, 'a');
    expect(r.tasks[0]).toMatchObject({ found: 2, status: 'open' });
    r = undo(undo(undo(undo(r, 'a'), 'a'), 'a'), 'a');
    expect(r.tasks[0]).toMatchObject({ found: 0, status: 'open' });
    expect(canUndo(r.tasks[0])).toBe(false);
  });

  it('Zielmenge 1: „Gefunden!“ schließt ab, doppeltes Tippen ändert nichts', () => {
    let r = round([task({ mode: 'single', target: 1 })]);
    r = addFound(r, 'a');
    const done = r;
    r = addFound(r, 'a');
    expect(r).toBe(done);
    expect(r.tasks[0]).toMatchObject({ found: 1, status: 'done' });
    r = undo(r, 'a');
    expect(r.tasks[0]).toMatchObject({ found: 0, status: 'open' });
  });
});

describe('Vergleich', () => {
  const cmp = () => task({ mode: 'compare', target: 2, seen: [false, false], compareLabels: ['A', 'B'] });

  it('wird erst nach dem Anschauen beider Dinge als ganzer Vergleich abgeschlossen', () => {
    let r = round([cmp()]);
    r = completeCompare(r, 'a');
    expect(r.tasks[0].status).toBe('open');
    r = toggleSeen(r, 'a', 0);
    r = completeCompare(r, 'a');
    expect(r.tasks[0].status).toBe('open');
    r = toggleSeen(r, 'a', 1);
    r = completeCompare(r, 'a');
    expect(r.tasks[0]).toMatchObject({ status: 'done', found: 2 });
  });

  it('„Gefunden“ zählt Vergleichsaufgaben nicht stückweise; Rückgängig öffnet wieder', () => {
    let r = round([cmp()]);
    expect(addFound(r, 'a')).toBe(r);
    r = toggleSeen(toggleSeen(r, 'a', 0), 'a', 1);
    r = completeCompare(r, 'a');
    r = undo(r, 'a');
    expect(r.tasks[0].status).toBe('open');
    expect(r.tasks[0].seen).toEqual([true, true]);
    r = undo(r, 'a');
    expect(r.tasks[0].seen).toEqual([true, false]);
  });
});

describe('Auslassen und Fortschritt', () => {
  it('ausgelassene Aufgaben werden nie als gefunden gewertet', () => {
    let r = round([task({ uid: 'a' }), task({ uid: 'b', found: 3, status: 'done' }), task({ uid: 'c' })]);
    r = skip(r, 'a');
    const p = progress(r);
    expect(p).toMatchObject({ total: 3, done: 1, skipped: 1, open: 1, resolved: 2 });
    expect(summaryText(p)).toBe('1 entdeckt, 1 ausgelassen, 1 offen');
    expect(r.tasks[0].found).toBe(0);
    r = undo(r, 'a');
    expect(r.tasks[0].status).toBe('open');
  });

  it('nächste offene Aufgabe wird zyklisch gefunden', () => {
    const r = round([task({ uid: 'a', status: 'done', found: 3 }), task({ uid: 'b' }), task({ uid: 'c', status: 'skipped' })]);
    expect(nextOpenIndex(r, 0)).toBe(1);
    expect(nextOpenIndex(r, 1)).toBe(1);
    expect(nextOpenIndex(round([task({ status: 'done', found: 3 })]), 0)).toBe(-1);
  });

  it('Runde beenden und wieder öffnen ist verlustfrei', () => {
    const r = round([task()]);
    const fin = finishRound(r);
    expect(fin.finished).toBe(true);
    expect(reopenRound(fin).finished).toBe(false);
    expect(reopenRound(fin).tasks).toBe(r.tasks);
  });
});

describe('Speicherung', () => {
  function memoryStore(): KeyValueStore & { data: Map<string, string> } {
    const data = new Map<string, string>();
    return {
      data,
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: (k) => void data.delete(k),
    };
  }

  it('speichert und lädt eine laufende Runde', () => {
    const store = memoryStore();
    const p = createPersistence(store);
    const r = generateRound({
      age: '4-6', environment: 'forest', season: 'autumn', seasonSource: 'auto', context: [], boost: false, count: 5, seed: 3, rng: seededRng(3),
    }).round!;
    expect(p.saveRound(r)).toBe(true);
    const loaded = p.loadRound();
    expect(loaded.status).toBe('ok');
    expect(loaded.round).toEqual(sanitizeRound(JSON.parse(JSON.stringify(r))));
    expect(loaded.round!.tasks[0].info.whatIsIt).toBe(r.tasks[0].info.whatIsIt);
  });

  it('eine vor dem Bilder-Update gespeicherte Runde zeigt beim Fortsetzen die neuen Bildangaben, behält aber Aufgaben, Zähler und Geschenk', () => {
    const store = memoryStore();
    const p = createPersistence(store);
    const r = generateRound({
      age: '4-6', environment: 'forest', season: 'autumn', seasonSource: 'auto', context: ['chestnut', 'oak', 'conifers'], boost: false, count: 5, seed: 8, rng: seededRng(8),
    }).round!;
    // Zustand „vor dem Update“: alte Bildbeschreibung und fortgeschrittener Spielstand
    const old = JSON.parse(JSON.stringify(r)) as Round;
    old.tasks[0].image = { ...old.tasks[0].image, alt: 'Alte Beschreibung des früheren Bildes', recognitionFeatures: ['Altes Merkmal'] };
    old.tasks[0].found = old.tasks[0].target;
    old.tasks[0].status = 'done';
    old.activeIndex = 1;
    old.gift = { id: 'eichelhaeher', celebrated: false, at: 5 };
    store.setItem(ROUND_KEY, JSON.stringify({ v: 1, savedAt: 1, round: old }));
    const loaded = p.loadRound().round!;
    const fresh = r.tasks[0].image;
    expect(loaded.tasks[0].image.alt).toBe(fresh.alt);
    expect(loaded.tasks[0].image.recognitionFeatures).toEqual(fresh.recognitionFeatures);
    expect(loaded.tasks[0].image.illustrationKey).toBe(fresh.illustrationKey);
    expect(loaded.tasks[0].status).toBe('done');
    expect(loaded.tasks[0].found).toBe(old.tasks[0].target);
    expect(loaded.activeIndex).toBe(1);
    expect(loaded.tasks.map((t) => t.uid)).toEqual(r.tasks.map((t) => t.uid));
    // Jede gespeicherte Aufgabe findet ein tatsächlich vorhandenes Suchbild
    for (const t of loaded.tasks) expect(artRegistry[t.image.illustrationKey], t.templateId).toBeDefined();
  });

  it('beschädigter Speicher führt zu klarem Status statt Absturz und wird bereinigt', () => {
    const store = memoryStore();
    store.setItem(ROUND_KEY, '{kaputt');
    const p = createPersistence(store);
    expect(p.loadRound().status).toBe('corrupt');
    expect(store.getItem(ROUND_KEY)).toBeNull();
    store.setItem(ROUND_KEY, JSON.stringify({ v: 1, round: { id: 'x', tasks: [] } }));
    expect(p.loadRound().status).toBe('corrupt');
    store.setItem(ROUND_KEY, JSON.stringify({ v: 99, round: {} }));
    expect(p.loadRound().status).toBe('corrupt');
    store.setItem(SETTINGS_KEY, 'nope');
    expect(p.loadSettings()).toMatchObject({ status: 'corrupt', settings: DEFAULT_SETTINGS });
  });

  it('blockierter oder voller Speicher ist nicht fatal', () => {
    const none = createPersistence(null);
    expect(none.available).toBe(false);
    expect(none.loadRound().status).toBe('blocked');
    expect(none.saveRound(round([task()]))).toBe(false);
    const full = createPersistence({
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    });
    expect(full.saveRound(round([task()]))).toBe(false);
    expect(full.saveSettings(DEFAULT_SETTINGS)).toBe(false);
  });

  it('Einstellungen werden bereinigt', () => {
    const s = sanitizeSettings({ age: '9-9', environment: 'beach', taskCount: 12, boost: 'ja', context: ['fern', 'laser'], motionOff: true, lastRoundTheme: 'quatsch' });
    // Es gibt nur noch den Wald: ein früher gewählter Ort wird nicht übernommen.
    expect(s).toMatchObject({ age: null, environment: null, taskCount: null, boost: false, context: ['fern'], motionOff: true, lastRoundTheme: null });
  });

  it('eine gespeicherte Runde behält ihre Jahreszeit und ihre Aufgaben', () => {
    const r = round([task()]);
    const loaded = sanitizeRound(JSON.parse(JSON.stringify({ ...r, season: 'winter' })))!;
    expect(loaded.season).toBe('winter');
    expect(loaded.tasks[0].prompt).toBe(r.tasks[0].prompt);
  });
});

describe('Umstieg auf den Wald: Runden früherer Orte', () => {
  function memoryStore(): KeyValueStore {
    const data = new Map<string, string>();
    return {
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: (k) => void data.delete(k),
    };
  }

  it('eine gespeicherte Strandrunde wird archiviert, nicht gelöscht, nicht umgedeutet und nicht als laufende Mission geladen', () => {
    const store = memoryStore();
    const old = { ...round([task()]), environment: 'beach' as const };
    const payload = JSON.stringify({ v: 1, savedAt: 5, round: old });
    store.setItem(ROUND_KEY, payload);
    const p = createPersistence(store);
    const res = p.loadRound();
    expect(res.status).toBe('archived');
    expect(res.round).toBeNull();
    expect(store.getItem(ROUND_KEY)).toBeNull();
    expect(store.getItem(ARCHIVE_KEY)).toBe(payload); // unverändert
    const archived = p.loadArchive()!;
    expect(archived.environment).toBe('beach');
    expect(archived.tasks[0].prompt).toBe('Finde 3 Blätter auf dem Boden.');
    // zweiter Start: kein erneutes Archivieren, kein Absturz
    expect(p.loadRound().status).toBe('empty');
    expect(p.loadArchive()).not.toBeNull();
  });

  it('eine gespeicherte Waldrunde aus früherem Katalogstand bleibt eine laufende Mission', () => {
    const store = memoryStore();
    store.setItem(ROUND_KEY, JSON.stringify({ v: 1, savedAt: 5, round: round([task()]) }));
    const res = createPersistence(store).loadRound();
    expect(res.status).toBe('ok');
    expect(res.round?.environment).toBe('forest');
  });

  it('alte Einstellungen mit einem anderen Ort werden nicht übernommen, die übrigen bleiben', () => {
    const s = sanitizeSettings({ age: '4-6', environment: 'meadow', showMoreEnvironments: true, context: ['sand', 'oak'] });
    expect(s.environment).toBeNull();
    expect(s.age).toBe('4-6');
    expect(s.context).toContain('oak');
  });
});

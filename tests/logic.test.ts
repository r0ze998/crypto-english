import { describe, expect, it } from 'vitest';
import { addDays, diffDays } from '../src/lib/date';
import { INTERVALS, isDue, newSrs, review } from '../src/lib/srs';
import { confirmedFact, defaultState, normalizeState, SCHEMA_VERSION } from '../src/lib/state';
import { buildBackup, mergeStates, parseBackup } from '../src/lib/backup';
import { createOriginal, sha256Hex, splitForListening, verifyOriginal } from '../src/lib/pitch';
import { addPhrases } from '../src/lib/phrases';
import { buildPlan, fillFrame, levelAdvice, pickScenes } from '../src/lib/session';
import { CURRICULUM_ORDER, getScene, SCENES } from '../src/data/scenes';

describe('date', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(diffDays('2026-03-01', '2026-03-08')).toBe(7);
  });
});

describe('srs', () => {
  const today = '2026-10-23';
  it('new items are due tomorrow, not today', () => {
    const s = newSrs(today);
    expect(s.due).toBe('2026-10-24');
    expect(isDue(s, today)).toBe(false);
    expect(isDue(s, '2026-10-24')).toBe(true);
  });
  it('good moves up a box, again resets', () => {
    let s = newSrs(today);
    s = review(s, 'good', today);
    expect(s.box).toBe(1);
    expect(s.due).toBe(addDays(today, INTERVALS[1]));
    s = review(s, 'good', today);
    expect(s.box).toBe(2);
    s = review(s, 'again', today);
    expect(s.box).toBe(0);
    expect(s.due).toBe(addDays(today, 1));
    expect(s.lapses).toBe(1);
    expect(s.reviews).toBe(3);
  });
  it('hard keeps the box and waits at least a day', () => {
    const s = review({ box: 0, due: today, reviews: 0, lapses: 0 }, 'hard', today);
    expect(s.box).toBe(0);
    expect(s.due).toBe(addDays(today, 1));
  });
  it('box is capped', () => {
    let s = newSrs(today);
    for (let i = 0; i < 20; i++) s = review(s, 'good', today);
    expect(s.box).toBe(INTERVALS.length - 1);
  });
});

describe('state normalize', () => {
  it('fills defaults and drops bad values', () => {
    const s = normalizeState({ schemaVersion: 1, settings: { rate: 99, level: 'x' }, phrases: [{ id: 'a', en: 'Hi', srs: { box: 50, due: 'bad' } }, { bad: true }] });
    expect(s.settings.rate).toBe(1.3);
    expect(s.settings.level).toBe('a2');
    expect(s.settings.speechRecognition).toBe(false);
    expect(s.settings.ai.provider).toBe('none');
    expect(s.phrases).toHaveLength(1);
    expect(s.phrases[0].srs.box).toBe(6);
    expect(s.project.oneLiner.status).toBe('unprovided');
  });
  it('rejects unknown versions', () => {
    expect(() => normalizeState({ schemaVersion: SCHEMA_VERSION + 1 })).toThrow();
    expect(() => normalizeState('nope')).toThrow();
  });
  it('only confirmed facts are used', () => {
    const s = defaultState();
    s.project.chain = { value: 'Solana', status: 'needs_check', note: '' };
    expect(confirmedFact(s, 'chain')).toBeUndefined();
    s.project.chain.status = 'confirmed';
    expect(confirmedFact(s, 'chain')).toBe('Solana');
  });
});

describe('pitch', () => {
  it('stores the original byte-for-byte and verifies it', async () => {
    const text = '  Hello.  We build X!\nLine two?  ';
    const o = await createOriginal(text, 'p');
    expect(o.text).toBe(text);
    expect(o.sha256).toBe(await sha256Hex(text));
    expect(await verifyOriginal(o)).toBe(true);
    expect(await verifyOriginal({ ...o, text: text.trim() })).toBe(false);
  });
  it('splitting for listening is lossless', () => {
    const text = 'One. Two!  Three?\nFour without end';
    expect(splitForListening(text).join('')).toBe(text);
    expect(splitForListening(text).length).toBeGreaterThan(1);
  });
});

describe('backup', () => {
  it('round-trips state', async () => {
    let s = defaultState();
    s = addPhrases(s, [{ en: 'Let me check.', ja: '確認します', note: '' }]).state;
    s.pitch.originals.push(await createOriginal('Original pitch.', 'p'));
    const file = await buildBackup(s);
    const parsed = parseBackup(JSON.stringify(file));
    expect(parsed.state).toEqual(s);
  });
  it('round-trips recordings as base64', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3, 250])], { type: 'audio/webm' });
    const file = await buildBackup(defaultState(), [{ id: 'r1', blob, mime: 'audio/webm', createdAt: 'x', label: 'l', contextKey: 'k' }]);
    const parsed = parseBackup(JSON.stringify(file));
    expect(parsed.recordings).toHaveLength(1);
    expect(new Uint8Array(await parsed.recordings[0].blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3, 250]));
  });
  it('rejects foreign files', () => {
    expect(() => parseBackup('{"app":"other"}')).toThrow();
    expect(() => parseBackup('not json')).toThrow();
  });
  it('merge never overwrites an existing pitch original', async () => {
    const a = defaultState();
    const o = await createOriginal('Keep me.', 'p');
    a.pitch.originals.push(o);
    const b = defaultState();
    b.pitch.originals.push({ ...o, text: 'Changed!' });
    const { state, report } = mergeStates(a, b);
    expect(state.pitch.originals).toHaveLength(1);
    expect(state.pitch.originals[0].text).toBe('Keep me.');
    expect(report.pitchConflicts).toBe(1);
  });
  it('merge adds new phrases and keeps settings', () => {
    const a = defaultState();
    a.settings.name = 'me';
    const b = addPhrases(defaultState(), [{ en: 'Hi', ja: '', note: '' }]).state;
    b.settings.name = 'other';
    const { state, report } = mergeStates(a, b);
    expect(state.phrases).toHaveLength(1);
    expect(state.settings.name).toBe('me');
    expect(report.phrasesAdded).toBe(1);
  });
});

describe('phrases', () => {
  it('dedupes by English text and pulls due date forward', () => {
    const today = '2026-10-23';
    let s = addPhrases(defaultState(), [{ en: 'Got it.', ja: '', note: '' }], undefined, today).state;
    s.phrases[0].srs.due = '2026-12-01';
    s = addPhrases(s, [{ en: '  got   it. ', ja: '', note: '' }], undefined, today).state;
    expect(s.phrases).toHaveLength(1);
    expect(s.phrases[0].srs.due).toBe('2026-10-24');
  });
});

describe('session plan', () => {
  it('10 minutes = one scene, one follow-up, no fluency', () => {
    const p = buildPlan(defaultState(), 10);
    expect(p.sceneIds).toHaveLength(1);
    expect(p.sceneIds[0]).toBe(CURRICULUM_ORDER[0]);
    expect(p.followUpsPerScene).toBe(1);
    expect(p.fluency).toBe(false);
    expect(p.pitch).toBe(false);
  });
  it('picks unplayed scenes first, then oldest', () => {
    const s = defaultState();
    s.sceneProgress[CURRICULUM_ORDER[0]] = { times: 1, last: '2026-10-01', lastLevel: 'a2' };
    expect(pickScenes(s, 1)[0]).toBe(CURRICULUM_ORDER[1]);
    for (const id of CURRICULUM_ORDER) s.sceneProgress[id] = { times: 1, last: '2026-10-10', lastLevel: 'a2' };
    s.sceneProgress[CURRICULUM_ORDER[5]].last = '2026-09-01';
    expect(pickScenes(s, 1)[0]).toBe(CURRICULUM_ORDER[5]);
  });
  it('pitch practice only when an original exists', async () => {
    const s = defaultState();
    expect(buildPlan(s, 60).pitch).toBe(false);
    s.pitch.originals.push(await createOriginal('x', 'p'));
    expect(buildPlan(s, 60).pitch).toBe(true);
  });
  it('level advice', () => {
    const base = { sceneId: 'x', compCorrect: 2, compTotal: 2, helpCount: 0, followUpSelf: ['ok' as const], savedPhrases: 0 };
    expect(levelAdvice({ ...base, level: 'a2' }).suggest).toBe('plus');
    expect(levelAdvice({ ...base, level: 'plus', compCorrect: 0 }).suggest).toBe('a2');
    expect(levelAdvice({ ...base, level: 'a2', helpCount: 5 }).suggest).toBe('slower');
  });
  it('fills frames', () => {
    const f = getScene('s01-meet')!.frame;
    expect(fillFrame(f, { name: 'r0ze', role: 'game developer', place: 'Japan' })).toBe("Hi, I'm r0ze. I'm a game developer from Japan.");
    expect(fillFrame(f, { name: 'r0ze' })).toContain('___');
  });
});

describe('content integrity', () => {
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const sentences = (s: string) => s.split(/(?<=[.!?])\s+/);

  it('curriculum lists every scene exactly once', () => {
    expect([...CURRICULUM_ORDER].sort()).toEqual(SCENES.map((s) => s.id).sort());
  });
  it('ids are unique', () => {
    const ids = SCENES.flatMap((s) => s.phrases.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  for (const s of SCENES) {
    it(`${s.id}: structure`, () => {
      expect(s.versions.a2.length).toBeGreaterThan(3);
      expect(s.versions.plus.length).toBeGreaterThan(3);
      expect(s.questions.length).toBeGreaterThanOrEqual(2);
      for (const q of s.questions) expect(q.answer).toBeLessThan(q.choices.length);
      expect(s.followUps.length).toBeGreaterThanOrEqual(2);
      const keys = [...s.frame.template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(keys).toEqual(s.frame.slots.map((x) => x.key).sort());
      for (const l of [...s.versions.a2, ...s.versions.plus]) {
        expect(l.en.trim()).toBe(l.en);
        expect(l.ja.length).toBeGreaterThan(0);
      }
    });
    it(`${s.id}: A2 sentences are short`, () => {
      for (const l of s.versions.a2) for (const sen of sentences(l.en)) expect(words(sen), sen).toBeLessThanOrEqual(12);
    });
  }
});

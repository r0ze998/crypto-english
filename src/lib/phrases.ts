import type { AppState, SavedPhrase } from './state';
import { newSrs } from './srs';
import { addDays, dayKey, uid } from './date';

export interface NewPhrase {
  en: string;
  ja: string;
  note: string;
}

const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * 表現を復習キューに追加。同じ英文が既にあれば重複させず、
 * 復習日が明日より先なら明日に早める（詰まった＝早めに復習）。
 */
export function addPhrases(state: AppState, items: NewPhrase[], sourceSceneId?: string, today = dayKey()): { state: AppState; count: number } {
  const tomorrow = addDays(today, 1);
  const now = new Date().toISOString();
  const phrases = [...state.phrases];
  let count = 0;
  for (const it of items) {
    if (!it.en.trim()) continue;
    const i = phrases.findIndex((p) => norm(p.en) === norm(it.en));
    if (i >= 0) {
      const p = phrases[i];
      if (p.srs.due > tomorrow) phrases[i] = { ...p, srs: { ...p.srs, due: tomorrow }, updatedAt: now };
    } else {
      const p: SavedPhrase = {
        id: uid('ph-'),
        en: it.en.trim(),
        ja: it.ja.trim(),
        note: it.note.trim(),
        sourceSceneId,
        createdAt: now,
        updatedAt: now,
        srs: newSrs(today),
      };
      phrases.push(p);
    }
    count++;
  }
  return { state: { ...state, phrases }, count };
}

export function phraseKeySet(state: AppState): Set<string> {
  return new Set(state.phrases.map((p) => norm(p.en)));
}

import { CURRICULUM_ORDER, getScene } from '../data/scenes';
import type { Frame, Level } from '../data/types';
import type { AppState, SceneResult } from './state';
import { isDue } from './srs';
import { dayKey } from './date';

export type Minutes = 10 | 30 | 60;

export interface SessionPlan {
  minutes: Minutes;
  reviewIds: string[];
  sceneIds: string[];
  followUpsPerScene: number;
  /** 同じ説明を時間を短くしながら3回話す（4/3/2 方式を短くしたもの） */
  fluency: boolean;
  pitch: boolean;
}

const PLAN: Record<Minutes, { review: number; scenes: number; followUps: number; fluency: boolean; pitch: boolean }> = {
  10: { review: 3, scenes: 1, followUps: 1, fluency: false, pitch: false },
  30: { review: 8, scenes: 2, followUps: 2, fluency: true, pitch: false },
  60: { review: 15, scenes: 3, followUps: 2, fluency: true, pitch: true },
};

/** 未練習の場面を推奨順に、その後は最後に練習した日が古い順 */
export function pickScenes(state: AppState, n: number, first?: string): string[] {
  const order = [...CURRICULUM_ORDER];
  const unplayed = order.filter((id) => !state.sceneProgress[id]);
  const played = order
    .filter((id) => state.sceneProgress[id])
    .sort((a, b) => state.sceneProgress[a].last.localeCompare(state.sceneProgress[b].last));
  const queue = [...unplayed, ...played];
  const out: string[] = [];
  if (first && getScene(first)) out.push(first);
  for (const id of queue) {
    if (out.length >= n) break;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export function dueItems(state: AppState, today = dayKey()) {
  return state.phrases
    .filter((p) => isDue(p.srs, today))
    .sort((a, b) => a.srs.due.localeCompare(b.srs.due) || a.srs.box - b.srs.box);
}

export function buildPlan(state: AppState, minutes: Minutes, firstScene?: string): SessionPlan {
  const p = PLAN[minutes];
  return {
    minutes,
    reviewIds: dueItems(state).slice(0, p.review).map((x) => x.id),
    sceneIds: pickScenes(state, p.scenes, firstScene),
    followUpsPerScene: p.followUps,
    fluency: p.fluency,
    pitch: p.pitch && state.pitch.originals.length > 0,
  };
}

export interface LevelAdvice {
  suggest: Level | 'slower' | null;
  messageJa: string;
}

/**
 * 難度の調整案。「約90%が分かる」ことを目安にした大まかな判断で、
 * 学力の判定ではない。
 */
export function levelAdvice(r: SceneResult): LevelAdvice {
  const ratio = r.compTotal ? r.compCorrect / r.compTotal : 1;
  const struggled = r.followUpSelf.filter((g) => g === 'no').length;
  if (ratio === 1 && r.helpCount <= 1 && struggled === 0 && r.level === 'a2') {
    return { suggest: 'plus', messageJa: '理解も応答もスムーズでした。次は「少し難しい版」を試してもよさそうです。' };
  }
  if (ratio < 0.5 || r.helpCount >= 4) {
    if (r.level === 'plus') return { suggest: 'a2', messageJa: '少し難しかったようです。A2 版に戻すと、聞き取れる割合が上がりやすくなります。' };
    return { suggest: 'slower', messageJa: '難しめでした。速度を下げる・英語字幕を先に見てから聞く・キーワードを先に確認する、を試してください。' };
  }
  return { suggest: null, messageJa: 'ちょうどよい難しさだったようです。この難度で続けましょう。' };
}

export function fillFrame(frame: Frame, values: Record<string, string>): string {
  return frame.template.replace(/\{(\w+)\}/g, (_, k: string) => values[k]?.trim() || '___');
}

export function frameIsComplete(frame: Frame, values: Record<string, string>): boolean {
  return frame.slots.every((s) => values[s.key]?.trim());
}

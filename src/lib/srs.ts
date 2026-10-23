// 復習スケジュール（Leitner 方式の簡易版）。
// 分散学習（間隔を空けた復習）と想起練習を組み合わせる目的。間隔は目安で、
// 研究で決まった最適値ではない。

import { addDays, dayKey } from './date';

export const INTERVALS = [1, 2, 4, 7, 15, 30, 60];

export interface SrsState {
  box: number;
  due: string; // YYYY-MM-DD
  lastReviewed?: string;
  reviews: number;
  lapses: number;
}

export type Grade = 'again' | 'hard' | 'good';

/** 新しく保存した表現は翌日から復習に出る */
export function newSrs(today: string = dayKey()): SrsState {
  return { box: 0, due: addDays(today, 1), reviews: 0, lapses: 0 };
}

export function review(s: SrsState, grade: Grade, today: string = dayKey()): SrsState {
  const max = INTERVALS.length - 1;
  let box = s.box;
  let days: number;
  if (grade === 'again') {
    box = 0;
    days = 1;
  } else if (grade === 'hard') {
    days = Math.max(1, Math.round(INTERVALS[box] / 2));
  } else {
    box = Math.min(box + 1, max);
    days = INTERVALS[box];
  }
  return {
    box,
    due: addDays(today, days),
    lastReviewed: today,
    reviews: s.reviews + 1,
    lapses: s.lapses + (grade === 'again' ? 1 : 0),
  };
}

export function isDue(s: SrsState, today: string = dayKey()): boolean {
  return s.due <= today;
}

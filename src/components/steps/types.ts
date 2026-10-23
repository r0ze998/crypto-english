import type { Level } from '../../data/types';
import type { SessionPlan } from '../../lib/session';

export interface MarkedLine {
  en: string;
  ja: string;
}

export interface SceneRun {
  sceneId: string;
  level: Level;
  /** 設問ごとの最初の回答が正解だったか */
  compFirst: Record<number, boolean>;
  helpCount: number;
  followUpSelf: ('ok' | 'stuck' | 'no')[];
  savedPhrases: number;
  marked: MarkedLine[];
  frameValues: Record<string, string>;
}

export type Step =
  | { kind: 'review' }
  | { kind: 'listen' | 'comprehend' | 'imitate' | 'substitute' | 'save'; sceneId: string }
  | { kind: 'followup'; sceneId: string; index: number }
  | { kind: 'fluency' }
  | { kind: 'pitch' }
  | { kind: 'summary' };

export interface ActiveSession {
  id: string;
  plan: SessionPlan;
  step: number;
  startedAt: string;
  activeSeconds: number;
  runs: Record<string, SceneRun>;
  reviewed: number;
  fluencyRounds: number;
}

export function buildSteps(plan: SessionPlan): Step[] {
  const steps: Step[] = [];
  if (plan.reviewIds.length) steps.push({ kind: 'review' });
  for (const sceneId of plan.sceneIds) {
    steps.push({ kind: 'listen', sceneId }, { kind: 'comprehend', sceneId }, { kind: 'imitate', sceneId }, { kind: 'substitute', sceneId });
    for (let i = 0; i < plan.followUpsPerScene; i++) steps.push({ kind: 'followup', sceneId, index: i });
    steps.push({ kind: 'save', sceneId });
  }
  if (plan.fluency) steps.push({ kind: 'fluency' });
  if (plan.pitch) steps.push({ kind: 'pitch' });
  steps.push({ kind: 'summary' });
  return steps;
}

export const STEP_LABEL: Record<Step['kind'], string> = {
  review: '復習',
  listen: '1 聞く',
  comprehend: '2 理解チェック',
  imitate: '3 まねして言う',
  substitute: '3 自分の文に置き換え',
  followup: '4 追加質問に答える',
  save: '5 表現を保存',
  fluency: '繰り返し説明',
  pitch: 'ピッチ練習',
  summary: 'まとめ',
};

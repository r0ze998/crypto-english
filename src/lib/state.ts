import type { Level, ProjectFieldKey } from '../data/types';
import type { SrsState } from './srs';

export const SCHEMA_VERSION = 1;

export type FactStatus = 'unprovided' | 'needs_check' | 'confirmed';

export interface ProjectFact {
  value: string;
  status: FactStatus;
  note: string;
}

export interface PitchOriginal {
  id: string;
  /** 原文。保存後は変更しない（アプリ内に編集手段を置かない） */
  text: string;
  sha256: string;
  savedAt: string;
  label: string;
}

export interface Paraphrase {
  id: string;
  /** どの原文に対する言い換えか */
  pitchId: string;
  text: string;
  noteJa: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPhrase {
  id: string;
  en: string;
  ja: string;
  note: string;
  sourceSceneId?: string;
  createdAt: string;
  updatedAt: string;
  srs: SrsState;
}

export interface SceneResult {
  sceneId: string;
  level: Level;
  compCorrect: number;
  compTotal: number;
  helpCount: number;
  followUpSelf: ('ok' | 'stuck' | 'no')[];
  savedPhrases: number;
}

export interface SessionLog {
  id: string;
  startedAt: string;
  endedAt: string;
  plannedMinutes: number;
  activeSeconds: number;
  scenes: SceneResult[];
  reviewed: number;
  fluencyRounds: number;
  completed: boolean;
}

export interface AiSettings {
  /** none: 接続なし（既定）。openai-compatible: 鍵なしで使える自前/ローカルの互換エンドポイント */
  provider: 'none' | 'openai-compatible';
  baseUrl: string;
  model: string;
}

export interface Settings {
  name: string;
  level: Level;
  rate: number;
  voiceURI: string;
  partnerVoiceURI: string;
  subtitles: 'none' | 'en' | 'en_ja';
  /** 音声認識（文字起こし）。外部送信の可能性があるため既定は無効 */
  speechRecognition: boolean;
  textOnly: boolean;
  ai: AiSettings;
}

export interface AppState {
  schemaVersion: number;
  settings: Settings;
  project: Record<ProjectFieldKey, ProjectFact>;
  pitch: { originals: PitchOriginal[]; paraphrases: Paraphrase[] };
  phrases: SavedPhrase[];
  sessions: SessionLog[];
  sceneProgress: Record<string, { times: number; last: string; lastLevel: Level }>;
}

export const PROJECT_FIELDS: { key: ProjectFieldKey; labelJa: string; hintJa: string; sensitive?: boolean }[] = [
  { key: 'projectName', labelJa: 'プロジェクト名', hintJa: '英語での正式名称' },
  { key: 'oneLiner', labelJa: '一言説明（英語）', hintJa: '"I\'m building ___." の ___ に入る形で。例: an onchain game where …' },
  { key: 'genre', labelJa: 'ジャンル', hintJa: '例: strategy / survival / social …' },
  { key: 'howToPlay', labelJa: '遊び方', hintJa: '最初にすること → 次にすること、を短く' },
  { key: 'chain', labelJa: '使っているチェーン', hintJa: '確定している場合のみ' },
  { key: 'whyBlockchain', labelJa: 'ブロックチェーンを使う理由', hintJa: '本当の理由を1〜2個' },
  { key: 'aiAgents', labelJa: 'AI エージェントの役割', hintJa: '何をするか・誰が動かすか' },
  { key: 'sharedWorld', labelJa: '共有世界について', hintJa: '何が共有されるか・他の開発者は何ができるか' },
  { key: 'ownership', labelJa: '所有権について', hintJa: 'プレイヤーが所有するもの・できること' },
  { key: 'stage', labelJa: '開発状況', hintJa: '公開済み / テスト中 / 開発中 など。日付は確定のみ' },
  { key: 'users', labelJa: 'ユーザー数・実績', hintJa: '公開してよい確定値のみ', sensitive: true },
  { key: 'funding', labelJa: '資金調達', hintJa: '公開してよい確定情報のみ', sensitive: true },
  { key: 'team', labelJa: 'チーム', hintJa: '人数・役割（公開してよい範囲）', sensitive: true },
  { key: 'links', labelJa: 'リンク', hintJa: 'サイト・ドキュメント・X など' },
];

export function defaultProject(): Record<ProjectFieldKey, ProjectFact> {
  const out = {} as Record<ProjectFieldKey, ProjectFact>;
  for (const f of PROJECT_FIELDS) out[f.key] = { value: '', status: 'unprovided', note: '' };
  return out;
}

export function defaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      name: 'r0ze',
      level: 'a2',
      rate: 0.8,
      voiceURI: '',
      partnerVoiceURI: '',
      subtitles: 'none',
      speechRecognition: false,
      textOnly: false,
      ai: { provider: 'none', baseUrl: '', model: '' },
    },
    project: defaultProject(),
    pitch: { originals: [], paraphrases: [] },
    phrases: [],
    sessions: [],
    sceneProgress: {},
  };
}

/** 確認済みの値だけを返す（未提供・要確認は使わない） */
export function confirmedFact(state: AppState, key: ProjectFieldKey): string | undefined {
  const f = state.project[key];
  return f && f.status === 'confirmed' && f.value.trim() ? f.value.trim() : undefined;
}

// ---- 検証（インポート・読み込み時） ----

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d);
const num = (v: unknown, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);

function normSrs(v: unknown): SrsState {
  const o = isObj(v) ? v : {};
  const due = str(o.due);
  return {
    box: Math.max(0, Math.min(6, Math.floor(num(o.box)))),
    due: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : '1970-01-01',
    lastReviewed: typeof o.lastReviewed === 'string' ? o.lastReviewed : undefined,
    reviews: num(o.reviews),
    lapses: num(o.lapses),
  };
}

/**
 * 不明な入力から AppState を作る。足りない項目は既定値で補い、
 * 型が違う項目は捨てる。データ構造が壊れている場合は Error を投げる。
 */
export function normalizeState(input: unknown): AppState {
  if (!isObj(input)) throw new Error('データの形式が正しくありません');
  const v = num(input.schemaVersion, -1);
  if (v < 1 || v > SCHEMA_VERSION) throw new Error(`未対応のデータ版です (schemaVersion=${String(input.schemaVersion)})`);
  const base = defaultState();

  const s = isObj(input.settings) ? input.settings : {};
  const ai = isObj(s.ai) ? s.ai : {};
  const settings: Settings = {
    name: str(s.name, base.settings.name),
    level: s.level === 'plus' ? 'plus' : 'a2',
    rate: Math.min(1.3, Math.max(0.5, num(s.rate, base.settings.rate))),
    voiceURI: str(s.voiceURI),
    partnerVoiceURI: str(s.partnerVoiceURI),
    subtitles: s.subtitles === 'en' || s.subtitles === 'en_ja' ? s.subtitles : 'none',
    speechRecognition: s.speechRecognition === true,
    textOnly: s.textOnly === true,
    ai: {
      provider: ai.provider === 'openai-compatible' ? 'openai-compatible' : 'none',
      baseUrl: str(ai.baseUrl),
      model: str(ai.model),
    },
  };

  const project = defaultProject();
  if (isObj(input.project)) {
    for (const f of PROJECT_FIELDS) {
      const p = input.project[f.key];
      if (isObj(p)) {
        const status = p.status === 'confirmed' || p.status === 'needs_check' ? p.status : 'unprovided';
        project[f.key] = { value: str(p.value), status, note: str(p.note) };
      }
    }
  }

  const pitchIn = isObj(input.pitch) ? input.pitch : {};
  const originals: PitchOriginal[] = Array.isArray(pitchIn.originals)
    ? pitchIn.originals.filter(isObj).filter((o) => typeof o.text === 'string' && typeof o.sha256 === 'string' && typeof o.id === 'string').map((o) => ({
        id: o.id as string,
        text: o.text as string,
        sha256: o.sha256 as string,
        savedAt: str(o.savedAt),
        label: str(o.label),
      }))
    : [];
  const paraphrases: Paraphrase[] = Array.isArray(pitchIn.paraphrases)
    ? pitchIn.paraphrases.filter(isObj).filter((o) => typeof o.id === 'string').map((o) => ({
        id: o.id as string,
        pitchId: str(o.pitchId),
        text: str(o.text),
        noteJa: str(o.noteJa),
        createdAt: str(o.createdAt),
        updatedAt: str(o.updatedAt),
      }))
    : [];

  const phrases: SavedPhrase[] = Array.isArray(input.phrases)
    ? input.phrases.filter(isObj).filter((p) => typeof p.id === 'string' && typeof p.en === 'string').map((p) => ({
        id: p.id as string,
        en: p.en as string,
        ja: str(p.ja),
        note: str(p.note),
        sourceSceneId: typeof p.sourceSceneId === 'string' ? p.sourceSceneId : undefined,
        createdAt: str(p.createdAt),
        updatedAt: str(p.updatedAt),
        srs: normSrs(p.srs),
      }))
    : [];

  const sessions: SessionLog[] = Array.isArray(input.sessions)
    ? input.sessions.filter(isObj).filter((x) => typeof x.id === 'string').map((x) => ({
        id: x.id as string,
        startedAt: str(x.startedAt),
        endedAt: str(x.endedAt),
        plannedMinutes: num(x.plannedMinutes),
        activeSeconds: num(x.activeSeconds),
        scenes: Array.isArray(x.scenes)
          ? x.scenes.filter(isObj).map((r) => ({
              sceneId: str(r.sceneId),
              level: r.level === 'plus' ? 'plus' : 'a2',
              compCorrect: num(r.compCorrect),
              compTotal: num(r.compTotal),
              helpCount: num(r.helpCount),
              followUpSelf: Array.isArray(r.followUpSelf)
                ? r.followUpSelf.filter((g): g is 'ok' | 'stuck' | 'no' => g === 'ok' || g === 'stuck' || g === 'no')
                : [],
              savedPhrases: num(r.savedPhrases),
            }))
          : [],
        reviewed: num(x.reviewed),
        fluencyRounds: num(x.fluencyRounds),
        completed: x.completed === true,
      }))
    : [];

  const sceneProgress: AppState['sceneProgress'] = {};
  if (isObj(input.sceneProgress)) {
    for (const [k, p] of Object.entries(input.sceneProgress)) {
      if (isObj(p)) sceneProgress[k] = { times: num(p.times), last: str(p.last), lastLevel: p.lastLevel === 'plus' ? 'plus' : 'a2' };
    }
  }

  return { schemaVersion: SCHEMA_VERSION, settings, project, pitch: { originals, paraphrases }, phrases, sessions, sceneProgress };
}

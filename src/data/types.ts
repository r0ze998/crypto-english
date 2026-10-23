// 教材データの型。教材は「架空の練習用キャラクター」の会話で構成し、
// r0ze さんのプロジェクトの事実はプロジェクト資料（ProjectFacts）からのみ使う。

export type Level = 'a2' | 'plus';

export type Speaker = 'partner' | 'you';

export interface Line {
  speaker: Speaker;
  en: string;
  ja: string;
}

export interface GlossaryItem {
  en: string;
  ja: string;
}

export interface ComprehensionQuestion {
  q: string; // 日本語の設問
  choices: string[];
  answer: number;
  explainJa: string;
}

export interface Phrase {
  id: string;
  en: string;
  ja: string;
  noteJa?: string;
}

export type ProjectFieldKey =
  | 'projectName'
  | 'oneLiner'
  | 'genre'
  | 'howToPlay'
  | 'chain'
  | 'whyBlockchain'
  | 'aiAgents'
  | 'sharedWorld'
  | 'ownership'
  | 'stage'
  | 'users'
  | 'funding'
  | 'team'
  | 'links';

export interface FrameSlot {
  key: string;
  labelJa: string;
  placeholder: string;
  options?: string[];
  /** 名前など設定から入れる値 */
  fromSetting?: 'name';
  /** 参考として横に表示するプロジェクト資料の項目 */
  projectField?: ProjectFieldKey;
}

export interface Frame {
  /** {key} を slot で置き換える */
  template: string;
  ja: string;
  slots: FrameSlot[];
}

export interface FollowUp {
  en: string;
  ja: string;
  hintJa: string;
  /** [ ] は自分の情報で埋める部分 */
  models: { en: string; ja: string }[];
  /** 答えにプロジェクトの事実が必要な場合 */
  projectFields?: ProjectFieldKey[];
}

export type SceneGroup = 'meet' | 'explain' | 'clarify' | 'feedback' | 'meeting';

export interface Scene {
  id: string;
  group: SceneGroup;
  titleJa: string;
  situationJa: string;
  goalJa: string;
  partnerName: string;
  youName: string;
  glossary: GlossaryItem[];
  versions: Record<Level, Line[]>;
  questions: ComprehensionQuestion[];
  phrases: Phrase[];
  shadow: { en: string; ja: string };
  frame: Frame;
  followUps: FollowUp[];
}

// 自由会話の拡張ポイント。既定は「接続なし」。
// - API キーを入力・保存する仕組みは意図的に作らない（クライアントに鍵を置かない）。
// - 使えるのは、鍵なしで呼べる自前のエンドポイント（例: 端末内で動かす Ollama の
//   OpenAI 互換 API、または鍵をサーバー側に持つ自前のプロキシ）だけ。
// - 応答は必ず接続先を表示し、教材の固定文とは区別する。

import type { AiSettings } from './state';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ConversationProvider {
  /** 画面に表示する接続先の説明 */
  label: string;
  reply(messages: ChatMessage[], signal?: AbortSignal): Promise<string>;
}

export function createProvider(ai: AiSettings): ConversationProvider | null {
  if (ai.provider !== 'openai-compatible' || !ai.baseUrl.trim() || !ai.model.trim()) return null;
  const base = ai.baseUrl.trim().replace(/\/+$/, '');
  return {
    label: `${ai.model} @ ${base}`,
    async reply(messages, signal) {
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ai.model, messages, temperature: 0.6, max_tokens: 120 }),
        signal,
      });
      if (!res.ok) throw new Error(`接続先がエラーを返しました (HTTP ${res.status})`);
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('応答が空でした');
      return text;
    },
  };
}

/** 追加質問用のシステム指示。プロジェクトの事実を作らないように明示する */
export function followUpSystemPrompt(level: 'a2' | 'plus', confirmedFacts: string): string {
  return [
    'You are a friendly crypto game developer talking with a Japanese developer who is learning English.',
    level === 'a2'
      ? 'Use CEFR A2 English: short sentences (under 12 words), common words, one idea per sentence.'
      : 'Use simple B1 English: natural, short sentences.',
    'Reply with ONE short follow-up question about what they just said. Maximum 2 sentences.',
    'Never invent facts about their project (numbers, users, funding, launch dates, features).',
    confirmedFacts ? `Confirmed facts you may refer to:\n${confirmedFacts}` : 'You know no facts about their project.',
  ].join('\n');
}

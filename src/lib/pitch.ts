// 0xARK の固定ピッチ原文の扱い。
// 原文は入力されたまま保存し（前後の空白も含めて改変しない）、SHA-256 で
// 改変がないことを確認できるようにする。練習用の言い換えは別データ。

import type { PitchOriginal } from './state';
import { uid } from './date';

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createOriginal(text: string, label: string): Promise<PitchOriginal> {
  return { id: uid('pitch-'), text, sha256: await sha256Hex(text), savedAt: new Date().toISOString(), label };
}

export async function verifyOriginal(p: PitchOriginal): Promise<boolean> {
  return (await sha256Hex(p.text)) === p.sha256;
}

/**
 * 音声で一文ずつ聞くための「表示上の区切り」。保存データは変更しない。
 * 区切った文をつなげると元の文字列に戻る（空白も保持）。
 */
export function splitForListening(text: string): string[] {
  const parts = text.match(/[^.!?。！？\n]+(?:[.!?。！？]+|\n+|$)\s*/g);
  if (!parts) return [text];
  return parts.filter((p) => p.length > 0);
}

// エクスポート・インポート。ファイルは端末内で作成・読み込みし、どこにも送信しない。

import { normalizeState, type AppState } from './state';
import type { StoredRecording } from './recordingsDb';

export const BACKUP_APP_ID = 'crypto-english-practice';

export interface BackupRecording {
  id: string;
  mime: string;
  createdAt: string;
  label: string;
  contextKey: string;
  base64: string;
}

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  exportedAt: string;
  data: AppState;
  recordings?: BackupRecording[];
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) bin += String.fromCharCode(...buf.subarray(i, i + chunk));
  return btoa(bin);
}

export function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function buildBackup(state: AppState, recordings?: StoredRecording[]): Promise<BackupFile> {
  const file: BackupFile = { app: BACKUP_APP_ID, exportedAt: new Date().toISOString(), data: state };
  if (recordings) {
    file.recordings = await Promise.all(
      recordings.map(async (r) => ({
        id: r.id,
        mime: r.mime,
        createdAt: r.createdAt,
        label: r.label,
        contextKey: r.contextKey,
        base64: await blobToBase64(r.blob),
      })),
    );
  }
  return file;
}

export interface ParsedBackup {
  state: AppState;
  recordings: StoredRecording[];
}

export function parseBackup(text: string): ParsedBackup {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('JSON として読み込めませんでした');
  }
  if (typeof json !== 'object' || json === null || (json as { app?: unknown }).app !== BACKUP_APP_ID) {
    throw new Error('このアプリのバックアップファイルではありません');
  }
  const f = json as { data?: unknown; recordings?: unknown };
  const state = normalizeState(f.data);
  const recordings: StoredRecording[] = [];
  if (Array.isArray(f.recordings)) {
    for (const r of f.recordings) {
      if (r && typeof r.id === 'string' && typeof r.base64 === 'string') {
        const mime = typeof r.mime === 'string' ? r.mime : 'audio/webm';
        recordings.push({
          id: r.id,
          mime,
          createdAt: typeof r.createdAt === 'string' ? r.createdAt : '',
          label: typeof r.label === 'string' ? r.label : '',
          contextKey: typeof r.contextKey === 'string' ? r.contextKey : '',
          blob: base64ToBlob(r.base64, mime),
        });
      }
    }
  }
  return { state, recordings };
}

export interface MergeReport {
  phrasesAdded: number;
  phrasesUpdated: number;
  sessionsAdded: number;
  pitchAdded: number;
  pitchConflicts: number;
  paraphrasesAdded: number;
  projectFilled: number;
}

/**
 * 既存データに取り込む。設定は現在のものを保持。
 * 表現は id で照合し、更新日時が新しい方を採用。ピッチ原文は同じ id でも
 * 既存の原文を絶対に上書きしない（内容が違えば衝突として数える）。
 */
export function mergeStates(current: AppState, incoming: AppState): { state: AppState; report: MergeReport } {
  const report: MergeReport = {
    phrasesAdded: 0,
    phrasesUpdated: 0,
    sessionsAdded: 0,
    pitchAdded: 0,
    pitchConflicts: 0,
    paraphrasesAdded: 0,
    projectFilled: 0,
  };

  const phrases = [...current.phrases];
  for (const p of incoming.phrases) {
    const i = phrases.findIndex((x) => x.id === p.id);
    if (i < 0) {
      phrases.push(p);
      report.phrasesAdded++;
    } else if (p.updatedAt > phrases[i].updatedAt) {
      phrases[i] = p;
      report.phrasesUpdated++;
    }
  }

  const sessionIds = new Set(current.sessions.map((s) => s.id));
  const sessions = [...current.sessions];
  for (const s of incoming.sessions) {
    if (!sessionIds.has(s.id)) {
      sessions.push(s);
      report.sessionsAdded++;
    }
  }
  sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const originals = [...current.pitch.originals];
  for (const o of incoming.pitch.originals) {
    const ex = originals.find((x) => x.id === o.id);
    if (!ex) {
      originals.push(o);
      report.pitchAdded++;
    } else if (ex.text !== o.text) {
      report.pitchConflicts++;
    }
  }
  const paraphrases = [...current.pitch.paraphrases];
  for (const p of incoming.pitch.paraphrases) {
    if (!paraphrases.some((x) => x.id === p.id)) {
      paraphrases.push(p);
      report.paraphrasesAdded++;
    }
  }

  const project = { ...current.project };
  for (const k of Object.keys(project) as (keyof typeof project)[]) {
    if (project[k].status === 'unprovided' && !project[k].value && incoming.project[k].value) {
      project[k] = incoming.project[k];
      report.projectFilled++;
    }
  }

  const sceneProgress = { ...current.sceneProgress };
  for (const [k, v] of Object.entries(incoming.sceneProgress)) {
    const c = sceneProgress[k];
    if (!c || v.last > c.last) sceneProgress[k] = { ...v, times: Math.max(v.times, c?.times ?? 0) };
  }

  return {
    state: { ...current, project, pitch: { originals, paraphrases }, phrases, sessions, sceneProgress },
    report,
  };
}

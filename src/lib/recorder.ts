// 録音（MediaRecorder）。ボタンを押したときだけマイクを開き、停止したら
// マイクのトラックをすぐ閉じる。録音データは端末内にだけ保存する。

export function recordingSupport(): { ok: boolean; reasonJa?: string } {
  if (typeof window === 'undefined') return { ok: false, reasonJa: 'ブラウザ外' };
  if (!window.isSecureContext) return { ok: false, reasonJa: 'HTTPS（または localhost）で開いたときだけマイクを使えます' };
  if (!navigator.mediaDevices?.getUserMedia) return { ok: false, reasonJa: 'このブラウザはマイク入力に対応していません' };
  if (typeof MediaRecorder === 'undefined') return { ok: false, reasonJa: 'このブラウザは録音（MediaRecorder）に対応していません' };
  return { ok: true };
}

function pickMime(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* 古い Safari は isTypeSupported が無いことがある */
    }
  }
  return undefined;
}

export interface ActiveRecording {
  stop(): Promise<{ blob: Blob; mime: string; durationMs: number }>;
  cancel(): void;
}

export async function startRecording(): Promise<ActiveRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mime = pickMime();
  const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  const started = performance.now();
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const release = () => stream.getTracks().forEach((t) => t.stop());
  rec.start(250);
  return {
    stop: () =>
      new Promise((resolve, reject) => {
        rec.onstop = () => {
          release();
          const type = rec.mimeType || mime || 'audio/webm';
          resolve({ blob: new Blob(chunks, { type }), mime: type, durationMs: performance.now() - started });
        };
        rec.onerror = () => {
          release();
          reject(new Error('録音エラー'));
        };
        if (rec.state === 'inactive') rec.onstop?.(new Event('stop'));
        else rec.stop();
      }),
    cancel: () => {
      try {
        if (rec.state !== 'inactive') rec.stop();
      } finally {
        release();
      }
    },
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCaps } from '../lib/capabilities';
import { startRecording, type ActiveRecording } from '../lib/recorder';
import { deleteRecording, putRecording, recordingsFor, type StoredRecording } from '../lib/recordingsDb';
import { uid } from '../lib/date';
import { useSpeaker, type Who } from './audio';

const MAX_SECONDS = 90;

/**
 * 自分の声の録音・再生。録音はボタンを押したときだけ開始し、
 * データはこの端末の IndexedDB にだけ保存する。
 */
export function RecorderPanel({
  contextKey,
  label,
  modelText,
  modelWho = 'you',
  compact,
  onRecorded,
}: {
  contextKey: string;
  label: string;
  modelText?: string;
  modelWho?: Who;
  compact?: boolean;
  onRecorded?: () => void;
}) {
  const caps = useCaps();
  const sp = useSpeaker();
  const [takes, setTakes] = useState<StoredRecording[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string>();
  const active = useRef<ActiveRecording | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urls = useRef(new Map<string, string>());

  const refresh = useCallback(async () => {
    try {
      setTakes((await recordingsFor(contextKey)).slice(0, 3));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [contextKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const map = urls.current;
    return () => {
      active.current?.cancel();
      map.forEach((u) => URL.revokeObjectURL(u));
      map.clear();
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const stop = useCallback(async () => {
    const a = active.current;
    if (!a) return;
    active.current = null;
    setRecording(false);
    try {
      const { blob, mime } = await a.stop();
      if (blob.size === 0) throw new Error('録音データが空でした');
      await putRecording({ id: uid('rec-'), blob, mime, createdAt: new Date().toISOString(), label, contextKey });
      await refresh();
      onRecorded?.();
    } catch (e) {
      setError((e as Error).message);
    }
  }, [contextKey, label, refresh, onRecorded]);

  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) stop();
  }, [recording, seconds, stop]);

  const start = async () => {
    setError(undefined);
    sp.stop();
    try {
      active.current = await startRecording();
      setSeconds(0);
      setRecording(true);
    } catch (e) {
      const err = e as DOMException;
      setError(
        err.name === 'NotAllowedError'
          ? 'マイクが許可されていません。ブラウザの設定で許可するか、テキストで続けてください。'
          : err.name === 'NotFoundError'
            ? 'マイクが見つかりません。'
            : `録音を開始できませんでした: ${err.message}`,
      );
    }
  };

  const urlFor = (r: StoredRecording) => {
    let u = urls.current.get(r.id);
    if (!u) {
      u = URL.createObjectURL(r.blob);
      urls.current.set(r.id, u);
    }
    return u;
  };

  const playTake = (r: StoredRecording) =>
    new Promise<void>((resolve) => {
      sp.stop();
      const el = audioRef.current ?? new Audio();
      audioRef.current = el;
      el.src = urlFor(r);
      el.onended = () => resolve();
      el.onerror = () => {
        setError('この端末では録音を再生できない形式でした');
        resolve();
      };
      el.play().catch(() => resolve());
    });

  const compare = async (r: StoredRecording) => {
    if (modelText && sp.canSpeak) await sp.play(modelText, modelWho);
    await playTake(r);
  };

  const remove = async (r: StoredRecording) => {
    await deleteRecording(r.id);
    const u = urls.current.get(r.id);
    if (u) URL.revokeObjectURL(u);
    urls.current.delete(r.id);
    refresh();
  };

  if (!caps.recording.ok) {
    return <p className="muted small">録音は使えません（{caps.recording.reasonJa}）。声に出して言うだけでも練習になります。</p>;
  }

  return (
    <div className={`recorder ${compact ? 'recorder-compact' : ''}`}>
      <div className="row">
        {!recording ? (
          <button type="button" className="btn btn-rec" onClick={start}>
            ● 録音する
          </button>
        ) : (
          <button type="button" className="btn btn-rec-on" onClick={stop}>
            ■ 停止（{seconds}秒）
          </button>
        )}
        {recording && <span className="rec-dot" aria-live="polite">録音中</span>}
      </div>
      {error && <p className="error small">{error}</p>}
      {takes.length > 0 && (
        <ul className="takes">
          {takes.map((t, i) => (
            <li key={t.id}>
              <span className="small muted">{i === 0 ? '最新' : `${i + 1}つ前`}</span>
              <button type="button" className="btn-small" onClick={() => playTake(t)}>
                ▶ 自分
              </button>
              {modelText && sp.canSpeak && (
                <button type="button" className="btn-small" onClick={() => compare(t)}>
                  ▶ お手本→自分
                </button>
              )}
              <button type="button" className="btn-small btn-ghost" aria-label="この録音を削除" onClick={() => remove(t)}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

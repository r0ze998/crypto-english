import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../lib/store';
import { confirmedFact } from '../../lib/state';
import { startRecording, type ActiveRecording } from '../../lib/recorder';
import { putRecording } from '../../lib/recordingsDb';
import { uid } from '../../lib/date';
import { useCaps } from '../../lib/capabilities';

// Nation の 4/3/2（同じ話を時間を縮めながら3回）を A2 向けに短くしたもの。
const ROUNDS = [60, 45, 30];

export function FluencyStep({ sentences, onRound }: { sentences: string[]; onRound: () => void }) {
  const { state } = useStore();
  const caps = useCaps();
  const [round, setRound] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const [withRec, setWithRec] = useState(false);
  const [msg, setMsg] = useState<string>();
  const rec = useRef<ActiveRecording | null>(null);

  const facts = (['oneLiner', 'howToPlay', 'whyBlockchain'] as const).map((k) => confirmedFact(state, k)).filter(Boolean) as string[];

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);

  useEffect(() => () => rec.current?.cancel(), []);

  const start = async () => {
    setMsg(undefined);
    if (withRec && caps.recording.ok) {
      try {
        rec.current = await startRecording();
      } catch {
        setMsg('録音を開始できませんでした。録音なしで続けます。');
      }
    }
    setLeft(ROUNDS[round]);
  };

  const finish = async () => {
    setLeft(null);
    const r = rec.current;
    rec.current = null;
    if (r) {
      try {
        const { blob, mime } = await r.stop();
        await putRecording({ id: uid('rec-'), blob, mime, createdAt: new Date().toISOString(), label: `繰り返し説明 ${round + 1}回目`, contextKey: 'fluency' });
      } catch {
        /* 録音失敗は練習を止めない */
      }
    }
    onRound();
    setRound((x) => x + 1);
  };

  return (
    <section>
      <p className="small">
        同じ内容を<strong>3回</strong>話します。1回ごとに時間が短くなります（{ROUNDS.join('秒 → ')}秒）。
        内容を増やすより、同じことを<strong>止まらずに</strong>言えるようにするのが目的です。相手がいなくても声に出して話してください。
      </p>
      <div className="card">
        <p className="small">
          <strong>話すこと:</strong> あなたが何を作っているか・どう遊ぶか・なぜブロックチェーンか（言える範囲で）
        </p>
        {sentences.length > 0 && (
          <>
            <p className="small muted">今日作った文:</p>
            <ul className="plain">
              {sentences.map((s) => (
                <li key={s} lang="en" className="en">
                  {s}
                </li>
              ))}
            </ul>
          </>
        )}
        {facts.length > 0 ? (
          <>
            <p className="small muted">プロジェクト資料（確認済み）:</p>
            <ul className="plain">
              {facts.map((f) => (
                <li key={f} lang="en" className="en">
                  {f}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="small muted">プロジェクト資料が未入力のため、知っている範囲で話してください。未確定のことは "I'm not sure yet." でOK。</p>
        )}
      </div>

      {round < ROUNDS.length ? (
        <div className="card center">
          <p>
            {round + 1}回目: <strong>{ROUNDS[round]}秒</strong>
          </p>
          {left === null ? (
            <>
              {caps.recording.ok && (
                <label className="check">
                  <input type="checkbox" checked={withRec} onChange={(e) => setWithRec(e.target.checked)} />
                  録音しながら話す（開始ボタンを押したときだけ録音）
                </label>
              )}
              <button type="button" className="btn btn-primary" onClick={start}>
                スタート
              </button>
            </>
          ) : (
            <>
              <p className="timer" aria-live="polite">
                {left}
              </p>
              {rec.current && <p className="rec-dot">録音中</p>}
              <button type="button" className="btn" onClick={finish}>
                話し終えた
              </button>
            </>
          )}
          {msg && <p className="small error">{msg}</p>}
        </div>
      ) : (
        <p className="ok" role="status">
          3回終わりました。1回目より3回目の方が言いやすくなったか、振り返ってみてください。
        </p>
      )}
    </section>
  );
}

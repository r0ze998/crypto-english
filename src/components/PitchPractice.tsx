import { useEffect, useState } from 'react';
import type { PitchOriginal } from '../lib/state';
import { splitForListening, verifyOriginal } from '../lib/pitch';
import { useSpeaker } from './audio';
import { RecorderPanel } from './Recorder';
import { useStore } from '../lib/store';

/** 固定ピッチ原文をそのまま聞く・まねする。原文は表示も読み上げも改変しない */
export function PitchPractice({ pitch }: { pitch: PitchOriginal }) {
  const sp = useSpeaker();
  const { state } = useStore();
  const [ok, setOk] = useState<boolean | null>(null);
  const parts = splitForListening(pitch.text);
  const paraphrases = state.pitch.paraphrases.filter((p) => p.pitchId === pitch.id);

  useEffect(() => {
    verifyOriginal(pitch).then(setOk);
  }, [pitch]);

  return (
    <div>
      <p className="small">
        <span className="badge">原文（改変禁止）</span> {pitch.label} ・ 保存 {pitch.savedAt.slice(0, 10)} ・{' '}
        {ok === null ? '確認中…' : ok ? <span className="ok">原文の整合性 OK</span> : <span className="error">原文の整合性チェックに失敗しました</span>}
      </p>
      {sp.canSpeak && (
        <div className="row">
          {!sp.busy ? (
            <button type="button" className="btn btn-primary" onClick={() => sp.playAll(parts.map((t) => ({ text: t, who: 'you' as const })))}>
              ▶ 全文を聞く
            </button>
          ) : (
            <button type="button" className="btn" onClick={sp.stop}>
              ■ 止める
            </button>
          )}
        </div>
      )}
      <ol className="pitch-parts">
        {parts.map((t, i) => (
          <li key={i} className={sp.speakingIndex === i ? 'line-now' : ''}>
            <span lang="en" className="en pre">
              {t}
            </span>
            {sp.canSpeak && (
              <span className="row">
                <button type="button" className="btn-small" onClick={() => sp.play(t, 'you', 0.7)}>
                  ゆっくり
                </button>
                <button type="button" className="btn-small" onClick={() => sp.play(t, 'you')}>
                  ふつう
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="small muted">一文ずつ聞いて、まねして言いましょう。区切りは表示上だけで、保存された原文は変わりません。</p>
      <RecorderPanel contextKey={`pitch:${pitch.id}`} label="ピッチ（原文）" modelText={pitch.text} />
      {paraphrases.length > 0 && (
        <div className="card">
          <p className="small">
            <span className="badge badge-warn">練習用の言い換え（原文ではありません）</span>
          </p>
          <ul className="plain">
            {paraphrases.map((p) => (
              <li key={p.id}>
                <span lang="en" className="en pre">
                  {p.text}
                </span>
                {p.noteJa && <span className="small muted"> — {p.noteJa}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

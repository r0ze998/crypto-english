import { useState } from 'react';
import type { Scene } from '../../data/types';
import { useSpeaker } from '../audio';
import { RecorderPanel } from '../Recorder';

const CHECKS = ['最後まで言えた', 'まとまり（区切り）をまねできた', '強く言う語をまねできた', '速さ・リズムをまねできた'];

/** まねして言う（シャドーイング／リピーティング）。採点はせず、聞き比べと自己チェック */
export function ImitateStep({ scene }: { scene: Scene }) {
  const sp = useSpeaker();
  const [showJa, setShowJa] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const text = scene.shadow.en;

  return (
    <section>
      <div className="card target">
        <p className="en big" lang="en">
          {text}
        </p>
        {showJa ? (
          <p className="ja">{scene.shadow.ja}</p>
        ) : (
          <button type="button" className="btn-small btn-ghost" onClick={() => setShowJa(true)}>
            訳を見る
          </button>
        )}
      </div>

      <ol className="howto">
        <li>
          お手本を聞く
          {sp.canSpeak ? (
            <span className="row">
              <button type="button" className="btn" onClick={() => sp.play(text, 'you', 0.7)}>
                ▶ ゆっくり
              </button>
              <button type="button" className="btn" onClick={() => sp.play(text, 'you')}>
                ▶ ふつう
              </button>
            </span>
          ) : (
            <span className="small muted">（音声なし: 英文を見ながら、区切りを意識して声に出して読む）</span>
          )}
        </li>
        <li>聞こえた直後に、同じように声に出す（2〜3回）。英文を見ながらでOK。</li>
        <li>慣れたら英文を見ないで言う。</li>
        <li>録音して、お手本と聞き比べる（任意）。</li>
      </ol>

      <RecorderPanel contextKey={`${scene.id}:shadow`} label={text} modelText={text} />

      <fieldset className="card">
        <legend>自分でチェック（点数はつけません）</legend>
        {CHECKS.map((c, i) => (
          <label key={c} className="check">
            <input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked((m) => ({ ...m, [i]: e.target.checked }))} />
            {c}
          </label>
        ))}
        <p className="small muted">
          このアプリは発音の正確さを判定しません。ネイティブのような発音より「伝わること」を優先して、お手本との違いを自分の耳で確認してください。
        </p>
      </fieldset>
    </section>
  );
}

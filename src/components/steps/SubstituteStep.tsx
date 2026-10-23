import type { Scene } from '../../data/types';
import { useStore } from '../../lib/store';
import { confirmedFact, PROJECT_FIELDS } from '../../lib/state';
import { fillFrame, frameIsComplete } from '../../lib/session';
import { useSpeaker } from '../audio';
import { RecorderPanel } from '../Recorder';

/** 型の一部を自分の情報に置き換えて言う */
export function SubstituteStep({
  scene,
  values,
  onChange,
  onSaveSentence,
  saved,
}: {
  scene: Scene;
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  onSaveSentence: (en: string) => void;
  saved: boolean;
}) {
  const { state } = useStore();
  const sp = useSpeaker();
  const frame = scene.frame;
  const sentence = fillFrame(frame, values);
  const complete = frameIsComplete(frame, values);

  return (
    <section>
      <p className="small">
        型: <span lang="en" className="en">{frame.template.replace(/\{(\w+)\}/g, '[$1]')}</span>
        <br />
        <span className="muted">{frame.ja.replace(/\{(\w+)\}/g, '[$1]')}</span>
      </p>
      <p className="small muted">自分の本当の情報で埋めてください。分からない項目は無理に埋めず、選択肢や例で練習してもかまいません。</p>

      {frame.slots.map((slot) => {
        const fieldLabel = slot.projectField && PROJECT_FIELDS.find((f) => f.key === slot.projectField)?.labelJa;
        const fact = slot.projectField ? confirmedFact(state, slot.projectField) : undefined;
        const status = slot.projectField ? state.project[slot.projectField].status : undefined;
        return (
          <div key={slot.key} className="card slot">
            <label className="field">
              <span>{slot.labelJa}</span>
              <input
                type="text"
                lang="en"
                autoCapitalize="none"
                value={values[slot.key] ?? ''}
                placeholder={slot.placeholder}
                onChange={(e) => onChange({ ...values, [slot.key]: e.target.value })}
              />
            </label>
            {slot.options && (
              <div className="chips">
                {slot.options.map((o) => (
                  <button key={o} type="button" className={`chip ${values[slot.key] === o ? 'chip-on' : ''}`} onClick={() => onChange({ ...values, [slot.key]: o })}>
                    {o}
                  </button>
                ))}
              </div>
            )}
            {slot.projectField && (
              <div className="small fact">
                資料「{fieldLabel}」:{' '}
                {fact ? (
                  <>
                    <span className="badge badge-ok">確認済み</span> <span lang="en">{fact}</span>{' '}
                    <button type="button" className="btn-small" onClick={() => onChange({ ...values, [slot.key]: fact })}>
                      この値を使う
                    </button>
                  </>
                ) : (
                  <>
                    <span className="badge badge-warn">要確認</span>{' '}
                    {status === 'needs_check' ? '入力済みですが未確認です。' : '未提供です。'}
                    <a href="#/project">資料を入力</a>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="card target">
        <p className="en big" lang="en">
          {sentence}
        </p>
        <div className="row">
          {sp.canSpeak && complete && (
            <button type="button" className="btn" onClick={() => sp.play(sentence, 'you')}>
              ▶ 自分の文を聞く
            </button>
          )}
          <button type="button" className="btn" disabled={!complete || saved} onClick={() => onSaveSentence(sentence)}>
            {saved ? '保存しました' : 'この文を表現に保存'}
          </button>
        </div>
        <p className="small muted">声に出して2〜3回言ってみましょう。</p>
      </div>
      {complete && <RecorderPanel contextKey={`${scene.id}:frame`} label={sentence} modelText={sentence} />}
    </section>
  );
}

/** name スロットなど、設定から入る初期値 */
export function initialFrameValues(scene: Scene, name: string): Record<string, string> {
  const v: Record<string, string> = {};
  for (const s of scene.frame.slots) if (s.fromSetting === 'name') v[s.key] = name;
  return v;
}

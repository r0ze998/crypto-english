import { useRef, useState } from 'react';
import type { FollowUp, Level, Scene } from '../../data/types';
import { useStore } from '../../lib/store';
import { confirmedFact, PROJECT_FIELDS, type AppState } from '../../lib/state';
import { createProvider, followUpSystemPrompt, type ChatMessage } from '../../lib/ai';
import { recognizeOnce, type RecognitionHandle } from '../../lib/stt';
import { useCaps } from '../../lib/capabilities';
import { PlayButton, useSpeaker } from '../audio';
import { RecorderPanel } from '../Recorder';

type SelfGrade = 'ok' | 'stuck' | 'no';

export function confirmedFactsText(state: AppState): string {
  return PROJECT_FIELDS.map((f) => {
    const v = confirmedFact(state, f.key);
    return v ? `- ${f.labelJa}: ${v}` : '';
  })
    .filter(Boolean)
    .join('\n');
}

export function FollowUpStep({
  scene,
  fu,
  index,
  level,
  grade,
  onGrade,
}: {
  scene: Scene;
  fu: FollowUp;
  index: number;
  level: Level;
  grade?: SelfGrade;
  onGrade: (g: SelfGrade) => void;
}) {
  const { state } = useStore();
  const caps = useCaps();
  const sp = useSpeaker();
  const [showEn, setShowEn] = useState(!sp.canSpeak);
  const [showJa, setShowJa] = useState(false);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [sttBusy, setSttBusy] = useState(false);
  const [sttError, setSttError] = useState<string>();
  const sttRef = useRef<RecognitionHandle | null>(null);

  const provider = createProvider(state.settings.ai);
  const [aiTurns, setAiTurns] = useState<{ q: string; a: string }[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string>();
  const [aiAnswer, setAiAnswer] = useState('');

  const sttEnabled = state.settings.speechRecognition && caps.sttApi;

  const runStt = async (set: (s: string) => void) => {
    setSttError(undefined);
    setSttBusy(true);
    try {
      sttRef.current = recognizeOnce();
      const text = await sttRef.current.result;
      if (text) set(text);
      else setSttError('聞き取れませんでした');
    } catch (e) {
      setSttError((e as Error).message);
    } finally {
      setSttBusy(false);
      sttRef.current = null;
    }
  };

  const askAi = async () => {
    if (!provider) return;
    setAiBusy(true);
    setAiError(undefined);
    const messages: ChatMessage[] = [
      { role: 'system', content: followUpSystemPrompt(level, confirmedFactsText(state)) },
      { role: 'assistant', content: fu.en },
      { role: 'user', content: answer },
    ];
    for (const t of aiTurns) {
      messages.push({ role: 'assistant', content: t.q });
      if (t.a) messages.push({ role: 'user', content: t.a });
    }
    try {
      const q = await provider.reply(messages);
      setAiTurns((ts) => [...ts, { q, a: '' }]);
      setAiAnswer('');
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <section>
      <p className="small">
        <span className="badge">教材の固定質問</span> <span className="muted">（AI の応答ではありません）</span>
      </p>
      <div className="card bubble">
        <div className="row">
          <strong>{scene.partnerName}:</strong>
          {sp.canSpeak && (
            <button type="button" className="btn btn-primary" onClick={() => sp.play(fu.en, 'partner')}>
              ▶ 質問を聞く
            </button>
          )}
          {sp.canSpeak && (
            <button type="button" className="btn-small" onClick={() => sp.play(fu.en, 'partner', 0.7)}>
              ゆっくり
            </button>
          )}
        </div>
        {showEn ? (
          <p className="en" lang="en">
            {fu.en}
          </p>
        ) : (
          <button type="button" className="btn-small btn-ghost" onClick={() => setShowEn(true)}>
            英文を見る
          </button>
        )}
        {showJa ? (
          <p className="ja">{fu.ja}</p>
        ) : (
          <button type="button" className="btn-small btn-ghost" onClick={() => setShowJa(true)}>
            訳を見る
          </button>
        )}
      </div>

      <div className="card">
        <p className="small">
          短く答えてください（1〜2文）。声に出して答え、録音や入力は任意です。
        </p>
        <label className="field">
          <span>あなたの答え（入力は任意）</span>
          <textarea lang="en" rows={2} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="例: I'm building ..." />
        </label>
        {sttEnabled && (
          <button type="button" className="btn-small" disabled={sttBusy} onClick={() => runStt(setAnswer)}>
            {sttBusy ? '聞いています…' : '🎤 音声入力で文字にする（外部送信あり）'}
          </button>
        )}
        {sttError && <p className="error small">{sttError}</p>}
        <RecorderPanel contextKey={`${scene.id}:fu${index}`} label={fu.en} compact />
      </div>

      {!revealed ? (
        <button type="button" className="btn" onClick={() => setRevealed(true)}>
          ヒントと答えの例を見る
        </button>
      ) : (
        <div className="card">
          <p className="small">
            <strong>ヒント:</strong> {fu.hintJa}
          </p>
          <ul className="plain">
            {fu.models.map((m) => (
              <li key={m.en} className="row">
                <PlayButton text={m.en.replace(/\[[^\]]*\]/g, '...')} who="you" small />
                <span>
                  <span lang="en" className="en">
                    {m.en}
                  </span>
                  <br />
                  <span className="small muted">{m.ja}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="small muted">答えの例は型の見本です。[ ] は自分の情報に。プロジェクトの事実と違う場合は使わないでください。</p>
          {fu.projectFields && (
            <div className="small">
              {fu.projectFields.map((k) => {
                const v = confirmedFact(state, k);
                const label = PROJECT_FIELDS.find((f) => f.key === k)?.labelJa;
                return (
                  <p key={k} className="fact">
                    資料「{label}」:{' '}
                    {v ? (
                      <>
                        <span className="badge badge-ok">確認済み</span> <span lang="en">{v}</span>
                      </>
                    ) : (
                      <>
                        <span className="badge badge-warn">要確認</span> 未確定なら推測せず「確認して連絡します」と答える練習を。
                      </>
                    )}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}

      <fieldset className="card">
        <legend>どうでしたか？</legend>
        <div className="seg">
          {(
            [
              ['ok', '言えた'],
              ['stuck', '詰まった'],
              ['no', '言えなかった'],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" className={`chip ${grade === k ? 'chip-on' : ''}`} aria-pressed={grade === k} onClick={() => onGrade(k)}>
              {l}
            </button>
          ))}
        </div>
        {grade && grade !== 'ok' && <p className="small muted">答えの例は次の「保存」画面で復習に回せます。</p>}
      </fieldset>

      {provider && (
        <div className="card ai">
          <p className="small">
            <span className="badge badge-ai">AI 接続あり</span> 接続先: {provider.label}
          </p>
          <p className="small muted">あなたの入力した答え（テキスト）だけを接続先に送ります。録音は送りません。</p>
          <button type="button" className="btn" disabled={!answer.trim() || aiBusy} onClick={askAi}>
            {aiBusy ? '応答待ち…' : 'AI に追加で質問してもらう'}
          </button>
          {!answer.trim() && <p className="small muted">先に答えを入力してください。</p>}
          {aiError && <p className="error small">{aiError}</p>}
          {aiTurns.map((t, i) => (
            <div key={i} className="bubble ai-bubble">
              <p className="small">
                <span className="badge badge-ai">AI 応答</span>
              </p>
              <p className="en" lang="en">
                {t.q}
              </p>
              <PlayButton text={t.q} who="partner" small />
              {i === aiTurns.length - 1 && (
                <label className="field">
                  <span>答え</span>
                  <textarea
                    lang="en"
                    rows={2}
                    value={aiAnswer}
                    onChange={(e) => {
                      setAiAnswer(e.target.value);
                      setAiTurns((ts) => ts.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)));
                    }}
                  />
                </label>
              )}
            </div>
          ))}
          {aiTurns.length > 0 && aiTurns.length < 3 && (
            <button type="button" className="btn-small" disabled={!aiAnswer.trim() || aiBusy} onClick={askAi}>
              さらに質問してもらう
            </button>
          )}
        </div>
      )}
    </section>
  );
}

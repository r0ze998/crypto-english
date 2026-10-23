import { useState } from 'react';
import type { Scene } from '../../data/types';

/** 内容理解の確認。最初の回答だけを記録し、間違えたら説明と聞き直しを促す */
export function ComprehendStep({
  scene,
  onFirstAnswer,
  onListenAgain,
}: {
  scene: Scene;
  onFirstAnswer: (qIndex: number, correct: boolean) => void;
  onListenAgain: () => void;
}) {
  const [picked, setPicked] = useState<Record<number, number>>({});

  return (
    <section>
      <p className="small muted">聞いた内容について答えてください。間違えても大丈夫です。</p>
      {scene.questions.map((q, qi) => {
        const p = picked[qi];
        const answered = p !== undefined;
        return (
          <fieldset key={qi} className="card question">
            <legend>
              Q{qi + 1}. {q.q}
            </legend>
            <div className="stack">
              {q.choices.map((c, ci) => {
                const cls = !answered ? '' : ci === q.answer ? 'choice-correct' : ci === p ? 'choice-wrong' : '';
                return (
                  <button
                    key={ci}
                    type="button"
                    className={`btn choice ${cls}`}
                    disabled={answered}
                    onClick={() => {
                      setPicked((m) => ({ ...m, [qi]: ci }));
                      onFirstAnswer(qi, ci === q.answer);
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className={p === q.answer ? 'ok' : 'error'} role="status">
                {p === q.answer ? '正解！ ' : '惜しい。 '}
                {q.explainJa}
              </p>
            )}
          </fieldset>
        );
      })}
      <button type="button" className="btn btn-ghost" onClick={onListenAgain}>
        ← もう一度聞く
      </button>
    </section>
  );
}

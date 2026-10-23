import { useState } from 'react';
import { useStore } from '../lib/store';
import { dueItems } from '../lib/session';
import { ReviewDeck } from '../components/ReviewDeck';

export function ReviewPage() {
  const { state } = useStore();
  const [ids, setIds] = useState<string[] | null>(null);
  const [key, setKey] = useState(0);
  const due = dueItems(state);

  if (ids) {
    return (
      <div>
        <h1>復習</h1>
        <ReviewDeck key={key} ids={ids} onDone={() => setIds(null)} />
        <button type="button" className="btn btn-ghost" onClick={() => setIds(null)}>
          やめる
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>復習</h1>
      <p className="small muted">
        保存した表現を、間隔を空けて思い出す練習です。「言えた」ほど次の復習までの間隔が長くなります（1→2→4→7→15→30→60日の目安）。
      </p>
      <div className="card">
        <p>
          今日の復習: <strong>{due.length}</strong> 件
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={due.length === 0}
          onClick={() => {
            setIds(due.map((d) => d.id));
            setKey((k) => k + 1);
          }}
        >
          復習を始める
        </button>
      </div>
      {state.phrases.length > 0 && (
        <div className="card">
          <p className="small">期日前でも練習できます（予定は「言えた/なんとか/言えなかった」に応じて更新されます）。</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const shuffled = [...state.phrases].sort(() => Math.random() - 0.5).slice(0, 10);
              setIds(shuffled.map((p) => p.id));
              setKey((k) => k + 1);
            }}
          >
            ランダムに10件
          </button>
        </div>
      )}
      {state.phrases.length === 0 && <p className="muted">まだ表現がありません。練習の最後に保存すると、翌日から復習に出ます。</p>}
    </div>
  );
}

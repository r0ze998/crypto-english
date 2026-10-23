import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { INTERVALS, review, type Grade } from '../lib/srs';
import { dayKey } from '../lib/date';
import { PlayButton, useSpeaker } from './audio';
import { RecorderPanel } from './Recorder';

type Mode = 'produce' | 'listen';

/**
 * 想起練習。produce: 日本語を見て英語で言う → 答えを見て自己評価。
 * listen: 英語を聞いて意味を思い出す（音声がない環境では英文を読む）。
 */
export function ReviewDeck({ ids, onReviewed, onDone }: { ids: string[]; onReviewed?: () => void; onDone?: () => void }) {
  const { state, update } = useStore();
  const sp = useSpeaker();
  const [queue] = useState(ids);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(false);
  const [mode, setMode] = useState<Mode>('produce');
  const item = useMemo(() => state.phrases.find((p) => p.id === queue[pos]), [state.phrases, queue, pos]);

  if (queue.length === 0) return <p className="muted">今日の復習はありません。</p>;
  if (pos >= queue.length || !item) {
    return (
      <div className="card">
        <p className="ok">復習 {queue.length} 件が終わりました。</p>
        {onDone && (
          <button type="button" className="btn btn-primary" onClick={onDone}>
            次へ
          </button>
        )}
      </div>
    );
  }

  const nextLabel = (g: Grade) => {
    const s = review(item.srs, g, dayKey());
    const d = INTERVALS[s.box];
    return g === 'again' ? '明日' : g === 'hard' ? `${Math.max(1, Math.round(INTERVALS[item.srs.box] / 2))}日後` : `${d}日後`;
  };

  const grade = (g: Grade) => {
    update((s) => ({
      ...s,
      phrases: s.phrases.map((p) => (p.id === item.id ? { ...p, srs: review(p.srs, g, dayKey()) } : p)),
    }));
    onReviewed?.();
    setShown(false);
    setPos((p) => p + 1);
  };

  return (
    <div>
      <div className="row between">
        <span className="small muted">
          {pos + 1} / {queue.length}
        </span>
        <div className="seg">
          <button type="button" className={`chip ${mode === 'produce' ? 'chip-on' : ''}`} onClick={() => { setMode('produce'); setShown(false); }}>
            日本語→英語で言う
          </button>
          <button type="button" className={`chip ${mode === 'listen' ? 'chip-on' : ''}`} onClick={() => { setMode('listen'); setShown(false); }}>
            英語→意味
          </button>
        </div>
      </div>
      <div className="card review-card">
        {mode === 'produce' ? (
          <>
            <p className="prompt">{item.ja || '（意味が未入力です）'}</p>
            {item.note && <p className="small muted">{item.note}</p>}
            <p className="small muted">英語で声に出して言ってから、答えを見てください。</p>
          </>
        ) : (
          <>
            {sp.canSpeak ? (
              <div className="row">
                <button type="button" className="btn btn-primary" onClick={() => sp.play(item.en, 'partner')}>
                  ▶ 聞く
                </button>
                <button type="button" className="btn-small" onClick={() => sp.play(item.en, 'partner', 0.7)}>
                  ゆっくり
                </button>
              </div>
            ) : (
              <p className="en big" lang="en">
                {item.en}
              </p>
            )}
            <p className="small muted">意味を思い出してから、答えを見てください。</p>
          </>
        )}
        {!shown ? (
          <button type="button" className="btn" onClick={() => setShown(true)}>
            答えを見る
          </button>
        ) : (
          <div className="answer">
            <p className="en big" lang="en">
              {item.en}
            </p>
            <p className="ja">{item.ja}</p>
            <PlayButton text={item.en} who="you" label="▶ お手本" />
            {mode === 'produce' && <RecorderPanel contextKey={`phrase:${item.id}`} label={item.en} modelText={item.en} compact />}
            <div className="grades">
              <button type="button" className="btn grade-again" onClick={() => grade('again')}>
                {mode === 'produce' ? '言えなかった' : '分からなかった'}
                <span className="small">{nextLabel('again')}</span>
              </button>
              <button type="button" className="btn grade-hard" onClick={() => grade('hard')}>
                なんとか
                <span className="small">{nextLabel('hard')}</span>
              </button>
              <button type="button" className="btn grade-good" onClick={() => grade('good')}>
                {mode === 'produce' ? '言えた' : '分かった'}
                <span className="small">{nextLabel('good')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

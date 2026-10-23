import { RESCUE_PHRASES } from '../data/scenes';
import type { GlossaryItem, Level } from '../data/types';
import { PlayButton } from './audio';

/** 「分からない」を押したときの調整メニュー（短文・語彙・速度を下げる方向） */
export function HelpSheet({
  open,
  onClose,
  level,
  rate,
  glossary,
  onSlower,
  onShowEn,
  onShowJa,
  onEasier,
}: {
  open: boolean;
  onClose: () => void;
  level: Level;
  rate: number;
  glossary: GlossaryItem[];
  onSlower: () => void;
  onShowEn: () => void;
  onShowJa: () => void;
  onEasier: () => void;
}) {
  if (!open) return null;
  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="分からないときの調整">
      <div className="sheet-body">
        <h3>分からないときは</h3>
        <p className="small muted">上から順に試すのがおすすめです。何度押しても大丈夫です。</p>
        <div className="stack">
          <button type="button" className="btn" onClick={onSlower} disabled={rate <= 0.6}>
            ゆっくりにする（今 {rate.toFixed(1)}）
          </button>
          {level === 'plus' && (
            <button type="button" className="btn" onClick={onEasier}>
              A2 版（短い文）に切り替える
            </button>
          )}
          <button type="button" className="btn" onClick={onShowEn}>
            英文を表示する
          </button>
          <button type="button" className="btn" onClick={onShowJa}>
            日本語訳も表示する
          </button>
        </div>
        <h4>キーワード</h4>
        <ul className="gloss">
          {glossary.map((g) => (
            <li key={g.en}>
              <span lang="en">{g.en}</span> — {g.ja}
            </li>
          ))}
        </ul>
        <h4>実際の会話ならこう言える</h4>
        <ul className="plain">
          {RESCUE_PHRASES.map((p) => (
            <li key={p.en} className="row">
              <PlayButton text={p.en} who="you" small />
              <span>
                <span lang="en">{p.en}</span>
                <br />
                <span className="small muted">{p.ja}</span>
              </span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}

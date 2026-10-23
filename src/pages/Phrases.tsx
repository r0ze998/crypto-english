import { useState } from 'react';
import { useStore } from '../lib/store';
import { getScene } from '../data/scenes';
import { addPhrases } from '../lib/phrases';
import { dayKey } from '../lib/date';
import type { SavedPhrase } from '../lib/state';
import { PlayButton } from '../components/audio';
import { useConfirm } from '../components/Confirm';

function Editor({ p, onDone }: { p: SavedPhrase; onDone: () => void }) {
  const { update } = useStore();
  const [en, setEn] = useState(p.en);
  const [ja, setJa] = useState(p.ja);
  const [note, setNote] = useState(p.note);
  return (
    <div className="stack">
      <label className="field">
        <span>英語</span>
        <input type="text" lang="en" value={en} onChange={(e) => setEn(e.target.value)} />
      </label>
      <label className="field">
        <span>意味</span>
        <input type="text" value={ja} onChange={(e) => setJa(e.target.value)} />
      </label>
      <label className="field">
        <span>メモ</span>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!en.trim()}
          onClick={() => {
            update((s) => ({
              ...s,
              phrases: s.phrases.map((x) => (x.id === p.id ? { ...x, en: en.trim(), ja: ja.trim(), note: note.trim(), updatedAt: new Date().toISOString() } : x)),
            }));
            onDone();
          }}
        >
          保存
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          キャンセル
        </button>
      </div>
    </div>
  );
}

export function PhrasesPage() {
  const { state, update } = useStore();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const confirm = useConfirm();
  const [en, setEn] = useState('');
  const [ja, setJa] = useState('');
  const today = dayKey();

  const list = state.phrases
    .filter((p) => !q || `${p.en} ${p.ja} ${p.note}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1>覚えたい表現</h1>
      <div className="card">
        <p className="small">新しく追加（翌日から復習に出ます）</p>
        <label className="field">
          <span>英語</span>
          <input type="text" lang="en" value={en} onChange={(e) => setEn(e.target.value)} placeholder="Let me check and get back to you." />
        </label>
        <label className="field">
          <span>意味・メモ</span>
          <input type="text" value={ja} onChange={(e) => setJa(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!en.trim()}
          onClick={() => {
            update((s) => addPhrases(s, [{ en, ja, note: '' }]).state);
            setEn('');
            setJa('');
          }}
        >
          追加
        </button>
      </div>

      <label className="field">
        <span className="small">検索</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <p className="small muted">{list.length} 件</p>

      <ul className="plain phrase-list">
        {list.map((p) => (
          <li key={p.id} className="card">
            {editing === p.id ? (
              <Editor p={p} onDone={() => setEditing(null)} />
            ) : (
              <>
                <div className="row between">
                  <span lang="en" className="en">
                    {p.en}
                  </span>
                  <PlayButton text={p.en} who="you" small />
                </div>
                <p className="ja">{p.ja}</p>
                {p.note && <p className="small muted">{p.note}</p>}
                <p className="small muted">
                  次の復習: {p.srs.due <= today ? '今日' : p.srs.due} ・ 段階 {p.srs.box + 1}/7
                  {p.sourceSceneId && ` ・ ${getScene(p.sourceSceneId)?.titleJa ?? ''}`}
                </p>
                <div className="row">
                  <button type="button" className="btn-small" onClick={() => setEditing(p.id)}>
                    編集
                  </button>
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() =>
                      update((s) => ({ ...s, phrases: s.phrases.map((x) => (x.id === p.id ? { ...x, srs: { ...x.srs, due: today } } : x)) }))
                    }
                    disabled={p.srs.due <= today}
                  >
                    今日の復習に入れる
                  </button>
                  <button
                    type="button"
                    className="btn-small btn-ghost"
                    onClick={async () => {
                      if (await confirm({ message: `「${p.en}」を削除しますか？`, confirmLabel: '削除する', danger: true })) update((s) => ({ ...s, phrases: s.phrases.filter((x) => x.id !== p.id) }));
                    }}
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

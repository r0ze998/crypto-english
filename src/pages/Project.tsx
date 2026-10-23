import { useState } from 'react';
import { useStore } from '../lib/store';
import { PROJECT_FIELDS, type FactStatus, type Paraphrase, type PitchOriginal } from '../lib/state';
import { createOriginal } from '../lib/pitch';
import { uid } from '../lib/date';
import { PitchPractice } from '../components/PitchPractice';

const STATUS_LABEL: Record<FactStatus, string> = {
  unprovided: '未提供',
  needs_check: '要確認',
  confirmed: '確認済み',
};

export function ProjectPage() {
  return (
    <div>
      <h1>プロジェクト資料</h1>
      <p className="small">
        ここで<strong>「確認済み」</strong>にした項目だけが、練習の置き換え文や答えの参考に表示されます。未提供・要確認の項目はアプリ側で作文せず、練習中は「要確認」と表示します。
      </p>
      <Facts />
      <Pitch />
    </div>
  );
}

function Facts() {
  const { state, update } = useStore();
  return (
    <section>
      <h2>基本情報</h2>
      {PROJECT_FIELDS.map((f) => {
        const v = state.project[f.key];
        const set = (patch: Partial<typeof v>) =>
          update((s) => {
            const next = { ...s.project[f.key], ...patch };
            // 値を書き換えたら確認済みを解除して「要確認」に戻す
            if (patch.value !== undefined && s.project[f.key].status === 'confirmed') next.status = 'needs_check';
            if (patch.value !== undefined && !patch.value.trim() && next.status !== 'confirmed') next.status = 'unprovided';
            if (patch.value !== undefined && patch.value.trim() && next.status === 'unprovided') next.status = 'needs_check';
            return { ...s, project: { ...s.project, [f.key]: next } };
          });
        return (
          <div key={f.key} className="card fact-card">
            <div className="row between">
              <strong>{f.labelJa}</strong>
              <span className={`badge ${v.status === 'confirmed' ? 'badge-ok' : 'badge-warn'}`}>{STATUS_LABEL[v.status]}</span>
            </div>
            <p className="small muted">
              {f.hintJa}
              {f.sensitive && ' ・ 外部に話してよい確定情報だけを入力してください'}
            </p>
            <textarea rows={2} lang="en" value={v.value} onChange={(e) => set({ value: e.target.value })} aria-label={f.labelJa} />
            <div className="row">
              <button
                type="button"
                className="btn-small"
                disabled={!v.value.trim() || v.status === 'confirmed'}
                onClick={() => set({ status: 'confirmed' })}
              >
                確認済みにする
              </button>
              {v.status === 'confirmed' && (
                <button type="button" className="btn-small btn-ghost" onClick={() => set({ status: 'needs_check' })}>
                  要確認に戻す
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Pitch() {
  const { state, update } = useStore();
  const [draft, setDraft] = useState('');
  const [label, setLabel] = useState('0xARK pitch');
  const [busy, setBusy] = useState(false);
  const [practice, setPractice] = useState<string | null>(null);
  const originals = state.pitch.originals;

  const saveOriginal = async () => {
    if (!draft.trim()) return;
    if (!window.confirm('この文章を「原文」として保存します。保存後はアプリ内で編集できません（削除と新しい版の追加のみ）。よろしいですか？')) return;
    setBusy(true);
    const o = await createOriginal(draft, label.trim() || 'pitch');
    update((s) => ({ ...s, pitch: { ...s.pitch, originals: [...s.pitch.originals, o] } }));
    setDraft('');
    setBusy(false);
  };

  const removeOriginal = (o: PitchOriginal) => {
    const typed = window.prompt(`原文「${o.label}」と、その言い換えを削除します。確認のため「削除」と入力してください。`);
    if (typed !== '削除') return;
    update((s) => ({
      ...s,
      pitch: { originals: s.pitch.originals.filter((x) => x.id !== o.id), paraphrases: s.pitch.paraphrases.filter((p) => p.pitchId !== o.id) },
    }));
  };

  return (
    <section>
      <h2>固定ピッチ（原文）</h2>
      {originals.length === 0 && (
        <p className="notice">
          0xARK の固定済み英語ピッチは<strong>まだ提供されていません</strong>。原文が登録されるまで、このアプリはピッチを作文・再構成しません。
        </p>
      )}
      {originals.map((o) => (
        <div key={o.id} className="card">
          <pre className="original" lang="en">
            {o.text}
          </pre>
          <p className="small muted">
            {o.label} ・ SHA-256 {o.sha256.slice(0, 12)}… ・ {o.text.length} 文字
          </p>
          <div className="row">
            <button type="button" className="btn-small" onClick={() => setPractice(practice === o.id ? null : o.id)}>
              {practice === o.id ? '練習を閉じる' : '聞く・まねる'}
            </button>
            <button type="button" className="btn-small" onClick={() => navigator.clipboard?.writeText(o.text)}>
              コピー
            </button>
            <button type="button" className="btn-small btn-ghost" onClick={() => removeOriginal(o)}>
              削除
            </button>
          </div>
          {practice === o.id && <PitchPractice pitch={o} />}
          <Paraphrases pitchId={o.id} />
        </div>
      ))}

      <div className="card">
        <p className="small">
          {originals.length === 0 ? '原文を貼り付けて保存してください。' : '新しい版を追加する場合（既存の原文は変更されません）'}
        </p>
        <label className="field">
          <span>名前</span>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="field">
          <span>原文（入力どおりに保存されます）</span>
          <textarea rows={6} lang="en" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <button type="button" className="btn btn-primary" disabled={!draft.trim() || busy} onClick={saveOriginal}>
          原文として保存
        </button>
      </div>
    </section>
  );
}

function Paraphrases({ pitchId }: { pitchId: string }) {
  const { state, update } = useStore();
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const list = state.pitch.paraphrases.filter((p) => p.pitchId === pitchId);

  const save = () => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    update((s) => {
      const ps = editId
        ? s.pitch.paraphrases.map((p) => (p.id === editId ? { ...p, text, noteJa: note, updatedAt: now } : p))
        : [...s.pitch.paraphrases, { id: uid('para-'), pitchId, text, noteJa: note, createdAt: now, updatedAt: now } as Paraphrase];
      return { ...s, pitch: { ...s.pitch, paraphrases: ps } };
    });
    setText('');
    setNote('');
    setEditId(null);
  };

  return (
    <div className="paraphrases">
      <h4>練習用の言い換え（原文とは別に保存）</h4>
      <p className="small muted">短く言う版・A2 の語で言う版などを自分で書いて保存できます。原文には影響しません。</p>
      <ul className="plain">
        {list.map((p) => (
          <li key={p.id} className="para">
            <span className="badge badge-warn">言い換え</span>{' '}
            <span lang="en" className="pre">
              {p.text}
            </span>
            {p.noteJa && <span className="small muted"> — {p.noteJa}</span>}
            <div className="row">
              <button
                type="button"
                className="btn-small"
                onClick={() => {
                  setEditId(p.id);
                  setText(p.text);
                  setNote(p.noteJa);
                }}
              >
                編集
              </button>
              <button
                type="button"
                className="btn-small btn-ghost"
                onClick={() => update((s) => ({ ...s, pitch: { ...s.pitch, paraphrases: s.pitch.paraphrases.filter((x) => x.id !== p.id) } }))}
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
      <label className="field">
        <span>{editId ? '言い換えを編集' : '言い換えを追加'}</span>
        <textarea rows={3} lang="en" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <label className="field">
        <span>メモ（例: 30秒版）</span>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button type="button" className="btn-small" disabled={!text.trim()} onClick={save}>
        {editId ? '更新' : '追加'}
      </button>
    </div>
  );
}

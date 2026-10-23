import { useMemo, useState } from 'react';
import type { Scene } from '../../data/types';
import type { SceneRun } from './types';

export interface Candidate {
  key: string;
  en: string;
  ja: string;
  note: string;
  reasonJa: string;
}

export function buildCandidates(scene: Scene, run: SceneRun, followUpsUsed: number): { list: Candidate[]; preChecked: Set<string> } {
  const list: Candidate[] = [];
  const pre = new Set<string>();
  const seen = new Set<string>();
  const add = (c: Candidate, check: boolean) => {
    const k = c.en.trim().toLowerCase();
    if (seen.has(k)) {
      if (check) pre.add(list.find((x) => x.en.trim().toLowerCase() === k)!.key);
      return;
    }
    seen.add(k);
    list.push(c);
    if (check) pre.add(c.key);
  };
  run.marked.forEach((m, i) => add({ key: `m${i}`, en: m.en, ja: m.ja, note: '', reasonJa: '★ 印を付けた文' }, true));
  for (let i = 0; i < followUpsUsed; i++) {
    const g = run.followUpSelf[i];
    const fu = scene.followUps[i];
    if (fu && g && g !== 'ok') {
      const m = fu.models[0];
      add({ key: `f${i}`, en: m.en, ja: m.ja, note: `質問: ${fu.en}`, reasonJa: '答えに詰まった質問の例' }, true);
    }
  }
  scene.phrases.forEach((p) => add({ key: p.id, en: p.en, ja: p.ja, note: p.noteJa ?? '', reasonJa: 'この場面の表現' }, false));
  return { list, preChecked: pre };
}

export function SaveStep({
  scene,
  run,
  followUpsUsed,
  existingEn,
  onSave,
}: {
  scene: Scene;
  run: SceneRun;
  followUpsUsed: number;
  existingEn: Set<string>;
  onSave: (items: Omit<Candidate, 'key' | 'reasonJa'>[]) => void;
}) {
  const { list, preChecked } = useMemo(() => buildCandidates(scene, run, followUpsUsed), [scene, run, followUpsUsed]);
  const [checked, setChecked] = useState<Set<string>>(preChecked);
  const [customEn, setCustomEn] = useState('');
  const [customJa, setCustomJa] = useState('');
  const [saved, setSaved] = useState<number | null>(null);
  const done = saved !== null;

  const toggle = (k: string) =>
    setChecked((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const save = () => {
    const items = list.filter((c) => checked.has(c.key)).map(({ en, ja, note }) => ({ en, ja, note }));
    if (customEn.trim()) items.push({ en: customEn.trim(), ja: customJa.trim(), note: '自分で追加' });
    onSave(items);
    setSaved(items.length);
  };

  return (
    <section>
      <p className="small">詰まった表現・使いたい表現を選んでください。保存した表現は<strong>明日以降</strong>の復習に出ます。</p>
      <ul className="plain">
        {list.map((c) => (
          <li key={c.key}>
            <label className="check check-block">
              <input type="checkbox" checked={checked.has(c.key)} onChange={() => toggle(c.key)} disabled={done} />
              <span>
                <span lang="en" className="en">
                  {c.en}
                </span>
                <br />
                <span className="small muted">
                  {c.ja} ・ {c.reasonJa}
                  {existingEn.has(c.en.trim().toLowerCase()) ? '（保存済み → 復習日を早めます）' : ''}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {!done && (
        <div className="card">
          <p className="small">自分で追加（任意）</p>
          <label className="field">
            <span>英語</span>
            <input type="text" lang="en" value={customEn} onChange={(e) => setCustomEn(e.target.value)} />
          </label>
          <label className="field">
            <span>意味・メモ</span>
            <input type="text" value={customJa} onChange={(e) => setCustomJa(e.target.value)} />
          </label>
        </div>
      )}
      {!done ? (
        <button type="button" className="btn btn-primary" onClick={save}>
          選んだ表現を保存（{checked.size + (customEn.trim() ? 1 : 0)}件）
        </button>
      ) : (
        <p className="ok" role="status">
          {saved}件を復習キューに入れました。
        </p>
      )}
    </section>
  );
}

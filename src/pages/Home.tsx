import { useState } from 'react';
import { CURRICULUM_ORDER, getScene } from '../data/scenes';
import { useStore } from '../lib/store';
import { buildPlan, dueItems, type Minutes } from '../lib/session';
import { PROJECT_FIELDS } from '../lib/state';
import { addDays, dayKey } from '../lib/date';
import type { ActiveSession } from '../components/steps/types';
import { useCaps } from '../lib/capabilities';

const COURSES: { m: Minutes; desc: string }[] = [
  { m: 10, desc: '復習（あれば最大3件）＋ 1場面: 聞く → 理解 → まねる・置き換え → 追加質問1つ → 保存' },
  { m: 30, desc: '復習（最大8件）＋ 2場面（追加質問2つずつ）＋ 繰り返し説明' },
  { m: 60, desc: '復習（最大15件）＋ 3場面 ＋ 繰り返し説明 ＋ ピッチ練習（原文登録時）' },
];

export function HomePage({
  active,
  onStart,
  onResume,
  onDiscard,
}: {
  active: ActiveSession | null;
  onStart: (a: ReturnType<typeof buildPlan>) => void;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const { state } = useStore();
  const caps = useCaps();
  const [first, setFirst] = useState('');
  const due = dueItems(state);
  const confirmed = PROJECT_FIELDS.filter((f) => state.project[f.key].status === 'confirmed').length;
  const today = dayKey();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const practicedDays = new Set(state.sessions.map((s) => dayKey(new Date(s.startedAt))));
  const totalMin = Math.round(state.sessions.reduce((n, s) => n + s.activeSeconds, 0) / 60);

  return (
    <div>
      <h1 className="title">
        Crypto English <span className="muted small">for {state.settings.name || 'you'}</span>
      </h1>
      <p className="small muted">海外の Crypto 開発者と、自分のプロジェクトについて話す練習。</p>

      {active && (
        <div className="card highlight">
          <p>
            途中の練習があります（{active.plan.minutes}分コース・{getScene(active.plan.sceneIds[0])?.titleJa ?? ''}）。
          </p>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={onResume}>
              続きから再開
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (window.confirm('途中の練習を破棄しますか？（保存済みの表現は残ります）')) onDiscard();
              }}
            >
              破棄
            </button>
          </div>
        </div>
      )}

      <h2>今日の練習</h2>
      <div className="stack">
        {COURSES.map((c) => (
          <button key={c.m} type="button" className="course" onClick={() => onStart(buildPlan(state, c.m, first || undefined))} disabled={!!active}>
            <span className="course-min">{c.m}分</span>
            <span className="course-desc small">{c.desc}</span>
          </button>
        ))}
      </div>
      <label className="field">
        <span className="small">最初の場面（任意）</span>
        <select value={first} onChange={(e) => setFirst(e.target.value)}>
          <option value="">おすすめ順（未練習から）</option>
          {CURRICULUM_ORDER.map((id) => {
            const s = getScene(id)!;
            const p = state.sceneProgress[id];
            return (
              <option key={id} value={id}>
                {s.titleJa}
                {p ? `（${p.times}回）` : ''}
              </option>
            );
          })}
        </select>
      </label>
      <p className="small muted">
        難度: {state.settings.level === 'a2' ? 'A2（短い文）' : '少し難しい版'} ・ 速度 {state.settings.rate.toFixed(1)} ・{' '}
        {caps.canSpeak ? '音声あり' : 'テキスト練習'}（<a href="#/settings">設定</a>）
      </p>

      <div className="grid2">
        <a className="card stat" href="#/review">
          <span className="stat-num">{due.length}</span>
          <span className="small">今日の復習</span>
        </a>
        <a className="card stat" href="#/project">
          <span className="stat-num">
            {confirmed}/{PROJECT_FIELDS.length}
          </span>
          <span className="small">資料（確認済み）</span>
        </a>
      </div>

      <div className="card">
        <div className="row between">
          <strong className="small">最近14日</strong>
          <a className="small" href="#/log">
            記録を見る
          </a>
        </div>
        <div className="days" aria-label="最近14日の練習">
          {days.map((d) => (
            <span key={d} className={`day ${practicedDays.has(d) ? 'day-on' : ''} ${d === today ? 'day-today' : ''}`} title={d}>
              {Number(d.slice(8))}
            </span>
          ))}
        </div>
        <p className="small muted">
          合計 {state.sessions.length} 回 ・ {totalMin} 分 ・ 保存した表現 {state.phrases.length} 件
        </p>
      </div>

      {state.pitch.originals.length === 0 && (
        <p className="small muted">
          0xARK の固定ピッチは原文の提供待ちです（<a href="#/project">資料</a>で登録）。原文が登録されるまで、ピッチの作文・再構成はしません。
        </p>
      )}
    </div>
  );
}

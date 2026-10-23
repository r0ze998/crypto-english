import { useStore } from '../lib/store';
import { getScene } from '../data/scenes';
import { formatJaDate } from '../lib/date';

export function LogPage() {
  const { state } = useStore();
  const sessions = [...state.sessions].reverse();
  const totalSec = state.sessions.reduce((n, s) => n + s.activeSeconds, 0);
  const all = state.sessions.flatMap((s) => s.scenes);
  const recent = all.slice(-10);
  const c = recent.reduce((n, r) => n + r.compCorrect, 0);
  const t = recent.reduce((n, r) => n + r.compTotal, 0);
  const help = recent.reduce((n, r) => n + r.helpCount, 0);

  return (
    <div>
      <h1>練習記録</h1>
      <div className="grid2">
        <div className="card stat">
          <span className="stat-num">{state.sessions.length}</span>
          <span className="small">回</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{Math.round(totalSec / 60)}</span>
          <span className="small">分</span>
        </div>
      </div>
      {t > 0 && (
        <p className="small">
          直近 {recent.length} 場面の理解チェック: {c}/{t}（{Math.round((c / t) * 100)}%）・「分からない」使用 {help} 回
          <br />
          <span className="muted">難度の目安は「約9割が分かる」。大きく下回るときは A2 版・ゆっくり再生・キーワード確認を。</span>
        </p>
      )}
      <ul className="plain">
        {sessions.map((s) => (
          <li key={s.id} className="card">
            <div className="row between">
              <strong className="small">{formatJaDate(s.startedAt)}</strong>
              <span className="small muted">
                {s.plannedMinutes}分コース ・ 実際 {Math.round(s.activeSeconds / 60)}分{s.completed ? '' : '（途中終了）'}
              </span>
            </div>
            <ul className="plain small">
              {s.scenes.map((r, i) => (
                <li key={i}>
                  {getScene(r.sceneId)?.titleJa}（{r.level === 'a2' ? 'A2' : '少し難しい版'}）理解 {r.compCorrect}/{r.compTotal} ・ 保存 {r.savedPhrases}
                  {r.followUpSelf.length > 0 &&
                    ` ・ 追加質問 ${r.followUpSelf.map((g) => (g === 'ok' ? '○' : g === 'stuck' ? '△' : '×')).join('')}`}
                </li>
              ))}
              {s.reviewed > 0 && <li>復習 {s.reviewed} 件</li>}
              {s.fluencyRounds > 0 && <li>繰り返し説明 {s.fluencyRounds} 回</li>}
            </ul>
          </li>
        ))}
      </ul>
      {sessions.length === 0 && <p className="muted">まだ記録がありません。</p>}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getScene } from '../data/scenes';
import type { Level } from '../data/types';
import { useStore } from '../lib/store';
import { addPhrases, phraseKeySet } from '../lib/phrases';
import { fillFrame, frameIsComplete, levelAdvice, type SessionPlan } from '../lib/session';
import type { AppState, SceneResult, SessionLog } from '../lib/state';
import { dayKey, uid } from '../lib/date';
import { cancelSpeech } from '../lib/tts';
import { buildSteps, STEP_LABEL, type ActiveSession, type SceneRun, type Step } from '../components/steps/types';
import { ListenStep } from '../components/steps/ListenStep';
import { ComprehendStep } from '../components/steps/ComprehendStep';
import { ImitateStep } from '../components/steps/ImitateStep';
import { initialFrameValues, SubstituteStep } from '../components/steps/SubstituteStep';
import { FollowUpStep } from '../components/steps/FollowUpStep';
import { SaveStep } from '../components/steps/SaveStep';
import { FluencyStep } from '../components/steps/FluencyStep';
import { ReviewDeck } from '../components/ReviewDeck';
import { PitchPractice } from '../components/PitchPractice';
import { useConfirm } from '../components/Confirm';

export const ACTIVE_KEY = 'crypto-english:active-session';

export function loadActive(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as ActiveSession;
    if (!a?.plan?.sceneIds || typeof a.step !== 'number') return null;
    return a;
  } catch {
    return null;
  }
}

export function clearActive() {
  try {
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* noop */
  }
}

export function newActiveSession(plan: SessionPlan, state: AppState): ActiveSession {
  const runs: Record<string, SceneRun> = {};
  for (const id of plan.sceneIds) {
    const scene = getScene(id)!;
    runs[id] = {
      sceneId: id,
      level: state.settings.level,
      compFirst: {},
      helpCount: 0,
      followUpSelf: [],
      savedPhrases: 0,
      marked: [],
      frameValues: initialFrameValues(scene, state.settings.name),
    };
  }
  return { id: uid('ses-'), plan, step: 0, startedAt: new Date().toISOString(), activeSeconds: 0, runs, reviewed: 0, fluencyRounds: 0 };
}

export function toResult(run: SceneRun): SceneResult {
  const answers = Object.values(run.compFirst);
  return {
    sceneId: run.sceneId,
    level: run.level,
    compCorrect: answers.filter(Boolean).length,
    compTotal: answers.length,
    helpCount: run.helpCount,
    followUpSelf: run.followUpSelf,
    savedPhrases: run.savedPhrases,
  };
}

function finalize(state: AppState, a: ActiveSession, completed: boolean): AppState {
  const results = a.plan.sceneIds.map((id) => toResult(a.runs[id]));
  const log: SessionLog = {
    id: a.id,
    startedAt: a.startedAt,
    endedAt: new Date().toISOString(),
    plannedMinutes: a.plan.minutes,
    activeSeconds: a.activeSeconds,
    scenes: results,
    reviewed: a.reviewed,
    fluencyRounds: a.fluencyRounds,
    completed,
  };
  const sceneProgress = { ...state.sceneProgress };
  const today = dayKey();
  for (const r of results) {
    // 理解チェックまで進んだ場面だけを「練習済み」にする
    if (r.compTotal > 0) {
      const p = sceneProgress[r.sceneId];
      sceneProgress[r.sceneId] = { times: (p?.times ?? 0) + 1, last: today, lastLevel: r.level };
    }
  }
  return { ...state, sessions: [...state.sessions.filter((s) => s.id !== a.id), log], sceneProgress };
}

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export function SessionPage({ initial, onExit }: { initial: ActiveSession; onExit: () => void }) {
  const { state, update } = useStore();
  const [a, setA] = useState<ActiveSession>(initial);
  const steps = useMemo(() => buildSteps(a.plan), [a.plan]);
  const step: Step = steps[Math.min(a.step, steps.length - 1)];
  const finalized = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();

  // 進行状況を保存（途中でタブが閉じても再開できる）
  useEffect(() => {
    if (step.kind === 'summary') return;
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
    } catch {
      /* 保存できなくても練習は続けられる */
    }
  }, [a, step.kind]);

  // 画面を見ている間だけ時間を数える
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') setA((x) => ({ ...x, activeSeconds: x.activeSeconds + 1 }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (step.kind === 'summary' && !finalized.current) {
      finalized.current = true;
      update((s) => finalize(s, a, true));
      clearActive();
    }
  }, [step.kind, a, update]);

  const go = (delta: number) => {
    cancelSpeech();
    setA((x) => ({ ...x, step: Math.max(0, Math.min(steps.length - 1, x.step + delta)) }));
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: 'start' }));
  };

  const setRun = useCallback((sceneId: string, fn: (r: SceneRun) => SceneRun) => {
    setA((x) => ({ ...x, runs: { ...x.runs, [sceneId]: fn(x.runs[sceneId]) } }));
  }, []);

  const quit = async () => {
    if (!(await confirm({ message: '練習を終了しますか？ここまでの記録は保存されます。', confirmLabel: '終了する' }))) return;
    cancelSpeech();
    if (!finalized.current && a.activeSeconds >= 20) update((s) => finalize(s, a, false));
    finalized.current = true;
    clearActive();
    onExit();
  };

  const sceneId = 'sceneId' in step ? step.sceneId : undefined;
  const scene = sceneId ? getScene(sceneId) : undefined;
  const run = sceneId ? a.runs[sceneId] : undefined;
  const sceneNo = sceneId ? a.plan.sceneIds.indexOf(sceneId) + 1 : 0;

  const savePhrases = (items: { en: string; ja: string; note: string }[], sid: string) => {
    const n = items.filter((i) => i.en.trim()).length;
    update((s) => addPhrases(s, items, sid).state);
    setRun(sid, (r) => ({ ...r, savedPhrases: r.savedPhrases + n }));
  };

  const todaysSentences = a.plan.sceneIds
    .map((id) => {
      const sc = getScene(id)!;
      const v = a.runs[id].frameValues;
      return frameIsComplete(sc.frame, v) ? fillFrame(sc.frame, v) : '';
    })
    .filter(Boolean);

  let body: React.ReactNode = null;
  let title = STEP_LABEL[step.kind];

  if (step.kind === 'review') {
    body = (
      <ReviewDeck
        ids={a.plan.reviewIds}
        onReviewed={() => setA((x) => ({ ...x, reviewed: x.reviewed + 1 }))}
        onDone={() => go(1)}
      />
    );
    title = `復習（${a.plan.reviewIds.length}件）`;
  } else if (scene && run) {
    const setLevel = (l: Level) => setRun(scene.id, (r) => ({ ...r, level: l }));
    if (step.kind === 'listen') {
      body = (
        <ListenStep
          scene={scene}
          level={run.level}
          onLevel={setLevel}
          onHelp={() => setRun(scene.id, (r) => ({ ...r, helpCount: r.helpCount + 1 }))}
          marked={run.marked}
          onToggleMark={(m) =>
            setRun(scene.id, (r) => ({
              ...r,
              marked: r.marked.some((x) => x.en === m.en) ? r.marked.filter((x) => x.en !== m.en) : [...r.marked, m],
            }))
          }
        />
      );
    } else if (step.kind === 'comprehend') {
      body = (
        <ComprehendStep
          key={scene.id}
          scene={scene}
          onFirstAnswer={(qi, ok) => setRun(scene.id, (r) => (qi in r.compFirst ? r : { ...r, compFirst: { ...r.compFirst, [qi]: ok } }))}
          onListenAgain={() => go(-1)}
        />
      );
    } else if (step.kind === 'imitate') {
      body = <ImitateStep key={scene.id} scene={scene} />;
    } else if (step.kind === 'substitute') {
      const sentence = fillFrame(scene.frame, run.frameValues);
      body = (
        <SubstituteStep
          scene={scene}
          values={run.frameValues}
          onChange={(v) => setRun(scene.id, (r) => ({ ...r, frameValues: v }))}
          saved={phraseKeySet(state).has(sentence.trim().toLowerCase())}
          onSaveSentence={(en) => savePhrases([{ en, ja: '（自分の文）', note: `型: ${scene.frame.template}` }], scene.id)}
        />
      );
    } else if (step.kind === 'followup') {
      const fu = scene.followUps[step.index];
      body = (
        <FollowUpStep
          key={`${scene.id}-${step.index}`}
          scene={scene}
          fu={fu}
          index={step.index}
          level={run.level}
          grade={run.followUpSelf[step.index]}
          onGrade={(g) =>
            setRun(scene.id, (r) => {
              const arr = [...r.followUpSelf];
              arr[step.index] = g;
              return { ...r, followUpSelf: arr };
            })
          }
        />
      );
      title = `${STEP_LABEL.followup}（${step.index + 1}/${a.plan.followUpsPerScene}）`;
    } else if (step.kind === 'save') {
      const advice = levelAdvice(toResult(run));
      body = (
        <>
          <SaveStep
            key={scene.id}
            scene={scene}
            run={run}
            followUpsUsed={a.plan.followUpsPerScene}
            existingEn={phraseKeySet(state)}
            onSave={(items) => savePhrases(items, scene.id)}
          />
          <div className="card advice">
            <p className="small">
              <strong>難度の目安:</strong> {advice.messageJa}
            </p>
            {advice.suggest === 'plus' && state.settings.level === 'a2' && (
              <button type="button" className="btn-small" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, level: 'plus' } }))}>
                次回から「少し難しい版」で始める
              </button>
            )}
            {advice.suggest === 'a2' && state.settings.level === 'plus' && (
              <button type="button" className="btn-small" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, level: 'a2' } }))}>
                次回から A2 版で始める
              </button>
            )}
            {advice.suggest === 'slower' && state.settings.rate > 0.6 && (
              <button
                type="button"
                className="btn-small"
                onClick={() => update((s) => ({ ...s, settings: { ...s.settings, rate: Math.max(0.6, Math.round((s.settings.rate - 0.1) * 10) / 10) } }))}
              >
                再生速度を少し下げる
              </button>
            )}
          </div>
        </>
      );
    }
  } else if (step.kind === 'fluency') {
    body = <FluencyStep sentences={todaysSentences} onRound={() => setA((x) => ({ ...x, fluencyRounds: x.fluencyRounds + 1 }))} />;
  } else if (step.kind === 'pitch') {
    const latest = state.pitch.originals[state.pitch.originals.length - 1];
    body = latest ? <PitchPractice pitch={latest} /> : <p className="muted">ピッチ原文が未登録です。</p>;
  } else if (step.kind === 'summary') {
    body = <Summary a={a} onHome={onExit} />;
  }

  const progress = Math.round((a.step / (steps.length - 1)) * 100);

  return (
    <div className="session" ref={topRef}>
      <header className="session-head">
        <div className="row between">
          <span className="small">
            {a.plan.minutes}分コース ・ 経過 {fmt(a.activeSeconds)}
          </span>
          {step.kind !== 'summary' && (
            <button type="button" className="btn-small btn-ghost" onClick={quit}>
              終了
            </button>
          )}
        </div>
        <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${progress}%` }} />
        </div>
        {scene && (
          <p className="small muted">
            場面 {sceneNo}/{a.plan.sceneIds.length}: {scene.titleJa}
          </p>
        )}
        <h2>{title}</h2>
      </header>

      {body}

      {step.kind !== 'summary' && (
        <nav className="step-nav">
          <button type="button" className="btn" disabled={a.step === 0} onClick={() => go(-1)}>
            ← 戻る
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go(1)}>
            {steps[a.step + 1]?.kind === 'summary' ? '終わる' : '次へ →'}
          </button>
        </nav>
      )}
    </div>
  );
}

function Summary({ a, onHome }: { a: ActiveSession; onHome: () => void }) {
  const { state } = useStore();
  const results = a.plan.sceneIds.map((id) => toResult(a.runs[id]));
  const correct = results.reduce((n, r) => n + r.compCorrect, 0);
  const total = results.reduce((n, r) => n + r.compTotal, 0);
  const saved = results.reduce((n, r) => n + r.savedPhrases, 0);
  const tomorrow = state.phrases.filter((p) => p.srs.due <= dayKey(new Date(Date.now() + 86400000))).length;
  return (
    <section>
      <div className="card">
        <p className="ok big">おつかれさまでした。</p>
        <ul className="plain">
          <li>練習時間: {fmt(a.activeSeconds)}</li>
          <li>場面: {results.map((r) => getScene(r.sceneId)?.titleJa).join('、')}</li>
          <li>
            理解チェック: {correct}/{total} 問（最初の回答）
          </li>
          {a.reviewed > 0 && <li>復習: {a.reviewed} 件</li>}
          {a.fluencyRounds > 0 && <li>繰り返し説明: {a.fluencyRounds} 回</li>}
          <li>保存した表現: {saved} 件（明日以降の復習へ）</li>
          <li>明日までに復習予定: {tomorrow} 件</li>
        </ul>
      </div>
      {results.map((r) => (
        <p key={r.sceneId} className="small">
          {getScene(r.sceneId)?.titleJa}: {levelAdvice(r).messageJa}
        </p>
      ))}
      <button type="button" className="btn btn-primary" onClick={onHome}>
        ホームへ
      </button>
    </section>
  );
}

import { useState } from 'react';
import type { Level, Scene } from '../../data/types';
import { useStore } from '../../lib/store';
import { SpeedControl, TextOnlyNotice, useSpeaker } from '../audio';
import { HelpSheet } from '../HelpSheet';
import type { MarkedLine } from './types';

type Sub = 'none' | 'en' | 'en_ja';

export function ListenStep({
  scene,
  level,
  onLevel,
  onHelp,
  marked,
  onToggleMark,
}: {
  scene: Scene;
  level: Level;
  onLevel: (l: Level) => void;
  onHelp: () => void;
  marked: MarkedLine[];
  onToggleMark: (m: MarkedLine) => void;
}) {
  const { state, update } = useStore();
  const sp = useSpeaker();
  const rate = state.settings.rate;
  // 音声が使えないときは英文を最初から表示（テキスト練習）
  const [sub, setSub] = useState<Sub>(sp.canSpeak ? state.settings.subtitles : state.settings.subtitles === 'none' ? 'en' : state.settings.subtitles);
  const [revealed, setRevealed] = useState<Record<number, Sub>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [glossOpen, setGlossOpen] = useState(true);
  const lines = scene.versions[level];

  const setRate = (r: number) => update((s) => ({ ...s, settings: { ...s.settings, rate: r } }));
  const lineSub = (i: number): Sub => {
    const r = revealed[i];
    if (!r) return sub;
    if (sub === 'en_ja' || r === 'en_ja') return 'en_ja';
    return sub === 'en' || r === 'en' ? 'en' : 'none';
  };
  const reveal = (i: number) =>
    setRevealed((m) => ({ ...m, [i]: lineSub(i) === 'none' ? 'en' : lineSub(i) === 'en' ? 'en_ja' : 'en_ja' }));
  const isMarked = (en: string) => marked.some((m) => m.en === en);

  return (
    <section>
      <p className="situation">{scene.situationJa}</p>
      <p className="small">
        <strong>目標:</strong> {scene.goalJa}
      </p>
      <TextOnlyNotice />

      <div className="card">
        <button type="button" className="linklike" aria-expanded={glossOpen} onClick={() => setGlossOpen((o) => !o)}>
          {glossOpen ? '▼' : '▶'} 先にキーワードを確認
        </button>
        {glossOpen && (
          <ul className="gloss">
            {scene.glossary.map((g) => (
              <li key={g.en}>
                <span lang="en">{g.en}</span> — {g.ja}
              </li>
            ))}
          </ul>
        )}
        <p className="small">
          <strong>聞きながら考えよう:</strong> {scene.questions[0].q}
        </p>
      </div>

      <div className="toolbar">
        <div className="seg" role="group" aria-label="難度">
          <button type="button" className={`chip ${level === 'a2' ? 'chip-on' : ''}`} aria-pressed={level === 'a2'} onClick={() => onLevel('a2')}>
            A2（短い文）
          </button>
          <button type="button" className={`chip ${level === 'plus' ? 'chip-on' : ''}`} aria-pressed={level === 'plus'} onClick={() => onLevel('plus')}>
            少し難しい版
          </button>
        </div>
        <div className="seg" role="group" aria-label="字幕">
          {(
            [
              ['none', '字幕なし'],
              ['en', '英文'],
              ['en_ja', '英文+訳'],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" className={`chip ${sub === k ? 'chip-on' : ''}`} aria-pressed={sub === k} onClick={() => { setSub(k); setRevealed({}); }}>
              {l}
            </button>
          ))}
        </div>
        {sp.canSpeak && <SpeedControl rate={rate} onChange={setRate} />}
      </div>

      {sp.canSpeak && (
        <div className="row">
          {!sp.busy ? (
            <button type="button" className="btn btn-primary" onClick={() => sp.playAll(lines.map((l) => ({ text: l.en, who: l.speaker })))}>
              ▶ 会話を全部聞く
            </button>
          ) : (
            <button type="button" className="btn" onClick={sp.stop}>
              ■ 止める
            </button>
          )}
        </div>
      )}
      {sp.error && <p className="error small">音声エラー: {sp.error}</p>}

      <ol className="dialogue">
        {lines.map((l, i) => {
          const ls = lineSub(i);
          const name = l.speaker === 'partner' ? scene.partnerName : scene.youName;
          return (
            <li key={`${level}-${i}`} className={`line line-${l.speaker} ${sp.speakingIndex === i ? 'line-now' : ''}`}>
              <div className="line-head">
                <span className="who">{name}</span>
                {sp.canSpeak && (
                  <button type="button" className="btn-icon" aria-label={`${i + 1}行目をもう一度聞く`} onClick={() => sp.play(l.en, l.speaker)}>
                    ↻
                  </button>
                )}
                {ls !== 'en_ja' && (
                  <button type="button" className="btn-small btn-ghost" onClick={() => reveal(i)}>
                    {ls === 'none' ? '英文' : '訳'}
                  </button>
                )}
                <button
                  type="button"
                  className={`btn-small ${isMarked(l.en) ? 'btn-marked' : 'btn-ghost'}`}
                  aria-pressed={isMarked(l.en)}
                  onClick={() => onToggleMark({ en: l.en, ja: l.ja })}
                  title="詰まった・覚えたい文として印を付ける"
                >
                  {isMarked(l.en) ? '★ 印あり' : '☆ 印'}
                </button>
              </div>
              {ls === 'none' ? (
                <p className="hidden-line" aria-label="英文は非表示">・・・</p>
              ) : (
                <p className="en" lang="en">
                  {l.en}
                </p>
              )}
              {ls === 'en_ja' && <p className="ja">{l.ja}</p>}
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        className="btn btn-help"
        onClick={() => {
          setHelpOpen(true);
          onHelp();
        }}
      >
        分からない…
      </button>
      <p className="small muted">☆ を付けた文は最後に復習用として保存できます。</p>

      <HelpSheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        level={level}
        rate={rate}
        glossary={scene.glossary}
        onSlower={() => setRate(Math.max(0.6, Math.round((rate - 0.1) * 10) / 10))}
        onShowEn={() => {
          setSub((s) => (s === 'none' ? 'en' : s));
          setHelpOpen(false);
        }}
        onShowJa={() => {
          setSub('en_ja');
          setHelpOpen(false);
        }}
        onEasier={() => {
          onLevel('a2');
          setHelpOpen(false);
        }}
      />
    </section>
  );
}

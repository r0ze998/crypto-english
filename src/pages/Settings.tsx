import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { useCaps } from '../lib/capabilities';
import { defaultState, type Settings } from '../lib/state';
import { buildBackup, mergeStates, parseBackup } from '../lib/backup';
import { clearRecordings, listRecordings, putRecording } from '../lib/recordingsDb';
import { cancelSpeech, speak } from '../lib/tts';
import { dayKey } from '../lib/date';
import { SpeedControl } from '../components/audio';
import { clearActive } from './Session';

export function SettingsPage() {
  const { state, update } = useStore();
  const caps = useCaps();
  const set = (patch: Partial<Settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const st = state.settings;

  const testVoice = (uri?: string) => {
    cancelSpeech();
    speak("Hi, I'm building an onchain game.", { rate: st.rate, voiceURI: uri }).catch(() => {});
  };

  return (
    <div>
      <h1>設定</h1>

      <section className="card">
        <h2>基本</h2>
        <label className="field">
          <span>名前（置き換え練習で使用）</span>
          <input type="text" value={st.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <div className="field">
          <span>最初の難度</span>
          <div className="seg">
            <button type="button" className={`chip ${st.level === 'a2' ? 'chip-on' : ''}`} onClick={() => set({ level: 'a2' })}>
              A2（短い文）
            </button>
            <button type="button" className={`chip ${st.level === 'plus' ? 'chip-on' : ''}`} onClick={() => set({ level: 'plus' })}>
              少し難しい版
            </button>
          </div>
        </div>
        <div className="field">
          <span>字幕の初期表示</span>
          <div className="seg">
            {(
              [
                ['none', '字幕なし'],
                ['en', '英文'],
                ['en_ja', '英文+訳'],
              ] as const
            ).map(([k, l]) => (
              <button key={k} type="button" className={`chip ${st.subtitles === k ? 'chip-on' : ''}`} onClick={() => set({ subtitles: k })}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>音声（読み上げ）</h2>
        <SpeechStatus />
        {caps.ttsApi && caps.voices.length > 0 && (
          <>
            <SpeedControl rate={st.rate} onChange={(r) => set({ rate: r })} />
            <VoiceSelect label="相手の声" value={caps.partnerVoice?.voiceURI ?? ''} onChange={(v) => set({ partnerVoiceURI: v })} onTest={testVoice} />
            <VoiceSelect label="お手本（自分側）の声" value={caps.youVoice?.voiceURI ?? ''} onChange={(v) => set({ voiceURI: v })} onTest={testVoice} />
          </>
        )}
        <label className="check">
          <input type="checkbox" checked={st.textOnly} onChange={(e) => set({ textOnly: e.target.checked })} />
          テキストのみで練習する（音声を使わない）
        </label>
      </section>

      <section className="card">
        <h2>音声認識（任意）</h2>
        <p className="small">
          追加質問への答えを、話した声から文字にする機能です。<strong>既定は無効</strong>です。発音の採点には使いません（文字起こしの結果は「どう聞き取られたか」の参考にとどまります）。
        </p>
        <p className="small warn">
          有効にすると、ブラウザによっては<strong>声が端末の外へ送信されます</strong>。Chrome（Android・PC）は通常 Google のサーバーで認識します。Safari（iPhone）は Apple のサーバーで処理される場合があります。録音機能（● 録音する）とは別で、録音データは送信しません。
        </p>
        {caps.sttApi ? (
          <label className="check">
            <input
              type="checkbox"
              checked={st.speechRecognition}
              onChange={(e) => {
                if (e.target.checked && !window.confirm('音声認識を有効にすると、使ったときに声が外部サーバーへ送られる可能性があります。有効にしますか？')) return;
                set({ speechRecognition: e.target.checked });
              }}
            />
            音声認識を使う（外部送信の可能性あり）
          </label>
        ) : (
          <p className="small muted">このブラウザは音声認識に対応していません。</p>
        )}
      </section>

      <AiSection />
      <DataSection />

      <p>
        <a href="#/about">学習方法・音声とプライバシーについて</a>
      </p>
    </div>
  );
}

function SpeechStatus() {
  const caps = useCaps();
  const local = caps.voices.filter((v) => v.localService).length;
  return (
    <ul className="plain small">
      <li>音声合成: {caps.ttsApi ? (caps.voices.length ? `対応（英語の声 ${caps.voices.length} 種、うち端末内 ${local}）` : caps.voicesLoaded ? '機能はあるが英語の声が見つかりません → テキスト練習' : '確認中…') : '非対応 → テキスト練習'}</li>
      <li>録音: {caps.recording.ok ? '対応（端末内に保存・送信なし）' : `使えません（${caps.recording.reasonJa}）`}</li>
      <li>音声認識: {caps.sttApi ? '対応（任意・既定は無効）' : '非対応'}</li>
    </ul>
  );
}

function VoiceSelect({ label, value, onChange, onTest }: { label: string; value: string; onChange: (v: string) => void; onTest: (v: string) => void }) {
  const caps = useCaps();
  const cur = caps.voices.find((v) => v.voiceURI === value);
  return (
    <div className="field">
      <span>{label}</span>
      <div className="row">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {caps.voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang}) {v.localService ? '［端末内］' : '［ネットワーク］'}
            </option>
          ))}
        </select>
        <button type="button" className="btn-small" onClick={() => onTest(value)}>
          試聴
        </button>
      </div>
      {cur && !cur.localService && <p className="small warn">この声はネットワーク経由の音声です。読み上げる英文がブラウザ提供元のサーバーへ送られる可能性があります。</p>}
    </div>
  );
}

function AiSection() {
  const { state, update } = useStore();
  const ai = state.settings.ai;
  const set = (patch: Partial<typeof ai>) => update((s) => ({ ...s, settings: { ...s.settings, ai: { ...s.settings.ai, ...patch } } }));
  return (
    <section className="card">
      <h2>AI 会話（拡張・任意）</h2>
      <p className="small">
        既定は<strong>接続なし</strong>です。接続なしでも、教材・復習・録音比較はすべて使えます。練習中の追加質問は「教材の固定質問」と表示し、AI の応答とは区別します。
      </p>
      <p className="small muted">
        API キーの入力欄はありません（キーをブラウザに置かないため）。使えるのは、キーなしで呼べる OpenAI 互換のエンドポイントだけです。例: 自分の PC で動かす Ollama（http://localhost:11434/v1、OLLAMA_ORIGINS の設定が必要）や、キーをサーバー側で持つ自前のプロキシ。送信されるのは入力した答えのテキストと確認済みの資料だけで、録音は送りません。
      </p>
      <div className="seg">
        <button type="button" className={`chip ${ai.provider === 'none' ? 'chip-on' : ''}`} onClick={() => set({ provider: 'none' })}>
          接続なし
        </button>
        <button type="button" className={`chip ${ai.provider === 'openai-compatible' ? 'chip-on' : ''}`} onClick={() => set({ provider: 'openai-compatible' })}>
          OpenAI 互換（キーなし）
        </button>
      </div>
      {ai.provider === 'openai-compatible' && (
        <>
          <label className="field">
            <span>Base URL</span>
            <input type="url" value={ai.baseUrl} placeholder="http://localhost:11434/v1" onChange={(e) => set({ baseUrl: e.target.value })} />
          </label>
          <label className="field">
            <span>モデル名</span>
            <input type="text" value={ai.model} placeholder="llama3.1" onChange={(e) => set({ model: e.target.value })} />
          </label>
        </>
      )}
    </section>
  );
}

function DataSection() {
  const { state, replace } = useStore();
  const [withRec, setWithRec] = useState(false);
  const [msg, setMsg] = useState<string>();
  const [err, setErr] = useState<string>();
  const [usage, setUsage] = useState<string>();
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [recCount, setRecCount] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => {
      if (e.usage !== undefined) setUsage(`${(e.usage / 1024 / 1024).toFixed(1)} MB 使用`);
    });
    navigator.storage?.persisted?.().then(setPersisted);
    listRecordings()
      .then((r) => setRecCount(r.length))
      .catch(() => setRecCount(null));
  }, [msg]);

  const exportFile = async () => {
    setErr(undefined);
    try {
      const recs = withRec ? await listRecordings() : undefined;
      const backup = await buildBackup(state, recs);
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `crypto-english-backup-${dayKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      setMsg(`エクスポートしました（表現 ${state.phrases.length} 件・記録 ${state.sessions.length} 件${recs ? `・録音 ${recs.length} 件` : ''}）`);
    } catch (e) {
      setErr(`エクスポートに失敗しました: ${(e as Error).message}`);
    }
  };

  const importFile = async (file: File, mode: 'merge' | 'replace') => {
    setErr(undefined);
    setMsg(undefined);
    try {
      const parsed = parseBackup(await file.text());
      if (mode === 'replace') {
        if (!window.confirm('今のデータをすべてファイルの内容で置き換えます。よろしいですか？')) return;
        replace(parsed.state);
        if (parsed.recordings.length) {
          await clearRecordings();
          for (const r of parsed.recordings) await putRecording(r);
        }
        setMsg(`置き換えました（表現 ${parsed.state.phrases.length} 件・記録 ${parsed.state.sessions.length} 件・録音 ${parsed.recordings.length} 件）`);
      } else {
        const { state: merged, report } = mergeStates(state, parsed.state);
        replace(merged);
        for (const r of parsed.recordings) await putRecording(r);
        setMsg(
          `取り込みました: 表現 +${report.phrasesAdded}（更新 ${report.phrasesUpdated}）・記録 +${report.sessionsAdded}・ピッチ原文 +${report.pitchAdded}・言い換え +${report.paraphrasesAdded}・資料 ${report.projectFilled} 項目・録音 ${parsed.recordings.length} 件` +
            (report.pitchConflicts ? `。※ 同じ ID で内容が違うピッチ原文が ${report.pitchConflicts} 件あり、既存の原文を保持しました` : ''),
        );
      }
    } catch (e) {
      setErr(`インポートできませんでした: ${(e as Error).message}`);
    }
  };

  const [mode, setMode] = useState<'merge' | 'replace'>('merge');

  return (
    <section className="card">
      <h2>データ（この端末に保存）</h2>
      <p className="small">
        練習データはこのブラウザの中（localStorage）に、録音は IndexedDB に保存されます。サーバーには送りません。ブラウザのデータ削除や、iPhone で長期間開かない場合に消えることがあるため、ときどきエクスポートしてください。
      </p>
      <p className="small muted">
        {usage ?? ''} {recCount !== null && `・ 録音 ${recCount} 件`} {persisted !== null && `・ 永続保存: ${persisted ? '許可済み' : '未許可'}`}
      </p>
      {persisted === false && navigator.storage?.persist && (
        <button
          type="button"
          className="btn-small"
          onClick={() => navigator.storage.persist().then((p) => setMsg(p ? '永続保存が許可されました' : 'ブラウザが永続保存を許可しませんでした'))}
        >
          データを消えにくくする（永続保存をリクエスト）
        </button>
      )}

      <h3>エクスポート</h3>
      <label className="check">
        <input type="checkbox" checked={withRec} onChange={(e) => setWithRec(e.target.checked)} />
        録音も含める（ファイルが大きくなります）
      </label>
      <button type="button" className="btn" onClick={exportFile}>
        バックアップをダウンロード
      </button>

      <h3>インポート</h3>
      <div className="seg">
        <button type="button" className={`chip ${mode === 'merge' ? 'chip-on' : ''}`} onClick={() => setMode('merge')}>
          今のデータに追加
        </button>
        <button type="button" className={`chip ${mode === 'replace' ? 'chip-on' : ''}`} onClick={() => setMode('replace')}>
          すべて置き換え
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        aria-label="バックアップファイルを選択"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importFile(f, mode);
          e.target.value = '';
        }}
      />
      {msg && (
        <p className="ok small" role="status">
          {msg}
        </p>
      )}
      {err && (
        <p className="error small" role="alert">
          {err}
        </p>
      )}

      <h3>削除</h3>
      <button
        type="button"
        className="btn btn-ghost danger"
        onClick={async () => {
          if (window.prompt('すべての練習データと録音を削除します。確認のため「削除」と入力してください。') !== '削除') return;
          replace(defaultState());
          clearActive();
          await clearRecordings().catch(() => {});
          setMsg('すべて削除しました');
        }}
      >
        すべてのデータを削除
      </button>
    </section>
  );
}

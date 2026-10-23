import { useCallback, useEffect, useState } from 'react';
import { useCaps } from '../lib/capabilities';
import { useStore } from '../lib/store';
import { cancelSpeech, speak, speakSequence } from '../lib/tts';

export type Who = 'partner' | 'you';

/** 読み上げの共通フック。rate は設定値（場面ごとに一時変更可） */
export function useSpeaker() {
  const caps = useCaps();
  const { state } = useStore();
  const [speakingIndex, setSpeakingIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => () => cancelSpeech(), []);

  const voiceFor = useCallback(
    (who: Who) => (who === 'partner' ? caps.partnerVoice?.voiceURI : caps.youVoice?.voiceURI),
    [caps.partnerVoice, caps.youVoice],
  );

  const play = useCallback(
    async (text: string, who: Who = 'partner', rate = state.settings.rate) => {
      if (!caps.canSpeak) return;
      cancelSpeech();
      setError(undefined);
      setBusy(true);
      try {
        await speak(text, { rate, voiceURI: voiceFor(who) });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [caps.canSpeak, state.settings.rate, voiceFor],
  );

  const playAll = useCallback(
    async (items: { text: string; who: Who }[], rate = state.settings.rate) => {
      if (!caps.canSpeak) return;
      setError(undefined);
      setBusy(true);
      try {
        await speakSequence(
          items.map((i) => ({ text: i.text, voiceURI: voiceFor(i.who) })),
          { rate, gapMs: 500, onIndex: setSpeakingIndex },
        );
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
        setSpeakingIndex(-1);
      }
    },
    [caps.canSpeak, state.settings.rate, voiceFor],
  );

  const stop = useCallback(() => {
    cancelSpeech();
    setBusy(false);
    setSpeakingIndex(-1);
  }, []);

  return { canSpeak: caps.canSpeak, play, playAll, stop, speakingIndex, busy, error };
}

export function PlayButton({
  text,
  who = 'partner',
  rate,
  label = '▶',
  small,
  title,
}: {
  text: string;
  who?: Who;
  rate?: number;
  label?: string;
  small?: boolean;
  title?: string;
}) {
  const sp = useSpeaker();
  if (!sp.canSpeak) return null;
  return (
    <button
      type="button"
      className={small ? 'btn-icon' : 'btn'}
      aria-label={title ?? `再生: ${text}`}
      title={title ?? '再生'}
      onClick={() => sp.play(text, who, rate)}
    >
      {label}
    </button>
  );
}

export function SpeedControl({ rate, onChange }: { rate: number; onChange: (r: number) => void }) {
  const steps = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1];
  return (
    <div className="speed" role="group" aria-label="再生速度">
      <span className="muted small">速度</span>
      {steps.map((s) => (
        <button
          key={s}
          type="button"
          className={`chip ${Math.abs(rate - s) < 0.001 ? 'chip-on' : ''}`}
          aria-pressed={Math.abs(rate - s) < 0.001}
          onClick={() => onChange(s)}
        >
          {s.toFixed(1)}
        </button>
      ))}
    </div>
  );
}

export function TextOnlyNotice() {
  const caps = useCaps();
  if (caps.canSpeak) return null;
  let why = 'この環境では英語の音声合成が使えません。';
  if (caps.ttsApi && !caps.voicesLoaded) why = '音声を準備中です…';
  else if (!caps.ttsApi) why = 'このブラウザには音声合成機能がありません。';
  else if (caps.voices.length > 0) why = 'テキストのみモードです（設定で切り替え）。';
  return (
    <div className="notice" role="status">
      <strong>テキストで練習</strong> {why} 英文を声に出して読む・自分で書いて答える形で、同じ流れを最後まで進められます。
    </div>
  );
}

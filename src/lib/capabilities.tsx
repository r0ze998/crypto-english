import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { chooseDefaultVoice, isTtsSupported, loadEnglishVoices, type VoiceInfo } from './tts';
import { recordingSupport } from './recorder';
import { recognitionCtor } from './stt';
import { useStore } from './store';

export interface Capabilities {
  ttsApi: boolean;
  voicesLoaded: boolean;
  voices: VoiceInfo[];
  /** 英語の声が1つ以上あり、テキストのみモードでない */
  canSpeak: boolean;
  recording: { ok: boolean; reasonJa?: string };
  sttApi: boolean;
  /** 実際に使う声 */
  youVoice?: VoiceInfo;
  partnerVoice?: VoiceInfo;
}

const Ctx = createContext<Capabilities | null>(null);

export function CapabilitiesProvider({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadEnglishVoices().then((v) => {
      if (!alive) return;
      setVoices(v);
      setLoaded(true);
    });
    // 後から声が増えるブラウザ（Chrome など）に対応
    const onChange = () => loadEnglishVoices(0).then((v) => alive && setVoices(v));
    if (isTtsSupported()) speechSynthesis.addEventListener('voiceschanged', onChange);
    return () => {
      alive = false;
      if (isTtsSupported()) speechSynthesis.removeEventListener('voiceschanged', onChange);
    };
  }, []);

  const value = useMemo<Capabilities>(() => {
    const byUri = (u: string) => voices.find((v) => v.voiceURI === u);
    const partnerVoice = byUri(state.settings.partnerVoiceURI) ?? chooseDefaultVoice(voices);
    const youVoice = byUri(state.settings.voiceURI) ?? chooseDefaultVoice(voices, partnerVoice?.voiceURI) ?? partnerVoice;
    return {
      ttsApi: isTtsSupported(),
      voicesLoaded: loaded,
      voices,
      canSpeak: isTtsSupported() && voices.length > 0 && !state.settings.textOnly,
      recording: recordingSupport(),
      sttApi: !!recognitionCtor(),
      youVoice,
      partnerVoice,
    };
  }, [voices, loaded, state.settings.partnerVoiceURI, state.settings.voiceURI, state.settings.textOnly]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCaps(): Capabilities {
  const v = useContext(Ctx);
  if (!v) throw new Error('CapabilitiesProvider がありません');
  return v;
}

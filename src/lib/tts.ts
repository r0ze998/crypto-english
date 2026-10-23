// 音声合成（ブラウザの Web Speech API: speechSynthesis）。
// 声は端末・ブラウザごとに違う。voice.localService === false の声は
// 読み上げる英文がブラウザ提供元のサーバーへ送られる可能性がある。

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export interface VoiceInfo {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

function toInfo(v: SpeechSynthesisVoice): VoiceInfo {
  return { voiceURI: v.voiceURI, name: v.name, lang: v.lang, localService: v.localService, default: v.default };
}

/** 英語の声を取得。声の一覧は非同期に読み込まれるブラウザがあるので少し待つ */
export function loadEnglishVoices(timeoutMs = 2000): Promise<VoiceInfo[]> {
  if (!isTtsSupported()) return Promise.resolve([]);
  const pick = () =>
    speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith('en'))
      .map(toInfo);
  const now = pick();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(pick());
    };
    speechSynthesis.addEventListener('voiceschanged', finish);
    setTimeout(finish, timeoutMs);
  });
}

/** 既定の声: 端末内（localService）の en-US を優先 */
export function chooseDefaultVoice(voices: VoiceInfo[], avoid?: string): VoiceInfo | undefined {
  const score = (v: VoiceInfo) =>
    (v.localService ? 4 : 0) + (v.lang.toLowerCase() === 'en-us' ? 2 : 0) + (v.default ? 1 : 0) + (v.voiceURI === avoid ? -10 : 0);
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

function findVoice(uri: string): SpeechSynthesisVoice | undefined {
  if (!uri) return undefined;
  return speechSynthesis.getVoices().find((v) => v.voiceURI === uri);
}

// Chrome では参照が切れた utterance の onend が呼ばれないことがあるため保持する
const live = new Set<SpeechSynthesisUtterance>();
let generation = 0;

export function cancelSpeech(): void {
  generation++;
  if (isTtsSupported()) speechSynthesis.cancel();
  live.clear();
}

export function speak(text: string, opts: { rate: number; voiceURI?: string }): Promise<void> {
  if (!isTtsSupported()) return Promise.reject(new Error('音声合成が使えません'));
  return new Promise((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = findVoice(opts.voiceURI ?? '');
    if (v) u.voice = v;
    u.lang = v?.lang ?? 'en-US';
    u.rate = opts.rate;
    live.add(u);
    const cleanup = () => live.delete(u);
    u.onend = () => {
      cleanup();
      resolve();
    };
    u.onerror = (e) => {
      cleanup();
      // cancel による中断はエラー扱いにしない
      if (e.error === 'canceled' || e.error === 'interrupted') resolve();
      else reject(new Error(e.error || '読み上げエラー'));
    };
    speechSynthesis.speak(u);
  });
}

/**
 * 複数の文を順番に読む。onIndex で今読んでいる行を通知。
 * 途中で cancelSpeech() されたら止まる。
 */
export async function speakSequence(
  items: { text: string; voiceURI?: string }[],
  opts: { rate: number; gapMs?: number; onIndex?: (i: number) => void },
): Promise<void> {
  const gen = ++generation;
  speechSynthesis.cancel();
  for (let i = 0; i < items.length; i++) {
    if (gen !== generation) return;
    opts.onIndex?.(i);
    await speak(items[i].text, { rate: opts.rate, voiceURI: items[i].voiceURI });
    if (gen !== generation) return;
    if (opts.gapMs && i < items.length - 1) await new Promise((r) => setTimeout(r, opts.gapMs));
  }
  if (gen === generation) opts.onIndex?.(-1);
}

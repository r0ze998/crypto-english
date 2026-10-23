// 音声認識（任意・既定は無効）。
// Chrome の Web Speech API は通常、音声を Google のサーバーへ送って認識する。
// Safari は Apple のサーバーで処理される場合がある（Siri/音声入力の設定に依存）。
// 結果は「何と認識されたか」の参考表示だけに使い、発音の採点には使わない。

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  processLocally?: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type Ctor = new () => RecognitionLike;

export function recognitionCtor(): Ctor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export interface RecognitionHandle {
  result: Promise<string>;
  stop(): void;
}

export function recognizeOnce(): RecognitionHandle {
  const C = recognitionCtor();
  if (!C) return { result: Promise.reject(new Error('このブラウザは音声認識に対応していません')), stop: () => {} };
  const r = new C();
  r.lang = 'en-US';
  r.interimResults = false;
  r.maxAlternatives = 1;
  r.continuous = false;
  let text = '';
  const result = new Promise<string>((resolve, reject) => {
    r.onresult = (e) => {
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i++) parts.push(e.results[i][0].transcript);
      text = parts.join(' ');
    };
    r.onerror = (e) => reject(new Error(e.error === 'not-allowed' ? 'マイクの許可がありません' : `音声認識エラー: ${e.error}`));
    r.onend = () => resolve(text);
  });
  r.start();
  return { result, stop: () => r.stop() };
}

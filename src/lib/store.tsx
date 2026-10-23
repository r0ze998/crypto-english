import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { defaultState, normalizeState, type AppState } from './state';

export const STORAGE_KEY = 'crypto-english:v1';

interface LoadResult {
  state: AppState;
  warning?: string;
}

function load(): LoadResult {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: defaultState(), warning: 'この環境ではブラウザ保存（localStorage）が使えません。練習内容は保存されません。' };
  }
  if (!raw) return { state: defaultState() };
  try {
    return { state: normalizeState(JSON.parse(raw)) };
  } catch (e) {
    // 壊れたデータは消さずに別キーへ退避する
    try {
      localStorage.setItem(`${STORAGE_KEY}:broken:${Date.now()}`, raw);
    } catch {
      /* 退避できなくても続行 */
    }
    return { state: defaultState(), warning: `保存データを読み込めませんでした（${(e as Error).message}）。元のデータは別名で退避しました。` };
  }
}

interface StoreValue {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
  warning?: string;
  saveError?: string;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef<LoadResult | null>(null);
  if (!initial.current) initial.current = load();
  const [state, setState] = useState<AppState>(initial.current.state);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError(undefined);
    } catch (e) {
      setSaveError(`保存に失敗しました: ${(e as Error).message}`);
    }
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((s) => fn(s)), []);
  const replace = useCallback((s: AppState) => setState(s), []);

  const value = useMemo(
    () => ({ state, update, replace, warning: initial.current?.warning, saveError }),
    [state, update, replace, saveError],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider がありません');
  return v;
}

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

// window.confirm / prompt はアプリ内表示（埋め込み表示など）で使えない環境があるため、画面内の確認ダイアログを使う。

export interface ConfirmOptions {
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  /** 入力が必要な確認（例: 「削除」と入力） */
  requireText?: string;
}

type Ask = (o: ConfirmOptions) => Promise<boolean>;

const Ctx = createContext<Ask | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const [typed, setTyped] = useState('');
  const okRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = useCallback<Ask>(
    (o) =>
      new Promise((resolve) => {
        setTyped('');
        setReq({ ...o, resolve });
      }),
    [],
  );

  useEffect(() => {
    if (!req) return;
    (req.requireText ? inputRef.current : okRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [req]);

  const close = (v: boolean) => {
    req?.resolve(v);
    setReq(null);
  };

  const canOk = !req?.requireText || typed.trim() === req.requireText;

  return (
    <Ctx.Provider value={ask}>
      {children}
      {req && (
        <div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="confirm-msg">
          <div className="sheet-body">
            <p id="confirm-msg">{req.message}</p>
            {req.requireText && (
              <label className="field">
                <span className="small">確認のため「{req.requireText}」と入力してください</span>
                <input id="confirm-input" ref={inputRef} type="text" value={typed} onChange={(e) => setTyped(e.target.value)} />
              </label>
            )}
            <div className="row">
              <button ref={okRef} type="button" className={`btn btn-primary ${req.danger ? 'btn-danger' : ''}`} disabled={!canOk} onClick={() => close(true)}>
                {req.confirmLabel ?? 'OK'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => close(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useConfirm(): Ask {
  const v = useContext(Ctx);
  if (!v) throw new Error('ConfirmProvider がありません');
  return v;
}

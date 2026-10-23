import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './lib/store';
import { CapabilitiesProvider } from './lib/capabilities';
import { ConfirmProvider } from './components/Confirm';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <CapabilitiesProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </CapabilitiesProvider>
    </StoreProvider>
  </StrictMode>,
);

// オフラインで使えるように Service Worker を登録（本番ビルドのみ）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

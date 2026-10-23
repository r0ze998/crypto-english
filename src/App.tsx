import { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import { HomePage } from './pages/Home';
import { clearActive, loadActive, newActiveSession, SessionPage } from './pages/Session';
import { ReviewPage } from './pages/Review';
import { PhrasesPage } from './pages/Phrases';
import { ProjectPage } from './pages/Project';
import { LogPage } from './pages/Log';
import { SettingsPage } from './pages/Settings';
import { AboutPage } from './pages/About';
import type { ActiveSession } from './components/steps/types';
import { dueItems } from './lib/session';

function useHashRoute(): string {
  const get = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const on = () => {
      setRoute(get());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

const NAV = [
  ['/', 'ホーム'],
  ['/review', '復習'],
  ['/phrases', '表現'],
  ['/project', '資料'],
  ['/settings', '設定'],
] as const;

export function App() {
  const route = useHashRoute();
  const { state, warning, saveError } = useStore();
  const [active, setActive] = useState<ActiveSession | null>(() => loadActive());
  const due = dueItems(state).length;

  const goto = (r: string) => {
    window.location.hash = r;
  };

  if (route === '/session' && active) {
    return (
      <main className="wrap">
        <SessionPage
          key={active.id}
          initial={active}
          onExit={() => {
            setActive(null);
            goto('/');
          }}
        />
      </main>
    );
  }

  let page;
  switch (route) {
    case '/review':
      page = <ReviewPage />;
      break;
    case '/phrases':
      page = <PhrasesPage />;
      break;
    case '/project':
      page = <ProjectPage />;
      break;
    case '/log':
      page = <LogPage />;
      break;
    case '/settings':
      page = <SettingsPage />;
      break;
    case '/about':
      page = <AboutPage />;
      break;
    default:
      page = (
        <HomePage
          active={active}
          onStart={(plan) => {
            const a = newActiveSession(plan, state);
            setActive(a);
            goto('/session');
          }}
          onResume={() => {
            setActive(loadActive() ?? active);
            goto('/session');
          }}
          onDiscard={() => {
            clearActive();
            setActive(null);
          }}
        />
      );
  }

  return (
    <>
      <main className="wrap with-nav">
        {warning && <p className="notice">{warning}</p>}
        {saveError && <p className="error">{saveError}</p>}
        {page}
      </main>
      <nav className="tabbar" aria-label="メイン">
        {NAV.map(([r, l]) => (
          <a key={r} href={`#${r}`} className={route === r || (r === '/' && route === '/session') ? 'tab tab-on' : 'tab'} aria-current={route === r ? 'page' : undefined}>
            {l}
            {r === '/review' && due > 0 && <span className="tab-badge">{due}</span>}
          </a>
        ))}
      </nav>
    </>
  );
}

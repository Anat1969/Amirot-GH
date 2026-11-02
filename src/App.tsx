import { lazy, Suspense, useEffect } from 'react';
import { useRoute } from './route';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import Daf from './pages/Daf';
import Mirror from './pages/Mirror';
import Trends from './pages/Trends';
const Atlas = lazy(() => import('./pages/Atlas'));
const Article = lazy(() => import('./pages/Article'));

const TITLES: Record<string, string> = { home: 'אמירות', daf: 'הדף', mirror: 'מראה', atlas: 'אטלס', trends: 'מגמות', article: 'כתבה' };

export default function App() {
  const { page, params } = useRoute();
  useEffect(() => { document.title = page === 'home' ? 'אמירות · מה שכל תרבות אומרת, ואת ההפך' : `${TITLES[page] || 'אמירות'} · אמירות`; }, [page]);
  const body = (() => {
    switch (page) {
      case 'daf': return <Daf params={params} />;
      case 'mirror': return <Mirror params={params} />;
      case 'atlas': return <Atlas params={params} />;
      case 'trends': return <Trends />;
      case 'article': return <Article />;
      default: return <Home />;
    }
  })();
  return (
    <div className={`app-shell page-${page}`}>
      <TopBar page={page in TITLES ? page : 'home'} />
      <Suspense fallback={<main className="app-main"><p className="label">טוען…</p></main>}>{body}</Suspense>
    </div>
  );
}

import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './pages.css';
createRoot(document.getElementById('root')!).render(<App />);
// service worker רק כשהבסיס הוא השורש (לא בקישור raw.githack)
if ('serviceWorker' in navigator && location.pathname === '/' && !location.hostname.includes('localhost')) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

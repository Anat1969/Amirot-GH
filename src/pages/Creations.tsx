// יצירות ככתבות: כל חדר יצירות הפך לכתבה בעמוד A4 אחד, וכל הכתבות מוצגות כאן, מקובצות לפי ידע, הבנה ויישום.
// הלוח הוא אותו לוח של "תצוגת הלוח" (Print.tsx), ולכן מה שרואים כאן הוא בדיוק מה שמודפס ומורד כ-PDF.
// public/creations.json ממשיך להזין את חדרי התערוכה ב-TAARUCHA: מזהה החדר זהה למזהה הכתבה.
import { useEffect, useRef, useState } from 'react';
import { ARTICLES, ZONES } from '../data/articles';
import { href } from '../route';
import { Sheet, pdfName } from './Print';

const TAARUCHA = 'https://taarucha.vercel.app';
const JSON_URL = 'https://amirot-gh.vercel.app/creations.json';
const ZONE_LINE: Record<string, string> = {
  'ידע': 'מה נאמר, איפה ומתי.',
  'הבנה': 'מה מתגלה כשמניחים את האמירות זו ליד זו.',
  'יישום': 'מתי כל צד נכון, ומה עושים עם זה.',
};

export default function Creations() {
  // חדר שכבר הועלה לתערוכה מקבל כפתור כניסה. המידע נשמר ב-creations.json, ונקרא בזמן ריצה
  const [rooms, setRooms] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    fetch('./creations.json').then((r) => r.json()).then((d: { topics: { id: string; room?: string }[] }) => setRooms(Object.fromEntries(d.topics.map((t) => [t.id, t.room])))).catch(() => {});
  }, []);
  // הלוח נשאר בגודל A4 אמיתי, ובמסך צר הוא מוקטן כולו (zoom), כדי שהעימוד לא ישתנה
  const main = useRef<HTMLElement>(null);
  const [z, setZ] = useState(1);
  useEffect(() => {
    const el = main.current; if (!el) return;
    const ro = new ResizeObserver(() => setZ(Math.min(1, (el.clientWidth - 24) / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // גוללים רק את אזור התוכן. scrollIntoView היה גולל גם את מעטפת האפליקציה ומסתיר את הסרגל
  const jump = (id: string) => {
    const el = main.current, t = document.getElementById(id); if (!el || !t) return;
    const top = t.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 12;
    if (el.scrollHeight > el.clientHeight) el.scrollTo({ top, behavior: 'smooth' }); else window.scrollBy({ top: t.getBoundingClientRect().top - 12, behavior: 'smooth' });
  };
  return (
    <main ref={main} className="app-main creations-a4" dir="rtl" style={{ ['--z' as string]: z }}>
      <header className="ca-head">
        <span className="label">יצירות · <bdi className="num">{ARTICLES.length}</bdi> כתבות · כל כתבה עמוד A4 אחד</span>
        <h1>מה האמירות יוצרות</h1>
        <p>כל כתבה מוכנה להדפסה, לתלייה ולחדר בתערוכה.</p>
        <nav className="ca-zones" aria-label="קפיצה לשלב">
          {ZONES.map((z) => <a key={z} className="press btn" href={`#ca-${z}`} onClick={(e) => { e.preventDefault(); jump(`ca-${z}`); }}>{z}</a>)}
        </nav>
      </header>
      {ZONES.map((z) => (
        <section key={z} id={`ca-${z}`} className="ca-zone" aria-label={z}>
          <h2 className="ca-zone-h"><b>{z}</b><span>{ZONE_LINE[z]}</span></h2>
          {ARTICLES.map((a, i) => a.zone === z && (
            <div key={a.id} className="ca-item" id={`ca-a-${a.id}`}>
              <div className="ca-acts">
                <a className="press btn primary" href={`./print/${a.id}.pdf`} download={pdfName(a)}>הורדת PDF</a>
                <a className="press btn" href={href('article', { a: a.id })}>לכתבה בדף</a>
                <a className="press btn" href={`${TAARUCHA}/studio/import?src=${encodeURIComponent(JSON_URL)}&topic=${encodeURIComponent(a.id)}`} target="_blank" rel="noopener">העלאה לחדר בתערוכה</a>
                {rooms[a.id] && <a className="press btn" href={`${TAARUCHA}/e/${rooms[a.id]}`} target="_blank" rel="noopener">כניסה לחדר</a>}
              </div>
              <div className="ca-sheet"><Sheet a={a} n={i + 1} /></div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}

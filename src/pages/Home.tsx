// דף הבית: דף כהה של השראה. המטרה, הסרטון ושש התובנות שהמאגר חשף.
// כל המספרים מחושבים מהמאגר בזמן ריצה, כדי שהדף יישאר נכון כשהמאגר גדל.
import { useMemo, useRef, useState } from 'react';
import { IDEAS, SAYINGS, PAIRS, WORLD_ORDER, worldStats, stats, fmt } from '../engine';
import { ARTICLES } from '../data/articles';
import { href } from '../route';
import Rich from '../Rich';

// הסרטון הנוכחי שקט, עם כתוביות. כשתעלה הגרסה עם הקול של אברי (tools/video/make.cjs), מחליפים ל-true.
const VOICED = false;

type Insight = { tone: 'a' | 'b' | 's' | 'imp'; big: string; unit: string; line: string; go: string; to: [string, Record<string, string>?] };

export default function Home() {
  const st = useMemo(stats, []);
  const ws = useMemo(() => Object.fromEntries(WORLD_ORDER.map((w) => [w, worldStats(w)])), []);
  const both = (w: string) => `${ws[w].both.length}/${Object.keys(ws[w].ideas).length}`;
  const oral = (w: string) => { const ss = ws[w].ss; return Math.round((ss.filter((x) => x.year == null).length / Math.max(1, ss.length)) * 100); };
  const imp = PAIRS.filter((p) => p.kind === 'impostor' && p.a.culture !== p.b.culture).length; // כמו ברירת המחדל במראה: בין תרבויות
  const calm = ['japan', 'nordic'].filter((w) => ws[w].both.length === 0).length;

  // שש תובנות. הצבע הוא המשמעות של דף הגמרא: כחול צד א, אדום צד ב, ירוק הכרעה, ענבר אזהרה.
  const INSIGHTS: Insight[] = [
    { tone: 's', big: both('jewish'), unit: 'מחלוקות', line: 'היהדות אומרת את **שני הצדדים**. ==סתירה היא לא באג, היא שיטה==.', go: 'גם וגם', to: ['article', { a: 'both' }] },
    { tone: 'a', big: calm === 2 ? '0' : '—', unit: 'סתירות', line: 'יפן והצפון: **אף סתירה פנימית אחת**. ==תרבויות של דרך אחת==.', go: 'דיוקן יפן', to: ['trends', { w: 'japan' }] },
    { tone: 'imp', big: fmt(imp), unit: 'מתחזים', line: '**אותן מילים, משמעות אחרת**, בין תרבויות. ==מי שמתרגם מילה במילה, מתרגם לא נכון==.', go: 'מראה', to: ['mirror', { k: 'impostor' }] },
    { tone: 'b', big: '2·10·100', unit: 'ציפורים', line: 'כמה שווה ציפור ביד? ברוסית: **עגור בשמיים**. ==יש שמתמחרים ודאות בכמות, ויש בחלום==.', go: 'מחיר הוודאות', to: ['article', { a: 'certainty' }] },
    { tone: 'a', big: `${oral('japan')}%`, unit: 'בעל פה', line: `ביפן פתגם עממי, ביהדות רק **${oral('jewish')}%**. ==ספר שומר את הדעה שנדחתה, הרחוב שוכח אותה==.`, go: 'כתוב מול בעל פה', to: ['article', { a: 'oral' }] },
    { tone: 's', big: '"אל"', unit: 'מילה אחת', line: 'כלל הזהב בתשע תרבויות, בשתי משפחות. ==**"אל תעשה"** היא רצפה, **"עשה"** היא תקרה==.', go: 'כלל הזהב', to: ['article', { a: 'not' }] },
  ];

  const ENTRIES = [
    { id: 'daf', he: 'הדף', n: IDEAS.length, unit: 'מחלוקות' },
    { id: 'mirror', he: 'מראה', n: PAIRS.length, unit: 'זוגות' },
    { id: 'atlas', he: 'אטלס', n: st.cultures.length, unit: 'תרבויות' },
    { id: 'trends', he: 'תובנות', n: WORLD_ORDER.length, unit: 'עולמות' },
    { id: 'article', he: 'כתבות', n: ARTICLES.length, unit: 'גילויים' },
  ];

  const vid = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const sound = () => { const v = vid.current; if (!v) return; v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play(); } setMuted(v.muted); };

  return (
    <main className="app-main home-dark" dir="rtl">
      <section className="hx-purpose">
        <span className="hx-kicker">אטלס של פתגמים וציטוטים · <bdi className="num">{SAYINGS.length}</bdi> אמירות · <bdi className="num">{st.cultures.length}</bdi> תרבויות</span>
        <h1 className="home-h1">כל תרבות אומרת משהו.<br /><span className="hx-b">ואת ההפך.</span></h1>
        <p className="hx-lead">"החיפזון מן השטן", וגם "הכה בברזל בעודו חם".<br />שתי אמיתות, ואין הוראות שימוש.</p>
        <div className="hx-goal">
          <span className="hx-goal-k">המטרה</span>
          <p><strong>לא לבחור צד.</strong><br /><mark>לדעת מתי כל צד נכון.</mark></p>
          <span className="hx-goal-s">לכל מחלוקת כלל הכרעה, ולכל אמירה מקור.</span>
        </div>
        <nav className="hx-entries" aria-label="מפת האפליקציה">
          {ENTRIES.map((e) => (
            <a key={e.id} href={href(e.id)} className="hx-entry">
              <b>{e.he}</b><span><bdi className="num">{fmt(e.n)}</bdi> {e.unit}</span>
            </a>
          ))}
        </nav>
      </section>

      <section className="hx-film" aria-label="סרטון: סיור באפליקציה">
        <div className="hx-frame">
          <video ref={vid} src="./video/amirot.mp4" poster="./video/amirot.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="סיור באפליקציה בדקה וחצי" />
        </div>
        <div className="hx-film-bar">
          <span className="hx-film-t">סיור של דקה וחצי: <b>מהדף, דרך המראה והאטלס, אל הגילויים</b></span>
          {VOICED && <button className="hx-btn" onClick={sound} aria-pressed={!muted}>{muted ? 'צפייה עם קול' : 'השתקה'}</button>}
        </div>
      </section>

      <section className="hx-insights" aria-label="שש תובנות מתוך המאגר">
        {INSIGHTS.map((x, i) => (
          <a key={i} href={href(x.to[0], x.to[1])} className={`hx-card t-${x.tone}`} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
            <span className="hx-big"><bdi>{x.big}</bdi> <small>{x.unit}</small></span>
            <Rich as="p" className="hx-line">{x.line}</Rich>
            <span className="hx-go">{x.go} ←</span>
          </a>
        ))}
      </section>
    </main>
  );
}

// דף הבית: דף כהה של השראה. המסך הראשון: המטרה, הסרטון ושש התובנות שהמאגר חשף.
// המסך השני: הדף החי, דף גמרא שמתחלף בין המחלוקות, ובראש כל צד התמונה שלו.
// כל המספרים מחושבים מהמאגר בזמן ריצה, כדי שהדף יישאר נכון כשהמאגר גדל.
import { useEffect, useMemo, useRef, useState } from 'react';
import { IDEAS, BY_IDEA, CULTURE, SAYINGS, PAIRS, WORLD_ORDER, worldStats, stats, fmt } from '../engine';
import { ARTICLES } from '../data/articles';
import { ART } from '../data/art';
import { go, href } from '../route';
import Rich from '../Rich';
import { Icon } from '../icons';

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
      <div className="hx-screen">
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
          <button className="hx-down" onClick={() => { const m = document.querySelector('.home-dark'), t = document.querySelector('.hx-live'); if (m && t) m.scrollTo({ top: (t as HTMLElement).offsetTop - 8, behavior: 'smooth' }); }}>הדף החי ↓</button>
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
      </div>

      <LiveDaf />
    </main>
  );
}

// המסך השני: הדף החי. מתחיל ממחלוקת אקראית ומתחלף כל 7 שניות. ריחוף או לחיצה עוצרים אותו, ולחיצה על הדף פותחת אותו.
function LiveDaf() {
  const [ix, setIx] = useState(() => Math.floor(Math.random() * IDEAS.length));
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIx((i) => (i + 1) % IDEAS.length), 7000);
    return () => clearInterval(t);
  }, [pause]);
  const idea = IDEAS[ix];
  return (
    <section className="hx-live" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} aria-label="הדף החי: מחלוקת מתחלפת">
      <div className="hx-live-text">
        <span className="hx-kicker">הדף החי · <bdi className="num">{ix + 1}</bdi> מתוך <bdi className="num">{IDEAS.length}</bdi> מחלוקות</span>
        <h2>{idea.q}</h2>
        <Rich as="p" className="hx-live-ins" key={idea.id}>{idea.insight}</Rich>
        <div className="hx-live-rule">
          <p className="t-a"><b>{idea.a}</b><Rich as="span">{idea.rule.a}</Rich></p>
          <p className="t-b"><b>{idea.b}</b><Rich as="span">{idea.rule.b}</Rich></p>
        </div>
        <div className="legend">
          <span><span className="dot a" />צד א</span><span><span className="dot b" />צד ב</span><span><span className="dot s" />הכרעה</span>
        </div>
        <div className="hx-live-ctl">
          <button className="hx-btn" onClick={() => go('daf', { i: idea.id })}>לדף המלא ←</button>
          <button className="hx-icon" onClick={() => setPause((p) => !p)} aria-label={pause ? 'הפעלה' : 'עצירה'} title={pause ? 'הפעלה' : 'עצירה'}><Icon name={pause ? 'play' : 'pause'} size={14} /></button>
        </div>
        <div className="hd-steps" role="group" aria-label="בחירת מחלוקת">
          {IDEAS.map((x, i) => (
            <button key={x.id} className={`step${i === ix ? ' on' : ''}`} onClick={() => { setIx(i); setPause(true); }} aria-label={x.chip} title={x.chip} />
          ))}
        </div>
      </div>
      <MiniDaf key={idea.id} ideaIx={ix} />
    </section>
  );
}

// הדף החי: כל צד הוא עמודה, ובראש כל עמודה התמונה של הצד. שתי התמונות באותו קו גובה.
// שורה עליונה: תמונת צד א מימין ותמונת צד ב משמאל. שורה תחתונה: הטקסט של כל צד, מתחת לתמונה שלו.
// התמונות יושבות באותה מערכת קואורדינטות של הטקסט, ולכן הן ברוחב העמודה בדיוק ומיושרות אליה בכל גודל מסך.
function MiniDaf({ ideaIx }: { ideaIx: number }) {
  const idea = IDEAS[ideaIx];
  const ss = BY_IDEA[idea.id];
  const art = ART[idea.id] || { a: null, b: null };
  const A = ss.filter((s) => s.side === 'a'), B = ss.filter((s) => s.side === 'b'), S = ss.filter((s) => s.side === 's');
  const W = 640, H = 560, colW = 190, gx = 16;
  const xR = W - colW - gx, xL = gx;            // עמודת צד א (ימין) ועמודת צד ב (שמאל)
  const top0 = 40, band = 206, gap = 12;         // שתי שורות שוות בגובהן
  const top1 = top0 + band + gap;
  const cx = W / 2, cy = top0 + band + gap / 2;  // המרכז: נקודת המפגש בין השורות
  const sTop = top1 + band + 14;
  const bars = (seed: string, n: number) => Array.from({ length: n }, (_, i) => 60 + ((seed.charCodeAt(i % seed.length) * 7 + i * 13) % 70));
  const col = (list: typeof ss, x0: number, y0band: number, side: 'a' | 'b') => {
    const h = Math.min(44, band / Math.max(list.length, 1));
    const y0 = y0band + (band - list.length * h) / 2;
    return list.map((s, i) => {
      const y = y0 + i * h;
      const ex = side === 'a' ? x0 : x0 + colW;
      const tx = side === 'a' ? cx + 70 : cx - 70;
      const len = bars(s.id, 2);
      return (
        <g key={s.id} className="md-item" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
          <path d={`M${ex} ${y + h / 2 - 4} C${(ex + tx) / 2} ${y + h / 2 - 4} ${(ex + tx) / 2} ${cy} ${tx} ${cy}`} className={`ink md-spoke s-${side}`} style={{ ['--len' as string]: 300, animationDelay: `${0.1 + i * 0.07}s` }} />
          <text x={x0 + colW - 4} y={y + 14} textAnchor="end" className={`md-name s-${side}`}>{CULTURE[s.culture].he}</text>
          {len.map((l, k) => <rect key={k} x={x0 + colW - 4 - (l / 130) * (colW - 10)} y={y + 20 + k * 7} width={(l / 130) * (colW - 10)} height={3} className="md-bar" />)}
        </g>
      );
    });
  };
  const pic = (side: 'a' | 'b', x: number, y: number) => {
    const w = art[side];
    return (
      <foreignObject x={x} y={y} width={colW} height={band} className="md-pic-fo">
        <figure className={`md-pic s-${side}`} dir="rtl">
          {w ? <img src={`./art/${w.file}`} alt={w.title} style={w.pos ? { objectPosition: w.pos } : undefined} />
             : <span className="md-pic-type">{side === 'a' ? idea.a : idea.b}</span>}
          {w && <figcaption><b>{w.title}</b><span>{w.artist}</span></figcaption>}
        </figure>
      </foreignObject>
    );
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mini-daf" style={{ direction: 'ltr' }} onClick={() => go('daf', { i: idea.id })} role="link" aria-label={`פתיחת הדף: ${idea.q}`}>
      <rect x="1" y="1" width={W - 2} height={H - 2} className="md-frame" />
      <g className="md-item">{pic('a', xR, top0)}</g>
      <g className="md-item" style={{ animationDelay: '.12s' }}>{pic('b', xL, top0)}</g>
      {col(A, xR, top1, 'a')}
      {col(B, xL, top1, 'b')}
      <g className="md-core">
        <rect x={cx - 70} y={cy - 56} width="140" height="112" className="md-core-box" />
        <text x={cx} y={cy - 14} textAnchor="middle" className="md-q">{idea.chip}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="md-sub s-a">{idea.a}</text>
        <text x={cx} y={cy + 32} textAnchor="middle" className="md-sub s-b">{idea.b}</text>
      </g>
      {S.length > 0 && (
        <g className="md-item" style={{ animationDelay: '.6s' }}>
          <path d={`M${cx} ${cy + 56} L${cx} ${sTop}`} className="ink md-spoke s-s" style={{ ['--len' as string]: 300, animationDelay: '.5s' }} />
          <rect x={cx - 150} y={sTop} width="300" height="40" className="md-s-box" />
          <text x={cx} y={sTop + 25} textAnchor="middle" className="md-name s-s">{S.map((s) => CULTURE[s.culture].he).join(' · ')}</text>
        </g>
      )}
      <text x={W - gx} y={26} textAnchor="end" className="md-hd s-a">{idea.a}</text>
      <text x={gx} y={26} textAnchor="start" className="md-hd s-b">{idea.b}</text>
    </svg>
  );
}

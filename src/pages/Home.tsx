// דף הבית: דף גמרא חי שמתחלף בין הרעיונות, ומפת התוכן.
import { useEffect, useMemo, useState } from 'react';
import { IDEAS, BY_IDEA, CULTURE, SAYINGS, PAIRS, stats, fmt } from '../engine';
import { go, href } from '../route';
import Rich from '../Rich';
import { Icon } from '../icons';

export default function Home() {
  const st = useMemo(stats, []);
  const [ix, setIx] = useState(0);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIx((i) => (i + 1) % IDEAS.length), 5200);
    return () => clearInterval(t);
  }, [pause]);
  const idea = IDEAS[ix];
  const far = st.farCousin;
  const MAP = [
    { id: 'daf', he: 'הדף', n: IDEAS.length, unit: 'מחלוקות', line: 'רעיון אחד בצורת דף: צד א, צד ב, והכרעה.', cols: '1 היכרות · 2 הבנה · 3 יישום' },
    { id: 'mirror', he: 'מראה', n: PAIRS.length, unit: 'זוגות', line: 'כל זוג על שני צירים: דמיון במילים ודמיון במשמעות.', cols: 'סינון · מישור · השוואת זוג' },
    { id: 'atlas', he: 'אטלס', n: st.cultures.length, unit: 'תרבויות', line: 'איפה ומתי נאמר כל רעיון, על מפה וציר זמן.', cols: 'רעיון וזמן · מפה · תרבות' },
    { id: 'trends', he: 'מגמות', n: st.both.length, unit: 'סתירות פנימיות', line: 'מה המכונה מצאה: סתירות, דימויים, ותרבויות שמסכימות.', cols: 'מטריצה · דימויים · ממצאים' },
    { id: 'article', he: 'כתבה', n: 3, unit: 'נהרות', line: 'שני חכמים ליד נהר, באותה מאה, במרחק 7,600 ק"מ.', cols: 'מגזין · ציטוט · הייקו' },
  ];
  return (
    <main className="app-main home">
      <section className="home-text">
        <span className="label">אטלס של פתגמים וציטוטים · <bdi className="num">{SAYINGS.length}</bdi> אמירות</span>
        <h1 className="home-h1">כל תרבות אומרת משהו.<br />ואת ההפך.</h1>
        <Rich as="p" className="insight-line">{`==**${st.selfCultures.size}** מתוך **${st.cultures.length}** תרבויות סותרות את עצמן==, ב-**${st.both.length}** מחלוקות.`}</Rich>
        <p className="explain">פתגם נשמע כמו אמת מוחלטת. כשמניחים אותו ליד אחיו מתרבויות אחרות, רואים <strong>מתי</strong> הוא נכון, ו<strong>מתי</strong> ההפך שלו.</p>
        <div className="tones">
          <div className="tone tone-problem"><h4>הבעיה</h4><p>"החיפזון מן השטן" ו"הכה בברזל בעודו חם". <strong>שתי אמיתות</strong>, ואין הוראות שימוש.</p></div>
          <div className="tone tone-solution"><h4>הפתרון</h4><p>לכל מחלוקת <strong>כלל הכרעה</strong>: באיזה מצב כל צד נכון.</p></div>
          <div className="tone tone-insight"><h4>התובנה</h4><p>{far ? <>אותה מחשבה ב<strong>{CULTURE[far.p.a.culture].he}</strong> וב<strong>{CULTURE[far.p.b.culture].he}</strong>, במרחק <bdi className="num">{fmt(far.d)}</bdi> ק"מ.</> : null}</p></div>
        </div>
        <nav className="home-map" aria-label="מפת האפליקציה">
          {MAP.map((m, i) => (
            <a key={m.id} href={href(m.id)} className="map-card rise" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="mc-hd"><b>{m.he}</b><span className="mc-n"><bdi className="num">{fmt(m.n)}</bdi> <span className="src">{m.unit}</span></span></span>
              <span className="mc-line">{m.line}</span>
              <span className="label">{m.cols}</span>
            </a>
          ))}
        </nav>
        <p className="src inspo">בהשראת צורת הדף של <b>דניאל בומברג</b> Daniel Bomberg, שהדפיס בונציה Venezia את התלמוד הבבלי המלא הראשון, <bdi className="num">1520</bdi>–<bdi className="num">1523</bdi>: טקסט במרכז, ופרשנים שמתווכחים סביבו.</p>
      </section>

      <section className="home-daf" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} aria-label="דף חי: רעיון מתחלף">
        <div className="hd-top">
          <div className="legend">
            <span><span className="dot a" />צד א</span><span><span className="dot b" />צד ב</span><span><span className="dot s" />הכרעה</span>
          </div>
          <div className="hd-ctl">
            <button className="press icon-btn" onClick={() => setPause((p) => !p)} aria-label={pause ? 'הפעלה' : 'עצירה'} title={pause ? 'הפעלה' : 'עצירה'}><Icon name={pause ? 'play' : 'pause'} size={14} /></button>
          </div>
        </div>
        <MiniDaf key={idea.id} ideaIx={ix} />
        <div className="hd-steps" role="group" aria-label="בחירת רעיון">
          {IDEAS.map((x, i) => (
            <button key={x.id} className={`step${i === ix ? ' on' : ''}`} onClick={() => { setIx(i); setPause(true); }} aria-label={x.chip} title={x.chip} />
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniDaf({ ideaIx }: { ideaIx: number }) {
  const idea = IDEAS[ideaIx];
  const ss = BY_IDEA[idea.id];
  const A = ss.filter((s) => s.side === 'a'), B = ss.filter((s) => s.side === 'b'), S = ss.filter((s) => s.side === 's');
  const W = 640, H = 460, colW = 190, top = 40;
  const rowH = (n: number) => Math.min(48, (H - top - 90) / Math.max(n, 1));
  const cx = W / 2, cy = (H - 70) / 2 + 10;
  const bars = (seed: string, n: number) => Array.from({ length: n }, (_, i) => 60 + ((seed.charCodeAt(i % seed.length) * 7 + i * 13) % 70));
  const col = (list: typeof ss, x0: number, side: 'a' | 'b') => {
    const h = rowH(list.length);
    const y0 = cy - (list.length * h) / 2;
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
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mini-daf" style={{ direction: 'ltr' }} onClick={() => go('daf', { i: idea.id })} role="link" aria-label={`פתיחת הדף: ${idea.q}`}>
      <rect x="1" y="1" width={W - 2} height={H - 2} className="md-frame" />
      {col(A, W - colW - 16, 'a')}
      {col(B, 16, 'b')}
      <g className="md-core">
        <rect x={cx - 70} y={cy - 56} width="140" height="112" className="md-core-box" />
        <text x={cx} y={cy - 14} textAnchor="middle" className="md-q">{idea.chip}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="md-sub s-a">{idea.a}</text>
        <text x={cx} y={cy + 32} textAnchor="middle" className="md-sub s-b">{idea.b}</text>
      </g>
      {S.length > 0 && (
        <g className="md-item" style={{ animationDelay: '.6s' }}>
          <path d={`M${cx} ${cy + 56} L${cx} ${H - 56}`} className="ink md-spoke s-s" style={{ ['--len' as string]: 200, animationDelay: '.5s' }} />
          <rect x={cx - 150} y={H - 56} width="300" height="40" className="md-s-box" />
          <text x={cx} y={H - 31} textAnchor="middle" className="md-name s-s">{S.map((s) => CULTURE[s.culture].he).join(' · ')}</text>
        </g>
      )}
      <text x={W - 16} y={26} textAnchor="end" className="md-hd s-a">{idea.a}</text>
      <text x={16} y={26} textAnchor="start" className="md-hd s-b">{idea.b}</text>
    </svg>
  );
}

// דף הבית: דף גמרא חי שמתחלף בין הרעיונות, ומפת התוכן.
import { useEffect, useMemo, useState } from 'react';
import { IDEAS, BY_IDEA, CULTURE, SAYINGS, PAIRS, WORLDS, WORLD_ORDER, worldStats, stats, fmt } from '../engine';
import { ARTICLES } from '../data/articles';
import { ART } from '../data/art';
import { go, href } from '../route';
import Rich from '../Rich';
import { Icon } from '../icons';
import { artThumb } from '../components/Art';

export default function Home() {
  const st = useMemo(stats, []);
  // דף הבית מתחלף: מתחיל ממקום אקראי בכל כניסה, ומתחלף במהלך הצפייה
  const [ix, setIx] = useState(() => Math.floor(Math.random() * IDEAS.length));
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIx((i) => (i + 1) % IDEAS.length), 7000);
    return () => clearInterval(t);
  }, [pause]);
  const idea = IDEAS[ix];
  const far = st.farCousin;
  const ws = useMemo(() => WORLD_ORDER.map(worldStats).filter((x) => x.ss.length >= 10), []);
  const most = ws.slice().sort((a, b) => b.both.length / Object.keys(b.ideas).length - a.both.length / Object.keys(a.ideas).length)[0];
  const calm = ws.filter((x) => x.both.length === 0).map((x) => WORLDS[x.w].he);
  const POOL = [
    far ? `אותה מחשבה ב**${CULTURE[far.p.a.culture].he}** וב**${CULTURE[far.p.b.culture].he}**, במרחק **${fmt(far.d)}** ק"מ.` : '',
    `**${WORLDS[most.w].he}** אומרת גם וגם ב-**${most.both.length}** מתוך **${Object.keys(most.ideas).length}** מחלוקות. ==סתירה היא שיטה==.`,
    calm.length ? `**${calm.join('**, **')}**: ==אף סתירה פנימית אחת==. תרבויות של דרך אחת.` : '',
    `**${Math.round((st.kinds.impostor / PAIRS.length) * 100)}%** מהזוגות מתחזים: ==אותן מילים, משמעות אחרת==.`,
    '"עין תחת עין" הפך ל**ממון** אלף שנה אחר כך. ==שפה אינה תרבות, גם בזמן==.',
    'מחיר הוודאות: **2** ציפורים באנגלית, **10** בערבית, **100** בספרדית, ו**עגור** ברוסית.',
  ].filter(Boolean);
  const MAP = [
    { id: 'daf', art: 'haste', he: 'הדף', n: IDEAS.length, unit: 'מחלוקות', line: 'צד א, צד ב והכרעה.', cols: '1 היכרות · 2 הבנה · 3 יישום' },
    { id: 'mirror', art: 'drop', he: 'מראה', n: PAIRS.length, unit: 'זוגות', line: 'ארבעה סוגי קשר בין זוגות.', cols: 'סוג קשר · זוגות · פרשנות' },
    { id: 'atlas', art: 'home', he: 'אטלס', n: st.cultures.length, unit: 'תרבויות', line: 'מפה, זמן ודיוקן תרבות.', cols: 'רעיון וזמן · מפה וזום · תרבות' },
    { id: 'trends', art: 'fate', he: 'תובנות', n: WORLD_ORDER.length, unit: 'עולמות ערכים', line: 'מה כל עולם בוחר, ולמה.', cols: 'עולם · דיוקן · עדויות' },
    { id: 'article', art: 'risk', he: 'כתבות', n: ARTICLES.length, unit: 'גילויים', line: 'גילויים מתוך המאגר.', cols: 'מגזין · ציטוט · הייקו' },
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
          <div className="tone tone-insight"><h4>תובנה מתחלפת</h4><Rich as="p" className="rise" key={ix}>{POOL[ix % POOL.length]}</Rich></div>
        </div>
        <nav className="home-map" aria-label="מפת האפליקציה">
          {MAP.map((m, i) => (
            <a key={m.id} href={href(m.id)} className={`map-card rise${artThumb(m.art) ? ' has-img' : ''}`} style={{ animationDelay: `${i * 0.06}s` }}>
              {artThumb(m.art) && <img className="mc-img" src={`./art/${artThumb(m.art)}`} alt="" loading="lazy" />}
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
        <figure className="home-feature rise" key={'f' + idea.id} onClick={() => go('daf', { i: idea.id })}>
          {(['a', 'b'] as const).map((k) => ART[idea.id]?.[k] && <img key={k} className={`hf-${k}`} src={`./art/${ART[idea.id]![k]!.file}`} alt={ART[idea.id]![k]!.title} style={ART[idea.id]![k]!.pos ? { objectPosition: ART[idea.id]![k]!.pos } : undefined} />)}
          <figcaption><b>{idea.q}</b><Rich>{idea.insight}</Rich></figcaption>
        </figure>
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

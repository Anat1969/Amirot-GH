// הכריכה: דף הכניסה, שאליו מובילים הלוגו ושם האפליקציה. פונה אל הרגש: מרגשת, ממתגת ומשותפת.
// המסגרת היא הרכיב המשותף <app-cover> (AppOfApp-GH/public/cover.js), אותה מסגרת בכל האפליקציות.
// הייחודיות של אמירות היא האמנות: דף גמרא שנכתב בדיו, כמו בדפוס בומברג.
// במרכז השאלה. מימין צד א, משמאל צד ב, בניקוד. קווי דיו נמשכים מכל אמירה אל המרכז, ולמטה ההכרעה בירוק.
// כל 7 שניות הדף עובר למחלוקת הבאה, ממקום אקראי. הכול נגזר מהמאגר.
import { useEffect, useMemo, useRef, useState } from 'react';
import { IDEAS, BY_IDEA, SAYINGS, stats } from '../engine';
import { Icon } from '../icons';

const W = 1000, H = 760, STEP = 7000, PER = 4;
// גאומטריה של הדף: שתי עמודות פרשנים, וביניהן השאלה. הקווים נמשכים מקצה העמודה אל מסגרת השאלה
const RX = 960, LX = 40, RRULE = 720, LRULE = 280, CX0 = 380, CX1 = 620, CY0 = 300, CY1 = 460;
const cut = (t: string, n = 22) => (t.length > n ? t.slice(0, n - 1).replace(/[\s,—–-]+$/, '') + '…' : t);
const rowY = (i: number) => 190 + i * 100;

export function CoverArt() {
  const order = useMemo(() => { const s = Math.floor(Math.random() * IDEAS.length); return IDEAS.map((_, i) => IDEAS[(s + i) % IDEAS.length]); }, []);
  const [k, setK] = useState(0);
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setK((n) => (n + 1) % order.length), STEP);
    return () => clearInterval(t);
  }, [order.length, reduced]);
  const idea = order[k];
  const ss = BY_IDEA[idea.id] || [];
  const A = ss.filter((s) => s.side === 'a').slice(0, PER);
  const B = ss.filter((s) => s.side === 'b').slice(0, PER);
  const S = ss.find((s) => s.side === 's');
  const host = useRef<HTMLDivElement>(null);
  const ink = (x0: number, y0: number, x1: number, y1: number) => `M${x0},${y0} C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1}`;
  return (
    <div className="cover-art" ref={host} slot="art" role="img" key={idea.id}
      aria-label={`דף גמרא שנכתב: ${idea.q} ${A.length} אמירות בצד אחד, ${B.length} בצד השני, וקווי דיו אל השאלה.`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* שוליים של דף מודפס: קווי עמודה דקים, כמו בדפוס עופרת */}
        <rect className="cv-page" x="20" y="20" width={W - 40} height={H - 40} />
        <line className="cv-rule" x1={RRULE} x2={RRULE} y1="80" y2={H - 160} />
        <line className="cv-rule" x1={LRULE} x2={LRULE} y1="80" y2={H - 160} />
        {A.map((s, i) => <path key={'la' + s.id} className="cv-ink a" d={ink(RRULE - 6, rowY(i) - 6, CX1, (CY0 + CY1) / 2)} pathLength={1} style={{ animationDelay: `${0.9 + i * 0.25}s` }} />)}
        {B.map((s, i) => <path key={'lb' + s.id} className="cv-ink b" d={ink(LRULE + 6, rowY(i) - 6, CX0, (CY0 + CY1) / 2)} pathLength={1} style={{ animationDelay: `${1.1 + i * 0.25}s` }} />)}
        {S && <path className="cv-ink s" d={`M500,${CY1} L500,${H - 132}`} pathLength={1} style={{ animationDelay: '2.4s' }} />}
        <rect className="cv-core" x={CX0} y={CY0} width={CX1 - CX0} height={CY1 - CY0} />
        <g className="cv-motif" transform={`translate(486,${CY0 + 18})`}><Icon name={idea.motif} size={28} /></g>
        <text className="cv-q" x="500" y={CY0 + 96} textAnchor="middle">{cut(idea.q, 20)}</text>
        <text className="cv-sides" x="500" y={CY0 + 132} textAnchor="middle">{idea.a} · {idea.b}</text>
        <text className="cv-head a" x={RX} y="120" direction="rtl" textAnchor="start">{idea.a}</text>
        <text className="cv-head b" x={LX} y="120" direction="rtl" textAnchor="end">{idea.b}</text>
        {A.map((s, i) => <text key={s.id} className="cv-say a" x={RX} y={rowY(i)} direction="rtl" textAnchor="start" style={{ animationDelay: `${0.3 + i * 0.25}s` }}>{cut(s.nikud || s.he)}</text>)}
        {B.map((s, i) => <text key={s.id} className="cv-say b" x={LX} y={rowY(i)} direction="rtl" textAnchor="end" style={{ animationDelay: `${0.5 + i * 0.25}s` }}>{cut(s.nikud || s.he)}</text>)}
        {S && <text className="cv-say s" x="500" y={H - 90} textAnchor="middle" style={{ animationDelay: '2.8s' }}>{cut(S.nikud || S.he, 44)}</text>}
      </svg>
      <span className="cv-count num" aria-hidden="true">{k + 1}/{order.length}</span>
    </div>
  );
}

export default function Cover() {
  const ref = useRef<HTMLElement & { config?: unknown }>(null);
  const config = useMemo(() => {
    const st = stats();
    return {
      name: 'אמירות',
      subtitle: 'כמה דומה השונה',
      kicker: ['אמירה · אומר · אמרה', 'מחלוקת · חלק · מחלק'],
      haiku: ['שני פתגמים עומדים', 'זה מול זה, בכל שפה', 'ובאמצע: מתי'],
      vision: '**לא לבחור צד.** לדעת מתי כל צד נכון.',
      goal: `**${SAYINGS.length} אמירות מ-${st.cultures.length} תרבויות**, ב-${IDEAS.length} מחלוקות, ולכל מחלוקת כלל הכרעה.`,
      open: { label: 'פתיחה', href: '#/open' },
      video: { src: './video/amirot.mp4', caption: 'סיור של דקה וחצי באפליקציה', label: 'הסרטון' },
      share: { title: 'אמירות: כמה דומה השונה', text: 'כל תרבות אומרת משהו, ואת ההפך. אטלס של פתגמים וציטוטים, ולכל מחלוקת כלל הכרעה.' },
      credit: 'בהשראת דפוס דניאל בומברג Daniel Bomberg, ונציה, 1520–1523: התלמוד הבבלי הראשון בדפוס.',
      palette: { ink: '#33332f', paper: '#f5f4f1', accent: '#34548a', marker: '#ffec8f' },
    };
  }, []);
  useEffect(() => {
    // מציבים את התוכן רק אחרי שהרכיב הוגדר, אחרת המאפיין נשמר על האלמנט ומסתיר את ה-setter
    let alive = true;
    customElements.whenDefined('app-cover').then(() => { if (alive && ref.current) ref.current.config = config; });
    return () => { alive = false; };
  }, [config]);
  return (
    <main className="app-main cover-page">
      <app-cover ref={ref}>
        <CoverArt />
      </app-cover>
    </main>
  );
}

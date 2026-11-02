// מראה: כל זוג אמירות הוא נקודה. ציר אחד מודד דמיון במילים, והשני דמיון במשמעות.
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PAIRS, KINDS, CULTURE, IDEA, km, yearGap, fmt, where, matcher, type Kind, type Pair } from '../engine';
import { go, href } from '../route';
import { useStore } from '../store';
import Rich, { Yr } from '../Rich';

const ORDER: Kind[] = ['twin', 'cousin', 'impostor', 'rival'];
const pid = (p: Pair) => p.a.id + '~' + p.b.id;

export default function Mirror({ params }: { params: Record<string, string> }) {
  const [st] = useStore();
  const kinds = params.k ? (params.k.split(',').filter((k) => k in KINDS) as Kind[]) : [];
  const cross = params.x === '1';
  const m = useMemo(() => matcher(st.q), [st.q]);
  const list = useMemo(() => PAIRS.filter((p) => (!kinds.length || kinds.includes(p.kind)) && (!cross || p.a.culture !== p.b.culture)), [params.k, cross]);
  const counts = useMemo(() => { const c = { twin: 0, cousin: 0, impostor: 0, rival: 0 } as Record<Kind, number>; PAIRS.filter((p) => !cross || p.a.culture !== p.b.culture).forEach((p) => c[p.kind]++); return c; }, [cross]);
  const sel = useMemo(() => {
    const [a, b] = (params.p || 'chg-heraclitus~chg-confucius').split('~');
    return PAIRS.find((p) => (p.a.id === a && p.b.id === b) || (p.a.id === b && p.b.id === a)) || null;
  }, [params.p]);
  const [hover, setHover] = useState<Pair | null>(null);
  const show = hover || sel;
  const set = (patch: Record<string, string | undefined>) => go('mirror', { k: params.k, x: params.x, p: params.p, ...patch }, true);
  const pick = (k: Kind) => set({ k: kinds.length === 1 && kinds[0] === k ? undefined : k });
  const add = (k: Kind) => set({ k: (kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k]).join(',') || undefined });

  return (
    <main className="app-main mirror-page">
      <aside className="panel m-side">
        <div className="panel-bd scroll-in lines-lg">
          <span className="label">שני צירים לכל זוג</span>
          <h1 className="m-title">כמה דומה השונה, וכמה שונה הדומה</h1>
          <Rich as="p" className="insight-line">{`==${fmt(counts.impostor)} זוגות== אומרים אותן מילים, ומתכוונים לדבר אחר.`}</Rich>
          <p className="explain">כל נקודה היא זוג אמירות. <strong>ימינה</strong>: יותר מילים ודימויים משותפים. <strong>למעלה</strong>: משמעות קרובה יותר.</p>
          <div className="kind-pick" role="group" aria-label="סוג הקשר">
            <button className="chip" aria-pressed={!kinds.length} onClick={() => set({ k: undefined })}>הכול <bdi className="num">{fmt(Object.values(counts).reduce((a, b) => a + b, 0))}</bdi></button>
            {ORDER.map((k) => (
              <span key={k} className="kind-row">
                <button className={`chip kc-${k}`} aria-pressed={kinds.includes(k)} onClick={() => pick(k)}><i className={`sw sw-${k}`} />{KINDS[k].he} <bdi className="num">{fmt(counts[k])}</bdi></button>
                <button className="chip plus" aria-label={kinds.includes(k) ? `הסרת ${KINDS[k].he}` : `הוספת ${KINDS[k].he}`} title={kinds.includes(k) ? 'הסרה' : 'הוספה לבחירה'} onClick={() => add(k)}>{kinds.includes(k) ? '−' : '+'}</button>
                <span className="src">{KINDS[k].line}</span>
              </span>
            ))}
          </div>
          <label className="toggle"><input type="checkbox" checked={cross} onChange={(e) => set({ x: e.target.checked ? '1' : undefined })} /> רק בין תרבויות שונות</label>
          <p className="src">מצב כבוי כברירת מחדל: כשמסמנים, נשארים רק זוגות שחוצים שפה או תרבות.</p>
          <div className="tone tone-insight">
            <h4>איך זה מחושב</h4>
            <p><strong>דמיון במילים</strong>: חלק הדימויים המשותפים (יחס ז'קאר). <strong>דמיון במשמעות</strong>: אותו צד במחלוקת = קרוב, צדדים מנוגדים = הפוך. פיזור קל מונע חפיפת נקודות.</p>
          </div>
        </div>
      </aside>

      <section className="panel m-plot" aria-label="מישור הדמיון">
        <Plot list={list} sel={sel} hover={hover} setHover={setHover} onPick={(p) => set({ p: pid(p) })} m={m} />
      </section>

      <aside className="panel m-detail" aria-live="polite">
        {show ? <PairCard p={show} preview={!!hover && hover !== sel} /> : <div className="panel-bd"><p className="explain">בחרו נקודה במישור.</p></div>}
      </aside>
    </main>
  );
}

function Plot({ list, sel, hover, setHover, onPick, m }: { list: Pair[]; sel: Pair | null; hover: Pair | null; setHover: (p: Pair | null) => void; onPick: (p: Pair) => void; m: ReturnType<typeof matcher> }) {
  const box = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 600, h: 400 });
  useLayoutEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setSz({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = { t: 34, b: 40, l: 30, r: 30 };
  const W = Math.max(200, sz.w), H = Math.max(200, sz.h);
  // ימינה = יותר מילים משותפות (בקריאה מימין לשמאל, הפינה הימנית העליונה היא "תאומים")
  const X = (v: number) => pad.l + v * (W - pad.l - pad.r);
  const Y = (v: number) => pad.t + ((1 - v) / 2) * (H - pad.t - pad.b);
  const midX = X(0.5), midY = Y(0.5);
  const q = (k: Kind) => ({ twin: [X(0.75), pad.t + 16], cousin: [X(0.25), pad.t + 16], impostor: [X(0.75), H - pad.b - 4], rival: [X(0.25), H - pad.b - 4] })[k];
  const big = (k: Kind) => list.filter((p) => p.kind === k).length;
  return (
    <div className="plot-box" ref={box}>
      <svg width={W} height={H} className="plot" aria-label="מישור: דמיון במילים מול דמיון במשמעות" style={{ direction: 'ltr' }}>
        <rect x={midX} y={pad.t} width={X(1) - midX} height={midY - pad.t} className="qd qd-twin" />
        <rect x={pad.l} y={pad.t} width={midX - pad.l} height={midY - pad.t} className="qd qd-cousin" />
        <rect x={midX} y={midY} width={X(1) - midX} height={H - pad.b - midY} className="qd qd-impostor" />
        <rect x={pad.l} y={midY} width={midX - pad.l} height={H - pad.b - midY} className="qd qd-rival" />
        <line x1={pad.l} x2={W - pad.r} y1={Y(0)} y2={Y(0)} className="axis0" />
        <line x1={midX} x2={midX} y1={pad.t} y2={H - pad.b} className="mid" />
        <line x1={pad.l} x2={W - pad.r} y1={midY} y2={midY} className="mid" />
        {list.map((p) => {
          const dim = m && !(m(p.a) || m(p.b));
          const on = p === sel || p === hover;
          return (
            <circle key={pid(p)} cx={X(p.x)} cy={Y(p.y)} r={on ? 7 : 3.6} className={`pt k-${p.kind}${dim ? ' dim' : ''}${on ? ' on' : ''}`}
              onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)} onClick={() => onPick(p)} tabIndex={-1} />
          );
        })}
        {ORDER.map((k) => {
          const [x, y] = q(k);
          const top = k === 'twin' || k === 'cousin';
          return (
            <g key={k} className={`ql ql-${k}`}>
              <text x={x} y={top ? y : y - 16} textAnchor="middle" className="ql-name">{KINDS[k].he}</text>
              <text x={x} y={top ? y + 15 : y - 1} textAnchor="middle" className="ql-n">{fmt(big(k))}</text>
            </g>
          );
        })}
        <text x={W - pad.r} y={H - 12} textAnchor="end" className="ax">אותן מילים</text>
        <text x={pad.l} y={H - 12} textAnchor="start" className="ax">מילים אחרות</text>
        <text x={W / 2} y={18} textAnchor="middle" className="ax">אותה משמעות</text>
        <text x={W / 2} y={H - 12} textAnchor="middle" className="ax">משמעות הפוכה</text>
      </svg>
    </div>
  );
}

function Side({ s }: { s: Pair['a'] }) {
  const c = CULTURE[s.culture];
  const w = where(s);
  return (
    <div className={`pc-side s-${s.side}`}>
      <p className="say">"{s.he}"</p>
      {s.orig && <p className="orig" lang={s.lang} dir="auto">"{s.orig}"</p>}
      <p className="pc-meta"><b>{c.he}</b><span className="en">{c.en}</span> · <b>{w.he}</b><span className="en">{w.en}</span> · <Yr y={s.year} approx={s.approx} /></p>
      <p className="src">{s.src}</p>
    </div>
  );
}

function PairCard({ p, preview }: { p: Pair; preview: boolean }) {
  const d = km(p.a, p.b), g = yearGap(p.a, p.b);
  const shared = p.a.motifs.filter((x) => p.b.motifs.includes(x));
  const sameIdea = p.a.idea === p.b.idea;
  const far = PAIRS.filter((x) => x.kind === p.kind && x.a.culture !== x.b.culture).map((x) => ({ x, d: km(x.a, x.b) })).sort((u, v) => v.d - u.d).slice(0, 3);
  return (
    <div className="panel-bd scroll-in pc" key={pid(p)}>
      <div className="pc-hd">
        <span className={`pc-kind k-${p.kind}`}>{KINDS[p.kind].he}</span>
        <span className="src">{preview ? 'תצוגה בריחוף · לחיצה נועלת' : KINDS[p.kind].line}</span>
      </div>
      <Side s={p.a} />
      <div className="pc-bridge">
        <div><span className="label">מרחק</span><b className="num">{fmt(d)}</b> <span className="src">ק"מ</span></div>
        <div><span className="label">פער זמן</span>{g == null ? <span className="src">עממי</span> : <><b className="num">{fmt(g)}</b> <span className="src">שנים</span></>}</div>
        <div><span className="label">במילים</span><b className="num">{Math.round(p.surface * 100)}%</b></div>
        <div><span className="label">במשמעות</span><b className="num">{p.meaning > 0 ? '+' : ''}{Math.round(p.meaning * 100)}</b></div>
      </div>
      <Side s={p.b} />
      <div className="pc-why">
        {shared.length > 0 && <p><span className="label">משותף במילים</span> {shared.map((x) => <span key={x} className="motif">{x}</span>)}</p>}
        <p><span className="label">במשמעות</span> {sameIdea ? (p.a.side === p.b.side ? <>אותו צד ב<a href={href('daf', { i: p.a.idea })}>{IDEA[p.a.idea].q}</a></> : p.a.side === 's' || p.b.side === 's' ? <>אחת מהן מחזיקה בשני הצדדים</> : <>צדדים מנוגדים ב<a href={href('daf', { i: p.a.idea })}>{IDEA[p.a.idea].q}</a></>) : <>שני רעיונות: {IDEA[p.a.idea].chip} ו{IDEA[p.b.idea].chip}</>}</p>
        {p.note && <p className="pc-note"><mark className="insight">{p.note}</mark></p>}
      </div>
      <div className="pc-far">
        <span className="label">הרחוקים ביותר מסוג {KINDS[p.kind].he}</span>
        {far.map(({ x, d }) => (
          <a key={pid(x)} className="far-row" href={href('mirror', { p: pid(x) })}>
            <span>{CULTURE[x.a.culture].he} ↔ {CULTURE[x.b.culture].he}</span><bdi className="num">{fmt(d)}</bdi>
          </a>
        ))}
      </div>
    </div>
  );
}

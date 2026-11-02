// אטלס: איפה ומתי נאמר כל רעיון. מפה עם מקרא, ציר זמן עם שעון שנים, וקווי מקבילה בין תרבויות.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import { SAYINGS, IDEAS, IDEA, CULTURES, CULTURE, PAIRS, matcher, type Saying } from '../engine';
import { go, href } from '../route';
import { useStore } from '../store';
import { Yr } from '../Rich';
import { Icon } from '../icons';

const LAND = feature(land110 as any, (land110 as any).objects.land) as any;
const MIN = -1800, MAX = 2026;

export default function Atlas({ params }: { params: Record<string, string> }) {
  const [st] = useStore();
  const idea = params.i && IDEA[params.i] ? IDEA[params.i] : null;
  const from = params.f ? +params.f : MIN, to = params.t ? +params.t : MAX;
  const folk = params.folk !== '0';
  const cult = params.c && CULTURE[params.c] ? params.c : null;
  const set = (patch: Record<string, string | undefined>) => go('atlas', { i: params.i, f: params.f, t: params.t, folk: params.folk, c: params.c, ...patch }, true);
  const m = useMemo(() => matcher(st.q), [st.q]);
  const inTime = (s: Saying) => (s.year == null ? folk : s.year >= from && s.year <= to);
  const list = useMemo(() => SAYINGS.filter((s) => (!idea || s.idea === idea.id) && inTime(s) && (!m || m(s))), [idea, from, to, folk, m]);

  // הפעלה: "עד" רץ מ-1800 לפנה"ס עד היום, ושעון שנים גדול על המפה
  const [play, setPlay] = useState<number | null>(null);
  useEffect(() => {
    if (play == null) return;
    if (play >= MAX) { setPlay(null); return; }
    const t = setTimeout(() => { const n = Math.min(MAX, play + 25); setPlay(n); set({ t: String(n), folk: '0' }); }, 60);
    return () => clearTimeout(t);
  }, [play]);

  const byCulture = useMemo(() => {
    const r: Record<string, { a: number; b: number; s: number; n: number }> = {};
    for (const s of list) { const x = (r[s.culture] ||= { a: 0, b: 0, s: 0, n: 0 }); x[s.side]++; x.n++; }
    return r;
  }, [list]);
  const regions = new Set(list.map((s) => CULTURE[s.culture].region)).size;

  return (
    <main className="app-main atlas-page">
      <aside className="panel at-side">
        <div className="panel-bd scroll-in lines-lg">
          <span className="label">רעיון</span>
          <div className="chips vchips" role="group" aria-label="בחירת רעיון">
            <button className="chip" aria-pressed={!idea} onClick={() => set({ i: undefined })}>הכול</button>
            {IDEAS.map((i) => <button key={i.id} className="chip" aria-pressed={idea?.id === i.id} onClick={() => set({ i: idea?.id === i.id ? undefined : i.id })}>{i.chip}</button>)}
          </div>
          <span className="label">תקופה</span>
          <div className="range">
            <label>מ־<input className="field yr-in" type="number" value={from} min={MIN} max={to} step={50} onChange={(e) => set({ f: e.target.value })} /></label>
            <label>עד<input className="field yr-in" type="number" value={to} min={from} max={MAX} step={50} onChange={(e) => set({ t: e.target.value })} /></label>
            <button className="press icon-btn" aria-label="איפוס התקופה" title="איפוס התקופה" onClick={() => { setPlay(null); set({ f: undefined, t: undefined, folk: undefined }); }}><Icon name="reset" size={14} /></button>
          </div>
          <p className="src">שנה שלילית = לפני הספירה. ברירת המחדל: מחמורבי ועד היום.</p>
          <label className="toggle"><input type="checkbox" checked={folk} onChange={(e) => set({ folk: e.target.checked ? undefined : '0' })} /> כולל פתגמים עממיים בלי תאריך</label>
          <button className="press btn play-btn" aria-pressed={play != null} onClick={() => { if (play != null) { setPlay(null); return; } set({ f: undefined, t: String(MIN), folk: '0' }); setPlay(MIN); }}>
            <Icon name={play != null ? 'pause' : 'play'} size={14} /> {play != null ? 'עצירה' : 'הפעלה: 3,800 שנה'}
          </button>
          <p className="src">ההפעלה מציגה איך אמירות מצטברות על המפה, מחמורבי ועד היום.</p>
        </div>
      </aside>

      <section className="panel at-map" aria-label="מפת האמירות">
        <div className="panel-hd">
          <h2>{idea ? idea.q : 'כל הרעיונות'}</h2>
          <span className="src"><bdi className="num">{list.length}</bdi> אמירות · <bdi className="num">{Object.keys(byCulture).length}</bdi> תרבויות · <bdi className="num">{regions}</bdi> אזורים</span>
          <div className="legend at-legend">
            <span><span className="dot a" />{idea ? idea.a : 'צד א'}</span><span><span className="dot b" />{idea ? idea.b : 'צד ב'}</span><span><span className="dot s" />הכרעה</span>
            {idea && <span><i style={{ borderColor: 'var(--side-a)' }} />מקבילה בין תרבויות</span>}
            <span className="src">גודל העיגול = מספר האמירות</span>
          </div>
        </div>
        <MapView byCulture={byCulture} list={list} idea={idea?.id || null} cult={cult} onCult={(c) => set({ c: cult === c ? undefined : c })} clock={play} />
        <Timeline list={list} from={from} to={to} />
      </section>

      <aside className="panel at-detail">
        {cult ? <CultureCard id={cult} list={list.filter((s) => s.culture === cult)} onClose={() => set({ c: undefined })} /> : (
          <div className="panel-bd scroll-in">
            <span className="label">תרבויות לפי מספר אמירות</span>
            {CULTURES.filter((c) => byCulture[c.id]).sort((a, b) => byCulture[b.id].n - byCulture[a.id].n).map((c) => {
              const x = byCulture[c.id];
              return (
                <button key={c.id} className="cult-row" onClick={() => set({ c: c.id })}>
                  <span><b>{c.he}</b><span className="en">{c.en}</span></span>
                  <span className="bar3"><i className="a" style={{ flex: x.a }} /><i className="b" style={{ flex: x.b }} /><i className="s" style={{ flex: x.s }} /></span>
                  <bdi className="num">{x.n}</bdi>
                </button>
              );
            })}
            {!list.length && <p className="explain">אין אמירות בתקופה ובסינון האלה. אפשר להרחיב את התקופה או לאפס.</p>}
          </div>
        )}
      </aside>
    </main>
  );
}

function MapView({ byCulture, list, idea, cult, onCult, clock }: { byCulture: Record<string, { a: number; b: number; s: number; n: number }>; list: Saying[]; idea: string | null; cult: string | null; onCult: (c: string) => void; clock: number | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 800, h: 420 });
  const [hover, setHover] = useState<string | null>(null);
  useLayoutEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setSz({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const proj = useMemo(() => geoEqualEarth().fitExtent([[10, 10], [Math.max(50, sz.w - 10), Math.max(50, sz.h - 10)]], { type: 'MultiPoint', coordinates: [[-95, 62], [150, 62], [-95, -12], [150, -12]] } as any), [sz]);
  const path = useMemo(() => geoPath(proj), [proj]);
  // נקודה לכל תרבות (המקום המייצג שלה)
  const pts = CULTURES.filter((c) => byCulture[c.id]).map((c) => {
    const [x, y] = proj([c.lon, c.lat]) as [number, number];
    return { c, x, y, v: byCulture[c.id], r: (5 + Math.sqrt(byCulture[c.id].n) * 4.2) * Math.min(1, Math.max(0.45, sz.w / 900)) };
  });
  // תוויות: לפי חשיבות, בלי חפיפה; המוסתרות מופיעות בריחוף
  const placed: { x: number; y: number }[] = [];
  const showLabel = new Set<string>();
  for (const p of [...pts].sort((a, b) => b.v.n - a.v.n)) {
    if (placed.every((q) => Math.abs(q.x - p.x) > 70 || Math.abs(q.y - p.y) > 18)) { placed.push(p); showLabel.add(p.c.id); }
  }
  // קווי מקבילה: אותו צד באותו רעיון, בין תרבויות, מהמוקדם (בהיר) למאוחר (כהה)
  const arcs = idea ? PAIRS.filter((p) => p.a.idea === idea && p.b.idea === idea && p.meaning > 0.8 && p.a.culture !== p.b.culture && list.includes(p.a) && list.includes(p.b)) : [];
  const xy = (s: Saying) => { const c = CULTURE[s.culture]; return proj([c.lon, c.lat]) as [number, number]; };
  const pie = (cx: number, cy: number, r: number, v: { a: number; b: number; s: number; n: number }) => {
    let a0 = -Math.PI / 2;
    return (['a', 'b', 's'] as const).filter((k) => v[k]).map((k) => {
      const a1 = a0 + (v[k] / v.n) * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const d = v[k] === v.n ? `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0` : `M${cx} ${cy}L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}Z`;
      a0 = a1;
      return <path key={k} d={d} className={`pie-${k}`} />;
    });
  };
  return (
    <div className="map-box" ref={box}>
      <svg width={sz.w} height={sz.h} className="map" style={{ direction: 'ltr' }} aria-label="מפת העולם עם נקודה לכל תרבות">
        <path d={path(LAND) || ''} className="land" />
        <path d={path({ type: 'Sphere' } as any) || ''} className="sphere" />
        <defs>
          <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6z" style={{ fill: 'var(--side-a)' }} /></marker>
        </defs>
        {arcs.map((p, i) => {
          const [o, n] = (p.a.year ?? 9999) <= (p.b.year ?? 9999) ? [p.a, p.b] : [p.b, p.a];
          const [x1, y1] = xy(o), [x2, y2] = xy(n);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.25;
          return <path key={i} d={`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`} className={`arc ink k-${p.kind}`} markerEnd="url(#arr)" style={{ ['--len' as string]: 1400 }} />;
        })}
        {pts.map((p) => (
          <g key={p.c.id} className={`cpt${cult === p.c.id ? ' on' : ''}`} onClick={() => onCult(p.c.id)} onMouseEnter={() => setHover(p.c.id)} onMouseLeave={() => setHover(null)}>
            <circle cx={p.x} cy={p.y} r={p.r + 2} className="halo" />
            {pie(p.x, p.y, p.r, p.v)}
            {(showLabel.has(p.c.id) || hover === p.c.id || cult === p.c.id) && <text x={p.x + p.r + 4} y={p.y + 4} className="clabel">{p.c.he}</text>}
          </g>
        ))}
      </svg>
      {clock != null && <div className="clock" aria-live="off"><b className="num">{Math.abs(clock)}</b><span>{clock < 0 ? 'לפנה״ס' : 'לספירה'}</span></div>}
      <a className="src map-note" href={href('trends')}>נקודה היא מקום מייצג של התרבות, ולא טענה שהאמירה נאמרה שם.</a>
    </div>
  );
}

function Timeline({ list, from, to }: { list: Saying[]; from: number; to: number }) {
  const bins: number[] = [];
  const step = 100;
  for (let y = MIN; y < MAX; y += step) bins.push(SAYINGS.filter((s) => s.year != null && s.year >= y && s.year < y + step).length);
  const inBins = bins.map((_, i) => list.filter((s) => s.year != null && s.year >= MIN + i * step && s.year < MIN + (i + 1) * step).length);
  const max = Math.max(...bins, 1);
  const W = 1000, H = 54;
  const x = (y: number) => ((y - MIN) / (MAX - MIN)) * W;
  const ticks = [-1000, -500, 0, 500, 1000, 1500, 2000];
  return (
    <div className="timeline">
      <svg viewBox={`0 0 ${W} ${H + 16}`} preserveAspectRatio="none" style={{ direction: 'ltr' }} aria-label="ציר זמן: אמירות מתוארכות לפי מאה">
        <rect x={x(from)} y={0} width={Math.max(0, x(to) - x(from))} height={H} className="tl-sel" />
        {bins.map((n, i) => <rect key={i} x={(i * step * W) / (MAX - MIN) + 1} y={H - (n / max) * (H - 6)} width={(step * W) / (MAX - MIN) - 2} height={(n / max) * (H - 6)} className="tl-all" />)}
        {inBins.map((n, i) => <rect key={'s' + i} x={(i * step * W) / (MAX - MIN) + 1} y={H - (n / max) * (H - 6)} width={(step * W) / (MAX - MIN) - 2} height={(n / max) * (H - 6)} className="tl-in" />)}
        {ticks.map((t) => <line key={t} x1={x(t)} x2={x(t)} y1={H} y2={H + 4} className="tl-tick" />)}
      </svg>
      <div className="tl-labels">{ticks.map((t) => <span key={t} style={{ left: `${(x(t) / W) * 100}%` }}><Yr y={t === 0 ? 1 : t} /></span>)}</div>
    </div>
  );
}

function CultureCard({ id, list, onClose }: { id: string; list: Saying[]; onClose: () => void }) {
  const c = CULTURE[id];
  return (
    <div className="panel-bd scroll-in cc">
      <div className="cc-hd">
        <h2>{c.he}<span className="en">{c.en}</span></h2>
        <button className="press icon-btn" onClick={onClose} aria-label="סגירה" title="סגירה"><Icon name="x" size={14} /></button>
      </div>
      <p className="src">מקום מייצג: <b>{c.place}</b> {c.placeEn} · אזור: {c.region}</p>
      {list.map((s) => (
        <a key={s.id} className={`cc-row s-${s.side}`} href={href('daf', { i: s.idea, s: s.id })}>
          <span className="say">"{s.he}"</span>
          <span className="src">{IDEA[s.idea].chip} · <Yr y={s.year} approx={s.approx} /></span>
        </a>
      ))}
      {!list.length && <p className="explain">בסינון הנוכחי אין אמירות מהתרבות הזאת.</p>}
    </div>
  );
}

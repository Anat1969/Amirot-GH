// אטלס: איפה ומתי נאמר כל רעיון. מפה עם מקרא, ציר זמן עם שעון שנים, וקווי מקבילה בין תרבויות.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { geoEqualEarth, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import { SAYINGS, IDEAS, IDEA, CULTURES, CULTURE, PAIRS, WORLDS, WORLD_ORDER, PORTRAITS, LANGS, LENSES, VALUES, GROUPS, GROUP_OF, FAMILIES, familiesOf, langOf, matcher, type Saying } from '../engine';
import { go } from '../route';
import { useStore } from '../store';
import Rich, { Yr } from '../Rich';
import { Icon } from '../icons';
import Flag from '../components/Flag';

const REG_HE: Record<string, string> = { 'מזרח תיכון': 'המזרח התיכון' };
const rh = (r: string) => REG_HE[r] || r;
const LAND = feature(land110 as any, (land110 as any).objects.land) as any;
const MIN = -1800, MAX = 2026;

export default function Atlas({ params }: { params: Record<string, string> }) {
  const [st] = useStore();
  const idea = params.i && IDEA[params.i] ? IDEA[params.i] : null;
  const from = params.f ? +params.f : MIN, to = params.t ? +params.t : MAX;
  const folk = params.folk !== '0';
  const cult = params.c && CULTURE[params.c] ? params.c : null;
  const set = (patch: Record<string, string | undefined>) => go('atlas', { i: params.i, f: params.f, t: params.t, folk: params.folk, c: params.c, o: params.o, ...patch }, true);
  const SORTS = { count: 'לפי מספר', world: 'לפי עולם', region: 'לפי אזור', abc: 'לפי א–ב' } as const;
  const sortBy = (params.o && params.o in SORTS ? params.o : 'count') as keyof typeof SORTS;
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
  const present = CULTURES.filter((c) => byCulture[c.id]);
  const cultRows = sortBy === 'abc' ? present.slice().sort((a, b) => a.he.localeCompare(b.he, 'he'))
    : sortBy === 'world' ? present.slice().sort((a, b) => WORLD_ORDER.indexOf(a.world) - WORLD_ORDER.indexOf(b.world) || byCulture[b.id].n - byCulture[a.id].n)
    : sortBy === 'region' ? present.slice().sort((a, b) => a.region.localeCompare(b.region, 'he') || byCulture[b.id].n - byCulture[a.id].n)
    : present.slice().sort((a, b) => byCulture[b.id].n - byCulture[a.id].n);
  const groupOf = (c: (typeof CULTURES)[number]) => sortBy === 'world' ? WORLDS[c.world].he : sortBy === 'region' ? c.region : '';
  // פרשנות של הנתונים: לא רק כמה, אלא מה זה אומר
  const regCount: Record<string, number> = {};
  list.forEach((s) => (regCount[CULTURE[s.culture].region] = (regCount[CULTURE[s.culture].region] || 0) + 1));
  const topReg = Object.entries(regCount).sort((a, b) => b[1] - a[1]);
  const aN = list.filter((s) => s.side === 'a').length, bN = list.filter((s) => s.side === 'b').length;
  const reading = !list.length ? '' : idea
    ? `**${idea.chip}** נאמר ב-**${regions}** אזורים. ${regions >= 4 ? '==רעיון אוניברסלי==: הוא לא שייך לתרבות אחת.' : '==רעיון אזורי==: רוב העדויות ב' + rh(topReg[0][0]) + '.'} ${aN > bN * 1.5 ? `העולם נוטה ל**${idea.a}**.` : bN > aN * 1.5 ? `העולם נוטה ל**${idea.b}**.` : 'שני הצדדים מאוזנים.'}`
    : `**${rh(topReg[0][0])}** ו**${rh(topReg[1]?.[0] || '')}** מחזיקים ב-**${Math.round(((topReg[0][1] + (topReg[1]?.[1] || 0)) / list.length) * 100)}%** מהאמירות. ==המאגר נשען על מסורות כתובות ותיקות==, ופחות על תרבויות שבעל פה.`;

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
          {reading && <Rich as="p" className="insight-line at-reading">{reading}</Rich>}
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
        <div className="list-sort" role="group" aria-label="סידור התרבויות">
          <span className="label">מסודר {SORTS[sortBy]} · לחיצה על תרבות פותחת דיוקן</span>
          <div className="eq-btns">
            {(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((k) => <button key={k} className="chip" aria-pressed={sortBy === k} onClick={() => set({ o: k === 'count' ? undefined : k })}>{SORTS[k].replace('לפי ', '')}</button>)}
          </div>
        </div>
        <div className="panel-bd scroll-in">
          {(() => {
            let last = '';
            return cultRows.map((c) => {
              const x = byCulture[c.id];
              const on = cult === c.id;
              const g = groupOf(c);
              const head = g !== last ? (last = g) : null;
              return (
                <div key={c.id}>
                  {head && <p className="cp-h">{head}</p>}
                  <div className={`cult-item${on ? ' on' : ''}`}>
                    <button className="cult-row" onClick={() => set({ c: on ? undefined : c.id })} aria-expanded={on}>
                      <span><Flag c={c.id} /><b>{c.he}</b><span className="en">{c.en}</span></span>
                      <span className="bar3"><i className="a" style={{ flex: x.a }} /><i className="b" style={{ flex: x.b }} /><i className="s" style={{ flex: x.s }} /></span>
                      <bdi className="num">{x.n}</bdi>
                    </button>
                    {on && <CultureProfile id={c.id} focusIdea={idea?.id || null} />}
                  </div>
                </div>
              );
            });
          })()}
          {!list.length && <p className="explain">אין אמירות בתקופה ובסינון האלה. אפשר להרחיב את התקופה או לאפס.</p>}
        </div>
      </aside>
    </main>
  );
}

function MapView({ byCulture, list, idea, cult, onCult, clock }: { byCulture: Record<string, { a: number; b: number; s: number; n: number }>; list: Saying[]; idea: string | null; cult: string | null; onCult: (c: string) => void; clock: number | null }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zb = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [sz, setSz] = useState({ w: 800, h: 420 });
  const [hover, setHover] = useState<string | null>(null);
  const [tf, setTf] = useState({ x: 0, y: 0, k: 1 });
  // זום בגלגלת ובגרירה, וכפתורים: המידע הצפוף במזרח התיכון נפרד כשמתקרבים
  useEffect(() => {
    const z = d3zoom<SVGSVGElement, unknown>().scaleExtent([1, 10]).on('zoom', (e) => setTf({ x: e.transform.x, y: e.transform.y, k: e.transform.k }));
    zb.current = z;
    select(svgRef.current!).call(z);
    return () => { select(svgRef.current!).on('.zoom', null); };
  }, []);
  const zoomBy = (f: number) => zb.current && select(svgRef.current!).transition().duration(300).call(zb.current.scaleBy, f);
  const zoomReset = () => zb.current && select(svgRef.current!).transition().duration(300).call(zb.current.transform, zoomIdentity);
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
    if (placed.every((q) => Math.abs(q.x - p.x) * tf.k > 86 || Math.abs(q.y - p.y) * tf.k > 18)) { placed.push(p); showLabel.add(p.c.id); }
  }
  const k = tf.k;
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
      <svg ref={svgRef} width={sz.w} height={sz.h} className="map" style={{ direction: 'ltr' }} aria-label="מפת העולם עם נקודה לכל תרבות. גלגלת: זום, גרירה: הזזה">
        <g transform={`translate(${tf.x},${tf.y}) scale(${k})`}>
        <path d={path({ type: 'Sphere' } as any) || ''} className="sphere" style={{ fill: 'url(#ocean)' }} />
        <path d={path(geoGraticule10()) || ''} className="grat" style={{ strokeWidth: 0.5 / k }} />
        <path d={path(LAND) || ''} className="land" filter="url(#landShadow)" style={{ strokeWidth: 0.6 / k, fill: 'url(#landFill)' }} />
        <defs>
          <radialGradient id="ocean" cx="50%" cy="45%" r="70%"><stop offset="0%" stopColor="#f4f7fa" /><stop offset="100%" stopColor="#e3e9ef" /></radialGradient>
          <linearGradient id="landFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f3f1ea" /><stop offset="100%" stopColor="#dedbd1" /></linearGradient>
          <filter id="landShadow" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#1a1a18" floodOpacity="0.28" /></filter>
          <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#1a1a18" floodOpacity="0.4" /></filter>
          <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6z" style={{ fill: 'var(--side-a)' }} /></marker>
        </defs>
        {arcs.map((p, i) => {
          const [o, n] = (p.a.year ?? 9999) <= (p.b.year ?? 9999) ? [p.a, p.b] : [p.b, p.a];
          const [x1, y1] = xy(o), [x2, y2] = xy(n);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.25;
          return <path key={i} d={`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`} className={`arc ink k-${p.kind}`} markerEnd="url(#arr)" style={{ ['--len' as string]: 1400, strokeWidth: 1.6 / k }} />;
        })}
        {pts.map((p) => (
          <g key={p.c.id} className={`cpt${cult === p.c.id ? ' on' : ''}`} onClick={() => onCult(p.c.id)} onMouseEnter={() => setHover(p.c.id)} onMouseLeave={() => setHover(null)}>
            <circle cx={p.x} cy={p.y} r={(p.r + 2) / Math.sqrt(k)} className="halo" filter="url(#pinShadow)" />
            {pie(p.x, p.y, p.r / Math.sqrt(k), p.v)}
            {(showLabel.has(p.c.id) || hover === p.c.id || cult === p.c.id) && (
              <g transform={`translate(${p.x + p.r / Math.sqrt(k) + 4 / k},${p.y}) scale(${1 / k})`}>
                <image href={`./flags/${p.c.flag}.svg`} x={0} y={-6} width={16} height={12} />
                <text x={20} y={4} className="clabel">{p.c.he}</text>
              </g>
            )}
          </g>
        ))}
        </g>
      </svg>
      <div className="zoom-ctl">
        <button className="press icon-btn" onClick={() => zoomBy(1.6)} aria-label="התקרבות" title="התקרבות (גם בגלגלת)"><Icon name="plus" size={14} /></button>
        <button className="press icon-btn" onClick={() => zoomBy(1 / 1.6)} aria-label="התרחקות" title="התרחקות"><Icon name="minus" size={14} /></button>
        <button className="press icon-btn" onClick={zoomReset} aria-label="איפוס זום" title="כל העולם"><Icon name="reset" size={14} /></button>
      </div>
      {clock != null && <div className="clock" aria-live="off"><b className="num">{Math.abs(clock)}</b><span>{clock < 0 ? 'לפנה״ס' : 'לספירה'}</span></div>}
      <p className="src map-note">גלגלת: זום · גרירה: הזזה · נקודה היא מקום מייצג של התרבות, והדגל הוא של המקום היום.</p>
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
      <p className="tl-why"><b>ציר הזמן</b>: כמה אמירות מתוארכות יש בכל מאה, מחמורבי ועד היום. <span className="lg-all" /> כל המאגר <span className="lg-in" /> בסינון הנוכחי <span className="lg-sel" /> התקופה שנבחרה. פתגמים עממיים בלי תאריך לא מופיעים על הציר.</p>
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

// דיוקן של תרבות דרך האמירות שלה: עולם המושגים, עקביות, דימויים, ערכים ועדשות. חישוב מהמאגר + פרשנות.
function CultureProfile({ id, focusIdea }: { id: string; focusIdea: string | null }) {
  const c = CULTURE[id];
  const [open, setOpen] = useState<string | null>(null);
  const all = SAYINGS.filter((s) => s.culture === id);
  const ideas: Record<string, { a: number; b: number; s: number }> = {};
  all.forEach((s) => ((ideas[s.idea] ||= { a: 0, b: 0, s: 0 })[s.side]++));
  const covered = Object.keys(ideas).length;
  const both = Object.entries(ideas).filter(([, v]) => v.a && v.b).map(([k]) => k);
  const syn = all.filter((s) => s.side === 's').length;
  const groupCount: Record<string, number> = {};
  all.forEach((s) => (groupCount[GROUP_OF[s.idea]] = (groupCount[GROUP_OF[s.idea]] || 0) + 1));
  const topGroups = Object.entries(groupCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([g]) => GROUPS.find((x) => x.id === g)!.he);
  const fam: Record<string, number> = {};
  all.forEach((s) => familiesOf(s).forEach((f) => (fam[f] = (fam[f] || 0) + 1)));
  const topFam = Object.entries(fam).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => FAMILIES.find((x) => x.id === f)!.he);
  const vals = all.filter((s) => s.side !== 's').map((s) => VALUES[s.idea][s.side as 'a' | 'b']);
  const valCount: Record<string, number> = {};
  vals.forEach((v) => (valCount[v] = (valCount[v] || 0) + 1));
  const topVals = Object.entries(valCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([v]) => v);
  const lens: Record<string, number> = {};
  Object.values(LENSES).forEach((ls) => ls.forEach((l) => l.c.includes(id) && (lens[l.lens] = (lens[l.lens] || 0) + 1)));
  const topLens = Object.entries(lens).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => l);
  const langs = [...new Set(all.map(langOf))].map((l) => LANGS[l]);
  const years = all.filter((s) => s.year != null).map((s) => s.year as number);
  const decisive = covered ? Math.round(((covered - both.length) / covered) * 100) : 0;
  const coherence = both.length === 0
    ? `**חד-משמעית**: בכל ${covered} המושגים היא בוחרת צד אחד ונשארת בו.`
    : both.length / covered > 0.4
      ? `**דיאלקטית**: ב-${both.length} מתוך ${covered} מושגים היא אומרת גם את הצד וגם את ההפך. ==זו תרבות שנותנת פתגם לכל מצב==.`
      : `**עקבית ברובה**: ${decisive}% מהמושגים בצד אחד, ורק ב-${both.length} היא מחזיקה בשניהם (${both.map((b) => IDEA[b].chip).join(', ')}).`;
  // בתוך הדיוקן הסדר קבוע: לפי מושג. הסידור הכללי של הרשימה יושב בראש המסגרת.
  const sorted = [...all].sort((a, b) => IDEAS.findIndex((i) => i.id === a.idea) - IDEAS.findIndex((i) => i.id === b.idea));
  const head = (s: Saying) => IDEA[s.idea].q;
  let last = '';
  return (
    <div className="cprof rise">
      <p className="src">מקום מייצג: <b>{c.place}</b> {c.placeEn} · עולם: {WORLDS[c.world].he} · שפות: {langs.join(', ')}{years.length ? <> · <Yr y={Math.min(...years)} />–<Yr y={Math.max(...years)} /></> : null}</p>
      <Rich as="p" className="insight-line">{PORTRAITS[c.world].head}</Rich>
      <ul className="cp-facts">
        <li><span className="label">עולם המושגים</span><Rich>{`מדברת בעיקר על **${topGroups.join('** ו**')}**: ${covered} מתוך ${IDEAS.length} מושגים במאגר.`}</Rich></li>
        <li><span className="label">עקביות</span><Rich>{coherence}</Rich></li>
        {syn > 0 && <li><span className="label">הכרעות</span><Rich>{`**${syn}** אמירות שמחזיקות בשני הצדדים במשפט אחד: ==חוכמה שמכריעה בעצמה==.`}</Rich></li>}
        {topFam.length > 0 && <li><span className="label">דימויים</span><Rich>{`לוקחת את התמונות שלה מ**${topFam.join('**, מ**')}**. ==זה מה שקרוב לעין שלה==.`}</Rich></li>}
        {topVals.length > 0 && <li><span className="label">ערכים</span><Rich>{`בוחרת ב**${topVals.join('**, **')}**.`}</Rich></li>}
        {topLens.length > 0 && <li><span className="label">עדשה</span><Rich>{`מסבירה מושגים דרך **${topLens.join('** ו**')}**.`}</Rich></li>}
      </ul>
      <p className="cp-h0">האמירות של {c.he}, לפי מושג</p>
      {sorted.map((s) => {
        const h = head(s);
        const showH = h !== last; last = h;
        const on = open === s.id;
        const lensI = (LENSES[s.idea] || []).find((l) => l.c.includes(s.culture));
        return (
          <div key={s.id}>
            {showH && <p className="cp-h">{h}</p>}
            <div className={`cc-row s-${s.side}${on ? ' on' : ''}${focusIdea && s.idea === focusIdea ? ' focus' : ''}`}>
              <button className="cc-btn" onClick={() => setOpen(on ? null : s.id)} aria-expanded={on}>
                <span className="say">"{s.nikud || s.he}"</span>
                <span className="src">{IDEA[s.idea].chip} · {s.side === 's' ? 'הכרעה' : VALUES[s.idea][s.side]} · <Yr y={s.year} approx={s.approx} /></span>
              </button>
              {on && (
                <div className="cc-more">
                  {s.orig && <p className="orig" lang={s.lang} dir="auto">"{s.orig}"</p>}
                  <p className="src">{LANGS[langOf(s)]} · {s.src}</p>
                  {lensI && <p className="gloss-lens"><span className={`lens-tag lt-${lensI.lens}`}>{lensI.lens}</span><Rich>{lensI.t}</Rich></p>}
                  {s.note && <p><mark className="insight">{s.note}</mark></p>}
                  <button className="linkish" onClick={() => go('daf', { i: s.idea, s: s.id })}>לדף של "{IDEA[s.idea].chip}"</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

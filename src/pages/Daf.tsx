// הדף: רעיון אחד בצורת דף גמרא. במרכז השאלה, מימין צד א, משמאל צד ב, ולמטה ההכרעה.
// חקירה בתוך הדף בשלוש רמות: משפחת נושאים ← רעיון ← אמירה. קשר לרעיון אחר נפתח כאן, בלי לעבור דף.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BY_IDEA, BY_ID, IDEA, IDEAS, CULTURE, KINDS, GROUPS, GROUP_OF, VALUES, LENSES, LANGS, langOf, relationsOf, where, km, fmt, matcher, type Saying, type Kind } from '../engine';
import { go } from '../route';
import { useStore } from '../store';
import Rich, { Yr } from '../Rich';
import { Icon } from '../icons';
import Voice from '../components/Voice';
import Flag, { CultureName } from '../components/Flag';
import { SidePic } from '../components/Art';

const SIDE_HE = { a: 'צד א', b: 'צד ב', s: 'הכרעה' } as const;
type IdeaT = (typeof IDEAS)[number];

export default function Daf({ params }: { params: Record<string, string> }) {
  const idea = IDEA[params.i] || IDEAS[0];
  const sel = params.s && BY_ID[params.s] ? BY_ID[params.s] : null;
  const [tab, setTab] = useState('2');
  const group = GROUPS.find((g) => g.id === GROUP_OF[idea.id])!;
  const order = GROUPS.flatMap((g) => g.ideas);
  const ix = order.indexOf(idea.id);
  const nav = (d: number) => go('daf', { i: order[(ix + d + order.length) % order.length] }, true);
  const select = (s: Saying | null) => go('daf', { i: idea.id, s: s?.id }, true);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea')) return;
      if (e.key === 'Escape') select(null);
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  });

  return (
    <main className="app-main daf-page">
      <div className="idea-strip no-print">
        <button className="press icon-btn" onClick={() => nav(-1)} aria-label="הרעיון הקודם" title="הרעיון הקודם"><Icon name="prev" /></button>
        <div className="groups" role="group" aria-label="משפחות נושאים">
          {GROUPS.map((g) => (
            <button key={g.id} className="chip grp" aria-pressed={g.id === group.id} onClick={() => go('daf', { i: g.ideas[0] }, true)}>{g.he}</button>
          ))}
        </div>
        <div className="topics" role="group" aria-label={`רעיונות: ${group.he}`}>
          {group.ideas.map((id) => {
            const i = IDEA[id];
            return (
              <button key={id} className="topic" aria-pressed={id === idea.id} onClick={() => go('daf', { i: id }, true)}>
                <Icon name={i.motif} size={18} /><span>{i.chip}</span>
              </button>
            );
          })}
        </div>
        <span className="label"><bdi className="num">{ix + 1}/{order.length}</bdi></span>
        <button className="press icon-btn" onClick={() => nav(1)} aria-label="הרעיון הבא" title="הרעיון הבא"><Icon name="next" /></button>
      </div>

      <div className="zone-tabs" role="tablist" aria-label="אזורי הדף">
        {[['1', 'היכרות'], ['2', 'הבנה'], ['3', 'יישום']].map(([n, t]) => (
          <button key={n} role="tab" className="chip" aria-pressed={tab === n} aria-selected={tab === n} onClick={() => setTab(n)}><span className="zone-n sm">{n}</span>{t}</button>
        ))}
      </div>

      <div className="zones" data-tab={tab}>
        <Intro idea={idea} />
        <Understand idea={idea} sel={sel} select={select} />
        <Apply idea={idea} />
      </div>
    </main>
  );
}

function Intro({ idea }: { idea: IdeaT }) {
  const ss = BY_IDEA[idea.id];
  const oldest = ss.filter((s) => s.year != null).sort((a, b) => (a.year as number) - (b.year as number))[0];
  const v = VALUES[idea.id];
  return (
    <section className="panel zone" data-zone="1" aria-labelledby="z1">
      <div className="zone-hd"><span className="zone-n">1</span><h2 id="z1">היכרות</h2><span className="label">מה זה</span></div>
      <div className="panel-bd scroll-in lines-lg" key={idea.id}>
        <div className="idea-title rise">
          <Icon name={idea.motif} size={30} />
          <h1>{idea.q}</h1>
        </div>
        <p className="values rise"><span className="side-a">צד א: <b>{v.a}</b></span><span className="sep">מול</span><span className="side-b">צד ב: <b>{v.b}</b></span></p>
        <Rich as="p" className="insight-line rise">{idea.insight}</Rich>
        <Rich as="p" className="explain rise">{idea.explain}</Rich>
        {oldest && (
          <figure className="oldest rise">
            <span className="label">העדות הקדומה במאגר</span>
            <blockquote className="say">"{oldest.nikud || oldest.he}"</blockquote>
            <figcaption className="src"><Flag c={oldest.culture} />{CULTURE[oldest.culture].he}, {oldest.src} · <Yr y={oldest.year} approx={oldest.approx} /></figcaption>
          </figure>
        )}
        <div className="story rise">
          <span className="label">סיפור הגילוי</span>
          <Rich as="p">{idea.story}</Rich>
        </div>
        <div className="haiku rise">
          <span className="label">הייקו</span>
          {idea.haiku.map((l, i) => <p key={i} className="say">{l}</p>)}
          <p className="src">{idea.haikuNote}</p>
        </div>
      </div>
    </section>
  );
}

type Line = { d: string; cls: string; len: number };

function Understand({ idea, sel, select }: { idea: IdeaT; sel: Saying | null; select: (s: Saying | null) => void }) {
  const [st] = useStore();
  const ss = BY_IDEA[idea.id];
  const A = ss.filter((s) => s.side === 'a'), B = ss.filter((s) => s.side === 'b'), S = ss.filter((s) => s.side === 's');
  const m = useMemo(() => matcher(st.q), [st.q]);
  const [hover, setHover] = useState<string | null>(null);
  const inIdea = sel && sel.idea === idea.id ? sel : null;
  const focus = hover || inIdea?.id || null;
  const wrap = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const items = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const rels = useMemo(() => (focus ? relationsOf(focus).filter((r) => r.other.idea === idea.id) : []), [focus, idea.id]);

  // קווי דיו: כל אמירה מחוברת למרכז, והאמירה שבמוקד מחוברת לקרובותיה לפי סוג הקשר
  useLayoutEffect(() => {
    const el = wrap.current, c = core.current;
    if (!el || !c) return;
    const draw = () => {
      const box = el.getBoundingClientRect();
      if (!box.width) return;
      const cr = c.getBoundingClientRect();
      const L: Line[] = [];
      const rel = (r: DOMRect) => ({ l: r.left - box.left + el.scrollLeft, r: r.right - box.left + el.scrollLeft, t: r.top - box.top + el.scrollTop, b: r.bottom - box.top + el.scrollTop, cy: r.top - box.top + el.scrollTop + r.height / 2, cx: r.left - box.left + el.scrollLeft + r.width / 2 });
      const C = rel(cr);
      const stacked = getComputedStyle(el).getPropertyValue('--stacked').trim() === '1';
      if (!stacked) {
        for (const s of ss) {
          const n = items.current[s.id];
          if (!n) continue;
          const R = rel(n.getBoundingClientRect());
          let d: string;
          if (s.side === 'a') d = `M${R.l} ${R.cy} C${R.l - 30} ${R.cy} ${C.r + 30} ${C.cy} ${C.r} ${C.cy}`;
          else if (s.side === 'b') d = `M${R.r} ${R.cy} C${R.r + 30} ${R.cy} ${C.l - 30} ${C.cy} ${C.l} ${C.cy}`;
          else d = `M${R.cx} ${R.t} C${R.cx} ${R.t - 24} ${C.cx} ${C.b + 24} ${C.cx} ${C.b}`;
          L.push({ d, cls: `spoke s-${s.side}${focus && focus !== s.id ? ' dim' : ''}`, len: 400 });
        }
        if (focus) {
          const f = items.current[focus];
          if (f) {
            const F = rel(f.getBoundingClientRect());
            for (const r of rels) {
              const n = items.current[r.other.id];
              if (!n) continue;
              const R = rel(n.getBoundingClientRect());
              const same = Math.abs(F.cx - R.cx) < 4;
              const bow = F.cx > C.cx ? 60 : -60;
              const d = same
                ? `M${F.cx} ${F.cy} C${F.cx + bow} ${F.cy} ${R.cx + bow} ${R.cy} ${R.cx} ${R.cy}`
                : `M${F.cx} ${F.cy} Q${(F.cx + R.cx) / 2} ${Math.min(F.cy, R.cy) - 40} ${R.cx} ${R.cy}`;
              L.push({ d, cls: `rel k-${r.kind}`, len: 900 });
            }
          }
        }
      }
      setSize({ w: el.scrollWidth, h: el.scrollHeight });
      setLines(L);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [idea.id, focus, rels, ss]);

  const tilt = Math.max(-9, Math.min(9, ((A.length - B.length) / Math.max(1, A.length + B.length)) * 18));
  const Item = (s: Saying) => {
    const dim = m && !m(s);
    const kind = focus && focus !== s.id ? rels.find((r) => r.other.id === s.id)?.kind : undefined;
    return (
      <button
        key={s.id} ref={(n) => { items.current[s.id] = n; }}
        className={`gloss-item s-${s.side}${inIdea?.id === s.id ? ' on' : ''}${dim ? ' dim' : ''}${kind ? ' k-' + kind : ''}`}
        onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(s.id)} onBlur={() => setHover(null)}
        onClick={() => select(inIdea?.id === s.id ? null : s)} aria-pressed={inIdea?.id === s.id}
      >
        <span className={`say${s.nikud ? ' nikud' : ''}`}>"{s.nikud || s.he}"</span>
        <span className="meta"><Flag c={s.culture} /><b>{CULTURE[s.culture].he}</b><Yr y={s.year} approx={s.approx} /></span>
        {kind && <span className="kind-tag">{KINDS[kind].he}</span>}
      </button>
    );
  };

  return (
    <section className="panel zone" data-zone="2" aria-labelledby="z2">
      <div className="zone-hd"><span className="zone-n">2</span><h2 id="z2">הבנה</h2>
        <div className="legend daf-legend">
          <span><span className="dot a" />{idea.a}</span>
          <span><span className="dot b" />{idea.b}</span>
          <span><span className="dot s" />הכרעה</span>
          {focus && (Object.keys(KINDS) as Kind[]).map((k) => <span key={k} className={`lg-${k}`}><i style={{ borderColor: KINDS[k].tone }} />{KINDS[k].he}</span>)}
        </div>
      </div>
      <div className="daf-body">
        <div className="daf" ref={wrap} key={idea.id}>
          <svg className="daf-lines" width={size.w} height={size.h} aria-hidden="true">
            {lines.map((l, i) => <path key={l.d + i} d={l.d} className={`ink ${l.cls}`} style={{ ['--len' as string]: l.len, animationDelay: `${l.cls.startsWith('spoke') ? i * 0.03 : 0}s` }} />)}
          </svg>
          <div className="col col-a" aria-label={`צד א: ${idea.a}`}>
            <div className="col-hd side-a"><span className="dot a" />{idea.a} <bdi className="num">{A.length}</bdi></div>
            <SidePic idea={idea.id} side="a" label={idea.a} />
            {A.map(Item)}
          </div>
          <div className="core-wrap">
            <div className="core" ref={core}>
              <Icon name={idea.motif} size={26} />
              <p className="core-q">{idea.q}</p>
              <svg className="beam" viewBox="0 0 160 46" aria-label={`המאזניים: ${A.length} מול ${B.length}`}>
                <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '80px 16px', transition: 'transform .8s' }}>
                  <line x1="14" y1="16" x2="146" y2="16" stroke="var(--ink)" strokeWidth="1.5" />
                  <rect x="134" y="20" width="22" height="8" style={{ fill: 'var(--side-a)' }} />
                  <rect x="4" y="20" width="22" height="8" style={{ fill: 'var(--side-b)' }} />
                </g>
                <path d="M80 16 L72 44 H88 Z" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              </svg>
              <p className="core-n"><span className="side-a">{idea.a} <bdi className="num">{A.length}</bdi></span><span className="side-b">{idea.b} <bdi className="num">{B.length}</bdi></span></p>
            </div>
          </div>
          <div className="col col-b" aria-label={`צד ב: ${idea.b}`}>
            <div className="col-hd side-b"><span className="dot b" />{idea.b} <bdi className="num">{B.length}</bdi></div>
            <SidePic idea={idea.id} side="b" label={idea.b} />
            {B.map(Item)}
          </div>
          {S.length > 0 && (
            <div className="col col-s" aria-label="הכרעה">
              <div className="col-hd side-s"><span className="dot s" />מחזיקים בשני הצדדים</div>
              <div className="col-s-row">{S.map(Item)}</div>
            </div>
          )}
        </div>
        {sel ? <Gloss idea={idea} sel={sel} select={select} /> : <Lenses idea={idea} />}
      </div>
    </section>
  );
}

// עדשות: איך כל תרבות מסגרת את אותו מושג. זו שכבת הפרשנות.
function Lenses({ idea }: { idea: IdeaT }) {
  const ls = LENSES[idea.id] || [];
  return (
    <div className="gloss lenses" key={idea.id}>
      <div className="lens-hd"><span className="label">עדשות · איך כל תרבות רואה את זה</span><span className="src">פרשנות של Claude על סמך המקורות. לחיצה על אמירה פותחת אותה כאן.</span></div>
      <ul>
        {ls.map((l, i) => (
          <li key={i}>
            <span className={`lens-tag lt-${l.lens}`}>{l.lens}</span>
            <span className="lens-c">{l.c.map((c) => <Flag key={c} c={c} />)}<b>{l.c.map((c) => CULTURE[c].he).join(', ')}</b></span>
            <Rich className="lens-t">{l.t}</Rich>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Gloss({ idea, sel, select }: { idea: IdeaT; sel: Saying; select: (s: Saying | null) => void }) {
  const ss = BY_IDEA[idea.id];
  const foreign = sel.idea !== idea.id;
  const c = CULTURE[sel.culture];
  const w = where(sel);
  const rels = relationsOf(sel.id);
  const groups = (Object.keys(KINDS) as Kind[]).map((k) => ({ k, list: rels.filter((r) => r.kind === k) })).filter((g) => g.list.length);
  const i = ss.indexOf(sel);
  const lens = (LENSES[sel.idea] || []).find((l) => l.c.includes(sel.culture));
  const sIdea = IDEA[sel.idea];
  const sideName = sel.side === 'a' ? sIdea.a : sel.side === 'b' ? sIdea.b : 'מחזיק בשניהם';
  return (
    <div className={`gloss${foreign ? ' foreign' : ''}`} key={sel.id}>
      <div className="gloss-ctl">
        {!foreign && <>
          <span className="label"><bdi className="num">{i + 1}/{ss.length}</bdi></span>
          <button className="press icon-btn" onClick={() => select(ss[(i - 1 + ss.length) % ss.length])} aria-label="האמירה הקודמת" title="הקודמת"><Icon name="prev" size={14} /></button>
          <button className="press icon-btn" onClick={() => select(ss[(i + 1) % ss.length])} aria-label="האמירה הבאה" title="הבאה"><Icon name="next" size={14} /></button>
        </>}
        <button className="press icon-btn" onClick={() => select(null)} aria-label="סגירה" title="סגירה (Esc)"><Icon name="x" size={14} /></button>
      </div>
      <div className="gloss-grid">
        <div>
          {foreign && <p className="foreign-note">מרעיון אחר: <b>{sIdea.q}</b> <button className="linkish" onClick={() => go('daf', { i: sel.idea, s: sel.id })}>מעבר לדף שלו</button></p>}
          <span className={`label side-${sel.side}`}>{SIDE_HE[sel.side]} · {sideName} · ערך: {sel.side === 's' ? 'איזון' : VALUES[sel.idea][sel.side]}{sel.orig ? ' · תרגום' : ''}</span>
          <p className={`say gloss-say${sel.nikud ? ' nikud' : ''}`}>"{sel.nikud || sel.he}"</p>
          {sel.orig && <p className="orig" lang={sel.lang} dir="auto">"{sel.orig}"</p>}
          {sel.note && <p className="gloss-note"><mark className="insight">{sel.note}</mark></p>}
          {lens && <p className="gloss-lens"><span className={`lens-tag lt-${lens.lens}`}>{lens.lens}</span><Rich>{lens.t}</Rich></p>}
        </div>
        <dl className="facts">
          <div><dt className="label">תרבות</dt><dd><CultureName c={sel.culture} en /></dd></div>
          <div><dt className="label">שפה</dt><dd><b>{LANGS[langOf(sel)]}</b></dd></div>
          <div><dt className="label">מקום</dt><dd><b>{w.he}</b><span className="en">{w.en}</span></dd></div>
          <div><dt className="label">שנה</dt><dd><Yr y={sel.year} approx={sel.approx} /></dd></div>
          <div className="wide"><dt className="label">מקור</dt><dd className="src">{sel.src}</dd></div>
        </dl>
        <div className="gloss-rel">
          {groups.map((g) => (
            <div key={g.k} className="rel-row">
              <span className={`rel-k k-${g.k}`}>{KINDS[g.k].he}</span>
              {g.list.slice(0, 6).map((r) => (
                <button key={r.other.id} className="chip" onClick={() => select(r.other)} title={`"${r.other.he}"${r.note ? ' · ' + r.note : ''}`}>
                  <Flag c={r.other.culture} />{CULTURE[r.other.culture].he}{r.other.culture !== sel.culture && <bdi className="km"> {fmt(km(sel, r.other))} ק"מ</bdi>}{r.other.idea !== sel.idea && <span className="src"> · {IDEA[r.other.idea].chip}</span>}
                </button>
              ))}
              {g.list.length > 6 && <span className="src">ועוד <bdi className="num">{g.list.length - 6}</bdi></span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Apply({ idea }: { idea: IdeaT }) {
  const [st, set] = useStore();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const note = st.notes[idea.id] || '';
  const stance = st.stance[idea.id];
  useEffect(() => { setShowPost(false); setCopied(false); }, [idea.id]);
  const write = (v: string) => { set((s) => ({ ...s, notes: { ...s.notes, [idea.id]: v } })); setSaved(true); window.clearTimeout((write as any).t); (write as any).t = window.setTimeout(() => setSaved(false), 1600); };
  const copy = async () => {
    const text = idea.post.replace(/\*\*|==/g, '');
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setShowPost(true); }
  };
  const ss = BY_IDEA[idea.id];
  const syn = ss.filter((s) => s.side === 's');
  return (
    <section className="panel zone" data-zone="3" aria-labelledby="z3">
      <div className="zone-hd"><span className="zone-n">3</span><h2 id="z3">יישום</h2><span className="label">מה עושים</span></div>
      <div className="panel-bd scroll-in apply" key={idea.id}>
        {syn.length > 0 && (
          <div className="synth rise">
            <span className="label side-s">ההכרעה של המסורת</span>
            {syn.map((s) => (
              <figure key={s.id}>
                <blockquote className="say nikud">"{s.nikud || s.he}"</blockquote>
                <figcaption className="src"><Flag c={s.culture} />{CULTURE[s.culture].he} · {s.src}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="tone tone-solution rule rise">
          <h4>כלל ההכרעה</h4>
          <p><span className="dot a" /><strong className="side-a">{idea.a}</strong> <Rich>{idea.rule.a}</Rich></p>
          <p><span className="dot b" /><strong className="side-b">{idea.b}</strong> <Rich>{idea.rule.b}</Rich></p>
        </div>
        <div className="city rise">
          <span className="label">בעיר{idea.city.place ? ' · ' : ''}{idea.city.place && <><b className="place">{idea.city.place}</b><span className="en">{idea.city.placeEn}</span></>}</span>
          <Rich as="p">{idea.city.text}</Rich>
        </div>
        <div className="check rise">
          <span className="label">שאלת בקרה</span>
          <p className="say">{idea.check}</p>
        </div>
        <div className="mine rise">
          <span className="label">הצד שלי היום</span>
          <div className="stance" role="group" aria-label="הצד שלי">
            {(['a', 'b', 's'] as const).map((k) => (
              <button key={k} className={`press btn st-${k}`} aria-pressed={stance === k} onClick={() => set((s) => ({ ...s, stance: { ...s.stance, [idea.id]: stance === k ? undefined as any : k } }))}>
                {k === 'a' ? idea.a : k === 'b' ? idea.b : 'תלוי'}
              </button>
            ))}
          </div>
          <label className="label" htmlFor={`note-${idea.id}`}>האמירה שלי</label>
          <textarea id={`note-${idea.id}`} className="field" rows={2} placeholder="פתגם משלך, או מתי זה קרה לך" value={note} onChange={(e) => write(e.target.value)} />
          <div className="mine-ft"><Voice value={note} onChange={write} />{saved && <span className="saved">נשמר</span>}</div>
        </div>
        <div className="post rise">
          <div className="post-hd">
            <span className="label">פוסט</span>
            <button className="press btn" onClick={() => setShowPost((v) => !v)} aria-expanded={showPost}>{showPost ? 'הסתרה' : 'קריאה'}</button>
            <button className="press btn" onClick={copy}><Icon name="copy" size={14} /> {copied ? 'הועתק' : 'העתקה'}</button>
          </div>
          {showPost && <div className="post-text">{idea.post.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>}
        </div>
        <details className="sources">
          <summary>מקורות (<bdi className="num">{ss.length}</bdi>)</summary>
          <ol>{ss.map((s) => <li key={s.id}>"{s.nikud || s.he}": {s.src}</li>)}</ol>
        </details>
      </div>
    </section>
  );
}

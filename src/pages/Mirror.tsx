// מראה: ארבע דרכים שבהן שתי אמירות קשורות. שני צירים: דמיון במילים ודמיון במשמעות.
// שלוש רמות בתוך הדף: סוג הקשר (ימין) ← רשימת הזוגות (מרכז) ← זוג אחד עם פרשנות (שמאל).
import { useMemo, useState } from 'react';
import { PAIRS, KINDS, CULTURE, IDEA, GROUPS, GROUP_OF, VALUES, LANGS, langOf, km, yearGap, fmt, where, matcher, langCulture, type Kind, type Pair } from '../engine';
import { go } from '../route';
import { useStore } from '../store';
import Rich, { Yr } from '../Rich';
import Flag, { CultureName } from '../components/Flag';

const ORDER: Kind[] = ['twin', 'cousin', 'impostor', 'rival'];
const pid = (p: Pair) => p.a.id + '~' + p.b.id;
const valueOf = (s: Pair['a']) => (s.side === 's' ? 'איזון' : VALUES[s.idea][s.side]);

export default function Mirror({ params }: { params: Record<string, string> }) {
  const [st] = useStore();
  const kind = (params.k && params.k in KINDS ? params.k : 'cousin') as Kind;
  // תחום הזוגות: בין תרבויות (ברירת מחדל), בתוך אותה תרבות בלבד, או הכול
  const scope = params.x === 'same' ? 'same' : params.x === 'all' ? 'all' : 'cross';
  const grp = params.g || '';
  const [more, setMore] = useState(60);
  const m = useMemo(() => matcher(st.q), [st.q]);
  const base = useMemo(() => PAIRS.filter((p) => scope === 'all' || (scope === 'same' ? p.a.culture === p.b.culture : p.a.culture !== p.b.culture)), [scope]);
  const counts = useMemo(() => { const c = { twin: 0, cousin: 0, impostor: 0, rival: 0 } as Record<Kind, number>; base.forEach((p) => c[p.kind]++); return c; }, [base]);
  const list = useMemo(() => base.filter((p) => p.kind === kind && (!grp || GROUP_OF[p.a.idea] === grp || GROUP_OF[p.b.idea] === grp) && (!m || m(p.a) || m(p.b)))
    .map((p) => ({ p, d: km(p.a, p.b) })).sort((x, y) => y.d - x.d), [base, kind, grp, m]);
  const sel = useMemo(() => {
    if (!params.p) return list[0]?.p || null;
    const [a, b] = params.p.split('~');
    return PAIRS.find((p) => (p.a.id === a && p.b.id === b) || (p.a.id === b && p.b.id === a)) || null;
  }, [params.p, list]);
  const set = (patch: Record<string, string | undefined>) => go('mirror', { k: params.k, x: params.x, g: params.g, p: params.p, ...patch }, true);
  const lc = useMemo(langCulture, []);
  const sameWorldRivals = base.filter((p) => p.kind === 'rival' && CULTURE[p.a.culture].world === CULTURE[p.b.culture].world).length;
  const crossTwins = PAIRS.filter((p) => p.kind === 'twin' && langOf(p.a) !== langOf(p.b)).length;
  const INTERP: Record<Kind, string> = {
    twin: `**${crossTwins}** תאומים חוצים שפה: ==פתגם שנדד בתרגום==, או שתי תרבויות שראו אותו דבר בטבע.`,
    cousin: `==המחשבה אוניברסלית, הדימוי מקומי==. כאן רואים איך כל תרבות מלבישה רעיון בנוף שלה.`,
    impostor: `==מלכודת תרגום==: אותה תמונה, ומשמעות אחרת. למשל טיפה שחוצבת אבן, וטיפה בים.`,
    rival: `**${sameWorldRivals}** מהיריבים הם ==באותו עולם תרבותי==: תרבות שמחזיקה בשני הצדדים.`,
  };

  return (
    <main className="app-main mirror-page">
      <aside className="panel m-side">
        <div className="panel-bd scroll-in">
          <span className="label">1 · סוג הקשר</span>
          <h1 className="m-title">כמה דומה השונה, וכמה שונה הדומה</h1>
          <div className="quad" role="group" aria-label="ארבעת סוגי הקשר">
            <span className="ax ax-top">אותה משמעות</span>
            <span className="ax ax-bottom">משמעות אחרת</span>
            <span className="ax ax-right">אותן מילים</span>
            <span className="ax ax-left">מילים אחרות</span>
            {ORDER.map((k) => (
              <button key={k} className={`qcell q-${k}`} aria-pressed={kind === k} onClick={() => set({ k, p: undefined })}>
                <span className="q-name">{KINDS[k].he}</span>
                <bdi className="num q-n">{fmt(counts[k])}</bdi>
                <span className="q-line">{KINDS[k].line}</span>
              </button>
            ))}
          </div>
          <Rich as="p" className="insight-line q-interp">{INTERP[kind]}</Rich>
          <div className="scope" role="group" aria-label="תחום הזוגות">
            <span className="label">אילו זוגות</span>
            <div className="chips">
              {([['cross', 'בין תרבויות'], ['same', 'בתוך אותה תרבות'], ['all', 'הכול']] as const).map(([k, t]) => (
                <button key={k} className="chip" aria-pressed={scope === k} onClick={() => set({ x: k === 'cross' ? undefined : k, p: undefined })}>{t}</button>
              ))}
            </div>
            {scope === 'same' && <Rich as="p" className="src">{'==תרבות שמדברת עם עצמה==: כאן רואים איפה תרבות אחת אומרת גם וגם.'}</Rich>}
          </div>
          <div className="tone tone-insight lc-box">
            <h4>שפה אינה תרבות</h4>
            <p><strong>{lc.splits.length}</strong> זוגות באותה שפה, בשתי תרבויות, עם משמעות הפוכה. למשל באנגלית: <b>אנגליה</b> מול <b>ארצות הברית</b>, ובלטינית: <b>רומא</b> מול <b>הכנסייה</b>.</p>
          </div>
          <p className="src">דמיון במילים: חלק הדימויים המשותפים (יחס ז'קאר). דמיון במשמעות: אותו צד במחלוקת, או צדדים מנוגדים.</p>
        </div>
      </aside>

      <section className="panel m-list" aria-label="רשימת הזוגות">
        <div className="panel-hd">
          <span className="label">2 · הזוגות</span>
          <h2><bdi className="num">{fmt(list.length)}</bdi> זוגות מסוג {KINDS[kind].he}</h2>
          <span className="src">מהרחוק לקרוב</span>
        </div>
        <div className="chips grp-pick" role="group" aria-label="משפחת נושאים">
          <button className="chip" aria-pressed={!grp} onClick={() => set({ g: undefined, p: undefined })}>הכול</button>
          {GROUPS.map((g) => <button key={g.id} className="chip" aria-pressed={grp === g.id} onClick={() => set({ g: grp === g.id ? undefined : g.id, p: undefined })}>{g.he}</button>)}
        </div>
        <div className="scroll-in pair-list">
          {list.slice(0, more).map(({ p, d }) => (
            <button key={pid(p)} className={`pair-row k-${p.kind}${sel === p ? ' on' : ''}`} onClick={() => set({ p: pid(p) })} aria-pressed={sel === p}>
              <span className="pr-side"><span className="say">"{p.a.nikud || p.a.he}"</span><span className="pr-c"><Flag c={p.a.culture} />{CULTURE[p.a.culture].he}</span></span>
              <span className="pr-mid"><i /><bdi className="km">{fmt(d)} ק"מ</bdi></span>
              <span className="pr-side"><span className="say">"{p.b.nikud || p.b.he}"</span><span className="pr-c"><Flag c={p.b.culture} />{CULTURE[p.b.culture].he}</span></span>
            </button>
          ))}
          {list.length > more && <button className="press btn more" onClick={() => setMore((n) => n + 60)}>עוד <bdi className="num">{Math.min(60, list.length - more)}</bdi> זוגות</button>}
          {!list.length && <p className="explain">אין זוגות בסינון הזה. אפשר לבחור "הכול", או לכלול זוגות מאותה תרבות.</p>}
        </div>
      </section>

      <aside className="panel m-detail" aria-live="polite">
        {sel ? <PairCard p={sel} /> : <div className="panel-bd"><p className="explain">בחרו זוג מהרשימה.</p></div>}
      </aside>
    </main>
  );
}

function Side({ s }: { s: Pair['a'] }) {
  const w = where(s);
  return (
    <div className={`pc-side s-${s.side}`}>
      <p className={`say${s.nikud ? ' nikud' : ''}`}>"{s.nikud || s.he}"</p>
      {s.orig && <p className="orig" lang={s.lang} dir="auto">"{s.orig}"</p>}
      <p className="pc-meta"><CultureName c={s.culture} en /> · <b>{w.he}</b><span className="en">{w.en}</span> · {LANGS[langOf(s)]} · <Yr y={s.year} approx={s.approx} /></p>
      <p className="src">{s.src}</p>
    </div>
  );
}

function lesson(p: Pair) {
  const A = CULTURE[p.a.culture].he, B = CULTURE[p.b.culture].he;
  const shared = p.a.motifs.filter((x) => p.b.motifs.includes(x));
  const sameC = p.a.culture === p.b.culture;
  const sameLang = langOf(p.a) === langOf(p.b);
  switch (p.kind) {
    case 'twin':
      return sameC ? `**אותה תרבות חוזרת על עצמה**: ${A} אומרת זאת פעמיים, וכך מחזקת את הרעיון.` : `**אותה תמונה ב${A} וב${B}**${sameLang ? ', באותה שפה' : ', בשתי שפות'}: ==או שהפתגם נדד בתרגום, או ששתי התרבויות ראו אותו דבר==.`;
    case 'cousin': {
      const ma = p.a.motifs.join(', ') || 'מילים פשוטות', mb = p.b.motifs.join(', ') || 'מילים פשוטות';
      return `**אותה מחשבה, נוף אחר**: ${A} אומרת אותה דרך **${ma}**, ו${B} דרך **${mb}**. ==הדימוי מלמד מה קרוב לעין של כל תרבות==.`;
    }
    case 'impostor':
      return `**מלכודת תרגום**: ${shared.length ? `**${shared.join(', ')}**` : 'אותן מילים'} משמש ב${A} ל**${valueOf(p.a)}**, וב${B} ל**${valueOf(p.b)}**. ==מי שמתרגם מילה במילה, מתרגם לא נכון==.`;
    case 'rival':
      return `**${valueOf(p.a)}** מול **${valueOf(p.b)}**${CULTURE[p.a.culture].world === CULTURE[p.b.culture].world ? ': ==בתוך אותו עולם תרבותי==, שמחזיק בשני הצדדים' : `: ${A} ו${B} בוחרות ערכים הפוכים`}. כלל ההכרעה בדף מסביר מתי כל צד נכון.`;
  }
}

function PairCard({ p }: { p: Pair }) {
  const d = km(p.a, p.b), g = yearGap(p.a, p.b);
  return (
    <div className="panel-bd scroll-in pc" key={pid(p)}>
      <div className="pc-hd">
        <span className="label">3 · הזוג</span>
        <span className={`pc-kind k-${p.kind}`}>{KINDS[p.kind].he}</span>
        <span className="src">{KINDS[p.kind].line}</span>
      </div>
      <Rich as="p" className="insight-line pc-lesson">{lesson(p)}</Rich>
      {p.note && <p className="pc-note"><mark className="insight">{p.note}</mark></p>}
      <Side s={p.a} />
      <div className="pc-bridge">
        <div><span className="label">מרחק</span><b className="num">{fmt(d)}</b> <span className="src">ק"מ</span></div>
        <div><span className="label">פער זמן</span>{g == null ? <span className="src">עממי</span> : <><b className="num">{fmt(g)}</b> <span className="src">שנים</span></>}</div>
        <div><span className="label">במילים</span><b className="num">{Math.round(p.surface * 100)}%</b></div>
        <div><span className="label">במשמעות</span><b className="num">{p.meaning > 0 ? '+' : ''}{Math.round(p.meaning * 100)}</b></div>
      </div>
      <Side s={p.b} />
      <p className="src">רעיון: {IDEA[p.a.idea].q}{p.a.idea !== p.b.idea ? ` · ${IDEA[p.b.idea].q}` : ''}</p>
    </div>
  );
}

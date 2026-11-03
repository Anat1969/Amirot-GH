// תובנות: לא כמה, אלא מה זה אומר. עולמות ערכים, עדשות, ושפה מול תרבות.
// שלוש רמות בתוך הדף: עולם (ימין) ← דיוקן הערכים שלו (מרכז) ← העדויות (שמאל).
import { useMemo, useState } from 'react';
import { IDEA, CULTURE, SAYINGS, WORLDS, WORLD_ORDER, PORTRAITS, VALUES, LENSES, LENS_LINE, LANGS, langOf, worldStats, langCulture, stats, fmt, type World, type Saying } from '../engine';
import { go } from '../route';
import { useStore } from '../store';
import Rich, { Yr } from '../Rich';
import Flag from '../components/Flag';

export default function Trends({ params }: { params: Record<string, string> }) {
  const w = (params.w && params.w in WORLDS ? params.w : '') as World | '';
  const set = (patch: Record<string, string | undefined>) => go('trends', { w: params.w, i: params.i, v: params.v, o: params.o, ...patch }, true);
  // סידור הרשימה: הכלי בראש המסגרת, וכתוב לפי מה היא מסודרת
  const order = (['tradition', 'size', 'dialectic', 'oral'].includes(params.o) ? params.o : 'tradition') as 'tradition' | 'size' | 'dialectic' | 'oral';
  const ORDERS = { tradition: 'לפי מסורת', size: 'לפי גודל', dialectic: 'לפי סתירה', oral: 'לפי מסירה בעל פה' } as const;
  const rows = WORLD_ORDER.map(worldStats).filter((x) => x.ss.length);
  const metric = (x: ReturnType<typeof worldStats>) =>
    order === 'size' ? x.ss.length
    : order === 'dialectic' ? x.both.length / Math.max(1, Object.keys(x.ideas).length)
    : order === 'oral' ? x.ss.filter((s) => s.year == null).length / x.ss.length : 0;
  const sorted = order === 'tradition' ? rows : rows.slice().sort((a, b) => metric(b) - metric(a));
  const metricLabel = (x: ReturnType<typeof worldStats>) =>
    order === 'size' ? `${x.ss.length} אמירות`
    : order === 'dialectic' ? `גם וגם ב-${x.both.length} מתוך ${Object.keys(x.ideas).length}`
    : order === 'oral' ? `${Math.round(metric(x) * 100)}% עממי בלי תאריך` : '';
  const [tab, setTab] = useState('m');
  return (
    <main className="app-main trends-page" data-tab={tab}>
      <div className="tr-tabs" role="tablist" aria-label="רמות">
        {[['m', 'עולמות'], ['f', 'דיוקן'], ['i', 'עדויות']].map(([k, t]) => <button key={k} role="tab" className="chip" aria-pressed={tab === k} aria-selected={tab === k} onClick={() => setTab(k)}>{t}</button>)}
      </div>
      <aside className="panel tr-matrix tr-worlds">
        <div className="panel-hd"><span className="label">1 · עולמות</span><h2>מי מאמין במה</h2></div>
        <div className="list-sort" role="group" aria-label="סידור העולמות">
          <span className="label">מסודר {ORDERS[order]}</span>
          <div className="eq-btns">
            {(Object.keys(ORDERS) as (keyof typeof ORDERS)[]).map((k) => <button key={k} className="chip" aria-pressed={order === k} onClick={() => set({ o: k === 'tradition' ? undefined : k })}>{ORDERS[k].replace('לפי ', '')}</button>)}
          </div>
          <p className="src">{order === 'tradition' ? 'מהמזרח התיכון מערבה ומזרחה, כמו שהמסורות נולדו.' : order === 'size' ? 'כמה אמירות יש לכל עולם במאגר. גודל משפיע על כל ספירה.' : order === 'dialectic' ? 'באיזה חלק מהמחלוקות העולם אומר גם את הצד וגם את ההפך.' : 'כמה מהאמירות הן פתגם עממי בלי תאריך: מסורת שבעל פה מול מסורת כתובה.'}</p>
        </div>
        <div className="panel-bd scroll-in">
          <button className={`world-row${!w ? ' on' : ''}`} onClick={() => { set({ w: undefined, i: undefined, v: undefined }); setTab('f'); }}>
            <b>מבט כולל</b><span className="src">מה מחבר את כולם, ושפה מול תרבות</span>
          </button>
          {sorted.map((ws) => {
            const id = ws.w;
            const flags = [...new Set(ws.cultures.map((c) => CULTURE[c].flag))];
            return (
              <button key={id} className={`world-row${w === id ? ' on' : ''}`} onClick={() => { set({ w: id, i: undefined, v: undefined }); setTab('f'); }}>
                <span className="wr-hd"><b>{WORLDS[id].he}</b><span className="wr-flags">{flags.map((f) => <img key={f} className="flag" src={`./flags/${f}.svg`} width={16} height={12} alt="" />)}</span><bdi className="num">{ws.ss.length}</bdi></span>
                {order !== 'tradition' && <span className="wr-metric">{metricLabel(ws)}</span>}
                <Rich className="wr-head">{PORTRAITS[id].head}</Rich>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="panel tr-find" aria-live="polite">
        {w ? <Portrait w={w} sel={params} set={(p) => { set(p); setTab('i'); }} /> : <Overview />}
      </section>

      <aside className="panel tr-fam">
        <Evidence w={w} params={params} />
      </aside>
    </main>
  );
}

function Overview() {
  const st = useMemo(stats, []);
  const lc = useMemo(langCulture, []);
  const [s] = useStore();
  const all = WORLD_ORDER.map(worldStats).filter((x) => x.ss.length);
  const ratio = (x: ReturnType<typeof worldStats>) => x.both.length / Math.max(1, Object.keys(x.ideas).length);
  const dial = all.slice().sort((a, b) => ratio(b) - ratio(a));
  const calm = all.filter((x) => x.ss.length >= 10 && x.both.length === 0);
  const lensAll: Record<string, number> = {};
  Object.values(LENSES).forEach((ls) => ls.forEach((l) => (lensAll[l.lens] = (lensAll[l.lens] || 0) + l.c.length)));
  const topLens = Object.entries(lensAll).sort((a, b) => b[1] - a[1]);
  const universal = st.perIdea.slice().sort((a, b) => b.cultures - a.cultures)[0];
  const syn = SAYINGS.filter((x) => x.side === 's');
  const synWorlds = Object.entries(syn.reduce((r, x) => ((r[CULTURE[x.culture].world] = (r[CULTURE[x.culture].world] || 0) + 1), r), {} as Record<string, number>)).sort((a, b) => b[1] - a[1]);
  const mine = Object.values(s.stance).filter(Boolean) as string[];
  const oralPct = (x: World) => { const ss = worldStats(x).ss; return Math.round((ss.filter((q) => q.year == null).length / Math.max(1, ss.length)) * 100); };
  const abstractPct = (x: World) => { const ss = worldStats(x).ss; return Math.round((ss.filter((q) => !q.motifs.length).length / Math.max(1, ss.length)) * 100); };
  const vc: Record<string, number> = {};
  SAYINGS.forEach((q) => { if (q.side !== 's') { const v = VALUES[q.idea][q.side]; vc[v] = (vc[v] || 0) + 1; } });
  const vs = Object.entries(vc).sort((a, b) => b[1] - a[1]);
  const topVal = vs[0], secVal = vs[1];
  const oneSided = st.perIdea.slice().sort((a, b) => Math.abs(b.a - b.b) / (b.a + b.b) - Math.abs(a.a - a.b) / (a.a + a.b))[0];
  const split = st.perIdea.filter((p) => p.a + p.b >= 8).sort((a, b) => Math.abs(a.a - a.b) - Math.abs(b.a - b.b))[0];
  const items: { t: string; d: string }[] = [
    { t: `==סתירה היא לא באג. היא שיטה.==`, d: `**${dial[0] && WORLDS[dial[0].w].he}** מחזיקה בשני הצדדים ב-**${dial[0].both.length}** מתוך **${Object.keys(dial[0].ideas).length}** מחלוקות, ו**${WORLDS[dial[1].w].he}** ב-**${dial[1].both.length}** מתוך **${Object.keys(dial[1].ideas).length}**. תרבות שמחזיקה גם וגם, נותנת לאדם כלי לכל מצב.` },
    calm.length ? { t: `**${calm.map((x) => WORLDS[x.w].he).join(', ')}**: ==אף סתירה פנימית אחת==.`, d: 'הפתגמים בוחרים צד ונשארים בו: איפוק, ענווה והתמדה. זו תרבות של דרך אחת, ולא של ויכוח.' } : { t: '', d: '' },
    { t: `**${syn.length}** אמירות מחזיקות ==בשני הצדדים יחד==.`, d: `הכי הרבה ב**${WORLDS[synWorlds[0][0] as World].he}** (**${synWorlds[0][1]}**). זו ההכרעה של המסורות עצמן: "מהר לאט", "קשור את הגמל", "הכול צפוי והרשות נתונה".` },
    { t: `העדשה הנפוצה: **${topLens[0][0]}**, ואחריה **${topLens[1][0]}**.`, d: `רוב התרבויות מסבירות מושג מופשט ${LENS_LINE[topLens[0][0] as keyof typeof LENS_LINE]}. ==את התובנות הן לוקחות מהעולם הסובב, לא מהגדרות==.` },
    { t: `==שפה אינה תרבות==.`, d: `**${lc.sharedLangs.length}** שפות מדוברות כאן ביותר מתרבות אחת. בלטינית כתבו רומאים, נזירים הולנדים, האפיפיור ופרנסיס בייקון האנגלי. ביוונית: הומרוס, הנצרות ויהדות אלכסנדריה.` },
    { t: `ולהפך: ==תרבות אחת, הרבה שפות==.`, d: `**${WORLDS[lc.multiLangWorlds[0].world].he}** מדברת כאן ב-**${lc.multiLangWorlds[0].langs.length}** שפות: ${lc.multiLangWorlds[0].langs.map((l) => LANGS[l]).join(', ')}. הדגלים לידה מתחלפים בין ארצות, והערכים נשארים.` },
    { t: `**${universal.idea.chip}** הוא הרעיון האוניברסלי ביותר.`, d: `**${universal.cultures}** תרבויות ב-**${universal.regions}** אזורים. ==מה שכולם אומרים, הוא כנראה ניסיון אנושי ולא מסורת==.` },
    { t: `**${fmt(st.kinds.impostor)}** זוגות מתחזים.`, d: 'אותן מילים ומשמעות אחרת. ==מי שמתרגם מילה במילה, מתרגם לא נכון==.' },
    { t: `==כתוב מול בעל פה.==`, d: `ב**יפן** ${oralPct('japan')}% מהאמירות הן פתגם עממי בלי תאריך, וב**עולם הערבי והאסלאם** ${oralPct('islam')}%. ב**יהדות** רק ${oralPct('jewish')}%, וב**יוון ורומא** ${oralPct('classical')}%. היהדות ורומא מדברות מתוך ספרים, ויפן והעולם הערבי מתוך הרחוב.` },
    { t: `**הגוף** הוא השפה המשותפת.`, d: `עין, לב, יד ולשון הם מקור הדימוי הנפוץ ביותר ביהדות, באירופה ובאסלאם. ==כשתרבויות רוצות להסביר מושג מופשט, הן מצביעות על הגוף==.` },
    { t: `**הצפון** מדבר בלי תמונות.`, d: `${abstractPct('nordic')}% מאמירות הצפון אין בהן דימוי בכלל, לעומת ${abstractPct('japan')}% ביפן. ==הוואמאל מלמדת כלל, ויפן מראה ציור==.` },
    { t: `**${topVal[0]}** הוא הערך הנבחר ביותר בעולם.`, d: `**${topVal[1]}** אמירות בוחרות בו, ואחריו **${secVal[0]}**. ==פתגמים הם זיכרון קיבוצי של זהירות ושל עזרה הדדית==.` },
    { t: `**${oneSided.idea.chip}**: כמעט כולם מסכימים.`, d: `**${oneSided.a}** אמירות אומרות "${oneSided.idea.a}", ורק **${oneSided.b}** אומרת "${oneSided.idea.b}". ==ככל שהמחלוקת חד-צדדית, הקול השני מפתיע יותר==.` },
    { t: `**${split.idea.chip}** מחלק את העולם באמצע.`, d: `**${split.a}** מול **${split.b}**. ==כאן אין חוכמה עממית אחת, ולכן כלל ההכרעה חשוב במיוחד==.` },
    mine.length ? { t: `**הנטייה שלי**: ${mine.filter((x) => x === 'a').length} צד א, ${mine.filter((x) => x === 'b').length} צד ב, ${mine.filter((x) => x === 's').length} תלוי.`, d: 'נאסף מ"הצד שלי היום" בכל דף. ככל שיש יותר "תלוי", כך הבחירה קרובה יותר לדרך של המסורות.' } : { t: '**הנטייה שלי**: עוד לא נבחר צד.', d: 'בכל דף, באזור 3, אפשר לבחור צד. הבחירות נאספות כאן לדיוקן אישי.' },
  ].filter((x) => x.t);
  return (
    <div className="panel-bd scroll-in ov">
      <span className="label">2 · מבט כולל</span>
      <h1 className="ov-title">מה המאגר מלמד על עולמות ערכים</h1>
      <p className="explain">פרשנות של Claude על <bdi className="num">{SAYINGS.length}</bdi> אמירות מ-<bdi className="num">{st.cultures.length}</bdi> תרבויות. מדגם קטן: זו קריאה ולא סקר.</p>
      <ol className="finds">
        {items.map((x, i) => (
          <li key={i}><span className="fn">{i + 1}</span><div><Rich as="p" className="ft">{x.t}</Rich><Rich as="p" className="fd">{x.d}</Rich></div></li>
        ))}
      </ol>
    </div>
  );
}

function Portrait({ w, sel, set }: { w: World; sel: Record<string, string>; set: (p: Record<string, string | undefined>) => void }) {
  const ws = useMemo(() => worldStats(w), [w]);
  const p = PORTRAITS[w];
  const vals = Object.entries(ws.values).sort((a, b) => b[1].n - a[1].n);
  const maxV = Math.max(1, ...vals.map(([, v]) => v.n));
  const lens = Object.entries(ws.lens).sort((a, b) => b[1] - a[1]);
  const maxL = Math.max(1, ...lens.map(([, n]) => n));
  const covered = Object.keys(ws.ideas).length;
  return (
    <div className="panel-bd scroll-in pt">
      <span className="label">2 · דיוקן ערכים</span>
      <h1 className="ov-title">{WORLDS[w].he}</h1>
      <p className="src">{WORLDS[w].line} · <bdi className="num">{ws.ss.length}</bdi> אמירות</p>
      <Rich as="p" className="insight-line pt-head">{p.head}</Rich>
      {p.body.map((b, i) => <Rich key={i} as="p" className="pt-body">{b}</Rich>)}
      <div className="pt-facts">
        <div><span className="label">סתירה פנימית</span><b className="num">{ws.both.length}/{covered}</b><span className="src">{ws.both.length / covered > 0.5 ? 'מחזיקה בשני הצדדים ברוב המחלוקות' : ws.both.length ? 'לפעמים גם וגם' : 'בוחרת צד אחד'}</span></div>
        <div><span className="label">הכרעות</span><b className="num">{ws.syn}</b><span className="src">{ws.syn ? 'אומרת את שני הצדדים במשפט אחד' : 'אין במאגר'}</span></div>
        <div><span className="label">שפות</span><b className="num">{ws.langs.length}</b><span className="src">{ws.langs.map((l) => LANGS[l]).join(', ')}</span></div>
      </div>
      <h3 className="pt-h">הערכים שהעולם הזה בוחר</h3>
      <p className="src">כל פס = כמה אמירות בוחרות בערך. כחול: צד א של המחלוקת, אדום: צד ב. לחיצה מציגה את העדויות.</p>
      <div className="vbars">
        {vals.map(([v, x]) => (
          <button key={v} className={`vbar${sel.v === v ? ' on' : ''}`} onClick={() => set({ v, i: undefined })}>
            <span className="vb-name">{v}</span>
            <span className="vb-track"><i className={`s-${x.side}`} style={{ width: `${(x.n / maxV) * 100}%` }} /></span>
            <bdi className="num">{x.n}</bdi>
            <span className="vb-idea src">{IDEA[x.idea].chip}</span>
          </button>
        ))}
      </div>
      <h3 className="pt-h">העדשה: דרך מה העולם הזה מסביר</h3>
      <div className="vbars">
        {lens.map(([l, n]) => (
          <div key={l} className="vbar static">
            <span className="vb-name"><span className={`lens-tag lt-${l}`}>{l}</span></span>
            <span className="vb-track"><i className="lens" style={{ width: `${(n / maxL) * 100}%` }} /></span>
            <bdi className="num">{n}</bdi>
            <span className="vb-idea src">{LENS_LINE[l as keyof typeof LENS_LINE]}</span>
          </div>
        ))}
      </div>
      {ws.both.length > 0 && <>
        <h3 className="pt-h">המחלוקות הפנימיות</h3>
        <div className="chips">
          {ws.both.map((i) => <button key={i} className="chip" aria-pressed={sel.i === i} onClick={() => set({ i, v: undefined })}>{IDEA[i].chip}</button>)}
        </div>
      </>}
    </div>
  );
}

function Evidence({ w, params }: { w: World | ''; params: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(null);
  let title = '', list: Saying[] = [];
  if (w && params.v) {
    const ws = worldStats(w);
    title = `"${params.v}" ב${WORLDS[w].he}`;
    list = ws.ss.filter((s) => s.side !== 's' && VALUES[s.idea][s.side] === params.v);
  } else if (w && params.i) {
    title = `${IDEA[params.i].q} · בתוך ${WORLDS[w].he}`;
    list = worldStats(w).ss.filter((s) => s.idea === params.i);
  } else if (w) {
    title = `ההכרעות של ${WORLDS[w].he}`;
    list = worldStats(w).ss.filter((s) => s.side === 's');
    if (!list.length) { title = `כל האמירות של ${WORLDS[w].he}`; list = worldStats(w).ss; }
  } else {
    title = 'אמירות שמחזיקות בשני הצדדים';
    list = SAYINGS.filter((s) => s.side === 's');
  }
  return (
    <div className="panel-bd scroll-in ev">
      <span className="label">3 · עדויות</span>
      <h2 className="ev-title">{title}</h2>
      {list.map((s) => {
        const on = open === s.id;
        const lens = (LENSES[s.idea] || []).find((l) => l.c.includes(s.culture));
        return (
          <div key={s.id} className={`cc-row s-${s.side}${on ? ' on' : ''}`}>
            <button className="cc-btn" onClick={() => setOpen(on ? null : s.id)} aria-expanded={on}>
              <span className={`say${s.nikud ? ' nikud' : ''}`}>"{s.nikud || s.he}"</span>
              <span className="src"><Flag c={s.culture} />{CULTURE[s.culture].he} · {IDEA[s.idea].chip} · <Yr y={s.year} approx={s.approx} /></span>
            </button>
            {on && (
              <div className="cc-more">
                {s.orig && <p className="orig" lang={s.lang} dir="auto">"{s.orig}"</p>}
                <p className="src">{LANGS[langOf(s)]} · {s.src}</p>
                {lens && <p className="gloss-lens"><span className={`lens-tag lt-${lens.lens}`}>{lens.lens}</span><Rich>{lens.t}</Rich></p>}
                <button className="linkish" onClick={() => go('daf', { i: s.idea, s: s.id })}>לדף של "{IDEA[s.idea].chip}"</button>
              </div>
            )}
          </div>
        );
      })}
      {!list.length && <p className="explain">אין עדויות בבחירה הזאת.</p>}
    </div>
  );
}

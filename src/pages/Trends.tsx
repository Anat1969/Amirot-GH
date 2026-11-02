// מגמות: מה המנוע מצא במאגר. סתירות פנימיות, משפחות דימוי לפי אזור, וממצאים מחושבים.
import { useMemo, useState } from 'react';
import { IDEAS, IDEA, CULTURE, SAYINGS, FAMILIES, familiesOf, matrix, stats, fmt, BY_IDEA } from '../engine';
import { href } from '../route';
import { useStore } from '../store';
import Rich, { Yr } from '../Rich';

const REGIONS = ['מזרח תיכון', 'אירופה', 'מזרח אסיה', 'דרום אסיה', 'אפריקה', 'אמריקה'] as const;

export default function Trends() {
  const st = useMemo(stats, []);
  const mx = useMemo(matrix, []);
  const [hl, setHl] = useState<string | null>(null);
  const [tab, setTab] = useState('m');
  const rows = st.cultures.slice().sort((a, b) => Object.values(mx[b.id]).reduce((n, c) => n + c.a + c.b + c.s, 0) - Object.values(mx[a.id]).reduce((n, c) => n + c.a + c.b + c.s, 0));
  const topSelf = Object.entries(st.both.reduce((r, x) => ((r[x.culture] = (r[x.culture] || 0) + 1), r), {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0];
  return (
    <main className="app-main trends-page" data-tab={tab}>
      <div className="tr-tabs" role="tablist" aria-label="חלקי המגמות">
        {[['m', 'מי אומר מה'], ['f', 'ממצאים'], ['i', 'דימויים']].map(([k, t]) => <button key={k} role="tab" className="chip" aria-pressed={tab === k} aria-selected={tab === k} onClick={() => setTab(k)}>{t}</button>)}
      </div>
      <section className="panel tr-matrix" aria-labelledby="trm">
        <div className="panel-hd">
          <h2 id="trm">מי אומר מה: <bdi className="num">{rows.length}</bdi> תרבויות × <bdi className="num">{IDEAS.length}</bdi> מחלוקות</h2>
          <div className="legend">
            <span><span className="dot a" />צד א</span><span><span className="dot b" />צד ב</span><span><span className="dot s" />הכרעה</span>
            <span><i style={{ borderColor: 'var(--ink)', borderTopWidth: 2 }} />מסגרת: שני הצדדים באותה תרבות</span>
          </div>
        </div>
        <Rich as="p" className="tr-insight">{`==**${st.selfCultures.size}** תרבויות אומרות גם וגם==. הכי הרבה: **${CULTURE[topSelf[0]].he}**, ב-**${topSelf[1]}** מחלוקות.`}</Rich>
        <div className="scroll-in mx-wrap">
          <table className="mx" onMouseLeave={() => setHl(null)}>
            <thead>
              <tr><th />{IDEAS.map((i) => <th key={i.id} className={hl === i.id ? 'hl' : ''}><a href={href('daf', { i: i.id })} title={i.q}><span>{i.chip}</span></a></th>)}</tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <th scope="row"><b>{c.he}</b></th>
                  {IDEAS.map((i) => {
                    const cell = mx[c.id][i.id];
                    const both = cell && cell.a && cell.b;
                    return (
                      <td key={i.id} onMouseEnter={() => setHl(i.id)} className={hl === i.id ? 'hl' : ''}>
                        {cell && (
                          <a href={href('daf', { i: i.id, s: BY_IDEA[i.id].find((s) => s.culture === c.id)?.id })} className={`cell${both ? ' both' : ''}`} title={`${c.he} · ${i.chip}: ${cell.a} ${i.a}, ${cell.b} ${i.b}${cell.s ? `, ${cell.s} הכרעה` : ''}`}>
                            <i className="ca" style={{ opacity: cell.a ? 1 : 0 }} /><i className="cb" style={{ opacity: cell.b ? 1 : 0 }} />
                            {cell.s > 0 && <i className="cs" />}
                          </a>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="src tr-how">כל משבצת: חצי ימני כחול אם התרבות אומרת את צד א, חצי שמאלי אדום אם את צד ב, ונקודה ירוקה אם היא מכריעה. לחיצה פותחת את הדף.</p>
      </section>

      <section className="panel tr-find" aria-labelledby="trf">
        <div className="panel-hd"><h2 id="trf">ממצאים</h2><span className="src">מחושבים בקוד מתוך המאגר, לא נכתבו ביד</span></div>
        <div className="panel-bd scroll-in"><Findings st={st} /></div>
      </section>

      <section className="panel tr-fam" aria-labelledby="trfam">
        <div className="panel-hd"><h2 id="trfam">מאיפה לוקחים דימויים</h2><span className="src">אמירות לפי משפחת דימוי ואזור</span></div>
        <div className="panel-bd scroll-in"><Families /></div>
      </section>
    </main>
  );
}

function Findings({ st }: { st: ReturnType<typeof stats> }) {
  const [s] = useStore();
  const universal = st.perIdea.slice().sort((a, b) => b.cultures - a.cultures || b.regions - a.regions)[0];
  const oldest = SAYINGS.filter((x) => x.year != null).sort((a, b) => (a.year as number) - (b.year as number))[0];
  const lean = st.perIdea.map((p) => ({ ...p, r: p.a / Math.max(1, p.a + p.b) })).sort((a, b) => Math.abs(b.r - 0.5) - Math.abs(a.r - 0.5))[0];
  const far = st.farCousin;
  const totalPairs = Object.values(st.kinds).reduce((a, b) => a + b, 0);
  const mine = Object.entries(s.stance).filter(([, v]) => v);
  const mc = { a: 0, b: 0, s: 0 } as Record<string, number>;
  mine.forEach(([, v]) => (mc[v as string]++));
  // הנטייה האישית: האם בוחרים בזהירות (המתנה, ודאות, להישאר)
  const careful = ['haste', 'risk', 'home'].filter((k) => s.stance[k] === 'a').length;
  const items = [
    { t: `**${IDEA[universal.idea.id].chip}** הוא הרעיון האוניברסלי ביותר.`, d: `**${universal.cultures}** תרבויות ב-**${universal.regions}** אזורים אומרות אותו.`, link: href('atlas', { i: universal.idea.id }) },
    { t: `העדות הקדומה: **${CULTURE[oldest.culture].he}**.`, d: `"${oldest.he}" (${oldest.src}).`, year: oldest },
    far && { t: `המקבילה הרחוקה: **${fmt(far.d)}** ק"מ.`, d: `**${CULTURE[far.p.a.culture].he}** ו**${CULTURE[far.p.b.culture].he}** אומרות את אותו הדבר: "${far.p.a.he}" ו"${far.p.b.he}".`, link: href('mirror', { p: far.p.a.id + '~' + far.p.b.id }) },
    { t: `==**${Math.round((st.kinds.impostor / totalPairs) * 100)}%** מהזוגות מתחזים==.`, d: `אותן מילים ומשמעות אחרת: **${st.kinds.impostor}** זוגות. דוגמה: טיפה שחוצבת אבן, וטיפה בים.`, link: href('mirror', { k: 'impostor' }) },
    { t: `המחלוקת הכי לא מאוזנת: **${lean.idea.chip}**.`, d: `${lean.idea.q} **${lean.a}** אמירות בצד "${lean.idea.a}", מול **${lean.b}** בצד "${lean.idea.b}".`, link: href('daf', { i: lean.idea.id }) },
    { t: `**${st.dated}** אמירות מתוארכות, ו-**${SAYINGS.length - st.dated}** עממיות.`, d: 'לפתגם עממי אין תאריך במאגר. ניחוש לא מוצג כעובדה.' },
  ].filter(Boolean) as { t: string; d: string; link?: string; year?: (typeof SAYINGS)[number] }[];
  return (
    <ol className="finds">
      {items.map((x, i) => (
        <li key={i}>
          <span className="fn">{i + 1}</span>
          <div>
            <Rich as="p" className="ft">{x.t}</Rich>
            <p className="fd"><Rich>{x.d}</Rich>{x.year && <> <Yr y={x.year.year} approx={x.year.approx} /></>}{x.link && <> <a href={x.link}>לפתיחה</a></>}</p>
          </div>
        </li>
      ))}
      <li className="mine-f">
        <span className="fn">{items.length + 1}</span>
        <div>
          <p className="ft"><strong>הנטייה שלי</strong></p>
          {mine.length ? (
            <p className="fd">בחרת צד ב-<bdi className="num">{mine.length}</bdi> מחלוקות: <span className="side-a">צד א <bdi className="num">{mc.a}</bdi></span> · <span className="side-b">צד ב <bdi className="num">{mc.b}</bdi></span> · <span className="side-s">תלוי <bdi className="num">{mc.s}</bdi></span>.{careful >= 2 ? ' הדפוס: זהירות. המתנה, ודאות ובית.' : ''}</p>
          ) : <p className="fd">עוד לא בחרת צד. בכל דף, באזור 3 "יישום", יש "הצד שלי היום", והוא נשמר כאן.</p>}
        </div>
      </li>
    </ol>
  );
}

function Families() {
  const data = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const s of SAYINGS) for (const f of familiesOf(s)) { const r = (m[f] ||= {}); const reg = CULTURE[s.culture].region; r[reg] = (r[reg] || 0) + 1; }
    return m;
  }, []);
  const max = Math.max(...FAMILIES.flatMap((f) => REGIONS.map((r) => data[f.id]?.[r] || 0)));
  const regTotal = Object.fromEntries(REGIONS.map((r) => [r, SAYINGS.filter((s) => CULTURE[s.culture].region === r).length]));
  const top = REGIONS.filter((r) => regTotal[r] >= 8).map((r) => ({ r, f: FAMILIES.slice().sort((a, b) => (data[b.id]?.[r] || 0) - (data[a.id]?.[r] || 0))[0] }));
  return (
    <>
      <table className="fam">
        <thead><tr><th />{REGIONS.map((r) => <th key={r}>{r}<br /><span className="src"><bdi className="num">{regTotal[r]}</bdi></span></th>)}</tr></thead>
        <tbody>
          {FAMILIES.map((f) => (
            <tr key={f.id}>
              <th scope="row">{f.he}</th>
              {REGIONS.map((r) => {
                const n = data[f.id]?.[r] || 0;
                return <td key={r} style={{ background: n ? `rgba(26,26,24,${0.08 + (n / max) * 0.8})` : undefined, color: n / max > 0.45 ? '#fff' : undefined }}>{n ? <bdi className="num">{n}</bdi> : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="src fam-scale"><span className="sc-lo" /> מעט <span className="sc-hi" /> הרבה · מספר = אמירות עם דימוי מהמשפחה</p>
      <ul className="fam-top">
        {top.map(({ r, f }) => <li key={r}><b>{r}</b>: הכי הרבה <strong>{f.he}</strong></li>)}
      </ul>
    </>
  );
}


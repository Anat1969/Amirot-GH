// לוח A4 לתוצר: כתבה, מאמר, מסה או יצירה שנוצרו בסדנה, ערוכים ומעוצבים בעמוד אחד (210×297 מ"מ).
// אותה מערכת של לוח הכתבה (Print.tsx, המחלקות .a4-*): כותרת בסריף, דיפטיכון של המחלוקת, גוף בשתי עמודות,
// ציטוט מוגדל, תובנה במרקר, והייקו. הגוף בגודל קריאה (עד 12.5 נקודות) ויורד רק כשיש גלישה. הדיפטיכון גדל וממלא את מה שנשאר, כך שהעמוד תמיד מלא.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Rich from '../Rich';
import { ART } from '../data/art';
import { IDEA, SAYINGS, CULTURE, BY_IDEA, yearLabel } from '../engine';
import { KIND, LEVEL_NAME, CERTAINTY_NAME, refInfo, type Output, type Block } from '../data/outputs';
import { LIVE } from './Print';

const START = 12.5;
const LEAD_MIN = 170; // 45 מ"מ בפיקסלים: מתחת לזה התמונות קטנות מדי, והגוף קטן במקומן
const SAY = Object.fromEntries(SAYINGS.map((s) => [s.id, s]));
const DATE = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '');

/** הציטוט המוגדל: אמירה מאותה מחלוקת שעוד לא מופיעה בתוצר, ועדיף אחת שמחזיקה בשני הצדדים. המקור שלה כתוב מתחתיה */
const pullOf = (o: Output) => {
  const used = new Set(o.blocks.flatMap((b) => b.refs || []));
  const rest = (BY_IDEA[o.chain] || []).filter((s) => !used.has(s.id));
  return rest.find((s) => s.side === 's') || rest[0] || null;
};

export function OutputSheet({ o, date }: { o: Output & { createdAt?: string }; date?: string }) {
  const k = KIND[o.kind];
  const idea = IDEA[o.chain];
  const art = ART[o.chain];
  const pull = pullOf(o);
  const [qr, setQr] = useState('');
  const url = o.id && o.id !== 'draft' ? `${LIVE}/#/library?o=${o.id}` : `${LIVE}/#/library`;
  useEffect(() => { QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#1a1a18', light: '#ffffff' } }).then(setQr).catch(() => setQr('')); }, [url]);
  // התאמה לעמוד: הגוף בגובה התוכן, והתמונות מקבלות את השאר. כשהעמוד גולש, הגוף קטן
  const sheet = useRef<HTMLElement>(null);
  const [pt, setPt] = useState(START);
  const [fitted, setFitted] = useState(false);
  const sig = o.title + o.blocks.map((b) => b.text).join('|');
  useEffect(() => { setPt(START); setFitted(false); }, [sig]);
  useLayoutEffect(() => {
    const el = sheet.current; if (!el || fitted) return;
    const lead = el.querySelector('.a4-lead') as HTMLElement | null;
    const over = el.scrollHeight > el.clientHeight + 1 || (lead ? lead.getBoundingClientRect().height < LEAD_MIN : false);
    if (over && pt > 7.4) setPt((x) => Math.round((x - 0.3) * 10) / 10); else setFitted(true);
  }, [pt, fitted, sig]);
  useEffect(() => { document.fonts?.ready.then(() => { setPt(START); setFitted(false); }); }, []);
  // המקורות בתחתית: כל מקור פעם אחת, לפי סדר ההופעה
  const refs = [...new Set(o.blocks.flatMap((b) => b.refs || []))];
  const notes = refs.map((r) => {
    const s = SAY[r];
    if (s) return `"${s.he}". ${CULTURE[s.culture].he}${s.year != null ? `, ${yearLabel(s.year, s.approx)}` : ''}. ${s.src}`;
    const x = refInfo(r);
    return x ? `${x.kind === 'idea' ? 'המחלוקת' : x.kind === 'research' ? 'ממצא מחקר' : 'כתבה'}: ${x.label}` : '';
  }).filter(Boolean);
  return (
    <article ref={sheet} className={`a4 a4-out out-${o.kind}`} lang="he" dir="rtl" data-ready={qr && fitted ? '1' : '0'} data-pt={pt} data-sheet={o.id}>
      <header className="a4-top">
        <span className="a4-brand"><b>אמירות</b> · אטלס של פתגמים וציטוטים</span>
        <span className="a4-no"><b className="a4-genre">{k.name}</b> · {o.form || k.mechanism} · לוח A4{date || o.createdAt ? <> · <bdi>{date || DATE(o.createdAt)}</bdi></> : null}</span>
      </header>
      <div className="a4-head">
        <span className="a4-kicker">{idea?.chip} · {idea?.q}</span>
        <h1>{o.title}</h1>
        <Rich as="p" className="a4-sub">{o.lead}</Rich>
      </div>
      <figure className="a4-lead a4-dip a4-dip-out">
        {(['a', 'b'] as const).map((s) => art?.[s] ? (
          <div key={s} className={`a4-pic s-${s}`}>
            <img src={`./art/${art[s]!.file}`} alt={art[s]!.title} style={art[s]!.pos ? { objectPosition: art[s]!.pos } : undefined} />
            <span><b>{s === 'a' ? idea?.a : idea?.b}</b> · {art[s]!.title}, {art[s]!.artist}, <bdi>{art[s]!.date}</bdi></span>
          </div>
        ) : <div key={s} className={`a4-pic a4-pic-word s-${s}`}><b>{s === 'a' ? idea?.a : idea?.b}</b></div>)}
      </figure>
      <div className="a4-body" style={{ fontSize: `${pt}pt` }}>
        {o.certainty && (
          <p className="a4-cert"><span>מד ודאות</span> {(['open', 'likely', 'established'] as const).map((c, i) => <i key={c} className={i <= ['open', 'likely', 'established'].indexOf(o.certainty!) ? 'on' : ''} />)} <b>{CERTAINTY_NAME[o.certainty]}</b></p>
        )}
        {o.blocks.map((b, i) => (
          <SheetBlock key={i} o={o} b={b} pullAfter={i === 1 && pull ? pull : null} />
        ))}
        <aside className="a4-insight a4-q"><span>השאלה שנשארת</span><p>{o.question}</p></aside>
      </div>
      <footer className="a4-foot">
        <div className="a4-notes">
          {notes.slice(0, 4).map((x, i) => <p key={i}><bdi>{i + 1}</bdi>. {x}</p>)}
          <p className="a4-own">אד' ענת שטיבלמן A&amp;I · נוצר בסדנה של אמירות, מתוך המאגר בלבד · כל עובדה עם מקור</p>
        </div>
        <div className="a4-qr">
          <span className="a4-qr-img" dangerouslySetInnerHTML={{ __html: qr }} />
          <span className="a4-qr-t">בספרייה<br /><bdi>amirot-gh.vercel.app</bdi></span>
        </div>
      </footer>
    </article>
  );
}

// פסקה "מיוחדת" מקבלת צורה משלה בלוח: יצירה כהייקו, ותובנה במרקר

function SheetBlock({ o, b, pullAfter }: { o: Output; b: Block; pullAfter: (typeof SAYINGS)[number] | null }) {
  let el;
  if (o.kind === 'creation' && b.h === 'היצירה') {
    el = <div className="a4-haiku"><span>הייקו</span>{b.text.split(' / ').map((l, i) => <p key={i}>{l}</p>)}</div>;
  } else if (b.h === 'התובנה' || b.h === 'מה היא מאירה') {
    el = <aside className="a4-insight"><span>{b.h}</span><Rich as="p">{b.text}</Rich></aside>;
  } else {
    el = (
      <div className={`a4-blk lv-${b.level}`}>
        {b.h && <h2>{b.h} <small className={`a4-lv lv-${b.level}`}>{LEVEL_NAME[b.level]}</small></h2>}
        <Rich as="p">{b.text}</Rich>
      </div>
    );
  }
  return (
    <>
      {el}
      {pullAfter && <blockquote className="a4-pull"><span className="q-say">"{pullAfter.nikud || pullAfter.he}"</span><cite>{CULTURE[pullAfter.culture].he}{pullAfter.year != null ? `, ${yearLabel(pullAfter.year, pullAfter.approx)}` : ''} · {pullAfter.src}</cite></blockquote>}
    </>
  );
}

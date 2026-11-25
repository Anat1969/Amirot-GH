// טקסט עשיר: **מודגש**, ==תובנה== (מרקר צהוב), ומספרים מודגשים אוטומטית בכיוון LTR מבודד. מתבנית Rich.jsx של Claude-GH.
// ניקוד אוטומטי (25.11.2026): כל ציטוט בין מירכאות שהוא אמירה מהמאגר, או חלק רציף ממנה, מוצג בנוסח המנוקד ובסריף.
// כך האמירה מזוהה בכל מקום, גם בטקסט שנכתב ביד בלי ניקוד.
import type { ElementType, ReactNode } from 'react';
import { SAYINGS } from './data/sayings';
const TOKEN = /(==[^=]+==|\*\*[^*]+\*\*)/g;
const NUM = /(\d[\d,]*(?:\.\d+)?%?)/g;
const QUOTE = /("[^"\n]{3,160}")/g;

// אינדקס: לכל אמירה מנוקדת, מפתח של אותיות ורווחים בלבד, ומיקום כל תו מפתח בנוסח המנוקד.
const LETTER = /[א-ת]/;
const MARK = /[֑-ׇ]/;
type Ent = { key: string; pos: number[]; nik: string; heKey: string; tokens: string[]; wordTok: number[] };
const INDEX: Ent[] = SAYINGS.filter((s) => s.nikud).map((s) => {
  const nik = s.nikud as string;
  let key = '';
  const pos: number[] = [];
  for (let i = 0; i < nik.length; i++) {
    const c = nik[i];
    if (MARK.test(c)) continue;
    if (LETTER.test(c)) { key += c; pos.push(i); }
    else if (key && key[key.length - 1] !== ' ') { key += ' '; pos.push(i); }
  }
  // גיבוי ברמת המילה: כשהכתיב המנוקד שונה מהכתיב המלא ("קשור" מול "קְשֹׁר"), ממפים מילה למילה.
  const tokens = nik.split(/\s+/);
  const wordTok = tokens.map((t, j) => (LETTER.test(t) ? j : -1)).filter((j) => j >= 0);
  return { key: key.trim(), pos, nik, heKey: keyOf(s.he), tokens, wordTok };
});
function keyOf(t: string) { return t.replace(/[֑-ׇ]/g, '').replace(/[^א-ת]+/g, ' ').trim(); }

/** הנוסח המנוקד של ציטוט, אם הוא אמירה מהמאגר או חלק רציף ממנה. אחרת null. */
export function vocalize(text: string): string | null {
  if (MARK.test(text)) return null; // כבר מנוקד
  const q = keyOf(text);
  if (q.replace(/ /g, '').length < 5 || !q.includes(' ')) return null;
  const at = (k: string, i: number) => (i === 0 || k[i - 1] === ' ') && (i + q.length === k.length || k[i + q.length] === ' ');
  for (const e of INDEX) {
    let i = e.key.indexOf(q);
    while (i >= 0) {
      const before = i === 0 || e.key[i - 1] === ' ';
      const after = i + q.length === e.key.length || e.key[i + q.length] === ' ';
      if (before && after) {
        let end = e.pos[i + q.length - 1] + 1;
        while (end < e.nik.length && MARK.test(e.nik[end])) end++;
        return e.nik.slice(e.pos[i], end);
      }
      i = e.key.indexOf(q, i + 1);
    }
  }
  for (const e of INDEX) {
    const words = e.heKey.split(' ');
    if (words.length !== e.wordTok.length) continue;
    const i = e.heKey.indexOf(q);
    if (i < 0 || !at(e.heKey, i)) continue;
    const w0 = e.heKey.slice(0, i).split(' ').length - 1;
    const w1 = w0 + q.split(' ').length - 1;
    return e.tokens.slice(e.wordTok[w0], e.wordTok[w1] + 1).join(' ').replace(/[^א-ת֑-ׇ]+$/, '').replace(/^[^א-ת]+/, '');
  }
  return null;
}

function Numbers({ text }: { text: string }) {
  return <>{text.split(NUM).map((part, i) => (i % 2 ? <bdi key={i} className="num">{part}</bdi> : part))}</>;
}

// טקסט רגיל: ציטוט מהמאגר מקבל ניקוד וסריף, ושאר הטקסט מספרים מבודדים.
function Txt({ text }: { text: string }) {
  const out: ReactNode[] = [];
  text.split(QUOTE).forEach((part, i) => {
    if (i % 2) {
      const inner = part.slice(1, -1);
      const v = MARK.test(inner) ? inner : vocalize(inner); // ציטוט שכבר מנוקד הוא אמירה, גם אם אינה במאגר
      out.push(v ? <span key={i} className="q-say">"{v}"</span> : <Numbers key={i} text={part} />);
    } else if (part) out.push(<Numbers key={i} text={part} />);
  });
  return <>{out}</>;
}

export default function Rich({ children, as: Tag = 'span', className }: { children: string; as?: ElementType; className?: string }) {
  const parts = String(children).split(TOKEN);
  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**')) return <strong key={i}><Txt text={part.slice(2, -2)} /></strong>;
        if (part.startsWith('==')) return <mark key={i} className="insight">{part.slice(2, -2).split(/(\*\*[^*]+\*\*)/g).map((q, j) => (q.startsWith('**') ? <strong key={j}><Txt text={q.slice(2, -2)} /></strong> : <Txt key={j} text={q} />))}</mark>;
        return <Txt key={i} text={part} />;
      })}
    </Tag>
  );
}

// שנה: המספר מבודד ב-LTR, והסיומת העברית מחוץ לו, כדי שלא יתהפכו.
export function Yr({ y, approx }: { y: number | null; approx?: boolean }) {
  if (y == null) return <span className="yr folk">עממי</span>;
  return <span className="yr"><bdi className="num">{approx ? '~' : ''}{Math.abs(y)}</bdi>{y < 0 ? <span className="bce"> לפנה״ס</span> : null}</span>;
}

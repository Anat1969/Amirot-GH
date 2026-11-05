// לוח תערוכה: כתבה אחת בעמוד A4 אחד (210×297 מ"מ), מעוצבת להדפסה ולתלייה.
// אותו מקור נתונים כמו הכתבה בדף, ולכן המספרים החיים זהים. ה-PDF להורדה נוצר מהדף הזה (tools/pdf.cjs).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ARTICLES, type Article as Art, type Block } from '../data/articles';
import { ART } from '../data/art';
import { go } from '../route';
import Rich from '../Rich';

export const LIVE = 'https://amirot-gh.vercel.app';
export const pdfName = (a: Art) => `אמירות - ${a.title.replace(/["']/g, '')} - A4.pdf`;

export default function Print({ params }: { params: Record<string, string> }) {
  const ix = Math.max(0, ARTICLES.findIndex((x) => x.id === params.a));
  const a = ARTICLES[ix];
  return (
    <main className="print-page">
      <div className="pp-bar no-print">
        <button className="press btn" onClick={() => go('article', { a: a.id })}>חזרה לכתבה</button>
        <span className="pp-why">לוח תערוכה בגודל <b>A4</b>, עמוד אחד, מוכן להדפסה.</span>
        <a className="press btn primary" href={`./print/${a.id}.pdf`} download={pdfName(a)}>הורדת PDF</a>
        <button className="press btn" onClick={() => window.print()}>הדפסה</button>
      </div>
      <Sheet a={a} n={ix + 1} />
    </main>
  );
}

export function Sheet({ a, n }: { a: Art; n: number }) {
  const [qr, setQr] = useState('');
  const url = `${LIVE}/#/article?a=${a.id}`;
  useEffect(() => { QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#1a1a18', light: '#ffffff' } }).then(setQr).catch(() => setQr('')); }, [url]);
  const firstP = a.body.findIndex((b) => 'p' in b);
  // התאמה לעמוד: הגוף מתחיל ב-10.2 נקודות ויורד ב-0.2 עד שהטקסט נכנס לשתי העמודות בלי גלישה (לא פחות מ-8.6)
  const body = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState(10.2);
  const [fitted, setFitted] = useState(false);
  useEffect(() => { setPt(10.2); setFitted(false); }, [a.id]);
  useLayoutEffect(() => {
    const el = body.current; if (!el || fitted) return;
    const over = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    if (over && pt > 8.6) setPt((x) => Math.round((x - 0.2) * 10) / 10); else setFitted(true);
  }, [pt, fitted, a.id]);
  useEffect(() => { document.fonts?.ready.then(() => { setPt(10.2); setFitted(false); }); }, []);
  return (
    <article className="a4" lang="he" dir="rtl" data-ready={qr && fitted ? '1' : '0'} data-pt={pt}>
      <header className="a4-top">
        <span className="a4-brand"><b>אמירות</b> · אטלס של פתגמים וציטוטים</span>
        <span className="a4-no">כתבה <bdi>{n}</bdi> מתוך <bdi>{ARTICLES.length}</bdi></span>
      </header>
      <div className="a4-head">
        <span className="a4-kicker">{a.kicker}</span>
        <h1>{a.title}</h1>
        <p className="a4-sub">{a.sub}</p>
      </div>
      <Lead a={a} />
      <div className="a4-body" ref={body} style={{ fontSize: `${pt}pt` }}>
        {a.body.map((b, i) => <B key={i} b={b} first={i === firstP} />)}
      </div>
      <footer className="a4-foot">
        <div className="a4-notes">
          {a.notes.slice(0, 3).map((x, i) => <p key={i}><bdi>{i + 1}</bdi>. {x}</p>)}
          <p className="a4-own">אד' ענת שטיבלמן A&amp;I · השראה: צורת הדף של דפוס בומברג, ונציה Venezia, <bdi>1523</bdi></p>
        </div>
        <div className="a4-qr">
          <span className="a4-qr-img" dangerouslySetInnerHTML={{ __html: qr }} />
          <span className="a4-qr-t">לקריאה ולחקירה<br /><bdi>amirot-gh.vercel.app</bdi></span>
        </div>
      </footer>
    </article>
  );
}

function Lead({ a }: { a: Art }) {
  if ('river' in a.lead) return <figure className="a4-lead a4-river"><River /></figure>;
  const art = ART[a.lead.idea];
  return (
    <figure className="a4-lead a4-dip">
      {(['a', 'b'] as const).map((k) => art?.[k] && (
        <div key={k} className={`a4-pic s-${k}`}>
          <img src={`./art/${art[k]!.file}`} alt={art[k]!.title} style={art[k]!.pos ? { objectPosition: art[k]!.pos } : undefined} />
          <span><b>{art[k]!.title}</b> · {art[k]!.artist}, <bdi>{art[k]!.date}</bdi></span>
        </div>
      ))}
    </figure>
  );
}

function B({ b, first }: { b: Block; first: boolean }) {
  if ('p' in b) return <Rich as="p" className={first ? 'dropcap' : undefined}>{b.p}</Rich>;
  if ('h' in b) return <h2>{b.h}</h2>;
  if ('pull' in b) return <blockquote className="a4-pull">"{b.pull}"<cite>{b.cite}</cite></blockquote>;
  if ('insight' in b) return <aside className="a4-insight"><span>התובנה</span><Rich as="p">{b.insight}</Rich></aside>;
  return (
    <div className="a4-haiku">
      <span>הייקו</span>
      {b.haiku.map((l, i) => <p key={i}>{l}</p>)}
    </div>
  );
}

function River() {
  const rivers = [
    { y: 50, c: '#9aa9c2', name: 'אפסוס', en: 'Ephesus · ~500 BCE' },
    { y: 110, c: '#5b6f95', name: 'צ\'ו-פו', en: 'Qufu · ~500 BCE' },
    { y: 170, c: '#1f3a68', name: 'קיוטו', en: 'Kyoto · 1212' },
  ];
  return (
    <svg viewBox="0 0 900 220" style={{ direction: 'ltr' }} role="img" aria-label="שלושה נהרות: אפסוס, צ'ו-פו וקיוטו">
      {rivers.map((r, i) => (
        <g key={i}>
          {[0, 1, 2, 3].map((k) => (
            <path key={k} d={`M20 ${r.y + k * 7} C 180 ${r.y - 30 + k * 7}, 300 ${r.y + 34 + k * 7}, 460 ${r.y + k * 7} S 720 ${r.y - 28 + k * 7}, 880 ${r.y + k * 7}`}
              fill="none" stroke={r.c} strokeWidth={k === 0 ? 2.4 : 1} opacity={k === 0 ? 1 : 0.5} />
          ))}
          <text x="880" y={r.y - 12} textAnchor="end" style={{ fill: r.c, font: '700 20px "IBM Plex Sans Hebrew"' }}>{r.name}</text>
          <text x="20" y={r.y - 12} textAnchor="start" style={{ fill: r.c, font: '500 13px "IBM Plex Mono"' }}>{r.en}</text>
        </g>
      ))}
    </svg>
  );
}

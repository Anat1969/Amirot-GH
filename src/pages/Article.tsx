// כתבות: מגזין של גילויים מתוך המאגר. נקראות בגלילה, כמו מגזין (החריג המותר לכלל "בגודל המסך").
// בחירת כתבה בתוך הדף, והתמונה והטקסט באותו רוחב.
import { useEffect, useState } from 'react';
import { ARTICLES, type Article as Art, type Block } from '../data/articles';
import { ART } from '../data/art';
import { go } from '../route';
import Rich from '../Rich';
import { pdfName } from './Print';
import { href } from '../route';

export default function Article({ params }: { params: Record<string, string> }) {
  const a = ARTICLES.find((x) => x.id === params.a) || ARTICLES[0];
  useEffect(() => { window.scrollTo({ top: 0 }); }, [a.id]);
  return (
    <main className="article-page">
      <nav className="art-pick" aria-label="בחירת כתבה">
        {ARTICLES.map((x) => {
          const img = 'idea' in x.lead ? ART[x.lead.idea]?.a?.file : 'change-b.jpg';
          return (
            <button key={x.id} className={`art-card${x.id === a.id ? ' on' : ''}`} aria-pressed={x.id === a.id} onClick={() => go('article', { a: x.id }, true)}>
              {img && <img src={`./art/${img}`} alt="" loading="lazy" />}
              <span className="ac-k">{x.kicker}</span>
              <b>{x.title}</b>
            </button>
          );
        })}
      </nav>
      <Feature a={a} key={a.id} />
    </main>
  );
}

function Lead({ a }: { a: Art }) {
  if ('river' in a.lead) return <figure className="ft-lead"><RiverArt /><figcaption className="label">איור בקוד: שלושה נהרות, שלוש עדויות. הקווים מובילים מהמוקדם (בהיר) למאוחר (כהה).</figcaption></figure>;
  const art = ART[a.lead.idea];
  return (
    <figure className="ft-lead ft-dip">
      {(['a', 'b'] as const).map((k) => art?.[k] && (
        <div key={k} className={`fd-${k}`}>
          <img src={`./art/${art[k]!.file}`} alt={art[k]!.title} style={art[k]!.pos ? { objectPosition: art[k]!.pos } : undefined} />
          <span className="src"><b>{art[k]!.title}</b> · {art[k]!.artist} <span className="en">{art[k]!.artistEn}</span>, {art[k]!.date}</span>
        </div>
      ))}
      <figcaption className="label">מוזיאון קליבלנד לאמנות Cleveland Museum of Art · רישיון CC0</figcaption>
    </figure>
  );
}

function B({ b, first }: { b: Block; first: boolean }) {
  if ('p' in b) return <Rich as="p" className={first ? 'dropcap' : undefined}>{b.p}</Rich>;
  if ('h' in b) return <h2>{b.h}</h2>;
  if ('pull' in b) return <blockquote className="pull">"<span>{b.pull}</span>"<cite>{b.cite}</cite></blockquote>;
  if ('insight' in b) return <aside className="tone tone-insight ft-insight"><h4>התובנה</h4><Rich as="p">{b.insight}</Rich></aside>;
  return (
    <div className="haiku ft-haiku">
      <span className="label">הייקו</span>
      {b.haiku.map((l, i) => <p key={i} className="say">{l}</p>)}
      <p className="src">{b.note}</p>
    </div>
  );
}

function Feature({ a }: { a: Art }) {
  const [copied, setCopied] = useState(false);
  const firstP = a.body.findIndex((b) => 'p' in b);
  return (
    <article className="feature">
      <header className="ft-head">
        <div className="ft-tools no-print">
          <a className="press btn primary" href={`./print/${a.id}.pdf`} download={pdfName(a)} title="קובץ PDF בגודל A4, עמוד אחד, מוכן להדפסה ולתלייה בתערוכה">הורדה ל-A4 לתערוכה</a>
          <a className="press btn" href={href('print', { a: a.id })}>תצוגת הלוח</a>
        </div>
        <span className="label">{a.kicker}</span>
        <h1>{a.title}</h1>
        <p className="ft-sub">{a.sub}</p>
      </header>
      <Lead a={a} />
      <div className="ft-body">
        {a.body.map((b, i) => <B key={i} b={b} first={i === firstP} />)}
        <div className="ft-post">
          <div className="post-hd"><span className="label">פוסט, מוכן להעתקה</span><button className="press btn" onClick={async () => { try { await navigator.clipboard.writeText(a.post); setCopied(true); } catch { setCopied(false); } }}>{copied ? 'הועתק' : 'העתקה'}</button></div>
          <div className="post-text">{a.post.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>
        </div>
        <p className="ft-next">{a.related.map((r) => <button key={r.label} className="press btn" onClick={() => go(r.page, r.params)}>{r.label}</button>)}</p>
        <ol className="ft-notes">{a.notes.map((n, i) => <li key={i}>{n}</li>)}</ol>
        <p className="src">השראה: צורת הדף של דפוס בומברג, ונציה Venezia, <bdi className="num">1523</bdi>.</p>
      </div>
    </article>
  );
}

function RiverArt() {
  // שלושה נהרות כקווים זורמים, מהבהיר (הקדום) לכהה (המאוחר)
  const rivers = [
    { y: 70, c: '#9aa9c2', name: 'אפסוס', en: 'Ephesus', yr: '~500 לפנה״ס' },
    { y: 150, c: '#5b6f95', name: 'צ\'ו-פו', en: 'Qufu', yr: '~500 לפנה״ס' },
    { y: 230, c: '#1f3a68', name: 'קיוטו', en: 'Kyoto', yr: '1212' },
  ];
  return (
    <svg viewBox="0 0 900 300" className="river-art" role="img" aria-label="שלושה נהרות זורמים: אפסוס, צ'ו-פו וקיוטו" style={{ direction: 'ltr' }}>
      <rect width="900" height="300" fill="#fff" />
      {rivers.map((r, i) => (
        <g key={i}>
          {[0, 1, 2, 3].map((k) => (
            <path key={k} className="ink" style={{ ['--len' as string]: 1200, animationDelay: `${i * 0.25 + k * 0.08}s` }}
              d={`M20 ${r.y + k * 7} C 180 ${r.y - 30 + k * 7}, 300 ${r.y + 34 + k * 7}, 460 ${r.y + k * 7} S 720 ${r.y - 28 + k * 7}, 880 ${r.y + k * 7}`}
              fill="none" stroke={r.c} strokeWidth={k === 0 ? 2.2 : 1} opacity={k === 0 ? 1 : 0.5} />
          ))}
          <text x="880" y={r.y - 14} textAnchor="end" className="ra-name" style={{ fill: r.c }}>{r.name}</text>
          <text x="20" y={r.y - 14} textAnchor="start" className="ra-yr" style={{ fill: r.c }}>{r.en} · {r.yr.replace(' לפנה״ס', ' BCE')}</text>
        </g>
      ))}
    </svg>
  );
}

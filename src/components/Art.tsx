// דיפטיכון: שתי יצירות זו מול זו, אחת לכל צד של המחלוקת. אותו גודל, ממלאות את המסגרת.
// בלי יצירה מתאימה: כרטיס טיפוגרפי נקי עם האמירה המובהקת של הצד, לא תמונה מטעה.
import { useState } from 'react';
import { ART, type Art } from '../data/art';
import { BY_IDEA } from '../engine';

function Panel({ art, side, label, idea }: { art: Art | null; side: 'a' | 'b'; label: string; idea: string }) {
  const [big, setBig] = useState(false);
  if (!art) {
    const s = (BY_IDEA[idea] || []).filter((x) => x.side === side).sort((a, b) => a.he.length - b.he.length)[0];
    return (
      <figure className={`dp dp-${side} dp-type`}>
        <span className="dp-side">{label}</span>
        {s && <blockquote className="say">"{s.nikud || s.he}"</blockquote>}
      </figure>
    );
  }
  return (
    <figure className={`dp dp-${side}${big ? ' big' : ''}`}>
      <button className="dp-link" onClick={() => setBig((b) => !b)} aria-pressed={big} title={big ? 'הקטנה' : `הגדלה: ${art.titleEn} · ${art.artistEn}`}>
        <img src={`./art/${art.file}`} alt={`${art.title}, ${art.artist}`} loading="lazy" style={art.pos && !big ? { objectPosition: art.pos } : undefined} />
      </button>
      <span className="dp-side">{label}</span>
      <figcaption className="src"><b>{art.title}</b> · {art.artist} <span className="en">{art.artistEn}</span>, {art.date} · <a href={`https://clevelandart.org/art/${art.accession}`} target="_blank" rel="noopener">במוזיאון</a></figcaption>
    </figure>
  );
}

export function Diptych({ idea, a, b, compact = false }: { idea: string; a: string; b: string; compact?: boolean }) {
  const art = ART[idea];
  return (
    <div className={`diptych rise${compact ? ' compact' : ''}`} aria-label="דיפטיכון: יצירה לכל צד">
      <Panel art={art?.a || null} side="a" label={a} idea={idea} />
      <Panel art={art?.b || null} side="b" label={b} idea={idea} />
      {!compact && art && (art.a || art.b) && <p className="dp-credit src">מוזיאון קליבלנד לאמנות Cleveland Museum of Art · רישיון CC0</p>}
    </div>
  );
}

export const artThumb = (idea: string) => ART[idea]?.a?.file || ART[idea]?.b?.file || null;

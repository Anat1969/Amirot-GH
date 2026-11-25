// דפדוף אחד לכל האפליקציה (25.11.2026, כלל של ענת): בכל מקום שיש רשומות בכמה קטגוריות.
// שלושה כיוונים של קריאה:
//   אורכי:   ‹ › בין רשומות בתוך הקטגוריה.
//   רוחבי:   « » בין קטגוריות, לרשומה הראשונה בכל אחת.
//   היררכי:  הקטגוריה והמיקום כתובים במרכז ("משפחה 2 מתוך 5 · רעיון 3 מתוך 6").
// דפדוף אוטומטי: אחרי 4 שניות בלי מגע (לחיצה, מקלדת, גלילה), עוברים לרשומה הבאה. פס דק מראה כמה זמן נשאר.
// אפשר לעצור, והבחירה נשמרת לכל האפליקציה. מי שביקש להפחית תנועה מתחיל כשהדפדוף עצור.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../icons';

export type FlipCat = { id: string; he: string; icon?: string; items: string[] };
const KEY = 'amirot.flip';
const DELAY = 4000;

const readOn = () => {
  try { const v = localStorage.getItem(KEY); if (v != null) return v === '1'; } catch { /* בלי אחסון */ }
  return !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
};

export default function Flip({ cats, cur, onGo, noun, catNoun, className }: {
  cats: FlipCat[]; cur: string; onGo: (item: string) => void; noun: string; catNoun?: string; className?: string;
}) {
  const flat = cats.flatMap((c) => c.items);
  const ci = Math.max(0, cats.findIndex((c) => c.items.includes(cur)));
  const cat = cats[ci];
  const ii = Math.max(0, cat?.items.indexOf(cur) ?? 0);
  const fi = Math.max(0, flat.indexOf(cur));
  const step = (d: number) => flat.length && onGo(flat[(fi + d + flat.length) % flat.length]);
  const jump = (d: number) => { const c = cats[(ci + d + cats.length) % cats.length]; if (c?.items.length) onGo(c.items[0]); };

  const [on, setOn] = useState(readOn);
  const [tick, setTick] = useState(0); // מאפס את פס הזמן
  const next = useRef(step);
  next.current = step;
  useEffect(() => {
    if (!on || flat.length < 2) return;
    let t = window.setTimeout(fire, DELAY);
    function fire() { if (document.hidden) { t = window.setTimeout(fire, DELAY); return; } next.current(1); }
    const reset = () => { clearTimeout(t); t = window.setTimeout(fire, DELAY); setTick((n) => n + 1); };
    const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    evs.forEach((e) => addEventListener(e, reset, { passive: true }));
    return () => { clearTimeout(t); evs.forEach((e) => removeEventListener(e, reset)); };
  }, [on, cur, flat.length]);
  const toggle = () => { const v = !on; setOn(v); try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* בלי אחסון */ } };

  if (flat.length < 2) return null;
  const many = cats.length > 1;
  return (
    <div className={`flip${className ? ' ' + className : ''}`} role="group" aria-label={`דפדוף בין ${noun}`}>
      {many && <button className="press icon-btn fl-cat" onClick={() => jump(-1)} aria-label={`${catNoun || 'הקטגוריה'} הקודמת`} title={`${catNoun || 'הקטגוריה'} הקודמת`}><Icon name="prev2" size={16} /></button>}
      <button className="press icon-btn" onClick={() => step(-1)} aria-label={`ה${noun} הקודם`} title={`ה${noun} הקודם`}><Icon name="prev" size={16} /></button>
      <span className="fl-where" aria-live="polite">
        {many && <span className="fl-cat-name">{cat.icon && <Icon name={cat.icon} size={13} />}{cat.he} <bdi className="num">{ci + 1}/{cats.length}</bdi></span>}
        <span className="fl-pos">{noun} <bdi className="num">{ii + 1}/{cat.items.length}</bdi></span>
        {on && <i className="fl-time" key={cur + ':' + tick} />}
      </span>
      <button className="press icon-btn" onClick={() => step(1)} aria-label={`ה${noun} הבא`} title={`ה${noun} הבא`}><Icon name="next" size={16} /></button>
      {many && <button className="press icon-btn fl-cat" onClick={() => jump(1)} aria-label={`${catNoun || 'הקטגוריה'} הבאה`} title={`${catNoun || 'הקטגוריה'} הבאה`}><Icon name="next2" size={16} /></button>}
      <button className="press icon-btn fl-play" aria-pressed={on} onClick={toggle} aria-label={on ? 'עצירת הדפדוף האוטומטי' : 'דפדוף אוטומטי כל 4 שניות'} title={on ? 'עצירת הדפדוף האוטומטי' : 'דפדוף אוטומטי כל 4 שניות'}><Icon name={on ? 'pause' : 'play'} size={14} /></button>
    </div>
  );
}

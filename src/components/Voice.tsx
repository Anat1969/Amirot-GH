// הקלטה ותמלול לשדה כתיבה (סעיף 2.11 בסקיל העיצוב). Web Speech API, עברית, תמלול תוך כדי דיבור.
import { useRef, useState } from 'react';
type Rec = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: (e: any) => void; onerror: (e: any) => void; onend: () => void };
const RecCtor: (new () => Rec) | undefined = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : undefined;
let activeStop: (() => void) | null = null;

export default function Voice({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [on, setOn] = useState(false);
  const [note, setNote] = useState('');
  const rec = useRef<Rec | null>(null);
  const click = () => {
    if (!RecCtor) { setNote('הדפדפן הזה לא מתמלל. אפשר ללחוץ על המיקרופון במקלדת של הטלפון ולהכתיב.'); return; }
    if (rec.current) { rec.current.stop(); return; }
    if (activeStop) activeStop();
    const r = new RecCtor();
    r.lang = 'he-IL'; r.continuous = true; r.interimResults = true;
    const base = value ? value.replace(/\s*$/, ' ') : '';
    r.onresult = (e: any) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      onChange((base + t).replace(/\s+/g, ' ').trimStart());
    };
    r.onerror = (e: any) => setNote(e.error === 'not-allowed' ? 'אין הרשאה למיקרופון. אפשר לאשר בסרגל הכתובת של הדפדפן.' : 'התמלול נעצר. אפשר לנסות שוב.');
    r.onend = () => { rec.current = null; activeStop = null; setOn(false); };
    rec.current = r; activeStop = () => r.stop();
    try { r.start(); setOn(true); setNote('מקליט ומתמלל. לחיצה נוספת עוצרת.'); } catch { rec.current = null; setNote('לא הצלחתי להפעיל הקלטה. אפשר לנסות שוב.'); }
  };
  return (
    <div className="voice">
      <button type="button" className="press voice-btn" aria-pressed={on} onClick={click} title={RecCtor ? 'הקלטה ותמלול לעברית' : 'הדפדפן הזה לא מתמלל'}>
        <span className="voice-dot" aria-hidden="true" />
        {on ? 'עצירה' : 'הקלטה'}
      </button>
      <span className="voice-note" aria-live="polite">{note || 'ב-Chrome התמלול עובר דרך Google. נשמר רק הטקסט.'}</span>
    </div>
  );
}

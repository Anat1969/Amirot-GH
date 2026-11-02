import { useEffect, useMemo, useRef, useState } from 'react';
import { SAYINGS, IDEA, IDEAS, CULTURE, matcher } from '../engine';
import { go, href } from '../route';
import { useStore } from '../store';
import { Icon } from '../icons';

const TABS = [
  { id: 'home', he: 'בית' },
  { id: 'daf', he: 'הדף' },
  { id: 'mirror', he: 'מראה' },
  { id: 'atlas', he: 'אטלס' },
  { id: 'trends', he: 'מגמות' },
  { id: 'article', he: 'כתבה' },
];

export default function TopBar({ page }: { page: string }) {
  const [st, set] = useStore();
  const [open, setOpen] = useState(false);
  const [ideaF, setIdeaF] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const q = st.q;
  const hits = useMemo(() => { const m = matcher(q); return m ? SAYINGS.filter(m) : []; }, [q]);
  const byIdea = useMemo(() => { const r: Record<string, number> = {}; hits.forEach((s) => (r[s.idea] = (r[s.idea] || 0) + 1)); return r; }, [hits]);
  const shown = ideaF ? hits.filter((s) => s.idea === ideaF) : hits;
  useEffect(() => {
    const out = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);
  useEffect(() => setIdeaF(null), [q]);
  const setQ = (v: string) => set((s) => ({ ...s, q: v }));
  return (
    <header className="topbar">
      <div className="topbar-in">
        <a className="brand press-free" href="#/" aria-label="אמירות, לדף הבית">
          <img src="./icon.svg" alt="" />
          <span>אמירות <small>כמה דומה השונה</small></span>
        </a>
        <nav className="tabs" aria-label="ניווט ראשי">
          {TABS.map((t) => (
            <a key={t.id} className="tab" href={href(t.id)} aria-current={page === t.id ? 'page' : undefined}>{t.he}</a>
          ))}
        </nav>
        <div className="search" ref={box}>
          <input
            ref={input} className="field" type="search" placeholder="חיפוש: מילה, תרבות, מקור" aria-label="חיפוש אמירות" value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={(e) => { e.target.select(); if (q) setOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setQ(''); setOpen(false); } }}
          />
          <button className="x" type="button" aria-label="ניקוי החיפוש" onClick={() => { setQ(''); input.current?.focus(); }}><Icon name="x" size={14} /></button>
          {open && q.trim() && (
            <div className="search-pop" role="listbox" aria-label="תוצאות חיפוש">
              <div className="hd">
                <span className="label"><bdi className="num">{hits.length}</bdi> תוצאות</span>
                {IDEAS.filter((i) => byIdea[i.id]).map((i) => (
                  <button key={i.id} className="chip" aria-pressed={ideaF === i.id} onClick={() => setIdeaF(ideaF === i.id ? null : i.id)}>
                    {i.chip}<bdi className="num">{byIdea[i.id]}</bdi>
                  </button>
                ))}
              </div>
              {!shown.length && <div className="empty">אין התאמה. אפשר לחפש מילה מהפתגם, שם תרבות (יפנית) או מקור (קהלת).</div>}
              {shown.slice(0, 40).map((s) => (
                <button key={s.id} className="row" role="option" onClick={() => { setOpen(false); go('daf', { i: s.idea, s: s.id }); }}>
                  <span><b>"{s.he}"</b><br /><span className="src">{CULTURE[s.culture].he} · {IDEA[s.idea].chip}</span></span>
                  <span className={`dot ${s.side}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <ai-menu chat="https://claude.ai/code/session_018qeN17vTs4GRXUyqaetNkG"></ai-menu>
      </div>
    </header>
  );
}

// הספרייה: כל התוצרים שנוצרו בסדנה ואושרו, כל אחד כלוח A4 ערוך ומעוצב. נשמרים בענן, לכולם ובכל מכשיר.
// לחיצה על לוח פותחת אותו בגודל מלא, עם הדפסה ושמירה כ-PDF, ועם "להפוך ל..." שיוצר את השלב הבא בלחיצה.
import { useEffect, useMemo, useRef, useState } from 'react';
import { go } from '../route';
import { Icon } from '../icons';
import { KINDS, KIND, type Kind } from '../data/outputs';
import { IDEA } from '../engine';
import { loadOutputs, flushPending, type CloudOutput } from '../cloud';
import { OutputSheet } from './OutSheet';
import './outputs.css';

const DATE = (iso: string) => (iso ? new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' }) : 'ממתין לרשת');

export default function Library({ params }: { params: Record<string, string> }) {
  const [rows, setRows] = useState<CloudOutput[] | null>(null);
  useEffect(() => { flushPending().finally(() => loadOutputs().then(setRows)); }, []);
  const kind = (KINDS.some((k) => k.id === params.k) ? params.k : null) as Kind | null;
  const list = useMemo(() => (rows || []).filter((o) => !kind || o.kind === kind), [rows, kind]);
  const sel = (rows || []).find((o) => o.id === params.o) || null;
  const nav = (patch: Record<string, string | undefined>) => go('library', { ...params, ...patch }, true);
  // הלוח הגדול נשאר בגודל A4 אמיתי, ובמסך צר הוא מוקטן כולו
  const main = useRef<HTMLElement>(null);
  const [z, setZ] = useState(1);
  useEffect(() => {
    const el = main.current; if (!el) return;
    const ro = new ResizeObserver(() => setZ(Math.min(1, (el.clientWidth - 24) / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { if (sel) requestAnimationFrame(() => main.current?.querySelector('.lib-big')?.scrollIntoView({ block: 'start' })); }, [sel?.id]);
  const count = (k: Kind) => (rows || []).filter((o) => o.kind === k).length;
  const ix = sel ? list.findIndex((o) => o.id === sel.id) : -1;
  return (
    <main ref={main} className="app-main library" dir="rtl" style={{ ['--z' as string]: z }}>
      <header className="lib-head no-print">
        <span className="label">הספרייה · <bdi className="num">{rows?.length ?? 0}</bdi> תוצרים, כל אחד בלוח A4</span>
        <h1>מה נוצר באמירות</h1>
        <p>כל תוצר כאן נוצר בלחיצה בסדנה, מתוך המאגר בלבד, ואושר. הוא נשמר בענן, ונפתח בכל מכשיר.</p>
        <div className="lib-filter" role="group" aria-label="סוג תוצר">
          <button type="button" className="chip chip-all" aria-pressed={!kind} onClick={() => nav({ k: undefined })}><Icon name="all" size={13} />הכול</button>
          <span className="chips-sep" aria-hidden="true" />
          {KINDS.map((k) => <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} data-lib-kind={k.id} onClick={() => nav({ k: k.id })}><Icon name={k.icon} size={14} />{k.name} <bdi className="num src">{count(k.id)}</bdi></button>)}
          <button type="button" className="press btn primary lib-new" data-lib-new onClick={() => go('creations', { v: 'outputs', make: '1' })}><Icon name="plus" size={14} /> תוצר חדש בלחיצה</button>
        </div>
      </header>

      {sel && (
        <section className="lib-big" aria-label={`פתוח: ${sel.title}`} data-open={sel.id}>
          <div className="lib-acts no-print">
            <button type="button" className="press btn primary" data-print onClick={() => window.print()}><Icon name="doc" size={14} /> הדפסה או שמירה כ-PDF</button>
            <button type="button" className="press btn" data-next-kind={sel.transition.to} onClick={() => go('creations', { v: 'outputs', make: '1', k: sel.transition.to, from: sel.id })}>
              <Icon name={KIND[sel.transition.to].icon} size={14} /> להפוך ל{KIND[sel.transition.to].name}
            </button>
            <button type="button" className="press btn" onClick={() => go('creations', { v: 'outputs', o: sel.id })}>לקריאה עם המקורות</button>
            <span className="lib-pos src">
              <button type="button" className="press icon-btn" aria-label="הקודם" disabled={ix <= 0} onClick={() => nav({ o: list[ix - 1]?.id })}><Icon name="prev" size={14} /></button>
              <bdi className="num">{ix + 1}/{list.length}</bdi>
              <button type="button" className="press icon-btn" aria-label="הבא" disabled={ix < 0 || ix >= list.length - 1} onClick={() => nav({ o: list[ix + 1]?.id })}><Icon name="next" size={14} /></button>
            </span>
            <button type="button" className="press icon-btn" aria-label="סגירה" title="סגירה" onClick={() => nav({ o: undefined })}><Icon name="x" size={14} /></button>
          </div>
          <div className="lib-sheet"><OutputSheet o={sel} /></div>
        </section>
      )}

      {rows === null ? <p className="src no-print">טוען את הספרייה…</p> : list.length === 0 ? (
        <div className="lib-empty no-print">
          <p><strong>הספרייה עוד ריקה{kind ? ` ב${KIND[kind].name}` : ''}.</strong></p>
          <p className="src">לחיצה אחת יוצרת תוצר מהמאגר, מעוצב בלוח A4. מאשרים, והוא מופיע כאן.</p>
          <button type="button" className="press btn primary" onClick={() => go('creations', { v: 'outputs', make: '1', ...(kind ? { k: kind } : {}) })}><Icon name="plus" size={14} /> יצירת התוצר הראשון</button>
        </div>
      ) : (
        <div className="lib-grid no-print" aria-label="התוצרים בספרייה">
          {list.map((o) => (
            <button key={o.id} type="button" className={`lib-card${sel?.id === o.id ? ' on' : ''}`} aria-pressed={sel?.id === o.id} data-lib={o.id} onClick={() => nav({ o: sel?.id === o.id ? undefined : o.id })}>
              <span className="lib-thumb" aria-hidden="true"><OutputSheet o={o} /></span>
              <span className="out-tag sm"><Icon name={KIND[o.kind].icon} size={12} />{KIND[o.kind].name} · {IDEA[o.chain]?.chip}</span>
              <strong>{o.title}</strong>
              <span className="src">{DATE(o.createdAt)}{o.local ? ' · נשמר במכשיר' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

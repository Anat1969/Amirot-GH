// הספרייה: המקום האחד של התוצרים. יוצרים כאן, מאשרים כאן, ורואים כאן.
// 1. לוחצים על סוג (כתבה, מאמר, מסה או יצירה). המנוע כותב את התוצר מהמאגר, וחלון נפתח עם לוח A4 מוכן.
// 2. "אישור ושמירה": הלוח נשמר בענן ומופיע ראשון ברשת. אין מה לכתוב.
// לחיצה על לוח ברשת פותחת אותו באותו חלון, עם הדפסה ושמירה כ-PDF, ו"להפוך ל..." שיוצר את השלב הבא.
import { useEffect, useMemo, useRef, useState } from 'react';
import { go } from '../route';
import { Icon } from '../icons';
import { KINDS, KIND, type Kind, type Output } from '../data/outputs';
import { IDEA } from '../engine';
import { forge, randomIdea } from '../data/forge';
import { loadOutputs, addOutput, flushPending, type CloudOutput } from '../cloud';
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

  // טיוטה: נבנית בלחיצה, ומוצגת בחלון עד אישור
  const [draft, setDraft] = useState<Output | null>(null);
  const [from, setFrom] = useState<Output | null>(null);
  const [seed, setSeed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const make = (k: Kind, src?: Output | null) => {
    setFrom(src || null); setSeed(0); setMsg('');
    setDraft(forge(k, src?.chain || randomIdea(), src || undefined));
    if (params.o || params.make) nav({ o: undefined, make: undefined, from: undefined });
  };
  // הגעה מכפתור "להפוך ל..." במקום אחר באפליקציה: ?make=<סוג>&from=<מזהה>
  const started = useRef(false);
  useEffect(() => {
    const k = params.make as Kind;
    if (started.current || !KIND[k] || rows === null) return;
    started.current = true;
    make(k, params.from ? rows.find((x) => x.id === params.from) : null);
  }, [params.make, rows]);
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    const r = await addOutput(draft);
    setBusy(false);
    const out = r.ok ? r.out : r.local;
    if (!out) { setMsg(r.ok ? '' : r.error); return; }
    setRows((xs) => [out, ...(xs || [])]);
    setDraft(null);
    nav({ o: out.id, k: undefined });
  };
  const close = () => { setDraft(null); nav({ o: undefined }); };
  const ix = sel ? list.findIndex((o) => o.id === sel.id) : -1;
  const count = (k: Kind) => (rows || []).filter((o) => o.kind === k).length;

  return (
    <main className="app-main library" dir="rtl">
      <header className="lib-head no-print">
        <h1>הספרייה</h1>
        <p><strong>לוחצים על סוג, מאשרים, והלוח נשמר כאן.</strong> התוכן נכתב מהמאגר, וכל עובדה בו עם המקור שלה.</p>
      </header>

      <div className="lib-make no-print" role="group" aria-label="יצירת תוצר חדש בלחיצה">
        {KINDS.map((k) => (
          <button key={k.id} type="button" className="press lib-make-btn" data-make={k.id} onClick={() => make(k.id)}>
            <Icon name={k.icon} size={22} />
            <strong>{k.name} חדש{k.id === 'story' || k.id === 'essay' || k.id === 'creation' ? 'ה' : ''}</strong>
            <span className="src">{k.mechanism}</span>
          </button>
        ))}
      </div>

      <div className="lib-filter no-print" role="group" aria-label="סינון לפי סוג">
        <span className="label"><bdi className="num">{rows?.length ?? 0}</bdi> לוחות בספרייה</span>
        <button type="button" className="chip chip-all" aria-pressed={!kind} onClick={() => nav({ k: undefined })}><Icon name="all" size={13} />הכול</button>
        <span className="chips-sep" aria-hidden="true" />
        {KINDS.map((k) => <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} data-lib-kind={k.id} onClick={() => nav({ k: k.id })}><Icon name={k.icon} size={14} />{k.name} <bdi className="num src">{count(k.id)}</bdi></button>)}
      </div>

      {rows === null ? <p className="src no-print">טוען את הספרייה…</p> : list.length === 0 ? (
        <p className="lib-empty no-print"><strong>עוד אין כאן לוחות{kind ? ` מסוג ${KIND[kind].name}` : ''}.</strong> לחיצה על אחד הסוגים למעלה יוצרת את הראשון.</p>
      ) : (
        <div className="lib-grid no-print" aria-label="הלוחות בספרייה">
          {list.map((o) => (
            <button key={o.id} type="button" className="lib-card" data-lib={o.id} onClick={() => { setDraft(null); nav({ o: o.id }); }}>
              <span className="lib-thumb" aria-hidden="true"><OutputSheet o={o} /></span>
              <span className="out-tag sm"><Icon name={KIND[o.kind].icon} size={12} />{KIND[o.kind].name} · {IDEA[o.chain]?.chip}</span>
              <strong>{o.title}</strong>
              <span className="src">{DATE(o.createdAt)}{o.local ? ' · נשמר במכשיר' : ''}</span>
            </button>
          ))}
        </div>
      )}

      {draft && (
        <SheetModal o={draft} label="התוצר מוכן לאישור" onClose={() => setDraft(null)}
          sub={`${KIND[draft.kind].name} על "${IDEA[draft.chain]?.q}"${from ? `, ממשיך את "${from.title}"` : ''}`}>
          <button type="button" className="press btn primary" disabled={busy} onClick={save} data-save><Icon name="plus" size={14} /> {busy ? 'שומר…' : 'אישור ושמירה בספרייה'}</button>
          <button type="button" className="press btn" onClick={() => { const n = seed + 1; setSeed(n); setDraft(forge(draft.kind, draft.chain, from || undefined, n)); }} data-another><Icon name="reset" size={14} /> גרסה אחרת</button>
          {!from && <button type="button" className="press btn" onClick={() => setDraft(forge(draft.kind, randomIdea(draft.chain)))} data-other-idea><Icon name="spark" size={14} /> מחלוקת אחרת</button>}
          {msg && <span className="forge-msg" role="status">{msg}</span>}
        </SheetModal>
      )}
      {!draft && sel && (
        <SheetModal o={sel} label={sel.title} sub={`${KIND[sel.kind].name} · ${IDEA[sel.chain]?.chip} · ${DATE(sel.createdAt)}`} onClose={close} open>
          <button type="button" className="press btn primary" data-print onClick={() => window.print()}><Icon name="doc" size={14} /> הדפסה או שמירה כ-PDF</button>
          <button type="button" className="press btn" data-next-kind={sel.transition.to} onClick={() => make(sel.transition.to, sel)}>
            <Icon name={KIND[sel.transition.to].icon} size={14} /> להפוך ל{KIND[sel.transition.to].name}
          </button>
          <span className="lib-pos">
            <button type="button" className="press icon-btn" aria-label="הקודם" title="הקודם" disabled={ix <= 0} onClick={() => nav({ o: list[ix - 1]?.id })}><Icon name="prev" size={14} /></button>
            <bdi className="num src">{ix + 1}/{list.length}</bdi>
            <button type="button" className="press icon-btn" aria-label="הבא" title="הבא" disabled={ix < 0 || ix >= list.length - 1} onClick={() => nav({ o: list[ix + 1]?.id })}><Icon name="next" size={14} /></button>
          </span>
        </SheetModal>
      )}
    </main>
  );
}

// חלון אחד ללוח: מעל הדף ולא בתוכו, כך שאין חפיפה עם הרשת. שורת פעולות קבועה למעלה, והלוח מוקטן לרוחב המסך
function SheetModal({ o, label, sub, onClose, open, children }: { o: Output; label: string; sub: string; onClose: () => void; open?: boolean; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setZ(Math.min(1, (el.clientWidth - 24) / 794)));
    ro.observe(el);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', key);
    return () => { ro.disconnect(); removeEventListener('keydown', key); };
  }, [onClose]);
  useEffect(() => { box.current?.scrollTo({ top: 0 }); }, [o]);
  return (
    <div className="lib-modal" role="dialog" aria-modal="true" aria-label={label} data-open={open ? o.id : undefined} data-draft={open ? undefined : ''} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lib-modal-in" ref={box} style={{ ['--z' as string]: z }}>
        <div className="lib-acts no-print">
          <span className="lib-what"><Icon name={KIND[o.kind].icon} size={16} /><strong>{label}</strong><span className="src">{sub}</span></span>
          {children}
          <button type="button" className="press icon-btn lib-x" aria-label="סגירה" title="סגירה (Esc)" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        <div className="lib-sheet"><OutputSheet o={o} date={open ? undefined : new Date().toLocaleDateString('he-IL')} /></div>
      </div>
    </div>
  );
}

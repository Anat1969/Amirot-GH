// ארבעה תוצרים: כתבה, מאמר, מסה ויצירה. ארבעה מנגנוני חשיבה, ולא ארבע תבניות (הסקיל anat-outputs).
// שלוש שרשראות. בכל אחת: הכתבה מעלה שאלה, המאמר מזהה סתירה, המסה מולידה יצירה.
// כל פסקה מסומנת ברמת ידע, וכל עובדה מצביעה על מקור באמירות.
import { useEffect, useMemo, useRef, useState } from 'react';
import Rich from '../Rich';
import { go } from '../route';
import { Icon } from '../icons';
import GenreBand from '../components/GenreBand';
import { KINDS, KIND, LEVEL_NAME, CERTAINTY_NAME, CHAINS, OUTPUTS, refInfo, buildOutputPrompt, claudeUrl, type Output, type Kind } from '../data/outputs';
import { forge, randomIdea } from '../data/forge';
import { loadOutputs, addOutput, flushPending, type CloudOutput } from '../cloud';
import { IDEAS, IDEA, GROUPS, GROUP_ICON } from '../engine';
import { OutputSheet } from './OutSheet';
import './outputs.css';

const set = (params: Record<string, string>, patch: Record<string, string | undefined>) => go('creations', { ...params, v: 'outputs', ...patch }, true);
const REF_KIND = { saying: 'אמירה', idea: 'מחלוקת', research: 'מחקר', article: 'כתבה' } as const;

function Ref({ id }: { id: string }) {
  const r = refInfo(id);
  if (!r) return null;
  return (
    <button type="button" className={`ref ref-${r.kind}`} data-ref={id} onClick={() => go(r.page, r.params)} title={`פתיחה ב${r.page === 'daf' ? 'דף' : r.page === 'research' ? 'מחקר' : 'כתבה'}`}>
      <span className="ref-k">{REF_KIND[r.kind]}</span>
      <span className={r.kind === 'saying' ? 'q-say' : undefined}>{r.label}</span>
    </button>
  );
}

function OutputView({ o, params, all, onForge }: { o: Output; params: Record<string, string>; all: Output[]; onForge: (k: Kind, from: Output) => void }) {
  const from = o.derivedFrom ? all.find((x) => x.id === o.derivedFrom) || null : null;
  const kids = all.filter((x) => x.derivedFrom === o.id);
  const added = (o as CloudOutput).createdAt !== undefined;
  const next = KIND[o.transition.to];
  const [copied, setCopied] = useState(false);
  const prompt = buildOutputPrompt(o.transition.to, { from: o });
  return (
    <article className={`out-doc out-${o.kind}`} data-output={o.id}>
      <GenreBand kind={o.kind} form={o.form} />
      {from && <p className="out-from"><span className="label">התפתח מ</span> <button type="button" className="linkish" onClick={() => set(params, { o: from.id })}>{KIND[from.kind].name}: {from.title}</button></p>}
      {added && <p className="out-added src"><Icon name="spark" size={12} /> נוצר בסדנה שבאפליקציה{(o as CloudOutput).local ? ' · נשמר במכשיר, ממתין לרשת' : ''}</p>}
      <h2 className="out-title">{o.title}</h2>
      <p className="out-lead">{o.lead}</p>
      {o.certainty && (
        <div className={`certainty c-${o.certainty}`} role="img" aria-label={`מד ודאות: ${CERTAINTY_NAME[o.certainty]}`}>
          <span className="label">מד ודאות</span>
          <span className="c-track">{(['open', 'likely', 'established'] as const).map((c, i) => <i key={c} className={i <= ['open', 'likely', 'established'].indexOf(o.certainty!) ? 'on' : ''} />)}</span>
          <strong>{CERTAINTY_NAME[o.certainty]}</strong>
        </div>
      )}
      <div className="out-body">
        {o.blocks.map((b, i) => (
          <section key={i} className={`blk blk-${b.level}`} data-level={b.level}>
            {b.h && <h3 className="blk-h">{b.h}</h3>}
            <p><span className={`olv olv-${b.level}`}>{LEVEL_NAME[b.level]}</span> <Rich>{b.text}</Rich></p>
            {b.refs && <div className="ref-row">{b.refs.map((r) => <Ref key={r} id={r} />)}</div>}
          </section>
        ))}
      </div>
      <p className="out-question"><span className="label">השאלה שנשארת</span> <strong>{o.question}</strong></p>
      <footer className="out-next">
        {kids.map((c) => (
          <button key={c.id} type="button" className="press btn" onClick={() => set(params, { o: c.id })} data-child={c.id}>
            התפתח אל {KIND[c.kind].name}: {c.title}
          </button>
        ))}
        <button type="button" className="press btn primary" data-forge={o.transition.to} onClick={() => onForge(o.transition.to, o)}>
          <Icon name={next.icon} size={14} /> להפוך ל{next.name}, כאן באפליקציה
        </button>
        <a className="press btn" href={claudeUrl(prompt)} target="_blank" rel="noreferrer" data-transform={o.transition.to}
          onClick={() => { navigator.clipboard?.writeText(prompt).then(() => setCopied(true), () => {}); }}>
          <Icon name={next.icon} size={14} /> {copied ? 'הפרומפט הועתק' : `לנסח עם Claude`}
        </a>
        {added && !(o as CloudOutput).local && <button type="button" className="press btn" data-to-library onClick={() => go('library', { o: o.id })}><Icon name="shelf" size={14} /> הלוח בספרייה</button>}
        <span className="src">{o.transition.why}</span>
      </footer>
      <details className="out-quality">
        <summary>מדדי האיכות של {KIND[o.kind].name}</summary>
        <ul>{KIND[o.kind].quality.map((q) => <li key={q}>{q}</li>)}</ul>
      </details>
    </article>
  );
}

export default function Outputs({ params }: { params: Record<string, string> }) {
  const kind = (KINDS.some((k) => k.id === params.k) ? params.k : null) as Kind | null;
  // תוצרים שנוספו בסדנה: מהענן, ומהמכשיר כשאין רשת
  const [cloud, setCloud] = useState<CloudOutput[]>([]);
  const [draft, setDraft] = useState<Output | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { flushPending().finally(() => loadOutputs().then((x) => { setCloud(x); setLoaded(true); })); }, []);
  const all: Output[] = useMemo(() => [...OUTPUTS, ...cloud], [cloud]);
  const sel = all.find((x) => x.id === params.o) || null;
  // יצירה בלחיצה: המנוע בונה את התוצר מהמאגר, והוא מוצג מיד כלוח A4 ערוך. מאשרים, והוא נשמר בספרייה
  const [seed, setSeed] = useState(0);
  const [from, setFrom] = useState<Output | null>(null);
  const startForge = (k: Kind, src?: Output, idea?: string) => {
    const id = idea || src?.chain || randomIdea();
    setFrom(src || null); setSeed(0);
    setDraft(forge(k, id, src)); setMsg('');
    requestAnimationFrame(() => document.querySelector('.forge-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const another = () => { if (!draft) return; const n = seed + 1; setSeed(n); setDraft(forge(draft.kind, draft.chain, from || undefined, n)); };
  const otherIdea = () => { if (!draft) return; setSeed(0); setDraft(forge(draft.kind, randomIdea(draft.chain), undefined)); setFrom(null); };
  // הגעה מהספרייה או מהכפתור "תוצר חדש בלחיצה": היצירה מתחילה מעצמה
  const made = useRef(false);
  useEffect(() => {
    if (params.make !== '1' || made.current) return;
    const src = params.from ? all.find((x) => x.id === params.from) : undefined;
    if (params.from && !src && !loaded) return; // מחכים לענן, כדי למצוא את התוצר שממנו ממשיכים
    made.current = true;
    startForge((kind || 'story') as Kind, src);
  }, [params.make, params.from, loaded, all.length]);
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    const r = await addOutput(draft);
    setBusy(false);
    if (r.ok) { setCloud((c) => [r.out, ...c]); setDraft(null); go('library', { o: r.out.id }); }
    else if (r.local) { setCloud((c) => [r.local!, ...c]); setDraft(null); go('library', { o: r.local.id }); }
    else setMsg(r.error);
  };
  const shown = kind ? KINDS.filter((k) => k.id === kind) : KINDS;
  return (
    <section className="outputs" aria-label="ארבעה תוצרים">
      <p className="out-intro">
        <span><strong>כתבה, מאמר, מסה ויצירה</strong> הם ארבעה מנגנוני חשיבה, ולא ארבע תבניות עיצוב.</span>
        <span>כל שורה היא שרשרת: הכתבה מעלה שאלה, המאמר מזהה סתירה, המסה מולידה יצירה. כל פסקה מסומנת: <span className="olv olv-fact">עובדה</span> <span className="olv olv-interpretation">פרשנות</span> <span className="olv olv-hypothesis">השערה</span> <span className="olv olv-imagination">דמיון</span>.</span>
      </p>
      <div className="kinds-pick" role="group" aria-label="סוג תוצר">
        <button type="button" className="chip chip-all" aria-pressed={!kind} onClick={() => set(params, { k: undefined })}><Icon name="all" size={13} />כל הסוגים</button>
        <span className="chips-sep" aria-hidden="true" />
        {KINDS.map((k) => <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} data-kind={k.id} onClick={() => set(params, { k: k.id })}><Icon name={k.icon} size={14} />{k.name} <span className="src">{k.mechanism}</span></button>)}
      </div>
      {kind && (() => {
        const k = KIND[kind];
        return (
          <div className="kind-def" data-kind-def={k.id}>
            <h3><span className="out-tag"><Icon name={k.icon} size={15} />{k.name}</span> {k.verb}. {k.purpose}</h3>
            <div className="kd-cols">
              <div><h4 className="label">תהליך המחקר</h4><ol>{k.process.map((x) => <li key={x}>{x}</li>)}</ol></div>
              <div><h4 className="label">מבנה הכתיבה</h4><ol>{k.structure.map((x) => <li key={x}>{x}</li>)}</ol></div>
              <div><h4 className="label">מדדי איכות</h4><ul>{k.quality.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <a className="press btn" href={claudeUrl(buildOutputPrompt(k.id, { text: '<הנושא, והאמירות מ"אמירות" עם המקורות שלהן>' }))} target="_blank" rel="noreferrer">הפרומפט הייעודי ל{k.name}, ב-Claude</a>
          </div>
        );
      })()}
      <Forge onStart={startForge} sel={sel} />
      {draft && <Preview d={draft} from={from} onSave={save} onAnother={another} onOtherIdea={otherIdea} onCancel={() => setDraft(null)} busy={busy} msg={msg} />}
      {!draft && msg && <p className="forge-msg">{msg}</p>}
      <div className="chains">
        <div className="chain-head" aria-hidden="true" style={{ ['--n' as string]: shown.length }}><span />{shown.map((k) => <span key={k.id} className="out-tag"><Icon name={k.icon} size={14} />{k.name}</span>)}</div>
        {CHAINS.map(([id, name]) => (
          <div key={id} className="chain-row" data-chain={id} style={{ ['--n' as string]: shown.length }}>
            <span className="chain-name">{name}</span>
            {shown.map((k) => {
              const o = OUTPUTS.find((x) => x.chain === id && x.kind === k.id);
              if (!o) return <span key={k.id} />;
              return (
                <button key={o.id} type="button" className={`out-card out-${o.kind}${sel?.id === o.id ? ' on' : ''}`} aria-pressed={sel?.id === o.id} data-card={o.id} onClick={() => set(params, { o: sel?.id === o.id ? undefined : o.id })}>
                  <span className="out-tag sm"><Icon name={k.icon} size={12} />{k.name}</span>
                  <strong>{o.title}</strong>
                  <span className="src">{o.lead}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {cloud.length > 0 && (
        <div className="added" aria-label="תוצרים שנוספו באפליקציה">
          <h3 className="added-h"><Icon name="spark" size={15} />נוספו בסדנה <bdi className="num">{cloud.length}</bdi></h3>
          <div className="added-row">
            {cloud.filter((o) => !kind || o.kind === kind).map((o) => (
              <button key={o.id} type="button" className={`out-card out-${o.kind}${sel?.id === o.id ? ' on' : ''}`} aria-pressed={sel?.id === o.id} data-card={o.id} onClick={() => set(params, { o: sel?.id === o.id ? undefined : o.id })}>
                <span className="out-tag sm"><Icon name={KIND[o.kind].icon} size={12} />{KIND[o.kind].name} · {IDEA[o.chain]?.chip}</span>
                <strong>{o.title}</strong>
                <span className="src">{o.lead}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {sel ? <OutputView o={sel} params={params} all={all} onForge={startForge} /> : <p className="src">בחרי תוצר כדי לקרוא אותו, לראות ממה התפתח, ולהפוך אותו לסוג הבא.</p>}
    </section>
  );
}

// הסדנה: לחיצה אחת יוצרת תוצר. אפשר לבחור סוג ומחלוקת, או להשאיר "הפתעה". אין מה לכתוב
function Forge({ onStart, sel }: { onStart: (k: Kind, from?: Output, idea?: string) => void; sel: Output | null }) {
  const [k, setK] = useState<Kind>('story');
  const [idea, setIdea] = useState('');
  return (
    <section className="forge" aria-label="סדנה: יצירת תוצר בלחיצה">
      <h3 className="forge-h"><Icon name="spark" size={16} />תוצר חדש בלחיצה</h3>
      <p className="src">המנוע כותב את התוצר מתוך האמירות עצמן, ומעמד אותו כלוח A4. כל עובדה בו מגיעה עם המקור שלה. מאשרים, והוא נשמר בספרייה.</p>
      <div className="forge-row">
        <div className="forge-kinds" role="group" aria-label="סוג">
          {KINDS.map((x) => <button key={x.id} type="button" className="chip" aria-pressed={k === x.id} data-forge-kind={x.id} onClick={() => setK(x.id)}><Icon name={x.icon} size={14} />{x.name}</button>)}
        </div>
        <label className="forge-idea"><span className="label">מחלוקת</span>
          <select className="field" value={idea} onChange={(e) => setIdea(e.target.value)} data-forge-idea>
            <option value="">הפתעה: מחלוקת אקראית</option>
            {GROUPS.map((g) => <optgroup key={g.id} label={g.he}>{g.ideas.map((i) => <option key={i} value={i}>{IDEA[i].chip}: {IDEA[i].q}</option>)}</optgroup>)}
          </select>
        </label>
        <button type="button" className="press btn primary forge-go" data-forge-go onClick={() => onStart(k, undefined, idea || undefined)}><Icon name={KIND[k].icon} size={14} /> יצירת {KIND[k].name} בלחיצה</button>
        {sel && <button type="button" className="press btn" onClick={() => onStart(k, sel)}>{KIND[k].name} שממשיך את "{sel.title}"</button>}
      </div>
      <p className="src forge-groups">{GROUPS.map((g) => <span key={g.id}><Icon name={GROUP_ICON[g.id]} size={12} /> {g.he}</span>)}</p>
    </section>
  );
}

// התצוגה המקדימה: הלוח המוכן עצמו, ומעליו אישור. "גרסה אחרת" מביאה אמירות אחרות מאותה מחלוקת
function Preview({ d, from, onSave, onAnother, onOtherIdea, onCancel, busy, msg }: { d: Output; from: Output | null; onSave: () => void; onAnother: () => void; onOtherIdea: () => void; onCancel: () => void; busy: boolean; msg: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setZ(Math.min(1, (el.clientWidth - 8) / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <section className={`forge-preview out-${d.kind}`} data-draft aria-label="התוצר המוכן, לפני אישור">
      <div className="fp-acts">
        <span className="fp-what"><Icon name={KIND[d.kind].icon} size={15} /><strong>התוצר מוכן לאישור: {KIND[d.kind].name}</strong><span className="src">על "{IDEA[d.chain]?.q}"{from ? `, ממשיך את "${from.title}"` : ''}</span></span>
        <button type="button" className="press btn primary" disabled={busy} onClick={onSave} data-save><Icon name="plus" size={14} /> {busy ? 'שומר…' : 'אישור ושמירה בספרייה'}</button>
        <button type="button" className="press btn" onClick={onAnother} data-another><Icon name="reset" size={14} /> גרסה אחרת</button>
        {!from && <button type="button" className="press btn" onClick={onOtherIdea} data-other-idea><Icon name="spark" size={14} /> מחלוקת אחרת</button>}
        <button type="button" className="press icon-btn" aria-label="ביטול" title="ביטול" onClick={onCancel}><Icon name="x" size={14} /></button>
        {msg && <span className="forge-msg" role="status">{msg}</span>}
      </div>
      <div className="fp-sheet" ref={box} style={{ ['--zp' as string]: z }}><OutputSheet o={d} date={new Date().toLocaleDateString('he-IL')} /></div>
    </section>
  );
}

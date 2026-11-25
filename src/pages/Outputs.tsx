// ארבעה תוצרים: כתבה, מאמר, מסה ויצירה. ארבעה מנגנוני חשיבה, ולא ארבע תבניות (הסקיל anat-outputs).
// שלוש שרשראות. בכל אחת: הכתבה מעלה שאלה, המאמר מזהה סתירה, המסה מולידה יצירה.
// כל פסקה מסומנת ברמת ידע, וכל עובדה מצביעה על מקור באמירות.
import { useEffect, useMemo, useState } from 'react';
import Rich from '../Rich';
import { go } from '../route';
import { Icon } from '../icons';
import GenreBand from '../components/GenreBand';
import { KINDS, KIND, LEVEL_NAME, CERTAINTY_NAME, CHAINS, OUTPUTS, refInfo, buildOutputPrompt, claudeUrl, type Output, type Kind } from '../data/outputs';
import { forge } from '../data/forge';
import { loadOutputs, addOutput, flushPending, type CloudOutput } from '../cloud';
import { IDEAS, IDEA, GROUPS, GROUP_ICON } from '../engine';
import Voice from '../components/Voice';
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
  useEffect(() => { flushPending().finally(() => loadOutputs().then(setCloud)); }, []);
  const all: Output[] = useMemo(() => [...OUTPUTS, ...cloud], [cloud]);
  const sel = all.find((x) => x.id === params.o) || null;
  const startForge = (k: Kind, from?: Output, idea?: string) => {
    const d = forge(k, idea || from?.chain || IDEAS[0].id, from);
    setDraft(d); setMsg('');
    requestAnimationFrame(() => document.querySelector('.forge-edit')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const save = async () => {
    if (!draft) return;
    setBusy(true);
    const r = await addOutput(draft);
    setBusy(false);
    if (r.ok) { setCloud((c) => [r.out, ...c]); setDraft(null); set(params, { o: r.out.id, k: undefined }); setMsg(''); }
    else if (r.local) { setCloud((c) => [r.local!, ...c]); setDraft(null); set(params, { o: r.local.id }); setMsg(r.error); }
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
      {draft && <DraftEditor d={draft} setD={setDraft} onSave={save} onCancel={() => setDraft(null)} busy={busy} msg={msg} />}
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

// הסדנה: בוחרים סוג ומחלוקת, והמנוע בונה טיוטה מהמאגר. כשתוצר פתוח, אפשר להמשיך ממנו
function Forge({ onStart, sel }: { onStart: (k: Kind, from?: Output, idea?: string) => void; sel: Output | null }) {
  const [k, setK] = useState<Kind>('story');
  const [idea, setIdea] = useState(IDEAS[0].id);
  return (
    <section className="forge" aria-label="סדנה: יצירת תוצר">
      <h3 className="forge-h"><Icon name="pen" size={16} />סדנה: תוצר חדש מתוך המאגר</h3>
      <p className="src">המנוע בונה טיוטה מהאמירות עצמן, וכל עובדה בה מגיעה עם המקור שלה. עורכים, ומוסיפים לאפליקציה.</p>
      <div className="forge-row">
        <div className="forge-kinds" role="group" aria-label="סוג">
          {KINDS.map((x) => <button key={x.id} type="button" className="chip" aria-pressed={k === x.id} data-forge-kind={x.id} onClick={() => setK(x.id)}><Icon name={x.icon} size={14} />{x.name}</button>)}
        </div>
        <label className="forge-idea"><span className="label">מחלוקת</span>
          <select className="field" value={idea} onChange={(e) => setIdea(e.target.value)} data-forge-idea>
            {GROUPS.map((g) => <optgroup key={g.id} label={g.he}>{g.ideas.map((i) => <option key={i} value={i}>{IDEA[i].chip}: {IDEA[i].q}</option>)}</optgroup>)}
          </select>
        </label>
        <button type="button" className="press btn primary" data-forge-go onClick={() => onStart(k, undefined, idea)}><Icon name={KIND[k].icon} size={14} /> יצירת {KIND[k].name}</button>
        {sel && <button type="button" className="press btn" onClick={() => onStart(k, sel)}>{KIND[k].name} שממשיך את "{sel.title}"</button>}
      </div>
      <p className="src forge-groups">{GROUPS.map((g) => <span key={g.id}><Icon name={GROUP_ICON[g.id]} size={12} /> {g.he}</span>)}</p>
    </section>
  );
}

// עריכת הטיוטה בתוך הדף: כל שדה עם הקלטה ותמלול. רמת הידע והמקורות נשמרים, כדי שעובדה לא תאבד את המקור שלה
function DraftEditor({ d, setD, onSave, onCancel, busy, msg }: { d: Output; setD: (o: Output) => void; onSave: () => void; onCancel: () => void; busy: boolean; msg: string }) {
  const up = (patch: Partial<Output>) => setD({ ...d, ...patch });
  const upB = (i: number, text: string) => up({ blocks: d.blocks.map((b, j) => (j === i ? { ...b, text } : b)) });
  const drop = (i: number) => up({ blocks: d.blocks.filter((_, j) => j !== i) });
  return (
    <article className={`out-doc out-${d.kind} forge-edit`} data-draft>
      <GenreBand kind={d.kind} form={d.form} />
      <p className="src">טיוטה מהמאגר, על "{IDEA[d.chain]?.q}". כל שדה פתוח לעריכה. בעובדה אפשר לשנות ניסוח, והמקור נשאר מחובר.</p>
      <label className="fe-f"><span className="label">כותרת</span><input className="field fe-title" value={d.title} onChange={(e) => up({ title: e.target.value })} /></label>
      <label className="fe-f"><span className="label">פתיח</span><textarea className="field" rows={2} value={d.lead} onChange={(e) => up({ lead: e.target.value })} /><Voice value={d.lead} onChange={(v) => up({ lead: v })} /></label>
      {d.blocks.map((b, i) => (
        <div key={i} className={`fe-blk blk-${b.level}`}>
          <div className="fe-bh"><span className={`olv olv-${b.level}`}>{LEVEL_NAME[b.level]}</span>{b.h && <span className="label">{b.h}</span>}<button type="button" className="press icon-btn" aria-label="מחיקת הפסקה" title="מחיקת הפסקה" onClick={() => drop(i)}><Icon name="x" size={12} /></button></div>
          <textarea className="field" rows={3} value={b.text} onChange={(e) => upB(i, e.target.value)} />
          <Voice value={b.text} onChange={(v) => upB(i, v)} />
          {b.refs && <div className="ref-row">{b.refs.map((r) => <Ref key={r} id={r} />)}</div>}
        </div>
      ))}
      <label className="fe-f"><span className="label">השאלה שנשארת</span><input className="field" value={d.question} onChange={(e) => up({ question: e.target.value })} /></label>
      <footer className="out-next">
        <button type="button" className="press btn primary" disabled={busy} onClick={onSave} data-save><Icon name="plus" size={14} /> {busy ? 'שומר…' : 'הוספה לאפליקציה'}</button>
        <a className="press btn" href={claudeUrl(buildOutputPrompt(d.kind, { text: [d.title, d.lead, ...d.blocks.map((b) => `[${LEVEL_NAME[b.level]}] ${b.text}`), d.question].join('\n') }))} target="_blank" rel="noreferrer">לשפר ניסוח עם Claude</a>
        <button type="button" className="press btn" onClick={onCancel}>ביטול</button>
        {msg && <span className="forge-msg" role="status">{msg}</span>}
      </footer>
    </article>
  );
}

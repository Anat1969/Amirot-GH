// ארבעה תוצרים: כתבה, מאמר, מסה ויצירה. ארבעה מנגנוני חשיבה, ולא ארבע תבניות (הסקיל anat-outputs).
// שלוש שרשראות. בכל אחת: הכתבה מעלה שאלה, המאמר מזהה סתירה, המסה מולידה יצירה.
// כל פסקה מסומנת ברמת ידע, וכל עובדה מצביעה על מקור באמירות.
import { useState } from 'react';
import Rich from '../Rich';
import { go } from '../route';
import { Icon } from '../icons';
import GenreBand from '../components/GenreBand';
import { KINDS, KIND, LEVEL_NAME, CERTAINTY_NAME, CHAINS, OUTPUTS, OUTPUT, childrenOf, refInfo, buildOutputPrompt, claudeUrl, type Output, type Kind } from '../data/outputs';
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

function OutputView({ o, params }: { o: Output; params: Record<string, string> }) {
  const from = o.derivedFrom ? OUTPUT[o.derivedFrom] : null;
  const kids = childrenOf(o.id);
  const next = KIND[o.transition.to];
  const [copied, setCopied] = useState(false);
  const prompt = buildOutputPrompt(o.transition.to, { from: o });
  return (
    <article className={`out-doc out-${o.kind}`} data-output={o.id}>
      <GenreBand kind={o.kind} form={o.form} />
      {from && <p className="out-from"><span className="label">התפתח מ</span> <button type="button" className="linkish" onClick={() => set(params, { o: from.id })}>{KIND[from.kind].name}: {from.title}</button></p>}
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
        <a className="press btn primary" href={claudeUrl(prompt)} target="_blank" rel="noreferrer" data-transform={o.transition.to}
          onClick={() => { navigator.clipboard?.writeText(prompt).then(() => setCopied(true), () => {}); }}>
          <Icon name={next.icon} size={14} /> {copied ? 'הפרומפט הועתק' : `להפוך ל${next.name}, עם Claude`}
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
  const sel = OUTPUT[params.o || ''] || null;
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
      {sel ? <OutputView o={sel} params={params} /> : <p className="src">בחרי תוצר כדי לקרוא אותו, לראות ממה התפתח, ולהפוך אותו לסוג הבא.</p>}
    </section>
  );
}

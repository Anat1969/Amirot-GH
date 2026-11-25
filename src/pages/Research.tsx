// מחקר: מעבדה שחושפת איך בונים טענה. שלוש רמות בתוך הדף, כמו בתובנות:
// צירים (ימין) ← ממצא בשש שכבות (מרכז) ← עדויות ושאלות לשיחה (שמאל).
import { useState } from 'react';
import { BY_ID, CULTURE, IDEA, LANGS, langOf } from '../engine';
import { FINDINGS, FINDING, LEVELS, GRAMMARS, type Claim, type Finding, type Level } from '../data/research';
import { go } from '../route';
import Rich, { Yr } from '../Rich';
import Flag from '../components/Flag';
import './research.css';

const LV: Record<Level, string> = { עובדה: 'fact', פרשנות: 'read', השערה: 'guess' };
const CERT = ['', 'נמוכה', 'בינונית', 'גבוהה'];

export default function Research({ params }: { params: Record<string, string> }) {
  const f = FINDING[params.x] || FINDINGS[0];
  const [tab, setTab] = useState('f');
  const pick = (id: string) => { go('research', { x: id === FINDINGS[0].id ? undefined : id }, true); setTab('f'); };
  return (
    <main className="app-main rs-page" data-tab={tab}>
      <div className="rs-tabs" role="tablist" aria-label="רמות">
        {[['a', 'צירים'], ['f', 'ממצא'], ['e', 'עדויות']].map(([k, t]) => <button key={k} role="tab" className="chip" aria-pressed={tab === k} aria-selected={tab === k} onClick={() => setTab(k)}>{t}</button>)}
      </div>

      <aside className="panel rs-axes">
        <div className="panel-hd"><span className="label">1 · צירים</span><h2>מה שואלים את המאגר</h2></div>
        <div className="rs-ladder" aria-label="סולם הוודאות">
          {LEVELS.map((l) => <span key={l.id} className="rs-lv" title={l.line}><i className={`lv lv-${LV[l.id]}`} />{l.id}</span>)}
          <p className="src">כל משפט בלשונית מסומן: מה נספר, מה נקרא, ומה רק משוער.</p>
        </div>
        <div className="panel-bd scroll-in">
          {FINDINGS.map((x, i) => (
            <button key={x.id} className={`rs-axis${x.id === f.id ? ' on' : ''}`} onClick={() => pick(x.id)} aria-current={x.id === f.id ? 'true' : undefined}>
              <span className="rs-n">{i}</span>
              <span className="rs-ax-t"><b>{x.axis}</b><span className="rs-ask">{x.ask}</span></span>
              <span className="rs-move">{x.move}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="panel rs-find" aria-live="polite">
        <FindingView f={f} />
      </section>

      <aside className="panel rs-ev">
        <Evidence f={f} />
      </aside>
    </main>
  );
}

function Tag({ level }: { level: Level }) {
  return <span className={`rs-tag t-${LV[level]}`}><i className={`lv lv-${LV[level]}`} />{level}</span>;
}

function ClaimP({ c }: { c: Claim }) {
  return <li className={`rs-claim c-${LV[c.level]}`}><Tag level={c.level} /><Rich as="p">{c.t}</Rich></li>;
}

function FindingView({ f }: { f: Finding }) {
  const isRatio = f.figure.bars.every((b) => b.of === 1);
  return (
    <div className="panel-bd scroll-in rs-body">
      <span className="label">2 · {f.axis} · פעולת חשיבה: {f.move}</span>
      <h1 className="rs-title">{f.title}</h1>

      <figure className="rs-fig">
        <div className="rs-bars">
          {f.figure.bars.map((b) => {
            const w = isRatio ? b.n * 100 : (b.n / Math.max(1, b.of)) * 100;
            const shown = isRatio ? b.n.toFixed(2) : b.unit ? (b.n ? `${b.n} ${b.unit}` : 'בלי תאריך') : `${b.n} מתוך ${b.of}`;
            return (
              <div key={b.label} className="rs-bar">
                <span className="rs-bl">{b.label}</span>
                <span className="rs-track"><i style={{ width: `${Math.max(1.5, Math.min(100, w))}%` }} /></span>
                <span className="rs-bv">{shown}</span>
                {b.note && <span className="rs-bn src">{b.note}</span>}
              </div>
            );
          })}
        </div>
        <Rich as="figcaption" className="src">{f.figure.caption}</Rich>
      </figure>

      <ol className="rs-layers">
        <li><span className="rs-ln">1–2</span><div><h3>עדות והקשר</h3><Rich as="p" className="rs-ctx">{f.context}</Rich>{f.evidence.length > 0 && <p className="src">האמירות עצמן, עם המקור, בעמודת העדויות.</p>}</div></li>
        <li><span className="rs-ln">3</span><div><h3>מה נמצא</h3><ul className="rs-claims"><ClaimP c={f.relation} /></ul></div></li>
        <li><span className="rs-ln">4</span><div><h3>איך אפשר לקרוא את זה</h3><ul className="rs-claims">{f.readings.map((c, i) => <ClaimP key={i} c={c} />)}</ul></div></li>
        <li><span className="rs-ln">5</span><div><h3>כמה אפשר לסמוך</h3>
          <p className="rs-cert"><span className="rs-meter" aria-label={`ודאות ${CERT[f.certainty.level]}`}>{[1, 2, 3].map((k) => <i key={k} className={k <= f.certainty.level ? 'on' : ''} />)}</span><b>ודאות {CERT[f.certainty.level]}</b></p>
          <Rich as="p" className="rs-why">{f.certainty.why}</Rich></div></li>
        <li><span className="rs-ln">6</span><div><h3>שאלות להמשך</h3><ul className="rs-qs">{f.questions.map((q) => <li key={q}>{q}</li>)}</ul></div></li>
      </ol>
      {f.link && <button className="linkish" onClick={() => go(f.link!.page, f.link!.params)}>להעמקה: {f.link.label}</button>}
    </div>
  );
}

function Evidence({ f }: { f: Finding }) {
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const text = `${f.title}\n\nשאלות לשיחה:\n${f.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nמתוך "אמירות", לשונית מחקר: ${location.origin}${location.pathname}#/research?x=${f.id}`;
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } };
  const grammar = (id: string) => GRAMMARS.find((g) => g.ids.includes(id));
  return (
    <div className="panel-bd scroll-in ev rs-evb">
      <span className="label">3 · עדויות</span>
      <h2 className="ev-title">{f.evidence.length ? 'על מה הממצא נשען' : 'הממצא נשען על ספירה של כל המאגר'}</h2>
      {!f.evidence.length && <p className="src">אין כאן אמירה אחת שמדגימה. המספרים בגרף מחושבים מכל {Object.keys(BY_ID).length} האמירות, ומתעדכנים כשהמאגר גדל.</p>}
      {f.table && (
        <div className="rs-table">
          <h3>{f.table.title}</h3>
          <p className="src">{f.table.line}</p>
          <ul>{f.table.rows.map((r) => <li key={r.label}><span>{r.culture && <Flag c={r.culture} />}{r.label}</span><span className="src">{r.value}</span></li>)}</ul>
        </div>
      )}
      {f.evidence.map((id) => {
        const s = BY_ID[id];
        if (!s) return null;
        const on = open === id;
        const g = f.id === 'grammars' ? grammar(id) : undefined;
        return (
          <div key={id} className={`cc-row s-${s.side}${on ? ' on' : ''}`}>
            <button className="cc-btn" onClick={() => setOpen(on ? null : id)} aria-expanded={on}>
              {g && <span className="rs-gr">{g.he}: {g.line}</span>}
              <span className={`say${s.nikud ? ' nikud' : ''}`}>"{s.nikud || s.he}"</span>
              <span className="src"><Flag c={s.culture} />{CULTURE[s.culture].he} · {IDEA[s.idea].chip} · <Yr y={s.year} approx={s.approx} /></span>
            </button>
            {on && (
              <div className="cc-more">
                {s.orig && <p className="orig" lang={s.lang} dir="auto">"{s.orig}"</p>}
                <p className="src">{LANGS[langOf(s)]} · {s.src}</p>
                {s.note && <p className="src">{s.note}</p>}
                <button className="linkish" onClick={() => go('daf', { i: s.idea, s: s.id })}>לדף של "{IDEA[s.idea].chip}"</button>
              </div>
            )}
          </div>
        );
      })}
      <div className="rs-talk">
        <h3>לשיחה</h3>
        <p className="src">שאלות הממצא, בנוסח מוכן להעתקה, לשיחה בין אנשים מתרבויות שונות.</p>
        <button className="press rs-copy" onClick={copy}>{copied ? 'הועתק' : 'העתקת השאלות'}</button>
      </div>
    </div>
  );
}

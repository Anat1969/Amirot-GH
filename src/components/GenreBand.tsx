// פס הסוגה בראש כל תוצר (הסקיל anat-outputs): מה הוא, מנגנון החשיבה, למי, הצורה, ממה התפתח,
// וקישור לשלושת הסוגים האחרים. ארבעה מנגנוני חשיבה, לא ארבע תבניות.
import { KINDS, KIND, type Kind } from '../data/outputs';
import { href } from '../route';
import { Icon } from '../icons';

export default function GenreBand({ kind, form, compact }: { kind: Kind; form?: string; compact?: boolean }) {
  const k = KIND[kind];
  return (
    <aside className={`genre g-${kind}${compact ? ' compact' : ''}`} aria-label={`סוג התוצר: ${k.name}`}>
      <span className="gn-tag"><Icon name={k.icon} size={16} />{k.name}</span>
      <span className="gn-goal"><b>{k.verb}:</b> {k.purpose}</span>
      {!compact && <span className="gn-meta"><span><b>המנגנון:</b> {k.mechanism}</span><span><b>למי:</b> {k.reader}</span>{form && <span><b>הצורה:</b> {form}</span>}</span>}
      <nav className="gn-others" aria-label="שלושת הסוגים האחרים">
        {KINDS.filter((x) => x.id !== kind).map((x) => (
          <a key={x.id} className="gn-o" href={href('creations', { v: 'outputs', k: x.id })} title={`${x.name}: ${x.purpose}`}><Icon name={x.icon} size={13} />{x.name} {x.verb}</a>
        ))}
      </nav>
    </aside>
  );
}

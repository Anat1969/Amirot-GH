// פס הסוגה בראש כל מסמך: מה המסמך הזה, למה הוא נועד, ובמה הוא שונה מהשניים האחרים.
import { GENRES, GENRE, type GenreId } from '../data/genres';
import { href } from '../route';
import { Icon } from '../icons';

export default function GenreBand({ id, compact }: { id: GenreId; compact?: boolean }) {
  const g = GENRE[id];
  return (
    <aside className={`genre g-${id}${compact ? ' compact' : ''}`} aria-label={`סוג המסמך: ${g.he}`}>
      <span className="gn-tag"><Icon name={g.icon} size={16} />{g.he}</span>
      <span className="gn-goal"><b>המטרה:</b> {g.goal}</span>
      {!compact && <span className="gn-meta"><span><b>למי:</b> {g.reader}</span><span><b>הצורה:</b> {g.form}</span><span className="gn-not">{g.not}</span></span>}
      <nav className="gn-others" aria-label="שני הסוגים האחרים">
        {GENRES.filter((x) => x.id !== id).map((x) => (
          <a key={x.id} className="gn-o" href={href(x.page)} title={`${x.he}: ${x.goal}`}><Icon name={x.icon} size={13} />{x.he}: {x.goal}</a>
        ))}
      </nav>
    </aside>
  );
}

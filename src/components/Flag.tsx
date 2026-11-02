// דגל קטן ליד שם תרבות (החריג המותר לכלל "בלי אייקונים"). הדגל הוא של המקום היום, וזה כתוב בריחוף.
import { CULTURE } from '../data/cultures';
export default function Flag({ c, size = 14 }: { c: string; size?: number }) {
  const cu = CULTURE[c];
  if (!cu) return null;
  return <img className="flag" src={`./flags/${cu.flag}.svg`} width={Math.round(size * 4 / 3)} height={size} alt="" title={`${cu.he}: דגל המקום היום (${cu.place})`} loading="lazy" />;
}
export function CultureName({ c, en = false }: { c: string; en?: boolean }) {
  const cu = CULTURE[c];
  return <span className="cname"><Flag c={c} /><b>{cu.he}</b>{en && <span className="en">{cu.en}</span>}</span>;
}

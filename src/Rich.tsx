// טקסט עשיר: **מודגש**, ==תובנה== (מרקר צהוב), ומספרים מודגשים אוטומטית בכיוון LTR מבודד. מתבנית Rich.jsx של Claude-GH.
import type { ElementType } from 'react';
const TOKEN = /(==[^=]+==|\*\*[^*]+\*\*)/g;
const NUM = /(\d[\d,]*(?:\.\d+)?%?)/g;

function Numbers({ text }: { text: string }) {
  return <>{text.split(NUM).map((part, i) => (i % 2 ? <bdi key={i} className="num">{part}</bdi> : part))}</>;
}

export default function Rich({ children, as: Tag = 'span', className }: { children: string; as?: ElementType; className?: string }) {
  const parts = String(children).split(TOKEN);
  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**')) return <strong key={i}><Numbers text={part.slice(2, -2)} /></strong>;
        if (part.startsWith('==')) return <mark key={i} className="insight">{part.slice(2, -2).split(/(\*\*[^*]+\*\*)/g).map((q, j) => (q.startsWith('**') ? <strong key={j}><Numbers text={q.slice(2, -2)} /></strong> : <Numbers key={j} text={q} />))}</mark>;
        return <Numbers key={i} text={part} />;
      })}
    </Tag>
  );
}

// שנה: המספר מבודד ב-LTR, והסיומת העברית מחוץ לו, כדי שלא יתהפכו.
export function Yr({ y, approx }: { y: number | null; approx?: boolean }) {
  if (y == null) return <span className="yr folk">עממי</span>;
  return <span className="yr"><bdi className="num">{approx ? '~' : ''}{Math.abs(y)}</bdi>{y < 0 ? <span className="bce"> לפנה״ס</span> : null}</span>;
}

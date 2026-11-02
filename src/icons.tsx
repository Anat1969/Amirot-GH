// סט אייקוני קו אחד: 24×24, קו בעובי 1.75, בצבע הנושא. אייקון לכל רעיון, ואייקוני תפעול.
import type { CSSProperties } from 'react';

const P: Record<string, string> = {
  hourglass: 'M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9',
  hands: 'M4 13l4-4 3 2 3-3 3 3 3-1M4 13l5 5c1 1 2 1 3 0l7-7M9 18l-2 2M12 15l-2 2',
  magnet: 'M6 4v8a6 6 0 0012 0V4M6 4h4v8a2 2 0 004 0V4h4M6 8h4M14 8h4',
  mouth: 'M3 12c3-4 15-4 18 0-3 5-15 5-18 0zM3 12h18',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
  flame: 'M12 3c1 4 6 6 6 11a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-5 1-8z',
  coin: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v8M9.5 10c0-1 1-2 2.5-2s2.5.8 2.5 2-1 1.6-2.5 2-2.5 1-2.5 2 1 2 2.5 2 2.5-1 2.5-2',
  compass: 'M12 3a9 9 0 100 18 9 9 0 000-18zM15.5 8.5l-2 5-5 2 2-5z',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3M4 20l2-2',
  fence: 'M5 21V7l2-3 2 3v14M15 21V7l2-3 2 3v14M3 11h18M3 16h18',
  bird: 'M3 14c4 0 6-2 7-5 1-2 3-3 5-3l3 2-3 1c0 6-4 9-9 9H4zM10 9c-2-2-5-2-7-1',
  drop: 'M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11zM9 15a3 3 0 003 3',
  lamp: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0012 3z',
  river: 'M3 6c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 12c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 18c3 0 3 2 6 2s3-2 6-2 3 2 6 2',
  scale: 'M12 4v16M8 20h8M5 7h14M5 7l-3 6a3 3 0 006 0zM19 7l-3 6a3 3 0 006 0z',
  circle: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7a5 5 0 100 10 5 5 0 000-10zM12 3v4M12 17v4',
  house: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  tree: 'M12 21v-7M12 14c-4 0-7-3-7-6a5 5 0 0110-1 4 4 0 014 6c0 1-1 1-2 1M9 21h6',
  mirror: 'M12 3a6 8 0 100 16 6 8 0 000-16zM12 19v2M8 21h8M9 8l3-2',
  bread: 'M4 12a8 5 0 0116 0v6H4zM8 10l1 3M12 9v4M16 10l-1 3',
  heart: 'M12 20s-8-5-8-11a4 4 0 018-1 4 4 0 018 1c0 6-8 11-8 11z',
  sickle: 'M14 4a8 8 0 11-9 11M5 15l-2 5 5-2M14 4c-3 2-4 5-3 8',
  wheat: 'M12 21V8M12 8c-2-1-3-3-3-5 2 1 3 3 3 5zM12 8c2-1 3-3 3-5-2 1-3 3-3 5zM12 13c-2-1-4-3-4-5 2 1 4 3 4 5zM12 13c2-1 4-3 4-5-2 1-4 3-4 5zM12 18c-2-1-4-3-4-5 2 1 4 3 4 5zM12 18c2-1 4-3 4-5-2 1-4 3-4 5z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  // תפעול
  prev: 'M9 6l6 6-6 6',
  next: 'M15 6l-6 6 6 6',
  x: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5l11 7-11 7z',
  pause: 'M8 5v14M16 5v14',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  reset: 'M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
};

export function Icon({ name, size = 20, color = 'currentColor', style, title }: { name: string; size?: number; color?: string; style?: CSSProperties; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter" style={style} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <path d={P[name] || P.circle} />
    </svg>
  );
}

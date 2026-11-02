// מנוע הקשרים: הכול מחושב בקוד, דטרמיניסטי, מתוך המאגר. אין כאן טקסט שמודל כתב בזמן ריצה.
import { SAYINGS, CROSS_PAIRS, type Saying, type Side } from './data/sayings';
import { IDEAS, IDEA } from './data/ideas';
import { CULTURE, CULTURES, LANGS, WORLDS, type World } from './data/cultures';
import { GROUPS, VALUES, LENSES, PORTRAITS, LENS_LINE, type Lens } from './data/lenses';

export { SAYINGS, IDEAS, IDEA, CULTURE, CULTURES, LANGS, WORLDS, GROUPS, VALUES, LENSES, PORTRAITS, LENS_LINE };
export type { World, Lens };

// שפה אינה תרבות: לכל אמירה שפה משלה. בלי נוסח מקור, השפה היא עברית.
export const langOf = (s: Saying) => s.lang || 'he';
export const GROUP_OF: Record<string, string> = {};
for (const g of GROUPS) for (const i of g.ideas) GROUP_OF[i] = g.id;
export type { Saying, Side };

export const BY_ID: Record<string, Saying> = Object.fromEntries(SAYINGS.map((s) => [s.id, s]));
export const BY_IDEA: Record<string, Saying[]> = {};
for (const s of SAYINGS) (BY_IDEA[s.idea] ||= []).push(s);

// ───── שני צירים: דמיון במילים ודמיון במשמעות ─────
export type Kind = 'twin' | 'cousin' | 'impostor' | 'rival';
export const KINDS: Record<Kind, { he: string; line: string; tone: string }> = {
  twin: { he: 'תאומים', line: 'אותן מילים, אותה משמעות', tone: 'var(--twin)' },
  cousin: { he: 'בני דודים', line: 'מילים אחרות, אותה משמעות', tone: 'var(--side-a)' },
  impostor: { he: 'מתחזים', line: 'אותן מילים, משמעות אחרת', tone: 'var(--impostor)' },
  rival: { he: 'יריבים', line: 'מילים אחרות, משמעות הפוכה', tone: 'var(--side-b)' },
};

export type Pair = { a: Saying; b: Saying; surface: number; meaning: number; kind: Kind; note?: string; x: number; y: number };

const jaccard = (x: string[], y: string[]) => {
  if (!x.length || !y.length) return 0;
  const A = new Set(x);
  const inter = y.filter((m) => A.has(m)).length;
  return inter / new Set([...x, ...y]).size;
};

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
};

const sideMeaning = (p: Side, q: Side) => (p === q ? 0.9 : p === 's' || q === 's' ? 0.55 : -0.9);

export function classify(surface: number, meaning: number): Kind | null {
  if (meaning >= 0.5) return surface >= 0.5 ? 'twin' : 'cousin';
  if (surface >= 0.5) return 'impostor';
  if (meaning <= -0.5) return 'rival';
  return null;
}

function makePair(a: Saying, b: Saying, meaning: number, note?: string): Pair | null {
  const surface = jaccard(a.motifs, b.motifs);
  const kind = classify(surface, meaning);
  if (!kind) return null;
  const k = a.id < b.id ? a.id + b.id : b.id + a.id;
  // פיזור קל לתצוגה בלבד, כדי שנקודות זהות לא יסתירו זו את זו. הסיווג נעשה לפני הפיזור.
  const x = Math.min(1, Math.max(0, surface + (hash(k) - 0.5) * 0.1));
  const y = Math.min(1, Math.max(-1, meaning + (hash(k + '~') - 0.5) * 0.14));
  return { a, b, surface, meaning, kind, note, x, y };
}

const PAIRS_LIST: Pair[] = [];
const seen = new Set<string>();
const key = (a: string, b: string) => (a < b ? a + '|' + b : b + '|' + a);
for (const cp of CROSS_PAIRS) {
  const p = makePair(BY_ID[cp.a], BY_ID[cp.b], cp.meaning, cp.note);
  seen.add(key(cp.a, cp.b));
  if (p) PAIRS_LIST.push(p);
}
for (let i = 0; i < SAYINGS.length; i++) {
  for (let j = i + 1; j < SAYINGS.length; j++) {
    const a = SAYINGS[i], b = SAYINGS[j];
    if (seen.has(key(a.id, b.id))) continue;
    let p: Pair | null = null;
    if (a.idea === b.idea) p = makePair(a, b, sideMeaning(a.side, b.side));
    else if (jaccard(a.motifs, b.motifs) >= 0.5) p = makePair(a, b, 0);
    if (p) PAIRS_LIST.push(p);
  }
}
export const PAIRS = PAIRS_LIST;

export function relationsOf(id: string) {
  return PAIRS.filter((p) => p.a.id === id || p.b.id === id).map((p) => ({ ...p, other: p.a.id === id ? p.b : p.a }));
}

// ───── מקום וזמן ─────
export const where = (s: Saying) => {
  const c = CULTURE[s.culture];
  return s.at ? { ...s.at } : { he: c.place, en: c.placeEn, lat: c.lat, lon: c.lon };
};

export function km(a: Saying, b: Saying) {
  const p = where(a), q = where(b);
  const r = Math.PI / 180;
  const h = Math.sin(((q.lat - p.lat) * r) / 2) ** 2 + Math.cos(p.lat * r) * Math.cos(q.lat * r) * Math.sin(((q.lon - p.lon) * r) / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}

export const yearGap = (a: Saying, b: Saying) => (a.year == null || b.year == null ? null : Math.abs(a.year - b.year));

export function yearLabel(y: number | null, approx?: boolean) {
  if (y == null) return 'עממי';
  const t = y < 0 ? `${-y} לפנה״ס` : `${y}`;
  return approx ? `~${t}` : t;
}

export const fmt = (n: number) => n.toLocaleString('en-US');

// ───── משפחות דימוי: מאיפה כל תרבות לוקחת את התמונות שלה ─────
export const FAMILIES: { id: string; he: string; motifs: string[] }[] = [
  { id: 'animal', he: 'חיות וציפורים', motifs: ['ציפור', 'חיה', 'נמר', 'סוס', 'גמל', 'מאורה'] },
  { id: 'water', he: 'מים', motifs: ['מים', 'נהר', 'טיפה', 'ים', 'דלי'] },
  { id: 'body', he: 'גוף', motifs: ['עין', 'לב', 'יד', 'לשון', 'רגל', 'לחי', 'שן', 'פנים', 'מבט', 'חלב'] },
  { id: 'home', he: 'בית ועיר', motifs: ['בית', 'גדר', 'עיר', 'רומא', 'שכן', 'קרוב', 'מקום', 'דרך'] },
  { id: 'tool', he: 'חומר וכלי', motifs: ['ברזל', 'אבן', 'כלי', 'עט', 'חרב', 'גלגל', 'יתד', 'ספינה', 'חוט', 'בגד', 'כיס', 'טבח', 'לחם'] },
  { id: 'money', he: 'כסף וזהב', motifs: ['כסף', 'זהב', 'עושר', 'ברק'] },
  { id: 'sky', he: 'שמיים, אל ושטן', motifs: ['אל', 'שמיים', 'שמש', 'שטן', 'מזל', 'כתב'] },
  { id: 'plant', he: 'צומח', motifs: ['עץ', 'פרח', 'אזוב', 'שורש', 'קטיף', 'צמיחה'] },
  { id: 'time', he: 'זמן ומספר', motifs: ['זמן', 'יום', 'עכשיו', 'מספר', 'שלושה', 'זקנה'] },
  { id: 'voice', he: 'קול ושתיקה', motifs: ['שתיקה', 'דיבור', 'קול'] },
];
const FAMILY_OF: Record<string, string> = {};
for (const f of FAMILIES) for (const m of f.motifs) FAMILY_OF[m] = f.id;
export const familiesOf = (s: Saying) => [...new Set(s.motifs.map((m) => FAMILY_OF[m]).filter(Boolean))];

// ───── מגמות ─────
export type Cell = { a: number; b: number; s: number };
export function matrix() {
  const m: Record<string, Record<string, Cell>> = {};
  for (const s of SAYINGS) {
    const row = (m[s.culture] ||= {});
    const cell = (row[s.idea] ||= { a: 0, b: 0, s: 0 });
    cell[s.side]++;
  }
  return m;
}

export function stats() {
  const m = matrix();
  const cultures = CULTURES.filter((c) => m[c.id]);
  const both: { culture: string; idea: string }[] = [];
  for (const c of cultures) for (const [idea, cell] of Object.entries(m[c.id])) if (cell.a && cell.b) both.push({ culture: c.id, idea });
  const selfCultures = new Set(both.map((x) => x.culture));
  const perIdea = IDEAS.map((i) => {
    const ss = BY_IDEA[i.id] || [];
    const cs = new Set(ss.map((s) => s.culture));
    const regions = new Set(ss.map((s) => CULTURE[s.culture].region));
    const dated = ss.filter((s) => s.year != null).map((s) => s.year as number);
    return { idea: i, n: ss.length, cultures: cs.size, regions: regions.size, first: dated.length ? Math.min(...dated) : null, a: ss.filter((s) => s.side === 'a').length, b: ss.filter((s) => s.side === 'b').length, s: ss.filter((s) => s.side === 's').length };
  });
  const kinds = { twin: 0, cousin: 0, impostor: 0, rival: 0 } as Record<Kind, number>;
  for (const p of PAIRS) kinds[p.kind]++;
  // הזוג המקביל הרחוק ביותר: אותה משמעות, הכי הרבה קילומטרים ושנים
  const farCousin = PAIRS.filter((p) => p.kind !== 'impostor' && p.kind !== 'rival' && p.meaning > 0.8 && p.a.culture !== p.b.culture)
    .map((p) => ({ p, d: km(p.a, p.b) }))
    .sort((x, y) => y.d - x.d)[0];
  const oldGap = PAIRS.filter((p) => p.meaning > 0.8)
    .map((p) => ({ p, g: yearGap(p.a, p.b) ?? 0 }))
    .sort((x, y) => y.g - x.g)[0];
  return { cultures, both, selfCultures, perIdea, kinds, farCousin, oldGap, dated: SAYINGS.filter((s) => s.year != null).length };
}

export function familyMatrix() {
  const out: Record<string, Record<string, number>> = {};
  for (const s of SAYINGS) for (const f of familiesOf(s)) {
    const r = (out[s.culture] ||= {});
    r[f] = (r[f] || 0) + 1;
  }
  return out;
}

// ───── חיפוש בעברית: תחילת מילה, אחרי אותיות שימוש; מילה עד 3 אותיות חייבת להיות שלמה ─────
const PREFIX = '(?:[והבכלמש]{0,3})';
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const strip = (s: string) => s.replace(/[֑-ׇ]/g, '').toLowerCase();

export function matcher(q: string) {
  const words = strip(q).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const res = words.map((w) => {
    const heb = /[א-ת]/.test(w);
    const start = heb ? `(?:^|[^א-ת])${PREFIX}` : '(?:^|[^\\p{L}])';
    const end = w.length <= 3 ? (heb ? '(?=$|[^א-ת])' : '(?=$|[^\\p{L}])') : '';
    return new RegExp(start + esc(w) + end, 'u');
  });
  return (s: Saying) => {
    const c = CULTURE[s.culture];
    const text = strip([s.he, s.orig, s.src, c.he, c.en, c.place, c.placeEn, IDEA[s.idea].chip, IDEA[s.idea].q, s.motifs.join(' ')].join(' '));
    return res.every((r) => r.test(text));
  };
}


// ───── עולמות ערכים: מה כל עולם בוחר, ובאיזו עדשה הוא מסתכל ─────
export const WORLD_ORDER: World[] = ['jewish', 'islam', 'china', 'japan', 'classical', 'christian', 'anglo', 'europe', 'nordic', 'other'];
export function worldStats(w: World) {
  const ss = SAYINGS.filter((s) => CULTURE[s.culture].world === w);
  const ideas: Record<string, { a: number; b: number; s: number }> = {};
  for (const s of ss) (ideas[s.idea] ||= { a: 0, b: 0, s: 0 })[s.side]++;
  const both = Object.entries(ideas).filter(([, c]) => c.a && c.b).map(([i]) => i);
  const values: Record<string, { n: number; side: 'a' | 'b'; idea: string }> = {};
  for (const s of ss) if (s.side !== 's') { const v = VALUES[s.idea][s.side]; (values[v] ||= { n: 0, side: s.side, idea: s.idea }).n++; }
  const lens: Record<string, number> = {};
  for (const ls of Object.values(LENSES)) for (const l of ls) if (l.c.some((c) => CULTURE[c].world === w)) lens[l.lens] = (lens[l.lens] || 0) + 1;
  const langs = [...new Set(ss.map(langOf))];
  const cultures = [...new Set(ss.map((s) => s.culture))];
  return { w, ss, ideas, both, syn: ss.filter((s) => s.side === 's').length, values, lens, langs, cultures };
}

// ───── שפה ותרבות: אותה שפה בכמה תרבויות, ואותה תרבות בכמה שפות ─────
export function langCulture() {
  const byLang: Record<string, Set<string>> = {};
  const byWorld: Record<string, Set<string>> = {};
  for (const s of SAYINGS) {
    (byLang[langOf(s)] ||= new Set()).add(s.culture);
    (byWorld[CULTURE[s.culture].world] ||= new Set()).add(langOf(s));
  }
  const sharedLangs = Object.entries(byLang).filter(([, c]) => c.size > 1).map(([l, c]) => ({ lang: l, cultures: [...c] })).sort((a, b) => b.cultures.length - a.cultures.length);
  const multiLangWorlds = Object.entries(byWorld).filter(([, l]) => l.size > 1).map(([w, l]) => ({ world: w as World, langs: [...l] })).sort((a, b) => b.langs.length - a.langs.length);
  // אותה שפה, תרבות אחרת, משמעות הפוכה
  const splits = PAIRS.filter((p) => langOf(p.a) === langOf(p.b) && p.a.culture !== p.b.culture && p.meaning < 0);
  return { sharedLangs, multiLangWorlds, splits };
}

// מפיק את public/creations.json מתוך הנתונים של האפליקציה (תקן "יצירות", AppOfApp-GH/docs/creations-standard.md).
// הרצה: npx esbuild tools/creations.ts --bundle --platform=node --log-level=error | node
// היצירות נגזרות מאותו מקור כמו הממשק: כתבות, מחלוקות, כללי הכרעה, הייקו ויצירות האמנות.
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { ARTICLES } from '../src/data/articles';
import { IDEAS, BY_IDEA, CULTURE } from '../src/engine';
import { ART } from '../src/data/art';

type C = Record<string, unknown> & { id: string; style: string };
const postLines = (t: string) => { const l = t.split('\n').filter(Boolean); return l.length <= 6 ? l.join('\n') : [...l.slice(0, 4), l[l.length - 1]].join('\n'); };
const firstSentence = (s: string) => { const m = s.match(/^(.+?[.?!])\s+(.+)$/s); return m ? [m[1], m[2]] : [s, '']; };
const img = (idea: string, k: 'a' | 'b') => (ART[idea]?.[k] ? `art/${ART[idea]![k]!.file}` : undefined);
const credit = (idea: string, k: 'a' | 'b') => { const w = ART[idea]?.[k]; return w ? `${w.title} · ${w.artist}, ${w.date}. מוזיאון קליבלנד לאמנות, CC0` : undefined; };
const pos = (idea: string, k: 'a' | 'b') => ART[idea]?.[k]?.pos;

// אילו כתבות ואילו מחלוקות הופכות לחדרים, ובאיזה שלב
const ART_ROOMS: [string, 'ידע' | 'הבנה'][] = [['river', 'ידע'], ['eye', 'ידע'], ['oral', 'ידע'], ['certainty', 'הבנה'], ['both', 'הבנה'], ['not', 'הבנה']];
const IDEA_ROOMS = ['haste', 'silence', 'love'];

const topics = [];
for (const [aid, zone] of ART_ROOMS) {
  const a = ARTICLES.find((x) => x.id === aid)!;
  const lead = 'idea' in a.lead ? a.lead.idea : null;
  const pull = a.body.find((b) => 'pull' in b) as { pull: string; cite: string } | undefined;
  const ins = a.body.find((b) => 'insight' in b) as { insight: string } | undefined;
  const hk = a.body.find((b) => 'haiku' in b) as { haiku: string[]; note: string } | undefined;
  const ps = a.body.filter((b) => 'p' in b).map((b) => (b as { p: string }).p);
  const cs: C[] = [];
  if (lead) cs.push({ id: 'poster', style: 'poster', title: a.title, text: a.sub, image: img(lead, 'a'), pos: pos(lead, 'a'), credit: credit(lead, 'a'), kicker: a.kicker });
  else cs.push({ id: 'gradient', style: 'gradient', title: a.title, text: a.sub, kicker: a.kicker });
  if (pull) cs.push({ id: 'quote', style: 'quote', quote: pull.pull, cite: pull.cite, kicker: a.title });
  if (ins) { const [t, x] = firstSentence(ins.insight); cs.push({ id: 'insight', style: 'insight', title: t, text: x, kicker: a.title }); }
  if (hk) cs.push({ id: 'haiku', style: 'haiku', lines: hk.haiku, text: hk.note, kicker: a.title });
  cs.push({ id: 'post', style: 'post', title: a.title, text: postLines(a.post), image: lead ? img(lead, 'b') : undefined, pos: lead ? pos(lead, 'b') : undefined, tags: ['אמירות', 'פתגמים', 'תרבות'], kicker: a.title });
  cs.push({ id: 'essay', style: 'essay', title: a.title, text: a.sub, image: lead ? img(lead, 'b') : undefined, pos: lead ? pos(lead, 'b') : undefined, body: ps.slice(0, 4), kicker: a.kicker });
  topics.push({ id: aid, zone, title: a.title, sub: a.sub, creations: cs });
}
for (const id of IDEA_ROOMS) {
  const i = IDEAS.find((x) => x.id === id)!;
  const s = BY_IDEA[id].find((x) => x.side === 's') || BY_IDEA[id][0];
  const cs: C[] = [
    { id: 'veil', style: 'veil', title: i.q, text: i.explain, image: img(id, 'a'), pos: pos(id, 'a'), credit: credit(id, 'a'), kicker: i.chip },
    { id: 'fromto', style: 'fromto', title: 'מתי כל צד נכון', fromLabel: i.a, toLabel: i.b, from: i.rule.a, to: i.rule.b, text: `שאלת בקרה: ${i.check}`, kicker: i.chip },
    { id: 'insight', style: 'insight', title: i.insight, text: i.explain, kicker: i.chip },
    { id: 'quote', style: 'quote', quote: s.nikud || s.he, who: CULTURE[s.culture].he, cite: s.src, kicker: 'אמירה שמחזיקה בשני הצדדים' },
    { id: 'haiku', style: 'haiku', lines: i.haiku, text: i.haikuNote, kicker: i.chip },
    { id: 'gradient', style: 'gradient', title: `בעיר: ${i.city.place}`, text: i.city.text, kicker: i.chip },
    { id: 'post', style: 'post', title: i.q, text: postLines(i.post), image: img(id, 'b'), pos: pos(id, 'b'), tags: ['אמירות', i.chip], kicker: i.chip },
  ];
  topics.push({ id, zone: 'יישום', title: `${i.chip}: ${i.q}`, sub: i.explain, creations: cs });
}
// שומרים את ה-png ואת חדר התערוכה מהריצה הקודמת
const out = 'public/creations.json';
const prev = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null;
for (const t of topics as { id: string; room?: string; creations: C[] }[]) {
  const pt = prev?.topics?.find((x: { id: string }) => x.id === t.id);
  if (pt?.room) t.room = pt.room;
  for (const c of t.creations) { const pc = pt?.creations?.find((x: C) => x.id === c.id); if (pc?.png) c.png = pc.png; }
}
const data = {
  app: { id: 'amirot', name: 'אמירות', url: 'https://amirot-gh.vercel.app', repo: 'Anat1969/Amirot-GH',
    palette: { a: '#1f3a68', b: '#a3261e', c: '#b8700f', s: '#1d7a4f', accent: '#1d7a4f', 'b-wash': '#fbeceb', 's-wash': '#e4f3eb', paper2: '#f6f4ee', serif: '"Frank Ruhl Libre", serif' } },
  topics,
};
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log(`${topics.length} חדרים, ${topics.reduce((n, t) => n + t.creations.length, 0)} יצירות`);

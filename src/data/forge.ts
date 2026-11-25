// המנוע של סדנת התוצרים: בונה טיוטה מלאה של כתבה, מאמר, מסה או יצירה, מתוך המאגר בלבד.
// כל עובדה היא אמירה, או ספירה מהמחלוקת, עם המקור שלה. מה שלא נגזר מהמאגר מסומן פרשנות, השערה או דמיון.
// בלי בינה מלאכותית ובלי תשלום: התבנית היא מנגנון החשיבה של הסוג (הסקיל anat-outputs), והתוכן הוא הנתונים.
// אחר כך עורכים בדף, ו"הוספה לאפליקציה" שומרת בענן (cloud.ts).
import { BY_IDEA, IDEA, CULTURE, WORLDS, VALUES, type Saying } from '../engine';
import { yearLabel } from '../engine';
import type { Kind, Output, Block } from './outputs';

const say = (s: Saying) => `"${s.he}"`;
const who = (s: Saying) => `${CULTURE[s.culture].he}${s.year != null ? `, ${yearLabel(s.year, s.approx)}` : ''}`;
const plain = (t: string) => t.replace(/\*\*|==/g, '');
const pick = <T,>(xs: T[], n: number) => xs.slice(0, n);

/** נתוני המחלוקת שכל סוג נשען עליהם */
function material(ideaId: string) {
  const idea = IDEA[ideaId];
  const ss = BY_IDEA[ideaId] || [];
  const A = ss.filter((s) => s.side === 'a'), B = ss.filter((s) => s.side === 'b'), S = ss.filter((s) => s.side === 's');
  const dated = ss.filter((s) => s.year != null).sort((x, y) => (x.year as number) - (y.year as number));
  const cultures = new Set(ss.map((s) => s.culture));
  // תרבות שאומרת את שני הצדדים: הסתירה הפנימית
  const both = [...cultures].find((c) => A.some((s) => s.culture === c) && B.some((s) => s.culture === c));
  const major = A.length >= B.length ? 'a' : 'b';
  return { idea, ss, A, B, S, dated, cultures, both, major } as const;
}

function story(ideaId: string): Omit<Output, 'id'> {
  const { idea, A, B, dated } = material(ideaId);
  const first = dated[0] || A[0] || B[0];
  const chapters = dated.slice(1, 4);
  const opp = (first.side === 'a' ? B : A).find((s) => s.id !== first.id);
  const blocks: Block[] = [
    { h: 'הרגע', level: 'fact', text: `${who(first)}: ${say(first)}. המקור: ${first.src}.`, refs: [first.id] },
    ...chapters.map((s, i): Block => ({ h: i === 0 ? 'ומה בא אחר כך' : undefined, level: 'fact', text: `${who(s)}: ${say(s)}.`, refs: [s.id] })),
    ...(opp ? [{ h: 'והצד השני', level: 'fact' as const, text: `ובצד ההפוך, ${who(opp)}: ${say(opp)}.`, refs: [opp.id] }] : []),
    { h: 'הסיפור שמאחור', level: 'interpretation', text: plain(idea.story), refs: [`idea:${ideaId}`] },
    { h: 'התובנה', level: 'interpretation', text: idea.insight, refs: [`idea:${ideaId}`] },
  ];
  return {
    kind: 'story', chain: ideaId, derivedFrom: null,
    title: `${idea.q.replace(/\?$/, '')}: מ${CULTURE[first.culture].he} ועד היום`,
    lead: `${dated.length} אמירות מתוארכות, משנת ${yearLabel(first.year, first.approx)}, על שאלה אחת: ${idea.q}`,
    blocks, question: plain(idea.check),
    transition: { to: 'paper', why: 'הכתבה משאירה שאלה שאפשר לבדוק מול כל האמירות במחלוקת.' },
  };
}

function paper(ideaId: string): Omit<Output, 'id'> {
  const { idea, ss, A, B, S, cultures, both } = material(ideaId);
  const bothA = both ? A.find((s) => s.culture === both)! : null, bothB = both ? B.find((s) => s.culture === both)! : null;
  const blocks: Block[] = [
    { h: 'השאלה', level: 'interpretation', text: `${idea.q} ובאיזה תנאי כל תשובה נכונה?` },
    { h: 'השיטה', level: 'fact', text: `במחלוקת **${ss.length}** אמירות מ-**${cultures.size}** תרבויות: **${A.length}** בצד "${idea.a}", **${B.length}** בצד "${idea.b}", ו-**${S.length}** ${S.length === 1 ? 'שמחזיקה' : 'שמחזיקות'} בשניהם.`, refs: [`idea:${ideaId}`] },
    ...pick(A, 1).map((s): Block => ({ h: `הראיות: ${idea.a}`, level: 'fact', text: `${who(s)}: ${say(s)}.`, refs: [s.id] })),
    ...pick(B, 1).map((s): Block => ({ h: `הראיות: ${idea.b}`, level: 'fact', text: `${who(s)}: ${say(s)}.`, refs: [s.id] })),
    ...(bothA && bothB ? [{ h: 'הסתירה', level: 'fact' as const, text: `באותה מסורת, ${CULTURE[both!].he}, נאמרו שני הצדדים: ${say(bothA)}, וגם ${say(bothB)}.`, refs: [bothA.id, bothB.id] }] : []),
    { h: 'ההכרעה', level: 'interpretation', text: `${idea.a}: ${plain(idea.rule.a)} ${idea.b}: ${plain(idea.rule.b)}`, refs: [`idea:${ideaId}`] },
    ...pick(S, 1).map((s): Block => ({ h: 'מה אמרו המסורות עצמן', level: 'fact', text: `${who(s)}: ${say(s)}.`, refs: [s.id] })),
    { h: 'גבולות', level: 'interpretation', text: `המסקנה נשענת על ${ss.length} אמירות בלבד, שנבחרו כדי להדגים את המחלוקת ולא כדי לייצג תרבויות.`, refs: ['research:limits'] },
  ];
  return {
    kind: 'paper', chain: ideaId, derivedFrom: null, certainty: S.length ? 'likely' : 'open',
    title: idea.q, lead: `האם יש תשובה אחת, או שהתשובה תלויה בתנאי? ${ss.length} אמירות נבדקו.`,
    blocks, question: `מה עוד צריך לדעת כדי להכריע ב"${idea.q}" במקרה מסוים?`,
    transition: { to: 'essay', why: 'הסתירה וגבולות המסקנה הופכים להנחה שאפשר לערער עליה.' },
  };
}

function essay(ideaId: string): Omit<Output, 'id'> {
  const { idea, A, B, major } = material(ideaId);
  const [maj, min] = major === 'a' ? [A, B] : [B, A];
  const [majLabel, minLabel] = major === 'a' ? [idea.a, idea.b] : [idea.b, idea.a];
  const crack = min[0];
  const far = min.find((s) => crack && CULTURE[s.culture].world !== CULTURE[crack.culture].world);
  const val = VALUES[ideaId];
  const blocks: Block[] = [
    { h: 'ההנחה', level: 'interpretation', text: `רוב האמירות במחלוקת (${maj.length} מול ${min.length}) אומרות: ${majLabel}. נראה שזה המובן מאליו.`, refs: [`idea:${ideaId}`] },
    ...(crack ? [{ h: 'הסדק', level: 'fact' as const, text: `אבל ב${who(crack)} נאמר: ${say(crack)}.`, refs: [crack.id] }] : []),
    ...(far ? [{ h: 'אותו דפוס במקום רחוק', level: 'fact' as const, text: `ואותו דפוס במקום רחוק, ${WORLDS[CULTURE[far.culture].world].he}: ${say(far)}.`, refs: [far.id] }] : []),
    { h: 'המסע: העיר', level: 'fact', text: plain(idea.city.text), refs: [`idea:${ideaId}`] },
    { h: 'הערעור', level: 'hypothesis', text: `מה אם ${val ? `"${val[major === 'a' ? 'b' : 'a']}"` : minLabel} איננו החריג, אלא מה שמאפשר את ${val ? `"${val[major]}"` : majLabel}?` },
    { h: 'מה עובדה ומה מחשבה', level: 'interpretation', text: 'האמירות והמקורות שלהן הן עובדה. החיבור בין התרבויות והעיר הוא מחשבה של המסה.' },
  ];
  return {
    kind: 'essay', chain: ideaId, derivedFrom: null,
    title: `${minLabel}, לא רק ${majLabel}`,
    lead: `מקובל לחשוב ש${majLabel}. המסה הולכת אל הצד השני, ושואלת מה הוא מגלה על הראשון.`,
    blocks, question: `מתי ${minLabel} הוא מה ששומר על ${majLabel}?`,
    transition: { to: 'creation', why: 'השאלה החדשה הופכת ל"מה אם...".' },
  };
}

function creation(ideaId: string): Omit<Output, 'id'> {
  const { idea, A, B, S } = material(ideaId);
  const base = S[0] || A[0] || B[0];
  const blocks: Block[] = [
    { h: 'הבסיס', level: 'fact', text: `${who(base)}: ${say(base)}.`, refs: [base.id] },
    { h: 'המהלך', level: 'imagination', text: `מה אם בעולם היה רק צד אחד: כולם ${idea.a}, ואיש לא ${idea.b}?` },
    { h: 'היצירה', level: 'imagination', text: idea.haiku.join(' / ') },
    { h: 'מה היא מאירה', level: 'interpretation', text: idea.insight, refs: [`idea:${ideaId}`] },
    { h: 'לאן זה מוביל', level: 'hypothesis', text: `${plain(idea.check)} אפשר לבדוק את זה בהחלטה אחת השבוע, ולרשום מה קרה.` },
  ];
  return {
    kind: 'creation', chain: ideaId, derivedFrom: null, form: 'הייקו וניסוי מחשבתי',
    title: `עולם של צד אחד: ${idea.q.replace(/\?$/, '')}`, lead: 'מה היה קורה אם רק אחת מהאמירות הייתה נכונה, תמיד?',
    blocks, question: `מה היה חסר בעולם בלי "${idea.b}"?`,
    transition: { to: 'story', why: 'ההשערה בסוף היצירה היא נושא לתחקיר.' },
  };
}

const MAKERS: Record<Kind, (idea: string) => Omit<Output, 'id'>> = { story, paper, essay, creation };

/** טיוטה מלאה מהמאגר. כשהיא ממשיכה תוצר קודם, היא שומרת את הקשר אליו ואת המחלוקת שלו */
export function forge(kind: Kind, ideaId: string, from?: Output): Output {
  const o = MAKERS[kind](ideaId);
  return { ...o, id: 'draft', derivedFrom: from?.id ?? null, ...(from ? { lead: `${o.lead} התפתח מ"${from.title}".` } : {}) };
}

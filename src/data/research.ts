// מחקר: מסגרת אנליטית מעל המאגר. לא עוד תובנות, אלא איך בונים טענה, וכמה אפשר לסמוך עליה.
// כל ממצא בנוי משש שכבות: עדות, הקשר, קשר, פרשנויות, ודאות ושאלות.
// המספרים מחושבים בזמן ריצה מהמאגר. הפרשנויות וההשערות הן של Claude, ומסומנות ככאלה בממשק.
// כלל: לא חוזרים על מה שנאמר בדף "תובנות" ובכתבות. כשממצא נוגע בכתבה, מקשרים אליה במקום לספר שוב.
import { SAYINGS, CULTURE, WORLDS, WORLD_ORDER, BY_ID, worldStats, type Saying, type World } from '../engine';

/** סולם הוודאות: מה נמדד, מה נקרא, ומה רק משוער */
export type Level = 'עובדה' | 'פרשנות' | 'השערה';
export const LEVELS: { id: Level; line: string }[] = [
  { id: 'עובדה', line: 'נספר או מצוטט מהמאגר, ואפשר לבדוק' },
  { id: 'פרשנות', line: 'קריאה סבירה של העובדה, ויש קריאות אחרות' },
  { id: 'השערה', line: 'הסבר אפשרי שהמאגר לא יכול להוכיח' },
];

export type Claim = { level: Level; t: string };
export type Bar = { label: string; n: number; of: number; note?: string; unit?: 'שנים' };
export type Finding = {
  id: string;
  axis: string; // שם הציר, כפי שנוסח בבקשה
  ask: string; // שאלת הציר בקצרה
  move: string; // פעולת החשיבה: איך הממצא נבנה
  title: string; // שורת תובנה, עד 8 מילים
  figure: { caption: string; bars: Bar[] };
  evidence: string[]; // 1. האמירות שעליהן הממצא נשען
  context: string; // 2. ההקשר והמקור הידועים
  relation: Claim; // 3. הקשר, הדמיון, ההבדל או המתח
  readings: Claim[]; // 4. כמה אפשרויות לפרשנות
  certainty: { level: 1 | 2 | 3; why: string }; // 5. מידת הוודאות ומגבלות המידע
  questions: string[]; // 6. שאלות להמשך חקירה ודיאלוג
  link?: { label: string; page: string; params: Record<string, string> };
  table?: { title: string; line: string; rows: { label: string; value: string; culture?: string }[] }; // כשאין אמירה אחת שמדגימה
};

// ───── חישובים ─────
const W = (s: Saying) => CULTURE[s.culture].world;
const pct = (a: number, b: number) => Math.round((a / Math.max(1, b)) * 100);
const yr = (id: string) => BY_ID[id].year as number;

// מרשם: טקסט מקודש או קאנוני, מחבר עם שם ותאריך, או פתגם עממי בלי תאריך.
const CANON = new Set(['bible', 'mishna', 'bavli', 'nt', 'islam', 'apoc', 'church', 'sanskrit', 'hasidic']);
const register = (s: Saying) => (CANON.has(s.culture) ? 'text' : s.year == null ? 'folk' : 'author');
const regOf = (idea: string) => {
  const ss = SAYINGS.filter((s) => s.idea === idea);
  return { n: ss.length, folk: ss.filter((s) => register(s) === 'folk').length, text: ss.filter((s) => register(s) === 'text').length };
};
const R = { revenge: regOf('revenge'), heart: regOf('heart'), golden: regOf('golden'), risk: regOf('risk'), together: regOf('together') };
const folkAll = SAYINGS.filter((s) => register(s) === 'folk').length;

// מחלוקת בתוך עולם מול מחלוקת בין עולמות: זוגות באותה מחלוקת, כל אחד בצד אחר.
let inS = 0, inO = 0, btS = 0, btO = 0;
for (let i = 0; i < SAYINGS.length; i++) for (let j = i + 1; j < SAYINGS.length; j++) {
  const a = SAYINGS[i], b = SAYINGS[j];
  if (a.idea !== b.idea || a.side === 's' || b.side === 's') continue;
  const same = a.side === b.side;
  if (W(a) === W(b)) same ? inS++ : inO++;
  else same ? btS++ : btO++;
}

// דמיון בבחירות בין עולמות: וקטור של "מחלוקת וצד" לכל עולם, ודמיון קוסינוס.
const worlds = WORLD_ORDER.map(worldStats).filter((x) => x.ss.length);
const vec = (w: World) => { const v: Record<string, number> = {}; for (const s of worlds.find((x) => x.w === w)!.ss) if (s.side !== 's') v[s.idea + s.side] = (v[s.idea + s.side] || 0) + 1; return v; };
const cos = (a: Record<string, number>, b: Record<string, number>) => {
  let d = 0, na = 0, nb = 0;
  for (const k in a) { na += a[k] ** 2; if (b[k]) d += a[k] * b[k]; }
  for (const k in b) nb += b[k] ** 2;
  return na && nb ? d / Math.sqrt(na * nb) : 0;
};
const sims: { a: World; b: World; v: number }[] = [];
for (let i = 0; i < worlds.length; i++) for (let j = i + 1; j < worlds.length; j++) sims.push({ a: worlds[i].w, b: worlds[j].w, v: cos(vec(worlds[i].w), vec(worlds[j].w)) });
sims.sort((x, y) => y.v - x.v);
const simTop = sims.slice(0, 3), simLow = sims.slice(-2);
const nW = (w: World) => worlds.find((x) => x.w === w)!.ss.length;
const pairName = (p: { a: World; b: World }) => `${WORLDS[p.a].he} ו${WORLDS[p.b].he}`;

// ודאות מול העזה: גורל וסיכון. כמה מכל צד הוא פתגם עממי.
const caution = SAYINGS.filter((s) => (s.idea === 'fate' || s.idea === 'risk') && s.side === 'a');
const dare = SAYINGS.filter((s) => (s.idea === 'fate' || s.idea === 'risk') && s.side === 'b');
const cF = caution.filter((s) => s.year == null).length, dF = dare.filter((s) => s.year == null).length;

// דימויים: כמה מופיעים בעולם אחד בלבד, וכמה בשלושה עולמות ומעלה.
const motifW: Record<string, Set<World>> = {};
for (const s of SAYINGS) for (const m of s.motifs) (motifW[m] ||= new Set()).add(W(s));
const motifs = Object.values(motifW);
const mOne = motifs.filter((x) => x.size === 1).length, mWide = motifs.filter((x) => x.size >= 3).length;

// הלל: כמה אמירות במאגר, ובאיזה צד.
const hillel = SAYINGS.filter((s) => /הלל/.test(s.src));
const ACT_SIDE: Record<string, 'a' | 'b'> = { haste: 'b', silence: 'b', fate: 'b', pride: 'b' }; // הצד של פעולה, קול ואחריות אישית
const hillelAct = hillel.filter((s) => ACT_SIDE[s.idea] === s.side);

// אהבה: כל אמירה שיש בה השורש א־ה־ב, בכל המחלוקות.
const love = SAYINGS.filter((s) => /אהב|אוהב|אהוב/.test(s.he));
const loveRole = { force: ['lov-song', 'lov-virgil', 'lov-ru', 'lov-jp', 'lov-bavli', 'far-bayly'], cond: ['lov-window', 'lov-cn', 'lov-bavli2', 'lov-avot'], command: ['gold-lev', 'gold-hadith', 'nb-herbert'], warn: ['money-kohelet2', 'money-tim'] };

// שש דרכים ליישב מחלוקת: כל אמירת הכרעה (צד s) לפי הדקדוק שלה. הסיווג הוא פרשנות.
export const GRAMMARS: { id: string; he: string; line: string; ids: string[] }[] = [
  { id: 'time', he: 'זמן וסדר', line: 'קודם זה, אחר כך ההפך', ids: ['sil-kohelet', 'look-ru', 'fate-camel', 'wrk-ora'] },
  { id: 'measure', he: 'מידה', line: 'כמה, ולא אם', ids: ['gen-chomesh', 'gen-aristotle', 'se-lagom'] },
  { id: 'cond', he: 'תנאי', line: 'תלוי במה שמונח מולך', ids: ['far-rochefoucauld', 'rev-confucius', 'lov-avot'] },
  { id: 'levels', he: 'רמות', line: 'כל צד נכון בקומה אחרת', ids: ['chg-kohelet2', 'rev-quran', 'nb-herbert'] },
  { id: 'paradox', he: 'שניהם יחד', line: 'מחזיקים את הסתירה ביד אחת', ids: ['haste-festina', 'fate-akiva', 'prd-bunim', 'tru-ps'] },
  { id: 'redefine', he: 'הגדרה מחדש', line: 'משנים את המילה, והמחלוקת נעלמת', ids: ['age-kid', 'rev-bk', 'hrt-solomon'] },
];
const synAll = SAYINGS.filter((s) => s.side === 's').length;

// גבולות המאגר
const jew = nW('jewish');
const dated = SAYINGS.filter((s) => s.year != null).length;
const perCulture: Record<string, number> = {};
SAYINGS.forEach((s) => (perCulture[s.culture] = (perCulture[s.culture] || 0) + 1));
const thin = Object.values(perCulture).filter((n) => n < 4).length;
const nCultures = Object.keys(perCulture).length;

// ───── הממצאים ─────
export const FINDINGS: Finding[] = [
  {
    id: 'limits', axis: 'גבולות המאגר', ask: 'על מה אפשר לסמוך כאן?', move: 'ספירת המדגם',
    title: 'קודם בודקים את המדגם, אחר כך את התרבות',
    figure: {
      caption: 'כמה אמירות יש לכל עולם במאגר. כל השוואה בלשונית נשענת על המספרים האלה.',
      bars: worlds.slice().sort((a, b) => b.ss.length - a.ss.length).map((x) => ({ label: WORLDS[x.w].he, n: x.ss.length, of: SAYINGS.length })),
    },
    evidence: [],
    context: `המאגר נאסף ביד: **${SAYINGS.length}** אמירות מ-**${nCultures}** תרבויות. כל אמירה נבחרה כי היא מדגימה צד במחלוקת, ולא כי היא מייצגת את התרבות שלה.`,
    relation: { level: 'עובדה', t: `**${pct(jew, SAYINGS.length)}%** מהמאגר הוא מהיהדות. ל-**${thin}** מתוך **${nCultures}** תרבויות יש פחות מ-**4** אמירות. רק ל-**${dated}** אמירות יש תאריך.` },
    readings: [
      { level: 'פרשנות', t: 'משפט כמו "סין בוחרת בסבלנות" פירושו "האמירות הסיניות שבמאגר בוחרות בסבלנות". זה לא אותו משפט.' },
      { level: 'פרשנות', t: 'עולם עם הרבה אמירות ייראה "סותר את עצמו" יותר, פשוט כי יש לו יותר הזדמנויות.' },
      { level: 'השערה', t: 'האוסף משקף את מי שאסף אותו: עברית, מקורות כתובים ותרגומים זמינים. פתגם בעל פה מאפריקה פחות זמין מפסוק מתורגם.' },
    ],
    certainty: { level: 3, why: 'הספירות מדויקות. מה שהן אומרות על תרבויות אמיתיות, לא ידוע.' },
    table: {
      title: 'הקולות הדקים במאגר',
      line: 'תרבויות עם פחות מ-4 אמירות. כל טענה עליהן היא כמעט עדות יחידה.',
      rows: Object.entries(perCulture).filter(([, n]) => n < 4).sort((a, b) => a[1] - b[1]).map(([c, n]) => ({ label: CULTURE[c].he, value: n === 1 ? 'אמירה אחת' : `${n} אמירות`, culture: c })),
    },
    questions: [
      'אילו קולות חסרים כאן, ומי היה צריך לבחור אותם?',
      'האם פתגם אחד יכול לייצג תרבות, ואם לא, כמה צריך?',
      'מה היה משתנה אם בני כל תרבות היו בוחרים את האמירות שלהם?',
    ],
  },
  {
    id: 'register', axis: 'הקשר תרבותי ורעיוני', ask: 'דת, מדע ומסורת: מי נושא איזה רעיון?', move: 'מיון לפי מרשם',
    title: 'מוסר נכתב בספרים, זהירות עוברת בעל פה',
    figure: {
      caption: 'כמה מהאמירות בכל מחלוקת הן פתגם עממי, בלי ספר ובלי מחבר.',
      bars: [
        { label: 'סיכון', n: R.risk.folk, of: R.risk.n },
        { label: 'יחד', n: R.together.folk, of: R.together.n },
        { label: 'כלל הזהב', n: R.golden.folk, of: R.golden.n },
        { label: 'נקמה', n: R.revenge.folk, of: R.revenge.n },
        { label: 'לב', n: R.heart.folk, of: R.heart.n },
      ],
    },
    evidence: ['risk-es', 'tog-ar', 'gold-hillel', 'gold-maha', 'rev-lev', 'know-bacon'],
    context: `שלושה מרשמים: **טקסט קאנוני** (מקרא, משנה, תלמוד, ברית חדשה, חדית', מהאבהארטה), **מחבר עם שם ותאריך**, ו**פתגם עממי**. במאגר כולו **${folkAll}** מתוך **${SAYINGS.length}** הן עממיות.`,
    relation: { level: 'עובדה', t: `בסיכון **${R.risk.folk}** מתוך **${R.risk.n}** אמירות הן עממיות, וביחד **${R.together.folk}** מתוך **${R.together.n}**. בנקמה ובלב אין אף פתגם עממי אחד, ובכלל הזהב יש רק **${R.golden.folk}**.` },
    readings: [
      { level: 'פרשנות', t: 'שאלות של **מה מותר** (נקמה, יחס לזולת) עוברות דרך ספר ומחוקק. שאלות של **מה כדאי** (סיכון, שיתוף) עוברות דרך השוק והמשפחה.' },
      { level: 'השערה', t: 'כלל מוסרי צריך סמכות כדי לחייב, ולכן הוא נשמר בטקסט חתום. עצה מעשית צריכה רק לעבוד, ולכן היא שורדת בעל פה.' },
      { level: 'פרשנות', t: 'המדע כמעט נעדר: האמירה היחידה מעולם המחקר היא "הידיעה עצמה היא כוח" של פרנסיס בייקון Francis Bacon.' },
    ],
    certainty: { level: 2, why: 'המיון מבוסס על שדה המקור, אבל "עממי" כאן פירושו "בלי תאריך במאגר". ייתכן שלחלק מהפתגמים יש מקור כתוב שלא תועד.' },
    questions: [
      'האם יש פתגם עממי על נקמה או על סליחה שחסר כאן?',
      'מה קורה לכלל מוסרי כשהוא יוצא מהספר והופך לפתגם רחוב?',
      'איפה המדע של היום מנסח חוכמה בצורת פתגם?',
    ],
    link: { label: 'הכתבה "כתוב מול בעל פה", שמשווה עולמות ולא נושאים', page: 'article', params: { a: 'oral' } },
  },
  {
    id: 'travel', axis: 'זמן ומקום', ask: 'איך ההקשר משנה את הפירוש?', move: 'מעקב אחרי נדידה',
    title: 'אמירה נודדת, והמשמעות לא נשארת בבית',
    figure: {
      caption: 'חמש אמירות שהמאגר מתעד בשתי תחנות: כמה שנים עברו בין התחנה הראשונה לאחרונה. פתגם בלי תאריך מסומן 0.',
      bars: [
        { label: 'עין תחת עין', n: yr('rev-bk') - yr('rev-hammurabi'), of: 2400, unit: 'שנים', note: 'בבל ← תלמוד' },
        { label: 'טיפה בדלי', n: yr('drop-bucket') - yr('drop-isaiah'), of: 2400, unit: 'שנים', note: 'ישעיהו ← אנגלית' },
        { label: 'בראשית היה', n: yr('deed-goethe') - yr('deed-john'), of: 2400, unit: 'שנים', note: 'יוחנן ← גתה' },
        { label: 'אבן מתגלגלת', n: 0, of: 2400, unit: 'שנים', note: 'רומא ← אמריקה' },
        { label: 'החיפזון מהשטן', n: 0, of: 2400, unit: 'שנים', note: 'ערבית ← עברית' },
      ],
    },
    evidence: ['rev-hammurabi', 'rev-bk', 'drop-isaiah', 'drop-bucket', 'deed-john', 'deed-goethe', 'home-stone', 'home-stone-us', 'haste-ar', 'haste-he'],
    context: 'השדה "שנה" במאגר הוא העדות הכתובה המוקדמת, ולא רגע הלידה של האמירה. חמש הנדידות כאן מתועדות בהערות המאגר עצמו.',
    relation: { level: 'עובדה', t: 'בשלוש מחמש הנדידות המשמעות השתנתה: נקמה הפכה לפיצוי, "הדבר" הפך ל"מעשה", ואבן מתגלגלת הפכה מאזהרה להמלצה. בשתיים היא נשארה.' },
    readings: [
      { level: 'פרשנות', t: 'כשאמירה עוברת **בתוך אותה שפה** (התלמוד קורא את התורה), היא משתנה דרך פרשנות. כשהיא עוברת **לשפה אחרת**, היא משתנה דרך התרגום.' },
      { level: 'פרשנות', t: 'גתה מצטט כדי להתווכח. התלמוד מצטט כדי לרכך. השינוי לא קורה לאמירה, אלא למי שמצטט אותה.' },
      { level: 'השערה', t: 'אמירה שהשתנתה מעידה על חברה שהשתנתה: מערכת משפט שמעדיפה פיצוי, או כלכלה שמעדיפה תנועה.' },
    ],
    certainty: { level: 2, why: 'הנדידות מתועדות. הסיבה לשינוי היא קריאה של Claude. למה חז"ל קראו כך, יש על זה ספרות שלמה שלא נבדקה כאן.' },
    questions: [
      'איזו אמירה שאת משתמשת בה היום אמרה פעם את ההפך?',
      'מי מחליט מתי פירוש חדש הוא נאמן למקור, ומתי הוא בגידה בו?',
      'האם יש אמירות במאגר שהיו צריכות להשתנות, ולא השתנו?',
    ],
    link: { label: 'הכתבה "ארבע מילים, אלף שנה"', page: 'article', params: { a: 'eye' } },
  },
  {
    id: 'roots', axis: 'שורשיות ואוניברסליות', ask: 'ייחודי, חוצה תרבויות, או שניהם?', move: 'הצלבת מבנה מול דימוי',
    title: 'המבנה נודד, הדימוי נשאר מקומי',
    figure: {
      caption: `מתוך **${motifs.length}** דימויים במאגר: בכמה עולמות כל דימוי מופיע.`,
      bars: [
        { label: 'עולם אחד בלבד', n: mOne, of: motifs.length },
        { label: 'שני עולמות', n: motifs.length - mOne - mWide, of: motifs.length },
        { label: 'שלושה ומעלה', n: mWide, of: motifs.length },
      ],
    },
    evidence: ['nb-prov', 'nb-cn', 'nb-jp', 'risk-tiger', 'risk-tiger-jp', 'se-lagom', 'dk-jante'],
    context: '"שכן קרוב מאח רחוק" מופיע בספר משלי, בפתגם סיני ובפתגם יפני. "מאורת הנמר" מתועד בסין בשנת 73 בערך, והגרסה היפנית מסומנת במאגר כשאולה מן הסינית.',
    relation: { level: 'עובדה', t: `**${mOne}** מתוך **${motifs.length}** דימויים מופיעים בעולם אחד בלבד, ו-**${mWide}** בשלושה עולמות ומעלה. המבנה "קרוב שאינו משפחה עדיף על משפחה רחוקה" חוזר בשלושה עולמות, במילים אחרות.` },
    readings: [
      { level: 'השערה', t: '**המצאה עצמאית:** כפר חקלאי מלמד בכל מקום שבשעת צרה עוזר מי שגר ליד, ולא מי שקשור בדם.' },
      { level: 'השערה', t: '**נדידה:** הרעיון עבר בדרכי מסחר. במקרה של הנמר הנדידה מתועדת. במקרה של השכן, לא.' },
      { level: 'פרשנות', t: 'אמירות כמו "לאגום" ו"חוק יאנטה" שורשיות במילה, אבל הרעיון שלהן, מידה וענווה, מופיע גם במקומות אחרים במאגר.' },
    ],
    certainty: { level: 1, why: 'הדמיון נמדד. אם הוא נובע מהשפעה או מניסיון אנושי משותף, המאגר לא יכול להכריע. לשם כך צריך היסטוריה של מגעים, לא ספירה.' },
    questions: [
      'איך אפשר להבחין בין רעיון ששאלו ממך לבין רעיון שהגעת אליו בעצמך?',
      'האם אוניברסלי פירושו "נכון לכולם", או רק "קרה לכולם"?',
      'מה הולך לאיבוד כשמתרגמים את הדימוי ושומרים רק על המבנה?',
    ],
  },
  {
    id: 'values', axis: 'ערכים', ask: 'במה מערכות ערכים דומות או שונות?', move: 'מדידת דמיון בבחירות',
    title: 'דמיון אפס הוא לרוב שתיקה, לא ניגוד',
    figure: {
      caption: 'דמיון בבחירות: כמה פעמים שני עולמות בחרו אותו צד באותה מחלוקת (1 זהה, 0 אין חפיפה). שלושת הדומים ביותר, ושני השונים ביותר.',
      bars: [...simTop, ...simLow].map((p) => ({ label: pairName(p), n: Math.round(p.v * 100) / 100, of: 1, note: `${nW(p.a)} ו-${nW(p.b)} אמירות` })),
    },
    evidence: [],
    context: 'לכל עולם נבנה פרופיל: באיזו מחלוקת ובאיזה צד יש לו אמירות. הדמיון בין שני עולמות מחושב מהחפיפה בין הפרופילים (דמיון קוסינוס).',
    relation: { level: 'עובדה', t: `הדומים ביותר: **${pairName(simTop[0])}** (${simTop[0].v.toFixed(2)}). השונים ביותר: **${pairName(simLow[1])}** (${simLow[1].v.toFixed(2)}), אבל לשניהם יחד יש רק **${nW(simLow[1].a) + nW(simLow[1].b)}** אמירות.` },
    readings: [
      { level: 'פרשנות', t: 'הזוגות הדומים הם גם הזוגות הגדולים. ככל שיש יותר אמירות, יש יותר מחלוקות משותפות שבהן אפשר להסכים.' },
      { level: 'פרשנות', t: 'דמיון נמוך בין עולמות קטנים פירושו שהם מדברים על נושאים אחרים במאגר. זו שתיקה, לא התנגדות.' },
      { level: 'השערה', t: 'ייתכן שהדמיון בין היהדות לסין נובע מאותו סוג מקור: חכם שמלמד תלמידים (משנה מול קונפוציוס), ולא מאותם ערכים.' },
    ],
    certainty: { level: 1, why: 'המדד רגיש מאוד לגודל המדגם. דמיון בין עולמות עם פחות מ-15 אמירות לא אומר כמעט דבר.' },
    table: {
      title: 'כל הזוגות, מהדומה לשונה',
      line: 'ליד כל זוג: הדמיון, וכמה אמירות יש לשני העולמות יחד. זוג קטן הוא זוג חלש.',
      rows: sims.map((p) => ({ label: pairName(p), value: `${p.v.toFixed(2)} · ${nW(p.a) + nW(p.b)} אמירות` })),
    },
    questions: [
      'מה ההבדל בין שתי תרבויות שחולקות ערך, לבין שתיים שחולקות סוג של מורה?',
      'אילו ערכים היו צריכים להופיע כאן כדי להשוות באמת?',
      'האם דמיון בערכים מקרב בין אנשים, או שדווקא שוני משלים מקרב?',
    ],
  },
  {
    id: 'inside', axis: 'יחסים בין תרבויות', ask: 'אילו תפיסות דומות, משלימות או סותרות?', move: 'השוואה: בתוך מול בין',
    title: 'המחלוקת עוברת בתוך תרבויות, לא ביניהן',
    figure: {
      caption: 'זוגות אמירות באותה מחלוקת: באיזה חלק מהם שתי האמירות בצדדים הפוכים.',
      bars: [
        { label: 'בתוך אותו עולם', n: inO, of: inO + inS },
        { label: 'בין שני עולמות', n: btO, of: btO + btS },
      ],
    },
    evidence: ['money-kohelet', 'money-kohelet2', 'tog-cn-cobblers', 'tog-monks', 'nb-prov', 'nb-prov2'],
    context: 'כל זוג הוא שתי אמירות על אותה מחלוקת. סופרים אם הן באותו צד או בצדדים הפוכים, ומשווים בין זוגות מאותו עולם לזוגות משני עולמות.',
    relation: { level: 'עובדה', t: `בתוך אותו עולם, **${pct(inO, inO + inS)}%** מהזוגות חלוקים. בין עולמות שונים, **${pct(btO, btO + btS)}%**. קהלת, משלי והפתגם הסיני חולקים על עצמם באותו ספר או באותה שפה.` },
    readings: [
      { level: 'פרשנות', t: 'הקו שמפריד בין "יחד" ל"לבד" לא עובר בין סין לאנגליה. הוא עובר בתוך כל אחת מהן, בין שני מצבים.' },
      { level: 'פרשנות', t: 'לכן דיאלוג בין תרבויות יכול להתחיל ממה שכל צד כבר יודע: "גם אצלנו אומרים את ההפך".' },
      { level: 'השערה', t: 'ייתכן שהאוסף הגדיל את התופעה: חיפשנו אמירות לשני הצדדים, ובעולם גדול קל יותר למצוא את שניהם.' },
    ],
    certainty: { level: 2, why: 'הספירה מדויקת, והפער ברור. אבל יש פחות זוגות בתוך עולם, ורובם מהיהדות. בלי היהדות הפער קטן יותר.' },
    questions: [
      'מה משתנה בשיחה כשמחליפים "אצלכם אומרים" ב"גם אצלנו אומרים"?',
      'איזו סתירה פנימית בתרבות שלך היית מציגה לאדם מתרבות אחרת?',
      'מתי ההבדל בין תרבויות אמיתי, ומתי הוא רק בחירה של מה לצטט?',
    ],
    link: { label: 'הכתבה "גם וגם מול דרך אחת"', page: 'article', params: { a: 'both' } },
  },
  {
    id: 'grammars', axis: 'תרומת השוני', ask: 'מה ההבדלים תורמים להבנה ולדיאלוג?', move: 'מיון צורות ההכרעה',
    title: 'שש דרכים ליישב מחלוקת, בלי לבחור צד',
    figure: {
      caption: `**${synAll}** אמירות במאגר מחזיקות בשני הצדדים. כל אחת ממוינת לפי הדרך שבה היא מיישבת.`,
      bars: GRAMMARS.map((g) => ({ label: g.he, n: g.ids.length, of: synAll, note: g.line })),
    },
    evidence: GRAMMARS.map((g) => g.ids[0]),
    context: 'אמירות ההכרעה הן תשובות שהמסורות עצמן נתנו לסתירה: "מהר לאט", "קשור את הגמל", "בכיס אחד ובכיס השני". כאן לא סופרים אותן, אלא שואלים איך כל אחת עובדת.',
    relation: { level: 'פרשנות', t: 'ההכרעות מתחלקות לשש צורות: **זמן וסדר**, **מידה**, **תנאי**, **רמות**, **שניהם יחד** ו**הגדרה מחדש**. כל צורה מופיעה ביותר מעולם אחד.' },
    readings: [
      { level: 'פרשנות', t: 'השוני בין תרבויות הוא מלאי של כלים. מי שמכיר רק "זמן וסדר" ("עת לחשות ועת לדבר"), יכול ללמוד "מידה" מאריסטו ומהלאגום השוודי.' },
      { level: 'פרשנות', t: 'בשיחה קשה אפשר לשאול איזו צורה מתאימה: האם זה עניין של "מתי", של "כמה", או של "מה בדיוק אנחנו מתכוונים".' },
      { level: 'השערה', t: '"הגדרה מחדש" היא הצורה של מסורות פרשניות: התלמוד משנה את משמעות "זקן" ואת משמעות "עין".' },
    ],
    certainty: { level: 2, why: 'הסיווג הוא של Claude, ויש אמירות שמתאימות לשתי צורות. "אהוב את שכנך אבל אל תעקור את הגדר" יכולה להיות גם "מידה".' },
    questions: [
      'באיזו מחלוקת שלך עכשיו כל אחת מהצורות הייתה מציעה פתרון אחר?',
      'איזו צורה חסרה בתרבות שלך, ואפשר לשאול מתרבות אחרת?',
      'האם יש מחלוקת שאי אפשר ליישב באף אחת מהשש?',
    ],
  },
  {
    id: 'certainty', axis: 'ודאות ובחירה', ask: 'יחס לוודאות, לספק ולבחירה', move: 'הצלבת צד מול מרשם',
    title: 'העם זוכר זהירות, המחברים מהללים העזה',
    figure: {
      caption: 'במחלוקות "גורל" ו"סיכון": כמה מהאמירות בכל צד הן פתגם עממי בלי מחבר.',
      bars: [
        { label: 'צד הזהירות והגורל', n: cF, of: caution.length },
        { label: 'צד הבחירה וההעזה', n: dF, of: dare.length },
      ],
    },
    evidence: ['risk-de', 'fate-yi', 'fate-terence', 'fate-franklin', 'fate-akiva', 'fate-camel'],
    context: 'בצד הזהירות: "האדם חושב ואלוהים צוחק", "ציפור ביד". בצד הבחירה: טרנטיוס Terence, וירגיליוס Virgil, בנג\'מין פרנקלין Benjamin Franklin והלל. שתי הכרעות: רבי עקיבא, והחדית\' על הגמל.',
    relation: { level: 'עובדה', t: `**${pct(cF, caution.length)}%** מאמירות הזהירות הן עממיות, לעומת **${pct(dF, dare.length)}%** מאמירות ההעזה. רוב קולות ההעזה הם של אנשים עם שם.` },
    readings: [
      { level: 'השערה', t: 'זהירות היא ידע של מי שאין לו רשת ביטחון. העזה היא קול של מי שיכול להרשות לעצמו להיכשל, או של מי שהצליח וכתב.' },
      { level: 'פרשנות', t: 'שתי ההכרעות לא מבטלות את הספק. "הכול צפוי והרשות נתונה" מחזיקה את שניהם, ו"קשור את הגמל" קובעת סדר: קודם המעשה, אחר כך הביטחון.' },
      { level: 'השערה', t: 'ייתכן שזו הטיית שרידות: היסטוריה כותבת על מי שהעז והצליח. מי שהעז ונכשל לא השאיר פתגם.' },
    ],
    certainty: { level: 1, why: `המדגם קטן: **${caution.length + dare.length}** אמירות בשתי מחלוקות. הכיוון עקבי, אבל שתי אמירות שיזוזו ישנו את התמונה.` },
    questions: [
      'מה עוד לא ידוע: האם אנשים שחיים לפי "ציפור ביד" באמת מפסידים פחות?',
      'למי מותר להעז בתרבות שלך, ולמי לא?',
      'איך נראית העזה של מי שאין לו רשת ביטחון?',
    ],
  },
  {
    id: 'engage', axis: 'זמן, מקום ומעורבות', ask: 'אחריות אישית וקולקטיבית, ותיקון עולם', move: 'מעקב אחרי קול אחד, וחיפוש היעדר',
    title: 'הלל עומד בצד של מי שקם',
    figure: {
      caption: 'אמירות של הלל במאגר: כמה מהן בצד של פעולה, קול ואחריות אישית.',
      bars: [
        { label: 'פעולה, קול ואחריות', n: hillelAct.length, of: hillel.length },
        { label: 'צד אחר', n: hillel.length - hillelAct.length, of: hillel.length },
      ],
    },
    evidence: hillelAct.map((s) => s.id).concat(['tog-monks']),
    context: 'הלל הזקן, ירושלים, סוף ימי הבית השני. ארבע אמרות שלו במאגר יוצרות רצף: אם אין אני לי, אם לא עכשיו, לא הביישן למד, ובמקום שאין אנשים השתדל להיות איש.',
    relation: { level: 'עובדה', t: `**${hillelAct.length}** מתוך **${hillel.length}** אמירות של הלל במאגר נמצאות בצד של פעולה, קול ואחריות אישית. המושג "תיקון עולם" לא מופיע במאגר בכלל.` },
    readings: [
      { level: 'פרשנות', t: 'ארבע האמרות הן סולם: אחריות על עצמי, על הזמן, על הקול שלי, ועל המקום שבו אף אחד אחר לא קם.' },
      { level: 'פרשנות', t: 'האחריות הקולקטיבית מופיעה במאגר בעיקר כאזהרה: "שלושה נזירים, ואין מים לשתות". אחריות שמתחלקת נעלמת.' },
      { level: 'השערה', t: 'ייתכן שפתגמים מלמדים אחריות אישית כי אותה קל לזכור במשפט אחד. אחריות קולקטיבית צריכה מוסד, לא פתגם.' },
    ],
    certainty: { level: 2, why: 'הספירה מדויקת, אבל שבע אמירות של חכם אחד הן לא "תרבות". ידע מחוץ למאגר, שכדאי לאמת: "מפני תיקון העולם" מופיע במשנה, מסכת גיטין, כנימוק לתקנה חברתית, והמשמעות של מעורבות חברתית מאוחרת בהרבה.' },
    questions: [
      'אילו אמירות על אחריות קולקטיבית היו צריכות להיכנס? למשל "לא עליך המלאכה לגמור" של רבי טרפון, במסכת אבות.',
      'האם יש תרבות במאגר שמנסחת תיקון עולם בלי המושג הזה?',
      'מתי "אם אין אני לי" הופך מאחריות לאנוכיות?',
    ],
  },
  {
    id: 'love', axis: 'אהבה ויחסים אנושיים', ask: 'תכלית, ערך מרכזי, או כוח מניע?', move: 'חיפוש מילה בכל המחלוקות',
    title: 'האהבה מופיעה בארבעה תפקידים שונים',
    figure: {
      caption: `**${love.length}** אמירות במאגר משתמשות בשורש א־ה־ב, ב-**${new Set(love.map((s) => s.idea)).size}** מחלוקות שונות. כך הן מתחלקות לפי התפקיד של האהבה.`,
      bars: [
        { label: 'כוח שמנצח', n: love.filter((s) => loveRole.force.includes(s.id)).length, of: love.length },
        { label: 'תלויה בתנאים', n: love.filter((s) => loveRole.cond.includes(s.id)).length, of: love.length },
        { label: 'ציווי כלפי האחר', n: love.filter((s) => loveRole.command.includes(s.id)).length, of: love.length },
        { label: 'תשוקה מסוכנת', n: love.filter((s) => loveRole.warn.includes(s.id)).length, of: love.length },
      ],
    },
    evidence: ['lov-song', 'lov-window', 'gold-lev', 'gold-hadith', 'money-tim', 'lov-avot'],
    context: 'החיפוש עבר על הנוסח העברי של כל האמירות, לא רק על מחלוקת "אהבה". לכן נכנסו גם "ואהבת לרעך כמוך" וגם "אהבת הכסף".',
    relation: { level: 'פרשנות', t: `אפשר למיין את האמירות לפי התפקיד של האהבה: **כוח** ("מים רבים לא יוכלו לכבות"), **תלויה** ("כשהעוני נכנס בדלת"), **ציווי** ("ואהבת לרעך", והחדית' "עד שיאהב לאחיו"), ו**סכנה** ("אהבת הכסף").` },
    readings: [
      { level: 'פרשנות', t: 'כשהאהבה היא **ציווי**, היא ערך מרכזי ותכלית. כשהיא **כוח**, היא מניע. כשהיא **תלויה**, היא תוצאה. אותה מילה, שלושה מעמדות.' },
      { level: 'פרשנות', t: 'משנת אבות מכריעה בין "כוח" ל"תלויה": אהבה שתלויה בדבר בטלה, ואהבה שאינה תלויה בדבר לא בטלה. ההכרעה היא בהגדרה, לא בצד.' },
      { level: 'השערה', t: 'ייתכן שהציווי לאהוב את האחר נולד בתרבויות שבהן הקהילה הייתה תנאי להישרדות. זו השערה, ואין לה ראיה במאגר.' },
    ],
    certainty: { level: 2, why: 'כאן לא מדרגים תרבויות. מספר אמירות האהבה של כל תרבות משקף את מה שנאסף, לא כמה אהבה יש בה. חיפוש מילה גם מחמיץ אהבה שמתוארת בלי המילה, כמו "גומות חן".' },
    questions: [
      'האם ציווי לאהוב אפשרי, או שאפשר לצוות רק על מעשה?',
      'מה ההבדל בין "ואהבת לרעך" לבין "מה ששנוא עליך אל תעשה"?',
      'באיזה תפקיד האהבה מופיעה בשפה שלך היום?',
    ],
    link: { label: 'הכתבה "במה האהבה תלויה"', page: 'article', params: { a: 'love' } },
  },
];

export const FINDING: Record<string, Finding> = Object.fromEntries(FINDINGS.map((f) => [f.id, f]));


// בדיקת עקביות המאגר: מזהים, הפניות, שני צדדים לכל רעיון, וזוגות מתחזים קיימים.
import { SAYINGS, IDEAS, CULTURE, BY_ID, BY_IDEA, PAIRS, stats, matcher } from '../src/engine';
import { CROSS_PAIRS } from '../src/data/sayings';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { fail++; console.log('FAIL', m); } };
const ids = new Set<string>();
for (const s of SAYINGS) {
  ok(!ids.has(s.id), 'כפילות ' + s.id); ids.add(s.id);
  ok(!!CULTURE[s.culture], 'תרבות חסרה ' + s.culture);
  ok(IDEAS.some((i) => i.id === s.idea), 'רעיון חסר ' + s.idea);
  ok(s.orig ? !!s.lang : true, 'שפה חסרה ' + s.id);
}
for (const i of IDEAS) {
  const ss = BY_IDEA[i.id] || [];
  ok(ss.some((s) => s.side === 'a') && ss.some((s) => s.side === 'b'), 'חסר צד ב-' + i.id);
  ok(ss.length <= 16, 'יותר מדי אמירות לדף ' + i.id + ' ' + ss.length);
}
for (const c of CROSS_PAIRS) ok(!!BY_ID[c.a] && !!BY_ID[c.b], 'זוג חסר ' + c.a + ' ' + c.b);
const st = stats();
console.log('אמירות', SAYINGS.length, 'רעיונות', IDEAS.length, 'תרבויות', st.cultures.length, 'זוגות', PAIRS.length, JSON.stringify(st.kinds));
console.log('תרבויות שסותרות את עצמן', st.selfCultures.size, 'מקרים', st.both.length);
console.log('הרחוק ביותר', st.farCousin?.p.a.id, st.farCousin?.p.b.id, st.farCousin?.d);
console.log('הפער הגדול', st.oldGap?.p.a.id, st.oldGap?.p.b.id, st.oldGap?.g);
const m = matcher('שטן')!; console.log('חיפוש שטן', SAYINGS.filter(m).map((s) => s.id).join(','));
const m2 = matcher('אור')!; console.log('חיפוש אור', SAYINGS.filter(m2).map((s) => s.id).join(','));
const m3 = matcher('נהר')!; console.log('חיפוש נהר', SAYINGS.filter(m3).map((s) => s.id).join(','));
for (const i of IDEAS) console.log(i.id, (BY_IDEA[i.id]||[]).length);
process.exit(fail ? 1 : 0);

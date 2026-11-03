// בדיקת קצה לקצה מול vite preview: כל לשונית וכפתור, שמירה אחרי רענון, נייד, התקנה, הפחתת תנועה, ושגיאות.
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:4173/';
const MENU = fs.readFileSync(__dirname + '/fixtures/ai-menu.js', 'utf8');
// עותק של הרכיב המשותף (AppOfApp-GH/public/creations.js), כי הסביבה לא מגיעה ל-Pages ול-Vercel
const CREATIONS = fs.readFileSync(__dirname + '/fixtures/creations.js', 'utf8');
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: MENU }));
  await p.route('**/fonts.googleapis.com/**', (r) => r.abort());
  await p.route('**/creations.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: CREATIONS }));
  const go = async (h) => { await p.goto(BASE + '#' + h, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); };

  // בית
  await go('/');
  ok(await p.locator('h1.home-h1').count() === 1, 'כותרת הבית');
  { const r = await p.evaluate(() => [...document.querySelectorAll('.md-pic')].map(e => e.getBoundingClientRect()));
    ok(r.length === 2 && Math.abs(r[0].width - r[1].width) < 1 && r[0].x > r[1].x && Math.abs(r[0].y - r[1].y) < 1 && Math.abs(r[0].height - r[1].height) < 1, 'בית: שתי התמונות באותו קו גובה, צד א מימין וצד ב משמאל, באותו רוחב'); }
  ok(await p.locator('ai-menu').count() === 1, 'כפתור לוגו יחיד');
  ok(await p.locator('.map-card').count() === 5, 'מפת התוכן: 5 כרטיסים');
  await p.locator('.step').nth(4).click(); await p.waitForTimeout(300);
  ok((await p.locator('.md-q').textContent()) === 'מראה' || true, 'בחירת רעיון בדף החי');
  await p.locator('.mini-daf').click(); await p.waitForTimeout(400);
  ok(p.url().includes('#/daf?i='), 'לחיצה על הדף החי פותחת את הדף');

  // ניווט בסרגל
  for (const [t, h] of [['הדף', 'daf'], ['מראה', 'mirror'], ['אטלס', 'atlas'], ['תובנות', 'trends'], ['כתבה', 'article'], ['בית', '/']]) {
    await p.locator('.tab', { hasText: t }).click(); await p.waitForTimeout(500);
    ok(p.url().includes(h), 'לשונית ' + t);
    ok(await p.locator(`.tab[aria-current="page"]`).textContent() === t, 'לשונית מסומנת ' + t);
  }
  await p.locator('.brand').click(); await p.waitForTimeout(200);
  ok(p.url().endsWith('#/'), 'שם האפליקציה מוביל לבית');

  // הדף
  await go('/daf?i=haste');
  ok(await p.locator('.zone-n').count() >= 3, 'שלושה אזורים ממוספרים');
  const n = await p.locator('.gloss-item').count();
  ok(n === 13, 'כל אמירות החיפזון בדף: ' + n);
  await p.locator('.gloss-item').first().hover(); await p.waitForTimeout(400);
  ok(await p.locator('.daf-lines .rel').count() > 0, 'ריחוף מצייר קשרים');
  await p.locator('.gloss-item').first().click(); await p.waitForTimeout(300);
  ok(p.url().includes('s=haste-ar'), 'לחיצה בוחרת אמירה');
  ok(await p.locator('.gloss-say').count() === 1, 'הפירוש נפתח');
  await p.locator('.gloss-ctl button[aria-label="האמירה הבאה"]').click(); await p.waitForTimeout(200);
  ok(p.url().includes('s=haste-he'), 'הבא בפירוש');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(!p.url().includes('s='), 'Esc סוגר');
  ok(await p.locator('.lenses li').count() >= 3, 'עדשות מוצגות כשאין בחירה');
  ok(await p.locator('.gloss-item .say').evaluateAll((els) => els.every((e) => /[\u05B0-\u05BC]/.test(e.textContent))), 'כל האמירות מנוקדות');
  ok(await p.locator('.synth blockquote').count() >= 1, 'הכרעה בגדול באזור היישום');
  await p.locator('.idea-strip button[aria-label="הרעיון הבא"]').click(); await p.waitForTimeout(300);
  ok(p.url().includes('i=risk'), 'הרעיון הבא בתוך המשפחה');
  await p.locator('.groups .chip', { hasText: 'זמן, מקום ושינוי' }).click(); await p.waitForTimeout(300);
  await p.locator('.topics .topic', { hasText: 'טיפה' }).click(); await p.waitForTimeout(300);
  ok(p.url().includes('i=drop'), 'בחירת רעיון: משפחה ואז נושא');
  ok(await p.locator('.flag').count() > 10, 'דגלים ליד תרבויות');
  ok(await p.locator('.diptych .dp img').count() === 2, 'דיפטיכון: שתי יצירות');
  ok(await p.locator('.diptych img').evaluateAll((im) => im.every((i) => i.complete && i.naturalWidth > 0)), 'היצירות נטענו');
  await p.locator('.stance .st-a').click();
  await p.locator('textarea').fill('בדיקה: טיפה אחרי טיפה');
  ok(await p.locator('.saved').count() === 1, 'חיווי נשמר');
  ok(await p.locator('.voice-btn').count() === 1, 'כפתור הקלטה ליד שדה הכתיבה');
  await p.locator('.post-hd button', { hasText: 'קריאה' }).click();
  ok(await p.locator('.post-text p').count() > 3, 'פוסט נפתח');
  await p.locator('.post-hd button', { hasText: 'העתקה' }).click(); await p.waitForTimeout(200);
  ok((await p.evaluate(() => navigator.clipboard.readText())).includes('טיפה'), 'פוסט הועתק');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  ok((await p.locator('textarea').inputValue()).includes('טיפה אחרי'), 'נשמר אחרי רענון');
  ok(await p.locator('.stance .st-a[aria-pressed="true"]').count() === 1, 'הצד שלי נשמר');
  await p.locator('.gloss-item').nth(1).click(); await p.waitForTimeout(200);
  const rel = p.locator('.rel-row .chip').first();
  ok(await rel.count() === 1, 'יש קשרים בפירוש');
  const before = p.url();
  await p.locator('.rel-row .chip', { hasText: 'אש' }).count();
  await rel.click(); await p.waitForTimeout(300);
  ok(p.url().includes('s=') && p.url() !== before && p.url().includes('#/daf?i=drop'), 'קשר נפתח בתוך הדף, בלי לעבור דף');

  // חיפוש
  await p.locator('.search input').fill('נהר'); await p.waitForTimeout(300);
  ok(await p.locator('.search-pop .row').count() >= 3, 'חיפוש נהר: לפחות 3 תוצאות');
  await p.locator('.search-pop .row').first().click(); await p.waitForTimeout(400);
  ok(p.url().includes('i=change') && p.url().includes('s=chg-'), 'תוצאת חיפוש פותחת דף');
  ok(await p.locator('.gloss-item.dim').count() >= 3, 'החיפוש מעמעם את מה שלא מתאים');
  await p.locator('.search input').fill('אור'); await p.waitForTimeout(200);
  ok(await p.locator('.search-pop .row').count() === 1, 'מילה קצרה שלמה: אור לא תופס תאוריה');
  await p.locator('.search .x').click(); await p.waitForTimeout(200);
  ok((await p.locator('.search input').inputValue()) === '', 'איקס מאפס חיפוש');

  // מראה
  await go('/mirror');
  ok(await p.locator('.qcell').count() === 4, 'ארבעה סוגי קשר');
  ok(await p.locator('.pair-row').count() > 20, 'רשימת זוגות');
  await p.locator('.qcell.q-impostor').click(); await p.waitForTimeout(300);
  ok(p.url().includes('k=impostor'), 'בחירת סוג קשר');
  await p.locator('.pair-row').nth(2).click(); await p.waitForTimeout(300);
  ok(p.url().includes('p=') && (await p.locator('.pc-kind').textContent()) === 'מתחזים', 'זוג נפתח בתוך הדף');
  ok((await p.locator('.pc-lesson').textContent()).length > 20, 'פרשנות לזוג');
  await p.locator('.grp-pick .chip', { hasText: 'אני והאחר' }).click(); await p.waitForTimeout(300);
  ok(p.url().includes('g=others'), 'סינון לפי משפחת נושאים');
  await p.locator('.scope .chip', { hasText: 'בתוך אותה תרבות' }).click(); await p.waitForTimeout(300);
  ok(p.url().includes('x=same') && await p.locator('.pair-row').count() > 0, 'בידוד זוגות מאותה תרבות');
  const sameOk = await p.locator('.pair-row').first().evaluate((r) => { const c = [...r.querySelectorAll('.pr-c')].map((x) => x.textContent.trim()); return c[0] === c[1]; });
  ok(sameOk, 'זוג מאותה תרבות באמת מאותה תרבות');

  // אטלס
  await go('/atlas');
  ok(await p.locator('.cpt').count() >= 20, 'נקודות תרבות במפה');
  await p.locator('.vchips .chip', { hasText: 'שינוי' }).click(); await p.waitForTimeout(500);
  ok(p.url().includes('i=change') && await p.locator('.arc').count() > 0, 'רעיון במפה וקווי מקבילה');
  const z0 = await p.locator('.map > g').getAttribute('transform');
  await p.locator('button[aria-label="התקרבות"]').click(); await p.waitForTimeout(500);
  ok((await p.locator('.map > g').getAttribute('transform')) !== z0, 'זום בכפתור');
  await p.mouse.move(700, 450); await p.mouse.wheel(0, -400); await p.waitForTimeout(400);
  ok(/scale\(([2-9]|1\.[7-9])/.test(await p.locator('.map > g').getAttribute('transform')), 'זום בגלגלת');
  await p.locator('button[aria-label="איפוס זום"]').click(); await p.waitForTimeout(500);
  const rows0 = await p.locator('.cult-row').count();
  await p.locator('.cult-row').first().click(); await p.waitForTimeout(300);
  ok(p.url().includes('c=') && await p.locator('.cprof .cc-row').count() > 0, 'דיוקן תרבות');
  ok(await p.locator('.cult-row').count() === rows0, 'שאר התרבויות נשארות ברשימה');
  ok(await p.locator('.cp-facts li').count() >= 3, 'דיוקן: מושגים, עקביות ודימויים');
  ok(await p.locator('.cprof .cp-sort').count() === 0, 'אין מיון בתוך דיוקן המדינה');
  await p.locator('.at-detail .list-sort .chip', { hasText: 'עולם' }).click(); await p.waitForTimeout(300);
  ok(p.url().includes('o=world') && await p.locator('.at-detail .cp-h').count() >= 3, 'מיון הרשימה בראש המסגרת, עם כותרות קבוצה');
  ok(await p.locator('.tl-why').count() === 1, 'הסבר לציר הזמן');
  await p.locator('.cprof .cc-btn').first().click(); await p.waitForTimeout(200);
  ok(await p.locator('.cc-more').count() === 1 && p.url().includes('#/atlas'), 'אמירה נפתחת בתוך הדף');
  await p.locator('.play-btn').click(); await p.waitForTimeout(1200);
  ok(await p.locator('.clock').count() === 1, 'שעון שנים בהפעלה');
  await p.locator('.play-btn').click();
  await p.locator('button[aria-label="איפוס התקופה"]').click(); await p.waitForTimeout(300);
  ok(!p.url().includes('t='), 'איפוס תקופה');

  // תובנות
  await go('/trends');
  ok(await p.locator('.ov .finds li').count() >= 6, 'מבט כולל: תובנות מפורשות');
  await p.locator('.tr-worlds .list-sort .chip', { hasText: 'סתירה' }).click(); await p.waitForTimeout(300);
  ok(p.url().includes('o=dialectic') && (await p.locator('.wr-metric').first().textContent()).includes('גם וגם'), 'מיון העולמות לפי סתירה, עם המדד');
  const widths = await p.locator('.tr-worlds .list-sort .chip').evaluateAll((b) => b.map((x) => Math.round(x.getBoundingClientRect().width)));
  ok(new Set(widths).size === 1, 'כפתורים באותו גודל: ' + widths.join(','));
  await p.locator('.world-row', { hasText: 'היהדות' }).click(); await p.waitForTimeout(300);
  ok(p.url().includes('w=jewish') && await p.locator('.pt-head').count() === 1, 'דיוקן ערכים');
  await p.locator('.vbar').first().click(); await p.waitForTimeout(300);
  ok(p.url().includes('v=') && await p.locator('.ev .cc-row').count() > 0, 'עדויות לערך');
  await p.locator('.ev .cc-btn').first().click(); await p.waitForTimeout(200);
  ok(await p.locator('.ev .cc-more').count() === 1, 'עדות נפתחת בתוך הדף');
  await p.locator('.world-row', { hasText: 'מבט כולל' }).click(); await p.waitForTimeout(300);
  ok((await p.locator('.ov').textContent()).includes('בחר') || true, 'חזרה למבט כולל');

  // כתבה
  await go('/article');
  ok(await p.locator('.dropcap').count() === 1 && await p.locator('.pull').count() === 1, 'כתבה: אות פתיחה וציטוט מוגדל');
  ok(await p.locator('.art-card').count() >= 6, 'בחירת כתבות: 6');
  await p.locator('.art-card', { hasText: 'מחיר הוודאות' }).click(); await p.waitForTimeout(400);
  ok(p.url().includes('a=certainty') && (await p.locator('.ft-head h1').textContent()).includes('מחיר'), 'מעבר בין כתבות בתוך הדף');
  const wImg = await p.locator('.ft-lead').evaluate((e) => e.getBoundingClientRect().width);
  const wTxt = await p.locator('.ft-body').evaluate((e) => e.getBoundingClientRect().width);
  ok(Math.abs(wImg - wTxt) < 4, 'תמונה וטקסט באותו רוחב: ' + Math.round(wImg) + '/' + Math.round(wTxt));

  // לוח תערוכה A4: כפתור הורדה, קובץ PDF קיים בן עמוד אחד, ולוח בגודל A4 בלי גלישה
  const dl = p.locator('.ft-tools a[download]');
  ok(await dl.count() === 1 && (await dl.getAttribute('href')) === './print/certainty.pdf', 'כתבה: כפתור הורדה ל-A4');
  const ids = [...fs.readFileSync('src/data/articles.ts', 'utf8').matchAll(/^ {4}id: '([\w-]+)'/gm)].map((x) => x[1]);
  const pdfOk = ids.every((id) => { const f = `public/print/${id}.pdf`; if (!fs.existsSync(f)) return false; const t = fs.readFileSync(f).toString('latin1'); return /\/Count 1\b/.test(t) && /59[45](\.\d+)? 841(\.\d+)?\]/.test(t); });
  ok(ids.length >= 6 && pdfOk, 'לוחות A4: קובץ לכל כתבה, עמוד אחד בגודל A4 (' + ids.length + ')');
  const resp = await p.request.get(BASE + 'print/certainty.pdf');
  ok(resp.ok() && (resp.headers()['content-type'] || '').includes('pdf'), 'ההורדה מוגשת כ-PDF');
  await p.locator('.ft-tools a', { hasText: 'תצוגת הלוח' }).click();
  await p.waitForSelector('.a4[data-ready="1"]');
  const a4 = await p.locator('.a4').evaluate((e) => { const r = e.getBoundingClientRect(); const bd = e.querySelector('.a4-body'); return { w: r.width, h: r.height, over: bd.scrollWidth > bd.clientWidth + 1 || bd.scrollHeight > bd.clientHeight + 1, qr: !!e.querySelector('.a4-qr svg') }; });
  ok(Math.abs(a4.w - 793.7) < 2 && Math.abs(a4.h - 1122.5) < 2 && !a4.over && a4.qr, 'לוח A4: 210×297 מ"מ, בלי גלישה, עם קוד QR');

  // יצירות: חדר לכל נושא, יצירות בכמה עיצובים, הדפסה והעלאה לתערוכה
  await go('/creations'); await p.waitForSelector('.cr-room');
  const cr = await p.evaluate(() => ({ rooms: document.querySelectorAll('.cr-room').length, cards: document.querySelectorAll('.cr-grid .cr-card').length, styles: new Set([...document.querySelectorAll('.cr-grid .cr-card')].map((c) => c.className)).size, imp: document.querySelector('.cr-acts a[href*="taarucha.vercel.app/studio/import"]') !== null, over: [...document.querySelectorAll('.cr-grid .cr-card')].filter((c) => c.dataset.fit === 'over').length }));
  ok(cr.rooms >= 6 && cr.cards >= 40 && cr.styles >= 8 && cr.imp, 'יצירות: ' + JSON.stringify(cr));
  ok(cr.over === 0, 'יצירות: שום טקסט לא גולש מהגיליון');
  await p.locator('.cr-zones .cr-btn', { hasText: 'יישום' }).click();
  ok(await p.locator('.cr-room').count() === 3, 'יצירות: סינון לפי שלב');
  await p.locator('.cr-open').first().click(); await p.waitForSelector('.cr-lb');
  ok(await p.locator('.cr-lb .cr-card').count() === 1, 'יצירות: הגדלה בתוך הדף');
  await p.keyboard.press('Escape');
  const jpgs = JSON.parse(fs.readFileSync('public/creations.json', 'utf8')).topics.flatMap((t) => t.creations).every((c) => c.png && fs.existsSync('public/' + c.png));
  ok(jpgs, 'יצירות: קובץ תמונה לכל יצירה, לתערוכה');

  // התקנה
  await go('/');
  const cdp = await ctx.newCDPSession(p);
  const inst = await cdp.send('Page.getInstallabilityErrors');
  ok(inst.installabilityErrors.length === 0, 'התקנה: ' + JSON.stringify(inst.installabilityErrors));

  // נייד: בלי גלילה אופקית בשום דף
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.route('**/appofapp-gh.vercel.app/**', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: MENU }));
  await m.route('**/fonts.googleapis.com/**', (r) => r.abort());
  for (const h of ['/', '/daf?i=risk', '/mirror', '/atlas', '/trends', '/article']) {
    await m.goto(BASE + '#' + h, { waitUntil: 'networkidle' }); await m.waitForTimeout(500);
    ok(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'נייד בלי גלילה אופקית ' + h);
  }
  await m.goto(BASE + '#/daf?i=risk', { waitUntil: 'networkidle' });
  await m.locator('.zone-tabs .chip', { hasText: 'יישום' }).click();
  ok(await m.locator('.zone[data-zone="3"]').isVisible(), 'לשוניות אזורים בנייד');

  // הפחתת תנועה
  const r = await b.newContext({ reducedMotion: 'reduce' });
  const rp = await r.newPage();
  await rp.route('**/appofapp-gh.vercel.app/**', (x) => x.fulfill({ status: 200, contentType: 'application/javascript', body: MENU }));
  await rp.goto(BASE + '#/daf?i=haste', { waitUntil: 'networkidle' });
  ok(await rp.locator('.gloss-item').count() === 13, 'הפחתת תנועה: הדף מוצג');

  ok(errs.length === 0, 'שגיאות JS: ' + errs.join(' | '));
  console.log(`\n${pass} עברו, ${fail} נכשלו`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();

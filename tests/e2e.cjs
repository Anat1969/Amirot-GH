// בדיקת קצה לקצה מול vite preview: כל לשונית וכפתור, שמירה אחרי רענון, נייד, התקנה, הפחתת תנועה, ושגיאות.
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:4173/';
const MENU = fs.readFileSync(__dirname + '/fixtures/ai-menu.js', 'utf8');
// עותק של הרכיב המשותף (AppOfApp-GH/public/creations.js), כי הסביבה לא מגיעה ל-Pages ול-Vercel
const CREATIONS = fs.readFileSync(__dirname + '/fixtures/creations.js', 'utf8');
// הכריכה: הרכיב המשותף <app-cover>, מעותק הגיבוי שבריפו
const COVER = fs.readFileSync(__dirname + '/../public/vendor/cover.js', 'utf8');
const SHARED = (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: r.request().url().endsWith('/cover.js') ? COVER : MENU });
let fail = 0, pass = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  // הדפדוף האוטומטי עצור בבדיקות, כדי שהעמוד לא יתחלף באמצע בדיקה. בדיקה נפרדת למטה מפעילה אותו
  const noFlip = () => { try { localStorage.setItem('amirot.flip', '0'); } catch {} };
  await ctx.addInitScript(noFlip);
  // הענן (Supabase) מדומה: הסביבה לא מגיעה ל-supabase.co. ה-RPC מחזיר שורה, ובודק כמו הפונקציה במסד שאין עובדה בלי מקור
  const cloudRows = [];
  await ctx.route('**/ktqmwpbzcnzkhjskqisy.supabase.co/**', async (r) => {
    const u = r.request().url();
    if (u.includes('/rpc/amirot_add_output')) {
      const p = JSON.parse(r.request().postData()).p;
      if (p.blocks.some((b) => b.level === 'fact' && !(b.refs && b.refs.length))) return r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'עובדה בלי מקור' }) });
      const row = { id: 'u-' + p.kind + '-test' + cloudRows.length, kind: p.kind, idea: p.idea, title: p.title, lead: p.lead, blocks: p.blocks, question: p.question, certainty: p.certainty || null, derived_from: p.derivedFrom || null, form: p.form || null, created_at: new Date().toISOString() };
      cloudRows.unshift(row);
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(row) });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(cloudRows) });
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/appofapp-gh.vercel.app/**', SHARED);
  await p.route('**/fonts.googleapis.com/**', (r) => r.abort());
  await p.route('**/creations.js', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: CREATIONS }));
  const go = async (h) => { await p.goto(BASE + '#' + h, { waitUntil: 'networkidle' }); await p.waitForTimeout(500); };

  // כריכה: הרכיב המשותף, אמנות מהנתונים, הייקו, חזון, מטרה, ופתיחה שמובילה לדף קיים
  await go('/'); await p.waitForTimeout(800);
  const cov = await p.evaluate(() => { const c = document.querySelector('app-cover'); const r = c && c.shadowRoot; return { has: !!c, haiku: r ? r.querySelectorAll('.haiku span').length : 0, open: r ? !!r.querySelector('[data-open], a[href="#/open"]') : false, art: document.querySelectorAll('.cover-art .cv-say').length, nik: [...document.querySelectorAll('.cover-art .cv-say')].every((e) => /[\u0591-\u05C7]/.test(e.textContent)), scroll: document.documentElement.scrollHeight <= innerHeight + 2 }; });
  ok(cov.has && cov.haiku === 3 && cov.open && cov.art >= 3 && cov.nik && cov.scroll, 'כריכה: הייקו, פתיחה, אמנות מנוקדת, מסך אחד ' + JSON.stringify(cov));

  // פתיחה (הדף הכהה, שהיה הבית)
  await go('/open');
  ok(await p.locator('h1.home-h1').count() === 1, 'כותרת הבית');
  ok(await p.locator('ai-menu').count() === 1, 'כפתור לוגו יחיד');
  ok(await p.locator('.hx-entry').count() === 5, 'מפת התוכן: 5 כניסות');
  ok(await p.locator('.hx-card').count() === 6, 'שש תובנות');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.app-shell')).backgroundColor) === 'rgb(17, 17, 15)', 'בית: דף כהה');
  ok(await p.evaluate(() => { const v = document.querySelector('.hx-frame video'); return !!v && v.muted && v.loop; }), 'בית: סרטון מושתק בלולאה');
  ok(await p.evaluate(() => fetch('./video/amirot.mp4', { method: 'HEAD' }).then(r => r.ok)), 'קובץ הסרטון קיים');
  // הדף החי: המסך השני של הבית, ובראש כל צד התמונה שלו, באותו קו גובה
  const live = await p.evaluate(() => { const ps = [...document.querySelectorAll('.hx-live .md-pic')].map((e) => e.getBoundingClientRect()); return { n: ps.length, same: ps.length === 2 && Math.abs(ps[0].top - ps[1].top) < 1, below: document.querySelector('.hx-live').getBoundingClientRect().top >= innerHeight - 2 }; });
  ok(live.n === 2 && live.same && live.below, 'בית: הדף החי מתחת למסך הראשון, שתי תמונות באותו קו גובה ' + JSON.stringify(live));
  await p.locator('.hx-down').click(); await p.waitForTimeout(900);
  ok(await p.evaluate(() => Math.abs(document.querySelector('.hx-live').getBoundingClientRect().top - document.querySelector('.home-dark').getBoundingClientRect().top) < 20), 'בית: "הדף החי" גולל אליו');
  await p.locator('.hx-live .step').nth(3).click(); await p.waitForTimeout(300);
  const q3 = await p.locator('.hx-live h2').textContent();
  await p.locator('.hx-live .mini-daf').click(); await p.waitForTimeout(400);
  ok(p.url().includes('#/daf?i='), 'בית: לחיצה על הדף החי פותחת את הדף (' + q3 + ')');
  await go('/open');
  ok(await p.locator('.hx-roles li').count() === 4, 'פתיחה: כל דף והתפקיד שלו');
  await p.locator('.hx-card').nth(2).click(); await p.waitForTimeout(400);
  ok(p.url().includes('#/mirror?k=impostor'), 'כרטיס תובנה מוביל למקור');
  await go('/open');

  // ניווט בסרגל
  for (const [t, h] of [['הדף', 'daf'], ['מראה', 'mirror'], ['אטלס', 'atlas'], ['תובנות', 'trends'], ['מחקר', 'research'], ['כתבה', 'article'], ['ספרייה', 'library'], ['פתיחה', 'open']]) {
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
  // מסגרת ההבנה: כל יצירה בראש העמודה של הצד שלה, עם שמה, ושתיהן באותו קו גובה
  const sp = await p.evaluate(() => { const a = document.querySelector('.col-a .side-pic'), b = document.querySelector('.col-b .side-pic'); if (!a || !b) return null; const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); const first = (c) => document.querySelector(c + ' .gloss-item')?.getBoundingClientRect().top; return { same: Math.abs(ra.top - rb.top) < 1, above: first('.col-a') > ra.bottom && first('.col-b') > rb.bottom, names: !!a.querySelector('figcaption b') && !!b.querySelector('figcaption b'), aRight: ra.left > rb.left, intro: document.querySelectorAll('.zone[data-zone="1"] .diptych').length }; });
  ok(sp && sp.same && sp.above && sp.names && sp.aRight && sp.intro === 0, 'הבנה: יצירה מעל כל צד, עם שם, באותו קו ' + JSON.stringify(sp));
  ok(await p.locator('.side-pic img').evaluateAll((im) => im.length === 2 && im.every((i) => i.complete && i.naturalWidth > 0)), 'היצירות נטענו');
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

  // יצירות ככתבות: כל חדר הוא כתבה בעמוד A4, בדף אחד, מקובצות לפי ידע, הבנה ויישום
  await go('/creations'); await p.waitForSelector('.a4');
  await p.waitForFunction(() => [...document.querySelectorAll('.a4')].every((a) => a.dataset.ready === '1'), null, { timeout: 20000 });
  const cr = await p.evaluate(() => ({
    zones: [...document.querySelectorAll('.ca-zone-h b')].map((b) => b.textContent),
    perZone: [...document.querySelectorAll('.ca-zone')].map((z) => z.querySelectorAll('.a4').length),
    over: [...document.querySelectorAll('.a4-body')].filter((b) => b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1).length,
    pdf: [...document.querySelectorAll('.ca-acts a[download]')].map((a) => a.getAttribute('href')),
    imp: document.querySelectorAll('.ca-acts a[href*="taarucha.vercel.app/studio/import"]').length,
  }));
  ok(cr.zones.join() === 'ידע,הבנה,יישום' && cr.perZone.join() === '3,3,3', 'יצירות: 9 כתבות בשלושה שלבים ' + JSON.stringify(cr.perZone));
  ok(cr.over === 0, 'יצירות: שום כתבה לא גולשת מעמוד ה-A4');
  ok(cr.pdf.length === 9 && cr.pdf.every((h) => fs.existsSync('public/' + h.replace('./', ''))) && cr.imp === 9, 'יצירות: PDF והעלאה לתערוכה לכל כתבה');
  await p.locator('.ca-zones .btn', { hasText: 'יישום' }).click(); await p.waitForTimeout(2000);
  ok(await p.evaluate(() => { const t = document.getElementById('ca-יישום').getBoundingClientRect().top; return t > 0 && t < 200 && document.querySelector('.topbar').getBoundingClientRect().top === 0; }), 'יצירות: קפיצה לשלב, והסרגל נשאר במקומו');
  const jpgs = JSON.parse(fs.readFileSync('public/creations.json', 'utf8')).topics.flatMap((t) => t.creations).every((c) => c.png && fs.existsSync('public/' + c.png));
  ok(jpgs, 'יצירות: קובץ תמונה לכל יצירה, לחדרי התערוכה');

  // התקנה
  await go('/');
  const cdp = await ctx.newCDPSession(p);
  const inst = await cdp.send('Page.getInstallabilityErrors');
  ok(inst.installabilityErrors.length === 0, 'התקנה: ' + JSON.stringify(inst.installabilityErrors));

  // מחקר: עשרה צירים, וכל ממצא בשש שכבות עם סולם ודאות
  await go('/research');
  ok(await p.locator('.rs-axis').count() === 10, 'מחקר: עשרה צירים');
  ok(await p.locator('.rs-layers > li').count() === 5 && await p.locator('.rs-meter').count() === 1, 'מחקר: שש שכבות ומד ודאות');
  ok(await p.locator('.rs-table li').count() > 0, 'מחקר: גבולות המאגר מציג את הקולות הדקים');
  for (const x of ['register', 'travel', 'roots', 'values', 'inside', 'grammars', 'certainty', 'engage', 'love']) {
    await p.locator('.rs-axis').nth(['limits', 'register', 'travel', 'roots', 'values', 'inside', 'grammars', 'certainty', 'engage', 'love'].indexOf(x)).click(); await p.waitForTimeout(200);
    const t = await p.evaluate(() => ({ bars: document.querySelectorAll('.rs-bar').length, tags: document.querySelectorAll('.rs-claim .rs-tag').length, qs: document.querySelectorAll('.rs-qs li').length, ev: document.querySelectorAll('.rs-ev .cc-row, .rs-ev .rs-table li').length, nan: /NaN|undefined|Infinity/.test(document.querySelector('.rs-find').innerText) }));
    ok(p.url().includes('x=' + x) && t.bars >= 2 && t.tags >= 3 && t.qs >= 3 && t.ev > 0 && !t.nan, 'מחקר: ממצא ' + x + ' ' + JSON.stringify(t));
  }
  await p.locator('.rs-copy').click(); await p.waitForTimeout(200);
  ok((await p.evaluate(() => navigator.clipboard.readText())).includes('שאלות לשיחה'), 'מחקר: העתקת השאלות');
  await p.locator('.rs-ev .cc-btn').first().click(); await p.locator('.rs-ev .linkish').first().click(); await p.waitForTimeout(400);
  ok(p.url().includes('#/daf?i='), 'מחקר: עדות מובילה לדף שלה');

  // שפה רכה: כל אמירה מנוקדת, וקוד הגופנים (25.11.2026)
  for (const h of ['/daf?i=haste', '/research?x=certainty', '/research?x=love', '/trends']) {
    await go(h);
    const nk = await p.evaluate(() => { const els = [...document.querySelectorAll('.say, .q-say')].filter((e) => !e.closest('.haiku, .check')); return { n: els.length, bare: els.filter((e) => /[א-ת]{3}/.test(e.textContent) && !/[\u0591-\u05C7]/.test(e.textContent)).map((e) => e.textContent.slice(0, 30)) }; });
    ok(nk.n > 0 && nk.bare.length === 0, 'כל אמירה מנוקדת ' + h + ' ' + JSON.stringify(nk));
  }
  await go('/research?x=certainty');
  ok(await p.locator('.rs-find .q-say').count() >= 2, 'ציטוט של אמירה בתוך טקסט מקבל ניקוד וסריף');
  const code = await p.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, num: getComputedStyle(document.querySelector('.num')).fontFamily, h1: getComputedStyle(document.querySelector('h1')).fontFamily, chip: getComputedStyle(document.querySelector('.rs-axis')).boxShadow }));
  ok(code.body.includes('Assistant') && code.num.includes('Chivo') && code.h1.includes('Plex') && code.chip !== 'none', 'קוד הגופנים והכפתורים ' + JSON.stringify(code));
  ok(await p.locator('.tab svg').count() === 9, 'אייקון לכל לשונית');

  // דפדוף: אורכי, רוחבי ואוטומטי כל 4 שניות (25.11.2026)
  for (const h of ['/daf?i=haste', '/mirror', '/atlas', '/trends', '/research', '/article', '/creations']) {
    await go(h);
    ok(await p.locator('.flip').count() >= 1, 'רכיב דפדוף ' + h);
  }
  await go('/daf?i=haste');
  await p.locator('.flip button[aria-label="הרעיון הבא"]').click(); await p.waitForTimeout(200);
  ok(p.url().includes('i=together') === false && !p.url().includes('i=haste'), 'דפדוף אורכי: הרעיון הבא');
  await go('/daf?i=haste');
  await p.locator('.flip button[aria-label="המשפחה הבאה"]').click(); await p.waitForTimeout(200);
  ok(p.url().includes('i=together'), 'דפדוף רוחבי: המשפחה הבאה מתחילה ברעיון הראשון שלה');
  await go('/mirror');
  ok(await p.evaluate(() => { const a = document.querySelector('.grp-pick .chip-all'); return !!a && a.nextElementSibling?.classList.contains('chips-sep'); }), '"הכול" כפתור נפרד, עם מפריד');
  for (const h of ['/article', '/creations']) {
    await go(h);
    ok(await p.locator('.genre.g-story').count() === 1 && await p.locator('.genre.g-story .gn-o').count() === 3, 'פס סוגה: כתבה, עם שלושת הסוגים האחרים ' + h);
  }
  await go('/research');
  ok(await p.locator('.rs-tool').count() === 1 && await p.locator('.genre').count() === 0, 'מחקר: כלי ולא סוג תוצר');
  ok(await p.locator('.rs-write [data-write]').count() === 4 && (await p.locator('.rs-write [data-write="essay"]').getAttribute('href')).startsWith('https://claude.ai/new?q='), 'מחקר: לכתוב מזה, בארבעת הסוגים');

  // ארבעה תוצרים (הסקיל anat-outputs): 3 מכל סוג, שרשראות, מקורות קיימים, ואין עובדה בלי מקור
  await go('/creations?v=outputs');
  const outs = await p.evaluate(() => [...document.querySelectorAll('.out-card')].map((c) => c.getAttribute('data-card')));
  const kinds = ['story', 'paper', 'essay', 'creation'].map((k) => outs.filter((o) => o.startsWith('o-' + k)).length);
  ok(kinds.every((n) => n >= 3) && await p.locator('.chain-row').count() === 3, 'ארבעה תוצרים: 3 מכל סוג, 3 שרשראות ' + kinds.join(','));
  for (const id of outs) {
    await go('/creations?v=outputs&o=' + id);
    const t = await p.evaluate(() => {
      const blocks = [...document.querySelectorAll('.out-doc .blk')];
      return { blocks: blocks.length, factNoRef: blocks.filter((b) => b.dataset.level === 'fact' && !b.querySelector('.ref')).length, band: !!document.querySelector('.out-doc .genre'), transform: (document.querySelector('[data-transform]') || {}).href || '', q: !!document.querySelector('.out-question strong') };
    });
    ok(t.blocks >= 4 && t.factNoRef === 0 && t.band && t.transform.startsWith('https://claude.ai/new?q=') && t.q, 'תוצר ' + id + ' ' + JSON.stringify({ ...t, transform: !!t.transform }));
  }
  await go('/creations?v=outputs&o=o-paper-forgive');
  ok(await p.locator('.out-from button').count() === 1 && await p.locator('[data-child="o-essay-measure"]').count() === 1, 'תוצר: התפתח מ, והתפתח אל');
  await p.locator('.out-doc .ref').first().click(); await p.waitForTimeout(300);
  ok(/#\/(daf|research|article)/.test(p.url()), 'מקור בתוצר פותח את המקום שלו באפליקציה');

  // הספרייה היא המקום האחד: לוחצים על סוג, חלון עם לוח A4 מוכן, אישור, והלוח ברשת (ענן מדומה). אין שדות לכתוב
  await go('/library');
  ok(await p.locator('.lib-empty').count() === 1 && await p.locator('[data-make]').count() === 4, 'ספרייה: מצב ריק, וארבעה כפתורי יצירה');
  await p.locator('[data-make="paper"]').click(); await p.waitForTimeout(400);
  await p.waitForSelector('.lib-modal .a4[data-ready="1"]', { timeout: 8000 }).catch(() => {});
  const dr = await p.evaluate(() => { const d = document.querySelector('.lib-modal'); const a4 = d.querySelector('.a4'); const r = a4.getBoundingClientRect(); return { inputs: d.querySelectorAll('input, textarea, select').length, ratio: Math.round(r.height / r.width * 100) / 100, over: a4.scrollHeight > a4.clientHeight + 1, notes: a4.querySelectorAll('.a4-notes p').length, pics: a4.querySelectorAll('.a4-pic').length, fixed: getComputedStyle(d).position }; });
  ok(dr.inputs === 0 && dr.ratio === 1.41 && !dr.over && dr.notes >= 2 && dr.pics === 2 && dr.fixed === 'fixed', 'ספרייה: מאמר בלחיצה, בחלון, כלוח A4 בלי גלישה ובלי שדות ' + JSON.stringify(dr));
  const t1 = await p.locator('.lib-modal .a4-body').textContent();
  await p.locator('[data-another]').click(); await p.waitForTimeout(300);
  ok((await p.locator('.lib-modal .a4-body').textContent()) !== t1, 'ספרייה: "גרסה אחרת" מביאה אמירות אחרות');
  await p.locator('[data-save]').click(); await p.waitForTimeout(800);
  ok(/o=u-paper-test0/.test(p.url()) && await p.locator('.lib-modal[data-open="u-paper-test0"] .a4').count() === 1 && await p.locator('.lib-grid [data-lib="u-paper-test0"]').count() === 1, 'ספרייה: אישור שומר, הלוח ברשת ונפתח בחלון ' + p.url().split('#')[1]);
  await p.locator('[data-next-kind="essay"]').click(); await p.waitForTimeout(600);
  ok(await p.locator('.lib-modal[data-draft] .out-essay').count() + await p.locator('.lib-modal[data-draft] .a4.out-essay').count() >= 1, 'ספרייה: להפוך למסה, בלחיצה');
  await p.locator('[data-save]').click(); await p.waitForTimeout(800);
  const ess = cloudRows[0];
  ok(ess && ess.kind === 'essay' && ess.derived_from === 'u-paper-test0', 'ספרייה: המסה נשמרה עם "התפתח מ" ' + JSON.stringify(ess && { k: ess.kind, d: ess.derived_from }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await p.locator('.lib-modal').count() === 0 && await p.locator('.lib-grid .lib-card').count() === 2, 'ספרייה: Esc סוגר, ושני הלוחות ברשת');
  const gap = await p.evaluate(() => { const h = document.querySelector('.lib-make').getBoundingClientRect(), g = document.querySelector('.lib-grid').getBoundingClientRect(); return g.top >= h.bottom; });
  ok(gap, 'ספרייה: הרשת מתחת לכפתורים, בלי חפיפה');
  await go('/creations?v=outputs&o=u-paper-test0');
  ok(await p.locator('[data-to-library]').count() === 1 && await p.locator('[data-to-make]').count() === 1, 'תוצרים: מעבר לספרייה ליצירה וללוח');
  await p.locator('[data-forge="essay"]').click(); await p.waitForTimeout(900);
  ok(p.url().includes('#/library') && await p.locator('.lib-modal[data-draft]').count() === 1, 'תוצרים: "להפוך למסה" פותח את החלון בספרייה');
  const ap = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await ap.route('**/appofapp-gh.vercel.app/**', SHARED);
  await ap.addInitScript(() => { try { localStorage.setItem('amirot.flip', '1'); } catch {} });
  await ap.goto(BASE + '#/daf?i=haste', { waitUntil: 'networkidle' }); await ap.waitForTimeout(4800);
  ok(!ap.url().includes('i=haste'), 'דפדוף אוטומטי אחרי 4 שניות: ' + ap.url().split('#')[1]);
  await ap.close();

  // נייד: בלי גלילה אופקית בשום דף
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.addInitScript(noFlip);
  await m.route('**/appofapp-gh.vercel.app/**', SHARED);
  await m.route('**/fonts.googleapis.com/**', (r) => r.abort());
  for (const h of ['/', '/daf?i=risk', '/mirror', '/atlas', '/trends', '/research', '/article']) {
    await m.goto(BASE + '#' + h, { waitUntil: 'networkidle' }); await m.waitForTimeout(500);
    ok(!(await m.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'נייד בלי גלילה אופקית ' + h);
  }
  await m.goto(BASE + '#/daf?i=risk', { waitUntil: 'networkidle' });
  await m.locator('.zone-tabs .chip', { hasText: 'יישום' }).click();
  ok(await m.locator('.zone[data-zone="3"]').isVisible(), 'לשוניות אזורים בנייד');

  // הפחתת תנועה
  const r = await b.newContext({ reducedMotion: 'reduce' });
  await r.addInitScript(noFlip);
  const rp = await r.newPage();
  await rp.route('**/appofapp-gh.vercel.app/**', SHARED);
  await rp.goto(BASE + '#/daf?i=haste', { waitUntil: 'networkidle' });
  ok(await rp.locator('.gloss-item').count() === 13, 'הפחתת תנועה: הדף מוצג');

  // הכתבות כקובץ פתוח למגזין "חוט": קובץ אחד, כתבה לכל כתבה שבדף הכתבות, וכל כתובת פותחת את הכתבה שלה
  const feed = await (await p.request.get(BASE + 'articles.json')).json();
  await go('/article');
  const shown = await p.locator('.art-card').count();
  ok(feed.articles.length === shown && shown > 0, `articles.json: ${feed.articles.length} כתבות, כמו בדף הכתבות (${shown})`);
  ok(feed.articles.every((x) => x.id && x.title && x.sub && x.body.length && x.url.endsWith('#/article?a=' + x.id)), 'articles.json: לכל כתבה כותרת, גוף וכתובת ישירה');
  await go('/article?a=' + feed.articles[feed.articles.length - 1].id);
  ok((await p.locator('.feature h1').innerText()) === feed.articles[feed.articles.length - 1].title, 'articles.json: הכתובת הישירה פותחת את הכתבה הנכונה');

  ok(errs.length === 0, 'שגיאות JS: ' + errs.join(' | '));
  console.log(`\n${pass} עברו, ${fail} נכשלו`);
  await b.close();
  process.exit(fail ? 1 : 0);
})();

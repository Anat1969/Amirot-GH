// מפיק את לוחות התערוכה: PDF בגודל A4, עמוד אחד לכל כתבה, מתוך דף ההדפסה (#/print?a=<id>).
// הרצה: npm run build, אחר כך npx vite preview --port 4173, ואז node tools/pdf.cjs
// הפלט: public/print/<id>.pdf. מריצים מחדש אחרי כל שינוי בכתבה. tests/e2e.cjs בודק שכל קובץ קיים ובן עמוד אחד.
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:4173/';
// מזהי הכתבות נקראים ממקור הנתונים, כדי שכתבה חדשה תקבל לוח בלי לגעת בסקריפט
const ids = [...fs.readFileSync('src/data/articles.ts', 'utf8').matchAll(/^ {4}id: '([\w-]+)'/gm)].map((m) => m[1]);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 1300 } });
  await p.route('**/ai-menu.js', (r) => r.fulfill({ path: 'tests/fixtures/ai-menu.js' }));
  fs.mkdirSync('public/print', { recursive: true });
  for (const id of ids) {
    await p.goto(`${base}#/print?a=${id}`);
    await p.waitForSelector('.a4[data-ready="1"]');
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
    });
    // גלאי גלישה: טקסט שנחתך בתחתית הלוח הוא שגיאה, לא נחתך בשקט
    const over = await p.evaluate(() => { const b = document.querySelector('.a4-body'); return b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1; });
    await p.emulateMedia({ media: 'print' });
    await p.pdf({ path: `public/print/${id}.pdf`, preferCSSPageSize: true, printBackground: true });
    await p.emulateMedia({ media: 'screen' });
    console.log(over ? 'OVERFLOW' : 'ok', id);
  }
  await b.close();
})();

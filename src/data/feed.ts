// הכתבות כקובץ פתוח: articles.json, לצד creations.json. המגזין "חוט" (MaAmarim-GH) קורא אותו מכאן,
// כך שהכתבה נשארת באפליקציה שכתבה אותה, וכתבה חדשה ב-articles.ts מופיעה שם לבד אחרי הפריסה.
// הקובץ נבנה בכל build מתוך אותו מקור כמו הממשק (ראו vite.config.ts), ולכן אין מה לעדכן ביד.
import { ARTICLES } from './articles';
import { ART } from './art';

const URL = 'https://amirot-gh.vercel.app';

export function articlesFeed() {
  return {
    app: { id: 'amirot', name: 'אמירות', url: URL, repo: 'Anat1969/Amirot-GH' },
    articles: ARTICLES.map((a) => {
      const idea = 'idea' in a.lead ? a.lead.idea : null;
      // אותה תמונה שבוחר כרטיס הכתבה בדף הכתבות
      const art = idea ? ART[idea]?.a : null;
      const file = idea ? art?.file : 'change-b.jpg';
      return {
        id: a.id,
        url: `${URL}/#/article?a=${a.id}`,
        zone: a.zone,
        kicker: a.kicker,
        title: a.title,
        sub: a.sub,
        image: file ? `${URL}/art/${file}` : null,
        credit: art ? `${art.title} · ${art.artist}, ${art.date}. מוזיאון קליבלנד לאמנות, CC0` : null,
        body: a.body,
        notes: a.notes,
      };
    }),
  };
}

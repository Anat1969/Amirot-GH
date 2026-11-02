// כתבה מוזיאלית: שני חכמים, נהר אחד. נקראת בגלילה, כמו מגזין (החריג המותר לכלל "בגודל המסך").
import { BY_ID, km, fmt } from '../engine';
import { href } from '../route';
import { useState } from 'react';

const H = BY_ID['chg-heraclitus'], C = BY_ID['chg-confucius'], J = BY_ID['chg-chomei'], K = BY_ID['chg-kohelet'], K2 = BY_ID['chg-kohelet2'];

const POST = `לפני כ-2,500 שנה, שני אנשים עמדו ליד שני נהרות.
באפסוס, הרקליטוס: אי אפשר להיכנס פעמיים לאותו נהר.
בסין, קונפוציוס: הכול חולף כמו הנהר הזה, יום ולילה.
ביניהם ${fmt(km(H, C))} קילומטר, ואין שום עדות שידעו זה על זה.
1,700 שנה אחר כך, נזיר ביפן פתח כך ספר: זרם הנהר אינו פוסק, ואין המים אותם המים.
וקהלת, בירושלים, אמר את ההפך: אין כל חדש תחת השמש.
ואז חיבר: דור הולך ודור בא, והארץ לעולם עומדת.
המים מתחלפים, והגדה נשארת.
מה אצלך מים, ומה גדה?`;

export default function Article() {
  const [copied, setCopied] = useState(false);
  return (
    <main className="article-page">
      <article className="feature">
        <header className="ft-head">
          <span className="label">כתבה · הכול זורם, או אין חדש?</span>
          <h1>שני חכמים,<br />נהר אחד</h1>
          <p className="ft-sub">במאה החמישית לפני הספירה, בשני קצוות של העולם הידוע, שני אנשים הביטו במים, ואמרו כמעט את אותו משפט.</p>
        </header>

        <figure className="ft-lead">
          <RiverArt />
          <figcaption className="label">איור בקוד: שלושה נהרות, שלוש עדויות. אפסוס Ephesus, צ'ו-פו Qufu וקיוטו Kyoto. הקווים מובילים מהמוקדם (בהיר) למאוחר (כהה).</figcaption>
        </figure>

        <div className="ft-body">
          <p className="dropcap"><b>הרקליטוס</b> Heraclitus חי ב<b>אפסוס</b> Ephesus, על חוף אסיה הקטנה. מהספר שכתב נשארו רק קטעים, מצוטטים אצל אחרים. אחד מהם הגיע אלינו דרך אפלטון: "אי אפשר להיכנס פעמיים לאותו נהר".<sup>1</sup></p>
          <p>באותה מאה, <bdi className="num">{fmt(km(H, C))}</bdi> קילומטר מזרחה, <b>קונפוציוס</b> עמד על גדת נהר. התלמידים רשמו: "הכול חולף כמו הנהר הזה, ואינו פוסק יום ולילה".<sup>2</sup></p>
          <p>אין שום עדות שאחד מהם שמע על השני. לא הייתה דרך משי, ולא היה תרגום. היה רק נהר.</p>

          <blockquote className="pull">"<span>{J.he}</span>"<cite>קאמו נו צ'ומיי Kamo no Chōmei, <bdi className="num">1212</bdi></cite></blockquote>

          <p><bdi className="num">1,700</bdi> שנה אחר כך, הנזיר <b>קאמו נו צ'ומיי</b> Kamo no Chōmei פתח כך את "רשימות מן הבקתה", ספר על עיר שנשרפה ונבנתה מחדש.<sup>3</sup> אצלו הנהר הוא כבר לא משל: הוא קיוטו עצמה. הבתים מתחלפים, והעיר נשארת.</p>
          <p>ובאמצע הדרך, בירושלים, <b>קהלת</b> אמר את ההפך: "{K.he}".<sup>4</sup> נראה שזו מחלוקת, אבל באותו פרק הוא כותב: "{K2.he}".<sup>5</sup></p>

          <aside className="tone tone-insight ft-insight"><h4>התובנה</h4><p><mark className="insight">המים מתחלפים, והגדה נשארת.</mark> הרקליטוס הסתכל על המים, וקהלת על הגדה. שניהם תיארו את אותו נהר.</p></aside>

          <h2>בעיר: נחל שנשפך לים</h2>
          <p><b>נחל לכיש</b> Lachish Stream מגיע לים ב<b>אשדוד</b> Ashdod. המים שזורמים בו היום אינם המים של אתמול, אבל התוואי שלו קובע איפה עוברים הגשרים, איפה הפארק, ואיפה העיר נעצרת. מתכנן ערים עובד בדיוק על התפר הזה: הוא <strong>מתכנן את הגדה</strong> בשביל מים שעוד לא הגיעו.</p>

          <h2>מה עושים עם זה</h2>
          <p>לפני החלטה, שואלים: מה כאן <strong>מים</strong>, רגע שלא יחזור, ומה כאן <strong>גדה</strong>, דפוס שיחזור? על המים מגיבים מהר. את הגדה בונים לאט.</p>

          <div className="haiku ft-haiku">
            <span className="label">הייקו</span>
            <p className="say">רגל במים קרים</p>
            <p className="say">והנהר כבר אחר</p>
            <p className="say">רק הגדה זוכרת</p>
            <p className="src">ההייקו מאיר את הרגע שבו הרקליטוס וקהלת נפגשים: מי שנכנס למים מרגיש את השינוי, והגדה שומרת את הקבוע.</p>
          </div>

          <div className="ft-post">
            <div className="post-hd"><span className="label">פוסט, מוכן להעתקה</span><button className="press btn" onClick={async () => { try { await navigator.clipboard.writeText(POST); setCopied(true); } catch { setCopied(false); } }}>{copied ? 'הועתק' : 'העתקה'}</button></div>
            <div className="post-text">{POST.split('\n').map((l, i) => <p key={i}>{l}</p>)}</div>
          </div>

          <p className="ft-next"><a className="press btn" href={href('daf', { i: 'change' })}>לדף "הכול זורם, או אין חדש?"</a> <a className="press btn" href={href('mirror', { p: 'chg-heraclitus~chg-confucius' })}>הזוג במראה</a></p>

          <ol className="ft-notes">
            <li>{H.src}.</li>
            <li>{C.src}.</li>
            <li>{J.src}, שורת הפתיחה.</li>
            <li>{K.src}.</li>
            <li>{K2.src}.</li>
          </ol>
          <p className="src">השראה: צורת הדף של דפוס בומברג, ונציה Venezia, <bdi className="num">1523</bdi>. האיור נבנה בקוד, בלי צילום.</p>
        </div>
      </article>
    </main>
  );
}

function RiverArt() {
  // שלושה נהרות כקווים זורמים, מהבהיר (הקדום) לכהה (המאוחר)
  const rivers = [
    { y: 70, c: '#9aa9c2', name: 'אפסוס', en: 'Ephesus', yr: '~500 לפנה״ס' },
    { y: 150, c: '#5b6f95', name: 'צ\'ו-פו', en: 'Qufu', yr: '~500 לפנה״ס' },
    { y: 230, c: '#1f3a68', name: 'קיוטו', en: 'Kyoto', yr: '1212' },
  ];
  return (
    <svg viewBox="0 0 900 300" className="river-art" role="img" aria-label="שלושה נהרות זורמים: אפסוס, צ'ו-פו וקיוטו" style={{ direction: 'ltr' }}>
      <rect width="900" height="300" fill="#fff" />
      {rivers.map((r, i) => (
        <g key={i}>
          {[0, 1, 2, 3].map((k) => (
            <path key={k} className="ink" style={{ ['--len' as string]: 1200, animationDelay: `${i * 0.25 + k * 0.08}s` }}
              d={`M20 ${r.y + k * 7} C 180 ${r.y - 30 + k * 7}, 300 ${r.y + 34 + k * 7}, 460 ${r.y + k * 7} S 720 ${r.y - 28 + k * 7}, 880 ${r.y + k * 7}`}
              fill="none" stroke={r.c} strokeWidth={k === 0 ? 2.2 : 1} opacity={k === 0 ? 1 : 0.5} />
          ))}
          <text x="880" y={r.y - 14} textAnchor="end" className="ra-name" style={{ fill: r.c }}>{r.name}</text>
          <text x="20" y={r.y - 14} textAnchor="start" className="ra-yr" style={{ fill: r.c }}>{r.en} · {r.yr.replace(' לפנה״ס', ' BCE')}</text>
        </g>
      ))}
    </svg>
  );
}

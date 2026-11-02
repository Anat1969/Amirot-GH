// מאגר האמירות. מקור הנתונים היחיד: כל תצוגה באפליקציה נגזרת מכאן ומ-ideas.ts.
// side: a = הצד הראשון של המחלוקת, b = הצד השני, s = אמירה שמחזיקה בשניהם (הכרעה).
// year: שנת העדות הכתובה המוקדמת שהמאגר מכיר. null = פתגם עממי בלי תאריך מתועד, ולא מנחשים.
// motifs: מה שרואים במילים עצמן (דימוי, חפץ, מספר), לא המשמעות. מהן מחושב "דמיון במילים".
export type Side = 'a' | 'b' | 's';
export type Saying = {
  id: string;
  idea: string;
  side: Side;
  he: string; // נוסח עברי: המקור, או תרגום
  orig?: string; // נוסח המקור, כשאינו עברית
  lang?: string; // שפת המקור (BCP 47)
  culture: string;
  src: string; // מקור קצר
  year: number | null;
  approx?: boolean;
  motifs: string[];
  at?: { he: string; en: string; lat: number; lon: number }; // מקום מדויק, כשידוע
  note?: string;
};

const EPHESUS = { he: 'אפסוס', en: 'Ephesus', lat: 37.94, lon: 27.34 };
const LUOYANG = { he: 'לואויאנג', en: 'Luoyang', lat: 34.62, lon: 112.45 };

export const SAYINGS: Saying[] = [
  // ───── חיפזון ─────
  { id: 'haste-ar', idea: 'haste', side: 'a', he: 'החיפזון מן השטן', orig: 'العجلة من الشيطان', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי, מוכר גם כחדית\' באוסף א-תירמד\'י', year: null, motifs: ['שטן'] },
  { id: 'haste-he', idea: 'haste', side: 'a', he: 'החיפזון מהשטן', culture: 'hebrew', src: 'עברית מדוברת, שאולה מן הפתגם הערבי', year: null, motifs: ['שטן'], note: 'אותו פתגם, שעבר מערבית לעברית.' },
  { id: 'haste-cn', idea: 'haste', side: 'a', he: 'הרוצה מהר — אינו מגיע', orig: '欲速則不達', lang: 'zh', culture: 'chinese', src: 'קונפוציוס, השיחות (論語) 13:17', year: -500, approx: true, motifs: ['דרך'] },
  { id: 'haste-jp', idea: 'haste', side: 'a', he: 'אם אתה ממהר, לך בדרך העוקפת', orig: '急がば回れ', lang: 'ja', culture: 'japanese', src: 'פתגם יפני', year: null, motifs: ['דרך'] },
  { id: 'haste-en', idea: 'haste', side: 'a', he: 'חיפזון מוליד בזבוז', orig: 'Haste makes waste', lang: 'en', culture: 'english', src: 'פתגם אנגלי, באוסף של ג\'ון הייווד John Heywood', year: 1546, motifs: [] },
  { id: 'haste-it', idea: 'haste', side: 'a', he: 'ההולך לאט — הולך בטוח והולך רחוק', orig: 'Chi va piano va sano e va lontano', lang: 'it', culture: 'italian', src: 'פתגם איטלקי', year: null, motifs: ['דרך'] },
  { id: 'haste-rome', idea: 'haste', side: 'a', he: 'רומא לא נבנתה ביום אחד', orig: 'Rome ne fu pas faite toute en un jour', lang: 'fr', culture: 'french', src: 'Li Proverbe au Vilain, צרפת', year: 1190, approx: true, motifs: ['עיר', 'רומא'] },
  { id: 'haste-hillel', idea: 'haste', side: 'b', he: 'אם לא עכשיו, אימתי?', culture: 'mishna', src: 'הלל, משנה אבות א, יד', year: -20, approx: true, motifs: ['עכשיו'] },
  { id: 'haste-iron-en', idea: 'haste', side: 'b', he: 'הכה בברזל בעודו חם', orig: 'Strike while the iron is hot', lang: 'en', culture: 'english', src: 'אצל ג\'פרי צ\'וסר Geoffrey Chaucer, סיפור מליבאוס', year: 1386, approx: true, motifs: ['ברזל', 'חום'] },
  { id: 'haste-iron-fr', idea: 'haste', side: 'b', he: 'צריך להכות בברזל כל עוד הוא חם', orig: 'Il faut battre le fer pendant qu\'il est chaud', lang: 'fr', culture: 'french', src: 'פתגם צרפתי', year: null, motifs: ['ברזל', 'חום'] },
  { id: 'haste-carpe', idea: 'haste', side: 'b', he: 'קטוף את היום', orig: 'Carpe diem', lang: 'la', culture: 'latin', src: 'הורטיוס Horace, אודות 1.11', year: -23, motifs: ['יום', 'קטיף'] },
  { id: 'haste-tide', idea: 'haste', side: 'b', he: 'הזמן והגאות אינם מחכים לאיש', orig: 'Time and tide wait for no man', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['מים', 'זמן'] },
  { id: 'haste-festina', idea: 'haste', side: 's', he: 'מהר לאט', orig: 'Festina lente  ·  σπεῦδε βραδέως', lang: 'la', culture: 'latin', src: 'סוטוניוס Suetonius, חיי אוגוסטוס 25: אמרתו של הקיסר', year: 121, approx: true, motifs: ['מהירות'] },

  // ───── יחד או לבד ─────
  { id: 'tog-kohelet', idea: 'together', side: 'a', he: 'טובים השניים מן האחד', culture: 'bible', src: 'קהלת ד, ט', year: -250, approx: true, motifs: ['מספר'] },
  { id: 'tog-thread', idea: 'together', side: 'a', he: 'והחוט המשולש לא במהרה יינתק', culture: 'bible', src: 'קהלת ד, יב', year: -250, approx: true, motifs: ['חוט', 'מספר'] },
  { id: 'tog-spider', idea: 'together', side: 'a', he: 'כשקורי עכביש מתאחדים, הם קושרים אריה', orig: 'ድር ቢያብር አንበሳ ያስር', lang: 'am', culture: 'amharic', src: 'פתגם אתיופי', year: null, motifs: ['חוט', 'חיה'] },
  { id: 'tog-hands', idea: 'together', side: 'a', he: 'ידיים רבות מקלות את העבודה', orig: 'Many hands make light work', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['יד'] },
  { id: 'tog-ar', idea: 'together', side: 'a', he: 'יד אחת לא מוחאת כף', orig: 'يد واحدة لا تصفق', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['יד', 'מספר'] },
  { id: 'tog-jp', idea: 'together', side: 'a', he: 'שלושה שמתכנסים — חוכמת מונג\'ו', orig: '三人寄れば文殊の知恵', lang: 'ja', culture: 'japanese', src: 'פתגם יפני; מונג\'ו הוא הבודהיסטווה של החוכמה', year: null, motifs: ['שלושה', 'מספר'] },
  { id: 'tog-cn-cobblers', idea: 'together', side: 'a', he: 'שלושה סנדלרים פשוטים — שווים לג\'וגה ליאנג אחד', orig: '三個臭皮匠，頂個諸葛亮', lang: 'zh', culture: 'chinese', src: 'פתגם סיני; ג\'וגה ליאנג הוא סמל החוכמה בסין', year: null, motifs: ['שלושה', 'מספר'] },
  { id: 'tog-cooks', idea: 'together', side: 'b', he: 'יותר מדי טבחים מקלקלים את המרק', orig: 'Too many cooks spoil the broth', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['טבח'] },
  { id: 'tog-cooks-ar', idea: 'together', side: 'b', he: 'ריבוי טבחים מקלקל את התבשיל', orig: 'كثرة الطباخين تفسد الطبخة', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['טבח'] },
  { id: 'tog-ru', idea: 'together', side: 'b', he: 'אצל שבע אומנות — הילד בלי עין', orig: 'У семи нянек дитя без глазу', lang: 'ru', culture: 'russian', src: 'פתגם רוסי', year: null, motifs: ['מספר', 'עין'] },
  { id: 'tog-monks', idea: 'together', side: 'b', he: 'שלושה נזירים — ואין מים לשתות', orig: '三個和尚沒水喝', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['שלושה', 'מספר', 'מים'] },
  { id: 'tog-tr', idea: 'together', side: 'b', he: 'בספינה אחת אין שני קברניטים', orig: 'Bir gemide iki kaptan olmaz', lang: 'tr', culture: 'turkish', src: 'פתגם טורקי', year: null, motifs: ['ספינה', 'מספר'] },

  // ───── דומה או שונה ─────
  { id: 'like-zarzir', idea: 'like', side: 'a', he: 'לא לחינם הלך זרזיר אצל עורב, אלא מפני שהוא מינו', culture: 'bavli', src: 'בבא קמא צב ע"ב', year: 500, approx: true, motifs: ['ציפור'] },
  { id: 'like-feather', idea: 'like', side: 'a', he: 'ציפורים בעלות נוצה אחת — עפות יחד', orig: 'Birds of a feather flock together', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['ציפור'] },
  { id: 'like-homer', idea: 'like', side: 'a', he: 'תמיד האל מוביל את הדומה אל הדומה', orig: 'ὡς αἰεὶ τὸν ὁμοῖον ἄγει θεὸς ὡς τὸν ὁμοῖον', lang: 'grc', culture: 'greek', src: 'הומרוס Homer, אודיסאה 17, 218', year: -700, approx: true, motifs: ['אל'] },
  { id: 'like-cn', idea: 'like', side: 'a', he: 'דברים מתקבצים לפי סוגם, ואנשים לפי חבורתם', orig: '物以類聚，人以群分', lang: 'zh', culture: 'chinese', src: 'פתגם סיני, על פי ספר התמורות (易經)', year: null, motifs: [] },
  { id: 'like-la', idea: 'like', side: 'a', he: 'הדומה שמח בדומה', orig: 'Similis simili gaudet', lang: 'la', culture: 'latin', src: 'פתגם לטיני', year: null, motifs: [] },
  { id: 'like-es', idea: 'like', side: 'a', he: 'אמור לי עם מי אתה הולך, ואומר לך מי אתה', orig: 'Dime con quién andas y te diré quién eres', lang: 'es', culture: 'spanish', src: 'פתגם ספרדי; מצוטט בדון קישוט, חלק ב\'', year: 1615, motifs: ['דרך'] },
  { id: 'like-opp', idea: 'like', side: 'b', he: 'הפכים נמשכים', orig: 'Opposites attract', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: [] },
  { id: 'like-ezer', idea: 'like', side: 'b', he: 'אעשה לו עזר כנגדו', culture: 'bible', src: 'בראשית ב, יח', year: -600, approx: true, motifs: [] },
  { id: 'like-heraclitus', idea: 'like', side: 'b', he: 'המנוגד מועיל, ומן השונים — ההרמוניה היפה ביותר', orig: 'τὸ ἀντίξουν συμφέρον', lang: 'grc', culture: 'greek', src: 'הרקליטוס Heraclitus, קטע B8, מובא באתיקה הניקומכית של אריסטו', year: -500, approx: true, motifs: ['הרמוניה'], at: EPHESUS },
  { id: 'like-yinyang', idea: 'like', side: 'b', he: 'יין לבדו אינו מוליד, יאנג לבדו אינו מצמיח', orig: '孤陰不生，獨陽不長', lang: 'zh', culture: 'chinese', src: 'אמרה סינית ממסורת היין והיאנג', year: null, motifs: ['צמיחה'] },

  // ───── שתיקה ודיבור ─────
  { id: 'sil-akiva', idea: 'silence', side: 'a', he: 'סייג לחכמה — שתיקה', culture: 'mishna', src: 'רבי עקיבא, משנה אבות ג, יג', year: 120, approx: true, motifs: ['שתיקה', 'גדר'] },
  { id: 'sil-sela', idea: 'silence', side: 'a', he: 'מילה — בסלע, שתיקה — בשניים', orig: 'מילה בסלע, משתוקא בתרין', lang: 'arc', culture: 'bavli', src: 'מגילה יח ע"א', year: 500, approx: true, motifs: ['שתיקה', 'כסף'] },
  { id: 'sil-carlyle', idea: 'silence', side: 'a', he: 'הדיבור — כסף, השתיקה — זהב', orig: 'Speech is silvern, Silence is golden', lang: 'en', culture: 'english', src: 'תומס קרלייל Thomas Carlyle, Sartor Resartus', year: 1836, motifs: ['שתיקה', 'כסף'] },
  { id: 'sil-laozi', idea: 'silence', side: 'a', he: 'היודע אינו מדבר, המדבר אינו יודע', orig: '知者不言，言者不知', lang: 'zh', culture: 'chinese', src: 'לאו-דזה, דאו דה ג\'ינג 56', year: -400, approx: true, motifs: ['שתיקה'], at: LUOYANG },
  { id: 'sil-jp-flower', idea: 'silence', side: 'a', he: 'מה שלא נאמר — הוא הפרח', orig: '言わぬが花', lang: 'ja', culture: 'japanese', src: 'פתגם יפני', year: null, motifs: ['שתיקה', 'פרח'] },
  { id: 'sil-jp-nail', idea: 'silence', side: 'a', he: 'היתד הבולטת חוטפת מכה', orig: '出る杭は打たれる', lang: 'ja', culture: 'japanese', src: 'פתגם יפני', year: null, motifs: ['יתד', 'מכה'] },
  { id: 'sil-wheel', idea: 'silence', side: 'b', he: 'הגלגל החורק מקבל את השמן', orig: 'The squeaky wheel gets the grease', lang: 'en', culture: 'american', src: 'פתגם אמריקני', year: null, motifs: ['גלגל', 'קול'] },
  { id: 'sil-cn-cry', idea: 'silence', side: 'b', he: 'התינוק שיודע לבכות — מקבל חלב', orig: '會哭的孩子有奶吃', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['קול', 'חלב'] },
  { id: 'sil-hillel', idea: 'silence', side: 'b', he: 'לא הביישן למד', culture: 'mishna', src: 'הלל, משנה אבות ב, ה', year: -20, approx: true, motifs: [] },
  { id: 'sil-ar', idea: 'silence', side: 'b', he: 'השותק מול האמת — שטן אילם', orig: 'الساكت عن الحق شيطان أخرس', lang: 'ar', culture: 'arabic', src: 'אמרה ערבית', year: null, motifs: ['שתיקה', 'שטן'] },
  { id: 'sil-consent', idea: 'silence', side: 'b', he: 'שתיקה כהודאה דמיא', culture: 'bavli', src: 'יבמות פז ע"ב', year: 500, approx: true, motifs: ['שתיקה'], note: 'שתיקה אינה מגינה: היא נחשבת הסכמה.' },
  { id: 'sil-tacet', idea: 'silence', side: 'b', he: 'מי ששותק — נראה כמסכים', orig: 'Qui tacet consentire videtur', lang: 'la', culture: 'latin', src: 'בוניפאקיוס השמיני, Liber Sextus, כלל 43', year: 1298, motifs: ['שתיקה'] },
  { id: 'sil-kohelet', idea: 'silence', side: 's', he: 'עת לחשות ועת לדבר', culture: 'bible', src: 'קהלת ג, ז', year: -250, approx: true, motifs: ['שתיקה', 'זמן'] },

  // ───── חזות ─────
  { id: 'look-kankan', idea: 'looks', side: 'a', he: 'אל תסתכל בקנקן, אלא במה שיש בו', culture: 'mishna', src: 'רבי מאיר, משנה אבות ד, כ', year: 150, approx: true, motifs: ['כלי', 'מבט'] },
  { id: 'look-samuel', idea: 'looks', side: 'a', he: 'האדם יראה לעיניים, וה\' יראה ללבב', culture: 'bible', src: 'שמואל א טז, ז', year: -600, approx: true, motifs: ['עין', 'לב', 'מבט'] },
  { id: 'look-book', idea: 'looks', side: 'a', he: 'אל תשפוט ספר לפי הכריכה', orig: 'Don\'t judge a book by its cover', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['ספר', 'מבט'] },
  { id: 'look-juvenal', idea: 'looks', side: 'a', he: 'אין אמון בחזות', orig: 'Fronti nulla fides', lang: 'la', culture: 'latin', src: 'יובנאליס Juvenal, סאטירות 2, 8', year: 110, approx: true, motifs: ['פנים'] },
  { id: 'look-gold', idea: 'looks', side: 'a', he: 'לא כל הנוצץ זהב', orig: 'All that glisters is not gold', lang: 'en', culture: 'english', src: 'שייקספיר Shakespeare, הסוחר מוונציה', year: 1596, motifs: ['זהב', 'ברק'] },
  { id: 'look-gold-ar', idea: 'looks', side: 'a', he: 'לא כל מה שמבריק — זהב', orig: 'ليس كل ما يلمع ذهبا', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['זהב', 'ברק'] },
  { id: 'look-keller', idea: 'looks', side: 'b', he: 'בגדים עושים אנשים', orig: 'Kleider machen Leute', lang: 'de', culture: 'german', src: 'פתגם גרמני; שם הנובלה של גוטפריד קלר Gottfried Keller', year: 1874, motifs: ['בגד'] },
  { id: 'look-erasmus', idea: 'looks', side: 'b', he: 'הבגד עושה את האיש', orig: 'Vestis virum facit', lang: 'la', culture: 'latin', src: 'ארסמוס Erasmus, אדגיה', year: 1508, approx: true, motifs: ['בגד'] },
  { id: 'look-yochanan', idea: 'looks', side: 'b', he: 'רבי יוחנן קרא לבגדיו "מכבדותיי"', orig: 'רבי יוחנן קרי למאניה מכבדותי', lang: 'arc', culture: 'bavli', src: 'שבת קיג ע"א', year: 500, approx: true, motifs: ['בגד', 'כבוד'] },
  { id: 'look-jp', idea: 'looks', side: 'b', he: 'גם עגלון הסוסים — בבגדים נאים', orig: '馬子にも衣装', lang: 'ja', culture: 'japanese', src: 'פתגם יפני', year: null, motifs: ['בגד', 'סוס'] },
  { id: 'look-ru', idea: 'looks', side: 's', he: 'מקבלים לפי הבגד, מלווים לפי השכל', orig: 'По одёжке встречают, по уму провожают', lang: 'ru', culture: 'russian', src: 'פתגם רוסי', year: null, motifs: ['בגד'] },

  // ───── מרחק ─────
  { id: 'far-he', idea: 'distance', side: 'a', he: 'רחוק מהעין, רחוק מהלב', culture: 'hebrew', src: 'פתגם עברי', year: null, motifs: ['עין', 'לב'] },
  { id: 'far-kempis', idea: 'distance', side: 'a', he: 'מה שנעלם מהעין — נעלם מהר גם מהלב', orig: 'Cum autem sublatus fuerit ab oculis, etiam cito transit a mente', lang: 'la', culture: 'latin', src: 'תומאס א קמפיס Thomas à Kempis, חיקוי ישו 1, 23', year: 1420, approx: true, motifs: ['עין', 'לב'], at: { he: 'צווֹלֶה', en: 'Zwolle', lat: 52.52, lon: 6.09 } },
  { id: 'far-en', idea: 'distance', side: 'a', he: 'מחוץ לטווח הראייה — מחוץ למחשבה', orig: 'Out of sight, out of mind', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['עין'] },
  { id: 'far-fr', idea: 'distance', side: 'a', he: 'רחוק מהעיניים, רחוק מהלב', orig: 'Loin des yeux, loin du cœur', lang: 'fr', culture: 'french', src: 'פתגם צרפתי', year: null, motifs: ['עין', 'לב'] },
  { id: 'far-ar', idea: 'distance', side: 'a', he: 'הרחוק מהעין — רחוק מהלב', orig: 'البعيد عن العين بعيد عن القلب', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['עין', 'לב'] },
  { id: 'far-jp', idea: 'distance', side: 'a', he: 'מי שעזב — מתרחק מיום ליום', orig: '去る者は日々に疎し', lang: 'ja', culture: 'japanese', src: 'פתגם יפני, על פי שיר סיני עתיק', year: null, motifs: ['יום'] },
  { id: 'far-bayly', idea: 'distance', side: 'b', he: 'ההיעדרות מגבירה את אהבת הלב', orig: 'Absence makes the heart grow fonder', lang: 'en', culture: 'english', src: 'תומס היינס ביילי Thomas Haynes Bayly, Isle of Beauty', year: 1844, motifs: ['לב'] },
  { id: 'far-rochefoucauld', idea: 'distance', side: 's', he: 'הריחוק מקטין תשוקות בינוניות ומגדיל גדולות, כמו שהרוח מכבה נרות ומבעירה אש', orig: 'L\'absence diminue les médiocres passions, et augmente les grandes, comme le vent éteint les bougies et allume le feu', lang: 'fr', culture: 'french', src: 'לה רושפוקו La Rochefoucauld, מכתמים 276', year: 1665, motifs: ['רוח', 'אש'] },

  // ───── כסף ─────
  { id: 'money-kohelet', idea: 'money', side: 'a', he: 'והכסף יענה את הכול', culture: 'bible', src: 'קהלת י, יט', year: -250, approx: true, motifs: ['כסף'] },
  { id: 'money-cn', idea: 'money', side: 'a', he: 'בכסף אפשר להעביד גם שד בריחיים', orig: '有錢能使鬼推磨', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['כסף', 'שטן'] },
  { id: 'money-talks', idea: 'money', side: 'a', he: 'הכסף מדבר', orig: 'Money talks', lang: 'en', culture: 'american', src: 'ביטוי אמריקני', year: null, motifs: ['כסף', 'קול'] },
  { id: 'money-ar', idea: 'money', side: 'a', he: 'המטבעות — הן המשחות', orig: 'الدراهم مراهم', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי: הכסף מרפא כל פצע', year: null, motifs: ['כסף', 'רפואה'] },
  { id: 'money-kohelet2', idea: 'money', side: 'b', he: 'אוהב כסף לא ישבע כסף', culture: 'bible', src: 'קהלת ה, ט', year: -250, approx: true, motifs: ['כסף', 'שובע'], note: 'אותו ספר, קהלת, אומר גם "והכסף יענה את הכול".' },
  { id: 'money-benzoma', idea: 'money', side: 'b', he: 'איזהו עשיר? השמח בחלקו', culture: 'mishna', src: 'בן זומא, משנה אבות ד, א', year: 100, approx: true, motifs: ['עושר'] },
  { id: 'money-laozi', idea: 'money', side: 'b', he: 'היודע די — עשיר', orig: '知足者富', lang: 'zh', culture: 'chinese', src: 'לאו-דזה, דאו דה ג\'ינג 33', year: -400, approx: true, motifs: ['עושר'], at: LUOYANG },
  { id: 'money-tim', idea: 'money', side: 'b', he: 'שורש כל הרעות — אהבת הכסף', orig: 'Radix omnium malorum est cupiditas', lang: 'la', culture: 'nt', src: 'האיגרת הראשונה אל טימותיוס ו, י', year: 100, approx: true, motifs: ['כסף', 'שורש'] },
  { id: 'money-happy', idea: 'money', side: 'b', he: 'כסף לא קונה אושר', orig: 'Money can\'t buy happiness', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['כסף'] },
  { id: 'money-yi', idea: 'money', side: 'b', he: 'לתכריכים אין כיסים', orig: 'תכריכים האָבן ניט קיין קעשענעס', lang: 'yi', culture: 'yiddish', src: 'פתגם ביידיש', year: null, motifs: ['בגד', 'כיס'] },

  // ───── גורל ובחירה ─────
  { id: 'fate-ar', idea: 'fate', side: 'a', he: 'מה שנכתב — אין ממנו מנוס', orig: 'المكتوب ما منه مهروب', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['כתב'] },
  { id: 'fate-prov', idea: 'fate', side: 'a', he: 'רבות מחשבות בלב איש, ועצת ה\' היא תקום', culture: 'bible', src: 'משלי יט, כא', year: -600, approx: true, motifs: ['מחשבה', 'אל'] },
  { id: 'fate-kempis', idea: 'fate', side: 'a', he: 'האדם מתכנן, והאל מכריע', orig: 'Homo proponit, sed Deus disponit', lang: 'la', culture: 'latin', src: 'תומאס א קמפיס Thomas à Kempis, חיקוי ישו 1, 19', year: 1420, approx: true, motifs: ['מחשבה', 'אל'], at: { he: 'צווֹלֶה', en: 'Zwolle', lat: 52.52, lon: 6.09 } },
  { id: 'fate-yi', idea: 'fate', side: 'a', he: 'האדם חושב, ואלוהים צוחק', orig: 'דער מענטש טראַכט און גאָט לאַכט', lang: 'yi', culture: 'yiddish', src: 'פתגם ביידיש', year: null, motifs: ['מחשבה', 'אל'] },
  { id: 'fate-cn', idea: 'fate', side: 'a', he: 'התכנון — בידי האדם, ההצלחה — בידי השמיים', orig: '謀事在人，成事在天', lang: 'zh', culture: 'chinese', src: 'רומן שלוש הממלכות (三國演義)', year: 1380, approx: true, motifs: ['מחשבה', 'שמיים'] },
  { id: 'fate-horse', idea: 'fate', side: 'a', he: 'הזקן מן הגבול איבד סוס — מי יודע אם זה רע', orig: '塞翁失馬，焉知非福', lang: 'zh', culture: 'chinese', src: 'על פי הסיפור בהוואינאנדזי (淮南子)', year: -139, motifs: ['סוס'] },
  { id: 'fate-hillel', idea: 'fate', side: 'b', he: 'אם אין אני לי — מי לי?', culture: 'mishna', src: 'הלל, משנה אבות א, יד', year: -20, approx: true, motifs: [] },
  { id: 'fate-franklin', idea: 'fate', side: 'b', he: 'האל עוזר למי שעוזר לעצמו', orig: 'God helps them that help themselves', lang: 'en', culture: 'american', src: 'בנג\'מין פרנקלין Benjamin Franklin, אלמנך ריצ\'רד המסכן', year: 1736, motifs: ['אל', 'עזרה'] },
  { id: 'fate-terence', idea: 'fate', side: 'b', he: 'המזל עוזר לאמיצים', orig: 'Fortes fortuna adiuvat', lang: 'la', culture: 'latin', src: 'טרנטיוס Terence, פורמיו 203', year: -161, motifs: ['מזל', 'עזרה'] },
  { id: 'fate-camel', idea: 'fate', side: 's', he: 'קשור את הגמל — ואז סמוך על האל', orig: 'اعقلها وتوكل', lang: 'ar', culture: 'islam', src: 'חדית\', באוסף א-תירמד\'י', year: 870, approx: true, motifs: ['גמל', 'אל'] },
  { id: 'fate-akiva', idea: 'fate', side: 's', he: 'הכול צפוי, והרשות נתונה', culture: 'mishna', src: 'רבי עקיבא, משנה אבות ג, טו', year: 120, approx: true, motifs: [] },

  // ───── מילים ומעשים ─────
  { id: 'deed-shammai', idea: 'deeds', side: 'a', he: 'אמור מעט, ועשה הרבה', culture: 'mishna', src: 'שמאי, משנה אבות א, טו', year: -20, approx: true, motifs: ['דיבור'] },
  { id: 'deed-shimon', idea: 'deeds', side: 'a', he: 'לא המדרש הוא העיקר, אלא המעשה', culture: 'mishna', src: 'שמעון בן גמליאל, משנה אבות א, יז', year: 50, approx: true, motifs: [] },
  { id: 'deed-en', idea: 'deeds', side: 'a', he: 'מעשים מדברים חזק יותר ממילים', orig: 'Actions speak louder than words', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['קול', 'דיבור'] },
  { id: 'deed-cn', idea: 'deeds', side: 'a', he: 'שמע את דבריו, והתבונן במעשיו', orig: '聽其言而觀其行', lang: 'zh', culture: 'chinese', src: 'קונפוציוס, השיחות (論語) 5:10', year: -500, approx: true, motifs: ['דיבור', 'מבט'] },
  { id: 'deed-ru', idea: 'deeds', side: 'a', he: 'שופטים לא לפי המילים, אלא לפי המעשים', orig: 'Не по словам судят, а по делам', lang: 'ru', culture: 'russian', src: 'פתגם רוסי', year: null, motifs: ['דיבור'] },
  { id: 'deed-goethe', idea: 'deeds', side: 'a', he: 'בראשית היה המעשה', orig: 'Im Anfang war die Tat', lang: 'de', culture: 'german', src: 'גתה Goethe, פאוסט א', year: 1808, motifs: ['בראשית'], at: { he: 'ויימאר', en: 'Weimar', lat: 50.98, lon: 11.33 }, note: 'גתה כותב מחדש את פתיחת הבשורה על פי יוחנן.' },
  { id: 'deed-prov', idea: 'deeds', side: 'b', he: 'מוות וחיים ביד לשון', culture: 'bible', src: 'משלי יח, כא', year: -600, approx: true, motifs: ['לשון', 'יד'] },
  { id: 'deed-pen', idea: 'deeds', side: 'b', he: 'העט חזק מן החרב', orig: 'The pen is mightier than the sword', lang: 'en', culture: 'english', src: 'אדוארד בולוור-ליטון Edward Bulwer-Lytton, רישליה', year: 1839, motifs: ['עט', 'חרב'] },
  { id: 'deed-ar', idea: 'deeds', side: 'b', he: 'לא אחת אמרה מילה לאומרהּ: עזוב אותי', orig: 'رب كلمة قالت لصاحبها دعني', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['דיבור'] },
  { id: 'deed-john', idea: 'deeds', side: 'b', he: 'בראשית היה הדבר', orig: 'Ἐν ἀρχῇ ἦν ὁ λόγος', lang: 'grc', culture: 'nt', src: 'הבשורה על פי יוחנן א, א', year: 100, approx: true, motifs: ['בראשית', 'דיבור'] },

  // ───── שכנים ─────
  { id: 'nb-prov', idea: 'neighbors', side: 'a', he: 'טוב שכן קרוב מאח רחוק', culture: 'bible', src: 'משלי כז, י', year: -600, approx: true, motifs: ['שכן', 'קרוב'] },
  { id: 'nb-cn', idea: 'neighbors', side: 'a', he: 'קרוב משפחה רחוק — אינו כשכן קרוב', orig: '遠親不如近鄰', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['שכן', 'קרוב'] },
  { id: 'nb-jp', idea: 'neighbors', side: 'a', he: 'זר קרוב — טוב מקרוב משפחה רחוק', orig: '遠くの親類より近くの他人', lang: 'ja', culture: 'japanese', src: 'פתגם יפני', year: null, motifs: ['שכן', 'קרוב'] },
  { id: 'nb-ar', idea: 'neighbors', side: 'a', he: 'השכן — לפני הבית', orig: 'الجار قبل الدار', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי: בחר שכן לפני שתבחר בית', year: null, motifs: ['שכן', 'בית'] },
  { id: 'nb-fence', idea: 'neighbors', side: 'b', he: 'גדרות טובות עושות שכנים טובים', orig: 'Good fences make good neighbors', lang: 'en', culture: 'american', src: 'פתגם; מצוטט אצל רוברט פרוסט Robert Frost, Mending Wall', year: 1914, motifs: ['גדר', 'שכן'] },
  { id: 'nb-sight', idea: 'neighbors', side: 'b', he: 'היזק ראייה — שמיה היזק', culture: 'bavli', src: 'בבא בתרא ב ע"ב: לכן שותפים בחצר בונים כותל', year: 500, approx: true, motifs: ['גדר', 'מבט'] },
  { id: 'nb-prov2', idea: 'neighbors', side: 'b', he: 'הֹקַר רגלך מבית רעך, פן ישבעך ושנאך', culture: 'bible', src: 'משלי כה, יז', year: -600, approx: true, motifs: ['בית', 'רגל'], note: 'אותו ספר, משלי, אומר גם "טוב שכן קרוב".' },
  { id: 'nb-herbert', idea: 'neighbors', side: 's', he: 'אהוב את שכנך, אבל אל תעקור את הגדר', orig: 'Love your neighbour, yet pull not down your hedge', lang: 'en', culture: 'english', src: 'ג\'ורג\' הרברט George Herbert, Outlandish Proverbs', year: 1640, motifs: ['גדר', 'שכן'] },

  // ───── סיכון ─────
  { id: 'risk-en', idea: 'risk', side: 'a', he: 'טובה ציפור אחת ביד משתיים בשיח', orig: 'A bird in the hand is worth two in the bush', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['ציפור', 'יד'], note: 'מחיר הוודאות: 2 ציפורים.' },
  { id: 'risk-he', idea: 'risk', side: 'a', he: 'טובה ציפור אחת ביד משתיים על העץ', culture: 'hebrew', src: 'פתגם עברי', year: null, motifs: ['ציפור', 'יד'], note: 'מחיר הוודאות: 2 ציפורים.' },
  { id: 'risk-es', idea: 'risk', side: 'a', he: 'עדיפה ציפור ביד ממאה מעופפות', orig: 'Más vale pájaro en mano que ciento volando', lang: 'es', culture: 'spanish', src: 'פתגם ספרדי', year: null, motifs: ['ציפור', 'יד'], note: 'מחיר הוודאות: 100 ציפורים.' },
  { id: 'risk-ar', idea: 'risk', side: 'a', he: 'דרור אחד ביד — טוב מעשרה על העץ', orig: 'عصفور في اليد خير من عشرة على الشجرة', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['ציפור', 'יד'], note: 'מחיר הוודאות: 10 ציפורים.' },
  { id: 'risk-de', idea: 'risk', side: 'a', he: 'עדיף דרור ביד מיונה על הגג', orig: 'Lieber den Spatz in der Hand als die Taube auf dem Dach', lang: 'de', culture: 'german', src: 'פתגם גרמני', year: null, motifs: ['ציפור', 'יד', 'בית'], note: 'מחיר הוודאות: ציפור גדולה יותר, לא יותר ציפורים.' },
  { id: 'risk-ru', idea: 'risk', side: 'a', he: 'עדיף ירגזי ביד מעגור בשמיים', orig: 'Лучше синица в руках, чем журавль в небе', lang: 'ru', culture: 'russian', src: 'פתגם רוסי', year: null, motifs: ['ציפור', 'יד', 'שמיים'], note: 'מחיר הוודאות: עגור, ציפור החלומות.' },
  { id: 'risk-safe', idea: 'risk', side: 'a', he: 'עדיף בטוח מאשר מצטער', orig: 'Better safe than sorry', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: [] },
  { id: 'risk-venture', idea: 'risk', side: 'b', he: 'מי שלא מעז — לא מרוויח', orig: 'Nothing ventured, nothing gained', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: [] },
  { id: 'risk-virgil', idea: 'risk', side: 'b', he: 'המזל עוזר לנועזים', orig: 'Audentes fortuna iuvat', lang: 'la', culture: 'latin', src: 'ורגיליוס Virgil, אנאידה 10, 284', year: -19, motifs: ['מזל', 'עזרה'] },
  { id: 'risk-tiger', idea: 'risk', side: 'b', he: 'מי שלא נכנס למאורת הנמר — לא ישיג את הגור', orig: '不入虎穴，焉得虎子', lang: 'zh', culture: 'chinese', src: 'באן צ\'או, ספר האן המאוחרת (後漢書)', year: 73, approx: true, motifs: ['נמר', 'מאורה'] },
  { id: 'risk-tiger-jp', idea: 'risk', side: 'b', he: 'בלי להיכנס למאורת הנמר — אין גור נמר', orig: '虎穴に入らずんば虎子を得ず', lang: 'ja', culture: 'japanese', src: 'פתגם יפני, שאול מן הסינית', year: null, motifs: ['נמר', 'מאורה'] },

  // ───── טיפה ─────
  { id: 'drop-ovid', idea: 'drop', side: 'a', he: 'הטיפה חוצבת את האבן', orig: 'Gutta cavat lapidem', lang: 'la', culture: 'latin', src: 'אובידיוס Ovid, מכתבים מן הים השחור 4, 10, 5', year: 13, approx: true, motifs: ['טיפה', 'מים', 'אבן'], at: { he: 'טומיס', en: 'Tomis', lat: 44.17, lon: 28.65 } },
  { id: 'drop-job', idea: 'drop', side: 'a', he: 'אבנים שחקו מים', culture: 'bible', src: 'איוב יד, יט', year: -500, approx: true, motifs: ['מים', 'אבן'] },
  { id: 'drop-akiva', idea: 'drop', side: 'a', he: 'מה רך פסל את הקשה — דברי תורה יחקקו את ליבי', culture: 'mishna', src: 'אבות דרבי נתן ו: רבי עקיבא רואה אבן שנחקקה במים', year: 90, approx: true, motifs: ['מים', 'אבן'] },
  { id: 'drop-laozi', idea: 'drop', side: 'a', he: 'מסע של אלף לי מתחיל בצעד שמתחת לרגליים', orig: '千里之行，始於足下', lang: 'zh', culture: 'chinese', src: 'לאו-דזה, דאו דה ג\'ינג 64', year: -400, approx: true, motifs: ['דרך', 'רגל'], at: LUOYANG },
  { id: 'drop-sw', idea: 'drop', side: 'a', he: 'מעט ועוד מעט ממלאים את הכד', orig: 'Haba na haba hujaza kibaba', lang: 'sw', culture: 'swahili', src: 'פתגם סווהילי', year: null, motifs: ['כלי'] },
  { id: 'drop-fa', idea: 'drop', side: 'a', he: 'טיפה ועוד טיפה מתקבצות — ונעשות ים', orig: 'قطره قطره جمع گردد، وانگهی دریا شود', lang: 'fa', culture: 'persian', src: 'פתגם פרסי', year: null, motifs: ['טיפה', 'מים', 'ים'] },
  { id: 'drop-franklin', idea: 'drop', side: 'a', he: 'מכות קטנות מפילות אלונים גדולים', orig: 'Little strokes fell great oaks', lang: 'en', culture: 'american', src: 'בנג\'מין פרנקלין Benjamin Franklin, אלמנך ריצ\'רד המסכן', year: 1750, motifs: ['עץ', 'מכה'] },
  { id: 'drop-isaiah', idea: 'drop', side: 'b', he: 'הן גויים כמר מדלי', culture: 'bible', src: 'ישעיהו מ, טו: כטיפה מן הדלי', year: -540, approx: true, motifs: ['טיפה', 'מים', 'דלי'] },
  { id: 'drop-bucket', idea: 'drop', side: 'b', he: 'טיפה בדלי', orig: 'A drop in the bucket', lang: 'en', culture: 'english', src: 'ניב אנגלי, מתרגום ישעיהו מ, טו', year: 1611, motifs: ['טיפה', 'מים', 'דלי'], note: 'הניב האנגלי נולד מתרגום הפסוק בישעיהו.' },
  { id: 'drop-sea', idea: 'drop', side: 'b', he: 'טיפה בים', culture: 'hebrew', src: 'ניב עברי', year: null, motifs: ['טיפה', 'מים', 'ים'] },

  // ───── ידיעה ─────
  { id: 'know-bacon', idea: 'knowledge', side: 'a', he: 'הידיעה עצמה היא כוח', orig: 'Ipsa scientia potestas est', lang: 'la', culture: 'english', src: 'פרנסיס בייקון Francis Bacon, Meditationes Sacrae', year: 1597, motifs: ['כוח'] },
  { id: 'know-hillel', idea: 'knowledge', side: 'a', he: 'אין בור ירא חטא', culture: 'mishna', src: 'הלל, משנה אבות ב, ה', year: -20, approx: true, motifs: [] },
  { id: 'know-cn', idea: 'knowledge', side: 'a', he: 'לדעת מה אתה יודע, ולדעת מה אינך יודע — זו ידיעה', orig: '知之為知之，不知為不知，是知也', lang: 'zh', culture: 'chinese', src: 'קונפוציוס, השיחות (論語) 2:17', year: -500, approx: true, motifs: [] },
  { id: 'know-ar', idea: 'knowledge', side: 'a', he: 'הידע — אור, והבורות — חושך', orig: 'العلم نور والجهل ظلام', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['אור'] },
  { id: 'know-cn2', idea: 'knowledge', side: 'a', he: 'חי עד זקנה — לומד עד זקנה', orig: '活到老，學到老', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['זקנה'] },
  { id: 'know-kohelet', idea: 'knowledge', side: 'b', he: 'ויוסיף דעת — יוסיף מכאוב', culture: 'bible', src: 'קהלת א, יח', year: -250, approx: true, motifs: ['כאב'] },
  { id: 'know-gray', idea: 'knowledge', side: 'b', he: 'כשהבורות היא אושר — טיפשות להחכים', orig: 'Where ignorance is bliss, \'tis folly to be wise', lang: 'en', culture: 'english', src: 'תומס גריי Thomas Gray, אודה על מבט רחוק אל קולג\' איטון', year: 1742, motifs: [] },
  { id: 'know-es', idea: 'knowledge', side: 'b', he: 'עיניים שלא רואות — לב שלא מרגיש', orig: 'Ojos que no ven, corazón que no siente', lang: 'es', culture: 'spanish', src: 'פתגם ספרדי', year: null, motifs: ['עין', 'לב'] },
  { id: 'know-en', idea: 'knowledge', side: 'b', he: 'מה שאינך יודע — לא יכאב לך', orig: 'What you don\'t know can\'t hurt you', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['כאב'] },

  // ───── שינוי ─────
  { id: 'chg-kohelet', idea: 'change', side: 'a', he: 'מה שהיה הוא שיהיה, ואין כל חדש תחת השמש', culture: 'bible', src: 'קהלת א, ט', year: -250, approx: true, motifs: ['שמש'] },
  { id: 'chg-karr', idea: 'change', side: 'a', he: 'ככל שזה משתנה — כך זה נשאר אותו דבר', orig: 'Plus ça change, plus c\'est la même chose', lang: 'fr', culture: 'french', src: 'אלפונס קאר Alphonse Karr, Les Guêpes', year: 1849, motifs: [] },
  { id: 'chg-ar', idea: 'change', side: 'a', he: 'ההיסטוריה חוזרת על עצמה', orig: 'التاريخ يعيد نفسه', lang: 'ar', culture: 'arabic', src: 'אמרה ערבית', year: null, motifs: [] },
  { id: 'chg-heraclitus', idea: 'change', side: 'b', he: 'אי אפשר להיכנס פעמיים לאותו נהר', orig: 'δὶς ἐς τὸν αὐτὸν ποταμὸν οὐκ ἂν ἐμβαίης', lang: 'grc', culture: 'greek', src: 'הרקליטוס Heraclitus, מובא אצל אפלטון, קרטילוס 402a', year: -500, approx: true, motifs: ['נהר', 'מים'], at: EPHESUS },
  { id: 'chg-confucius', idea: 'change', side: 'b', he: 'הכול חולף כמו הנהר הזה, ואינו פוסק יום ולילה', orig: '逝者如斯夫，不舍晝夜', lang: 'zh', culture: 'chinese', src: 'קונפוציוס, השיחות (論語) 9:17, על גדת הנהר', year: -500, approx: true, motifs: ['נהר', 'מים'] },
  { id: 'chg-chomei', idea: 'change', side: 'b', he: 'זרם הנהר אינו פוסק, ואין המים אותם המים', orig: 'ゆく河の流れは絶えずして、しかももとの水にあらず', lang: 'ja', culture: 'japanese', src: 'קאמו נו צ\'ומיי Kamo no Chōmei, הוֹג\'וֹקי (方丈記)', year: 1212, motifs: ['נהר', 'מים'] },
  { id: 'chg-kohelet2', idea: 'change', side: 's', he: 'דור הולך ודור בא, והארץ לעולם עומדת', culture: 'bible', src: 'קהלת א, ד', year: -250, approx: true, motifs: ['ארץ'] },

  // ───── נקמה וסליחה ─────
  { id: 'rev-hammurabi', idea: 'revenge', side: 'a', he: 'אדם שעיוור עין של בן חורין — יעוורו את עינו', culture: 'akkad', src: 'חוקי חמורבי Hammurabi, סעיף 196', year: -1754, motifs: ['עין'] },
  { id: 'rev-exodus', idea: 'revenge', side: 'a', he: 'עין תחת עין, שן תחת שן', culture: 'bible', src: 'שמות כא, כד', year: -600, approx: true, motifs: ['עין', 'שן'] },
  { id: 'rev-matthew', idea: 'revenge', side: 'b', he: 'מי שמכה אותך על הלחי הימנית — הטה לו גם את האחרת', culture: 'nt', src: 'הבשורה על פי מתי ה, לט', year: 80, approx: true, motifs: ['לחי'] },
  { id: 'rev-laozi', idea: 'revenge', side: 'b', he: 'השב על עלבון בטוב', orig: '報怨以德', lang: 'zh', culture: 'chinese', src: 'לאו-דזה, דאו דה ג\'ינג 63', year: -400, approx: true, motifs: [], at: LUOYANG },
  { id: 'rev-prov', idea: 'revenge', side: 'b', he: 'אם רעב שונאך — האכילהו לחם', culture: 'bible', src: 'משלי כה, כא', year: -600, approx: true, motifs: ['לחם'] },
  { id: 'rev-lev', idea: 'revenge', side: 'b', he: 'לא תיקום ולא תיטור', culture: 'bible', src: 'ויקרא יט, יח', year: -600, approx: true, motifs: [] },
  { id: 'rev-confucius', idea: 'revenge', side: 's', he: 'על עלבון — השב ביושר; על טובה — השב בטובה', orig: '以直報怨，以德報德', lang: 'zh', culture: 'chinese', src: 'קונפוציוס, השיחות (論語) 14:34', year: -500, approx: true, motifs: [], note: 'תשובה ישירה לשאלה: "ומה דעתך על השבת עלבון בטוב?"' },
  { id: 'rev-quran', idea: 'revenge', side: 's', he: 'נפש בנפש ועין בעין… ומי שמוחל — כפרה היא לו', orig: 'النفس بالنفس والعين بالعين … فمن تصدق به فهو كفارة له', lang: 'ar', culture: 'islam', src: 'הקוראן, סורה 5, 45', year: 632, approx: true, motifs: ['עין'] },

  // ───── כלל הזהב ─────
  { id: 'gold-hillel', idea: 'golden', side: 'a', he: 'מה ששנוא עליך — אל תעשה לחברך', orig: 'דעלך סני לחברך לא תעביד', lang: 'arc', culture: 'bavli', src: 'הלל, שבת לא ע"א', year: -20, approx: true, motifs: ['אל תעשה'] },
  { id: 'gold-confucius', idea: 'golden', side: 'a', he: 'מה שאינך רוצה לעצמך — אל תעשה לאחרים', orig: '己所不欲，勿施於人', lang: 'zh', culture: 'chinese', src: 'קונפוציוס, השיחות (論語) 15:24', year: -500, approx: true, motifs: ['אל תעשה'] },
  { id: 'gold-isocrates', idea: 'golden', side: 'a', he: 'מה שמכעיס אתכם כשאחרים עושים לכם — אל תעשו לאחרים', orig: 'ἃ πάσχοντες ὑφ᾽ ἑτέρων ὀργίζεσθε, ταῦτα τοῖς ἄλλοις μὴ ποιεῖτε', lang: 'grc', culture: 'greek', src: 'איסוקרטס Isocrates, ניקוקלס 61', year: -370, approx: true, motifs: ['אל תעשה'] },
  { id: 'gold-tobit', idea: 'golden', side: 'a', he: 'ומה ששנוא עליך — אל תעשה לאיש', orig: 'ὃ μισεῖς, μηδενὶ ποιήσῃς', lang: 'grc', culture: 'apoc', src: 'ספר טוביה ד, טו', year: -200, approx: true, motifs: ['אל תעשה'] },
  { id: 'gold-maha', idea: 'golden', side: 'a', he: 'אל תעשה לאחר מה שמזיק לך עצמך; זו הדהרמה בקיצור', orig: 'na tat parasya saṃdadhyāt pratikūlaṃ yad ātmanaḥ', lang: 'sa', culture: 'sanskrit', src: 'מהאבהארטה Mahābhārata, ספר 13', year: -200, approx: true, motifs: ['אל תעשה'] },
  { id: 'gold-lev', idea: 'golden', side: 'b', he: 'ואהבת לרעך כמוך', culture: 'bible', src: 'ויקרא יט, יח', year: -600, approx: true, motifs: ['עשה'] },
  { id: 'gold-matthew', idea: 'golden', side: 'b', he: 'כל מה שאתם רוצים שיעשו לכם — כן עשו גם אתם להם', culture: 'nt', src: 'הבשורה על פי מתי ז, יב', year: 80, approx: true, motifs: ['עשה'] },
  { id: 'gold-hadith', idea: 'golden', side: 'b', he: 'אינו מאמין מי מכם, עד שיאהב לאחיו את מה שהוא אוהב לעצמו', orig: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه', lang: 'ar', culture: 'islam', src: 'חדית\', צחיח אל-בוח\'ארי 13', year: 846, approx: true, motifs: ['עשה'] },
  { id: 'gold-korean', idea: 'golden', side: 'b', he: 'אם המילה היוצאת נאה — גם המילה החוזרת נאה', orig: '가는 말이 고와야 오는 말이 곱다', lang: 'ko', culture: 'korean', src: 'פתגם קוריאני', year: null, motifs: ['דיבור'] },

  // ───── בית ונדודים ─────
  { id: 'home-stone', idea: 'home', side: 'a', he: 'אבן מתגלגלת אינה מעלה אזוב', orig: 'Saxum volutum non obducitur musco', lang: 'la', culture: 'latin', src: 'פובליליוס סירוס Publilius Syrus, משלים', year: -45, approx: true, motifs: ['אבן', 'אזוב'], note: 'בקריאה הבריטית: מי שנודד לא צובר דבר.' },
  { id: 'home-stone-us', idea: 'home', side: 'b', he: 'אבן מתגלגלת אינה מעלה אזוב — ולכן תמשיך לזוז', orig: 'A rolling stone gathers no moss', lang: 'en', culture: 'american', src: 'הקריאה האמריקנית של המאה ה-20: אזוב הוא קיפאון', year: null, motifs: ['אבן', 'אזוב'], note: 'אותן מילים, משמעות הפוכה.' },
  { id: 'home-best', idea: 'home', side: 'a', he: 'מזרח או מערב — הבית הכי טוב', orig: 'East or West, home is best', lang: 'en', culture: 'english', src: 'פתגם אנגלי', year: null, motifs: ['בית'] },
  { id: 'home-payne', idea: 'home', side: 'a', he: 'אין מקום כמו הבית', orig: 'There\'s no place like home', lang: 'en', culture: 'american', src: 'ג\'ון הווארד פיין John Howard Payne, Home! Sweet Home!', year: 1823, motifs: ['בית'] },
  { id: 'home-cn', idea: 'home', side: 'a', he: 'קן זהב, קן כסף — לא כמו המלונה שלי', orig: '金窩銀窩，不如自己的狗窩', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['בית', 'כסף'] },
  { id: 'home-ar', idea: 'home', side: 'a', he: 'מי שיוצא מביתו — ערכו פוחת', orig: 'من خرج من داره قل مقداره', lang: 'ar', culture: 'arabic', src: 'פתגם ערבי', year: null, motifs: ['בית'] },
  { id: 'home-lech', idea: 'home', side: 'b', he: 'לך לך מארצך וממולדתך ומבית אביך', culture: 'bible', src: 'בראשית יב, א', year: -600, approx: true, motifs: ['דרך', 'בית'] },
  { id: 'home-mazal', idea: 'home', side: 'b', he: 'משנה מקום — משנה מזל', culture: 'bavli', src: 'על פי ראש השנה טז ע"ב: "שינוי מקום" קורע גזר דין', year: 500, approx: true, motifs: ['מקום', 'מזל'] },
  { id: 'home-tree', idea: 'home', side: 'b', he: 'עץ שמזיזים — מת; אדם שזז — חי', orig: '樹挪死，人挪活', lang: 'zh', culture: 'chinese', src: 'פתגם סיני', year: null, motifs: ['עץ'] },
  { id: 'home-prophet', idea: 'home', side: 'b', he: 'אין נביא בעירו', orig: 'οὐδεὶς προφήτης δεκτός ἐστιν ἐν τῇ πατρίδι αὐτοῦ', lang: 'grc', culture: 'nt', src: 'הבשורה על פי לוקס ד, כד', year: 85, approx: true, motifs: ['עיר'] },
];

// זוגות מתחזים בין רעיונות: אותן מילים או אותו דימוי, משמעות אחרת. meaning בין -1 (הפוך) ל-1 (זהה).
export const CROSS_PAIRS: { a: string; b: string; meaning: number; note: string }[] = [
  { a: 'sil-akiva', b: 'nb-fence', meaning: 0.1, note: 'גדר בשני המקרים: אצל רבי עקיבא היא שומרת על החוכמה, ואצל פרוסט היא שומרת על השכנות.' },
  { a: 'far-fr', b: 'know-es', meaning: 0.35, note: 'עין ולב בשניהם: בצרפתית הלב שוכח, ובספרדית הלב מוגן.' },
  { a: 'haste-ar', b: 'sil-ar', meaning: 0, note: 'השטן מופיע פעמיים בערבית: פעם בחיפזון, ופעם בשתיקה מול האמת.' },
  { a: 'risk-en', b: 'like-feather', meaning: 0, note: 'ציפורים בשני הפתגמים: באחד הן מחיר הוודאות, ובשני הן חברה.' },
  { a: 'risk-virgil', b: 'fate-terence', meaning: 0.9, note: 'כמעט אותן מילים, בהפרש של 140 שנה: המזל עוזר לאמיצים ולנועזים.' },
  { a: 'deed-john', b: 'deed-goethe', meaning: -0.9, note: 'גתה מעתיק את המבנה של יוחנן ומחליף מילה אחת, וכך הופך את המשמעות.' },
  { a: 'drop-akiva', b: 'drop-ovid', meaning: 0.95, note: 'רבי עקיבא ואובידיוס, באותה מאה: מים רכים חוצבים אבן קשה.' },
];

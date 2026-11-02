// תרבויות ומקומות. נקודה על המפה היא מקום מייצג של התרבות, ולא טענה שהאמירה נאמרה שם.
// place: שם בעברית ובלועזית. region משמש לחישוב "מספר יבשות".
export type Culture = {
  id: string;
  he: string;
  en: string;
  place: string;
  placeEn: string;
  lat: number;
  lon: number;
  region: 'מזרח תיכון' | 'אירופה' | 'מזרח אסיה' | 'דרום אסיה' | 'אפריקה' | 'אמריקה';
};

export const CULTURES: Culture[] = [
  { id: 'akkad', he: 'בבל העתיקה', en: 'Old Babylonian', place: 'בבל', placeEn: 'Babylon', lat: 32.54, lon: 44.42, region: 'מזרח תיכון' },
  { id: 'bible', he: 'המקרא', en: 'Hebrew Bible', place: 'ירושלים', placeEn: 'Jerusalem', lat: 31.78, lon: 35.22, region: 'מזרח תיכון' },
  { id: 'mishna', he: 'המשנה', en: 'Mishnah', place: 'ציפורי', placeEn: 'Sepphoris', lat: 32.75, lon: 35.28, region: 'מזרח תיכון' },
  { id: 'bavli', he: 'התלמוד הבבלי', en: 'Babylonian Talmud', place: 'פומבדיתא', placeEn: 'Pumbedita', lat: 33.36, lon: 43.78, region: 'מזרח תיכון' },
  { id: 'hebrew', he: 'עברית מדוברת', en: 'Modern Hebrew', place: 'תל אביב', placeEn: 'Tel Aviv', lat: 32.08, lon: 34.78, region: 'מזרח תיכון' },
  { id: 'yiddish', he: 'יידיש', en: 'Yiddish', place: 'וילנה', placeEn: 'Vilnius', lat: 54.69, lon: 25.28, region: 'אירופה' },
  { id: 'nt', he: 'הברית החדשה', en: 'New Testament', place: 'הגליל', placeEn: 'Galilee', lat: 32.88, lon: 35.5, region: 'מזרח תיכון' },
  { id: 'apoc', he: 'הספרים החיצוניים', en: 'Apocrypha', place: 'אלכסנדריה', placeEn: 'Alexandria', lat: 31.2, lon: 29.92, region: 'אפריקה' },
  { id: 'islam', he: 'הקוראן והחדית\'', en: 'Quran and Hadith', place: 'מדינה', placeEn: 'Medina', lat: 24.47, lon: 39.61, region: 'מזרח תיכון' },
  { id: 'arabic', he: 'ערבית', en: 'Arabic', place: 'דמשק', placeEn: 'Damascus', lat: 33.51, lon: 36.29, region: 'מזרח תיכון' },
  { id: 'persian', he: 'פרסית', en: 'Persian', place: 'שיראז', placeEn: 'Shiraz', lat: 29.59, lon: 52.58, region: 'מזרח תיכון' },
  { id: 'turkish', he: 'טורקית', en: 'Turkish', place: 'איסטנבול', placeEn: 'Istanbul', lat: 41.01, lon: 28.98, region: 'מזרח תיכון' },
  { id: 'greek', he: 'יוונית עתיקה', en: 'Ancient Greek', place: 'אתונה', placeEn: 'Athens', lat: 37.98, lon: 23.73, region: 'אירופה' },
  { id: 'latin', he: 'לטינית', en: 'Latin', place: 'רומא', placeEn: 'Rome', lat: 41.9, lon: 12.5, region: 'אירופה' },
  { id: 'italian', he: 'איטלקית', en: 'Italian', place: 'פירנצה', placeEn: 'Florence', lat: 43.77, lon: 11.25, region: 'אירופה' },
  { id: 'french', he: 'צרפתית', en: 'French', place: 'פריז', placeEn: 'Paris', lat: 48.86, lon: 2.35, region: 'אירופה' },
  { id: 'spanish', he: 'ספרדית', en: 'Spanish', place: 'מדריד', placeEn: 'Madrid', lat: 40.42, lon: -3.7, region: 'אירופה' },
  { id: 'german', he: 'גרמנית', en: 'German', place: 'ציריך', placeEn: 'Zürich', lat: 47.37, lon: 8.54, region: 'אירופה' },
  { id: 'english', he: 'אנגלית', en: 'English', place: 'לונדון', placeEn: 'London', lat: 51.51, lon: -0.13, region: 'אירופה' },
  { id: 'american', he: 'אנגלית אמריקנית', en: 'American English', place: 'פילדלפיה', placeEn: 'Philadelphia', lat: 39.95, lon: -75.17, region: 'אמריקה' },
  { id: 'russian', he: 'רוסית', en: 'Russian', place: 'מוסקבה', placeEn: 'Moscow', lat: 55.75, lon: 37.62, region: 'אירופה' },
  { id: 'chinese', he: 'סינית', en: 'Chinese', place: 'צ\'ו-פו', placeEn: 'Qufu', lat: 35.6, lon: 116.99, region: 'מזרח אסיה' },
  { id: 'japanese', he: 'יפנית', en: 'Japanese', place: 'קיוטו', placeEn: 'Kyoto', lat: 35.01, lon: 135.77, region: 'מזרח אסיה' },
  { id: 'korean', he: 'קוריאנית', en: 'Korean', place: 'סיאול', placeEn: 'Seoul', lat: 37.57, lon: 126.98, region: 'מזרח אסיה' },
  { id: 'sanskrit', he: 'סנסקריט', en: 'Sanskrit', place: 'קורוקשטרה', placeEn: 'Kurukshetra', lat: 29.97, lon: 76.88, region: 'דרום אסיה' },
  { id: 'amharic', he: 'אמהרית', en: 'Amharic', place: 'אדיס אבבה', placeEn: 'Addis Ababa', lat: 9.03, lon: 38.74, region: 'אפריקה' },
  { id: 'swahili', he: 'סווהילית', en: 'Swahili', place: 'זנזיבר', placeEn: 'Zanzibar', lat: -6.16, lon: 39.19, region: 'אפריקה' },
];

export const CULTURE: Record<string, Culture> = Object.fromEntries(CULTURES.map((c) => [c.id, c]));

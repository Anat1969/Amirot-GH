// תרבויות, שפות ועולמות. שפה אינה תרבות: לכל אמירה יש שפה (lang), תרבות (culture) ועולם ערכים (world).
// דגל = המדינה שבה נמצא היום המקום המייצג של התרבות, ולא טענה על זהות. ערבית כללית מקבלת את דגל הליגה הערבית.
export type World = 'jewish' | 'islam' | 'china' | 'japan' | 'classical' | 'christian' | 'anglo' | 'europe' | 'nordic' | 'other';
export type Culture = {
  id: string;
  he: string;
  en: string;
  place: string;
  placeEn: string;
  lat: number;
  lon: number;
  flag: string;
  world: World;
  region: 'מזרח תיכון' | 'אירופה' | 'מזרח אסיה' | 'דרום אסיה' | 'אפריקה' | 'אמריקה';
};

export const WORLDS: Record<World, { he: string; line: string }> = {
  jewish: { he: 'היהדות', line: 'מקרא, משנה, תלמוד, יידיש וחסידות, בעברית, ארמית ויידיש' },
  islam: { he: 'האסלאם והעולם הערבי', line: 'קוראן, חדית\' ופתגם עממי, בערבית' },
  china: { he: 'סין', line: 'קונפוציוס, לאו-דזה ופתגם עממי' },
  japan: { he: 'יפן וקוריאה', line: 'פתגם עממי וספרות ימי הביניים' },
  classical: { he: 'יוון ורומא', line: 'הומרוס, הרקליטוס, הורטיוס ואובידיוס, ביוונית ולטינית' },
  christian: { he: 'הנצרות', line: 'הברית החדשה, הכנסייה ומיסטיקה, ביוונית ולטינית' },
  anglo: { he: 'העולם דובר האנגלית', line: 'אנגליה, סקוטלנד וארצות הברית' },
  europe: { he: 'אירופה היבשתית', line: 'צרפת, גרמניה, שווייץ, איטליה, ספרד ורוסיה' },
  nordic: { he: 'הצפון', line: 'הוואמאל הנורדית ופתגמי שוודיה, נורווגיה, דנמרק ופינלנד' },
  other: { he: 'עוד עולמות', line: 'פרס, טורקיה, הודו ואפריקה' },
};

export const LANGS: Record<string, string> = {
  he: 'עברית', arc: 'ארמית', akk: 'אכדית', ar: 'ערבית', en: 'אנגלית', la: 'לטינית', grc: 'יוונית', zh: 'סינית', ja: 'יפנית',
  fr: 'צרפתית', es: 'ספרדית', de: 'גרמנית', it: 'איטלקית', ru: 'רוסית', tr: 'טורקית', am: 'אמהרית', sw: 'סווהילית', fa: 'פרסית',
  yi: 'יידיש', ko: 'קוריאנית', sa: 'סנסקריט', non: 'נורדית עתיקה', sv: 'שוודית', no: 'נורווגית', fi: 'פינית',
};

export const CULTURES: Culture[] = [
  { id: 'akkad', he: 'בבל העתיקה', en: 'Old Babylonian', place: 'בבל', placeEn: 'Babylon', lat: 32.54, lon: 44.42, flag: 'iq', world: 'other', region: 'מזרח תיכון' },
  { id: 'bible', he: 'המקרא', en: 'Hebrew Bible', place: 'ירושלים', placeEn: 'Jerusalem', lat: 31.78, lon: 35.22, flag: 'il', world: 'jewish', region: 'מזרח תיכון' },
  { id: 'mishna', he: 'המשנה', en: 'Mishnah', place: 'ציפורי', placeEn: 'Sepphoris', lat: 32.75, lon: 35.28, flag: 'il', world: 'jewish', region: 'מזרח תיכון' },
  { id: 'bavli', he: 'התלמוד הבבלי', en: 'Babylonian Talmud', place: 'פומבדיתא', placeEn: 'Pumbedita', lat: 33.36, lon: 43.78, flag: 'iq', world: 'jewish', region: 'מזרח תיכון' },
  { id: 'hebrew', he: 'ישראל', en: 'Israel', place: 'תל אביב', placeEn: 'Tel Aviv', lat: 32.08, lon: 34.78, flag: 'il', world: 'jewish', region: 'מזרח תיכון' },
  { id: 'yiddish', he: 'יהדות אשכנז', en: 'Ashkenazi Jewry', place: 'וילנה', placeEn: 'Vilnius', lat: 54.69, lon: 25.28, flag: 'lt', world: 'jewish', region: 'אירופה' },
  { id: 'hasidic', he: 'החסידות', en: 'Hasidism', place: 'פשיסחה', placeEn: 'Przysucha', lat: 51.36, lon: 20.63, flag: 'pl', world: 'jewish', region: 'אירופה' },
  { id: 'apoc', he: 'יהדות הלניסטית', en: 'Hellenistic Jewry', place: 'אלכסנדריה', placeEn: 'Alexandria', lat: 31.2, lon: 29.92, flag: 'eg', world: 'jewish', region: 'אפריקה' },
  { id: 'nt', he: 'הנצרות הקדומה', en: 'Early Christianity', place: 'הגליל', placeEn: 'Galilee', lat: 32.88, lon: 35.5, flag: 'il', world: 'christian', region: 'מזרח תיכון' },
  { id: 'church', he: 'הכנסייה הקתולית', en: 'Catholic Church', place: 'רומא', placeEn: 'Rome', lat: 41.9, lon: 12.45, flag: 'va', world: 'christian', region: 'אירופה' },
  { id: 'dutch', he: 'ארצות השפלה', en: 'Low Countries', place: 'צוולה', placeEn: 'Zwolle', lat: 52.52, lon: 6.09, flag: 'nl', world: 'christian', region: 'אירופה' },
  { id: 'islam', he: 'האסלאם', en: 'Islam', place: 'מדינה', placeEn: 'Medina', lat: 24.47, lon: 39.61, flag: 'sa', world: 'islam', region: 'מזרח תיכון' },
  { id: 'arabic', he: 'העולם הערבי', en: 'Arab world', place: 'דמשק', placeEn: 'Damascus', lat: 33.51, lon: 36.29, flag: 'arab', world: 'islam', region: 'מזרח תיכון' },
  { id: 'persian', he: 'פרס', en: 'Persia', place: 'שיראז', placeEn: 'Shiraz', lat: 29.59, lon: 52.58, flag: 'ir', world: 'other', region: 'מזרח תיכון' },
  { id: 'turkish', he: 'טורקיה', en: 'Turkey', place: 'איסטנבול', placeEn: 'Istanbul', lat: 41.01, lon: 28.98, flag: 'tr', world: 'other', region: 'מזרח תיכון' },
  { id: 'greek', he: 'יוון העתיקה', en: 'Ancient Greece', place: 'אתונה', placeEn: 'Athens', lat: 37.98, lon: 23.73, flag: 'gr', world: 'classical', region: 'אירופה' },
  { id: 'latin', he: 'רומא העתיקה', en: 'Ancient Rome', place: 'רומא', placeEn: 'Rome', lat: 41.89, lon: 12.49, flag: 'it', world: 'classical', region: 'אירופה' },
  { id: 'italian', he: 'איטליה', en: 'Italy', place: 'פירנצה', placeEn: 'Florence', lat: 43.77, lon: 11.25, flag: 'it', world: 'europe', region: 'אירופה' },
  { id: 'french', he: 'צרפת', en: 'France', place: 'פריז', placeEn: 'Paris', lat: 48.86, lon: 2.35, flag: 'fr', world: 'europe', region: 'אירופה' },
  { id: 'spanish', he: 'ספרד', en: 'Spain', place: 'מדריד', placeEn: 'Madrid', lat: 40.42, lon: -3.7, flag: 'es', world: 'europe', region: 'אירופה' },
  { id: 'german', he: 'גרמניה', en: 'Germany', place: 'ויימאר', placeEn: 'Weimar', lat: 50.98, lon: 11.33, flag: 'de', world: 'europe', region: 'אירופה' },
  { id: 'swiss', he: 'שווייץ', en: 'Switzerland', place: 'ציריך', placeEn: 'Zürich', lat: 47.37, lon: 8.54, flag: 'ch', world: 'europe', region: 'אירופה' },
  { id: 'russian', he: 'רוסיה', en: 'Russia', place: 'מוסקבה', placeEn: 'Moscow', lat: 55.75, lon: 37.62, flag: 'ru', world: 'europe', region: 'אירופה' },
  { id: 'english', he: 'אנגליה', en: 'England', place: 'לונדון', placeEn: 'London', lat: 51.51, lon: -0.13, flag: 'gb-eng', world: 'anglo', region: 'אירופה' },
  { id: 'scotland', he: 'סקוטלנד', en: 'Scotland', place: 'אדינבורו', placeEn: 'Edinburgh', lat: 55.95, lon: -3.19, flag: 'gb-sct', world: 'anglo', region: 'אירופה' },
  { id: 'american', he: 'ארצות הברית', en: 'United States', place: 'פילדלפיה', placeEn: 'Philadelphia', lat: 39.95, lon: -75.17, flag: 'us', world: 'anglo', region: 'אמריקה' },
  { id: 'norse', he: 'הנורדים', en: 'Old Norse', place: 'רייקיאוויק', placeEn: 'Reykjavík', lat: 64.15, lon: -21.94, flag: 'is', world: 'nordic', region: 'אירופה' },
  { id: 'swedish', he: 'שוודיה', en: 'Sweden', place: 'שטוקהולם', placeEn: 'Stockholm', lat: 59.33, lon: 18.07, flag: 'se', world: 'nordic', region: 'אירופה' },
  { id: 'norwegian', he: 'נורווגיה', en: 'Norway', place: 'אוסלו', placeEn: 'Oslo', lat: 59.91, lon: 10.75, flag: 'no', world: 'nordic', region: 'אירופה' },
  { id: 'danish', he: 'דנמרק', en: 'Denmark', place: 'ניקובינג מורס', placeEn: 'Nykøbing Mors', lat: 56.79, lon: 8.86, flag: 'dk', world: 'nordic', region: 'אירופה' },
  { id: 'finnish', he: 'פינלנד', en: 'Finland', place: 'הלסינקי', placeEn: 'Helsinki', lat: 60.17, lon: 24.94, flag: 'fi', world: 'nordic', region: 'אירופה' },
  { id: 'chinese', he: 'סין', en: 'China', place: 'צ\'ו-פו', placeEn: 'Qufu', lat: 35.6, lon: 116.99, flag: 'cn', world: 'china', region: 'מזרח אסיה' },
  { id: 'japanese', he: 'יפן', en: 'Japan', place: 'קיוטו', placeEn: 'Kyoto', lat: 35.01, lon: 135.77, flag: 'jp', world: 'japan', region: 'מזרח אסיה' },
  { id: 'korean', he: 'קוריאה', en: 'Korea', place: 'סיאול', placeEn: 'Seoul', lat: 37.57, lon: 126.98, flag: 'kr', world: 'japan', region: 'מזרח אסיה' },
  { id: 'sanskrit', he: 'הודו העתיקה', en: 'Ancient India', place: 'קורוקשטרה', placeEn: 'Kurukshetra', lat: 29.97, lon: 76.88, flag: 'in', world: 'other', region: 'דרום אסיה' },
  { id: 'amharic', he: 'אתיופיה', en: 'Ethiopia', place: 'אדיס אבבה', placeEn: 'Addis Ababa', lat: 9.03, lon: 38.74, flag: 'et', world: 'other', region: 'אפריקה' },
  { id: 'swahili', he: 'מזרח אפריקה', en: 'East Africa', place: 'זנזיבר', placeEn: 'Zanzibar', lat: -6.16, lon: 39.19, flag: 'tz', world: 'other', region: 'אפריקה' },
  { id: 'mali', he: 'מאלי', en: 'Mali', place: 'במאקו', placeEn: 'Bamako', lat: 12.64, lon: -8.0, flag: 'ml', world: 'other', region: 'אפריקה' },
];

export const CULTURE: Record<string, Culture> = Object.fromEntries(CULTURES.map((c) => [c.id, c]));

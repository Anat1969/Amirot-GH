// שלושה סוגי מסמכים, ולכל אחד מטרה אחרת (25.11.2026, ענת: "חשובה ההבחנה, כי לכל מסמך יש מטרה אחרת").
// ההבחנה מוצגת בראש כל מסמך (GenreBand), ובכל מקום כתוב מה כל סוג עושה, ובמה הוא שונה מהשניים האחרים.
export type GenreId = 'article' | 'creation' | 'essay';
export type Genre = { id: GenreId; he: string; icon: string; page: string; goal: string; reader: string; form: string; not: string };
export const GENRES: Genre[] = [
  { id: 'article', he: 'כתבה', icon: 'doc', page: 'article',
    goal: 'לספר סיפור של גילוי',
    reader: 'קוראת סקרנית, כחמש דקות של קריאה',
    form: 'נגללת כמו מגזין: תמונה פותחת, פתיח, ציטוט מוגדל ותובנה',
    not: 'לא מוכיחה ולא מודדת ודאות. היא בוחרת זווית אחת ומספרת אותה עד הסוף.' },
  { id: 'creation', he: 'יצירה', icon: 'frame', page: 'creations',
    goal: 'לעורר חוויה במבט אחד',
    reader: 'מבקר בתערוכה, חצי דקה בעמידה',
    form: 'לוח A4 אחד: קומפוזיציה, תמונה, משפט, הייקו',
    not: 'לא נקראת ברצף. מה שלא נקלט במבט, לא נכנס ללוח.' },
  { id: 'essay', he: 'מאמר', icon: 'lens', page: 'research',
    goal: 'לבסס טענה, ולסמן כמה אפשר לסמוך עליה',
    reader: 'חוקרת או מנחת דיאלוג, קריאה איטית',
    form: 'טענה, ראיה, פרשנויות, מד ודאות ושאלות להמשך',
    not: 'לא מספר סיפור ולא מכריע. הוא מפריד בין עובדה, פרשנות והשערה.' },
];
export const GENRE = Object.fromEntries(GENRES.map((g) => [g.id, g])) as Record<GenreId, Genre>;

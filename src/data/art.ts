// דיפטיכון לכל רעיון: שתי יצירות אמנות, אחת לכל צד. רישיון CC0, מאוסף הגישה הפתוחה של מוזיאון קליבלנד לאמנות.
export type Art = { id: number; accession: string; title: string; artist: string; date: string; culture: string; file: string; why: string };
export const ART: Record<string, { a: Art | null; b: Art | null }> = {};

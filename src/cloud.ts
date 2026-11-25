// הענן של אמירות: תוצרים שנוצרו בתוך האפליקציה. Supabase, פרויקט cultura-GH, טבלה amirot_outputs.
// בלי התחברות: קריאה פתוחה, וכתיבה רק דרך הפונקציה amirot_add_output, שבודקת כל שדה (גם: אין עובדה בלי מקור) ומגבילה קצב.
// המפתח הוא המפתח הציבורי (publishable), שמיועד ללקוח. בלי רשת: התוצר נשמר במכשיר ונשלח שוב בכניסה הבאה.
import type { Output, Kind } from './data/outputs';

const URL = 'https://ktqmwpbzcnzkhjskqisy.supabase.co';
const KEY = 'sb_publishable_IkreG7naPa1h-d4kGp1gpA_sLU4tg5q';
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const PENDING = 'amirot.outputs.pending';

type Row = { id: string; kind: Kind; idea: string; title: string; lead: string; blocks: Output['blocks']; question: string; certainty: Output['certainty'] | null; derived_from: string | null; form: string | null; created_at: string };
const NEXT: Record<Kind, Kind> = { story: 'paper', paper: 'essay', essay: 'creation', creation: 'story' };
const WHY: Record<Kind, string> = { story: 'השאלה שנשארה הופכת לשאלת מחקר.', paper: 'הסתירה הופכת להנחה שאפשר לערער עליה.', essay: 'השאלה החדשה הופכת ל"מה אם...".', creation: 'ההשערה בסוף היא נושא לתחקיר.' };

export type CloudOutput = Output & { createdAt: string; local?: boolean };
const fromRow = (r: Row): CloudOutput => ({
  id: r.id, kind: r.kind, chain: r.idea, title: r.title, lead: r.lead, blocks: r.blocks, question: r.question,
  certainty: r.certainty ?? undefined, derivedFrom: r.derived_from, form: r.form ?? undefined,
  transition: { to: NEXT[r.kind], why: WHY[r.kind] }, createdAt: r.created_at,
});
const toPayload = (o: Output) => ({ kind: o.kind, idea: o.chain, title: o.title, lead: o.lead, blocks: o.blocks, question: o.question, certainty: o.certainty ?? '', derivedFrom: o.derivedFrom ?? '', form: o.form ?? '' });

const readPending = (): Output[] => { try { return JSON.parse(localStorage.getItem(PENDING) || '[]'); } catch { return []; } };
const writePending = (xs: Output[]) => { try { localStorage.setItem(PENDING, JSON.stringify(xs)); } catch { /* בלי אחסון */ } };

/** כל התוצרים שנוספו, מהחדש לישן. תוצר שעוד לא הגיע לענן מוצג מהמכשיר, ומסומן */
export async function loadOutputs(): Promise<CloudOutput[]> {
  const local = readPending().map((o) => ({ ...o, createdAt: '', local: true }));
  try {
    const r = await fetch(`${URL}/rest/v1/amirot_outputs?select=*&order=created_at.desc&limit=200`, { headers: H });
    if (!r.ok) return local;
    return [...local, ...((await r.json()) as Row[]).map(fromRow)];
  } catch { return local; }
}

/** הוספה לאפליקציה: קודם לענן. אם אין רשת, נשמר במכשיר ונשלח שוב בכניסה הבאה */
export async function addOutput(o: Output): Promise<{ ok: true; out: CloudOutput } | { ok: false; error: string; local?: CloudOutput }> {
  try {
    const r = await fetch(`${URL}/rest/v1/rpc/amirot_add_output`, { method: 'POST', headers: H, body: JSON.stringify({ p: toPayload(o) }) });
    if (r.ok) return { ok: true, out: fromRow(await r.json()) };
    const e = await r.json().catch(() => ({}));
    return { ok: false, error: e.message || 'השמירה נכשלה. אפשר לנסות שוב.' };
  } catch {
    const local = { ...o, id: 'local-' + Date.now(), createdAt: '', local: true };
    writePending([...readPending(), local]);
    return { ok: false, error: 'אין רשת. התוצר נשמר במכשיר, ויישלח לענן בכניסה הבאה.', local };
  }
}

/** שליחה חוזרת של מה שנשמר במכשיר */
export async function flushPending() {
  const xs = readPending();
  if (!xs.length) return;
  writePending([]); // מה שנכשל שוב בגלל רשת חוזר לרשימה בתוך addOutput. מה שהענן דחה (לא תקין) לא נשמר
  for (const o of xs) await addOutput(o);
}

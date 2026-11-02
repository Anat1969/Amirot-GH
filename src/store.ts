import { useCallback, useEffect, useState } from 'react';
// שמירה מקומית, עם try/catch: בלי גישה לאחסון האפליקציה ממשיכה לעבוד.
const KEY = 'amirot.v1';
type State = { stance: Record<string, 'a' | 'b' | 's'>; notes: Record<string, string>; q: string };
const empty: State = { stance: {}, notes: {}, q: '' };
const read = (): State => { try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...empty }; } };
const subs = new Set<() => void>();
let state = read();
export function useStore() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((n) => n + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  const set = useCallback((patch: (s: State) => State) => {
    state = patch(state);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* בלי אחסון: נשמר עד סגירת הלשונית */ }
    subs.forEach((f) => f());
  }, []);
  return [state, set] as const;
}

'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { advanceSession, emptyProgress, recordAnswer, restoreProgress, startSession, STORAGE_KEY, type Progress } from '@/lib/engine';
import type { Answer } from '@/lib/scenarios';

type ProgressContextValue = {
  progress: Progress;
  ready: boolean;
  storageAvailable: boolean;
  begin: () => void;
  answer: (answer: Answer) => void;
  next: () => void;
  reset: () => void;
  toggleText: () => void;
};
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try { setProgress(restoreProgress(localStorage.getItem(STORAGE_KEY))); }
    catch { setStorageAvailable(false); }
    setReady(true);
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY) setProgress(restoreProgress(event.newValue)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch { setStorageAvailable(false); }
    document.documentElement.dataset.largeText = String(progress.largeText);
  }, [progress, ready]);
  const begin = useCallback(() => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setProgress((p) => startSession(p, id, new Date().toISOString()));
  }, []);
  const answer = useCallback((answer: Answer) => setProgress((p) => recordAnswer(p, answer, new Date().toISOString())), []);
  const next = useCallback(() => setProgress(advanceSession), []);
  const reset = useCallback(() => setProgress((p) => ({ ...emptyProgress, largeText: p.largeText })), []);
  const toggleText = useCallback(() => setProgress((p) => ({ ...p, largeText: !p.largeText })), []);
  return <ProgressContext.Provider value={{ progress, ready, storageAvailable, begin, answer, next, reset, toggleText }}>{children}</ProgressContext.Provider>;
}
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('ProgressProvider is required');
  return context;
}

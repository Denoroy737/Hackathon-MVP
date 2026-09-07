'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Lightbulb, LoaderCircle, Sparkles } from 'lucide-react';
import type { Attempt } from '@/lib/engine';
import type { Scenario } from '@/lib/scenarios';

type Tip = { text: string; source: 'ai' | 'curated'; reason?: string };
export function CoachTip({ scenario, attempt, history }: { scenario: Scenario; attempt: Attempt; history: Attempt[] }) {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const getTip = async () => {
    if (loading || tip) return;
    setLoading(true);
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 14000);
    try {
      const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abort.signal, body: JSON.stringify({ scenarioId: scenario.id, answer: attempt.answer, completed: history.length, correct: history.filter((a) => a.correct).length }) });
      if (!response.ok) throw new Error('Coaching unavailable');
      const data = await response.json();
      if (typeof data.text !== 'string' || !['ai', 'curated'].includes(data.source)) throw new Error('Invalid response');
      setTip(data);
    } catch { setTip({ text: scenario.coachTip, source: 'curated', reason: 'unavailable' }); }
    finally { clearTimeout(timeout); setLoading(false); }
  };
  return <div className={`coach-tip-card ${tip ? 'expanded' : ''}`}>
    {!tip ? <><button className="coach-tip-button" onClick={getTip} disabled={loading} aria-expanded={false}><span className="coach-tip-button-icon">{loading ? <LoaderCircle size={21} className="spin"/> : <Sparkles size={21}/>}</span><span>{loading ? 'Finding a helpful tip…' : 'A little more guidance?'}<small>{loading ? 'Your next message is still ready below.' : 'Get a short, personal coach tip.'}</small></span><ChevronDown size={20}/></button><p className="coach-privacy">Optional AI uses only this practice message and anonymous progress counts. Built-in tips are always available.</p></> : <div className="coach-tip-content" role="status"><div className="coach-tip-title"><Lightbulb size={21}/><strong>A word from your coach</strong><span>{tip.source === 'ai' ? 'AI-assisted' : 'Built-in tip'}</span></div><p>{tip.text}</p><span className="coach-source">{tip.source === 'ai' ? 'Personalised by AI. Your result is still checked by fixed scenario rules.' : tip.reason === 'unavailable' || tip.reason === 'rate_limited' || tip.reason === 'filtered' ? 'Live coaching is unavailable. Here is a trusted, saved tip instead.' : 'Trusted, built-in guidance. No AI connection is configured.'}</span></div>}
  </div>;
}

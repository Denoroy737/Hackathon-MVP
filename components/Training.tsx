'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChartNoAxesCombined, Check, CheckCircle2, ChevronDown, CircleHelp, Flag, Flame, Leaf, Lightbulb, LockKeyhole, ShieldAlert, ShieldCheck, Sparkles, Sprout, Target, Trophy, Zap } from 'lucide-react';
import { useProgress } from './ProgressProvider';
import { getLevelName, getStats, getWeakness } from '@/lib/engine';
import { getScenario, scenarios } from '@/lib/scenarios';
import { MessageCard } from './MessageCard';
import { CoachTip } from './CoachTip';
import { HelpModal } from './ui';

export function Training() {
  const { progress, ready, begin, answer, next } = useProgress();
  const router = useRouter();
  const [help, setHelp] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const session = progress.session;
  const scenario = session ? getScenario(session.current.scenarioId) : null;
  const attempt = session ? progress.history.find((a) => a.sessionId === session.id && a.scenarioId === session.current.scenarioId) : undefined;
  const stats = getStats(progress.history);
  const weakness = getWeakness(progress.history);
  const completed = session?.completedIds.length || 0;
  const questionNumber = Math.min(completed + (attempt ? 0 : 1), scenarios.length);

  useEffect(() => { if (ready && !session) begin(); }, [ready, session, begin]);
  useEffect(() => {
    if (!scenario) return;
    if (attempt) feedbackRef.current?.focus({ preventScroll: true });
    else headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [scenario?.id, attempt?.scenarioId]);

  if (!ready || !scenario || !session) return <main id="main-content" className="container loading-main"><div className="loading-shield"><ShieldCheck size={38}/></div><h1>Getting your practice ready…</h1><p>A safe space. A fresh start.</p></main>;

  const continueTraining = () => { if (completed >= scenarios.length) router.push('/dashboard?completed=1'); else next(); };
  const correct = attempt?.correct;
  const suspicious = scenario.correctAnswer === 'SUSPICIOUS';
  const signals = suspicious ? scenario.redFlags : scenario.safeSignals;
  const feedback = correct ? (suspicious ? 'Correct! You spotted the scam.' : 'Correct! This message is safe.') : (suspicious ? 'Not quite. This was a scam.' : 'Not quite. This message was safe.');

  return <main id="main-content" className="training-main container">
    <div className="training-breadcrumb"><Link href="/"><ArrowLeft size={17}/> Back to home</Link><span><LockKeyhole size={15}/> A safe space to learn</span></div>
    <div className="training-heading-row"><div><div className="eyebrow">YOUR DAILY DOSE OF DIGITAL CONFIDENCE</div><h1 ref={headingRef} tabIndex={-1}>{attempt ? 'A little wiser already.' : 'Would you trust this message?'}</h1><p>{attempt ? 'Every answer is a chance to learn. Let’s look at the clues.' : 'Imagine this arrived on your phone. Take your time — there’s no timer.'}</p></div><div className="session-counter"><span>YOUR SESSION</span><strong>{String(questionNumber).padStart(2, '0')}<span> / {scenarios.length}</span></strong><span>practice messages</span></div></div>
    <div className="session-progress-row"><div className="session-progress" role="progressbar" aria-label="Session progress" aria-valuemin={0} aria-valuemax={scenarios.length} aria-valuenow={completed}>{Array.from({ length: scenarios.length }).map((_, i) => <span key={i} className={i < completed ? 'complete' : i === completed ? 'current' : ''}/>)}</div><span>{completed} of {scenarios.length} completed</span></div>

    <div className={`training-grid ${attempt ? 'showing-result' : ''}`}>
      <div className="training-primary" key={scenario.id + (attempt ? '-result' : '-question')}>
        {!attempt ? <>
          <MessageCard scenario={scenario}/>
          <div className="decision-section"><h2>Safe or suspicious?</h2><p>Look at what the message is asking you to do.</p><div className="answer-buttons"><button className="answer-button safe-answer" onClick={() => answer('SAFE')}><ShieldCheck size={27}/><span>Safe</span></button><button className="answer-button suspicious-answer" onClick={() => answer('SUSPICIOUS')}><ShieldAlert size={27}/><span>Suspicious</span></button></div><span className="decision-reassurance"><Leaf size={15}/> It’s okay to get it wrong. That’s what practice is for.</span></div>
        </> : <>
          <section className={`feedback-card ${correct ? 'feedback-correct' : 'feedback-incorrect'}`} aria-labelledby="feedback-title"><div className="feedback-top"><span className="feedback-icon">{correct ? <Check size={28} strokeWidth={2.4}/> : <Lightbulb size={28}/>}</span><span className={`xp-award ${correct ? '' : 'no-xp'}`}>{correct ? <><Zap size={18} fill="currentColor"/> +10 XP</> : <><Sprout size={18}/> A lesson gained</>}</span></div><h2 id="feedback-title" ref={feedbackRef} tabIndex={-1}>{feedback}</h2><p>{scenario.explanation}</p><div className="answer-summary"><span>You chose <strong>{attempt.answer === 'SAFE' ? 'Safe' : 'Suspicious'}</strong></span><span className="answer-summary-divider"/><span>{correct ? <CheckCircle2 size={16}/> : <Flag size={16}/>} {correct ? 'Good judgement' : 'No worries. Let’s learn why.'}</span></div></section>
          <section className="signals-section"><div className="signals-heading"><h2>{suspicious ? 'The warning signs' : 'The reassuring signs'}</h2><span>{signals.length} things to notice</span></div><div className="signals-grid">{signals.map((signal, i) => <article className={`signal-card ${suspicious ? '' : 'safe-signal'}`} key={signal.title}><span className="signal-number">{suspicious ? String(i + 1).padStart(2, '0') : <Check size={17}/>}</span><div><h3>{signal.title}</h3><p>{signal.description}</p></div></article>)}</div>{!suspicious && <p className="safe-caveat"><CircleHelp size={16}/> “Safe” here means no risky request. It does not prove who sent the message.</p>}</section>
          <div className="safer-action"><span><ShieldCheck size={25}/></span><div><h3>Your safer next step</h3><p>{scenario.saferAction}</p></div></div>
          <CoachTip key={scenario.id} scenario={scenario} attempt={attempt} history={progress.history}/>
          <div className="next-action"><span><CheckCircle2 size={19}/>{completed === scenarios.length ? 'You finished all 10. Well done!' : 'A little practice goes a long way.'}</span><button className="button button-primary" onClick={continueTraining}>{completed >= scenarios.length ? 'See my progress' : 'Next message'}<ArrowRight size={21}/></button></div>
        </>}
      </div>

      <aside className="training-sidebar">
        {!attempt ? <div className="pause-card"><span className="pause-icon"><Lightbulb size={30} strokeWidth={1.6}/><Sparkles className="bulb-spark" size={13}/></span><div className="eyebrow">YOUR INNER SCAM RADAR</div><h2>Pause. Think.<br/>Then decide.</h2><p>You don’t need to be an expert.<br/>Just ask yourself:</p><ul><li><span>1</span>Is someone rushing me?</li><li><span>2</span>Are they asking for money<br/>or private information?</li><li><span>3</span>Can I check another way?</li></ul><div className="pause-bottom"><ShieldCheck size={19}/><span>A moment of caution<br/>can make all the difference.</span></div></div> : <details className="result-message-review" open><summary>The message you practised <ChevronDown size={19}/></summary><MessageCard scenario={scenario} compact/></details>}
        <div className="practice-stats-card"><div className="practice-stats-top"><span className="level-icon"><Trophy size={21}/></span><div><strong>Level {stats.level}</strong><span>{getLevelName(stats.level)}</span></div><span className="level-xp">{stats.xp} XP</span></div><div className="level-progress" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={50} aria-valuenow={stats.levelProgress}><span style={{ width: `${stats.levelProgress / 50 * 100}%` }}/></div><div className="level-bottom"><span>{stats.nextLevelXp} XP to Level {stats.level + 1}</span><span><Flame size={17}/> {stats.streak} in a row</span></div></div>
        <div className={`adaptive-card ${weakness ? 'has-practice-area' : ''}`}><div><Target size={22}/><strong>{attempt && weakness ? (weakness.repeated ? 'Your practice area' : 'A little more practice') : session.current.kind === 'practice' ? 'Picked for you' : 'Practice that adapts'}</strong></div><p>{attempt && weakness ? `Let’s keep an eye on ${weakness.category}. ${weakness.repeated ? 'We noticed this pattern more than once, so future practice will give it extra attention.' : 'One mistake is useful feedback. Your next message will revisit this area when a new example is available.'}` : session.current.reason}</p>{weakness && <span className="practice-area-chip">{weakness.repeated ? 'Practice area:' : 'Revisit:'} {weakness.category}</span>}</div>
        <div className="sidebar-links"><Link href="/dashboard"><ChartNoAxesCombined size={18}/> View my progress <ArrowRight size={16}/></Link><button onClick={() => setHelp(true)}><CircleHelp size={18}/> Need a hand?</button></div>
      </aside>
    </div>
    <HelpModal open={help} onClose={() => setHelp(false)}/>
  </main>;
}

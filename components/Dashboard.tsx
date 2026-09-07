'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Award, Check, CheckCircle2, ChevronDown, CircleHelp, Flame, Leaf, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, Sprout, Target, Trophy, Zap } from 'lucide-react';
import { useProgress } from './ProgressProvider';
import { getCategoryStats, getLevelName, getStats, getStrongest, getTechniqueWeaknesses, getWeakness } from '@/lib/engine';
import { getScenario, scenarios } from '@/lib/scenarios';
import { BrandMark, CategoryIcon, Modal } from './ui';

export function Dashboard() {
  const { progress, ready, begin, next, reset } = useProgress();
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const stats = getStats(progress.history);
  const categoryStats = getCategoryStats(progress.history);
  const weakness = getWeakness(progress.history);
  const strongest = getStrongest(progress.history);
  const techniques = getTechniqueWeaknesses(progress.history);
  const session = progress.session;
  const sessionComplete = session?.completedIds.length === scenarios.length;
  const sessionHistory = progress.history.filter((a) => a.sessionId === session?.id);
  const inProgress = Boolean(session && !sessionComplete);
  const start = () => {
    if (!session || sessionComplete) begin();
    else if (session.completedIds.includes(session.current.scenarioId)) next();
    router.push('/training');
  };
  const circumference = 2 * Math.PI * 77;
  const recent = [...progress.history].reverse().slice(0, showAll ? 20 : 5);
  const levelName = getLevelName(stats.level);

  if (!ready) return <main id="main-content" className="container loading-main"><div className="loading-shield"><ShieldCheck size={38}/></div><h1>Finding your progress…</h1></main>;

  return <main id="main-content" className="dashboard-main container">
    {resetNotice && <div className="reset-notice" role="status"><CheckCircle2 size={20}/> A fresh start. Your practice progress has been reset.</div>}
    {sessionComplete && <div className="completion-banner"><span className="completion-icon"><Trophy size={30}/></span><div><strong>Ten messages. A little more peace of mind.</strong><p>Session complete! You earned {sessionHistory.filter((a) => a.correct).length * 10} XP this round. Keep those good habits going.</p></div><Sparkles className="completion-sparkles" size={30}/></div>}
    <div className="dashboard-heading"><div><div className="eyebrow">YOUR CONFIDENCE JOURNEY</div><h1>{stats.total ? 'Look how far you’ve come.' : 'Your confidence starts here.'}</h1><p>{stats.total ? 'Small steps add up. Here’s what your practice is teaching you.' : 'Your first step is a simple one. A safe message. A chance to learn.'}</p></div><button className="button button-primary" onClick={start}>{inProgress ? 'Continue Training' : stats.total ? 'Practise Again' : 'Start Training'}<ArrowRight size={20}/></button></div>

    <section className="dashboard-overview" aria-label="Your practice statistics">
      <div className="resilience-card"><div className="resilience-card-header"><span><ShieldCheck size={21}/> Your resilience score</span><button className="icon-button" onClick={() => setScoreOpen(true)} aria-label="How is my resilience score calculated?"><CircleHelp size={20}/></button></div><div className="resilience-main"><div className="score-ring"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="77" className="score-track"/><circle cx="90" cy="90" r="77" className="score-fill" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - stats.resilience / 100)} transform="rotate(-90 90 90)"/></svg><div className="score-number"><strong>{stats.total ? stats.resilience : '–'}</strong><span>out of 100</span></div></div><div className="resilience-copy"><span className="resilience-leaf"><Sprout size={24}/></span><h2>{!stats.total ? <>Ready<br/>to grow.</> : stats.resilience >= 80 ? <>Confidence<br/>is growing.</> : stats.resilience >= 60 ? <>Building<br/>good instincts.</> : <>A good<br/>beginning.</>}</h2><p>{stats.total ? 'Every lesson is a step forward.' : 'A little practice makes a difference.'}</p></div></div><div className="resilience-footnote"><Leaf size={15}/> A practice indicator, not a safety guarantee.</div></div>
      <div className="metric-grid">
        <div className="metric-card"><span className="metric-icon metric-gold"><Zap size={23}/></span><div className="metric-value">{stats.xp}<span> XP</span></div><h2>Total experience</h2><p>+10 XP for each correct answer</p></div>
        <div className="metric-card"><span className="metric-icon metric-green"><CheckCircle2 size={23}/></span><div className="metric-value">{stats.total}</div><h2>Scenarios completed</h2><p>{session ? `${session.completedIds.length} of 10 in this session` : '10 messages in your first session'}</p></div>
        <div className="metric-card"><span className="metric-icon metric-purple"><Target size={23}/></span><div className="metric-value">{stats.total ? stats.accuracy : '–'}<span>{stats.total ? '%' : ''}</span></div><h2>Answer accuracy</h2><p>{stats.total ? `${stats.correct} of ${stats.total} answers correct` : 'Build your instincts with practice'}</p></div>
        <div className="metric-card"><span className="metric-icon metric-orange"><Flame size={23}/></span><div className="metric-value">{stats.streak}<span> {stats.streak === 1 ? 'answer' : 'answers'}</span></div><h2>Current streak</h2><p>{stats.bestStreak ? `Personal best: ${stats.bestStreak} in a row` : 'Correct answers in a row'}</p></div>
      </div>
    </section>

    <section className="level-banner" aria-label="Your level"><span className="level-badge"><Trophy size={28}/></span><div className="level-banner-copy"><span>LEVEL {stats.level}</span><h2>{levelName}</h2></div><div className="level-banner-progress"><div><span>Your next little milestone</span><strong>{stats.levelProgress} / 50 XP</strong></div><div className="level-progress" role="progressbar" aria-label="Experience toward next level" aria-valuemin={0} aria-valuemax={50} aria-valuenow={stats.levelProgress}><span style={{ width: `${stats.levelProgress * 2}%` }}/></div></div><span className="next-level-label">{stats.nextLevelXp} XP to Level {stats.level + 1} <Sparkles size={19}/></span></section>

    <div className="dashboard-learning-grid">
      <section className="learning-map"><div className="card-section-heading"><div><h2>Your learning map</h2><p>Everyday situations. Stronger instincts.</p></div><span className="explored-badge">{stats.practicedCategories} of 8 explored</span></div><div className="learning-map-list">{categoryStats.map((category) => <div className="learning-category" key={category.category}><span className={`learning-category-icon ${category.attempts ? 'explored' : ''}`}><CategoryIcon category={category.category} size={22}/></span><div className="learning-category-name"><h3>{category.category === 'Account security' ? 'Account alerts' : category.category}</h3><span>{category.attempts ? `${category.correct} of ${category.attempts} correct` : 'Not practised yet'}</span></div><div className="category-mastery"><span className={category.needsPractice ? 'practice-needed' : category.attempts ? 'on-track' : 'not-tried'}>{category.needsPractice ? 'Keep practising' : category.attempts ? 'Good progress' : 'A new opportunity'}</span><div className="category-mastery-bar"><span className={category.needsPractice ? 'warm' : ''} style={{ width: `${category.accuracy}%` }}/></div></div></div>)}</div></section>

      <aside className="insights-column">
        <section className="focus-area-card"><div className="focus-area-top"><span><Target size={28}/></span><span className="eyebrow">{weakness ? 'CURRENT PRACTICE AREA' : 'YOUR NEXT SMALL STEP'}</span></div><h2>{weakness ? weakness.category : stats.total ? 'Keep your curiosity.' : 'Start with one message.'}</h2><p>{weakness ? weakness.repeated ? 'This pattern has been tricky more than once. We’ll give it extra attention in future practice, one safe example at a time.' : 'One mistake is a clue, not a setback. We’ll revisit this area when another example is available, or practise a similar pattern.' : stats.total ? 'You’re noticing the right things. Keep exploring different messages to build a broader set of instincts.' : 'Try an everyday bank message. We’ll guide you through the warning signs, whatever you choose.'}</p>{weakness && <span className="focus-misses">{weakness.recentMisses} {weakness.recentMisses === 1 ? 'miss' : 'misses'} in your last {Math.min(weakness.attempts, 3)} {weakness.category} {Math.min(weakness.attempts, 3) === 1 ? 'attempt' : 'attempts'}</span>}<button className="focus-practice-button" onClick={start}>{stats.total ? 'Keep practising' : 'Try my first message'}<ArrowRight size={20}/></button><div className="rule-based-note"><Sparkles size={14}/> Picked by your practice, not by guesswork.</div></section>
        <section className="strongest-card"><span className="strongest-icon"><Award size={29}/></span><div><span className="eyebrow">STRONGEST CATEGORY</span><h2>{strongest ? strongest.category : 'Your first win awaits.'}</h2><p>{strongest ? `${strongest.correct} of ${strongest.attempts} correct. A habit worth keeping.` : 'Keep practising. Your strengths will appear here.'}</p></div></section>
        {techniques.length > 0 && <section className="patterns-card"><h3>Patterns to keep an eye on</h3><div>{techniques.slice(0, 3).map((pattern) => <span key={pattern.technique}>{pattern.technique}<small>{pattern.count}</small></span>)}</div><p>Patterns in your missed answers, from your last 20 attempts.</p></section>}
      </aside>
    </div>

    <section className="recent-practice"><div className="card-section-heading"><div><h2>Your recent practice</h2><p>Every try is progress. Even the tricky ones.</p></div><span className="recent-total">{stats.total} {stats.total === 1 ? 'message' : 'messages'} practised</span></div>{!recent.length ? <div className="empty-history"><span><MessagePreviewIcon/></span><h3>A fresh page for your progress.</h3><p>Finish your first message and your learning journey will appear here.</p><button className="text-button" onClick={start}>Let’s make a start <ArrowRight size={18}/></button></div> : <><ul className="recent-list">{recent.map((attempt) => { const scenario = getScenario(attempt.scenarioId)!; return <li key={`${attempt.sessionId}-${attempt.scenarioId}`}><span className={`recent-result-icon ${attempt.correct ? 'correct' : 'lesson'}`}>{attempt.correct ? <Check size={21}/> : <Sprout size={21}/>}</span><div className="recent-message-title"><h3>{scenario.title}</h3><p>{scenario.category} <span>·</span> {scenario.correctAnswer === 'SUSPICIOUS' ? 'Suspicious message' : 'Safe message'}</p></div><span className={`recent-status ${attempt.correct ? 'correct' : 'lesson'}`}>{attempt.correct ? 'Well spotted' : 'A learning moment'}</span><span className={`recent-xp ${attempt.correct ? 'earned' : ''}`}>{attempt.correct ? '+10' : '0'} XP</span></li>; })}</ul>{stats.total > 5 && <button className="show-history-button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? 'Show less' : `Show ${Math.min(stats.total, 20)} recent messages`}<ChevronDown className={showAll ? 'rotated' : ''} size={18}/></button>}</>}
    </section>
    <div className="dashboard-bottom"><span><LockKeyhole size={16}/> Your progress is saved in this browser. No account needed.</span><button onClick={() => setResetOpen(true)}><RotateCcw size={16}/> Reset my progress</button></div>

    <Modal open={scoreOpen} onClose={() => setScoreOpen(false)} title="A score for practice, not a promise"><div className="modal-hero-icon"><ShieldCheck size={34}/></div><p>Your resilience score is a simple learning indicator. It is not a prediction of whether you will be scammed.</p><div className="score-formula"><div><strong>70%</strong><span>Answer accuracy<br/><small>Correct answers ÷ all answers</small></span></div><span>+</span><div><strong>30%</strong><span>Variety of practice<br/><small>Categories tried ÷ 8 categories</small></span></div></div><p>We combine these two parts and round to a score out of 100. No score is shown before your first answer. Your lifetime practice results are used.</p><p className="muted-note">Your level goes up every 50 XP. Each correct answer earns 10 XP; mistakes earn helpful lessons, not penalties. A new mistake or two misses in the last three attempts highlights a practice area. Two recent correct answers in that category clear it.</p><button className="button button-primary full-width" onClick={() => setScoreOpen(false)}>That makes sense <Check size={20}/></button></Modal>
    <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Ready for a fresh start?"><div className="modal-hero-icon warm-icon"><RotateCcw size={32}/></div><p>This will remove all your practice answers, XP, levels, and learning history from this browser. Your text-size setting will stay the same.</p><p><strong>This cannot be undone.</strong> You can also start a new session without resetting your progress.</p><div className="modal-actions"><button className="button button-secondary" onClick={() => setResetOpen(false)}>Keep my progress</button><button className="button button-danger" onClick={() => { reset(); setResetOpen(false); setResetNotice(true); setShowAll(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}>Yes, reset progress</button></div></Modal>
  </main>;
}
function MessagePreviewIcon() { return <BrandMark size={43}/>; }

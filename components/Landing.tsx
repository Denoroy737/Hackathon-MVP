'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowRight, Check, CheckCheck, CheckCircle2, ChevronRight, Clock3, HeartHandshake, LockKeyhole, MessageCircle, MessageSquareText, ShieldAlert, ShieldCheck, Sparkles, Sprout, Target, Zap } from 'lucide-react';
import { useProgress } from './ProgressProvider';
import { BrandMark, CategoryIcon, SafetyModal } from './ui';
import { categories, scenarios } from '@/lib/scenarios';
import { getStats } from '@/lib/engine';

function PracticeIllustration() {
  return <div className="practice-illustration" role="img" aria-label="A preview of a safe practice message: an urgent bank warning, identified as suspicious, with 10 experience points earned.">
    <div className="scene-grid" /><div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
    <svg className="scene-spark spark-one" width="31" height="31" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1c0 10-5 15-15 15 10 0 15 5 15 15 0-10 5-15 15-15C21 16 16 11 16 1Z" fill="currentColor"/></svg>
    <svg className="scene-spark spark-two" width="19" height="19" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1c0 10-5 15-15 15 10 0 15 5 15 15 0-10 5-15 15-15C21 16 16 11 16 1Z" fill="currentColor"/></svg>
    <div className="scene-safety"><span><ShieldCheck size={20} /></span>Real-life lessons.<br /><strong>Zero real-life risk.</strong></div>
    <div className="practice-phone" aria-hidden="true">
      <div className="phone-hardware"><span>9:41</span><div className="phone-island"/><div className="phone-indicators"><i/><i/><i/><span/></div></div>
      <div className="phone-app-header"><BrandMark size={22} /><span>A little practice</span><span className="preview-dots">•••</span></div>
      <div className="phone-screen">
        <div className="phone-preview-label"><span className="tiny-dot" /> SAFE SIMULATION</div>
        <div className="phone-sender"><div className="phone-sender-icon"><MessageSquareText size={22} /></div><div><strong>Bank alert</strong><span>Text message · Just now</span></div></div>
        <div className="phone-message">Your account will be <mark>blocked today.</mark> Verify your KYC <mark>immediately</mark> to keep it active.<span className="preview-fake-link">verify-kyc.example <ChevronRight size={12} /></span><span className="message-time">9:41 AM <CheckCheck size={12}/></span></div>
        <p className="phone-question">What does your instinct say?</p>
        <div className="phone-answers"><span><ShieldCheck size={17} /> Safe</span><span className="selected"><ShieldAlert size={17} /> Suspicious <Check size={13}/></span></div>
        <div className="phone-bottom-line"><LockKeyhole size={11} /> No real links. Just real learning.</div>
      </div>
      <div className="phone-home-indicator" />
    </div>
    <div className="red-flag-note"><span className="flag-note-dot"/><span>A rush to act?<br /><strong>That’s a red flag.</strong></span><svg width="83" height="56" viewBox="0 0 83 56" fill="none" aria-hidden="true"><path d="M80 2C80 40 38 50 3 49m0 0 9-8m-9 8 11 5" stroke="#A56C3D" strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round"/></svg></div>
    <div className="confidence-toast"><span className="toast-check"><Check size={24} strokeWidth={2.5}/></span><div><strong>That’s a sharp eye!</strong><span>You spotted the warning signs.</span></div><span className="toast-xp"><Zap size={16} fill="currentColor"/> +10 XP</span></div>
  </div>;
}

export function Landing() {
  const { progress, begin } = useProgress();
  const router = useRouter();
  const [safety, setSafety] = useState(false);
  const inProgress = Boolean(progress.session && progress.session.completedIds.length < scenarios.length);
  const stats = getStats(progress.history);
  const start = () => { begin(); router.push('/training'); };
  return <main id="main-content" className="landing-main">
    <section className="hero container">
      <div className="hero-copy">
        <div className="eyebrow hero-eyebrow"><span className="eyebrow-spark"><Sparkles size={15} /></span> A SAFER DIGITAL LIFE STARTS HERE</div>
        <h1>A little practice.<br />A lot more<br /><span className="hero-highlight">peace of mind.<svg viewBox="0 0 450 17" preserveAspectRatio="none" aria-hidden="true"><path d="M3 11C102-1 295 0 445 10" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none"/></svg></span></h1>
        <p className="hero-tagline">Don’t just detect scams. Learn to recognize them.</p>
        <p className="hero-description">Practise with everyday messages. Spot the warning signs.<br className="desktop-break" /> Build the confidence to stay one step ahead.</p>
        <div className="hero-actions"><button className="button button-primary button-hero" onClick={start}>{inProgress ? 'Continue Training' : stats.total ? 'Practise Again' : 'Start Training'} <ArrowRight size={22}/></button><a className="how-link" href="#how-it-works">How it works <span><ArrowDown size={19}/></span></a></div>
        <div className="hero-reassurance"><span><CheckCircle2 size={17}/> No sign-up needed</span><span><Clock3 size={17}/> About 10 minutes</span></div>
        {inProgress && <Link href="/dashboard" className="resume-note">Welcome back! {progress.session!.completedIds.length} of 10 messages practised. Your progress is saved. <ChevronRight size={15}/></Link>}
      </div>
      <PracticeIllustration />
    </section>

    <section className="trust-strip container" aria-label="Practice at a glance">
      <div className="trust-item"><span className="trust-icon mint"><MessageSquareText size={27} strokeWidth={1.6}/></span><div><strong>Real messages. Safe practice.</strong><p>10 everyday scenarios. No real-world risk.</p></div></div>
      <div className="trust-item"><span className="trust-icon sand"><Target size={28} strokeWidth={1.6}/></span><div><strong>Learning that adapts to you.</strong><p>Your mistakes guide what you practise next.</p></div></div>
      <div className="trust-item"><span className="trust-icon lilac"><Sprout size={28} strokeWidth={1.6}/></span><div><strong>Confidence, not complexity.</strong><p>Simple steps. Clear advice. At your pace.</p></div></div>
    </section>

    <section id="how-it-works" className="how-section container">
      <div className="section-heading"><div><div className="eyebrow">SMALL STEPS. STRONGER INSTINCTS.</div><h2>A little wiser in three simple steps.</h2></div><span className="section-aside"><HeartHandshake size={20}/> No pressure. Just progress.</span></div>
      <div className="steps-grid">
        <article className="step-card"><div className="step-top"><span className="step-number">01</span><span className="step-illustration"><MessageCircle size={33} strokeWidth={1.4}/><span className="mini-message"/></span></div><h3>Read a message</h3><p>A bank alert. A WhatsApp forward.<br/>A message that feels like everyday life.</p></article>
        <article className="step-card"><div className="step-top"><span className="step-number">02</span><span className="step-illustration"><ShieldCheck size={34} strokeWidth={1.4}/><span className="mini-spark">✧</span></span></div><h3>Make your call</h3><p>Safe or suspicious? Take a moment<br/>and choose what feels right.</p></article>
        <article className="step-card"><div className="step-top"><span className="step-number">03</span><span className="step-illustration"><Sprout size={35} strokeWidth={1.4}/><span className="mini-spark">✧</span></span></div><h3>Learn. Grow. Repeat.</h3><p>Understand the clues, earn XP, and get<br/>practice that grows with you.</p></article>
      </div>
    </section>

    <section className="category-section container">
      <div className="category-intro"><span className="eyebrow">FAMILIAR SITUATIONS. FRESH PERSPECTIVE.</span><h2>Scams come in many disguises.<br/>Let’s get to know them.</h2><p>From a bank message to a “too good to be true” offer, practise the moments that matter.</p></div>
      <div className="category-chips">{categories.map((category) => <div className="category-chip" key={category}><CategoryIcon category={category}/><span>{category === 'Account security' ? 'Account alerts' : category}</span></div>)}</div>
    </section>

    <section className="bottom-cta container"><div className="cta-shield"><BrandMark size={66}/><span className="cta-shield-spark">✧</span></div><div><h2>You don’t have to be tech-savvy.<br/>Just a little scam-savvy.</h2><p>A safe space to learn. A good habit for life.</p></div><div className="bottom-cta-action"><button className="button button-primary" onClick={start}>{inProgress ? 'Continue Training' : 'Let’s practise together'} <ArrowRight size={21}/></button><button className="safety-text-button" onClick={() => setSafety(true)}><LockKeyhole size={15}/> Always safe. Always simulation.</button></div></section>
    <SafetyModal open={safety} onClose={() => setSafety(false)}/>
  </main>;
}

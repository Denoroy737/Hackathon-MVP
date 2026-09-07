'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Accessibility, Check, CircleHelp, Menu, X } from 'lucide-react';
import { useProgress } from './ProgressProvider';
import { BrandMark, HelpModal, SafetyModal } from './ui';

export function Header() {
  const pathname = usePathname();
  const { progress, toggleText, storageAvailable, begin } = useProgress();
  const [help, setHelp] = useState(false);
  const [mobile, setMobile] = useState(false);
  const nav = [{ href: '/', label: 'Home' }, { href: '/training', label: 'Practice' }, { href: '/dashboard', label: 'My progress' }];
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="site-header">
      <div className="header-inner container">
        <Link href="/" className="brand" aria-label="Suraksha Coach home" onClick={() => setMobile(false)}><BrandMark /><span>Suraksha<span className="brand-coach">Coach</span></span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => { if (item.href === '/training') begin(); }} className={pathname === item.href ? 'nav-link active' : 'nav-link'} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}</nav>
        <div className="header-actions">
          <button className={`text-size-button ${progress.largeText ? 'enabled' : ''}`} onClick={toggleText} aria-pressed={progress.largeText} aria-label={progress.largeText ? 'Use standard text size' : 'Use larger text'} title="Change text size"><span className="text-size-symbol" aria-hidden="true">A<span>+</span></span><span className="text-size-label">Larger text</span>{progress.largeText && <Check size={16} aria-hidden="true" />}</button>
          <button className="icon-button help-button" onClick={() => setHelp(true)} aria-label="How to use Suraksha Coach" title="Need a hand?"><CircleHelp size={23} strokeWidth={1.7} /></button>
          <button className="icon-button mobile-menu-button" onClick={() => setMobile(!mobile)} aria-expanded={mobile} aria-controls="mobile-nav" aria-label={mobile ? 'Close menu' : 'Open menu'}>{mobile ? <X /> : <Menu />}</button>
        </div>
      </div>
      {mobile && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => { setMobile(false); if (item.href === '/training') begin(); }} className={pathname === item.href ? 'active' : ''} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}<button onClick={() => { setHelp(true); setMobile(false); }}><CircleHelp size={20} /> Need a hand?</button></nav>}
    </header>
    {!storageAvailable && <div className="storage-notice" role="status">Your browser is not allowing saved progress. You can still practise, but progress will be lost when you refresh.</div>}
    <HelpModal open={help} onClose={() => setHelp(false)} />
  </>;
}

export function Footer() {
  const [safety, setSafety] = useState(false);
  return <footer className="site-footer"><div className="container footer-inner"><div className="footer-message"><BrandMark size={24} /><span>A little more aware. A lot more confident.</span></div><div className="footer-right"><span className="made-for"><Accessibility size={17} aria-hidden="true" /> Made for everyone</span><span className="footer-divider" /><button onClick={() => setSafety(true)}>Our safety promise</button></div></div><SafetyModal open={safety} onClose={() => setSafety(false)} /></footer>;
}

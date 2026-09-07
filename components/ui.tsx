'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight, Banknote, CircleHelp, Headphones, Landmark, LockKeyhole, MessageCircle, Package, ShieldCheck, Smartphone, TrendingUp, X, type LucideIcon } from 'lucide-react';
import type { Category } from '@/lib/scenarios';

export function BrandMark({ size = 43 }: { size?: number }) {
  return <svg width={size} height={size + 3} viewBox="0 0 44 47" fill="none" aria-hidden="true"><path d="M22 2 40 8.5v13.2c0 11.6-8.2 19.1-18 23.3C12.2 40.8 4 33.3 4 21.7V8.5L22 2Z" fill="currentColor"/><path d="m14 23 5.3 5.4L31 16.8" stroke="#E3F3CB" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 7 35.5 12v9.7" stroke="#BFE2C2" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
export const categoryIcons: Record<Category, LucideIcon> = {
  'Bank & KYC': Landmark, 'UPI & OTP': Smartphone, 'WhatsApp': MessageCircle, 'Customer support': Headphones, 'Delivery': Package, 'Government': Landmark, 'Investment': TrendingUp, 'Account security': LockKeyhole,
};
export function CategoryIcon({ category, size = 22 }: { category: Category; size?: number }) {
  const Icon = categoryIcons[category] || Banknote;
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}
export function Arrow({ size = 20 }: { size?: number }) { return <ArrowRight size={size} aria-hidden="true" />; }

export function Modal({ open, onClose, title, children, className = '' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onCancel={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-inner">
      <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={24} /></button>
      <h2>{title}</h2>
      {children}
    </div>
  </dialog>;
}

export function SafetyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title="A safe place to practise">
    <div className="modal-hero-icon"><ShieldCheck size={34} /></div>
    <p>Learning should never put you at risk. Here is our promise.</p>
    <ul className="promise-list">
      <li><ShieldCheck /><div><strong>Every message is a simulation.</strong><span>All scenarios are made up for practice. No message can contact a bank, a business, or another person.</span></div></li>
      <li><LockKeyhole /><div><strong>No real links. No private details.</strong><span>Practice addresses end in .example and are not clickable. We never ask you to enter an OTP, password, bank detail, or make a payment.</span></div></li>
      <li><Smartphone /><div><strong>Your progress stays with you.</strong><span>No account is needed. Results are saved in this browser only. Clearing your browser data will remove them.</span></div></li>
    </ul>
    <p className="muted-note">Optional AI coaching, when configured, receives only the practice scenario and anonymous answer counts. It never decides whether your answer is correct. Practice scores are learning indicators, not a guarantee of online safety.</p>
    <button className="button button-primary full-width" onClick={onClose}>Got it <Arrow /></button>
  </Modal>;
}

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title="You can take your time">
    <div className="modal-hero-icon"><CircleHelp size={34} /></div>
    <p>There is no timer, and it is okay to get something wrong. That is how we learn.</p>
    <ol className="help-steps">
      <li><span>1</span><div><strong>Read the practice message.</strong><p>Imagine it has arrived on your phone.</p></div></li>
      <li><span>2</span><div><strong>Choose Safe or Suspicious.</strong><p>Safe means there is no risky request in this message. Suspicious means you should pause and check.</p></div></li>
      <li><span>3</span><div><strong>Read the explanation.</strong><p>Learn what to look out for, then try the next message. Your progress saves automatically.</p></div></li>
    </ol>
    <button className="button button-primary full-width" onClick={onClose}>I’m ready <Arrow /></button>
  </Modal>;
}

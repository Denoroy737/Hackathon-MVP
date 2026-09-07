'use client';

import { CheckCheck, Headphones, Landmark, LockKeyhole, MessageCircle, MessageSquareText, ShieldCheck, UserRound } from 'lucide-react';
import { type Scenario } from '@/lib/scenarios';
import { CategoryIcon } from './ui';

export function MessageCard({ scenario, compact = false }: { scenario: Scenario; compact?: boolean }) {
  const FormatIcon = scenario.format === 'WhatsApp' ? MessageCircle : scenario.format === 'Support chat' ? Headphones : scenario.format === 'Bank notification' ? Landmark : MessageSquareText;
  const isChat = scenario.format === 'WhatsApp' || scenario.format === 'Support chat';
  return <div className={`message-card ${compact ? 'compact' : ''}`}>
    <div className="message-card-top"><div className="format-label"><FormatIcon size={20}/><span>{scenario.format}</span>{!compact && <span className="inline-category"><span>·</span>{scenario.category}</span>}</div><span className="simulation-pill"><ShieldCheck size={14}/> Practice only</span></div>
    <div className={`message-simulation ${isChat ? 'chat-simulation' : ''}`}>
      <div className="message-sender"><div className="sender-avatar">{scenario.avatar === 'user' ? <UserRound size={25}/> : <CategoryIcon category={scenario.category} size={25}/>}</div><div><strong>{scenario.sender}</strong><span>{scenario.senderDetail}</span></div></div>
      <div className="message-date">Today, {scenario.time}</div>
      <div className="message-bubbles">{scenario.messages.map((message, index) => <div className={`message-bubble ${message.from === 'you' ? 'outgoing' : ''}`} key={index}>
        {message.from === 'you' && <span className="scripted-reply">You · scripted reply</span>}
        <p>{message.text}</p>
        {message.link && <span className="simulated-link" aria-label={`Fictional non-clickable practice address: ${message.link}`}>{message.link}<span className="link-disabled-label">Not a real link</span></span>}
        {isChat && <span className="bubble-ticks">{scenario.time}<CheckCheck size={15}/></span>}
      </div>)}</div>
    </div>
    <div className="simulation-caption"><LockKeyhole size={15}/><span>Made up for learning. No real links or transactions.</span></div>
  </div>;
}

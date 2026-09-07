export type Answer = 'SAFE' | 'SUSPICIOUS';
export type Category = 'Bank & KYC' | 'UPI & OTP' | 'WhatsApp' | 'Customer support' | 'Delivery' | 'Government' | 'Investment' | 'Account security';
export type Technique = 'Urgency' | 'Threats' | 'Fake authority' | 'Private information' | 'Unexpected payment' | 'Impersonation' | 'Too-good-to-be-true offers' | 'Unverified links' | 'Remote access' | 'Recognising safe messages';
export type Message = { text: string; from?: 'sender' | 'you'; link?: string };
export type Signal = { title: string; description: string; technique?: Technique };
export type Scenario = {
  id: string;
  category: Category;
  title: string;
  format: 'SMS' | 'WhatsApp' | 'Bank notification' | 'Support chat';
  sender: string;
  senderDetail: string;
  avatar: string;
  time: string;
  messages: Message[];
  correctAnswer: Answer;
  redFlags: Signal[];
  safeSignals: Signal[];
  difficulty: 1 | 2 | 3;
  explanation: string;
  saferAction: string;
  coachTip: string;
};

export const categories: Category[] = ['Bank & KYC', 'UPI & OTP', 'WhatsApp', 'Customer support', 'Delivery', 'Government', 'Investment', 'Account security'];

// All content is authored simulation data. .example is a reserved, non-public domain.
// Correctness is always determined here, never by a language model.
export const scenarios: Scenario[] = [
  {
    id: 'bank-kyc', category: 'Bank & KYC', title: 'The urgent KYC update', format: 'SMS',
    sender: 'SBI KYC Desk', senderDetail: 'Service message', avatar: 'bank', time: '10:42 AM', difficulty: 1,
    messages: [{ text: 'Dear customer, your SBI account will be BLOCKED today due to incomplete KYC. Verify your details within 2 hours to keep your account active.', link: 'sbi-kyc-update.example' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'A ticking clock', description: '“Within 2 hours” pushes you to act before you can think.', technique: 'Urgency' },
      { title: 'A threat to your money', description: 'The message tries to frighten you with an account block.', technique: 'Threats' },
      { title: 'A name is not proof', description: 'Anyone can claim to be your bank in a message.', technique: 'Fake authority' },
      { title: 'An unverified link', description: 'You are being sent to a link instead of your usual banking app.', technique: 'Unverified links' },
    ], safeSignals: [],
    explanation: 'This is a scam simulation. The threat and short deadline are designed to rush you into an unverified link.',
    saferAction: 'Do not use the message link. Open your usual banking app yourself, or call the number printed on your bank card.',
    coachTip: 'A bank name in a message is not proof. Pause, then check through a channel you already trust.',
  },
  {
    id: 'upi-refund', category: 'UPI & OTP', title: 'A refund with a catch', format: 'WhatsApp',
    sender: 'Refund Helpdesk', senderDetail: 'Business account', avatar: 'rupee', time: '11:15 AM', difficulty: 1,
    messages: [{ text: 'Good news! Your ₹2,500 refund is ready. 🎉' }, { text: 'We have sent a UPI collect request. Tap “Pay” and enter your UPI PIN to RECEIVE your refund. It expires in 5 minutes.' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'Paying to receive money', description: 'A collect request asks you to pay. It does not give you a refund.', technique: 'Unexpected payment' },
      { title: 'An unnecessary PIN', description: 'You do not need to enter a UPI PIN just to receive a payment.', technique: 'Private information' },
      { title: 'A rushed decision', description: 'The five-minute deadline is there to stop you checking.', technique: 'Urgency' },
    ], safeSignals: [],
    explanation: 'This is a scam. Approving that collect request would send money out of your account, not bring a refund in.',
    saferAction: 'Decline the collect request. Check refunds inside the original shop or payment app, not through an unexpected message.',
    coachTip: 'Remember: a UPI PIN authorises money leaving your account. A normal incoming payment does not need your PIN.',
  },
  {
    id: 'upi-otp', category: 'UPI & OTP', title: 'The helpful caller', format: 'Support chat',
    sender: 'UPI Resolution Team', senderDetail: 'Payment support', avatar: 'headset', time: '11:28 AM', difficulty: 2,
    messages: [{ from: 'sender', text: 'Hello! We noticed your payment failed. I can help you get the money back.' }, { from: 'you', text: 'What do I need to do?' }, { from: 'sender', text: 'Tell me the OTP that arrives on your phone so I can verify and release the refund. Please stay in this chat.' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'Asking for an OTP', description: 'An OTP is private. A support agent should not ask you to tell it to them.', technique: 'Private information' },
      { title: 'Borrowed authority', description: 'The name “Resolution Team” does not prove who is behind the chat.', technique: 'Impersonation' },
      { title: 'Help you did not request', description: 'Unexpected refund help is a reason to verify independently.', technique: 'Fake authority' },
    ], safeSignals: [],
    explanation: 'This is a scam. The friendly offer of help is a way to get a private security code from you.',
    saferAction: 'Do not share an OTP, PIN, or password with anyone. End the chat and find support inside your payment app.',
    coachTip: 'Helpful wording can hide an unsafe request. Look at what the person wants you to do, not how friendly they sound.',
  },
  {
    id: 'whatsapp-family', category: 'WhatsApp', title: 'A familiar voice, a new number', format: 'WhatsApp',
    sender: 'New contact', senderDetail: 'Not in your contacts', avatar: 'user', time: '2:06 PM', difficulty: 2,
    messages: [{ text: 'Hi Maa, it’s me. My phone broke so I’m using a friend’s number.' }, { text: 'I need ₹8,000 urgently for a hospital bill. Please send it now. I can’t take a call, and don’t tell anyone yet.' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'An unverified identity', description: 'The sender says they are family, but is using an unfamiliar number.', technique: 'Impersonation' },
      { title: 'Emotional pressure', description: 'An urgent hospital bill is meant to make you act in a panic.', technique: 'Urgency' },
      { title: 'No chance to check', description: 'Refusing a call and asking for secrecy keep you from verifying.', technique: 'Unexpected payment' },
    ], safeSignals: [],
    explanation: 'This is an impersonation scam. A story about an emergency does not confirm the sender is your family member.',
    saferAction: 'Call your family member on the number you already know, or check with another relative before sending money.',
    coachTip: 'Pause even when a message feels personal. A quick call to a saved number can break the scammer’s story.',
  },
  {
    id: 'support-remote', category: 'Customer support', title: 'More access than they need', format: 'Support chat',
    sender: 'QuickPay Support', senderDetail: 'Customer care agent', avatar: 'headset', time: '3:20 PM', difficulty: 2,
    messages: [{ from: 'you', text: 'I found this helpdesk in a comment. Can you check my payment?' }, { from: 'sender', text: 'Of course. Install our screen-sharing app and allow full remote control. Then open your banking app so we can fix the issue for you.' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'Control of your phone', description: 'Remote control can let a stranger see or operate your apps.', technique: 'Remote access' },
      { title: 'An unverified helpdesk', description: 'A contact in a public comment may be pretending to be support.', technique: 'Impersonation' },
      { title: 'Access to your banking app', description: 'A payment check should not mean giving a stranger control of your account.', technique: 'Private information' },
    ], safeSignals: [],
    explanation: 'This is fake support. Giving remote access could expose your account and let someone act on your behalf.',
    saferAction: 'End the chat and do not install anything. Use the help section inside the original payment app.',
    coachTip: 'Real-looking logos and support names are easy to copy. Start support conversations from the app or official site you already use.',
  },
  {
    id: 'delivery-update', category: 'Delivery', title: 'Your parcel is on its way', format: 'SMS',
    sender: 'ParcelPost', senderDetail: 'Delivery update', avatar: 'package', time: '9:30 AM', difficulty: 1,
    messages: [{ text: 'Your prepaid parcel is scheduled for delivery tomorrow between 10 AM and 2 PM. No payment or reply is needed. You can check the status in the shopping app where you placed your order.' }],
    correctAnswer: 'SAFE', redFlags: [],
    safeSignals: [
      { title: 'No money requested', description: 'There is no surprise delivery fee or payment request.' },
      { title: 'No private details', description: 'The message does not ask for an OTP, PIN, or password.' },
      { title: 'An independent way to check', description: 'It points you to the shopping app you already use, not a new link.' },
    ],
    explanation: 'This simulated message is safe to leave alone. It gives an update without asking you to pay, share details, or follow a link.',
    saferAction: 'If you are expecting a parcel, open your original shopping app to check it. No reply to this message is needed.',
    coachTip: 'Not every message is a scam. A simple update with no risky request can be left alone. A sender name still does not prove identity.',
  },
  {
    id: 'government-notice', category: 'Government', title: 'A pension office notice', format: 'SMS',
    sender: 'Local Pension Office', senderDetail: 'Public information', avatar: 'landmark', time: '10:05 AM', difficulty: 1,
    messages: [{ text: 'Information for pensioners: our office will be closed on Monday for maintenance. For service updates, visit your usual pension office during opening hours. No action, payment, or personal details are required for this notice.' }],
    correctAnswer: 'SAFE', redFlags: [],
    safeSignals: [
      { title: 'Information, not a demand', description: 'It shares an office update without threatening your pension.' },
      { title: 'No fee or form', description: 'You are not asked to transfer money or submit private information.' },
      { title: 'Check through a familiar place', description: 'You can verify with the office you already know.' },
    ],
    explanation: 'This simulated notice is safe to leave alone. It has no link, threat, payment request, or request for personal information.',
    saferAction: 'You do not need to reply. If the opening hours matter to you, confirm through your usual pension office.',
    coachTip: 'Judge the request, not just the official-sounding name. This notice asks for no risky action, but its sender name alone is not verification.',
  },
  {
    id: 'investment-returns', category: 'Investment', title: 'An exclusive opportunity', format: 'WhatsApp',
    sender: 'Wealth Circle VIP', senderDetail: 'Investment group', avatar: 'trending', time: '5:45 PM', difficulty: 3,
    messages: [{ text: 'Our private trading group has delivered 3% profit every day for 6 months. Your principal is 100% protected — zero risk.' }, { text: 'Members are sharing their payout screenshots! Transfer ₹5,000 to our manager’s personal UPI account to reserve one of today’s last 10 places.' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'Guaranteed big returns', description: 'High daily profits with “zero risk” are not a credible investment promise.', technique: 'Too-good-to-be-true offers' },
      { title: 'Screenshots are not proof', description: 'Payout images and group messages can be staged or edited.', technique: 'Fake authority' },
      { title: 'A personal payment account', description: 'You are being asked to send investment money to an individual.', technique: 'Unexpected payment' },
      { title: 'Artificial scarcity', description: '“Last 10 places” pressures you to skip independent checks.', technique: 'Urgency' },
    ], safeSignals: [],
    explanation: 'This is an investment scam. Unrealistic guarantees, social proof, and a personal payment request are a dangerous combination.',
    saferAction: 'Do not transfer money. Independently check the firm’s registration and speak to a qualified adviser before investing.',
    coachTip: 'A screenshot is not evidence of a safe investment. High returns always deserve careful, independent checks — especially when someone promises no risk.',
  },
  {
    id: 'account-suspension', category: 'Account security', title: 'The account warning', format: 'SMS',
    sender: 'MailBox Security', senderDetail: 'Account alert', avatar: 'lock', time: '8:12 PM', difficulty: 2,
    messages: [{ text: 'Security alert: your email account will be suspended in 30 minutes. We detected unusual activity. Log in through the recovery portal below and pay a ₹49 verification fee to prevent permanent deletion.', link: 'mailbox-recovery.example' }],
    correctAnswer: 'SUSPICIOUS',
    redFlags: [
      { title: 'A frightening deadline', description: 'The threat of permanent deletion is designed to make you panic.', technique: 'Threats' },
      { title: 'A surprising fee', description: 'A payment demand to keep an email account open is suspicious.', technique: 'Unexpected payment' },
      { title: 'A new login link', description: 'The message tries to move you away from your usual email app.', technique: 'Unverified links' },
    ], safeSignals: [],
    explanation: 'This is a scam. It uses an account warning to push you toward an unverified login page and a payment.',
    saferAction: 'Ignore the link. Open your email app yourself and check its account or security settings for genuine alerts.',
    coachTip: 'When an account warning arrives, take a different route: open the service yourself rather than using the route the message provides.',
  },
  {
    id: 'bank-statement', category: 'Bank & KYC', title: 'Your monthly statement', format: 'Bank notification',
    sender: 'Your banking app', senderDetail: 'In-app notification', avatar: 'bank', time: '9:00 AM', difficulty: 2,
    messages: [{ text: 'Your monthly statement is ready. When you next open your banking app, find it under Accounts → Statements. You do not need to reply or share any security details.' }],
    correctAnswer: 'SAFE', redFlags: [],
    safeSignals: [
      { title: 'You stay in your own app', description: 'The instructions point to a familiar section of your banking app.' },
      { title: 'No deadline or threat', description: 'You can check when you choose. There is no pressure.' },
      { title: 'No sensitive request', description: 'Nobody is asking you to reveal security details or make a payment.' },
    ],
    explanation: 'This is a safe simulated notification. It tells you where to find a document without asking for private details or a risky action.',
    saferAction: 'Open your usual banking app yourself when convenient. Never share the app’s login details with another person.',
    coachTip: 'A useful habit is to open important apps yourself. It keeps you on a familiar path, even when a message appears harmless.',
  },
];

export const getScenario = (id: string) => scenarios.find((scenario) => scenario.id === id);
export const difficultyLabel = (difficulty: number) => ['Getting started', 'A closer look', 'A little trickier'][difficulty - 1];

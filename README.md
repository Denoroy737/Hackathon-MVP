# Suraksha Coach

**Don’t just detect scams. Learn to recognize them.**

A finished, deliberately focused hackathon MVP: a calm, accessible practice journey that helps people recognise risky requests in everyday messages. It is a learning tool, not a scam detector.

## Run it

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. In Arena, use the **Suraksha Coach live preview**. The server binds to `0.0.0.0` for the preview environment. All browser requests use same-origin relative paths; fonts and illustrations are bundled locally.

For a production build:

```bash
npm run build
npm run start
```

## The two-minute demo

Start in a fresh browser, or choose **My progress → Reset my progress** and confirm.

1. **Start Training** → an urgent SBI/KYC practice message.
2. Choose **Suspicious** → correct feedback, four warning signs, and **+10 XP**.
3. **Next message** → a UPI refund that asks you to approve a payment.
4. Deliberately choose **Safe** → a supportive explanation, no extra XP, and a UPI practice recommendation.
5. **Next message** → another UPI scenario, this time an OTP request. “Picked for you” explains the adaptation.
6. Choose **Safe** again to show a repeated weakness, or **Suspicious** to demonstrate learning.
7. Open **My progress** → live resilience score, XP, completion, accuracy, streak, learning map, current practice area, strongest category, and missed manipulation patterns.
8. Continue to finish all ten messages. **Practise Again** starts a new adaptive session without deleting lifetime progress.

There is no timer. Every choice can be made using a keyboard. The **A+** control increases text size; progress and that setting survive refreshes.

## What works

- Landing page, training, instant result, explanations, adaptive next scenario, and dashboard.
- **10 authored scenarios / 8 categories:** Bank & KYC, UPI & OTP, WhatsApp, customer support, delivery, government, investment, and account alerts.
- **7 suspicious and 3 safe messages**, across SMS, WhatsApp, support chat, and in-app bank notifications. Safe examples teach that a harmless request does not authenticate a sender.
- Correct answers award **10 XP**. Every **50 XP** advances a level. A streak counts consecutive correct answers, not calendar days.
- Category weaknesses, manipulation-technique tracking, and difficulty adjustment.
- Local persistence, duplicate-answer protection, cross-tab updates, safe recovery from corrupt storage, and a warning when storage is blocked.
- Optional coaching endpoint with honest source labels and a curated fallback.
- Mobile layouts, large answer controls, keyboard navigation, focus-managed feedback, native accessible dialogs, and reduced-motion support.
- Reset confirmation, safety promise, help, empty dashboard, session completion, and a friendly 404 page.

## Architecture

```text
Next.js App Router + React + Tailwind CSS
                 │
                 ▼
Authored scenario metadata (lib/scenarios.ts)
                 │
                 ▼
Deterministic evaluation + selection (lib/engine.ts)
                 │
                 ▼
React progress provider → browser localStorage
                 │
                 ├── training results + learning profile
                 ├── dashboard
                 └── optional POST /api/coach → LLM or reviewed fallback
```

- `lib/scenarios.ts`: typed messages, fixed verdicts, red flags, reassuring signals, difficulty, explanations and safer actions.
- `lib/engine.ts`: pure evaluation, adaptive ranking, score derivation, session transitions, persistence validation.
- `components/ProgressProvider.tsx`: local state, saving, multi-tab sync and text preferences.
- `components/Training.tsx`: the question → feedback → next loop.
- `components/Dashboard.tsx`: real results only; no seeded or invented progress.
- `app/api/coach/route.ts`: optional server-side coaching with a timeout, input checks, rate limiting and a conservative text guard.

No Supabase setup is needed for this MVP. Local JSON in `localStorage` is the intentionally chosen mock persistence layer, not a shared or secure database.

### How adaptation works

Each unanswered scenario is ranked using:

1. Recent category errors (a fresh mistake is prioritised heavily).
2. Repeated misses in the latest three attempts for that category.
3. Manipulation techniques in missed answers from the last twenty attempts.
4. A target difficulty based on accuracy and consecutive correct answers.
5. Category variety, then fixed scenario order as a deterministic tie-breaker.

A new mistake creates a gentle revisit recommendation. Two misses among the latest three category attempts mark a repeated practice area. Two consecutive correct attempts in that category clear it. Each of the ten scenarios appears once per session; if a category has no unused example, related patterns are practised or the category is revisited in the next session. Previous-session learning is retained.

The displayed resilience score is a transparent **practice indicator**:

```text
round(70 × correct answers / all answers + 30 × categories tried / 8)
```

No score is shown before the first answer. This is not a validated psychological measure, an AI risk assessment, or a guarantee of real-world safety. The dashboard explains the formula.

## Optional AI coaching

The app works completely without an AI key. In that mode, **A little more guidance?** returns a clearly labelled **Built-in tip**.

To enable live AI:

```bash
cp .env.example .env.local
```

Set `OPENAI_API_KEY` in that local file and optionally set `OPENAI_MODEL` (default: `gpt-4o-mini`). Restart the server. Do not commit `.env.local`. Never use a `NEXT_PUBLIC_` prefix for the key.

The user must request a tip. Only a known scenario ID, selected answer, and anonymous answer counts are accepted by the endpoint. The server sends reviewed learning metadata and those counts to OpenAI, never personal information or the browser’s full stored history. A fixed metadata verdict is supplied to the model; **AI never evaluates answers, awards XP, calculates scores, or chooses the actual next scenario**.

AI adds a short personalised memory aid, not new verdicts or unreviewed live scam messages. This MVP intentionally does **not** generate scenario variations at runtime. The curated bank is safer and keeps the demo deterministic.

Timeouts, provider errors, conservative content filtering, missing configuration and rate limits all produce a reviewed fallback. The UI identifies whether a tip was AI-assisted or built in. Live-provider generation requires your own key and has not been exercised with a real key in this workspace; the request path and fallback behaviour have automated tests.

## Safety boundaries

- All scenarios are made up. Brand names appear only inside labelled simulations; there is no bank affiliation.
- Every practice address uses the reserved `.example` suffix and is rendered as **non-clickable text**, never a link.
- There are **no credential, OTP, password, payment or banking-detail entry fields**. The user only chooses Safe or Suspicious.
- No payments, real messages, real phishing pages or real transactions.
- No sign-up, analytics, ads or external image/font dependencies.
- Progress is stored only in this browser; clearing site data removes it. Optional AI is the sole practice-data network feature and is disclosed before use.
- The model output is plain text, length-limited, and conservatively rejected if it contains web addresses, phone-like numbers, sensitive-code terms or risky-action verbs. Reviewed explanations always remain the source of truth.

For a public rollout, add a shared persistent rate limiter and an API spending cap, review AI outputs and learning content with a security professional, conduct usability testing with older adults, add language support, and agree on consent/data policies before introducing accounts or cloud storage. The present per-instance rate limiter is suitable for a hackathon, not abuse-resistant public scale.

## Tests

```bash
npm test                 # scenario engine + API tests
npm run typecheck        # TypeScript
npm run build            # production build
npx playwright install --with-deps chromium
npm run test:e2e          # browser journeys, accessibility checks, mobile, persistence
```

Validation in this workspace: **14 engine/API tests and 8 browser tests passed**, along with TypeScript and an optimised production build. Browser coaching responses and API-provider calls are mocked in tests so they do not spend live API credits. The real no-key HTTP fallback was also checked in the running app.

The browser suite covers the full ten-message path, repeated weaknesses, safe examples, level/score updates, refresh, new sessions, blocked storage, coaching failures, text size, keyboard dialogs, reset confirmation, cross-tab sync, narrow/mobile layouts and automated WCAG A/AA checks on functional screens. The decorative landing illustration is excluded from the automated contrast check. Automated checks supplement, not replace, assistive-technology and older-user testing.

## Deploy to Vercel

1. Push this project to a Git repository and import it into Vercel.
2. Keep the detected **Next.js** preset; use `npm run build`.
3. Optionally set `OPENAI_API_KEY` and `OPENAI_MODEL` as server-side project environment variables.
4. Deploy. No database, migrations, or special redirects are required.

The app is production-build ready. A public Vercel deployment has not been created from this workspace.

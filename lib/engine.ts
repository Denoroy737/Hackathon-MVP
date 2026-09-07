import { Answer, Category, Technique, categories, getScenario, scenarios, type Scenario } from './scenarios';

export type Attempt = {
  scenarioId: string;
  sessionId: string;
  answer: Answer;
  correct: boolean;
  earnedXp: number;
  answeredAt: string;
};
export type Selection = { scenarioId: string; reason: string; kind: 'first' | 'practice' | 'technique' | 'challenge' | 'variety' };
export type Session = {
  id: string;
  startedAt: string;
  completedIds: string[];
  current: Selection;
};
export type Progress = { version: 1; history: Attempt[]; session: Session | null; largeText: boolean };
export const STORAGE_KEY = 'suraksha-coach:progress:v1';
export const emptyProgress: Progress = { version: 1, history: [], session: null, largeText: false };

export function evaluate(scenarioId: string, answer: Answer) {
  const scenario = getScenario(scenarioId);
  if (!scenario) throw new Error('Unknown practice scenario');
  if (answer !== 'SAFE' && answer !== 'SUSPICIOUS') throw new Error('Choose Safe or Suspicious');
  const correct = scenario.correctAnswer === answer;
  return { correct, earnedXp: correct ? 10 : 0, correctAnswer: scenario.correctAnswer };
}

export function getStats(history: Attempt[]) {
  const total = history.length;
  const correct = history.filter((a) => a.correct).length;
  const xp = correct * 10;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  let streak = 0;
  for (let i = history.length - 1; i >= 0 && history[i].correct; i--) streak++;
  let bestStreak = 0, running = 0;
  for (const attempt of history) {
    running = attempt.correct ? running + 1 : 0;
    bestStreak = Math.max(bestStreak, running);
  }
  const practicedCategories = new Set(history.map((a) => getScenario(a.scenarioId)?.category).filter(Boolean)).size;
  // An educational practice indicator, NOT a validated measure of real-world safety.
  const resilience = total ? Math.round((correct / total) * 70 + (practicedCategories / categories.length) * 30) : 0;
  return { total, correct, xp, accuracy, streak, bestStreak, practicedCategories, resilience, level: Math.floor(xp / 50) + 1, levelProgress: xp % 50, nextLevelXp: 50 - (xp % 50) };
}

export function getCategoryStats(history: Attempt[]) {
  return categories.map((category) => {
    const attempts = history.filter((a) => getScenario(a.scenarioId)?.category === category);
    const recent = attempts.slice(-3);
    const correct = attempts.filter((a) => a.correct).length;
    const recentMisses = recent.filter((a) => !a.correct).length;
    const latestMiss = recent.length > 0 && !recent[recent.length - 1].correct;
    // Two recent successes clear an earlier weakness. A fresh mistake is a gentle recommendation.
    const recovered = recent.length >= 2 && recent.slice(-2).every((a) => a.correct);
    const needsPractice = !recovered && (latestMiss || recentMisses >= 2);
    return {
      category, attempts: attempts.length, correct, mistakes: attempts.length - correct,
      accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : 0,
      recentMisses, needsPractice, repeated: needsPractice && recentMisses >= 2,
      priority: needsPractice ? recentMisses * 4 + (latestMiss ? 3 : 0) : 0,
    };
  });
}

export function getWeakness(history: Attempt[]) {
  return getCategoryStats(history).filter((c) => c.needsPractice).sort((a, b) => b.priority - a.priority || b.mistakes - a.mistakes)[0] ?? null;
}

export function getStrongest(history: Attempt[]) {
  return getCategoryStats(history).filter((c) => c.correct > 0 && !c.needsPractice).sort((a, b) => b.accuracy - a.accuracy || b.correct - a.correct)[0] ?? null;
}

export function getTechniqueWeaknesses(history: Attempt[]) {
  const missed = new Map<Technique, number>();
  history.slice(-20).filter((a) => !a.correct).forEach((attempt) => {
    const scenario = getScenario(attempt.scenarioId);
    if (!scenario) return;
    const techniques: Technique[] = scenario.correctAnswer === 'SAFE' ? ['Recognising safe messages'] : [...new Set(scenario.redFlags.map((f) => f.technique).filter((t): t is Technique => Boolean(t)))];
    techniques.forEach((technique) => missed.set(technique, (missed.get(technique) || 0) + 1));
  });
  return [...missed.entries()].map(([technique, count]) => ({ technique, count })).sort((a, b) => b.count - a.count);
}

export function selectNext(history: Attempt[], completedIds: string[]): Selection | null {
  const available = scenarios.filter((s) => !completedIds.includes(s.id));
  if (!available.length) return null;
  if (!history.length && !completedIds.length) {
    return { scenarioId: scenarios[0].id, kind: 'first', reason: 'Start with an everyday bank message. Take your time — there is no timer.' };
  }
  const stats = getStats(history);
  const targetDifficulty = stats.streak >= 4 || (stats.total >= 5 && stats.accuracy >= 80) ? 3 : stats.streak >= 2 ? 2 : 1;
  const categoryStats = getCategoryStats(history);
  const techniques = getTechniqueWeaknesses(history);
  const latest = history[history.length - 1];
  const latestMiss = latest && !latest.correct ? getScenario(latest.scenarioId) : null;
  const practiced = new Set(history.map((a) => getScenario(a.scenarioId)?.category));
  const rank = (scenario: Scenario) => {
    const weakness = categoryStats.find((c) => c.category === scenario.category)!;
    let score = (scenarios.length - scenarios.indexOf(scenario)) * 2;
    score += scenario.difficulty === targetDifficulty ? 12 : -4 * Math.abs(scenario.difficulty - targetDifficulty);
    score += practiced.has(scenario.category) ? 0 : 6;
    score += weakness.priority * 5;
    if (latestMiss?.category === scenario.category) score += 45;
    for (const flag of scenario.redFlags) {
      const missed = techniques.find((t) => t.technique === flag.technique);
      if (missed) score += Math.min(missed.count, 3) * 3;
    }
    return score;
  };
  const next = [...available].sort((a, b) => rank(b) - rank(a) || scenarios.indexOf(a) - scenarios.indexOf(b))[0];
  const weakness = categoryStats.find((c) => c.category === next.category);
  if (weakness?.needsPractice) {
    return { scenarioId: next.id, kind: 'practice', reason: `Let’s revisit ${next.category}. This message gives you another chance to practise something you found tricky.` };
  }
  const sharedTechnique = techniques.find((t) => next.redFlags.some((flag) => flag.technique === t.technique));
  if (sharedTechnique && latestMiss) {
    return { scenarioId: next.id, kind: 'technique', reason: 'A different situation, with a pattern worth practising again. Look at the request, not just the sender.' };
  }
  if (targetDifficulty > 1 && next.difficulty === targetDifficulty) {
    return { scenarioId: next.id, kind: 'challenge', reason: 'Your confidence is growing. Here is a slightly more subtle message to practise with.' };
  }
  return { scenarioId: next.id, kind: 'variety', reason: `Now try ${next.category}. Practising different kinds of messages helps you spot patterns.` };
}

export function startSession(progress: Progress, id: string, now: string): Progress {
  if (progress.session && progress.session.completedIds.length < scenarios.length) return progress;
  const current = selectNext(progress.history, []);
  if (!current) return progress;
  return { ...progress, session: { id, startedAt: now, completedIds: [], current } };
}

export function recordAnswer(progress: Progress, answer: Answer, now: string): Progress {
  const session = progress.session;
  if (!session || session.completedIds.includes(session.current.scenarioId)) return progress;
  const result = evaluate(session.current.scenarioId, answer);
  const attempt: Attempt = { scenarioId: session.current.scenarioId, sessionId: session.id, answer, correct: result.correct, earnedXp: result.earnedXp, answeredAt: now };
  return { ...progress, history: [...progress.history, attempt], session: { ...session, completedIds: [...session.completedIds, session.current.scenarioId] } };
}

export function advanceSession(progress: Progress): Progress {
  const session = progress.session;
  if (!session || !session.completedIds.includes(session.current.scenarioId)) return progress;
  const next = selectNext(progress.history, session.completedIds);
  return next ? { ...progress, session: { ...session, current: next } } : progress;
}

// Treat localStorage as untrusted. Recompute correctness/XP rather than accepting saved scores.
export function restoreProgress(raw: string | null): Progress {
  if (!raw) return { ...emptyProgress };
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.history) || value.history.length > 20000) return { ...emptyProgress };
    const seen = new Set<string>();
    const history: Attempt[] = [];
    for (const a of value.history) {
      if (!getScenario(a?.scenarioId) || (a.answer !== 'SAFE' && a.answer !== 'SUSPICIOUS') || typeof a.sessionId !== 'string' || typeof a.answeredAt !== 'string' || !Number.isFinite(Date.parse(a.answeredAt))) continue;
      const key = `${a.sessionId}:${a.scenarioId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const result = evaluate(a.scenarioId, a.answer);
      history.push({ scenarioId: a.scenarioId, sessionId: a.sessionId, answer: a.answer, answeredAt: a.answeredAt, correct: result.correct, earnedXp: result.earnedXp });
    }
    let session: Session | null = null;
    if (value.session && typeof value.session.id === 'string' && typeof value.session.startedAt === 'string' && getScenario(value.session.current?.scenarioId)) {
      const saved = value.session;
      const completedIds = history.filter((a) => a.sessionId === saved.id).map((a) => a.scenarioId);
      const kinds = ['first', 'practice', 'technique', 'challenge', 'variety'];
      session = { id: saved.id, startedAt: saved.startedAt, completedIds, current: { scenarioId: saved.current.scenarioId, reason: typeof saved.current.reason === 'string' ? saved.current.reason.slice(0, 250) : 'A safe place to practise.', kind: kinds.includes(saved.current.kind) ? saved.current.kind : 'variety' } };
    }
    return { version: 1, history, session, largeText: value.largeText === true };
  } catch { return { ...emptyProgress }; }
}

export function getLevelName(level: number) {
  return level === 1 ? 'Curious learner' : level === 2 ? 'Pattern spotter' : level === 3 ? 'Confidence builder' : 'Everyday guardian';
}

export function categoryShort(category: Category) {
  return category === 'Customer support' ? 'Support' : category === 'Account security' ? 'Account alerts' : category;
}

import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceSession, emptyProgress, evaluate, getCategoryStats, getStats, getTechniqueWeaknesses, getWeakness, recordAnswer, restoreProgress, selectNext, startSession, type Attempt } from '../lib/engine';
import { categories, getScenario, scenarios, type Answer } from '../lib/scenarios';
const now = '2026-09-07T10:00:00.000Z';
const attempt = (id: string, answer: Answer, n = 0): Attempt => ({ scenarioId: id, answer, sessionId: `test-${n}`, answeredAt: now, ...evaluate(id, answer) });

test('the library has 10 safe simulations, all 8 categories, and both verdicts', () => {
  assert.equal(scenarios.length, 10);
  assert.equal(new Set(scenarios.map((s) => s.id)).size, 10);
  assert.equal(new Set(scenarios.map((s) => s.category)).size, categories.length);
  assert.ok(scenarios.filter((s) => s.correctAnswer === 'SAFE').length >= 3);
  for (const s of scenarios) {
    assert.ok(s.difficulty >= 1 && s.difficulty <= 3);
    assert.ok(s.correctAnswer === 'SAFE' ? s.safeSignals.length >= 2 && s.redFlags.length === 0 : s.redFlags.length >= 2 && s.redFlags.length <= 4);
    for (const m of s.messages) {
      assert.ok(!/https?:\/\//i.test(m.text));
      if (m.link) assert.match(m.link, /^[a-z0-9-]+\.example$/);
    }
  }
});

test('verdicts and XP come exclusively from authored metadata', () => {
  assert.deepEqual(evaluate('bank-kyc', 'SUSPICIOUS'), { correct: true, earnedXp: 10, correctAnswer: 'SUSPICIOUS' });
  assert.equal(evaluate('bank-kyc', 'SAFE').earnedXp, 0);
  assert.equal(evaluate('delivery-update', 'SAFE').correct, true);
  assert.equal(evaluate('delivery-update', 'SUSPICIOUS').correct, false);
  assert.throws(() => evaluate('missing', 'SAFE'));
  assert.throws(() => evaluate('bank-kyc', 'UNSURE' as Answer));
});

test('demo flow: bank win, UPI mistake, a new UPI question', () => {
  let p = startSession(emptyProgress, 'demo', now);
  assert.equal(p.session!.current.scenarioId, 'bank-kyc');
  p = recordAnswer(p, 'SUSPICIOUS', now);
  assert.equal(getStats(p.history).xp, 10);
  p = advanceSession(p);
  assert.equal(p.session!.current.scenarioId, 'upi-refund');
  p = recordAnswer(p, 'SAFE', now);
  assert.equal(getWeakness(p.history)?.category, 'UPI & OTP');
  assert.equal(getWeakness(p.history)?.repeated, false);
  p = advanceSession(p);
  assert.equal(p.session!.current.scenarioId, 'upi-otp');
  assert.equal(p.session!.current.kind, 'practice');
  p = recordAnswer(p, 'SAFE', now);
  assert.equal(getWeakness(p.history)?.repeated, true);
  assert.equal(getStats(p.history).xp, 10);
  assert.equal(getStats(p.history).accuracy, 33);
});

test('two recent correct answers clear a weakness; manipulation patterns are counted', () => {
  const h = [attempt('upi-refund', 'SAFE'), attempt('upi-otp', 'SAFE', 1)];
  assert.equal(getWeakness(h)?.repeated, true);
  assert.equal(getTechniqueWeaknesses(h).find((t) => t.technique === 'Private information')?.count, 2);
  h.push(attempt('upi-refund', 'SUSPICIOUS', 2), attempt('upi-otp', 'SUSPICIOUS', 3));
  assert.equal(getWeakness(h), null);
  const caution = getTechniqueWeaknesses([attempt('bank-statement', 'SUSPICIOUS')]);
  assert.equal(caution[0].technique, 'Recognising safe messages');
});

test('all paths finish once without repeated scenarios or duplicate XP', () => {
  for (const strategy of ['all-right', 'all-wrong', 'safe-only', 'mixed']) {
    let p = startSession(emptyProgress, strategy, now);
    for (let i = 0; i < 10; i++) {
      const s = getScenario(p.session!.current.scenarioId)!;
      const correct = s.correctAnswer;
      const wrong = correct === 'SAFE' ? 'SUSPICIOUS' : 'SAFE';
      const answer: Answer = strategy === 'all-right' ? correct : strategy === 'all-wrong' ? wrong : strategy === 'safe-only' ? 'SAFE' : i % 2 ? wrong : correct;
      p = recordAnswer(p, answer, now);
      const duplicate = recordAnswer(p, answer, now);
      assert.equal(duplicate, p);
      assert.equal(p.history.length, i + 1);
      p = advanceSession(p);
    }
    assert.equal(new Set(p.session!.completedIds).size, 10);
    assert.equal(selectNext(p.history, p.session!.completedIds), null);
    assert.equal(getStats(p.history).practicedCategories, 8);
    if (strategy === 'all-right') {
      assert.equal(getStats(p.history).xp, 100);
      assert.equal(getStats(p.history).resilience, 100);
      assert.equal(getStats(p.history).streak, 10);
      assert.equal(getStats(p.history).level, 3);
    }
    if (strategy === 'all-wrong') assert.equal(getStats(p.history).xp, 0);
    const again = startSession(p, 'again', now);
    assert.equal(again.history.length, 10);
    assert.equal(again.session!.completedIds.length, 0);
  }
});

test('you cannot advance an unanswered question, and starting resumes an incomplete session', () => {
  const p = startSession(emptyProgress, 'same', now);
  assert.equal(advanceSession(p), p);
  assert.equal(startSession(p, 'different', now), p);
});

test('successful answers increase scenario difficulty; selection is deterministic', () => {
  const h = [attempt('bank-kyc', 'SUSPICIOUS'), attempt('upi-refund', 'SUSPICIOUS')];
  const completed = h.map((a) => a.scenarioId);
  const next = selectNext(h, completed)!;
  assert.ok(getScenario(next.scenarioId)!.difficulty >= 2);
  assert.deepEqual(next, selectNext(h, completed));
  const high = [...h, attempt('whatsapp-family', 'SUSPICIOUS'), attempt('support-remote', 'SUSPICIOUS')];
  const challenge = selectNext(high, high.map((a) => a.scenarioId))!;
  assert.equal(getScenario(challenge.scenarioId)!.difficulty, 3);
});

test('resilience is accuracy × 70 + category coverage × 30, not an AI rating', () => {
  assert.equal(getStats([]).resilience, 0);
  assert.equal(getStats([attempt('bank-kyc', 'SUSPICIOUS')]).resilience, 74);
  const h = [attempt('bank-kyc', 'SUSPICIOUS'), attempt('upi-refund', 'SAFE')];
  assert.equal(getStats(h).resilience, 43);
  assert.equal(getStats(h).bestStreak, 1);
  assert.equal(getStats(h).streak, 0);
  assert.equal(getCategoryStats(h).find((c) => c.category === 'UPI & OTP')!.mistakes, 1);
});

test('storage corruption recovers safely and tampered scores are recomputed', () => {
  assert.deepEqual(restoreProgress('not json'), emptyProgress);
  assert.deepEqual(restoreProgress(null), emptyProgress);
  assert.deepEqual(restoreProgress(JSON.stringify({ version: 99 })), emptyProgress);
  let p = startSession(emptyProgress, 'saved', now);
  p = recordAnswer(p, 'SAFE', now);
  const bad = JSON.parse(JSON.stringify(p));
  bad.history[0].correct = true;
  bad.history[0].earnedXp = 100000;
  bad.history.push(bad.history[0], { scenarioId: 'no-such-id' });
  bad.session.completedIds = scenarios.map((s) => s.id);
  const restored = restoreProgress(JSON.stringify(bad));
  assert.equal(restored.history.length, 1);
  assert.equal(restored.history[0].correct, false);
  assert.equal(getStats(restored.history).xp, 0);
  assert.deepEqual(restored.session!.completedIds, ['bank-kyc']);
  assert.deepEqual(restoreProgress(JSON.stringify(p)), p);
});

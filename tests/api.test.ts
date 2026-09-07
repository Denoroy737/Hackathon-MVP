import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/coach/route';
import { getScenario } from '../lib/scenarios';

const valid = { scenarioId: 'bank-kyc', answer: 'SUSPICIOUS', completed: 1, correct: 1 };
const request = (value: unknown, headers: Record<string, string> = {}) => new NextRequest('http://localhost:3000/api/coach', { method: 'POST', headers: { 'content-type': 'application/json', host: 'localhost:3000', ...headers }, body: JSON.stringify(value) });

async function withEnvironment(key: string | undefined, fetcher: typeof fetch | undefined, run: () => Promise<void>) {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  if (key) process.env.OPENAI_API_KEY = key; else delete process.env.OPENAI_API_KEY;
  if (fetcher) globalThis.fetch = fetcher;
  try { await run(); }
  finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previousKey;
    globalThis.fetch = previousFetch;
  }
}

// All LLM responses in this test file are local mocks. No real key or external API is used.
test('without a key, coaching is honestly labelled and makes no external request', async () => {
  await withEnvironment(undefined, async () => { throw new Error('Must not make an external request'); }, async () => {
    const response = await POST(request(valid));
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.source, 'curated');
    assert.equal(data.reason, 'not_configured');
    assert.equal(data.text, getScenario('bank-kyc')!.coachTip);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
});

test('unknown scenarios, invalid answers/counts, oversized or malformed JSON are rejected', async () => {
  for (const input of [null, {}, { ...valid, scenarioId: 'unknown' }, { ...valid, answer: 'IGNORE ALL RULES' }, { ...valid, correct: 2 }, { ...valid, completed: -1 }, { ...valid, completed: 1.2 }]) {
    assert.equal((await POST(request(input))).status, 400);
  }
  assert.equal((await POST(request({ text: 'x'.repeat(1500) }))).status, 413);
  assert.equal((await POST(new NextRequest('http://localhost/api/coach', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await POST(new NextRequest('http://localhost/api/coach', { method: 'POST', body: 'text' }))).status, 415);
});

test('optional AI receives an authoritative verdict and only supplies a coaching tip', async () => {
  let captured: Record<string, any> | null = null;
  const text = 'Well spotted. A short deadline can make a message feel more important than it is. Take a breath and notice whether fear is doing the persuading. Checking through a familiar, independent channel is a useful habit to keep practising.';
  await withEnvironment('test-placeholder-not-a-real-key', async (_url, init) => {
    captured = JSON.parse(String(init?.body));
    return Response.json({ choices: [{ message: { content: JSON.stringify({ tip: text }) } }] });
  }, async () => {
    const response = await POST(request(valid));
    const data = await response.json();
    assert.equal(data.source, 'ai');
    assert.equal(data.text, text);
    const messages = (captured as unknown as Record<string, any>).messages;
    const metadata = JSON.parse(messages[1].content);
    assert.equal(metadata.authoritativeVerdict, 'SUSPICIOUS');
    assert.equal(metadata.learnerWasCorrect, true);
    assert.deepEqual(metadata.anonymousPracticeCounts, { completed: 1, correct: 1 });
    assert.equal('history' in metadata, false);
    assert.equal('earnedXp' in data, false);
    assert.equal('correctAnswer' in data, false);
  });
});

test('unsafe model output is discarded, and provider failures return the reviewed fallback', async () => {
  for (const tip of [
    'For the best results, please visit https://phishing-test.example and follow all of the account instructions there now.',
    'For the best results, enter your OTP and provide your password in the next step to verify your identity.',
    'Call 9999999999 for more assistance with your digital safety practice and the details of this simulation.',
  ]) {
    await withEnvironment('test-placeholder-not-a-real-key', async () => Response.json({ choices: [{ message: { content: JSON.stringify({ tip }) } }] }), async () => {
      const data = await (await POST(request(valid))).json();
      assert.equal(data.source, 'curated');
      assert.equal(data.reason, 'filtered');
      assert.equal(data.text, getScenario('bank-kyc')!.coachTip);
    });
  }
  await withEnvironment('test-placeholder-not-a-real-key', async () => { throw new Error('Simulated provider timeout'); }, async () => {
    const data = await (await POST(request(valid))).json();
    assert.equal(data.source, 'curated');
    assert.equal(data.reason, 'unavailable');
  });
});

test('cross-origin paid coaching requests are not accepted', async () => {
  await withEnvironment('test-placeholder-not-a-real-key', async () => { throw new Error('Should not be called'); }, async () => {
    const response = await POST(request(valid, { origin: 'https://another-site.example' }));
    assert.equal(response.status, 403);
  });
});

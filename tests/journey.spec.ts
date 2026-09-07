import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { scenarios, getScenario } from '../lib/scenarios';
import { STORAGE_KEY } from '../lib/engine';

const saved = (page: import('@playwright/test').Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), STORAGE_KEY);

async function settle(page: import('@playwright/test').Page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {}))));
}

test('complete adaptive demo, score updates, reload, and another session', async ({ page }) => {
  // Deterministic UI contract test; never spend a developer’s live API credits.
  await page.route('**/api/coach', (route) => route.fulfill({ json: { text: getScenario('bank-kyc')!.coachTip, source: 'curated', reason: 'not_configured' } }));
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Start Training', exact: true }).click();
  await expect(page.locator('.message-sender strong')).toHaveText('SBI KYC Desk');
  await expect(page.locator('input, textarea, a[href*=".example"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Correct! You spotted the scam.' })).toBeVisible();
  await expect(page.locator('.xp-award')).toContainText('+10 XP');
  await expect(page.locator('.signal-card')).toHaveCount(4);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Correct! You spotted the scam.' })).toBeVisible();
  expect((await saved(page)).history).toHaveLength(1);
  await page.getByRole('button', { name: 'A little more guidance?', exact: false }).click();
  await expect(page.locator('.coach-tip-content')).toBeVisible();
  await expect(page.locator('.coach-tip-title')).toContainText('Built-in tip');
  await page.getByRole('button', { name: 'Next message', exact: true }).click();
  await expect(page.locator('.message-sender strong')).toHaveText('Refund Helpdesk');
  await page.getByRole('button', { name: 'Safe', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Not quite. This was a scam.' })).toBeVisible();
  await page.getByRole('button', { name: 'Next message', exact: true }).click();
  await expect(page.locator('.message-sender strong')).toHaveText('UPI Resolution Team');
  await expect(page.locator('.adaptive-card')).toContainText('Let’s revisit UPI & OTP');
  await page.getByRole('button', { name: 'Safe', exact: true }).click();
  await expect(page.locator('.practice-area-chip')).toContainText('Practice area: UPI & OTP');
  await page.getByRole('link', { name: 'My progress', exact: true }).click();
  await expect(page.locator('.focus-area-card h2')).toHaveText('UPI & OTP');
  await expect(page.locator('.strongest-card h2')).toHaveText('Bank & KYC');
  await expect(page.locator('.metric-value').nth(0)).toHaveText('10 XP');
  await expect(page.locator('.metric-value').nth(1)).toHaveText('3');
  await expect(page.locator('.metric-value').nth(2)).toHaveText('33%');
  await page.getByRole('button', { name: 'Continue Training', exact: true }).click();
  for (let i = 3; i < scenarios.length; i++) {
    await expect(page.locator('.answer-buttons')).toBeVisible();
    const progress = await saved(page);
    const scenario = getScenario(progress.session.current.scenarioId)!;
    await page.getByRole('button', { name: scenario.correctAnswer === 'SAFE' ? 'Safe' : 'Suspicious', exact: true }).click();
    await expect(page.locator('.feedback-correct')).toBeVisible();
    if (i < scenarios.length - 1) await page.getByRole('button', { name: 'Next message', exact: true }).click();
  }
  await page.getByRole('button', { name: 'See my progress', exact: true }).click();
  await expect(page.locator('.completion-banner')).toContainText('80 XP this round');
  await expect(page.locator('.metric-value').nth(1)).toHaveText('10');
  await expect(page.locator('.metric-value').nth(2)).toHaveText('80%');
  await expect(page.locator('.score-number strong')).toHaveText('86');
  expect(new Set((await saved(page)).session.completedIds).size).toBe(10);
  await page.getByRole('button', { name: 'Practise Again', exact: true }).click();
  await expect(page.locator('.answer-buttons')).toBeVisible();
  const again = await saved(page);
  expect(again.history).toHaveLength(10);
  expect(again.session.completedIds).toHaveLength(0);
  expect(getScenario(again.session.current.scenarioId)?.category).toBe('UPI & OTP');
  expect(errors).toEqual([]);
});

test('safe examples have reassuring signals and an incorrect answer earns no XP', async ({ page }) => {
  await page.goto('/training');
  await page.getByRole('button', { name: 'Safe', exact: true }).click();
  await page.getByRole('button', { name: 'Next message', exact: true }).click();
  await expect(page.locator('.message-sender strong')).toHaveText('Your banking app');
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Not quite. This message was safe.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The reassuring signs' })).toBeVisible();
  await expect(page.locator('.safe-caveat')).toContainText('does not prove who sent');
  const state = await saved(page);
  expect(state.history.every((attempt: { earnedXp: number }) => attempt.earnedXp === 0)).toBe(true);
});

test('keyboard help, safety promise, text size and reset confirmation work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'How to use Suraksha Coach' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'You can take your time' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'You can take your time' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'How to use Suraksha Coach' })).toBeFocused();
  await page.getByRole('button', { name: 'Our safety promise' }).click();
  await expect(page.getByRole('dialog', { name: 'A safe place to practise' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  await page.getByRole('button', { name: 'Use larger text', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true');
  await page.getByRole('button', { name: 'Start Training', exact: true }).click();
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Reset my progress', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my progress', exact: true }).click();
  await expect(page.locator('.metric-value').nth(0)).toHaveText('10 XP');
  await page.getByRole('button', { name: 'Reset my progress', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, reset progress', exact: true }).click();
  await expect(page.locator('.reset-notice')).toBeVisible();
  await expect(page.locator('.metric-value').nth(0)).toHaveText('0 XP');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true');
  expect((await saved(page)).history).toHaveLength(0);
});

test('blocked browser storage degrades gracefully without blocking practice', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('/training');
  await expect(page.locator('.storage-notice')).toBeVisible();
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await expect(page.locator('.xp-award')).toContainText('+10 XP');
  await page.getByRole('button', { name: 'Next message', exact: true }).click();
  await expect(page.locator('.message-sender strong')).toHaveText('Refund Helpdesk');
});

test('coaching network failures do not interrupt the lesson', async ({ page }) => {
  await page.route('**/api/coach', (route) => route.abort('failed'));
  await page.goto('/training');
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await page.getByRole('button', { name: 'A little more guidance?', exact: false }).click();
  await expect(page.locator('.coach-tip-title')).toContainText('Built-in tip');
  await expect(page.locator('.coach-source')).toContainText('saved tip');
  await page.getByRole('button', { name: 'Next message', exact: true }).click();
  await expect(page.locator('.answer-buttons')).toBeVisible();
});

test('functional pages pass automated WCAG A/AA checks', async ({ page }) => {
  const check = async () => {
    await settle(page);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('.practice-illustration').analyze();
    expect(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  };
  await page.goto('/'); await check();
  await page.getByRole('button', { name: 'Start Training', exact: true }).click();
  await expect(page.locator('.answer-buttons')).toBeVisible(); await check();
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await expect(page.locator('.feedback-card')).toBeVisible(); await check();
  await page.getByRole('button', { name: 'Next message', exact: true }).click();
  await page.getByRole('button', { name: 'Safe', exact: true }).click();
  await expect(page.locator('.feedback-card')).toBeVisible(); await check();
  await page.goto('/dashboard');
  await expect(page.locator('.learning-map')).toBeVisible(); await check();
  await page.getByRole('button', { name: 'How is my resilience score calculated?' }).click(); await check();
});

test('mobile navigation and layouts work at narrow and tablet widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/training', '/dashboard']) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      expect(size.content, `${route} at ${width}px`).toBeLessThanOrEqual(size.viewport);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'My progress', exact: true }).click();
  await expect(page.locator('.resilience-card')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use larger text', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-large-text', 'true');
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/training', '/dashboard']) {
      await page.goto(route);
      const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      expect(size.content, `large text: ${route} at ${width}`).toBeLessThanOrEqual(size.viewport);
    }
  }
});

test('corrupt saved data recovers and cross-tab progress synchronises', async ({ context, page }) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.setItem(key, '{broken-json'), STORAGE_KEY);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Start Training', exact: true })).toBeVisible();
  const dashboard = await context.newPage();
  await dashboard.goto('/dashboard');
  await expect(dashboard.locator('.metric-value').nth(0)).toHaveText('0 XP');
  await page.getByRole('button', { name: 'Start Training', exact: true }).click();
  await page.getByRole('button', { name: 'Suspicious', exact: true }).click();
  await expect(dashboard.locator('.metric-value').nth(0)).toHaveText('10 XP');
  await dashboard.close();
});

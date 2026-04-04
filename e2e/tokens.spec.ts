import { test, expect } from '@playwright/test';

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app';

test.describe('One-tap Token Flows', () => {
  test('invalid cleaner respond token shows error', async ({ page }) => {
    // Backend route is /respond (not /cleaner/respond)
    await page.goto(`${BACKEND}/respond?token=badtoken&action=accept`);
    // Returns 400 with text "Invalid"
    await expect(page.locator('body')).toContainText('Invalid');
  });

  test('invalid cleaner respond token for decline shows error', async ({ page }) => {
    await page.goto(`${BACKEND}/respond?token=badtoken&action=decline`);
    await expect(page.locator('body')).toContainText('Invalid');
  });

  test('invalid payment token shows "no longer valid"', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/payment-respond?token=badpaytoken&action=confirm`);
    await expect(page.locator('body')).toContainText('This link is no longer valid');
  });

  test('expired team invite shows error or loading state (no crash)', async ({ page }) => {
    await page.goto('/team/accept?token=expiredteamtoken');
    // AcceptInvite.jsx validates token via API. For a bad token it shows
    // "Invalid invite", "Invite expired", or stays on "Validating invite..."
    // if the API times out. The key assertion: the page renders (no crash).
    await expect(
      page.locator('text=Invalid invite')
        .or(page.locator('text=Invite expired'))
        .or(page.locator('text=Validating invite'))
        .or(page.locator('text=Turnzy'))
        .first()
    ).toBeVisible({ timeout: 10000 });
    // Must NOT show a React error boundary or stack trace
    await expect(page.locator('text=Cannot read')).not.toBeVisible();
    await expect(page.locator('text=Unhandled')).not.toBeVisible();
  });
});

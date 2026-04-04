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

  test('expired team invite shows expiry message', async ({ page }) => {
    await page.goto('/team/accept?token=expiredteamtoken');
    // AcceptInvite.jsx shows "Invite expired" or "invalid"
    await expect(
      page.locator('text=Invite expired').or(page.locator('text=invalid')).first()
    ).toBeVisible({ timeout: 10000 });
  });
});

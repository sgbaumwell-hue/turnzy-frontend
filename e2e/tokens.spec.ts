import { test, expect } from '@playwright/test';

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app';

test.describe('One-tap Token Flows', () => {
  test('expired cleaner token shows expiry page', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/respond?token=expiredtest&action=accept`);
    await expect(
      page.locator('text=expired').or(page.locator('text=no longer valid')).or(page.locator('text=invalid'))
    ).toBeVisible();
    await expect(page.locator('text=Cannot read')).not.toBeVisible();
  });

  test('invalid cleaner token shows error not crash', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/respond?token=badtoken123&action=decline`);
    await expect(page.locator('text=expired').or(page.locator('text=invalid')).or(page.locator('text=not found'))).toBeVisible();
  });

  test('expired payment token shows error page', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/payment-respond?token=badpaytoken&action=confirm`);
    await expect(
      page.locator('text=no longer valid').or(page.locator('text=expired')).or(page.locator('text=invalid'))
    ).toBeVisible();
    await expect(page.locator('text=Cannot read')).not.toBeVisible();
  });

  test('expired team invite shows expiry page', async ({ page }) => {
    await page.goto('/team/accept?token=expiredteamtoken');
    await expect(
      page.locator('text=expired').or(page.locator('text=invalid')).or(page.locator('text=no longer valid'))
    ).toBeVisible();
  });
});

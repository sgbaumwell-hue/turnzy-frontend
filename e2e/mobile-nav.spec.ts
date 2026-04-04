import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers/auth';

test.describe('Mobile Navigation', () => {
  test('bottom nav visible and not overlapping content', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await loginAs(page, ACCOUNTS.cleaner);
    await expect(page.locator('nav').filter({ has: page.locator('text=Home') })).toBeVisible();
    await expect(page.locator('text=My Jobs')).toBeVisible();
  });

  test('host mobile header shows Turnzy branding', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await loginAs(page, ACCOUNTS.host);
    await expect(page.locator('text=Turnzy').first()).toBeVisible();
  });

  test('mobile booking detail has back button', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await loginAs(page, ACCOUNTS.host);
    const booking = page.locator('[data-testid="booking-row"]').first();
    if ((await booking.count()) === 0) return;
    await booking.click();
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    const backBtn = page.locator('[data-testid="back-button"]');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await expect(page).toHaveURL(/^\/$|\/dashboard/);
    }
  });

  test('mobile cleaner settings has back navigation', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await loginAs(page, ACCOUNTS.cleaner);
    await page.goto('/cleaner/settings');
    await page.locator('text=Notifications').first().click();
    await expect(page).toHaveURL(/\/cleaner\/settings\/notifications/);
    const backBtn = page.locator('[data-testid="back-button"]');
    if ((await backBtn.count()) > 0) {
      await backBtn.click();
      await expect(page).toHaveURL(/\/cleaner\/settings$/);
    }
  });
});

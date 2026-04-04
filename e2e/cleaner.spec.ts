import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers/auth';

test.describe('Cleaner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
  });

  test('cleaner dashboard loads', async ({ page }) => {
    // CleanerDashboard shows job sections or empty state
    await expect(page).toHaveURL(/\/cleaner/);
  });

  test('cleaner calendar loads', async ({ page }) => {
    await page.goto('/cleaner/calendar');
    // CleanerCalendar.jsx renders h1 "Calendar"
    await expect(page.locator('text=Calendar').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Page not found')).not.toBeVisible();
  });

  test('mobile calendar shows no week toggle', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await page.goto('/cleaner/calendar');
    await expect(page.locator('button', { hasText: 'Week' })).not.toBeVisible();
  });

  test('cleaner activity loads', async ({ page }) => {
    await page.goto('/cleaner/activity');
    // CleanerActivity.jsx renders "Activity" heading or empty/error state
    await expect(
      page.locator('text=Activity').first()
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Page not found')).not.toBeVisible();
  });

  test('cleaner settings shows all sections', async ({ page, isMobile }) => {
    await page.goto('/cleaner/settings');
    if (isMobile) {
      // Mobile shows settings menu with all options
      await expect(page.locator('text=My Team').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Notifications').first()).toBeVisible();
      await expect(page.locator('text=Account').first()).toBeVisible();
    } else {
      // Desktop shows sub-nav with all sections
      await expect(page.locator('text=My Team').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('mobile settings shows menu not direct section', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await page.goto('/cleaner/settings');
    // Mobile root shows "Settings" heading
    await expect(page.locator('text=Settings').first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/cleaner\/settings\/notifications/);
  });
});

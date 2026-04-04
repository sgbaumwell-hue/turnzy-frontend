import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers/auth';

test.describe('Cleaner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
  });

  test('cleaner dashboard loads', async ({ page }) => {
    await expect(page.locator('text=My Jobs')).toBeVisible();
  });

  test('cleaner calendar loads', async ({ page }) => {
    await page.goto('/cleaner/calendar');
    await expect(page.locator('text=Calendar')).toBeVisible();
    await expect(page.locator('text=Page not found')).not.toBeVisible();
  });

  test('mobile calendar shows no week toggle', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await page.goto('/cleaner/calendar');
    await expect(page.locator('button', { hasText: 'Week' })).not.toBeVisible();
  });

  test('cleaner activity loads', async ({ page }) => {
    await page.goto('/cleaner/activity');
    await expect(page.locator('text=Activity').or(page.locator('text=No activity yet'))).toBeVisible();
    await expect(page.locator('text=Page not found')).not.toBeVisible();
  });

  test('cleaner settings shows all sections', async ({ page }) => {
    await page.goto('/cleaner/settings');
    await expect(page.locator('text=My Team')).toBeVisible();
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Account')).toBeVisible();
  });

  test('mobile settings shows menu not direct section', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await page.goto('/cleaner/settings');
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page).not.toHaveURL(/\/cleaner\/settings\/notifications/);
  });
});

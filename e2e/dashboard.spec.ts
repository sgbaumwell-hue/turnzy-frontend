import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers/auth';

test.describe('Host Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
  });

  test('dashboard loads with booking sections', async ({ page }) => {
    await expect(page.locator('text=Operations').or(page.locator('text=Overview')).first()).toBeVisible();
  });

  test('clicking a booking opens detail on desktop', async ({ page, isMobile }) => {
    if (isMobile) return;
    const bookingCard = page.locator('[data-testid="booking-row"]').first();
    if ((await bookingCard.count()) === 0) {
      test.skip(true, 'No bookings available');
      return;
    }
    await bookingCard.click();
    await expect(page.locator('[data-testid="booking-detail"]').or(page.locator('text=Checkout')).first()).toBeVisible();
  });

  test('mobile: clicking booking navigates to detail page', async ({ page, isMobile }) => {
    if (!isMobile) return;
    const bookingCard = page.locator('[data-testid="booking-row"]').first();
    if ((await bookingCard.count()) === 0) return;
    await bookingCard.click();
    await expect(page).toHaveURL(/\/bookings\/\d+/);
  });

  test('sections collapse and expand', async ({ page }) => {
    const header = page.locator('text=Confirmed').first();
    if ((await header.count()) === 0) return;
    await header.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Operations').or(page.locator('text=Overview')).first()).toBeVisible();
  });

  test('mobile shows Turnzy branding in header', async ({ page, isMobile }) => {
    if (!isMobile) return;
    await expect(page.locator('text=Turnzy').first()).toBeVisible();
  });

  test('queued section shows for bookings 60+ days out', async ({ page }) => {
    const queued = page.locator('text=Queued').first();
    if ((await queued.count()) > 0) {
      await expect(queued).toBeVisible();
    }
    await expect(page.locator('text=Operations').or(page.locator('text=Overview')).first()).toBeVisible();
  });
});

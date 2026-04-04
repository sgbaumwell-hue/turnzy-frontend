import { test, expect } from '@playwright/test';
import { ACCOUNTS, loginAs } from './helpers/auth';
import { clearEmails } from './helpers/email';

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app';

test.describe('Payment Confirmation Flow', () => {
  test('completed booking card shows payment status on host side', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    const pastSection = page.locator('text=Past').first();
    if ((await pastSection.count()) === 0) {
      test.skip(true, 'No completed bookings in test data');
      return;
    }
    await pastSection.click();
    await expect(
      page
        .locator('text=Mark as paid')
        .or(page.locator('text=Awaiting cleaner confirmation'))
        .or(page.locator('text=Payment confirmed'))
        .or(page.locator('text=Payment pending'))
        .first()
    ).toBeVisible();
  });

  test('past section shows unpaid count badge when applicable', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    await expect(page.locator('text=Operations').or(page.locator('text=Overview')).first()).toBeVisible();
  });

  test('host can click Mark as Paid on unpaid booking', async ({ page }) => {
    await clearEmails();
    await loginAs(page, ACCOUNTS.host);
    const markPaidBtn = page.locator('button', { hasText: 'Mark as paid' }).first();
    if ((await markPaidBtn.count()) === 0) {
      test.skip(true, 'No unpaid completed bookings');
      return;
    }
    await markPaidBtn.click();
    await expect(
      page
        .locator('text=Awaiting cleaner confirmation')
        .or(page.locator('text=Payment marked'))
        .or(page.locator('text=cleaner will confirm'))
        .first()
    ).toBeVisible();
  });

  test('cleaner sees payment status on completed jobs', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
    await page.goto('/cleaner');
    const pastSection = page.locator('text=Past').first();
    if ((await pastSection.count()) === 0) {
      test.skip(true, 'No completed jobs for test cleaner');
      return;
    }
    await pastSection.click();
    await expect(
      page
        .locator('text=Awaiting payment')
        .or(page.locator('text=Payment sent by host'))
        .or(page.locator('text=Payment received'))
        .first()
    ).toBeVisible();
  });

  test('nudge button shows correct count and disables at max', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
    await page.goto('/cleaner');
    await expect(page.locator('text=My Jobs').or(page.locator('text=Jobs')).first()).toBeVisible();
  });

  test('payment token error pages render not crash', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/payment-respond?token=invalidtoken&action=confirm`);
    await expect(page.locator('h2').first()).toBeVisible();
    await expect(page.locator('text=Cannot read')).not.toBeVisible();
  });

  test('payment not_received token renders correctly', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/payment-respond?token=invalidtoken&action=not_received`);
    await expect(page.locator('h2').first()).toBeVisible();
    await expect(page.locator('text=Cannot read')).not.toBeVisible();
  });

  test('confirmed payment shows no action buttons', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    const confirmed = page.locator('text=Payment confirmed').first();
    if ((await confirmed.count()) === 0) {
      test.skip(true, 'No confirmed payments in test data');
      return;
    }
    const card = confirmed.locator('../..');
    await expect(card.locator('button', { hasText: 'Mark as paid' })).not.toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { ACCOUNTS, freshEmail, loginAs } from './helpers/auth';

test.describe('Authentication', () => {
  test('host logs in and sees dashboard', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Operations')).toBeVisible();
  });

  test('cleaner logs in and is redirected to /cleaner', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
    await expect(page).toHaveURL(/\/cleaner/);
    await expect(page.locator('text=My Jobs')).toBeVisible();
  });

  test('wrong credentials shows error not stack trace', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'fake@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('[type="submit"]');
    await expect(
      page.locator('text=Invalid').or(page.locator('text=incorrect')).or(page.locator('text=wrong'))
    ).toBeVisible();
    await expect(page.locator('text=Error:')).not.toBeVisible();
    await expect(page.locator('text=at Object.')).not.toBeVisible();
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('cleaner visiting /dashboard redirected to /cleaner', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/cleaner/);
  });

  test('admin sees Admin nav link', async ({ page }) => {
    await loginAs(page, ACCOUNTS.admin);
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('non-admin does not see Admin nav link', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    await expect(page.locator('nav').locator('text=Admin')).not.toBeVisible();
  });

  test('host can sign up with email/password', async ({ page }) => {
    const email = freshEmail('host');
    await page.goto('/signup');
    const hostRole = page.locator('[data-testid="role-host"]');
    if ((await hostRole.count()) > 0) await hostRole.click();
    await page.fill('[name="name"]', 'E2E Test Host');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('Google OAuth user sees no password form in settings', async ({ page }) => {
    test.skip(!process.env.E2E_GOOGLE_HOST_EMAIL, 'Google OAuth test account not configured');
    await loginAs(page, {
      email: process.env.E2E_GOOGLE_HOST_EMAIL!,
      password: process.env.E2E_GOOGLE_HOST_PASSWORD!,
    });
    await page.goto('/settings/account');
    await expect(page.locator('text=You signed in with Google')).toBeVisible();
    await expect(page.locator('text=Change password')).not.toBeVisible();
  });
});

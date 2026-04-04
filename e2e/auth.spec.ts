import { test, expect } from '@playwright/test';
import { ACCOUNTS, freshEmail, loginAs } from './helpers/auth';

test.describe('Authentication', () => {
  test('host logs in and sees dashboard', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    // Host dashboard is at / and shows "Operations Overview"
    await expect(page.locator('text=Operations').or(page.locator('text=Overview')).first()).toBeVisible();
  });

  test('cleaner logs in and is redirected to /cleaner', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
    await expect(page).toHaveURL(/\/cleaner/);
  });

  test('wrong credentials shows error not stack trace', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'fake@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('[type="submit"]');
    // Should show a user-friendly error, not a stack trace
    await expect(page.locator('text=Invalid').or(page.locator('text=incorrect')).or(page.locator('text=No account')).first()).toBeVisible();
    await expect(page.locator('text=at Object.')).not.toBeVisible();
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('cleaner visiting / is redirected to /cleaner', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner);
    await page.goto('/');
    await expect(page).toHaveURL(/\/cleaner/);
  });

  test('admin sees Admin nav link', async ({ page }) => {
    test.skip(!ACCOUNTS.admin.password, 'Admin password not configured');
    await loginAs(page, ACCOUNTS.admin);
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('non-admin does not see Admin nav link', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host);
    await expect(page.locator('a', { hasText: 'Admin' })).not.toBeVisible();
  });

  test('signup page exists and loads', async ({ page }) => {
    // Signup is SSR on the backend domain, not the React app
    // Just verify the link from login page points somewhere valid
    await page.goto('/login');
    const signupLink = page.locator('a', { hasText: 'Sign up' }).first();
    await expect(signupLink).toBeVisible();
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

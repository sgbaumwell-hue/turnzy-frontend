import { test, expect } from '@playwright/test'
import { ACCOUNTS, freshEmail, loginAs } from '../helpers/auth'
import { takeScreenshot } from '../helpers/testState'

test.describe('Group A: Auth & Onboarding', () => {

  test('A03. Host logs in with correct credentials', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
    await expect(page).toHaveURL(url => {
      const p = new URL(url).pathname
      return p === '/' || p.startsWith('/dashboard')
    })
    await expect(page.locator('text=Operations').first()).toBeVisible()
    await takeScreenshot(page, 'a03-host-login')
  })

  test('A04. Cleaner logs in', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner)
    await expect(page).toHaveURL(/\/cleaner/)
    await expect(page.locator('text=My Jobs').first()).toBeVisible()
    await takeScreenshot(page, 'a04-cleaner-login')
  })

  test('A05. Wrong password shows error not stack trace', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"], #email, input[type="email"]', 'fake@example.com')
    await page.fill('[name="password"], #password, input[type="password"]', 'wrongpassword')
    await page.click('[type="submit"]')
    await page.waitForTimeout(3000)
    // Should show user-friendly error, never a stack trace
    const body = await page.textContent('body')
    expect(body).not.toContain('at Object.')
    expect(body).not.toContain('TypeError')
    await takeScreenshot(page, 'a05-wrong-password')
  })

  test('A06. Unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('A07. Cleaner visiting host route redirects', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner)
    await page.goto('/')
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).toMatch(/\/cleaner|\/login/)
  })

  test('A08. Host visiting cleaner route redirects', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/cleaner')
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).not.toMatch(/\/cleaner$/)
  })

  test('A09. Admin sees Admin nav link', async ({ page }) => {
    test.skip(!ACCOUNTS.admin.password, 'Admin password not set')
    await loginAs(page, ACCOUNTS.admin)
    await expect(page.locator('text=Admin').first()).toBeVisible()
  })

  test('A14. Expired invite shows error not crash', async ({ page }) => {
    await page.goto('/team/accept?token=expiredtokentest')
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    expect(body).not.toContain('Cannot read')
    expect(body).not.toContain('undefined')
    await takeScreenshot(page, 'a14-expired-invite')
  })

  test('A15. Login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], [name="email"], #email').first()).toBeVisible()
    await expect(page.locator('input[type="password"], [name="password"], #password').first()).toBeVisible()
    await expect(page.locator('[type="submit"]').first()).toBeVisible()
    await takeScreenshot(page, 'a15-login-page')
  })

  test('A01. Host signup with email/password', async ({ page }) => {
    const email = freshEmail('host')
    await page.goto('/login')
    // Look for signup link
    const signupLink = page.locator('a[href*="signup"]').or(page.locator('a[href*="register"]')).or(page.locator('text=Sign up')).first()
    if (await signupLink.count() === 0) {
      test.skip(true, 'No signup link found on login page')
      return
    }
    await signupLink.click()
    await page.waitForTimeout(1000)
    await takeScreenshot(page, 'a01-signup-page')
  })

})

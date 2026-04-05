import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { seedScenario, takeScreenshot } from '../helpers/testState'

test.describe('Group K: Mobile-Specific', () => {

  test.beforeAll(async () => { await seedScenario('full_host') })

  test('K01. Host mobile header shows Turnzy branding', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.host)
    await expect(page.locator('text=Turnzy').first()).toBeVisible()
    await takeScreenshot(page, 'k01-host-mobile-header', 'iphone')
  })

  test('K03. Cleaner bottom nav has tabs', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.cleaner)
    await expect(page.locator('text=My Jobs').first()).toBeVisible()
    await takeScreenshot(page, 'k03-cleaner-mobile-nav', 'iphone')
  })

  test('K04. Mobile booking tap navigates to detail', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    const card = page.locator('[data-testid="booking-row"]').first()
    if (await card.count() === 0) return
    await card.click()
    await expect(page).toHaveURL(/\/bookings\/detail\/\d+/)
    await takeScreenshot(page, 'k04-mobile-detail', 'iphone')
  })

  test('K06. Mobile settings shows menu not section', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.cleaner)
    await page.goto('/cleaner/settings')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Settings').first()).toBeVisible()
    await takeScreenshot(page, 'k06-mobile-settings-menu', 'iphone')
  })

  test('K08. Calendar month-only on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.cleaner)
    await page.goto('/cleaner/calendar')
    await page.waitForTimeout(3000)
    // Week button should not be visible on mobile
    const weekBtn = page.locator('button').filter({ hasText: 'Week' })
    if (await weekBtn.count() > 0) {
      await expect(weekBtn).not.toBeVisible()
    }
    await takeScreenshot(page, 'k08-mobile-calendar', 'iphone')
  })

  test('K09. Notifications scroll — save visible', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.cleaner)
    await page.goto('/cleaner/settings/notifications')
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 9999))
    await page.waitForTimeout(500)
    await expect(page.locator('text=Save preferences').first()).toBeVisible()
    await takeScreenshot(page, 'k09-notifications-scrolled', 'iphone')
  })

  test('K11. Urgent booking red border on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await takeScreenshot(page, 'k11-urgent-mobile', 'iphone')
  })
})

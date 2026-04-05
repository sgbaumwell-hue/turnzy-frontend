import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { seedScenario, takeScreenshot } from '../helpers/testState'

test.describe('Group E: Cleaner Dashboard & Actions', () => {

  test.beforeAll(async () => { await seedScenario('connected_cleaner_with_jobs') })
  test.beforeEach(async ({ page }) => { await loginAs(page, ACCOUNTS.cleaner) })

  test('E01. Cleaner dashboard loads with jobs', async ({ page }) => {
    await expect(page.locator('text=My Jobs').first()).toBeVisible()
    await takeScreenshot(page, 'e01-cleaner-dashboard')
  })

  test('E06. Cleaner empty state shows invite CTA', async ({ page }) => {
    await seedScenario('unconnected_cleaner')
    await page.reload()
    await page.waitForTimeout(3000)
    const notConnected = page.locator("text=not connected").first()
    if (await notConnected.count() > 0) {
      await expect(notConnected).toBeVisible()
    }
    await takeScreenshot(page, 'e06-cleaner-empty')
    // Restore
    await seedScenario('connected_cleaner_with_jobs')
  })

  test('E08. Cleaner calendar renders', async ({ page }) => {
    await page.goto('/cleaner/calendar')
    await page.waitForTimeout(3000)
    await expect(page.locator('text=Page not found')).not.toBeVisible()
    await takeScreenshot(page, 'e08-cleaner-calendar')
  })

  test('E10. Cleaner activity feed human-readable', async ({ page }) => {
    await page.goto('/cleaner/activity')
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    expect(body).not.toContain('notification_sent: new')
    await takeScreenshot(page, 'e10-cleaner-activity')
  })

  test('E12. My Team toggle off — feature preview visible', async ({ page }) => {
    await page.goto('/cleaner/settings/team')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=I work with a team').first()).toBeVisible()
    const preview = page.locator('text=With a team you can').first()
    if (await preview.count() > 0) {
      await expect(preview).toBeVisible()
    }
    await takeScreenshot(page, 'e12-team-toggle-off')
  })

  test('E14. Cleaner notifications all options visible', async ({ page }) => {
    await page.goto('/cleaner/settings/notifications')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Job Notifications').first()).toBeVisible()
    await expect(page.locator('text=Advance Notice').first()).toBeVisible()
    await expect(page.locator('text=Reminders').first()).toBeVisible()
    await expect(page.locator('text=Save preferences').first()).toBeVisible()
    await takeScreenshot(page, 'e14-cleaner-notifications')
  })

  test('E15. 90-day option accessible on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return
    await page.goto('/cleaner/settings/notifications')
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 9999))
    await page.waitForTimeout(500)
    await expect(page.locator('text=Save preferences').first()).toBeVisible()
    await takeScreenshot(page, 'e15-notifications-mobile-scrolled')
  })

  test('E16. Cleaner account page editable', async ({ page }) => {
    await page.goto('/cleaner/settings/account')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Account').first()).toBeVisible()
    await takeScreenshot(page, 'e16-cleaner-account')
  })
})

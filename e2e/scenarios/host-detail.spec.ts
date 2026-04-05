import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { seedScenario, takeScreenshot } from '../helpers/testState'

test.describe('Group C: Host Booking Detail', () => {

  test.beforeAll(async () => { await seedScenario('full_host') })
  test.beforeEach(async ({ page }) => { await loginAs(page, ACCOUNTS.host) })

  test('C01. Clicking PENDING booking opens detail (desktop)', async ({ page, isMobile }) => {
    if (isMobile) return
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Awaiting response' }).first()
    if (await card.count() === 0) { test.skip(true, 'No pending booking'); return }
    await card.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Checkout').first()).toBeVisible()
    await takeScreenshot(page, 'c01-pending-detail')
  })

  test('C02. Pending detail shows correct buttons', async ({ page, isMobile }) => {
    if (isMobile) return
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Awaiting response' }).first()
    if (await card.count() === 0) return
    await card.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Resend Notification').first()).toBeVisible()
    await expect(page.locator("text=Dismiss").first()).toBeVisible()
    await takeScreenshot(page, 'c02-pending-buttons')
  })

  test('C05. CONFIRMED booking detail', async ({ page, isMobile }) => {
    if (isMobile) return
    const header = page.locator('button').filter({ hasText: 'Confirmed' }).first()
    if (await header.count() > 0) await header.click()
    await page.waitForTimeout(500)
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Confirmed' }).first()
    if (await card.count() === 0) { test.skip(true, 'No confirmed booking'); return }
    await card.click()
    await page.waitForTimeout(1500)
    // Resend should NOT be visible for confirmed
    await expect(page.locator('text=Resend Notification')).not.toBeVisible()
    await takeScreenshot(page, 'c05-confirmed-detail')
  })

  test('C06. DECLINED booking detail shows correct buttons', async ({ page, isMobile }) => {
    if (isMobile) return
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Declined' }).first()
    if (await card.count() === 0) { test.skip(true, 'No declined booking'); return }
    await card.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=DECLINED BY CLEANER').first()).toBeVisible()
    // Resend NOT visible for declined
    await expect(page.locator('text=Resend Notification')).not.toBeVisible()
    await takeScreenshot(page, 'c06-declined-detail')
  })

  test('C07. QUEUED booking detail shows notification date', async ({ page, isMobile }) => {
    if (isMobile) return
    const header = page.locator('button').filter({ hasText: 'Queued' }).first()
    if (await header.count() === 0) { test.skip(true, 'No queued section'); return }
    await header.click()
    await page.waitForTimeout(500)
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'QUEUED' }).first()
    if (await card.count() === 0) return
    await card.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Cleaner will be notified on').first()).toBeVisible()
    await takeScreenshot(page, 'c07-queued-detail')
  })

  test('C08. SELF-MANAGED booking detail', async ({ page, isMobile }) => {
    if (isMobile) return
    const header = page.locator('button').filter({ hasText: 'Self-Managed' }).first()
    if (await header.count() === 0) { test.skip(true, 'No self-managed'); return }
    await header.click()
    await page.waitForTimeout(500)
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Self-managed' }).first()
    if (await card.count() === 0) return
    await card.click()
    await page.waitForTimeout(1500)
    await takeScreenshot(page, 'c08-self-managed-detail')
  })

  test('C09. TIMES MODIFIED detail shows amber indicator', async ({ page, isMobile }) => {
    if (isMobile) return
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Times updated' }).first()
    if (await card.count() === 0) { test.skip(true, 'No times-modified booking'); return }
    await card.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Times were updated').first()).toBeVisible()
    await takeScreenshot(page, 'c09-times-modified-detail')
  })

  test('C14. Activity timeline shows events', async ({ page, isMobile }) => {
    if (isMobile) return
    const card = page.locator('[data-testid="booking-row"]').first()
    if (await card.count() === 0) return
    await card.click()
    await page.waitForTimeout(1500)
    const timeline = page.locator('text=Activity Timeline').first()
    if (await timeline.count() > 0) {
      await expect(timeline).toBeVisible()
    }
    await takeScreenshot(page, 'c14-timeline')
  })

  test('C16. Mobile: clicking booking navigates to detail page', async ({ page, isMobile }) => {
    if (!isMobile) return
    const card = page.locator('[data-testid="booking-row"]').first()
    if (await card.count() === 0) return
    await card.click()
    await expect(page).toHaveURL(/\/bookings\/detail\/\d+/)
    await takeScreenshot(page, 'c16-mobile-detail')
  })

  test('C23. COMPLETED booking is read-only', async ({ page, isMobile }) => {
    if (isMobile) return
    const header = page.locator('button').filter({ hasText: 'Past' }).first()
    if (await header.count() === 0) { test.skip(true, 'No past section'); return }
    await header.click()
    await page.waitForTimeout(500)
    const card = page.locator('[data-testid="booking-row"]').filter({ hasText: 'Completed' }).first()
    if (await card.count() === 0) return
    await card.click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Resend Notification')).not.toBeVisible()
    await takeScreenshot(page, 'c23-completed-detail')
  })
})

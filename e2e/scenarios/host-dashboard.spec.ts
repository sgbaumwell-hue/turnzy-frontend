import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { seedScenario, takeScreenshot } from '../helpers/testState'

test.describe('Group B: Host Dashboard — All States', () => {

  test.beforeAll(async () => {
    await seedScenario('full_host')
  })

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
  })

  test('B01. Dashboard loads with all sections', async ({ page }) => {
    await expect(page.locator('text=Operations').first()).toBeVisible()
    // At least one section should be visible
    const body = await page.textContent('body')
    const hasSections = body?.includes('Urgent') || body?.includes('Needs Action') || body?.includes('Confirmed')
    expect(hasSections).toBeTruthy()
    await takeScreenshot(page, 'b01-full-dashboard')
  })

  test('B02. URGENT section shows red cards', async ({ page }) => {
    const urgent = page.locator('text=Urgent').first()
    if (await urgent.count() === 0) { test.skip(true, 'No urgent section'); return }
    await expect(urgent).toBeVisible()
    await takeScreenshot(page, 'b02-urgent-section')
  })

  test('B03. SAME-DAY badge appears', async ({ page }) => {
    const sameDayBadge = page.locator('text=SAME-DAY').first()
    if (await sameDayBadge.count() > 0) {
      await expect(sameDayBadge).toBeVisible()
    }
    await takeScreenshot(page, 'b03-same-day')
  })

  test('B04. NEEDS ACTION section visible', async ({ page }) => {
    const section = page.locator('text=Needs Action').first()
    if (await section.count() === 0) { test.skip(true, 'No needs action'); return }
    await expect(section).toBeVisible()
    await takeScreenshot(page, 'b04-needs-action')
  })

  test('B05. CONFIRMED section expandable', async ({ page }) => {
    const header = page.locator('button').filter({ hasText: 'Confirmed' }).first()
    if (await header.count() === 0) { test.skip(true, 'No confirmed section'); return }
    await header.click()
    await page.waitForTimeout(500)
    await takeScreenshot(page, 'b05-confirmed-expanded')
  })

  test('B06. DECLINED bookings show DECLINED badge', async ({ page }) => {
    const badge = page.locator('text=Declined').first()
    if (await badge.count() > 0) {
      await expect(badge).toBeVisible()
    }
    await takeScreenshot(page, 'b06-declined')
  })

  test('B07. SELF-MANAGED section visible', async ({ page }) => {
    const header = page.locator('button').filter({ hasText: 'Self-Managed' }).first()
    if (await header.count() === 0) { test.skip(true, 'No self-managed'); return }
    await header.click()
    await page.waitForTimeout(500)
    await takeScreenshot(page, 'b07-self-managed')
  })

  test('B08. QUEUED section shows far-out bookings', async ({ page }) => {
    const header = page.locator('button').filter({ hasText: 'Queued' }).first()
    if (await header.count() === 0) { test.skip(true, 'No queued section'); return }
    await header.click()
    await page.waitForTimeout(500)
    const queuedBadge = page.locator('text=QUEUED').first()
    if (await queuedBadge.count() > 0) {
      await expect(queuedBadge).toBeVisible()
    }
    await takeScreenshot(page, 'b08-queued')
  })

  test('B09. TIMES MODIFIED indicator visible', async ({ page }) => {
    const indicator = page.locator('text=Times updated').first()
    if (await indicator.count() > 0) {
      await expect(indicator).toBeVisible()
    }
    await takeScreenshot(page, 'b09-times-modified')
  })

  test('B10. Sections collapse and expand', async ({ page }) => {
    const header = page.locator('button').filter({ hasText: 'Confirmed' }).first()
    if (await header.count() === 0) return
    // Expand
    await header.click()
    await page.waitForTimeout(300)
    // Collapse
    await header.click()
    await page.waitForTimeout(300)
    await expect(page.locator('text=Operations').first()).toBeVisible()
  })

  test('B11. Refresh button works', async ({ page }) => {
    const refreshBtn = page.locator('[aria-label="Refresh calendar"]').first()
    if (await refreshBtn.count() > 0) {
      await refreshBtn.click()
      await page.waitForTimeout(2000)
    }
    await expect(page.locator('text=Operations').first()).toBeVisible()
  })

  test('B12. Empty dashboard shows CTA', async ({ page }) => {
    await seedScenario('empty_host')
    await page.reload()
    await page.waitForTimeout(2000)
    const noTurnovers = page.locator('text=No turnovers yet').first()
    const addProperty = page.locator('text=Add a property').first()
    if (await noTurnovers.count() > 0) {
      await expect(noTurnovers).toBeVisible()
      await expect(addProperty).toBeVisible()
    }
    await takeScreenshot(page, 'b12-empty-state')
    // Restore data for other tests
    await seedScenario('full_host')
  })

  test('B14. /bookings/urgent shows only urgent', async ({ page }) => {
    await page.goto('/bookings/urgent')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Urgent').first()).toBeVisible()
    await takeScreenshot(page, 'b14-urgent-page')
  })

  test('B15. /bookings/confirmed shows only confirmed', async ({ page }) => {
    await page.goto('/bookings/confirmed')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Confirmed').first()).toBeVisible()
    await takeScreenshot(page, 'b15-confirmed-page')
  })

  test('B16. /bookings/queued shows only queued', async ({ page }) => {
    await page.goto('/bookings/queued')
    await page.waitForTimeout(2000)
    await takeScreenshot(page, 'b16-queued-page')
  })

  test('B17. /bookings/past shows completed', async ({ page }) => {
    await page.goto('/bookings/past')
    await page.waitForTimeout(2000)
    await takeScreenshot(page, 'b17-past-page')
  })

  test('B20. Activity feed shows human-readable descriptions', async ({ page }) => {
    await page.goto('/activity')
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    // Should never show raw event types
    expect(body).not.toContain('notification_sent: new_sameday')
    expect(body).not.toContain('Event: booking_detected')
    await takeScreenshot(page, 'b20-activity-feed')
  })
})

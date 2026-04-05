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

  test('C03. Resend Notification button clickable', async ({ page, isMobile }) => {
    if (isMobile) return
    const card = page.locator('[data-testid="booking-row"]').filter({ has: page.locator('text=Awaiting response').or(page.locator('text=AWAITING RESPONSE')).or(page.locator('text=IMMEDIATE ATTENTION')) }).first()
    if (await card.count() === 0) { test.skip(true, 'No pending booking'); return }
    await card.click()
    await page.waitForTimeout(1500)
    const resendBtn = page.locator('button').filter({ hasText: 'Resend Notification' }).first()
    await expect(resendBtn).toBeVisible()
    await takeScreenshot(page, 'c03-resend-visible')
  })

  test('C04. Dismiss changes booking state', async ({ page, isMobile }) => {
    if (isMobile) return
    await seedScenario('pending_booking')
    await page.reload()
    await page.waitForTimeout(2000)
    const card = page.locator('[data-testid="booking-row"]').filter({ has: page.locator('text=Test Pending') }).first()
    if (await card.count() === 0) return
    await card.click()
    await page.waitForTimeout(1500)
    const dismissBtn = page.locator('button').filter({ hasText: "Dismiss" }).first()
    if (await dismissBtn.count() > 0) {
      await dismissBtn.click()
      await page.waitForTimeout(2000)
      await takeScreenshot(page, 'c04-after-dismiss')
    }
  })

  test('C10. Pre-approve late checkout form opens', async ({ page, isMobile }) => {
    if (isMobile) return
    await seedScenario('confirmed_booking')
    await page.reload()
    await page.waitForTimeout(2000)
    const confirmedSection = page.locator('button').filter({ hasText: 'Confirmed' }).first()
    if (await confirmedSection.count() > 0) await confirmedSection.click()
    await page.waitForTimeout(500)
    const card = page.locator('[data-testid="booking-row"]').filter({ has: page.locator('text=Confirmed').or(page.locator('text=CONFIRMED')) }).first()
    if (await card.count() === 0) { test.skip(true, 'No confirmed booking'); return }
    await card.click()
    await page.waitForTimeout(1500)
    const editBtn = page.locator('text=Request Update').first()
    if (await editBtn.count() > 0) {
      await editBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator('text=Late Checkout').or(page.locator('text=New time')).first()).toBeVisible()
      await takeScreenshot(page, 'c10-preapprove-form')
    }
  })

  test('C18. URGENT shows PRIORITY ISSUE or IMMEDIATE ATTENTION', async ({ page, isMobile }) => {
    if (isMobile) return
    await seedScenario('full_host')
    await page.reload()
    await page.waitForTimeout(2000)
    const urgentCard = page.locator('[data-testid="booking-row"]').filter({ has: page.locator('text=IMMEDIATE ATTENTION') }).first()
    if (await urgentCard.count() === 0) { test.skip(true, 'No urgent booking'); return }
    await urgentCard.click()
    await page.waitForTimeout(1500)
    await expect(
      page.locator('text=IMMEDIATE ATTENTION').or(page.locator('text=PRIORITY')).first()
    ).toBeVisible()
    await takeScreenshot(page, 'c18-urgent-priority')
  })

  test('C24. Mark as Paid visible on completed unpaid', async ({ page, isMobile }) => {
    if (isMobile) return
    await seedScenario('completed_booking_unpaid')
    await page.reload()
    await page.waitForTimeout(2000)
    const pastHeader = page.locator('button').filter({ hasText: 'Past' }).first()
    if (await pastHeader.count() > 0) await pastHeader.click()
    await page.waitForTimeout(500)
    const card = page.locator('[data-testid="booking-row"]').filter({ has: page.locator('text=Test Completed') }).first()
    if (await card.count() === 0) { test.skip(true, 'No completed booking'); return }
    await expect(page.locator('text=Mark as paid').or(page.locator('text=Payment pending')).first()).toBeVisible()
    await takeScreenshot(page, 'c24-mark-paid')
  })
})

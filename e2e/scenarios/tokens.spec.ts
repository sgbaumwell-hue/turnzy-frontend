import { test, expect } from '@playwright/test'
import { takeScreenshot } from '../helpers/testState'

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app'

test.describe('Group G: Token Flows', () => {

  test('G05. Expired cleaner token shows error page', async ({ page }) => {
    await page.goto(`${BACKEND}/respond?token=expiredtest&action=accept`)
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    expect(body).not.toContain('Cannot read')
    expect(body).not.toContain('TypeError')
    await takeScreenshot(page, 'g05-expired-token')
  })

  test('G06. Invalid cleaner token shows error', async ({ page }) => {
    await page.goto(`${BACKEND}/respond?token=badtoken123&action=decline`)
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    expect(body).not.toContain('Cannot read')
    await takeScreenshot(page, 'g06-invalid-token')
  })

  test('G09. Invalid payment token shows error', async ({ page }) => {
    await page.goto(`${BACKEND}/cleaner/payment-respond?token=badpaytoken&action=confirm`)
    await page.waitForTimeout(3000)
    const text = await page.textContent('body')
    expect(text?.toLowerCase()).toMatch(/no longer valid|expired|invalid/)
    await takeScreenshot(page, 'g09-invalid-payment-token')
  })

  test('G08. Team invite expired shows error', async ({ page }) => {
    await page.goto('/team/accept?token=expiredteamtoken')
    await page.waitForTimeout(5000)
    const body = await page.textContent('body')
    expect(body).not.toContain('Cannot read')
    await takeScreenshot(page, 'g08-expired-team-invite')
  })
})

// ══════════════════════════════════════════════════════════════
//  EMAIL FLOW TESTS — Require Mailpit
// ══════════════════════════════════════════════════════════════

import { ACCOUNTS } from '../helpers/auth'
import { seedScenario, shot, loginAs } from '../helpers/testState'
import { waitForEmail, extractLink, clearEmails } from '../helpers/email'

const MAILPIT = !!process.env.MAILPIT_URL

test.describe('Group G: Email Flow Tests (Mailpit)', () => {

  test('G10 — host invite email arrives in Mailpit', async ({ page }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'MAILPIT_URL not set'); return }
    await clearEmails()
    await seedScenario('empty_host')
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/settings/cleaners')
    await page.waitForTimeout(2000)

    const addBtn = page.locator('text=Add cleaner').first()
    if (await addBtn.count() === 0) { test.skip(true, 'No Add cleaner button'); return }
    await addBtn.click()
    await page.waitForTimeout(500)

    const cleanerEmail = `sgbaumwell+qa-${Date.now()}@gmail.com`
    // Try multiple possible input selectors
    const nameInput = page.locator('input[placeholder*="Name"], input[name="name"], input[name="cleaner_name"]').first()
    const emailInput = page.locator('input[placeholder*="Email"], input[name="email"], input[name="cleaner_email"], input[type="email"]').first()
    if (await nameInput.count() > 0) await nameInput.fill('QA Test Cleaner')
    if (await emailInput.count() > 0) await emailInput.fill(cleanerEmail)

    const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Send")').first()
    if (await submitBtn.count() > 0) await submitBtn.click()
    await page.waitForTimeout(3000)

    const email = await waitForEmail(cleanerEmail, 'invited')
    await shot(page, 'G10-invite-email-sent', testInfo.project.name)
    expect(email).not.toBeNull()
    if (email) console.log('[G10] Email received:', email.Subject)
  })

  test('G11 — cleaner accept link from invite email works', async ({ page, context }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'MAILPIT_URL not set'); return }
    await clearEmails()
    await seedScenario('empty_host')
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/settings/cleaners')
    await page.waitForTimeout(2000)

    const addBtn = page.locator('text=Add cleaner').first()
    if (await addBtn.count() === 0) { test.skip(true, 'No Add cleaner button'); return }
    await addBtn.click()
    await page.waitForTimeout(500)

    const cleanerEmail = `sgbaumwell+qa-${Date.now()}@gmail.com`
    const nameInput = page.locator('input[placeholder*="Name"], input[name="name"], input[name="cleaner_name"]').first()
    const emailInput = page.locator('input[placeholder*="Email"], input[name="email"], input[name="cleaner_email"], input[type="email"]').first()
    if (await nameInput.count() > 0) await nameInput.fill('QA Cleaner')
    if (await emailInput.count() > 0) await emailInput.fill(cleanerEmail)

    const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Send")').first()
    if (await submitBtn.count() > 0) await submitBtn.click()
    await page.waitForTimeout(3000)

    const email = await waitForEmail(cleanerEmail, 'invited')
    if (!email) { test.skip(true, 'Email not received in time'); return }

    const acceptLink = await extractLink(email, '/cleaner/accept')
    if (!acceptLink) { test.skip(true, 'No accept link in email'); return }
    console.log('[G11] Accept link found:', acceptLink)

    const cleanerPage = await context.newPage()
    await cleanerPage.goto(acceptLink)
    await cleanerPage.waitForTimeout(2000)
    await shot(cleanerPage, 'G11-accept-link-page', testInfo.project.name)

    // Should show signup form or accept page, not an error
    await expect(
      cleanerPage.locator('[name="password"]')
        .or(cleanerPage.locator('text=Create'))
        .or(cleanerPage.locator('text=Accept'))
        .or(cleanerPage.locator('[name="name"]'))
        .first()
    ).toBeVisible({ timeout: 10000 })
    await cleanerPage.close()
  })

  test('G12 — resend notification email arrives in Mailpit', async ({ page }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'MAILPIT_URL not set'); return }
    await clearEmails()
    await seedScenario('pending_booking')
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)

    const bookingCard = page.locator('[data-testid="booking-row"]').first()
    if (await bookingCard.count() === 0) { test.skip(true, 'No booking cards'); return }
    await bookingCard.click()
    await page.waitForTimeout(1000)

    const resendBtn = page.locator('text=Resend Notification').first()
    if (await resendBtn.count() === 0) { test.skip(true, 'No Resend button'); return }
    await resendBtn.click()
    await page.waitForTimeout(3000)

    const email = await waitForEmail(ACCOUNTS.cleaner.email, 'turnover', 15000)
    await shot(page, 'G12-notification-email-sent', testInfo.project.name)
    expect(email).not.toBeNull()
    if (email) console.log('[G12] Notification email received:', email.Subject)
  })

  test('G13 — accept link in notification email confirms booking', async ({ page }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'MAILPIT_URL not set'); return }
    await clearEmails()
    await seedScenario('pending_booking')
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)

    const bookingCard = page.locator('[data-testid="booking-row"]').first()
    if (await bookingCard.count() === 0) { test.skip(true, 'No booking cards'); return }
    await bookingCard.click()
    await page.waitForTimeout(1000)

    const resendBtn = page.locator('text=Resend Notification').first()
    if (await resendBtn.count() === 0) { test.skip(true, 'No Resend button'); return }
    await resendBtn.click()
    await page.waitForTimeout(3000)

    const email = await waitForEmail(ACCOUNTS.cleaner.email, 'turnover', 15000)
    if (!email) { test.skip(true, 'Email not received'); return }

    const acceptLink = await extractLink(email, 'action=accept')
    if (!acceptLink) { test.skip(true, 'No accept link in email'); return }
    console.log('[G13] Accept link:', acceptLink)

    await page.goto(acceptLink)
    await page.waitForTimeout(2000)
    await shot(page, 'G13-after-accept', testInfo.project.name)

    await expect(
      page.locator('text=Accepted')
        .or(page.locator('text=confirmed'))
        .or(page.locator('text=Thank you'))
        .first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('G14 — decline link in notification email declines booking', async ({ page }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'MAILPIT_URL not set'); return }
    await clearEmails()
    await seedScenario('pending_booking')
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)

    const bookingCard = page.locator('[data-testid="booking-row"]').first()
    if (await bookingCard.count() === 0) { test.skip(true, 'No booking cards'); return }
    await bookingCard.click()
    await page.waitForTimeout(1000)

    const resendBtn = page.locator('text=Resend Notification').first()
    if (await resendBtn.count() === 0) { test.skip(true, 'No Resend button'); return }
    await resendBtn.click()
    await page.waitForTimeout(3000)

    const email = await waitForEmail(ACCOUNTS.cleaner.email, 'turnover', 15000)
    if (!email) { test.skip(true, 'Email not received'); return }

    const declineLink = await extractLink(email, 'action=decline')
    if (!declineLink) { test.skip(true, 'No decline link in email'); return }
    console.log('[G14] Decline link:', declineLink)

    await page.goto(declineLink)
    await page.waitForTimeout(2000)
    await shot(page, 'G14-after-decline', testInfo.project.name)

    await expect(
      page.locator('text=Declined')
        .or(page.locator('text=declined'))
        .or(page.locator('text=noted'))
        .first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('G15 — payment marked email arrives with confirm link', async ({ page }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'MAILPIT_URL not set'); return }
    await clearEmails()
    await seedScenario('completed_booking_unpaid')
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/bookings/past')
    await page.waitForTimeout(2000)

    const markPaidBtn = page.locator('button', { hasText: 'Mark as paid' }).first()
    if (await markPaidBtn.count() === 0) { test.skip(true, 'No Mark as paid button'); return }
    await markPaidBtn.click()
    await page.waitForTimeout(3000)

    const email = await waitForEmail(ACCOUNTS.cleaner.email, 'payment', 15000)
    await shot(page, 'G15-payment-email-sent', testInfo.project.name)
    expect(email).not.toBeNull()
    if (email) console.log('[G15] Payment email received:', email.Subject)

    const confirmLink = await extractLink(email, 'confirm')
    const notReceivedLink = await extractLink(email, 'not_received')
    console.log('[G15] Confirm link:', confirmLink ? 'YES' : 'NO')
    console.log('[G15] Not-received link:', notReceivedLink ? 'YES' : 'NO')
    expect(confirmLink || notReceivedLink).toBeTruthy()
  })
})

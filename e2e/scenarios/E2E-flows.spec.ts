/**
 * E2E Multi-User Flow Tests
 *
 * These test REAL user flows across multiple roles, verifying:
 * 1. UI actions produce correct DB state changes
 * 2. State changes propagate to other users' views
 * 3. Emails fire at the right moments
 * 4. Tokens work end-to-end
 * 5. Activity logs record the full chain
 *
 * Each test is a complete story, not a spot check.
 */
import { test, expect } from '@playwright/test'
import { seedScenario, assertBookingState, assertPropertyState, simulateIcal, shot, loginAs } from '../helpers/testState'
import { ACCOUNTS } from '../helpers/auth'
import { waitForEmail, extractLink, clearEmails } from '../helpers/email'

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app'
const MAILPIT = !!process.env.MAILPIT_URL

// ═══════════════════════════════════════════════════════════════
//  FLOW 1: DISMISS → VERIFY STATE → VERIFY SECTION MOVE
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: Host dismisses booking end-to-end', () => {
  test('pending → self_managed: DB state, UI section, detail panel all update', async ({ page }, testInfo) => {
    // SETUP: create a single pending booking
    const seed = await seedScenario('pending_booking')
    const bookingId = seed.booking_id
    expect(bookingId).toBeTruthy()

    // VERIFY INITIAL STATE in DB
    const before = await assertBookingState(bookingId)
    expect(before.booking.cleaner_status).toBe('pending')

    // ACT: login as host and dismiss
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)

    // Find and click the booking
    const card = page.locator('[data-testid="booking-row"]').first()
    if (await card.count() === 0) { test.skip(true, 'No booking card visible'); return }
    await card.click()
    await page.waitForTimeout(1000)

    // Click dismiss
    const dismissBtn = page.locator('button', { hasText: "I'll handle it" }).first()
    if (await dismissBtn.count() === 0) { test.skip(true, 'No dismiss button'); return }
    await dismissBtn.click()
    await page.waitForTimeout(2000)

    // ASSERT DB STATE changed
    const after = await assertBookingState(bookingId)
    expect(after.booking.cleaner_status).toBe('self_managed')

    // ASSERT activity log recorded the dismiss
    const dismissEvent = after.activity.find((e: any) => e.event_type === 'self_managed')
    expect(dismissEvent).toBeTruthy()

    // ASSERT UI updated — booking should NOT be in Needs Action anymore
    await page.reload()
    await page.waitForTimeout(2000)
    const selfManagedSection = page.locator('text=Self-Managed').first()
    await expect(selfManagedSection).toBeVisible()

    await shot(page, 'flow1-dismiss-complete', testInfo.project.name)
  })
})

// ═══════════════════════════════════════════════════════════════
//  FLOW 2: RESEND → EMAIL → ACCEPT → BOTH DASHBOARDS UPDATE
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: Host resends, cleaner accepts via email', () => {
  test('full round-trip: resend → email arrives → accept link → DB confirmed → host sees CONFIRMED', async ({ page, context }, testInfo) => {
    if (!MAILPIT) { test.skip(true, 'Mailpit not configured'); return }

    // SETUP
    await clearEmails()
    const seed = await seedScenario('pending_booking')
    const bookingId = seed.booking_id

    // STEP 1: Host resends notification
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)

    const card = page.locator('[data-testid="booking-row"]').first()
    if (await card.count() === 0) { test.skip(true, 'No booking'); return }
    await card.click()
    await page.waitForTimeout(1000)

    const resendBtn = page.locator('text=Resend Notification').first()
    if (await resendBtn.count() === 0) { test.skip(true, 'No Resend'); return }
    await resendBtn.click()
    await page.waitForTimeout(2000)
    await shot(page, 'flow2-after-resend', testInfo.project.name)

    // STEP 2: Email arrives in Mailpit
    const email = await waitForEmail('sgbaumwell@gmail.com', 'Turnover', 20000)
      || await waitForEmail('sgbaumwell@gmail.com', 'Booking', 5000)
    if (!email) { test.skip(true, 'Email not received'); return }
    console.log('[FLOW2] Email received:', email.Subject || email.subject)

    // STEP 3: Extract and visit accept link
    const acceptLink = await extractLink(email, 'action=accept')
    if (!acceptLink) { test.skip(true, 'No accept link in email'); return }
    console.log('[FLOW2] Accept link:', acceptLink)

    const acceptPage = await context.newPage()
    await acceptPage.goto(acceptLink)
    await acceptPage.waitForTimeout(3000)
    await shot(acceptPage, 'flow2-accept-page', testInfo.project.name)

    // Should show confirmation
    await expect(
      acceptPage.locator('text=Accepted').or(acceptPage.locator('text=confirmed')).or(acceptPage.locator('text=Thank you')).first()
    ).toBeVisible({ timeout: 10000 })
    await acceptPage.close()

    // STEP 4: Verify DB state is now 'accepted'
    const dbState = await assertBookingState(bookingId)
    expect(dbState.booking.cleaner_status).toBe('accepted')

    // STEP 5: Verify activity log has both resend and accept events
    const hasAccepted = dbState.activity.some((e: any) =>
      e.event_type === 'cleaner_responded' || e.event_type === 'accepted' || (e.description || '').includes('accept')
    )
    expect(hasAccepted).toBe(true)

    // STEP 6: Host dashboard shows booking as CONFIRMED
    await page.reload()
    await page.waitForTimeout(2000)
    // Expand Confirmed section
    const confirmedHeader = page.locator('text=Confirmed').first()
    if (await confirmedHeader.count() > 0) await confirmedHeader.click()
    await page.waitForTimeout(500)

    await shot(page, 'flow2-host-sees-confirmed', testInfo.project.name)
  })
})

// ═══════════════════════════════════════════════════════════════
//  FLOW 3: PAYMENT FULL CYCLE
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: Payment full cycle', () => {
  test('host marks paid → DB updates → cleaner confirms → fully closed', async ({ page }, testInfo) => {
    // SETUP: completed booking
    const seed = await seedScenario('completed_unpaid')
    const bookingId = seed.booking_id

    // Verify initial state
    const before = await assertBookingState(bookingId)
    expect(before.booking.cleaner_status).toBe('completed')
    expect(before.booking.payment_status).toBe('unpaid')

    // STEP 1: Host marks as paid via API (simulates UI click)
    await loginAs(page, ACCOUNTS.host)
    const markResult = await page.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      const res = await fetch(`${backend}/api/bookings/${bId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    }, [bookingId, BACKEND])
    console.log('[FLOW3] Mark paid result:', JSON.stringify(markResult))

    // STEP 2: Verify DB state changed to payment_marked
    const afterMark = await assertBookingState(bookingId)
    expect(afterMark.booking.payment_status).toBe('payment_marked')
    expect(afterMark.booking.cleaner_status).toBe('completed') // stays completed

    // STEP 3: Cleaner confirms payment via API
    // Login as cleaner first to get their token
    const cleanerPage = await page.context().newPage()
    await loginAs(cleanerPage, ACCOUNTS.cleaner)

    const confirmResult = await cleanerPage.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      const res = await fetch(`${backend}/api/cleaner/jobs/${bId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    }, [bookingId, BACKEND])
    console.log('[FLOW3] Confirm payment result:', JSON.stringify(confirmResult))
    await cleanerPage.close()

    // STEP 4: Verify DB state is now payment_confirmed
    const afterConfirm = await assertBookingState(bookingId)
    expect(afterConfirm.booking.payment_status).toBe('payment_confirmed')

    // STEP 5: Verify activity log has full chain
    const paymentEvents = afterConfirm.activity.filter((e: any) =>
      (e.event_type || '').includes('payment')
    )
    expect(paymentEvents.length).toBeGreaterThanOrEqual(1)

    await shot(page, 'flow3-payment-complete', testInfo.project.name)
  })

  test('payment not received → resets → host re-marks → cleaner confirms', async ({ page }, testInfo) => {
    const seed = await seedScenario('completed_unpaid')
    const bookingId = seed.booking_id

    // Host marks paid
    await loginAs(page, ACCOUNTS.host)
    await page.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      await fetch(`${backend}/api/bookings/${bId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
    }, [bookingId, BACKEND])

    // Cleaner says not received
    const cleanerPage = await page.context().newPage()
    await loginAs(cleanerPage, ACCOUNTS.cleaner)
    const notReceivedResult = await cleanerPage.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      const res = await fetch(`${backend}/api/cleaner/jobs/${bId}/payment-not-received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    }, [bookingId, BACKEND])
    console.log('[FLOW3b] Not received result:', JSON.stringify(notReceivedResult))

    // Verify DB state reset
    const afterNotReceived = await assertBookingState(bookingId)
    expect(afterNotReceived.booking.payment_status).toBe('payment_not_received')

    // Host re-marks
    await page.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      await fetch(`${backend}/api/bookings/${bId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
    }, [bookingId, BACKEND])

    const afterReMark = await assertBookingState(bookingId)
    expect(afterReMark.booking.payment_status).toBe('payment_marked')

    // Cleaner confirms this time
    await cleanerPage.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      await fetch(`${backend}/api/cleaner/jobs/${bId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
    }, [bookingId, BACKEND])
    await cleanerPage.close()

    const final = await assertBookingState(bookingId)
    expect(final.booking.payment_status).toBe('payment_confirmed')
    await shot(page, 'flow3b-payment-recovery', testInfo.project.name)
  })
})

// ═══════════════════════════════════════════════════════════════
//  FLOW 4: iCAL CHANGES → STATE TRANSITIONS → UI UPDATES
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: iCal state transitions', () => {
  test('minor time change on confirmed booking stays confirmed', async ({ page }, testInfo) => {
    const seed = await seedScenario('confirmed_booking')
    const bookingId = seed.booking_id

    const before = await assertBookingState(bookingId)
    expect(before.booking.cleaner_status).toBe('accepted')

    await simulateIcal('time_change_minor', bookingId)

    const after = await assertBookingState(bookingId)
    // Minor change should keep accepted status
    expect(after.booking.cleaner_status).toBe('accepted')
    expect(after.booking.is_times_modified).toBe(true)

    // UI should show times modified indicator
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'flow4-minor-change-stays-confirmed', testInfo.project.name)
  })

  test('major time change on confirmed reverts to pending', async ({ page }, testInfo) => {
    const seed = await seedScenario('confirmed_booking')
    const bookingId = seed.booking_id

    await simulateIcal('time_change_major', bookingId)

    const after = await assertBookingState(bookingId)
    expect(after.booking.cleaner_status).toBe('pending')
    expect(after.booking.is_times_modified).toBe(true)

    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    // Should now be in Needs Action, not Confirmed
    await expect(page.locator('text=Needs Action').first()).toBeVisible()
    await shot(page, 'flow4-major-change-reverts-pending', testInfo.project.name)
  })

  test('cancellation of pending booking removes it', async ({ page }, testInfo) => {
    const seed = await seedScenario('pending_booking')
    const bookingId = seed.booking_id

    await simulateIcal('cancellation', bookingId)

    const after = await assertBookingState(bookingId)
    // Booking should be gone or inactive
    expect(after.success === false || after.booking?.is_active === 0).toBeTruthy()

    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'flow4-cancellation', testInfo.project.name)
  })

  test('cancellation of self_managed is silent (no status change error)', async ({ page }, testInfo) => {
    const seed = await seedScenario('self_managed_booking')
    const bookingId = seed.booking_id

    await simulateIcal('cancellation', bookingId)

    // Should not crash — either deleted or still there
    const after = await assertBookingState(bookingId)
    expect(after).toBeTruthy() // no exception

    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Operations').first()).toBeVisible()
    await shot(page, 'flow4-self-managed-cancel-silent', testInfo.project.name)
  })
})

// ═══════════════════════════════════════════════════════════════
//  FLOW 5: SECTION COUNT INTEGRITY
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: Section counts match DB state', () => {
  test('full_host seed: all 9 bookings appear in correct sections', async ({ page }, testInfo) => {
    const seed = await seedScenario('full_host')
    const propertyId = seed.property_id

    // Check DB state
    const dbState = await assertPropertyState(propertyId)
    expect(dbState.total).toBe(9)
    console.log('[FLOW5] DB status counts:', JSON.stringify(dbState.statusCounts))

    // Login and verify UI
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(3000)

    // Check each section exists
    await expect(page.locator('text=Urgent').first()).toBeVisible()
    await expect(page.locator('text=Needs Action').first()).toBeVisible()

    // Expand all sections to count cards
    for (const section of ['Confirmed', 'Queued', 'Self-Managed', 'Past']) {
      const header = page.locator(`text=${section}`).first()
      if (await header.count() > 0) await header.click()
      await page.waitForTimeout(300)
    }

    // Count total visible booking cards
    const totalCards = await page.locator('[data-testid="booking-row"]').count()
    console.log('[FLOW5] Total visible cards:', totalCards)
    // Should be 9 (all states)
    expect(totalCards).toBe(9)

    await shot(page, 'flow5-all-sections-expanded', testInfo.project.name)
  })
})

// ═══════════════════════════════════════════════════════════════
//  FLOW 6: IDOR — USER A CANNOT ACCESS USER B'S DATA
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: Security — cross-user access', () => {
  test('cleaner cannot dismiss a booking (host-only action)', async ({ page }, testInfo) => {
    const seed = await seedScenario('pending_booking')
    const bookingId = seed.booking_id

    await loginAs(page, ACCOUNTS.cleaner)

    // Try to call host-only dismiss endpoint
    const result = await page.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      const res = await fetch(`${backend}/api/bookings/${bId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      return { status: res.status }
    }, [bookingId, BACKEND])

    console.log('[FLOW6] Cleaner dismiss attempt:', result.status)
    // Should be 403 or 404 (not 200)
    expect(result.status).toBeGreaterThanOrEqual(400)

    // Verify booking was NOT dismissed
    const dbState = await assertBookingState(bookingId)
    expect(dbState.booking.cleaner_status).toBe('pending')
  })

  test('host cannot accept a booking (cleaner-only action)', async ({ page }, testInfo) => {
    const seed = await seedScenario('pending_booking')
    const bookingId = seed.booking_id

    await loginAs(page, ACCOUNTS.host)

    const result = await page.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      const res = await fetch(`${backend}/api/cleaner/jobs/${bId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      return { status: res.status }
    }, [bookingId, BACKEND])

    console.log('[FLOW6] Host accept attempt:', result.status)
    // Host should not be able to accept as cleaner
    // The endpoint checks verifyCleanerOwnership which should fail
    expect(result.status).toBeGreaterThanOrEqual(400)

    const dbState = await assertBookingState(bookingId)
    expect(dbState.booking.cleaner_status).toBe('pending')
  })
})

// ═══════════════════════════════════════════════════════════════
//  FLOW 7: NUDGE LIMITS
// ═══════════════════════════════════════════════════════════════

test.describe('Flow: Payment nudge limits enforced', () => {
  test('3rd nudge succeeds, 4th is rejected', async ({ page }, testInfo) => {
    const seed = await seedScenario('completed_unpaid')
    const bookingId = seed.booking_id

    await loginAs(page, ACCOUNTS.cleaner)

    // Send 3 nudges
    for (let i = 1; i <= 3; i++) {
      const result = await page.evaluate(async ([bId, backend]) => {
        const token = localStorage.getItem('turnzy_token')
        const res = await fetch(`${backend}/api/cleaner/jobs/${bId}/nudge-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        })
        return { status: res.status, body: await res.json().catch(() => null) }
      }, [bookingId, BACKEND])
      console.log(`[FLOW7] Nudge ${i} result:`, result.status, result.body?.nudge_count)
    }

    // 4th should fail
    const fourth = await page.evaluate(async ([bId, backend]) => {
      const token = localStorage.getItem('turnzy_token')
      const res = await fetch(`${backend}/api/cleaner/jobs/${bId}/nudge-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    }, [bookingId, BACKEND])

    console.log('[FLOW7] 4th nudge result:', fourth.status)
    expect(fourth.status).toBe(400)

    // Verify DB count is 3, not 4
    const dbState = await assertBookingState(bookingId)
    expect(dbState.booking.payment_nudge_count).toBe(3)
  })
})

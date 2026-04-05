import { test, expect } from '@playwright/test'
import { seedScenario, shot, loginAs } from '../helpers/testState'
import { ACCOUNTS } from '../helpers/auth'

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app'

async function simulateIcal(action: string, bookingId?: number, propertyId?: number) {
  const url = new URL(`${BACKEND}/admin/simulate-ical-event`)
  url.searchParams.set('action', action)
  if (bookingId) url.searchParams.set('booking_id', String(bookingId))
  if (propertyId) url.searchParams.set('property_id', String(propertyId))
  try {
    const res = await fetch(url.toString())
    return await res.json()
  } catch (e) { return { success: false, error: String(e) } }
}

test.describe('Group I: iCal State Transitions', () => {

  test('I03 — cancellation of pending booking removes it', async ({ page }, testInfo) => {
    const seed = await seedScenario('pending_booking')
    if (!seed?.booking_id) { test.skip(true, 'Seed failed'); return }
    await simulateIcal('cancellation', seed.booking_id)
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'I03-after-cancellation', testInfo.project.name)
    // Booking should be gone
    await expect(page.locator('text=Test Pending')).not.toBeVisible()
  })

  test('I07 — cancellation of self-managed is silent', async ({ page }, testInfo) => {
    const seed = await seedScenario('self_managed_booking')
    if (!seed?.booking_id) { test.skip(true, 'Seed failed'); return }
    await simulateIcal('cancellation', seed.booking_id)
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'I07-self-managed-cancel', testInfo.project.name)
    await expect(page.locator('text=Operations')).toBeVisible()
  })

  test('I08 — minor time change on confirmed stays confirmed', async ({ page }, testInfo) => {
    const seed = await seedScenario('confirmed_booking')
    if (!seed?.booking_id) { test.skip(true, 'Seed failed'); return }
    await simulateIcal('time_change_minor', seed.booking_id)
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'I08-minor-change', testInfo.project.name)
    // Should still be confirmed
    const confirmedSection = page.locator('text=Confirmed').first()
    if (await confirmedSection.count() > 0) {
      await confirmedSection.click()
      await page.waitForTimeout(500)
    }
    await expect(page.locator('text=Test Confirmed').first()).toBeVisible()
  })

  test('I09 — major time change on confirmed requires reconfirm', async ({ page }, testInfo) => {
    const seed = await seedScenario('confirmed_booking')
    if (!seed?.booking_id) { test.skip(true, 'Seed failed'); return }
    await simulateIcal('time_change_major', seed.booking_id)
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'I09-major-change-reconfirm', testInfo.project.name)
    // Should have moved to needs action / awaiting response
    await expect(
      page.locator('text=Awaiting response')
        .or(page.locator('text=AWAITING RESPONSE'))
        .or(page.locator('text=Needs Action'))
        .first()
    ).toBeVisible()
  })

  test('I12 — time change on queued stays queued', async ({ page }, testInfo) => {
    const seed = await seedScenario('queued_booking')
    if (!seed?.booking_id) { test.skip(true, 'Seed failed'); return }
    await simulateIcal('time_change_minor', seed.booking_id)
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    const queuedSection = page.locator('text=Queued').first()
    if (await queuedSection.count() > 0) {
      await queuedSection.click()
      await page.waitForTimeout(500)
    }
    await shot(page, 'I12-queued-time-change', testInfo.project.name)
    await expect(page.locator('text=Morgan Chen').first()).toBeVisible()
  })

  test('I15 — time change on self-managed is silent', async ({ page }, testInfo) => {
    const seed = await seedScenario('self_managed_booking')
    if (!seed?.booking_id) { test.skip(true, 'Seed failed'); return }
    await simulateIcal('time_change_minor', seed.booking_id)
    await loginAs(page, ACCOUNTS.host)
    await page.waitForTimeout(2000)
    await shot(page, 'I15-self-managed-change', testInfo.project.name)
    // Self-managed section should still have the booking
    const smSection = page.locator('text=Self-Managed').first()
    if (await smSection.count() > 0) {
      await smSection.click()
      await page.waitForTimeout(500)
    }
    await expect(page.locator('text=Riley Davis').first()).toBeVisible()
  })

})

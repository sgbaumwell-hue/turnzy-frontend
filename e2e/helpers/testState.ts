import * as fs from 'fs'
import { loginAs as authLogin } from './auth'

const BACKEND = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app'

export async function seedScenario(scenario: string) {
  try {
    const res = await fetch(`${BACKEND}/admin/test-setup?scenario=${scenario}`)
    const data = await res.json()
    if (!data.success) console.warn(`[SEED] Scenario '${scenario}' failed:`, data.error)
    return data
  } catch (err: any) {
    console.warn(`[SEED] Failed to reach backend for scenario '${scenario}':`, err.message)
    return { success: false }
  }
}

/**
 * Assert DB state for a booking. Returns the booking record,
 * activity log, and team assignments directly from the database.
 */
export async function assertBookingState(bookingId: number | string) {
  try {
    const res = await fetch(`${BACKEND}/admin/test-assert?booking_id=${bookingId}`)
    return await res.json()
  } catch (err: any) {
    console.warn(`[ASSERT] Failed to check booking ${bookingId}:`, err.message)
    return { success: false }
  }
}

/**
 * Assert all bookings for a property. Returns status counts.
 */
export async function assertPropertyState(propertyId: number | string) {
  try {
    const res = await fetch(`${BACKEND}/admin/test-assert?property_id=${propertyId}`)
    return await res.json()
  } catch (err: any) {
    console.warn(`[ASSERT] Failed to check property ${propertyId}:`, err.message)
    return { success: false }
  }
}

/**
 * Simulate an iCal event (cancellation, time change, etc.)
 */
export async function simulateIcal(action: string, bookingId?: number | string, propertyId?: number | string) {
  try {
    const params = new URLSearchParams({ action })
    if (bookingId) params.set('booking_id', String(bookingId))
    if (propertyId) params.set('property_id', String(propertyId))
    const res = await fetch(`${BACKEND}/admin/simulate-ical-event?${params}`)
    return await res.json()
  } catch (err: any) {
    console.warn(`[SIMULATE] Failed:`, err.message)
    return { success: false }
  }
}

export async function shot(page: any, name: string, device = 'desktop') {
  const dir = `e2e/screenshots/${name.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  await page.screenshot({ path: `${dir}/${device}.jpg`, type: 'jpeg', quality: 80 })
}

// Alias for backward compat
export const takeScreenshot = shot

export { authLogin as loginAs }

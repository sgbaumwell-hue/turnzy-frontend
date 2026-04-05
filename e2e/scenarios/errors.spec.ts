import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { takeScreenshot } from '../helpers/testState'

test.describe('Group J: Error States & Edge Cases', () => {

  test('J01. 404 for invalid route', async ({ page }) => {
    await page.goto('/nonexistent-route')
    await page.waitForTimeout(2000)
    // Should show something, not blank
    const body = await page.textContent('body')
    expect(body?.length).toBeGreaterThan(10)
    await takeScreenshot(page, 'j01-404')
  })

  test('J05. Invalid booking ID', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/bookings/detail/99999999')
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    expect(body).not.toContain('TypeError')
    expect(body).not.toContain('Cannot read')
    await takeScreenshot(page, 'j05-invalid-booking')
  })

  test('J06. Empty activity feed shows message', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/activity')
    await page.waitForTimeout(3000)
    // Should show either activity entries or empty state
    const body = await page.textContent('body')
    expect(body?.includes('Activity') || body?.includes('No activity')).toBeTruthy()
    await takeScreenshot(page, 'j06-activity')
  })

  test('J15. Error responses no stack traces', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/bookings/detail/0')
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    expect(body).not.toContain('at Object.')
    expect(body).not.toContain('at Module.')
    expect(body).not.toContain('node_modules')
  })
})

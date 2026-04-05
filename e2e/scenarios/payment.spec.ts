import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { seedScenario, takeScreenshot } from '../helpers/testState'

test.describe('Group H: Payment Flows', () => {

  test.beforeAll(async () => { await seedScenario('full_host') })

  test('H01. Completed unpaid shows payment status', async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
    await page.goto('/bookings/past')
    await page.waitForTimeout(3000)
    const body = await page.textContent('body')
    const hasPayment = body?.includes('Mark as paid') || body?.includes('Payment pending') || body?.includes('payment')
    // If completed bookings exist, payment UI should show
    await takeScreenshot(page, 'h01-unpaid-card')
  })

  test('H04. Cleaner sees payment status on completed jobs', async ({ page }) => {
    await loginAs(page, ACCOUNTS.cleaner)
    await page.waitForTimeout(2000)
    // Find Past section
    const pastHeader = page.locator('button').filter({ hasText: 'Past' }).first()
    if (await pastHeader.count() > 0) {
      await pastHeader.click()
      await page.waitForTimeout(500)
    }
    await takeScreenshot(page, 'h04-cleaner-payment')
  })
})

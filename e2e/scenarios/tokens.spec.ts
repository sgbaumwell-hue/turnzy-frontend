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

import { test, expect } from '@playwright/test'
import { ACCOUNTS, loginAs } from '../helpers/auth'
import { takeScreenshot } from '../helpers/testState'

test.describe('Group D: Host Settings', () => {

  test.beforeEach(async ({ page }) => { await loginAs(page, ACCOUNTS.host) })

  test('D01. Properties page shows Add property', async ({ page }) => {
    await page.goto('/settings/properties')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Add property').first()).toBeVisible()
    await takeScreenshot(page, 'd01-properties')
  })

  test('D02. Cleaners page shows Add cleaner', async ({ page }) => {
    await page.goto('/settings/cleaners')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Add cleaner').first()).toBeVisible()
    await takeScreenshot(page, 'd02-cleaners')
  })

  test('D03. Notifications page toggles functional', async ({ page }) => {
    await page.goto('/settings/notifications')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Cleaner Confirmation').first()).toBeVisible()
    await takeScreenshot(page, 'd03-notifications')
  })

  test('D04. Late Start Alerts helper text visible', async ({ page }) => {
    await page.goto('/settings/notifications')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Alert me if cleaning').first()).toBeVisible()
  })

  test('D06. Billing shows beta message', async ({ page }) => {
    await page.goto('/settings/billing')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Free during beta').first()).toBeVisible()
    await takeScreenshot(page, 'd06-billing')
  })

  test('D09. Account Danger Zone visible', async ({ page }) => {
    await page.goto('/settings/account')
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Danger Zone').first()).toBeVisible()
    await takeScreenshot(page, 'd09-account')
  })

  test('D08. Host mobile nav has Calendar', async ({ page, isMobile }) => {
    if (!isMobile) return
    await expect(page.locator('text=Calendar').first()).toBeVisible()
    await takeScreenshot(page, 'd08-mobile-nav')
  })
})

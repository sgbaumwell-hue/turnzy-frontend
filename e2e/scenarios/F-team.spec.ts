import { test, expect } from '@playwright/test'
import { seedScenario, shot } from '../helpers/testState'

const HAS_TEAM_ACCOUNT = !!process.env.E2E_TEAM_EMAIL

test.describe('Group F: Team Member Flows', () => {

  test('F01 — team dashboard loads for team member', async ({ page }, testInfo) => {
    test.skip(!HAS_TEAM_ACCOUNT, 'Team test account not configured')
    await page.goto('/login')
    await page.fill('#email', process.env.E2E_TEAM_EMAIL!)
    await page.fill('#password', process.env.E2E_TEAM_PASSWORD || 'TestPassword123!')
    await page.click('[type="submit"]')
    await page.waitForTimeout(5000)
    await shot(page, 'F01-team-dashboard', testInfo.project.name)
    await expect(
      page.locator('text=My Jobs')
        .or(page.locator('text=Assigned'))
        .or(page.locator('text=Welcome'))
        .first()
    ).toBeVisible()
  })

  test('F08 — expired team invite shows error', async ({ page }, testInfo) => {
    await page.goto('/team/accept?token=expiredteaminvite')
    await page.waitForTimeout(3000)
    await shot(page, 'F08-expired-team-invite', testInfo.project.name)
    await expect(
      page.locator('text=expired')
        .or(page.locator('text=invalid'))
        .or(page.locator('text=Invalid invite'))
        .or(page.locator('text=not found'))
        .first()
    ).toBeVisible()
  })

  test('F10 — team member blocked from host routes', async ({ page }) => {
    test.skip(!HAS_TEAM_ACCOUNT, 'Team test account not configured')
    await page.goto('/login')
    await page.fill('#email', process.env.E2E_TEAM_EMAIL!)
    await page.fill('#password', process.env.E2E_TEAM_PASSWORD || 'TestPassword123!')
    await page.click('[type="submit"]')
    await page.waitForTimeout(5000)
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toMatch(/\/dashboard$/)
  })

})

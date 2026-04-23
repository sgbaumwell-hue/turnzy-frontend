import { test } from '@playwright/test'
import { ACCOUNTS, loginAs } from './helpers/auth'
import * as fs from 'fs'
import * as path from 'path'

const OUT = 'docs/settings-redesign-before'

async function shotTo(page: any, name: string, device: string) {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
  await page.screenshot({ path: path.join(OUT, `${name}--${device}.jpg`), type: 'jpeg', quality: 85, fullPage: true })
}

const PAGES = [
  { key: 'account', url: '/settings/account' },
  { key: 'notifications', url: '/settings/notifications' },
  { key: 'settings-home', url: '/settings' },
  { key: 'cleaners', url: '/settings/cleaners' },
  { key: 'properties', url: '/settings/properties' },
]

test.describe('Before: Settings Redesign snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ACCOUNTS.host)
  })

  for (const p of PAGES) {
    test(`${p.key}`, async ({ page, isMobile }) => {
      await page.goto(p.url)
      await page.waitForTimeout(2500)
      const device = isMobile ? 'mobile' : 'desktop'
      await shotTo(page, p.key, device)
    })
  }
})

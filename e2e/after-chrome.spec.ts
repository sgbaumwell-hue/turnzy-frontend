import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const OUT = 'docs/settings-redesign-after-chrome'
const BACKEND = 'https://cleaningmanagement-dev.up.railway.app/api'
const EMAIL = 'sgbaumwell+e2e-host@gmail.com'
const PASSWORD = 'TestPassword123!'

async function shotTo(page: any, name: string, device: string) {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
  await page.screenshot({ path: path.join(OUT, `${name}--${device}.jpg`), type: 'jpeg', quality: 85, fullPage: true })
}

// Bypass the browser login flow (cookie-domain mismatch on localhost proxy).
// Fetch a real JWT from the dev backend and inject it into localStorage,
// then hydrate the Zustand auth store so ProtectedRoute passes.
async function seedAuth(page: any) {
  const res = await fetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const data: any = await res.json()
  const { token, ...user } = data
  await page.goto('/')
  await page.evaluate(([t, u]: [string, any]) => {
    localStorage.setItem('turnzy_token', t)
    // zustand persist key is `turnzy-auth`
    localStorage.setItem('turnzy-auth', JSON.stringify({
      state: { user: u, isAuthenticated: true },
      version: 0,
    }))
  }, [token, user] as any)
}

const PAGES = [
  { key: 'account',       url: '/settings/account' },
  { key: 'notifications', url: '/settings/notifications' },
  { key: 'settings-home', url: '/settings' },
  { key: 'cleaners',      url: '/settings/cleaners' },
  { key: 'properties',    url: '/settings/properties' },
  { key: 'dashboard',     url: '/' },
]

test.describe('After (chrome only): Settings Redesign snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page)
  })

  for (const p of PAGES) {
    test(`${p.key}`, async ({ page, isMobile }) => {
      await page.goto(p.url)
      await page.waitForTimeout(3000)
      const device = isMobile ? 'mobile' : 'desktop'
      await shotTo(page, p.key, device)
    })
  }
})

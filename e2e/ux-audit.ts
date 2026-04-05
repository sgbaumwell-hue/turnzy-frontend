import { chromium, devices, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const SKIP_ANALYSIS = process.env.SKIP_ANALYSIS === 'true'

let client: any = null
if (!SKIP_ANALYSIS) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  client = new Anthropic()
}

const BASE_URL = process.env.BASE_URL || 'https://turnzy-frontend-dev.up.railway.app'
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app'

const HOST = {
  email: 'sgbaumwell+e2e-host@gmail.com',
  password: process.env.E2E_HOST_PASSWORD || 'TestPassword123!'
}
const CLEANER = {
  email: 'sgbaumwell+e2e-cleaner@gmail.com',
  password: process.env.E2E_CLEANER_PASSWORD || 'TestPassword123!'
}

interface PageDef {
  label: string
  url: string
  role: 'host' | 'cleaner' | 'none'
  notes: string
  clickBooking?: { badgeText: string; section?: string }
  scrollDown?: number
}

const PAGES: PageDef[] = [
  // AUTH
  { label: 'Login', url: '/login', role: 'none',
    notes: 'First impression. Google button prominence, signup link visibility, form clarity.' },

  // HOST DASHBOARD
  { label: 'Host Dashboard — with bookings', url: '/', role: 'host',
    notes: 'Main host view with real data. Check section hierarchy: URGENT first, section labels, card info density, badge readability, same-day indicator, status colors.' },

  // HOST DETAIL STATES
  { label: 'Host Detail — PENDING', url: '/', role: 'host',
    notes: 'Pending booking detail. Resend/Backup/Dismiss buttons. Are labels clear?',
    clickBooking: { badgeText: 'Awaiting response', section: 'Needs Action' } },
  { label: 'Host Detail — CONFIRMED', url: '/', role: 'host',
    notes: 'Confirmed booking. Green badge, no Resend. Is confirmation communicated?',
    clickBooking: { badgeText: 'Confirmed', section: 'Confirmed' } },
  { label: 'Host Detail — DECLINED', url: '/', role: 'host',
    notes: 'Declined booking. Red badge, Ask Backup primary. Is urgency clear?',
    clickBooking: { badgeText: 'Declined', section: 'Needs Action' } },
  { label: 'Host Detail — SELF-MANAGED', url: '/', role: 'host',
    notes: 'Self-managed booking. Gray badge, Ask Backup only.',
    clickBooking: { badgeText: 'Self-managed', section: 'Self-Managed' } },
  { label: 'Host Detail — QUEUED', url: '/', role: 'host',
    notes: 'Queued booking. Shows notification date. Only Dismiss button.',
    clickBooking: { badgeText: 'QUEUED', section: 'Queued' } },
  { label: 'Host Detail — TIMES MODIFIED', url: '/', role: 'host',
    notes: 'Booking with times modified indicator. Is the amber warning visible?',
    clickBooking: { badgeText: 'Times updated' } },

  // HOST SETTINGS
  { label: 'Host Settings — Properties', url: '/settings/properties', role: 'host',
    notes: 'Property management. Add property CTA clarity.' },
  { label: 'Host Settings — Cleaners', url: '/settings/cleaners', role: 'host',
    notes: 'Cleaner management. Invite flow clarity.' },
  { label: 'Host Settings — Notifications', url: '/settings/notifications', role: 'host',
    notes: 'Notification toggles. Toggle grouping and label clarity.' },
  { label: 'Host Settings — Billing', url: '/settings/billing', role: 'host',
    notes: 'Beta billing page. Does "Free during beta" feel trustworthy?' },
  { label: 'Host Settings — Account', url: '/settings/account', role: 'host',
    notes: 'Profile and security. Danger Zone styling.' },

  // HOST ACTIVITY
  { label: 'Host Activity', url: '/activity', role: 'host',
    notes: 'Activity feed with real data. Timeline readability.' },

  // CLEANER DASHBOARD
  { label: 'Cleaner Dashboard — with jobs', url: '/cleaner', role: 'cleaner',
    notes: 'Cleaner main view with real jobs. Accept/decline clarity, property name, date readability.' },

  // CLEANER SETTINGS
  { label: 'Cleaner Settings — My Team', url: '/cleaner/settings/team', role: 'cleaner',
    notes: 'Team toggle OFF. Toggle description clarity.' },
  { label: 'Cleaner Settings — Notifications', url: '/cleaner/settings/notifications', role: 'cleaner',
    notes: 'Notification preferences. Advance notice and time picker labels.' },
  { label: 'Cleaner Settings — Account', url: '/cleaner/settings/account', role: 'cleaner',
    notes: 'Account settings. Back navigation, Danger Zone visibility.' },

  // CLEANER OTHER
  { label: 'Cleaner Calendar', url: '/cleaner/calendar', role: 'cleaner',
    notes: 'Calendar with real events. Event readability, today highlight.' },
  { label: 'Cleaner Activity', url: '/cleaner/activity', role: 'cleaner',
    notes: 'Activity feed. Event descriptions, timeline scannability.' },

  // TOKEN ERROR PAGES
  { label: 'Token Error — bad cleaner respond', url: '', role: 'none',
    notes: 'One-tap link with bad token. Is error friendly and clear?' },
  { label: 'Token Error — bad team invite', url: '/team/accept?token=audittoken', role: 'none',
    notes: 'Team invite with bad token. Is error guiding?' },
]

const VIEWPORTS = [
  { name: 'Desktop', device: null as string | null, width: 1440, height: 900 },
  { name: 'iPhone-14', device: 'iPhone 14', width: 390, height: 844 },
]

const UX_SYSTEM_PROMPT = `You are a senior UX designer reviewing Turnzy, a mobile-first SaaS app that helps Airbnb hosts coordinate cleaning turnovers with cleaners. Target user: self-managing host with 1-3 properties.

Review each screenshot for:
1. CLARITY — Is purpose immediately obvious?
2. HIERARCHY — Is important info prominent?
3. FRICTION — What takes more effort than it should?
4. MOBILE — Tap targets, text readability, thumb reach
5. MISSING — Empty states, error handling, confirmations
6. CONSISTENCY — Alignment, polish, broken elements

Rate findings: 🔴 CRITICAL  🟡 MODERATE  🟢 MINOR
End with one-sentence verdict.`

async function loginAs(page: Page, role: string) {
  if (role === 'none') return
  const creds = role === 'host' ? HOST : CLEANER
  await page.goto(BASE_URL + '/login')
  await page.waitForTimeout(1000)
  await page.fill('[name="email"], #email, input[type="email"]', creds.email)
  await page.fill('[name="password"], #password, input[type="password"]', creds.password)
  await page.click('[type="submit"], button:has-text("Sign in"), button:has-text("Log in")')
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 15000 })
  await page.waitForTimeout(2000)
}

async function navigateAndClickBooking(page: Page, badgeText: string, section?: string) {
  await page.goto(BASE_URL + '/')
  await page.waitForTimeout(2500)

  // Expand section if needed
  if (section) {
    const sectionHeader = page.locator(`button`).filter({ hasText: section }).first()
    if (await sectionHeader.count() > 0) {
      await sectionHeader.click()
      await page.waitForTimeout(500)
    }
  }

  // Find card with matching text
  const card = page.locator('[data-testid="booking-row"]')
    .filter({ hasText: badgeText }).first()
  if (await card.count() > 0) {
    await card.click()
    await page.waitForTimeout(1500)
  } else {
    console.warn(`    ⚠ No card found with text "${badgeText}"`)
  }
}

async function analyzeScreenshot(buf: Buffer, label: string, viewport: string, notes: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: UX_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: buf.toString('base64') } },
          { type: 'text', text: `Review "${label}" on ${viewport}.\n\nContext: ${notes}\n\nProvide findings.` }
        ]
      }]
    })
    return response.content.filter(b => b.type === 'text').map(b => (b as any).text).join('\n')
  } catch (err: any) {
    console.warn(`    ⚠ Claude API error: ${err.message}`)
    return `_Claude API unavailable: ${err.message}. Review screenshot manually._`
  }
}

async function runAudit() {
  console.log('🔍 Starting Turnzy UX Audit...\n')

  const outputDir = './ux-audit-screenshots'
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const report: string[] = [
    '# Turnzy UX Audit Report',
    `Generated: ${new Date().toLocaleString()}`,
    `App: ${BASE_URL}`, '', '---', ''
  ]

  let findings = { critical: 0, moderate: 0, minor: 0 }
  let captured = 0
  let failed = 0

  for (const viewport of VIEWPORTS) {
    console.log(`\n📱 ${viewport.name}...`)

    const browser = await chromium.launch()
    const context = viewport.device
      ? await browser.newContext({ ...devices[viewport.device] })
      : await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })

    report.push(`## ${viewport.name}`, '')

    const loggedIn: Record<string, boolean> = {}
    let page = await context.newPage()

    for (const pageDef of PAGES) {
      console.log(`  → ${pageDef.label}`)

      try {
        // Login if needed
        if (pageDef.role !== 'none' && !loggedIn[pageDef.role]) {
          await loginAs(page, pageDef.role)
          loggedIn[pageDef.role] = true
        }

        // Handle special token error page (backend URL)
        if (pageDef.label.includes('bad cleaner respond')) {
          await page.goto(`${BACKEND_URL}/respond?token=audittest&action=accept`, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(2000)
        } else if (pageDef.clickBooking) {
          // Click into a specific booking
          await navigateAndClickBooking(page, pageDef.clickBooking.badgeText, pageDef.clickBooking.section)
        } else {
          const url = pageDef.url.startsWith('http') ? pageDef.url : BASE_URL + pageDef.url
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(2500)
        }

        // Scroll if needed
        if (pageDef.scrollDown) {
          await page.evaluate((y) => window.scrollTo(0, y), pageDef.scrollDown)
          await page.waitForTimeout(500)
        }

        // Screenshot
        const filename = `${viewport.name}-${pageDef.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
        const screenshotPath = path.join(outputDir, filename)
        const buf = await page.screenshot({ type: 'jpeg', quality: 85, fullPage: false })
        fs.writeFileSync(screenshotPath, buf)
        captured++

        // Claude analysis (skip if SKIP_ANALYSIS mode)
        if (!SKIP_ANALYSIS) {
          const analysis = await analyzeScreenshot(buf, pageDef.label, viewport.name, pageDef.notes)
          findings.critical += (analysis.match(/🔴/g) || []).length
          findings.moderate += (analysis.match(/🟡/g) || []).length
          findings.minor += (analysis.match(/🟢/g) || []).length
          report.push(`### ${pageDef.label}`, '', analysis, '', '---', '')
        } else {
          report.push(`### ${pageDef.label}`, '', `📸 Screenshot captured — run \`npm run ux-audit\` for AI analysis`, '', '---', '')
        }

        // Role switch: need new page if switching between host and cleaner
        const nextPage = PAGES[PAGES.indexOf(pageDef) + 1]
        if (nextPage && nextPage.role !== pageDef.role && nextPage.role !== 'none') {
          await page.close()
          page = await context.newPage()
          loggedIn[nextPage.role] = false // force re-login
        }

      } catch (err: any) {
        console.error(`    ⚠ Failed: ${err.message}`)
        report.push(`### ${pageDef.label}`, `_Failed: ${err.message}_`, '', '---', '')
        failed++
      }
    }

    await page.close()
    await context.close()
    await browser.close()
  }

  // Insert summary at top
  const summary = [
    '## Summary', '',
    '| Severity | Count |', '|----------|-------|',
    `| 🔴 Critical | ${findings.critical} |`,
    `| 🟡 Moderate | ${findings.moderate} |`,
    `| 🟢 Minor | ${findings.minor} |`,
    `| **Total** | **${findings.critical + findings.moderate + findings.minor}** |`,
    '', `Screenshots captured: ${captured}`,
    `Failed to capture: ${failed}`,
    '', '---', ''
  ]
  report.splice(4, 0, ...summary)

  fs.writeFileSync('./ux-audit-report.md', report.join('\n'))

  console.log('\n✅ UX Audit complete!')
  console.log(`📄 Report: ./ux-audit-report.md`)
  console.log(`🖼  Screenshots: ${outputDir}/ (${captured} captured, ${failed} failed)`)
  if (SKIP_ANALYSIS) {
    console.log('📸 Screenshots-only mode — no AI analysis')
    console.log('Run `npm run ux-audit` to get AI analysis')
  } else {
    console.log(`Findings: 🔴 ${findings.critical}  🟡 ${findings.moderate}  🟢 ${findings.minor}`)
  }
}

runAudit().catch(console.error)

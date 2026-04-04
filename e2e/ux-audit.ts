import { chromium, devices } from '@playwright/test'
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic()

const BASE_URL = process.env.BASE_URL || 'https://turnzy-frontend-dev.up.railway.app'
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://cleaningmanagement-dev.up.railway.app'

const HOST = {
  email: 'sgbaumwell+e2e-host@gmail.com',
  password: process.env.E2E_HOST_PASSWORD || 'TestPassword123!',
}
const CLEANER = {
  email: 'sgbaumwell+e2e-cleaner@gmail.com',
  password: process.env.E2E_CLEANER_PASSWORD || 'TestPassword123!',
}

const PAGES = [
  // HOST PAGES
  { label: 'Host Dashboard — desktop', url: '/', role: 'host',
    notes: 'Main operations view. Check section hierarchy, booking card clarity, button prominence.' },
  { label: 'Host Settings — Properties', url: '/settings/properties', role: 'host',
    notes: 'Property management. Check empty state and add-property flow entry point.' },
  { label: 'Host Settings — Cleaners', url: '/settings/cleaners', role: 'host',
    notes: 'Cleaner management. Check invite flow clarity.' },
  { label: 'Host Settings — Notifications', url: '/settings/notifications', role: 'host',
    notes: 'Notification toggles. Check labeling and clarity of each option.' },
  { label: 'Host Settings — Billing', url: '/settings/billing', role: 'host',
    notes: 'Billing page. Check if pricing is clear.' },
  { label: 'Host Settings — Account', url: '/settings/account', role: 'host',
    notes: 'Account/security settings. Check password section visibility.' },

  // CLEANER PAGES
  { label: 'Cleaner Dashboard', url: '/cleaner', role: 'cleaner',
    notes: 'Cleaner job list. Check section labels, job card clarity, action button prominence.' },
  { label: 'Cleaner Calendar', url: '/cleaner/calendar', role: 'cleaner',
    notes: 'Calendar view. Check month layout, event readability.' },
  { label: 'Cleaner Activity', url: '/cleaner/activity', role: 'cleaner',
    notes: 'Activity feed. Check if empty state is informative.' },
  { label: 'Cleaner Settings — My Team', url: '/cleaner/settings/team', role: 'cleaner',
    notes: 'Team management. Check toggle and roster clarity.' },
  { label: 'Cleaner Settings — Notifications', url: '/cleaner/settings/notifications', role: 'cleaner',
    notes: 'Notification preferences. Check slider and toggle labels.' },
  { label: 'Cleaner Settings — Account', url: '/cleaner/settings/account', role: 'cleaner',
    notes: 'Account settings. Check Google OAuth vs password handling.' },

  // AUTH PAGES
  { label: 'Login Page', url: '/login', role: 'none',
    notes: 'Login page. Check form clarity, Google OAuth prominence, signup link.' },
]

const VIEWPORTS = [
  { name: 'Desktop', device: null as string | null, width: 1440, height: 900 },
  { name: 'iPhone 14', device: 'iPhone 14', width: 390, height: 844 },
]

const UX_SYSTEM_PROMPT = `You are a senior UX designer and product strategist reviewing a mobile-first SaaS app called Turnzy. Turnzy helps Airbnb hosts coordinate cleaning turnovers with their cleaners. The target user is a self-managing host with 1-3 properties who already has a cleaner and wants simple, reliable coordination.

When reviewing a screenshot, provide specific, actionable feedback on:

1. CLARITY — Is the purpose of this screen immediately obvious?
2. HIERARCHY — Is the most important information visually prominent?
3. FRICTION — What requires more effort than it should?
4. MOBILE APPROPRIATENESS — Are tap targets large enough? Is text readable?
5. MISSING ELEMENTS — Empty states, error handling, loading states?
6. INCONSISTENCIES — Anything broken, misaligned, or unpolished?

Rate each finding as:
🔴 CRITICAL — blocks user success or creates significant confusion
🟡 MODERATE — degrades experience but user can work around it
🟢 MINOR — polish issue or nice-to-have improvement

End with a 1-sentence overall verdict for this screen.`

async function loginAs(page: any, role: string) {
  if (role === 'none') return
  const creds = role === 'host' ? HOST : CLEANER
  await page.goto(BASE_URL + '/login')
  await page.fill('#email', creds.email)
  await page.fill('#password', creds.password)
  await page.click('[type="submit"]')
  await page.waitForFunction(
    () => !window.location.pathname.includes('/login'),
    { timeout: 15000 }
  )
}

async function analyzeScreenshot(
  screenshotBuffer: Buffer, pageLabel: string, viewport: string, notes: string
): Promise<string> {
  const base64 = screenshotBuffer.toString('base64')
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: UX_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
        { type: 'text', text: `Review this screenshot of "${pageLabel}" on ${viewport}.\n\nContext: ${notes}\n\nProvide your UX findings.` },
      ],
    }],
  })
  return response.content.filter(b => b.type === 'text').map(b => (b as any).text).join('\n')
}

async function runAudit() {
  console.log('🔍 Starting Turnzy UX Audit...\n')

  const outputDir = './ux-audit-screenshots'
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const report: string[] = [
    '# Turnzy UX Audit Report',
    `Generated: ${new Date().toLocaleString()}`,
    `App: ${BASE_URL}`,
    '', '---', '',
  ]

  const findingCount = { critical: 0, moderate: 0, minor: 0 }

  for (const viewport of VIEWPORTS) {
    console.log(`\n📱 Testing ${viewport.name}...`)

    const browser = await chromium.launch()
    const context = viewport.device
      ? await browser.newContext({ ...devices[viewport.device] })
      : await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })

    report.push(`## ${viewport.name}`, '')

    let lastRole = ''

    for (const pageDef of PAGES) {
      if (viewport.name !== 'Desktop' && pageDef.label.includes('desktop')) continue

      console.log(`  → ${pageDef.label}`)
      const page = await context.newPage()

      try {
        // Login if role changed
        if (pageDef.role !== 'none' && pageDef.role !== lastRole) {
          await loginAs(page, pageDef.role)
          lastRole = pageDef.role
        }

        // Navigate
        await page.goto(BASE_URL + pageDef.url, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(2000)

        // Screenshot
        const filename = `${viewport.name}-${pageDef.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 85, fullPage: false })
        fs.writeFileSync(path.join(outputDir, filename), screenshotBuffer)

        // Analyze
        const analysis = await analyzeScreenshot(screenshotBuffer, pageDef.label, viewport.name, pageDef.notes)
        findingCount.critical += (analysis.match(/🔴/g) || []).length
        findingCount.moderate += (analysis.match(/🟡/g) || []).length
        findingCount.minor += (analysis.match(/🟢/g) || []).length

        report.push(`### ${pageDef.label}`, '', analysis, '', '---', '')
      } catch (err: any) {
        console.error(`    ⚠️ Failed: ${err.message}`)
        report.push(`### ${pageDef.label}`, `_Could not capture: ${err.message}_`, '')
      }

      await page.close()
    }

    await context.close()
    await browser.close()
  }

  // Insert summary after header
  const summary = [
    '## Summary', '',
    '| Severity | Count |', '|----------|-------|',
    `| 🔴 Critical | ${findingCount.critical} |`,
    `| 🟡 Moderate | ${findingCount.moderate} |`,
    `| 🟢 Minor | ${findingCount.minor} |`,
    `| **Total** | **${findingCount.critical + findingCount.moderate + findingCount.minor}** |`,
    '', '---', '',
  ]
  report.splice(4, 0, ...summary)

  const reportPath = './ux-audit-report.md'
  fs.writeFileSync(reportPath, report.join('\n'))

  console.log('\n✅ UX Audit complete!')
  console.log(`📄 Report: ${reportPath}`)
  console.log(`🖼️  Screenshots: ${outputDir}/`)
  console.log(`\nFindings: 🔴 ${findingCount.critical}  🟡 ${findingCount.moderate}  🟢 ${findingCount.minor}`)
}

runAudit().catch(console.error)

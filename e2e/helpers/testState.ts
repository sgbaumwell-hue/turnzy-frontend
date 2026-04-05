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

export async function takeScreenshot(page: any, name: string, device = 'desktop') {
  const fs = require('fs')
  const dir = `e2e/screenshots/${name.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  await page.screenshot({ path: `${dir}/${device}.jpg`, type: 'jpeg', quality: 80 })
}

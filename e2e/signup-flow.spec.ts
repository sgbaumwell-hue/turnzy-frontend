import { test, expect } from '@playwright/test';
import { freshEmail } from './helpers/auth';

test.describe('Signup flow', () => {
  test('direct host signup (/signup/host) completes to dashboard', async ({ page }) => {
    const email = freshEmail('signup-host');
    const name = 'E2E Signup Host';
    const password = 'TestPassword123!';

    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      consoleLogs.push(`[pageerror] ${err.message}\n${err.stack}`);
    });
    const requests: Array<{url: string; method: string; status: number; reqBody?: string; resBody?: string}> = [];
    page.on('request', (req) => {
      if (/\/api\/auth\//.test(req.url())) {
        requests.push({
          url: req.url(),
          method: req.method(),
          status: 0,
          reqBody: (req.postData() || '').slice(0, 500),
        });
      }
    });
    page.on('response', async (res) => {
      const url = res.url();
      if (/\/api\/auth\//.test(url)) {
        const status = res.status();
        let resBody: string | undefined;
        try { resBody = (await res.text()).slice(0, 500); } catch {}
        const matching = requests.find(r => r.url === url && r.status === 0);
        if (matching) { matching.status = status; matching.resBody = resBody; }
      }
    });

    await page.goto('/signup/host');
    await expect(page.locator('text=The basics.')).toBeVisible({ timeout: 10_000 });

    await page.locator('input[placeholder="Alex Morgan"]').fill(name);
    await page.locator('input[placeholder="you@example.com"]').fill(email);
    await page.locator('input[placeholder="you@example.com"]').press('Tab');
    await page.locator('input[placeholder="At least 8 characters"]').fill(password);
    await page.locator('input[type="checkbox"]').first().check();

    await page.getByRole('button', { name: /Continue/i }).click();

    // Wait for the POST to actually finish
    await page.waitForResponse(
      r => r.url().includes('/api/auth/complete') && r.request().method() === 'POST',
      { timeout: 15_000 }
    ).catch(() => {});

    // Give React a moment to re-render after setState + navigation
    await page.waitForTimeout(1000);

    const urlAfterSubmit = page.url();
    const successVisible = await page.locator('text=Welcome to').isVisible().catch(() => false);

    // Capture page text to see what actually rendered
    const bodyText = await page.locator('body').innerText().catch(() => '');

    // If success rendered, wait for the 2s auto-nav to the dashboard
    if (successVisible) {
      await page.waitForURL(/^(https?:\/\/[^/]+)?\/$/, { timeout: 10_000 }).catch(() => {});
    }

    const finalUrl = page.url();

    console.log('\n=== DIAGNOSTICS ===');
    console.log(`Email: ${email}`);
    console.log(`URL after submit (pre-wait): ${urlAfterSubmit}`);
    console.log(`URL after wait: ${finalUrl}`);
    console.log(`Success screen visible: ${successVisible}`);
    console.log('\n--- Page body text (first 800 chars) ---');
    console.log(bodyText.slice(0, 800));
    console.log('\n--- /api/auth/ requests ---');
    for (const r of requests) {
      console.log(`${r.method} ${r.status}  ${r.url}`);
      if (r.reqBody) console.log(`  req: ${r.reqBody}`);
      if (r.resBody) console.log(`  res: ${r.resBody}`);
    }
    console.log('\n--- Console logs (filtered) ---');
    for (const l of consoleLogs.filter(l => /error|warn|fail|pageerror/i.test(l)).slice(0, 20)) {
      console.log('  ', l);
    }

    const onDashboard = /^\/(?:$|dashboard|bookings|settings|activity|properties|cleaners)/.test(new URL(finalUrl).pathname);
    expect(onDashboard || successVisible,
      `FAILED. URL post-submit: ${urlAfterSubmit}, final: ${finalUrl}, success: ${successVisible}`
    ).toBeTruthy();
  });
});

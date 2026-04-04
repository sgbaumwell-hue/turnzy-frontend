export const ACCOUNTS = {
  host: {
    email: 'sgbaumwell+e2e-host@gmail.com',
    password: process.env.E2E_HOST_PASSWORD || 'TestPassword123!',
    name: 'E2E Host',
  },
  cleaner: {
    email: 'sgbaumwell+e2e-cleaner@gmail.com',
    password: process.env.E2E_CLEANER_PASSWORD || 'TestPassword123!',
    name: 'E2E Cleaner',
  },
  team: {
    email: 'sgbaumwell+e2e-team@gmail.com',
    password: process.env.E2E_TEAM_PASSWORD || 'TestPassword123!',
    name: 'E2E TeamMember',
  },
  admin: {
    email: 'sgbaumwell@gmail.com',
    password: process.env.ADMIN_PASSWORD || '',
    name: 'Seth Baumwell',
  },
};

export const freshEmail = (role: string) =>
  `sgbaumwell+e2e-${role}-${Date.now()}@gmail.com`;

export async function loginAs(page: any, account: any) {
  await page.goto('/login');
  await page.fill('[name="email"]', account.email);
  await page.fill('[name="password"]', account.password);
  await page.click('[type="submit"]');
  await page.waitForURL(/\/(dashboard|cleaner|team)/, { timeout: 15000 });
}

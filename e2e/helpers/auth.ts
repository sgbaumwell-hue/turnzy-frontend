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
  // Login form uses id= attributes, not name=
  await page.fill('#email', account.email);
  await page.fill('#password', account.password);
  await page.click('[type="submit"]');
  // Host goes to /, cleaner to /cleaner, team to /team
  // waitForURL tests against the full URL string, so use a function to check pathname
  await page.waitForURL(
    (url) => {
      const p = new URL(url).pathname;
      return p === '/' || p.startsWith('/cleaner') || p.startsWith('/team') || p.startsWith('/dashboard') || p.startsWith('/settings');
    },
    { timeout: 15000 }
  );
}

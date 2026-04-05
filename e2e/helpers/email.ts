const MAILPIT_URL = (process.env.MAILPIT_URL || '').trim().replace(/\/+$/, '') || 'http://localhost:8025';

export async function waitForEmail(to: string, subjectContains: string, timeoutMs = 15000) {
  const start = Date.now();
  let networkFailed = false;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${MAILPIT_URL}/api/v1/messages`);
      const raw = await res.json();
      const messages = Array.isArray(raw) ? raw : (raw.messages || raw.items || []);

      const match = messages.find((m: any) => {
        const toAddr = m.To?.[0]?.Address || m.to?.[0]?.Address || '';
        const subject = m.Subject || m.subject || '';
        return toAddr === to && subject.includes(subjectContains);
      });

      if (match) {
        const id = match.ID || match.id;
        const full = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`).then((r) => r.json());
        return full;
      }
    } catch (e: any) {
      if (!networkFailed) {
        console.warn(`[Mailpit] Fetch error (will retry): ${e.message}`);
        networkFailed = true;
      }
      // Don't return null — keep polling. Only bail after timeout.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (networkFailed) {
    console.warn('[Mailpit] Could not reach Mailpit after timeout');
  }
  return null;
}

export async function extractLink(email: any, contains: string) {
  if (!email) return null;
  const html = email.HTML || email.Text || email.html || email.text || '';
  const matches = html.match(/href="([^"]+)"/g) || [];
  return (
    matches.map((m: string) => m.replace('href="', '').replace('"', '')).find((l: string) => l.includes(contains)) || null
  );
}

export async function clearEmails() {
  try {
    await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' });
  } catch (e) {
    /* ignore */
  }
}

const MAILPIT_URL = (process.env.MAILPIT_URL || '').trim().replace(/\/+$/, '') || 'http://localhost:8025';

export async function waitForEmail(to: string, subjectContains: string, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${MAILPIT_URL}/api/v1/messages`);
      const data = await res.json();
      // Mailpit may return plain array or { messages: [...] }
      const messages = Array.isArray(data) ? data : (data.messages || []);
      const match = messages.find(
        (m: any) => (m.To?.[0]?.Address === to || m.to?.[0]?.Address === to) && (m.Subject?.includes(subjectContains) || m.subject?.includes(subjectContains))
      );
      if (match) {
        const full = await fetch(`${MAILPIT_URL}/api/v1/messages/${match.ID}`).then((r) => r.json());
        return full;
      }
    } catch (e) {
      console.warn('Mailpit not available, skipping email check');
      return null;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

export async function extractLink(email: any, contains: string) {
  if (!email) return null;
  const html = email.HTML || email.Text || '';
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

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

/**
 * /debug — throwaway diagnostic page. Lets Seth screenshot a single
 * screen that shows (a) who the current JWT authenticates as on the
 * backend, (b) which properties the backend thinks this cleaner is
 * bound to, and (c) what /api/cleaner/jobs returns. Used to debug the
 * "You're not connected yet" ghost state.
 *
 * No auth gate — safe because the backend only returns data about the
 * currently authenticated user.
 */
export function Debug() {
  const { user, isAuthenticated } = useAuthStore();
  const [whoami, setWhoami] = useState({ status: 'loading' });
  const [jobs, setJobs] = useState({ status: 'loading' });
  const [token] = useState(() => localStorage.getItem('turnzy_token') || null);

  useEffect(() => {
    client.get('/_whoami')
      .then(r => setWhoami({ status: 'ok', data: r.data }))
      .catch(e => setWhoami({ status: 'err', code: e.response?.status, data: e.response?.data, message: e.message }));

    client.get('/cleaner/jobs')
      .then(r => setJobs({ status: 'ok', data: r.data }))
      .catch(e => setJobs({ status: 'err', code: e.response?.status, data: e.response?.data, message: e.message }));
  }, []);

  return (
    <div className="min-h-screen p-6 font-inter" style={{ background: '#F9F8F6', color: '#1F1D1A' }}>
      <h1 className="text-[22px] font-bold mb-1">Turnzy debug</h1>
      <p className="text-[13px] mb-6" style={{ color: '#5F5B52' }}>
        Screenshot this page and send to Claude. No sensitive data shown — only the currently signed-in user.
      </p>

      <Section title="Frontend auth store">
        <Kv label="isAuthenticated" value={String(isAuthenticated)} />
        <Kv label="user.id" value={user?.id ?? '(none)'} />
        <Kv label="user.email" value={user?.email ?? '(none)'} />
        <Kv label="user.role" value={user?.role ?? '(none)'} />
        <Kv label="user.name" value={user?.name ?? '(none)'} />
        <Kv label="has token in localStorage" value={token ? `yes (len ${token.length})` : 'no'} />
      </Section>

      <Section title="GET /api/_whoami (backend view of this user)">
        <Pre obj={whoami} />
      </Section>

      <Section title="GET /api/cleaner/jobs (what the dashboard shows)">
        <Pre obj={jobs} />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5 rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E4DFD3' }}>
      <div className="text-[11px] font-bold uppercase mb-3" style={{ color: '#D85A30', letterSpacing: '0.14em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Kv({ label, value }) {
  return (
    <div className="flex gap-3 text-[13px] py-0.5">
      <span className="w-48 flex-shrink-0" style={{ color: '#5F5B52' }}>{label}</span>
      <span className="font-mono break-all" style={{ color: '#1F1D1A' }}>{String(value)}</span>
    </div>
  );
}

function Pre({ obj }) {
  return (
    <pre
      className="text-[12px] font-mono whitespace-pre-wrap break-all p-3 rounded-lg"
      style={{ background: '#F1EFE8', color: '#1F1D1A', maxHeight: 400, overflow: 'auto' }}
    >
      {JSON.stringify(obj, null, 2)}
    </pre>
  );
}

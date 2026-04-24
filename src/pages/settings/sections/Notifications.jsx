import { useState, useMemo } from 'react';
import { Mail, Bell, Phone, Plus, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/shadcn/switch';
import { settingsApi } from '../../../api/settings';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../components/Toast';

/* ──────────────────────────────────────────────────────────────
 * Config (spec §4 — alert groups, defaults, accent rows)
 * ────────────────────────────────────────────────────────────── */

const ALERT_GROUPS = [
  {
    id: 'turnover',
    title: 'Turnover confirmations',
    sub: "The daily loop of 'did my cleaner see this booking?'",
    alerts: [
      { id: 'unconfirmed',   label: 'Unconfirmed booking alert', sub: 'Fire when a cleaner hasn’t confirmed.',        defaults: { email: true, push: true, sms: false } },
      { id: 'reminder',      label: 'Reminder follow-up',        sub: 'Nudge if the confirmation stays unopened.',     defaults: { email: true, push: true, sms: false } },
      { id: 'cleaner_reply', label: 'Cleaner replied',           sub: 'Ping when a cleaner responds.',                 defaults: { email: false, push: true, sms: false } },
    ],
  },
  {
    id: 'late',
    title: 'Late start alerts',
    sub: "Alert me if cleaning hasn't started by this long after checkout. Pick one or stack multiple.",
    alerts: [
      { id: 'late_30',  label: '30 minutes after checkout', sub: 'Early heads-up.',      defaults: { email: false, push: false, sms: false } },
      { id: 'late_60',  label: '1 hour after checkout',     sub: 'The usual threshold.', defaults: { email: true, push: true, sms: false }, accent: true },
      { id: 'late_120', label: '2 hours after checkout',    sub: 'Escalate to texts.',   defaults: { email: true, push: false, sms: true } },
    ],
  },
  {
    id: 'completion',
    title: 'Job completion',
    sub: 'When the cleaner wraps — or flags something.',
    alerts: [
      { id: 'completed',      label: 'Cleaning completed', sub: 'Push when the job is marked done.', defaults: { email: false, push: true, sms: false } },
      { id: 'issue_reported', label: 'Issue reported',     sub: 'Cleaner flagged something on-site.', defaults: { email: true,  push: true, sms: true } },
    ],
  },
  {
    id: 'digests',
    title: 'Digests & billing',
    sub: 'Low-urgency summaries and receipts.',
    alerts: [
      { id: 'weekly',  label: 'Weekly summary',  sub: 'Recap of the week’s turnovers.', defaults: { email: true,  push: false, sms: false } },
      { id: 'payout',  label: 'Payout confirmed', sub: 'Receipt each time a payout lands.', defaults: { email: true, push: false, sms: false } },
    ],
  },
];

const CHANNELS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'push',  label: 'Push',  icon: Bell },
  { key: 'sms',   label: 'SMS',   icon: Phone },
];

function defaultPrefs() {
  const out = {};
  ALERT_GROUPS.forEach(g => g.alerts.forEach(a => { out[a.id] = { ...a.defaults }; }));
  return out;
}

/* ──────────────────────────────────────────────────────────────
 * Primitives
 * ────────────────────────────────────────────────────────────── */

function Eyebrow({ children }) {
  return (
    <div
      className="font-inter"
      style={{
        fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.14em', color: '#D85A30',
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-bg-surface overflow-hidden font-inter ${className}`}
      style={{
        border: '1px solid #E4DFD3',
        borderRadius: 14,
        boxShadow: '0 1px 2px rgba(44,44,42,0.04)',
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, sub }) {
  return (
    <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #EDEAE0' }}>
      <div
        className="font-serif"
        style={{ fontSize: 17, fontWeight: 700, color: '#1F1D1A', letterSpacing: -0.2 }}
      >
        {title}
      </div>
      {sub && (
        <div className="mt-0.5" style={{ fontSize: 12.5, color: '#5F5B52' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* Channel pill (Email / Push / SMS). Toggles optimistically. */
function ChannelPill({ channel, on, onToggle }) {
  const Icon = channel.icon;
  const palette = on
    ? { bg: '#FAECE7', border: '#F5C4B3', color: '#712B13' }
    : { bg: '#F1EFE8', border: '#E4DFD3', color: '#888780' };
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="inline-flex items-center gap-1 transition-colors"
      style={{
        padding: '5px 10px', borderRadius: 999,
        border: `1px solid ${palette.border}`,
        background: palette.bg, color: palette.color,
        fontSize: 11.5, fontWeight: 700,
      }}
    >
      <Icon size={11} strokeWidth={2.2} />
      {channel.label}
    </button>
  );
}

function AlertRow({ alert, prefs, onTogglePill, onToggleMaster, mode = 'pills', isLast }) {
  const anyOn = prefs.email || prefs.push || prefs.sms;
  return (
    <div
      className="flex items-start gap-4 px-5 py-3.5"
      style={{
        borderBottom: isLast ? 'none' : '1px solid #EDEAE0',
        background: alert.accent ? '#FEFCF6' : 'transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1F1D1A' }}>{alert.label}</div>
        {alert.sub && (
          <div className="mt-0.5" style={{ fontSize: 12, color: '#5F5B52' }}>
            {alert.sub}
          </div>
        )}
      </div>
      {mode === 'pills' ? (
        <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
          {CHANNELS.map(c => (
            <ChannelPill
              key={c.key}
              channel={c}
              on={prefs[c.key]}
              onToggle={() => onTogglePill(c.key)}
            />
          ))}
        </div>
      ) : (
        <Switch checked={anyOn} onCheckedChange={(v) => onToggleMaster(v)} />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────────────────────── */

export function Notifications() {
  const toast = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { user } = useAuthStore();
  const initial = useMemo(() => defaultPrefs(), []);
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => {
    for (const k of Object.keys(initial)) {
      const a = initial[k], b = prefs[k];
      if (a.email !== b.email || a.push !== b.push || a.sms !== b.sms) return true;
    }
    return false;
  }, [prefs, initial]);

  function togglePill(alertId, channel) {
    setPrefs(p => ({ ...p, [alertId]: { ...p[alertId], [channel]: !p[alertId][channel] } }));
  }

  function toggleMaster(alertId, on) {
    setPrefs(p => ({ ...p, [alertId]: { email: on, push: on, sms: on } }));
  }

  async function save() {
    setSaving(true);
    try {
      await settingsApi.saveNotificationPrefs(prefs);
      toast('Notification preferences saved');
    } catch {
      toast('Failed to save preferences', 'error');
    }
    setSaving(false);
  }

  function reset() {
    setPrefs(defaultPrefs());
    toast('Reset to defaults');
  }

  /* Channel legend strip (desktop only). */
  function ChannelLegend() {
    return (
      <div
        className="flex items-center flex-wrap gap-x-6 gap-y-2 bg-bg-surface font-inter"
        style={{
          padding: '10px 14px', border: '1px solid #E4DFD3',
          borderRadius: 10, boxShadow: '0 1px 2px rgba(44,44,42,0.04)',
        }}
      >
        <div className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
          <Mail size={13} strokeWidth={2} style={{ color: '#5F5B52' }} />
          <span style={{ color: '#888780' }}>Email →</span>
          <span style={{ color: '#1F1D1A', fontWeight: 600 }}>{user?.email || 'sgbaumwell@gmail.com'}</span>
        </div>
        <span style={{ color: '#B4AD9A' }}>·</span>
        <div className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
          <Bell size={13} strokeWidth={2} style={{ color: '#5F5B52' }} />
          <span style={{ color: '#888780' }}>Push →</span>
          <span style={{ color: '#1F1D1A', fontWeight: 600 }}>2 devices</span>
        </div>
        <span style={{ color: '#B4AD9A' }}>·</span>
        <div className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
          <Phone size={13} strokeWidth={2} style={{ color: '#5F5B52' }} />
          <span style={{ color: '#888780' }}>SMS →</span>
          <span style={{ color: '#1F1D1A', fontWeight: 600 }}>none set</span>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => toast('Channel setup coming soon')}
          className="inline-flex items-center gap-1 font-inter hover:underline"
          style={{ fontSize: 12.5, fontWeight: 600, color: '#D85A30' }}
        >
          <Plus size={12} strokeWidth={2.2} /> Add →
        </button>
      </div>
    );
  }

  /* ───── Desktop ───── */
  if (isDesktop) {
    return (
      <div className="mx-auto max-w-[860px] font-inter pb-20">
        {/* Hero */}
        <div
          className="mb-6"
          style={{
            background: 'linear-gradient(135deg, #FBF8F1 0%, #F5EFE4 100%)',
            border: '1px solid #E4DFD3', borderRadius: 16, padding: '28px 32px',
          }}
        >
          <Eyebrow>— Notifications</Eyebrow>
          <h1
            className="font-serif mt-1.5"
            style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, color: '#1F1D1A', lineHeight: 1.05 }}
          >
            When &amp; how you hear from us.
          </h1>
          <p className="mt-3" style={{ fontSize: 13.5, color: '#5F5B52', maxWidth: 640, lineHeight: 1.55 }}>
            Pick the channels that reach you fastest. <b>Email</b> for receipts and digests,
            <b> Push</b> for quick taps on the app, <b>SMS</b> for the stuff that can&rsquo;t wait.
          </p>
        </div>

        <div className="mb-6"><ChannelLegend /></div>

        <div className="space-y-6">
          {ALERT_GROUPS.map(g => (
            <Card key={g.id}>
              <CardHeader title={g.title} sub={g.sub} />
              {g.alerts.map((a, i) => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  prefs={prefs[a.id]}
                  onTogglePill={(ch) => togglePill(a.id, ch)}
                  mode="pills"
                  isLast={i === g.alerts.length - 1}
                />
              ))}
            </Card>
          ))}
        </div>

        {/* Footer action bar */}
        <div
          className="mt-8 flex items-center gap-3"
        >
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex items-center font-inter transition-colors disabled:opacity-60"
            style={{
              height: 38, padding: '0 18px', borderRadius: 10,
              background: '#D85A30', color: '#fff',
              fontSize: 13.5, fontWeight: 700,
            }}
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 font-inter transition-colors"
            style={{
              height: 38, padding: '0 14px', borderRadius: 10,
              background: 'transparent', color: '#5F5B52',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <RotateCcw size={12} strokeWidth={2.2} /> Reset to defaults
          </button>
          <div className="flex-1" />
          {dirty && (
            <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: '#888780' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: '#D85A30' }} />
              Unsaved changes
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ───── Mobile ───── */
  return (
    <div className="font-inter pb-20 bg-bg-page">
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(180deg, #FBF8F1 0%, #F5EFE4 100%)',
          borderBottom: '1px solid #E4DFD3',
          padding: '8px 20px 22px',
        }}
      >
        <Eyebrow>— Notifications</Eyebrow>
        <h1
          className="font-serif mt-1.5"
          style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.8, color: '#1F1D1A', lineHeight: 1.1 }}
        >
          When &amp; how.
        </h1>
        <p className="mt-2.5" style={{ fontSize: 13, color: '#5F5B52', lineHeight: 1.5 }}>
          Pick the channels that reach you. <b>Email</b> for receipts, <b>Push</b> for quick taps,
          <b> SMS</b> for the stuff that can&rsquo;t wait.
        </p>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {ALERT_GROUPS.map(g => (
          <Card key={g.id}>
            <CardHeader title={g.title} sub={g.sub} />
            {g.alerts.map((a, i) => (
              <AlertRow
                key={a.id}
                alert={a}
                prefs={prefs[a.id]}
                onToggleMaster={(v) => toggleMaster(a.id, v)}
                mode="master"
                isLast={i === g.alerts.length - 1}
              />
            ))}
          </Card>
        ))}

        {/* Footer info card */}
        <div
          style={{
            background: '#F1EFE8', borderRadius: 12, padding: 14,
            fontSize: 12.5, color: '#5F5B52', lineHeight: 1.5,
          }}
        >
          Want per-channel control? Open the desktop app — on mobile we&rsquo;ve rolled
          email + push + SMS into one master toggle per alert.
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex-1 inline-flex items-center justify-center font-inter transition-colors disabled:opacity-60"
            style={{
              height: 44, borderRadius: 10,
              background: '#D85A30', color: '#fff',
              fontSize: 14, fontWeight: 700,
            }}
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center font-inter"
            style={{
              height: 44, padding: '0 14px', borderRadius: 10,
              background: '#FFFFFF', border: '1px solid #E4DFD3',
              fontSize: 13, fontWeight: 600, color: '#5F5B52',
            }}
          >
            <RotateCcw size={14} strokeWidth={2.2} />
          </button>
        </div>
        {dirty && (
          <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: '#888780' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#D85A30' }} />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}

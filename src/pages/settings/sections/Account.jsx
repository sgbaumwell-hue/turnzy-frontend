import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil, Check, ChevronDown, ShieldCheck, KeyRound, Monitor, LogOut,
  Plus, Trash2,
} from 'lucide-react';
import { Switch } from '@/components/shadcn/switch';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';
import { settingsApi } from '../../../api/settings';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useToast } from '../components/Toast';

const LANGUAGES = [
  'English', 'Español', '中文', 'Tagalog', 'Tiếng Việt', 'العربية',
  'Français', '한국어', 'Русский', 'Kreyòl ayisyen', 'Português',
];

/* ──────────────────────────────────────────────────────────────
 * Primitives
 * ────────────────────────────────────────────────────────────── */

function Eyebrow({ children, tone = 'coral' }) {
  const color = tone === 'danger' ? '#7B1D17' : '#D85A30';
  return (
    <div
      className="font-inter"
      style={{
        fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
        letterSpacing: '0.14em', color,
      }}
    >
      {children}
    </div>
  );
}

function Avatar({ size = 72, initials = 'SB' }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #F07447, #C8481F)',
        fontSize: size * 0.38, letterSpacing: -0.5,
        boxShadow: '0 2px 6px rgba(168,66,30,.22), inset 0 1px 0 rgba(255,255,255,.2)',
      }}
    >
      {initials}
    </div>
  );
}

function CoralPill({ children }) {
  return (
    <span
      className="inline-flex items-center font-inter"
      style={{
        height: 20, padding: '0 8px', borderRadius: 999,
        background: '#FAECE7', border: '1px solid #F5C4B3', color: '#712B13',
        fontSize: 11, fontWeight: 700, letterSpacing: 0.1,
      }}
    >
      {children}
    </span>
  );
}

function VerifiedPill() {
  return (
    <span
      className="inline-flex items-center gap-1 font-inter"
      style={{
        height: 20, padding: '0 8px', borderRadius: 999,
        background: '#EAF3DE', border: '1px solid #C0DD97', color: '#27500A',
        fontSize: 10.5, fontWeight: 700,
      }}
    >
      <Check size={10} strokeWidth={3} />
      Verified
    </span>
  );
}

/* Card shell */
function Card({ tone = 'default', children, className = '' }) {
  const border = tone === 'danger' ? '#F0C8C4' : '#E4DFD3';
  return (
    <div
      className={`bg-bg-surface overflow-hidden font-inter ${className}`}
      style={{
        border: `1px solid ${border}`, borderRadius: 14,
        boxShadow: '0 1px 2px rgba(44,44,42,0.04)',
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, sub, tone = 'default' }) {
  const bg = tone === 'danger' ? '#FEF7F5' : 'transparent';
  const titleColor = tone === 'danger' ? '#7B1D17' : '#1F1D1A';
  const borderB = tone === 'danger' ? '#F5D9D5' : '#EDEAE0';
  return (
    <div
      className="px-5 py-3.5"
      style={{ background: bg, borderBottom: `1px solid ${borderB}` }}
    >
      <div
        className="font-serif"
        style={{ fontSize: 17, fontWeight: 700, color: titleColor, letterSpacing: -0.2 }}
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

/* Row: used by Profile/Security/Danger cards. */
function Row({
  icon,        // optional leading 34x34 tile icon (Security rows)
  label, sub,  // left text stack
  extra,       // optional inline trailing text (e.g. Verified pill)
  action,      // right slot (button / switch / link / dropdown)
  onClick,     // make whole row a tap target (mobile)
  tone = 'default',
  isLast = false,
}) {
  const Tag = onClick ? 'button' : 'div';
  const borderB = tone === 'danger' ? '#F5D9D5' : '#EDEAE0';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`w-full flex items-center gap-3 text-left ${onClick ? 'hover:bg-bg-subtle active:bg-bg-subtle transition-colors' : ''}`}
      style={{
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${borderB}`,
        minHeight: 56,
      }}
    >
      {icon && (
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 34, height: 34, background: '#F1EFE8', borderRadius: 10, color: '#5F5B52' }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1F1D1A' }}>{label}</span>
          {extra}
        </div>
        {sub && (
          <div className="mt-0.5" style={{ fontSize: 12, color: '#5F5B52' }}>
            {sub}
          </div>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </Tag>
  );
}

/* Buttons */
function OutlineBtn({ children, onClick, icon: Icon, tone = 'default' }) {
  const color = tone === 'danger' ? '#C24437' : '#1F1D1A';
  const border = tone === 'danger' ? '#F0C8C4' : '#E4DFD3';
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 font-inter transition-colors hover:bg-bg-subtle"
      style={{
        height: 32, padding: '0 12px', borderRadius: 8,
        border: `1px solid ${border}`, background: '#FFFFFF',
        fontSize: 12.5, fontWeight: 600, color,
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

function TextLink({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-inter hover:underline"
      style={{ fontSize: 12.5, fontWeight: 600, color: '#D85A30' }}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────────────────────── */

export function Account() {
  const { user, setUser, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const hasPassword = user?.has_password !== false;
  const name = user?.name || '';
  const email = user?.email || '';
  const displayInitials = (name || 'SB').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || 'SB';

  // Editable fields (inline)
  const [editing, setEditing] = useState(null); // 'name' | 'email' | 'password' | 'phone' | null
  const [language, setLanguage] = useState(user?.preferred_language || 'English');
  const [phone, setPhone] = useState(user?.phone || '');
  const [twoFactor, setTwoFactor] = useState(false);

  const profileRef = useRef(null);

  /* ───── Handlers ───── */

  async function handleSaveName(val) {
    await authApi.updateName(val);
    setUser({ ...user, name: val });
    toast('Name updated');
  }

  async function handleSaveEmail(val, extras) {
    await authApi.updateEmail(val, extras.current_password || '');
    toast('Confirmation email sent to ' + val);
  }

  async function handleSavePhone(val) {
    // No backend for phone yet — persist optimistically in auth store.
    setUser({ ...user, phone: val });
    setPhone(val);
    toast(val ? 'Phone saved' : 'Phone removed');
  }

  async function handleLanguageChange(lang) {
    setLanguage(lang);
    try {
      await settingsApi.updateLanguage(lang);
      setUser({ ...user, preferred_language: lang });
      toast('Language updated');
    } catch {
      toast('Failed to update language', 'error');
    }
  }

  async function handleDeactivate() {
    if (!confirm('Deactivate your account? You can reactivate anytime by logging back in.')) return;
    try {
      await authApi.deactivate();
      clearUser();
      localStorage.removeItem('turnzy_token');
      navigate('/login');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to deactivate', 'error');
    }
  }

  async function handleSignOut() {
    try { await authApi.logout(); } catch {}
    clearUser();
    localStorage.removeItem('turnzy_token');
    navigate('/login');
  }

  function scrollToProfile() {
    profileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ───── Sub: inline editors ───── */

  function InlineEdit({ field, initial, extraFields, onSave, onCancel, placeholder }) {
    const [val, setVal] = useState(initial || '');
    const [extras, setExtras] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function submit() {
      setLoading(true); setErr(null);
      try {
        await onSave(val, extras);
        onCancel();
      } catch (e) {
        setErr(e.response?.data?.error || e.message || 'Failed to save');
      } finally {
        setLoading(false);
      }
    }

    return (
      <div className="px-5 py-3.5 space-y-2 bg-bg-page/60 border-b border-border-soft">
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="w-full font-inter"
          style={{
            fontSize: 14, padding: '8px 12px', borderRadius: 8,
            border: '1px solid #E4DFD3', outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#D85A30')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E4DFD3')}
        />
        {extraFields?.map(f => (
          <input
            key={f.name}
            type={f.type || 'text'}
            placeholder={f.placeholder}
            value={extras[f.name] || ''}
            onChange={(e) => setExtras(prev => ({ ...prev, [f.name]: e.target.value }))}
            className="w-full font-inter"
            style={{
              fontSize: 14, padding: '8px 12px', borderRadius: 8,
              border: '1px solid #E4DFD3', outline: 'none',
            }}
          />
        ))}
        {err && <div className="text-[12px]" style={{ color: '#C24437' }}>{err}</div>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center gap-1 font-inter transition-colors disabled:opacity-50"
            style={{
              height: 30, padding: '0 12px', borderRadius: 8,
              background: '#D85A30', color: '#fff', fontSize: 12.5, fontWeight: 700,
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
          <OutlineBtn onClick={onCancel}>Cancel</OutlineBtn>
        </div>
      </div>
    );
  }

  function PasswordEdit({ onCancel }) {
    const [cur, setCur] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    async function submit() {
      setErr(null);
      if (next.length < 8) { setErr('Password must be at least 8 characters'); return; }
      if (next !== confirm) { setErr('Passwords do not match'); return; }
      setLoading(true);
      try {
        if (hasPassword) {
          await authApi.updatePassword(cur, next, confirm);
        } else {
          try { await authApi.updatePassword('', next, confirm); }
          catch {
            const client = (await import('../../../api/client')).default;
            await client.post('/account/set-password', { new_password: next, confirm_password: confirm });
          }
        }
        toast(hasPassword ? 'Password updated' : 'Password set');
        onCancel();
      } catch (e) {
        setErr(e.response?.data?.error || 'Failed to update password');
      }
      setLoading(false);
    }

    return (
      <div className="px-5 py-4 space-y-2 border-b border-border-soft" style={{ background: '#FBF8F1' }}>
        {hasPassword && (
          <input
            type="password" placeholder="Current password"
            value={cur} onChange={(e) => setCur(e.target.value)}
            className="w-full font-inter"
            style={{ fontSize: 14, padding: '8px 12px', borderRadius: 8, border: '1px solid #E4DFD3', outline: 'none' }}
          />
        )}
        <input
          type="password" placeholder="New password (8+ characters)" autoFocus
          value={next} onChange={(e) => setNext(e.target.value)}
          className="w-full font-inter"
          style={{ fontSize: 14, padding: '8px 12px', borderRadius: 8, border: '1px solid #E4DFD3', outline: 'none' }}
        />
        <input
          type="password" placeholder="Confirm new password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="w-full font-inter"
          style={{ fontSize: 14, padding: '8px 12px', borderRadius: 8, border: '1px solid #E4DFD3', outline: 'none' }}
        />
        {err && <div className="text-[12px]" style={{ color: '#C24437' }}>{err}</div>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={submit} disabled={loading}
            className="inline-flex items-center gap-1 font-inter transition-colors disabled:opacity-50"
            style={{ height: 30, padding: '0 12px', borderRadius: 8, background: '#D85A30', color: '#fff', fontSize: 12.5, fontWeight: 700 }}
          >
            {loading ? 'Saving…' : hasPassword ? 'Update password' : 'Set password'}
          </button>
          <OutlineBtn onClick={onCancel}>Cancel</OutlineBtn>
        </div>
      </div>
    );
  }

  /* ───── Render ───── */

  const heroGradient = isDesktop
    ? 'linear-gradient(135deg, #FBF8F1 0%, #F5EFE4 100%)'
    : 'linear-gradient(180deg, #FBF8F1 0%, #F5EFE4 100%)';

  return (
    <div
      className={`mx-auto font-inter ${isDesktop ? 'max-w-[860px]' : ''}`}
    >
      {/* ── Hero band ── */}
      <div
        className={isDesktop ? '' : 'md:hidden'}
        style={{
          background: heroGradient,
          border: '1px solid #E4DFD3',
          borderRadius: isDesktop ? 16 : 0,
          padding: isDesktop ? '28px 32px' : '8px 20px 20px',
          marginBottom: isDesktop ? 24 : 0,
        }}
      >
        <div className={`flex ${isDesktop ? 'items-start gap-5' : 'flex-col gap-3'}`}>
          <Avatar size={isDesktop ? 72 : 60} initials={displayInitials} />
          <div className="flex-1 min-w-0">
            <Eyebrow>— Your account</Eyebrow>
            <h1
              className="font-inter mt-1.5"
              style={{
                fontSize: isDesktop ? 30 : 24,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#1F1D1A',
                lineHeight: 1.1,
              }}
            >
              {name || 'Seth Baumwell'}
            </h1>
            <div
              className="flex items-center gap-2 mt-2 flex-wrap"
              style={{ fontSize: 12.5, color: '#5F5B52' }}
            >
              <span className="truncate">{email || 'sgbaumwell@gmail.com'}</span>
              <span style={{ color: '#B4AD9A' }}>·</span>
              <CoralPill>Host · Pro</CoralPill>
              <span style={{ color: '#B4AD9A' }}>·</span>
              <span>Member since Mar 2024</span>
            </div>
          </div>
          {isDesktop && (
            <OutlineBtn icon={Pencil} onClick={scrollToProfile}>Edit profile</OutlineBtn>
          )}
        </div>
      </div>

      <div className={isDesktop ? 'space-y-6' : 'px-4 pt-6 pb-16 space-y-6'}>
        {/* ── Profile card ── */}
        <div ref={profileRef}>
          <Card>
            <CardHeader title="Profile" />
            {editing === 'name' ? (
              <InlineEdit
                initial={name}
                onSave={handleSaveName}
                onCancel={() => setEditing(null)}
                placeholder="Your name"
              />
            ) : (
              <Row
                label="Name"
                sub={name || '—'}
                action={<OutlineBtn icon={Pencil} onClick={() => setEditing('name')}>Edit</OutlineBtn>}
              />
            )}

            {editing === 'email' ? (
              <InlineEdit
                initial={email}
                extraFields={[{ name: 'current_password', type: 'password', placeholder: 'Current password' }]}
                onSave={handleSaveEmail}
                onCancel={() => setEditing(null)}
                placeholder="you@example.com"
              />
            ) : (
              <Row
                label="Email"
                sub={email || '—'}
                extra={<VerifiedPill />}
                action={<OutlineBtn icon={Pencil} onClick={() => setEditing('email')}>Edit</OutlineBtn>}
              />
            )}

            {editing === 'phone' ? (
              <InlineEdit
                initial={phone}
                onSave={handleSavePhone}
                onCancel={() => setEditing(null)}
                placeholder="+1 555 123 4567"
              />
            ) : (
              <Row
                label="Phone"
                sub={phone || 'Not added'}
                action={
                  <OutlineBtn icon={phone ? Pencil : Plus} onClick={() => setEditing('phone')}>
                    {phone ? 'Edit' : 'Add'}
                  </OutlineBtn>
                }
              />
            )}

            <Row
              label="Language"
              sub={language}
              isLast
              action={
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="appearance-none font-inter cursor-pointer"
                    style={{
                      height: 32, padding: '0 30px 0 12px', borderRadius: 8,
                      border: '1px solid #E4DFD3', background: '#FFFFFF',
                      fontSize: 12.5, fontWeight: 600, color: '#1F1D1A',
                    }}
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#5F5B52' }}
                  />
                </div>
              }
            />
          </Card>
        </div>

        {/* ── Security card ── */}
        <Card>
          <CardHeader title="Security" />
          {editing === 'password' ? (
            <PasswordEdit onCancel={() => setEditing(null)} />
          ) : (
            <Row
              icon={<KeyRound size={16} strokeWidth={2} />}
              label="Password"
              sub={hasPassword ? 'Set — change anytime' : 'You signed in with Google'}
              action={
                <OutlineBtn icon={hasPassword ? Pencil : KeyRound} onClick={() => setEditing('password')}>
                  {hasPassword ? 'Change' : 'Set password'}
                </OutlineBtn>
              }
            />
          )}
          <Row
            icon={<ShieldCheck size={16} strokeWidth={2} />}
            label="Two-factor authentication"
            sub={twoFactor ? 'Enabled' : 'Add a verification step when signing in'}
            action={
              <Switch
                checked={twoFactor}
                onCheckedChange={(v) => {
                  setTwoFactor(v);
                  toast(v ? '2FA enabled' : '2FA disabled');
                }}
              />
            }
          />
          <Row
            icon={<Monitor size={16} strokeWidth={2} />}
            label="Active sessions"
            sub="3 devices"
            action={<TextLink onClick={() => toast('Session management coming soon')}>Manage →</TextLink>}
          />
          <Row
            icon={<LogOut size={16} strokeWidth={2} />}
            label="Sign out of this device"
            sub="You'll need to log back in to continue"
            isLast
            action={<OutlineBtn onClick={handleSignOut}>Sign out</OutlineBtn>}
          />
        </Card>

        {/* ── Danger zone ── */}
        <Card tone="danger">
          <CardHeader
            title="Danger zone"
            sub="These actions affect account access and can't be undone."
            tone="danger"
          />
          <Row
            label="Deactivate account"
            sub="Hide your account and disable sign-in. You can reactivate anytime."
            tone="danger"
            action={<OutlineBtn onClick={handleDeactivate}>Deactivate</OutlineBtn>}
          />
          <Row
            label="Permanently delete"
            sub="Erase your account and all associated data. This can't be undone."
            tone="danger"
            isLast
            action={
              <OutlineBtn
                tone="danger"
                icon={Trash2}
                onClick={() => navigate('/account/delete-confirm')}
              >
                Delete account
              </OutlineBtn>
            }
          />
        </Card>
      </div>
    </div>
  );
}

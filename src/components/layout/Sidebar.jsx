import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Activity, ExternalLink, Building2, Users, CreditCard, Bell, User,
  Settings, CalendarDays, AlertTriangle, Clock, ShieldCheck, Archive,
  MoreVertical, LogOut,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

/* ── Brand mark ── */
function LogoMark({ size = 30 }) {
  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size, borderRadius: 8,
        background: 'linear-gradient(140deg,#F07447 0%,#E85F34 45%,#C8481F 100%)',
        boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.3), 0 2px 6px rgba(168,66,30,.22)',
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
        <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="16" r="2.2" fill="white" />
      </svg>
    </div>
  );
}

/* ── Group eyebrow ── */
function Eyebrow({ children }) {
  return (
    <div className="px-3 pt-2.5 pb-1.5 text-[10.5px] font-extrabold uppercase text-text-subtle tracking-[0.14em] font-inter">
      {children}
    </div>
  );
}

/* ── Pill (sidebar count) ── */
function CountPill({ count, tone = 'neutral' }) {
  if (count == null) return null;
  const tones = {
    neutral: 'bg-bg-subtle text-text-muted',
    warn:    'bg-amber-50 text-amber-800',
    danger:  'bg-danger-50 text-danger-800',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center h-[18px] min-w-[22px] px-2 rounded-full',
        'text-[10.5px] font-bold tracking-[0.04em] uppercase',
        tones[tone],
      )}
    >
      {count}
    </span>
  );
}

/* ── Nav item ── */
function Item({ to, end, icon: Icon, label, pill, pillTone, external, onClick }) {
  const className = ({ isActive }) => clsx(
    'group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg',
    'text-[13px] font-inter transition-colors duration-100',
    isActive
      ? 'bg-ink text-white font-bold'
      : 'text-text-base font-medium hover:bg-bg-subtle',
  );

  const renderInner = (isActive) => (
    <>
      <Icon
        size={15}
        strokeWidth={isActive ? 2.4 : 2}
        className={clsx(isActive ? 'text-coral-brand' : 'text-text-muted')}
      />
      <span className="flex-1 text-left leading-none">{label}</span>
      {pill != null && <CountPill count={pill} tone={pillTone} />}
    </>
  );

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium font-inter text-text-base hover:bg-bg-subtle transition-colors duration-100"
      >
        <Icon size={15} strokeWidth={2} className="text-text-muted" />
        <span className="flex-1 text-left leading-none">{label}</span>
      </a>
    );
  }

  return (
    <NavLink to={to} end={end} onClick={onClick} className={className}>
      {({ isActive }) => renderInner(isActive)}
    </NavLink>
  );
}

/* ── Host nav groups ── */
function HostNav({ isAdmin, counts }) {
  return (
    <>
      <Eyebrow>Bookings</Eyebrow>
      <Item to="/" end                  icon={Home}          label="Dashboard" />
      <Item to="/bookings/urgent"       icon={AlertTriangle} label="Urgent"       pill={counts?.urgent}      pillTone="danger" />
      <Item to="/bookings/needs-action" icon={Clock}         label="Needs action" pill={counts?.needsAction} pillTone="warn" />
      <Item to="/bookings/confirmed"    icon={ShieldCheck}   label="Confirmed"    pill={counts?.confirmed}   pillTone="neutral" />
      <Item to="/bookings/queued"       icon={CalendarDays}  label="Queued"       pill={counts?.queued}      pillTone="neutral" />
      <Item to="/bookings/past"         icon={Archive}       label="Past" />

      <div style={{ height: 10 }} />
      {isAdmin && <Item to="/admin"      external icon={ExternalLink} label="Admin" />}
      <Item to="/properties"             icon={Building2}   label="Properties" />
      <Item to="/cleaners"               icon={Users}       label="Cleaners" />
      <Item to="/settings/notifications" icon={Bell}        label="Notifications" />
      <Item to="/settings/billing"       icon={CreditCard}  label="Billing" />
      <Item to="/settings/account"       icon={User}        label="Account" />
    </>
  );
}

function CleanerNav() {
  return (
    <>
      <Eyebrow>Views</Eyebrow>
      <Item to="/cleaner" end icon={Home} label="Dashboard" />
      <Item to="/cleaner/calendar" icon={CalendarDays} label="Calendar" />
      <Item to="/cleaner/activity" icon={Activity} label="Activity" />

      <div style={{ height: 10 }} />
      <Item to="/cleaner/settings/team" icon={Users} label="My team" />
      <Item to="/cleaner/settings/notifications" icon={Bell} label="Notifications" />
      <Item to="/cleaner/settings/account" icon={User} label="Account" />
    </>
  );
}

function TeamNav() {
  return (
    <>
      <Eyebrow>Views</Eyebrow>
      <Item to="/team" end icon={Home} label="My jobs" />
      <Item to="/team/settings" icon={Settings} label="Settings" />
    </>
  );
}

/* ── Avatar (user footer) ── */
function UserAvatar({ name, size = 30 }) {
  const initials = (name || '?').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  return (
    <div
      className="inline-flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #F07447, #C8481F)',
        fontSize: size * 0.38,
        boxShadow: '0 1px 2px rgba(0,0,0,.08)',
      }}
    >
      {initials}
    </div>
  );
}

/* ── Sidebar ── */
export function Sidebar({ counts = {} }) {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.is_admin;
  const isCleaner = user?.role === 'cleaner';
  const isTeamMember = user?.role === 'team_member';
  const roleLabel = isTeamMember ? 'Team member' : isCleaner ? 'Cleaner' : 'Host · Pro plan';

  const accountHref = isCleaner
    ? '/cleaner/settings/account'
    : isTeamMember
      ? '/team/settings'
      : '/settings/account';

  async function handleSignOut() {
    try { await authApi.logout(); } catch { /* ignore — local state is the source of truth */ }
    clearUser();
    localStorage.removeItem('turnzy_token');
    navigate('/login');
  }

  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col h-full bg-bg-surface font-inter"
      style={{ borderRight: '1px solid #EDEAE0', padding: '18px 12px 12px' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1 pb-4">
        <LogoMark size={30} />
        <span
          className="font-black text-[18px] leading-none tracking-[-0.03em] text-ink"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Turn
          <span
            style={{
              background: 'linear-gradient(140deg,#F07447,#C8481F)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            zy
          </span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto space-y-0.5">
        {isTeamMember ? <TeamNav /> : isCleaner ? <CleanerNav /> : (
          <HostNav isAdmin={isAdmin} counts={counts} />
        )}
      </nav>

      {/* User footer */}
      <div className="mt-1 pt-3 flex items-center gap-2.5 px-2 pb-0.5" style={{ borderTop: '1px solid #EDEAE0' }}>
        <UserAvatar name={user?.name} size={30} />
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-bold text-ink truncate leading-tight">{user?.name}</div>
          <div className="text-[11px] text-text-subtle leading-tight">{roleLabel}</div>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              aria-label="Account menu"
              className="p-1 rounded text-text-subtle hover:text-ink hover:bg-bg-subtle transition-colors data-[state=open]:text-ink data-[state=open]:bg-bg-subtle"
            >
              <MoreVertical size={14} strokeWidth={2.6} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="top"
              align="end"
              sideOffset={6}
              className="min-w-[180px] bg-bg-surface border border-border-base rounded-lg shadow-lg py-1 font-inter z-50"
              style={{ boxShadow: '0 10px 28px rgba(0,0,0,.10)' }}
            >
              <DropdownMenu.Item
                onSelect={() => navigate(accountHref)}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-base cursor-pointer outline-none data-[highlighted]:bg-bg-subtle"
              >
                <User size={14} strokeWidth={2} className="text-text-muted" />
                Account
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border-soft" />
              <DropdownMenu.Item
                onSelect={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-base cursor-pointer outline-none data-[highlighted]:bg-bg-subtle"
              >
                <LogOut size={14} strokeWidth={2} className="text-text-muted" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Activity, ExternalLink, Building2, Users, CreditCard, Bell, User, Settings, CalendarDays, LogOut, AlertTriangle, Clock, CheckCircle, Archive, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

/* ── Logo mark ── */
function LogoMark({ size = 30 }) {
  return (
    <div className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.28, background: 'linear-gradient(140deg,#F07447 0%,#E85F34 45%,#C8481F 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.3),inset 0 -1.5px 0 rgba(0,0,0,.1),0 4px 10px rgba(168,66,30,.22),0 1px 2px rgba(168,66,30,.15)' }}>
      <div className="absolute pointer-events-none" style={{ inset: 2, borderRadius: size * 0.28 - 2, background: 'linear-gradient(180deg,rgba(255,255,255,.22),transparent 50%)' }} />
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 32 32" fill="none" className="relative z-10">
        <path d="M16 3.5L26.5 9.5V21.5L16 28L5.5 21.5V9.5L16 3.5Z" stroke="white" strokeOpacity="0.38" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="16" r="2.2" fill="white"/>
      </svg>
    </div>
  );
}

/* ── Nav item classes ── */
const navLinkClass = ({ isActive }) => clsx(
  'flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13.5px] font-medium transition-all duration-150 w-full',
  isActive
    ? 'bg-[#1F1D1A] text-white'
    : 'text-[#5F5B52] hover:bg-[#EDE7D7] hover:text-[#1F1D1A]'
);

const subNavClass = ({ isActive }) => clsx(
  'flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] text-[13.5px] font-medium transition-all duration-150 w-full',
  isActive
    ? 'bg-[#1F1D1A] text-white'
    : 'text-[#5F5B52] hover:bg-[#EDE7D7] hover:text-[#1F1D1A]'
);

/* icon color helper */
const iconCls = (isActive) => isActive ? 'text-[#E85F34]' : 'text-[#9C9481]';

/* ── Eyebrow label ── */
function SectionLabel({ children }) {
  return <div className="text-[10.5px] font-bold text-[#9C9481] uppercase tracking-[0.14em] px-3 pt-5 pb-1.5">{children}</div>;
}

/* ── Count badge ── */
function CountBadge({ count, tone }) {
  if (count == null) return null;
  const style = tone === 'urgent'
    ? 'bg-[#B33A32] text-white'
    : tone === 'pending'
      ? 'bg-transparent text-[#B07510] ring-[1.5px] ring-inset ring-[#B07510]'
      : 'bg-transparent text-[#9C9481] ring-1 ring-inset ring-[#E4DFD3]';
  return (
    <span className={clsx('text-[11px] font-bold px-1.5 h-5 min-w-[20px] inline-flex items-center justify-center rounded-full', style)}>
      {count}
    </span>
  );
}

/* ── Host nav ── */
function HostNav({ isAdmin, urgentCount, needsActionCount, confirmedCount, queuedCount }) {
  return (
    <>
      <SectionLabel>Views</SectionLabel>
      <NavLink to="/" end className={navLinkClass}>
        {({ isActive }) => <><Home size={15} className={iconCls(isActive)} />Dashboard</>}
      </NavLink>
      <NavLink to="/activity" className={navLinkClass}>
        {({ isActive }) => <><Activity size={15} className={iconCls(isActive)} />Activity</>}
      </NavLink>
      {isAdmin && (
        <a href="/admin" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13.5px] font-medium text-[#5F5B52] hover:bg-[#EDE7D7] hover:text-[#1F1D1A] transition-all duration-150 w-full">
          <ExternalLink size={15} className="text-[#9C9481]" />Admin
        </a>
      )}

      <SectionLabel>Bookings</SectionLabel>
      <NavLink to="/bookings/urgent" className={subNavClass}>
        {({ isActive }) => <>
          <AlertTriangle size={14} className={iconCls(isActive)} />
          <span className="flex-1">Urgent</span>
          {urgentCount > 0 && <CountBadge count={urgentCount} tone="urgent" />}
        </>}
      </NavLink>
      <NavLink to="/bookings/needs-action" className={subNavClass}>
        {({ isActive }) => <>
          <Clock size={14} className={iconCls(isActive)} />
          <span className="flex-1">Needs action</span>
          {needsActionCount > 0 && <CountBadge count={needsActionCount} tone="pending" />}
        </>}
      </NavLink>
      <NavLink to="/bookings/confirmed" className={subNavClass}>
        {({ isActive }) => <>
          <CheckCircle size={14} className={iconCls(isActive)} />
          <span className="flex-1">Confirmed</span>
          {confirmedCount > 0 && <CountBadge count={confirmedCount} />}
        </>}
      </NavLink>
      <NavLink to="/bookings/queued" className={subNavClass}>
        {({ isActive }) => <>
          <CalendarDays size={14} className={iconCls(isActive)} />
          <span className="flex-1">Queued</span>
          {queuedCount > 0 && <CountBadge count={queuedCount} />}
        </>}
      </NavLink>
      <NavLink to="/bookings/past" className={subNavClass}>
        {({ isActive }) => <><Archive size={14} className={iconCls(isActive)} />Past</>}
      </NavLink>

      <SectionLabel>Workspace</SectionLabel>
      {[
        { to: '/settings/properties', icon: Building2, label: 'Properties' },
        { to: '/settings/cleaners', icon: Users, label: 'Cleaners' },
        { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
        { to: '/settings/billing', icon: CreditCard, label: 'Billing' },
        { to: '/settings/account', icon: User, label: 'Account' },
      ].map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={subNavClass}>
          {({ isActive }) => <><Icon size={14} className={iconCls(isActive)} />{label}</>}
        </NavLink>
      ))}
    </>
  );
}

/* ── Cleaner nav ── */
function CleanerNav() {
  return (
    <>
      <SectionLabel>Views</SectionLabel>
      <NavLink to="/cleaner" end className={navLinkClass}>
        {({ isActive }) => <><Home size={15} className={iconCls(isActive)} />Dashboard</>}
      </NavLink>
      <NavLink to="/cleaner/calendar" className={navLinkClass}>
        {({ isActive }) => <><CalendarDays size={15} className={iconCls(isActive)} />Calendar</>}
      </NavLink>
      <NavLink to="/cleaner/activity" className={navLinkClass}>
        {({ isActive }) => <><Activity size={15} className={iconCls(isActive)} />Activity</>}
      </NavLink>
      <SectionLabel>Workspace</SectionLabel>
      {[
        { to: '/cleaner/settings/team', icon: Users, label: 'My Team' },
        { to: '/cleaner/settings/notifications', icon: Bell, label: 'Notifications' },
        { to: '/cleaner/settings/account', icon: User, label: 'Account' },
      ].map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={subNavClass}>
          {({ isActive }) => <><Icon size={14} className={iconCls(isActive)} />{label}</>}
        </NavLink>
      ))}
    </>
  );
}

/* ── Team member nav ── */
function TeamMemberNav() {
  return (
    <>
      <SectionLabel>Views</SectionLabel>
      <NavLink to="/team" end className={navLinkClass}>
        {({ isActive }) => <><Home size={15} className={iconCls(isActive)} />My Jobs</>}
      </NavLink>
      <NavLink to="/team/settings" className={navLinkClass}>
        {({ isActive }) => <><Settings size={15} className={iconCls(isActive)} />Settings</>}
      </NavLink>
    </>
  );
}

/* ── Sidebar ── */
export function Sidebar({ properties, activeProperty, onPropertyChange, counts = {} }) {
  const { user, clearUser } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.is_admin;
  const isCleaner = user?.role === 'cleaner';
  const isTeamMember = user?.role === 'team_member';
  const roleLabel = isTeamMember ? 'Team member' : isCleaner ? 'Cleaner' : 'Host · Pro plan';

  const orgName = user?.org_name || user?.workspace_name || 'My Workspace';
  const orgInitials = orgName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <aside className="w-[232px] flex-shrink-0 flex flex-col h-full" style={{ background: '#F5F0E2', borderRight: '1px solid #E4DFD3' }}>

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <LogoMark size={30} />
        <span className="font-black leading-none tracking-[-0.035em] text-[22px] text-[#1A1815]">
          Turn<span style={{ background: 'linear-gradient(140deg,#F07447,#C8481F)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zy</span>
        </span>
      </div>

      {/* Workspace / property switcher */}
      {!isCleaner && !isTeamMember && (
        <div className="px-3 pb-3">
          {properties?.length > 1 ? (
            <div className="relative">
              <select
                value={activeProperty || ''}
                onChange={(e) => onPropertyChange(e.target.value || null)}
                className="w-full appearance-none bg-white border border-[#E4DFD3] rounded-[10px] pl-3 pr-8 py-2.5 text-[12px] font-semibold text-[#1F1D1A] focus:outline-none focus:ring-2 focus:ring-[#E85F34] transition-colors cursor-pointer hover:border-[#CFC8B6]"
              >
                <option value="">All properties</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C9481] pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-2 pl-3 bg-white border border-[#E4DFD3] rounded-[10px]">
              <div className="w-7 h-7 rounded-md bg-[#1F1D1A] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{orgInitials}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[#1F1D1A] leading-tight truncate">{orgName}</div>
                <div className="text-[10.5px] text-[#9C9481] leading-tight">All properties</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
        {isTeamMember ? <TeamMemberNav /> : isCleaner ? <CleanerNav /> : (
          <HostNav
            isAdmin={isAdmin}
            urgentCount={counts.urgent}
            needsActionCount={counts.needsAction}
            confirmedCount={counts.confirmed}
            queuedCount={counts.queued}
          />
        )}
      </nav>

      {/* User profile */}
      <div className="p-3" style={{ borderTop: '1px solid #E4DFD3' }}>
        <div className="group flex items-center gap-2.5 p-1.5 rounded-[10px] hover:bg-[#EDE7D7] transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[13px] ring-2 ring-white"
            style={{ background: 'linear-gradient(135deg,#E85F34,#C8481F)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#1F1D1A] truncate leading-tight">{user?.name}</div>
            <div className="text-[11px] text-[#9C9481] leading-tight">{roleLabel}</div>
          </div>
          <button
            onClick={clearUser}
            aria-label="Sign out"
            className="text-[#9C9481] hover:text-[#1F1D1A] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

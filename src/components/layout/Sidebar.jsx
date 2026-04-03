import { NavLink } from 'react-router-dom';
import { Home, Activity, ExternalLink, Building2, Users, CreditCard, Bell, User, Settings, CalendarDays, Lock, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

const HOST_SETTINGS_ITEMS = [
  { to: '/settings/properties', icon: Building2, label: 'Properties' },
  { to: '/settings/cleaners', icon: Users, label: 'Cleaners' },
  { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings/account', icon: User, label: 'Account' },
];

const navLinkClass = ({ isActive }) => clsx(
  'flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors duration-100',
  isActive ? 'bg-coral-50 text-coral-400 border-l-2 border-l-coral-400' : 'text-warm-500 hover:bg-warm-100 hover:text-warm-700'
);

const subNavClass = ({ isActive }) => clsx(
  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-100',
  isActive ? 'text-coral-400 bg-coral-50' : 'text-warm-400 hover:text-warm-600 hover:bg-warm-50'
);

function HostNav({ isAdmin }) {
  return (
    <>
      <div className="text-[10px] font-black text-warm-300 uppercase tracking-widest px-3 pt-4 pb-1">Views</div>

      <NavLink to="/" end className={navLinkClass}>
        {({ isActive }) => (<><Home size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />Dashboard</>)}
      </NavLink>

      <NavLink to="/activity" className={navLinkClass}>
        {({ isActive }) => (<><Activity size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />Activity</>)}
      </NavLink>

      {isAdmin && (
        <a href="/admin" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors duration-100 text-warm-500 hover:bg-warm-100 hover:text-warm-700">
          <ExternalLink size={16} className="text-warm-400" />
          Admin
        </a>
      )}

      <div className="text-[10px] font-black text-warm-300 uppercase tracking-widest px-3 pt-5 pb-1">Settings</div>
      <div className="ml-2">
        {HOST_SETTINGS_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={subNavClass}>
            {({ isActive }) => (<><Icon size={14} className={isActive ? 'text-coral-400' : 'text-warm-300'} />{label}</>)}
          </NavLink>
        ))}
      </div>
    </>
  );
}

const CLEANER_SETTINGS_ITEMS = [
  { to: '/cleaner/settings/team', icon: Users, label: 'My Team' },
  { to: '/cleaner/settings/notifications', icon: Bell, label: 'Notifications' },
  { to: '/cleaner/settings/profile', icon: User, label: 'Profile' },
  { to: '/cleaner/settings/security', icon: Lock, label: 'Security' },
];

function CleanerNav() {
  return (
    <>
      <div className="text-[10px] font-black text-warm-300 uppercase tracking-widest px-3 pt-4 pb-1">Views</div>

      <NavLink to="/cleaner" end className={navLinkClass}>
        {({ isActive }) => (<><Home size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />Dashboard</>)}
      </NavLink>

      <NavLink to="/cleaner/calendar" className={navLinkClass}>
        {({ isActive }) => (<><CalendarDays size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />Calendar</>)}
      </NavLink>

      <NavLink to="/cleaner/activity" className={navLinkClass}>
        {({ isActive }) => (<><Activity size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />Activity</>)}
      </NavLink>

      <div className="text-[10px] font-black text-warm-300 uppercase tracking-widest px-3 pt-5 pb-1">Settings</div>
      <div className="ml-2">
        {CLEANER_SETTINGS_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={subNavClass}>
            {({ isActive }) => (<><Icon size={14} className={isActive ? 'text-coral-400' : 'text-warm-300'} />{label}</>)}
          </NavLink>
        ))}
      </div>
    </>
  );
}

function TeamMemberNav() {
  return (
    <>
      <div className="text-[10px] font-black text-warm-300 uppercase tracking-widest px-3 pt-4 pb-1">Views</div>

      <NavLink to="/team" end className={navLinkClass}>
        {({ isActive }) => (<><Home size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />My Jobs</>)}
      </NavLink>

      <NavLink to="/team/settings" className={navLinkClass}>
        {({ isActive }) => (<><Settings size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />Settings</>)}
      </NavLink>
    </>
  );
}

export function Sidebar({ properties, activeProperty, onPropertyChange }) {
  const { user, clearUser } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.is_admin;
  const isCleaner = user?.role === 'cleaner';
  const isTeamMember = user?.role === 'team_member';
  const roleLabel = isTeamMember ? 'Team Member' : isCleaner ? 'Cleaner' : 'Pro Host';

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-warm-200 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-6 pb-3 border-b border-warm-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-coral-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg>
          </div>
          <div>
            <span className="font-black text-[22px] text-warm-800 tracking-tight leading-none block">Turnzy</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-warm-300 leading-none">Premium Management</span>
          </div>
        </div>
      </div>

      {/* Property filter — host only */}
      {!isCleaner && !isTeamMember && properties?.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          <select
            value={activeProperty || ''}
            onChange={(e) => onPropertyChange(e.target.value || null)}
            className="w-full text-[13px] font-medium bg-warm-100 border-0 rounded-xl px-3 py-2.5 text-warm-700 focus:outline-none focus:ring-2 focus:ring-coral-400"
          >
            <option value="">All properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {isTeamMember ? <TeamMemberNav /> : isCleaner ? <CleanerNav /> : <HostNav isAdmin={isAdmin} />}
      </nav>

      {/* Profile */}
      <div className="border-t border-warm-100 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-coral-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[14px]">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-warm-800 truncate">{user?.name}</div>
            <div className="text-[12px] text-warm-400">{roleLabel}</div>
          </div>
          <button onClick={clearUser} aria-label="Sign out" className="text-warm-400 hover:text-warm-600 p-1 rounded"><LogOut size={14} /></button>
        </div>
      </div>
    </aside>
  );
}

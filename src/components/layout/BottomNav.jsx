import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Activity, Settings, CalendarDays } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

const CLEANER_TABS = [
  { to: '/cleaner',          icon: Home,         label: 'Jobs',     end: true, match: p => p === '/cleaner' || p.startsWith('/cleaner/job') },
  { to: '/cleaner/calendar', icon: CalendarDays, label: 'Calendar', match: p => p.startsWith('/cleaner/calendar') },
  { to: '/cleaner/activity', icon: Activity,     label: 'Activity', match: p => p.startsWith('/cleaner/activity') },
  { to: '/cleaner/settings', icon: Settings,     label: 'Settings', match: p => p.startsWith('/cleaner/settings') },
];

const TEAM_TABS = [
  { to: '/team',          icon: Home,     label: 'Home',     end: true, match: p => p === '/team' || p.startsWith('/team/jobs') },
  { to: '/team/settings', icon: Settings, label: 'Settings', match: p => p.startsWith('/team/settings') },
];

const HOST_TABS = [
  { to: '/',         icon: Home,     label: 'Home',     end: true, match: p => p === '/' },
  { to: '/activity', icon: Activity, label: 'Activity', match: p => p.startsWith('/activity') },
  // Settings tab lights up for any settings sub-page AND for mobile-only host views
  // of Properties / Cleaners (which live under /settings on mobile).
  {
    to: '/settings', icon: Settings, label: 'Settings',
    match: p => p.startsWith('/settings') || p.startsWith('/properties') || p.startsWith('/cleaners'),
  },
];

export function BottomNav() {
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  const role = user?.role;

  const tabs = role === 'cleaner' ? CLEANER_TABS
    : role === 'team_member' ? TEAM_TABS
    : HOST_TABS;

  return createPortal(
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden font-inter"
      style={{
        background: '#1F1D1A',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 12px max(22px, env(safe-area-inset-bottom))',
        gap: 6,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.match ? tab.match(pathname) : pathname === tab.to;
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className="flex-1 relative flex flex-col items-center gap-1 pt-2 pb-1.5 transition-colors"
          >
            {isActive && (
              <span
                aria-hidden
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{ width: 28, height: 3, background: '#D85A30', borderRadius: 999 }}
              />
            )}
            <Icon
              size={21}
              strokeWidth={isActive ? 2.4 : 1.8}
              style={{ color: isActive ? '#D85A30' : 'rgba(255,255,255,0.55)' }}
            />
            <span
              className={clsx(
                'text-[10.5px] tracking-[0.01em]',
                isActive ? 'font-extrabold text-white' : 'font-semibold',
              )}
              style={!isActive ? { color: 'rgba(255,255,255,0.55)' } : undefined}
            >
              {tab.label}
            </span>
          </NavLink>
        );
      })}
    </nav>,
    document.body,
  );
}

import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { Home, Activity, Settings, CalendarDays } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';

const CLEANER_TABS = [
  { to: '/cleaner', icon: Home, label: 'Jobs', end: true },
  { to: '/cleaner/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/cleaner/activity', icon: Activity, label: 'Activity' },
  { to: '/cleaner/settings', icon: Settings, label: 'Settings' },
];

const TEAM_TABS = [
  { to: '/team', icon: Home, label: 'Home', end: true },
  { to: '/team/settings', icon: Settings, label: 'Settings' },
];

const HOST_TABS = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const { user } = useAuthStore();
  const role = user?.role;

  const tabs = role === 'cleaner' ? CLEANER_TABS
    : role === 'team_member' ? TEAM_TABS
    : HOST_TABS;

  return createPortal(
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 pb-safe md:hidden">
      {tabs.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => clsx(
          'flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-semibold justify-center transition-colors duration-100',
          isActive ? 'text-coral-400' : 'text-gray-400'
        )}>
          {({ isActive }) => (
            <>
              <div className={clsx('w-6 h-6 flex items-center justify-center rounded-md', isActive && 'bg-coral-50')}>
                <Icon size={16} />
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>,
    document.body
  );
}

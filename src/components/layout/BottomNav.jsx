import { NavLink } from 'react-router-dom';
import { Home, Activity, Settings } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="flex bg-white border-t border-warm-200 pb-safe">
      {TABS.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => clsx('flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-semibold min-h-touch justify-center transition-colors duration-100', isActive ? 'text-coral-400' : 'text-warm-400')}>
          {({ isActive }) => (<><div className={clsx('w-6 h-6 flex items-center justify-center rounded-md', isActive && 'bg-coral-50')}><Icon size={16} /></div>{label}</>)}
        </NavLink>
      ))}
    </nav>
  );
}

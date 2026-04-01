import { NavLink } from 'react-router-dom';
import { Home, Users, Bell, CreditCard, User, Lock } from 'lucide-react';
import clsx from 'clsx';

const GROUPS = [
  {
    label: 'Settings',
    items: [
      { to: '/settings/properties', icon: Home, label: 'Properties' },
      { to: '/settings/cleaners', icon: Users, label: 'Cleaners' },
      { to: '/settings/notifications', icon: Bell, label: 'Notifications' },
      { to: '/settings/billing', icon: CreditCard, label: 'Billing' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings/profile', icon: User, label: 'Profile' },
      { to: '/settings/security', icon: Lock, label: 'Security' },
    ],
  },
];

export function SettingsNav() {
  return (
    <nav className="w-[160px] flex-shrink-0 bg-warm-50 border-r border-warm-100 py-2 overflow-y-auto">
      {GROUPS.map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider px-4 pt-3 pb-1">{group.label}</div>
          {group.items.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => clsx(
              'flex items-center gap-2 px-4 py-2 text-[13px] font-medium border-l-2 transition-colors',
              isActive ? 'text-coral-400 border-l-coral-400 bg-white' : 'text-warm-500 border-l-transparent hover:bg-white hover:text-warm-700'
            )}>
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export { GROUPS };

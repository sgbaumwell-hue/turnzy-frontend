import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ToastProvider } from './components/Toast';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Home, Users, Bell, CreditCard, User } from 'lucide-react';

const MOBILE_ITEMS = [
  { to: '/settings/properties', icon: Home, label: 'Properties', desc: 'Calendars, times, timezone' },
  { to: '/settings/cleaners', icon: Users, label: 'Cleaners', desc: 'Primary, backup, connection' },
  { to: '/settings/notifications', icon: Bell, label: 'Notifications', desc: 'Alerts, timing, channels' },
  { to: '/settings/billing', icon: CreditCard, label: 'Billing', desc: 'Plan, payment method' },
  { to: '/settings/account', icon: User, label: 'Account', desc: 'Profile, password, security' },
];

const SECTION_LABELS = {
  '/settings/properties': 'Properties',
  '/settings/cleaners': 'Cleaners',
  '/settings/notifications': 'Notifications',
  '/settings/billing': 'Billing',
  '/settings/account': 'Account',
};

function MobileMenu() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-[20px] font-bold text-warm-900">Settings</h1>
      </div>
      {MOBILE_ITEMS.map(({ to, icon: Icon, label, desc }) => (
        <button key={to} onClick={() => navigate(to)} className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-warm-50 border-b border-warm-100">
          <Icon size={16} className="text-warm-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-medium text-warm-800">{label}</div>
            <div className="text-[12px] text-warm-400">{desc}</div>
          </div>
          <span className="text-warm-300 text-lg">›</span>
        </button>
      ))}
    </div>
  );
}

export function SettingsLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/settings' || location.pathname === '/settings/';
  const sectionLabel = SECTION_LABELS[location.pathname] || 'Settings';

  return (
    <ToastProvider>
      <div className="flex flex-1 overflow-hidden h-full">
        {isDesktop ? (
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-4xl">
              <Outlet />
            </div>
          </div>
        ) : (
          isRoot ? (
            <MobileMenu />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-warm-100 bg-white">
                <button onClick={() => navigate('/settings')} className="p-1 text-warm-500 hover:text-warm-700">
                  <ArrowLeft size={18} />
                </button>
                <span className="text-[15px] font-semibold text-warm-900">{sectionLabel}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Outlet />
              </div>
            </div>
          )
        )}
      </div>
    </ToastProvider>
  );
}

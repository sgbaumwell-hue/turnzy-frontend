import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Bell, CreditCard, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const MOBILE_ITEMS = [
  { to: '/settings/notifications', icon: Bell, label: 'Notifications', desc: 'Alerts, timing, channels' },
  { to: '/settings/billing', icon: CreditCard, label: 'Billing', desc: 'Plan, payment method' },
  { to: '/settings/account', icon: User, label: 'Account', desc: 'Profile, password, security' },
];

// Pages that manage their own full-height layout (content column + warm
// dot-grid rail on the right, à la the Bookings detail pane). Billing
// still runs the legacy padded/centered layout.
const FULL_HEIGHT_PAGES = [
  '/settings/properties',
  '/settings/cleaners',
  '/settings/notifications',
  '/settings/account',
];

function MobileMenu({ isAdmin }) {
  const navigate = useNavigate();
  const items = isAdmin
    ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin', desc: 'Internal admin console', external: true }, ...MOBILE_ITEMS]
    : MOBILE_ITEMS;

  return (
    <div className="flex-1 overflow-y-auto font-inter bg-bg-page">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-serif text-[26px] text-ink" style={{ fontWeight: 900, letterSpacing: -0.6 }}>
          Settings
        </h1>
      </div>
      <div className="border-t border-b border-border-soft bg-bg-surface">
        {items.map(({ to, icon: Icon, label, desc, external }) => (
          <button
            key={to}
            onClick={() => external ? window.open(to, '_blank', 'noopener') : navigate(to)}
            className="flex items-center gap-3 w-full px-5 text-left hover:bg-bg-subtle border-b border-border-soft last:border-b-0 active:bg-bg-subtle transition-colors"
            style={{ minHeight: 60 }}
          >
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#F1EFE8' }}>
              <Icon size={17} strokeWidth={2} style={{ color: '#5F5B52' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-ink leading-tight">{label}</div>
              <div className="text-[12.5px] text-text-muted mt-0.5">{desc}</div>
            </div>
            <ChevronRight size={18} className="text-text-faint flex-shrink-0" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.is_admin;
  const isRoot = location.pathname === '/settings' || location.pathname === '/settings/';
  const isFullHeight = FULL_HEIGHT_PAGES.includes(location.pathname);

  useEffect(() => {
    if (isDesktop && isRoot) navigate('/settings/notifications', { replace: true });
  }, [isDesktop, isRoot, navigate]);

  return (
    <ToastProvider>
      <div className="flex flex-1 overflow-hidden h-full">
        {isDesktop ? (
          isFullHeight ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-8 py-8 bg-bg-page">
              <Outlet />
            </div>
          )
        ) : isRoot ? (
          <MobileMenu isAdmin={isAdmin} />
        ) : isFullHeight ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Outlet />
          </div>
        ) : (
          // Mobile sub-page: AppShell's MobileHeader already provides the
          // "‹ Settings" back button, so we just render the content.
          <div className="flex-1 overflow-y-auto bg-bg-page">
            <Outlet />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Breadcrumb-style single-level back (per Settings redesign spec).
 * Returns `{ label, to }` for sub-pages that should render a back button
 * in the mobile top bar, or null to show the Turnzy wordmark.
 */
function deriveBack(pathname, role) {
  if (!role || role === 'host' || role === 'admin') {
    // Properties + Cleaners are now their own primary tabs — treat the roots
    // as ROOT screens (wordmark). Deeper routes would remain sub-screens.
    if (pathname === '/settings' || pathname === '/properties' || pathname === '/cleaners') {
      return null;
    }
    if (pathname.startsWith('/settings/')) {
      return { label: 'Settings', to: '/settings' };
    }
    if (pathname.startsWith('/properties/')) {
      return { label: 'Properties', to: '/properties' };
    }
    if (pathname.startsWith('/cleaners/')) {
      return { label: 'Cleaners', to: '/cleaners' };
    }
  }
  if (role === 'cleaner') {
    if (pathname.startsWith('/cleaner/settings/')) {
      return { label: 'Settings', to: '/cleaner/settings' };
    }
  }
  if (role === 'team_member') {
    if (pathname !== '/team/settings' && pathname.startsWith('/team/settings/')) {
      return { label: 'Settings', to: '/team/settings' };
    }
  }
  return null;
}

function MobileBrand() {
  return (
    <div className="flex items-center pl-4">
      <span
        className="leading-none text-ink"
        style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: 20, letterSpacing: -0.04, fontWeight: 900 }}
      >
        Turnzy
      </span>
    </div>
  );
}

function MobileHeader() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const back = deriveBack(pathname, user?.role);

  return (
    <header
      className="md:hidden sticky top-0 z-20 flex-shrink-0 flex items-center font-inter"
      style={{
        height: 52,
        background: '#F9F8F6',
        borderBottom: '1px solid #EDEAE0',
      }}
    >
      {back ? (
        <button
          onClick={() => navigate(back.to)}
          className="inline-flex items-center gap-0.5 pl-2 pr-3"
          style={{ height: 44, color: '#1F1D1A' }}
          aria-label={`Back to ${back.label}`}
        >
          <ChevronLeft size={20} strokeWidth={2.4} style={{ color: '#D85A30' }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#5F5B52' }}>{back.label}</span>
        </button>
      ) : (
        <MobileBrand />
      )}

      <div className="flex-1" />
    </header>
  );
}

export function TopBar() {
  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const monthDay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
  return (
    <div
      className="hidden md:flex items-center px-6 flex-shrink-0 sticky top-0 z-20 font-inter"
      style={{ height: 52, background: '#FFFFFF', borderBottom: '1px solid #EDEAE0' }}
    >
      <div
        className="text-[10.5px] font-extrabold uppercase"
        style={{ color: '#888780', letterSpacing: '0.14em' }}
      >
        TODAY · {weekday}, {monthDay}
      </div>
      <div className="flex-1" />
    </div>
  );
}

export function AppShell({ children, counts }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { user } = useAuthStore();
  const showMobileHeader = !isDesktop && user?.role !== 'team_member';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F8F6' }}>
      {isDesktop && <Sidebar counts={counts || {}} />}
      <main className={clsx('flex-1 flex flex-col min-w-0 overflow-hidden', !isDesktop && 'pb-[78px]')}>
        {showMobileHeader && <MobileHeader />}
        {isDesktop && <TopBar />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  );
}

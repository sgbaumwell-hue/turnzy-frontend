import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Bell, Search, Plus, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Breadcrumb-style single-level back (per Settings redesign spec).
 * Returns `{ label, to }` for sub-pages that should render a back button
 * in the mobile top bar, or null to show the Turnzy wordmark.
 */
function deriveBack(pathname, role) {
  // Host: settings sub-pages + settings-scoped Properties/Cleaners
  if (!role || role === 'host' || role === 'admin') {
    if (pathname === '/settings' || pathname.startsWith('/settings/')) {
      if (pathname === '/settings') return null;
      return { label: 'Settings', to: '/settings' };
    }
    if (pathname.startsWith('/properties') || pathname.startsWith('/cleaners')) {
      return { label: 'Settings', to: '/settings' };
    }
  }
  // Cleaner
  if (role === 'cleaner') {
    if (pathname.startsWith('/cleaner/settings/')) {
      return { label: 'Settings', to: '/cleaner/settings' };
    }
  }
  // Team member
  if (role === 'team_member') {
    if (pathname !== '/team/settings' && pathname.startsWith('/team/settings/')) {
      return { label: 'Settings', to: '/team/settings' };
    }
  }
  return null;
}

function MobileBrand() {
  return (
    <div className="flex items-center gap-2.5 px-4">
      <div
        className="relative flex-shrink-0 flex items-center justify-center"
        style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(140deg,#F07447 0%,#E85F34 45%,#C8481F 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3), 0 2px 6px rgba(168,66,30,.2)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
          <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="16" r="2.2" fill="white" />
        </svg>
      </div>
      <span
        className="font-black leading-none text-ink"
        style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, letterSpacing: -0.4, fontWeight: 900 }}
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

      {!back && user?.role !== 'team_member' && (
        <button
          className="relative inline-flex items-center justify-center mr-2"
          style={{ width: 40, height: 40, borderRadius: 8 }}
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} style={{ color: '#2C2C2A' }} />
          <span
            className="absolute"
            style={{
              top: 10, right: 10, width: 7, height: 7, borderRadius: 999,
              background: '#D85A30', boxShadow: '0 0 0 2px #F9F8F6',
            }}
          />
        </button>
      )}
    </header>
  );
}

export function TopBar() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <div
      className="hidden md:flex items-center gap-4 px-6 flex-shrink-0 sticky top-0 z-20 font-inter"
      style={{ height: 52, background: '#FFFFFF', borderBottom: '1px solid #EDEAE0' }}
    >
      <div
        className="text-[10.5px] font-extrabold uppercase"
        style={{ color: '#888780', letterSpacing: '0.14em' }}
      >
        {dateStr}
      </div>
      <div className="flex-1" />
      <button
        className="flex items-center gap-2 h-8 px-3 rounded-lg text-[12.5px] transition-colors"
        style={{ color: '#888780', background: '#F9F8F6', border: '1px solid #EDEAE0' }}
      >
        <Search size={14} />
        Search
        <kbd
          className="ml-1 text-[11px] px-1.5 py-0.5 rounded"
          style={{ background: '#FFFFFF', border: '1px solid #E4DFD3', color: '#888780', fontFamily: 'ui-monospace, monospace' }}
        >
          ⌘K
        </kbd>
      </button>
      <button
        className="relative inline-flex items-center justify-center"
        style={{ width: 32, height: 32, borderRadius: 8, color: '#2C2C2A' }}
        aria-label="Notifications"
      >
        <Bell size={17} />
        <span
          className="absolute"
          style={{ top: 6, right: 7, width: 7, height: 7, borderRadius: 999, background: '#D85A30', boxShadow: '0 0 0 2px #fff' }}
        />
      </button>
      <button
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-semibold text-white transition-colors"
        style={{ background: '#1F1D1A' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#2C2A26')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#1F1D1A')}
      >
        <Plus size={13} />New booking
      </button>
    </div>
  );
}

export function AppShell({ children, counts }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { activeProperty, setActiveProperty } = useUiStore();
  const { user } = useAuthStore();
  const showMobileHeader = !isDesktop && user?.role !== 'team_member';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F8F6' }}>
      {isDesktop && (
        <Sidebar
          properties={[]}
          activeProperty={activeProperty}
          onPropertyChange={setActiveProperty}
          counts={counts || {}}
        />
      )}
      <main className={clsx('flex-1 flex flex-col min-w-0 overflow-hidden', !isDesktop && 'pb-[78px]')}>
        {showMobileHeader && <MobileHeader />}
        {isDesktop && <TopBar />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  );
}

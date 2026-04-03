import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-coral-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg>
        </div>
        <div>
          <span className="font-black text-[18px] text-gray-900 tracking-tight leading-none block">Turnzy</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 leading-none">Premium Management</span>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { activeProperty, setActiveProperty } = useUiStore();
  const { user } = useAuthStore();
  const showMobileHeader = !isDesktop && user?.role !== 'team_member';

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50">
      {isDesktop && <Sidebar properties={[]} activeProperty={activeProperty} onPropertyChange={setActiveProperty} />}
      <main className={clsx('flex-1 flex flex-col min-w-0 overflow-hidden', !isDesktop && 'pb-16')}>
        {showMobileHeader && <MobileHeader />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  );
}

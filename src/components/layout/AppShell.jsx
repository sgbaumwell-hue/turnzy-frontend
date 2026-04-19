import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Bell, Search, Plus } from 'lucide-react';
import clsx from 'clsx';

function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20 flex-shrink-0"
      style={{ background: 'rgba(251,248,241,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #EDE7D7' }}>
      <div className="flex items-center gap-2.5">
        {/* Mobile logo mark */}
        <div className="relative flex-shrink-0 flex items-center justify-center"
          style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(140deg,#F07447 0%,#E85F34 45%,#C8481F 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3),0 3px 8px rgba(168,66,30,.2)' }}>
          <svg width="17" height="17" viewBox="0 0 32 32" fill="none">
            <path d="M16 3.5L26.5 9.5V21.5L16 28L5.5 21.5V9.5L16 3.5Z" stroke="white" strokeOpacity="0.38" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
            <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="16" r="2.2" fill="white"/>
          </svg>
        </div>
        <span className="font-black text-[20px] leading-none tracking-[-0.035em] text-[#1A1815]">
          Turn<span style={{ background: 'linear-gradient(140deg,#F07447,#C8481F)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zy</span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button className="relative p-2 rounded-lg text-[#9C9481] hover:bg-[#EDE7D7] hover:text-[#1F1D1A] transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E85F34]" />
        </button>
      </div>
    </header>
  );
}

export function TopBar() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="hidden md:flex items-center justify-between px-6 py-3 flex-shrink-0 sticky top-0 z-20"
      style={{ background: 'rgba(251,248,241,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #EDE7D7' }}>
      <div className="text-[10.5px] font-bold text-[#9C9481] uppercase tracking-[0.14em]">
        Today · {dateStr}
      </div>
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-2 h-8 px-3 rounded-[8px] text-[12.5px] text-[#6B6454] hover:bg-[#EDE7D7] transition-colors">
          <Search size={13} />
          Search
          <kbd className="ml-1 text-[10px] bg-white border border-[#E4DFD3] px-1.5 py-0.5 rounded text-[#9C9481]">⌘K</kbd>
        </button>
        <button className="relative p-1.5 rounded-lg text-[#9C9481] hover:bg-[#EDE7D7] hover:text-[#1F1D1A] transition-all">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E85F34]" />
        </button>
        <button className="ml-1 inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[#1F1D1A] text-white text-[13px] font-medium hover:bg-[#2C2A26] transition-colors">
          <Plus size={13} />New booking
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children, counts }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { activeProperty, setActiveProperty } = useUiStore();
  const { user } = useAuthStore();
  const showMobileHeader = !isDesktop && user?.role !== 'team_member';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FBF8F1' }}>
      {isDesktop && (
        <Sidebar
          properties={[]}
          activeProperty={activeProperty}
          onPropertyChange={setActiveProperty}
          counts={counts || {}}
        />
      )}
      <main className={clsx('flex-1 flex flex-col min-w-0 overflow-hidden', !isDesktop && 'pb-16')}>
        {showMobileHeader && <MobileHeader />}
        {isDesktop && <TopBar />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  );
}

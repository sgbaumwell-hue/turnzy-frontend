import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUiStore } from '../../store/uiStore';
import clsx from 'clsx';

export function AppShell({ children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { activeProperty, setActiveProperty } = useUiStore();

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50">
      {isDesktop && <Sidebar properties={[]} activeProperty={activeProperty} onPropertyChange={setActiveProperty} />}
      <main className={clsx('flex-1 flex flex-col min-w-0 overflow-hidden', !isDesktop && 'pb-16')}>{children}</main>
      {!isDesktop && <BottomNav />}
    </div>
  );
}

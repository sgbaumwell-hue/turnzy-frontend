import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUiStore } from '../../store/uiStore';

export function AppShell({ children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { activeProperty, setActiveProperty } = useUiStore();

  return (
    <div className="flex h-screen overflow-hidden bg-warm-50">
      {isDesktop && <Sidebar properties={[]} activeProperty={activeProperty} onPropertyChange={setActiveProperty} />}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
      {!isDesktop && <BottomNav />}
    </div>
  );
}

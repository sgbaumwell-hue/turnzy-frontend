import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SettingsNav, GROUPS } from './SettingsNav';
import { ToastProvider } from './components/Toast';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const SECTION_LABELS = {};
GROUPS.forEach(g => g.items.forEach(i => {
  SECTION_LABELS[i.to] = i.label;
}));

function MobileMenu() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-[20px] font-bold text-warm-900">Settings</h1>
      </div>
      {GROUPS.map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider px-4 pt-3 pb-1">{group.label}</div>
          {group.items.map(({ to, icon: Icon, label }) => (
            <button key={to} onClick={() => navigate(to)} className="flex items-center gap-3 w-full px-4 py-3 text-[15px] font-medium text-warm-800 hover:bg-warm-50 border-b border-warm-100">
              <Icon size={16} className="text-warm-400" />
              {label}
              <span className="ml-auto text-warm-300 text-lg">›</span>
            </button>
          ))}
        </div>
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
          <>
            <SettingsNav />
            <div className="flex-1 overflow-y-auto p-6">
              <Outlet />
            </div>
          </>
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

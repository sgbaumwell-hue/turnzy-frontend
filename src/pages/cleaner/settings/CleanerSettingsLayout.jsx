import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

export function CleanerSettingsLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/cleaner/settings' || location.pathname === '/cleaner/settings/';

  // On desktop the sidebar already has settings sub-nav, just render content
  // On mobile show a back arrow
  if (isDesktop) {
    return (
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">
          <Outlet />
        </div>
      </div>
    );
  }

  // Mobile: redirect root to notifications
  if (isRoot) {
    return <div className="flex-1 overflow-y-auto px-8 py-8"><div className="max-w-2xl"><Outlet /></div></div>;
  }

  const labelMap = {
    '/cleaner/settings/team': 'My Team',
    '/cleaner/settings/notifications': 'Notifications',
    '/cleaner/settings/profile': 'Profile',
    '/cleaner/settings/security': 'Security',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
        <button onClick={() => navigate('/cleaner/settings')} className="p-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} />
        </button>
        <span className="text-[15px] font-semibold text-gray-900">{labelMap[location.pathname] || 'Settings'}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </div>
    </div>
  );
}

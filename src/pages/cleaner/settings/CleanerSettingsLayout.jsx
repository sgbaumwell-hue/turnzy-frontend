import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, Bell, User, LogOut } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';

const SECTIONS = [
  { to: '/cleaner/settings/team', icon: Users, label: 'My Team', subtitle: 'Invite helpers and assign them to jobs' },
  { to: '/cleaner/settings/notifications', icon: Bell, label: 'Notifications', subtitle: 'Alerts, timing, channels' },
  { to: '/cleaner/settings/account', icon: User, label: 'Account', subtitle: 'Name, email, password' },
];

function getSectionTitle(path) {
  if (path.includes('team')) return 'My Team';
  if (path.includes('notifications')) return 'Notifications';
  if (path.includes('account')) return 'Account';
  return 'Settings';
}

function MobileSettingsMenu() {
  const navigate = useNavigate();
  const { clearUser } = useAuthStore();

  async function handleSignOut() {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearUser();
    localStorage.removeItem('turnzy_token');
    navigate('/login');
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="px-4 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>
      {SECTIONS.map(({ to, icon: Icon, label, subtitle }) => (
        <div key={to} onClick={() => navigate(to)}
          className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 active:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Icon size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300" size={18} />
        </div>
      ))}

      <div className="p-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 active:bg-gray-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function CleanerSettingsLayout() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/cleaner/settings' || location.pathname === '/cleaner/settings/';

  // Desktop: sidebar already has settings nav, redirect root to notifications
  if (isDesktop) {
    if (isRoot) return <Navigate to="/cleaner/settings/notifications" replace />;
    return (
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">
          <Outlet />
        </div>
      </div>
    );
  }

  // Mobile: show menu at root, section with back button at sub-routes
  if (isRoot) {
    return <MobileSettingsMenu />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/cleaner/settings')} className="p-1 -ml-1">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">{getSectionTitle(location.pathname)}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <Outlet />
      </div>
    </div>
  );
}

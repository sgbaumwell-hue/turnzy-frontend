import { NavLink } from 'react-router-dom';
import { Home, Activity, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ properties, activeProperty, onPropertyChange }) {
  const { user, clearUser } = useAuthStore();
  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-warm-200 flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 border-b border-warm-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-coral-400 rounded-lg flex items-center justify-center flex-shrink-0"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
          <span className="font-black text-[22px] text-warm-800 tracking-tight">Turnzy</span>
        </div>
      </div>
      {properties?.length > 0 && (
        <div className="px-3 pt-3 pb-2">
          <select
            value={activeProperty || ''}
            onChange={(e) => onPropertyChange(e.target.value || null)}
            className="w-full text-[13px] font-medium bg-warm-100 border-0 rounded-xl px-3 py-2.5 text-warm-700 focus:outline-none focus:ring-2 focus:ring-coral-400"
          >
            <option value="">All properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <nav className="flex-1 px-2 py-2">
        <div className="text-[10px] font-black text-warm-300 uppercase tracking-widest px-4 pt-5 pb-1">Views</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 rounded-lg text-[14px] font-medium transition-colors duration-100 min-h-[40px]',
            isActive ? 'bg-coral-50 text-coral-400 border-l-2 border-l-coral-400' : 'text-warm-500 hover:bg-warm-100 hover:text-warm-700'
          )}>
            {({ isActive }) => (<><Icon size={16} className={isActive ? 'text-coral-400' : 'text-warm-400'} />{label}</>)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-warm-100 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-coral-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[14px]">{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-warm-800 truncate">{user?.name}</div>
            <div className="text-[12px] text-warm-400">{user?.role === 'host' ? 'Host' : user?.role || 'Host'}</div>
          </div>
          <button onClick={clearUser} aria-label="Sign out" className="text-warm-400 hover:text-warm-600 p-1 rounded"><LogOut size={14} /></button>
        </div>
      </div>
    </aside>
  );
}

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/host/Dashboard';
import { BookingDetailPage } from './pages/host/BookingDetailPage';
import { HostActivity } from './pages/host/HostActivity';
import { BookingSection } from './pages/host/BookingSection';
import { PropertiesPortfolio } from './pages/host/PropertiesPortfolio';
import { PropertyDetailStub } from './pages/host/PropertyDetailStub';
import { AddPropertyStub } from './pages/host/AddPropertyStub';
import { CleanerDashboard } from './pages/cleaner/CleanerDashboard';
import { CleanerCalendar } from './pages/cleaner/CleanerCalendar';
import { CleanerCalendarJobDetail } from './pages/cleaner/CleanerCalendarJobDetail';
import { CleanerActivity } from './pages/cleaner/CleanerActivity';
import { CleanerSettingsLayout } from './pages/cleaner/settings/CleanerSettingsLayout';
import { CleanerSettingsTeam } from './pages/cleaner/settings/CleanerSettingsTeam';
import { CleanerSettingsNotifications } from './pages/cleaner/settings/CleanerSettingsNotifications';
import { CleanerSettingsAccount } from './pages/cleaner/settings/CleanerSettingsAccount';
import { TeamDashboard } from './pages/team/TeamDashboard';
import { AcceptInvite } from './pages/team/AcceptInvite';
import { SettingsLayout } from './pages/settings/SettingsLayout';
import { Properties } from './pages/settings/sections/Properties';
import { Cleaners } from './pages/settings/sections/Cleaners';
import { Notifications } from './pages/settings/sections/Notifications';
import { Billing } from './pages/settings/sections/Billing';
import { Account } from './pages/settings/sections/Account';
import { DeleteConfirm } from './pages/account/DeleteConfirm';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30 * 1000, retry: 1 } },
});

function RequireAuth({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'cleaner') return <Navigate to="/cleaner" replace />;
    if (user?.role === 'team_member') return <Navigate to="/team" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  if (user?.role === 'cleaner') return <Navigate to="/cleaner" replace />;
  if (user?.role === 'team_member') return <Navigate to="/team" replace />;
  return <Navigate to="/" replace />;
}

function AppWithAuth() {
  const { setUser } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('_u');
    if (userParam) {
      try {
        const user = JSON.parse(atob(userParam));
        if (user.token) {
          localStorage.setItem('turnzy_token', user.token);
          delete user.token;
        }
        setUser(user);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Auth param error:', e);
      }
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-warm-50">
        <div className="w-8 h-8 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/team/accept" element={<AcceptInvite />} />
      <Route path="/account/delete-confirm" element={<RequireAuth><DeleteConfirm /></RequireAuth>} />

      {/* Host dashboard */}
      <Route path="/" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><Dashboard /></AppShell></RequireAuth>
      } />
      <Route path="/bookings/detail/:id" element={
        <RequireAuth allowedRoles={['host', 'admin']}><BookingDetailPage /></RequireAuth>
      } />
      <Route path="/activity" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><HostActivity /></AppShell></RequireAuth>
      } />
      <Route path="/bookings/:section" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><BookingSection /></AppShell></RequireAuth>
      } />

      {/* Properties portfolio (Workspace) */}
      <Route path="/properties" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><PropertiesPortfolio /></AppShell></RequireAuth>
      } />
      <Route path="/properties/new" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><AddPropertyStub /></AppShell></RequireAuth>
      } />
      <Route path="/properties/:id" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><PropertyDetailStub /></AppShell></RequireAuth>
      } />

      {/* Cleaner pages */}
      <Route path="/cleaner" element={
        <RequireAuth allowedRoles={['cleaner']}><AppShell><CleanerDashboard /></AppShell></RequireAuth>
      } />
      <Route path="/cleaner/calendar" element={
        <RequireAuth allowedRoles={['cleaner']}><AppShell><CleanerCalendar /></AppShell></RequireAuth>
      } />
      <Route path="/cleaner/calendar/job/:id" element={
        <RequireAuth allowedRoles={['cleaner']}><CleanerCalendarJobDetail /></RequireAuth>
      } />
      <Route path="/cleaner/activity" element={
        <RequireAuth allowedRoles={['cleaner']}><AppShell><CleanerActivity /></AppShell></RequireAuth>
      } />

      {/* Cleaner settings */}
      <Route path="/cleaner/settings" element={
        <RequireAuth allowedRoles={['cleaner']}><AppShell><CleanerSettingsLayout /></AppShell></RequireAuth>
      }>
        {/* No index redirect — CleanerSettingsLayout handles root state:
            desktop redirects via sidebar nav, mobile shows menu */}
        <Route path="team" element={<CleanerSettingsTeam />} />
        <Route path="notifications" element={<CleanerSettingsNotifications />} />
        <Route path="account" element={<CleanerSettingsAccount />} />
      </Route>

      {/* Team member dashboard */}
      <Route path="/team" element={
        <RequireAuth allowedRoles={['team_member']}><AppShell><TeamDashboard /></AppShell></RequireAuth>
      } />

      {/* Host settings */}
      <Route path="/settings" element={
        <RequireAuth allowedRoles={['host', 'admin']}><AppShell><SettingsLayout /></AppShell></RequireAuth>
      }>
        <Route index element={<Navigate to="/settings/properties" replace />} />
        <Route path="properties" element={<Properties />} />
        <Route path="cleaners" element={<Cleaners />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="billing" element={<Billing />} />
        <Route path="account" element={<Account />} />
      </Route>

      <Route path="/home" element={<RequireAuth><RoleRedirect /></RequireAuth>} />

      <Route path="*" element={
        <div className="flex items-center justify-center h-screen text-warm-400">Page not found</div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppWithAuth />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

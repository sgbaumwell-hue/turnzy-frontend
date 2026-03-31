import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/host/Dashboard';
import { Login } from './pages/auth/Login';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30 * 1000, retry: 1 } },
});

function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppWithAuth() {
  const { setUser } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for OAuth redirect with _u param
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
      <Route path="/" element={
        <RequireAuth><AppShell><Dashboard /></AppShell></RequireAuth>
      } />
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

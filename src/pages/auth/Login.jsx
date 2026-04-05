import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      if (data.token) {
        localStorage.setItem('turnzy_token', data.token);
      }
      const { token, ...user } = data;
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-warm-200 p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-coral-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
            <span className="font-bold text-2xl text-warm-800 tracking-tight">Turnzy</span>
          </div>
          <a href={`${BACKEND_URL}/auth/google`} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-warm-200 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </a>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-warm-200" /><span className="text-xs text-warm-400">or</span><div className="flex-1 h-px bg-warm-200" /></div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label htmlFor="email" className="block text-xs font-bold text-warm-500 uppercase tracking-wider mb-1.5">Email</label><input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-warm-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30 transition-colors" placeholder="you@example.com" /></div>
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-warm-500 uppercase tracking-wider mb-1.5">Password</label>
              <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-warm-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30 transition-colors" placeholder="••••••••" />
              <div className="text-right mt-1"><a href="/forgot-password" className="text-xs text-warm-400 hover:text-warm-600">Forgot password?</a></div>
            </div>
            {error && <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" fullWidth loading={loading} className="mt-1">Sign in</Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <p className="text-xs text-warm-400">Don't have an account? <a href="/signup" className="text-coral-400 font-medium hover:underline">Sign up</a></p>
            <p className="text-xs text-warm-400">Are you a cleaner? <a href="/cleaner/signup" className="text-coral-400 font-medium hover:underline">Sign up here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

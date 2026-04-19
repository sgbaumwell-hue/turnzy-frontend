import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      if (data.token) localStorage.setItem('turnzy_token', data.token);
      const { token, ...user } = data;
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  }

  const LogoMark = ({ size = 36 }) => (
    <div className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.27, background: 'linear-gradient(140deg,#F07447 0%,#E85F34 45%,#C8481F 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.3),inset 0 -1.5px 0 rgba(0,0,0,.1),0 4px 10px rgba(168,66,30,.22)' }}>
      <div className="absolute pointer-events-none" style={{ inset: 2, borderRadius: size * 0.27 - 2, background: 'linear-gradient(180deg,rgba(255,255,255,.22),transparent 50%)' }} />
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 32 32" fill="none" className="relative z-10">
        <path d="M16 3.5L26.5 9.5V21.5L16 28L5.5 21.5V9.5L16 3.5Z" stroke="white" strokeOpacity="0.38" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        <path d="M16 9.5C19.4 9.8 22 12.5 22 16C22 19.5 19.4 22.2 16 22.5" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
        <path d="M22 16L23.8 14.2M22 16L20.2 14.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="16" r="2.2" fill="white"/>
      </svg>
    </div>
  );

  const Wordmark = ({ size = 27, dark = false }) => (
    <span className="font-black leading-none tracking-[-0.035em]" style={{ fontSize: size, color: dark ? '#1A1815' : 'white' }}>
      Turn<span style={{ background: 'linear-gradient(140deg,#F07447,#C8481F)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zy</span>
    </span>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] bg-[#FBF8F1]">

      {/* Left editorial panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#1F1D1A] text-white">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%,#E85F34 0%,transparent 45%),radial-gradient(circle at 80% 70%,#E85F34 0%,transparent 40%)' }} />
        <svg className="absolute -right-20 -bottom-24 opacity-[0.07]" width="520" height="520" viewBox="0 0 100 100" fill="none">
          <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" stroke="white" strokeWidth="0.4"/>
          <path d="M50 15L82 33V67L50 85L18 67V33L50 15Z" stroke="white" strokeWidth="0.4"/>
          <path d="M50 25L74 38.5V61.5L50 75L26 61.5V38.5L50 25Z" stroke="white" strokeWidth="0.4"/>
        </svg>

        <div className="relative z-10 flex items-center gap-2.5">
          <LogoMark size={36} /><Wordmark size={27} />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#E85F34] mb-5">— Turnover Operations</p>
          <h1 className="font-serif text-[56px] leading-[1.02] tracking-[-0.03em] font-black">
            One list.<br/>Every turnover.<br/><span className="text-[#E85F34] italic font-light">Handled.</span>
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/60 max-w-sm">
            Turnzy syncs bookings from Airbnb, VRBO, and Hostaway — then quietly keeps your cleaning crew in lock-step with every check-out.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-[12px] text-white/40">
          <div>
            <span className="text-white font-bold text-[22px] font-serif">4,812</span>
            <div className="uppercase tracking-[0.12em] mt-0.5">Turnovers last month</div>
          </div>
          <div className="w-px h-10 bg-white/15" />
          <div>
            <span className="text-white font-bold text-[22px] font-serif">98.2%</span>
            <div className="uppercase tracking-[0.12em] mt-0.5">Confirmed on time</div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[380px]">

          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <LogoMark size={32} /><Wordmark size={24} dark />
          </div>

          <div className="mb-8">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9C9481] mb-3">Sign in</p>
            <h2 className="font-serif text-[34px] leading-[1.05] tracking-[-0.025em] font-black text-[#1F1D1A]">Welcome back.</h2>
          </div>

          <a href={`${BACKEND_URL}/auth/google`}
            className="w-full h-11 mb-5 inline-flex items-center justify-center gap-3 rounded-[10px] border border-[#E4DFD3] bg-white text-[#1F1D1A] hover:bg-[#FBF8F1] hover:border-[#CFC8B6] text-[14px] font-medium transition-all duration-150">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E4DFD3]" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9C9481]">or with email</span>
            <div className="flex-1 h-px bg-[#E4DFD3]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9C9481] mb-1.5">Email</p>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className="flex h-11 w-full rounded-[10px] border border-[#E4DFD3] bg-white px-3.5 text-[14px] text-[#1F1D1A] placeholder:text-[#B4AD9A] transition-all duration-150 focus:outline-none focus:border-[#E85F34] focus:ring-4 focus:ring-[#E85F34]/10" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9C9481]">Password</p>
                <a href="/forgot-password" className="text-[11.5px] text-[#6B6454] hover:text-[#1F1D1A] font-medium transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="flex h-11 w-full rounded-[10px] border border-[#E4DFD3] bg-white px-3.5 pr-11 text-[14px] text-[#1F1D1A] placeholder:text-[#B4AD9A] transition-all duration-150 focus:outline-none focus:border-[#E85F34] focus:ring-4 focus:ring-[#E85F34]/10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9481] hover:text-[#5F5B52] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-[12px] text-[#9A2F2A] bg-[#FBEDEA] border border-[#F0D4CE] px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-12 mt-1 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#E85F34] text-white text-[15px] font-semibold hover:bg-[#D4522A] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85F34] focus-visible:ring-offset-2">
              {loading && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
              Sign in →
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-[#E4DFD3] text-center">
            <p className="text-[13px] text-[#6B6454]">New to Turnzy?{' '}
              <a href="/signup" className="text-[#1F1D1A] font-semibold underline decoration-[#E85F34] decoration-2 underline-offset-4 hover:decoration-4 transition-all">Create an account</a>
            </p>
            <p className="text-[12px] text-[#9C9481] mt-2">Cleaner?{' '}
              <a href="/cleaner/signup" className="text-[#6B6454] hover:text-[#1F1D1A] transition-colors">Sign up here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

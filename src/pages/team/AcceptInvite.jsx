import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { teamApi } from '../../api/cleaner';
import { useAuthStore } from '../../store/authStore';

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | valid | expired | already_used | error
  const [prefill, setPrefill] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    teamApi.validateToken(token).then(res => {
      const d = res.data;
      if (d.valid) {
        setStatus('valid');
        setPrefill({ name: d.name || '', email: d.email || '' });
        setName(d.name || '');
      } else {
        setStatus(d.reason === 'invalid' ? 'error' : d.reason || 'error');
      }
    }).catch(() => setStatus('error'));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPw) { setError('Passwords do not match'); return; }
    setSaving(true);
    try {
      const res = await teamApi.acceptInvite({ token, name, password });
      if (res.data?.token) {
        localStorage.setItem('turnzy_token', res.data.token);
        setUser(res.data.user);
        navigate('/team');
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create account');
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-8 h-8 bg-coral-400 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg>
          </div>
          <span className="font-black text-[22px] text-gray-800 tracking-tight">Turnzy</span>
        </div>

        {status === 'loading' && (
          <div className="text-center text-gray-400 py-8">Validating invite...</div>
        )}

        {status === 'expired' && (
          <div className="text-center">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Invite expired</h2>
            <p className="text-[14px] text-gray-500 mb-4">This invite link has expired. Ask your team leader to resend it.</p>
            <a href="/login" className="text-coral-400 font-medium hover:text-coral-500">Go to login →</a>
          </div>
        )}

        {status === 'already_used' && (
          <div className="text-center">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Already accepted</h2>
            <p className="text-[14px] text-gray-500 mb-4">You've already accepted this invite. Log in to see your jobs.</p>
            <a href="/login" className="text-coral-400 font-medium hover:text-coral-500">Go to login →</a>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Invalid invite</h2>
            <p className="text-[14px] text-gray-500 mb-4">This invite link isn't valid. Check with your team leader for a new one.</p>
            <a href="/login" className="text-coral-400 font-medium hover:text-coral-500">Go to login →</a>
          </div>
        )}

        {/* Catch-all for any unexpected status — never render blank */}
        {!['loading', 'valid', 'expired', 'already_used', 'error'].includes(status) && (
          <div className="text-center">
            <h2 className="text-[18px] font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-[14px] text-gray-500 mb-4">We couldn't process this invite. Please try again or contact your team leader.</p>
            <a href="/login" className="text-coral-400 font-medium hover:text-coral-500">Go to login →</a>
          </div>
        )}

        {status === 'valid' && (
          <>
            <h2 className="text-[18px] font-bold text-gray-900 mb-1 text-center">Join your team on Turnzy</h2>
            <p className="text-[13px] text-gray-400 text-center mb-6">Create your account to start receiving job assignments.</p>

            {/* Google OAuth option */}
            <a
              href={`${import.meta.env.VITE_BACKEND_URL || ''}/auth/google?role=team_member&team_invite_token=${token}`}
              className="w-full py-2.5 mb-4 bg-white border border-gray-200 text-gray-700 font-medium text-[14px] rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58Z" fill="#EA4335"/></svg>
              Continue with Google
            </a>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[12px] text-gray-400">or create with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
              </div>
              {prefill.email && (
                <div>
                  <label className="text-[12px] text-gray-500 block mb-1">Email</label>
                  <input value={prefill.email} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] bg-gray-50 text-gray-500" />
                </div>
              )}
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
              </div>
              <div>
                <label className="text-[12px] text-gray-500 block mb-1">Confirm password</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm password" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
              </div>
              {password && confirmPw && password !== confirmPw && <div className="text-[12px] text-red-600">Passwords do not match</div>}
              {error && <div className="text-[12px] text-red-600">{error}</div>}
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-coral-400 text-white font-semibold text-[14px] rounded-lg hover:bg-coral-500 disabled:opacity-50 mt-2">
                {saving ? 'Creating account...' : 'Create my account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

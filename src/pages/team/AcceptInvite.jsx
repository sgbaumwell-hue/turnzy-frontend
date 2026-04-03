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
        setStatus(d.reason || 'error');
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
            <p className="text-[14px] text-gray-500 mb-4">This invite link is invalid. Check with your team leader.</p>
            <a href="/login" className="text-coral-400 font-medium hover:text-coral-500">Go to login →</a>
          </div>
        )}

        {status === 'valid' && (
          <>
            <h2 className="text-[18px] font-bold text-gray-900 mb-1 text-center">Join your team on Turnzy</h2>
            <p className="text-[13px] text-gray-400 text-center mb-6">Create your account to start receiving job assignments.</p>

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

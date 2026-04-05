import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import client from '../../api/client';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleTryAgain() {
    setSent(false);
    setEmail('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-warm-200 p-8 shadow-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-coral-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
            <span className="font-bold text-2xl text-warm-800 tracking-tight">Turnzy</span>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-warm-900 mb-2">Check your email</h2>
              <p className="text-sm text-warm-500 mb-4">
                We sent a reset link to <span className="font-medium text-warm-700">{email}</span>. It expires in 1 hour.
              </p>
              <p className="text-xs text-warm-400">
                Didn't get it? Check your spam folder.{' '}
                <button onClick={handleTryAgain} className="text-coral-400 font-medium hover:underline">
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-warm-900 text-center mb-1">Reset your password</h2>
              <p className="text-xs text-warm-400 text-center mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-warm-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-warm-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30 transition-colors" placeholder="you@example.com" />
                </div>
                {error && <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}
                <Button type="submit" fullWidth loading={loading} className="mt-1">{loading ? 'Sending...' : 'Send reset link'}</Button>
              </form>
            </>
          )}

          <div className="mt-4 text-center">
            <a href="/login" className="text-xs text-warm-400 hover:text-warm-600">← Back to sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

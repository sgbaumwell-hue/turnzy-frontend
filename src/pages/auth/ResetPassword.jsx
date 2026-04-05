import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { Card, CardContent } from '@/components/shadcn/card';
import client from '../../api/client';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  function validate() {
    const errors = {};
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      await client.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.';
      if (err.response?.status === 400 && msg.includes('expired')) {
        setExpired(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // Missing token
  if (!token) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="rounded-2xl border-warm-200 shadow-sm"><CardContent className="p-8">
            <div className="flex items-center justify-center gap-2.5 mb-8">
              <div className="w-9 h-9 bg-coral-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
              <span className="font-bold text-2xl text-warm-800 tracking-tight">Turnzy</span>
            </div>
            <div className="text-center">
              <AlertCircle size={48} className="text-warm-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-warm-900 mb-2">Invalid link</h2>
              <p className="text-sm text-warm-500 mb-4">This reset link is missing or malformed. Try requesting a new one.</p>
              <a href="/forgot-password" className="text-sm text-coral-400 font-medium hover:underline">Request new link →</a>
            </div>
          </CardContent></Card>
        </div>
      </div>
    );
  }

  // Expired/used token
  if (expired) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="rounded-2xl border-warm-200 shadow-sm"><CardContent className="p-8">
            <div className="flex items-center justify-center gap-2.5 mb-8">
              <div className="w-9 h-9 bg-coral-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
              <span className="font-bold text-2xl text-warm-800 tracking-tight">Turnzy</span>
            </div>
            <div className="text-center">
              <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-warm-900 mb-2">Link expired</h2>
              <p className="text-sm text-warm-500 mb-4">Reset links are valid for 1 hour and can only be used once.</p>
              <a href="/forgot-password" className="text-sm text-coral-400 font-medium hover:underline">Request a new link →</a>
            </div>
          </CardContent></Card>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="rounded-2xl border-warm-200 shadow-sm"><CardContent className="p-8">
            <div className="flex items-center justify-center gap-2.5 mb-8">
              <div className="w-9 h-9 bg-coral-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
              <span className="font-bold text-2xl text-warm-800 tracking-tight">Turnzy</span>
            </div>
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-warm-900 mb-2">Password updated!</h2>
              <p className="text-sm text-warm-500 mb-4">You can now sign in with your new password.</p>
              <a href="/login" className="text-sm text-coral-400 font-medium hover:underline">Go to sign in →</a>
            </div>
          </CardContent></Card>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="rounded-2xl border-warm-200 shadow-sm"><CardContent className="p-8">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-coral-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" fill="white"/></svg></div>
            <span className="font-bold text-2xl text-warm-800 tracking-tight">Turnzy</span>
          </div>
          <h2 className="text-lg font-semibold text-warm-900 text-center mb-1">Set a new password</h2>
          <p className="text-xs text-warm-400 text-center mb-6">Must be at least 8 characters.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="password" className="mb-1.5">New password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-danger-600 mt-1">{fieldErrors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirm" className="mb-1.5">Confirm password</Label>
              <div className="relative">
                <Input id="confirm" type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({ ...prev, confirm: undefined })); }} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirm && <p className="text-xs text-danger-600 mt-1">{fieldErrors.confirm}</p>}
            </div>
            {error && <p className="text-xs text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" fullWidth loading={loading} className="mt-1">{loading ? 'Saving...' : 'Set new password'}</Button>
          </form>
          <div className="mt-4 text-center">
            <a href="/login" className="text-xs text-warm-400 hover:text-warm-600">← Back to sign in</a>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';
import { useToast } from '../components/Toast';

export function Security() {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const hasPassword = user?.has_password !== false;

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSavePassword() {
    setPwError(null);
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setSaving(true);
    try {
      if (hasPassword) {
        await authApi.updatePassword(currentPw, newPw, confirmPw);
      } else {
        // Set password for OAuth users
        try {
          await authApi.updatePassword('', newPw, confirmPw);
        } catch {
          // Fallback: POST /account/set-password
          const client = (await import('../../../api/client')).default;
          await client.post('/account/set-password', { new_password: newPw, confirm_password: confirmPw });
        }
      }
      toast('Password updated');
      setShowPwForm(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) {
      setPwError(e.response?.data?.error || 'Failed to update password');
    }
    setSaving(false);
  }

  async function handleDeactivate() {
    if (!confirm('Deactivate your account? You can reactivate anytime by logging back in.')) return;
    try {
      await authApi.deactivate();
      clearUser();
      localStorage.removeItem('turnzy_token');
      navigate('/login');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to deactivate', 'error');
    }
  }

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Security</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage your password and account.</p>

      {/* Password */}
      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between py-3 px-4">
          <div>
            <div className="text-[12px] text-warm-400">Password</div>
            <div className="text-[14px] font-medium text-warm-900 mt-0.5">••••••••</div>
          </div>
          <button onClick={() => setShowPwForm(!showPwForm)} className="text-[12px] text-coral-400 font-medium hover:text-coral-500">
            {hasPassword ? 'Change' : 'Set password'}
          </button>
        </div>
        {showPwForm && (
          <div className="px-4 pb-4 space-y-2">
            {hasPassword && (
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
            )}
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (8+ characters)" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
            {newPw && confirmPw && newPw !== confirmPw && <div className="text-[12px] text-red-600">Passwords do not match</div>}
            {newPw && newPw.length > 0 && newPw.length < 8 && <div className="text-[12px] text-red-600">Must be at least 8 characters</div>}
            {pwError && <div className="text-[12px] text-red-600">{pwError}</div>}
            <div className="flex gap-2">
              <button onClick={handleSavePassword} disabled={saving} className="px-4 py-1.5 bg-coral-400 text-white text-[13px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setShowPwForm(false)} className="px-4 py-1.5 border border-warm-200 text-[13px] font-medium rounded-lg text-warm-600 hover:bg-warm-50">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
        <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-3">Danger Zone</div>
        <button
          onClick={handleDeactivate}
          className="w-full py-2.5 border border-warm-300 rounded-lg text-[13px] font-medium text-warm-600 hover:bg-white transition-colors mb-3"
        >
          Deactivate account
        </button>
        <button
          onClick={() => navigate('/account/delete-confirm')}
          className="block mx-auto text-[12px] text-red-600 hover:text-red-700 font-medium"
        >
          Permanently delete account
        </button>
      </div>
    </div>
  );
}

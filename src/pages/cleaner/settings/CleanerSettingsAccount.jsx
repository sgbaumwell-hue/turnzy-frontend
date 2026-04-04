import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';
import { settingsApi } from '../../../api/settings';
import { InlineEditField } from '../../settings/components/InlineEditField';

const LANGUAGES = [
  'English', 'Español', '中文', 'Tagalog', 'Tiếng Việt', 'العربية',
  'Français', '한국어', 'Русский', 'Kreyòl ayisyen', 'Português',
];

export function CleanerSettingsAccount() {
  const { user, setUser, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const hasPassword = user?.has_password !== false;

  const [language, setLanguage] = useState(user?.preferred_language || 'English');
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function handleSaveName(name) {
    await authApi.updateName(name);
    setUser({ ...user, name });
    showToast('Name updated');
  }

  async function handleSaveEmail(email, extras) {
    await authApi.updateEmail(email, extras.current_password || '');
    showToast('Confirmation email sent to ' + email);
  }

  async function handleLanguageChange(lang) {
    setLanguage(lang);
    try {
      await settingsApi.updateLanguage(lang);
      setUser({ ...user, preferred_language: lang });
      showToast('Language updated');
    } catch { showToast('Failed to update language'); }
  }

  async function handleSavePassword() {
    setPwError(null);
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    setSaving(true);
    try {
      if (hasPassword) {
        await authApi.updatePassword(currentPw, newPw, confirmPw);
      } else {
        try { await authApi.updatePassword('', newPw, confirmPw); }
        catch {
          const client = (await import('../../../api/client')).default;
          await client.post('/account/set-password', { new_password: newPw, confirm_password: confirmPw });
        }
      }
      showToast('Password updated');
      setShowPwForm(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) { setPwError(e.response?.data?.error || 'Failed to update password'); }
    setSaving(false);
  }

  async function handleDeactivate() {
    if (!confirm('Deactivate your account? You can reactivate anytime by logging back in.')) return;
    try {
      await authApi.deactivate();
      clearUser(); localStorage.removeItem('turnzy_token'); navigate('/login');
    } catch (e) { alert(e.response?.data?.error || 'Failed to deactivate'); }
  }

  return (
    <div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-1">Account</h2>
      <p className="text-[13px] text-gray-400 mb-6">Manage your profile, security, and account settings.</p>

      {/* Profile */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Profile</span>
        </div>
        <InlineEditField label="Name" value={user?.name || ''} onSave={handleSaveName} />
        <InlineEditField label="Email" value={user?.email || ''} type="email" onSave={handleSaveEmail}
          extraFields={[{ name: 'current_password', type: 'password', placeholder: 'Current password' }]} />
        <div className="py-3 px-4 border-t border-gray-100">
          <div className="text-[12px] text-gray-400 mb-2">Language</div>
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-coral-400 cursor-pointer">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <hr className="my-6 border-gray-100" />

      {/* Security */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Security</span>
        </div>
        {hasPassword ? (
          <>
            <div className="flex items-center justify-between py-3 px-4">
              <div>
                <div className="text-[12px] text-gray-400">Password</div>
                <div className="text-[14px] font-medium text-gray-900 mt-0.5">••••••••</div>
              </div>
              <button onClick={() => setShowPwForm(!showPwForm)} className="text-[12px] text-coral-400 font-medium hover:text-coral-500">
                Change
              </button>
            </div>
            {showPwForm && (
              <div className="px-4 pb-4 space-y-2">
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" className="w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (8+ characters)" className="w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
                {newPw && confirmPw && newPw !== confirmPw && <div className="text-[12px] text-red-600">Passwords do not match</div>}
                {newPw && newPw.length > 0 && newPw.length < 8 && <div className="text-[12px] text-red-600">Must be at least 8 characters</div>}
                {pwError && <div className="text-[12px] text-red-600">{pwError}</div>}
                <div className="flex gap-2">
                  <button onClick={handleSavePassword} disabled={saving} className="px-4 py-1.5 bg-coral-400 text-white text-[13px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setShowPwForm(false)} className="px-4 py-1.5 border border-gray-200 text-[13px] font-medium rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-3 px-4 text-[13px] text-gray-500">
            You signed in with Google. Password login is not available for this account.
          </div>
        )}
      </div>

      <hr className="my-6 border-gray-100" />

      {/* Danger Zone */}
      <div className="border border-red-100 bg-red-50 rounded-lg p-4">
        <div className="text-sm font-semibold text-red-600 mb-3">Danger Zone</div>
        <button onClick={handleDeactivate}
          className="border border-gray-300 bg-white text-gray-600 rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-gray-50 transition-colors mb-3 block">
          Deactivate account
        </button>
        <button onClick={() => navigate('/account/delete-confirm')}
          className="text-[12px] text-red-600 hover:text-red-700 font-medium">
          Permanently delete account
        </button>
      </div>

      {toast && <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-[13px] px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>}
    </div>
  );
}

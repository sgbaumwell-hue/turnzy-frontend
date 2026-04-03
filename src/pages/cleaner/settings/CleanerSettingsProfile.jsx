import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';
import { settingsApi } from '../../../api/settings';
import { InlineEditField } from '../../settings/components/InlineEditField';

const LANGUAGES = [
  'English', 'Español', '中文', 'Tagalog', 'Tiếng Việt', 'العربية',
  'Français', '한국어', 'Русский', 'Kreyòl ayisyen', 'Português',
];

export function CleanerSettingsProfile() {
  const { user, setUser } = useAuthStore();
  const [language, setLanguage] = useState(user?.preferred_language || 'English');
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

  return (
    <div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-1">Profile</h2>
      <p className="text-[13px] text-gray-400 mb-5">Manage your personal information.</p>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
        <InlineEditField label="Name" value={user?.name || ''} onSave={handleSaveName} />
        <InlineEditField label="Email" value={user?.email || ''} type="email" onSave={handleSaveEmail}
          extraFields={[{ name: 'current_password', type: 'password', placeholder: 'Current password' }]} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="py-3 px-4">
          <div className="text-[12px] text-gray-400 mb-2">Language</div>
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-[14px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-coral-400 cursor-pointer">
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {toast && <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-[13px] px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
    </div>
  );
}

import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { authApi } from '../../../api/auth';
import { settingsApi } from '../../../api/settings';
import { InlineEditField } from '../components/InlineEditField';
import { useToast } from '../components/Toast';

const LANGUAGES = [
  'English', 'Español', '中文', 'Tagalog', 'Tiếng Việt', 'العربية',
  'Français', '한국어', 'Русский', 'Kreyòl ayisyen', 'Português',
];

export function Profile() {
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const [language, setLanguage] = useState(user?.preferred_language || 'English');

  async function handleSaveName(name) {
    await authApi.updateName(name);
    setUser({ ...user, name });
    toast('Name updated');
  }

  async function handleSaveEmail(email, extras) {
    await authApi.updateEmail(email, extras.current_password || '');
    toast('Confirmation email sent to ' + email);
  }

  async function handleLanguageChange(lang) {
    setLanguage(lang);
    try {
      await settingsApi.updateLanguage(lang);
      setUser({ ...user, preferred_language: lang });
      toast('Language updated');
    } catch {
      toast('Failed to update language', 'error');
    }
  }

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Profile</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage your personal information.</p>

      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden mb-4">
        <InlineEditField
          label="Name"
          value={user?.name || ''}
          onSave={handleSaveName}
        />
        <InlineEditField
          label="Email"
          value={user?.email || ''}
          type="email"
          onSave={handleSaveEmail}
          extraFields={[{ name: 'current_password', type: 'password', placeholder: 'Current password' }]}
        />
      </div>

      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden">
        <div className="py-3 px-4">
          <div className="text-[12px] text-warm-400 mb-2">Language</div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] text-warm-900 bg-white focus:outline-none focus:ring-2 focus:ring-coral-400 cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

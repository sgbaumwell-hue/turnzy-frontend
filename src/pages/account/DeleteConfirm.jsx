import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

export function DeleteConfirm() {
  const navigate = useNavigate();
  const { clearUser } = useAuthStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await authApi.delete('DELETE');
      clearUser();
      localStorage.removeItem('turnzy_token');
      navigate('/login');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete account');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-50 p-4">
      <div className="bg-white border border-warm-200 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h1 className="text-[20px] font-bold text-warm-900">Delete Account</h1>
        </div>

        <p className="text-[14px] text-warm-600 mb-4">
          This action is permanent and cannot be undone. The following will be deleted:
        </p>
        <ul className="text-[13px] text-warm-600 mb-4 space-y-1 pl-4 list-disc">
          <li>All your properties and calendar connections</li>
          <li>All booking history and turnover records</li>
          <li>Cleaner assignments and notification settings</li>
          <li>Your account and personal information</li>
        </ul>

        <div className="mb-4">
          <label className="text-[13px] text-warm-600 block mb-1">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        {error && <div className="text-[13px] text-red-600 mb-3">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={input !== 'DELETE' || loading}
            className="flex-1 py-2.5 bg-red-600 text-white text-[14px] font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Permanently Delete Account'}
          </button>
          <button
            onClick={() => navigate('/settings/security')}
            className="px-4 py-2.5 border border-warm-200 text-[14px] font-medium rounded-lg text-warm-600 hover:bg-warm-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

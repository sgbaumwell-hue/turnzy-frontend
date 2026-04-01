import { useState } from 'react';
import { Pencil } from 'lucide-react';

export function InlineEditField({ label, value, onSave, type = 'text', extraFields, displayValue }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');
  const [extras, setExtras] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      await onSave(val, extras);
      setEditing(false);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-3 px-4 border-b border-warm-100 last:border-b-0">
        <div>
          <div className="text-[12px] text-warm-400">{label}</div>
          <div className="text-[14px] font-medium text-warm-900 mt-0.5">{displayValue || value || '—'}</div>
        </div>
        <button onClick={() => { setVal(value || ''); setEditing(true); }} className="text-[12px] text-coral-400 font-medium hover:text-coral-500 flex items-center gap-1">
          <Pencil size={12} /> Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-3 px-4 border-b border-warm-100 last:border-b-0">
      <div className="text-[12px] text-warm-400 mb-2">{label}</div>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] text-warm-900 focus:outline-none focus:ring-2 focus:ring-coral-400 mb-2"
        autoFocus
      />
      {extraFields?.map(f => (
        <input
          key={f.name}
          type={f.type || 'text'}
          placeholder={f.placeholder}
          value={extras[f.name] || ''}
          onChange={(e) => setExtras(prev => ({ ...prev, [f.name]: e.target.value }))}
          className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[14px] text-warm-900 focus:outline-none focus:ring-2 focus:ring-coral-400 mb-2"
        />
      ))}
      {error && <div className="text-[12px] text-red-600 mb-2">{error}</div>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading} className="px-4 py-1.5 rounded-lg bg-coral-400 text-white text-[13px] font-medium hover:bg-coral-500 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => { setEditing(false); setError(null); }} className="px-4 py-1.5 rounded-lg border border-warm-200 text-[13px] font-medium text-warm-600 hover:bg-warm-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

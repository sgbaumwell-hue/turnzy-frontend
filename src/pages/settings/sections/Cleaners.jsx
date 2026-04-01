import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, ArrowUpDown, ArrowUp } from 'lucide-react';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';

function StatusBadge({ property, role }) {
  const hasUserId = role === 'primary' ? property.cleaner_user_id : property.backup_cleaner_user_id;
  const confirmed = role === 'primary' ? property.cleaner_confirmed : false;
  const hasEmail = role === 'primary' ? property.cleaner_email : property.backup_cleaner_email;
  const name = role === 'primary' ? property.cleaner_name : property.backup_cleaner_name;

  if (!name && !hasEmail) return <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warm-400"><span className="w-1.5 h-1.5 rounded-full bg-warm-300" /> No cleaner assigned</span>;
  if (hasUserId && confirmed) return <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected</span>;
  if (hasUserId && !confirmed) return <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Awaiting confirmation</span>;
  if (!hasUserId && hasEmail) return <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Invite pending</span>;
  return null;
}

function CleanerCard({ property, role, onRefresh }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const isPrimary = role === 'primary';
  const name = isPrimary ? property.cleaner_name : property.backup_cleaner_name;
  const email = isPrimary ? property.cleaner_email : property.backup_cleaner_email;
  const phone = isPrimary ? property.cleaner_phone : property.backup_cleaner_phone;
  const notifDays = property.notification_window_days;

  const [formName, setFormName] = useState(name || '');
  const [formEmail, setFormEmail] = useState(email || '');
  const [formPhone, setFormPhone] = useState(phone || '');
  const [notifMethod, setNotifMethod] = useState(phone ? 'both' : 'email');
  const [loading, setLoading] = useState(null);

  const hasUserId = isPrimary ? property.cleaner_user_id : property.backup_cleaner_user_id;
  const confirmed = isPrimary ? property.cleaner_confirmed : false;
  const showResend = (hasUserId && !confirmed) || (!hasUserId && email);

  async function save() {
    setLoading('save');
    try {
      if (isPrimary) {
        await settingsApi.updateCleaner({ property_id: property.id, name: formName, email: formEmail, phone: formPhone, notification_method: notifMethod, role: 'primary' });
      } else {
        await settingsApi.saveBackupCleaner({ property_id: property.id, name: formName, email: formEmail, phone: formPhone, notification_method: notifMethod });
      }
      toast(`${isPrimary ? 'Primary' : 'Backup'} cleaner updated`);
      setEditing(false);
      onRefresh();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to save', 'error');
    }
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${name || 'this cleaner'} as ${role} cleaner?`)) return;
    setLoading('delete');
    try {
      await settingsApi.deleteCleaner(property.id, role);
      toast('Cleaner removed');
      onRefresh();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to remove', 'error');
    }
    setLoading(null);
  }

  async function resendInvite() {
    setLoading('resend');
    try {
      await settingsApi.resendInvite(property.id);
      toast('Invite resent');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to resend', 'error');
    }
    setLoading(null);
  }

  async function swapCleaners() {
    setLoading('swap');
    try {
      await settingsApi.swapCleaners(property.id);
      toast('Cleaners swapped');
      onRefresh();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to swap', 'error');
    }
    setLoading(null);
  }

  async function promoteBackup() {
    setLoading('promote');
    try {
      await settingsApi.promoteBackup(property.id);
      toast('Backup promoted to primary');
      onRefresh();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to promote', 'error');
    }
    setLoading(null);
  }

  return (
    <div className="border border-warm-100 rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider">{isPrimary ? 'Primary Cleaner' : 'Backup Cleaner'}</div>
        <StatusBadge property={property} role={role} />
      </div>

      {!name && !editing ? (
        <div>
          <span className="text-[13px] text-warm-400">No cleaner assigned</span>
          <button onClick={() => setEditing(true)} className="ml-3 text-[12px] text-coral-400 font-medium hover:text-coral-500">Add cleaner</button>
        </div>
      ) : !editing ? (
        <div>
          <div className="text-[14px] font-medium text-warm-900">{name}</div>
          {email && <div className="text-[12px] text-warm-400 mt-0.5">{email}{phone ? ` · ${phone}` : ''}</div>}
          {notifDays != null && isPrimary && <div className="text-[12px] text-warm-400 mt-0.5">Notified {notifDays === 0 ? 'as soon as detected' : `${notifDays} days before turnover`}</div>}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-700 hover:bg-warm-50"><Pencil size={12} /> Edit</button>
            <button onClick={handleDelete} disabled={loading === 'delete'} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={12} /> Delete</button>
            {showResend && <button onClick={resendInvite} disabled={loading === 'resend'} className="px-3 py-1.5 border border-coral-300 text-[12px] font-medium rounded-lg text-coral-500 hover:bg-coral-50 disabled:opacity-50">Resend invite</button>}
            {!isPrimary && name && (
              <>
                {property.cleaner_name ? (
                  <button onClick={swapCleaners} disabled={loading === 'swap'} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-600 hover:bg-warm-50 disabled:opacity-50"><ArrowUpDown size={12} /> Swap with primary</button>
                ) : (
                  <button onClick={promoteBackup} disabled={loading === 'promote'} className="flex items-center gap-1 px-3 py-1.5 border border-green-300 text-[12px] font-medium rounded-lg text-green-700 hover:bg-green-50 disabled:opacity-50"><ArrowUp size={12} /> Promote to primary</button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
          <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
          <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Phone (optional)" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-warm-500">Notify via:</span>
            {['email', 'sms', 'both'].map(m => (
              <label key={m} className="flex items-center gap-1 text-[12px] text-warm-700 cursor-pointer">
                <input type="radio" name={`notif-${property.id}-${role}`} value={m} checked={notifMethod === m} onChange={() => setNotifMethod(m)} className="accent-coral-400" />
                {m === 'email' ? 'Email' : m === 'sms' ? 'SMS' : 'Both'}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={loading === 'save'} className="px-4 py-1.5 bg-coral-400 text-white text-[12px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">{loading === 'save' ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditing(false)} className="px-4 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-600 hover:bg-warm-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Cleaners() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  }

  const properties = data?.data?.properties || data?.data || [];

  if (isLoading) return <div className="text-warm-400 text-sm">Loading...</div>;

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Cleaners</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage cleaners assigned to each property.</p>

      {properties.length === 0 && (
        <div className="bg-white border border-warm-200 rounded-xl p-6 text-center text-warm-400 text-[14px]">
          No properties yet. Add a property first to assign cleaners.
        </div>
      )}

      {properties.map(p => (
        <div key={p.id} className="mb-6">
          <h3 className="text-[15px] font-semibold text-warm-800 mb-2">{p.name}</h3>
          <CleanerCard property={p} role="primary" onRefresh={refresh} />
          <CleanerCard property={p} role="backup" onRefresh={refresh} />
        </div>
      ))}
    </div>
  );
}

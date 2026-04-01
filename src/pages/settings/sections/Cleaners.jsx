import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, Plus } from 'lucide-react';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';

function StatusDot({ status }) {
  const map = {
    connected: { color: 'bg-green-500', label: 'Connected', textColor: 'text-green-700' },
    awaiting: { color: 'bg-amber-500', label: 'Awaiting confirmation', textColor: 'text-amber-700' },
    pending: { color: 'bg-amber-500', label: 'Invite pending', textColor: 'text-amber-700' },
    none: { color: 'bg-warm-300', label: 'No cleaner assigned', textColor: 'text-warm-400' },
  };
  const s = map[status] || map.none;
  return <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${s.textColor}`}><span className={`w-1.5 h-1.5 rounded-full ${s.color}`} /> {s.label}</span>;
}

function getCleanerStatus(property, role) {
  const isPrimary = role === 'primary';
  const hasUserId = isPrimary ? property.cleaner_user_id : property.backup_cleaner_user_id;
  const confirmed = isPrimary ? property.cleaner_confirmed : false;
  const hasEmail = isPrimary ? property.cleaner_email : property.backup_cleaner_email;
  const name = isPrimary ? property.cleaner_name : property.backup_cleaner_name;
  if (!name && !hasEmail) return 'none';
  if (hasUserId && confirmed) return 'connected';
  if (hasUserId && !confirmed) return 'awaiting';
  if (!hasUserId && hasEmail) return 'pending';
  return 'none';
}

function CleanerCard({ property, role, onRefresh }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const isPrimary = role === 'primary';
  const name = isPrimary ? property.cleaner_name : property.backup_cleaner_name;
  const email = isPrimary ? property.cleaner_email : property.backup_cleaner_email;
  const phone = isPrimary ? property.cleaner_phone : property.backup_cleaner_phone;
  const status = getCleanerStatus(property, role);

  const [formName, setFormName] = useState(name || '');
  const [formEmail, setFormEmail] = useState(email || '');
  const [formPhone, setFormPhone] = useState(phone || '');
  const [notifMethod, setNotifMethod] = useState(phone ? 'both' : 'email');
  const [loading, setLoading] = useState(null);

  const showResend = status === 'awaiting' || status === 'pending';

  async function save() {
    setLoading('save');
    try {
      if (isPrimary) {
        await settingsApi.updateCleaner({ property_id: property.id, name: formName, email: formEmail, phone: formPhone, notification_method: notifMethod, role: 'primary' });
      } else {
        await settingsApi.saveBackupCleaner({ property_id: property.id, name: formName, email: formEmail, phone: formPhone, notification_method: notifMethod });
      }
      toast('Cleaner updated'); setEditing(false); onRefresh();
    } catch (e) { toast(e.response?.data?.error || 'Failed to save', 'error'); }
    setLoading(null);
  }
  async function handleDelete() {
    if (!confirm(`Remove ${name || 'this cleaner'}?`)) return;
    setLoading('delete');
    try { await settingsApi.deleteCleaner(property.id, role); toast('Removed'); onRefresh(); }
    catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }
  async function resendInvite() {
    setLoading('resend');
    try { await settingsApi.resendInvite(property.id); toast('Invite resent'); }
    catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }
  async function swapCleaners() {
    setLoading('swap');
    try { await settingsApi.swapCleaners(property.id); toast('Swapped'); onRefresh(); }
    catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }
  async function promoteBackup() {
    setLoading('promote');
    try { await settingsApi.promoteBackup(property.id); toast('Promoted'); onRefresh(); }
    catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  if (!name && !editing) {
    return (
      <div className="bg-white border border-warm-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider">{isPrimary ? 'Primary' : 'Backup'} Cleaner</div>
          <StatusDot status="none" />
        </div>
        <div className="text-[13px] text-warm-400 mb-1">{property.name}</div>
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[12px] text-coral-400 font-medium hover:text-coral-500 mt-2"><Plus size={13} /> Add cleaner</button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-warm-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider">{isPrimary ? 'Primary' : 'Backup'} Cleaner</div>
        <StatusDot status={status} />
      </div>
      {!editing ? (
        <>
          <div className="text-[15px] font-semibold text-warm-900">{name}</div>
          {email && <div className="text-[12px] text-warm-400 mt-0.5">{email}</div>}
          <div className="text-[12px] text-warm-400 mt-0.5">{property.name}</div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-700 hover:bg-warm-50"><Pencil size={12} /> Edit</button>
            <button onClick={handleDelete} disabled={loading === 'delete'} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={12} /> Delete</button>
            {showResend && <button onClick={resendInvite} disabled={loading === 'resend'} className="px-3 py-1.5 border border-coral-300 text-[12px] font-medium rounded-lg text-coral-500 hover:bg-coral-50 disabled:opacity-50">Resend invite</button>}
            {!isPrimary && name && (
              property.cleaner_name
                ? <button onClick={swapCleaners} disabled={loading === 'swap'} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-600 hover:bg-warm-50 disabled:opacity-50"><ArrowUpDown size={12} /> Swap</button>
                : <button onClick={promoteBackup} disabled={loading === 'promote'} className="flex items-center gap-1 px-3 py-1.5 border border-green-300 text-[12px] font-medium rounded-lg text-green-700 hover:bg-green-50 disabled:opacity-50"><ArrowUp size={12} /> Promote</button>
            )}
          </div>
        </>
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

function UnassignedCleanerCard() {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [notifMethod, setNotifMethod] = useState('email');
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await settingsApi.updateCleaner({ property_id: null, name: formName, email: formEmail, notification_method: notifMethod, role: 'primary' });
      toast('Cleaner added');
      setEditing(false); setFormName(''); setFormEmail('');
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to add cleaner', 'error');
    }
    setLoading(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="border-2 border-dashed border-warm-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-warm-400 hover:text-coral-400 hover:border-coral-300 transition-colors min-h-[140px]"
      >
        <Plus size={24} />
        <span className="text-[14px] font-medium">Add cleaner</span>
      </button>
    );
  }

  return (
    <div className="bg-white border border-warm-200 rounded-lg shadow-sm p-6">
      <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-2">New Cleaner</div>
      <div className="text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
        This cleaner isn't linked to a property yet. You can link them after adding a property.
      </div>
      <div className="space-y-2">
        <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" autoFocus />
        <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-warm-500">Notify via:</span>
          {['email', 'sms', 'both'].map(m => (
            <label key={m} className="flex items-center gap-1 text-[12px] text-warm-700 cursor-pointer">
              <input type="radio" name="notif-unassigned" value={m} checked={notifMethod === m} onChange={() => setNotifMethod(m)} className="accent-coral-400" />
              {m === 'email' ? 'Email' : m === 'sms' ? 'SMS' : 'Both'}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={loading} className="px-4 py-1.5 bg-coral-400 text-white text-[12px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          <button onClick={() => setEditing(false)} className="px-4 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-600 hover:bg-warm-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function Cleaners() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: () => propertiesApi.getAll() });

  function refresh() { queryClient.invalidateQueries({ queryKey: ['properties'] }); }
  const properties = data?.data?.properties || data?.data || [];

  if (isLoading) return <div className="text-warm-400 text-sm">Loading...</div>;

  // Build flat cleaner card list
  const cleanerCards = [];
  properties.forEach(p => {
    cleanerCards.push({ property: p, role: 'primary', key: `${p.id}-primary` });
    if (p.backup_cleaner_name || p.backup_cleaner_email) {
      cleanerCards.push({ property: p, role: 'backup', key: `${p.id}-backup` });
    }
  });

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Cleaners</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage cleaners assigned to each property.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cleanerCards.map(c => <CleanerCard key={c.key} property={c.property} role={c.role} onRefresh={refresh} />)}
        <UnassignedCleanerCard />
      </div>
    </div>
  );
}

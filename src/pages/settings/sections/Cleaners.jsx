import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus, Users, X as XIcon } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Badge } from '@/components/shadcn/badge';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';

// Build cleaner-first data from properties
function buildCleanerList(properties) {
  const cleanerMap = {};
  for (const p of properties) {
    // Primary cleaner
    if (p.cleaner_name || p.cleaner_email) {
      const key = p.cleaner_email || p.cleaner_name;
      if (!cleanerMap[key]) {
        cleanerMap[key] = {
          name: p.cleaner_name,
          email: p.cleaner_email,
          userId: p.cleaner_user_id,
          confirmed: p.cleaner_confirmed,
          properties: [],
          role: 'primary',
        };
      }
      cleanerMap[key].properties.push({ id: p.id, name: p.name, role: 'primary' });
    }
    // Backup cleaner
    if (p.backup_cleaner_name || p.backup_cleaner_email) {
      const key = p.backup_cleaner_email || p.backup_cleaner_name;
      if (!cleanerMap[key]) {
        cleanerMap[key] = {
          name: p.backup_cleaner_name,
          email: p.backup_cleaner_email,
          userId: p.backup_cleaner_user_id,
          confirmed: false,
          properties: [],
          role: 'backup',
        };
      }
      cleanerMap[key].properties.push({ id: p.id, name: p.name, role: 'backup' });
    }
  }
  return Object.values(cleanerMap);
}

function CleanerFirstCard({ cleaner, allProperties, onRefresh }) {
  const toast = useToast();
  const [loading, setLoading] = useState(null);
  const [showAddProp, setShowAddProp] = useState(false);

  const isActive = cleaner.userId && cleaner.confirmed;
  const isInvited = !isActive && cleaner.email;
  const coveredIds = new Set(cleaner.properties.map(p => p.id));
  const uncoveredProps = allProperties.filter(p => !coveredIds.has(p.id));

  async function handleRemoveFromProperty(propId) {
    if (!confirm(`Remove ${cleaner.name || cleaner.email} from this property?`)) return;
    setLoading(`remove-${propId}`);
    try {
      await settingsApi.deleteCleaner(propId, cleaner.role);
      toast('Removed'); onRefresh();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  async function handleAssignToProperty(propId) {
    setLoading(`assign-${propId}`);
    try {
      await settingsApi.updateCleaner({
        property_id: propId,
        name: cleaner.name || '',
        email: cleaner.email || '',
        notification_method: 'email',
        role: 'primary',
      });
      toast('Assigned'); setShowAddProp(false); onRefresh();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  async function handleResend() {
    if (!cleaner.properties.length) return;
    setLoading('resend');
    try {
      await settingsApi.resendInvite(cleaner.properties[0].id);
      toast('Invite resent');
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  async function handleRemoveCleaner() {
    if (!confirm(`Remove ${cleaner.name || cleaner.email} from all properties?`)) return;
    setLoading('remove-all');
    try {
      for (const p of cleaner.properties) {
        await settingsApi.deleteCleaner(p.id, p.role);
      }
      toast('Removed'); onRefresh();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      {/* Header row: status + actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Badge variant="success" className="text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />Active
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />Invite sent
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          {isInvited && !isActive && (
            <Button size="sm" variant="ghost" onClick={handleResend} disabled={loading === 'resend'}
              className="text-[11px] h-7 text-coral-400">Resend invite</Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleRemoveCleaner} disabled={loading === 'remove-all'}
            className="text-[11px] h-7 text-gray-400 hover:text-red-500">
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      {/* Name + email */}
      <div className="mb-3">
        {cleaner.name && <div className="text-[15px] font-semibold text-gray-900">{cleaner.name}</div>}
        {cleaner.email && <div className="text-[13px] text-gray-400 mt-0.5">{cleaner.email}</div>}
      </div>

      {/* Property pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-gray-400 font-medium mr-1">Covers:</span>
        {cleaner.properties.map(p => (
          <span key={p.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded">
            {p.name}
            <button onClick={() => handleRemoveFromProperty(p.id)} disabled={loading === `remove-${p.id}`}
              className="text-gray-400 hover:text-red-500 -mr-0.5">
              <XIcon size={10} />
            </button>
          </span>
        ))}
        {uncoveredProps.length > 0 && !showAddProp && (
          <button onClick={() => setShowAddProp(true)}
            className="text-[11px] text-coral-400 font-medium hover:underline">+ Add property</button>
        )}
      </div>

      {/* Add property dropdown */}
      {showAddProp && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
          {uncoveredProps.map(p => (
            <button key={p.id} onClick={() => handleAssignToProperty(p.id)}
              disabled={loading === `assign-${p.id}`}
              className="w-full text-left text-[13px] text-gray-700 px-2 py-1.5 rounded hover:bg-white transition-colors">
              {p.name}
            </button>
          ))}
          <button onClick={() => setShowAddProp(false)}
            className="w-full text-left text-[11px] text-gray-400 px-2 py-1 mt-1">Cancel</button>
        </div>
      )}
    </div>
  );
}

function AddCleanerCard({ properties, onRefresh }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=button, 1=form, 2=property selection
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [selectedProps, setSelectedProps] = useState([]);
  const [propError, setPropError] = useState('');
  const [loading, setLoading] = useState(false);

  // No properties guard
  if (step === 1 && properties.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
        <Users size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-[14px] font-medium text-gray-700 mb-1">Add a property first</p>
        <p className="text-[12px] text-gray-400 mb-3">You need at least one property before inviting a cleaner.</p>
        <Button size="sm" variant="outline" onClick={() => navigate('/settings/properties')}>
          Go to Properties →
        </Button>
      </div>
    );
  }

  if (step === 0) {
    return (
      <button onClick={() => setStep(1)}
        className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-coral-400 hover:border-coral-300 transition-colors min-h-[140px]">
        <Plus size={24} />
        <span className="text-[14px] font-medium">Add cleaner</span>
      </button>
    );
  }

  async function handleStep1() {
    if (!formName.trim() || !formEmail.trim()) return;
    // If only 1 property, skip step 2
    if (properties.length === 1) {
      setSelectedProps([properties[0].id]);
      await submitCleaner([properties[0].id]);
    } else {
      setStep(2);
    }
  }

  async function submitCleaner(propIds) {
    if (propIds.length === 0) {
      setPropError('Select at least one property.');
      return;
    }
    setPropError('');
    setLoading(true);
    try {
      // Assign to first property, then add to additional
      for (let i = 0; i < propIds.length; i++) {
        await settingsApi.updateCleaner({
          property_id: propIds[i],
          name: formName,
          email: formEmail,
          notification_method: 'email',
          role: 'primary',
        });
      }
      toast(`Invite sent to ${formEmail}`);
      setStep(0); setFormName(''); setFormEmail(''); setSelectedProps([]);
      onRefresh();
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to add cleaner', 'error');
    }
    setLoading(false);
  }

  function toggleProp(propId) {
    setPropError('');
    setSelectedProps(prev =>
      prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId]
    );
  }

  if (step === 1) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Step 1 — Who is your cleaner?</div>
        <div className="space-y-2">
          <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" autoFocus />
          <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email" type="email" />
          <div className="text-[12px] text-gray-400">Notifications sent by email</div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleStep1} disabled={!formName.trim() || !formEmail.trim()} loading={loading && properties.length === 1}>
              {properties.length === 1 ? 'Send invite' : 'Next'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setStep(0); setFormName(''); setFormEmail(''); }}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Step 2 — Which properties?</div>
        <p className="text-[13px] text-gray-600 mb-3">Which properties should {formName} cover?</p>
        <div className="space-y-1.5 mb-3">
          {properties.map(p => {
            const hasPrimary = p.cleaner_name && p.cleaner_email;
            return (
              <label key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={selectedProps.includes(p.id)}
                  onChange={() => toggleProp(p.id)} className="accent-coral-400 w-4 h-4" />
                <span className="text-[13px] text-gray-800 flex-1">{p.name}</span>
                {hasPrimary && (
                  <span className="text-[10px] text-amber-600">Already has primary — will be backup</span>
                )}
              </label>
            );
          })}
        </div>
        {propError && <p className="text-[12px] text-red-600 mb-2">{propError}</p>}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => submitCleaner(selectedProps)} loading={loading}>Send invite</Button>
          <Button size="sm" variant="outline" onClick={() => setStep(1)}>Back</Button>
        </div>
      </div>
    );
  }

  return null;
}

export function Cleaners() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: () => propertiesApi.getAll() });

  function refresh() { queryClient.invalidateQueries({ queryKey: ['properties'] }); }
  const properties = data?.data?.properties || data?.data || [];
  const cleaners = buildCleanerList(properties);

  if (isLoading) return <div className="text-warm-400 text-sm">Loading...</div>;

  return (
    <div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-1">Cleaners</h2>
      <p className="text-[13px] text-gray-400 mb-5">Manage your cleaning team.</p>

      {cleaners.length === 0 && properties.length > 0 && (
        <div className="text-center py-10 mb-6">
          <Users size={36} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-[16px] font-semibold text-gray-800 mb-1">No cleaners yet</h3>
          <p className="text-[13px] text-gray-400 max-w-xs mx-auto">Add your cleaner to start coordinating turnovers.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cleaners.map((c, i) => (
          <CleanerFirstCard key={c.email || i} cleaner={c} allProperties={properties} onRefresh={refresh} />
        ))}
        <AddCleanerCard properties={properties} onRefresh={refresh} />
      </div>
      <p className="text-xs text-gray-400 text-center mt-3 max-w-xs mx-auto">We'll send your cleaner an email invite. They don't need a Turnzy account yet — they'll be guided through setup.</p>
    </div>
  );
}

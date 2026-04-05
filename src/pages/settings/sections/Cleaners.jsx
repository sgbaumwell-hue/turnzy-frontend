import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Users, X as XIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

function buildCleanerList(properties) {
  const map = {};
  for (const p of properties) {
    if (p.cleaner_name || p.cleaner_email) {
      const key = p.cleaner_email || p.cleaner_name;
      if (!map[key]) map[key] = { name: p.cleaner_name, email: p.cleaner_email, userId: p.cleaner_user_id, confirmed: p.cleaner_confirmed, properties: [] };
      map[key].properties.push({ id: p.id, name: p.name, role: 'primary' });
    }
    if (p.backup_cleaner_name || p.backup_cleaner_email) {
      const key = p.backup_cleaner_email || p.backup_cleaner_name;
      if (!map[key]) map[key] = { name: p.backup_cleaner_name, email: p.backup_cleaner_email, userId: p.backup_cleaner_user_id, confirmed: false, properties: [] };
      map[key].properties.push({ id: p.id, name: p.name, role: 'backup' });
    }
  }
  return Object.values(map);
}

function SectionHead({ children, danger }) {
  return <h4 className={`text-xs font-semibold tracking-wide mb-3 ${danger ? 'text-red-400' : 'text-gray-400'}`}>{children}</h4>;
}

// ─── Cleaner Detail Panel ──────────────────────────────────────
function CleanerPanel({ cleaner, allProperties, onRefresh, onClose, isMobile }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(null);
  const [showAddProp, setShowAddProp] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const isActive = cleaner.userId && cleaner.confirmed;
  const coveredIds = new Set(cleaner.properties.map(p => p.id));
  const uncovered = allProperties.filter(p => !coveredIds.has(p.id));

  function refreshAll() {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    onRefresh();
  }

  async function handleRemoveFromProperty(propId) {
    setLoading(`remove-${propId}`);
    try {
      const prop = cleaner.properties.find(p => p.id === propId);
      await settingsApi.deleteCleaner(propId, prop?.role || 'primary');
      toast('Removed'); setConfirmRemove(null); refreshAll();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  async function handleAssignToProperty(propId) {
    setLoading(`assign-${propId}`);
    try {
      const prop = allProperties.find(p => p.id === propId);
      const hasPrimary = prop?.cleaner_name || prop?.cleaner_email;
      if (hasPrimary) {
        await settingsApi.saveBackupCleaner({ property_id: propId, name: cleaner.name || '', email: cleaner.email || '', notification_method: 'email' });
      } else {
        await settingsApi.updateCleaner({ property_id: propId, name: cleaner.name || '', email: cleaner.email || '', notification_method: 'email', role: 'primary' });
      }
      toast('Assigned'); setShowAddProp(false); refreshAll();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  async function handleResend() {
    if (!cleaner.properties.length) return;
    setLoading('resend');
    try { await settingsApi.resendInvite(cleaner.properties[0].id); toast('Invite resent'); }
    catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  async function handleRemoveAll() {
    if (!confirm(`Remove ${cleaner.name || cleaner.email} from all properties? Any accepted bookings will revert to Needs Action.`)) return;
    setLoading('remove-all');
    try {
      for (const p of cleaner.properties) await settingsApi.deleteCleaner(p.id, p.role);
      toast('Removed'); onClose(); refreshAll();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 bg-white px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {isMobile && <button onClick={onClose} className="p-1 -ml-1 text-gray-500"><ArrowLeft size={20} /></button>}
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-semibold text-gray-900 truncate">{cleaner.name || cleaner.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {isActive ? 'Active' : 'Invite sent'}
              </span>
              {!isActive && (
                <button onClick={handleResend} disabled={loading === 'resend'} className="text-[10px] text-coral-400 font-medium hover:underline">
                  Resend invite
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {/* Contact */}
          <section className="py-5 px-5">
            <SectionHead>Contact</SectionHead>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Name</label>
                <div className="text-[14px] font-medium text-gray-800">{cleaner.name || '—'}</div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Email</label>
                <div className="text-[14px] text-gray-800">{cleaner.email || '—'}</div>
                <div className="text-[10px] text-gray-400">Cannot change email after invite</div>
              </div>
            </div>
          </section>

          {/* Properties covered */}
          <section className="py-5 px-5">
            <SectionHead>Properties covered</SectionHead>
            {cleaner.properties.length === 0 && (
              <div className="text-[13px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                Not assigned to any property — assign one below.
              </div>
            )}
            <div className="space-y-1.5">
              {cleaner.properties.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5">
                  {confirmRemove === p.id ? (
                    <div className="flex-1">
                      <div className="text-[12px] text-gray-600 mb-1.5">Remove from {p.name}?</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveFromProperty(p.id)} loading={loading === `remove-${p.id}`}>Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-[13px] text-gray-800">{p.name}<span className="text-[10px] text-gray-400 ml-1.5">{p.role}</span></div>
                      <button onClick={() => setConfirmRemove(p.id)} className="text-gray-400 hover:text-red-500 p-1"><XIcon size={12} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            {showAddProp ? (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                {uncovered.length === 0 ? (
                  <div className="text-[12px] text-gray-400 p-2">All properties are assigned</div>
                ) : uncovered.map(p => (
                  <button key={p.id} onClick={() => handleAssignToProperty(p.id)} disabled={loading === `assign-${p.id}`}
                    className="w-full text-left text-[13px] text-gray-700 px-2 py-1.5 rounded hover:bg-white transition-colors">{p.name}</button>
                ))}
                <button onClick={() => setShowAddProp(false)} className="w-full text-left text-[11px] text-gray-400 px-2 py-1 mt-1">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowAddProp(true)} className="mt-2 text-[12px] text-coral-400 font-medium hover:underline">+ Add property</button>
            )}
          </section>

          {/* Notifications */}
          <section className="py-5 px-5">
            <SectionHead>Notifications</SectionHead>
            <div className="text-[13px] text-gray-500">Notified by email</div>
          </section>

          {/* Danger zone */}
          <section className="py-5 px-5">
            <SectionHead danger>Danger zone</SectionHead>
            <Button variant="outline" size="sm" onClick={handleRemoveAll} disabled={loading === 'remove-all'}
              className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 size={13} /> Remove cleaner
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Add Cleaner Flow ──────────────────────────────────────────
function AddCleanerInline({ properties, onRefresh, onDone }) {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [selectedProps, setSelectedProps] = useState([]);
  const [propError, setPropError] = useState('');
  const [loading, setLoading] = useState(false);

  if (properties.length === 0) {
    return (
      <div className="p-5 text-center">
        <Users size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-[14px] font-medium text-gray-700 mb-1">Add a property first</p>
        <p className="text-[12px] text-gray-400 mb-3">You need at least one property before inviting a cleaner.</p>
        <Button size="sm" variant="outline" onClick={() => navigate('/settings/properties')}>Go to Properties →</Button>
      </div>
    );
  }

  async function handleSubmit() {
    const propIds = properties.length === 1 ? [properties[0].id] : selectedProps;
    if (propIds.length === 0) { setPropError('Select at least one property.'); return; }
    setPropError('');
    setLoading(true);
    try {
      for (const id of propIds) {
        const prop = properties.find(p => p.id === id);
        const role = prop?.cleaner_name || prop?.cleaner_email ? 'backup' : 'primary';
        if (role === 'backup') {
          await settingsApi.saveBackupCleaner({ property_id: id, name: formName, email: formEmail, notification_method: 'email' });
        } else {
          await settingsApi.updateCleaner({ property_id: id, name: formName, email: formEmail, notification_method: 'email', role: 'primary' });
        }
      }
      toast(`Invite sent to ${formEmail}`);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onRefresh(); onDone();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(false);
  }

  if (step === 1) {
    return (
      <div className="p-5 space-y-3">
        <div className="text-xs font-semibold text-gray-400 tracking-wide mb-1">Add cleaner</div>
        <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" autoFocus />
        <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email" type="email" />
        <div className="text-[12px] text-gray-400">Notifications sent by email</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => properties.length === 1 ? handleSubmit() : setStep(2)}
            disabled={!formName.trim() || !formEmail.trim()} loading={loading && properties.length === 1}>
            {properties.length === 1 ? 'Send invite' : 'Next'}
          </Button>
          <Button size="sm" variant="outline" onClick={onDone}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-3">
      <div className="text-xs font-semibold text-gray-400 tracking-wide mb-1">Which properties?</div>
      <p className="text-[13px] text-gray-600">Which properties should {formName} cover?</p>
      <div className="space-y-1">
        {properties.map(p => (
          <label key={p.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={selectedProps.includes(p.id)}
              onChange={() => { setPropError(''); setSelectedProps(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]); }}
              className="accent-coral-400 w-4 h-4" />
            <span className="text-[13px] text-gray-800">{p.name}</span>
            {p.cleaner_name && <span className="text-[10px] text-amber-600 ml-auto">Has primary — will be backup</span>}
          </label>
        ))}
      </div>
      {propError && <p className="text-[12px] text-red-600">{propError}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} loading={loading}>Send invite</Button>
        <Button size="sm" variant="outline" onClick={() => setStep(1)}>Back</Button>
      </div>
    </div>
  );
}

// ─── Main Cleaners Page ────────────────────────────────────────
export function Cleaners() {
  const queryClient = useQueryClient();
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['properties'], queryFn: () => propertiesApi.getAll() });
  function refresh() { queryClient.invalidateQueries({ queryKey: ['properties'] }); }

  const properties = data?.data?.properties || data?.data || [];
  const cleaners = buildCleanerList(properties);
  const selected = selectedIdx !== null ? cleaners[selectedIdx] : null;

  useEffect(() => {
    if (window.innerWidth >= 1024 && selectedIdx === null && cleaners.length > 0) setSelectedIdx(0);
  }, [cleaners.length]);

  useEffect(() => {
    if (selectedIdx !== null && selectedIdx >= cleaners.length) setSelectedIdx(cleaners.length > 0 ? 0 : null);
  }, [cleaners.length]);

  if (isLoading) return <div className="text-gray-400 text-sm p-6">Loading...</div>;

  if (cleaners.length === 0 && !showAdd) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4"><Users size={28} className="text-orange-400" /></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No cleaners yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Add your first cleaner to start coordinating turnovers.</p>
        <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add cleaner</Button>
      </div>
    );
  }

  const panelOpen = selected || showAdd;

  return (
    <div className="flex h-full overflow-hidden">
      {/* List — hidden on mobile when panel is open */}
      <div className={`w-full lg:w-[280px] lg:shrink-0 lg:border-r lg:border-gray-200 flex flex-col bg-white h-full ${panelOpen ? 'hidden lg:flex' : 'flex'}`}>
        <div className="px-4 pt-5 pb-2 shrink-0">
          <h2 className="text-[16px] font-semibold text-gray-900">Cleaners</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cleaners.map((c, i) => {
            const isActive = c.userId && c.confirmed;
            const propCount = c.properties.length;
            return (
              <button key={c.email || i} onClick={() => { setSelectedIdx(i); setShowAdd(false); }}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-colors border-l-2 ${selectedIdx === i ? 'bg-coral-50 border-l-coral-500' : 'hover:bg-gray-50 border-l-transparent'}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-gray-900 truncate">{c.name || c.email}</div>
                  <div className="text-[11px] text-gray-400">{propCount} {propCount === 1 ? 'property' : 'properties'}</div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isActive ? 'Active' : 'Invited'}
                </span>
              </button>
            );
          })}
          <button onClick={() => { setShowAdd(true); setSelectedIdx(null); }}
            className="w-full text-left px-4 py-3 flex items-center gap-1.5 text-[13px] text-coral-400 font-medium hover:text-coral-500 hover:bg-gray-50">
            <Plus size={14} /> Add cleaner
          </button>
        </div>
      </div>

      {/* Panel — full screen on mobile, side panel on desktop */}
      {panelOpen && (
        <div className="fixed inset-0 z-30 bg-white lg:static lg:z-auto lg:flex-1 lg:min-w-0 lg:bg-gray-50 h-full flex flex-col">
          {showAdd ? (
            <>
              <div className="shrink-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 lg:hidden">
                <button onClick={() => setShowAdd(false)} className="p-1 -ml-1 text-gray-500"><ArrowLeft size={20} /></button>
                <span className="text-[15px] font-semibold text-gray-900">Add cleaner</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AddCleanerInline properties={properties} onRefresh={refresh} onDone={() => setShowAdd(false)} />
              </div>
            </>
          ) : selected ? (
            <CleanerPanel key={selected.email} cleaner={selected} allProperties={properties}
              onRefresh={refresh} onClose={() => setSelectedIdx(null)} isMobile={window.innerWidth < 1024} />
          ) : null}
        </div>
      )}

      {/* Desktop placeholder */}
      {!panelOpen && (
        <div className="hidden lg:flex flex-1 items-center justify-center text-gray-400 text-sm bg-gray-50">
          Select a cleaner to view details
        </div>
      )}
    </div>
  );
}

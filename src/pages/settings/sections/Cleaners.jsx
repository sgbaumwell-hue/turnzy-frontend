import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';
import client from '../../../api/client';

// Fix 12: Property color dots — must match Properties.jsx
const PROP_COLORS = ['bg-coral-400', 'bg-sky-400', 'bg-emerald-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'];
function propColorByIndex(properties, propId) {
  const idx = properties.findIndex(p => p.id === propId);
  return PROP_COLORS[(idx >= 0 ? idx : 0) % PROP_COLORS.length];
}

function buildCleanerList(properties) {
  const map = {};
  for (const p of properties) {
    if (p.cleaner_name || p.cleaner_email) {
      const key = (p.cleaner_email || p.cleaner_name || '').toLowerCase();
      if (!map[key]) map[key] = { name: p.cleaner_name, email: p.cleaner_email, userId: p.cleaner_user_id, confirmed: p.cleaner_confirmed, properties: [] };
      if (p.cleaner_name && !map[key].name) map[key].name = p.cleaner_name;
      if (p.cleaner_user_id) { map[key].userId = p.cleaner_user_id; map[key].confirmed = p.cleaner_confirmed; }
      map[key].properties.push({ id: p.id, name: p.name, role: 'primary' });
    }
    if (p.backup_cleaner_name || p.backup_cleaner_email) {
      const key = (p.backup_cleaner_email || p.backup_cleaner_name || '').toLowerCase();
      if (!map[key]) map[key] = { name: p.backup_cleaner_name, email: p.backup_cleaner_email, userId: p.backup_cleaner_user_id, confirmed: !!p.backup_cleaner_user_id, properties: [] };
      if (p.backup_cleaner_name && !map[key].name) map[key].name = p.backup_cleaner_name;
      if (p.backup_cleaner_user_id && !map[key].userId) { map[key].userId = p.backup_cleaner_user_id; map[key].confirmed = true; }
      map[key].properties.push({ id: p.id, name: p.name, role: 'backup' });
    }
  }
  return Object.values(map);
}

function SectionHead({ children, danger }) {
  return <h4 className={`text-xs font-semibold tracking-wide mb-3 ${danger ? 'text-red-400' : 'text-gray-400'}`}>{children}</h4>;
}

// Fix 1: Proper modal for cleaner deletion
function DeleteModal({ cleanerName, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Remove {cleanerName}?</h3>
        <p className="text-[13px] text-gray-500 mb-5">This will remove {cleanerName} from all your properties. Any upcoming accepted bookings will revert to Needs Action and they'll be notified.</p>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={onConfirm} loading={loading} className="flex-1">Remove cleaner</Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Cleaner Detail Panel ──────────────────────────────────────
function CleanerPanel({ cleaner, allProperties, onRefresh, onClose, isMobile }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(null);
  const [showAddProp, setShowAddProp] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isActive = cleaner.userId && cleaner.confirmed;
  const coveredIds = new Set(cleaner.properties.map(p => p.id));
  const uncovered = allProperties.filter(p => !coveredIds.has(p.id));

  function refreshAll() {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    onRefresh();
  }

  // Fix 4: Accessible Remove for property rows
  async function handleRemoveFromProperty(propId) {
    setLoading(`remove-${propId}`);
    try {
      const prop = cleaner.properties.find(p => p.id === propId);
      await settingsApi.deleteCleaner(propId, prop?.role || 'primary');
      toast('Cleaner removed'); setConfirmRemove(null); refreshAll();
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
      toast('Cleaner assigned'); setShowAddProp(false); refreshAll();
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

  // Fix 1: Use modal instead of confirm()
  async function handleRemoveAll() {
    setLoading('remove-all');
    try {
      for (const p of cleaner.properties) await settingsApi.deleteCleaner(p.id, p.role);
      toast('Cleaner removed'); setShowDeleteModal(false); onClose(); refreshAll();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setLoading(null);
  }

  return (
    <div className="h-full flex flex-col">
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
                <button onClick={handleResend} disabled={loading === 'resend'} className="text-[10px] text-coral-400 font-medium hover:underline">Resend invite</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          <section className="py-5 px-5">
            <SectionHead>Contact</SectionHead>
            <div className="space-y-2">
              <div><label className="text-[10px] text-gray-400 uppercase tracking-wider">Name</label><div className="text-[14px] font-medium text-gray-800">{cleaner.name || '—'}</div></div>
              <div><label className="text-[10px] text-gray-400 uppercase tracking-wider">Email</label><div className="text-[14px] text-gray-800">{cleaner.email || '—'}</div><div className="text-[10px] text-gray-400">Cannot change email after invite</div></div>
            </div>
          </section>

          {/* Fix 4: Accessible property rows with Remove text link */}
          <section className="py-5 px-5">
            <SectionHead>Properties covered</SectionHead>
            {cleaner.properties.length === 0 && (
              <div className="text-[13px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                Not assigned to any property — assign one below.
              </div>
            )}
            <div className="space-y-0">
              {cleaner.properties.map(p => (
                <div key={p.id}>
                  {confirmRemove === p.id ? (
                    <div className="py-2 px-3 bg-red-50 border border-red-100 rounded-lg my-1">
                      <p className="text-[12px] text-gray-700 mb-2">Remove {cleaner.name || 'cleaner'} from {p.name}?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveFromProperty(p.id)} loading={loading === `remove-${p.id}`}>Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${propColorByIndex(allProperties, p.id)}`} />
                        <span className="text-[13px] text-gray-800 font-medium">{p.name}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{p.role}</span>
                      </div>
                      <button onClick={() => setConfirmRemove(p.id)} className="text-[12px] text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </div>
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
                    className="w-full text-left text-[13px] text-gray-700 px-2 py-1.5 rounded hover:bg-white transition-colors flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${propColorByIndex(allProperties, p.id)}`} />
                    {p.name}
                  </button>
                ))}
                <button onClick={() => setShowAddProp(false)} className="w-full text-left text-[11px] text-gray-400 px-2 py-1 mt-1">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowAddProp(true)} className="mt-2 text-[12px] text-coral-400 font-medium hover:underline">+ Add property</button>
            )}
          </section>

          <section className="py-5 px-5">
            <SectionHead>Notifications</SectionHead>
            <div className="text-[13px] text-gray-500">Notified by email</div>
          </section>

          <section className="py-5 px-5">
            <SectionHead danger>Danger zone</SectionHead>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 size={13} /> Remove cleaner
            </Button>
          </section>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          cleanerName={cleaner.name || cleaner.email}
          onConfirm={handleRemoveAll}
          onCancel={() => setShowDeleteModal(false)}
          loading={loading === 'remove-all'}
        />
      )}
    </div>
  );
}

// Fix 14: Email validation helper
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Add Cleaner Flow ──────────────────────────────────────────
function AddCleanerInline({ properties, onRefresh, onDone }) {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // null | 'existing' | 'new'
  const [selectedProps, setSelectedProps] = useState([]);
  const [propRoles, setPropRoles] = useState({}); // propId → 'backup' | 'replace'
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

  // Fix 5: Email existence check
  async function checkEmail() {
    const email = formEmail.trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) { setEmailStatus(null); return; }
    try {
      const res = await client.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      setEmailStatus(res.data?.exists ? 'existing' : 'new');
    } catch { setEmailStatus(null); }
  }

  function validateEmail() {
    if (formEmail && !EMAIL_REGEX.test(formEmail)) { setEmailError('Enter a valid email address'); return false; }
    setEmailError(''); return true;
  }

  async function handleSubmit() {
    const propIds = properties.length === 1 ? [properties[0].id] : selectedProps;
    if (propIds.length === 0) { setPropError('Select at least one property.'); return; }
    if (!validateEmail()) return;
    setPropError('');
    setLoading(true);
    try {
      for (const id of propIds) {
        const prop = properties.find(p => p.id === id);
        const hasPrimary = prop?.cleaner_name || prop?.cleaner_email;
        const role = propRoles[id] || (hasPrimary ? 'backup' : 'primary');

        if (role === 'replace' && hasPrimary) {
          // Fix 7: Replace as primary — demote or remove old primary
          if (prop.backup_cleaner_name || prop.backup_cleaner_email) {
            // Already has backup → remove current primary entirely
            await settingsApi.deleteCleaner(id, 'primary');
          }
          // Set new as primary (if old primary was demoted, swapCleaners would be used but simpler to just assign)
          await settingsApi.updateCleaner({ property_id: id, name: formName, email: formEmail, notification_method: 'email', role: 'primary' });
        } else if (hasPrimary) {
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
        <div>
          <Input value={formEmail} onChange={(e) => { setFormEmail(e.target.value); setEmailError(''); setEmailStatus(null); }}
            onBlur={() => { validateEmail(); checkEmail(); }}
            placeholder="Email" type="email" />
          {emailError && <p className="text-[11px] text-red-600 mt-1">{emailError}</p>}
          {emailStatus === 'existing' && (
            <div className="text-[11px] text-green-600 bg-green-50 border border-green-100 rounded-lg px-2 py-1.5 mt-1.5 flex items-center gap-1.5">
              <CheckCircle size={12} /> {formEmail} already has a Turnzy account. A connection request will be sent.
            </div>
          )}
          {emailStatus === 'new' && (
            <p className="text-[11px] text-gray-400 mt-1">An invite email will be sent to {formEmail} to join Turnzy.</p>
          )}
        </div>
        <div className="text-[12px] text-gray-400">Notifications sent by email</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { if (!validateEmail()) return; properties.length === 1 ? handleSubmit() : setStep(2); }}
            disabled={!formName.trim() || !formEmail.trim()} loading={loading && properties.length === 1}>
            {properties.length === 1 ? 'Send invite' : 'Next'}
          </Button>
          <Button size="sm" variant="outline" onClick={onDone}>Cancel</Button>
        </div>
      </div>
    );
  }

  // Fix 6: Card-style property selector
  return (
    <div className="p-5 space-y-3">
      <div className="text-xs font-semibold text-gray-400 tracking-wide mb-1">Which properties?</div>
      <p className="text-[13px] text-gray-600">Which properties should {formName} cover?</p>
      <div className="space-y-2">
        {properties.map(p => {
          const isSelected = selectedProps.includes(p.id);
          const hasPrimary = p.cleaner_name || p.cleaner_email;
          const hasBackup = p.backup_cleaner_name || p.backup_cleaner_email;
          const role = propRoles[p.id] || 'backup';
          return (
            <div key={p.id} onClick={() => {
              setPropError('');
              setSelectedProps(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]);
              if (!propRoles[p.id] && hasPrimary) setPropRoles(prev => ({ ...prev, [p.id]: 'backup' }));
            }}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${isSelected ? 'border-coral-500 bg-coral-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${propColorByIndex(properties, p.id)}`} />
                <span className="text-[13px] font-medium text-gray-800">{p.name}</span>
                {!hasPrimary && <span className="text-[10px] text-gray-400 ml-auto">No cleaner assigned</span>}
              </div>
              {isSelected && hasPrimary && (
                <div className="mt-2 ml-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
                    <input type="radio" name={`role-${p.id}`} checked={role === 'backup'} onChange={() => setPropRoles(prev => ({ ...prev, [p.id]: 'backup' }))} className="accent-coral-400" />
                    Add as backup
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer">
                    <input type="radio" name={`role-${p.id}`} checked={role === 'replace'} onChange={() => setPropRoles(prev => ({ ...prev, [p.id]: 'replace' }))} className="accent-coral-400" />
                    Replace as primary
                  </label>
                </div>
              )}
              {isSelected && hasPrimary && role === 'backup' && hasBackup && (
                <p className="text-[10px] text-amber-600 ml-4 mt-1">⚠ This property already has a backup. Adding {formName} will replace them.</p>
              )}
            </div>
          );
        })}
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
      <div className={`w-full lg:w-[280px] lg:shrink-0 lg:border-r lg:border-gray-200 flex flex-col bg-white h-full ${panelOpen ? 'hidden lg:flex' : 'flex'}`}>
        <div className="px-4 pt-5 pb-2 shrink-0"><h2 className="text-[16px] font-semibold text-gray-900">Cleaners</h2></div>
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

      {!panelOpen && (
        <div className="hidden lg:flex flex-1 items-center justify-center text-gray-400 text-sm bg-gray-50">
          Select a cleaner to view details
        </div>
      )}
    </div>
  );
}

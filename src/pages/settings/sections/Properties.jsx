import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, X, Link, Unlink, Plus, Home, Copy, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';
import { AddPropertyModal, STORAGE_KEY } from '../components/AddPropertyModal';
import client from '../../../api/client';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

// Fix 12: Property color dots
const PROP_COLORS = ['bg-coral-400', 'bg-sky-400', 'bg-emerald-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'];
function propColor(index) { return PROP_COLORS[index % PROP_COLORS.length]; }

function calStatus(url) {
  if (!url) return { label: '⚠ No calendar', cls: 'bg-amber-100 text-amber-700' };
  if (url.includes('fake-ical') || url.includes('test')) return { label: 'Test', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'Connected', cls: 'bg-green-100 text-green-700' };
}

function cleanerDot(p) {
  if (p.cleaner_name && p.cleaner_confirmed) return 'bg-green-500';
  if (p.cleaner_email) return 'border border-amber-400';
  return 'bg-gray-200';
}

function SectionHead({ children }) {
  return <h4 className="text-xs font-semibold text-gray-400 tracking-wide mb-3">{children}</h4>;
}

// Fix 11: Time validation warning
function TimeWarning({ co, ci }) {
  if (!co || !ci) return null;
  const [coH, coM] = co.split(':').map(Number);
  const [ciH, ciM] = ci.split(':').map(Number);
  const coMin = coH * 60 + coM;
  const ciMin = ciH * 60 + ciM;
  if (ciMin <= coMin) {
    return <p className="text-[11px] text-amber-600 mt-2">⚠ The cleaning window between checkout and check-in appears very short or zero. Double-check your times.</p>;
  }
  return null;
}

// Fix 3: Inline cleaner picker
function CleanerPicker({ property, allProperties, onDone, toast }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(null);

  // Build unique cleaners from all properties
  const cleanerMap = {};
  for (const p of allProperties) {
    if (p.cleaner_email) cleanerMap[p.cleaner_email] = { name: p.cleaner_name, email: p.cleaner_email, confirmed: p.cleaner_confirmed };
    if (p.backup_cleaner_email) cleanerMap[p.backup_cleaner_email] = { name: p.backup_cleaner_name, email: p.backup_cleaner_email, confirmed: false };
  }
  // Exclude current property's cleaner
  const currentEmail = property.cleaner_email?.toLowerCase();
  const cleaners = Object.values(cleanerMap).filter(c => c.email?.toLowerCase() !== currentEmail);

  async function assign(c) {
    setSaving(c.email);
    try {
      await settingsApi.updateCleaner({ property_id: property.id, name: c.name, email: c.email, notification_method: 'email', role: 'primary' });
      toast('Cleaner assigned');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onDone();
    } catch (e) { toast(e.response?.data?.error || 'Failed', 'error'); }
    setSaving(null);
  }

  return (
    <div className="mt-2 bg-gray-50 rounded-lg border border-gray-100 p-2">
      {cleaners.length === 0 ? (
        <div className="p-2 text-[12px] text-gray-400">No cleaners added yet.</div>
      ) : cleaners.map(c => (
        <button key={c.email} onClick={() => assign(c)} disabled={saving === c.email}
          className="w-full text-left px-2 py-1.5 rounded hover:bg-white text-[13px] text-gray-700 flex items-center gap-2 transition-colors">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.confirmed ? 'bg-green-500' : 'bg-amber-400'}`} />
          {c.name || c.email}
          {saving === c.email && <span className="text-[10px] text-gray-400 ml-auto">Assigning...</span>}
        </button>
      ))}
      <button onClick={onDone} className="w-full text-left px-2 py-1 mt-1 text-[11px] text-gray-400">Cancel</button>
    </div>
  );
}

// ─── Property Detail Panel ─────────────────────────────────────
function PropertyPanel({ property, propIndex, allProperties, onRefresh, onClose, isMobile }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const origCo = property.default_checkout_time || '11:00';
  const origCi = property.default_checkin_time || '15:00';

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(property.name);
  const [editingIcal, setEditingIcal] = useState(false);
  const [icalUrl, setIcalUrl] = useState(property.ical_url || '');
  const [coTime, setCoTime] = useState(origCo);
  const [ciTime, setCiTime] = useState(origCi);
  const [timezone, setTimezone] = useState(property.timezone || 'America/New_York');
  const [platform, setPlatform] = useState(property.platform || 'Airbnb');
  const [saving, setSaving] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showPicker, setShowPicker] = useState(null); // 'primary' | 'backup'
  const [copied, setCopied] = useState(false);

  const timesDirty = coTime !== origCo || ciTime !== origCi;

  useEffect(() => {
    setName(property.name);
    setIcalUrl(property.ical_url || '');
    setCoTime(property.default_checkout_time || '11:00');
    setCiTime(property.default_checkin_time || '15:00');
    setTimezone(property.timezone || 'America/New_York');
    setPlatform(property.platform || 'Airbnb');
    setEditingName(false); setEditingIcal(false); setConfirmAction(null); setShowPicker(null);
  }, [property.id]);

  function refreshAll() {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    onRefresh();
  }

  async function saveName() {
    setSaving('name');
    try { await settingsApi.updatePropertyName(property.id, name); toast('Name updated'); setEditingName(false); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function saveTimes() {
    setSaving('times');
    try { await settingsApi.updatePropertyTimes(property.id, coTime, ciTime); toast('Times saved'); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function saveTimezone(tz) { setTimezone(tz); try { await settingsApi.updatePropertyTimezone(property.id, tz); toast('Timezone updated'); refreshAll(); } catch { toast('Failed', 'error'); } }

  // Fix 9: Auto-detect platform from iCal URL
  function handleIcalChange(url) {
    setIcalUrl(url);
    const lower = url.toLowerCase();
    if (lower.includes('airbnb.com')) setPlatform('Airbnb');
    else if (lower.includes('vrbo.com') || lower.includes('homeaway.com')) setPlatform('VRBO');
  }

  async function savePlatform(p) { setPlatform(p); try { await settingsApi.updatePropertyPlatform(property.id, p); toast('Platform updated'); refreshAll(); } catch { toast('Failed', 'error'); } }
  async function saveIcal() {
    setSaving('ical');
    try {
      await settingsApi.updateIcal(property.id, icalUrl); toast('Calendar connected'); setEditingIcal(false);
      // Auto-detect platform
      const lower = icalUrl.toLowerCase();
      if (lower.includes('airbnb.com') && property.platform !== 'Airbnb') { await settingsApi.updatePropertyPlatform(property.id, 'Airbnb'); }
      else if ((lower.includes('vrbo.com') || lower.includes('homeaway.com')) && property.platform !== 'VRBO') { await settingsApi.updatePropertyPlatform(property.id, 'VRBO'); }
      refreshAll();
    } catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function disconnectIcal() { if (!confirm('Disconnect calendar?')) return; try { await settingsApi.disconnectIcal(property.id); toast('Calendar disconnected'); setIcalUrl(''); refreshAll(); } catch { toast('Failed', 'error'); } }
  async function switchToTest() { setSaving('test'); try { const res = await settingsApi.generateTestCalendar(property.id); const url = res.data?.fake_url; if (url) { await settingsApi.updateIcal(property.id, url); setIcalUrl(url); } toast('Test calendar enabled'); refreshAll(); } catch { toast('Failed', 'error'); } setSaving(null); }

  async function removePrimary() {
    setSaving('remove-primary');
    try { await settingsApi.deleteCleaner(property.id, 'primary'); toast('Cleaner removed'); setConfirmAction(null); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function removeBackup() {
    setSaving('remove-backup');
    try { await settingsApi.deleteCleaner(property.id, 'backup'); toast('Cleaner removed'); setConfirmAction(null); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function makePrimary() {
    setSaving('make-primary');
    try { await settingsApi.swapCleaners(property.id); toast('Roles swapped'); setConfirmAction(null); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }

  // Fix 10: Copy feedback
  function handleCopy() {
    navigator.clipboard.writeText(property.ical_url);
    setCopied(true);
    toast('Copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  const cal = calStatus(property.ical_url);
  const dotColor = propColor(propIndex);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="shrink-0 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {isMobile && <button onClick={onClose} className="p-1 -ml-1 text-gray-500"><ArrowLeft size={20} /></button>}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-[15px] font-semibold flex-1" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setName(property.name); } }} />
                <Button size="sm" onClick={saveName} loading={saving === 'name'}>Save</Button>
                <button onClick={() => { setEditingName(false); setName(property.name); }} className="p-1 text-gray-400"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                <h3 className="text-[17px] font-semibold text-gray-900 truncate">{property.name}</h3>
                <button onClick={() => setEditingName(true)} className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0"><Pencil size={12} /></button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{platform}</span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${cal.cls}`}>{cal.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {/* Calendar */}
          <section className="py-5 px-5">
            <SectionHead>Calendar</SectionHead>
            {property.ical_url && !editingIcal ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-[12px] text-gray-500 truncate flex-1">{property.ical_url}</div>
                  <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => setEditingIcal(true)}>Edit URL</Button>
                  <Button size="sm" variant="outline" onClick={disconnectIcal} className="text-red-600 border-red-200 hover:bg-red-50">Disconnect</Button>
                  <Button size="sm" variant="outline" onClick={switchToTest} disabled={saving === 'test'} className="text-blue-600 border-blue-300 hover:bg-blue-50">Test calendar</Button>
                </div>
              </div>
            ) : editingIcal ? (
              <div className="space-y-2">
                <Input value={icalUrl} onChange={(e) => handleIcalChange(e.target.value)} placeholder="https://www.airbnb.com/calendar/ical/..." autoFocus />
                <div className="flex gap-2"><Button size="sm" onClick={saveIcal} loading={saving === 'ical'}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditingIcal(false)}>Cancel</Button></div>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditingIcal(true)}><Link size={13} /> Connect calendar</Button>
            )}
          </section>

          {/* Schedule */}
          <section className="py-5 px-5">
            <SectionHead>Schedule</SectionHead>
            <div className="flex items-end gap-3">
              <div><label className="text-[11px] text-gray-500 block mb-1">Checkout</label><Input type="time" value={coTime} onChange={(e) => setCoTime(e.target.value)} className="h-8 text-[13px] w-28" /></div>
              <div><label className="text-[11px] text-gray-500 block mb-1">Check-in</label><Input type="time" value={ciTime} onChange={(e) => setCiTime(e.target.value)} className="h-8 text-[13px] w-28" /></div>
            </div>
            <TimeWarning co={coTime} ci={ciTime} />
            {timesDirty && <Button size="sm" className="mt-2" onClick={saveTimes} loading={saving === 'times'}>Save times</Button>}
          </section>

          {/* Timezone — Fix 8: max-w-xs */}
          <section className="py-5 px-5">
            <SectionHead>Timezone</SectionHead>
            <select value={timezone} onChange={(e) => saveTimezone(e.target.value)} className="max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white cursor-pointer focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30">
              {US_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('America/', '').replace('Pacific/', '').replace(/_/g, ' ')}</option>)}
            </select>
          </section>

          {/* Platform — Fix 8: max-w-xs */}
          <section className="py-5 px-5">
            <SectionHead>Platform</SectionHead>
            <select value={platform} onChange={(e) => savePlatform(e.target.value)} className="max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white cursor-pointer focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30">
              <option value="Airbnb">Airbnb</option><option value="VRBO">VRBO</option><option value="Other">Other</option>
            </select>
          </section>

          {/* Cleaning Team — Fix 3: inline picker */}
          <section className="py-5 px-5">
            <SectionHead>Cleaning team</SectionHead>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Primary</div>
                {confirmAction === 'remove-primary' ? (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-[12px] text-gray-700 mb-2">Remove {property.cleaner_name} from {property.name}?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" onClick={removePrimary} loading={saving === 'remove-primary'}>Confirm removal</Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : property.cleaner_name ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] text-gray-800 font-medium">{property.cleaner_name}
                          <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${property.cleaner_confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {property.cleaner_confirmed ? 'Active' : 'Invite sent'}
                          </span>
                        </div>
                        {property.cleaner_email && <div className="text-[11px] text-gray-400">{property.cleaner_email}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowPicker('primary')} className="text-[11px] text-coral-400 hover:underline font-medium">Change</button>
                        <button onClick={() => setConfirmAction('remove-primary')} className="text-[11px] text-gray-400 hover:text-red-500 font-medium">Remove</button>
                      </div>
                    </div>
                    {showPicker === 'primary' && <CleanerPicker property={property} allProperties={allProperties} onDone={() => { setShowPicker(null); refreshAll(); }} toast={toast} />}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] text-gray-400">No cleaner assigned</div>
                      <button onClick={() => setShowPicker('primary')} className="text-[11px] text-coral-400 hover:underline font-medium">Assign</button>
                    </div>
                    {showPicker === 'primary' && <CleanerPicker property={property} allProperties={allProperties} onDone={() => { setShowPicker(null); refreshAll(); }} toast={toast} />}
                  </div>
                )}
              </div>

              {/* Backup */}
              {property.cleaner_name && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Backup</div>
                  {confirmAction === 'remove-backup' ? (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <p className="text-[12px] text-gray-700 mb-2">Remove {property.backup_cleaner_name} as backup?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={removeBackup} loading={saving === 'remove-backup'}>Confirm removal</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : confirmAction === 'make-primary' ? (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-[12px] text-gray-700 mb-2">Make {property.backup_cleaner_name} the primary cleaner? {property.cleaner_name} will become backup.</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={makePrimary} loading={saving === 'make-primary'}>Confirm</Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : property.backup_cleaner_name ? (
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] text-gray-800 font-medium">{property.backup_cleaner_name}</div>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmAction('make-primary')} className="text-[11px] text-coral-400 hover:underline font-medium">Make primary</button>
                        <button onClick={() => setConfirmAction('remove-backup')} className="text-[11px] text-gray-400 hover:text-red-500 font-medium">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] text-gray-400">None</div>
                      <button onClick={() => setShowPicker('backup')} className="text-[11px] text-coral-400 hover:underline font-medium">Add backup</button>
                    </div>
                  )}
                  {showPicker === 'backup' && <CleanerPicker property={property} allProperties={allProperties} onDone={() => { setShowPicker(null); refreshAll(); }} toast={toast} />}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main Properties Page ──────────────────────────────────────
export function Properties() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, error } = useQuery({ queryKey: ['properties'], queryFn: () => propertiesApi.getAll() });
  useEffect(() => { if (error) console.warn('GET /api/properties failed:', error.message || error); }, [error]);
  useEffect(() => { try { if (sessionStorage.getItem(STORAGE_KEY)) setShowModal(true); } catch {} }, []);

  function refresh() { queryClient.invalidateQueries({ queryKey: ['properties'] }); }
  const properties = data?.data?.properties || data?.data || [];
  const selected = properties.find(p => p.id === selectedId);
  const selectedIndex = properties.findIndex(p => p.id === selectedId);

  useEffect(() => {
    if (window.innerWidth >= 1024 && !selectedId && properties.length > 0) setSelectedId(properties[0].id);
  }, [properties.length]);

  if (isLoading) return <div className="text-gray-400 text-sm p-6">Loading properties...</div>;

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4"><Home size={28} className="text-orange-400" /></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Add your first property to get started.</p>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Add property</Button>
        <AddPropertyModal open={showModal} onClose={() => setShowModal(false)} onCreated={refresh} />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full overflow-hidden">
        <div className={`w-full lg:w-[280px] lg:shrink-0 lg:border-r lg:border-gray-200 flex flex-col bg-white h-full ${selected ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-4 pt-5 pb-2 shrink-0"><h2 className="text-[16px] font-semibold text-gray-900">Properties</h2></div>
          <div className="flex-1 overflow-y-auto">
            {properties.map((p, i) => {
              const cal = calStatus(p.ical_url);
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-colors border-l-2 ${selectedId === p.id ? 'bg-coral-50 border-l-coral-500' : 'hover:bg-gray-50 border-l-transparent'}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${propColor(i)}`} />
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-medium text-gray-900 truncate">{p.name}</div></div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cal.cls}`}>{cal.label}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cleanerDot(p)}`} />
                  </div>
                </button>
              );
            })}
            <button onClick={() => setShowModal(true)} className="w-full text-left px-4 py-3 flex items-center gap-1.5 text-[13px] text-coral-400 font-medium hover:text-coral-500 hover:bg-gray-50">
              <Plus size={14} /> Add property
            </button>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-30 bg-white lg:static lg:z-auto lg:flex-1 lg:min-w-0 lg:bg-gray-50 h-full">
            <PropertyPanel key={selected.id} property={selected} propIndex={selectedIndex} allProperties={properties}
              onRefresh={refresh} onClose={() => setSelectedId(null)} isMobile={window.innerWidth < 1024} />
          </div>
        )}

        {!selected && (
          <div className="hidden lg:flex flex-1 items-center justify-center text-gray-400 text-sm bg-gray-50">
            Select a property to view settings
          </div>
        )}
      </div>
      <AddPropertyModal open={showModal} onClose={() => setShowModal(false)} onCreated={refresh} />
    </>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Check, X, Link, Unlink, Plus, Home, ChevronLeft, Copy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Separator } from '@/components/shadcn/separator';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';
import { AddPropertyModal, STORAGE_KEY } from '../components/AddPropertyModal';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

function calStatus(url) {
  if (!url) return { label: '⚠ No calendar', cls: 'bg-amber-100 text-amber-700' };
  if (url.includes('fake-ical') || url.includes('test')) return { label: 'Test', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'Connected', cls: 'bg-green-100 text-green-700' };
}

function cleanerDot(p) {
  if (p.cleaner_name && p.cleaner_confirmed) return 'bg-green-500';
  if (p.cleaner_email) return 'bg-amber-400 ring-1 ring-amber-400 bg-transparent';
  return 'bg-gray-200';
}

// ─── Property Detail Panel ─────────────────────────────────────
function PropertyPanel({ property, onRefresh, onClose, isMobile }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(property.name);
  const [editingIcal, setEditingIcal] = useState(false);
  const [icalUrl, setIcalUrl] = useState(property.ical_url || '');
  const [coTime, setCoTime] = useState(property.default_checkout_time || '11:00');
  const [ciTime, setCiTime] = useState(property.default_checkin_time || '15:00');
  const [timezone, setTimezone] = useState(property.timezone || 'America/New_York');
  const [platform, setPlatform] = useState(property.platform || 'Airbnb');
  const [saving, setSaving] = useState(null);
  const [timesDirty, setTimesDirty] = useState(false);

  useEffect(() => {
    setName(property.name);
    setIcalUrl(property.ical_url || '');
    setCoTime(property.default_checkout_time || '11:00');
    setCiTime(property.default_checkin_time || '15:00');
    setTimezone(property.timezone || 'America/New_York');
    setPlatform(property.platform || 'Airbnb');
    setEditingName(false);
    setEditingIcal(false);
    setTimesDirty(false);
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
    try { await settingsApi.updatePropertyTimes(property.id, coTime, ciTime); toast('Times updated'); setTimesDirty(false); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function saveTimezone(tz) {
    setTimezone(tz);
    try { await settingsApi.updatePropertyTimezone(property.id, tz); toast('Timezone updated'); refreshAll(); }
    catch { toast('Failed', 'error'); }
  }
  async function savePlatform(p) {
    setPlatform(p);
    try { await settingsApi.updatePropertyPlatform(property.id, p); toast('Platform updated'); refreshAll(); }
    catch { toast('Failed', 'error'); }
  }
  async function saveIcal() {
    setSaving('ical');
    try { await settingsApi.updateIcal(property.id, icalUrl); toast('Calendar connected'); setEditingIcal(false); refreshAll(); }
    catch { toast('Failed', 'error'); }
    setSaving(null);
  }
  async function disconnectIcal() {
    if (!confirm('Disconnect calendar?')) return;
    try { await settingsApi.disconnectIcal(property.id); toast('Disconnected'); setIcalUrl(''); refreshAll(); }
    catch { toast('Failed', 'error'); }
  }
  async function switchToTest() {
    setSaving('test');
    try {
      const res = await settingsApi.generateTestCalendar(property.id);
      const url = res.data?.fake_url;
      if (url) { await settingsApi.updateIcal(property.id, url); setIcalUrl(url); }
      toast('Test calendar enabled'); refreshAll();
    } catch { toast('Failed', 'error'); }
    setSaving(null);
  }

  const cal = calStatus(property.ical_url);

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onClose} className="p-1 -ml-1 text-gray-500"><ArrowLeft size={20} /></button>
          )}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-[15px] font-semibold flex-1" autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveName()} onBlur={saveName} />
                <button onClick={() => { setEditingName(false); setName(property.name); }} className="p-1 text-gray-400"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-semibold text-gray-900 truncate">{property.name}</h3>
                <button onClick={() => setEditingName(true)} className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0"><Pencil size={12} /></button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{property.platform || 'Airbnb'}</span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${cal.cls}`}>{cal.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Calendar */}
        <section>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Calendar</h4>
          {property.ical_url && !editingIcal ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-[12px] text-gray-500 truncate flex-1">{property.ical_url}</div>
                <button onClick={() => { navigator.clipboard.writeText(property.ical_url); toast('Copied'); }}
                  className="p-1 text-gray-400 hover:text-gray-600 shrink-0"><Copy size={13} /></button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingIcal(true)}>Edit URL</Button>
                <Button size="sm" variant="outline" onClick={disconnectIcal} className="text-red-600 border-red-200 hover:bg-red-50">Disconnect</Button>
                <Button size="sm" variant="outline" onClick={switchToTest} disabled={saving === 'test'} className="text-blue-600 border-blue-300 hover:bg-blue-50">Test calendar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {editingIcal ? (
                <>
                  <Input value={icalUrl} onChange={(e) => setIcalUrl(e.target.value)} placeholder="https://www.airbnb.com/calendar/ical/..." autoFocus />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveIcal} loading={saving === 'ical'}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingIcal(false)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditingIcal(true)}>
                  <Link size={13} /> Connect calendar
                </Button>
              )}
            </div>
          )}
        </section>

        <Separator />

        {/* Schedule */}
        <section>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Schedule</h4>
          <div className="flex items-end gap-3">
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Checkout</label>
              <Input type="time" value={coTime} onChange={(e) => { setCoTime(e.target.value); setTimesDirty(true); }} className="h-8 text-[13px] w-28" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Check-in</label>
              <Input type="time" value={ciTime} onChange={(e) => { setCiTime(e.target.value); setTimesDirty(true); }} className="h-8 text-[13px] w-28" />
            </div>
          </div>
          {timesDirty && (
            <Button size="sm" className="mt-2" onClick={saveTimes} loading={saving === 'times'}>Save times</Button>
          )}
        </section>

        <Separator />

        {/* Timezone */}
        <section>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Timezone</h4>
          <select value={timezone} onChange={(e) => saveTimezone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white cursor-pointer focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30">
            {US_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('America/', '').replace('Pacific/', '').replace(/_/g, ' ')}</option>)}
          </select>
        </section>

        <Separator />

        {/* Platform */}
        <section>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Platform</h4>
          <select value={platform} onChange={(e) => savePlatform(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] bg-white cursor-pointer focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30">
            <option value="Airbnb">Airbnb</option><option value="VRBO">VRBO</option><option value="Other">Other</option>
          </select>
        </section>

        <Separator />

        {/* Cleaning Team */}
        <section>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Cleaning Team</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Primary</div>
                {property.cleaner_name ? (
                  <div className="text-[13px] text-gray-800 font-medium">{property.cleaner_name}
                    <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${property.cleaner_confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {property.cleaner_confirmed ? 'Active' : 'Invite sent'}
                    </span>
                  </div>
                ) : (
                  <div className="text-[13px] text-gray-400">No cleaner assigned</div>
                )}
                {property.cleaner_email && <div className="text-[11px] text-gray-400">{property.cleaner_email}</div>}
              </div>
              <a href="/settings/cleaners" className="text-[11px] text-coral-400 hover:underline font-medium">
                {property.cleaner_name ? 'Change' : 'Assign'}
              </a>
            </div>
            {property.cleaner_name && (
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Backup</div>
                  {property.backup_cleaner_name ? (
                    <div className="text-[13px] text-gray-800 font-medium">{property.backup_cleaner_name}</div>
                  ) : (
                    <div className="text-[13px] text-gray-400">None</div>
                  )}
                </div>
                <a href="/settings/cleaners" className="text-[11px] text-coral-400 hover:underline font-medium">
                  {property.backup_cleaner_name ? 'Change' : 'Add backup'}
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Main Properties Page ──────────────────────────────────────
export function Properties() {
  const queryClient = useQueryClient();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });

  useEffect(() => {
    if (error) console.warn('GET /api/properties failed:', error.message || error);
  }, [error]);

  useEffect(() => {
    try { if (sessionStorage.getItem(STORAGE_KEY)) setShowModal(true); } catch {}
  }, []);

  function refresh() { queryClient.invalidateQueries({ queryKey: ['properties'] }); }
  const properties = data?.data?.properties || data?.data || [];
  const selected = properties.find(p => p.id === selectedId);

  // Auto-select first on desktop
  useEffect(() => {
    if (isDesktop && !selectedId && properties.length > 0) setSelectedId(properties[0].id);
  }, [isDesktop, properties.length]);

  if (isLoading) return <div className="text-gray-400 text-sm p-6">Loading properties...</div>;

  // Empty state
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Home size={28} className="text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Add your first property to get started.</p>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> Add property</Button>
        <AddPropertyModal open={showModal} onClose={() => setShowModal(false)} onCreated={refresh} />
      </div>
    );
  }

  return (
    <div className="flex h-full -m-6 lg:-m-8">
      {/* List */}
      <div className={`${isDesktop ? 'w-[280px] shrink-0 border-r border-gray-200' : 'flex-1'} ${selected && !isDesktop ? 'hidden' : ''} flex flex-col bg-white`}>
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-[16px] font-semibold text-gray-900">Properties</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {properties.map(p => {
            const cal = calStatus(p.ical_url);
            const isSelected = selectedId === p.id;
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isSelected ? 'bg-coral-50 border-l-2 border-l-coral-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-gray-900 truncate">{p.name}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{p.platform || 'Airbnb'}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cal.cls}`}>{cal.label}</span>
                  <span className={`w-2 h-2 rounded-full ${cleanerDot(p)}`} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-[13px] text-coral-400 font-medium hover:text-coral-500">
            <Plus size={14} /> Add property
          </button>
        </div>
      </div>

      {/* Panel */}
      <div className={`flex-1 min-w-0 bg-gray-50 ${!selected && !isDesktop ? '' : ''} ${selected && !isDesktop ? 'fixed inset-0 z-30 bg-white' : ''}`}>
        {selected ? (
          <PropertyPanel
            key={selected.id}
            property={selected}
            onRefresh={refresh}
            onClose={() => setSelectedId(null)}
            isMobile={!isDesktop}
          />
        ) : isDesktop ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Select a property to view settings
          </div>
        ) : null}
      </div>

      <AddPropertyModal open={showModal} onClose={() => setShowModal(false)} onCreated={refresh} />
    </div>
  );
}

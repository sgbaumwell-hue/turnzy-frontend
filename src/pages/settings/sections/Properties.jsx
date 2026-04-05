import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Check, X, Link, Unlink, Plus, Settings } from 'lucide-react';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';
import { AddPropertyModal, STORAGE_KEY } from '../components/AddPropertyModal';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

function CalendarBadge({ icalUrl, onConnect }) {
  if (!icalUrl) return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">⚠ No calendar connected</span>
      {onConnect && <button onClick={onConnect} className="text-[10px] text-coral-400 hover:underline">Connect calendar →</button>}
    </span>
  );
  if (icalUrl.includes('fake-ical') || icalUrl.includes('test')) {
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Test calendar</span>;
  }
  return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">Calendar connected</span>;
}

function PlatformBadge({ platform }) {
  return <span className="text-[11px] font-medium text-warm-500 bg-warm-100 px-2 py-0.5 rounded">{platform || 'Airbnb'}</span>;
}

function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function PropertyCard({ property, onRefresh }) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(property.name);
  const [editingIcal, setEditingIcal] = useState(false);
  const [icalUrl, setIcalUrl] = useState(property.ical_url || '');
  const [coTime, setCoTime] = useState(property.default_checkout_time || '11:00');
  const [ciTime, setCiTime] = useState(property.default_checkin_time || '15:00');
  const [timezone, setTimezone] = useState(property.timezone || 'America/New_York');
  const [platform, setPlatform] = useState(property.platform || 'Airbnb');
  const [saving, setSaving] = useState(null);

  async function saveTimes() {
    setSaving('times');
    try { await settingsApi.updatePropertyTimes(property.id, coTime, ciTime); toast('Times updated'); onRefresh(); }
    catch { toast('Failed to save times', 'error'); }
    setSaving(null);
  }
  async function saveTimezone(tz) {
    setTimezone(tz);
    try { await settingsApi.updatePropertyTimezone(property.id, tz); toast('Timezone updated'); }
    catch { toast('Failed to save timezone', 'error'); }
  }
  async function savePlatform(p) {
    setPlatform(p);
    try { await settingsApi.updatePropertyPlatform(property.id, p); toast('Platform updated'); }
    catch { toast('Failed to update platform', 'error'); }
  }
  async function saveName() {
    setSaving('name');
    try { await settingsApi.updatePropertyName(property.id, name); toast('Name updated'); setEditingName(false); onRefresh(); }
    catch { toast('Failed to update name', 'error'); }
    setSaving(null);
  }
  async function saveIcal() {
    setSaving('ical');
    try { await settingsApi.updateIcal(property.id, icalUrl); toast('Calendar updated'); setEditingIcal(false); onRefresh(); }
    catch { toast('Failed to update calendar', 'error'); }
    setSaving(null);
  }
  async function disconnectIcal() {
    if (!confirm('Disconnect calendar?')) return;
    try { await settingsApi.disconnectIcal(property.id); toast('Disconnected'); setIcalUrl(''); onRefresh(); }
    catch { toast('Failed', 'error'); }
  }
  async function switchToTest() {
    setSaving('test');
    try {
      const res = await settingsApi.generateTestCalendar(property.id);
      const url = res.data?.fake_url;
      if (url) { await settingsApi.updateIcal(property.id, url); setIcalUrl(url); }
      toast('Test calendar enabled'); onRefresh();
    } catch { toast('Failed', 'error'); }
    setSaving(null);
  }

  return (
    <div className="bg-white border border-warm-200 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        {editingName ? (
          <div className="flex items-center gap-2 flex-1 mr-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-2 py-1 border border-warm-200 rounded text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-coral-400" autoFocus />
            <button onClick={saveName} disabled={saving === 'name'} className="p-1 text-green-600"><Check size={16} /></button>
            <button onClick={() => { setEditingName(false); setName(property.name); }} className="p-1 text-warm-400"><X size={16} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-bold text-warm-900">{property.name}</h3>
            <button onClick={() => setEditingName(true)} className="p-0.5 text-warm-400 hover:text-warm-600"><Pencil size={13} /></button>
          </div>
        )}
        <div className="flex items-center gap-2 flex-shrink-0">
          <PlatformBadge platform={property.platform} />
          <CalendarBadge icalUrl={property.ical_url} onConnect={() => { setExpanded(true); setEditingIcal(true); }} />
        </div>
      </div>

      {/* Summary */}
      <div className="text-[13px] text-warm-500 mb-3">
        Checkout {fmtTime(property.default_checkout_time)} · Check-in {fmtTime(property.default_checkin_time)} · {property.timezone || 'America/New_York'}
      </div>

      {/* Edit toggle */}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-[12px] text-coral-400 font-medium hover:text-coral-500">
        <Settings size={13} /> {expanded ? 'Close settings' : 'Edit settings'}
      </button>

      {/* Expanded edit */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-warm-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-warm-500 block mb-1">Platform</label>
              <select value={platform} onChange={(e) => savePlatform(e.target.value)} className="w-full px-2 py-1.5 border border-warm-200 rounded-lg text-[13px] bg-white cursor-pointer">
                <option value="Airbnb">Airbnb</option><option value="VRBO">VRBO</option><option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-warm-500 block mb-1">Timezone</label>
              <select value={timezone} onChange={(e) => saveTimezone(e.target.value)} className="w-full px-2 py-1.5 border border-warm-200 rounded-lg text-[13px] bg-white cursor-pointer">
                {US_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div><label className="text-[11px] text-warm-500 block mb-1">Checkout</label><input type="time" value={coTime} onChange={(e) => setCoTime(e.target.value)} className="px-2 py-1.5 border border-warm-200 rounded text-[13px]" /></div>
            <div><label className="text-[11px] text-warm-500 block mb-1">Check-in</label><input type="time" value={ciTime} onChange={(e) => setCiTime(e.target.value)} className="px-2 py-1.5 border border-warm-200 rounded text-[13px]" /></div>
            <button onClick={saveTimes} disabled={saving === 'times'} className="px-3 py-1.5 bg-coral-400 text-white text-[12px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">{saving === 'times' ? 'Saving...' : 'Save times'}</button>
          </div>
          <div>
            <div className="text-[11px] text-warm-500 mb-1">Calendar (iCal)</div>
            {property.ical_url && !editingIcal && <div className="text-[12px] text-warm-600 mb-2 truncate">{property.ical_url}</div>}
            {editingIcal ? (
              <div className="space-y-2">
                <input value={icalUrl} onChange={(e) => setIcalUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" autoFocus />
                <div className="flex gap-2">
                  <button onClick={saveIcal} disabled={saving === 'ical'} className="px-3 py-1.5 bg-coral-400 text-white text-[12px] font-medium rounded-lg disabled:opacity-50">Save</button>
                  <button onClick={() => setEditingIcal(false)} className="px-3 py-1.5 border border-warm-200 text-[12px] rounded-lg text-warm-600">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setEditingIcal(true)} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-700 hover:bg-warm-50"><Link size={12} /> {property.ical_url ? 'Edit URL' : 'Connect'}</button>
                {property.ical_url && <button onClick={disconnectIcal} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-red-600 hover:bg-red-50"><Unlink size={12} /> Disconnect</button>}
                <button onClick={switchToTest} disabled={saving === 'test'} className="px-3 py-1.5 border border-blue-300 text-[12px] font-medium rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50">Test calendar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Properties() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });

  // Log if the properties endpoint fails
  useEffect(() => {
    if (error) {
      console.warn('GET /api/properties failed:', error.message || error);
    }
  }, [error]);

  // Auto-open modal if wizard state exists in sessionStorage (survives reload)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setShowModal(true);
      }
    } catch {}
  }, []);

  function refresh() { queryClient.invalidateQueries({ queryKey: ['properties'] }); }
  const properties = data?.data?.properties || data?.data || [];

  if (isLoading) return <div className="text-warm-400 text-sm">Loading properties...</div>;

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Properties</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage your property settings, calendars, and times.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map(p => <PropertyCard key={p.id} property={p} onRefresh={refresh} />)}

        {/* Add property card */}
        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-warm-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-warm-400 hover:text-coral-400 hover:border-coral-300 transition-colors min-h-[140px]"
        >
          <Plus size={24} />
          <span className="text-[14px] font-medium">Add property</span>
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3 max-w-xs mx-auto">A property connects to your Airbnb calendar. Add one to start tracking turnovers and notifying your cleaner automatically.</p>

      <AddPropertyModal open={showModal} onClose={() => setShowModal(false)} onCreated={refresh} />
    </div>
  );
}

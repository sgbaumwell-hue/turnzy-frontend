import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Check, X, Link, Unlink } from 'lucide-react';
import { propertiesApi } from '../../../api/properties';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

function CalendarBadge({ icalUrl }) {
  if (!icalUrl) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warm-400 bg-warm-100 px-2 py-0.5 rounded">No calendar</span>;
  if (icalUrl.includes('fake-ical') || icalUrl.includes('test')) {
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Test calendar active</span>;
  }
  return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">Calendar connected</span>;
}

function PropertyCard({ property, onRefresh }) {
  const toast = useToast();
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
    try {
      await settingsApi.updatePropertyTimes(property.id, coTime, ciTime);
      toast('Times updated');
      onRefresh();
    } catch { toast('Failed to save times', 'error'); }
    setSaving(null);
  }

  async function saveTimezone(tz) {
    setTimezone(tz);
    try {
      await settingsApi.updatePropertyTimezone(property.id, tz);
      toast('Timezone updated');
    } catch { toast('Failed to save timezone', 'error'); }
  }

  async function savePlatform(p) {
    setPlatform(p);
    try {
      await settingsApi.updatePropertyPlatform(property.id, p);
      toast('Platform updated');
    } catch { toast('Failed to update platform', 'error'); }
  }

  async function saveName() {
    setSaving('name');
    try {
      await settingsApi.updatePropertyName(property.id, name);
      toast('Name updated');
      setEditingName(false);
      onRefresh();
    } catch { toast('Failed to update name', 'error'); }
    setSaving(null);
  }

  async function saveIcal() {
    setSaving('ical');
    try {
      await settingsApi.updateIcal(property.id, icalUrl);
      toast('Calendar URL updated');
      setEditingIcal(false);
      onRefresh();
    } catch { toast('Failed to update calendar', 'error'); }
    setSaving(null);
  }

  async function disconnectIcal() {
    if (!confirm('Disconnect calendar for this property?')) return;
    try {
      await settingsApi.disconnectIcal(property.id);
      toast('Calendar disconnected');
      setIcalUrl('');
      onRefresh();
    } catch { toast('Failed to disconnect', 'error'); }
  }

  async function switchToTest() {
    setSaving('test');
    try {
      const res = await settingsApi.generateTestCalendar(property.id);
      const fakeUrl = res.data?.fake_url;
      if (fakeUrl) {
        await settingsApi.updateIcal(property.id, fakeUrl);
        setIcalUrl(fakeUrl);
      }
      toast('Test calendar enabled');
      onRefresh();
    } catch { toast('Failed to enable test calendar', 'error'); }
    setSaving(null);
  }

  const isTestCal = icalUrl && (icalUrl.includes('fake-ical') || icalUrl.includes('test'));

  return (
    <div className="bg-white border border-warm-200 rounded-xl overflow-hidden mb-3">
      {/* Name + Platform */}
      <div className="p-4 border-b border-warm-100">
        <div className="flex items-center justify-between mb-2">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-2 py-1 border border-warm-200 rounded text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-coral-400" autoFocus />
              <button onClick={saveName} disabled={saving === 'name'} className="p-1 text-green-600 hover:text-green-700"><Check size={16} /></button>
              <button onClick={() => { setEditingName(false); setName(property.name); }} className="p-1 text-warm-400 hover:text-warm-600"><X size={16} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold text-warm-900">{property.name}</h3>
              <button onClick={() => setEditingName(true)} className="p-0.5 text-warm-400 hover:text-warm-600"><Pencil size={13} /></button>
            </div>
          )}
          <CalendarBadge icalUrl={property.ical_url} />
        </div>
        <div className="flex items-center gap-2">
          <select value={platform} onChange={(e) => savePlatform(e.target.value)} className="text-[12px] px-2 py-1 border border-warm-200 rounded-lg bg-white text-warm-700 cursor-pointer">
            <option value="Airbnb">Airbnb</option>
            <option value="VRBO">VRBO</option>
          </select>
        </div>
      </div>

      {/* Times */}
      <div className="p-4 border-b border-warm-100">
        <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-2">Default Times</div>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-[11px] text-warm-500 block">Checkout</label>
            <input type="time" value={coTime} onChange={(e) => setCoTime(e.target.value)} className="px-2 py-1 border border-warm-200 rounded text-[13px] font-medium" />
          </div>
          <div>
            <label className="text-[11px] text-warm-500 block">Check-in</label>
            <input type="time" value={ciTime} onChange={(e) => setCiTime(e.target.value)} className="px-2 py-1 border border-warm-200 rounded text-[13px] font-medium" />
          </div>
          <button onClick={saveTimes} disabled={saving === 'times'} className="mt-4 px-3 py-1 bg-coral-400 text-white text-[12px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">
            {saving === 'times' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Timezone */}
      <div className="p-4 border-b border-warm-100">
        <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-2">Timezone</div>
        <select value={timezone} onChange={(e) => saveTimezone(e.target.value)} className="px-3 py-1.5 border border-warm-200 rounded-lg text-[13px] bg-white text-warm-700 cursor-pointer">
          {US_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      {/* iCal */}
      <div className="p-4">
        <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-2">Calendar (iCal)</div>
        {property.ical_url && !editingIcal && (
          <div className="text-[13px] text-warm-700 mb-2 truncate">{property.ical_url}</div>
        )}
        {editingIcal ? (
          <div className="space-y-2">
            <input value={icalUrl} onChange={(e) => setIcalUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-warm-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" autoFocus />
            <div className="flex gap-2">
              <button onClick={saveIcal} disabled={saving === 'ical'} className="px-3 py-1.5 bg-coral-400 text-white text-[12px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">Save</button>
              <button onClick={() => setEditingIcal(false)} className="px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-600 hover:bg-warm-50">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setEditingIcal(true)} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-warm-700 hover:bg-warm-50">
              <Link size={12} /> {property.ical_url ? 'Edit URL' : 'Connect calendar'}
            </button>
            {property.ical_url && (
              <button onClick={disconnectIcal} className="flex items-center gap-1 px-3 py-1.5 border border-warm-200 text-[12px] font-medium rounded-lg text-red-600 hover:bg-red-50">
                <Unlink size={12} /> Disconnect
              </button>
            )}
            <button onClick={switchToTest} disabled={saving === 'test'} className="px-3 py-1.5 border border-blue-300 text-[12px] font-medium rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50">
              {isTestCal ? 'Switch to real calendar' : 'Switch to test calendar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Properties() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  }

  const properties = data?.data?.properties || data?.data || [];

  if (isLoading) return <div className="text-warm-400 text-sm">Loading properties...</div>;

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Properties</h2>
      <p className="text-[13px] text-warm-400 mb-5">Manage your property settings, calendars, and times.</p>

      {properties.length === 0 && (
        <div className="bg-white border border-warm-200 rounded-xl p-6 text-center text-warm-400 text-[14px]">
          No properties found. Add a property to get started.
        </div>
      )}

      {properties.map(p => <PropertyCard key={p.id} property={p} onRefresh={refresh} />)}

      <button
        onClick={() => { console.log('add property'); toast('Coming soon — property onboarding flow'); }}
        className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-white border border-warm-200 rounded-xl text-[14px] font-medium text-coral-400 hover:bg-warm-50"
      >
        + Add property
      </button>
    </div>
  );
}

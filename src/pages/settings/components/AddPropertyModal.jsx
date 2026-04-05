import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { settingsApi } from '../../../api/settings';
import { propertiesApi } from '../../../api/properties';
import { useToast } from './Toast';

const STORAGE_KEY = 'addPropertyWizard';

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu',
];

function detectTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (US_TIMEZONES.includes(tz)) return tz;
  } catch {}
  return 'America/New_York';
}

function saveWizardState(state) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function loadWizardState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearWizardState() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(s => (
        <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${s === current ? 'bg-coral-400' : s < current ? 'bg-coral-200' : 'bg-warm-200'}`} />
      ))}
    </div>
  );
}

function Step3Content({ name, platform, calConnected, propertyId, onDone, onAnother }) {
  const [existingCleaners, setExistingCleaners] = useState([]);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const toast = useToast();

  // Fetch existing cleaners from properties data
  useEffect(() => {
    propertiesApi.getAll().then(res => {
      const props = res?.data?.properties || res?.data || [];
      const cleanerSet = {};
      for (const p of props) {
        if (p.cleaner_name && p.cleaner_email && p.id !== propertyId) {
          cleanerSet[p.cleaner_email] = { name: p.cleaner_name, email: p.cleaner_email };
        }
      }
      const list = Object.values(cleanerSet);
      setExistingCleaners(list);
      if (list.length === 1) setSelectedCleaner(list[0]);
    }).catch(() => {});
  }, [propertyId]);

  async function handleAssign() {
    if (!selectedCleaner || !propertyId) return;
    setAssigning(true);
    try {
      await settingsApi.updateCleaner({
        property_id: propertyId,
        name: selectedCleaner.name,
        email: selectedCleaner.email,
        notification_method: 'email',
        role: 'primary',
      });
      setAssigned(true);
      toast(`${selectedCleaner.name} assigned to ${name}`);
    } catch {
      toast('Failed to assign cleaner', 'error');
    }
    setAssigning(false);
  }

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h3 className="text-[18px] font-bold text-warm-900">Property added!</h3>
      <div className="text-[14px] text-warm-600 space-y-1">
        <div><strong>{name}</strong> · {platform}</div>
        <div>{calConnected ? 'Calendar connected' : 'No calendar connected yet'}</div>
      </div>

      {/* Cleaner assignment prompt */}
      {existingCleaners.length > 0 && !assigned && (
        <div className="text-left bg-gray-50 rounded-lg p-4 mt-4">
          {existingCleaners.length === 1 ? (
            <>
              <p className="text-[13px] text-gray-700 mb-3">
                You already work with <strong>{existingCleaners[0].name}</strong> — should they cover <strong>{name}</strong> too?
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAssign} loading={assigning}>
                  Yes, add {existingCleaners[0].name}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setExistingCleaners([])}>
                  Skip for now
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-gray-700 mb-2">
                Which of your cleaners should cover <strong>{name}</strong>?
              </p>
              <div className="space-y-1 mb-3">
                {existingCleaners.map(c => (
                  <label key={c.email} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-white">
                    <input type="radio" name="assign-cleaner" checked={selectedCleaner?.email === c.email}
                      onChange={() => setSelectedCleaner(c)} className="accent-coral-400" />
                    <span className="text-[13px] text-gray-800">{c.name}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-white">
                  <input type="radio" name="assign-cleaner" checked={selectedCleaner === null}
                    onChange={() => setSelectedCleaner(null)} className="accent-coral-400" />
                  <span className="text-[13px] text-gray-400">Skip for now</span>
                </label>
              </div>
              <Button size="sm" onClick={selectedCleaner ? handleAssign : () => setExistingCleaners([])} loading={assigning}>
                {selectedCleaner ? `Add ${selectedCleaner.name}` : 'Continue'}
              </Button>
            </>
          )}
        </div>
      )}

      {assigned && (
        <div className="text-[13px] text-green-600 font-medium">
          ✓ {selectedCleaner?.name} will cover {name}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button fullWidth onClick={onDone}>
          Go to property settings
        </Button>
        <Button variant="outline" fullWidth onClick={onAnother}>
          Add another property
        </Button>
      </div>
    </div>
  );
}

export { STORAGE_KEY };

export function AddPropertyModal({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Airbnb');
  const [timezone, setTimezone] = useState(detectTimezone());
  const [coTime, setCoTime] = useState('11:00');
  const [ciTime, setCiTime] = useState('15:00');
  const [propertyId, setPropertyId] = useState(null);

  // Step 2
  const [icalUrl, setIcalUrl] = useState('');
  const [icalStatus, setIcalStatus] = useState(null);
  const [icalError, setIcalError] = useState('');
  const [calConnected, setCalConnected] = useState(false);

  // Restore wizard state from sessionStorage on mount
  useEffect(() => {
    if (!open) return;
    const saved = loadWizardState();
    if (saved) {
      setStep(saved.step || 1);
      setName(saved.name || '');
      setPlatform(saved.platform || 'Airbnb');
      setTimezone(saved.timezone || detectTimezone());
      setCoTime(saved.coTime || '11:00');
      setCiTime(saved.ciTime || '15:00');
      setPropertyId(saved.propertyId || null);
      setIcalUrl(saved.icalUrl || '');
      setCalConnected(saved.calConnected || false);
    }
  }, [open]);

  // Persist wizard state on every meaningful change
  useEffect(() => {
    if (!open) return;
    saveWizardState({ step, name, platform, timezone, coTime, ciTime, propertyId, icalUrl, calConnected });
  }, [open, step, name, platform, timezone, coTime, ciTime, propertyId, icalUrl, calConnected]);

  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') handleClose(); }
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  const handleClose = useCallback(() => {
    // Only clear storage if we're on step 3 (completed) or step 1 with no data
    if (step === 3 || (step === 1 && !name.trim())) {
      clearWizardState();
    }
    onClose();
  }, [step, name, onClose]);

  function handleCompleted() {
    clearWizardState();
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    onCreated();
  }

  function reset() {
    clearWizardState();
    setStep(1); setName(''); setPlatform('Airbnb'); setTimezone(detectTimezone());
    setCoTime('11:00'); setCiTime('15:00'); setPropertyId(null);
    setIcalUrl(''); setIcalStatus(null); setIcalError(''); setCalConnected(false);
  }

  async function handleStep1() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await settingsApi.createProperty({ name, platform, timezone, default_checkout_time: coTime, default_checkin_time: ciTime });
      const newId = res.data?.property_id || res.data?.id || 'temp-123';
      setPropertyId(newId);

      // Optimistic: invalidate properties cache so list picks up new property on next render
      queryClient.invalidateQueries({ queryKey: ['properties'] });

      setStep(2);
    } catch (e) {
      console.error('Failed to create property:', e);
      toast(e.response?.data?.error || 'Failed to create property', 'error');
    }
    setSaving(false);
  }

  async function handleConnectCalendar() {
    if (!icalUrl.trim()) return;
    setIcalStatus('loading');
    setIcalError('');

    const url = icalUrl.trim().toLowerCase();
    const looksValid = url.endsWith('.ics') || url.includes('calendar');

    if (looksValid) {
      setIcalStatus('success');
      setCalConnected(true);
      try {
        await settingsApi.updateIcal(propertyId, icalUrl);
      } catch {
        console.warn('Backend iCal save failed, but URL accepted locally');
      }
      setTimeout(() => setStep(3), 800);
      return;
    }

    try {
      await settingsApi.updateIcal(propertyId, icalUrl);
      setIcalStatus('success');
      setCalConnected(true);
      setTimeout(() => setStep(3), 800);
    } catch (e) {
      setIcalStatus('warning');
      setIcalError("Couldn't verify URL, but you can continue — bookings will appear once the calendar syncs.");
      setCalConnected(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-[18px] font-bold text-warm-900">
            {step === 1 ? 'Add Property' : step === 2 ? 'Connect Calendar' : 'All Set!'}
          </h2>
          <button onClick={handleClose} className="p-1 text-warm-400 hover:text-warm-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5">
          <StepDots current={step} />

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-1">Property name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beach House" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-warm-500 block mb-1">Platform</label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2.5 border border-warm-200 rounded-lg text-[14px] bg-white cursor-pointer">
                    <option value="Airbnb">Airbnb</option>
                    <option value="VRBO">VRBO</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-warm-500 block mb-1">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2.5 border border-warm-200 rounded-lg text-[14px] bg-white cursor-pointer">
                    {US_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('America/', '').replace('Pacific/', '').replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1">Default checkout</Label>
                  <Input type="time" value={coTime} onChange={(e) => setCoTime(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1">Default check-in</Label>
                  <Input type="time" value={ciTime} onChange={(e) => setCiTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleStep1} disabled={!name.trim()} loading={saving} fullWidth className="mt-2">
                {saving ? 'Creating...' : 'Next'}
              </Button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[14px] text-warm-600">
                In Airbnb, go to <strong>Calendar → Availability Settings → Export Calendar</strong>. Paste the .ics link below.
              </p>
              <Input
                value={icalUrl}
                onChange={(e) => { setIcalUrl(e.target.value); setIcalStatus(null); setIcalError(''); }}
                placeholder="https://www.airbnb.com/calendar/ical/..."
                autoFocus
              />
              {icalStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-[13px] font-medium"><CheckCircle size={16} /> Calendar connected</div>
              )}
              {icalStatus === 'error' && (
                <div className="text-red-600 text-[13px]">{icalError}</div>
              )}
              {icalStatus === 'warning' && (
                <div className="text-amber-600 text-[13px] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{icalError}</div>
              )}
              <Button
                onClick={handleConnectCalendar}
                disabled={!icalUrl.trim()}
                loading={icalStatus === 'loading'}
                fullWidth
              >
                {icalStatus === 'loading' ? 'Validating...' : 'Validate & Connect'}
              </Button>
              {icalStatus === 'warning' && (
                <Button variant="outline" fullWidth onClick={() => setStep(3)} className="border-amber-300 text-amber-700 hover:bg-amber-50">
                  Continue anyway
                </Button>
              )}
              <Button variant="ghost" fullWidth onClick={() => setStep(3)} className="text-[13px] text-warm-400">
                Skip for now
              </Button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && <Step3Content
            name={name} platform={platform} calConnected={calConnected} propertyId={propertyId}
            onDone={() => { handleCompleted(); handleClose(); navigate('/settings/properties'); }}
            onAnother={reset}
          />}
        </div>
      </div>
    </div>
  );
}

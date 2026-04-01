import { useState } from 'react';
import { settingsApi } from '../../../api/settings';
import { useToast } from '../components/Toast';

const DEFAULT_PREFS = {
  unconfirmed_alerts: true,
  reminder_followup: true,
  cleaner_response: true,
  late_30min: false,
  late_1hr: true,
  late_2hr: false,
  job_completed: true,
  issue_reported: true,
};

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between py-3.5 px-5 cursor-pointer hover:bg-warm-50 transition-colors">
      <span className="text-[14px] text-warm-800">{label}</span>
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-coral-400' : 'bg-warm-200'}`} onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </label>
  );
}

export function Notifications() {
  const toast = useToast();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  function set(key, val) { setPrefs(prev => ({ ...prev, [key]: val })); }

  async function save() {
    setSaving(true);
    try { await settingsApi.saveNotificationPrefs(prefs); toast('Notification preferences saved'); }
    catch { toast('Failed to save preferences', 'error'); }
    setSaving(false);
  }

  return (
    <div>
      <h2 className="text-[20px] font-bold text-warm-900 mb-1">Notifications</h2>
      <p className="text-[13px] text-warm-400 mb-5">Configure when and how you receive alerts.</p>

      <div className="bg-white border border-warm-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-warm-100 bg-warm-50/50">
          <span className="text-[11px] font-bold text-warm-400 uppercase tracking-wider">Cleaner Confirmation Alerts</span>
        </div>
        <Toggle label="Unconfirmed booking alerts" checked={prefs.unconfirmed_alerts} onChange={(v) => set('unconfirmed_alerts', v)} />
        <Toggle label="Reminder follow-up alerts" checked={prefs.reminder_followup} onChange={(v) => set('reminder_followup', v)} />
        <Toggle label="Cleaner accepted/declined notifications" checked={prefs.cleaner_response} onChange={(v) => set('cleaner_response', v)} />

        <div className="px-5 py-3 border-t border-b border-warm-100 bg-warm-50/50">
          <span className="text-[11px] font-bold text-warm-400 uppercase tracking-wider">Late Start Alerts</span>
        </div>
        <Toggle label="Alert after 30 minutes" checked={prefs.late_30min} onChange={(v) => set('late_30min', v)} />
        <Toggle label="Alert after 1 hour" checked={prefs.late_1hr} onChange={(v) => set('late_1hr', v)} />
        <Toggle label="Alert after 2 hours" checked={prefs.late_2hr} onChange={(v) => set('late_2hr', v)} />

        <div className="px-5 py-3 border-t border-b border-warm-100 bg-warm-50/50">
          <span className="text-[11px] font-bold text-warm-400 uppercase tracking-wider">Job Completion</span>
        </div>
        <Toggle label="Notify when cleaning completed" checked={prefs.job_completed} onChange={(v) => set('job_completed', v)} />
        <Toggle label="Notify when issue reported" checked={prefs.issue_reported} onChange={(v) => set('issue_reported', v)} />

        <div className="px-5 py-4 border-t border-warm-100">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-coral-400 text-white text-[14px] font-semibold rounded-lg hover:bg-coral-500 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

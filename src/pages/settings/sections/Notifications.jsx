import { useState } from 'react';
import { Switch } from '@/components/shadcn/switch';
import { Button } from '@/components/shadcn/button';
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
      <Switch checked={checked} onCheckedChange={onChange} />
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
    <div className="pb-32">
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
        <p className="text-xs text-gray-400 px-5 pt-3 pb-1 leading-relaxed">Alert me if cleaning hasn't started by this long after the scheduled checkout. You can enable multiple thresholds to get alerts at each one.</p>
        <Toggle label="Alert after 30 minutes" checked={prefs.late_30min} onChange={(v) => set('late_30min', v)} />
        <Toggle label="Alert after 1 hour" checked={prefs.late_1hr} onChange={(v) => set('late_1hr', v)} />
        <Toggle label="Alert after 2 hours" checked={prefs.late_2hr} onChange={(v) => set('late_2hr', v)} />

        <div className="px-5 py-3 border-t border-b border-warm-100 bg-warm-50/50">
          <span className="text-[11px] font-bold text-warm-400 uppercase tracking-wider">Job Completion</span>
        </div>
        <Toggle label="Notify when cleaning completed" checked={prefs.job_completed} onChange={(v) => set('job_completed', v)} />
        <Toggle label="Notify when issue reported" checked={prefs.issue_reported} onChange={(v) => set('issue_reported', v)} />

        <div className="px-5 py-4 border-t border-warm-100">
          <Button onClick={save} loading={saving}>
            {saving ? 'Saving...' : 'Save preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}

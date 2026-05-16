import { useState, useEffect } from 'react';
import { Switch } from '@/components/shadcn/switch';
import { Button } from '@/components/shadcn/button';
import { cleanerApi } from '../../../api/cleaner';

const DEFAULT_PREFS = {
  notification_method: 'email',
  new_job: true,
  modified_job: true,
  cancellation: true,
  day_before_reminder: true,
  day_before_time: '19:00',
  morning_of_reminder: false,
  morning_of_time: '07:00',
};

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between py-3.5 px-5 cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-[14px] text-gray-800">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function MethodLabel() {
  return (
    <div className="flex items-center gap-1 py-3.5 px-5">
      <span className="text-[14px] text-gray-800 flex-1">Notification method</span>
      <span className="text-[13px] text-gray-500">Email</span>
    </div>
  );
}

export function TeamSettingsNotifications() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    cleanerApi.getNotificationPrefs().then(res => {
      const saved = res?.data?.prefs;
      if (saved) {
        setPrefs({
          notification_method: saved.notification_method || 'email',
          new_job: saved.new_job_alerts !== false,
          modified_job: saved.modified_job_alerts !== false,
          cancellation: saved.cancellation_alerts !== false,
          day_before_reminder: saved.day_before_reminder !== false,
          day_before_time: saved.day_before_time || '19:00',
          morning_of_reminder: saved.morning_reminder === true,
          morning_of_time: saved.morning_time || '07:00',
        });
      }
    }).catch(() => {});
  }, []);

  function set(key, val) { setPrefs(p => ({ ...p, [key]: val })); setSaved(false); }

  async function save() {
    setSaving(true);
    try {
      await cleanerApi.saveNotificationPrefs(prefs);
      setSaved(true);
    } catch { alert('Failed to save'); }
    setSaving(false);
  }

  return (
    <div className="pb-32">
      <h2 className="text-[20px] font-bold text-gray-900 mb-1">Notifications</h2>
      <p className="text-[13px] text-gray-400 mb-5">Configure when and how you receive alerts about your assignments.</p>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Job Notifications</span>
        </div>
        <MethodLabel />
        <Toggle label="New assignment notifications" checked={prefs.new_job} onChange={(v) => set('new_job', v)} />
        <Toggle label="Modified job notifications" checked={prefs.modified_job} onChange={(v) => set('modified_job', v)} />
        <Toggle label="Cancellation notifications" checked={prefs.cancellation} onChange={(v) => set('cancellation', v)} />

        <div className="px-5 py-3 border-t border-b border-gray-100 bg-gray-50/50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reminders</span>
        </div>
        <div>
          <Toggle label="Day-before reminder — send at:" checked={prefs.day_before_reminder} onChange={(v) => set('day_before_reminder', v)} />
          {prefs.day_before_reminder && (
            <div className="px-5 pb-3 -mt-1">
              <input type="time" value={prefs.day_before_time} onChange={(e) => set('day_before_time', e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded text-[13px] font-medium" />
            </div>
          )}
        </div>
        <div>
          <Toggle label="Morning-of reminder" checked={prefs.morning_of_reminder} onChange={(v) => set('morning_of_reminder', v)} />
          {prefs.morning_of_reminder && (
            <div className="px-5 pb-3 -mt-1">
              <input type="time" value={prefs.morning_of_time} onChange={(e) => set('morning_of_time', e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded text-[13px] font-medium" />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <Button onClick={save} loading={saving} fullWidth>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}

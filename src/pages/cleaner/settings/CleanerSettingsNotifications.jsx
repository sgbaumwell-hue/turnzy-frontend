import { useState, useEffect } from 'react';
import { cleanerApi } from '../../../api/cleaner';
import { useAuthStore } from '../../../store/authStore';

const DEFAULT_PREFS = {
  notification_method: 'email',
  new_job: true,
  modified_job: true,
  cancellation: true,
  advance_notice_days: 60,
  day_before_reminder: true,
  day_before_time: '19:00',
  morning_of_reminder: false,
  morning_of_time: '07:00',
  team_confirmed: true,
  team_declined: true,
  team_completed: true,
  team_issue: true,
};

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between py-3.5 px-5 cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-[14px] text-gray-800">{label}</span>
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-coral-400' : 'bg-gray-200'}`} onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </label>
  );
}

function MethodToggle({ value, onChange }) {
  const options = ['email', 'sms', 'both'];
  return (
    <div className="flex items-center gap-1 py-3.5 px-5">
      <span className="text-[14px] text-gray-800 flex-1">Notification method</span>
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors capitalize ${value === o ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            {o === 'both' ? 'Both' : o.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CleanerSettingsNotifications() {
  const { user } = useAuthStore();
  const hasTeam = user?.has_team || false;
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved prefs on mount
  useEffect(() => {
    cleanerApi.getNotificationPrefs().then(res => {
      const saved = res?.data?.prefs;
      if (saved) {
        setPrefs({
          notification_method: saved.notification_method || 'email',
          new_job: saved.new_job_alerts !== false,
          modified_job: saved.modified_job_alerts !== false,
          cancellation: saved.cancellation_alerts !== false,
          advance_notice_days: saved.notification_window_days || 60,
          day_before_reminder: saved.day_before_reminder !== false,
          day_before_time: saved.day_before_time || '19:00',
          morning_of_reminder: saved.morning_reminder === true,
          morning_of_time: saved.morning_time || '07:00',
          team_confirmed: saved.team_confirmed_alerts !== false,
          team_declined: saved.team_declined_alerts !== false,
          team_completed: saved.team_completed_alerts !== false,
          team_issue: saved.team_issue_alerts !== false,
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
    <div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-1">Notifications</h2>
      <p className="text-[13px] text-gray-400 mb-5">Configure when and how you receive alerts.</p>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Job Notifications */}
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Job Notifications</span>
        </div>
        <MethodToggle value={prefs.notification_method} onChange={(v) => set('notification_method', v)} />
        <Toggle label="New job notifications" checked={prefs.new_job} onChange={(v) => set('new_job', v)} />
        <Toggle label="Modified job notifications" checked={prefs.modified_job} onChange={(v) => set('modified_job', v)} />
        <Toggle label="Cancellation notifications" checked={prefs.cancellation} onChange={(v) => set('cancellation', v)} />

        {/* Advance Notice */}
        <div className="px-5 py-3 border-t border-b border-gray-100 bg-gray-50/50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Advance Notice</span>
        </div>
        <div className="py-3.5 px-5">
          <div className="text-[14px] text-gray-800 mb-2">How far in advance do you want to be notified?</div>
          <div className="flex gap-1.5 flex-wrap">
            {[7, 14, 30, 60, 90].map(d => (
              <button key={d} onClick={() => set('advance_notice_days', d)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors ${prefs.advance_notice_days === d ? 'bg-coral-400 text-white border-coral-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {d} days
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 mt-2">Bookings further out than this will be queued until they enter your window.</div>
        </div>

        {/* Reminders */}
        <div className="px-5 py-3 border-t border-b border-gray-100 bg-gray-50/50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reminders</span>
        </div>
        <div>
          <Toggle label="Day-before reminder" checked={prefs.day_before_reminder} onChange={(v) => set('day_before_reminder', v)} />
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

        {/* Team Notifications */}
        {hasTeam && (
          <>
            <div className="px-5 py-3 border-t border-b border-gray-100 bg-gray-50/50">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Team Notifications</span>
            </div>
            <Toggle label="Team member confirmed" checked={prefs.team_confirmed} onChange={(v) => set('team_confirmed', v)} />
            <Toggle label="Team member declined" checked={prefs.team_declined} onChange={(v) => set('team_declined', v)} />
            <Toggle label="Team member completed a job" checked={prefs.team_completed} onChange={(v) => set('team_completed', v)} />
            <Toggle label="Team member reported an issue" checked={prefs.team_issue} onChange={(v) => set('team_issue', v)} />
          </>
        )}

        {/* Save */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button onClick={save} disabled={saving} className="w-full py-2.5 bg-coral-400 text-white text-[14px] font-semibold rounded-lg hover:bg-coral-500 disabled:opacity-50">
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

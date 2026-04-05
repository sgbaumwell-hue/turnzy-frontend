import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Send, Users } from 'lucide-react';
import { cleanerApi } from '../../../api/cleaner';
import { useAuthStore } from '../../../store/authStore';

function StatusBadge({ status }) {
  const map = {
    active: { label: 'Active', cls: 'bg-green-50 text-green-700' },
    invited: { label: 'Invite Pending', cls: 'bg-amber-50 text-amber-700' },
  };
  const s = map[status] || map.invited;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${s.cls}`}>{s.label}</span>;
}

export function CleanerSettingsTeam() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const hasTeam = user?.has_team || false;
  const [toggling, setToggling] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [addError, setAddError] = useState(null);

  const { data, refetch } = useQuery({
    queryKey: ['cleaner-team'],
    queryFn: () => cleanerApi.getTeam(),
    enabled: hasTeam,
  });
  const teamMembers = data?.data?.team_members || [];

  async function handleToggle() {
    const newVal = !hasTeam;
    if (hasTeam && teamMembers.length > 0) {
      if (!confirm("Turning this off hides team features but won't remove your team members. You can turn it back on anytime.")) return;
    }
    setToggling(true);
    try {
      await cleanerApi.toggleTeam(newVal);
      setUser({ ...user, has_team: newVal });
      if (newVal) refetch();
    } catch { alert('Failed to update'); }
    setToggling(false);
  }

  const [toast, setToast] = useState(null);
  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 5000); }

  async function handleAdd() {
    if (!email.trim()) return;
    setSaving(true); setAddError(null);
    try {
      const res = await cleanerApi.addTeamMember({ name, email });
      setName(''); setEmail(''); setAdding(false);
      queryClient.invalidateQueries({ queryKey: ['cleaner-team'] });
      if (res.data?.email_sent === false) {
        showToast('Team member added but invite email failed to send. Check their email address and try resending.', 'warning');
      } else {
        showToast(`Invite sent to ${email}`);
      }
    } catch (e) {
      setAddError(e.response?.data?.error || 'Failed to add');
    }
    setSaving(false);
  }

  async function handleResend(id) {
    setLoadingId(id);
    try { await cleanerApi.resendInvite(id); refetch(); }
    catch { alert('Failed to resend'); }
    setLoadingId(null);
  }

  async function handleRemove(id, memberName) {
    if (!confirm(`Remove ${memberName || 'this team member'} from your team?`)) return;
    setLoadingId(id);
    try { await cleanerApi.removeTeamMember(id); queryClient.invalidateQueries({ queryKey: ['cleaner-team'] }); }
    catch { alert('Failed to remove'); }
    setLoadingId(null);
  }

  return (
    <>
    <div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-1">My Team</h2>
      <p className="text-[13px] text-gray-400 mb-5">Invite helpers and assign them to jobs.</p>

      {/* Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gray-400" />
            <div>
              <div className="text-[15px] font-semibold text-gray-900">I work with a team</div>
              <div className="text-[12px] text-gray-400 mt-0.5">
                {hasTeam ? 'Team members you invite can be assigned to specific turnovers.' : 'Turn this on to invite helpers and assign them to jobs.'}
              </div>
            </div>
          </div>
          <button onClick={handleToggle} disabled={toggling}
            className={`relative w-10 h-6 rounded-full transition-colors ${hasTeam ? 'bg-coral-400' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasTeam ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        {/* Feature preview when team is off */}
        {!hasTeam && (
          <div className="p-5 border-t border-gray-100">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">With a team you can:</p>
              <div className="space-y-2">
                {['Assign specific helpers to each turnover', 'Team members get their own app login', 'They accept, start, and complete jobs', 'You stay in control as the lead cleaner', 'Get notified when team members respond'].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-orange-400 text-sm mt-0.5 shrink-0">&rarr;</span>
                    <p className="text-sm text-gray-500">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roster */}
        {hasTeam && (
          <div className="border-t border-gray-100">
            {teamMembers.map(tm => (
              <div key={tm.id} className="flex items-center justify-between py-3 px-5 border-b border-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900">{tm.team_member_name || 'Unnamed'}</div>
                  <div className="text-[12px] text-gray-400">{tm.team_member_email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={tm.status} />
                  {tm.status === 'invited' && (
                    <button onClick={() => handleResend(tm.id)} disabled={loadingId === tm.id}
                      className="text-[11px] text-coral-400 font-medium hover:text-coral-500 disabled:opacity-50">Resend</button>
                  )}
                  <button onClick={() => handleRemove(tm.id, tm.team_member_name)} disabled={loadingId === tm.id}
                    className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-50"><X size={14} /></button>
                </div>
              </div>
            ))}

            {/* Add form */}
            {adding ? (
              <div className="p-5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" autoFocus />
                  <input value={email} onChange={(e) => { setEmail(e.target.value); setAddError(null); }} placeholder="Email" type="email" className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-coral-400" />
                </div>
                {addError && <div className="text-[12px] text-red-600">{addError}</div>}
                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={saving || !email.trim()} className="flex items-center gap-1 px-4 py-1.5 bg-coral-400 text-white text-[12px] font-medium rounded-lg hover:bg-coral-500 disabled:opacity-50">
                    <Send size={12} /> {saving ? 'Sending...' : 'Send invite'}
                  </button>
                  <button onClick={() => { setAdding(false); setAddError(null); }} className="px-4 py-1.5 border border-gray-200 text-[12px] font-medium rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)}
                className="w-full border-t-2 border-dashed border-gray-200 flex items-center justify-center gap-1 py-4 text-[13px] text-gray-400 font-medium hover:text-coral-400 hover:border-coral-300 transition-colors">
                <Plus size={16} /> Add team member
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    {toast && (
      <div className={`fixed bottom-4 right-4 text-[13px] px-4 py-2 rounded-lg shadow-lg ${toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-gray-900 text-white'}`}>
        {toast.msg}
      </div>
    )}
  </>
  );
}

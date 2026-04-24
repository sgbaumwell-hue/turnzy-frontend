import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, MapPin, CheckCircle, AlertCircle, Check, Users } from 'lucide-react';
import { cleanerApi } from '../../api/cleaner';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuthStore } from '../../store/authStore';
import { PaymentCard } from '../../components/booking/PaymentCard';

const STATUS_LABELS = {
  pending: 'Awaiting Response',
  accepted: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
};

function getTimelineDotColor(event) {
  const desc = ((event.description || '') + ' ' + (event.event_type || '')).toLowerCase();
  if (desc.includes('decline')) return 'bg-red-500';
  if (desc.includes('confirm') || desc.includes('accepted') || desc.includes('complete')) return 'bg-green-500';
  if (desc.includes('cancel')) return 'bg-amber-500';
  return 'bg-gray-300';
}

function TeamPicker({ jobId, onAssigned, onCancel }) {
  const { data } = useQuery({ queryKey: ['cleaner-team'], queryFn: () => cleanerApi.getTeam() });
  const members = (data?.data?.team_members || []).filter(m => m.status === 'active' || m.status === 'invited');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAssign() {
    if (!selected) return;
    setSaving(true);
    try {
      await cleanerApi.assignJob(jobId, selected, note || undefined);
      const member = members.find(m => m.id === selected);
      onAssigned(member?.team_member_name || 'Team member');
    } catch (e) { alert(e.response?.data?.error || 'Failed to assign'); }
    setSaving(false);
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Select team member</div>
      {members.length === 0 ? (
        <div className="text-[13px] text-gray-400">No active team members. Add team members in Settings.</div>
      ) : (
        <div className="space-y-1">
          {members.map(m => (
            <label key={m.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selected === m.id ? 'bg-coral-50 ring-1 ring-coral-400' : 'hover:bg-gray-50'}`}>
              <input type="radio" name="team-member" value={m.id} checked={selected === m.id} onChange={() => setSelected(m.id)} className="accent-coral-400" />
              <div>
                <div className="text-[13px] font-medium text-gray-900">{m.team_member_name || 'Unnamed'}</div>
                <div className="text-[11px] text-gray-400">{m.team_member_email}</div>
              </div>
            </label>
          ))}
        </div>
      )}
      <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none" />
      <div className="flex gap-2">
        <button onClick={handleAssign} disabled={!selected || saving} className="flex-1 py-2 rounded-lg font-medium text-[13px] bg-coral-400 text-white hover:bg-coral-500 disabled:opacity-50">{saving ? 'Assigning...' : 'Assign'}</button>
        <button onClick={onCancel} className="py-2 px-4 rounded-lg font-medium text-[13px] border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
      </div>
    </div>
  );
}

function AssignmentDisplay({ assignment, onReassign }) {
  if (!assignment) return null;
  const statusColors = { assigned: 'text-amber-600', confirmed: 'text-green-600', declined: 'text-red-600', started: 'text-blue-600', completed: 'text-gray-500' };
  return (
    <div className="p-4 border border-gray-100 rounded-lg">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned To</div>
      <div className="text-[15px] font-semibold text-gray-900">{assignment.team_member_name || 'Team member'}</div>
      <div className={`text-[12px] font-medium mt-1 capitalize ${statusColors[assignment.status] || 'text-gray-400'}`}>{assignment.status}</div>
      {assignment.status === 'declined' && (
        <button onClick={onReassign} className="text-[12px] text-coral-400 font-medium mt-1 hover:text-coral-500">Reassign</button>
      )}
    </div>
  );
}

function ActionButtons({ job, jobId, onRefresh }) {
  const [actionMsg, setActionMsg] = useState(null);
  const [loading, setLoading] = useState(null);

  async function doAction(key, apiFn) {
    setLoading(key); setActionMsg(null);
    try {
      await apiFn(); onRefresh();
      setActionMsg({ type: 'success', text: { accept: 'Job accepted', decline: 'Job declined', complete: 'Marked complete', issue: 'Issue reported' }[key] || 'Done' });
    } catch (e) { setActionMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' }); }
    finally { setLoading(null); }
  }

  const status = job.cleaner_status;
  return (
    <div className="space-y-2">
      {status === 'pending' && (<>
        <button disabled={loading === 'accept'} onClick={() => doAction('accept', () => cleanerApi.acceptJob(jobId))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"><CheckCircle size={16} />{loading === 'accept' ? 'Accepting...' : 'Accept this job'}</button>
        <button disabled={loading === 'decline'} onClick={() => doAction('decline', () => cleanerApi.declineJob(jobId))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"><X size={16} />{loading === 'decline' ? 'Declining...' : "I can't make it"}</button>
      </>)}
      {status === 'accepted' && (<>
        <button disabled={loading === 'complete'} onClick={() => doAction('complete', () => cleanerApi.completeJob(jobId))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"><Check size={16} />{loading === 'complete' ? 'Completing...' : 'Mark as complete'}</button>
        <button disabled={loading === 'issue'} onClick={() => doAction('issue', () => cleanerApi.reportIssue(jobId, 'Issue reported'))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"><AlertCircle size={16} />{loading === 'issue' ? 'Reporting...' : 'Report an issue'}</button>
      </>)}
      {(status === 'declined' || status === 'completed') && <div className="text-center text-sm text-gray-400 py-2">{status === 'declined' ? 'You declined this job.' : 'Completed.'}</div>}
      {actionMsg && <div className={`text-sm font-medium px-3 py-2 rounded-lg ${actionMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{actionMsg.text}</div>}
    </div>
  );
}

export function CleanerJobDetail({ jobId, onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const hasTeam = user?.has_team || false;
  const [showPicker, setShowPicker] = useState(false);
  const [assignedMsg, setAssignedMsg] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['cleaner-job', jobId], queryFn: () => bookingsApi.getOne(jobId), enabled: !!jobId });
  const { data: assignmentData, refetch: refetchAssignment } = useQuery({ queryKey: ['job-assignment', jobId], queryFn: () => cleanerApi.getAssignment(jobId), enabled: !!jobId && hasTeam });
  const assignment = assignmentData?.data?.assignment || null;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    queryClient.invalidateQueries({ queryKey: ['cleaner-job', jobId] });
    refetchAssignment();
  }

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-20" /></div>;

  const b = data?.data;
  if (!b) return <div className="flex items-center justify-center h-full text-gray-400">Job not found</div>;

  const coTime = fmtTime(b.checkout_time || b.default_checkout_time || '11:00');
  const ciTime = fmtTime(b.checkin_time || b.default_checkin_time || '15:00');
  const { month, day } = getMonthDay(b.checkout_date);
  const checkinDate = b.next_checkin_date || b.checkin_date;
  const statusLabel = STATUS_LABELS[b.cleaner_status] || b.cleaner_status;
  const badgeStyle = b.cleaner_status === 'declined' ? 'bg-red-100 text-red-700 font-semibold' : b.cleaner_status === 'accepted' ? 'bg-green-50 text-green-700' : b.cleaner_status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-800';

  return (
    <div className="p-6 relative space-y-5">
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
      <div className="pr-8">
        <h2 className="text-[28px] font-bold text-gray-900 leading-tight">{month} {day} Turnover</h2>
        <div className="flex items-center gap-1.5 mt-1"><MapPin size={13} className="text-gray-300" /><p className="text-[14px] font-medium text-gray-400">{b.property_name || 'Property'}</p></div>
      </div>
      <div><span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${badgeStyle}`}>{statusLabel}</span></div>

      <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Checkout</div><div className="text-2xl font-bold text-gray-900 whitespace-nowrap">{coTime}</div><div className="text-sm text-gray-500 mt-0.5">{fmtDateLong(b.checkout_date)}</div></div>
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Next Check-in</div><div className="text-2xl font-bold text-gray-900 whitespace-nowrap">{ciTime}</div><div className="text-sm text-gray-500 mt-0.5">{fmtDateLong(checkinDate)}</div></div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 border border-gray-100 rounded-lg">
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Host</div><div className="text-[15px] font-semibold text-gray-900">{b.host_name || 'Host'}</div>{b.host_email && <div className="text-sm text-gray-400 mt-0.5">{b.host_email}</div>}</div>
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Property</div><div className="text-[15px] font-semibold text-gray-900">{b.property_name || 'Property'}</div></div>
      </div>

      {hasTeam && assignment && !showPicker && <AssignmentDisplay assignment={assignment} onReassign={() => setShowPicker(true)} />}
      {hasTeam && b.cleaner_status === 'accepted' && !assignment && !showPicker && !assignedMsg && (
        <button onClick={() => setShowPicker(true)} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"><Users size={16} /> Assign to team member</button>
      )}
      {showPicker && <TeamPicker jobId={jobId} onCancel={() => setShowPicker(false)} onAssigned={(name) => { setShowPicker(false); setAssignedMsg(`Assigned to ${name} — invitation sent`); handleRefresh(); }} />}
      {assignedMsg && <div className="text-[13px] text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg">{assignedMsg}</div>}

      <ActionButtons job={b} jobId={jobId} onRefresh={handleRefresh} />

      <PaymentCard role="cleaner" booking={b} onAfterAction={handleRefresh} />

      {b.timeline?.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Activity Timeline</div>
          {b.timeline.map((t, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center"><div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${getTimelineDotColor(t)}`} />{i < b.timeline.length - 1 && <div className="w-px bg-gray-200 flex-1 min-h-[16px] mx-auto" />}</div>
              <div><div className="text-[14px] font-medium text-gray-800">{t.description || t.event_type}</div><div className="text-[12px] text-gray-400 mt-0.5">{t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

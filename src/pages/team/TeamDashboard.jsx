import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ChevronDown, X, MapPin, CheckCircle, AlertCircle, Check, Play } from 'lucide-react';
import { teamApi } from '../../api/cleaner';
import { fmtDateLong, fmtTime, getMonthDay, fmtDateShort } from '../../utils/dates';
import { Skeleton } from '../../components/ui/Skeleton';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import clsx from 'clsx';

const BADGE = {
  assigned: { label: 'Confirm Needed', cls: 'bg-amber-50 text-amber-800' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-50 text-green-700' },
  started: { label: 'Started', cls: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500' },
  declined: { label: 'Declined', cls: 'bg-red-100 text-red-700' },
};

function SectionHeader({ label, count, color, open, onToggle }) {
  const colors = { amber: 'bg-amber-400 text-white', green: 'bg-green-500 text-white', warm: 'bg-gray-200 text-gray-600', today: 'bg-coral-400 text-white' };
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-2 px-4 py-2.5 sticky top-0 backdrop-blur-sm z-10 border-b border-gray-100 w-full text-left cursor-pointer bg-gray-50/90">
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      {count > 0 && <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${colors[color]}`}>{count}</span>}
      <ChevronDown size={14} className={clsx('ml-auto text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
    </button>
  );
}

function AssignmentRow({ a, isToday, isSelected, onClick }) {
  const { month, day } = getMonthDay(a.checkout_date);
  const coTime = fmtTime(a.checkout_time || a.default_checkout_time || '11:00');
  const ciTime = fmtTime(a.checkin_time || a.default_checkin_time || '15:00');
  const ciDate = fmtDateShort(a.checkout_date);
  const badge = BADGE[a.status] || BADGE.assigned;

  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={clsx('relative cursor-pointer mx-2 mb-2 p-4 transition-colors duration-100 hover:bg-gray-50',
        isToday && !isSelected && 'bg-amber-50 border-l-4 border-l-amber-400 rounded-r-lg shadow-sm',
        !isToday && !isSelected && 'bg-white rounded-lg shadow-sm',
        isSelected && 'ring-2 ring-coral-400 bg-coral-50 rounded-lg shadow-sm',
      )} style={isToday && !isSelected ? { borderRadius: '0 8px 8px 0' } : undefined}>
      <div className="absolute top-3 right-3"><span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${badge.cls}`}>{badge.label}</span></div>
      <div className="font-semibold text-[15px] text-gray-900 leading-tight pr-28">{month} {day} Turnover</div>
      {a.property_name && <div className="text-[13px] text-gray-500 mt-0.5">{a.property_name}</div>}
      <div className="text-[12px] text-gray-400 mt-0.5">Assigned by {a.lead_cleaner_name || 'Team leader'}</div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between"><span className="text-xs text-gray-400 uppercase tracking-widest">Checkout</span><span className="text-sm font-medium text-gray-700">{coTime}</span></div>
        <div className="flex items-center justify-between"><span className="text-xs text-gray-400 uppercase tracking-widest">Check-in</span><span className="text-sm font-medium text-gray-700">{ciDate}, {ciTime}</span></div>
      </div>
    </div>
  );
}

function AssignmentDetail({ assignment, onClose, onRefresh }) {
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [issueText, setIssueText] = useState('');
  const [showIssue, setShowIssue] = useState(false);

  if (!assignment) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Select a job to view details</div>;

  const a = assignment;
  const { month, day } = getMonthDay(a.checkout_date);
  const coTime = fmtTime(a.checkout_time || a.default_checkout_time || '11:00');
  const ciTime = fmtTime(a.checkin_time || a.default_checkin_time || '15:00');
  const badge = BADGE[a.status] || BADGE.assigned;

  async function doAction(key, fn) {
    setLoading(key); setMsg(null);
    try { await fn(); onRefresh(); setMsg({ type: 'success', text: { confirm: 'Confirmed', decline: 'Declined', start: 'Started', complete: 'Completed', issue: 'Issue reported' }[key] }); }
    catch (e) { setMsg({ type: 'error', text: e.response?.data?.error || 'Failed' }); }
    setLoading(null);
  }

  return (
    <div className="p-6 relative space-y-5">
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
      <div className="pr-8">
        <h2 className="text-[28px] font-bold text-gray-900 leading-tight">{month} {day} Turnover</h2>
        <div className="flex items-center gap-1.5 mt-1"><MapPin size={13} className="text-gray-300" /><p className="text-[14px] font-medium text-gray-400">{a.property_name || 'Property'}</p></div>
      </div>
      <div><span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>{badge.label}</span></div>

      <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Checkout</div><div className="text-2xl font-bold text-gray-900 whitespace-nowrap">{coTime}</div><div className="text-sm text-gray-500 mt-0.5">{fmtDateLong(a.checkout_date)}</div></div>
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check-in</div><div className="text-2xl font-bold text-gray-900 whitespace-nowrap">{ciTime}</div><div className="text-sm text-gray-500 mt-0.5">{fmtDateLong(a.checkout_date)}</div></div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 border border-gray-100 rounded-lg">
        <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned By</div><div className="text-[15px] font-semibold text-gray-900">{a.lead_cleaner_name}</div>{a.lead_cleaner_email && <div className="text-sm text-gray-400 mt-0.5">{a.lead_cleaner_email}</div>}</div>
        {a.note && <div><div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Note</div><div className="text-[14px] text-gray-700">{a.note}</div></div>}
      </div>

      <div className="space-y-2">
        {a.status === 'assigned' && (<>
          <button disabled={loading === 'confirm'} onClick={() => doAction('confirm', () => teamApi.confirmAssignment(a.id))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"><CheckCircle size={16} />{loading === 'confirm' ? 'Confirming...' : "Got it — I'll be there"}</button>
          <button disabled={loading === 'decline'} onClick={() => doAction('decline', () => teamApi.declineAssignment(a.id))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"><X size={16} />{loading === 'decline' ? 'Declining...' : "I can't make it"}</button>
        </>)}
        {a.status === 'confirmed' && (<>
          <button disabled={loading === 'start'} onClick={() => doAction('start', () => teamApi.startAssignment(a.id))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"><Play size={16} />{loading === 'start' ? 'Starting...' : 'Mark as started'}</button>
          <button disabled={loading === 'decline'} onClick={() => doAction('decline', () => teamApi.declineAssignment(a.id))} className="w-full py-2 px-4 rounded-lg font-medium text-[13px] bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"><X size={14} />I can't make it anymore</button>
        </>)}
        {a.status === 'started' && (<>
          <button disabled={loading === 'complete'} onClick={() => doAction('complete', () => teamApi.completeAssignment(a.id))} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"><Check size={16} />{loading === 'complete' ? 'Completing...' : 'Mark as complete'}</button>
          {!showIssue ? (
            <button onClick={() => setShowIssue(true)} className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"><AlertCircle size={16} />Report an issue</button>
          ) : (
            <div className="space-y-2">
              <textarea rows={2} value={issueText} onChange={(e) => setIssueText(e.target.value)} placeholder="Describe the issue..." className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none" autoFocus />
              <div className="flex gap-2">
                <button onClick={() => doAction('issue', () => teamApi.reportIssue(a.id, issueText))} disabled={!issueText.trim()} className="flex-1 py-2 rounded-lg font-medium text-[13px] bg-coral-400 text-white disabled:opacity-50">Send</button>
                <button onClick={() => setShowIssue(false)} className="py-2 px-4 rounded-lg font-medium text-[13px] border border-gray-200 text-gray-500">Cancel</button>
              </div>
            </div>
          )}
        </>)}
        {(a.status === 'completed' || a.status === 'declined') && <div className="text-center text-sm text-gray-400 py-2">{a.status === 'completed' ? 'Completed.' : 'You declined this job.'}</div>}
        {msg && <div className={`text-sm font-medium px-3 py-2 rounded-lg ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
      </div>
    </div>
  );
}

export function TeamDashboard() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading, refetch } = useQuery({ queryKey: ['team-assignments'], queryFn: () => teamApi.getAssignments(), refetchInterval: 5 * 60 * 1000 });
  const assignments = data?.data?.assignments || [];
  const today = new Date().toISOString().slice(0, 10);

  const sections = useMemo(() => {
    if (!assignments.length) return {};
    return {
      today: assignments.filter(a => a.checkout_date?.toString().slice(0, 10) === today && !['completed', 'declined'].includes(a.status)),
      upcoming: assignments.filter(a => a.checkout_date?.toString().slice(0, 10) > today && a.status === 'confirmed'),
      past: assignments.filter(a => a.checkout_date?.toString().slice(0, 10) < today || ['completed', 'declined'].includes(a.status)),
    };
  }, [assignments, today]);

  const [openSections, setOpenSections] = useState({ today: true, upcoming: false, past: false });
  const toggle = (k) => setOpenSections(p => ({ ...p, [k]: !p[k] }));

  function handleRefresh() { queryClient.invalidateQueries({ queryKey: ['team-assignments'] }); }

  const selected = assignments.find(a => a.id === selectedId) || null;

  const renderSection = (key, label, color) => {
    const items = sections[key];
    if (!items?.length) return null;
    const isOpen = openSections[key] !== false;
    return (
      <div key={key}>
        <SectionHeader label={label} count={items.length} color={color} open={isOpen} onToggle={() => toggle(key)} />
        <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: isOpen ? `${items.length * 180}px` : '0px' }}>
          <div className="pt-2">{items.map(a => <AssignmentRow key={a.id} a={a} isToday={key === 'today'} isSelected={selectedId === a.id} onClick={() => setSelectedId(a.id)} />)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className={clsx('flex flex-col border-r border-gray-200 bg-white', isDesktop ? 'w-[340px] flex-shrink-0' : 'flex-1')}>
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div><h1 className="font-semibold text-[18px] text-gray-900">My Jobs</h1><p className="text-[13px] text-gray-400 mt-0.5">Your assigned turnovers</p></div>
            <button onClick={() => refetch()} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><RefreshCw size={15} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
          {isLoading && <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}
          {!isLoading && !assignments.length && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center h-64">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-[15px] font-medium text-gray-700 mb-1">You're not connected to any jobs yet.</div>
              <div className="text-[13px] text-gray-400">Check your email — your team leader will assign you to jobs when they need you.</div>
            </div>
          )}
          {!isLoading && renderSection('today', 'Today', 'today')}
          {!isLoading && renderSection('upcoming', 'Upcoming', 'green')}
          {!isLoading && renderSection('past', 'Past', 'warm')}
        </div>
      </div>
      {isDesktop && (
        <div className="flex-1 min-w-0 bg-stone-50 overflow-y-auto">
          <AssignmentDetail assignment={selected} onClose={() => setSelectedId(null)} onRefresh={handleRefresh} />
        </div>
      )}
    </div>
  );
}

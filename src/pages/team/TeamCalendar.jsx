import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../cleaner/CleanerCalendar.css';
import { teamApi } from '../../api/cleaner';
import { PropertyRail } from '../../components/PropertyRail';
import { fmtDateLong, fmtTime, getMonthDay, fmtDateShort } from '../../utils/dates';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { X, MapPin, CheckCircle, AlertCircle, Check, Play } from 'lucide-react';

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay,
  locales: { 'en-US': enUS },
});

const STATUS_COLORS = {
  assigned:  { bg: '#fef3c7', text: '#92400e' },
  confirmed: { bg: '#dcfce7', text: '#15803d' },
  started:   { bg: '#dbeafe', text: '#1d4ed8' },
  completed: { bg: '#f3f4f6', text: '#6b7280' },
  declined:  { bg: '#fee2e2', text: '#b91c1c' },
};

const BADGE = {
  assigned: { label: 'Confirm Needed', cls: 'bg-amber-50 text-amber-800' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-50 text-green-700' },
  started: { label: 'Started', cls: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500' },
  declined: { label: 'Declined', cls: 'bg-red-100 text-red-700' },
};

function StatusLegend() {
  const items = [
    { label: 'Confirm Needed', color: 'bg-amber-400' },
    { label: 'Confirmed', color: 'bg-green-500' },
    { label: 'Started', color: 'bg-blue-500' },
    { label: 'Completed', color: 'bg-gray-400' },
    { label: 'Declined', color: 'bg-red-500' },
  ];
  return (
    <div className="flex items-center gap-4 mb-3 flex-wrap">
      {items.map(i => (
        <div key={i.label} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${i.color}`} />
          <span className="text-[10px] text-gray-400">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

function fmtShortDate(dateStr) {
  if (!dateStr) return '';
  const clean = dateStr.toString().slice(0, 10);
  const [y, m, d] = clean.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomToolbar({ label, onNavigate, onView, view }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const btnClass = 'px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50';

  if (!isDesktop) {
    return (
      <div className="flex flex-col items-center gap-2 mb-4">
        <span className="text-base font-semibold text-gray-900">{label}</span>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('PREV')} className={btnClass}>← Back</button>
          <button onClick={() => onNavigate('TODAY')} className={btnClass}>Today</button>
          <button onClick={() => onNavigate('NEXT')} className={btnClass}>Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-2">
        <button onClick={() => onNavigate('PREV')} className={btnClass}>← Back</button>
        <button onClick={() => onNavigate('TODAY')} className={btnClass}>Today</button>
        <button onClick={() => onNavigate('NEXT')} className={btnClass}>Next →</button>
      </div>
      <span className="text-base font-semibold text-gray-900">{label}</span>
      <div className="flex gap-1">
        <button onClick={() => onView('month')}
          className={`px-3 py-1.5 text-sm rounded-lg ${view === 'month' ? 'bg-orange-500 text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>
          Month
        </button>
        <button onClick={() => onView('week')}
          className={`px-3 py-1.5 text-sm rounded-lg ${view === 'week' ? 'bg-orange-500 text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>
          Week
        </button>
      </div>
    </div>
  );
}

function AssignmentSidebar({ assignment, onClose, onRefresh }) {
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);
  const [issueText, setIssueText] = useState('');
  const [showIssue, setShowIssue] = useState(false);

  if (!assignment) return null;

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

export function TeamCalendar() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);

  const { data } = useQuery({
    queryKey: ['team-assignments'],
    queryFn: () => teamApi.getAssignments(),
    refetchInterval: 5 * 60 * 1000,
  });

  const assignments = data?.data?.assignments || [];

  const events = useMemo(() => {
    return assignments.map(a => {
      const coDate = a.checkout_date?.toString().slice(0, 10);
      const coTime = a.checkout_time || a.default_checkout_time || '11:00';
      const ciTime = a.checkin_time || a.default_checkin_time || '15:00';
      const [coH, coM] = coTime.split(':').map(Number);
      const [ciH, ciM] = ciTime.split(':').map(Number);
      const [y, m, d] = coDate.split('-').map(Number);

      const dateLabel = fmtShortDate(coDate);
      const prop = a.property_name || 'Turnover';

      return {
        id: a.id,
        title: `${dateLabel} · ${prop}`,
        start: new Date(y, m - 1, d, coH, coM),
        end: new Date(y, m - 1, d, ciH, ciM),
        resource: a,
      };
    });
  }, [assignments]);

  const selected = assignments.find(a => a.id === selectedId) || null;

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: ['team-assignments'] });
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className={selectedId && isDesktop ? 'flex-1 min-w-0' : 'flex-1'}>
        <div className="p-4 md:p-6 h-full flex flex-col">
          <div className="mb-3">
            <h1 className="font-semibold text-[18px] text-gray-900">Calendar</h1>
            <p className="text-[13px] text-gray-400">Your assigned turnovers</p>
          </div>
          <StatusLegend />
          <div className="flex-1 min-h-0 h-[calc(100vh-220px)] md:h-auto">
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="month"
              views={isDesktop ? ['month', 'week'] : ['month']}
              style={{ height: '100%' }}
              eventPropGetter={(event) => {
                const c = STATUS_COLORS[event.resource.status] || STATUS_COLORS.assigned;
                return {
                  style: {
                    backgroundColor: c.bg,
                    color: c.text,
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: 'Manrope, sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                };
              }}
              onSelectEvent={(event) => setSelectedId(event.resource.id)}
              components={{ toolbar: CustomToolbar }}
            />
          </div>
        </div>
      </div>
      {selectedId && isDesktop && (
        <div className="flex-shrink-0 flex overflow-hidden border-l border-gray-200" style={{ width: 520, background: '#F9F8F6' }}>
          <div className="flex-shrink-0 overflow-y-auto" style={{ flex: '0 1 400px' }}>
            <AssignmentSidebar assignment={selected} onClose={() => setSelectedId(null)} onRefresh={handleRefresh} />
          </div>
          <PropertyRail />
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, CheckCircle, Check, AlertCircle, X } from 'lucide-react';
import { cleanerApi } from '../../api/cleaner';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';

const STATUS_BADGES = {
  pending: { label: 'Awaiting Response', cls: 'bg-amber-50 text-amber-800' },
  accepted: { label: 'Confirmed', cls: 'bg-green-50 text-green-700' },
  declined: { label: 'Declined', cls: 'bg-red-100 text-red-700' },
  completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500' },
};

export function CleanerCalendarJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(null);
  const [msg, setMsg] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cleaner-job', id],
    queryFn: () => bookingsApi.getOne(id),
    enabled: !!id,
  });

  const job = data?.data;

  async function doAction(key, fn) {
    setLoading(key); setMsg(null);
    try {
      await fn();
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-job', id] });
      setMsg({ type: 'success', text: { accept: 'Job accepted', decline: 'Job declined', complete: 'Marked complete' }[key] || 'Done' });
      setTimeout(() => navigate('/cleaner/calendar'), 1200);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' });
    }
    setLoading(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/cleaner/calendar')} className="p-1 -ml-1"><ChevronLeft size={22} className="text-gray-700" /></button>
          <h2 className="text-base font-semibold text-gray-900">Job Details</h2>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Job not found</div>
      </div>
    );
  }

  const { month, day } = getMonthDay(job.checkout_date);
  const coTime = fmtTime(job.checkout_time || job.default_checkout_time || '11:00');
  const ciTime = fmtTime(job.checkin_time || job.default_checkin_time || '15:00');
  const checkinDate = job.next_checkin_date || job.checkin_date;
  const badge = STATUS_BADGES[job.cleaner_status] || STATUS_BADGES.pending;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/cleaner/calendar')} className="p-1 -ml-1"><ChevronLeft size={22} className="text-gray-700" /></button>
        <h2 className="text-base font-semibold text-gray-900">Job Details</h2>
      </div>

      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{month} {day} Turnover</h1>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1"><MapPin size={14} /> {job.property_name || 'Property'}</p>

        <div className="mb-4">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
        </div>

        {/* Time card */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Checkout</p>
            <p className="text-xl font-bold text-gray-900 whitespace-nowrap">{coTime}</p>
            <p className="text-sm text-gray-500">{fmtDateLong(job.checkout_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Next Check-in</p>
            <p className="text-xl font-bold text-gray-900 whitespace-nowrap">{ciTime}</p>
            <p className="text-sm text-gray-500">{fmtDateLong(checkinDate)}</p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 mb-4">
          <div className="mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Host</p>
            <p className="text-sm font-semibold text-gray-900">{job.host_name || 'Your host'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Property</p>
            <p className="text-sm font-semibold text-gray-900">{job.property_name}</p>
          </div>
        </div>

        {/* Action buttons */}
        {job.cleaner_status === 'pending' && (
          <div className="flex flex-col gap-2">
            <button disabled={loading === 'accept'} onClick={() => doAction('accept', () => cleanerApi.acceptJob(id))}
              className="bg-orange-500 text-white w-full rounded-lg py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <CheckCircle size={18} /> {loading === 'accept' ? 'Accepting...' : "Got it — I'll be there"}
            </button>
            <button disabled={loading === 'decline'} onClick={() => doAction('decline', () => cleanerApi.declineJob(id))}
              className="border border-gray-200 bg-white text-gray-600 w-full rounded-lg py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <X size={18} /> {loading === 'decline' ? 'Declining...' : "I can't make it"}
            </button>
          </div>
        )}

        {job.cleaner_status === 'accepted' && (
          <div className="flex flex-col gap-2">
            <button disabled={loading === 'complete'} onClick={() => doAction('complete', () => cleanerApi.completeJob(id))}
              className="bg-green-600 text-white w-full rounded-lg py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <Check size={18} /> {loading === 'complete' ? 'Completing...' : 'Mark as complete'}
            </button>
          </div>
        )}

        {(job.cleaner_status === 'declined' || job.cleaner_status === 'completed') && (
          <div className="text-center text-sm text-gray-400 py-2">
            {job.cleaner_status === 'declined' ? 'You declined this job.' : 'This job has been completed.'}
          </div>
        )}

        {msg && (
          <div className={`mt-3 text-sm font-medium px-3 py-2 rounded-lg ${msg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}

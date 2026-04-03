import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, X, Mail, MapPin, UserPlus, Clock } from 'lucide-react';
import { useState } from 'react';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';
import { getStatusConfig, isUrgent } from '../../utils/status';

const STATUS_LABELS = {
  pending: 'Awaiting response',
  accepted: 'Confirmed',
  declined: 'Declined',
  forwarded_to_team: 'Forwarded to team',
  dismissed: 'Host handling',
  cancel_pending: 'Cancellation unconfirmed',
  cancel_acknowledged: 'Cancellation acknowledged',
};

function getTimelineDotColor(event) {
  const desc = ((event.description || '') + ' ' + (event.event_type || '')).toLowerCase();
  if (desc.includes('decline')) return 'bg-red-500';
  if (desc.includes('confirm') || desc.includes('accepted')) return 'bg-green-500';
  if (desc.includes('cancel')) return 'bg-amber-500';
  return 'bg-gray-300';
}

function ActionButtons({ booking, bookingId }) {
  const queryClient = useQueryClient();
  const [actionMsg, setActionMsg] = useState(null);
  const [loading, setLoading] = useState(null);

  async function doAction(key, apiFn) {
    setLoading(key);
    setActionMsg(null);
    try {
      await apiFn();
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      const labels = { resend: 'Notification resent', dismiss: 'Booking dismissed' };
      setActionMsg({ type: 'success', text: labels[key] || 'Done' });
    } catch (e) {
      setActionMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' });
    } finally {
      setLoading(null);
    }
  }

  const status = booking.cleaner_status;

  if (booking.is_queued) {
    return (
      <div className="space-y-2">
        <button disabled={loading === 'dismiss'} onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
          className="w-full py-3 px-4 rounded-lg font-medium text-[14px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <X size={14} />
          {loading === 'dismiss' ? 'Dismissing...' : "Dismiss — I'll handle it"}
        </button>
        {actionMsg && (
          <div className={`text-sm font-medium px-3 py-2 rounded-lg ${actionMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {actionMsg.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {status === 'pending' && (
        <>
          <button disabled={loading === 'resend'} onClick={() => doAction('resend', () => bookingsApi.resend(bookingId))}
            className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Mail size={16} />
            {loading === 'resend' ? 'Sending...' : 'Resend Notification'}
          </button>
          <button className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <UserPlus size={16} /> Ask Backup Cleaner
          </button>
          <button disabled={loading === 'dismiss'} onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full py-3 px-4 rounded-lg font-medium text-[14px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <X size={14} />
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss — I'll handle it"}
          </button>
        </>
      )}
      {status === 'declined' && (
        <>
          <button className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
            <UserPlus size={16} /> Ask Backup Cleaner
          </button>
          <button disabled={loading === 'dismiss'} onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full py-3 px-4 rounded-lg font-medium text-[14px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <X size={14} />
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss — I'll handle it"}
          </button>
        </>
      )}
      {actionMsg && (
        <div className={`text-sm font-medium px-3 py-2 rounded-lg ${actionMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {actionMsg.text}
        </div>
      )}
    </div>
  );
}

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getOne(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const b = data?.data;
  if (!b || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ChevronLeft size={22} className="text-gray-700" /></button>
          <h2 className="text-base font-semibold text-gray-900">Turnover Details</h2>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Booking not found</div>
      </div>
    );
  }

  const urgent = isUrgent(b);
  const sc = getStatusConfig(b.cleaner_status, urgent);
  const coTime = fmtTime(b.checkout_time || b.default_checkout_time || '11:00');
  const ciTime = fmtTime(b.checkin_time || b.default_checkin_time || '15:00');
  const responseLabel = STATUS_LABELS[b.cleaner_status] || b.cleaner_status || '—';
  const { month, day } = getMonthDay(b.checkout_date);
  const title = `${month} ${day} Turnover`;
  const checkinDate = b.next_checkin_date || b.checkin_date;
  const isDeclined = b.cleaner_status === 'declined';

  let declinedTimestamp = '';
  if (isDeclined && b.timeline?.length) {
    const declineEvent = b.timeline.find(t => ((t.description || '') + (t.event_type || '')).toLowerCase().includes('decline'));
    if (declineEvent?.created_at) {
      declinedTimestamp = new Date(declineEvent.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ChevronLeft size={22} className="text-gray-700" /></button>
        <h2 className="text-base font-semibold text-gray-900">Turnover Details</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={13} className="text-gray-300" />
            <p className="text-sm text-gray-400">{b.property_name || 'Property'}</p>
          </div>
        </div>

        {/* Status */}
        <div>
          {b.is_queued ? (
            <span className="inline-block bg-gray-100 text-gray-500 font-semibold text-xs px-3 py-1 rounded-full">QUEUED</span>
          ) : isDeclined ? (
            <span className="inline-block bg-red-100 text-red-700 font-semibold text-xs px-3 py-1 rounded-full">DECLINED BY CLEANER</span>
          ) : urgent ? (
            <span className="inline-block bg-red-100 text-red-700 font-semibold text-xs px-3 py-1 rounded-full">IMMEDIATE ATTENTION</span>
          ) : (
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
          )}
        </div>

        {/* Queued notification date */}
        {b.is_queued && (() => {
          const windowDays = b.notification_window_days ?? 60;
          const coDate = b.checkout_date ? new Date(String(b.checkout_date).slice(0, 10) + 'T12:00:00') : null;
          if (!coDate) return null;
          const notifyDate = new Date(coDate);
          notifyDate.setDate(notifyDate.getDate() - windowDays);
          return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-500">
              <Clock size={14} className="text-gray-400 shrink-0" />
              <span>
                Cleaner will be notified on{' '}
                <span className="font-medium text-gray-700">
                  {notifyDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {' '}when this enters their notification window.
              </span>
            </div>
          );
        })()}

        {/* Times */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Checkout</p>
            <p className="text-xl font-bold text-gray-900 whitespace-nowrap">{coTime}</p>
            <p className="text-sm text-gray-500">{fmtDateLong(b.checkout_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Next Check-in</p>
            <p className="text-xl font-bold text-gray-900 whitespace-nowrap">{ciTime}</p>
            <p className="text-sm text-gray-500">{fmtDateLong(checkinDate)}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned to</p>
            <p className="text-sm font-semibold text-gray-900">{b.cleaner_name || 'Not assigned'}</p>
            {b.cleaner_email && <p className="text-xs text-gray-400 mt-0.5">{b.cleaner_email}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Response</p>
            {isDeclined ? (
              <>
                <p className="text-sm font-semibold text-red-600">Declined</p>
                {declinedTimestamp && <p className="text-xs text-gray-400 mt-0.5">on {declinedTimestamp}</p>}
              </>
            ) : (
              <p className="text-sm font-semibold text-gray-900">{responseLabel}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <ActionButtons booking={b} bookingId={id} />

        {/* Timeline */}
        {b.timeline?.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Activity Timeline</div>
            {b.timeline.map((t, i) => (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${getTimelineDotColor(t)}`} />
                  {i < b.timeline.length - 1 && <div className="w-px bg-gray-200 flex-1 min-h-[16px]" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{t.description || t.event_type}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

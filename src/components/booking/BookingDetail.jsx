import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Mail, MapPin, UserPlus, Clock } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';
import { getStatusConfig, isUrgent } from '../../utils/status';
import { Skeleton } from '../ui/Skeleton';

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

function TimeEditForm({ type, currentTime, bookingId, onCancel, onSent }) {
  const [requestedTime, setRequestedTime] = useState(currentTime || '');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const label = type === 'late_checkout' ? 'Late Checkout Request' : 'Early Check-in Request';

  async function handleSend() {
    setSending(true);
    try {
      if (bookingsApi.timeChangeRequest) {
        await bookingsApi.timeChangeRequest(bookingId, { type, requestedTime, note });
      } else {
        // TODO: implement time change request API — currently stubbed
        console.warn(`Stub: POST /api/bookings/${bookingId}/time-change-request`, { type, requestedTime, note });
      }
      onSent();
    } catch (e) {
      console.error('Time change request failed', e);
      onSent();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
      <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{label}</div>
      <div>
        <label className="text-[11px] text-gray-500 block mb-0.5">New time</label>
        <input type="time" value={requestedTime} onChange={(e) => setRequestedTime(e.target.value)}
          className="w-full text-[14px] font-medium bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-coral-400" />
      </div>
      <div>
        <label className="text-[11px] text-gray-500 block mb-0.5">Note to cleaner (optional)</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Guest requested late checkout..."
          className="w-full text-[13px] bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none" />
      </div>
      <div className="flex gap-2">
        <button disabled={sending || !requestedTime} onClick={handleSend}
          className="flex-1 h-[36px] rounded-lg font-semibold text-[13px] bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50">
          {sending ? 'Sending...' : 'Send Request'}
        </button>
        <button onClick={onCancel}
          className="h-[36px] px-4 rounded-lg font-medium text-[13px] border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
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
      const labels = { resend: 'Notification resent', dismiss: 'Booking dismissed', backup: 'Backup cleaner notified' };
      setActionMsg({ type: 'success', text: labels[key] || 'Done' });
    } catch (e) {
      setActionMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' });
    } finally {
      setLoading(null);
    }
  }

  const status = booking.cleaner_status;

  // Queued bookings: only show dismiss
  if (booking.is_queued) {
    return (
      <div className="mb-5 space-y-2">
        <button disabled={loading === 'dismiss'} onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
          className="w-full py-3 px-4 rounded-lg font-medium text-[14px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <X size={14} />
          {loading === 'dismiss' ? 'Dismissing...' : "Dismiss \u2014 I'll handle it"}
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
    <div className="mb-5 space-y-2">
      {status === 'pending' && (
        <>
          <button disabled={loading === 'resend'} onClick={() => doAction('resend', () => bookingsApi.resend(bookingId))}
            className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Mail size={16} />
            {loading === 'resend' ? 'Sending...' : 'Resend Notification'}
          </button>
          <button onClick={() => { /* TODO: implement backup cleaner assignment */ }}
            className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <UserPlus size={16} />
            Ask Backup Cleaner
          </button>
          <button disabled={loading === 'dismiss'} onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full py-3 px-4 rounded-lg font-medium text-[14px] border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <X size={14} />
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss \u2014 I'll handle it"}
          </button>
        </>
      )}

      {status === 'declined' && (
        <>
          <button onClick={() => { /* TODO: implement backup cleaner assignment */ }}
            className="w-full py-3 px-4 rounded-lg font-medium text-[15px] bg-orange-500 text-white hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
            <UserPlus size={16} />
            Ask Backup Cleaner
          </button>
          <button disabled={loading === 'dismiss'} onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full py-3 px-4 rounded-lg font-medium text-[14px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <X size={14} />
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss \u2014 I'll handle it"}
          </button>
        </>
      )}

      {status === 'accepted' && (
        <button className="py-2 px-3 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-100 transition-colors">
          Turn off alerts
        </button>
      )}

      {actionMsg && (
        <div className={`text-sm font-medium px-3 py-2 rounded-lg ${actionMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {actionMsg.text}
        </div>
      )}
    </div>
  );
}

export function BookingDetail({ bookingId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.getOne(bookingId),
    enabled: !!bookingId,
  });

  const [editingCheckout, setEditingCheckout] = useState(false);
  const [editingCheckin, setEditingCheckin] = useState(false);
  const [checkoutRequestSent, setCheckoutRequestSent] = useState(false);
  const [checkinRequestSent, setCheckinRequestSent] = useState(false);

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      <Skeleton className="h-20" />
    </div>
  );

  const b = data?.data;
  if (!b) return <div className="flex items-center justify-center h-full text-gray-400">Booking not found</div>;

  const urgent = isUrgent(b);
  const sc = getStatusConfig(b.cleaner_status, urgent);
  const coTime = fmtTime(b.checkout_time || b.default_checkout_time || '11:00');
  const ciTime = fmtTime(b.checkin_time || b.default_checkin_time || '15:00');
  const coTimeRaw = b.checkout_time || b.default_checkout_time || '11:00';
  const ciTimeRaw = b.checkin_time || b.default_checkin_time || '15:00';
  const responseLabel = STATUS_LABELS[b.cleaner_status] || b.cleaner_status || '\u2014';

  const { month, day } = getMonthDay(b.checkout_date);
  const title = `${month} ${day} Turnover`;
  const checkinDate = b.next_checkin_date || b.checkin_date;

  const isDeclined = b.cleaner_status === 'declined';

  // Format declined timestamp
  let declinedTimestamp = '';
  if (isDeclined && b.timeline?.length) {
    const declineEvent = b.timeline.find(t => ((t.description || '') + (t.event_type || '')).toLowerCase().includes('decline'));
    if (declineEvent?.created_at) {
      declinedTimestamp = new Date(declineEvent.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    }
  }

  return (
    <div className="p-6 relative space-y-5">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Close"><X size={18} /></button>

      {/* Header */}
      <div className="pr-8">
        <h2 className="text-[28px] font-bold text-gray-900 leading-tight">{title}</h2>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={13} className="text-gray-300 flex-shrink-0" />
          <p className="text-[14px] font-medium text-gray-400">{b.property_name || 'Property address'}</p>
        </div>
      </div>

      {/* Status badge */}
      <div>
        {b.is_queued ? (
          <span className="inline-block bg-gray-100 text-gray-500 font-semibold text-xs px-3 py-1 rounded-full">
            QUEUED
          </span>
        ) : isDeclined ? (
          <span className="inline-block bg-red-100 text-red-700 font-semibold text-xs px-3 py-1 rounded-full">
            DECLINED BY CLEANER
          </span>
        ) : urgent ? (
          <span className="inline-block bg-red-100 text-red-700 font-semibold text-xs px-3 py-1 rounded-full">
            IMMEDIATE ATTENTION
          </span>
        ) : (
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${sc.bg} ${sc.text}`}>
            {sc.label}
          </span>
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

      {/* Time display — single card, 2-col grid */}
      <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        {/* Checkout */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Checkout</div>
          {editingCheckout ? (
            <TimeEditForm
              type="late_checkout" currentTime={coTimeRaw} bookingId={bookingId}
              onCancel={() => setEditingCheckout(false)}
              onSent={() => { setEditingCheckout(false); setCheckoutRequestSent(true); }}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">{coTime}</span>
                {!checkoutRequestSent && (
                  <button onClick={() => setEditingCheckout(true)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-400 hover:bg-gray-50 whitespace-nowrap">
                    Request Update
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{fmtDateLong(b.checkout_date)}</div>
              {checkoutRequestSent && (
                <div className="text-[11px] text-amber-600 font-medium mt-1">Request sent — awaiting cleaner approval</div>
              )}
            </>
          )}
        </div>
        {/* Next Check-in */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Next Check-in</div>
          {editingCheckin ? (
            <TimeEditForm
              type="early_checkin" currentTime={ciTimeRaw} bookingId={bookingId}
              onCancel={() => setEditingCheckin(false)}
              onSent={() => { setEditingCheckin(false); setCheckinRequestSent(true); }}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">{ciTime}</span>
                {!checkinRequestSent && (
                  <button onClick={() => setEditingCheckin(true)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-400 hover:bg-gray-50 whitespace-nowrap">
                    Request Update
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{fmtDateLong(checkinDate)}</div>
              {checkinRequestSent && (
                <div className="text-[11px] text-amber-600 font-medium mt-1">Request sent — awaiting cleaner approval</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info grid — 2-col */}
      <div className="grid grid-cols-2 gap-4 p-4 border border-gray-100 rounded-lg">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Assigned to</div>
          <div className="text-[15px] font-semibold text-gray-900">{b.cleaner_name || 'Not assigned'}</div>
          {b.cleaner_email && <div className="text-sm text-gray-400 mt-0.5">{b.cleaner_email}</div>}
        </div>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Response</div>
          {isDeclined ? (
            <>
              <div className="text-[15px] font-semibold text-red-600">Declined</div>
              {declinedTimestamp && <div className="text-sm text-gray-400 mt-0.5">Declined on {declinedTimestamp}</div>}
            </>
          ) : (
            <div className="text-[15px] font-semibold text-gray-900">{responseLabel}</div>
          )}
        </div>
        {b.backup_cleaner_name && (
          <div className="col-span-2 border-t border-gray-100 pt-3">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Backup cleaner</div>
            <div className="text-[15px] font-semibold text-gray-900">{b.backup_cleaner_name}</div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <ActionButtons booking={b} bookingId={bookingId} />

      {/* Timeline */}
      {b.timeline?.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Activity Timeline</div>
          {b.timeline.map((t, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${getTimelineDotColor(t)}`} />
                {i < b.timeline.length - 1 && <div className="w-px bg-gray-200 flex-1 min-h-[16px] mx-auto" />}
              </div>
              <div>
                <div className="text-[14px] font-medium text-gray-800">{t.description || t.event_type}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">
                  {t.created_at ? new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

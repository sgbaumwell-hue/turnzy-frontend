import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Mail, MapPin, UserPlus, Pencil } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';
import { getStatusConfig, isUrgent } from '../../utils/status';
import { Pill } from '../ui/Pill';
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
        console.log(`POST /api/bookings/${bookingId}/time-change-request`, { type, requestedTime, note });
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
    <div className="mt-2 p-3 bg-warm-50 rounded-lg border border-warm-200 space-y-2">
      <div className="text-[11px] font-bold text-warm-600 uppercase tracking-wide">{label}</div>
      <div>
        <label className="text-[11px] text-warm-500 block mb-0.5">New time</label>
        <input
          type="time"
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          className="w-full text-[14px] font-medium bg-white border border-warm-200 rounded-lg px-3 py-1.5 text-warm-900 focus:outline-none focus:ring-2 focus:ring-coral-400"
        />
      </div>
      <div>
        <label className="text-[11px] text-warm-500 block mb-0.5">Note to cleaner (optional)</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Guest requested late checkout..."
          className="w-full text-[13px] bg-white border border-warm-200 rounded-lg px-3 py-1.5 text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-coral-400 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          disabled={sending || !requestedTime}
          onClick={handleSend}
          className="flex-1 h-[36px] rounded-lg font-semibold text-[13px] bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Request'}
        </button>
        <button
          onClick={onCancel}
          className="h-[36px] px-4 rounded-lg font-medium text-[13px] border border-gray-300 text-warm-500 hover:text-warm-700 hover:bg-warm-50 transition-colors"
        >
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

  return (
    <div className="mb-5 space-y-2">
      {status === 'pending' && (
        <>
          <button
            disabled={loading === 'resend'}
            onClick={() => doAction('resend', () => bookingsApi.resend(bookingId))}
            className="w-full h-[52px] px-4 rounded-xl font-semibold text-[15px] bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail size={16} />
            {loading === 'resend' ? 'Sending...' : 'Resend Notification'}
          </button>
          <button
            onClick={() => console.log('Ask backup cleaner — coming soon')}
            className="w-full h-[52px] px-4 rounded-xl font-semibold text-[15px] bg-white border border-warm-200 text-warm-600 hover:bg-warm-50 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            Ask Backup Cleaner
          </button>
          <button
            disabled={loading === 'dismiss'}
            onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full h-[44px] px-4 rounded-lg font-medium text-[14px] border border-gray-300 text-warm-500 hover:text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X size={14} />
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss \u2014 I'll handle it"}
          </button>
        </>
      )}

      {status === 'declined' && (
        <>
          <button
            disabled={loading === 'resend'}
            onClick={() => doAction('resend', () => bookingsApi.resend(bookingId))}
            className="w-full h-[52px] px-4 rounded-xl font-semibold text-[15px] bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail size={16} />
            {loading === 'resend' ? 'Sending...' : 'Resend Notification'}
          </button>
          <button
            onClick={() => console.log('Ask backup cleaner — coming soon')}
            className="w-full h-[52px] px-4 rounded-xl font-semibold text-[15px] bg-white border border-warm-200 text-warm-600 hover:bg-warm-50 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            Ask Backup Cleaner
          </button>
          <button
            disabled={loading === 'dismiss'}
            onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full h-[44px] px-4 rounded-lg font-medium text-[14px] border border-gray-300 text-warm-500 hover:text-warm-700 hover:bg-warm-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X size={14} />
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss \u2014 I'll handle it"}
          </button>
        </>
      )}

      {status === 'accepted' && (
        <button className="py-2 px-3 rounded-lg text-xs font-medium text-warm-400 hover:bg-warm-100 transition-colors">
          Turn off alerts
        </button>
      )}

      {actionMsg && (
        <div className={`text-sm font-medium px-3 py-2 rounded-lg ${actionMsg.type === 'success' ? 'bg-sage-50 text-sage-600' : 'bg-danger-50 text-danger-600'}`}>
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
  if (!b) return <div className="flex items-center justify-center h-full text-warm-400">Booking not found</div>;

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

  return (
    <div className="p-6 relative">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-warm-400 hover:bg-warm-100" aria-label="Close"><X size={18} /></button>

      {/* Header */}
      <div className="mb-4 pr-8">
        {urgent && (
          <span className="inline-block bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2">
            PRIORITY ISSUE
          </span>
        )}
        <h2 className="text-[32px] font-extrabold text-warm-900 leading-tight">{title}</h2>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={13} className="text-warm-300 flex-shrink-0" />
          <p className="text-[14px] font-medium text-warm-400">{b.property_name || 'Property address'}</p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-5">
        <Pill label={sc.label} bg={sc.bg} text={sc.text} size="lg" />
      </div>

      {/* Info grid — single consolidated card */}
      <div className="bg-white border border-warm-200 rounded-xl p-4 mb-5">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Checkout */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-warm-400">Checkout</div>
                {!editingCheckout && !checkoutRequestSent && (
                  <button onClick={() => setEditingCheckout(true)} className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors" aria-label="Edit checkout time">
                    <Pencil size={12} />
                  </button>
                )}
              </div>
              {editingCheckout ? (
                <TimeEditForm
                  type="late_checkout"
                  currentTime={coTimeRaw}
                  bookingId={bookingId}
                  onCancel={() => setEditingCheckout(false)}
                  onSent={() => { setEditingCheckout(false); setCheckoutRequestSent(true); }}
                />
              ) : (
                <>
                  <div className="text-[15px] font-semibold text-warm-900">{coTime}</div>
                  <div className="text-[12px] text-warm-400">{fmtDateLong(b.checkout_date)}</div>
                  {checkoutRequestSent && (
                    <div className="text-[11px] text-amber-600 font-medium mt-1">Request sent — awaiting cleaner approval</div>
                  )}
                </>
              )}
            </div>
            {/* Next Check-in */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-warm-400">Next Check-in</div>
                {!editingCheckin && !checkinRequestSent && (
                  <button onClick={() => setEditingCheckin(true)} className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors" aria-label="Edit check-in time">
                    <Pencil size={12} />
                  </button>
                )}
              </div>
              {editingCheckin ? (
                <TimeEditForm
                  type="early_checkin"
                  currentTime={ciTimeRaw}
                  bookingId={bookingId}
                  onCancel={() => setEditingCheckin(false)}
                  onSent={() => { setEditingCheckin(false); setCheckinRequestSent(true); }}
                />
              ) : (
                <>
                  <div className="text-[15px] font-semibold text-warm-900">{ciTime}</div>
                  <div className="text-[12px] text-warm-400">{fmtDateLong(checkinDate)}</div>
                  {checkinRequestSent && (
                    <div className="text-[11px] text-amber-600 font-medium mt-1">Request sent — awaiting cleaner approval</div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="border-t border-warm-100 pt-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Assigned to</div>
            <div className="text-[16px] font-semibold text-warm-900">{b.cleaner_name || 'Not assigned'}</div>
            {b.cleaner_email && <div className="text-[12px] text-warm-400 mt-0.5">{b.cleaner_email}</div>}
          </div>
          <div className="border-t border-warm-100 pt-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Response</div>
            <div className="text-[16px] font-semibold text-warm-900">{responseLabel}</div>
          </div>
          {b.backup_cleaner_name && (
            <div className="border-t border-warm-100 pt-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Backup cleaner</div>
              <div className="text-[16px] font-semibold text-warm-900">{b.backup_cleaner_name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons booking={b} bookingId={bookingId} />

      {/* Timeline */}
      {b.timeline?.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-3">Activity Timeline</div>
          {b.timeline.map((t, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-coral-400 flex-shrink-0 mt-1" />
                {i < b.timeline.length - 1 && <div className="w-px bg-warm-200 flex-1 min-h-[16px] mx-auto" />}
              </div>
              <div>
                <div className="text-[14px] font-medium text-warm-800">{t.description || t.event_type}</div>
                <div className="text-[12px] text-warm-400 mt-0.5">
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

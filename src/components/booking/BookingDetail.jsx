import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Mail, MapPin, UserPlus } from 'lucide-react';
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
            className="w-full h-[44px] px-4 rounded-xl font-medium text-[14px] text-warm-400 hover:text-warm-600 hover:bg-warm-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            className="w-full h-[44px] px-4 rounded-xl font-medium text-[14px] text-warm-400 hover:text-warm-600 hover:bg-warm-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
  const responseLabel = STATUS_LABELS[b.cleaner_status] || b.cleaner_status || '\u2014';

  const { month, day } = getMonthDay(b.checkout_date);
  const title = `${month} ${day} Turnover`;
  const checkinDate = b.next_checkin_date || b.checkin_date;

  return (
    <div className="p-6 max-w-xl relative">
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

      {/* Time cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-warm-100 rounded-xl p-4 border-l-2 border-l-coral-400">
          <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Checkout</div>
          <div className="text-[28px] font-black text-warm-900 leading-none mb-1">{coTime}</div>
          <div className="text-[13px] text-warm-500">{fmtDateLong(b.checkout_date)}</div>
        </div>
        <div className="bg-warm-100 rounded-xl p-4 border-l-2 border-l-sage-400">
          <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Check-in</div>
          <div className="text-[28px] font-black text-warm-900 leading-none mb-1">{ciTime}</div>
          <div className="text-[13px] text-warm-500">{fmtDateLong(checkinDate)}</div>
        </div>
      </div>

      {/* Info grid — single consolidated card */}
      <div className="bg-white border border-warm-200 rounded-xl p-4 mb-5">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Assigned to</div>
            <div className="text-[16px] font-semibold text-warm-900">{b.cleaner_name || 'Not assigned'}</div>
            {b.cleaner_email && <div className="text-[12px] text-warm-400 mt-0.5">{b.cleaner_email}</div>}
          </div>
          <div className="border-t border-warm-100 pt-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Response</div>
            <div className="text-[16px] font-semibold text-warm-900">{responseLabel}</div>
          </div>
          <div className="border-t border-warm-100 pt-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-warm-400 mb-1">Guest</div>
            <div className="text-[16px] font-semibold text-warm-900">{b.guest_name || '\u2014'}</div>
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

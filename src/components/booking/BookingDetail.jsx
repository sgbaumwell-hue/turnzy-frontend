import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import { fmtDateLong, fmtTime, getMonthDay } from '../../utils/dates';
import { getStatusConfig } from '../../utils/status';
import { Pill } from '../ui/Pill';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

const STATUS_LABELS = {
  pending: 'Awaiting response',
  accepted: 'Confirmed ✓',
  declined: 'Declined ✗',
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
      const labels = { resend: 'Notification resent', confirm: 'Marked as confirmed', dismiss: 'Booking dismissed' };
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
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50"
          >
            {loading === 'resend' ? 'Sending...' : 'Resend notification'}
          </button>
          <button
            disabled={loading === 'confirm'}
            onClick={() => doAction('confirm', () => bookingsApi.confirm(bookingId))}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm border-2 border-sage-400 text-sage-600 hover:bg-sage-50 transition-colors disabled:opacity-50"
          >
            {loading === 'confirm' ? 'Confirming...' : 'Mark confirmed'}
          </button>
          <button
            disabled={loading === 'dismiss'}
            onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-warm-100 text-warm-500 hover:bg-warm-200 transition-colors disabled:opacity-50"
          >
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss — I'll handle it"}
          </button>
        </>
      )}

      {status === 'declined' && (
        <>
          <button
            disabled={loading === 'dismiss'}
            onClick={() => doAction('dismiss', () => bookingsApi.dismiss(bookingId))}
            className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-coral-400 text-white hover:bg-coral-500 transition-colors disabled:opacity-50"
          >
            {loading === 'dismiss' ? 'Dismissing...' : "Dismiss — I'll handle it"}
          </button>
          <a
            href="/settings/cleaners"
            className="block w-full py-3 px-4 rounded-xl font-semibold text-sm text-center border border-warm-200 text-warm-500 hover:bg-warm-50 transition-colors"
          >
            Add backup cleaner &rarr;
          </a>
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

  const sc = getStatusConfig(b.cleaner_status, false);
  const coTime = fmtTime(b.checkout_time || b.default_checkout_time || '11:00');
  const ciTime = fmtTime(b.checkin_time || b.default_checkin_time || '15:00');
  const responseLabel = STATUS_LABELS[b.cleaner_status] || b.cleaner_status || '—';

  // Title: "APR 5 Turnover" format
  const { month, day } = getMonthDay(b.checkout_date);
  const title = `${month} ${day} Turnover`;

  // Check-in date: use next guest check-in if available
  const checkinDate = b.next_checkin_date || b.checkin_date;

  return (
    <div className="p-6 max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[28px] font-bold text-warm-800 leading-tight">{title}</h2>
          <p className="text-sm text-warm-400 mt-1">{b.property_name || 'Property'}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-warm-400 hover:bg-warm-100" aria-label="Close"><X size={18} /></button>
      </div>

      {/* Status */}
      <div className="mb-5">
        <Pill label={sc.label} bg={sc.bg} text={sc.text} />
      </div>

      {/* Time cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-warm-100 rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-1">Checkout</div>
          <div className="text-2xl font-bold text-warm-800 leading-none mb-1">{coTime}</div>
          <div className="text-xs text-warm-400">{fmtDateLong(b.checkout_date)}</div>
        </div>
        <div className="bg-warm-100 rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-1">Check-in</div>
          <div className="text-2xl font-bold text-warm-800 leading-none mb-1">{ciTime}</div>
          <div className="text-xs text-warm-400">{fmtDateLong(checkinDate)}</div>
        </div>
      </div>

      {/* Info grid */}
      <Card className="mb-4">
        <div className="space-y-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-0.5">Assigned to</div>
            <div className="text-base font-medium text-warm-800">{b.cleaner_name || 'Not assigned'}</div>
            {b.cleaner_email && <div className="text-xs text-warm-400">{b.cleaner_email}</div>}
          </div>
          <div className="border-t border-warm-100 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-0.5">Response</div>
            <div className="text-base font-medium text-warm-800">{responseLabel}</div>
          </div>
          {b.guest_name && (
            <div className="border-t border-warm-100 pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-0.5">Guest</div>
              <div className="text-base font-medium text-warm-800">{b.guest_name}</div>
            </div>
          )}
          {b.backup_cleaner_name && (
            <div className="border-t border-warm-100 pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-0.5">Backup cleaner</div>
              <div className="text-base font-medium text-warm-800">{b.backup_cleaner_name}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Action buttons */}
      <ActionButtons booking={b} bookingId={bookingId} />

      {/* Timeline */}
      {b.timeline?.length > 0 && (
        <div className="mt-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-3">Activity Timeline</div>
          {b.timeline.map((t, i) => (
            <div key={i} className="flex gap-3 py-2.5 border-b border-warm-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-coral-400 mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-warm-700">{t.description || t.event_type}</div>
                <div className="text-xs text-warm-400 mt-0.5">
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

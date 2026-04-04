import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { getMonthDay, fmtTime, fmtDateShort } from '../../utils/dates';
import { getStatusConfig, isUrgent as checkUrgent } from '../../utils/status';
import { Pill } from '../ui/Pill';
import { useUiStore } from '../../store/uiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function BookingRow({ booking, propName }) {
  const { selectedBookingId, setSelectedBooking } = useUiStore();
  const isSelected = selectedBookingId === booking.id;
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const urgent = checkUrgent(booking);
  const sc = getStatusConfig(booking, urgent);
  const { month, day } = getMonthDay(booking.checkout_date);
  const isSameDay = booking.booking_type === 'SAME_DAY' || booking.is_same_day;
  const coTime = fmtTime(booking.checkout_time || booking.default_checkout_time || '11:00');
  const ciTime = fmtTime(booking.checkin_time || booking.default_checkin_time || '15:00');
  const checkinDate = booking.next_checkin_date || booking.checkin_date || booking.checkout_date;
  const ciDateLabel = fmtDateShort(checkinDate);

  function handleClick() {
    if (isDesktop) {
      setSelectedBooking(booking.id);
    } else {
      navigate(`/bookings/${booking.id}`);
    }
  }

  return (
    <div role="button" tabIndex={0}
      aria-label={`${month} ${day} Turnover - ${sc.label}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={clsx(
        'relative cursor-pointer mx-2 mb-2 p-4',
        'transition-colors duration-100',
        'hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-coral-400',
        urgent && !isSelected && 'bg-red-50 border-l-4 border-l-red-500 rounded-r-lg shadow-sm',
        !urgent && !isSelected && 'bg-white rounded-lg shadow-sm',
        isSelected && 'ring-2 ring-coral-400 bg-coral-50 rounded-lg shadow-sm',
      )}
      style={urgent && !isSelected ? { borderRadius: '0 8px 8px 0' } : undefined}
    >
      {/* Badge — top right */}
      <div className="absolute top-3 right-3">
        <Pill label={sc.label} bg={sc.bg} text={sc.text} size="sm" />
      </div>

      {/* Title */}
      <div className="font-semibold text-[15px] text-gray-900 leading-tight pr-28">
        {month} {day} Turnover
      </div>

      {/* Property */}
      {propName && (
        <div className="text-[13px] text-gray-500 mt-0.5">{propName}</div>
      )}

      {/* Same-day label */}
      {isSameDay && (
        <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-1.5">
          SAME-DAY
        </div>
      )}

      {/* Times modified indicator */}
      {booking.is_times_modified && (
        <div className="text-xs text-amber-600 font-medium mt-1">
          ⚠ Times updated
        </div>
      )}

      {/* Structured time rows */}
      <div className="mt-2.5 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Checkout</span>
          <span className="text-xs font-medium text-gray-800">{coTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Next Check-in</span>
          <span className="text-xs font-medium text-gray-800">{ciDateLabel}, {ciTime}</span>
        </div>
      </div>

      {/* Payment status (completed bookings only) */}
      {booking.cleaner_status === 'completed' && booking.payment_status && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          {booking.payment_status === 'unpaid' && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Payment pending
            </div>
          )}
          {booking.payment_status === 'payment_marked' && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Awaiting cleaner confirmation
            </div>
          )}
          {booking.payment_status === 'payment_confirmed' && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Payment confirmed
            </div>
          )}
          {booking.payment_status === 'payment_not_received' && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              Cleaner hasn't received payment
            </div>
          )}
        </div>
      )}
    </div>
  );
}

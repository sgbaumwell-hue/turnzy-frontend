import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { getMonthDay, fmtTime } from '../../utils/dates';
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
  const sc = getStatusConfig(booking.cleaner_status, urgent);
  const { month, day } = getMonthDay(booking.checkout_date);
  const isSameDay = booking.booking_type === 'SAME_DAY' || booking.is_same_day;
  const coTime = fmtTime(booking.checkout_time || booking.default_checkout_time || '11:00');
  const ciTime = fmtTime(booking.checkin_time || booking.default_checkin_time || '15:00');

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
        'flex gap-0 cursor-pointer mx-2 mb-2',
        'transition-colors duration-100 min-h-[72px]',
        'hover:bg-warm-50 focus-visible:outline-2 focus-visible:outline-coral-400',
        urgent && !isSelected && 'bg-red-50 border-l-4 border-l-red-500 rounded-r-lg shadow-sm',
        !urgent && 'bg-white rounded-lg shadow-sm',
        isSelected && 'ring-2 ring-coral-400 bg-coral-50',
      )}
      style={urgent && !isSelected ? { borderRadius: '0 8px 8px 0' } : undefined}
    >
      {/* Date stamp */}
      <div className={clsx(
        'flex flex-col items-center justify-center w-[48px] min-w-[48px] flex-shrink-0 border-r border-warm-100 py-4 px-1 gap-0.5',
        urgent && !isSelected ? 'bg-red-50' : 'bg-white',
        !urgent && 'rounded-l-lg',
      )}>
        <span className="text-[9px] font-black text-coral-400 tracking-widest uppercase leading-none">{month}</span>
        <span className="text-[24px] font-black text-warm-900 leading-none">{day}</span>
      </div>
      {/* Content */}
      <div className="flex-1 py-3.5 px-3 min-w-0 relative">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-bold text-[15px] text-warm-900 leading-tight">
            {month} {day} &middot; {propName || 'Turnover'}
          </div>
          <div className="flex-shrink-0">
            <Pill label={sc.label} bg={sc.bg} text={sc.text} size="sm" />
          </div>
        </div>
        {isSameDay && (
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold px-2 py-0.5 rounded-md mb-1.5">
            <span>⚡</span>
            <span>Same-day</span>
          </div>
        )}
        <div className="text-[12px] text-warm-400 flex flex-wrap gap-x-3">
          <span>Checkout {coTime}</span>
          <span>Check-in {ciTime}</span>
        </div>
      </div>
    </div>
  );
}

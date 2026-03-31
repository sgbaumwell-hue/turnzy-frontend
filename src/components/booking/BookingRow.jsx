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
        'flex gap-0 cursor-pointer border-b border-warm-100 border-l-[3px]',
        'transition-colors duration-100 min-h-[72px]',
        'hover:bg-warm-100 focus-visible:outline-2 focus-visible:outline-coral-400',
        isSelected && 'bg-coral-50 border-l-coral-400',
        !isSelected && !urgent && sc.border,
        urgent && !isSelected && 'bg-red-50 border-l-red-500',
      )}>
      {/* Date stamp */}
      <div className="flex flex-col items-center justify-center w-[48px] min-w-[48px] flex-shrink-0 border-r border-warm-100 py-4 px-1 gap-0.5 bg-white">
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
          <div className="flex items-center gap-1.5 bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded-md mb-1.5 w-fit">
            <span>⚡</span>
            <span>Same-day &middot; {coTime} &ndash; {ciTime}</span>
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

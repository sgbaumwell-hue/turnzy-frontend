import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { getMonthDay, fmtTime, fmtDateShort } from '../../utils/dates';
import { getStatusConfig, isUrgent as checkUrgent } from '../../utils/status';
import { useUiStore } from '../../store/uiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/* Pill badge matching the design system */
function StatusPill({ sc }) {
  const tones = {
    urgent:    { bg: '#FBEDEA', text: '#9A2F2A', ring: '#F0D4CE', dot: '#B33A32' },
    pending:   { bg: '#F9EDD4', text: '#7A4A0A', ring: '#EBD5A8', dot: '#C08419' },
    confirmed: { bg: '#E4EFDA', text: '#2F5E16', ring: '#CCE0B5', dot: '#4C8B22' },
    queued:    { bg: '#EDE7D7', text: '#6B6454', ring: '#DCD4C0', dot: '#9C9481' },
    completed: { bg: '#ECE8DE', text: '#847D6B', ring: null,      dot: '#B4AD9A' },
    neutral:   { bg: '#EDE7D7', text: '#5F5B52', ring: null,      dot: '#9C9481' },
  };
  const tone = tones[sc.tone] || tones.neutral;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-[-0.005em]"
      style={{ background: tone.bg, color: tone.text, boxShadow: tone.ring ? `inset 0 0 0 1px ${tone.ring}` : undefined }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tone.dot }} />
      {sc.label}
    </span>
  );
}

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

  function handleClick() {
    if (isDesktop) {
      setSelectedBooking(booking.id);
    } else {
      navigate(`/bookings/detail/${booking.id}`);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="booking-row"
      aria-label={`${month} ${day} Turnover - ${sc.label}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="relative cursor-pointer w-full text-left transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-[#E85F34]"
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid #EDE7D7',
        background: isSelected
          ? 'rgba(232,95,52,0.07)'
          : 'transparent',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(245,240,226,0.6)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Left-bar indicator */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r" style={{ background: '#E85F34' }} />
      )}
      {urgent && !isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r" style={{ background: '#B33A32' }} />
      )}

      <div className="flex items-start gap-3">
        {/* Date block */}
        <div className="flex-shrink-0 w-12 pt-0.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#9C9481]">{month}</div>
          <div className="font-black text-[26px] leading-none tracking-[-0.04em] mt-0.5 tabular-nums"
            style={{ color: urgent ? '#B33A32' : '#1F1D1A' }}>
            {day}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Property name */}
          <div className="text-[14px] font-semibold text-[#1F1D1A] truncate leading-tight tracking-[-0.005em]">
            {propName || `${month} ${day} Turnover`}
          </div>

          {/* Times */}
          <div className="text-[12px] text-[#6B6454] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{coTime} → {ciTime}</span>
            {isSameDay && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-[#C08419]">
                <span className="w-1 h-1 rounded-full bg-[#C08419]" />
                Same-day
              </span>
            )}
          </div>

          {/* Times modified warning */}
          {booking.is_times_modified && (
            <div className="text-[11px] text-[#C08419] font-medium mt-1">Times updated</div>
          )}

          {/* Status pill */}
          <div className="mt-2.5">
            <StatusPill sc={sc} />
          </div>

          {/* Payment status (completed only) */}
          {booking.cleaner_status === 'completed' && booking.payment_status && booking.payment_status !== 'payment_confirmed' && (
            <div className="mt-2 pt-2 border-t border-[#EDE7D7]">
              {booking.payment_status === 'unpaid' && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#C08419]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF9F27]" />Payment pending
                </div>
              )}
              {booking.payment_status === 'payment_marked' && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#C08419]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF9F27]" />Awaiting cleaner confirmation
                </div>
              )}
              {booking.payment_status === 'payment_not_received' && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#9A2F2A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A]" />Cleaner hasn't received payment
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { getMonthDay, fmtTime, fmtDateShort } from '../../utils/dates';
import { useCleanerUiStore } from '../../store/cleanerUiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useAuthStore } from '../../store/authStore';

const CLEANER_STATUS_CONFIG = {
  pending: { label: 'Awaiting Response', bg: 'bg-amber-50', text: 'text-amber-800' },
  accepted: { label: 'Confirmed', bg: 'bg-green-50', text: 'text-green-700' },
  declined: { label: 'Declined', bg: 'bg-red-100', text: 'text-red-700 font-semibold' },
  completed: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-500' },
};

function getCleanerBadge(status) {
  return CLEANER_STATUS_CONFIG[status] || { label: (status || 'Unknown').replace(/_/g, ' '), bg: 'bg-gray-100', text: 'text-gray-500' };
}

export function CleanerJobRow({ job, isToday }) {
  const { selectedJobId, setSelectedJob } = useCleanerUiStore();
  const isSelected = selectedJobId === job.id;
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const hasTeam = user?.has_team || false;
  const { month, day } = getMonthDay(job.checkout_date);
  const isSameDay = job.booking_type === 'SAME_DAY' || job.is_same_day;
  const coTime = fmtTime(job.checkout_time || job.default_checkout_time || '11:00');
  const ciTime = fmtTime(job.checkin_time || job.default_checkin_time || '15:00');
  const checkinDate = job.next_checkin_date || job.checkin_date || job.checkout_date;
  const ciDateLabel = fmtDateShort(checkinDate);
  const badge = getCleanerBadge(job.cleaner_status);

  function handleClick() {
    if (isDesktop) {
      setSelectedJob(job.id);
    } else {
      navigate(`/cleaner/jobs/${job.id}`);
    }
  }

  return (
    <div
      role="button" tabIndex={0}
      aria-label={`${month} ${day} Turnover`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={clsx(
        'relative cursor-pointer mx-2 mb-2 p-4',
        'transition-colors duration-100',
        'hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-coral-400',
        isToday && !isSelected && 'bg-amber-50 border-l-4 border-l-amber-400 rounded-r-lg shadow-sm',
        !isToday && !isSelected && 'bg-white rounded-lg shadow-sm',
        isSelected && 'ring-2 ring-coral-400 bg-coral-50 rounded-lg shadow-sm',
      )}
      style={isToday && !isSelected ? { borderRadius: '0 8px 8px 0' } : undefined}
    >
      {/* Badge — top right */}
      <div className="absolute top-3 right-3">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      {/* Title */}
      <div className="font-semibold text-[15px] text-gray-900 leading-tight pr-28">
        {month} {day} Turnover
      </div>

      {/* Property */}
      {job.property_name && (
        <div className="text-[13px] text-gray-500 mt-0.5">{job.property_name}</div>
      )}
      {/* Team assignment status */}
      {hasTeam && (
        <div className="text-[12px] text-gray-300 mt-0.5">
          {job.team_assignment_name ? `Assigned to ${job.team_assignment_name}` : 'No team member assigned'}
        </div>
      )}

      {/* Same-day label */}
      {isSameDay && (
        <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-1.5">
          SAME-DAY
        </div>
      )}

      {/* Structured time rows */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Checkout</span>
          <span className="text-sm font-medium text-gray-700">{coTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest">Next Check-in</span>
          <span className="text-sm font-medium text-gray-700">{ciDateLabel}, {ciTime}</span>
        </div>
      </div>
    </div>
  );
}

export const STATUS_CONFIG = {
  pending: { label: 'Awaiting response', bg: 'bg-amber-100', text: 'text-amber-900 font-semibold', border: 'border-l-amber-400' },
  accepted: { label: 'Confirmed', bg: 'bg-green-100', text: 'text-green-700 font-semibold', border: 'border-l-green-500' },
  declined: { label: 'Declined', bg: 'bg-red-100', text: 'text-red-700 font-semibold', border: 'border-l-red-500' },
  self_managed: { label: 'Self-managed', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-l-gray-300' },
  completed: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-l-gray-300' },
  dismissed: { label: 'Host handling', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-l-gray-300' },
  forwarded_to_team: { label: 'Forwarded to team', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-l-sky-400' },
  cancel_pending: { label: 'Cancellation', bg: 'bg-warm-100', text: 'text-warm-600', border: 'border-l-warm-400' },
  cancel_acknowledged: { label: 'Cancelled', bg: 'bg-warm-100', text: 'text-warm-400', border: 'border-l-warm-200' },
};

export function isUrgent(booking) {
  if (!booking.checkout_date) return false;
  const clean = booking.checkout_date.toString().slice(0, 10);
  const [year, month, day] = clean.split('-').map(Number);
  const checkout = new Date(year, month - 1, day);
  const diff = (checkout - new Date()) / (1000 * 60 * 60 * 24);
  return diff <= 5 && diff >= 0;
}

export function getStatusConfig(statusOrBooking, urgentOverride) {
  // Support both old signature (status, urgent) and new (booking)
  let status, urgent, isQueued;
  if (typeof statusOrBooking === 'object' && statusOrBooking !== null) {
    status = statusOrBooking.cleaner_status;
    urgent = urgentOverride ?? isUrgent(statusOrBooking);
    isQueued = statusOrBooking.is_queued;
  } else {
    status = statusOrBooking;
    urgent = urgentOverride;
    isQueued = false;
  }

  if (isQueued) {
    return { label: 'QUEUED', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-l-gray-300' };
  }

  if (urgent && (status === 'pending' || status === 'declined')) {
    return {
      label: 'IMMEDIATE ATTENTION',
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-l-red-500',
      rowBg: 'bg-red-50',
    };
  }

  return STATUS_CONFIG[status] || {
    label: (status || 'Unknown').replace(/_/g, ' '),
    bg: 'bg-warm-100', text: 'text-warm-600', border: 'border-l-warm-400',
  };
}

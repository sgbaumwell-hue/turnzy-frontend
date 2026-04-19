// Status config — tone keys map to StatusPill in BookingRow.jsx
export const STATUS_CONFIG = {
  pending:             { label: 'Awaiting cleaner', tone: 'pending' },
  accepted:            { label: 'Confirmed',         tone: 'confirmed' },
  declined:            { label: 'Declined',          tone: 'urgent' },
  self_managed:        { label: 'Self-managed',      tone: 'neutral' },
  dismissed:           { label: 'Host handling',     tone: 'neutral' },
  completed:           { label: 'Completed',         tone: 'completed' },
  forwarded_to_team:   { label: 'Forwarded',         tone: 'neutral' },
  cancel_pending:      { label: 'Cancellation',      tone: 'neutral' },
  cancel_acknowledged: { label: 'Cancelled',         tone: 'completed' },
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
    return { label: 'Queued', tone: 'queued' };
  }

  if (urgent && (status === 'pending' || status === 'declined')) {
    return { label: 'Action needed', tone: 'urgent' };
  }

  return STATUS_CONFIG[status] || {
    label: (status || 'Unknown').replace(/_/g, ' '),
    tone: 'neutral',
  };
}

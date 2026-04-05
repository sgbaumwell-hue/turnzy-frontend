import { fmtDateShort } from './dates';

export function getActivityDescription(event) {
  const cleaner = event.cleaner_name || 'Your cleaner';
  const property = event.property_name || 'the property';
  const date = event.checkout_date
    ? fmtDateShort(event.checkout_date)
    : '';
  const job = date
    ? `the ${date} turnover at ${property}`
    : `a turnover at ${property}`;

  const map = {
    // Detection
    booking_detected: `New turnover detected at ${property}`,
    new: `New booking detected at ${property}`,
    new_sameday: `Same-day turnover detected at ${property}`,

    // Notifications
    notification_sent: `${cleaner} notified about ${job}`,
    resent: `Notification resent to ${cleaner} for ${job}`,
    cleaner_notified: `${cleaner} notified about ${job}`,

    // Cleaner responses
    accepted: `${cleaner} confirmed ${job}`,
    cleaner_accepted: `${cleaner} confirmed ${job}`,
    cleaner_responded: `${cleaner} responded to ${job}`,
    declined: `${cleaner} declined ${job}`,
    cleaner_declined: `${cleaner} declined ${job}`,
    acknowledged: `${cleaner} acknowledged the cancellation of ${job}`,

    // Cancellations/modifications
    cancellation: `Booking cancelled at ${property}`,
    cancelled: `Booking cancelled at ${property}`,
    times_modified: `Times changed for ${job}`,
    modified: `Booking modified at ${property}`,

    // Host actions
    self_managed: `Dismissed ${job} — handling it yourself`,
    dismissed: `Dismissed ${job} — handling it yourself`,
    booking_dismissed: `Dismissed ${job} — handling it yourself`,

    // Completion/payment
    completed: `${cleaner} marked ${job} complete`,
    cleaner_completed: `${cleaner} marked ${job} complete`,
    payment_marked: `Payment marked as sent for ${job}`,
    payment_confirmed: `${cleaner} confirmed payment for ${job}`,
    payment_not_received: `${cleaner} reported payment not received for ${job}`,
    nudge: `${cleaner} sent a payment reminder for ${job}`,

    // Team
    team_assigned: `Team member assigned to ${job}`,
    team_member_invited: `Team member invited`,
    team_member_confirmed: `Team member confirmed ${job}`,
    team_member_declined: `Team member declined ${job}`,
    team_member_completed: `Team member completed ${job}`,
    team_member_started: `Team member started ${job}`,
    team_member_issue: `Team member reported issue on ${job}`,

    // Escalation
    escalated_from_queue: `Queued booking entering window — cleaner notified`,
    poll_completed: `Calendar sync completed`,
    booking_forwarded: `${cleaner} forwarded ${job} to team`,
    cleaner_issue: `${cleaner} reported an issue on ${job}`,
  };

  return map[event.event_type] || event.description || `Event: ${event.event_type}`;
}

export function getActivityMeta(eventType) {
  if (['accepted', 'cleaner_accepted', 'payment_confirmed', 'completed',
    'cleaner_completed', 'team_member_confirmed', 'team_member_completed'].includes(eventType))
    return { color: 'text-green-500', dotColor: 'bg-green-500' };

  if (['declined', 'cleaner_declined', 'cancellation', 'cancelled',
    'payment_not_received', 'team_member_declined'].includes(eventType))
    return { color: 'text-red-400', dotColor: 'bg-red-400' };

  if (['new', 'new_sameday', 'booking_detected', 'notification_sent',
    'resent', 'cleaner_notified'].includes(eventType))
    return { color: 'text-orange-400', dotColor: 'bg-orange-400' };

  if (['times_modified', 'modified', 'cleaner_issue', 'team_member_issue'].includes(eventType))
    return { color: 'text-amber-500', dotColor: 'bg-amber-500' };

  if (['payment_marked', 'nudge'].includes(eventType))
    return { color: 'text-blue-400', dotColor: 'bg-blue-400' };

  if (['self_managed', 'dismissed', 'booking_dismissed'].includes(eventType))
    return { color: 'text-gray-400', dotColor: 'bg-gray-400' };

  return { color: 'text-gray-400', dotColor: 'bg-gray-300' };
}

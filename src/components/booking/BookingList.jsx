import { useMemo } from 'react';
import { BookingRow } from './BookingRow';
import { BookingRowSkeleton } from '../ui/Skeleton';
import { isUrgent } from '../../utils/dates';

function SectionHeader({ label, count, color = 'warm' }) {
  const colors = { danger: 'text-danger-600', amber: 'text-amber-600', warm: 'text-warm-400', sage: 'text-sage-600' };
  const badgeColors = { danger: 'bg-danger-400 text-white', amber: 'bg-amber-400 text-white', warm: 'bg-warm-200 text-warm-600', sage: 'bg-sage-400 text-white' };
  return (
    <div className="flex items-center gap-2 px-4 py-2 sticky top-0 bg-warm-50/90 backdrop-blur-sm z-10 border-b border-warm-100">
      <span className={`text-[11px] font-bold uppercase tracking-widest ${colors[color]}`}>{label}</span>
      {count > 0 && <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${badgeColors[color]}`}>{count}</span>}
    </div>
  );
}

export function BookingList({ bookings, properties, isLoading }) {
  const propMap = useMemo(() => {
    if (!properties) return {};
    return Object.fromEntries(properties.map(p => [p.id, p]));
  }, [properties]);

  const today = new Date().toISOString().slice(0, 10);

  const sections = useMemo(() => {
    if (!bookings) return {};
    return {
      urgent: bookings.filter(b => isUrgent(b) && ['pending', 'declined'].includes(b.cleaner_status)),
      needsAction: bookings.filter(b => ['pending', 'declined', 'cancel_pending'].includes(b.cleaner_status) && !isUrgent(b) && !['cancellation', 'blocked'].includes((b.booking_type || '').toLowerCase()) && (!b.notification_scheduled_for || b.notification_scheduled_for <= today)),
      queued: bookings.filter(b => b.cleaner_status === 'pending' && b.notification_scheduled_for && b.notification_scheduled_for > today),
      upcoming: bookings.filter(b => b.cleaner_status === 'accepted'),
      hostHandling: bookings.filter(b => b.cleaner_status === 'dismissed'),
      cancelled: bookings.filter(b => (b.booking_type || '').toLowerCase() === 'cancellation' || b.cleaner_status === 'cancel_acknowledged'),
    };
  }, [bookings, today]);

  if (isLoading) return <div>{[...Array(5)].map((_, i) => <BookingRowSkeleton key={i} />)}</div>;

  const renderSection = (key, label, color) => {
    const items = sections[key];
    if (!items?.length) return null;
    return (<div key={key}>
      <SectionHeader label={label} count={items.length} color={color} />
      {key === 'cancelled' ? <div className="opacity-50">{items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)}</div> : items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)}
    </div>);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {renderSection('urgent', 'URGENT (< 3 DAYS)', 'danger')}
      {renderSection('needsAction', 'NEEDS ACTION', 'amber')}
      {renderSection('queued', 'QUEUED', 'warm')}
      {renderSection('upcoming', 'UPCOMING (CONFIRMED)', 'sage')}
      {renderSection('hostHandling', 'HOST HANDLING', 'warm')}
      {renderSection('cancelled', 'CANCELLED', 'warm')}
      {!bookings?.length && <div className="flex flex-col items-center justify-center h-64 text-warm-400 text-sm gap-2"><span className="text-3xl">📋</span><span>No bookings yet</span></div>}
    </div>
  );
}

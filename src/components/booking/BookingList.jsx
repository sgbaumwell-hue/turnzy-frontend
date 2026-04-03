import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BookingRow } from './BookingRow';
import { BookingRowSkeleton } from '../ui/Skeleton';
import { isUrgent } from '../../utils/status';
import clsx from 'clsx';

function SectionHeader({ label, count, color = 'warm', open, onToggle }) {
  const badgeColors = {
    danger: 'bg-red-500 text-white',
    amber: 'bg-amber-400 text-white',
    warm: 'bg-gray-200 text-gray-600',
    sage: 'bg-green-500 text-white',
  };
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2.5 sticky top-0 backdrop-blur-sm z-10 border-b border-gray-100 w-full text-left cursor-pointer bg-gray-50/90"
    >
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      {count > 0 && <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${badgeColors[color]}`}>{count}</span>}
      <ChevronDown size={14} className={clsx('ml-auto text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
    </button>
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
    const schedAfterToday = (b) => {
      if (!b.notification_scheduled_for) return false;
      const sched = String(b.notification_scheduled_for).slice(0, 10);
      return sched > today;
    };
    const schedNotAfterToday = (b) => !b.notification_scheduled_for || String(b.notification_scheduled_for).slice(0, 10) <= today;
    return {
      urgent: bookings.filter(b => isUrgent(b) && ['pending', 'declined'].includes(b.cleaner_status)),
      needsAction: bookings.filter(b => ['pending', 'declined', 'cancel_pending'].includes(b.cleaner_status) && !isUrgent(b) && !['cancellation', 'blocked'].includes((b.booking_type || '').toLowerCase()) && schedNotAfterToday(b)),
      queued: bookings.filter(b => b.cleaner_status === 'pending' && schedAfterToday(b)),
      upcoming: bookings.filter(b => b.cleaner_status === 'accepted'),
      hostHandling: bookings.filter(b => b.cleaner_status === 'dismissed'),
      cancelled: bookings.filter(b => (b.booking_type || '').toLowerCase() === 'cancellation' || b.cleaner_status === 'cancel_acknowledged'),
    };
  }, [bookings, today]);

  // [QUEUE-DIAG] Log section counts
  if (bookings?.length) {
    const statuses = {};
    bookings.forEach(b => { statuses[b.cleaner_status] = (statuses[b.cleaner_status] || 0) + 1; });
    const withNsf = bookings.filter(b => b.notification_scheduled_for);
    console.log('[QUEUE-DIAG] BookingList received:', {
      total: bookings.length,
      byCleanerStatus: statuses,
      withNotifScheduledFor: withNsf.length,
      nsfSample: withNsf.slice(0, 3).map(b => ({ id: b.id, nsf: String(b.notification_scheduled_for).slice(0, 10), status: b.cleaner_status })),
      today,
      sectionCounts: {
        urgent: sections.urgent?.length,
        needsAction: sections.needsAction?.length,
        queued: sections.queued?.length,
        upcoming: sections.upcoming?.length,
        hostHandling: sections.hostHandling?.length,
        cancelled: sections.cancelled?.length,
      }
    });
  }

  const [openSections, setOpenSections] = useState({
    urgent: true,
    needsAction: true,
    upcoming: false,
    queued: false,
    hostHandling: false,
    cancelled: false,
  });

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (isLoading) return <div>{[...Array(5)].map((_, i) => <BookingRowSkeleton key={i} />)}</div>;

  const renderSection = (key, label, color) => {
    const items = sections[key];
    if (!items?.length) return null;
    const isOpen = openSections[key] !== false;
    return (
      <div key={key}>
        <SectionHeader label={label} count={items.length} color={color} open={isOpen} onToggle={() => toggleSection(key)} />
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: isOpen ? `${items.length * 160}px` : '0px' }}
        >
          <div className="pt-2">
            {key === 'cancelled'
              ? <div className="opacity-50">{items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)}</div>
              : items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
      {renderSection('urgent', 'Urgent (< 3 days)', 'danger')}
      {renderSection('needsAction', 'Needs Action', 'amber')}
      {renderSection('upcoming', 'Confirmed', 'sage')}
      {renderSection('queued', 'Queued', 'warm')}
      {renderSection('hostHandling', 'Host Handling', 'warm')}
      {renderSection('cancelled', 'Cancelled', 'warm')}
      {!bookings?.length && <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2"><span className="text-3xl">📋</span><span>No bookings yet</span></div>}
    </div>
  );
}

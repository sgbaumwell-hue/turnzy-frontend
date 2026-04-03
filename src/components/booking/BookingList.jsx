import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BookingRow } from './BookingRow';
import { BookingRowSkeleton } from '../ui/Skeleton';
import { isUrgent } from '../../utils/status';
import clsx from 'clsx';

function SectionHeader({ label, count, color = 'warm', open, onToggle, helperText }) {
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
          {count > 0 && <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${badgeColors[color]}`}>{count}</span>}
        </div>
        {helperText && open && <div className="text-[11px] text-gray-400 mt-0.5">{helperText}</div>}
      </div>
      <ChevronDown size={14} className={clsx('text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
    </button>
  );
}

export function BookingList({ bookings, properties, isLoading }) {
  const propMap = useMemo(() => {
    if (!properties) return {};
    return Object.fromEntries(properties.map(p => [p.id, p]));
  }, [properties]);

  const sections = useMemo(() => {
    if (!bookings) return {};
    const isCancellation = (b) => ['cancellation', 'blocked'].includes((b.booking_type || '').toLowerCase());

    return {
      urgent: bookings.filter(b =>
        isUrgent(b) && ['pending', 'declined'].includes(b.cleaner_status) && !b.is_queued
      ),
      needsAction: bookings.filter(b =>
        ['pending', 'declined', 'cancel_pending'].includes(b.cleaner_status) &&
        !isUrgent(b) && !b.is_queued && !isCancellation(b)
      ),
      confirmed: bookings.filter(b => b.cleaner_status === 'accepted'),
      queued: bookings.filter(b => b.is_queued === true),
      selfManaged: bookings.filter(b =>
        b.cleaner_status === 'self_managed' || b.cleaner_status === 'dismissed'
      ),
      completed: bookings.filter(b => b.cleaner_status === 'completed'),
      cancelled: bookings.filter(b => isCancellation(b) || b.cleaner_status === 'cancel_acknowledged'),
    };
  }, [bookings]);

  const [openSections, setOpenSections] = useState({
    urgent: true,
    needsAction: true,
    confirmed: false,
    queued: false,
    selfManaged: false,
    completed: false,
    cancelled: false,
  });

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (isLoading) return <div>{[...Array(5)].map((_, i) => <BookingRowSkeleton key={i} />)}</div>;

  const renderSection = (key, label, color, helperText) => {
    const items = sections[key];
    if (!items?.length) return null;
    const isOpen = openSections[key] !== false;
    return (
      <div key={key}>
        <SectionHeader label={label} count={items.length} color={color} open={isOpen} onToggle={() => toggleSection(key)} helperText={helperText} />
        {isOpen && (
          <div className="pt-2">
            {key === 'cancelled' || key === 'completed'
              ? <div className="opacity-50">{items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)}</div>
              : items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
      {renderSection('urgent', 'Urgent (< 3 days)', 'danger')}
      {renderSection('needsAction', 'Needs Action', 'amber')}
      {renderSection('confirmed', 'Confirmed', 'sage')}
      {renderSection('queued', 'Queued', 'warm', "Beyond your cleaner's notification window")}
      {renderSection('selfManaged', 'Self-Managed', 'warm', "You're handling these turnovers yourself")}
      {renderSection('completed', 'Past', 'warm')}
      {renderSection('cancelled', 'Cancelled', 'warm')}
      {!bookings?.length && <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2"><span className="text-3xl">📋</span><span>No bookings yet</span></div>}
    </div>
  );
}

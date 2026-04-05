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
        {helperText && open && <div className="text-xs text-gray-500 mt-0.5">{helperText}</div>}
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
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50 pl-0.5">
      {renderSection('urgent', 'Urgent (< 3 days)', 'danger')}
      {renderSection('needsAction', 'Needs Action', 'amber')}
      {renderSection('confirmed', 'Confirmed', 'sage')}
      {renderSection('queued', 'Queued', 'warm', "Beyond your cleaner's notification window")}
      {renderSection('selfManaged', 'Self-Managed', 'warm', "You're handling these turnovers yourself")}
      {(() => {
        const unpaid = sections.completed?.filter(b => b.payment_status === 'unpaid' || b.payment_status === 'payment_not_received') || [];
        const label = unpaid.length > 0 ? `Past (${unpaid.length} unpaid)` : 'Past';
        const color = unpaid.length > 0 ? 'amber' : 'warm';
        return renderSection('completed', label, color);
      })()}
      {renderSection('cancelled', 'Cancelled', 'warm')}
      {!bookings?.length && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No turnovers yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">Add your first property to start tracking upcoming turnovers and coordinating with your cleaner.</p>
          <a href="/settings/properties" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors">Add a property</a>
        </div>
      )}
    </div>
  );
}

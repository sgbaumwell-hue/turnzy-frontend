import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BookingRow } from './BookingRow';
import { BookingRowSkeleton } from '../ui/Skeleton';
import { isUrgent } from '../../utils/status';
import clsx from 'clsx';

const SECTION_DOTS = {
  danger:  '#B33A32',
  amber:   '#C08419',
  sage:    '#4C8B22',
  warm:    '#9C9481',
};

function SectionHeader({ label, count, color = 'warm', open, onToggle, helperText }) {
  const dot = SECTION_DOTS[color] || SECTION_DOTS.warm;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 sticky top-0 z-10 w-full text-left cursor-pointer"
      style={{ background: 'rgba(251,248,241,0.95)', backdropFilter: 'blur(4px)', borderBottom: '1px solid #EDE7D7', borderTop: '1px solid #EDE7D7', marginTop: -1 }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span className="text-[11px] font-bold text-[#5F5B52] uppercase tracking-[0.1em]">{label}</span>
      <span className="text-[11px] font-semibold text-[#9C9481] tabular-nums">{count}</span>
      {helperText && open && <span className="text-[11px] text-[#9C9481] truncate ml-1">— {helperText}</span>}
      <div className="flex-1" />
      <ChevronDown size={13} className={clsx('text-[#9C9481] transition-transform duration-200', open ? '' : '-rotate-90')} />
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
      urgent:     bookings.filter(b => isUrgent(b) && ['pending','declined'].includes(b.cleaner_status) && !b.is_queued),
      needsAction: bookings.filter(b => ['pending','declined','cancel_pending'].includes(b.cleaner_status) && !isUrgent(b) && !b.is_queued && !isCancellation(b)),
      confirmed:  bookings.filter(b => b.cleaner_status === 'accepted'),
      queued:     bookings.filter(b => b.is_queued === true),
      selfManaged: bookings.filter(b => b.cleaner_status === 'self_managed' || b.cleaner_status === 'dismissed'),
      completed:  bookings.filter(b => b.cleaner_status === 'completed'),
      cancelled:  bookings.filter(b => isCancellation(b) || b.cleaner_status === 'cancel_acknowledged'),
    };
  }, [bookings]);

  const [openSections, setOpenSections] = useState({
    urgent: true, needsAction: true, confirmed: false,
    queued: false, selfManaged: false, completed: false, cancelled: false,
  });
  function toggleSection(key) { setOpenSections(prev => ({ ...prev, [key]: !prev[key] })); }

  if (isLoading) return <div>{[...Array(5)].map((_, i) => <BookingRowSkeleton key={i} />)}</div>;

  const renderSection = (key, label, color, helperText) => {
    const items = sections[key];
    if (!items?.length) return null;
    const isOpen = openSections[key] !== false;
    return (
      <div key={key}>
        <SectionHeader label={label} count={items.length} color={color} open={isOpen} onToggle={() => toggleSection(key)} helperText={helperText} />
        {isOpen && (
          <div className={clsx(key === 'cancelled' || key === 'completed' ? 'opacity-60' : '')}>
            {items.map(b => <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#FBF8F1' }}>
      {renderSection('urgent',      'Urgent · within 72h', 'danger')}
      {renderSection('needsAction', 'Needs action',        'amber')}
      {renderSection('confirmed',   'Confirmed',           'sage')}
      {renderSection('queued',      'Queued',              'warm', "Beyond notification window")}
      {renderSection('selfManaged', 'Self-managed',        'warm')}
      {(() => {
        const unpaid = sections.completed?.filter(b => b.payment_status === 'unpaid' || b.payment_status === 'payment_not_received') || [];
        const label = unpaid.length > 0 ? `Past (${unpaid.length} unpaid)` : 'Past';
        const color = unpaid.length > 0 ? 'amber' : 'warm';
        return renderSection('completed', label, color);
      })()}
      {renderSection('cancelled', 'Cancelled', 'warm')}

      {!bookings?.length && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#FAECE7' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3 className="text-[18px] font-semibold text-[#1F1D1A] mb-2">No turnovers yet</h3>
          <p className="text-[14px] text-[#6B6454] mb-6 max-w-xs">
            Add your first property to start tracking upcoming turnovers and coordinating with your cleaner.
          </p>
          <a href="/settings/properties"
            className="inline-flex items-center h-10 px-5 rounded-[10px] bg-[#E85F34] text-white text-[14px] font-medium hover:bg-[#D4522A] transition-colors">
            Add a property
          </a>
        </div>
      )}
    </div>
  );
}

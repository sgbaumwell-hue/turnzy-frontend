import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookingRow } from '../../components/booking/BookingRow';
import { BookingDetail } from '../../components/booking/BookingDetail';
import { useUiStore } from '../../store/uiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { isUrgent } from '../../utils/status';
import { bookingsApi } from '../../api/bookings';
import clsx from 'clsx';

const SECTION_CONFIG = {
  urgent: {
    title: 'Urgent',
    sub: 'Needs attention now',
    filter: (b) => isUrgent(b) && ['pending', 'declined'].includes(b.cleaner_status) && !b.is_queued,
    empty: 'Nothing urgent right now',
  },
  'needs-action': {
    title: 'Needs Action',
    sub: 'Awaiting cleaner response',
    filter: (b) => ['pending', 'declined', 'cancel_pending'].includes(b.cleaner_status) && !isUrgent(b) && !b.is_queued && !['cancellation', 'blocked'].includes((b.booking_type || '').toLowerCase()),
    empty: 'No bookings need action right now',
  },
  confirmed: {
    title: 'Confirmed',
    sub: 'Your cleaner is on it',
    filter: (b) => b.cleaner_status === 'accepted',
    empty: 'No confirmed turnovers yet',
  },
  queued: {
    title: 'Queued',
    sub: "Far-out bookings \u2014 not yet in notification window",
    filter: (b) => b.is_queued === true,
    empty: "No queued bookings \u2014 all upcoming bookings are within your notification window",
  },
  past: {
    title: 'Past',
    sub: 'Completed turnovers and payment tracking',
    filter: (b) => b.cleaner_status === 'completed',
    empty: 'No completed turnovers yet',
  },
};

export function BookingSection() {
  const { section } = useParams();
  const { selectedBookingId, setSelectedBooking } = useUiStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const config = SECTION_CONFIG[section] || SECTION_CONFIG.urgent;

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getAll(),
    refetchInterval: 5 * 60 * 1000,
  });

  const bookings = bookingsData?.data?.bookings || [];
  const properties = bookingsData?.data?.properties || [];
  const propMap = useMemo(() => Object.fromEntries((properties || []).map(p => [p.id, p])), [properties]);

  const filtered = useMemo(() => bookings.filter(config.filter), [bookings, config]);

  // Clear any stale selection when the user switches sections — otherwise
  // the detail pane keeps rendering a booking that no longer belongs to
  // the current list (e.g. viewing "Urgent", clicking a booking, then
  // navigating to "Past" shouldn't keep the Urgent booking in the pane).
  useEffect(() => { setSelectedBooking(null); }, [section, setSelectedBooking]);

  // Guard: never render the detail pane for a booking that isn't in the
  // current filter. Protects against late-arriving clicks that race with
  // the section-change effect above.
  const selectionInView = selectedBookingId != null
    && filtered.some(b => b.id === selectedBookingId);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* List */}
      <div className={clsx('flex flex-col border-r border-gray-200 bg-white', isDesktop ? 'w-[320px] flex-shrink-0' : 'flex-1')}>
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <h1 className="font-bold text-[20px] text-gray-900 leading-tight">{config.title}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{config.sub}</p>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2 px-6 text-center">
              <span className="text-3xl">📋</span>
              <span>{config.empty}</span>
            </div>
          )}
          {!isLoading && filtered.map(b => (
            <BookingRow key={b.id} booking={b} propName={propMap[b.property_id]?.name} />
          ))}
        </div>
      </div>

      {/* Detail panel (desktop) */}
      {isDesktop && (
        <div className="flex-1 min-w-0 bg-gray-50 overflow-y-auto">
          {selectionInView
            ? <BookingDetail bookingId={selectedBookingId} onClose={() => setSelectedBooking(null)} />
            : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Select a booking to view details</div>
          }
        </div>
      )}
    </div>
  );
}

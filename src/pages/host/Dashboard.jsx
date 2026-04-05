import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { BookingList } from '../../components/booking/BookingList';
import { BookingDetail } from '../../components/booking/BookingDetail';
import { useUiStore } from '../../store/uiStore';
import { bookingsApi } from '../../api/bookings';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { isUrgent } from '../../utils/status';
import clsx from 'clsx';

export function Dashboard() {
  const { selectedBookingId, setSelectedBooking, activeProperty } = useUiStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings', activeProperty],
    queryFn: () => bookingsApi.getAll({ property_id: activeProperty || undefined }),
    refetchInterval: 5 * 60 * 1000,
  });

  const { mutate: pollNow, isPending: isPolling } = useMutation({
    mutationFn: bookingsApi.pollNow,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });

  const bookings = bookingsData?.data?.bookings || [];
  const properties = bookingsData?.data?.properties || [];

  // Compute status counts for mobile cards
  const statusCounts = useMemo(() => {
    if (!bookings.length) return [];
    const urgent = bookings.filter(b => isUrgent(b) && ['pending', 'declined'].includes(b.cleaner_status) && !b.is_queued).length;
    const needsAction = bookings.filter(b => ['pending', 'declined', 'cancel_pending'].includes(b.cleaner_status) && !isUrgent(b) && !b.is_queued).length;
    const confirmed = bookings.filter(b => b.cleaner_status === 'accepted').length;
    const queued = bookings.filter(b => b.is_queued === true).length;
    return [
      { label: 'Urgent', count: urgent, color: 'bg-red-50 text-red-600 border-red-200', route: '/bookings/urgent' },
      { label: 'Action', count: needsAction, color: 'bg-amber-50 text-amber-700 border-amber-200', route: '/bookings/needs-action' },
      { label: 'Confirmed', count: confirmed, color: 'bg-green-50 text-green-700 border-green-200', route: '/bookings/confirmed' },
      { label: 'Queued', count: queued, color: 'bg-gray-50 text-gray-600 border-gray-200', route: '/bookings/queued' },
    ].filter(c => c.count > 0);
  }, [bookings]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className={clsx('flex flex-col border-r border-gray-200 bg-white', isDesktop ? 'w-[340px] flex-shrink-0' : 'flex-1')}>
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-semibold text-[18px] text-gray-900 leading-tight">Operations</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">Upcoming turnovers</p>
            </div>
            <button onClick={() => pollNow()} disabled={isPolling} aria-label="Refresh calendar" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mt-0.5"><RefreshCw size={15} className={isPolling ? 'animate-spin' : ''} /></button>
          </div>
        </div>
        {/* Mobile status count cards */}
        {!isDesktop && statusCounts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide border-b border-gray-100">
            {statusCounts.map(card => (
              <Link key={card.route} to={card.route} className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border text-center min-w-[80px] ${card.color}`}>
                <span className="text-2xl font-bold leading-none">{card.count}</span>
                <span className="text-xs font-medium mt-1 leading-tight">{card.label}</span>
              </Link>
            ))}
          </div>
        )}
        <BookingList bookings={bookings} properties={properties} isLoading={isLoading} />
      </div>
      {isDesktop && bookings.length > 0 && (
        <div className="flex-1 min-w-0 bg-stone-50 overflow-y-auto">
          {selectedBookingId ? <BookingDetail bookingId={selectedBookingId} onClose={() => setSelectedBooking(null)} /> : <div className="flex items-center justify-center h-full text-gray-400 text-sm">Select a booking to view details</div>}
        </div>
      )}
    </div>
  );
}

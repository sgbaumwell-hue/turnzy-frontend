import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw } from 'lucide-react';
import { BookingList } from '../../components/booking/BookingList';
import { BookingDetail } from '../../components/booking/BookingDetail';
import { useUiStore } from '../../store/uiStore';
import { bookingsApi } from '../../api/bookings';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import clsx from 'clsx';

export function Dashboard() {
  const [search, setSearch] = useState('');
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
  const filtered = search ? bookings.filter(b => b.checkout_date?.includes(search) || properties.find(p => p.id === b.property_id)?.name?.toLowerCase().includes(search.toLowerCase())) : bookings;

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className={clsx('flex flex-col border-r border-warm-200 bg-white', isDesktop ? 'w-[320px] flex-shrink-0' : 'flex-1')}>
        <div className="px-4 pt-4 pb-3 border-b border-warm-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-bold text-[20px] text-warm-900 leading-tight">Operations Overview</h1>
              <p className="text-[13px] text-warm-400 mt-0.5">Manage upcoming property transitions</p>
            </div>
            <button onClick={() => pollNow()} disabled={isPolling} aria-label="Refresh calendar" className="p-1.5 rounded-lg text-warm-400 hover:bg-warm-100 hover:text-warm-600 transition-colors mt-0.5"><RefreshCw size={15} className={isPolling ? 'animate-spin' : ''} /></button>
          </div>
          <div className="flex items-center gap-2 bg-warm-100 rounded-xl px-3 py-2">
            <Search size={14} className="text-warm-300 flex-shrink-0" />
            <input type="text" placeholder="Search turnovers..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-warm-700 placeholder:text-warm-400 focus:outline-none" />
          </div>
        </div>
        <BookingList bookings={filtered} properties={properties} isLoading={isLoading} />
      </div>
      {isDesktop && (
        <div className="flex-1 bg-warm-50 overflow-y-auto border-l border-warm-200">
          {selectedBookingId ? <BookingDetail bookingId={selectedBookingId} onClose={() => setSelectedBooking(null)} /> : <div className="flex items-center justify-center h-full text-warm-400 text-sm">Select a booking to view details</div>}
        </div>
      )}
    </div>
  );
}

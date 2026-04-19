import { useMemo, useState } from 'react';
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
  const [activePropertyTab, setActivePropertyTab] = useState(null); // null = "All"

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

  // Filter by active property tab
  const filteredBookings = useMemo(() => {
    if (!activePropertyTab) return bookings;
    return bookings.filter(b => b.property_id === activePropertyTab);
  }, [bookings, activePropertyTab]);

  // Status counts for mobile cards & sidebar
  const statusCounts = useMemo(() => {
    if (!bookings.length) return {};
    return {
      urgent:     bookings.filter(b => isUrgent(b) && ['pending','declined'].includes(b.cleaner_status) && !b.is_queued).length,
      needsAction: bookings.filter(b => ['pending','declined','cancel_pending'].includes(b.cleaner_status) && !isUrgent(b) && !b.is_queued).length,
      confirmed:  bookings.filter(b => b.cleaner_status === 'accepted').length,
      queued:     bookings.filter(b => b.is_queued === true).length,
    };
  }, [bookings]);

  // Mobile summary cards
  const mobileSummary = useMemo(() => [
    { label: 'Urgent',    count: statusCounts.urgent,     bg: '#FBEDEA', text: '#9A2F2A', border: '#F0D4CE', route: '/bookings/urgent' },
    { label: 'Action',    count: statusCounts.needsAction, bg: '#F9EDD4', text: '#7A4A0A', border: '#EBD5A8', route: '/bookings/needs-action' },
    { label: 'Confirmed', count: statusCounts.confirmed,  bg: '#E4EFDA', text: '#2F5E16', border: '#CCE0B5', route: '/bookings/confirmed' },
    { label: 'Queued',    count: statusCounts.queued,     bg: '#EDE7D7', text: '#6B6454', border: '#DCD4C0', route: '/bookings/queued' },
  ].filter(c => c.count > 0), [statusCounts]);

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* List pane */}
      <div className={clsx('flex flex-col', isDesktop ? 'w-[340px] flex-shrink-0' : 'flex-1')}
        style={{ borderRight: '1px solid #EDE7D7', background: '#FBF8F1' }}>

        {/* Pane header */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid #EDE7D7' }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="font-serif text-[22px] font-black tracking-[-0.025em] text-[#1F1D1A] leading-none">Turnovers</h1>
                {bookings.length > 0 && (
                  <span className="text-[13px] font-semibold text-[#9C9481] tabular-nums">{bookings.length}</span>
                )}
              </div>
              <p className="text-[12.5px] text-[#6B6454] mt-1">Upcoming work across your portfolio</p>
            </div>
            <button
              onClick={() => pollNow()}
              disabled={isPolling}
              aria-label="Refresh calendar"
              className="p-1.5 rounded-lg text-[#9C9481] hover:bg-[#EDE7D7] hover:text-[#1F1D1A] transition-colors mt-0.5 flex-shrink-0"
            >
              <RefreshCw size={14} className={isPolling ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Property filter pills */}
          {properties.length > 1 && (
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActivePropertyTab(null)}
                className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full transition-colors flex-shrink-0"
                style={{
                  background: !activePropertyTab ? '#1F1D1A' : 'transparent',
                  color: !activePropertyTab ? 'white' : '#6B6454',
                }}
              >All</button>
              {properties.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePropertyTab(p.id)}
                  className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full transition-colors flex-shrink-0 hover:bg-[#EDE7D7]"
                  style={{
                    background: activePropertyTab === p.id ? '#1F1D1A' : 'transparent',
                    color: activePropertyTab === p.id ? 'white' : '#6B6454',
                    whiteSpace: 'nowrap',
                  }}
                >{p.name.split(' ')[0]}</button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile summary cards */}
        {!isDesktop && mobileSummary.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide flex-shrink-0" style={{ borderBottom: '1px solid #EDE7D7' }}>
            {mobileSummary.map(card => (
              <Link key={card.route} to={card.route}
                className="flex flex-col items-center justify-center px-4 py-3 rounded-xl border text-center min-w-[72px] transition-opacity hover:opacity-80"
                style={{ background: card.bg, borderColor: card.border, color: card.text }}>
                <span className="text-2xl font-bold leading-none tabular-nums">{card.count}</span>
                <span className="text-[11px] font-medium mt-1 leading-tight">{card.label}</span>
              </Link>
            ))}
          </div>
        )}

        <BookingList bookings={filteredBookings} properties={properties} isLoading={isLoading} />
      </div>

      {/* Detail pane */}
      {isDesktop && (
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ background: '#FBF8F1' }}>
          {selectedBookingId
            ? <BookingDetail bookingId={selectedBookingId} onClose={() => setSelectedBooking(null)} />
            : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#EDE7D7' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C9481" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="font-serif text-[22px] font-black tracking-[-0.02em] text-[#1F1D1A]">Pick a turnover</div>
                <div className="text-[14px] text-[#6B6454] mt-1 max-w-xs">Select a booking from the list to see the full timeline, cleaner, and actions.</div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

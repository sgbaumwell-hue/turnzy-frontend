import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { BookingDetail } from '../../components/booking/BookingDetail';
import { BottomNav } from '../../components/layout/BottomNav';

const BACK_LABELS = {
  '/': 'Dashboard',
  '/bookings/urgent': 'Urgent',
  '/bookings/needs-action': 'Needs action',
  '/bookings/confirmed': 'Confirmed',
  '/bookings/queued': 'Queued',
  '/bookings/past': 'Past',
};

function resolveBackLabel(state) {
  const from = state?.from;
  if (from && BACK_LABELS[from]) return BACK_LABELS[from];
  return 'Dashboard';
}

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backLabel = resolveBackLabel(location.state);

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F9F8F6' }}>
      <header
        className="md:hidden sticky top-0 z-20 flex-shrink-0 flex items-center font-inter"
        style={{ height: 48, background: '#F9F8F6', borderBottom: '1px solid #EDEAE0' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-0.5 pl-2 pr-3"
          style={{ height: 44, color: '#1F1D1A' }}
        >
          <ChevronLeft size={20} strokeWidth={2.4} style={{ color: '#D85A30' }} />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#5F5B52' }}>Back to {backLabel}</span>
        </button>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto pb-[78px] md:pb-0">
        <BookingDetail bookingId={id} onClose={() => navigate(-1)} fullPage />
      </div>
      <BottomNav />
    </div>
  );
}

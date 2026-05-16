import { useParams, useNavigate } from 'react-router-dom';
import { BookingDetail } from '../../components/booking/BookingDetail';
import { BottomNav } from '../../components/layout/BottomNav';

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 78 }} className="md:pb-0">
        <BookingDetail bookingId={id} onClose={() => navigate(-1)} />
      </div>
      <BottomNav />
    </div>
  );
}

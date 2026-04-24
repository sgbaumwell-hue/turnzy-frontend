import { useParams, useNavigate } from 'react-router-dom';
import { BookingDetail } from '../../components/booking/BookingDetail';

// Mobile full-page route for a booking detail. Renders the same pane
// used in the host dashboard drawer, with onClose wired to a browser back.
export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BookingDetail bookingId={id} onClose={() => navigate(-1)} />
    </div>
  );
}

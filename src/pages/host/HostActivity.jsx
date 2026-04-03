import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const secs = Math.floor((now - d) / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDotColor(eventType) {
  const t = (eventType || '').toLowerCase();
  if (t.includes('accept') || t.includes('confirm') || t.includes('complete')) return 'bg-green-500';
  if (t.includes('decline') || t.includes('cancel')) return 'bg-red-500';
  if (t.includes('modified') || t.includes('issue')) return 'bg-amber-500';
  if (t.includes('assign') || t.includes('new') || t.includes('notif') || t.includes('detect')) return 'bg-orange-500';
  return 'bg-gray-300';
}

export function HostActivity() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['host-activity'],
    queryFn: () => bookingsApi.getActivity(),
    retry: 1,
  });

  if (isError) {
    console.error('HostActivity fetch error:', error);
  }

  const activities = Array.isArray(data?.data?.activity) ? data.data.activity : [];

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Activity</h1>
          <p className="text-[13px] text-gray-400 mb-6">A log of everything across your properties</p>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="text-[15px] font-medium text-gray-700 mb-1">Activity couldn't load</div>
              <div className="text-[13px] text-gray-400">Please refresh the page to try again.</div>
            </div>
          )}

          {!isLoading && !isError && activities.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="text-[15px] font-medium text-gray-700 mb-1">No activity yet</div>
              <div className="text-[13px] text-gray-400">Events will appear here as bookings are detected and cleaners respond.</div>
            </div>
          )}

          {!isLoading && !isError && activities.map((a, i) => (
            <div key={a.id || i} className="flex gap-3 py-3 border-b border-gray-100">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${getDotColor(a.event_type)}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-gray-700">{a.description || 'Activity event'}</div>
                <div className="flex items-center gap-2 mt-1">
                  {a.property_name && (
                    <span className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{a.property_name}</span>
                  )}
                  <span className="text-[11px] text-gray-400" title={a.created_at ? new Date(a.created_at).toLocaleString() : ''}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

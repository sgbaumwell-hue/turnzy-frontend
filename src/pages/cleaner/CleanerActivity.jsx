import { useQuery } from '@tanstack/react-query';
import { cleanerApi } from '../../api/cleaner';

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
  if (t.includes('assign') || t.includes('new') || t.includes('notif')) return 'bg-orange-500';
  return 'bg-gray-300';
}

export function CleanerActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['cleaner-activity'],
    queryFn: async () => {
      try {
        if (cleanerApi.getActivity) return await cleanerApi.getActivity();
        // Stub: generate activity from jobs
        console.warn('Endpoint missing: GET /api/cleaner/activity');
        return { data: { activities: [] } };
      } catch { return { data: { activities: [] } }; }
    },
  });

  const activities = data?.data?.activities || [];

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Activity</h1>
          <p className="text-[13px] text-gray-400 mb-6">A log of everything across your jobs</p>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          )}

          {!isLoading && activities.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="text-[15px] font-medium text-gray-700 mb-1">No activity yet</div>
              <div className="text-[13px] text-gray-400">Your job history will appear here once you start receiving assignments.</div>
            </div>
          )}

          {!isLoading && activities.map((a, i) => (
            <div key={a.id || i} className="flex gap-3 py-3 border-b border-gray-100">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${getDotColor(a.event_type)}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-gray-700">{a.description}</div>
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

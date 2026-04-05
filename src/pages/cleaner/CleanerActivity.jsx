import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cleanerApi } from '../../api/cleaner';
import { getActivityDescription, getActivityMeta } from '../../utils/activityDescriptions';

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

function consolidatePaymentReminders(activities) {
  const seen = {};
  return activities.reduce((acc, a) => {
    if (a.event_type === 'payment_reminder' && a.booking_id) {
      const key = `pr-${a.booking_id}`;
      if (!seen[key]) {
        seen[key] = { count: 1, latest: a };
        acc.push(a);
      } else {
        seen[key].count++;
        const idx = acc.indexOf(seen[key].latest);
        if (idx >= 0 && new Date(a.created_at) > new Date(seen[key].latest.created_at)) {
          acc[idx] = a;
          seen[key].latest = a;
        }
      }
      const idx = acc.indexOf(seen[key].latest);
      if (idx >= 0) acc[idx]._reminderCount = seen[key].count;
      return acc;
    }
    acc.push(a);
    return acc;
  }, []);
}

export function CleanerActivity() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cleaner-activity'],
    queryFn: () => cleanerApi.getActivity(),
    retry: 1,
  });

  if (isError) {
    console.error('CleanerActivity fetch error:', error);
  }

  const rawActivities = Array.isArray(data?.data?.activities) ? data.data.activities : [];
  const activities = useMemo(() => consolidatePaymentReminders(rawActivities), [rawActivities]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">
          <h1 className="text-[24px] font-bold text-gray-900 mb-1">Activity</h1>
          <p className="text-[13px] text-gray-400 mb-6">A log of everything across your jobs</p>

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
              <div className="text-[13px] text-gray-400">Your job history will appear here once you start receiving assignments.</div>
            </div>
          )}

          {!isLoading && !isError && activities.map((a, i) => {
            const meta = getActivityMeta(a.event_type);
            let description = getActivityDescription(a);
            if (a._reminderCount && a._reminderCount > 1) {
              description += ` (reminder ${a._reminderCount} of 3)`;
            }
            const isTappable = !!a.booking_id;

            return (
              <div
                key={a.id || i}
                className={`flex gap-3 py-3 border-b border-gray-100 ${isTappable ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors' : ''}`}
                onClick={isTappable ? () => navigate(`/cleaner/calendar/job/${a.booking_id}`) : undefined}
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${meta.dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-700">
                    {a.property_name ? (
                      <>
                        {description.split(a.property_name).map((part, j, arr) => (
                          <span key={j}>
                            {part}
                            {j < arr.length - 1 && <span className="font-medium">{a.property_name}</span>}
                          </span>
                        ))}
                      </>
                    ) : description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {a.property_name && (
                      <span className="text-[11px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{a.property_name}</span>
                    )}
                    <span className="text-[11px] text-gray-400" title={a.created_at ? new Date(a.created_at).toLocaleString() : ''}>
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                </div>
                {isTappable && <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-1" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

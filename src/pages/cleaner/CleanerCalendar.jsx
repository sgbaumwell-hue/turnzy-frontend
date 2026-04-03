import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CleanerCalendar.css';
import { cleanerApi } from '../../api/cleaner';
import { CleanerJobDetail } from './CleanerJobDetail';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay,
  locales: { 'en-US': enUS },
});

function getEventColor(status) {
  return {
    pending: '#f97316',
    accepted: '#22c55e',
    declined: '#ef4444',
    completed: '#9ca3af',
  }[status] ?? '#f97316';
}

function CustomToolbar({ label, onNavigate, onView, view }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const btnClass = 'px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50';

  if (!isDesktop) {
    return (
      <div className="flex flex-col items-center gap-2 mb-4">
        <span className="text-base font-semibold text-gray-900">{label}</span>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('PREV')} className={btnClass}>← Back</button>
          <button onClick={() => onNavigate('TODAY')} className={btnClass}>Today</button>
          <button onClick={() => onNavigate('NEXT')} className={btnClass}>Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-2">
        <button onClick={() => onNavigate('PREV')} className={btnClass}>← Back</button>
        <button onClick={() => onNavigate('TODAY')} className={btnClass}>Today</button>
        <button onClick={() => onNavigate('NEXT')} className={btnClass}>Next →</button>
      </div>
      <span className="text-base font-semibold text-gray-900">{label}</span>
      <div className="flex gap-1">
        <button onClick={() => onView('month')}
          className={`px-3 py-1.5 text-sm rounded-lg ${view === 'month' ? 'bg-orange-500 text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>
          Month
        </button>
        <button onClick={() => onView('week')}
          className={`px-3 py-1.5 text-sm rounded-lg ${view === 'week' ? 'bg-orange-500 text-white' : 'border border-gray-200 bg-white text-gray-700'}`}>
          Week
        </button>
      </div>
    </div>
  );
}

export function CleanerCalendar() {
  const { user } = useAuthStore();
  const hasTeam = user?.has_team || false;
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showTeam, setShowTeam] = useState(false);

  const { data } = useQuery({
    queryKey: ['cleaner-jobs'],
    queryFn: () => cleanerApi.getJobs(),
    refetchInterval: 5 * 60 * 1000,
  });

  const jobs = data?.data?.jobs || [];

  const events = useMemo(() => {
    return jobs.map(job => {
      const coDate = job.checkout_date?.toString().slice(0, 10);
      const coTime = job.checkout_time || job.default_checkout_time || '11:00';
      const ciTime = job.checkin_time || job.default_checkin_time || '15:00';
      const [coH, coM] = coTime.split(':').map(Number);
      const [ciH, ciM] = ciTime.split(':').map(Number);
      const [y, m, d] = coDate.split('-').map(Number);

      let title = job.property_name || 'Turnover';
      if (showTeam && hasTeam && job.team_assignment_name) {
        title += ` · ${job.team_assignment_name}`;
      }

      return {
        id: job.id,
        title,
        start: new Date(y, m - 1, d, coH, coM),
        end: new Date(y, m - 1, d, ciH, ciM),
        resource: job,
      };
    });
  }, [jobs, showTeam, hasTeam]);

  function handleSelectEvent(event) {
    if (!isDesktop) {
      navigate(`/cleaner/calendar/job/${event.resource.id}`);
    } else {
      setSelectedJobId(event.resource.id);
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className={selectedJobId && isDesktop ? 'flex-1 min-w-0' : 'flex-1'}>
        <div className="p-4 md:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-semibold text-[18px] text-gray-900">Calendar</h1>
              <p className="text-[13px] text-gray-400">Your upcoming turnovers</p>
            </div>
            {hasTeam && isDesktop && (
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[12px] text-gray-500">Show team</span>
                <div className={`relative w-8 h-5 rounded-full transition-colors ${showTeam ? 'bg-coral-400' : 'bg-gray-200'}`} onClick={() => setShowTeam(!showTeam)}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showTeam ? 'translate-x-3' : ''}`} />
                </div>
              </label>
            )}
          </div>
          <div className="flex-1 min-h-0 h-[calc(100vh-220px)] md:h-auto">
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="month"
              views={isDesktop ? ['month', 'week'] : ['month']}
              style={{ height: '100%' }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: getEventColor(event.resource.cleaner_status),
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontFamily: 'Manrope, sans-serif',
                },
              })}
              onSelectEvent={handleSelectEvent}
              components={{ toolbar: CustomToolbar }}
            />
          </div>
        </div>
      </div>
      {selectedJobId && isDesktop && (
        <div className="w-[400px] flex-shrink-0 border-l border-gray-200 bg-stone-50 overflow-y-auto">
          <CleanerJobDetail jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
        </div>
      )}
    </div>
  );
}

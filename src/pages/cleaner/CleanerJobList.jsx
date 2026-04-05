import { useMemo, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { CleanerJobRow } from './CleanerJobRow';
import { BookingRowSkeleton } from '../../components/ui/Skeleton';
import clsx from 'clsx';

function SectionHeader({ label, count, color = 'warm', open, onToggle }) {
  const badgeColors = {
    amber: 'bg-amber-400 text-white',
    green: 'bg-green-500 text-white',
    warm: 'bg-gray-200 text-gray-600',
    today: 'bg-coral-400 text-white',
  };
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2.5 sticky top-0 backdrop-blur-sm z-10 border-b border-gray-100 w-full text-left cursor-pointer bg-gray-50/90"
    >
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
      {count > 0 && <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${badgeColors[color]}`}>{count}</span>}
      <ChevronDown size={14} className={clsx('ml-auto text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
    </button>
  );
}

export function CleanerJobList({ jobs, isLoading }) {
  const today = new Date().toISOString().slice(0, 10);

  const sections = useMemo(() => {
    if (!jobs) return {};
    return {
      today: jobs.filter(j => {
        const coDate = j.checkout_date?.toString().slice(0, 10);
        return coDate === today && !['declined', 'completed'].includes(j.cleaner_status);
      }),
      needsResponse: jobs.filter(j => {
        const coDate = j.checkout_date?.toString().slice(0, 10);
        return j.cleaner_status === 'pending' && coDate !== today;
      }),
      upcoming: jobs.filter(j => {
        const coDate = j.checkout_date?.toString().slice(0, 10);
        return j.cleaner_status === 'accepted' && coDate > today;
      }),
      past: jobs.filter(j => {
        const coDate = j.checkout_date?.toString().slice(0, 10);
        return coDate < today || ['completed', 'declined'].includes(j.cleaner_status);
      }),
    };
  }, [jobs, today]);

  const [openSections, setOpenSections] = useState({
    today: true,
    needsResponse: true,
    upcoming: false,
    past: false,
  });

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (isLoading) return <div>{[...Array(4)].map((_, i) => <BookingRowSkeleton key={i} />)}</div>;

  if (!jobs?.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Users size={28} className="text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">You're not connected yet</h3>
        <p className="text-sm text-gray-500 mb-5 max-w-xs">Ask your host to add you in Turnzy, or invite your host directly.</p>
        <p className="text-xs text-gray-400">Check your email for an invite from your host</p>
      </div>
    );
  }

  const renderSection = (key, label, color) => {
    const items = sections[key];
    if (!items?.length) return null;
    const isOpen = openSections[key] !== false;
    return (
      <div key={key}>
        <SectionHeader label={label} count={items.length} color={color} open={isOpen} onToggle={() => toggleSection(key)} />
        {isOpen && (
          <div className="pt-2">
            {items.map(j => <CleanerJobRow key={j.id} job={j} isToday={key === 'today'} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
      {renderSection('today', 'Today', 'today')}
      {renderSection('needsResponse', 'Needs Response', 'amber')}
      {renderSection('upcoming', 'Upcoming', 'green')}
      {renderSection('past', 'Past', 'warm')}
      {sections.today?.length === 0 && !sections.needsResponse?.length && !sections.upcoming?.length && !sections.past?.length && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm gap-2">
          <span className="text-3xl">📋</span>
          <span>No jobs yet</span>
        </div>
      )}
    </div>
  );
}

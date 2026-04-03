import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { cleanerApi } from '../../api/cleaner';
import { CleanerJobList } from './CleanerJobList';
import { CleanerJobDetail } from './CleanerJobDetail';
import { useCleanerUiStore } from '../../store/cleanerUiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import clsx from 'clsx';

export function CleanerDashboard() {
  const { selectedJobId, setSelectedJob } = useCleanerUiStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cleaner-jobs'],
    queryFn: () => cleanerApi.getJobs(),
    refetchInterval: 5 * 60 * 1000,
  });

  const jobs = data?.data?.jobs || [];

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className={clsx('flex flex-col border-r border-gray-200 bg-white', isDesktop ? 'w-[340px] flex-shrink-0' : 'flex-1')}>
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-semibold text-[18px] text-gray-900 leading-tight">My Jobs</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">Upcoming turnovers</p>
            </div>
            <button onClick={() => refetch()} aria-label="Refresh" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mt-0.5">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
        <CleanerJobList jobs={jobs} isLoading={isLoading} />
      </div>
      {isDesktop && (
        <div className="flex-1 min-w-0 bg-stone-50 overflow-y-auto">
          {selectedJobId ? (
            <CleanerJobDetail jobId={selectedJobId} onClose={() => setSelectedJob(null)} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a job to view details
            </div>
          )}
        </div>
      )}
    </div>
  );
}

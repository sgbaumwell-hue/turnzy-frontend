import clsx from 'clsx';

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100 bg-[length:200%_100%] rounded',
        'animate-[shimmer_1.8s_ease-in-out_infinite]',
        className,
      )}
    />
  );
}

export function BookingRowSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-warm-100">
      <div className="flex flex-col items-center gap-1 w-10 flex-shrink-0">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-6 w-6" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-36" />
      </div>
      <Skeleton className="h-6 w-24 rounded-pill" />
    </div>
  );
}

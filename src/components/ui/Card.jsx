import clsx from 'clsx';
export function Card({ children, className, padding = true }) {
  return (<div className={clsx('bg-white rounded-xl border border-warm-200', padding && 'p-4', className)}>{children}</div>);
}

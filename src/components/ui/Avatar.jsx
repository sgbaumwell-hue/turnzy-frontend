import clsx from 'clsx';
export function Avatar({ name, size = 'md', className }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
  return (<div className={clsx('rounded-full bg-coral-400 text-white flex items-center justify-center font-bold flex-shrink-0', sizes[size], className)}>{initial}</div>);
}

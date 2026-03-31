import clsx from 'clsx';
export function Pill({ label, bg, text, size = 'md' }) {
  return (
    <span className={clsx(
      'inline-flex items-center font-bold tracking-wide rounded-pill uppercase',
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : size === 'lg' ? 'text-[11px] px-3 py-1.5' : 'text-[11px] px-3 py-1',
      bg, text
    )}>
      {label}
    </span>
  );
}

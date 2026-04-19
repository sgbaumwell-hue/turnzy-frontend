import clsx from 'clsx';

const radii = { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl' };

export function Card({ children, className, padding = true, hover = false, radius = 'md' }) {
  return (
    <div
      className={clsx(
        'bg-white border border-warm-200',
        radii[radius],
        padding && 'p-4',
        hover &&
          'transition-all duration-150 hover:border-warm-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_12px_28px_-16px_rgba(0,0,0,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

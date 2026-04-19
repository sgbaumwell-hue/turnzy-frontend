import clsx from 'clsx';

// Small uppercase label used above page headers and section titles.
// Not yet consumed anywhere — Phase 2 page redesigns will adopt it.
export function Eyebrow({ children, className }) {
  return (
    <div
      className={clsx(
        'text-[11px] font-bold text-warm-400 uppercase tracking-[0.14em]',
        className,
      )}
    >
      {children}
    </div>
  );
}

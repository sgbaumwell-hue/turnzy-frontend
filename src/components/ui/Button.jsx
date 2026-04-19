import clsx from 'clsx';

const variants = {
  primary:   'bg-coral-400 text-white hover:bg-coral-500 active:bg-coral-600 shadow-sm',
  secondary: 'bg-warm-100 text-warm-800 hover:bg-warm-200',
  outline:   'bg-white border border-warm-200 text-warm-800 hover:bg-warm-50 hover:border-warm-300',
  danger:    'bg-danger-400 text-white hover:bg-danger-600 shadow-sm',
  ghost:     'text-warm-600 hover:bg-warm-100',
};

// Sizes per Phase 1 handoff. `sm` and `md` keep `min-h-touch` (44px min)
// so existing buttons don't visually shrink on any page; `lg` is new and
// opts in to the explicit 48px height.
const sizes = {
  sm: 'text-[13px] min-h-touch px-3 rounded-md gap-1.5',
  md: 'text-[14px] min-h-touch px-4 rounded-lg gap-2',
  lg: 'text-[15px] h-12 px-6 rounded-xl gap-2',
};

export function Button({ children, variant = 'primary', size = 'md', className, loading, icon, fullWidth, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all duration-100',
        'active:scale-[0.98]',
        'focus-visible:outline-2 focus-visible:outline-coral-400 focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

import clsx from 'clsx';
const variants = {
  primary: 'bg-coral-400 text-white hover:bg-coral-600 active:scale-[0.98]',
  secondary: 'bg-warm-100 text-warm-800 hover:bg-warm-200 active:scale-[0.98]',
  outline: 'border border-warm-200 text-warm-600 hover:bg-warm-100 active:scale-[0.98]',
  danger: 'bg-danger-400 text-white hover:bg-danger-600 active:scale-[0.98]',
  ghost: 'text-warm-600 hover:bg-warm-100 active:scale-[0.98]',
};
export function Button({ children, variant = 'primary', size = 'md', className, loading, icon, fullWidth, ...props }) {
  return (<button className={clsx('inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-100 min-h-touch focus-visible:outline-2 focus-visible:outline-coral-400 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', size === 'sm' ? 'text-sm px-3 py-2' : 'text-sm px-4 py-3', fullWidth && 'w-full', variants[variant], className)} disabled={loading || props.disabled} {...props}>
    {loading ? (<svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>) : icon}
    {children}
  </button>);
}

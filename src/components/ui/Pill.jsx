import clsx from 'clsx';

// System status tones — adopt via `tone="..."`. New call sites should
// prefer this API; existing `bg` / `text` callers still work via the
// fallback branch below.
const tones = {
  urgent:    'bg-danger-50 text-danger-800 ring-1 ring-inset ring-danger-200',
  pending:   'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  confirmed: 'bg-sage-50 text-sage-800 ring-1 ring-inset ring-sage-200',
  queued:    'bg-warm-100 text-warm-600 ring-1 ring-inset ring-warm-200',
  completed: 'bg-warm-100 text-warm-600',
  neutral:   'bg-warm-100 text-warm-600',
  coral:     'bg-coral-50 text-coral-800 ring-1 ring-inset ring-coral-200',
  info:      'bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200',
};

const dotColors = {
  urgent:    'bg-danger-400',
  pending:   'bg-amber-400',
  confirmed: 'bg-sage-600',
  queued:    'bg-warm-400',
  completed: 'bg-warm-400',
  neutral:   'bg-warm-400',
  coral:     'bg-coral-400',
  info:      'bg-sky-400',
};

export function Pill({ label, children, tone, bg, text, size = 'md', dot = false, className }) {
  const content = children ?? label;
  // Backward compat: raw `bg` / `text` utility classes take effect when no
  // tone is supplied, so existing call sites keep rendering unchanged.
  const toneClasses = tone ? tones[tone] : clsx(bg, text);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-bold tracking-wide rounded-pill uppercase',
        size === 'sm'
          ? 'text-[10px] px-2 py-0.5'
          : size === 'lg'
            ? 'text-[11px] px-3 py-1.5'
            : 'text-[11px] px-3 py-1',
        toneClasses,
        className,
      )}
    >
      {dot && tone && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[tone])} />
      )}
      {content}
    </span>
  );
}

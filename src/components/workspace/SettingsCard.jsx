import clsx from 'clsx';
import { Eyebrow } from '@/components/ui/Eyebrow';

// The shared chrome for every section card on the detail panes of both
// Properties and Cleaners. Keeps the eyebrow / title / description / actions
// / body layout identical across sections so the detail pane reads as one
// consistent rhythm.
export function SettingsCard({
  eyebrow,
  eyebrowTone = 'default',
  title,
  description,
  actions,
  children,
  tone = 'default',
  className,
}) {
  const toneClasses = {
    default: 'bg-white border-[#EDEAE0]',
    danger:  'bg-white border-[#F7C1C1]',
  };
  const eyebrowClassName = clsx(
    eyebrowTone === 'danger' && 'text-[#A32D2D]',
    eyebrowTone === 'coral' && 'text-[#993C1D]',
  );

  return (
    <section
      className={clsx(
        'rounded-[14px] border p-5',
        toneClasses[tone],
        className,
      )}
    >
      {(eyebrow || title || description || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <Eyebrow className={eyebrowClassName}>{eyebrow}</Eyebrow>}
            {title && (
              <h3 className="mt-1 text-[15px] font-bold leading-tight text-[#1C1C1A]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-[13px] leading-snug text-[#5F5E5A]">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

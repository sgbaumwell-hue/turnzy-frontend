import clsx from 'clsx';
import { Button } from '@/components/ui/Button';

// Small inline confirm card used for destructive actions inside a section
// (e.g. "Remove cleaner from Larkin's Way?"). Appears in-place rather than
// opening a modal, so the context stays visible.
export function InlineConfirm({
  tone = 'danger',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const toneClasses = {
    danger: 'bg-[#FCEBEB] border-[#F7C1C1] text-[#1C1C1A]',
    warn:   'bg-[#FDF6E7] border-[#F7E2B0] text-[#1C1C1A]',
  };

  return (
    <div
      className={clsx(
        'rounded-[10px] border p-3 flex flex-wrap items-center justify-between gap-3',
        toneClasses[tone],
      )}
    >
      <div className="flex-1 min-w-[200px] text-[13px]">{message}</div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'warn' ? 'primary' : 'danger'}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

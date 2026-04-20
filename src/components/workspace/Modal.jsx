import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

// Shared modal shell for destructive confirmations and the Add Property
// dialog. Backdrop dims the page; click-outside closes; Escape closes.
export function Modal({ open, onClose, children, width = 460, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{ background: 'rgba(28, 28, 26, 0.48)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className={clsx(
          'relative w-full bg-white rounded-2xl p-6',
          'shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35),0_10px_24px_-6px_rgba(0,0,0,0.18)]',
          className,
        )}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-warm-400 hover:bg-warm-100 hover:text-warm-600 transition-colors duration-150"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

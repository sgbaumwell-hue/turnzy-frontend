import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-none transition-colors',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };

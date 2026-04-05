import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/30',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        'transition-colors',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };

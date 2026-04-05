import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-coral-50 text-coral-400',
        pending: 'bg-amber-50 text-amber-800',
        confirmed: 'bg-green-100 text-green-700',
        declined: 'bg-red-100 text-red-700',
        urgent: 'bg-red-100 text-red-700',
        queued: 'bg-gray-100 text-gray-500',
        selfManaged: 'bg-gray-100 text-gray-600',
        completed: 'bg-gray-100 text-gray-500',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-sky-50 text-sky-600',
        muted: 'bg-gray-100 text-gray-500',
        outline: 'border border-gray-200 text-gray-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

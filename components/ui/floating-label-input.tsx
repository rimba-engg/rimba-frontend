import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            'peer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        <label
          className={cn(
            'absolute left-3 top-2 text-sm text-muted-foreground transition-all duration-200',
            'top-[-0.6rem] bg-background px-1 text-xs text-foreground'
          )}
          onClick={() => {
            if (ref && typeof ref === 'object' && 'current' in ref) {
              ref.current?.focus();
            }
          }}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };

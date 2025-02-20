'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'default' | 'sm' | 'lg';
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, text = 'Loading...', size = 'default', ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'flex items-center justify-center p-4 space-x-4',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full border-4 border-primary border-t-transparent',
            {
              'h-8 w-8': size === 'default',
              'h-6 w-6': size === 'sm',
              'h-12 w-12': size === 'lg',
            }
          )}
        />
        {text && (
          <div className="text-sm font-medium text-muted-foreground">{text}</div>
        )}
      </Card>
    );
  }
);

Loader.displayName = 'Loader';

export { Loader };

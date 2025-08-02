'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface InsightLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'default' | 'sm' | 'lg';
}

const mockInsights = [
  "Cummins X15N (2024) heavy duty engine can be RNG powered & still meet stringent EPA and CARB regulations",
  "RNG production in the U.S. has increased 400% since 2018, with 44% more projects coming online in 2025 alone",
  "Landfills are the third-largest source of U.S. methane, accounting for 17% of total anthropogenic emissions",
  "Transit fleets make the switch to low-carbon RNG fuel inking deals with Clean Energy",
  "Voluntary carbon market size hit $4.0 B in 2024. North America led with ~80%.",
  "The RNG industry added $7.2 B in U.S. GDP in 2024.",
  "Off‑takers express interest in voluntary markets due to saturated LCFS demand.",
];

const InsightLoader = React.forwardRef<HTMLDivElement, InsightLoaderProps>(
  ({ className, size = 'default', text = mockInsights[Math.floor(Math.random() * mockInsights.length)], ...props }, ref) => {
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
        <div className="text-sm font-medium text-muted-foreground max-w-sm">{text}</div>
      </Card>
    );
  }
);

InsightLoader.displayName = 'InsightLoader';

export { InsightLoader };

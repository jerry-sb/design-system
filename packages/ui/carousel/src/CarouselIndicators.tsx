'use client';

import { cn } from '@jerryshim-ui/style-utils';
import * as React from 'react';

export type CarouselIndicatorsProps = React.HTMLAttributes<HTMLDivElement>;

export const CarouselIndicators = React.forwardRef<HTMLDivElement, CarouselIndicatorsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CarouselIndicators.displayName = 'CarouselIndicators';



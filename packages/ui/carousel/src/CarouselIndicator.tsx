'use client';

import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import * as React from 'react';

type AsChildProps = { asChild?: boolean };

export type CarouselIndicatorProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  AsChildProps & {
    to: number;
  };

export const CarouselIndicator = React.forwardRef<HTMLButtonElement, CarouselIndicatorProps>(
  ({ className, asChild, to, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type="button"
        data-carousel-slide-to={String(to)}
        className={cn('w-3 h-3 rounded-full', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
CarouselIndicator.displayName = 'CarouselIndicator';

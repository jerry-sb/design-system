'use client';

import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import * as React from 'react';

type AsChildProps = { asChild?: boolean };

export type CarouselNextProps = React.ButtonHTMLAttributes<HTMLButtonElement> & AsChildProps;

export const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type="button"
        data-carousel-next
        className={cn(
          'absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
CarouselNext.displayName = 'CarouselNext';

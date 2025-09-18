'use client';

import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import * as React from 'react';

type AsChildProps = { asChild?: boolean };

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement> &
  AsChildProps & {
    active?: boolean;
  };

export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, asChild, active, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        data-carousel-item={active ? 'active' : ''}
        className={cn('hidden duration-700 ease-in-out', className)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
CarouselItem.displayName = 'CarouselItem';



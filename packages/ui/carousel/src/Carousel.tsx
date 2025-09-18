'use client';

import '@jerryshim-ui/flow-dom/global';

import { initCarousels } from '@jerryshim-ui/flow-carousel';
import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import * as React from 'react';

type AsChildProps = { asChild?: boolean };

export type CarouselProps = React.HTMLAttributes<HTMLDivElement> &
  AsChildProps & {
    id?: string;
    auto?: boolean;
    interval?: number;
  };

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ id, className, asChild, auto, interval = 3000, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'div';
    const carouselId = React.useId();
    const finalId = id ?? carouselId;

    React.useEffect(() => {
      const disposer = initCarousels();
      return () => disposer();
    }, [finalId]);

    return (
      <Comp
        ref={ref}
        id={finalId}
        className={cn('relative w-full', className)}
        data-carousel={auto ? 'slide' : 'static'}
        data-carousel-interval={String(interval)}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Carousel.displayName = 'Carousel';

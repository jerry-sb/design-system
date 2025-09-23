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

export type CarouselPrevProps = React.ButtonHTMLAttributes<HTMLButtonElement> & AsChildProps;

export const CarouselPrev = React.forwardRef<HTMLButtonElement, CarouselPrevProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type="button"
        data-carousel-prev
        className={cn(
          'absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
CarouselPrev.displayName = 'CarouselPrev';

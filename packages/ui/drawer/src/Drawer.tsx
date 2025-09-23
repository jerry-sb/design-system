'use client';

import { cn } from '@jerryshim-ui/style-utils';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn('fixed inset-0 z-50 bg-blackA-9 fixed inset-0 z-30', className)}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  // ✅ 이미 base에 애니메이션 구동(enter/exit)이 들어가 있으니 유지
  'fixed z-50 gap-4 bg-theme-r-monoA-11 p-6 shadow-lg border-2 border-theme-slate-11 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
      },
      animate: {
        slide: '',
        none: '',
      },
      radius: {
        none: '',
        sm: 'rounded-xs',
        md: 'rounded-lg',
        lg: 'rounded-2xl',
      },
    },
    compoundVariants: [
      // --- slide + top ---
      {
        side: 'top',
        animate: 'slide',
        class:
          'data-[state=open]:slide-in-from-top-40 data-[state=closed]:slide-out-to-top-40 ease-in-out',
      },
      // --- slide + bottom ---
      {
        side: 'bottom',
        animate: 'slide',
        class:
          'data-[state=open]:slide-in-from-bottom-40 data-[state=closed]:slide-out-to-bottom-40 ease-in-out',
      },
      // --- slide + left ---
      {
        side: 'left',
        animate: 'slide',
        class:
          'data-[state=open]:slide-in-from-left-40 data-[state=closed]:slide-out-to-left-40 ease-in-out',
      },
      // --- slide + right ---
      {
        side: 'right',
        animate: 'slide',
        class:
          'data-[state=open]:slide-in-from-right-40 data-[state=closed]:slide-out-to-right-40 ease-in-out',
      },
    ],
    defaultVariants: {
      side: 'right',
      radius: 'lg',
      animate: 'slide',
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  close?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', animate, radius, className, children, close = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side, animate, radius }), className)}
      {...props}
    >
      <SheetTitle className="hidden" />
      {close && (
        <SheetPrimitive.Close
          className={cn(
            'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none',
            'focus:outline-none focus:ring-1 focus:ring-theme-blue-9 focus:ring-offset-1',
          )}
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}

      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};

'use client';

import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

type AsChildProps = { asChild?: boolean };

const gridVariants = cva(cn('grid'), {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    rows: {
      1: 'grid-rows-1',
      2: 'grid-rows-2',
      3: 'grid-rows-3',
      4: 'grid-rows-4',
      5: 'grid-rows-5',
      6: 'grid-rows-6',
    },
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-xs',
      md: 'rounded-lg',
      lg: 'rounded-2xl',
    },
  },
  defaultVariants: {
    columns: 2,
    rows: undefined,
    gap: 'md',
    radius: 'md',
  },
});

export type GridProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof gridVariants> &
  AsChildProps;

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, asChild, columns, rows, gap, radius, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        data-columns={columns}
        data-rows={rows}
        data-gap={gap}
        data-radius={radius}
        className={cn(gridVariants({ columns, rows, gap, radius }), className)}
        {...props}
      />
    );
  },
);
Grid.displayName = 'Grid';

// GridItem: allow spanning across columns/rows based on props
const gridItemVariants = cva('', {
  variants: {
    colSpan: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      12: 'col-span-12',
    },
    rowSpan: {
      1: 'row-span-1',
      2: 'row-span-2',
      3: 'row-span-3',
      4: 'row-span-4',
      5: 'row-span-5',
      6: 'row-span-6',
    },
    align: {
      start: 'self-start',
      center: 'self-center',
      end: 'self-end',
      stretch: 'self-stretch',
    },
    justify: {
      start: 'justify-self-start',
      center: 'justify-self-center',
      end: 'justify-self-end',
      stretch: 'justify-self-stretch',
    },
    radius: {
      none: 'rounded-none',
      sm: 'rounded-xs',
      md: 'rounded-lg',
      lg: 'rounded-2xl',
      inherit: 'rounded-[inherit]',
    },
  },
  defaultVariants: {
    colSpan: undefined,
    rowSpan: undefined,
    align: undefined,
    justify: undefined,
    radius: undefined,
  },
});

export type GridItemProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof gridItemVariants> &
  AsChildProps;

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, asChild, colSpan, rowSpan, align, justify, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        data-col-span={colSpan}
        data-row-span={rowSpan}
        className={cn(gridItemVariants({ colSpan, rowSpan, align, justify }), className)}
        {...props}
      />
    );
  },
);
GridItem.displayName = 'GridItem';

export const GridArea = GridItem;

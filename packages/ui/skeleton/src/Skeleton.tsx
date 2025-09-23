'use client';

import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const skeletonBase = cva(
  // 기본적인 reset + 배경 톤
  'relative isolate pointer-events-none select-none cursor-default text-transparent outline-none border-0 shadow-none box-decoration-clone',
  {
    variants: {
      tone: {
        gray: 'bg-theme-slate-5',
        mono: 'bg-theme-monoA-5',
      },
      radius: {
        none: 'rounded-none',
        xs: 'rounded-xs',
        sm: 'rounded-sm',
        md: 'rounded-lg',
        lg: 'rounded-2xl',
        full: 'rounded-full',
      },
      animated: {
        pulse: 'animate-pulse',
        none: '',
      },
    },
    defaultVariants: {
      tone: 'gray',
      radius: 'md',
      animated: 'pulse',
    },
  },
);
const blockSize = cva('', {
  variants: {
    size: {
      xs: 'h-2',
      sm: 'h-3',
      md: 'h-4',
      lg: 'h-6',
      xl: 'h-8',
    },
  },
  defaultVariants: { size: 'sm' },
});

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof skeletonBase>,
    VariantProps<typeof blockSize> {
  /** 로딩 여부. false일 때는 children을 그대로 반환합니다. */
  loading?: boolean;
  /** Slot으로 자식 엘리먼트를 감쌀지 여부. 기본은 자동 판단(자식이 엘리먼트면 Slot). */
  asChild?: boolean;
  /** 스켈레톤 내부에 실제 children을 렌더링(시각적으로는 숨김)할지 여부 */
  renderChildren?: boolean;
  /** 스켈레톤의 배경 강도(알파 스케일)를 높이고 싶을 때 4단계로 올립니다. */
  strong?: boolean;
  children?: React.ReactNode;
}

const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (
    {
      loading = true,
      asChild,
      renderChildren = true,
      className,
      tone,
      radius,
      animated,
      size,
      strong,
      children,
      ...rest
    },
    ref,
  ) => {
    if (!loading) return <>{children}</>;

    // Inline vs Block 자동 판별
    const isEmpty = React.Children.count(children) === 0;
    // children이 엘리먼트이거나 asChild를 강제한 경우 Slot 사용
    const useSlot = asChild || React.isValidElement(children);
    const Comp: any = useSlot ? Slot : 'span';

    return (
      <Comp
        ref={ref}
        aria-hidden
        tabIndex={-1}
        inert
        data-inline={isEmpty ? undefined : ''}
        className={cn(
          skeletonBase({ tone, radius, animated }),
          // Inline 스켈레톤: 폰트차이 보정을 위해 Arial 사용 + line-height 0
          !isEmpty && '[font-family:Arial,sans-serif] leading-[0] align-middle',
          // Block 스켈레톤: 자식이 없으면 높이/블록 기본값 제공
          isEmpty && cn('block w-full', blockSize({ size })),
          // 강도 상승: grayA-4 / monoA-4로 한 단계 올림
          strong && (tone === 'mono' ? 'bg-theme-monoA-7' : 'bg-theme-slate-7'),
          className,
        )}
        {...rest}
      >
        {renderChildren ? children : null}
      </Comp>
    );
  },
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type { VariantProps };

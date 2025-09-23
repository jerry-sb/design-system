'use client';

import { Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const spinnerBase = cva('relative inline-block text-current isolate', {
  variants: {
    size: {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
    dim: {
      none: '',
      soft: 'opacity-[var(--spinner-opacity,0.65)]',
      strong: 'opacity-90',
    },
  },
  defaultVariants: {
    size: 'md',
    dim: 'soft',
  },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof spinnerBase> {
  /** 로딩 여부. false면 children을 그대로 반환 */
  loading?: boolean;
  /** 리프 페이드 속도 */
  speed?: 'slow' | 'normal' | 'fast';
  /** 자식이 없을 때 컨테이너를 Slot으로 교체 */
  asChild?: boolean;
  /** 오버레이 등장 모션 (제공 유틸 사용) */
  motion?: 'none' | 'pop' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  /** 오버레이 등장 시간(ms) - @utility animate-in 의 duration 변수에 반영 */
  enterDuration?: number;
  children?: React.ReactNode;
  label?: string;
}

const LEAVES = 8 as const;
const SPEED_MS: Record<NonNullable<SpinnerProps['speed']>, number> = {
  slow: 1000,
  normal: 800,
  fast: 600,
};

function motionClasses(motion: NonNullable<SpinnerProps['motion']>) {
  switch (motion) {
    case 'pop':
      // zoom-in-95 + fade-in
      return 'animate-in fade-in-0 zoom-in-95';
    case 'slide-up':
      return 'animate-in fade-in-0 slide-in-from-bottom-3';
    case 'slide-down':
      return 'animate-in fade-in-0 slide-in-from-top-3';
    case 'slide-left':
      return 'animate-in fade-in-0 slide-in-from-right-3';
    case 'slide-right':
      return 'animate-in fade-in-0 slide-in-from-left-3';
    case 'none':
    default:
      return '';
  }
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      loading = true,
      speed = 'normal',
      size,
      dim,
      asChild,
      motion = 'pop',
      enterDuration = 200,
      label = 'loading',
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) => {
    if (!loading) return <>{children}</>;

    const duration = SPEED_MS[speed];
    const spinnerEl = (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy
        aria-label={label}
        className={cn(spinnerBase({ size, dim }), className)}
        style={{ ...style }}
        {...rest}
      >
        {Array.from({ length: LEAVES }).map((_, i) => {
          const deg = i * 45; // 0..315
          const delay = -((LEAVES - i) / LEAVES) * duration; // 음수 지연으로 순차 페이드
          return (
            <span
              key={`${delay}_${deg}`}
              className={cn(
                'absolute top-0 left-1/2 -translate-x-1/2 h-full w-[12.5%] [transform-origin:center] will-change-[opacity,transform]',
                '[animation-name:fade-out] [animation-timing-function:linear] [animation-iteration-count:infinite]',
              )}
              style={{
                transform: `translateX(-50%) rotate(${deg}deg)`,
                animationDuration: `${duration}ms`,
                // 음수 delay로 시작 프레임을 분산
                animationDelay: `${delay}ms`,
              }}
            >
              <span
                className="block h-[30%] w-full bg-current"
                style={{ borderRadius: 'var(--radius-1)' }}
              />
            </span>
          );
        })}
        <span className="sr-only">Loading…</span>
      </span>
    );

    // 자식이 없으면 단독 스피너 반환 (asChild 지원)
    if (children == null) {
      const Comp = asChild ? (Slot as any) : 'span';
      return (
        <Comp
          className={cn('inline-block align-middle', motionClasses(motion))}
          style={{ ['--animate-duration' as any]: `${enterDuration}ms` }}
        >
          {spinnerEl}
        </Comp>
      );
    }

    // 자식이 있으면 레이아웃 유지 + 중앙 오버레이 (등장 애니메이션 적용)
    return (
      <span className="relative inline-block align-middle" aria-busy>
        {/* 보이되 약화 + 포커스/클릭 차단 */}
        <span aria-hidden className="opacity-50 blur-[1px] select-none pointer-events-none">
          {children}
        </span>
        {/* 투명한 클릭 차단 레이어 + 스피너 */}
        <span className="absolute inset-0 grid place-items-center cursor-wait pointer-events-auto">
          <Spinner />
        </span>
      </span>
    );
  },
);

Spinner.displayName = 'Spinner';

export { Spinner };

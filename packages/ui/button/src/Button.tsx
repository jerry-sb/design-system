'use client';

import { composeEventHandlers, Slot } from '@jerryshim-ui/primitives';
import { cn } from '@jerryshim-ui/style-utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

// Radix Colors 유틸리티 기반 버튼 (유틸리티 적극 사용)
// - color: slate | blue | green | red | amber
// - variant: solid | soft | outline | ghost | link
// - size: sm | md | lg | icon
// - preset: 사전 조합(여러 컬러×유틸 조합을 미리 제공)

type Preset = 'primary' | 'neutral' | 'success' | 'danger' | 'warning';
type Color = 'slate' | 'blue' | 'green' | 'red' | 'amber' | 'mono';
type Variant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

const PRESETS: Record<Preset, { color: Color; variant: Variant }> = {
  primary: { color: 'blue', variant: 'solid' },
  neutral: { color: 'slate', variant: 'soft' },
  success: { color: 'green', variant: 'solid' },
  danger: { color: 'red', variant: 'solid' },
  warning: { color: 'amber', variant: 'solid' },
};
const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-theme-slate-7',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ),
  {
    variants: {
      variant: {
        solid: '',
        soft: '',
        outline: '',
        ghost: '',
        link: '',
      },
      color: {
        slate: '',
        blue: '',
        green: '',
        red: '',
        amber: '',
        mono: '',
      },
      radius: {
        sm: 'rounded-xs',
        md: 'rounded-lg',
        lg: 'rounded-2xl',
        full: 'rounded-full',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
        icon: 'h-9 w-9',
      },
      loading: {
        true: 'cursor-wait opacity-70',
        false: '',
      },
    },
    compoundVariants: [
      // ----- solid (bg-<color>-solid + text-white) -----
      {
        variant: 'solid',
        color: 'slate',
        class: 'bg-theme-slate-9 hover:bg-theme-slate-8 text-theme-r-monoA-12',
      },
      {
        variant: 'solid',
        color: 'blue',
        class: 'bg-theme-blue-9 hover:bg-theme-r-blueA-10 text-white',
      },
      {
        variant: 'solid',
        color: 'green',
        class: 'bg-theme-green-9 hover:bg-theme-r-greenA-11 text-white',
      },
      {
        variant: 'solid',
        color: 'red',
        class: 'bg-theme-red-9 hover:bg-theme-r-redA-9 text-white',
      },
      {
        variant: 'solid',
        color: 'amber',
        class: 'bg-theme-amber-9 hover:bg-theme-r-amberA-10 text-white',
      },
      {
        variant: 'solid',
        color: 'mono',
        class: 'bg-theme-monoA-12 hover:bg-theme-monoA-10 text-theme-r-monoA-12',
      },

      // ----- soft (bg-<color>-action + text-<color>-normal) -----
      {
        variant: 'soft',
        color: 'slate',
        class: 'bg-theme-slate-6 hover:bg-theme-slate-5 text-theme-monoA-12',
      },
      {
        variant: 'soft',
        color: 'blue',
        class: 'bg-theme-blue-5 hover:bg-theme-r-blueA-6 text-theme-monoA-12',
      },
      {
        variant: 'soft',
        color: 'green',
        class: 'bg-theme-green-5 hover:bg-theme-green-7 text-theme-monoA-12',
      },
      {
        variant: 'soft',
        color: 'red',
        class: 'bg-theme-red-5 hover:bg-theme-red-7 text-theme-monoA-12',
      },
      {
        variant: 'soft',
        color: 'amber',
        class: 'bg-theme-amber-5 hover:bg-theme-amber-7 text-theme-monoA-12',
      },
      {
        variant: 'soft',
        color: 'mono',
        class: 'bg-theme-monoA-9 hover:bg-theme-monoA-7 text-theme-r-monoA-12',
      },
      // ----- outline (border + border-<color>-normal + text-<color>-normal) -----
      {
        variant: 'outline',
        color: 'slate',
        class: 'border border-theme-slate-8 hover:bg-theme-slate-5 text-theme-slate-12',
      },
      {
        variant: 'outline',
        color: 'blue',
        class: 'border border-theme-blue-6 hover:bg-theme-blue-5 text-theme-blue-11',
      },
      {
        variant: 'outline',
        color: 'green',
        class: 'border border-theme-green-6 hover:bg-theme-green-5 text-theme-green-11',
      },
      {
        variant: 'outline',
        color: 'red',
        class: 'border border-theme-red-6 hover:bg-theme-red-5 text-theme-red-11',
      },
      {
        variant: 'outline',
        color: 'amber',
        class: 'border border-theme-amber-6 hover:bg-theme-amber-5 text-theme-amber-11',
      },
      {
        variant: 'outline',
        color: 'mono',
        class: 'border border-theme-monoA-12 hover:bg-theme-monoA-3 text-theme-monoA-11',
      },

      // ----- ghost (bg-<color>-ghost + text-<color>-normal) -----
      { variant: 'ghost', color: 'slate', class: 'hover:bg-theme-slate-5 text-theme-slate-12' },
      { variant: 'ghost', color: 'blue', class: 'hover:bg-theme-blue-5 text-theme-blue-11' },
      { variant: 'ghost', color: 'green', class: 'hover:bg-theme-green-5 text-theme-green-11' },
      { variant: 'ghost', color: 'red', class: 'hover:bg-theme-red-5 text-theme-red-11' },
      { variant: 'ghost', color: 'amber', class: 'hover:bg-theme-amber-5 text-theme-amber-11' },
      { variant: 'ghost', color: 'mono', class: 'hover:bg-theme-monoA-3 text-theme-monoA-11' },
      // ----- link (text-<color>-normal + underline) -----
      {
        variant: 'link',
        color: 'slate',
        class: 'bg-transparent text-theme-slate-11 underline-offset-4 hover:underline',
      },
      {
        variant: 'link',
        color: 'blue',
        class: 'bg-transparent text-theme-blue-11 underline-offset-4 hover:underline',
      },
      {
        variant: 'link',
        color: 'green',
        class: 'bg-transparent text-theme-green-11 underline-offset-4 hover:underline',
      },
      {
        variant: 'link',
        color: 'red',
        class: 'bg-transparent text-theme-red-11 underline-offset-4 hover:underline',
      },
      {
        variant: 'link',
        color: 'amber',
        class: 'bg-transparent text-theme-amber-11 underline-offset-4 hover:underline',
      },
      {
        variant: 'link',
        color: 'mono',
        class: 'bg-transparent text-theme-monoA-11 underline-offset-4 hover:underline',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'blue',
      size: 'md',
      loading: false,
      radius: 'md',
    },
  },
);

type AsChildProps = { asChild?: boolean };
export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
  VariantProps<typeof buttonVariants> &
  AsChildProps & {
    /** 미리 조합된 컬러×유틸 프리셋. variant/color 미지정 시 자동 적용 */
    preset?: Preset;
    disabled?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      preset,
      variant,
      color,
      size,
      loading,
      radius,
      asChild,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const Comp: any = asChild ? Slot : 'button';
    // preset이 있으면 비어있는 값만 보충(명시된 prop 우선)
    const pv = preset ? PRESETS[preset] : undefined;
    const finalVariant = variant ?? pv?.variant ?? 'solid';
    const finalColor = color ?? pv?.color ?? 'blue';
    // asChild일 때는 aria-disabled로 노출
    const ariaDisabled = disabled || loading ? true : undefined;
    const handleClick = composeEventHandlers<React.MouseEvent<any>>(onClick, (e) => {
      if (disabled || loading) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    return (
      <Comp
        ref={ref}
        {...(!asChild && { disabled: disabled || undefined })}
        aria-disabled={ariaDisabled}
        data-variant={finalVariant}
        data-size={size}
        data-color={finalColor}
        data-loading={loading ? '' : undefined}
        data-preset={preset}
        className={cn(
          buttonVariants({ variant: finalVariant, color: finalColor, size, loading, radius }),
          className,
        )}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

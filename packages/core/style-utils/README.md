# @jerryshim-ui/style-utils

Tiny, zero-runtime styling helpers used across Jerry UI. Provides a `cn` function that merges conditional classNames and resolves Tailwind CSS conflicts using `clsx` + `tailwind-merge`.

## Install

```bash
pnpm add @jerryshim-ui/style-utils
```

## Usage

```tsx
import { cn } from '@jerryshim-ui/style-utils';

export function Alert({
  intent = 'info',
  className,
  ...props
}: {
  intent?: 'info' | 'error';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-md p-3 text-sm',
        intent === 'info' && 'bg-blue-50 text-blue-900',
        intent === 'error' && 'bg-red-50 text-red-900',
        // Conflicting utilities get deduped by tailwind-merge
        'p-2', // will be merged out by the later p-3
        className,
      )}
      {...props}
    />
  );
}
```

## API

- `cn(...inputs: ClassValue[]): string`
  - Accepts strings, arrays, objects, and falsy values (same as `clsx`).
  - Returns a merged className string with Tailwind-aware conflict resolution.

## Notes

- No peer dependencies. Internally uses `clsx` and `tailwind-merge`.
- Works with Tailwind CSS v3 and v4 projects.

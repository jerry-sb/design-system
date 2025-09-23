# @jerryshim-ui/spinner

Accessible, composable loading spinner for React with overlay mode.

## Installation

```bash
pnpm add @jerryshim-ui/spinner
```

## Quick Start

```tsx
import { Spinner } from '@jerryshim-ui/spinner';

export default function Example() {
  return (
    <div className="h-16 grid place-items-center">
      <Spinner size="lg" speed="normal" />
    </div>
  );
}
```

### Overlay mode

Provide children to render a dimmed content with a centered spinner overlay.

```tsx
<Spinner loading size="md" motion="pop">
  <button className="btn" disabled>
    Submitting…
  </button>
</Spinner>
```

## Theme integration (brief)

This component uses design token utilities. Generate theme CSS via `@jerryshim/theme-builder` and import:

```css
@import '@jerryshim-ui/tailwind-util';
@import '@jerryshim-ui/spinner/preset.css';
```

## API

### `Spinner`

- Props:
  - `loading`: boolean (default: `true`) – when `false`, renders `children` as-is.
  - `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
  - `dim`: `'none' | 'soft' | 'strong'` (default: `'soft'`)
  - `speed`: `'slow' | 'normal' | 'fast'` (default: `'normal'`)
  - `motion`: `'none' | 'pop' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'` (default: `'pop'`)
  - `enterDuration`: `number` ms (default: `200`)
  - `asChild`: `boolean` – when no children, wrap container with `Slot` instead of `span`.
  - `label`: `string` (default: `'loading'`) – aria label for status.

### Accessibility

- When `loading` is `true`, spinner element includes `role="status"`, `aria-live="polite"`, `aria-busy`, and a visually hidden label.

## TypeScript

- `SpinnerProps` extends `HTMLAttributes<HTMLSpanElement>` and variant props.

## License

MIT

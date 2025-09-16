# @jerryshim-ui/primitives

Low-level React primitives for building headless UI components in Jerry UI. Includes `Slot` from Radix and an event utility.

## Install

```bash
pnpm add @jerryshim-ui/primitives
```

Peer deps: `react >= 19`, `react-dom >= 19`.

## Exports

- `Slot` — Re-export from `@radix-ui/react-slot`. Enables slot-based composition.
- `composeEventHandlers` — Safely compose two event handlers.

## Usage

### Slot

```tsx
import { Slot } from '@jerryshim-ui/primitives';

function Button({ asChild, ...props }: { asChild?: boolean } & React.ComponentProps<'button'>) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className="inline-flex items-center gap-2 px-3 py-2" {...props} />;
}

// Usage
<Button>Default Button</Button>
<Button asChild>
  <a href="/docs">Link Button</a>
</Button>
```

### composeEventHandlers

```tsx
import { composeEventHandlers } from '@jerryshim-ui/primitives';

type Props = React.ComponentProps<'button'> & {
  onPress?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function Pressable({ onClick, onPress, ...props }: Props) {
  return <button onClick={composeEventHandlers(onClick, onPress)} {...props} />;
}
```

- Signature:
  ```ts
  function composeEventHandlers<E extends React.SyntheticEvent>(
    theirs?: (e: E) => void,
    ours?: (e: E) => void,
    options?: { checkForDefaultPrevented?: boolean },
  ): (event: E) => void;
  ```
- Calls `theirs` first, then `ours` unless `event.preventDefault()` was called and `checkForDefaultPrevented !== false`.

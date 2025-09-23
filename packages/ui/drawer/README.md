# @jerryshim-ui/drawer

A headless, accessible Drawer (Sheet) components built on top of `@radix-ui/react-dialog`.

## Installation

```bash
pnpm add @jerryshim-ui/drawer @jerryshim-ui/tailwind-util
```

## Quick Start

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@jerryshim-ui/drawer';

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger className="btn">Open</SheetTrigger>
      <SheetContent side="right" animate="slide" radius="lg">
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetHeader>
        <div className="py-4">Body</div>
        <SheetFooter>
          <SheetClose className="btn">Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Theme integration (brief)

This component uses token utility classes (`bg-theme-…`, `text-theme-…`). In your app, generate and import theme CSS via `@jerryshim/theme-builder`.

1. Install the theme builder and add scripts

```bash
pnpm add -D @jerryshim/theme-builder
```

`package.json`

```jsonc
{
  "scripts": {
    "theme:dep": "jerry-theme-build dep-sync",
    "theme:sync": "jerry-theme-build sync",
  },
}
```

2. Add a minimal `jerry-theme.config.js` at project root

```js
// jerry-theme.config.js
export default {
  outputDir: 'src/styles/jerry-theme',
  palettes: [
    {
      colorName: 'blue',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, theme: true },
    },
    {
      colorName: 'slate',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, theme: true },
    },
    { colorName: 'mono', alpha: { option: 'all', p3: true, 'reverse-theme': true } },
  ],
};
```

3. Merge dependency theme configs (optional)

```bash
pnpm run theme:dep
```

4. Generate theme files and import in your app

```bash
pnpm run theme:sync
```

```ts
// e.g., in src/main.tsx or your global style entry
@import '@jerryshim-ui/tailwind-util';
@import '@jerryshim-ui/drawer/preset.css';
@import './styles/jerry-theme/all-colors-only.css';
```

- Docs: [@jerryshim/theme-builder](https://www.npmjs.com/package/@jerryshim/theme-builder)

---

## Build

Built with [@jerryshim/builder](https://www.npmjs.com/package/@jerryshim/builder). Ships dual ESM/CJS `exports` and TypeScript declarations.

---

## API

All components re-export and wrap `@radix-ui/react-dialog` primitives with styling and variants.

### `Sheet`

- Root component. Controls open/close state.

### `SheetTrigger`

- Button or element that opens the sheet.

### `SheetContent`

- Props:
  - `side`: `'top' | 'bottom' | 'left' | 'right'` (default: `'right'`)
  - `animate`: `'slide' | 'none'` (default: `'slide'`)
  - `radius`: `'none' | 'sm' | 'md' | 'lg'` (default: `'lg'`)
  - `close`: `boolean` (default: `true`) – whether to render the close button at top-right.

### `SheetHeader`

- Layout wrapper for title/description.

### `SheetFooter`

- Footer wrapper; reversed on mobile and horizontal on desktop.

### `SheetTitle`

- Title text.

### `SheetDescription`

- Description text.

### `SheetOverlay`

- Full-screen overlay.

### `SheetPortal`

- Portal wrapper used by content.

### `SheetClose`

- Closes the sheet when interacted with.

## Styling and classes

- Uses Tailwind-like utility classes. Ensure your design tokens/utilities are available.
- `SheetContent` sets placement, animation, and optional rounded corners.

## Accessibility

- Built upon Radix Dialog: focus trapping, aria attributes, and keyboard interactions are handled.

## TypeScript

- All components are typed; `SheetContent` exposes variant props.

## License

MIT

# @jerryshim-ui/skeleton

A versatile skeleton component for loading states in React applications.

## Installation

```bash
pnpm add @jerryshim-ui/skeleton
```

## Quick Start

```tsx
import { Skeleton } from '@jerryshim-ui/skeleton';

function App() {
  return <Skeleton loading={true} />;
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
import '@jerryshim-ui/skeleton/preset.css';
import './styles/jerry-theme/all-colors-only.css';
```

- Docs: [@jerryshim/theme-builder](https://www.npmjs.com/package/@jerryshim/theme-builder)

---

## Build

Built with [@jerryshim/builder](https://www.npmjs.com/package/@jerryshim/builder). Ships dual ESM/CJS `exports` and TypeScript declarations.

---

## API

### Skeleton

- **loading**: `boolean` - Whether the skeleton is in a loading state. Defaults to `true`.
- **asChild**: `boolean` - If `true`, renders children as a slot.
- **renderChildren**: `boolean` - If `true`, renders the actual children inside the skeleton.
- **strong**: `boolean` - If `true`, increases the background intensity.

## Usage

The `Skeleton` component is used to display a placeholder for content that is loading. It can be customized with different tones, radii, and animations.

## Styling/UX

The component uses CSS variables prefixed with `--jerry-` for theming and supports different tones and radii.

## Accessibility

The `Skeleton` component is `aria-hidden` by default and should not interfere with screen readers.

## License

MIT

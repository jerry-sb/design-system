### @jerryshim-ui/button

A small, consistent button component built on Tailwind token utilities and Radix Colors. It exposes common controls like `variant`, `color`, `size`, `radius`, `loading`, and `asChild`.

---

## Install

```bash
pnpm add @jerryshim-ui/button
# peer: react 19+
```

Quick start

```tsx
import { Button } from '@jerryshim-ui/button';

export default function Example() {
  return (
    <div className="flex gap-2">
      <Button>Primary</Button>
      <Button variant="outline" color="amber">
        Outline
      </Button>
      <Button loading>Saving…</Button>
    </div>
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
import '@jerryshim-ui/button/preset.css';
import './styles/jerry-theme/all-colors-only.css';
```

- Docs: [@jerryshim/theme-builder](https://www.npmjs.com/package/@jerryshim/theme-builder)

---

## Build

Built with [@jerryshim/builder](https://www.npmjs.com/package/@jerryshim/builder). Ships dual ESM/CJS `exports` and TypeScript declarations.

---

## Props (brief)

- variant: `solid | soft | outline | ghost | link` (default: `solid`)
- color: `slate | blue | green | red | amber | mono` (default: `blue`)
- size: `sm | md | lg | icon` (default: `md`)
- radius: `sm | md | lg | full` (default: `md`)
- loading: `boolean` (default: `false`)
- preset: `primary | neutral | success | danger | warning`
  - Fills in `variant`/`color` only when they are not provided.
- asChild: `boolean`
  - Renders with `Slot` to style a different element (e.g., anchor) as a button.
- disabled: `boolean`
  - With native button, `disabled` attribute is applied; with `asChild` or `loading`, `aria-disabled` is used.
- Others: All standard button attributes (`type`, `onClick`, `children`, …).

Note: Exposes `data-variant`, `data-color`, `data-size`, `data-loading`, and `data-preset` attributes for styling and testing.

---

## License

MIT

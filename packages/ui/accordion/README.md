# @jerryshim-ui/accordion

Accessible, composable Accordion components built on `@radix-ui/react-accordion`.

## Installation

```bash
pnpm add @jerryshim-ui/accordion
```

## Quick Start

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@jerryshim-ui/accordion';

export default function Example() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Theme integration (brief)

This component uses token utility classes (e.g., `bg-theme-…`). To generate theme CSS via `@jerryshim/theme-builder`:

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

`jerry-theme.config.js`

```js
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

Import in your app:

```css
@import '@jerryshim-ui/tailwind-util';
@import '@jerryshim-ui/accordion/preset.css';
@import './styles/jerry-theme/all-colors-only.css';
```

## API

All components are re-exported wrappers of Radix primitives with default styles.

### `Accordion`

- Root component. Accepts Radix props like `type`, `collapsible`, `value`, `defaultValue`, `onValueChange`.

### `AccordionItem`

- Single item container. Requires a unique `value`.

### `AccordionTrigger`

- Header button for toggling the item. Includes an arrow icon that rotates.

### `AccordionContent`

- Content region with open/close animations.

## Accessibility

- Built on Radix Accordion, ensuring ARIA roles, keyboard navigation, and focus management.

## TypeScript

- Component props are typed via Radix component prop types.

## License

MIT

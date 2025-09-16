# @jerryshim-ui/tailwind-util

Tailwind CSS v4 preset utilities and keyframes used across Jerry UI components. Ships as a CSS entry you can import to enable animation utilities and Radix-friendly transitions.

## Install

```bash
pnpm add @jerryshim-ui/tailwind-util
```

## Usage

Tailwind v4 (PostCSS preset import):

```css
/* e.g. in src/styles/tailwind.css */
@import '@jerryshim-ui/tailwind-util';
```

Or directly in your app entry:

```ts
import '@jerryshim-ui/tailwind-util';
```

Then you can use the utilities:

```html
<div class="animate-in fade-in-90 zoom-in-95" />
<div class="animate-out slide-out-to-top-2" />
<div class="animate-radix-accordion-down" />
```

## Provided utilities (selection)

- Keyframes: `fade-in`, `fade-out`, `enter`, `exit`, `expand-vertical`, `collapse-vertical`
- Generic:
  - `animate-in`, `animate-out`
  - `slide-in-from-{right|left|bottom|top}-*`
  - `slide-out-to-{right|left|bottom|top}-*`
  - `zoom-in-*`, `zoom-out-*`, `fade-in-*`, `fade-out-*` (percent values)
- Radix helpers:
  - `animate-radix-collapsible-{down|up}`
  - `animate-radix-accordion-{down|up}`

You can customize duration/easing via CSS variables:

```css
:root {
  --animate-duration: 200ms;
  --animate-ease: ease-out;
}
```

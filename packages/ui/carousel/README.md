## @jerryshim-ui/carousel

A headless, accessible React carousel UI built on top of `@jerryshim-ui/flow-carousel` behaviors and data attributes. Ships small, composes with Tailwind or your own CSS.

### Installation

```bash
pnpm add @jerryshim-ui/carousel
# or
npm i @jerryshim-ui/carousel
# or
yarn add @jerryshim-ui/carousel
```

### Quick Start

```css
/* global.css */
@import 'tailwindcss';
/* NOTE: The following preset already includes 
   @import '@jerryshim-ui/flow-carousel/preset.css';
   so you don’t need to import it separately. */
@import '@jerryshim-ui/carousel/preset.css';
```

```tsx
import '@jerryshim-ui/flow-dom/global';
import {
  Carousel,
  CarouselItem,
  CarouselPrev,
  CarouselNext,
  CarouselIndicators,
  CarouselIndicator,
} from '@jerryshim-ui/carousel';

export default function Example() {
  return (
    <Carousel auto interval={3000} className="relative w-full">
      <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
        <CarouselItem active>
          <img className="block w-full h-full object-cover" src="/img1.jpg" alt="" />
        </CarouselItem>
        <CarouselItem>
          <img className="block w-full h-full object-cover" src="/img2.jpg" alt="" />
        </CarouselItem>
        <CarouselItem>
          <img className="block w-full h-full object-cover" src="/img3.jpg" alt="" />
        </CarouselItem>
      </div>

      <CarouselPrev aria-label="Previous" />
      <CarouselNext aria-label="Next" />

      <CarouselIndicators>
        <CarouselIndicator to={0} aria-label="Slide 1" />
        <CarouselIndicator to={1} aria-label="Slide 2" />
        <CarouselIndicator to={2} aria-label="Slide 3" />
      </CarouselIndicators>
    </Carousel>
  );
}
```

### API

All components are client-side React components.

```ts
export type CarouselProps = React.HTMLAttributes<HTMLDivElement> & {
  id?: string;
  auto?: boolean; // enable auto slide when true
  interval?: number; // ms, default 3000
};
export const Carousel: React.FC<CarouselProps>;

export type CarouselItemProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean; // mark initial active slide
};
export const CarouselItem: React.FC<CarouselItemProps>;

export type CarouselPrevProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const CarouselPrev: React.FC<CarouselPrevProps>;

export type CarouselNextProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export const CarouselNext: React.FC<CarouselNextProps>;

export type CarouselIndicatorProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  to: number; // zero-based slide index
};
export const CarouselIndicator: React.FC<CarouselIndicatorProps>;

export type CarouselIndicatorsProps = React.HTMLAttributes<HTMLDivElement>;
export const CarouselIndicators: React.FC<CarouselIndicatorsProps>;
```

Most components support an `asChild` prop (via `@jerryshim-ui/primitives/Slot`) to render as a custom element while preserving behavior and props: `Carousel`, `CarouselItem`, `CarouselPrev`, `CarouselNext`, `CarouselIndicator`. `CarouselIndicators` does not support `asChild`.

### Options and Data Attributes

- **`auto`**: When `true`, `Carousel` sets `data-carousel="slide"`; otherwise `"static"`.
- **`interval`**: Milliseconds between auto slides; emitted as `data-carousel-interval="<ms>"`.
- **`CarouselItem`**: Adds `data-carousel-item="active"` when `active` is true; empty string otherwise.
- **`CarouselPrev`**: Adds `data-carousel-prev`.
- **`CarouselNext`**: Adds `data-carousel-next`.
- **`CarouselIndicator`**: Adds `data-carousel-slide-to="<index>"` where `<index>` is zero-based.

These attributes are consumed by `@jerryshim-ui/flow-carousel` under the hood.

### Usage Patterns

- **Custom render element** with `asChild`:

```tsx
<Carousel asChild>
  <section />
</Carousel>
```

- **Controlled initial slide** via `active` on a single `CarouselItem`:

```tsx
<Carousel>
  <CarouselItem active>First</CarouselItem>
  <CarouselItem>Second</CarouselItem>
  <CarouselItem>Third</CarouselItem>
  <CarouselPrev />
  <CarouselNext />
  <CarouselIndicators>
    <CarouselIndicator to={0} />
    <CarouselIndicator to={1} />
    <CarouselIndicator to={2} />
  </CarouselIndicators>
</Carousel>
```

### Accessibility

- Provide `aria-label` on navigation buttons and indicators.
- Images should include `alt` text.
- Focus styles are not overridden; customize via className.

### Styling

Components ship minimal utility classes for layout/positioning. Bring your own styles (e.g., Tailwind) via `className`.

- Container: defaults to `relative w-full`.
- Items: default `hidden duration-700 ease-in-out`.
- Controls: positioned at sides with full-height clickable area.
- Indicators wrapper: bottom-centered row.

### Integration & Lifecycle

- `Carousel` imports `@jerryshim-ui/flow-dom/global` once and calls `initCarousels()` from `@jerryshim-ui/flow-carousel` on mount; it returns a disposer that runs on unmount and re-runs when the `id` changes.
- This package is browser-only. On SSR, render markup; interactivity attaches on the client.

### TypeScript

Full TypeScript typings are bundled via `types` export. All components forward refs to their underlying elements.

### Versioning & Breaking Changes

See `CHANGELOG.md` in the repository root or package subfolder when available.

### License

MIT

### Build Format Change

As of version 0.3.0, the build output now includes `"use client"` at the top of client components by default.
This ensures proper client-side rendering without requiring manual insertion.

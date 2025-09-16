# @jerryshim-ui/flow-carousel

Accessible, DOM-first carousel core for the Jerry design system.

## Installation

```bash
pnpm add @jerryshim-ui/flow-carousel
```

## Quick Start

```html
<div id="myCarousel" data-carousel="slide" data-carousel-interval="3000">
  <div data-carousel-item="active">Slide 1</div>
  <div data-carousel-item>Slide 2</div>
  <div data-carousel-item>Slide 3</div>

  <button data-carousel-prev>Prev</button>
  <button data-carousel-next>Next</button>

  <button data-carousel-slide-to="0" aria-label="Slide 1"></button>
  <button data-carousel-slide-to="1" aria-label="Slide 2"></button>
  <button data-carousel-slide-to="2" aria-label="Slide 3"></button>
</div>

<script type="module">
  import { initCarousels } from '@jerryshim-ui/flow-carousel';
  // Or auto-init from DOM:
  initCarousels(); // respects data attributes and attaches controls
</script>
```

## API

- default export `Carousel`
  - constructor `(carouselEl, items, options?, instanceOptions?)`
  - `init()`, `slideTo(position)`, `next()`, `prev()`
  - `cycle()`, `pause()`
  - `getItem(position)`, `getActiveItem()`
  - `updateOnNext(cb)`, `updateOnPrev(cb)`, `updateOnChange(cb)`
  - `destroy()`, `removeInstance()`, `destroyAndRemoveInstance()`
- named export `initCarousels()`: scans `[data-carousel]`, builds a carousel, wires indicators/controls, starts cycling when `data-carousel="slide"`.

## Data Attributes

- `data-carousel="slide"`: start cycling automatically.
- `data-carousel-interval="ms"`: interval in ms.
- `data-carousel-item[="active"]`: slides.
- `data-carousel-slide-to="n"`: indicator buttons.
- `data-carousel-prev` / `data-carousel-next`: control buttons.

## Styling

Rotation uses utility classes:

- left: `-translate-x-full z-10`
- middle: `translate-x-0 z-30`
- right: `translate-x-full z-20`
- hidden slides are given `hidden`

Indicators use `options.indicators.activeClasses` and `inactiveClasses`.

## Instances

Integrates with `@jerryshim-ui/flow-dom` instances under component key `"Carousel"`. You can set `instanceOptions.override` (default: `true`) and optional `id` (defaults to `carouselEl.id`).

### License

MIT

# Third-Party Notices

This product includes portions adapted from Flowbite.

## Flowbite

- License: MIT
- Copyright: Flowbite contributors
- Source: https://github.com/themesberg/flowbite

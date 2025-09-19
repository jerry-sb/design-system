## @jerryshim-ui/flow-carousel

An accessible, DOM-first carousel **core** for the Jerry design system.

## Installation

```bash
pnpm add @jerryshim-ui/flow-carousel
```

## Quick Start

```css
/* global.css */
@import 'tailwindcss';
@import '@jerryshim-ui/flow-carousel/preset.css';
```

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
  // DOM-based auto initialization
  const dispose = initCarousels();

  // Later, if you need to clean up:
  // dispose();
</script>
```

## API

Exports:

- Named export `Carousel` (class)
  - constructor `(carouselEl, items, options?)`
  - `init()`, `slideTo(position)`, `next()`, `prev()`
  - `cycle()`, `pause()`
  - `getItem(position)`, `getActiveItem()`
  - `destroy()`, `removeInstance()`, `destroyAndRemoveInstance()`

- Named export `initCarousels(root?)`
  - Scans `[data-carousel]` under `root` (defaults to `document`)
  - Builds items/indicators, wires controls, and starts autoplay if requested
  - Returns a **dispose** function for teardown

## Data Attributes

- `data-carousel="slide"`: start autoplay
- `data-carousel-interval="ms"`: interval in milliseconds
- `data-carousel-item[="active"]`: slide elements
- `data-carousel-slide-to="n"`: indicator buttons
- `data-carousel-prev` / `data-carousel-next`: control buttons

## Styling

Classes applied during rotation:

- left: `-translate-x-full z-10`
- middle: `translate-x-0 z-30`
- right: `translate-x-full z-20`
- hidden: `hidden`

Indicators use `options.indicators.activeClasses` / `inactiveClasses`.

## Instance Integration

Managed in the `@jerryshim-ui/flow-dom` registry under the component key `"Carousel"`.
Each instance is registered by the element’s `id` (auto-generated with `crypto.randomUUID()` if missing). If an id already exists, the new instance is added with `override=true`.

For strong typing in TypeScript, this package provides augmentation in `src/augment-flow-dom.ts` so you can safely access:

```ts
import { getInstances } from '@jerryshim-ui/flow-dom';

const api = getInstances().getInstance('Carousel', 'myCarouselId');
api?.next();
```

## Method Guide

The following methods are available on instances created via `new Carousel(el, items, options)` or `initCarousels()`:

- `init()`
  Performs initial render and event binding. Called automatically by the constructor.
- `slideTo(position: number)`
  Moves to the given slide index, arranges left/middle/right classes, and updates indicators.
  If autoplay is running, the interval is restarted.
- `next()` / `prev()`
  Moves to next/previous slide. Wraps around.
- `cycle()`
  Starts calling `next()` at the configured `interval` (browser only).
- `pause()`
  Stops autoplay.
- `getItem(position: number)`
  Returns the slide item. Throws if the index is invalid.
- `getActiveItem()`
  Returns the current active item. Throws if not initialized.
- `destroy()`
  Removes event listeners and clears internal timers. (Does not restore DOM classes.)
- `removeInstance()`
  Removes this instance from the instance registry.
- `destroyAndRemoveInstance()`
  Calls `destroy()` and then removes the instance from the registry.

### Manual Setup Example (instantiate from DOM)

```html
<div id="myCarousel">
  <div data-carousel-item="active">1</div>
  <div data-carousel-item>2</div>
  <div data-carousel-item>3</div>

  <button id="prev">Prev</button>
  <button id="next">Next</button>

  <button data-carousel-slide-to="0" aria-label="1"></button>
  <button data-carousel-slide-to="1" aria-label="2"></button>
  <button data-carousel-slide-to="2" aria-label="3"></button>
</div>

<script type="module">
  import { Carousel } from '@jerryshim-ui/flow-carousel';

  const root = document.getElementById('myCarousel');
  const items = Array.from(root.querySelectorAll('[data-carousel-item]')).map((el, i) => ({
    position: i,
    el,
  }));
  const indicators = Array.from(root.querySelectorAll('[data-carousel-slide-to]')).map((el) => ({
    position: parseInt(el.getAttribute('data-carousel-slide-to') || '0', 10),
    el,
  }));

  const carousel = new Carousel(root, items, {
    defaultPosition: 0,
    interval: 3000,
    indicators: { items: indicators },
    onChange: (api) => {
      // handle change if needed
    },
  });

  document.getElementById('prev')?.addEventListener('click', () => carousel.prev());
  document.getElementById('next')?.addEventListener('click', () => carousel.next());
</script>
```

### Auto Initialization Example (`initCarousels`)

```html
<div id="autoCarousel" data-carousel="slide" data-carousel-interval="5000">
  <div data-carousel-item="active">A</div>
  <div data-carousel-item>B</div>
  <div data-carousel-item>C</div>

  <button data-carousel-prev>Prev</button>
  <button data-carousel-next>Next</button>

  <button data-carousel-slide-to="0" aria-label="A"></button>
  <button data-carousel-slide-to="1" aria-label="B"></button>
  <button data-carousel-slide-to="2" aria-label="C"></button>
</div>

<script type="module">
  import { initCarousels } from '@jerryshim-ui/flow-carousel';

  // Change the root scope by passing an element (defaults to document)
  const dispose = initCarousels();

  // When needed, clean up (listeners/instances)
  // dispose();
</script>
```

## Options

`Carousel` options (defaults in parentheses):

- `defaultPosition: number` (0)
- `interval: number` (3000)
- `onNext?: (api: Carousel) => void`
- `onPrev?: (api: Carousel) => void`
- `onChange?: (api: Carousel) => void`
- `indicators?: {`
  - `items?: Array<{ position: number; el: HTMLElement }>` (`[]`)
  - `activeClasses?: string` (`'bg-white dark:bg-gray-800'`)
  - `inactiveClasses?: string` (`'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'`)
    `}`

When using data attributes:

- `data-carousel="slide"` triggers `cycle()` automatically.
- `data-carousel-interval` is used if present; otherwise options/default (3000 ms) apply.
- Controls and indicators are wired automatically by `initCarousels()`.

## Styling Behavior

- On init, each slide receives `absolute`, `inset-0`, `transition-transform`, `transform`.
- Rotation utility classes:
  - left: `-translate-x-full z-10`
  - middle: `translate-x-0 z-30`
  - right: `translate-x-full z-20`
  - hidden: `hidden`

- If there is only one slide, the middle item stays visible with `translate-x-0 z-20`.

## Instance Registry Usage

`initCarousels()` generates an `id` with `crypto.randomUUID()` if the carousel element has none, and registers the instance.

```ts
import { getInstances } from '@jerryshim-ui/flow-dom';

const id = 'autoCarousel';
const api = getInstances().getInstance('Carousel', id);
api?.next();
```

In TypeScript projects, with the augmentation from `src/augment-flow-dom.ts`, you get fully typed access:

```ts
import { getInstances } from '@jerryshim-ui/flow-dom';

const api = getInstances().getInstance('Carousel', 'autoCarousel');
api?.pause();
```

## Teardown (Dispose)

`initCarousels()` returns a dispose function for the scope it initialized. Calling it will:

- Unbind click listeners from `[data-carousel-prev]` / `[data-carousel-next]`
- Call `destroyAndRemoveInstance()` on created `Carousel` instances

If you need to initialize/cleanup multiple times (e.g., HMR, SPA route changes), keep the returned dispose function and call it at the appropriate time.

### License

MIT

# Third-Party Notices

This product includes portions adapted from Flowbite.

## Flowbite

- License: MIT
- Copyright: Flowbite contributors
- Source: https://github.com/themesberg/flowbite

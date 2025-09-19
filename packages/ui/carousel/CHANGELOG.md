# @jerryshim-ui/carousel

## 0.2.0

### Minor Changes

- ec29857: ### Added
  - Expose **Tailwind v4 preset** via `./preset.css` export for both packages.
  - Consumers can now do a single import to scan sources (including transitive deps) without manually adding multiple `@source` lines.

  ### Usage

  ```css
  @import 'tailwindcss';
  @import '@jerryshim-ui/carousel/preset.css';
  ```

### Patch Changes

- Updated dependencies [ec29857]
  - @jerryshim-ui/flow-carousel@0.3.0

## 0.1.0

### Minor Changes

- 5f1733c: - **Summary**: Initial public release of `@jerryshim-ui/carousel`. Adds a React 19-compatible UI Carousel component package.
  - **Changes**
    - New package: `@jerryshim-ui/carousel`
    - Components: `Carousel`, `CarouselItem`, `CarouselPrev`, `CarouselNext`, `CarouselIndicators`, `CarouselIndicator`
    - Internal deps: `@jerryshim-ui/flow-carousel`, `@jerryshim-ui/flow-dom`, `@jerryshim-ui/primitives`, `@jerryshim-ui/style-utils`
    - Includes build, types, ESLint setup, and README
  - **Migration**: None
  - **Refs**: N/A

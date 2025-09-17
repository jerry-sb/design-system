---
'@jerryshim-ui/flow-carousel': minor
---

- **Summary**: Introduce the core `Carousel` API and the `initCarousels` DOM auto-initializer, integrated with the instance registry and type augmentation.
- **Changes**
  - Expose `Carousel` class: supports `init`, `slideTo`, `next`, `prev`, `cycle`, `pause`, `getItem`, `getActiveItem`, `destroy`, `removeInstance`, `destroyAndRemoveInstance`.
  - Add `initCarousels(root?)`: scans/binds by `data-carousel`, wires controls/indicators automatically, returns a `dispose` function.
  - Integrate with `@jerryshim-ui/flow-dom` instance registry and provide type augmentation via `augment-flow-dom.ts`.
  - In browsers, expose globals `window.Carousel` and `window.initCarousels`.
  - Provide indicator styling options (`activeClasses`, `inactiveClasses`) with sensible defaults.
  - Update docs/tests.
- **Migration**: None.
- **Refs**: Requires `@jerryshim-ui/flow-dom` `>=0.1.1` as a peer dependency.

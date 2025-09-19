# @jerryshim-ui/flow-carousel

## 0.3.0

### Minor Changes

- ec29857: ### Added
  - Expose **Tailwind v4 preset** via `./preset.css` export for both packages.
  - Consumers can now do a single import to scan sources (including transitive deps) without manually adding multiple `@source` lines.

  ### Usage

  ```css
  @import 'tailwindcss';
  @import '@jerryshim-ui/carousel/preset.css';
  ```

## 0.2.0

### Minor Changes

- b9e1012: - **Summary**: Introduce the core `Carousel` API and the `initCarousels` DOM auto-initializer, integrated with the instance registry and type augmentation.
  - **Changes**
    - Expose `Carousel` class: supports `init`, `slideTo`, `next`, `prev`, `cycle`, `pause`, `getItem`, `getActiveItem`, `destroy`, `removeInstance`, `destroyAndRemoveInstance`.
    - Add `initCarousels(root?)`: scans/binds by `data-carousel`, wires controls/indicators automatically, returns a `dispose` function.
    - Integrate with `@jerryshim-ui/flow-dom` instance registry and provide type augmentation via `augment-flow-dom.ts`.
    - In browsers, expose globals `window.Carousel` and `window.initCarousels`.
    - Provide indicator styling options (`activeClasses`, `inactiveClasses`) with sensible defaults.
    - Update docs/tests.
  - **Migration**: None.
  - **Refs**: Requires `@jerryshim-ui/flow-dom` `>=0.1.1` as a peer dependency.

## 0.1.1

### Patch Changes

- Updated dependencies [f0a14c4]
  - @jerryshim-ui/flow-dom@0.2.0

## 0.1.0

### Minor Changes

- 1588be9: DOM 기반의 헤드리스 Carousel 도입:
  - 데이터 속성 기반 초기화:
    - `[data-carousel]`, `[data-carousel-item]`
    - 컨트롤: `[data-carousel-next]`, `[data-carousel-prev]`
    - 인디케이터: `[data-carousel-slide-to]`
  - 공개 API: `next()`, `prev()`, `slideTo(n)`, `cycle()`, `pause()`, `getActiveItem()`
  - 옵션: `defaultPosition`, `interval`, `indicators.activeClasses | inactiveClasses`,
    콜백 `onNext | onPrev | onChange`
  - `@jerryshim-ui/flow-dom` 인스턴스 레지스트리 연동(override 및 제거 지원)
  - SSR 안전: `window.Carousel`, `window.initCarousels` 바인딩 제공
  - TypeScript 타이핑 및 `@jerryshim-ui/flow-dom` 모듈 보강 포함

  참고: 이 구현은 **Flowbite**의 Carousel를 참고하여 우리 테마 토큰/유틸리티 체계에 맞게 재구성한 것입니다.

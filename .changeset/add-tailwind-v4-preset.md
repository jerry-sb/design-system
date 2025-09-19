---
'@jerryshim-ui/carousel': minor
'@jerryshim-ui/flow-carousel': minor
---

### Added

- Expose **Tailwind v4 preset** via `./preset.css` export for both packages.
- Consumers can now do a single import to scan sources (including transitive deps) without manually adding multiple `@source` lines.

### Usage

```css
@import 'tailwindcss';
@import '@jerryshim-ui/carousel/preset.css';
```

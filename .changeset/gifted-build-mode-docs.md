---
'@jerryshim/builder': minor
---

- **Summary**: Document build-mode detection (TS / JS-only / CSS-only) and add `--css-exports` option.
- **Changes**
  - `--css-exports`: When `preset.css` exists, build `dist/preset.css` and ensure `exports["./preset.css"]`. Runs for TS/JS builds as well.
  - Build-mode rules: TS present → TS build; JS without TS → JS-only (ESM-only enforced); No JS/TS but `preset.css` → CSS-only.
  - PostCSS auto enable conditions clarified: `--css postcss` or `tailwindcss` dependency with `--css auto`.
- **Migration**: None.
- **Refs**: Implementation in `src/utils/context.js`, `src/utils/css.js`.

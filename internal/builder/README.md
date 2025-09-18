# jerry-build

An opinionated, consistent, and repeatable build pipeline for monorepos and libraries. It automatically treats `exports` subpaths as build entries and builds TS/JS/CSS packages in a standardized way.

> Core philosophy: **Declare your source, build by convention**. No per-package `rollup.config.*`. Just run `jerry-build .` and get the same, reliable results across packages.

---

## TL;DR

```bash
pnpm add -D @jerryshim/builder

# Default (dual ESM + CJS)
jerry-build .

# ESM only
jerry-build . --format esm

# Watch mode
jerry-build . --watch

# Force PostCSS for CSS-only packages (watch)
jerry-build . --css postcss --watch
```

`package.json`

```jsonc
{
  "scripts": {
    "build": "jerry-build .",
    "dev": "jerry-build . --watch",
  },
}
```

---

## What’s different?

- **Multi-entry automation**: `package.json` `exports` subpaths ("./foo") map to `src/foo.*`. Root is `src/index.*`.
- **Dual output policy**: `--format all|esm|cjs`. ESM file extension is decided by package `type` (`.js` for `module`, `.mjs` otherwise). CJS is always `.cjs`.
- **TS → d.ts bundling**: Based on `tsconfig`/`types` hints, emits **per-entry** `.d.ts`.
- **JS-only (ESM) support**: Detects `require/module.exports` in JS sources and errors by policy. Bundles only relative paths (no resolve/commonjs plugins).
- **CSS-only (Theme) pipeline**: Watches/builds only `preset.css` (optional PostCSS). Copies a root `index.js` stub once to support side-effect CSS import at the package root.
- **Standardized external**: Node built-ins, `peerDependencies`, and `dependencies` are treated as externals; only relative imports are bundled.
- **Watch mode**: TS/JS/CSS supported. CSS watch is limited to **preset.css only** by design.

---

## Project structure conventions

```
<package>/
  src/
    index.ts|tsx|js|mjs|cjs
    <subpath>.ts|tsx|js|mjs|cjs   # corresponds to an exports subpath
  preset.css                      # (optional) CSS-only package
  package.json
  tsconfig.json                   # required for TS packages
```

### exports ↔ source mapping

- Root `"."` → `src/index.*`
- Subpath `"./react-package"` → `src/react-package.*`
- CSS/JSON/wildcard keys (`"./*.css"`, `"./*"`) are excluded from JS/TS entry discovery (CSS is handled by a separate pipeline).

**Example**

```jsonc
{
  "name": "@jerryshim/eslint-config",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./react-package": "./dist/react-package.js",
    "./vite": "./dist/vite.js",
  },
  "files": ["dist"],
}
```

→ Required sources: `src/index.ts`, `src/react-package.ts`, `src/vite.ts`

---

## CLI options

```bash
jerry-build [target]
```

- `--watch, -w`: watch mode
- `--format`: `all` (default) | `esm` | `cjs`
  → Controls the combination of outputs
- `--css`: `auto` (default) | `postcss` | `none`
  → Enables PostCSS pipeline for CSS-only packages
- `--css-exports`: `skip` (default) | `copy` | `auto`
  → When a package contains `preset.css`, generates `dist/preset.css` and ensures `package.json.exports["./preset.css"] = "./dist/preset.css"`. In TS/JS builds this runs before JS bundling. `auto` currently behaves the same as `copy`.

### Build mode detection (TS vs JS-only vs CSS-only)

The builder detects which pipeline to run based on your sources and `exports`:

- TS build: If any discovered entry ends with `.ts` or `.tsx` → TypeScript build with Rollup + `@rollup/plugin-typescript`. Requires a `tsconfig.json`.
- JS-only build: If there are JS entries (`.js`/`.mjs`/`.cjs`) and no TS entries → JS-only build. Enforces ESM-only policy (fails on `require/module.exports`).
- CSS-only build: If there are no JS/TS entries and a `preset.css` exists at the package root or under `src/` → CSS-only build.

Entry discovery is driven by `package.json.exports` keys:

- Root `"."` maps to `src/index.*`
- Each subpath `"./name"` maps to `src/name.*`
- Wildcards and non-code entries like `"./*.css"`/`"./*.json"` are ignored for JS/TS entry discovery.

CSS PostCSS pipeline is enabled when:

- `--css postcss` is passed, or
- `--css auto` (default) and the package declares a `tailwindcss` dependency/devDependency.

### format × type matrix (important)

`package.json.type` decides how `.js` is interpreted (ESM/CJS). The number of outputs is decided by `--format`.

| type               | format | ESM outputs       | CJS outputs       |
| ------------------ | ------ | ----------------- | ----------------- |
| `module`           | `esm`  | `dist/[name].js`  | –                 |
| `module`           | `all`  | `dist/[name].js`  | `dist/[name].cjs` |
| (unset/`commonjs`) | `esm`  | `dist/[name].mjs` | –                 |
| (unset/`commonjs`) | `all`  | `dist/[name].mjs` | `dist/[name].cjs` |

> Recommendation: For libraries, prefer `type: "module"` with `--format all` (dual) or use `--format esm` if you only publish ESM.

---

## Type declarations (.d.ts) emission

The builder emits **per-entry** `.d.ts` if any of the following is true:

1. `package.json` has `types`/`typings`/`publishConfig.types`/`exports['.'].import.types`/`exports['.'].require.types`
2. `tsc --showConfig` indicates `compilerOptions.declaration === true` or `composite === true`, or `declarationDir` is set

> JS-only packages do not emit `.d.ts` by default.

---

## Build recipes by package type

### 1) TypeScript (multi-entry)

```text
src/
  index.ts
  react-package.ts
  vite.ts
```

`package.json`

```jsonc
{
  "type": "module",
  "exports": {
    ".": { "import": "./dist/index.js", "require": "./dist/index.cjs" },
    "./react-package": {
      "import": "./dist/react-package.js",
      "require": "./dist/react-package.cjs",
    },
    "./vite": { "import": "./dist/vite.js", "require": "./dist/vite.cjs" },
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"],
}
```

### 2) JS-only (ESM-only policy)

- Source must use **ESM syntax only** (`import/export`)
- Detecting `require/module.exports` results in an **error**

`package.json`

```jsonc
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js",
  },
  "files": ["dist"],
}
```

### 3) CSS-only (Theme)

- Watches/builds only `preset.css`
- Optional root `index.js` for side-effect CSS import

`index.js`

```js
import './dist/preset.css';
```

`package.json`

```jsonc
{
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": "./dist/index.js",
    "./preset.css": "./dist/preset.css",
  },
  "files": ["dist"],
}
```

---

## What’s new

- `--css-exports` option: Automatically builds/updates `dist/preset.css` and adds `"./preset.css"` to `exports` when a `preset.css` exists. Runs for TS/JS packages too, not only CSS-only.
- Explicit build-mode detection: TS vs JS-only vs CSS-only logic clarified and enforced (JS-only requires ESM syntax).

---

## Internal rules (summary)

- **Entry discovery**: Only `"."` and `"./…"` keys from `exports` are considered. Wildcards (`./*`), `.css`, `.json` are excluded.
- **External**: Node built-ins (`node:*`), `peerDependencies`, and `dependencies` are externals. Only relative imports are bundled.
- **Output filenames**: `dist/[name].cjs`, `dist/[name].js|mjs` (based on `type`), sourcemaps on.
- **CSS watch**: Only `preset.css` is watched (with PostCSS, nested imports are tracked by the plugin).

---

## Troubleshooting

- **`require` error in an ESM scope**: When your package has `type: "module"`, `.js` is ESM. Convert builder/source to `import` syntax.
- **Export declared but source missing**: Add `src/<subpath>.*` or remove the subpath from `exports`.
- **Cannot find `preset.css`**: You need a `preset.css` at the package root or in `src/`.
- **CJS syntax detected (JS-only)**: ESM-only policy. Remove `require/module.exports` or consider TypeScript.

---

## Why use this over the Rollup CLI?

- **Monorepo standardization**: Enforces output naming/format/sourcemaps/external rules across all packages.
- **exports ↔ file integrity**: Automates entry discovery/build/validation based on declared `exports`.
- **DX**: As a package author, just run `jerry-build .`. Multi-entry/dual format/type bundles/CSS handled consistently.

> If you need special cases, just declare them via `exports` and source files. The builder follows your declarations.

---

## License

MIT

### @jerryshim/theme-builder

A tiny CLI and library that builds theme CSS files from a simple config. It aggregates color palettes (Radix Colors P3) and generates ready-to-import CSS files for your component packages and apps.

#### Features

- **CLI**: `jerry-theme-build` with commands: `init`, `sync`, `dep-sync`, `help`
- **Config-first**: `jerry-theme.config.{js,mjs,cjs}` at project root
- **Outputs**: per-color CSS files, `all.css`, `all-colors-only.css`
- **Workspace-aware**: aggregate dependent packages’ theme configs with `dep-sync`
- **Programmatic API**: `init`, `sync`, `depSync`, `themeBuild`, `printHelp`
- **Special palette**: `mono` (Radix `blackA` + `whiteA`) for guaranteed contrast utilities

---

### Installation

```bash
pnpm add -D @jerryshim/theme-builder
# or
yarn add -D @jerryshim/theme-builder
# or
npm i -D @jerryshim/theme-builder
```

Peer requirements

- **tailwindcss >= 4.0.0** (only if you plan to integrate generated utilities with Tailwind 4)

---

### CLI

```bash
jerry-theme-build <command>
```

Commands

- `help` – Show help
- `init [package]` – Install the component library and set up a `theme:sync` script in your `package.json`
- `sync` – Build palettes from `jerry-theme.config.*` and write CSS files
- `dep-sync` – Aggregate theme configs from dependencies and merge them into your main config

Options (for `dep-sync`)

- `--format=mjs|cjs|js` Output format for the merged config (default: `mjs`)
- `--include=@jerryshim-ui/*` Scope glob to scan in `node_modules` (default: `@jerryshim-ui/*`)
- `--write` Actually write the merged file (otherwise preview only)
- `--lock` Write `jerry-theme.deps.lock.json` with sources metadata
- `--dry` Preview only (no writes)

Examples

```bash
# Initialize: install component package and add a script
jerry-theme-build init @jerryshim-ui/theme-builder

# Build CSS from local theme config
jerry-theme-build sync

# Aggregate dependency configs into your root config (preview)
jerry-theme-build dep-sync --format mjs --include @jerryshim-ui/* --dry

# Aggregate and write files
jerry-theme-build dep-sync --format js --write --lock
```

You can also use the package.json script installed by `init`:

```bash
pnpm run theme:sync
```

---

### Configuration

The theme builder looks for one of these files in your project root:

- `jerry-theme.config.js`
- `jerry-theme.config.mjs`
- `jerry-theme.config.cjs`

Shape

```js
// jerry-theme.config.js
export default {
  palettes: [
    { colorName: 'blue',  colorsOnly: false, p3: true },
    { colorName: 'green', colorsOnly: true,  p3: true },
    // Special palette: blackA + whiteA utilities for guaranteed contrast
    { colorName: 'mono',  p3: true },
  ],
  // optional (default: 'src/styles/jerry-theme')
  outDir: 'src/styles/jerry-theme',
};
```

Notes

- Only **P3** palettes are currently supported; non-P3 palettes are skipped with an error log.
- `colorsOnly: true` generates only color variables (no utility layers) for that color.
- `mono` is a special palette built from Radix `blackA` and `whiteA` alpha scales. It ships high-contrast utilities (bg/border/divide/text) that automatically flip for dark mode.

Allowed `colorName` values (Radix)

```
gray, mauve, slate, sage, olive, sand,
tomato, red, crimson, pink, plum, purple, violet, indigo, blue, cyan, teal,
green, grass, brown, orange, sky, mint, lime, yellow, amber, gold, bronze,
iris, black, white, mono
```

Default output directory: `src/styles/jerry-theme`

---

### Generated Files

For each palette, the builder writes:

- `<outDir>/<color>-colors-only.css` — CSS custom properties for light/dark, solid/alpha scales
- `<outDir>/<color>.css` — Utilities that compose variables (skipped if `colorsOnly: true`)

(For `mono`, utilities are based on `blackA`/`whiteA` only.)

Aggregated entry files:

- `<outDir>/all-colors-only.css` — imports all `*-colors-only.css`
- `<outDir>/all.css` — imports all `<color>.css`

You can import these CSS files directly in your apps or libraries.

### Special: mono (blackA + whiteA)

- Generates:
  - `<outDir>/mono-colors-only.css` — exposes `blackA*` / `whiteA*` vars
  - `<outDir>/mono.css` — high-contrast utilities that flip in dark mode
- Included in:
  - `all-colors-only.css` and `all.css` automatically

---

### Using the mono utilities

`mono` picks `blackA` in light mode and `whiteA` in dark mode to keep contrast strong.

Background ladder

```
bg-mono-app
bg-mono-subtle
bg-mono-ui
bg-mono-ghost
bg-mono-action
bg-mono-solid
```

Borders & Dividers

```
border-mono-dim
border-mono-normal
border-mono-ui

divide-mono-dim
divide-mono-normal
```

Text/Icons (contrast against background)

```
text-on-mono         /* default strong contrast */
text-on-mono-dim     /* slightly reduced contrast */
placeholder-on-mono  /* placeholder-level contrast */
text-on-mono-inverse /* inverted contrast when needed */
```

Component presets (examples)

```
mono-card     /* bg-mono-ui + text-on-mono + border-mono-dim */
mono-surface  /* bg-mono-app + text-on-mono */
mono-button   /* high-contrast button for both light/dark */
```

With Tailwind v4, just import the generated CSS in your project entry and use these utilities as classes.

---

### Programmatic API

```ts
import { init, sync, depSync, themeBuild, printHelp } from '@jerryshim/theme-builder';

// Build from the current working directory
await sync();

// Aggregate dependency configs and write a merged config
await depSync({
  format: 'mjs', // 'mjs' | 'cjs' | 'js'
  include: '@jerryshim-ui/*',
  write: true,
  lock: true,
  dry: false,
});

// Low-level: build CSS from an object in memory (mono + regular palette)
await themeBuild({
  outputDir: 'src/styles/jerry-theme',
  palettes: [
    { colorName: 'mono', p3: true },                 // special (blackA/whiteA)
    { colorName: 'blue', p3: true, colorsOnly: false }
  ],
});
```

---

### Troubleshooting

- "Unexpected export format in dist/index.js"
  - Rebuild the package (`pnpm -F @jerryshim/theme-builder build`). Ensure `dist/index.{js,cjs,d.ts}` exists.
- Invalid config errors
  - Make sure `palettes` is an array and each item has a valid `colorName` from the list above.
  - Note: `mono` uses alpha scales only (`blackA*`, `whiteA*`). There are no "solid" scales for black/white in Radix.
- No files generated
  - Confirm `jerry-theme.config.*` exists at the project root, or run `dep-sync` to generate one.

---

### Scripts (for this package)

```json
{
  "scripts": {
    "build": "jerry-build .",
    "dev": "jerry-build . --watch",
    "typecheck": "tsc -p tsconfig.json",
    "lint:fix": "eslint --fix ."
  }
}
```

---

### License

MIT

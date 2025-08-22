### @jerryshim/theme-builder

A tiny CLI and library that builds theme CSS files from a simple config. It aggregates color palettes (Radix Colors P3) and generates ready-to-import CSS files for your component packages and apps.

#### Features

- **CLI**: `jerry-theme-build` with commands: `init`, `sync`, `dep-sync`, `help`
- **Config-first**: `jerry-theme.config.{js,mjs,cjs}` at project root
- **Outputs**: per-color CSS files, `all.css`, `all-colors-only.css`
- **Workspace-aware**: aggregate dependent packages’ theme configs with `dep-sync`
- **Programmatic API**: `init`, `sync`, `depSync`, `themeBuild`, `printHelp`

---

### Installation

```bash
pnpm add -D @jerryshim/theme-builder
# or
yarn add -D @jerryshim/theme-builder
# or
npm i -D @jerryshim/theme-builder
```

Peer requirements:

- **tailwindcss >= 4.0.0** (only if you plan to integrate generated utilities with Tailwind 4)

---

### CLI

The package provides a CLI:

```bash
jerry-theme-build <command>
```

Commands:

- `help`: Show help
- `init [package]`: Install the component library and set up a `theme:sync` script in your `package.json`
- `sync`: Build palettes from `jerry-theme.config.*` and write CSS files
- `dep-sync`: Aggregate theme configs from dependencies and merge them into your main config

Options (for `dep-sync`):

- `--format=mjs|cjs|js` Output format for the merged config (default: `mjs`)
- `--include=@jerry-ui/*` Scope glob to scan in `node_modules` (default: `@jerry-ui/*`)
- `--write` Actually write the merged file (otherwise preview only)
- `--lock` Write `jerry-theme.deps.lock.json` with sources metadata
- `--dry` Preview only (no writes)

Examples:

```bash
# Initialize: install component package and add a script
jerry-theme-build init @jerry-ui/theme-builder

# Build CSS from local theme config
jerry-theme-build sync

# Aggregate dependency configs into your root config (preview)
jerry-theme-build dep-sync --format mjs --include @jerry-ui/* --dry

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

Shape:

```js
// jerry-theme.config.js
export default {
  palettes: [
    { colorName: 'blue', colorsOnly: false, p3: true },
    { colorName: 'green', colorsOnly: true, p3: true },
  ],
  // optional (default: 'src/styles/jerry-theme')
  outDir: 'src/styles/jerry-theme',
};
```

Notes:

- Only **P3** palettes are currently supported; non-P3 palettes are skipped with an error log.
- `colorsOnly: true` generates only color variables (no utility layers) for that color.

Allowed `colorName` values (Radix):

```
gray, mauve, slate, sage, olive, sand,
tomato, red, crimson, pink, plum, purple, violet, indigo, blue, cyan, teal,
green, grass, brown, orange, sky, mint, lime, yellow, amber, gold, bronze,
iris, black, white
```

Default output directory: `src/styles/jerry-theme`

---

### Generated Files

For each palette, the builder writes:

- `<outDir>/<color>-colors-only.css`: CSS custom properties for light/dark, solid/alpha scales
- `<outDir>/<color>.css`: Utilities that compose variables (skipped if `colorsOnly: true`)

Aggregated entry files:

- `<outDir>/all-colors-only.css`: imports all `*-colors-only.css`
- `<outDir>/all.css`: imports all `<color>.css`

You can import these CSS files directly in your apps or libraries.

---

### Programmatic API

```ts
import { init, sync, depSync, themeBuild, printHelp } from '@jerryshim/theme-builder';

// Build from the current working directory
await sync();

// Aggregate dependency configs and write a merged config
await depSync({
  format: 'mjs', // 'mjs' | 'cjs' | 'js'
  include: '@jerry-ui/*',
  write: true,
  lock: true,
  dry: false,
});

// Low-level: build CSS from an object in memory
await themeBuild({
  outputDir: 'src/styles/jerry-theme',
  palettes: [{ colorName: 'blue', p3: true, colorsOnly: false }],
});
```

---

### Troubleshooting

- "Unexpected export format in dist/index.js"
  - Rebuild the package (`pnpm -F @jerryshim/theme-builder build`). Ensure `dist/index.{js,cjs,d.ts}` exists.

- Invalid config errors
  - Make sure `palettes` is an array and each item has a valid `colorName` from the list above.

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

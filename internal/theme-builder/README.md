# @jerryshim/theme-builder

Tiny CLI and library that builds theme CSS files from a simple config. It aggregates Radix Colors (sRGB + P3) and generates ready-to-import CSS files for apps and libraries.

## Features

- **CLI**: `jerry-theme-build` with commands: `init`, `sync`, `dep-sync`, `help`
- **Config-first**: `jerry-theme.config.{js,mjs,cjs}` at project root
- **Outputs**: per-color CSS files, `all.css`, `all-colors-only.css`
- **Workspace-aware**: aggregate dependent packages’ theme configs with `dep-sync`
- **Programmatic API**: `init`, `sync`, `depSync`, `themeBuild`, `printHelp`
- **Special palette**: `mono` (Radix **blackA + whiteA**) for guaranteed contrast utilities

---

## Installation

```bash
pnpm add -D @jerryshim/theme-builder
# or
yarn add -D @jerryshim/theme-builder
# or
npm i -D @jerryshim/theme-builder
```

Peer requirements

- tailwindcss >= 4.0.0 (only if you plan to integrate generated utilities with Tailwind 4)

⸻

CLI

jerry-theme-build <command>

Commands

- help – Show help
- init [package] – Install the component library and set up a theme:sync script in your package.json
- sync – Build palettes from jerry-theme.config.\* and write CSS files
- dep-sync – Aggregate theme configs from dependencies and merge them into your main config

Options (for dep-sync)

- --format=mjs|cjs|js Output format for the merged config (default: mjs)
- --include=@jerryshim-ui/_ Scope glob to scan in node_modules (default: @jerryshim-ui/_)
- --write Actually write the merged file (otherwise preview only)
- --lock Write jerry-theme.deps.lock.json with sources metadata
- --dry Preview only (no writes)

Examples

```bash
# Initialize: install component package and add a script

jerry-theme-build init @jerryshim-ui/theme-builder


# Build CSS from local theme config

jerry-theme-build sync

# Aggregate dependency configs into your root config (preview)

jerry-theme-build dep-sync --format mjs --include @jerryshim-ui/\* --dry

# Aggregate and write files

jerry-theme-build dep-sync --format js --write --lock
```

You can also use the package.json script installed by init:

```bash
pnpm run theme:sync
```

⸻

Configuration

The theme builder looks for one of these files in your project root:

- jerry-theme.config.js
- jerry-theme.config.mjs
- jerry-theme.config.cjs

Shape

```javascript
// jerry-theme.config.js
export default {
  // Optional prefixes (defaults shown)
  var_prefix: 'theme-', // used in inline aliases: --color-theme-<...>
  theme_prefix: '--jerry-', // used for theme vars:    --jerry-<...>
  outputDir: 'src/styles/jerry-theme',

  palettes: [
    // Regular color
    {
      colorName: 'green',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, theme: true },
    },

    // Reverse-only base (no normal base vars), normal alpha
    {
      colorName: 'blue',
      base: { option: 'all', p3: true, 'reverse-theme': true },
      alpha: { option: 'all', p3: true, theme: true },
    },

    // Special palette: mono (alpha-only)
    {
      colorName: 'mono',
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
  ],
};
```

Notes

- `option: 'all' | 'light' | 'dark'` controls which theme scopes are mapped.
- `p3: true` emits P3 token values and P3 mappings within `@supports (color: color(display-p3 ...))`.
- `theme: true` emits normal theme variable mappings and inline aliases.
- `'reverse-theme': true` emits reversed mappings and inline aliases (prefix `r-`).
- For `mono`, base is ignored; only `alpha` is allowed.

Allowed colorName values (Radix)

```bash
gray, mauve, slate, sage, olive, sand,
tomato, red, crimson, pink, plum, purple, violet, indigo, blue, cyan, teal,
green, grass, brown, orange, sky, mint, lime, yellow, amber, gold, bronze,
iris, mono
```

Default output directory: src/styles/jerry-theme

⸻

Generated Files

For each palette, the builder writes:

- <outDir>/<color>-colors-only.css — token variables and theme mappings
  - One or two `@theme` token blocks: sRGB (always), P3 (if available)
  - Theme variable mappings for normal (`--jerry-...`) when `theme: true`
  - Theme variable mappings for reversed (`--jerry-r-...`) when `'reverse-theme': true`
  - Inline aliases inside `@theme inline`:
    - Normal: `--color-theme-...: var(--jerry-...)` when `theme: true`
    - Reversed: `--color-theme-r-...: var(--jerry-r-...)` when `'reverse-theme': true`

Aggregated entry files:

- <outDir>/all-colors-only.css — imports all \*-colors-only.css
- <outDir>/all.css — imports all <color>.css (if your setup also generates utilities)

⸻

Single example config (multiple options at once)

```javascript
export default {
  var_prefix: 'theme-',
  theme_prefix: '--jerry-',
  outputDir: 'src/styles/jerry-theme',
  palettes: [
    // 1) green: normal base + normal alpha
    {
      colorName: 'green',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, theme: true },
    },

    // 2) blue: reverse-only base + normal alpha
    {
      colorName: 'blue',
      base: { option: 'all', p3: true, 'reverse-theme': true },
      alpha: { option: 'all', p3: true, theme: true },
    },

    // 3) mono: reverse-only alpha
    { colorName: 'mono', alpha: { option: 'all', p3: true, 'reverse-theme': true } },
  ],
};
```

How to read outputs from this example

- green
  - Normal theme vars: `--jerry-green-N`, `--jerry-greenA-N` for light/dark and P3
  - Inline aliases: `--color-theme-green-N`, `--color-theme-greenA-N`
- blue
  - Reverse theme vars: `--jerry-r-blue-N` (base reversed), alpha normal: `--jerry-blueA-N`
  - Inline aliases: `--color-theme-r-blue-N`, `--color-theme-blueA-N`
- mono
  - Reverse alpha vars only: `--jerry-r-monoA-N`
  - Inline aliases: `--color-theme-r-monoA-N`

Output contents examples (truncated)

Example 1 (green, normal base + normal alpha):

```css
@theme {
  /* sRGB tokens */
  --color-green-1: ...;
  --color-green-2: ...;
  /* ... */
  --color-greenDark-1: ...;
  /* ... */
  --color-greenA-1: ...;
  /* ... */
  --color-greenDarkA-1: ...;
}

@theme {
  /* P3 tokens */
  --color-greenP3-1: ...;
  /* ... */
  --color-greenDarkP3-1: ...;
  /* ... */
  --color-greenP3A-1: ...;
  /* ... */
  --color-greenDarkP3A-1: ...;
}

:root {
  /* base mapping (normal) */
  --jerry-green-1: var(--color-green-1);
  /* ... up to -12 */
  /* alpha mapping (normal) */
  --jerry-greenA-1: var(--color-greenA-1);
  /* ... */
}
[data-theme='dark'] {
  --jerry-green-1: var(--color-greenDark-1);
  /* ... */
  --jerry-greenA-1: var(--color-greenDarkA-1);
  /* ... */
}

@supports (color: color(display-p3 1 1 1)) {
  :root {
    --jerry-green-1: var(--color-greenP3-1);
    /* ... */
    --jerry-greenA-1: var(--color-greenP3A-1);
    /* ... */
  }
  [data-theme='dark'] {
    --jerry-green-1: var(--color-greenDarkP3-1);
    /* ... */
    --jerry-greenA-1: var(--color-greenDarkP3A-1);
    /* ... */
  }
}

@theme inline {
  /* var_prefix: theme- */
  --color-theme-green-1: var(--jerry-green-1);
  /* ... */
  --color-theme-greenA-1: var(--jerry-greenA-1);
  /* ... */
}
```

⸻

Naming and prefix rules

Prefixes (configurable)

- theme_prefix: used for theme variables you consume in apps
  - Default: `--jerry-`
  - Pattern: `--jerry-<name>-<scale>` (1..12)
  - Reverse variant: `--jerry-r-<name>-<scale>`
- var_prefix: used for inline alias names under `@theme inline`
  - Default: `theme-`
  - Pattern: `--color-theme-<tokenName>-<scale>`
  - Reverse variant: `--color-theme-r-<tokenName>-<scale>`

Token keys (generated inside @theme blocks)

- sRGB: `--color-<base>-<scale>`, `--color-<base>Dark-<scale>`
- P3: `--color-<base>P3-<scale>`, `--color-<base>DarkP3-<scale>`
- Alpha: add `A` suffix, e.g., `--color-blueA-1`, `--color-blueDarkA-1`, and P3: `blueP3A`, `blueDarkP3A`
- mono: only alpha tokens are generated: `blackA`, `whiteA`, `blackP3A`, `whiteP3A`

Theme vs Reverse mapping

- theme: true → emits normal theme variables and inline aliases
  - `:root` (light): `--jerry-<base>-N → var(--color-<base>-N)`
  - `[data-theme='dark']`: `--jerry-<base>-N → var(--color-<base>Dark-N)`
  - P3 block mirrors the above with `...P3...` tokens
  - Inline aliases: `--color-theme-<base>-N: var(--jerry-<base>-N)`

- 'reverse-theme': true → emits reversed theme variables and inline aliases
  - `:root` (light): `--jerry-r-<base>-N → var(--color-<base>Dark-N)`
  - `[data-theme='dark']`: `--jerry-r-<base>-N → var(--color-<base>-N)`
  - P3 block mirrors with `...DarkP3...` and `...P3...` tokens
  - Inline aliases: `--color-theme-r-<base>-N: var(--jerry-r-<base>-N)`

Notes

- Base vs Alpha: use `<base>` or `<base>A` for naming (e.g., `--jerry-blue-1` vs `--jerry-blueA-1`). mono uses only `<base>A` style with `monoA` name.
- You can enable both `theme` and `'reverse-theme'` for the same variant to emit both sets.
- If only `'reverse-theme'` is enabled, normal mappings are omitted entirely.

Example 2 (blue, reverse-only base + normal alpha):

```css
@theme {
  /* sRGB tokens for blue, blueDark, blueA, blueDarkA */
}
@theme {
  /* P3 tokens for blueP3, blueDarkP3, blueP3A, blueDarkP3A */
}

:root {
  /* base mapping (reversed) */
  --jerry-r-blue-1: var(--color-blueDark-1);
  /* ... */
  /* alpha mapping (normal) */
  --jerry-blueA-1: var(--color-blueA-1);
  /* ... */
}
[data-theme='dark'] {
  --jerry-r-blue-1: var(--color-blue-1);
  /* ... */
  --jerry-blueA-1: var(--color-blueDarkA-1);
  /* ... */
}

@supports (color: color(display-p3 1 1 1)) {
  :root {
    --jerry-r-blue-1: var(--color-blueDarkP3-1);
    /* ... */
    --jerry-blueA-1: var(--color-blueP3A-1);
    /* ... */
  }
  [data-theme='dark'] {
    --jerry-r-blue-1: var(--color-blueP3-1);
    /* ... */
    --jerry-blueA-1: var(--color-blueDarkP3A-1);
    /* ... */
  }
}

@theme inline {
  --color-theme-r-blue-1: var(--jerry-r-blue-1);
  /* ... */
  --color-theme-blueA-1: var(--jerry-blueA-1);
  /* ... */
}
```

Example 3 (mono, reverse-only alpha):

```css
@theme {
  /* sRGB tokens */
  --color-blackA-1: ...;
  /* ... */
  --color-whiteA-1: ...;
  /* ... */
}
@theme {
  /* P3 tokens */
  --color-blackP3A-1: ...;
  /* ... */
  --color-whiteP3A-1: ...;
  /* ... */
}

:root {
  /* alpha mapping (reversed) */
  --jerry-r-monoA-1: var(--color-whiteA-1);
  /* ... */
}
[data-theme='dark'] {
  --jerry-r-monoA-1: var(--color-blackA-1);
  /* ... */
}

@supports (color: color(display-p3 1 1 1)) {
  :root {
    --jerry-r-monoA-1: var(--color-whiteP3A-1);
    /* ... */
  }
  [data-theme='dark'] {
    --jerry-r-monoA-1: var(--color-blackP3A-1);
    /* ... */
  }
}

@theme inline {
  --color-theme-r-monoA-1: var(--jerry-r-monoA-1);
  /* ... */
}
```

⸻

About mono

`mono` exposes only alpha scales using Radix blackA/whiteA. Theme mappings respect `theme` and `'reverse-theme'` just like other palettes.

⸻

Programmatic API

```javascript
import { init, sync, depSync, themeBuild, printHelp } from '@jerryshim/theme-builder';

// Build from the current working directory
await sync();

// Aggregate dependency configs and write a merged config
await depSync({
  format: 'mjs', // 'mjs' | 'cjs' | 'js'
  include: '@jerryshim-ui/\*',
  write: true,
  lock: true,
  dry: false,
});

// Low-level: build CSS from an object in memory (examples)
await themeBuild({
  outputDir: 'src/styles/jerry-theme',
  palettes: [
    // reverse-only base + normal alpha
    {
      colorName: 'green',
      base: { option: 'all', p3: true, 'reverse-theme': true },
      alpha: { option: 'all', p3: true, theme: true },
    },
    // mono reversed alpha-only
    {
      colorName: 'mono',
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
  ],
});
```

⸻

Troubleshooting

- “Unexpected export format in dist/index.js”
  Rebuild the package (pnpm -F @jerryshim/theme-builder build). Ensure dist/index.{js,cjs,d.ts} exists.
- Invalid config errors
  Make sure palettes is an array and each item has a valid colorName from the list above.
  Note: mono uses alpha scales only (blackA*, whiteA*). There are no “solid” scales for black/white in Radix.
- No files generated
  Confirm jerry-theme.config.\* exists at the project root, or run dep-sync to generate one.

⸻

Scripts (for this package)

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

⸻

License

MIT

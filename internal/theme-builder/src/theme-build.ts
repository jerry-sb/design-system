import fs from 'node:fs';
import path from 'node:path';

import radixColors from '@radix-ui/colors';

import type { ThemeConfig } from './types';
import { appendUniqueImport, buildColorName } from './utils/parser';

export default async function themeBuild(options: ThemeConfig = { palettes: [] }) {
  const outDir = options?.outputDir ?? 'dist';
  const palettes = (options?.palettes ?? []).map((p) => ({
    colorName: String(p.colorName).toLowerCase(),
    p3: !!p.p3,
    colorsOnly: !!p.colorsOnly,
  }));

  fs.mkdirSync(outDir, { recursive: true });

  const colors = radixColors as unknown as Record<string, Record<string, string>>;
  const allCssPath = path.join(outDir, 'all.css');
  const allColorsOnlyPath = path.join(outDir, 'all-colors-only.css');

  touchFile(allCssPath);
  touchFile(allColorsOnlyPath);

  for (const spec of palettes) {
    const base = spec.colorName;

    if (!spec.p3) {
      console.error(
        `[themeBuild] Error: palette "${base}" skipped — only P3 palettes are supported.`,
      );
      continue;
    }

    const lightSolidKey = buildColorName({ base, dark: false, p3: true, alpha: false });
    const darkSolidKey = buildColorName({ base, dark: true, p3: true, alpha: false });
    const lightAlphaKey = buildColorName({ base, dark: false, p3: true, alpha: true });
    const darkAlphaKey = buildColorName({ base, dark: true, p3: true, alpha: true });
    const lightSolid = colors?.[lightSolidKey];
    const darkSolid = colors?.[darkSolidKey];
    const lightAlpha = colors?.[lightAlphaKey];
    const darkAlpha = colors?.[darkAlphaKey];

    if (!lightSolid || !darkSolid || !lightAlpha || !darkAlpha) {
      console.error(
        `[themeBuild] Error: missing palette for "${base}" (required: P3 Solid & Alpha, light/dark)`,
      );
      continue;
    }

    const theme = [
      '@theme {',
      ...Object.entries(lightSolid).map(
        ([scale, value]) =>
          `  --color-${lightSolidKey.toLowerCase()}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
      ),
      ...Object.entries(darkSolid).map(
        ([scale, value]) =>
          `  --color-${darkSolidKey.toLowerCase()}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
      ),
      ...Object.entries(lightAlpha).map(
        ([scale, value]) =>
          `  --color-${lightAlphaKey.toLowerCase()}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
      ),
      ...Object.entries(darkAlpha).map(
        ([scale, value]) =>
          `  --color-${darkAlphaKey.toLowerCase()}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
      ),
      '}',
    ].join('\n');

    writeFile(path.join(outDir, `${base}-colors-only.css`), theme);
    appendUniqueImport(allColorsOnlyPath, `@import "./${base}-colors-only.css";`);

    if (spec.colorsOnly) continue;

    const layer = [
      `@utility bg-${base}-app {`,
      `  @apply bg-${lightSolidKey}-1 dark:bg-${darkSolidKey}-1;`,
      '}',
      `@utility bg-${base}-subtle {`,
      `  @apply bg-${lightSolidKey}-2 dark:bg-${darkSolidKey}-2;`,
      '}',
      `@utility bg-${base}-ui {`,
      `  @apply bg-${lightSolidKey}-3 dark:bg-${darkSolidKey}-3 hover:bg-${lightAlphaKey}-4 dark:hover:bg-${darkAlphaKey}-4 active:bg-${lightAlphaKey}-5 dark:active:bg-${darkAlphaKey}-5;`,
      '}',
      `@utility bg-${base}-ghost {`,
      `  @apply bg-transparent dark:bg-transparent hover:bg-${lightAlphaKey}-3 dark:hover:bg-${darkAlphaKey}-3 active:bg-${lightAlphaKey}-4 dark:active:bg-${darkAlphaKey}-4;`,
      '}',
      `@utility bg-${base}-action {`,
      `  @apply bg-${lightSolidKey}-4 dark:bg-${darkSolidKey}-4 hover:bg-${lightSolidKey}-5 dark:hover:bg-${darkSolidKey}-5 active:bg-${lightSolidKey}-6 dark:active:bg-${darkSolidKey}-6;`,
      '}',
      `@utility bg-${base}-solid {`,
      `  @apply bg-${lightSolidKey}-9 dark:bg-${darkSolidKey}-9 hover:bg-${lightSolidKey}-10 dark:hover:bg-${darkSolidKey}-10;`,
      '}',
      `@utility border-${base}-dim {`,
      `  @apply border-${lightSolidKey}-6 dark:border-${darkSolidKey}-6;`,
      '}',
      `@utility border-${base}-normal {`,
      `  @apply border-${lightSolidKey}-7 dark:border-${darkSolidKey}-7 hover:border-${lightSolidKey}-8 dark:hover:border-${darkSolidKey}-8;`,
      '}',
      `@utility divide-${base}-dim {`,
      `  @apply divide-${lightSolidKey}-6 dark:divide-${darkSolidKey}-6;`,
      '}',
      `@utility divide-${base}-normal {`,
      `  @apply divide-${lightSolidKey}-7 dark:divide-${darkSolidKey}-7 hover:divide-${lightSolidKey}-8 dark:hover:divide-${darkSolidKey}-8;`,
      '}',
      `@utility text-${base}-dim {`,
      `  @apply text-${lightSolidKey}-11 dark:text-${darkSolidKey}-11;`,
      '}',
      `@utility text-${base}-normal {`,
      `  @apply text-${lightSolidKey}-12 dark:text-${darkSolidKey}-12;`,
      '}',
    ].join('\n');

    writeFile(path.join(outDir, `${base}.css`), `@import "./${base}-colors-only.css";\n${layer}`);
    appendUniqueImport(allCssPath, `@import "./${base}.css";`);
  }
}

function touchFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', 'utf-8');
  }
}

function writeFile(filePath: string, data: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, data, 'utf8');
}

import fs from 'node:fs';
import path from 'node:path';

import radixColors from '@radix-ui/colors';

import type { RadixColor, ThemeConfig } from './types';
import { appendUniqueImport, buildColorName } from './utils/parser';
import { themeParser } from './utils/theme-parser';

export default async function themeBuild(options: ThemeConfig = { palettes: [] }) {
  const outDir = options?.outputDir ?? 'dist';
  const palettes = (options?.palettes ?? []).map((p) => ({
    colorName: String(p.colorName).toLowerCase() as RadixColor,
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

    const { lightSolidKey, darkSolidKey, lightAlphaKey, darkAlphaKey } = resolvePaletteKeys(
      base,
      spec.p3,
    );

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

    const { theme, layer } = themeParser(base, {
      lightAlpha: { key: lightAlphaKey, value: lightAlpha },
      lightSolid: { key: lightSolidKey, value: lightSolid },
      darkAlpha: { key: darkAlphaKey, value: darkAlpha },
      darkSolid: { key: darkSolidKey, value: darkSolid },
    });

    writeFile(path.join(outDir, `${base}-colors-only.css`), theme);
    appendUniqueImport(allColorsOnlyPath, `@import "./${base}-colors-only.css";`);

    if (spec.colorsOnly) continue;

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

function resolvePaletteKeys(base: string, p3: boolean) {
  if (base === 'mono') {
    const lightAlphaKey = p3 ? 'whiteP3A' : 'whiteA';
    const darkAlphaKey = p3 ? 'blackP3A' : 'blackA';
    return {
      lightSolidKey: lightAlphaKey,
      darkSolidKey: darkAlphaKey,
      lightAlphaKey,
      darkAlphaKey,
    };
  }

  return {
    lightSolidKey: buildColorName({ base, dark: false, p3, alpha: false }),
    darkSolidKey: buildColorName({ base, dark: true, p3, alpha: false }),
    lightAlphaKey: buildColorName({ base, dark: false, p3, alpha: true }),
    darkAlphaKey: buildColorName({ base, dark: true, p3, alpha: true }),
  };
}

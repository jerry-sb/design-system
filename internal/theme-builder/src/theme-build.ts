import fs from 'node:fs';
import path from 'node:path';

import radixColors from '@radix-ui/colors';

import type { RadixColor, ThemeConfig } from './types';
import { appendUniqueImport, buildColorName } from './utils/parser';
import { themeParser } from './utils/theme-parser';

export default async function themeBuild(options: ThemeConfig = { palettes: [] }) {
  const outDir = options?.outputDir ?? 'dist';
  const varPrefix = options.var_prefix ?? '--color-';
  const themePrefix = options.theme_prefix ?? 'theme-';
  const palettes = normalizePalettes(options);

  fs.mkdirSync(outDir, { recursive: true });

  const colors = radixColors as unknown as Record<string, Record<string, string>>;
  const allColorsOnlyPath = path.join(outDir, 'all-colors-only.css');

  touchFile(allColorsOnlyPath);

  for (const spec of palettes) {
    const base = spec.colorName;
    const { sKeys, p3Keys, hasSRGB, hasP3 } = resolveAvailableKeys(colors, base);
    if (!hasSRGB) {
      console.error(
        `[themeBuild] Error: missing palette for "${base}" (required: Solid & Alpha, light/dark)`,
      );
      continue;
    }

    const themeParts = buildTokenThemes(base, colors, sKeys, hasP3 ? p3Keys : undefined);
    const mappingParts = buildMappingBlocks(base, spec, themePrefix);
    const inlineAliases = buildInlineAliases(base, spec, themePrefix, varPrefix);

    writeFile(
      path.join(outDir, `${base}-colors-only.css`),
      [...themeParts, '', ...mappingParts, '', inlineAliases].filter(Boolean).join('\n'),
    );
    appendUniqueImport(allColorsOnlyPath, `@import "./${base}-colors-only.css";`);
  }
}

/**
 * 팔레트 입력을 내부 사용형으로 정규화합니다.
 * - colorName은 항상 소문자 RadixColor로
 * - base/alpha 옵션을 그대로 유지
 */
function normalizePalettes(options: ThemeConfig) {
  return (options?.palettes ?? []).map((p) => ({
    colorName: String(p.colorName).toLowerCase() as RadixColor,
    base: p.base,
    alpha: p.alpha,
  }));
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

/** 팔레트 키 집합 타입 */
type PaletteKeys = {
  lightSolidKey?: string; // mono의 경우 존재하지 않음
  darkSolidKey?: string; // mono의 경우 존재하지 않음
  lightAlphaKey: string;
  darkAlphaKey: string;
};

/**
 * 색상명/모드(p3) 기준으로 Radix 팔레트 키를 생성합니다.
 * - mono는 alpha 전용: whiteA/blackA(또는 P3A)
 */
function resolvePaletteKeys(base: string, p3: boolean): PaletteKeys {
  if (base === 'mono') {
    const lightAlphaKey = p3 ? 'blackP3A' : 'blackA';
    const darkAlphaKey = p3 ? 'whiteP3A' : 'whiteA';
    return {
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

/**
 * 사용 가능한 sRGB/P3 팔레트 존재 여부를 계산해 반환합니다.
 */
function resolveAvailableKeys(
  colors: Record<string, Record<string, string>>,
  base: string,
): { sKeys: PaletteKeys; p3Keys: PaletteKeys; hasSRGB: boolean; hasP3: boolean } {
  const sKeys = resolvePaletteKeys(base, false);
  const p3Keys = resolvePaletteKeys(base, true);
  const isMono = base === 'mono';
  const hasSRGB = isMono
    ? Boolean(colors?.[sKeys.lightAlphaKey] && colors?.[sKeys.darkAlphaKey])
    : Boolean(
        colors?.[sKeys.lightSolidKey!] &&
          colors?.[sKeys.darkSolidKey!] &&
          colors?.[sKeys.lightAlphaKey] &&
          colors?.[sKeys.darkAlphaKey],
      );
  const hasP3 = isMono
    ? Boolean(colors?.[p3Keys.lightAlphaKey] && colors?.[p3Keys.darkAlphaKey])
    : Boolean(
        colors?.[p3Keys.lightSolidKey!] &&
          colors?.[p3Keys.darkSolidKey!] &&
          colors?.[p3Keys.lightAlphaKey] &&
          colors?.[p3Keys.darkAlphaKey],
      );
  return { sKeys, p3Keys, hasSRGB, hasP3 };
}

/**
 * sRGB(+P3) 토큰 CSS 블록을 생성합니다.
 * - theme-parser가 반환한 토큰 블록을 순서대로 적층
 */
function buildTokenThemes(
  base: RadixColor,
  colors: Record<string, Record<string, string>>,
  sKeys: PaletteKeys,
  p3Keys?: PaletteKeys,
) {
  const parts: string[] = [];
  const sLightSolid = readPaletteMap(colors, sKeys.lightSolidKey);
  const sDarkSolid = readPaletteMap(colors, sKeys.darkSolidKey);
  const sLightAlpha = colors[sKeys.lightAlphaKey]!;
  const sDarkAlpha = colors[sKeys.darkAlphaKey]!;
  const { theme: themeSRGB } = themeParser(base, {
    lightAlpha: { key: sKeys.lightAlphaKey, value: sLightAlpha },
    lightSolid: { key: sKeys.lightSolidKey ?? '', value: sLightSolid },
    darkAlpha: { key: sKeys.darkAlphaKey, value: sDarkAlpha },
    darkSolid: { key: sKeys.darkSolidKey ?? '', value: sDarkSolid },
  });
  parts.push(themeSRGB);
  if (p3Keys) {
    const pLightSolid = readPaletteMap(colors, p3Keys.lightSolidKey);
    const pDarkSolid = readPaletteMap(colors, p3Keys.darkSolidKey);
    const pLightAlpha = colors[p3Keys.lightAlphaKey]!;
    const pDarkAlpha = colors[p3Keys.darkAlphaKey]!;
    const { theme: themeP3 } = themeParser(base, {
      lightAlpha: { key: p3Keys.lightAlphaKey, value: pLightAlpha },
      lightSolid: { key: p3Keys.lightSolidKey ?? '', value: pLightSolid },
      darkAlpha: { key: p3Keys.darkAlphaKey, value: pDarkAlpha },
      darkSolid: { key: p3Keys.darkSolidKey ?? '', value: pDarkSolid },
    });
    parts.push(themeP3);
  }
  return parts;
}

/**
 * 팔레트 맵을 안전하게 읽습니다. 키가 없거나 존재하지 않으면 빈 맵을 반환합니다.
 */
function readPaletteMap(
  colors: Record<string, Record<string, string>>,
  key?: string,
): Record<string, string> {
  return (key && colors[key]) || {};
}

/**
 * base/alpha 각각의 옵션에 맞는 테마 변수 매핑 블록을 생성합니다.
 * - mono는 base 매핑이 제거되고 alpha만 허용됩니다.
 */
function buildMappingBlocks(
  base: string,
  spec: {
    base?: {
      option: 'all' | 'light' | 'dark';
      p3?: boolean;
      theme?: boolean;
      'reverse-theme'?: boolean;
    };
    alpha?: {
      option: 'all' | 'light' | 'dark';
      p3?: boolean;
      theme?: boolean;
      'reverse-theme'?: boolean;
    };
  },
  themePrefix: string,
) {
  const isMono = base === 'mono';
  const out: string[] = [];
  if (!isMono && spec.base?.theme) {
    out.push(
      buildThemeVarMappingVariant(
        base,
        false,
        themePrefix,
        spec.base.option,
        Boolean(spec.base.p3),
        false,
      ),
    );
  }
  if (!isMono && spec.base?.['reverse-theme']) {
    out.push(
      buildThemeVarMappingVariant(
        base,
        false,
        themePrefix,
        spec.base.option,
        Boolean(spec.base.p3),
        true,
      ),
    );
  }
  if (spec.alpha?.theme) {
    out.push(
      buildThemeVarMappingVariant(
        base,
        true,
        themePrefix,
        spec.alpha.option,
        Boolean(spec.alpha.p3),
        false,
      ),
    );
  }
  if (spec.alpha?.['reverse-theme']) {
    out.push(
      buildThemeVarMappingVariant(
        base,
        true,
        themePrefix,
        spec.alpha.option,
        Boolean(spec.alpha.p3),
        true,
      ),
    );
  }
  return out;
}

/**
 * @theme inline 별칭 블록을 생성합니다.
 * - base/alpha 각각 theme 플래그에 따라 생성
 */
function buildInlineAliases(
  base: string,
  spec: {
    base?: { theme?: boolean; 'reverse-theme'?: boolean };
    alpha?: { theme?: boolean; 'reverse-theme'?: boolean };
  },
  themePrefix: string,
  varPrefix: string,
) {
  const isMono = base === 'mono';
  const aliasBase = !isMono && Boolean(spec.base?.theme);
  const aliasAlpha = Boolean(spec.alpha?.theme);
  const aliasBaseReverse = !isMono && Boolean(spec.base?.['reverse-theme']);
  const aliasAlphaReverse = Boolean(spec.alpha?.['reverse-theme']);
  return buildThemeInlineAliases(
    base,
    themePrefix,
    varPrefix,
    aliasBase,
    aliasAlpha,
    aliasBaseReverse,
    aliasAlphaReverse,
  );
}

/**
 * 단일 변형(base 또는 alpha)에 대한 테마 변수 매핑 블록을 생성합니다.
 * - option(light|dark|all), P3 지원 여부에 따라 :root / [data-theme="dark"] / @supports 블록 구성
 */
function buildThemeVarMappingVariant(
  base: string,
  isAlpha: boolean,
  themePrefix: string,
  option: 'all' | 'light' | 'dark',
  hasP3: boolean,
  reversed: boolean,
) {
  const mkVar = (prefix: string, name: string, scale: number) => `${prefix}${name}-${scale}`;
  const mkColorVar = (name: string, scale: number) => `--color-${name}-${scale}`;
  const lines: string[] = [];
  const themeName = (scale: number) =>
    isAlpha
      ? mkVar(themePrefix, `${reversed ? 'r-' : ''}${base}A`, scale)
      : mkVar(themePrefix, `${reversed ? 'r-' : ''}${base}`, scale);

  // default (sRGB) mapping (map to color variables)
  if (option === 'all' || option === 'light') {
    lines.push(':root {');
    for (let i = 1; i <= 12; i++) {
      const rootName =
        base === 'mono' || isAlpha
          ? base === 'mono'
            ? reversed
              ? 'whiteA'
              : 'blackA'
            : buildColorName({ base, dark: Boolean(reversed), p3: false, alpha: true })
          : buildColorName({ base, dark: Boolean(reversed), p3: false, alpha: false });
      lines.push(`  ${themeName(i)}: var(${mkColorVar(rootName, i)});`);
    }
    lines.push('}');
  }
  if (option === 'all' || option === 'dark') {
    lines.push('[data-theme="dark"] {');
    for (let i = 1; i <= 12; i++) {
      const darkBlockName =
        base === 'mono' || isAlpha
          ? base === 'mono'
            ? reversed
              ? 'blackA'
              : 'whiteA'
            : buildColorName({ base, dark: !Boolean(reversed), p3: false, alpha: true })
          : buildColorName({ base, dark: !Boolean(reversed), p3: false, alpha: false });
      lines.push(`  ${themeName(i)}: var(${mkColorVar(darkBlockName, i)});`);
    }
    lines.push('}');
  }

  if (hasP3) {
    lines.push('');
    lines.push('@supports (color: color(display-p3 1 1 1)) {');
    if (option === 'all' || option === 'light') {
      lines.push('  :root {');
      for (let i = 1; i <= 12; i++) {
        const rootP3 =
          base === 'mono' || isAlpha
            ? base === 'mono'
              ? reversed
                ? 'whiteP3A'
                : 'blackP3A'
              : buildColorName({ base, dark: Boolean(reversed), p3: true, alpha: true })
            : buildColorName({ base, dark: Boolean(reversed), p3: true, alpha: false });
        lines.push(`    ${themeName(i)}: var(${mkColorVar(rootP3, i)});`);
      }
      lines.push('  }');
    }

    if (option === 'all' || option === 'dark') {
      lines.push('  [data-theme="dark"] {');
      for (let i = 1; i <= 12; i++) {
        const darkBlockP3 =
          base === 'mono' || isAlpha
            ? base === 'mono'
              ? reversed
                ? 'blackP3A'
                : 'whiteP3A'
              : buildColorName({ base, dark: !Boolean(reversed), p3: true, alpha: true })
            : buildColorName({ base, dark: !Boolean(reversed), p3: true, alpha: false });
        lines.push(`    ${themeName(i)}: var(${mkColorVar(darkBlockP3, i)});`);
      }
      lines.push('  }');
    }
    lines.push('}');
  }

  return lines.join('\n');
}

/**
 * @theme inline 별칭 생성: 소비자가 테마 변수를 직접 참조할 수 있도록 연결합니다.
 * - color 변수 이름을 테마 변수 값과 연결 (ex: --color-blueP3-1: var(theme-blue-1))
 */
function buildThemeInlineAliases(
  base: string,
  themePrefix: string,
  varPrefix: string,
  aliasBase: boolean,
  aliasAlpha: boolean,
  aliasBaseReverse: boolean,
  aliasAlphaReverse: boolean,
) {
  const mkVar = (prefix: string, name: string, scale: number) => `${prefix}${name}-${scale}`;
  const lines: string[] = [];
  if (!aliasBase && !aliasAlpha && !aliasBaseReverse && !aliasAlphaReverse) return '';
  lines.push('');
  lines.push('@theme inline {');
  for (let i = 1; i <= 12; i++) {
    if (aliasBase) {
      // sRGB 색상 변수 이름을 테마 변수 값으로 연결
      const baseSRGBName = buildColorName({ base, dark: false, p3: false, alpha: false });
      lines.push(
        `  --color-${mkVar(varPrefix, baseSRGBName, i)}: var(${mkVar(themePrefix, base, i)});`,
      );
    }
    if (aliasAlpha) {
      const alphaSRGBName = buildColorName({ base, dark: false, p3: false, alpha: true });
      lines.push(
        `  --color-${mkVar(varPrefix, alphaSRGBName, i)}: var(${mkVar(themePrefix, `${base}A`, i)});`,
      );
    }
    if (aliasBaseReverse) {
      const baseSRGBName = buildColorName({ base, dark: false, p3: false, alpha: false });
      lines.push(
        `  --color-${mkVar(varPrefix, `r-${baseSRGBName}`, i)}: var(${mkVar(themePrefix, `r-${base}`, i)});`,
      );
    }
    if (aliasAlphaReverse) {
      const alphaSRGBName = buildColorName({ base, dark: false, p3: false, alpha: true });
      lines.push(
        `  --color-${mkVar(varPrefix, `r-${alphaSRGBName}`, i)}: var(${mkVar(themePrefix, `r-${base}A`, i)});`,
      );
    }
  }
  lines.push('}');
  return lines.join('\n');
}

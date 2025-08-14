// @ts-check
import radixColors from '@radix-ui/colors';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { appendUniqueImport, buildColorName, parseColorName } from './parser.js';
import { fileURLToPath } from 'node:url';

/**
 * @param {{
 *  outputDir?: string;
 *  onlyBases?: string[];
 *  colorsOnly?: boolean;
 * }} options
 * @returns {Promise<void>}
 */
export default async function themeBuild(options = {}) {
  const outDir = options?.outputDir ?? 'dist';

  fs.mkdirSync(outDir, { recursive: true });

  const allCssPath = path.join(outDir, 'all.css');
  const allColorsOnlyPath = path.join(outDir, 'all-colors-only.css');

  /** @type {Record<string, Record<string, string>>} */
  const colors = radixColors;

  for (const radixColorName of Object.keys(colors)) {
    if (options?.onlyBases && !options.onlyBases.includes(radixColorName)) continue;
    const { dark, ...rest } = parseColorName(radixColorName);

    // 다크 변형은 라이트 변형과 함께 처리하므로 스킵
    if (dark) continue;

    const darkRadixColorName = buildColorName({ ...rest, dark: true });

    const radixColor = colors[radixColorName];
    const darkRadixColor = colors[darkRadixColorName];

    if (!radixColor) continue;

    const colorName = radixColorName.toLowerCase();
    const darkColorName = darkRadixColorName.toLowerCase();

    // @theme 블록(변수 정의)
    const theme = [
      '@theme {',
      // Light
      ...Object.entries(radixColor).map(([scale, value]) => {
        const n = scale.match(/\d+/)?.[0] ?? scale; // 숫자 추출 실패시 전체 키 사용
        return `  --color-${colorName}-${n}: ${value};`;
      }),
      // Dark
      ...Object.entries(darkRadixColor ?? {}).map(([scale, value]) => {
        const n = scale.match(/\d+/)?.[0] ?? scale;
        return `  --color-${darkColorName}-${n}: ${value};`;
      }),
      '}',
    ].join('\n');

    // 유틸리티 레이어(@apply 이용) - 다크 팔레트가 있을 때만 생성
    const layer = darkRadixColor
      ? [
          `@utility bg-${colorName}-app {`,
          `  @apply bg-${colorName}-1 dark:bg-${darkColorName}-1;`,
          '}',
          `@utility bg-${colorName}-subtle {`,
          `  @apply bg-${colorName}-2 dark:bg-${darkColorName}-2;`,
          '}',
          `@utility bg-${colorName}-ui {`,
          `  @apply bg-${colorName}-3 dark:bg-${darkColorName}-3 hover:bg-${colorName}-4 dark:hover:bg-${darkColorName}-4 active:bg-${colorName}-5 dark:active:bg-${darkColorName}-5;`,
          '}',
          `@utility bg-${colorName}-ghost {`,
          `  @apply bg-transparent dark:bg-transparent hover:bg-${colorName}-3 dark:hover:bg-${darkColorName}-3 active:bg-${colorName}-4 dark:active:bg-${darkColorName}-4;`,
          '}',
          `@utility bg-${colorName}-action {`,
          `  @apply bg-${colorName}-4 dark:bg-${darkColorName}-4 hover:bg-${colorName}-5 dark:hover:bg-${darkColorName}-5 active:bg-${colorName}-6 dark:active:bg-${darkColorName}-6;`,
          '}',
          `@utility bg-${colorName}-solid {`,
          `  @apply bg-${colorName}-9 dark:bg-${darkColorName}-9 hover:bg-${colorName}-10 dark:hover:bg-${darkColorName}-10;`,
          '}',
          `@utility border-${colorName}-dim {`,
          `  @apply border-${colorName}-6 dark:border-${darkColorName}-6;`,
          '}',
          `@utility border-${colorName}-normal {`,
          `  @apply border-${colorName}-7 dark:border-${darkColorName}-7 hover:border-${colorName}-8 dark:hover:border-${darkColorName}-8;`,
          '}',
          `@utility divide-${colorName}-dim {`,
          `  @apply divide-${colorName}-6 dark:divide-${darkColorName}-6;`,
          '}',
          `@utility divide-${colorName}-normal {`,
          `  @apply divide-${colorName}-7 dark:divide-${darkColorName}-7 hover:divide-${colorName}-8 dark:hover:divide-${darkColorName}-8;`,
          '}',
          `@utility text-${colorName}-dim {`,
          `  @apply text-${colorName}-11 dark:text-${darkColorName}-11;`,
          '}',
          `@utility text-${colorName}-normal {`,
          `  @apply text-${colorName}-12 dark:text-${darkColorName}-12;`,
          '}',
        ].join('\n')
      : '';

    // 파일 쓰기 (Node.js)
    fs.writeFileSync(
      `dist/${colorName}.css`,
      `@import "./${colorName}-colors-only.css";\n${layer}`,
      'utf8'
    );

    fs.writeFileSync(`dist/${colorName}-colors-only.css`, theme, 'utf8');
    appendUniqueImport(allCssPath, `@import "./${colorName}.css";`);
    appendUniqueImport(allColorsOnlyPath, `@import "./${colorName}-colors-only.css";`);
  }
}

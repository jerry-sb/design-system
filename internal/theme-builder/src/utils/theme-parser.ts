import type { RadixColor } from '../types';

export const themeParser = (
  base: RadixColor,
  {
    lightSolid,
    darkSolid,
    lightAlpha,
    darkAlpha,
  }: {
    lightSolid: { key: string; value: Record<string, string> };
    darkSolid: { key: string; value: Record<string, string> };
    lightAlpha: { key: string; value: Record<string, string> };
    darkAlpha: { key: string; value: Record<string, string> };
  },
) => {
  let theme = [
    ...Object.entries(lightAlpha.value).map(
      ([scale, value]) =>
        `  --color-${lightAlpha.key}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
    ),
    ...Object.entries(darkAlpha.value).map(
      ([scale, value]) =>
        `  --color-${darkAlpha.key}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
    ),
  ];

  if (base !== 'mono') {
    theme = [
      ...Object.entries(lightSolid.value).map(
        ([scale, value]) =>
          `  --color-${lightSolid.key}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
      ),
      ...Object.entries(darkSolid.value).map(
        ([scale, value]) =>
          `  --color-${darkSolid.key}-${scale.match(/\d+/)?.[0] ?? scale}: ${value};`,
      ),
      ...theme,
    ];
  }

  theme.unshift('@theme {');
  theme.push('}');

  return { theme: theme.join('\n') };
};

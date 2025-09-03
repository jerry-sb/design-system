import { RadixColor } from '../types';

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

  const layer =
    base === 'mono'
      ? [
          '/* 배경 계층 (라이트=블랙, 다크=화이트) */',
          `@utility bg-mono-app {`,
          `  @apply bg-${darkAlpha.key}-1 dark:bg-${lightAlpha.key}-1;`,
          `}`,
          `@utility bg-mono-subtle {`,
          `  @apply bg-${darkAlpha.key}-2 dark:bg-${lightAlpha.key}-2;`,
          `}`,
          `@utility bg-mono-ui {`,
          `  @apply bg-${darkAlpha.key}-3 dark:bg-${lightAlpha.key}-3 hover:bg-${darkAlpha.key}-4 dark:hover:bg-${lightAlpha.key}-4 active:bg-${darkAlpha.key}-5 dark:active:bg-${lightAlpha.key}-5;`,
          `}`,
          `@utility bg-mono-ghost {`,
          `  @apply bg-transparent dark:bg-transparent hover:bg-${darkAlpha.key}-3 dark:hover:bg-${lightAlpha.key}-6 active:bg-${darkAlpha.key}-4 dark:active:bg-${lightAlpha.key}-4;`,
          `}`,
          `@utility bg-mono-action {`,
          `  @apply bg-${darkAlpha.key}-4 dark:bg-${lightAlpha.key}-4 hover:bg-${darkAlpha.key}-5 dark:hover:bg-${lightAlpha.key}-5 active:bg-${darkAlpha.key}-6 dark:active:bg-${lightAlpha.key}-6;`,
          `}`,
          '/* solid는 대비를 위해 라이트에서 더 진하게, 다크에서 덜 진하게 */',
          `@utility bg-mono-solid {`,
          `  @apply bg-${darkAlpha.key}-12 dark:bg-${lightAlpha.key}-9 hover:bg-${darkAlpha.key}-9 dark:hover:bg-${lightAlpha.key}-10;`,
          `}`,
          '',
          '/* 보더/디바이더 (항상 배경과 반대 계열) */',
          `@utility border-mono-dim {`,
          `  @apply border-${darkAlpha.key}-6 dark:border-${lightAlpha.key}-6;`,
          `}`,
          `@utility border-mono-normal {`,
          `  @apply border-${darkAlpha.key}-7 dark:border-${lightAlpha.key}-7 hover:border-${darkAlpha.key}-8 dark:hover:border-${lightAlpha.key}-8;`,
          `}`,
          `@utility border-mono-ui {`,
          `  @apply border-${darkAlpha.key}-9 dark:border-${lightAlpha.key}-9 hover:border-${darkAlpha.key}-10 dark:hover:border-${lightAlpha.key}-10;`,
          `}`,
          '',
          `@utility divide-mono-dim {`,
          `  @apply divide-${darkAlpha.key}-6 dark:divide-${lightAlpha.key}-6;`,
          `}`,
          `@utility divide-mono-normal {`,
          `  @apply divide-${darkAlpha.key}-7 dark:divide-${lightAlpha.key}-7 hover:divide-${darkAlpha.key}-8 dark:hover:divide-${lightAlpha.key}-8;`,
          `}`,
          '',
          '/* 컨텐츠(텍스트/아이콘) - 배경과 반대 계열로 고대비 */',
          `@utility text-on-mono {`,
          `  @apply text-${lightAlpha.key}-12 dark:text-${darkAlpha.key}-12;`,
          `}`,
          `@utility text-on-mono-dim {`,
          `  @apply text-${lightAlpha.key}-11 dark:text-${darkAlpha.key}-11;`,
          `}`,
          `@utility placeholder-on-mono {`,
          `  @apply text-${lightAlpha.key}-8 dark:text-${darkAlpha.key}-8;`,
          `}`,
          `@utility text-on-mono-inverse {`,
          `  @apply text-${darkAlpha.key}-12 dark:text-${lightAlpha.key}-12;`,
          `}`,
          '',
          '/* 컴포넌트 쇼트컷: 컨테이너 하나로 안전한 대비 세팅 */',
          `@utility mono-card {`,
          `  @apply bg-mono-ui text-on-mono border-mono-dim;`,
          `}`,
          `@utility mono-surface {`,
          `  @apply bg-mono-app text-on-mono;`,
          `}`,
          `@utility mono-button {`,
          `  @apply bg-${darkAlpha.key}-12 text-${lightAlpha.key}-12 hover:bg-${darkAlpha.key}-9 dark:bg-${lightAlpha.key}-12 dark:text-${darkAlpha.key}-12 dark:hover:bg-${lightAlpha.key}-10;`,
          `}`,
        ]
      : [
          `@utility bg-${base}-app {`,
          `  @apply bg-${lightSolid.key}-1 dark:bg-${darkSolid.key}-1;`,
          '}',
          `@utility bg-${base}-subtle {`,
          `  @apply bg-${lightSolid.key}-2 dark:bg-${darkSolid.key}-2;`,
          '}',
          `@utility bg-${base}-ui {`,
          `  @apply bg-${lightSolid.key}-3 dark:bg-${darkSolid.key}-3 hover:bg-${lightAlpha.key}-4 dark:hover:bg-${darkAlpha.key}-4 active:bg-${lightAlpha.key}-5 dark:active:bg-${darkAlpha.key}-5;`,
          '}',
          `@utility bg-${base}-ghost {`,
          `  @apply bg-transparent dark:bg-transparent hover:bg-${lightAlpha.key}-3 dark:hover:bg-${darkAlpha.key}-6 active:bg-${lightAlpha.key}-4 dark:active:bg-${darkAlpha.key}-4;`,
          '}',
          `@utility bg-${base}-action {`,
          `  @apply bg-${lightSolid.key}-4 dark:bg-${darkSolid.key}-4 hover:bg-${lightSolid.key}-5 dark:hover:bg-${darkSolid.key}-5 active:bg-${lightSolid.key}-6 dark:active:bg-${darkSolid.key}-6;`,
          '}',
          `@utility bg-${base}-solid {`,
          `  @apply bg-${lightSolid.key}-9 dark:bg-${darkSolid.key}-9 hover:bg-${lightSolid.key}-10 dark:hover:bg-${darkSolid.key}-10;`,
          '}',
          `@utility border-${base}-dim {`,
          `  @apply border-${lightSolid.key}-6 dark:border-${darkSolid.key}-6;`,
          '}',
          `@utility border-${base}-normal {`,
          `  @apply border-${lightSolid.key}-7 dark:border-${darkSolid.key}-7 hover:border-${lightSolid.key}-8 dark:hover:border-${darkSolid.key}-8;`,
          '}',
          `@utility border-${base}-ui {`,
          `  @apply border-${lightSolid.key}-9 dark:border-${darkSolid.key}-9 hover:border-${lightSolid.key}-10 dark:hover:border-${darkSolid.key}-10;`,
          '}',
          `@utility divide-${base}-dim {`,
          `  @apply divide-${lightSolid.key}-6 dark:divide-${darkSolid.key}-6;`,
          '}',
          `@utility divide-${base}-normal {`,
          `  @apply divide-${lightSolid.key}-7 dark:divide-${darkSolid.key}-7 hover:divide-${lightSolid.key}-8 dark:hover:divide-${darkSolid.key}-8;`,
          '}',
          `@utility text-${base}-dim {`,
          `  @apply text-${lightSolid.key}-11 dark:text-${darkSolid.key}-11;`,
          '}',
          `@utility text-${base}-normal {`,
          `  @apply text-${lightSolid.key}-12 dark:text-${darkSolid.key}-12;`,
          '}',
        ];

  return { theme: theme.join('\n'), layer: layer.join('\n') };
};

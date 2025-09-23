// @ts-check

/**
 * @type {import('@jerryshim/theme-builder').ThemeConfig}
 */
export default {
  var_prefix: 'theme-',
  theme_prefix: '--jerry-',
  outputDir: 'src/styles/jerry-theme',
  palettes: [
    {
      colorName: 'slate',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
    {
      colorName: 'blue',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
    {
      colorName: 'red',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
    {
      colorName: 'amber',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
    {
      colorName: 'green',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, 'reverse-theme': true },
    },
    { colorName: 'mono', alpha: { option: 'all', p3: true, 'reverse-theme': true, theme: true } },
  ],
};

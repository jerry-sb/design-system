/**
 * @type {import('@jerryshim/theme-builder').ThemeConfig}
 */
export default {
  palettes: [
    {
      colorName: 'slate',
      base: { option: 'all', p3: true, theme: true },
      alpha: { option: 'all', p3: true, theme: true },
    },
    { colorName: 'mono', alpha: { option: 'all', p3: true, theme: true } },
  ],
  theme_prefix: '--jerry-',
  var_prefix: 'theme-',
  outputDir: 'src/styles',
};

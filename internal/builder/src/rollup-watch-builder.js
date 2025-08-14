//@ts-check
import path from 'node:path';
import fs from 'node:fs';
import { watch as rollupWatch } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import buildContext from './build-context.js';
import { loadCssPlugins } from './build-utils.js';

/**
 * @param {string} target
 * @param {{ format?: 'all' | 'esm' | 'cjs'; css?: 'auto' | 'postcss'; noDts?: boolean }} options
 */
export default async function buildWatch(target, options = {}) {
  const ctx = await buildContext(target, options);
  if (ctx.flags.isCssOnly) {
    await watchCssPackage(ctx);
  } else {
    await watchTsPackage(ctx);
  }
}

/* ------------------------ CSS watch ------------------------ */

/**
 * @param {Awaited<ReturnType<import('./build-context.js').default>>} context
 */
async function watchCssPackage(context) {
  const { paths, options, presetCssCandidates } = context;
  const { resolvedPath, distDir } = paths;
  const { shouldEnablePostcss, twConfigAbs } = options;

  fs.mkdirSync(distDir, { recursive: true });

  const srcPreset = presetCssCandidates.find(fs.existsSync);
  const tmpEntry = path.join(distDir, '__css_entry__.js');
  fs.writeFileSync(tmpEntry, `import ${JSON.stringify(srcPreset)};`);

  const plugins = [];
  if (shouldEnablePostcss) {
    plugins.push(
      await loadCssPlugins({
        resolvedPath,
        extractTo: path.join(distDir, 'preset.css'),
        twConfigAbs,
        mode: 'theme',
      })
    );
  }

  const watcher = rollupWatch({
    input: tmpEntry,
    external: () => false,
    plugins,
    output: [{ dir: distDir, format: 'esm', sourcemap: false }],
    watch: { clearScreen: true },
  });

  watcher.on('event', (e) => {
    if (e.code === 'BUNDLE_END') console.log('🔁 (CSS) Rebuilt in', e.duration, 'ms');
    if (e.code === 'ERROR') console.error('❌ (CSS) Watch error', e.error);
  });
}

/* ------------------------ TS watch ------------------------ */

/**
 * @param {Awaited<ReturnType<import('./build-context.js').default>>} context
 */
async function watchTsPackage(context) {
  const { paths, options, isExternal } = context;
  const { distDir, srcDir, tsconfigPath } = paths;
  const { format } = options;

  const plugins = [typescript({ tsconfig: tsconfigPath, declaration: false })];

  /** @type {import('rollup').OutputOptions[]} */
  const outputs = [];
  if (format === 'all' || format === 'cjs')
    outputs.push({ dir: distDir, format: 'commonjs', sourcemap: true });
  if (format === 'all' || format === 'esm')
    outputs.push({ dir: distDir, format: 'esm', sourcemap: true });

  const watcher = rollupWatch({
    input: path.join(srcDir, 'index.ts'),
    external: isExternal,
    plugins,
    output: outputs,
    watch: { clearScreen: true },
  });

  watcher.on('event', (e) => {
    if (e.code === 'BUNDLE_END') console.log('🔁 Rebuilt in', e.duration, 'ms');
    if (e.code === 'ERROR') console.error('❌ Watch error', e.error);
  });
}

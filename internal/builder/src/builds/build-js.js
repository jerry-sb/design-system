import path from 'node:path';

import pc from 'picocolors';
import { rollup, watch as rollupWatch } from 'rollup';

import { enforceEsModuleOnly } from '../utils/helper.js';

/* ------------------------ JS-only package build (ESM-only) ------------------------ */
/**
 * @param {Awaited<ReturnType<import('../utils/context.js').default>>} context
 * @param {{ watch?: boolean }} [opts]
 */
export default async function buildJsPackage(context, opts = {}) {
  const { paths, options, isExternal, entries } = context;
  const { distDir, srcDir } = paths;
  const { format, esmExt } = options;
  const watch = !!opts.watch;

  // 모든 엔트리에 대해 ESM-only 검증
  entries.forEach((e) => enforceEsModuleOnly(e.file));

  const input =
    entries.length === 1
      ? entries[0].file
      : Object.fromEntries(entries.map((e) => [e.name, e.file]));
  const plugins = []; // node-resolve/commonjs 없이 상대경로만

  if (watch) {
    const outputs = [];
    if (format === 'all' || format === 'cjs')
      outputs.push({
        dir: distDir,
        format: 'commonjs',
        sourcemap: true,
        exports: 'auto',
        entryFileNames: '[name].cjs',
      });
    if (format === 'all' || format === 'esm')
      outputs.push({
        dir: distDir,
        format: 'esm',
        sourcemap: true,
        entryFileNames: `[name].${esmExt}`,
      });

    const watcher = rollupWatch({
      input,
      external: isExternal,
      plugins,
      treeshake: true,
      output: outputs,
      watch: {
        include: [path.join(srcDir, '**/*')],
        exclude: ['**/node_modules/**', '**/dist/**'],
        clearScreen: true,
      },
    });

    watcher.on('event', (e) => {
      switch (e.code) {
        case 'START':
          console.log(pc.cyan('👀 (JS-only) Starting watch'));
          break;
        case 'BUNDLE_START':
          console.log(pc.dim('→ Starting bundle'));
          break;
        case 'BUNDLE_END':
          console.log(pc.green(`✔ Bundle completed (${e.duration}ms)`));
          break;
        case 'ERROR':
          console.error(pc.red(`❌ Build error: ${e.error?.message ?? e}`));
          break;
        case 'END':
          console.log(pc.cyan('⏳ Waiting for changes...'));
          break;
      }
    });

    const stop = () => watcher.close().then(() => process.exit(0));
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    return;
  }

  // 단발성
  let bundle;
  try {
    bundle = await rollup({ input, external: isExternal, plugins, treeshake: true });
  } catch (err) {
    console.error(
      pc.red(`❌ (JS-only) Bundle failed: ${err instanceof Error ? err.message : String(err)}`),
    );
    process.exit(1);
  }

  if (format === 'all' || format === 'cjs') {
    await bundle.write({
      dir: distDir,
      format: 'commonjs',
      sourcemap: true,
      exports: 'auto',
      entryFileNames: '[name].cjs',
    });
    console.log(pc.green('✅ (JS-only) CJS bundle completed'));
  }
  if (format === 'all' || format === 'esm') {
    await bundle.write({
      dir: distDir,
      format: 'esm',
      sourcemap: true,
      entryFileNames: `[name].${esmExt}`,
    });
    console.log(pc.green('✅ (JS-only) ESM bundle completed'));
  }
}

import path from 'node:path';

import typescript from '@rollup/plugin-typescript';
import pc from 'picocolors';
import { rollup, watch as rollupWatch } from 'rollup';

import { emitDtsMultiple, shouldEmitDts } from '../utils/helper.js';

/* ------------------------ TS package build ------------------------ */
/**
 * @param {Awaited<ReturnType<import('../utils/context.js').default>>} context
 * @param {{ watch?: boolean }} [opts]  // ← watch 플래그 추가
 */
export default async function buildTsPackage(context, opts = {}) {
  const { paths, options, isExternal, entries, pkg } = context;
  const { distDir, tsconfigPath } = paths;
  const { format, esmExt } = options;
  const watch = !!opts.watch;
  const plugins = [typescript({ tsconfig: tsconfigPath, declaration: false })];
  const input =
    entries.length === 1
      ? entries[0].file
      : Object.fromEntries(entries.map((e) => [e.name, e.file]));

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
        include: [path.join(paths.srcDir, '**/*')],
        exclude: ['**/node_modules/**', '**/dist/**'],
        clearScreen: true,
      },
    });

    watcher.on('event', async (e) => {
      switch (e.code) {
        case 'START':
          console.log(pc.cyan('👀 (TS) Starting watch'));
          break;
        case 'BUNDLE_START':
          console.log(pc.dim('→ Starting JS bundle'));
          break;
        case 'BUNDLE_END':
          console.log(pc.green(`✔ JS bundle completed (${e.duration}ms)`));
          if (shouldEmitDts(tsconfigPath, pkg)) {
            try {
              await emitDtsMultiple(entries, distDir, tsconfigPath);
            } catch (err) {
              console.error(
                pc.red(
                  `❌ d.ts generation failed: ${err instanceof Error ? err.message : String(err)}`,
                ),
              );
            }
          }
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
      pc.red(`❌ JS bundle failed: ${err instanceof Error ? err.message : String(err)}`),
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
    console.log(pc.green('✅ CJS bundle completed'));
  }
  if (format === 'all' || format === 'esm') {
    await bundle.write({
      dir: distDir,
      format: 'esm',
      sourcemap: true,
      entryFileNames: `[name].${esmExt}`,
    });
    console.log(pc.green('✅ ESM bundle completed'));
  }

  if (shouldEmitDts(tsconfigPath, pkg)) {
    await emitDtsMultiple(context.entries, distDir, tsconfigPath);
    console.log(pc.green('✅ Type declarations bundle completed'));
  } else {
    console.log(pc.yellow('ℹ️ Skipping .d.ts based on tsconfig'));
  }
}

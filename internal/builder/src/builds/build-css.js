import fs from 'node:fs';
import path from 'node:path';

import pc from 'picocolors';
import { rollup, watch as rollupWatch } from 'rollup';

import { loadCssPlugins } from '../utils/css.js';

/* ------------------------ CSS package build (preset.css only watch) ------------------------ */
/**
 * @param {Awaited<ReturnType<import('../utils/context.js').default>>} context
 * @param {{ watch?: boolean }} [opts]
 */

export default async function buildCssPackage(context, opts = {}) {
  const { paths, options, presetCssCandidates } = context;
  const { resolvedPath, distDir } = paths;
  const { shouldEnablePostcss } = options;
  const watch = !!opts.watch;

  fs.mkdirSync(distDir, { recursive: true });
  const srcPreset = presetCssCandidates.find(fs.existsSync);
  if (!srcPreset) {
    console.error(pc.red('❌ preset.css file not found'));
    process.exit(1);
  }

  // 루트 JS 스텁은 규칙상 초기 1회만 복사(감시하지 않음)
  const rootJsStub = path.join(resolvedPath, 'index.js');
  const copyJsStubOnce = () => {
    if (fs.existsSync(rootJsStub)) {
      fs.copyFileSync(rootJsStub, path.join(distDir, 'index.js'));
      console.log(pc.green('✅ Copied JS stub → dist/index.js'));
    }
  };

  if (shouldEnablePostcss) {
    const postcssPlugin = await loadCssPlugins({
      resolvedPath,
      extractTo: path.join(distDir, 'preset.css'),
      mode: 'theme',
    });
    const tmpEntry = path.join(distDir, '__css_entry__.js');
    fs.writeFileSync(tmpEntry, `import ${JSON.stringify(srcPreset)};`);

    if (watch) {
      copyJsStubOnce();
      const watcher = rollupWatch({
        input: tmpEntry,
        external: () => false,
        plugins: [postcssPlugin],
        output: [{ dir: distDir, format: 'esm', sourcemap: false }],
        watch: {
          include: [srcPreset], // ✅ preset.css만 감시
          exclude: ['**/node_modules/**', '**/dist/**'],
          clearScreen: true,
        },
      });
      watcher.on('event', (e) => {
        switch (e.code) {
          case 'START':
            console.log(pc.cyan('👀 (CSS) Starting watch [preset.css only]'));
            break;
          case 'BUNDLE_START':
            console.log(pc.dim('→ Starting CSS build'));
            break;
          case 'BUNDLE_END':
            console.log(pc.green(`✔ CSS build completed (${e.duration}ms)`));
            break;
          case 'ERROR':
            console.error(pc.red(`❌ CSS build error: ${e.error?.message ?? e}`));
            break;
          case 'END':
            console.log(pc.cyan('⏳ Waiting for preset.css changes...'));
            break;
        }
      });
      const stop = () =>
        watcher.close().then(() => {
          try {
            fs.rmSync(tmpEntry, { force: true });
          } catch {}
          process.exit(0);
        });
      process.once('SIGINT', stop);
      process.once('SIGTERM', stop);
      return;
    }

    // 단발성
    const bundle = await rollup({
      input: tmpEntry,
      external: () => false,
      plugins: [postcssPlugin],
    });
    await bundle.write({ dir: distDir, format: 'esm', sourcemap: false });
    fs.rmSync(tmpEntry, { force: true });
    console.log(pc.green('✅ CSS output → dist/preset.css'));
    copyJsStubOnce();
  } else {
    const copyOnce = () => {
      fs.copyFileSync(srcPreset, path.join(distDir, 'preset.css'));
      console.log(pc.green('✅ CSS copied → dist/preset.css'));
    };
    copyOnce();
    copyJsStubOnce();

    if (watch) {
      const cssWatcher = fs.watch(srcPreset, { persistent: true }, () => {
        try {
          copyOnce();
        } catch (e) {
          console.error(pc.red(`CSS copy failed: ${e instanceof Error ? e.message : String(e)}`));
        }
      });
      const stop = () => {
        cssWatcher.close();
        process.exit(0);
      };
      process.once('SIGINT', stop);
      process.once('SIGTERM', stop);
      console.log(pc.cyan('⏳ Waiting for preset.css changes...'));
      return;
    }
  }
}

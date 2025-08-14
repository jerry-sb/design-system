// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import { execSync } from 'node:child_process';
import buildContext from './build-context.js';
import { loadCssPlugins } from './build-utils.js';

/**
 * @param {string} target
 * @param {{ format?: 'all' | 'esm' | 'cjs'; css?: 'auto' | 'postcss'; noDts?: boolean }} options
 */
export default async function build(target, options = {}) {
  console.time('📦 전체 빌드 시간');
  const ctx = await buildContext(target, options);
  if (ctx.flags.isCssOnly) {
    await buildCssPackage(ctx);
  } else {
    await buildTsPackage(ctx);
  }
  console.timeEnd('📦 전체 빌드 시간');
}

/* ------------------------ TS package build ------------------------ */

/**
 * @param {Awaited<ReturnType<import('./build-context.js').default>>} context
 */
async function buildTsPackage(context) {
  const { paths, options, isExternal } = context;
  const { distDir, srcDir, tsconfigPath } = paths;
  const { format, noDts } = options;

  const plugins = [typescript({ tsconfig: tsconfigPath, declaration: false })];
  const input = path.join(srcDir, 'index.ts');

  let bundle;

  try {
    bundle = await rollup({ input, external: isExternal, plugins });
  } catch (err) {
    console.error(`❌ JS 번들 실패: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  if (format === 'all' || format === 'cjs') {
    await bundle.write({ dir: distDir, format: 'commonjs', sourcemap: true });
    console.log('✅ CJS 번들 완료');
  }
  if (format === 'all' || format === 'esm') {
    await bundle.write({ dir: distDir, format: 'esm', sourcemap: true });
    console.log('✅ ESM 번들 완료');
  }

  if (!noDts) {
    try {
      execSync(
        `tsc --project ${tsconfigPath} --emitDeclarationOnly --declaration --outDir ${distDir}`,
        { stdio: 'inherit' }
      );

      const dtsBundle = await rollup({
        input: path.join(distDir, 'index.d.ts'),
        plugins: [dts()],
      });

      await dtsBundle.write({ file: path.join(distDir, 'index.d.ts'), format: 'es' });
      console.log(`✅ 타입 선언 번들 완료`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ 타입 번들 실패: ${message}`);
      process.exit(1);
    }
  } else {
    console.log(`⚠️ 타입 선언 생략 (--no-dts)`);
  }

  console.timeEnd(`📦 전체 빌드 시간`);
}

/* ------------------------ CSS package build ------------------------ */

/**
 * @param {Awaited<ReturnType<import('./build-context.js').default>>} context
 */
async function buildCssPackage(context) {
  const { paths, options, presetCssCandidates } = context;
  const { resolvedPath, distDir } = paths;
  const { shouldEnablePostcss, twConfigAbs } = options;

  fs.mkdirSync(distDir, { recursive: true });
  const srcPreset = presetCssCandidates.find(fs.existsSync);

  if (srcPreset === undefined) {
    console.error(`❌ preset.css 파일을 찾을 수 없습니다.`);
    process.exit(1);
  }

  if (shouldEnablePostcss) {
    const postcssPlugin = await loadCssPlugins({
      resolvedPath,
      extractTo: path.join(distDir, 'preset.css'),
      twConfigAbs,
      mode: 'theme',
    });

    const tmpEntry = path.join(distDir, '__css_entry__.js');
    fs.writeFileSync(tmpEntry, `import ${JSON.stringify(srcPreset)};`);
    const bundle = await rollup({
      input: tmpEntry,
      external: () => false,
      plugins: [postcssPlugin],
    });
    await bundle.write({ dir: distDir, format: 'esm', sourcemap: false });
    fs.rmSync(tmpEntry, { force: true });
  } else {
    fs.copyFileSync(srcPreset, path.join(distDir, 'preset.css'));
    console.log('✅ CSS 복사 완료 → dist/preset.css');
  }

  const rootJsStub = path.join(resolvedPath, 'index.js');
  if (fs.existsSync(rootJsStub)) {
    fs.copyFileSync(rootJsStub, path.join(distDir, 'index.js'));
    console.log('✅ JS 스텁 복사 → dist/index.js');
  }
}

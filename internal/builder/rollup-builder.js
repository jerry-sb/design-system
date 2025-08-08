// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module'; // ✅ 추가
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

/**
 * Tailwind/PostCSS 플러그인 로더
 * @param {{ resolvedPath: string; tailwindConfigPath?: string }} params
 * @returns {Promise<import('rollup').Plugin>}
 */
async function loadCssPlugins({ resolvedPath, tailwindConfigPath }) {
  // rollup-plugin-postcss는 빌더가 직접 의존해야 함 (builder deps)
  const [{ default: postcss }] = await Promise.all([import('rollup-plugin-postcss')]);

  // ✅ 대상 패키지 기준으로 모듈 해석
  const requireFromTarget = createRequire(path.join(resolvedPath, 'package.json'));

  let tailwind;
  try {
    // v3/v4 공통: tailwindcss 패키지의 PostCSS 플러그인
    // (v4에서도 tailwindcss 자체를 플러그인으로 사용할 수 있음)
    tailwind = requireFromTarget('tailwindcss');
  } catch {}

  let autoprefixer;
  try {
    autoprefixer = requireFromTarget('autoprefixer');
  } catch {}

  /** @type {any} */
  const postcssOptions = {
    modules: true,
    extract: true,
    minimize: true,
    sourceMap: true,
    plugins: [],
  };

  if (tailwind) {
    postcssOptions.plugins.push(
      // @ts-ignore
      tailwind(tailwindConfigPath || path.join(resolvedPath, 'tailwind.config.js'))
    );
  }

  if (autoprefixer) {
    // @ts-ignore
    postcssOptions.plugins.push(autoprefixer());
  }

  // @ts-ignore
  return postcss(postcssOptions);
}

/**
 * @param {string} relativePath
 * @param {{ format?: 'all'|'cjs'|'esm'; noDts?: boolean; css?: 'auto'|'postcss'|'none' }} options
 */
export async function build(relativePath, options = {}) {
  console.time(`📦 전체 빌드 시간`);

  const { format = 'all', noDts = false, css = 'auto' } = options;
  const validFormats = ['all', 'cjs', 'esm'];
  if (!validFormats.includes(format)) {
    console.error(`❌ 잘못된 format: '${format}' (허용: all, cjs, esm)`);
    process.exit(1);
  }
  const validCss = ['auto', 'postcss', 'none'];
  if (!validCss.includes(css)) {
    console.error(`❌ 잘못된 css 옵션: '${css}' (허용: auto, postcss, none)`);
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const pkgJsonPath = path.join(resolvedPath, 'package.json');
  const tsconfigPath = path.join(resolvedPath, 'tsconfig.json');
  const distDir = path.join(resolvedPath, 'dist');

  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`❌ ${relativePath} 안에 package.json이 없습니다.`);
    process.exit(1);
  }
  if (!fs.existsSync(tsconfigPath)) {
    console.error(`❌ ${relativePath} 안에 tsconfig.json이 없습니다.`);
    process.exit(1);
  }

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log(`🧹 dist 정리 완료`);
  }

  const entryPoints = ['index.ts'];
  const inputFiles = entryPoints.map((f) => path.join(relativePath, 'src', f));

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const externals = [
    ...Object.keys(pkgJson.dependencies || {}),
    ...Object.keys(pkgJson.peerDependencies || {}),
  ];

  /** @type {(id: string) => boolean} */
  const isExternal = (id) =>
    externals.includes(id) ||
    externals.some((dep) => id.startsWith(`${dep}/`)) ||
    id.startsWith('@jerry/');

  const hasTailwindConfig =
    fs.existsSync(path.join(resolvedPath, 'tailwind.config.js')) ||
    fs.existsSync(path.join(resolvedPath, 'tailwind.config.cjs')) ||
    fs.existsSync(path.join(resolvedPath, 'tailwind.config.ts'));

  const hasTailwindDep =
    (pkgJson.dependencies && pkgJson.dependencies['tailwindcss']) ||
    (pkgJson.devDependencies && pkgJson.devDependencies['tailwindcss']);

  const shouldEnablePostcss =
    css === 'postcss' || (css === 'auto' && (hasTailwindConfig || hasTailwindDep));

  const plugins = [
    typescript.default({
      tsconfig: tsconfigPath,
      declaration: false,
    }),
  ];

  if (shouldEnablePostcss) {
    try {
      const tailwindConfigPath = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts']
        .map((p) => path.join(resolvedPath, p))
        .find((p) => fs.existsSync(p));

      const postcssPlugin = await loadCssPlugins({ resolvedPath, tailwindConfigPath });
      plugins.push(postcssPlugin);
      console.log(`💅 PostCSS${hasTailwindDep ? ' + Tailwind' : ''} 활성화`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ PostCSS 파이프라인 로드 실패: ${message}`);
      process.exit(1);
    }
  } else {
    console.log(`🚫 CSS 파이프라인 비활성화 (css=${css})`);
  }

  try {
    const bundle = await rollup({ input: inputFiles, external: isExternal, plugins });

    if (format === 'all' || format === 'cjs') {
      await bundle.write({ dir: distDir, format: 'cjs', sourcemap: true });
      console.log(`✅ CJS 번들 완료`);
    }
    if (format === 'all' || format === 'esm') {
      await bundle.write({ dir: distDir, format: 'esm', sourcemap: true });
      console.log(`✅ ESM 번들 완료`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ JS 번들 실패: ${message}`);
    process.exit(1);
  }

  if (!noDts) {
    try {
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

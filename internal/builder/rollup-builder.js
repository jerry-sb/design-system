import fs from 'node:fs';
import path from 'node:path';
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

/**
 * @param {string} relativePath
 * @param {{ format?: string; noDts?: boolean }} options
 */
export async function build(relativePath, options = {}) {
  console.time(`📦 전체 빌드 시간`);

  // ✅ 옵션 처리
  const { format = 'all', noDts = false } = options;
  const validFormats = ['all', 'cjs', 'esm'];

  if (!validFormats.includes(format)) {
    console.error(`❌ 잘못된 format 값입니다: '${format}' (허용: all, cjs, esm)`);
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const pkgJsonPath = path.join(resolvedPath, 'package.json');
  const tsconfigPath = path.join(resolvedPath, 'tsconfig.json');
  const distDir = path.join(resolvedPath, 'dist');

  // ✅ 유효성 검사
  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`❌ ${relativePath} 안에 package.json 파일을 찾을 수 없습니다!`);
    process.exit(1);
  }

  if (!fs.existsSync(tsconfigPath)) {
    console.error(`❌ ${relativePath} 안에 tsconfig.json 파일을 찾을 수 없습니다!`);
    process.exit(1);
  }

  // ✅ dist 초기화
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log(`🧹 기존 dist 디렉토리를 삭제했습니다.`);
  }

  /** @type {string[]} */
  const entryPoints = ['index.ts'];
  const inputFiles = entryPoints.map((file) => path.join(relativePath, 'src', file));

  // ✅ external 자동 추출
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const externals = [
    ...Object.keys(pkgJson.dependencies || {}),
    ...Object.keys(pkgJson.peerDependencies || {}),
  ];

  const isExternal = (id) =>
    externals.includes(id) ||
    externals.some((dep) => id.startsWith(`${dep}/`)) ||
    id.startsWith('@jerry/');

  try {
    const bundle = await rollup({
      input: inputFiles,
      external: isExternal,
      plugins: [
        typescript.default({
          tsconfig: tsconfigPath,
          declaration: false,
        }),
      ],
    });

    if (format === 'all' || format === 'cjs') {
      await bundle.write({
        dir: distDir,
        format: 'cjs',
        sourcemap: true,
      });
      console.log(`✅ CJS 번들 생성 완료`);
    }

    if (format === 'all' || format === 'esm') {
      await bundle.write({
        dir: distDir,
        format: 'esm',
        sourcemap: true,
      });
      console.log(`✅ ESM 번들 생성 완료`);
    }
  } catch (err) {
    console.error(`❌ JS 번들 실패: ${err.message}`);
    process.exit(1);
  }

  // ✅ 타입 번들 생성
  if (!noDts) {
    try {
      const dtsBundle = await rollup({
        input: path.join(distDir, 'index.d.ts'),
        plugins: [dts()],
      });

      await dtsBundle.write({
        file: path.join(distDir, 'index.d.ts'),
        format: 'es',
      });

      console.log(`✅ 타입 선언 번들 생성 완료`);
    } catch (err) {
      console.error(`❌ 타입 번들 실패: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(`⚠️ 타입 선언 생략됨 (--no-dts 옵션 활성화)`);
  }

  console.timeEnd(`📦 전체 빌드 시간`);
}

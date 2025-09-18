// @ts-check
import fs from 'node:fs';
import path from 'node:path';

import pc from 'picocolors';

import { discoverEntries, makeExternal } from './helper.js';

/**
 * @param {string} relativeOrAbs
 * @param {{ format?: 'all'|'esm'|'cjs', css?: 'auto'|'postcss'|'none', watch?: boolean, cssExports?: 'skip'|'copy'|'auto' }} options
 */
export default async function buildContext(relativeOrAbs, options) {
  const { format = 'all', css = 'auto', cssExports = 'skip' } = options;
  const validFormats = new Set(['all', 'cjs', 'esm']);
  const validCss = new Set(['auto', 'postcss', 'none']);
  if (!validFormats.has(format)) {
    console.error(pc.red(`❌ Invalid format: '${format}' (allowed: all, cjs, esm)`));
    process.exit(1);
  }
  if (!validCss.has(css)) {
    console.error(pc.red(`❌ Invalid CSS option: '${css}' (allowed: auto, postcss, none)`));
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), relativeOrAbs);
  const pkgJsonPath = path.join(resolvedPath, 'package.json');
  const tsconfigPath = path.join(resolvedPath, 'tsconfig.json');
  const distDir = path.join(resolvedPath, 'dist');
  const srcDir = path.join(resolvedPath, 'src');

  if (!fs.existsSync(pkgJsonPath)) {
    console.error(pc.red(`❌ No package.json found in ${relativeOrAbs}`));
    process.exit(1); // CSS 서브패스 매핑 수집 (복사/생성을 위해)
  }

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const declaredSubpaths = Object.keys(pkg.exports ?? {})
    .filter((k) => k !== '.' && k.startsWith('./'))
    .filter((k) => !/\*/.test(k)) // 와일드카드는 빌더 대상에서 제외
    .filter((k) => !k.endsWith('.css') && !k.endsWith('.json')) // CSS/JSON 등 비 JS 엔트리 제외
    .map((k) => k.slice(2)); // "./name" -> "name"
  const entries = discoverEntries(srcDir, declaredSubpaths);
  const hasEntry = entries.length > 0;
  const esmExt = pkg.type === 'module' ? 'js' : 'mjs';
  // 엔트리 기반 TS/JS-only 판정
  const hasTsEntry = entries.some((e) => e.file.endsWith('.ts') || e.file.endsWith('.tsx'));
  const hasJsEntry = entries.some(
    (e) => e.file.endsWith('.js') || e.file.endsWith('.mjs') || e.file.endsWith('.cjs'),
  );
  const presetCssCandidates = [
    path.join(resolvedPath, 'preset.css'),
    path.join(srcDir, 'preset.css'),
  ];
  const hasPresetCss = presetCssCandidates.some(fs.existsSync);
  const isCssOnly = !hasEntry && hasPresetCss;
  const isJsOnly = !hasTsEntry && hasJsEntry;

  if (!isCssOnly && !isJsOnly && !fs.existsSync(tsconfigPath)) {
    console.error(pc.red(`❌ No tsconfig.json found in ${relativeOrAbs}`));
    process.exit(1);
  }

  // CSS 파이프라인 auto 결정: Tailwind 의존성만 간단 체크
  const hasTailwindDep =
    Boolean(pkg.dependencies?.tailwindcss) || Boolean(pkg.devDependencies?.tailwindcss);
  const shouldEnablePostcss = css === 'postcss' || (css === 'auto' && hasTailwindDep);
  // exports에 선언했는데 src에 없음
  const missing = declaredSubpaths.filter((n) => !entries.some((e) => e.name === n));
  if (missing.length) {
    console.error(
      pc.red(
        `❌ Missing source files for subpaths declared in exports: ${missing.join(', ')}\n` +
          `   Expected files: src/{${missing.join(',')}}.(ts|tsx|js|mjs|cjs)`,
      ),
    );
    process.exit(1);
  }

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.info(pc.green('🧹 Cleaned dist directory'));
  }

  return {
    options: { format, css, cssExports, shouldEnablePostcss, esmExt },
    paths: { resolvedPath, pkgJsonPath, tsconfigPath, distDir, srcDir },
    flags: { isCssOnly, isJsOnly, hasTsEntry, hasJsEntry, hasPresetCss },
    pkg,
    isExternal: makeExternal(pkg),
    presetCssCandidates,
    entries,
  };
}

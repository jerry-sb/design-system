// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import { findCssFiles, scanTailwindDirectives } from './build-utils.js';

/**
 * @param {string} relativeOrAbs
 * @param {{ format?: 'all' | 'esm' | 'cjs'; css?: 'auto' | 'postcss'; noDts?: boolean }} options
 */
export default async function buildContext(relativeOrAbs, options) {
  const { format = 'all', css = 'auto', noDts = false } = options;

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

  const resolvedPath = path.resolve(process.cwd(), relativeOrAbs);
  const pkgJsonPath = path.join(resolvedPath, 'package.json');
  const tsconfigPath = path.join(resolvedPath, 'tsconfig.json');
  const distDir = path.join(resolvedPath, 'dist');
  const srcDir = path.join(resolvedPath, 'src');

  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`❌ ${relativeOrAbs} 안에 package.json이 없습니다.`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const hasTsEntry = fs.existsSync(path.join(srcDir, 'index.ts'));
  const presetCssCandidates = [
    path.join(resolvedPath, 'preset.css'),
    path.join(srcDir, 'preset.css'),
  ];
  const hasPresetCss = presetCssCandidates.some(fs.existsSync);
  const isCssOnly = !hasTsEntry && hasPresetCss;

  if (!isCssOnly && !fs.existsSync(tsconfigPath)) {
    console.error(`❌ ${relativeOrAbs} 안에 tsconfig.json이 없습니다.`);
    process.exit(1);
  }

  const externals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log(`🧹 dist 정리 완료`);
  }

  /** @type {(id: string) => boolean} */
  const isExternal = (id) =>
    externals.includes(id) ||
    externals.some((dep) => id.startsWith(`${dep}/`)) ||
    id.startsWith('@jerry');

  // Tailwind v4 감지
  const cssFiles = findCssFiles(resolvedPath);
  const { hasTw: hasTailwindDirective, configPath } = scanTailwindDirectives(cssFiles);
  const twConfigAbs =
    configPath && configPath.value
      ? path.resolve(path.dirname(configPath.from), configPath.value)
      : undefined;

  const hasTailwindDep =
    (pkg.dependencies && pkg.dependencies['tailwindcss']) ||
    (pkg.devDependencies && pkg.devDependencies['tailwindcss']);

  const shouldEnablePostcss =
    css === 'postcss' || (css === 'auto' && (hasTailwindDirective || hasTailwindDep));

  return {
    options: { format, css, shouldEnablePostcss, twConfigAbs, noDts },
    paths: { resolvedPath, pkgJsonPath, tsconfigPath, distDir, srcDir },
    flags: { isCssOnly, hasTsEntry, hasPresetCss },
    pkg,
    externals,
    isExternal,
    presetCssCandidates,
  };
}

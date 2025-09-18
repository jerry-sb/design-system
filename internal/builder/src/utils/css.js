// @ts-check
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import pc from 'picocolors';

import buildCssPackage from '../builds/build-css.js';

/**
 * Theme/Component CSS 빌드 모드
 * - "theme": 전역 유틸/토큰 중심(예: preset.css) → CSS Modules 비활성
 * - "component": 컴포넌트 스타일(로컬 클래스명) → CSS Modules 활성
 * @typedef {"theme" | "component"} CssBuildMode
 */

/**
 * loadCssPlugins 옵션
 * @typedef LoadCssPluginsOptions
 * @property {string} resolvedPath          대상 패키지 절대 경로 (해당 패키지 기준 모듈 해석)
 * @property {string | undefined} [extractTo]  추출 파일 경로 (예: "dist/preset.css"); 없으면 기본 파일명
 * @property {string | undefined} [twConfigAbs] Tailwind 설정 파일의 **절대경로** (`@config`에서 해석)
 * @property {CssBuildMode} [mode="theme"]  빌드 모드 ("theme" | "component")
 */

/**
 * Tailwind/PostCSS 플러그인 로더
 * 대상 패키지 기준으로 tailwindcss/ autoprefixer를 동적 로드하고,
 * Rollup에서 사용할 postcss 플러그인을 반환한다.
 *
 * @param {LoadCssPluginsOptions} params
 * @returns {Promise<import('rollup').Plugin>}
 */
async function loadCssPlugins({ resolvedPath, extractTo, twConfigAbs, mode = 'theme' }) {
  // 동적 import (빌더 의존)
  const [{ default: postcss }] = await Promise.all([import('rollup-plugin-postcss')]);
  // 대상 패키지 기준 모듈 해석
  const requireFromTarget = createRequire(path.join(resolvedPath, 'package.json'));
  /** @type {any | undefined} */
  let tailwind;
  /** @type {any | undefined} */
  let autoprefixer;
  try {
    tailwind = requireFromTarget('@tailwindcss/postcss');
  } catch {}
  try {
    autoprefixer = requireFromTarget('autoprefixer');
  } catch {}

  /** @type {any} */
  const postcssOptions = {
    // 테마(preset.css)는 전역 클래스를 노출해야 하므로 Modules 금지
    // 컴포넌트 CSS는 Modules 활성 가능
    modules: mode === 'component',
    // undefined이면 기본 파일명으로 추출, 문자열이면 해당 경로로 추출
    extract: extractTo ?? true,
    minimize: true,
    sourceMap: true,
    plugins: [],
  };

  if (tailwind) {
    // v4: zero-config. twConfigAbs 있으면 해당 설정 사용.
    postcssOptions.plugins.push(tailwind(twConfigAbs));
  }
  if (autoprefixer) {
    postcssOptions.plugins.push(autoprefixer());
  }

  // @ts-ignore - 타입은 플러그인 인스턴스 반환
  return postcss(postcssOptions);
}

/**
 * Tailwind/PostCSS 플러그인 로더
 * @param {string} rootDir
 * @returns {string[]}
 */
function findCssFiles(rootDir) {
  /** @type {string[]} */
  const out = [];
  /** @param {string} d */
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const stat = fs.statSync(p);

      if (stat.isDirectory()) {
        if (name === 'node_modules' || name === 'dist') continue;
        walk(p);
      } else if (name.endsWith('.css')) {
        out.push(p);
      }
    }
  };

  if (fs.existsSync(rootDir)) walk(rootDir);
  return out;
}

/**
 * @param {string[]} cssFiles
 * @returns {{ hasTw: boolean; configPath: { from: string; value: string | undefined } | null }}
 */
function scanTailwindDirectives(cssFiles) {
  const reImportTw = /@import\s+["']tailwindcss["'];?/;
  const reTheme = /@theme\b/;
  const reUtility = /@utility\b/;
  const reConfig = /@config\s+["']([^"']+)["'];?/;
  let hasTw = false;
  let configPath = null;

  for (const file of cssFiles) {
    const src = fs.readFileSync(file, 'utf-8');
    if (reImportTw.test(src) || reTheme.test(src) || reUtility.test(src)) {
      hasTw = true;
    }

    //@config "./tailwind.config.ts"; 지정된 경우 추가
    const m = src.match(reConfig);
    if (!configPath && m) configPath = { from: file, value: m[1] };
  }

  return { hasTw, configPath };
}

/**
 * cssExports 옵션에 따라 preset.css를 빌드/복사하고 exports에 노출한다
 * @param {Awaited<ReturnType<import('./context.js').default>>} ctx
 * @param {{ watch?: boolean, cssExports?: 'skip'|'copy'|'auto' }} options
 */
async function maybeBuildAndExportPresetCss(ctx, options) {
  const { flags } = ctx;
  const cssExports = options.cssExports ?? 'skip';
  if (!flags.hasPresetCss || cssExports === 'skip') return;

  // CSS 산출 (postcss auto 여부는 context의 shouldEnablePostcss를 사용)
  await buildCssPackage(ctx, { watch: options.watch });
  await ensurePresetCssExport(ctx.paths.pkgJsonPath);
}

/**
 * package.json exports에 "./preset.css": "./dist/preset.css" 추가
 * @param {string} pkgJsonPath
 */
async function ensurePresetCssExport(pkgJsonPath) {
  try {
    const _pkgDir = path.dirname(pkgJsonPath);
    const raw = fs.readFileSync(pkgJsonPath, 'utf-8');
    const pkg = JSON.parse(raw);
    const exportsField = pkg.exports ?? (pkg.exports = {});

    // exports가 문자열/배열 등 예상 외 형태인 경우는 건드리지 않음
    if (exportsField && typeof exportsField === 'object' && !Array.isArray(exportsField)) {
      if (!exportsField['./preset.css']) {
        exportsField['./preset.css'] = './dist/preset.css';
        fs.writeFileSync(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
        console.info(pc.green('✅ Added exports["./preset.css"] → ./dist/preset.css'));
      }
    }
  } catch (e) {
    console.warn(
      pc.yellow(
        `⚠️ Failed to ensure preset.css export: ${e instanceof Error ? e.message : String(e)}`,
      ),
    );
  }
}

export { findCssFiles, loadCssPlugins, maybeBuildAndExportPresetCss, scanTailwindDirectives };

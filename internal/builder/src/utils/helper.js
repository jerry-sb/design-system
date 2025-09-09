import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { builtinModules } from 'node:module';
import path from 'node:path';

import pc from 'picocolors';
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';

/* ------------------------ d.ts helpers ------------------------ */

export function shouldEmitDts(tsconfigPath, pkg) {
  // package.json 힌트
  const hasTypesField =
    Boolean(pkg.types || pkg.typings) ||
    Boolean(pkg.publishConfig?.types) ||
    Boolean(pkg.exports?.['.']?.import?.types) ||
    Boolean(pkg.exports?.['.']?.require?.types);

  if (hasTypesField) return true;

  // tsc --showConfig 확인
  try {
    const out = execSync(`tsc --project ${tsconfigPath} --showConfig`, { encoding: 'utf8' });
    const cfg = JSON.parse(out);
    const c = cfg?.compilerOptions ?? {};
    return c.declaration === true || c.composite === true || typeof c.declarationDir === 'string';
  } catch {
    return false;
  }
}

export async function emitDtsMultiple(entries, distDir, tsconfigPath) {
  for (const e of entries) {
    const b = await rollup({
      input: e.file, // ex) src/index.ts
      plugins: [dts({ tsconfig: tsconfigPath })],
      treeshake: false,
    });
    await b.write({ file: path.join(distDir, `${e.name}.d.ts`), format: 'es' });
  }
}

/* ------------------------ context helpers ------------------------ */

function pickEntry(srcDir, name) {
  const cands = [
    path.join(srcDir, `${name}.ts`),
    path.join(srcDir, `${name}.tsx`),
    path.join(srcDir, `${name}.js`),
    path.join(srcDir, `${name}.mjs`),
    path.join(srcDir, `${name}.cjs`),
  ];
  return cands.find(fs.existsSync);
}

export function discoverEntries(srcDir, declared = []) {
  const names = new Set(['index', ...declared]);
  /** @type {{name:string,file:string}[]} */
  const out = [];
  for (const n of names) {
    const f = pickEntry(srcDir, n);
    if (f) out.push({ name: n, file: f });
  }
  return out;
}

const BUILTINS = new Set(process.versions?.node ? (builtinModules ?? []) : []);

/**
 * peerDeps & deps & node 내장모듈을 external 처리
 * @param {any} pkg
 * @returns {(id:string)=>boolean}
 */
export function makeExternal(pkg) {
  const peers = Object.keys(pkg.peerDependencies ?? {});
  const deps = Object.keys(pkg.dependencies ?? {});
  return function external(id) {
    if (id.startsWith('node:')) return true;
    if (BUILTINS.has(id) || BUILTINS.has(id.replace(/^node:/, ''))) return true;
    if (peers.includes(id) || peers.some((p) => id === p || id.startsWith(`${p}/`))) return true;
    if (deps.includes(id) || deps.some((d) => id === d || id.startsWith(`${d}/`))) return true;
    return false;
  };
}

/* ------------------------ tsbuild helper ------------------------ */

export function enforceEsModuleOnly(file) {
  const code = fs.readFileSync(file, 'utf8');
  const hasCjs =
    /\bmodule\.exports\b/.test(code) || /\bexports\s*=/.test(code) || /\brequire\s*\(/.test(code);
  if (hasCjs) {
    console.error(
      pc.red(
        `❌ JS-only builder supports ESM only.\n` +
          `- CJS patterns detected (require/module.exports etc): ${path.relative(process.cwd(), file)}\n` +
          `- Solution: Convert to ESM syntax (.mjs/ESM .js) or use the commonjs plugin.`,
      ),
    );
    process.exit(1);
  }
}

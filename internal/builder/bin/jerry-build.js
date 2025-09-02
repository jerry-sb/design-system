#!/usr/bin/env node
// @ts-check
import path from 'node:path';

import pc from 'picocolors';
import sade from 'sade';

import build from '../src/index.js';

// 안전: 전역 에러/시그널 처리
process.on('unhandledRejection', (err) => {
  throw err;
});
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

sade('jerry-build [target]', true)
  .version('0.1.0')
  .describe('Rollup-based builder for TS/CSS packages')
  .option('--watch, -w', 'Watch mode', false)
  .option('--format', 'all|esm|cjs', 'all')
  .option('--css', 'auto|postcss', 'auto')
  .action(async (t = '.', opts) => {
    const target = path.resolve(process.cwd(), t);
    // 옵션 정제
    const F = new Set(['all', 'esm', 'cjs']);
    const C = new Set(['auto', 'postcss']);
    /** @type {'all'|'esm'|'cjs'} */
    const format = F.has(opts.format) ? opts.format : 'all';
    /** @type {'auto'|'postcss'} */
    const css = C.has(opts.css) ? opts.css : 'auto';
    /** @type {boolean} */
    const watch = opts.watch === true;

    try {
      await build(target, { format, css, watch });
      console.info(pc.green('✔ build finished'));
    } catch (e) {
      console.error(pc.red(e instanceof Error ? e.stack : String(e)));
      process.exit(1);
    }
  })
  .parse(process.argv);

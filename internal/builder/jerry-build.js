#!/usr/bin/env node
// @ts-check
import path from 'node:path';
import minimist from 'minimist';
import build from './src/rollup-builder.js';
import buildWatch from './src/rollup-watch-builder.js';

// ✅ 전역 에러 핸들링
process.on('unhandledRejection', (err) => {
  throw err;
});
process.on('SIGINT', () => process.exit(0)); // Ctrl + C
process.on('SIGTERM', () => process.exit(0)); // kill 명령 등

// ✅ CLI 인자 파싱
const args = minimist(process.argv.slice(2));
const target = path.resolve(process.cwd(), args._[0] ?? '.');

const options = {
  format: args.format || 'all',
  noDts: Boolean(args['no-dts']),
  css: args.css || 'auto',
};

if (!args.watch) {
  await build(target, options);
} else {
  await buildWatch(target, options);
}

#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import pc from 'picocolors';
import sade from 'sade';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = join(__dirname, '..', 'dist', 'index.js');

process.on('unhandledRejection', (err) => {
  throw err;
});
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

if (!existsSync(distIndex)) {
  console.error(
    pc.red(
      [
        'dist/index.js could not be found.',
        'This usually indicates a packaging error.',
        '',
        '👉 Please open an issue on GitHub if you encounter this as a user.',
      ].join('\n'),
    ),
  );
  process.exit(1);
}

const mod = await import(pathToFileURL(distIndex).href);
// 필수 export 존재 확인(안전망)
const { init, sync, depSync, printHelp, default: run } = mod;
if (!(init && sync && depSync && printHelp) && typeof run !== 'function') {
  console.error(pc.red('Unexpected export format in dist/index.js'));
  process.exit(1);
}

const prog = sade('jerry-theme-build');

prog.version('0.1.0').describe('Theme builder CLI');

prog
  .command('help')
  .describe('Show help')
  .action(() => printHelp());

prog
  .command('init [package]')
  .describe('Install component library & set scripts')
  .action(async (pkg = '@jerry-ui/theme-builder') => {
    await init(pkg);
  });

prog
  .command('sync')
  .describe('Build palettes from jerry-theme.config.* and import')
  .action(async () => {
    await sync();
  });

prog
  .command('dep-sync')
  .describe('Aggregate theme configs from deps -> merge into main')
  .option('--format', 'mjs|cjs|js', 'mjs')
  .option('--include', 'Scope glob for node_modules', '@jerry-ui/*')
  .option('--write', 'Actually write to file', false)
  .option('--lock', 'Write jerry-theme.deps.lock.json', false)
  .option('--dry', 'Preview only', false)
  .action(async (opts) => {
    await depSync({
      format: opts.format,
      include: opts.include,
      write: !!opts.write,
      lock: !!opts.lock,
      dry: !!opts.dry,
    });
  });

prog.parse(process.argv);

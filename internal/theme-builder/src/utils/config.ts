import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import pc from 'picocolors';

import { colorArray, colorOptions } from '../constants';
import type { PaletteOption, RadixColor, ThemeConfig } from '../types';

export const defaultOutDir = 'src/styles/jerry-theme';

export function printHelp() {
  console.info(
    pc.cyan(`
jerry-theme <command>


Commands
init [package] Install component library & set scripts
sync Build palettes from jerry-theme.config.* and import
dep-sync Aggregate theme configs from deps -> merge into main


Options (dep-sync):
--format=mjs|cjs|js Output format (default: mjs)
--include=@jerryshim-ui/* Scope glob for node_modules
--write Actually write to file
--lock Write jerry-theme.deps.lock.json
--dry Preview only


Config (jerry-theme.config.js | jerry-theme.config.mjs | jerry-theme.config.cjs):
{
  "var_prefix": "--color-",
  "theme_prefix": "theme-",
  "outputDir": "src/styles/jerry-theme",
  "palettes": [
    {
      "colorName": "blue",
      "base": { "option": "all", "p3": true, "theme": true },
      "alpha": { "option": "all", "p3": true, "theme": true, "reverse-theme": true }
    }
  ]
}
`),
  );
}

export async function loadConfig(root: string): Promise<{ config: ThemeConfig; path: string }> {
  const candidates = [
    'jerry-theme.config.js',
    'jerry-theme.config.mjs',
    'jerry-theme.config.cjs',
  ].map((p) => join(root, p));

  console.info(pc.gray('[jerry-theme] config: Search candidates'));
  for (const c of candidates) console.info(pc.gray(` - ${c}`));

  for (const p of candidates) {
    if (!existsSync(p)) continue;
    console.info(pc.gray(`[jerry-theme] config: Using file = ${p}`));
    const mod = await import(pathToFileURL(p).href);
    const cfg = (mod as any).default ?? (mod as ThemeConfig);
    return { config: cfg, path: p };
  }

  console.info(pc.yellow('[jerry-theme] config: Using defaults (no config file found)'));
  return {
    config: {
      outputDir: defaultOutDir,
      palettes: [],
    },
    path: 'jerry-theme.config',
  };
}

export function validateConfig(cfg: ThemeConfig, path: string) {
  console.info(pc.gray('[jerry-theme] config: Validating configuration'));

  if (!cfg || typeof cfg !== 'object') throw new Error(`path: ${path} -> Invalid config`);
  if (!Array.isArray(cfg.palettes))
    throw new Error(`path: ${path} -> Invalid config: 'palettes' array is required`);

  const validatePaletteOption = (name: string, opt?: PaletteOption) => {
    if (!opt) return;
    if (!opt.option || !colorOptions.includes(opt.option)) {
      throw new Error(
        `path: ${path} -> Invalid config: '${name}.option' must be one of ${colorOptions.join(', ')}`,
      );
    }
    if (typeof opt.p3 !== 'undefined' && typeof opt.p3 !== 'boolean') {
      throw new Error(`path: ${path} -> Invalid config: '${name}.p3' must be boolean`);
    }
    if (typeof opt.theme !== 'undefined' && typeof opt.theme !== 'boolean') {
      throw new Error(`path: ${path} -> Invalid config: '${name}.theme' must be boolean`);
    }
    if (typeof opt['reverse-theme'] !== 'undefined' && typeof opt['reverse-theme'] !== 'boolean') {
      throw new Error(`path: ${path} -> Invalid config: '${name}.reverse-theme' must be boolean`);
    }
  };

  for (const p of cfg.palettes) {
    if (!colorArray.includes(p.colorName as RadixColor)) {
      throw new Error(
        `path: ${path} -> Invalid config: 'colorName' must be one of ${colorArray.join(', ')}`,
      );
    }
    validatePaletteOption('base', p.base);
    validatePaletteOption('alpha', p.alpha);
  }
  console.info(
    pc.gray(`[jerry-theme] config: ${path} Number of palettes = ${cfg.palettes.length}`),
  );
}

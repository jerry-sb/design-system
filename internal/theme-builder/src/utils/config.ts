import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import pc from 'picocolors';

import { colorArray } from '../constants';
import type { RadixColor, ThemeConfig } from '../types';

export const defaultOutDir = 'src/styles/jerry-theme';

export function printHelp() {
  console.log(
    pc.cyan(`
jerry-theme <command>


Commands
init [package] Install component library & set scripts
sync Build palettes from jerry-theme.config.* and import
dep-sync Aggregate theme configs from deps -> merge into main


Options (dep-sync):
--format=mjs|cjs|js Output format (default: mjs)
--include=@jerry-ui/* Scope glob for node_modules
--write Actually write to file
--lock Write jerry-theme.deps.lock.json
--dry Preview only


Config (jerry-theme.config.js | jerry-theme.config.mjs | jerry-theme.config.cjs):
{
"palettes": [ { "colorName": "blue", "colorsOnly": false, "p3": true } ],
"outDir": "src/styles/jerry-theme",
}
`),
  );
}

export async function loadConfig(root: string): Promise<ThemeConfig> {
  const candidates = [
    'jerry-theme.config.js',
    'jerry-theme.config.mjs',
    'jerry-theme.config.cjs',
  ].map((p) => join(root, p));

  console.log(pc.gray('[jerry-theme] config: Search candidates'));
  for (const c of candidates) console.log(pc.gray(` - ${c}`));

  for (const p of candidates) {
    if (!existsSync(p)) continue;
    console.log(pc.gray(`[jerry-theme] config: Using file = ${p}`));
    const mod = await import(pathToFileURL(p).href);
    const cfg = (mod as any).default ?? (mod as ThemeConfig);
    return cfg;
  }

  console.log(pc.yellow('[jerry-theme] config: Using defaults (no config file found)'));
  return {
    outputDir: defaultOutDir,
    palettes: [],
  };
}

export function validateConfig(cfg: ThemeConfig) {
  console.log(pc.gray('[jerry-theme] config: Validating configuration'));
  if (!cfg || !Array.isArray(cfg.palettes)) {
    throw new Error("Invalid config: 'palettes' array is required");
  }

  for (const p of cfg.palettes) {
    if (!p || typeof p.colorName !== 'string') {
      throw new Error(`Invalid config: 'colorName' string is required for each palette`);
    }

    if (!colorArray.includes(p.colorName as RadixColor)) {
      throw new Error(`Invalid config: 'colorName' must be one of ${colorArray.join(', ')}`);
    }
  }
  console.log(pc.gray(`[jerry-theme] config: Number of palettes = ${cfg.palettes.length}`));
}

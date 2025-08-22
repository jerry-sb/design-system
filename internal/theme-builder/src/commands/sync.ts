import fs from 'node:fs';

import pc from 'picocolors';

import themeBuild from '../theme-build';
import { defaultOutDir, loadConfig, validateConfig } from '../utils/config';

export async function sync() {
  console.log(pc.cyan('[jerry-theme] sync: Starting'));
  const root = process.cwd();
  console.log(pc.gray(`[jerry-theme] sync: Project root = ${root}`));

  console.time(pc.gray('[jerry-theme] sync: Loading config'));
  const config = await loadConfig(root);
  console.timeEnd(pc.gray('[jerry-theme] sync: Loading config'));

  validateConfig(config);
  const outDir = config.outputDir ?? defaultOutDir;
  console.log(pc.gray(`[jerry-theme] sync: Output directory = ${outDir}`));

  console.time(pc.gray('[jerry-theme] sync: Preparing output directory'));
  await fs.promises.mkdir(outDir, { recursive: true });
  console.timeEnd(pc.gray('[jerry-theme] sync: Preparing output directory'));

  console.time(pc.gray('[jerry-theme] sync: Building palettes'));
  await themeBuild(config);
  console.timeEnd(pc.gray('[jerry-theme] sync: Building palettes'));

  console.log(
    pc.green(
      `✔ Theme synced. Palettes: ${
        config.palettes.map((p) => `${p.colorName}${p.p3 ? 'P3' : ''}`).join(', ') || '(none)'
      }`,
    ),
  );
}

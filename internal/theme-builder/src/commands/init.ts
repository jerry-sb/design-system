import pc from 'picocolors';

import { patchPackageJson } from '../utils/package-json';
import { detectPM, run } from '../utils/pm';

export async function init(componentPkg: string) {
  console.log(pc.cyan(`[jerry-theme] init: Starting (package: ${componentPkg})`));
  const pm = detectPM();
  console.log(pc.cyan(`[jerry-theme] init: Detected package manager → ${pm}`));
  console.time(pc.gray('[jerry-theme] init: Installation time'));
  await run(pm, ['add', componentPkg]);
  console.timeEnd(pc.gray('[jerry-theme] init: Installation time'));
  await patchPackageJson((pkg: any) => {
    pkg.scripts ||= {};
    pkg.scripts['theme:sync'] = 'jerry-theme sync';
    return pkg;
  });
  console.log(pc.green(`✔ Installed ${componentPkg} and added "theme:sync" script.`));
}

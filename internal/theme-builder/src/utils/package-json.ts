import { readFile, writeFile } from 'node:fs/promises';

export async function patchPackageJson(mutator: (pkg: any) => any) {
  const path = 'package.json';
  const json = JSON.parse(await readFile(path, 'utf-8'));
  const next = mutator(json);
  await writeFile(path, `${JSON.stringify(next, null, 2)}\n`, 'utf-8');
}

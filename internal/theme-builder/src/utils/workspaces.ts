import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import YAML from 'yaml';

export async function findWorkspaceGlobs(root: string): Promise<string[]> {
  const yml = ['pnpm-workspace.yaml', 'pnpm-workspace.yml']
    .map((p) => join(root, p))
    .find(existsSync);
  if (yml) {
    const doc = YAML.parse(await readFile(yml, 'utf-8'));
    if (doc?.packages) return doc.packages as string[];
  }

  const pj = join(root, 'package.json');
  if (existsSync(pj)) {
    const j = JSON.parse(await readFile(pj, 'utf-8'));
    const ws = j.workspaces;
    if (Array.isArray(ws)) return ws;
    if (ws?.packages) return ws.packages as string[];
  }

  return ['packages/*', 'tooling/*'];
}

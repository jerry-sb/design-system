import fs from 'node:fs';
import path from 'node:path';

import type { ColorNameComponents } from '../types';

export function parseColorName(colorName: string): ColorNameComponents {
  const { base, dark, p3, alpha } = /^(?<base>.+?)(?<dark>dark)?(?<p3>p3)?(?<alpha>a)?$/i.exec(
    colorName,
  )!.groups!;

  return {
    base: base!,
    dark: dark !== undefined,
    p3: p3 !== undefined,
    alpha: alpha !== undefined,
  };
}

export function buildColorName(components: ColorNameComponents): string {
  const { base, dark, p3, alpha } = components;
  let colorName = base;

  if (dark) {
    colorName += 'Dark';
  }

  if (p3) {
    colorName += 'P3';
  }

  if (alpha) {
    colorName += 'A';
  }

  return colorName;
}

export function appendUniqueImport(filePath: string, importLine: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', 'utf-8');
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const hasLine = content.split(/\r?\n/).some((l) => l.trim() === importLine.trim());

  if (!hasLine) {
    const next =
      content && !content.endsWith('\n')
        ? `${content}\n${importLine}\n`
        : `${content + importLine}\n`;
    fs.writeFileSync(filePath, next, 'utf-8');
  }
}

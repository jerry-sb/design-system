import fs from 'node:fs';
import path from 'node:path';

// @ts-nocheck
/**
 * @typedef {Object} ColorNameComponents
 * @property {string} base
 * @property {boolean} dark
 * @property {boolean} p3
 * @property {boolean} alpha
 *
 * @param {string} colorName
 * @returns {ColorNameComponents}
 */
export function parseColorName(colorName) {
  const { base, dark, p3, alpha } = /^(?<base>.+?)(?<dark>dark)?(?<p3>p3)?(?<alpha>a)?$/i.exec(
    colorName
  ).groups;

  return {
    base,
    dark: dark !== undefined,
    p3: p3 !== undefined,
    alpha: alpha !== undefined,
  };
}

/**
 * @param {ColorNameComponents} components
 * @returns {string}
 */
export function buildColorName(components) {
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

/**
 * 인덱스 파일에 중복 없이 @import 한 줄을 추가
 * 파일이 없으면 생성
 * @param {string} filePath
 * @param {string} importLine
 */
export function appendUniqueImport(filePath, importLine) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', 'utf-8');
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const hasLine = content.split(/\r?\n/).some((l) => l.trim() === importLine.trim());

  if (!hasLine) {
    const next =
      content && !content.endsWith('\n')
        ? content + '\n' + importLine + '\n'
        : content + importLine + '\n';
    fs.writeFileSync(filePath, next, 'utf-8');
  }
}

import pc from 'picocolors';

import buildCssPackage from './builds/build-css.js';
import buildJsPackage from './builds/build-js.js';
import buildTsPackage from './builds/build-ts.js';
import buildContext from './utils/context.js';

/**
 * @typedef {Object} BuildOptions
 * @property {'all'|'esm'|'cjs'} [format]
 * @property {'auto'|'postcss'} [css]
 * @property {boolean} [watch]
 */

/**
 * @param {string} target
 * @param {BuildOptions} [options]
 * @returns {Promise<void>}
 */
export default async function build(target, options = {}) {
  console.time(pc.cyan('📦 Total build time'));
  const ctx = await buildContext(target, options);
  if (ctx.flags.isCssOnly) {
    await buildCssPackage(ctx, options);
  } else if (ctx.flags.isJsOnly) {
    await buildJsPackage(ctx, options);
  } else {
    await buildTsPackage(ctx, options);
  }
  console.timeEnd(pc.cyan('📦 Total build time'));
}

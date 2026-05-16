// SPDX-Licence-Identifier: EUPL-1.2

/**
 * @dappcore/ui — CoreUI root entry.
 *
 * Importing the root re-exports every JS module (formatters, crypto, forms,
 * colour, math, animation, dom, a11y, platform, brand). CSS tokens are NOT
 * re-exported from JS — import them separately:
 *
 *   import '@dappcore/ui/tokens';            // bare tokens
 *   import '@dappcore/ui/tokens/tailwind';   // Tailwind v4 @theme bridge
 *   import '@dappcore/ui/tokens/brand-lethean';
 *
 * For tree-shaking, prefer sub-imports:
 *
 *   import { parseColour } from '@dappcore/ui/colour';
 *   import { Easing }      from '@dappcore/ui/math';
 *   import { FocusTrap }   from '@dappcore/ui/dom';
 */

export * from './src/formatters/index.js';
export * from './src/crypto/index.js';
export * from './src/forms/index.js';
export * from './src/colour/index.js';
export * from './src/math/index.js';
export * from './src/animation/index.js';
export * from './src/dom/index.js';
export * from './src/a11y/index.js';
export * from './src/platform/index.js';
export * from './src/brand/index.js';

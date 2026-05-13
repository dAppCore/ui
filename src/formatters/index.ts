// SPDX-Licence-Identifier: EUPL-1.2

/**
 * Built-in formatters — registered eagerly on import.
 *
 * Importing this module side-effects the global formatter registry with
 * every built-in pipe name. Consumers that want to register before any
 * built-in (to override, for example) should import the registry
 * directly and call registerFormatter() before this module loads.
 *
 * Usage example:
 *
 *   import '@dappcore/ui/formatters';  // registers built-ins
 *   import { applyPipe } from '@dappcore/ui/formatters/registry';
 *   applyPipe('bytes', 1500); // → "1.5 kB"
 */

import { registerFormatter, type Formatter } from './registry.js';

import { bytes } from './bytes.js';
import { hashrate } from './hashrate.js';
import { duration } from './duration.js';
import { relativeTime } from './relative-time.js';
import { trimZeros } from './trim-zeros.js';
import { shrug } from './shrug.js';
import { effortColour } from './effort-colour.js';
import { symbol } from './symbol.js';
import { toCoin } from './to-coin.js';
import { difficulty } from './difficulty.js';
import { cutMiddle } from './cut-middle.js';

// SI / file-size scaling
registerFormatter('bytes', bytes as unknown as Formatter);

// Mining / blockchain stats
registerFormatter('hashrate', hashrate as unknown as Formatter);
registerFormatter('difficulty', difficulty as unknown as Formatter);
registerFormatter('effort-colour', effortColour as unknown as Formatter);
registerFormatter('symbol', symbol as unknown as Formatter);
registerFormatter('to-coin', toCoin as unknown as Formatter);

// Time
registerFormatter('duration', duration as unknown as Formatter);
registerFormatter('relative-time', relativeTime as unknown as Formatter);
registerFormatter('time-ago', relativeTime as unknown as Formatter); // alias for migration from Angular

// String / display
registerFormatter('trim-zeros', trimZeros as unknown as Formatter);
registerFormatter('shrug', shrug as unknown as Formatter);
registerFormatter('cut-middle', cutMiddle as unknown as Formatter);

// Re-exports — convenience for callers who want the functions directly.
export {
  applyFormatter,
  applyPipe,
  getFormatter,
  listFormatters,
  parsePipe,
  registerFormatter,
  resetRegistry,
} from './registry.js';
export type { Formatter } from './registry.js';

export {
  getFormatterContext,
  replaceFormatterContext,
  resetFormatterContext,
  setFormatterContext,
} from './context.js';

export { bytes } from './bytes.js';
export { hashrate } from './hashrate.js';
export { duration } from './duration.js';
export { relativeTime } from './relative-time.js';
export { trimZeros } from './trim-zeros.js';
export { shrug } from './shrug.js';
export { effortColour } from './effort-colour.js';
export { symbol } from './symbol.js';
export { toCoin } from './to-coin.js';
export { difficulty } from './difficulty.js';
export { cutMiddle } from './cut-middle.js';

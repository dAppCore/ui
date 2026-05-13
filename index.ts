// SPDX-Licence-Identifier: EUPL-1.2

/**
 * @dappcore/ui — root entry.
 *
 * Importing the root re-exports every component, structural element,
 * formatter, and the registry API. For tree-shaking, prefer
 * sub-imports: `@dappcore/ui/formatters`, `@dappcore/ui/table`,
 * `@dappcore/ui/structural`.
 *
 * Usage example:
 *
 *   import '@dappcore/ui';  // side-effects: registers built-in formatters
 *
 *   import { applyPipe } from '@dappcore/ui/formatters';
 *   applyPipe('bytes', 1500); // → "1.5 kB"
 */

export * from './src/formatters/index.js';
export * from './src/crypto/index.js';
export * from './src/forms/index.js';

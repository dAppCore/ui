// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `symbol` formatter — append the mining-pool currency symbol.
 *
 * Converted from the Angular SymbolPipe (DEC 2021). Reads the symbol
 * from the `mining` formatter context (defaulting to empty string when
 * the context isn't set). A pipe arg overrides per-call.
 *
 * Usage example:
 *
 *   setFormatterContext('mining', { symbol: 'LTHN' });
 *   symbol(42)            → "42 LTHN"
 *   symbol(42, 'BTC')     → "42 BTC"
 */

import { getFormatterContext } from './context.js';

export function symbol(value: unknown, override: string = ''): string {
  const sym = override || (getFormatterContext<string>('mining', 'symbol') ?? '');
  if (value === null || value === undefined) return sym.trim();
  return sym ? `${value} ${sym}` : String(value);
}

// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `to-coin` formatter — convert atomic units to coin units via the
 * configured divisor.
 *
 * Converted from the Angular ToCoinPipe (DEC 2021). Reads
 * `coin_divisor` from the `mining` formatter context; output precision
 * matches the divisor's order of magnitude (12-digit divisor → 12
 * decimal places, mirroring the original Angular behaviour).
 *
 * Pass a divisor as arg to override per-call.
 *
 * Usage example:
 *
 *   setFormatterContext('mining', { coin_divisor: 1e12 });
 *   toCoin(1_000_000_000_000)              → "1.000000000000"
 *   toCoin(500_000_000_000)                → "0.500000000000"
 *   toCoin(100_000_000, '100000000')       → "1.00000000"    (BTC-style, override)
 */

import { getFormatterContext } from './context.js';

export function toCoin(value: unknown, divisorOverride: string = ''): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';

  const ctxDivisor = getFormatterContext<number>('mining', 'coin_divisor');
  const divisor = divisorOverride ? Number(divisorOverride) : (ctxDivisor ?? 1);
  if (!Number.isFinite(divisor) || divisor === 0) return String(n);

  const precision = Math.max(0, String(Math.floor(Math.abs(divisor))).length - 1);
  return (n / divisor).toFixed(precision);
}

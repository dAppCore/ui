// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `difficulty` formatter — block-network difficulty into a hashrate
 * estimate.
 *
 * Converted from the Angular DiffPipe + DifficultyToHashRatePipe pair
 * (DEC 2021). Both pipes essentially divided difficulty by the coin's
 * configured block time; one of them additionally multiplied by 32 when
 * the pool ran in `graph` mode. Folded into a single formatter with
 * argument-driven modes.
 *
 * Reads `coin_block_time` (seconds) and `graph` (boolean) from the
 * `mining` formatter context.
 *
 * Modes:
 *   - default — return formatted hashrate string (`"4.50 GH/s"`)
 *   - `raw`   — return numeric hashrate (no unit string)
 *
 * Usage example:
 *
 *   setFormatterContext('mining', { coin_block_time: 120 });
 *   difficulty(540_000_000_000)       → "4.50 GH/s"
 *   difficulty(540_000_000_000, 'raw') → 4_500_000_000
 */

import { getFormatterContext } from './context.js';
import { hashrate } from './hashrate.js';

export function difficulty(value: unknown, mode: string = ''): string | number {
  const n = Number(value);
  if (!Number.isFinite(n)) return mode === 'raw' ? 0 : '0.00 H/s';

  const blockTime = getFormatterContext<number>('mining', 'coin_block_time') ?? 0;
  if (blockTime <= 0) return mode === 'raw' ? 0 : '0.00 H/s';

  const graph = Boolean(getFormatterContext<boolean>('mining', 'graph'));
  const rate = graph ? (n * 32) / blockTime : n / blockTime;

  if (mode === 'raw') return rate;
  return hashrate(rate);
}

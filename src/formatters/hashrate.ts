// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `hashrate` formatter — pool/network hashing speed in scientific-prefix
 * units (H/s, KH/s, MH/s, GH/s, TH/s, PH/s, EH/s, ZH/s).
 *
 * Converted from the Angular HashRatePipe (DEC 2021 vintage). The
 * `decorator` flag controls whether the unit suffix is appended; the
 * `graph` context flag switches the suffix from H/s to GH/s when the
 * upstream pool emits graph-mode statistics.
 *
 * Usage example:
 *
 *   hashrate(1500)               → "1.50 KH/s"
 *   hashrate(1_500_000)          → "1.50 MH/s"
 *   hashrate(1_500_000, 'plain') → "1.50"
 *
 * With mining context graph=true:
 *
 *   setFormatterContext('mining', { graph: true });
 *   hashrate(1500) → "1.50 KGH/s"
 */

import { getFormatterContext } from './context.js';

const UNITS = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'];

export function hashrate(value: unknown, mode: string = ''): string {
  let n = Number(value);
  if (!Number.isFinite(n)) n = 0;

  let i = 0;
  while (Math.abs(n) >= 1000 && i < UNITS.length - 1) {
    n /= 1000;
    i++;
  }

  const formatted = n.toFixed(2);
  if (mode === 'plain') return formatted;

  const graph = Boolean(getFormatterContext<boolean>('mining', 'graph'));
  const baseUnit = graph ? 'GH/s' : 'H/s';
  return `${formatted} ${UNITS[i]}${baseUnit}`;
}

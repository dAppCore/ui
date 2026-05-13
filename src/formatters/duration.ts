// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `duration` formatter — milliseconds to "1y 2w 3d 4h 5m 6s".
 *
 * Converted from the Angular DurationPipe (DEC 2021), rewritten with a
 * subtract-as-you-go algorithm because the original modulo-based pattern
 * lost fidelity at unit boundaries. Emits compact "{n}{unit}" segments
 * joined by spaces, skipping zero units.
 *
 * Input is milliseconds by default; pass `seconds` mode to interpret
 * the input as seconds. Year unit is the astronomical year
 * (31,556,926 seconds) to match the original Angular behaviour.
 *
 * Usage example:
 *
 *   duration(90_000)         → "1m 30s"
 *   duration(3_600_000)      → "1h"
 *   duration(31_556_926_000) → "1y"
 *   duration(90, 'seconds')  → "1m 30s"
 */

const UNITS: Array<[string, number]> = [
  ['y', 31_556_926_000],
  ['w', 604_800_000],
  ['d', 86_400_000],
  ['h', 3_600_000],
  ['m', 60_000],
  ['s', 1_000],
];

export function duration(value: unknown, mode: string = ''): string {
  if (value === null || value === undefined) return '';
  let ms = Number(value);
  if (!Number.isFinite(ms) || ms < 0) return '';
  if (mode === 'seconds') ms *= 1000;

  let remaining = Math.floor(ms);
  const out: string[] = [];
  for (const [unit, size] of UNITS) {
    const n = Math.floor(remaining / size);
    if (n > 0) {
      out.push(`${n}${unit}`);
      remaining -= n * size;
    }
  }
  return out.join(' ');
}

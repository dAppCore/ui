// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `trim-zeros` formatter — strip trailing zeros from a decimal string.
 *
 * Converted from the Angular RemoveTrailingZerosPipe (DEC 2021).
 *
 * Usage example:
 *
 *   trimZeros("1.2500")   → "1.25"
 *   trimZeros("1.0000")   → "1"
 *   trimZeros("1.000001") → "1.000001"
 *   trimZeros("42")       → "42"
 */

export function trimZeros(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (s.indexOf('.') === -1) return s;
  while ((s.endsWith('0') || s.endsWith('.')) && s.indexOf('.') !== -1) {
    s = s.slice(0, -1);
  }
  return s;
}

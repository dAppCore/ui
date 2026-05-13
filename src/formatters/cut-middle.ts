// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `cut-middle` formatter — shorten long strings by replacing the middle
 * with an ellipsis, keeping the first and last characters visible.
 *
 * Extracted from the Angular HashLinkPipe (DEC 2021), where it was the
 * core display logic for blockchain hashes and addresses. Generalised
 * here so any long opaque string (transaction id, IPFS hash, key
 * fingerprint, UUID) can use the same shape.
 *
 * Usage example:
 *
 *   cutMiddle("0x1234567890abcdef1234567890abcdef", "8")
 *     → "0x12...cdef"
 *   cutMiddle("snider.lthn", "20")
 *     → "snider.lthn"   (string shorter than max — unchanged)
 *   cutMiddle("a-very-long-thing", "5", "***")
 *     → "a-***ng"       (custom separator)
 */

const DEFAULT_MAX = 12;
const DEFAULT_SEP = '...';

export function cutMiddle(value: unknown, maxArg: string = '', sepArg: string = ''): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (!s) return s;

  const max = maxArg ? Number(maxArg) : DEFAULT_MAX;
  if (!Number.isFinite(max) || max < 1) return s;

  const sep = sepArg || DEFAULT_SEP;
  if (s.length <= max) return s;
  if (max === 1) return s.charAt(0) + sep;

  const midpoint = Math.ceil(s.length / 2);
  const toRemove = s.length - max;
  const lstrip = Math.ceil(toRemove / 2);
  const rstrip = toRemove - lstrip;
  return s.slice(0, midpoint - lstrip) + sep + s.slice(midpoint + rstrip);
}

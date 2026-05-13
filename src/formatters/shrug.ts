// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `shrug` formatter — replaces null/empty values with a shrug emoticon.
 *
 * Converted from the Angular ShruggiePipe (DEC 2021). Two canonical
 * use cases:
 *
 *   1. **Genuinely empty / unknown cell** — preferable to a sterile
 *      dash when the underlying value is honestly "we don't know yet".
 *   2. **Text-load failure fallback** — when a label, i18n key, or
 *      remotely-fetched copy fails to resolve, shrug is the
 *      it-broke-and-we-noticed signal instead of an empty space.
 *
 * Use sparingly — most empty states deserve specific copy. This is the
 * default when there's nothing better to say or the system itself
 * doesn't know what's wrong.
 *
 * Usage example:
 *
 *   shrug(null)      → "¯\\_(ツ)_/¯"
 *   shrug("")        → "¯\\_(ツ)_/¯"
 *   shrug("hello")   → "hello"
 *   shrug(0)         → "0"   (zero is NOT empty)
 */

const SHRUG = '¯\\_(ツ)_/¯';

export function shrug(value: unknown): string {
  if (value === null || value === undefined || value === '') return SHRUG;
  return String(value);
}

// SPDX-Licence-Identifier: EUPL-1.2

/**
 * QuasiSalt — deterministic salt derivation by reverse + leet-swap.
 *
 * The original algorithm (Snider, 2018 → dappserver Deno port, 2020):
 *
 *   1. Reverse the input string character-by-character.
 *   2. Walk the reversed string and substitute each character via the
 *      keymap (leet-speak swap: o↔0, l↔1, e↔3, a↔4, s→z, t↔7).
 *   3. Return the resulting string as the "salt".
 *
 * The output is fully determined by the input — same input always
 * yields the same salt. That is the "quasi" in QuasiSalt: not
 * cryptographically random, but content-derived and reproducible
 * across machines, languages, and time. The whole point.
 *
 * Used as the salt portion of {@link lthnHash}.
 *
 * Usage example:
 *
 *   createSalt("snider")        → "r3dniz"
 *   createSalt("hello")         → "0113h"
 *   createSalt("")              → ""
 */

/**
 * The canonical key-map used by lthnHash and the dappcore polyglot
 * QuasiSalt mirrors (Go, PHP, TS). Bidirectional swaps are listed
 * twice (`o→0` and `0→o`) so the function is its own inverse on the
 * intersection of letters and digits where that makes sense.
 */
export const QUASI_SALT_KEYMAP: Readonly<Record<string, string>> = Object.freeze({
  o: '0',
  l: '1',
  e: '3',
  a: '4',
  s: 'z',
  t: '7',
  '0': 'o',
  '1': 'l',
  '3': 'e',
  '4': 'a',
  '7': 't',
});

export interface QuasiSaltOptions {
  /** Override the key-map. When omitted, {@link QUASI_SALT_KEYMAP} is used. */
  keymap?: Record<string, string>;
}

/**
 * Build the QuasiSalt for an input string. Returns the empty string
 * when the input is empty.
 */
export function createSalt(input: string, opts: QuasiSaltOptions = {}): string {
  if (!input) return '';
  const keymap = opts.keymap ?? QUASI_SALT_KEYMAP;
  const out: string[] = [];
  for (let i = input.length - 1; i >= 0; i--) {
    const ch = input.charAt(i);
    const mapped = keymap[ch];
    out.push(mapped !== undefined ? mapped : ch);
  }
  return out.join('');
}

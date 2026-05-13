// SPDX-Licence-Identifier: EUPL-1.2

/**
 * lthnHash — content-addressing primitive for the dappco.re stack.
 *
 * The algorithm:
 *
 *   lthnHash(input) = SHA-256( input + QuasiSalt(input) )
 *
 * where QuasiSalt reverses the input and leet-swaps each character
 * via the canonical keymap (see {@link createSalt}). Output is the
 * lowercase hex representation of the 32-byte SHA-256 digest, 64
 * characters long.
 *
 * The hash is **deterministic** — same input always yields the same
 * digest. That's the whole point: content-addressing across machines,
 * languages, and time. The Go, PHP, and TypeScript sides of the
 * dappco.re stack all implement the same algorithm against the same
 * keymap, so a value hashed in one language is verifiable in another.
 *
 * Browser caveat: this function is async because `crypto.subtle.digest`
 * is async in the browser. The original Deno implementation was
 * synchronous via `digestSync`. The output is byte-identical regardless.
 *
 * Usage example:
 *
 *   const h = await lthnHash("snider");
 *   // h is a 64-char hex string, e.g. "a3b2..."
 *
 *   await verify("snider", h);  // → true
 */

import { createSalt, type QuasiSaltOptions } from './quasi-salt.js';

export interface LthnHashOptions extends QuasiSaltOptions {}

/**
 * Compute the lthnHash of an input string. Returns the hex-encoded
 * SHA-256 digest of `input + quasiSalt(input)`.
 */
export async function lthnHash(input: string, opts: LthnHashOptions = {}): Promise<string> {
  const salt = createSalt(input ?? '', opts);
  const payload = (input ?? '') + salt;
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(new Uint8Array(digest));
}

/**
 * Verify that a hash matches the lthnHash of an input string.
 * Convenience wrapper around `lthnHash(input) === expected`.
 */
export async function verify(input: string, expected: string, opts: LthnHashOptions = {}): Promise<boolean> {
  if (!expected) return false;
  const computed = await lthnHash(input, opts);
  return constantTimeEqual(computed, expected.toLowerCase());
}

function toHex(bytes: Uint8Array): string {
  const out: string[] = [];
  for (const b of bytes) out.push(b.toString(16).padStart(2, '0'));
  return out.join('');
}

/**
 * Constant-time string comparison. Always walks both strings to the end
 * regardless of mismatch position. Mitigates timing-side-channel leaks
 * when verifying hashes. Both inputs are coerced to strings; differing
 * lengths return false but still iterate the longer string.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= ca ^ cb;
  }
  return mismatch === 0;
}

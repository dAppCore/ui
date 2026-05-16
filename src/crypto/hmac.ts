// SPDX-Licence-Identifier: EUPL-1.2

/**
 * HMAC primitives for the dappco.re polyglot stack.
 *
 * Uses the browser-native `crypto.subtle` API. Output is byte-identical
 * to Go's `crypto/hmac` with the same algorithm and key bytes — the
 * server side of any HMAC contract can be written in `dappco.re/go/crypt`
 * and verify what the browser computed (or vice versa).
 *
 * Default algorithm is SHA-256; pass `SHA-384` or `SHA-512` for longer
 * tags when the use case warrants it. SHA-256 is what every modern
 * protocol picks unless they specifically need longer.
 *
 * Usage example:
 *
 *   import { importHmacKey, hmacSha256, hmacVerify } from '@dappcore/ui/crypto';
 *
 *   const key = await importHmacKey('shared-secret-bytes');
 *   const tag = await hmacSha256(key, 'message');
 *   const ok  = await hmacVerify(key, 'message', tag);  // → true
 */

export type HmacAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

/**
 * Import raw key material as a non-extractable HMAC CryptoKey.
 *
 * Accepts:
 *   - `ArrayBuffer` / `Uint8Array` — raw bytes (preferred)
 *   - `string` — UTF-8 encoded, then imported (convenience for shared
 *     secrets stored as strings)
 *
 * The resulting key is non-extractable — the JS heap never sees the
 * raw key bytes again. Pass the imported key around your app instead
 * of the raw secret.
 */
export async function importHmacKey(
  secret: ArrayBuffer | Uint8Array | string,
  algorithm: HmacAlgorithm = 'SHA-256',
): Promise<CryptoKey> {
  const raw =
    typeof secret === 'string'
      ? new TextEncoder().encode(secret)
      : secret instanceof Uint8Array
        ? secret
        : new Uint8Array(secret);
  return crypto.subtle.importKey(
    'raw',
    raw as BufferSource,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign', 'verify'],
  );
}

/**
 * Compute HMAC-SHA256 of a string message under a CryptoKey or raw
 * secret. Returns lowercase hex (64 chars for SHA-256, 96 for SHA-384,
 * 128 for SHA-512).
 */
export async function hmacSha256(
  key: CryptoKey | string | Uint8Array | ArrayBuffer,
  message: string,
): Promise<string> {
  const cryptoKey = key instanceof CryptoKey ? key : await importHmacKey(key, 'SHA-256');
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return toHex(new Uint8Array(sig));
}

/**
 * Verify a hex-encoded HMAC tag matches the message under the key.
 * Constant-time comparison.
 */
export async function hmacVerify(
  key: CryptoKey | string | Uint8Array | ArrayBuffer,
  message: string,
  expected: string,
): Promise<boolean> {
  if (!expected) return false;
  const computed = await hmacSha256(key, message);
  return constantTimeEqual(computed, expected.toLowerCase());
}

function toHex(bytes: Uint8Array): string {
  const out: string[] = [];
  for (const b of bytes) out.push(b.toString(16).padStart(2, '0'));
  return out.join('');
}

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

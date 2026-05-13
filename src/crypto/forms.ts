// SPDX-Licence-Identifier: EUPL-1.2

/**
 * Form data canonicalisation + HMAC signing.
 *
 * The signing function builds a deterministic string from a `FormData`
 * instance, optionally appends a timestamp and/or nonce, and computes
 * an HMAC tag over the result. The verifier on the other side
 * (typically a server in Go or PHP) mirrors the same algorithm bit-for-
 * bit. The canonical-serialisation spec is the cross-language contract;
 * any drift breaks signatures.
 *
 * ## Canonical serialisation spec
 *
 *   1. Take every (key, value) pair from FormData. File values are
 *      skipped — files are signed separately by hashing their bytes,
 *      out of scope here.
 *   2. Skip keys listed in `exclude` (always: `__hmac`, `__ts`,
 *      `__nonce` when those slots are reserved by this layer).
 *   3. Stable-sort the pairs by `(key, value)` lexicographically.
 *   4. URL-encode each key and value individually via
 *      `encodeURIComponent`. (RFC 3986 percent-encoding.)
 *   5. Join pairs with `&` and separate key/value with `=`.
 *   6. If `timestamp` is set, append `&__ts=<ms>` to the message.
 *   7. If `nonce` is set, append `&__nonce=<urlencoded>` to the message.
 *   8. HMAC-SHA256 the resulting string under the provided key; return
 *      lowercase hex.
 *
 * The server-side verifier extracts `__hmac`, `__ts`, `__nonce` from
 * the incoming form, then reconstructs the same canonical string
 * (excluding those three keys), appends `&__ts=…&__nonce=…` matching
 * what the client sent, and HMACs with the same key. Constant-time
 * compare to the received `__hmac`.
 *
 * Usage example:
 *
 *   const data = new FormData(form);
 *   const ts = Date.now();
 *   const nonce = uuidv7();
 *   const tag = await signFormData(key, data, { timestamp: ts, nonce });
 *   data.set('__ts', String(ts));
 *   data.set('__nonce', nonce);
 *   data.set('__hmac', tag);
 *   // submit data...
 */

import { hmacSha256 } from './hmac.js';

/** Canonical "control" keys reserved for the signing protocol. Excluded by default. */
export const RESERVED_KEYS = Object.freeze(['__hmac', '__ts', '__nonce', '__honey']);

export interface CanonicaliseOptions {
  /** Additional field names to exclude from the signed payload. */
  exclude?: ReadonlyArray<string>;
}

/**
 * Build the canonical signing string from a FormData instance.
 * Deterministic given the same inputs and exclude list. See the module
 * doc-comment for the full spec.
 */
export function canonicaliseFormData(data: FormData, opts: CanonicaliseOptions = {}): string {
  const exclude = new Set<string>([...RESERVED_KEYS, ...(opts.exclude ?? [])]);
  const pairs: Array<[string, string]> = [];
  data.forEach((value, key) => {
    if (exclude.has(key)) return;
    if (typeof value !== 'string') return; // skip File/Blob values
    pairs.push([key, value]);
  });
  pairs.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
  });
  return pairs
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export interface SignOptions extends CanonicaliseOptions {
  /** Append `&__ts=<ms>` to the signing payload. Pass a number explicitly or true to use Date.now(). */
  timestamp?: number | boolean;
  /** Append `&__nonce=<value>` to the signing payload. Caller picks the nonce (UUIDv7 is the natural fit). */
  nonce?: string;
}

/**
 * Sign FormData with HMAC-SHA256. Returns the lowercase hex tag.
 *
 * The caller is responsible for adding `__ts` / `__nonce` / `__hmac`
 * to the FormData before submission — this function only computes the
 * tag. The split is intentional: callers may want to send the tag as a
 * header instead of a hidden field.
 */
export async function signFormData(
  key: CryptoKey | string | Uint8Array | ArrayBuffer,
  data: FormData,
  opts: SignOptions = {},
): Promise<string> {
  let message = canonicaliseFormData(data, { exclude: opts.exclude });
  if (opts.timestamp !== undefined && opts.timestamp !== false) {
    const ts = typeof opts.timestamp === 'number' ? opts.timestamp : Date.now();
    message += (message ? '&' : '') + `__ts=${ts}`;
  }
  if (opts.nonce) {
    message += (message ? '&' : '') + `__nonce=${encodeURIComponent(opts.nonce)}`;
  }
  return hmacSha256(key, message);
}

export interface VerifyOptions extends SignOptions {
  /** Reject signatures whose `__ts` is more than this many ms in the past. */
  maxAgeMs?: number;
  /** Reject signatures whose `__ts` is more than this many ms in the future (clock-skew bound). */
  maxSkewMs?: number;
  /** Set of nonces already consumed. If the FormData carries `__nonce` that's in here, reject. */
  consumedNonces?: Set<string>;
  /** Compare against (defaults to `Date.now()`). */
  now?: number;
}

/**
 * Verify an HMAC tag against FormData. Pulls `__ts` / `__nonce` from
 * the FormData if present and threads them into the signing payload
 * reconstruction. Optionally enforces freshness and nonce-replay rules.
 *
 * Returns true when:
 *   - the tag matches the recomputed signature, AND
 *   - `__ts` is within `[now - maxAgeMs, now + maxSkewMs]` (if set), AND
 *   - `__nonce` is not in `consumedNonces` (if provided).
 *
 * On true, the caller should add the nonce to its consumed set.
 */
export async function verifyFormData(
  key: CryptoKey | string | Uint8Array | ArrayBuffer,
  data: FormData,
  expected: string,
  opts: VerifyOptions = {},
): Promise<boolean> {
  if (!expected) return false;

  const tsField = data.get('__ts');
  const nonceField = data.get('__nonce');
  const ts = typeof tsField === 'string' && tsField ? Number(tsField) : undefined;
  const nonce = typeof nonceField === 'string' && nonceField ? nonceField : undefined;

  if (opts.maxAgeMs !== undefined && ts !== undefined) {
    const now = opts.now ?? Date.now();
    if (now - ts > opts.maxAgeMs) return false;
  }
  if (opts.maxSkewMs !== undefined && ts !== undefined) {
    const now = opts.now ?? Date.now();
    if (ts - now > opts.maxSkewMs) return false;
  }
  if (opts.consumedNonces && nonce && opts.consumedNonces.has(nonce)) return false;

  const computed = await signFormData(key, data, {
    exclude: opts.exclude,
    timestamp: ts,
    nonce,
  });
  return constantTimeEqual(computed, expected.toLowerCase());
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

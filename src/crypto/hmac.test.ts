// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { hmacSha256, hmacVerify, importHmacKey } from './hmac.js';

// Reference vectors — computed via Node's `crypto.createHmac('sha256', key)`
// against the same algorithm Web Crypto uses. Any drift here = the
// polyglot contract has broken (Go's crypto/hmac would also drift).
const KEY = 'shared-secret-bytes';
const VECTORS: ReadonlyArray<readonly [string, string]> = [
  ['', '63a9c8a0c8912f8b2ebe77ceab2b871b5456211e74810c57421202e1205662cc'],
  ['message', '9582fc49d27000722dc06a0fda4d39416389aa840b8959fa46c49858d7344774'],
  ['snider', '296717695671dad40ca704a67f8c6c3d5a164e2a9798d055cfd6b56eb9d85dd9'],
  ['hello world', '550abdfa510f361d37839e00beccc27f996921265a1ac9ec0f46ea2bb02b5005'],
];

describe('hmacSha256_Good', () => {
  for (const [msg, expected] of VECTORS) {
    it(`matches reference vector for ${JSON.stringify(msg)}`, async () => {
      expect(await hmacSha256(KEY, msg)).toBe(expected);
    });
  }

  it('accepts a pre-imported CryptoKey', async () => {
    const key = await importHmacKey(KEY);
    expect(await hmacSha256(key, 'message')).toBe(
      '9582fc49d27000722dc06a0fda4d39416389aa840b8959fa46c49858d7344774',
    );
  });

  it('accepts a raw Uint8Array secret', async () => {
    const raw = new TextEncoder().encode(KEY);
    expect(await hmacSha256(raw, 'message')).toBe(
      '9582fc49d27000722dc06a0fda4d39416389aa840b8959fa46c49858d7344774',
    );
  });

  it('returns 64-char lowercase hex (SHA-256 output)', async () => {
    const tag = await hmacSha256(KEY, 'anything');
    expect(tag).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('hmacSha256_Ugly', () => {
  it('is deterministic (same key + message → same tag)', async () => {
    const a = await hmacSha256(KEY, 'determinism-check');
    const b = await hmacSha256(KEY, 'determinism-check');
    expect(a).toBe(b);
  });

  it('different keys produce different tags', async () => {
    const a = await hmacSha256('key-a', 'message');
    const b = await hmacSha256('key-b', 'message');
    expect(a).not.toBe(b);
  });
});

describe('hmacVerify_Good', () => {
  it('returns true for a valid tag', async () => {
    const tag = await hmacSha256(KEY, 'message');
    expect(await hmacVerify(KEY, 'message', tag)).toBe(true);
  });

  it('accepts uppercase hex (canonicalises before compare)', async () => {
    const tag = (await hmacSha256(KEY, 'message')).toUpperCase();
    expect(await hmacVerify(KEY, 'message', tag)).toBe(true);
  });
});

describe('hmacVerify_Bad', () => {
  it('returns false for a mismatched tag', async () => {
    expect(await hmacVerify(KEY, 'message', 'deadbeef'.repeat(8))).toBe(false);
  });

  it('returns false for an empty expected tag', async () => {
    expect(await hmacVerify(KEY, 'message', '')).toBe(false);
  });

  it('returns false when the message differs', async () => {
    const tag = await hmacSha256(KEY, 'message');
    expect(await hmacVerify(KEY, 'Message', tag)).toBe(false);
  });

  it('returns false when the key differs', async () => {
    const tag = await hmacSha256('key-a', 'message');
    expect(await hmacVerify('key-b', 'message', tag)).toBe(false);
  });
});

describe('importHmacKey_Good', () => {
  it('produces a non-extractable CryptoKey', async () => {
    const key = await importHmacKey('secret');
    expect(key.extractable).toBe(false);
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('HMAC');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { lthnHash, verify } from './lthn-hash.js';

// Canonical reference vectors — computed via Node crypto against the
// dappserver QuasiSaltService algorithm. Any change here means the
// polyglot contract has drifted and the Go/PHP sides need a matching
// patch.
const VECTORS: ReadonlyArray<readonly [string, string]> = [
  ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  ['snider', '7ea57b4e1db571e97831a707405a40308e2ca3e3d82b9ff54ce170b9ff8d8eab'],
  ['hello', 'ed74c318a778cd7f517d8f5c77d89f7a47cf824719ffd78d29ce5ec51d991e20'],
  ['lthn', '19777dc567ce0f27ae3f7b07efa55dec952431d535c188bd4d3b6ecc2f779bbe'],
  ['a', '4539e4b4889079c2a00afeae0bfc1439840ef2379a1fb81c8ba27361ad476d6b'],
  ['Lethean Desktop', '409c42ef15c4524c1bd0057c0009a125bba14247430f7b61e797539ab0ca88e0'],
];

describe('lthnHash_Good', () => {
  for (const [input, expected] of VECTORS) {
    it(`matches canonical vector for ${JSON.stringify(input)}`, async () => {
      expect(await lthnHash(input)).toBe(expected);
    });
  }

  it('is deterministic (same input → same hash)', async () => {
    const a = await lthnHash('determinism-check');
    const b = await lthnHash('determinism-check');
    expect(a).toBe(b);
  });

  it('outputs 64-character lowercase hex', async () => {
    const h = await lthnHash('format-check');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('lthnHash_Bad', () => {
  it('treats null as empty string', async () => {
    const h = await lthnHash(null as unknown as string);
    expect(h).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('treats undefined as empty string', async () => {
    const h = await lthnHash(undefined as unknown as string);
    expect(h).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

describe('lthnHash_Ugly', () => {
  it('handles Unicode input bytes correctly', async () => {
    const h = await lthnHash('héllo 🌟');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('custom keymap produces a different hash', async () => {
    const a = await lthnHash('snider');
    const b = await lthnHash('snider', { keymap: { s: 'X' } });
    expect(a).not.toBe(b);
  });
});

describe('verify_Good', () => {
  it('returns true for a correct hash', async () => {
    const h = await lthnHash('snider');
    expect(await verify('snider', h)).toBe(true);
  });

  it('accepts uppercase hex input (canonicalises before compare)', async () => {
    const h = (await lthnHash('snider')).toUpperCase();
    expect(await verify('snider', h)).toBe(true);
  });
});

describe('verify_Bad', () => {
  it('returns false for a mismatched hash', async () => {
    expect(await verify('snider', 'deadbeef'.repeat(8))).toBe(false);
  });

  it('returns false for an empty expected hash', async () => {
    expect(await verify('snider', '')).toBe(false);
  });

  it('returns false when input differs from the hash', async () => {
    const h = await lthnHash('snider');
    expect(await verify('Snider', h)).toBe(false); // case-sensitive — capital S
  });
});

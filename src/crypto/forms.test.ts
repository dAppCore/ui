// SPDX-Licence-Identifier: EUPL-1.2
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canonicaliseFormData,
  RESERVED_KEYS,
  signFormData,
  verifyFormData,
} from './forms.js';

function fd(pairs: Array<[string, string]>): FormData {
  const f = new FormData();
  for (const [k, v] of pairs) f.append(k, v);
  return f;
}

describe('canonicaliseFormData_Good', () => {
  it('sorts keys lexically', () => {
    const out = canonicaliseFormData(fd([['b', '2'], ['a', '1']]));
    expect(out).toBe('a=1&b=2');
  });

  it('URL-encodes keys and values', () => {
    const out = canonicaliseFormData(fd([['user name', 'Snider & Co']]));
    expect(out).toBe('user%20name=Snider%20%26%20Co');
  });

  it('skips reserved control keys by default', () => {
    const out = canonicaliseFormData(
      fd([
        ['name', 'snider'],
        ['__ts', '1700000000000'],
        ['__hmac', 'abc'],
        ['__nonce', 'xyz'],
        ['__honey', ''],
      ]),
    );
    expect(out).toBe('name=snider');
  });

  it('honours caller-supplied exclude list (additive to reserved)', () => {
    const out = canonicaliseFormData(
      fd([['name', 'snider'], ['secret', 's3cret']]),
      { exclude: ['secret'] },
    );
    expect(out).toBe('name=snider');
  });

  it('preserves multi-value fields (sorted by key+value)', () => {
    const out = canonicaliseFormData(
      fd([['tags', 'b'], ['tags', 'a'], ['tags', 'c']]),
    );
    expect(out).toBe('tags=a&tags=b&tags=c');
  });
});

describe('canonicaliseFormData_Bad', () => {
  it('returns empty string for empty FormData', () => {
    expect(canonicaliseFormData(new FormData())).toBe('');
  });

  it('skips File values (not text-signable here)', () => {
    const f = new FormData();
    f.append('name', 'snider');
    f.append('upload', new File(['hello'], 'hello.txt'));
    expect(canonicaliseFormData(f)).toBe('name=snider');
  });
});

describe('canonicaliseFormData_Ugly', () => {
  it('exports RESERVED_KEYS as a frozen list', () => {
    expect(Object.isFrozen(RESERVED_KEYS)).toBe(true);
    expect(RESERVED_KEYS).toContain('__hmac');
    expect(RESERVED_KEYS).toContain('__ts');
    expect(RESERVED_KEYS).toContain('__nonce');
    expect(RESERVED_KEYS).toContain('__honey');
  });
});

describe('signFormData_Good', () => {
  const KEY = 'shared-secret-bytes';

  it('signs a deterministic payload', async () => {
    const a = await signFormData(KEY, fd([['name', 'snider']]));
    const b = await signFormData(KEY, fd([['name', 'snider']]));
    expect(a).toBe(b);
  });

  it('appends a numeric timestamp when set', async () => {
    const a = await signFormData(KEY, fd([['name', 'snider']]), { timestamp: 1700000000000 });
    const b = await signFormData(KEY, fd([['name', 'snider']]));
    expect(a).not.toBe(b);
  });

  it('appends a nonce when set', async () => {
    const a = await signFormData(KEY, fd([['name', 'snider']]), { nonce: 'abc' });
    const b = await signFormData(KEY, fd([['name', 'snider']]), { nonce: 'xyz' });
    expect(a).not.toBe(b);
  });

  it('returns 64-char lowercase hex', async () => {
    const tag = await signFormData(KEY, fd([['name', 'snider']]));
    expect(tag).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('verifyFormData_Good', () => {
  const KEY = 'shared-secret-bytes';
  const NOW = 1700000000000;

  beforeEach(() => vi.useFakeTimers().setSystemTime(NOW));
  afterEach(() => vi.useRealTimers());

  it('verifies a tag the client just signed', async () => {
    const data = fd([['name', 'snider']]);
    const tag = await signFormData(KEY, data, { timestamp: NOW, nonce: 'abc' });
    data.set('__ts', String(NOW));
    data.set('__nonce', 'abc');
    expect(await verifyFormData(KEY, data, tag)).toBe(true);
  });

  it('rejects an expired timestamp under maxAgeMs', async () => {
    const data = fd([['name', 'snider']]);
    const TEN_MIN_AGO = NOW - 600_000;
    const tag = await signFormData(KEY, data, { timestamp: TEN_MIN_AGO });
    data.set('__ts', String(TEN_MIN_AGO));
    expect(await verifyFormData(KEY, data, tag, { maxAgeMs: 30_000 })).toBe(false);
  });

  it('accepts a fresh timestamp under maxAgeMs', async () => {
    const data = fd([['name', 'snider']]);
    const tag = await signFormData(KEY, data, { timestamp: NOW });
    data.set('__ts', String(NOW));
    expect(await verifyFormData(KEY, data, tag, { maxAgeMs: 30_000 })).toBe(true);
  });

  it('rejects a previously-consumed nonce', async () => {
    const data = fd([['name', 'snider']]);
    const tag = await signFormData(KEY, data, { nonce: 'replayed' });
    data.set('__nonce', 'replayed');
    const consumed = new Set(['replayed']);
    expect(await verifyFormData(KEY, data, tag, { consumedNonces: consumed })).toBe(false);
  });
});

describe('verifyFormData_Bad', () => {
  const KEY = 'shared-secret-bytes';

  it('rejects empty expected tag', async () => {
    expect(await verifyFormData(KEY, fd([['x', '1']]), '')).toBe(false);
  });

  it('rejects mismatched tag', async () => {
    expect(await verifyFormData(KEY, fd([['x', '1']]), 'deadbeef'.repeat(8))).toBe(false);
  });

  it('rejects when a field has been tampered with', async () => {
    const data = fd([['amount', '100']]);
    const tag = await signFormData(KEY, data);
    data.set('amount', '99999'); // tamper post-sign
    expect(await verifyFormData(KEY, data, tag)).toBe(false);
  });
});

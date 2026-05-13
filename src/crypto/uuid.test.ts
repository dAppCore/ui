// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { uuidv7, uuidv7At, uuidv7Timestamp } from './uuid.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidv7_Good', () => {
  it('emits a valid v7 string', () => {
    const u = uuidv7();
    expect(u).toMatch(UUID_PATTERN);
  });

  it('version nibble is 7', () => {
    const u = uuidv7();
    expect(u.charAt(14)).toBe('7');
  });

  it('variant nibble is 8/9/a/b', () => {
    const u = uuidv7();
    expect('89ab').toContain(u.charAt(19));
  });

  it('successive calls produce unique IDs', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(uuidv7());
    expect(seen.size).toBe(50);
  });
});

describe('uuidv7At_Good', () => {
  it('encodes a known timestamp at the prefix', () => {
    const u = uuidv7At(0x012345678abc);
    const tsHex = u.slice(0, 8) + u.slice(9, 13);
    expect(tsHex).toBe('012345678abc');
  });

  it('round-trips via uuidv7Timestamp', () => {
    const ts = new Date('2026-05-13T20:00:00Z').getTime();
    const u = uuidv7At(ts);
    expect(uuidv7Timestamp(u)).toBe(ts);
  });

  it('accepts a Date instance', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    const u = uuidv7At(d);
    expect(uuidv7Timestamp(u)).toBe(d.getTime());
  });

  it('emits lexically-sorted prefix for increasing timestamps', () => {
    const u1 = uuidv7At(1_000_000_000_000);
    const u2 = uuidv7At(2_000_000_000_000);
    const u3 = uuidv7At(3_000_000_000_000);
    expect([u1, u2, u3].sort()).toEqual([u1, u2, u3]);
  });
});

describe('uuidv7_Bad', () => {
  it('clamps negative timestamps to zero', () => {
    const u = uuidv7At(-1000);
    expect(u.slice(0, 13)).toBe('00000000-0000');
  });

  it('treats NaN as zero', () => {
    const u = uuidv7At(NaN);
    expect(u.slice(0, 13)).toBe('00000000-0000');
  });
});

describe('uuidv7Timestamp_Ugly', () => {
  it('returns 0 for non-v7 inputs', () => {
    expect(uuidv7Timestamp('not-a-uuid')).toBe(0);
    expect(uuidv7Timestamp('00000000-0000-4000-8000-000000000000')).toBe(0); // v4
  });

  it('accepts uppercase hex', () => {
    const u = uuidv7At(0x012345678abc).toUpperCase();
    expect(uuidv7Timestamp(u)).toBe(0x012345678abc);
  });
});

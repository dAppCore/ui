// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { createSalt, QUASI_SALT_KEYMAP } from './quasi-salt.js';

describe('createSalt_Good', () => {
  it('reverses + leet-swaps "snider" → "r3dinz"', () => {
    expect(createSalt('snider')).toBe('r3dinz');
  });

  it('reverses + leet-swaps "hello" → "0113h"', () => {
    expect(createSalt('hello')).toBe('0113h');
  });

  it('reverses + leet-swaps "lthn" → "nh71"', () => {
    expect(createSalt('lthn')).toBe('nh71');
  });

  it('reverses + leet-swaps "Lethean Desktop" preserving case + spaces', () => {
    expect(createSalt('Lethean Desktop')).toBe('p07kz3D n43h73L');
  });

  it('handles a single mapped character', () => {
    expect(createSalt('a')).toBe('4');
  });

  it('handles bidirectional digit→letter swap', () => {
    expect(createSalt('123')).toBe('e2l');
  });
});

describe('createSalt_Bad', () => {
  it('returns empty string for empty input', () => {
    expect(createSalt('')).toBe('');
  });
});

describe('createSalt_Ugly', () => {
  it('honours a custom keymap', () => {
    expect(createSalt('abc', { keymap: { a: 'X', b: 'Y', c: 'Z' } })).toBe('ZYX');
  });

  it('falls through unmapped characters', () => {
    expect(createSalt('xyz', { keymap: {} })).toBe('zyx');
  });

  it('exports a frozen canonical keymap', () => {
    expect(Object.isFrozen(QUASI_SALT_KEYMAP)).toBe(true);
  });

  // Note: createSalt iterates UTF-16 code units to match the original
  // Angular pipe behaviour. Surrogate pairs (most emoji) are split.
  // Polyglot byte-identity is therefore ASCII-only — Go iterates runes,
  // PHP iterates bytes, JS iterates code units. Don't hash emoji
  // expecting cross-language reproduction.
  it('iterates code units (UTF-16) for the polyglot contract', () => {
    const result = createSalt('a🌟');
    expect(result.length).toBe(3); // 1 emoji = 2 code units, reversed → 2 surrogates + "4"
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { shrug } from './shrug.js';

const SHRUG = '¯\\_(ツ)_/¯';

describe('shrug_Good', () => {
  it('passes through non-empty strings', () => {
    expect(shrug('hello')).toBe('hello');
  });

  it('shrugs null', () => {
    expect(shrug(null)).toBe(SHRUG);
  });

  it('shrugs undefined', () => {
    expect(shrug(undefined)).toBe(SHRUG);
  });

  it('shrugs empty string', () => {
    expect(shrug('')).toBe(SHRUG);
  });
});

describe('shrug_Ugly', () => {
  it('passes through zero (zero is not empty)', () => {
    expect(shrug(0)).toBe('0');
  });

  it('passes through false (false is not empty)', () => {
    expect(shrug(false)).toBe('false');
  });

  it('stringifies arrays and objects', () => {
    expect(shrug([1, 2])).toBe('1,2');
  });
});

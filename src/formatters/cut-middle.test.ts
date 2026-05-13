// SPDX-Licence-Identifier: EUPL-1.2
import { describe, expect, it } from 'vitest';
import { cutMiddle } from './cut-middle.js';

describe('cutMiddle_Good', () => {
  it('shortens long strings keeping head + tail', () => {
    const v = cutMiddle('0x1234567890abcdef1234567890abcdef', '8');
    expect(v).toMatch(/^0x\d+\.\.\.[a-f0-9]+$/);
    expect(v.length).toBeLessThanOrEqual(8 + '...'.length);
  });

  it('uses default max of 12 when arg omitted', () => {
    const v = cutMiddle('a-quite-long-identifier');
    expect(v.length).toBeLessThanOrEqual(12 + '...'.length);
  });

  it('honours custom separator', () => {
    expect(cutMiddle('a-very-long-thing', '5', '***')).toMatch(/\*\*\*/);
  });
});

describe('cutMiddle_Bad', () => {
  it('returns empty string for null/undefined', () => {
    expect(cutMiddle(null)).toBe('');
    expect(cutMiddle(undefined)).toBe('');
  });

  it('returns input unchanged when max is invalid', () => {
    expect(cutMiddle('hello', '0')).toBe('hello');
    expect(cutMiddle('hello', '-1')).toBe('hello');
    expect(cutMiddle('hello', 'nope')).toBe('hello');
  });
});

describe('cutMiddle_Ugly', () => {
  it('handles max=1 with ellipsis suffix', () => {
    expect(cutMiddle('snider.lthn', '1')).toBe('s...');
  });

  it('returns input unchanged when shorter than max', () => {
    expect(cutMiddle('hi', '20')).toBe('hi');
  });

  it('coerces non-string values via String()', () => {
    expect(cutMiddle(123456789012345, '8')).toMatch(/\.\.\./);
  });
});

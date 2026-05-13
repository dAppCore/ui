// SPDX-Licence-Identifier: EUPL-1.2
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyFormatter,
  applyPipe,
  getFormatter,
  listFormatters,
  parsePipe,
  registerFormatter,
  resetRegistry,
} from './registry.js';

describe('parsePipe_Good', () => {
  it('parses a single formatter with no args', () => {
    expect(parsePipe('bytes')).toEqual([{ name: 'bytes', args: [] }]);
  });

  it('parses a chain of formatters', () => {
    expect(parsePipe('sanitize | truncate:40 | nbsp')).toEqual([
      { name: 'sanitize', args: [] },
      { name: 'truncate', args: ['40'] },
      { name: 'nbsp', args: [] },
    ]);
  });

  it('strips whitespace around pipes and colons', () => {
    expect(parsePipe('  date :  relative  ')).toEqual([
      { name: 'date', args: ['relative'] },
    ]);
  });

  it('handles multiple positional args', () => {
    expect(parsePipe('truncate:40:…')).toEqual([
      { name: 'truncate', args: ['40', '…'] },
    ]);
  });
});

describe('parsePipe_Bad', () => {
  it('returns empty for empty string', () => {
    expect(parsePipe('')).toEqual([]);
  });

  it('returns empty for whitespace-only', () => {
    expect(parsePipe('   ')).toEqual([]);
  });

  it('drops empty segments between pipes', () => {
    expect(parsePipe('bytes ||  truncate')).toEqual([
      { name: 'bytes', args: [] },
      { name: 'truncate', args: [] },
    ]);
  });
});

describe('registerFormatter_Good', () => {
  beforeEach(() => resetRegistry());

  it('stores a formatter callable by name', () => {
    registerFormatter('upper', (v) => String(v).toUpperCase());
    expect(getFormatter('upper')?.('hello')).toBe('HELLO');
  });

  it('allows last-write-wins on re-registration', () => {
    registerFormatter('x', () => 'first');
    registerFormatter('x', () => 'second');
    expect(applyFormatter('x', 'ignored')).toBe('second');
  });

  it('lists registered names sorted', () => {
    registerFormatter('zebra', () => '');
    registerFormatter('apple', () => '');
    registerFormatter('mango', () => '');
    expect(listFormatters()).toEqual(['apple', 'mango', 'zebra']);
  });
});

describe('registerFormatter_Bad', () => {
  beforeEach(() => resetRegistry());

  it('rejects invalid names', () => {
    expect(() => registerFormatter('UPPER', () => '')).toThrow();
    expect(() => registerFormatter('1number', () => '')).toThrow();
    expect(() => registerFormatter('with space', () => '')).toThrow();
    expect(() => registerFormatter('', () => '')).toThrow();
  });
});

describe('applyPipe_Good', () => {
  beforeEach(() => {
    resetRegistry();
    registerFormatter('upper', (v) => String(v).toUpperCase());
    registerFormatter('truncate', (v, n) => String(v).slice(0, Number(n)));
    registerFormatter('echo', (v) => v);
  });

  it('applies a single formatter', () => {
    expect(applyPipe('upper', 'hello')).toBe('HELLO');
  });

  it('chains formatters left-to-right', () => {
    expect(applyPipe('upper | truncate:3', 'hello')).toBe('HEL');
  });

  it('passes args positionally', () => {
    expect(applyPipe('truncate:2', 'snider')).toBe('sn');
  });

  it('returns input unchanged for empty pipe', () => {
    expect(applyPipe('', 'unchanged')).toBe('unchanged');
  });
});

describe('applyPipe_Bad', () => {
  beforeEach(() => resetRegistry());

  it('throws for unknown formatter', () => {
    expect(() => applyPipe('nope', 'x')).toThrow(/unknown formatter "nope"/);
  });

  it('throws on the first unknown formatter in a chain', () => {
    registerFormatter('upper', (v) => String(v).toUpperCase());
    expect(() => applyPipe('upper | nope', 'x')).toThrow(/unknown formatter "nope"/);
  });
});

describe('applyPipe_Ugly', () => {
  beforeEach(() => resetRegistry());

  it('handles formatters that return non-string types', () => {
    registerFormatter('to-num', (v) => Number(v));
    registerFormatter('plus-one', (v) => (v as number) + 1);
    expect(applyPipe('to-num | plus-one', '41')).toBe(42);
  });

  it('handles null/undefined inputs without throwing', () => {
    registerFormatter('safe', (v) => v ?? 'fallback');
    expect(applyPipe('safe', null)).toBe('fallback');
    expect(applyPipe('safe', undefined)).toBe('fallback');
  });

  it('preserves Unicode in arguments', () => {
    registerFormatter('append', (v, suffix) => `${v}${suffix}`);
    expect(applyPipe('append:…', 'hello')).toBe('hello…');
    expect(applyPipe('append:🌟', 'star')).toBe('star🌟');
  });
});

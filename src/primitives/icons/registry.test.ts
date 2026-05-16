// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerIcon, getIcon, listIcons, unregisterIcon, type IconEntry,
} from './registry';

describe('icon registry', () => {
  beforeEach(() => {
    // Clean state — unregister any icons left by previous tests.
    for (const name of listIcons()) unregisterIcon(name);
  });

  it('registers and retrieves a string-form icon', () => {
    registerIcon('foo', '<svg viewBox="0 0 16 16"></svg>');
    const entry = getIcon('foo');
    expect(entry?.svg).toContain('viewBox="0 0 16 16"');
    expect(entry?.title).toBeUndefined();
  });

  it('registers and retrieves an IconEntry object', () => {
    const entry: IconEntry = { svg: '<svg></svg>', title: 'Bar' };
    registerIcon('bar', entry);
    expect(getIcon('bar')).toEqual(entry);
  });

  it('returns null for missing icons', () => {
    expect(getIcon('nonexistent')).toBeNull();
  });

  it('last write wins on overwrite', () => {
    registerIcon('foo', '<svg id="first"></svg>');
    registerIcon('foo', '<svg id="second"></svg>');
    expect(getIcon('foo')?.svg).toContain('id="second"');
  });

  it('listIcons returns all registered names', () => {
    registerIcon('a', '<svg></svg>');
    registerIcon('b', '<svg></svg>');
    const names = listIcons();
    expect(names).toContain('a');
    expect(names).toContain('b');
  });

  it('unregisterIcon removes an entry and returns true', () => {
    registerIcon('temp', '<svg></svg>');
    expect(unregisterIcon('temp')).toBe(true);
    expect(getIcon('temp')).toBeNull();
  });

  it('unregisterIcon returns false for missing names', () => {
    expect(unregisterIcon('never-registered')).toBe(false);
  });
});

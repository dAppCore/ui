// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { resolveCssVar, resolveColour } from './resolve';

describe('resolveCssVar', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--core-test', '#336699');
  });
  it('returns the computed value of a var on documentElement', () => {
    expect(resolveCssVar('--core-test')).toBe('#336699');
  });
  it('scopes to the passed element', () => {
    const el = document.createElement('div');
    el.style.setProperty('--core-test', '#aabbcc');
    document.body.appendChild(el);
    expect(resolveCssVar('--core-test', el)).toBe('#aabbcc');
  });
  it('returns empty string for missing var', () => {
    expect(resolveCssVar('--core-does-not-exist')).toBe('');
  });
});

describe('resolveColour', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--core-brand-500', 'oklch(0.54 0.16 305)');
  });
  it('parses the resolved string into a Colour', () => {
    const c = resolveColour('--core-brand-500');
    expect(c.h).toBeCloseTo(305);
  });
});

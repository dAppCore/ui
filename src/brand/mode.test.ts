// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { getMode } from './mode';

describe('getMode', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-mode');
    document.body.innerHTML = '';
  });
  it('returns null when nothing is set', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getMode(el)).toBeNull();
  });
  it('returns "light" or "dark" only', () => {
    document.documentElement.setAttribute('data-mode', 'light');
    expect(getMode()).toBe('light');
    document.documentElement.setAttribute('data-mode', 'dark');
    expect(getMode()).toBe('dark');
  });
  it('ignores unknown mode values', () => {
    document.documentElement.setAttribute('data-mode', 'high-contrast');
    expect(getMode()).toBeNull();
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { prefersReducedMotion, prefersColorScheme, prefersContrast } from './prefers';

describe('prefers-*', () => {
  it('reads prefers-reduced-motion (happy-dom: defaults to false)', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });
  it('reads prefers-color-scheme', () => {
    expect(['light', 'dark']).toContain(prefersColorScheme());
  });
  it('reads prefers-contrast', () => {
    expect(['no-preference', 'more', 'less']).toContain(prefersContrast());
  });
});

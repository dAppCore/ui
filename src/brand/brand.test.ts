// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { getBrand } from './brand';

describe('getBrand', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-brand');
    document.body.innerHTML = '';
  });
  it('returns null when no ancestor sets [data-brand]', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(getBrand(el)).toBeNull();
  });
  it('returns the nearest ancestor brand', () => {
    const root = document.createElement('section');
    root.setAttribute('data-brand', 'lethean');
    const child = document.createElement('div');
    root.appendChild(child);
    document.body.appendChild(root);
    expect(getBrand(child)).toBe('lethean');
  });
  it('accepts any string — brand-neutral by design', () => {
    document.documentElement.setAttribute('data-brand', 'future-brand');
    expect(getBrand()).toBe('future-brand');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect } from 'vitest';
import { generateId, setAriaLabel, linkLabelledBy } from './aria';

describe('generateId', () => {
  it('produces monotonic ids per prefix', () => {
    const a = generateId('core-test');
    const b = generateId('core-test');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^core-test-\d+$/);
  });
});

describe('setAriaLabel', () => {
  it('sets and removes', () => {
    const el = document.createElement('div');
    setAriaLabel(el, 'foo');
    expect(el.getAttribute('aria-label')).toBe('foo');
    setAriaLabel(el, null);
    expect(el.hasAttribute('aria-label')).toBe(false);
  });
});

describe('linkLabelledBy', () => {
  it('assigns a generated id to the label and references it from input', () => {
    const input = document.createElement('input');
    const label = document.createElement('label');
    linkLabelledBy(input, label);
    expect(label.id).toMatch(/^core-label-\d+$/);
    expect(input.getAttribute('aria-labelledby')).toBe(label.id);
  });
});

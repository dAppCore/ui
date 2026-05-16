// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import './label';

describe('<core-label>', () => {
  it('renders an inner <label> element with [part="base"]', async () => {
    const el = document.createElement('core-label');
    el.textContent = 'Email';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const inner = el.querySelector('label[part="base"]');
    expect(inner).not.toBeNull();
    expect(inner?.tagName).toBe('LABEL');
  });

  it('mirrors `for` attribute to inner <label>', async () => {
    const el = document.createElement('core-label');
    el.setAttribute('for', 'email');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const inner = el.querySelector('label[part="base"]') as HTMLLabelElement;
    expect(inner.htmlFor).toBe('email');
  });

  it('shows a required indicator when required is set', async () => {
    const el = document.createElement('core-label');
    el.setAttribute('required', '');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="required-indicator"]')).not.toBeNull();
  });

  it('does not show indicator when required is absent', async () => {
    const el = document.createElement('core-label');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('[part="required-indicator"]')).toBeNull();
  });

  it('reflects size attribute', async () => {
    const el = document.createElement('core-label');
    el.setAttribute('size', 'lg');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.getAttribute('size')).toBe('lg');
  });
});

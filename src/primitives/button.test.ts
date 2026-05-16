// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — semantics ported from
// core/ide/frontend/lit/src/elements/atoms/lethean-button.ts (2026-05-07).
import { describe, it, expect, vi } from 'vitest';
import './button';

describe('<core-button>', () => {
  it('renders an inner <button> in light DOM with [part="base"]', async () => {
    const el = document.createElement('core-button');
    el.textContent = 'Click me';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot).toBeNull();
    const inner = el.querySelector('button[part="base"]');
    expect(inner?.tagName).toBe('BUTTON');
  });

  it('reflects variant, size, disabled, type, loading', async () => {
    const el = document.createElement('core-button') as any;
    el.variant = 'primary';
    el.size = 'lg';
    el.disabled = true;
    el.type = 'submit';
    el.loading = true;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('primary');
    expect(el.getAttribute('size')).toBe('lg');
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.getAttribute('type')).toBe('submit');
    expect(el.hasAttribute('loading')).toBe(true);
  });

  it('passes disabled through to inner <button>', async () => {
    const el = document.createElement('core-button') as any;
    el.disabled = true;
    document.body.appendChild(el);
    await el.updateComplete;
    const inner = el.querySelector('button') as HTMLButtonElement;
    expect(inner.disabled).toBe(true);
  });

  it('renders a spinner part when loading', async () => {
    const el = document.createElement('core-button') as any;
    el.loading = true;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.querySelector('[part="spinner"]')).not.toBeNull();
    expect(el.getAttribute('aria-busy')).toBe('true');
  });

  it('submits parent form when type="submit" is clicked', async () => {
    const form = document.createElement('form');
    form.innerHTML = '<core-button type="submit">Save</core-button>';
    document.body.appendChild(form);
    const submitted = vi.fn((e: Event) => e.preventDefault());
    form.addEventListener('submit', submitted);
    const btn = form.querySelector('core-button') as HTMLElement;
    await (btn as any).updateComplete;
    btn.click();
    expect(submitted).toHaveBeenCalled();
  });

  it('does NOT submit when type="button"', async () => {
    const form = document.createElement('form');
    form.innerHTML = '<core-button type="button">Nope</core-button>';
    document.body.appendChild(form);
    const submitted = vi.fn();
    form.addEventListener('submit', submitted);
    const btn = form.querySelector('core-button') as HTMLElement;
    await (btn as any).updateComplete;
    btn.click();
    expect(submitted).not.toHaveBeenCalled();
  });

  it('does NOT submit when disabled, even with type="submit"', async () => {
    const form = document.createElement('form');
    form.innerHTML = '<core-button type="submit" disabled>Locked</core-button>';
    document.body.appendChild(form);
    const submitted = vi.fn();
    form.addEventListener('submit', submitted);
    const btn = form.querySelector('core-button') as HTMLElement;
    await (btn as any).updateComplete;
    btn.click();
    expect(submitted).not.toHaveBeenCalled();
  });

  it('does not synthesise requestSubmit when click bubbles from the inner <button>', async () => {
    const form = document.createElement('form');
    form.innerHTML = '<core-button type="submit">Save</core-button>';
    document.body.appendChild(form);
    const submitted = vi.fn((e: Event) => e.preventDefault());
    form.addEventListener('submit', submitted);
    const btn = form.querySelector('core-button') as any;
    await btn.updateComplete;

    // Simulate a bubbled click from the inner <button> (ev.target = inner).
    // The host's click handler should detect ev.target !== this and bail
    // out, leaving form submission to the browser's native algorithm.
    // happy-dom 15 fires native form submission on inner-button click, so
    // the submit handler is expected to fire exactly once. If the host
    // handler ALSO synthesised requestSubmit (the bug we're locking out),
    // the submit handler would fire twice — once natively and once from
    // requestSubmit. Asserting "called exactly once" is therefore the
    // no-double-fire invariant.
    const inner = btn.querySelector('button') as HTMLButtonElement;
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(submitted).toHaveBeenCalledTimes(1);
  });
});

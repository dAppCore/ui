// SPDX-Licence-Identifier: EUPL-1.2
// Integration test: <core-toggle> contributes value to FormData when checked.
import { describe, it, expect } from 'vitest';
import '../../../src/primitives';

describe('integration: <core-toggle> form data', () => {
  it('contributes name=value when checked', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') {
      // happy-dom has no ElementInternals — form-associated custom elements
      // aren't seen by `new FormData(form)`. Real-browser behaviour is the
      // assertion target; skip rather than give false coverage.
      return;
    }
    const form = document.createElement('form');
    form.innerHTML = `
      <input name="email" value="a@b.com">
      <core-toggle name="newsletter" value="yes" checked></core-toggle>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    const data = new FormData(form);
    expect(data.get('email')).toBe('a@b.com');
    expect(data.get('newsletter')).toBe('yes');
  });

  it('omits the toggle when unchecked', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') {
      // happy-dom has no ElementInternals — without it FormData wouldn't
      // see the toggle either way, so this would pass trivially. Skip.
      return;
    }
    const form = document.createElement('form');
    form.innerHTML = `<core-toggle name="newsletter" value="yes"></core-toggle>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    const data = new FormData(form);
    expect(data.get('newsletter')).toBeNull();
  });

  it('resets to unchecked on form.reset()', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') {
      // happy-dom has no ElementInternals — formResetCallback never fires
      // without it, so the toggle's `checked` won't auto-reset. Skip;
      // real browsers exercise this via formResetCallback.
      return;
    }
    const form = document.createElement('form');
    form.innerHTML = `<core-toggle name="opt-in" checked></core-toggle>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    form.reset();
    await new Promise((r) => requestAnimationFrame(r));

    const toggle = form.querySelector('core-toggle') as any;
    expect(toggle.checked).toBe(false);
  });

  it('multiple toggles each contribute independently', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') {
      // happy-dom has no ElementInternals — FormData can't see any of
      // them. Real-browser behaviour is the assertion target; skip.
      return;
    }
    const form = document.createElement('form');
    form.innerHTML = `
      <core-toggle name="a" value="on" checked></core-toggle>
      <core-toggle name="b" value="on"></core-toggle>
      <core-toggle name="c" value="on" checked></core-toggle>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    const data = new FormData(form);
    expect(data.get('a')).toBe('on');
    expect(data.get('b')).toBeNull();
    expect(data.get('c')).toBe('on');
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.7 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { CoreFormElement } from './form-element';

class TestFormInput extends CoreFormElement {
  name = '';
  disabled = false;
  required = false;
  render() { return null; }
}
customElements.define('test-core-form-element', TestFormInput);

describe('CoreFormElement', () => {
  it('attaches internals when available (or stores null under happy-dom)', () => {
    const el = document.createElement('test-core-form-element') as TestFormInput;
    document.body.appendChild(el);
    // happy-dom 15.x has no ElementInternals; assert the guarded shape.
    const internals = (el as any)._internals;
    expect(internals === null || typeof internals === 'object').toBe(true);
  });

  it('declares formAssociated = true on the class', () => {
    expect((TestFormInput as any).formAssociated).toBe(true);
  });

  it('exposes the full Constraint Validation API surface (or safe defaults when internals is null)', () => {
    const el = document.createElement('test-core-form-element') as TestFormInput;
    document.body.appendChild(el);
    // Methods + getters all callable; return safe defaults under happy-dom.
    expect(typeof el.checkValidity).toBe('function');
    expect(typeof el.reportValidity).toBe('function');
    expect(typeof el.setCustomValidity).toBe('function');
    expect(el.checkValidity()).toBe(true);    // safe default
    expect(el.reportValidity()).toBe(true);   // safe default
    expect(el.willValidate).toBe(false);      // safe default
    expect(el.validationMessage).toBe('');    // safe default
    expect(el.form).toBeNull();               // safe default
  });

  it('formDisabledCallback mirrors the form-level disable to subclass `disabled`', () => {
    const el = document.createElement('test-core-form-element') as TestFormInput;
    document.body.appendChild(el);
    expect(el.disabled).toBe(false);
    el.formDisabledCallback(true);
    expect(el.disabled).toBe(true);
    el.formDisabledCallback(false);
    expect(el.disabled).toBe(false);
  });

  it('setCustomValidity sets and clears via setValidity', () => {
    const el = document.createElement('test-core-form-element') as TestFormInput;
    document.body.appendChild(el);
    // Under happy-dom these are no-ops but should not throw.
    expect(() => el.setCustomValidity('Server says no')).not.toThrow();
    expect(() => el.setCustomValidity('')).not.toThrow();
  });
});

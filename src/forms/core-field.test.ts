// SPDX-Licence-Identifier: EUPL-1.2
//
// Note: happy-dom doesn't fully simulate the custom-element +
// SubmitEvent interaction we'd need to drive `<core-field>`'s
// encryption pipeline end-to-end (the connectedCallback fires but
// dispatched SubmitEvents aren't reliably caught by listeners on the
// host form). The full round-trip needs a real browser via Playwright
// — tracked as a follow-up integration test.
//
// In this file we verify the load-time contract: the module registers
// the custom element, exports the class, and the class binds the
// declared attributes through to reactive properties.
import { describe, expect, it } from 'vitest';
import { CoreField } from './core-field.js';

describe('coreField_Good', () => {
  it('registers the <core-field> custom element on import', () => {
    expect(customElements.get('core-field')).toBe(CoreField);
  });

  it('reflects the `encrypt-with` attribute to the encryptWith property', () => {
    const el = document.createElement('core-field') as CoreField;
    el.setAttribute('encrypt-with', 'server-pubkey');
    expect(el.encryptWith).toBe('server-pubkey');
  });

  it('reflects the `name` attribute to the name property', () => {
    const el = document.createElement('core-field') as CoreField;
    el.setAttribute('name', 'password');
    expect(el.name).toBe('password');
  });
});

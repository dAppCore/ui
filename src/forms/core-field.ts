// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `<core-field encrypt-with="server-pubkey">` — wraps a slotted input
 * and encrypts its value with a server's RSA-OAEP public key before
 * the parent form serialises.
 *
 * Use case: belt-and-braces over TLS for ultra-sensitive fields
 * (passwords, card PANs, KYC secrets). Even if a CDN MITM logs the
 * request body, the encrypted ciphertext is opaque without the
 * server's private key.
 *
 * The pubkey lives in the formatter context under
 * `setFormatterContext('crypto', { '<name>': <CryptoKey> })`. Components
 * read by name so the same key can be shared across many fields without
 * being re-imported.
 *
 * Encryption is RSA-OAEP with SHA-256 — the default browser+Go choice;
 * Web Crypto and Go's `crypto/rsa` interoperate when both pin
 * `rsaOAEP{Hash: sha256.New()}`.
 *
 * Output is base64-encoded ciphertext, replacing the input's value at
 * submit time. The original cleartext never leaves the DOM input
 * element; if a browser extension scrapes the input post-submit, it
 * sees the ciphertext.
 *
 * Light DOM. Slots a single `<input>` (any type). Listens for the host
 * form's `submit` event in the capture phase, transforms the value,
 * then lets the rest of the submit pipeline run.
 *
 * Usage example:
 *
 *   <core-form action="/v1/login">
 *     <core-input name="email"></core-input>
 *     <core-field name="password" encrypt-with="server-pubkey">
 *       <input type="password" autocomplete="new-password">
 *     </core-field>
 *     <button type="submit">Sign in</button>
 *   </core-form>
 */

import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getFormatterContext } from '../formatters/context.js';

@customElement('core-field')
export class CoreField extends LitElement {
  /** The field's name. The wrapped input is given this name at submit time. */
  @property({ type: String }) name = '';

  /** Context key naming the server's RSA-OAEP CryptoKey (publicKey, type === 'public'). */
  @property({ type: String, attribute: 'encrypt-with' }) encryptWith = '';

  /** When set, append the original cleartext length to the encrypted payload (helps debug — never enable in prod). */
  @property({ type: Boolean }) debug = false;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private hostForm: HTMLFormElement | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    // Walk up to find the host <form>, attach there. Form-scoped is
    // cleaner than document-scoped — no global state, no cross-form
    // bleed, and capture-phase listening on the parent form works
    // consistently across browsers and test runtimes.
    let parent: HTMLElement | null = this.parentElement;
    while (parent && parent.tagName !== 'FORM') parent = parent.parentElement;
    this.hostForm = parent as HTMLFormElement | null;
    if (this.hostForm) {
      this.hostForm.addEventListener('submit', this.onFormSubmit, true);
    }
  }

  override disconnectedCallback(): void {
    if (this.hostForm) {
      this.hostForm.removeEventListener('submit', this.onFormSubmit, true);
      this.hostForm = null;
    }
    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }

  private onFormSubmit = async (e: SubmitEvent): Promise<void> => {
    const form = e.currentTarget as HTMLFormElement | null;
    if (!form || form !== this.hostForm) return;
    if (!this.encryptWith) return;

    const input = this.querySelector('input,textarea') as HTMLInputElement | HTMLTextAreaElement | null;
    if (!input) return;
    if (this.name) input.name = this.name;

    const key = getFormatterContext<CryptoKey>('crypto', this.encryptWith);
    if (!key) {
      // Without a key we leave the cleartext alone — emit an event so
      // the surrounding <core-form> can observe and block. The default
      // is fail-open because false-secure is worse than a clear failure.
      this.dispatchEvent(
        new CustomEvent('core-field-encrypt-failed', {
          bubbles: true,
          composed: true,
          detail: { reason: 'key-missing', name: this.name },
        }),
      );
      return;
    }

    if (!input.value) return; // nothing to encrypt

    e.preventDefault();
    e.stopImmediatePropagation();

    try {
      const cipher = await encryptRsaOaep(key, input.value);
      input.value = cipher;
      // Re-dispatch submit so the rest of the pipeline runs with the
      // encrypted value. Use the inner form's submit() to avoid re-entry
      // into this listener (capture-phase + same event would recurse).
      this.dispatchEvent(
        new CustomEvent('core-field-encrypted', {
          bubbles: true,
          composed: true,
          detail: { name: this.name },
        }),
      );
      // requestSubmit() honours validity + dispatches submit again, but
      // by the time it fires, value is already ciphertext and we no-op.
      form.requestSubmit((form.querySelector('[type="submit"]') as HTMLButtonElement) ?? undefined);
    } catch (err) {
      this.dispatchEvent(
        new CustomEvent('core-field-encrypt-failed', {
          bubbles: true,
          composed: true,
          detail: { reason: 'encrypt-error', name: this.name, error: err },
        }),
      );
    }
  };
}

async function encryptRsaOaep(key: CryptoKey, plaintext: string): Promise<string> {
  const bytes = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, bytes);
  return base64(new Uint8Array(cipher));
}

function base64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  // Browser-only library — btoa is always defined. Was previously
  // guarded with a Node.Buffer fallback; @dappcore/ui never runs
  // outside a DOM environment so the fallback was unreachable + the
  // Buffer global isn't typed under the browser-only tsconfig.
  return btoa(s);
}

declare global {
  interface HTMLElementTagNameMap {
    'core-field': CoreField;
  }
}

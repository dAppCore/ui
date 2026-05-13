// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `<core-form>` — secure-by-default form Web Component.
 *
 * Wraps a slotted `<form>` (or its children, in which case the
 * component renders one for you) and layers in defenses that every
 * web app reinvents:
 *
 *   Tier 1 (boring but needed everywhere):
 *     - `once`              — single-submit guard
 *     - `honeypot`          — invisible field; bot-fill triggers reject
 *     - `min-time="3s"`     — reject sub-human-speed submissions
 *     - `csrf-meta="…"`     — pull token from <meta>, inject as hidden _csrf
 *     - `csrf-endpoint="…"` — fetch token from URL, inject as hidden _csrf
 *     - `idempotent`        — generate UUIDv7, send as Idempotency-Key header
 *
 *   Tier 2 (HMAC over the form):
 *     - `hmac-key="…"`            — context key under which the CryptoKey lives
 *     - `hmac-fields`             — sign the field set, attach as __hmac
 *     - `hmac-bind-timestamp`     — include render-time in the signed payload
 *     - `hmac-bind-nonce`         — include a per-render UUIDv7 nonce
 *
 *   Tier 3 (opt-in for sensitive flows):
 *     - `confirm="text"`           — show built-in confirmation dialog
 *     - `allowed-actions="regex"`  — reject submission if action= rewritten
 *     - `referrer-policy="…"`      — set form's referrerpolicy attribute
 *
 * Light DOM — tokens.css inherits cleanly. Slot children go inside the
 * inner `<form>`. Submit interception is conditional: when only native
 * features are in use (no idempotency header, no HMAC), the form
 * submits natively; otherwise the component intercepts and uses fetch.
 *
 * Custom events emitted:
 *   - `core-form-submitted`         — the form passed all checks and was submitted
 *   - `core-form-success`           — fetch returned a 2xx response
 *   - `core-form-error`             — submission failed; detail.reason names the cause
 *   - `core-form-blocked`           — submission blocked locally (honeypot, min-time, allowlist, double-submit, etc.)
 *
 * The polyglot server side (dappco.re/go/forms or core-template) must
 * implement the matching verifiers — CSRF token check, HMAC verify
 * with the same canonical serialisation (see src/crypto/forms.ts),
 * honeypot field check, idempotency-key dedup, allowed-actions whitelist
 * cross-check.
 *
 * Usage example:
 *
 *   <core-form
 *     action="/v1/users"
 *     method="POST"
 *     once honeypot min-time="3s"
 *     csrf-meta="csrf-token"
 *     idempotent
 *     hmac-key="session-key"
 *     hmac-fields hmac-bind-timestamp hmac-bind-nonce
 *   >
 *     <core-input name="email" type="email" required></core-input>
 *     <core-input name="password" type="password" required></core-input>
 *     <button type="submit">Sign in</button>
 *   </core-form>
 */

import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getFormatterContext } from '../formatters/context.js';
import { signFormData } from '../crypto/forms.js';
import { uuidv7 } from '../crypto/uuid.js';

interface BlockedDetail {
  reason:
    | 'double-submit'
    | 'honeypot'
    | 'too-fast'
    | 'action-not-allowed'
    | 'confirm-cancelled'
    | 'hmac-key-missing'
    | 'csrf-missing';
}

@customElement('core-form')
export class CoreForm extends LitElement {
  @property({ type: String }) action = '';
  @property({ type: String }) method = 'POST';
  @property({ type: String }) enctype = 'application/x-www-form-urlencoded';

  // Tier 1
  @property({ type: Boolean }) once = false;
  @property({ type: Boolean }) honeypot = false;
  @property({ type: String, attribute: 'min-time' }) minTime = '';
  @property({ type: String, attribute: 'csrf-meta' }) csrfMeta = '';
  @property({ type: String, attribute: 'csrf-endpoint' }) csrfEndpoint = '';
  @property({ type: Boolean }) idempotent = false;

  // Tier 2
  @property({ type: String, attribute: 'hmac-key' }) hmacKey = '';
  @property({ type: Boolean, attribute: 'hmac-fields' }) hmacFields = false;
  @property({ type: Boolean, attribute: 'hmac-bind-timestamp' }) hmacBindTimestamp = false;
  @property({ type: Boolean, attribute: 'hmac-bind-nonce' }) hmacBindNonce = false;

  // Tier 3
  @property({ type: String }) confirm = '';
  @property({ type: String, attribute: 'allowed-actions' }) allowedActions = '';
  @property({ type: String, attribute: 'referrer-policy' }) referrerPolicy = '';

  @state() private submitting = false;
  @state() private done = false;

  private renderedAt = 0;
  private nonce = '';
  private idempotencyKey = '';

  protected createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.renderedAt = performance.now();
    if (this.idempotent) this.idempotencyKey = uuidv7();
    if (this.hmacBindNonce) this.nonce = uuidv7();
  }

  /** Reset submission state. Lets a previously-submitted form be re-used. */
  resetSubmission(): void {
    this.submitting = false;
    this.done = false;
    this.renderedAt = performance.now();
    if (this.idempotent) this.idempotencyKey = uuidv7();
    if (this.hmacBindNonce) this.nonce = uuidv7();
  }

  /** Find the inner <form>. Lit slots in light DOM render under `this`. */
  private get form(): HTMLFormElement | null {
    return this.querySelector('form');
  }

  protected override render(): TemplateResult {
    return html`
      <form
        action=${this.action}
        method=${this.method}
        enctype=${this.enctype}
        referrerpolicy=${this.referrerPolicy || nothing}
        @submit=${this.onSubmit}
        part="form"
      >
        <slot></slot>
        ${this.honeypot ? this.renderHoneypot() : nothing}
      </form>
    `;
  }

  private renderHoneypot(): TemplateResult {
    return html`
      <input
        type="text"
        name="__honey"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        part="honeypot"
        style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none"
      />
    `;
  }

  private async onSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    if (!this.form) return;

    // 1. once — block double-submits.
    if (this.once && (this.submitting || this.done)) {
      this.emitBlocked({ reason: 'double-submit' });
      return;
    }

    // 2. honeypot — non-empty filled value means it was a bot.
    if (this.honeypot) {
      const honey = this.form.querySelector('input[name="__honey"]') as HTMLInputElement | null;
      if (honey && honey.value !== '') {
        this.emitBlocked({ reason: 'honeypot' });
        return;
      }
    }

    // 3. min-time — reject if completed faster than humanly possible.
    const minMs = parseMinTime(this.minTime);
    if (minMs > 0) {
      const elapsed = performance.now() - this.renderedAt;
      if (elapsed < minMs) {
        this.emitBlocked({ reason: 'too-fast' });
        return;
      }
    }

    // 4. allowed-actions — reject DOM-rewritten action URLs.
    if (this.allowedActions) {
      const re = new RegExp(this.allowedActions);
      if (!re.test(this.form.action)) {
        this.emitBlocked({ reason: 'action-not-allowed' });
        return;
      }
    }

    // 5. confirm — show built-in dialog.
    if (this.confirm) {
      const ok = await this.runConfirm(this.confirm);
      if (!ok) {
        this.emitBlocked({ reason: 'confirm-cancelled' });
        return;
      }
    }

    this.submitting = true;

    // 6. CSRF — fetch / read token, inject as hidden _csrf.
    const csrfToken = await this.resolveCsrfToken();
    if (csrfToken !== null) {
      this.upsertHiddenField('_csrf', csrfToken);
    } else if (this.csrfMeta || this.csrfEndpoint) {
      this.submitting = false;
      this.emitBlocked({ reason: 'csrf-missing' });
      return;
    }

    // 7. HMAC — sign field set, attach as __hmac.
    let timestamp = 0;
    let nonceForRound = '';
    if (this.hmacFields) {
      const cryptoCtxKey = this.hmacKey || 'hmac_key';
      const cryptoKey = getFormatterContext<CryptoKey | Uint8Array | string>('crypto', cryptoCtxKey);
      if (!cryptoKey) {
        this.submitting = false;
        this.emitBlocked({ reason: 'hmac-key-missing' });
        return;
      }
      const data = new FormData(this.form);
      if (this.hmacBindTimestamp) timestamp = Date.now();
      if (this.hmacBindNonce) nonceForRound = this.nonce;
      const tag = await signFormData(cryptoKey, data, {
        timestamp: timestamp || false,
        nonce: nonceForRound || undefined,
      });
      if (timestamp) this.upsertHiddenField('__ts', String(timestamp));
      if (nonceForRound) this.upsertHiddenField('__nonce', nonceForRound);
      this.upsertHiddenField('__hmac', tag);
    }

    // 8. Decide native submit vs fetch-intercept.
    //    Native submission can carry hidden fields but cannot set custom
    //    headers; idempotent requires the Idempotency-Key header.
    if (this.idempotent) {
      await this.submitViaFetch(this.form);
    } else {
      // Native submit lets the browser handle redirects, file uploads,
      // and the normal POST navigation cycle.
      this.emit('core-form-submitted', { detail: {} });
      if (this.once) this.done = true;
      this.form.submit();
    }
  }

  private async submitViaFetch(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form);
    const headers: Record<string, string> = {};
    if (this.idempotent) headers['Idempotency-Key'] = this.idempotencyKey;

    this.emit('core-form-submitted', { detail: { idempotencyKey: this.idempotencyKey } });

    try {
      const response = await fetch(form.action, {
        method: form.method.toUpperCase() || 'POST',
        body: data,
        headers,
        credentials: 'same-origin',
        redirect: 'manual',
        referrerPolicy: (this.referrerPolicy as ReferrerPolicy) || undefined,
      });
      if (this.once) this.done = true;
      this.submitting = false;
      if (response.ok || response.type === 'opaqueredirect') {
        this.emit('core-form-success', { detail: { response } });
      } else {
        this.emit('core-form-error', { detail: { status: response.status, response } });
      }
    } catch (err) {
      this.submitting = false;
      this.emit('core-form-error', { detail: { error: err } });
    }
  }

  private async resolveCsrfToken(): Promise<string | null> {
    if (this.csrfMeta) {
      const meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${this.csrfMeta}"]`);
      return meta?.content || null;
    }
    if (this.csrfEndpoint) {
      try {
        const r = await fetch(this.csrfEndpoint, { credentials: 'same-origin' });
        if (!r.ok) return null;
        const text = await r.text();
        // Accept either a plain string body or a JSON `{ token: "…" }` envelope.
        try {
          const j = JSON.parse(text) as { token?: string };
          return typeof j.token === 'string' ? j.token : text.trim();
        } catch {
          return text.trim();
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  private upsertHiddenField(name: string, value: string): void {
    if (!this.form) return;
    let input = this.form.querySelector<HTMLInputElement>(`input[name="${name}"][type="hidden"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      this.form.appendChild(input);
    }
    input.value = value;
  }

  private async runConfirm(message: string): Promise<boolean> {
    // Prefer a native <dialog> for accessibility; fall back to window.confirm.
    if (typeof HTMLDialogElement === 'undefined') return window.confirm(message);

    const dialog = document.createElement('dialog');
    dialog.setAttribute('part', 'confirm');
    dialog.innerHTML = `
      <form method="dialog" style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem;min-width:18rem;max-width:24rem">
        <p part="confirm-text" style="margin:0">${escapeHtml(message)}</p>
        <div style="display:flex;gap:0.5rem;justify-content:flex-end">
          <button value="cancel" part="confirm-cancel">Cancel</button>
          <button value="confirm" part="confirm-ok" autofocus>OK</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);
    return new Promise<boolean>((resolve) => {
      dialog.addEventListener(
        'close',
        () => {
          const ok = dialog.returnValue === 'confirm';
          dialog.remove();
          resolve(ok);
        },
        { once: true },
      );
      dialog.showModal();
    });
  }

  private emit(name: string, init: CustomEventInit): void {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, ...init }));
  }

  private emitBlocked(detail: BlockedDetail): void {
    this.submitting = false;
    this.emit('core-form-blocked', { detail });
  }
}

function parseMinTime(value: string): number {
  if (!value) return 0;
  const m = /^(\d+(?:\.\d+)?)(ms|s)?$/.exec(value.trim());
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = m[2] || 'ms';
  return unit === 's' ? n * 1000 : n;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

declare global {
  interface HTMLElementTagNameMap {
    'core-form': CoreForm;
  }
}

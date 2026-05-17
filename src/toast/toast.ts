// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { LitElement, html, css, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { TemplateResult } from 'lit';

export type Severity = 'info' | 'success' | 'warning' | 'error';

/**
 * `<core-toast>` — Shadow DOM notification bubble.
 *
 *   <core-toast severity="success" duration="5000">File saved.</core-toast>
 *
 *   <core-toast severity="error" duration="0">
 *     <svg slot="icon">…</svg>
 *     Network unavailable.
 *     <button slot="action">Retry</button>
 *   </core-toast>
 *
 * Attributes (manual sync getters/setters):
 *   severity: 'info'|'success'|'warning'|'error'   (default 'info')
 *   duration: number                                (ms; default 5000; 0 = sticky)
 *   open: boolean                                   (drives visibility)
 *   data-state: 'opening'|'open'|'closing'|'closed' (set internally)
 *
 * Internal timer state:
 *   _dismissTimer: number | null
 *   _remainingMs: number
 *   _timerStartedAt: number
 *
 * Methods: show(), close(), pauseTimer(), resumeTimer()
 * Events:
 *   core-toast-open    — fires when data-state reaches "open"
 *   core-toast-close   — cancellable; fires when data-state reaches "closed";
 *                        preventDefault() reverts to open state
 * Slots: default (message), icon (override built-in), action (trailing button)
 * Parts: toast, icon, message, action, close-button
 * ARIA: role="status" for info/success; role="alert" for warning/error
 */

const severityIcons: Record<Severity, TemplateResult> = {
  info: svg`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" width="16" height="16">
    <circle cx="8" cy="8" r="8"/>
    <rect x="7" y="7" width="2" height="5" fill="white"/>
    <rect x="7" y="4" width="2" height="2" fill="white"/>
  </svg>`,
  success: svg`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" width="16" height="16">
    <circle cx="8" cy="8" r="8"/>
    <polyline points="4,8 7,11 12,5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  warning: svg`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" width="16" height="16">
    <polygon points="8,1 15,15 1,15"/>
    <rect x="7" y="6" width="2" height="5" fill="white"/>
    <rect x="7" y="12" width="2" height="2" fill="white"/>
  </svg>`,
  error: svg`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" width="16" height="16">
    <circle cx="8" cy="8" r="8"/>
    <line x1="5" y1="5" x2="11" y2="11" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="11" y1="5" x2="5" y2="11" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
};

@customElement('core-toast')
export class CoreToast extends LitElement {

  // ── Reflected attributes (manual sync — v0.4 T2 / v0.9 T2 pattern) ────────

  get severity(): Severity {
    return (this.getAttribute('severity') as Severity) ?? 'info';
  }
  set severity(value: Severity) {
    this.setAttribute('severity', value);
    this.requestUpdate();
  }

  get duration(): number {
    const raw = this.getAttribute('duration');
    if (raw === null) return 5000;
    const n = Number(raw);
    return isNaN(n) ? 5000 : n;
  }
  set duration(value: number) {
    this.setAttribute('duration', String(value));
  }

  get open(): boolean {
    return this.hasAttribute('open');
  }
  set open(value: boolean) {
    if (value) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  // ── Timer state ──────────────────────────────────────────────────────────

  _dismissTimer: ReturnType<typeof setTimeout> | null = null;
  _remainingMs = 0;
  _timerStartedAt = 0;

  // ── Internal state machine ────────────────────────────────────────────────

  private _state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private _fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Styles ───────────────────────────────────────────────────────────────

  static override styles = css`
    :host {
      display: block;
      --duration: var(--core-overlay-duration, 200ms);
      --easing: var(--core-overlay-easing, cubic-bezier(0.4, 0, 0.2, 1));
      pointer-events: auto;
    }

    :host([data-state="closed"]) {
      display: none;
    }

    :host([data-state="opening"]) {
      opacity: 0;
      transform: translateY(var(--core-toast-slide-from, -20px));
    }

    :host([data-state="open"]) {
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--duration) var(--easing),
        transform var(--duration) var(--easing);
    }

    :host([data-state="closing"]) {
      opacity: 0;
      transform: translateY(var(--core-toast-slide-from, -20px));
      pointer-events: none;
      transition:
        opacity var(--duration) var(--easing),
        transform var(--duration) var(--easing);
    }

    @media (prefers-reduced-motion: reduce) {
      :host { transition: none !important; }
    }

    [part="toast"] {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      width: var(--core-toast-width, 360px);
      padding: 12px 14px;
      border-radius: var(--core-toast-radius, var(--core-radius-md, 8px));
      box-shadow: var(--core-toast-shadow, var(--core-shadow-2));
      color: var(--core-toast-fg, var(--core-ink-0));
      box-sizing: border-box;
    }

    :host([severity="info"])    [part="toast"] { background: var(--core-toast-bg-info, var(--core-info-400)); }
    :host([severity="success"]) [part="toast"] { background: var(--core-toast-bg-success, var(--core-success-400)); }
    :host([severity="warning"]) [part="toast"] { background: var(--core-toast-bg-warning, var(--core-warning-400)); }
    :host([severity="error"])   [part="toast"] { background: var(--core-toast-bg-error, var(--core-danger-400)); }

    [part="icon"] {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    [part="message"] {
      flex: 1;
      font-size: 0.875rem;
      line-height: 1.4;
      min-width: 0;
    }

    [part="action"] {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    [part="action"]:not(:has(*)) {
      display: none;
    }

    [part="close-button"] {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      margin: -2px -2px 0 0;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      border-radius: 4px;
      opacity: 0.75;
      font-size: 1rem;
      line-height: 1;
    }

    [part="close-button"]:hover {
      opacity: 1;
    }
  `;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    // Set defaults so getAttribute reflects the logical value synchronously.
    if (!this.hasAttribute('severity')) {
      this.setAttribute('severity', 'info');
    }
    this.setAttribute('data-state', 'closed');
    this.addEventListener('mouseenter', this._onMouseenter);
    this.addEventListener('mouseleave', this._onMouseleave);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('mouseenter', this._onMouseenter);
    this.removeEventListener('mouseleave', this._onMouseleave);
    this._clearDismissTimer();
    this._clearFallbackTimer();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  show(): void {
    if (this._state === 'open' || this._state === 'opening') return;
    this.open = true;
    this._transition('opening');
    // Start dismiss timer immediately so pause/resume work during opening animation.
    // The fallback timer (250ms) fires before the dismiss timer (duration ≥ 5000ms default).
    if (this.duration > 0) {
      this._remainingMs = this.duration;
      this._startTimer(this._remainingMs);
    }
  }

  close(): void {
    if (this._state === 'closed' || this._state === 'closing') return;
    this._clearDismissTimer();
    this.open = false;
    this._transition('closing');
  }

  pauseTimer(): void {
    if (this._dismissTimer === null) return;
    this._remainingMs -= (Date.now() - this._timerStartedAt);
    this._clearDismissTimer();
  }

  resumeTimer(): void {
    if (this._dismissTimer !== null) return;
    if (this._remainingMs <= 0) return;
    if (this.duration === 0) return;
    this._startTimer(this._remainingMs);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    const role = (this.severity === 'warning' || this.severity === 'error') ? 'alert' : 'status';
    return html`
      <div part="toast" role=${role}>
        <div part="icon">
          <slot name="icon">${severityIcons[this.severity]}</slot>
        </div>
        <div part="message">
          <slot></slot>
        </div>
        <div part="action">
          <slot name="action"></slot>
        </div>
        <button
          part="close-button"
          aria-label="Dismiss notification"
          @click=${this._onDismissClick}
        >\xd7</button>
      </div>
    `;
  }

  // ── Timer helpers ────────────────────────────────────────────────────────

  private _startTimer(ms: number): void {
    this._timerStartedAt = Date.now();
    this._dismissTimer = setTimeout(() => {
      this._dismissTimer = null;
      this.close();
    }, ms);
  }

  private _clearDismissTimer(): void {
    if (this._dismissTimer !== null) {
      clearTimeout(this._dismissTimer);
      this._dismissTimer = null;
    }
  }

  // ── State machine ────────────────────────────────────────────────────────

  private _transition(to: 'opening' | 'closing'): void {
    this._clearFallbackTimer();
    this._state = to;
    this.setAttribute('data-state', to);

    const next = to === 'opening' ? 'open' : 'closed';

    const advance = (): void => {
      this._clearFallbackTimer();

      if (next === 'closed') {
        // Fire cancellable core-toast-close before removing
        const ev = new CustomEvent('core-toast-close', {
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        this.dispatchEvent(ev);
        if (ev.defaultPrevented) {
          // Revert to open
          this._state = 'open';
          this.open = true;
          this.setAttribute('data-state', 'open');
          return;
        }
      }

      this._state = next;
      this.setAttribute('data-state', next);

      if (next === 'open') {
        this.dispatchEvent(new CustomEvent('core-toast-open', {
          bubbles: true,
          composed: true,
        }));
      } else {
        // Closed — remove from DOM
        this.remove();
      }
    };

    const onEnd = (ev: Event): void => {
      if ((ev as TransitionEvent).target !== this) return;
      this.removeEventListener('transitionend', onEnd);
      this.removeEventListener('animationend', onEnd);
      advance();
    };
    this.addEventListener('transitionend', onEnd);
    this.addEventListener('animationend', onEnd);

    const durationMs = this._overlayDurationMs();
    this._fallbackTimer = setTimeout(() => {
      this.removeEventListener('transitionend', onEnd);
      this.removeEventListener('animationend', onEnd);
      advance();
    }, durationMs + 50);
  }

  private _overlayDurationMs(): number {
    try {
      const raw = getComputedStyle(this).getPropertyValue('--core-overlay-duration').trim();
      if (raw.endsWith('ms')) return parseFloat(raw) || 200;
      if (raw.endsWith('s')) return (parseFloat(raw) || 0.2) * 1000;
    } catch { /* */ }
    return 200;
  }

  private _clearFallbackTimer(): void {
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private _onMouseenter = (): void => {
    this.pauseTimer();
  };

  private _onMouseleave = (): void => {
    this.resumeTimer();
  };

  private _onDismissClick = (): void => {
    this.close();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'core-toast': CoreToast;
  }
}

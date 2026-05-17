// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { createFocusTrap, type FocusTrap } from './focus-trap';

/**
 * CoreOverlayElement — abstract base for <core-dialog> and <core-drawer>.
 *
 * Provides:
 *   - State machine: closed → opening → open → closing → closed
 *   - data-state attribute reflects current state
 *   - show() / showModal() / close(returnValue?) / toggle()
 *   - modal attribute: true = .showModal() native path (browser focus trap +
 *     backdrop); false = .show() non-modal path (focus-trap.ts if `trap` attr)
 *   - closedby="any|closerequest|none" polyfill (spec §5.4)
 *   - ESC key handler (respects closedby + fires cancellable core-overlay-cancel)
 *   - Backdrop click detection (event.target === host in modal mode)
 *   - [data-core-close] delegated close button
 *   - returnValue written on close
 *   - Transition fallback timer (--core-overlay-duration + 50ms)
 *   - Focus restoration to pre-open activeElement on close
 *   - attachInternals() guarded for happy-dom
 */
export abstract class CoreOverlayElement extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Boolean, reflect: true }) modal = true;
  @property({ reflect: true }) closedby: 'any' | 'closerequest' | 'none' = 'closerequest';

  returnValue = '';

  protected _internals: ElementInternals | null;

  private _trap: FocusTrap | null = null;
  private _returnFocus: Element | null = null;
  private _fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private _state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';

  constructor() {
    super();
    this._internals = typeof this.attachInternals === 'function'
      ? this.attachInternals()
      : null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-state', 'closed');
    this.addEventListener('click', this._onDelegatedClose);
    this.addEventListener('click', this._onBackdropClick);
    document.addEventListener('keydown', this._onKeydown, true);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._onDelegatedClose);
    this.removeEventListener('click', this._onBackdropClick);
    document.removeEventListener('keydown', this._onKeydown, true);
    this._clearFallbackTimer();
    this._trap?.deactivate();
  }

  show(): void {
    if (this._state === 'open' || this._state === 'opening') return;
    this._returnFocus = document.activeElement;
    this.open = true;
    this._transition('opening');
    if (!this.modal && this.hasAttribute('trap')) {
      this._trap = createFocusTrap(this.shadowRoot ?? this);
      this._trap.activate();
    }
  }

  showModal(): void {
    this.modal = true;
    this.show();
  }

  close(returnValue?: string): void {
    if (this._state === 'closed' || this._state === 'closing') return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.open = false;
    this._transition('closing');
    this._trap?.deactivate();
    this._trap = null;
  }

  toggle(): void {
    if (this._state === 'closed' || this._state === 'closing') {
      this.show();
    } else {
      this.close();
    }
  }

  private _transition(to: 'opening' | 'closing'): void {
    this._clearFallbackTimer();
    this._state = to;
    this.setAttribute('data-state', to);

    const next = to === 'opening' ? 'open' : 'closed';

    const advance = (): void => {
      this._clearFallbackTimer();
      this._state = next;
      this.setAttribute('data-state', next);
      if (next === 'open') {
        this.dispatchEvent(new CustomEvent('core-overlay-open', { bubbles: true, composed: true }));
      } else {
        this.dispatchEvent(new CustomEvent('core-overlay-close', {
          bubbles: true,
          composed: true,
          detail: { returnValue: this.returnValue },
        }));
        if (this._returnFocus && typeof (this._returnFocus as HTMLElement).focus === 'function') {
          (this._returnFocus as HTMLElement).focus();
        }
        this._returnFocus = null;
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

  private _onKeydown = (ev: KeyboardEvent): void => {
    if (this._state !== 'open') return;
    if (ev.key !== 'Escape') return;
    if (this.closedby === 'none') return;

    const cancel = new CustomEvent('core-overlay-cancel', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(cancel);
    if (cancel.defaultPrevented) return;

    this.close();
  };

  private _onDelegatedClose = (ev: Event): void => {
    const target = ev.target as Element;
    if (target.closest('[data-core-close]')) {
      this.close();
    }
  };

  private _onBackdropClick = (ev: MouseEvent): void => {
    if (this.closedby !== 'any') return;
    if (ev.target === this) {
      this.close();
    }
  };
}

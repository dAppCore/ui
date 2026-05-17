// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  supportsAnchorPositioning,
  computePosition,
  type Placement,
} from './anchor-position';

/**
 * CoreAnchoredElement — abstract base for <core-popover> and <core-tooltip>.
 *
 * Provides:
 *   - anchor attribute (CSS selector) → anchorElement resolution
 *     Queries getRootNode().querySelector first, then document.querySelector.
 *   - anchorElement property setter (programmatic; overrides anchor attr)
 *   - placement (12 values) → CSS Anchor Positioning style generation
 *   - supportsAnchorPositioning() detection (probe path, not CSS.supports)
 *   - JS fallback: rAF-throttled recompute on resize/scroll, AbortSignal teardown
 *   - State machine: closed → opening → open → closing → closed
 *   - data-state attribute + show() / hide() / toggle()
 *   - core-anchored-open / core-anchored-close events
 *   - closedby="any|closerequest|none" → popover="auto|manual" on subclass
 *   - Fallback timer for happy-dom (transitionend never fires)
 *   - attachInternals() guarded for happy-dom
 */

let _uid = 0;

export abstract class CoreAnchoredElement extends LitElement {
  @property({ reflect: true }) placement: Placement = 'bottom';
  @property({ type: Number, reflect: true }) offset = 4;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) closedby: 'any' | 'closerequest' | 'none' = 'any';
  @property({ reflect: true }) anchor = '';

  anchorElement: HTMLElement | null = null;

  protected _internals: ElementInternals | null;

  private _state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
  private _fallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private _rafId: number | null = null;
  private _scrollAbort: AbortController | null = null;
  private _anchorUid = `--core-anchor-${++_uid}`;

  constructor() {
    super();
    this._internals = typeof this.attachInternals === 'function'
      ? this.attachInternals()
      : null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-state', 'closed');
    this._resolveAnchor();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearFallbackTimer();
    this._teardownScrollListeners();
  }

  override attributeChangedCallback(name: string, old: string | null, next: string | null): void {
    super.attributeChangedCallback(name, old, next);
    if (name === 'anchor' && old !== next) {
      this._resolveAnchor();
    }
  }

  private _resolveAnchor(): void {
    if (!this.anchor) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    const found =
      (root.querySelector?.(this.anchor) as HTMLElement | null) ??
      (document.querySelector(this.anchor) as HTMLElement | null);
    if (found) this.anchorElement = found;
  }

  show(): void {
    if (this._state === 'open' || this._state === 'opening') return;
    this.open = true;
    this._transition('opening');
    this._applyPositioning();
    if (!supportsAnchorPositioning()) {
      this._setupScrollListeners();
    }
  }

  hide(): void {
    if (this._state === 'closed' || this._state === 'closing') return;
    this.open = false;
    this._transition('closing');
    this._teardownScrollListeners();
  }

  toggle(): void {
    if (this._state === 'closed' || this._state === 'closing') {
      this.show();
    } else {
      this.hide();
    }
  }

  _applyPositioning(): void {
    if (!this.anchorElement) return;
    if (supportsAnchorPositioning()) {
      this._applyCssAnchorPositioning();
    } else {
      this._applyJsFallback();
    }
  }

  private _applyCssAnchorPositioning(): void {
    if (!this.anchorElement) return;
    this.anchorElement.style.setProperty('anchor-name', this._anchorUid);
    this.style.setProperty('position-anchor', this._anchorUid);
    this.style.setProperty('position', 'absolute');
    const positionArea = this._placementToPositionArea(this.placement);
    this.style.setProperty('position-area', positionArea);
    const marginProp = this._offsetMarginProp(this.placement);
    this.style.setProperty(marginProp, `${this.offset}px`);
  }

  _applyJsFallback(): void {
    if (!this.anchorElement) return;
    const result = computePosition(this.anchorElement, this, this.placement, this.offset);
    this.style.position = 'fixed';
    this.style.top = `${result.top}px`;
    this.style.left = `${result.left}px`;
  }

  _placementToPositionArea(p: Placement): string {
    const map: Record<Placement, string> = {
      'top':          'top center',
      'top-start':    'top span-left',
      'top-end':      'top span-right',
      'bottom':       'bottom center',
      'bottom-start': 'bottom span-left',
      'bottom-end':   'bottom span-right',
      'start':        'center span-block-start',
      'start-start':  'block-start span-inline-start',
      'start-end':    'block-start span-inline-end',
      'end':          'center span-block-end',
      'end-start':    'block-end span-inline-start',
      'end-end':      'block-end span-inline-end',
    };
    return map[p] ?? 'bottom center';
  }

  private _offsetMarginProp(p: Placement): string {
    if (p.startsWith('top')) return 'margin-bottom';
    if (p.startsWith('bottom')) return 'margin-top';
    if (p.startsWith('start')) return 'margin-right';
    return 'margin-left';
  }

  private _setupScrollListeners(): void {
    this._teardownScrollListeners();
    this._scrollAbort = new AbortController();
    const { signal } = this._scrollAbort;

    const onReposition = (): void => {
      if (this._rafId !== null) return;
      this._rafId = requestAnimationFrame(() => {
        this._rafId = null;
        this._applyJsFallback();
      });
    };

    // Defensive removeOnAbort: happy-dom does not honour signal auto-removal
    // in addEventListener options, so we wire it manually via abort event.
    const removeOnAbort = (): void => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
    signal.addEventListener('abort', removeOnAbort);

    window.addEventListener('resize', onReposition, { signal } as AddEventListenerOptions);
    window.addEventListener('scroll', onReposition, { capture: true, signal } as AddEventListenerOptions);
  }

  private _teardownScrollListeners(): void {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._scrollAbort?.abort();
    this._scrollAbort = null;
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
      const eventName = next === 'open' ? 'core-anchored-open' : 'core-anchored-close';
      this.dispatchEvent(new CustomEvent(eventName, { bubbles: true, composed: true }));
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
}

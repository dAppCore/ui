// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CoreTab } from './tab';
import type { CoreTabpanel } from './tabpanel';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'auto' | 'manual';

// Module-level counter — ensures unique IDs across multiple <core-tabs>
// instances on the same page. Matches the _tooltipUid pattern from v0.8.
let tabsUid = 0;

/**
 * `<core-tabs>` — Shadow DOM tablist container.
 *
 * Owns all state: selected index, orientation, activation mode.
 * Reads `<core-tab>` + `<core-tabpanel>` children via slotchange,
 * runs pairing resolution (explicit for/id first, then implicit by index),
 * wires ARIA, manages roving tabindex, toggles panel `hidden` attribute,
 * and positions the sliding indicator.
 *
 *   <core-tabs selected-index="0" orientation="horizontal" activation="auto">
 *     <core-tab for="general">General</core-tab>
 *     <core-tab for="account">Account</core-tab>
 *     <core-tab for="billing" disabled>Billing</core-tab>
 *     <core-tabpanel id="general">General settings.</core-tabpanel>
 *     <core-tabpanel id="account">Account settings.</core-tabpanel>
 *     <core-tabpanel id="billing">Billing (disabled).</core-tabpanel>
 *   </core-tabs>
 *
 * Attributes (reflected): selected-index, orientation, activation
 * Properties: selectedTab (read-only), selectedPanel (read-only)
 * Methods: select(indexOrTab), refresh()
 * Events: core-tab-change (cancellable, detail: { index, previousIndex, tab, panel })
 * Parts: tablist, indicator, panels
 */
@customElement('core-tabs')
export class CoreTabs extends LitElement {
  private _uid = ++tabsUid;

  // ── Reflected attributes ─────────────────────────────────────────────────

  @property({ reflect: true, attribute: 'selected-index', type: Number })
  selectedIndex = 0;

  @property({ reflect: true })
  orientation: TabsOrientation = 'horizontal';

  @property({ reflect: true })
  activation: TabsActivation = 'auto';

  // ── Internal state ───────────────────────────────────────────────────────

  _tabs: CoreTab[] = [];
  _panels: CoreTabpanel[] = [];
  _pairs: Array<{ tab: CoreTab; panel: CoreTabpanel }> = [];

  /** Index that has focus in the tablist (may differ from selectedIndex in manual mode). */
  private _focusedIndex = 0;

  private _slotObserver: MutationObserver | null = null;

  // ── Styles ───────────────────────────────────────────────────────────────

  static override styles = css`
    :host {
      display: block;
    }

    [part="tablist"] {
      position: relative;
      display: flex;
      flex-direction: row;
      border-bottom: 1px solid var(--core-tabs-border-color, var(--core-line-2));
    }

    :host([orientation="vertical"]) [part="tablist"] {
      flex-direction: column;
      border-bottom: none;
      border-inline-end: 1px solid var(--core-tabs-border-color, var(--core-line-2));
    }

    [part="indicator"] {
      position: absolute;
      bottom: 0;
      left: 0;
      height: var(--core-tabs-indicator-thickness, 2px);
      background: var(--core-tabs-indicator-color, var(--core-brand-500));
      transition:
        transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        width 200ms cubic-bezier(0.4, 0, 0.2, 1),
        height 200ms cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    :host([orientation="vertical"]) [part="indicator"] {
      bottom: auto;
      top: 0;
      left: auto;
      right: 0;
      width: var(--core-tabs-indicator-thickness, 2px);
      height: 0;
    }

    [part="panels"] {
      display: contents;
    }
  `;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKeydown);
    this.addEventListener('core-tab-click', this._onTabClick);
    // MutationObserver as backup: catches attribute mutations on children
    // (e.g. consumer toggling disabled or for) without slotchange firing.
    // Mirrors the data-table pattern: set up in connectedCallback so it is
    // ready before Lit's first async render cycle.
    this._slotObserver = new MutationObserver(() => this._onSlotChange());
    this._slotObserver.observe(this, { childList: true, subtree: false, attributes: true, attributeFilter: ['for', 'disabled'] });
    // Initial read via microtask — same pattern as data-table._readColumns().
    // Children are already in the DOM before connectedCallback; the microtask
    // lets custom-element upgrades settle before we querySelectorAll.
    queueMicrotask(() => this._onSlotChange());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeydown);
    this.removeEventListener('core-tab-click', this._onTabClick);
    this._slotObserver?.disconnect();
    this._slotObserver = null;
  }

  override firstUpdated(): void {
    // Wire the slotchange event on the shadow slot for future DOM mutations.
    // (The initial read already happened via queueMicrotask in connectedCallback.)
    const slot = this.shadowRoot!.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => this._onSlotChange());
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    return html`
      <div part="tablist" role="tablist" aria-orientation=${this.orientation}>
        <slot></slot>
        <div part="indicator" aria-hidden="true"></div>
      </div>
      <div part="panels">
        <slot name="panels"></slot>
      </div>
    `;
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Read-only getter: the currently active CoreTab element. */
  get selectedTab(): CoreTab | null {
    return this._pairs[this.selectedIndex]?.tab ?? null;
  }

  /** Read-only getter: the currently active CoreTabpanel element. */
  get selectedPanel(): CoreTabpanel | null {
    return this._pairs[this.selectedIndex]?.panel ?? null;
  }

  /**
   * Programmatic activation. Accepts an index (number) or a CoreTab element.
   * Fires `core-tab-change`. Respects `preventDefault()`.
   */
  select(indexOrTab: number | CoreTab): void {
    let index: number;
    if (typeof indexOrTab === 'number') {
      index = indexOrTab;
    } else {
      index = this._tabs.indexOf(indexOrTab);
    }
    if (index < 0 || index >= this._pairs.length) return;
    this._activate(index);
  }

  /**
   * Force re-read of slotted children.
   * Call after dynamically inserting `<core-tab>` / `<core-tabpanel>` children.
   */
  refresh(): void {
    this._onSlotChange();
  }

  // ── Slot handling + pairing resolution ───────────────────────────────────

  private _onSlotChange(): void {
    // 1. Collect children of the right type.
    // Note: happy-dom does not support the ':scope >' child combinator in
    // querySelectorAll, so we filter this.children directly — equivalent
    // behaviour in all browsers (direct children only).
    this._tabs = Array.from(this.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-tab',
    ) as CoreTab[];
    this._panels = Array.from(this.children).filter(
      (c) => c.tagName.toLowerCase() === 'core-tabpanel',
    ) as CoreTabpanel[];

    // 2. Pairing resolution (spec §4.4):
    //    a. Explicit for/id first.
    //    b. Remaining unpaired tabs paired with remaining unpaired panels by residual index.
    const pairedPanelIds = new Set<string>();
    const pairedTabIndices = new Set<number>();
    const pairs: Array<{ tab: CoreTab; panel: CoreTabpanel }> = [];

    // Pass 1: explicit for/id pairing.
    for (let i = 0; i < this._tabs.length; i++) {
      const tab = this._tabs[i];
      const forVal = tab.for;
      if (!forVal) continue;
      const panel = this._panels.find((p) => p.id === forVal || p.dataset['panelId'] === forVal);
      if (panel) {
        pairs.push({ tab, panel });
        pairedPanelIds.add(panel.id || panel.dataset['panelId'] || '');
        pairedTabIndices.add(i);
      }
    }

    // Pass 2: implicit by residual index.
    const unpaired = {
      tabs: this._tabs.filter((_, i) => !pairedTabIndices.has(i)),
      panels: this._panels.filter((p) => !pairedPanelIds.has(p.id || p.dataset['panelId'] || '')),
    };
    const implicitCount = Math.min(unpaired.tabs.length, unpaired.panels.length);
    for (let i = 0; i < implicitCount; i++) {
      pairs.push({ tab: unpaired.tabs[i], panel: unpaired.panels[i] });
    }

    // Tabs with no panel get an empty aria-controls (degenerate).
    for (let i = implicitCount; i < unpaired.tabs.length; i++) {
      unpaired.tabs[i].setAttribute('aria-controls', '');
    }

    // 3. Stable pair ordering: match original tab order.
    pairs.sort((a, b) => this._tabs.indexOf(a.tab) - this._tabs.indexOf(b.tab));
    this._pairs = pairs;

    // 4. Assign indices + auto-generate IDs.
    this._tabs.forEach((tab, i) => {
      tab.dataset['tabIndex'] = String(i);
      if (!tab.id) {
        tab.id = `core-tab-${this._uid}-${i}`;
        // Explicit setAttribute for synchronous readback (Lit @property reflect is async).
        tab.setAttribute('id', tab.id);
      }
    });

    this._panels.forEach((panel, i) => {
      panel.dataset['panelIndex'] = String(i);
      if (!panel.id) {
        const autoId = `core-tabpanel-${this._uid}-${i}`;
        panel.id = autoId;
        panel.setAttribute('id', autoId);
        panel.dataset['panelId'] = autoId;
      }
    });

    // 5. Clamp selectedIndex.
    if (this._pairs.length > 0 && this.selectedIndex >= this._pairs.length) {
      this.selectedIndex = this._pairs.length - 1;
      this.setAttribute('selected-index', String(this.selectedIndex));
    }

    // 6. Wire ARIA + visibility.
    this._applyAria();
    this._repositionIndicator();
  }

  // ── ARIA wiring ──────────────────────────────────────────────────────────

  private _applyAria(): void {
    this._pairs.forEach(({ tab, panel }, i) => {
      const isSelected = i === this.selectedIndex;

      // Tab ARIA
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('aria-controls', panel.id);
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      if (tab.disabled) {
        tab.setAttribute('aria-disabled', 'true');
      } else {
        tab.removeAttribute('aria-disabled');
      }

      // Panel ARIA
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.setAttribute('tabindex', '0');
      panel.setAttribute('aria-selected', String(isSelected));

      // Panel visibility
      if (isSelected) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    // Tabs without pairs
    this._tabs.forEach((tab) => {
      const inPairs = this._pairs.some((p) => p.tab === tab);
      if (!inPairs) {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      }
    });

    this._focusedIndex = this.selectedIndex;
  }

  // ── Indicator positioning ────────────────────────────────────────────────

  private _repositionIndicator(): void {
    const indicator = this.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement | null;
    if (!indicator) return;
    const activeTab = this._pairs[this.selectedIndex]?.tab;
    if (!activeTab) return;

    const tablistEl = this.shadowRoot?.querySelector('[part="tablist"]') as HTMLElement | null;
    if (!tablistEl) return;

    const tabRect = activeTab.getBoundingClientRect();
    const listRect = tablistEl.getBoundingClientRect();

    // happy-dom: getBoundingClientRect() returns zeros — this is a no-op in tests.
    // Real-browser visual fidelity covered by Playwright sweep.
    // Playwright sweep covers indicator slide animation + real pixel positioning.
    if (this.orientation === 'vertical') {
      const top = tabRect.top - listRect.top;
      const height = tabRect.height;
      indicator.style.transform = `translateY(${top}px)`;
      indicator.style.height = `${height}px`;
    } else {
      const left = tabRect.left - listRect.left;
      const width = tabRect.width;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.width = `${width}px`;
    }
  }

  // ── Activation ───────────────────────────────────────────────────────────

  private _activate(index: number): void {
    if (index < 0 || index >= this._pairs.length) return;
    const previousIndex = this.selectedIndex;
    if (index === previousIndex) return;

    const { tab, panel } = this._pairs[index];

    const event = new CustomEvent('core-tab-change', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { index, previousIndex, tab, panel },
    });
    this.dispatchEvent(event);

    if (event.defaultPrevented) return;

    this.selectedIndex = index;
    // Explicit setAttribute for synchronous readback (Lit @property reflect is async).
    this.setAttribute('selected-index', String(index));
    this._focusedIndex = index;
    this._applyAria();
    this._repositionIndicator();
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private _onTabClick = (e: Event): void => {
    const customEv = e as CustomEvent;
    const tab = customEv.detail?.tab as CoreTab | undefined;
    if (!tab) return;
    const index = this._pairs.findIndex((p) => p.tab === tab);
    if (index < 0) return;
    if (tab.disabled) return;
    this._activate(index);
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    const { key } = e;
    const isHorizontal = this.orientation === 'horizontal';
    const isVertical = this.orientation === 'vertical';

    let handled = false;

    if ((isHorizontal && key === 'ArrowRight') || (isVertical && key === 'ArrowDown')) {
      this._moveFocus(1);
      handled = true;
    } else if ((isHorizontal && key === 'ArrowLeft') || (isVertical && key === 'ArrowUp')) {
      this._moveFocus(-1);
      handled = true;
    } else if (key === 'Home') {
      this._moveFocusTo('first');
      handled = true;
    } else if (key === 'End') {
      this._moveFocusTo('last');
      handled = true;
    } else if ((key === 'Space' || key === 'Enter') && this.activation === 'manual') {
      // Manual mode: Space/Enter activates the focused tab.
      this._activate(this._focusedIndex);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
    }
  };

  // ── Keyboard nav helpers ─────────────────────────────────────────────────

  /**
   * Move focus by `delta` (+1 = next, -1 = prev), wrapping at boundaries,
   * skipping disabled tabs. If activation="auto", also activates.
   */
  private _moveFocus(delta: number): void {
    const next = this._nextEnabledIndex(this._focusedIndex, delta);
    if (next === -1) return; // all disabled — no-op
    this._focusedIndex = next;
    this._applyFocusTabindex(next);
    if (this.activation === 'auto') {
      this._activate(next);
    }
  }

  private _moveFocusTo(target: 'first' | 'last'): void {
    const dir = target === 'first' ? 1 : -1;
    const start = target === 'first' ? -1 : this._pairs.length;
    const next = this._nextEnabledIndex(start, dir);
    if (next === -1) return;
    this._focusedIndex = next;
    this._applyFocusTabindex(next);
    if (this.activation === 'auto') {
      this._activate(next);
    }
  }

  /**
   * Find the next enabled tab index starting from `from`, stepping by `delta`.
   * Wraps around boundaries. Returns -1 if no enabled tab exists.
   */
  private _nextEnabledIndex(from: number, delta: number): number {
    const len = this._pairs.length;
    if (len === 0) return -1;
    let steps = 0;
    let i = ((from + delta) % len + len) % len;
    while (steps < len) {
      if (!this._pairs[i].tab.disabled) return i;
      i = ((i + delta) % len + len) % len;
      steps++;
    }
    return -1; // all disabled
  }

  /** Update tabindex on all tabs so only `focusedIndex` has tabindex="0". */
  private _applyFocusTabindex(focusedIndex: number): void {
    this._pairs.forEach(({ tab }, i) => {
      tab.setAttribute('tabindex', i === focusedIndex ? '0' : '-1');
    });
    // Attempt focus (no-op in happy-dom; real browser moves focus).
    // Playwright sweep covers actual focus movement.
    const focusTarget = this._pairs[focusedIndex]?.tab;
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-tabs': CoreTabs;
  }
}

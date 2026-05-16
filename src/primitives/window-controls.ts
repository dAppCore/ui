// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — macOS variant ported from
// core/ide/frontend/lit/src/elements/mac-window.ts (MacTrafficLights, 2026-05-07);
// Windows + Linux variants are net-new.
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CoreElement } from './_shared/light-dom';
import { getPlatform, type Platform } from '../platform/platform';

export type WindowPlatform = 'macos' | 'windows' | 'linux';
export type WindowState = 'active' | 'inactive';

function detectInitialPlatform(): WindowPlatform | 'hidden' {
  const p: Platform = getPlatform();
  if (p === 'macos') return 'macos';
  if (p === 'windows') return 'windows';
  if (p === 'linux') return 'linux';
  return 'hidden'; // ios, android, unknown → render nothing visible
}

/**
 * `<core-window-controls>` — platform-aware traffic-lights / window-control
 * buttons. macOS = red/yellow/green circles top-left; Windows = thin square
 * icons top-right; Linux = GNOME-style top-right by default.
 *
 *   <core-window-controls></core-window-controls>           (auto-detect)
 *   <core-window-controls platform="windows"></core-window-controls>
 *
 * Attributes (reflected):
 *   platform  'macos' | 'windows' | 'linux'  (default: detected via platform/)
 *   state     'active' | 'inactive'           (default 'active')
 *
 * Slots: none
 * Parts: base, control (each button — distinguished by [data-action="close|minimise|maximise"])
 * Events: core-window-close, core-window-minimise, core-window-maximise
 *         (all composed, bubbles)
 * Vars:  --core-window-controls-{spacing, size,
 *                                 color-close, color-minimise, color-maximise,
 *                                 hover-darken}
 *
 * Behaviour on iOS/Android/unknown: the host renders an empty <base> and CSS
 * sets display: none. Set platform attribute explicitly to force a variant.
 */
@customElement('core-window-controls')
export class CoreWindowControls extends CoreElement {
  @property({ reflect: true }) platform: WindowPlatform | '' = '';
  @property({ reflect: true }) state: WindowState = 'active';

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.platform) {
      const detected = detectInitialPlatform();
      if (detected !== 'hidden') this.platform = detected;
      else this.setAttribute('platform', 'hidden');
    }
  }

  private _emit(action: 'close' | 'minimise' | 'maximise'): void {
    this.dispatchEvent(new CustomEvent(`core-window-${action}`, {
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    if (this.getAttribute('platform') === 'hidden') {
      return html`<span part="base"></span>`;
    }
    return html`
      <span part="base">
        <button
          part="control"
          data-action="close"
          type="button"
          aria-label="Close"
          @click=${() => this._emit('close')}
        ></button>
        <button
          part="control"
          data-action="minimise"
          type="button"
          aria-label="Minimise"
          @click=${() => this._emit('minimise')}
        ></button>
        <button
          part="control"
          data-action="maximise"
          type="button"
          aria-label="Maximise"
          @click=${() => this._emit('maximise')}
        ></button>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-window-controls': CoreWindowControls;
  }
}

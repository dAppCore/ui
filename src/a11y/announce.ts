// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

const HOST_ID = 'core-a11y-announcer';
let politeEl: HTMLElement | null = null;
let assertiveEl: HTMLElement | null = null;

function ensureHost(): { polite: HTMLElement; assertive: HTMLElement } {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
      'overflow:hidden;clip:rect(0,0,0,0);border:0;';
    document.body.appendChild(host);
    // If the host vanished (e.g. document.body.innerHTML = '' in a test),
    // any cached region nodes are now detached — discard them.
    politeEl = null;
    assertiveEl = null;
  }
  if (!politeEl) {
    politeEl = document.createElement('div');
    politeEl.setAttribute('aria-live', 'polite');
    politeEl.setAttribute('aria-atomic', 'true');
    host.appendChild(politeEl);
  }
  if (!assertiveEl) {
    assertiveEl = document.createElement('div');
    assertiveEl.setAttribute('aria-live', 'assertive');
    assertiveEl.setAttribute('aria-atomic', 'true');
    host.appendChild(assertiveEl);
  }
  return { polite: politeEl, assertive: assertiveEl };
}

/**
 * Send a message to the appropriate aria-live region. Default level is "polite".
 * The singleton host is lazy-created on first call and reused thereafter.
 */
export function announce(
  text: string,
  level: 'polite' | 'assertive' = 'polite',
): void {
  const { polite, assertive } = ensureHost();
  const target = level === 'assertive' ? assertive : polite;
  // Toggle textContent so screen readers re-announce identical messages.
  target.textContent = '';
  // requestAnimationFrame ensures the clear is observed before the new text.
  requestAnimationFrame(() => { target.textContent = text; });
}

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

/**
 * Add an event listener that auto-removes when the passed AbortSignal aborts.
 * If no signal is passed, returns a fresh AbortController whose abort() removes
 * the listener.
 *
 *   const ctrl = addAbortableListener(window, 'resize', onResize);
 *   ctrl.abort();   // listener removed
 *
 * We pass the signal to addEventListener (native auto-removal in modern
 * browsers) *and* attach a one-shot abort handler that calls
 * removeEventListener directly. The latter is defensive against runtimes
 * where signal-driven auto-removal isn't honoured (notably happy-dom).
 */
export function addAbortableListener<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  handler: (ev: WindowEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): AbortController;
export function addAbortableListener<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  handler: (ev: DocumentEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): AbortController;
export function addAbortableListener<K extends keyof HTMLElementEventMap>(
  target: Element,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): AbortController;
export function addAbortableListener(
  target: EventTarget,
  type: string,
  handler: (ev: Event) => void,
  opts: AddEventListenerOptions = {},
): AbortController {
  const ctrl = opts.signal ? null : new AbortController();
  const signal = opts.signal ?? ctrl!.signal;
  const listenerOpts = { ...opts, signal };
  target.addEventListener(type, handler as EventListener, listenerOpts);
  // Defensive: ensure the listener is removed when the signal aborts even
  // if the runtime ignores signal-driven removal.
  const onAbort = (): void => {
    target.removeEventListener(type, handler as EventListener, listenerOpts);
    signal.removeEventListener('abort', onAbort);
  };
  if (signal.aborted) onAbort();
  else signal.addEventListener('abort', onAbort);
  return ctrl ?? new AbortController(); // if caller passed a signal, returned ctrl is independent (unused)
}

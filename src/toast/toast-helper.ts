// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import type { CoreToast, Severity } from './toast';
import type { CoreToastRegion } from './toast-region';

/**
 * Toast programmatic helper — module-level singleton with lazy region creation.
 *
 * Usage:
 *   import { toast } from '@dappcore/ui/toast';
 *
 *   toast.success('Saved!');
 *   const id = toast.error('Failed.', { duration: 0 });
 *   toast.dismiss(id);
 *   toast.dismissAll();
 *
 * Module-level state (reset only by removing the region from DOM):
 *   _defaultRegion — lazy-created <core-toast-region position="top-right">
 *   _toastUid      — monotonic counter for id generation
 *
 * ID format: "core-toast-{++_toastUid}"
 * Set on toast via data-toast-id attribute.
 *
 * getRegion() re-creates the singleton if the region is no longer connected
 * to the DOM (e.g. test teardown or SPA navigation).
 */

export interface ToastOptions {
  severity?: Severity;
  duration?: number;
  region?: CoreToastRegion;
}

export interface ToastAPI {
  show(message: string, opts?: ToastOptions): string;
  info(message: string, opts?: Omit<ToastOptions, 'severity'>): string;
  success(message: string, opts?: Omit<ToastOptions, 'severity'>): string;
  warning(message: string, opts?: Omit<ToastOptions, 'severity'>): string;
  error(message: string, opts?: Omit<ToastOptions, 'severity'>): string;
  dismiss(id: string): void;
  dismissAll(): void;
  getRegion(): CoreToastRegion;
}

// Module-level state
let _defaultRegion: CoreToastRegion | null = null;
let _toastUid = 0;

function nextToastId(): string {
  return `core-toast-${++_toastUid}`;
}

function getRegion(): CoreToastRegion {
  if (_defaultRegion && _defaultRegion.isConnected) return _defaultRegion;
  _defaultRegion = document.createElement('core-toast-region') as CoreToastRegion;
  _defaultRegion.setAttribute('position', 'top-right');
  document.body.appendChild(_defaultRegion);
  return _defaultRegion;
}

function show(message: string, opts: ToastOptions = {}): string {
  const region = opts.region ?? getRegion();
  const toastEl = document.createElement('core-toast') as CoreToast;

  const severity: Severity = opts.severity ?? 'info';
  toastEl.setAttribute('severity', severity);

  if (opts.duration !== undefined) {
    toastEl.setAttribute('duration', String(opts.duration));
  }

  const id = nextToastId();
  toastEl.setAttribute('data-toast-id', id);
  toastEl.textContent = message;

  region.addToast(toastEl);
  return id;
}

function info(message: string, opts: Omit<ToastOptions, 'severity'> = {}): string {
  return show(message, { ...opts, severity: 'info' });
}

function success(message: string, opts: Omit<ToastOptions, 'severity'> = {}): string {
  return show(message, { ...opts, severity: 'success' });
}

function warning(message: string, opts: Omit<ToastOptions, 'severity'> = {}): string {
  return show(message, { ...opts, severity: 'warning' });
}

function error(message: string, opts: Omit<ToastOptions, 'severity'> = {}): string {
  return show(message, { ...opts, severity: 'error' });
}

function dismiss(id: string): void {
  const region = _defaultRegion;
  if (!region) return;
  const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast | null;
  if (el && typeof el.close === 'function') {
    el.close();
  }
}

function dismissAll(): void {
  if (_defaultRegion) {
    _defaultRegion.clear();
  }
}

export const toast: ToastAPI = {
  show,
  info,
  success,
  warning,
  error,
  dismiss,
  dismissAll,
  getRegion,
};

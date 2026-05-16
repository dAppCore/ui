// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function prefersContrast(): 'no-preference' | 'more' | 'less' {
  if (window.matchMedia('(prefers-contrast: more)').matches) return 'more';
  if (window.matchMedia('(prefers-contrast: less)').matches) return 'less';
  return 'no-preference';
}

export function prefersColorScheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

class MediaQueryController implements ReactiveController {
  private mq: MediaQueryList;
  private listener: (ev: MediaQueryListEvent) => void;
  value: boolean;
  constructor(
    host: ReactiveControllerHost,
    query: string,
  ) {
    this.mq = window.matchMedia(query);
    this.value = this.mq.matches;
    this.listener = (ev) => { this.value = ev.matches; host.requestUpdate(); };
    host.addController(this);
  }
  hostConnected(): void { this.mq.addEventListener('change', this.listener); }
  hostDisconnected(): void { this.mq.removeEventListener('change', this.listener); }
}

export class PrefersReducedMotionController extends MediaQueryController {
  constructor(host: ReactiveControllerHost) { super(host, '(prefers-reduced-motion: reduce)'); }
}

export class PrefersDarkController extends MediaQueryController {
  constructor(host: ReactiveControllerHost) { super(host, '(prefers-color-scheme: dark)'); }
}

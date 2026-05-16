// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Generic observer controller — Resize, Intersection, Mutation share the shape. */
abstract class BaseObserverController<T> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  protected observer: T | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void { this.observer = this.createObserver(); this.start(); }
  hostDisconnected(): void { this.stop(); this.observer = null; }

  protected requestUpdate(): void { this.host.requestUpdate(); }

  protected abstract createObserver(): T;
  protected abstract start(): void;
  protected abstract stop(): void;
}

export class ResizeObserverController extends BaseObserverController<ResizeObserver> {
  size: { width: number; height: number } | null = null;
  constructor(host: ReactiveControllerHost, private target: () => Element | null) {
    super(host);
  }
  protected createObserver(): ResizeObserver {
    return new ResizeObserver((entries) => {
      const e = entries[0];
      this.size = { width: e.contentRect.width, height: e.contentRect.height };
      this.requestUpdate();
    });
  }
  protected start(): void {
    const t = this.target();
    if (t) this.observer?.observe(t);
  }
  protected stop(): void { this.observer?.disconnect(); }
}

export class IntersectionObserverController extends BaseObserverController<IntersectionObserver> {
  intersecting = false;
  ratio = 0;
  constructor(
    host: ReactiveControllerHost,
    private target: () => Element | null,
    private opts: IntersectionObserverInit = {},
  ) { super(host); }
  protected createObserver(): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      const e = entries[0];
      this.intersecting = e.isIntersecting;
      this.ratio = e.intersectionRatio;
      this.requestUpdate();
    }, this.opts);
  }
  protected start(): void {
    const t = this.target();
    if (t) this.observer?.observe(t);
  }
  protected stop(): void { this.observer?.disconnect(); }
}

export class MutationObserverController extends BaseObserverController<MutationObserver> {
  records: MutationRecord[] = [];
  constructor(
    host: ReactiveControllerHost,
    private target: () => Node | null,
    private opts: MutationObserverInit = { attributes: true, childList: false, subtree: false },
  ) { super(host); }
  protected createObserver(): MutationObserver {
    return new MutationObserver((records) => {
      this.records = records;
      this.requestUpdate();
    });
  }
  protected start(): void {
    const t = this.target();
    if (t) this.observer?.observe(t, this.opts);
  }
  protected stop(): void { this.observer?.disconnect(); }
}

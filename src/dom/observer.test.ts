// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, vi } from 'vitest';
import { MutationObserverController } from './observer';
import type { ReactiveControllerHost } from 'lit';

function makeHost(): ReactiveControllerHost & { requested: number } {
  const controllers: any[] = [];
  return {
    addController(c: any) { controllers.push(c); },
    removeController(_c: any) {},
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
    requested: 0,
  } as any;
}

describe('MutationObserverController', () => {
  it('observes attribute changes on target and requests host update', async () => {
    const host = makeHost();
    const el = document.createElement('div');
    document.body.appendChild(el);
    const ctrl = new MutationObserverController(host, () => el);
    ctrl.hostConnected();
    el.setAttribute('data-foo', 'bar');
    // Mutation observers fire microtask-async
    await new Promise((r) => setTimeout(r, 0));
    expect(host.requestUpdate).toHaveBeenCalled();
    ctrl.hostDisconnected();
  });
});

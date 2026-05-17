// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import '@dappcore/ui/toast';
import { toast } from '@dappcore/ui/toast/toast-helper';
import type { CoreToast } from '@dappcore/ui/toast/toast';

function cleanup(): void {
  document.body.querySelectorAll('core-toast-region').forEach((el) => el.remove());
}

async function getToastWithSeverity(severity: 'info' | 'success' | 'warning' | 'error'): Promise<CoreToast> {
  const region = toast.getRegion();
  const id = toast.show(`Test ${severity}`, { severity, duration: 0 });
  const el = region.querySelector(`[data-toast-id="${id}"]`) as CoreToast;
  await el.updateComplete;
  return el;
}

describe('toast/v10 — severity ARIA roles integration', () => {
  afterEach(cleanup);

  it('severity="info" renders role="status" on [part="toast"]', async () => {
    const el = await getToastWithSeverity('info');
    const part = el.shadowRoot?.querySelector('[part="toast"]');
    expect(part?.getAttribute('role')).toBe('status');
  });

  it('severity="success" renders role="status" on [part="toast"]', async () => {
    const el = await getToastWithSeverity('success');
    const part = el.shadowRoot?.querySelector('[part="toast"]');
    expect(part?.getAttribute('role')).toBe('status');
  });

  it('severity="warning" renders role="alert" on [part="toast"]', async () => {
    const el = await getToastWithSeverity('warning');
    const part = el.shadowRoot?.querySelector('[part="toast"]');
    expect(part?.getAttribute('role')).toBe('alert');
  });

  it('severity="error" renders role="alert" on [part="toast"]', async () => {
    const el = await getToastWithSeverity('error');
    const part = el.shadowRoot?.querySelector('[part="toast"]');
    expect(part?.getAttribute('role')).toBe('alert');
  });

  it('dismiss button aria-label is "Dismiss notification" on every severity', async () => {
    for (const sev of ['info', 'success', 'warning', 'error'] as const) {
      const el = await getToastWithSeverity(sev);
      const btn = el.shadowRoot?.querySelector('[part="close-button"]');
      expect(btn?.getAttribute('aria-label')).toBe('Dismiss notification');
    }
  });

  it('default singleton region has aria-label="Notifications"', () => {
    toast.show('Check region label');
    const region = toast.getRegion();
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBe('Notifications');
  });
});

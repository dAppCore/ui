// SPDX-Licence-Identifier: EUPL-1.2
// Integration: aria-describedby lifecycle for <core-tooltip>.
import { describe, it, expect } from 'vitest';
import '../../../../src/surfaces';

async function nextFrame(): Promise<void> {
  await new Promise((r) => requestAnimationFrame(r));
}

describe('integration: tooltip accessibility wiring', () => {
  it('aria-describedby is set on anchor after tooltip connects', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-1';
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-1');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();

    const described = anchor.getAttribute('aria-describedby') ?? '';
    expect(described).toContain(tip.id);
    tip.remove();
    anchor.remove();
  });

  it('aria-describedby is removed from anchor after tooltip disconnects', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-2';
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-2');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();

    const id = tip.id;
    tip.remove();
    await nextFrame();

    const described = anchor.getAttribute('aria-describedby') ?? '';
    expect(described).not.toContain(id);
    anchor.remove();
  });

  it('preserves pre-existing aria-describedby when tooltip connects', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-3';
    anchor.setAttribute('aria-describedby', 'prior-description');
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-3');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();

    const described = anchor.getAttribute('aria-describedby') ?? '';
    expect(described).toContain('prior-description');
    expect(described).toContain(tip.id);
    tip.remove();
    anchor.remove();
  });

  it('restores pre-existing aria-describedby when tooltip disconnects', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-4';
    anchor.setAttribute('aria-describedby', 'restore-me');
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-4');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();
    tip.remove();
    await nextFrame();

    expect(anchor.getAttribute('aria-describedby')).toBe('restore-me');
    anchor.remove();
  });

  it('tooltip id is stable (same id before and after show)', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-5';
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-5');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();

    const idBefore = tip.id;
    tip.show();
    await new Promise((r) => setTimeout(r, 300));
    expect(tip.id).toBe(idBefore);
    tip.hide();
    tip.remove();
    anchor.remove();
  });

  it('hover trigger (mouseenter) shows tooltip; mouseleave hides it', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-6';
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-6');
    tip.setAttribute('delay-in', '0');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();

    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    expect(['opening', 'open']).toContain(tip.getAttribute('data-state'));

    anchor.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 100));
    expect(['closing', 'closed']).toContain(tip.getAttribute('data-state'));
    tip.remove();
    anchor.remove();
  });

  it('focus trigger (focusin) shows tooltip; focusout hides it', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'a11y-anchor-7';
    document.body.appendChild(anchor);
    const tip = document.createElement('core-tooltip') as any;
    tip.setAttribute('anchor', '#a11y-anchor-7');
    document.body.appendChild(tip);
    await tip.updateComplete;
    await nextFrame();

    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    expect(['opening', 'open']).toContain(tip.getAttribute('data-state'));

    anchor.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 100));
    expect(['closing', 'closed']).toContain(tip.getAttribute('data-state'));
    tip.remove();
    anchor.remove();
  });
});

// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.

const counters = new Map<string, number>();

/** Generate a stable, monotonically-increasing id for a given prefix. */
export function generateId(prefix: string): string {
  const n = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, n);
  return `${prefix}-${n}`;
}

/** Convenience setter that also accepts null to remove the attribute. */
export function setAriaLabel(el: Element, label: string | null): void {
  if (label === null) el.removeAttribute('aria-label');
  else el.setAttribute('aria-label', label);
}

/** Wire `input.aria-labelledby` to `label.id`, generating an id on the label if needed. */
export function linkLabelledBy(input: Element, label: Element): void {
  if (!label.id) label.id = generateId('core-label');
  const existing = input.getAttribute('aria-labelledby');
  const ids = new Set(existing ? existing.split(/\s+/) : []);
  ids.add(label.id);
  input.setAttribute('aria-labelledby', Array.from(ids).join(' '));
}

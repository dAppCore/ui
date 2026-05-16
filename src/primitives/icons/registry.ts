// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.

/**
 * An icon entry in the registry. `svg` is the raw `<svg>…</svg>` markup
 * (consumers control viewBox, stroke, fill, gradients — the registry
 * doesn't parse or validate). `title` is the accessible label used as
 * fallback when `<core-icon>` is not decorative and no `aria-label` is
 * provided by the consumer.
 */
export interface IconEntry {
  svg: string;
  title?: string;
}

const registry = new Map<string, IconEntry>();

/**
 * Register an icon by name. Last write wins — consumers may override
 * defaults by re-registering with the same name.
 *
 *   registerIcon('rocket', '<svg viewBox="0 0 16 16">...</svg>');
 *   registerIcon('rocket', { svg: '<svg>...</svg>', title: 'Rocket' });
 */
export function registerIcon(name: string, entry: string | IconEntry): void {
  const normalised: IconEntry = typeof entry === 'string' ? { svg: entry } : entry;
  registry.set(name, normalised);
}

/** Get a registered icon by name, or null if not registered. */
export function getIcon(name: string): IconEntry | null {
  return registry.get(name) ?? null;
}

/** List all registered icon names. */
export function listIcons(): string[] {
  return Array.from(registry.keys());
}

/** Remove an icon. Returns true if the icon was registered, false otherwise. */
export function unregisterIcon(name: string): boolean {
  return registry.delete(name);
}

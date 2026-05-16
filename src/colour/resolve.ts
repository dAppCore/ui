// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.2 — no upstream in core/ide.
import type { Colour } from './types';
import { parseColour } from './parse';

export function resolveCssVar(
  name: `--${string}`,
  scope: Element = document.documentElement,
): string {
  return getComputedStyle(scope).getPropertyValue(name).trim();
}

export function resolveColour(
  name: `--${string}`,
  scope: Element = document.documentElement,
): Colour {
  const raw = resolveCssVar(name, scope);
  if (!raw) throw new Error(`resolveColour: var ${name} is empty/unset`);
  return parseColour(raw);
}

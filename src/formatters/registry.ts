// SPDX-Licence-Identifier: EUPL-1.2

/**
 * Pipe registry — the unified formatter mechanism.
 *
 * Three surfaces resolve here:
 *   1. <core-format pipe="…">value</core-format>
 *   2. {value | name:arg | other-name:arg} inline in templates
 *   3. <core-format-name value=${v}></core-format-name>
 *
 * Server side, the same grammar is implemented in dappco.re/go/html.
 * Pipe names + argument semantics are shared by contract.
 *
 * Usage example:
 *
 *   import { registerFormatter, applyPipe } from '@dappcore/ui/formatters';
 *
 *   registerFormatter('upper', (v: unknown) => String(v).toUpperCase());
 *   applyPipe('hello | upper'); // → "HELLO"
 */

export type Formatter = (value: unknown, ...args: string[]) => unknown;

interface PipeStep {
  name: string;
  args: string[];
}

const registry = new Map<string, Formatter>();

/**
 * Register a named formatter. Calling again with the same name replaces
 * the existing formatter (last-write-wins). Returns the formatter so
 * registration can be inlined into a const declaration.
 */
export function registerFormatter(name: string, fn: Formatter): Formatter {
  if (!isValidName(name)) {
    throw new Error(`registerFormatter: invalid name "${name}" — use lowercase ascii with - or _`);
  }
  registry.set(name, fn);
  return fn;
}

/**
 * Look up a registered formatter. Returns `undefined` when not found.
 */
export function getFormatter(name: string): Formatter | undefined {
  return registry.get(name);
}

/**
 * Names of every registered formatter, sorted alphabetically.
 * Useful for documentation surfaces and tooling.
 */
export function listFormatters(): string[] {
  // Explicit comparator — Sonar's S2871 flags bare .sort() because the
  // default UTF-16-code-unit ordering surprises with mixed-case or
  // Unicode keys. localeCompare gives deterministic locale-aware order.
  return Array.from(registry.keys()).sort((a, b) => a.localeCompare(b));
}

/**
 * Parse a pipe expression into ordered steps.
 *
 * `bytes | truncate:40:…` → [{name:'bytes',args:[]},{name:'truncate',args:['40','…']}]
 *
 * Splits on top-level `|`, then on `:`. No quoting/escaping in v0;
 * register a single-purpose formatter when a literal `|` or `:` is needed.
 */
export function parsePipe(expr: string): PipeStep[] {
  if (!expr || typeof expr !== 'string') return [];
  return expr
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const parts = segment.split(':').map((s) => s.trim());
      const name = parts[0]!;
      const args = parts.slice(1);
      return { name, args };
    });
}

/**
 * Apply a pipe expression to a value. Unknown formatter names raise.
 * Pipe steps are applied left-to-right; the output of each step is the
 * input of the next.
 */
export function applyPipe(expr: string, value: unknown): unknown {
  const steps = parsePipe(expr);
  let current = value;
  for (const step of steps) {
    const fn = registry.get(step.name);
    if (!fn) {
      throw new Error(`applyPipe: unknown formatter "${step.name}" (have: ${listFormatters().join(', ') || 'none'})`);
    }
    current = fn(current, ...step.args);
  }
  return current;
}

/**
 * Apply a single named formatter without parsing a pipe expression.
 * Convenience wrapper for callers that already know the formatter name.
 */
export function applyFormatter(name: string, value: unknown, ...args: string[]): unknown {
  const fn = registry.get(name);
  if (!fn) {
    throw new Error(`applyFormatter: unknown formatter "${name}"`);
  }
  return fn(value, ...args);
}

/**
 * Reset the registry. Test-only helper; not exported from the package
 * root. Tests import directly from this module.
 */
export function resetRegistry(): void {
  registry.clear();
}

const NAME_PATTERN = /^[a-z][a-z0-9_-]*$/;

function isValidName(name: string): boolean {
  return typeof name === 'string' && NAME_PATTERN.test(name);
}

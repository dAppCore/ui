// SPDX-Licence-Identifier: EUPL-1.2

/**
 * Formatter context — domain-scoped shared values.
 *
 * Replacement for Angular's DI-injected services in pure-function
 * formatters. The app shell sets context once at boot; formatters that
 * need contextual data (mining pool symbol, coin divisor, currency
 * defaults) read from here instead of taking it as a positional arg
 * every call.
 *
 * Domains are arbitrary strings; conventional names below. Pipe args
 * always win over context defaults, so a template can override per-call.
 *
 * Usage example:
 *
 *   import { setFormatterContext } from '@dappcore/ui/formatters';
 *
 *   setFormatterContext('mining', {
 *     symbol: 'LTHN',
 *     coin_divisor: 1e12,
 *     coin_block_time: 120,
 *     graph: false,
 *   });
 *
 *   applyPipe('value | symbol', 10);      // → "10 LTHN"
 *   applyPipe('value | to-coin', 1e12);   // → "1.000000000000"
 */

type Context = Record<string, unknown>;

const store: Map<string, Context> = new Map();

/**
 * Merge values into a context domain. Existing keys are overwritten;
 * unrelated keys preserved. Safe to call repeatedly.
 */
export function setFormatterContext(domain: string, values: Context): void {
  const existing = store.get(domain) ?? {};
  store.set(domain, { ...existing, ...values });
}

/**
 * Read a single value from a context domain. Returns `undefined` when
 * the domain hasn't been set or the key isn't present. Callers should
 * provide their own fallback — context is best-effort.
 */
export function getFormatterContext<T = unknown>(domain: string, key: string): T | undefined {
  return store.get(domain)?.[key] as T | undefined;
}

/**
 * Replace an entire domain. Useful for tests and for shell-handover
 * scenarios where the previous context must not bleed through.
 */
export function replaceFormatterContext(domain: string, values: Context): void {
  store.set(domain, { ...values });
}

/**
 * Wipe every context domain. Test-only helper.
 */
export function resetFormatterContext(): void {
  store.clear();
}

/**
 * Known domain names — conventional, not enforced. Documented here so
 * tooling can autocomplete and the polyglot stack (go-html, CorePHP)
 * uses identical keys.
 *
 * | Domain   | Keys                                                |
 * |----------|-----------------------------------------------------|
 * | mining   | symbol, coin_divisor, coin_block_time, graph,       |
 * |          | block_explorer, explorer_type                       |
 * | currency | default, locale                                     |
 * | locale   | lang, region                                        |
 */

// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `bytes` formatter — human-readable file sizes.
 *
 * Usage example:
 *
 *   bytes(1024)            → "1.0 kB"
 *   bytes(1024, 'binary')  → "1.0 KiB"
 *   bytes(0)               → "0 B"
 *   bytes(1536, 'binary')  → "1.5 KiB"
 *
 * Default is the SI / decimal scale (1000-base, kB/MB/GB) — what most
 * users see in everyday contexts (operating system file listings, web
 * downloads). Pass `binary` for the 1024-base scale (KiB/MiB/GiB).
 */

const SI_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const BINARY_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

export function bytes(value: unknown, mode: string = ''): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0 B';

  const binary = mode === 'binary';
  const base = binary ? 1024 : 1000;
  const units = binary ? BINARY_UNITS : SI_UNITS;

  if (n === 0) return '0 B';

  const abs = Math.abs(n);
  const exp = Math.min(Math.floor(Math.log(abs) / Math.log(base)), units.length - 1);
  const scaled = abs / Math.pow(base, exp);

  // 0 dp for B, 1 dp for everything else — same convention as
  // `du -h` and most file managers.
  const precision = exp === 0 ? 0 : 1;
  const formatted = scaled.toFixed(precision);

  const sign = n < 0 ? '-' : '';
  return `${sign}${formatted} ${units[exp]}`;
}

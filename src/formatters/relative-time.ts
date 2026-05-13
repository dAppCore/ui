// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `relative-time` formatter — date → "3 hours ago" / "in 2 days".
 *
 * Converted from the Angular TimeAgoPipe (DEC 2021), expanded to also
 * handle future dates via `Intl.RelativeTimeFormat` for locale
 * correctness. Aliased as `time-ago` for migration compatibility.
 *
 * Accepts:
 *   - `Date` instances
 *   - ISO-8601 strings (`"2026-05-13T20:00:00Z"`)
 *   - Numeric millisecond timestamps
 *
 * Usage example:
 *
 *   relativeTime(Date.now() - 3 * 3600 * 1000)  → "3 hours ago"
 *   relativeTime(Date.now() + 2 * 86400 * 1000) → "in 2 days"
 */

const RANGES: Array<[number, Intl.RelativeTimeFormatUnit]> = [
  [60, 'second'],
  [60 * 60, 'minute'],
  [60 * 60 * 24, 'hour'],
  [60 * 60 * 24 * 30, 'day'],
  [60 * 60 * 24 * 365, 'month'],
  [Infinity, 'year'],
];

const UNIT_SECONDS: Record<Intl.RelativeTimeFormatUnit, number> = {
  second: 1,
  seconds: 1,
  minute: 60,
  minutes: 60,
  hour: 60 * 60,
  hours: 60 * 60,
  day: 60 * 60 * 24,
  days: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7,
  weeks: 60 * 60 * 24 * 7,
  month: 60 * 60 * 24 * 30,
  months: 60 * 60 * 24 * 30,
  quarter: 60 * 60 * 24 * 91,
  quarters: 60 * 60 * 24 * 91,
  year: 60 * 60 * 24 * 365,
  years: 60 * 60 * 24 * 365,
};

export function relativeTime(value: unknown): string {
  const target = toDate(value);
  if (!target) return '';
  const now = Date.now();
  const diffSeconds = (target.getTime() - now) / 1000;
  const absSeconds = Math.abs(diffSeconds);

  let unit: Intl.RelativeTimeFormatUnit = 'second';
  let divisor = 1;
  for (const [bound, candidate] of RANGES) {
    if (absSeconds < bound) {
      unit = candidate;
      divisor = UNIT_SECONDS[candidate]!;
      break;
    }
  }

  const rounded = Math.round(diffSeconds / divisor);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  return formatter.format(rounded, unit);
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

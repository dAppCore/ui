// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `effort-colour` formatter — value (0..200+) to RGB heatmap colour.
 *
 * Converted from the Angular EffortPipe (DEC 2021), where it powered
 * mining-pool block effort heatmaps. Output is a `rgb(r,g,b)` string
 * suitable for inline CSS or attribute binding.
 *
 * Gradient (anchored at 100% — "as-expected" effort):
 *   - 0..95     green spectrum (low effort = good — block found quickly)
 *   - 95..105   pure green (on-target)
 *   - 105..200  fading to yellow then red (over-effort = unlucky)
 *   - 200+      pure red (severely unlucky)
 *
 * Pass `valid=false` to bypass the gradient and render as `black`
 * (used when the underlying number is invalid / not-yet-computed).
 *
 * Usage example:
 *
 *   effortColour(50)             → "rgb(40,128,0)"
 *   effortColour(100)            → "rgb(80,128,0)" approx
 *   effortColour(180)            → "rgb(255,32,0)"
 *   effortColour(300)            → "rgb(255,0,0)"
 *   effortColour(50, 'invalid')  → "black"
 */

export function effortColour(value: unknown, validity: string = ''): string {
  if (validity === 'invalid' || validity === 'false') return 'black';
  if (value === null || value === undefined) return 'black';

  const n = Number(value);
  if (!Number.isFinite(n)) return 'black';

  const mid = 100;
  let r = 0;
  let g = 0;
  const b = 0;

  if (n <= 95) {
    r = Math.floor(80 * (n / mid));
    g = 128;
  } else if (n <= 105) {
    g = 128;
  } else if (n <= 200) {
    r = 255;
    g = Math.floor(160 * ((mid - (n % mid)) / mid));
  } else {
    r = 255;
  }

  return `rgb(${r},${g},${b})`;
}

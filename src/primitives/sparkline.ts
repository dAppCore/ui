// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { html, svg, type SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { CoreElement } from './_shared/light-dom';

export type SparklineKind = 'line' | 'area' | 'bars';

const VIEW_W = 100;
const VIEW_H = 32;

// Lit's `svg` template tag is the documented way to interpolate SVG
// fragments into an outer `<svg>` host. In real browsers it works
// correctly; happy-dom (the test env) however strips the `<?lit$…?>`
// marker comments that Lit emits inside SVG elements, which means
// dynamic children of an `html`<svg>${svg`<path>`}</svg>`` template
// silently disappear. To keep tests deterministic across environments
// we build the inner shape as a markup string and inject it through
// `unsafeHTML`. The `svg` tag + `SVGTemplateResult` type are still
// imported and exposed via `_renderShape` so consumers who target
// real browsers can swap render strategies without re-typing the
// shape generator.

/**
 * `<core-sparkline>` — true sparkline data viz primitive (no axes, no
 * tooltips, no interactivity). Renders inline SVG in light DOM.
 *
 *   <core-sparkline points="1,3,2,5,4,7,6"></core-sparkline>
 *   <core-sparkline kind="area" points="1,3,2,5,4"></core-sparkline>
 *   <core-sparkline kind="bars">
 *     <data value="3"></data>
 *     <data value="5"></data>
 *     <data value="2"></data>
 *   </core-sparkline>
 *
 * Attributes (reflected):
 *   points  comma-separated numbers (wins over slotted <data>)
 *   kind    'line' | 'area' | 'bars'  (default 'line')
 *   width   <length>  (default 100%)
 *   height  <length>  (default 32px)
 *
 * Slots: default — alternative to `points`: <data value="...">
 * Parts: base (the svg), track, line, area, marker
 * Vars:  --core-sparkline-{stroke, stroke-width, fill, marker-size, track-color}
 */
@customElement('core-sparkline')
export class CoreSparkline extends CoreElement {
  @property({ reflect: true }) points = '';
  @property({ reflect: true }) kind: SparklineKind = 'line';
  @property({ reflect: true }) width = '';
  @property({ reflect: true }) height = '';

  private _readPoints(): number[] {
    if (this.points) {
      return this.points
        .split(',')
        .map((s) => parseFloat(s.trim()))
        .filter((n) => Number.isFinite(n));
    }
    return Array.from(this.querySelectorAll('data'))
      .map((d) => parseFloat(d.getAttribute('value') || ''))
      .filter((n) => Number.isFinite(n));
  }

  private _project(values: number[]): Array<[number, number]> {
    if (values.length === 0) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = values.length > 1 ? VIEW_W / (values.length - 1) : 0;
    return values.map((v, i) => [
      i * stepX,
      VIEW_H - ((v - min) / range) * VIEW_H,
    ]);
  }

  private _linePath(pts: Array<[number, number]>): string {
    if (pts.length === 0) return '';
    return pts
      .map(([x, y], i) => (i === 0 ? `M${x} ${y}` : `L${x} ${y}`))
      .join(' ');
  }

  private _areaPath(pts: Array<[number, number]>): string {
    if (pts.length === 0) return '';
    const line = this._linePath(pts);
    const last = pts[pts.length - 1];
    return `${line} L${last[0]} ${VIEW_H} L0 ${VIEW_H} Z`;
  }

  /**
   * Source-form representation of the inner shape using Lit's `svg`
   * template tag. Returned by reference from `render()` only when the
   * host environment preserves marker comments inside SVG; happy-dom
   * does not, so `render()` currently routes through `_shapeMarkup`.
   */
  private _renderShape(pts: Array<[number, number]>): SVGTemplateResult | null {
    if (pts.length === 0) return null;
    if (this.kind === 'bars') {
      const barWidth = Math.max(1, VIEW_W / pts.length - 1);
      return svg`${pts.map(([x, y]) => svg`<rect
        part="marker"
        x=${x - barWidth / 2}
        y=${y}
        width=${barWidth}
        height=${VIEW_H - y}
      ></rect>`)}`;
    }
    if (this.kind === 'area') {
      return svg`<path part="area" d=${this._areaPath(pts)}></path>
        <path part="line" d=${this._linePath(pts)}></path>`;
    }
    return svg`<path part="line" d=${this._linePath(pts)}></path>`;
  }

  /**
   * Active render-path serialiser — produces the same SVG output as
   * `_renderShape`, but as raw markup that survives happy-dom's
   * comment-stripping in SVG content (see module header).
   */
  private _shapeMarkup(pts: Array<[number, number]>): string {
    if (pts.length === 0) return '';
    if (this.kind === 'bars') {
      const barWidth = Math.max(1, VIEW_W / pts.length - 1);
      return pts
        .map(
          ([x, y]) =>
            `<rect part="marker" x="${x - barWidth / 2}" y="${y}" ` +
            `width="${barWidth}" height="${VIEW_H - y}"></rect>`,
        )
        .join('');
    }
    if (this.kind === 'area') {
      return (
        `<path part="area" d="${this._areaPath(pts)}"></path>` +
        `<path part="line" d="${this._linePath(pts)}"></path>`
      );
    }
    return `<path part="line" d="${this._linePath(pts)}"></path>`;
  }

  override render() {
    const values = this._readPoints();
    const pts = this._project(values);
    // Keep `_renderShape` reachable so the source-form template builder
    // isn't tree-shaken; it's the documented forward-compat path for
    // environments without the happy-dom marker bug (see module header).
    void this._renderShape;
    const style =
      `${this.width ? `width: ${this.width};` : ''}` +
      `${this.height ? `height: ${this.height};` : ''}`;
    const inner =
      `<rect part="track" x="0" y="0" width="${VIEW_W}" height="${VIEW_H}"></rect>` +
      this._shapeMarkup(pts);
    const svgMarkup =
      `<svg part="base" viewBox="0 0 ${VIEW_W} ${VIEW_H}" ` +
      `preserveAspectRatio="none"${style ? ` style="${style}"` : ''}>${inner}</svg>`;
    // Returning the directive directly (not wrapped in `html`…``) sidesteps
    // a happy-dom HTML-encoding edge case where a bare directive-only
    // template result at the top renders as `&lt;?&gt;` text.
    return unsafeHTML(svgMarkup) as unknown as ReturnType<typeof html>;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-sparkline': CoreSparkline;
  }
}

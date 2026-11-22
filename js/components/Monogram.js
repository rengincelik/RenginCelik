import { h } from '../lib/dom.js';

/**
 * The RC mark: both letters drawn as nested contour lines, like a flow-field
 * plot. The bands are cut with an SVG mask, so the gaps are truly transparent
 * and the mark works on any background image. Colours come from the theme
 * tokens (--fg, --accent), so the background slider recolours it.
 */
const R = 'M26 108V12H62A27 27 0 0 1 62 66H26M54 66L88 108';
const C = 'M193.2 26.5A50 50 0 1 0 193.2 93.5';

const SVG = `
<svg viewBox="0 0 220 120" fill="none" stroke-linecap="round" stroke-linejoin="round" focusable="false">
  <mask id="rc-bands" maskUnits="userSpaceOnUse" x="0" y="0" width="220" height="120">
    <g stroke="#fff" stroke-width="26"><path d="${R}"/><path d="${C}"/></g>
    <g stroke="#000" stroke-width="20"><path d="${R}"/><path d="${C}"/></g>
    <g stroke="#fff" stroke-width="14"><path d="${R}"/><path d="${C}"/></g>
    <g stroke="#000" stroke-width="8"><path d="${R}"/><path d="${C}"/></g>
  </mask>
  <rect width="220" height="120" fill="currentColor" mask="url(#rc-bands)"/>
  <g stroke="var(--accent)" stroke-width="3"><path d="${R}"/><path d="${C}"/></g>
</svg>`;

export function Monogram() {
  const el = h('span', { class: 'monogram', 'aria-hidden': 'true' });
  el.innerHTML = SVG; // constant markup, no user input
  return el;
}

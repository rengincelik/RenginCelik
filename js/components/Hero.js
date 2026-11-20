import { h } from '../lib/dom.js';

/** One large statement and one supporting line. */
export function Hero({ statement, support }) {
  return h(
    'div',
    { class: 'hero container' },
    h('h1', { class: 'hero__statement', id: 'hero-title' }, statement),
    h('p', { class: 'hero__support' }, support)
  );
}

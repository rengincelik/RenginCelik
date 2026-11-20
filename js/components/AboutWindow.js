import { h, toArray } from '../lib/dom.js';

/** About window body: the paragraphs from site.about (no section header). */
export function AboutWindow({ paragraphs }) {
  return h(
    'div',
    { class: 'about__body' },
    toArray(paragraphs).map((p) => h('p', {}, p))
  );
}

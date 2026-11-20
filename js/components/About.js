import { h, toArray } from '../lib/dom.js';

export function About({ paragraphs }) {
  return h(
    'div',
    { class: 'section__inner container' },
    h('h2', { class: 'section__title', id: 'about-title' }, 'About'),
    h(
      'div',
      { class: 'about__body' },
      toArray(paragraphs).map((p) => h('p', {}, p))
    )
  );
}

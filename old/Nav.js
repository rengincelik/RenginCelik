import { h } from '../lib/dom.js';
import { BackgroundSlider } from './BackgroundSlider.js';

/** Name left, section links, background slider right. */
export function Nav({ name, links }) {
  return h(
    'div',
    { class: 'nav container' },
    h('a', { class: 'nav__name', href: '#top' }, name),
    h(
      'nav',
      { class: 'nav__links', 'aria-label': 'Primary' },
      h(
        'ul',
        {},
        links.map((l) => h('li', {}, h('a', { href: l.href }, l.label)))
      )
    ),
    BackgroundSlider()
  );
}

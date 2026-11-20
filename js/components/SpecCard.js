import { h, toArray, linkList } from '../lib/dom.js';

const bullets = (items, className) => {
  const list = toArray(items);
  return list.length ? h('ul', { class: className }, list.map((i) => h('li', {}, i))) : null;
};

/**
 * What / Stack / Key decisions / Links as a definition list.
 * Rows with no content are omitted. Pass { showLinks: false } where the
 * links are already shown elsewhere (the open feature block).
 */
export function SpecCard(spec = {}, { showLinks = true } = {}) {
  const rows = [
    ['What', spec.what ? h('p', {}, spec.what) : null],
    ['Stack', bullets(spec.stack, 'spec__inline')],
    ['Key decisions', bullets(spec.decisions, 'spec__list')],
    showLinks ? ['Links', linkList(spec.links, 'link-list')] : null,
  ].filter((row) => row && row[1]);

  return h(
    'dl',
    { class: 'spec' },
    rows.map(([label, content]) =>
      h('div', { class: 'spec__row' }, h('dt', {}, label), h('dd', {}, content))
    )
  );
}

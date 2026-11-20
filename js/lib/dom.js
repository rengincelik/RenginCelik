/**
 * Tiny DOM helpers shared by every component.
 * No framework and no innerHTML: all text goes through text nodes.
 */

const PLACEHOLDER_SPLIT = /(\[ADD[^\]]*\])/g;

/** True for strings that still contain an unfilled "[ADD: ...]" marker. */
export const isPlaceholder = (value) =>
  typeof value === 'string' && /\[ADD[^\]]*\]/.test(value);

/** Zero-padded list number: 0 -> "01". */
export const pad2 = (n) => String(n).padStart(2, '0');

/** Array-ify: undefined -> [], 'a' -> ['a'], ['a'] -> ['a']. */
export const toArray = (value) => (value == null ? [] : [].concat(value));

/**
 * Plain string -> DocumentFragment. Any "[ADD: ...]" marker is wrapped in
 * <span class="ph"> so unfilled copy is easy to spot on the page.
 */
export function text(str) {
  const frag = document.createDocumentFragment();
  String(str)
    .split(PLACEHOLDER_SPLIT)
    .forEach((part) => {
      if (!part) return;
      if (isPlaceholder(part)) {
        const span = document.createElement('span');
        span.className = 'ph';
        span.textContent = part;
        frag.append(span);
      } else {
        frag.append(part);
      }
    });
  return frag;
}

/**
 * Create an element.
 * h('a', { class: 'x', href: '#' }, 'label', childNode, [more, children])
 * - `class`, `dataset`, `onclick`-style handlers and aria-* are handled.
 * - null / undefined / false attributes are skipped (except aria-*, which keep "false").
 * - String children go through text(), so placeholders get highlighted.
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value == null) continue;
    if (key.startsWith('aria-')) {
      el.setAttribute(key, String(value));
    } else if (value === false) {
      continue;
    } else if (key === 'class') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    if (typeof child === 'string') el.append(text(child));
    else if (typeof child === 'number') el.append(String(child));
    else el.append(child);
  }
  return el;
}

/**
 * Anchor that tolerates placeholder URLs: a placeholder renders as an
 * <a> without href (not clickable, styled as unfinished).
 */
export function link(label, url, { className = 'link', newTab = true } = {}) {
  const live = typeof url === 'string' && url.length > 0 && !isPlaceholder(url);
  const external = live && /^https?:\/\//i.test(url);
  return h(
    'a',
    {
      class: live ? className : `${className} is-placeholder`,
      href: live ? url : null,
      target: external && newTab ? '_blank' : null,
      rel: external && newTab ? 'noopener noreferrer' : null,
    },
    label,
    external && newTab ? h('span', { class: 'visually-hidden' }, ' (opens in a new tab)') : null
  );
}

/** <ul> of links from [{ label, url }]. Returns null when empty. */
export function linkList(links, className = 'link-list') {
  const items = toArray(links).filter(Boolean);
  if (!items.length) return null;
  return h(
    'ul',
    { class: className },
    items.map((l) => h('li', {}, link(l.label, l.url)))
  );
}

/** <ul> of mono tags. Returns null when empty. */
export function tagList(tags) {
  const items = toArray(tags);
  if (!items.length) return null;
  return h('ul', { class: 'tags', 'aria-label': 'Tags' }, items.map((t) => h('li', {}, t)));
}

/** Small badge, only for in-progress projects. */
export function statusBadge(status) {
  if (status !== 'in-progress') return null;
  return h('span', { class: 'badge' }, 'In progress');
}

/**
 * <img>, or a visible placeholder box while `src` is still "[ADD: ...]".
 */
export function picture(src, alt = '', className = 'media__img') {
  if (!src || isPlaceholder(src)) {
    return h('div', { class: `${className} media__placeholder` }, src || '[ADD: image path]');
  }
  return h('img', {
    class: className,
    src,
    alt: isPlaceholder(alt) ? '' : alt,
    loading: 'lazy',
    decoding: 'async',
  });
}

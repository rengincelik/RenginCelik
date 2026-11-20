// Small shared render pieces used by several project components.
import { el, link, isPlaceholder } from './dom.js';
import { EmbedFrame } from '../components/EmbedFrame.js';

/** Small badge. Only statuses listed in ui.status get one (by default: in-progress). */
export function StatusBadge(status, ui) {
  const label = ui.status?.[status];
  return label ? el('span', { class: 'badge' }, label) : null;
}

export function Tags(tags, className = '') {
  if (!tags?.length) return null;
  return el(
    'ul',
    { class: `tags ${className}`.trim() },
    tags.map((t) => el('li', { class: 'tag' }, t)),
  );
}

export function LinkList(links) {
  if (!links?.length) return null;
  return el(
    'ul',
    { class: 'links' },
    links.map((l) => el('li', {}, link(l.label, l.url))),
  );
}

/** Image media: real <img> when src is set, otherwise a visible placeholder box. */
function ImageFigure(media, title) {
  const missing = !media.src || isPlaceholder(media.src);
  return el(
    'figure',
    { class: 'media' },
    missing
      ? el('div', { class: 'media-ph' }, media.src || '')
      : el('img', { src: media.src, alt: media.alt ?? title, loading: 'lazy', decoding: 'async' }),
  );
}

/** Renders media by type. type 'none' (or missing) omits the media area entirely. */
export function renderMedia(media, title, ui) {
  switch (media?.type) {
    case 'embed':
      return EmbedFrame(media, title, ui);
    case 'image':
      return ImageFigure(media, title);
    default:
      return null;
  }
}

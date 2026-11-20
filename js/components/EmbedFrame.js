import { h, link, picture, isPlaceholder } from '../lib/dom.js';

/**
 * Sandbox tokens: only what an interactive demo needs.
 *  - allow-scripts       the demo runs JS
 *  - allow-same-origin   lets the demo use its own storage / fetch its assets
 * Not granted: forms, popups, top navigation, modals, downloads.
 * NOTE: never combine allow-scripts + allow-same-origin for a page hosted on
 * the SAME origin as this site; it could remove its own sandbox. Host demos
 * on a different origin/subdomain, or drop allow-same-origin via media.sandbox.
 */
const DEFAULT_SANDBOX = 'allow-scripts allow-same-origin';

/**
 * Poster + "Run it". The iframe is created only after the click, so nothing
 * loads or autostarts, and a page full of embeds can't trap touch scrolling.
 */
export function EmbedFrame({ title, src, poster, fullUrl, sandbox = DEFAULT_SANDBOX }) {
  const root = h('div', { class: 'embed' });
  const stage = h('div', { class: 'embed__stage' });

  const run = h(
    'button',
    { type: 'button', class: 'embed__run' },
    'Run it',
    h('span', { class: 'visually-hidden' }, `: ${title}`)
  );

  run.addEventListener('click', () => {
    const frame = h('iframe', {
      class: 'embed__frame',
      title: `${title} (interactive demo)`,
      src: src && !isPlaceholder(src) ? src : 'about:blank',
      sandbox,
      allow: 'fullscreen',
    });
    stage.replaceChildren(frame);
    root.classList.add('is-running');
    frame.focus();
  });

  stage.append(picture(poster, '', 'embed__poster'), run);

  root.append(
    stage,
    h(
      'div',
      { class: 'embed__bar' },
      h('span', { class: 'embed__label' }, 'Interactive demo'),
      link('Open full screen', fullUrl, { className: 'link embed__full' })
    )
  );
  return root;
}

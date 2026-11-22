import { h, link, picture, isPlaceholder } from '../lib/dom.js';

/**
 * Sandbox tokens: only what an interactive demo needs.
 *  - allow-scripts       the demo runs JS
 *  - allow-same-origin   lets the demo use its own storage / fetch its assets
 * Not granted by default: forms, popups, top navigation, modals, downloads.
 * NOTE: never combine allow-scripts + allow-same-origin for a page hosted on
 * the SAME origin as this site; it could remove its own sandbox. Host demos
 * on a different origin/subdomain, or drop allow-same-origin via media.sandbox.
 * (PipeFlow needs same-origin for localStorage and is hosted on this origin, so
 * its sandbox is effectively off; it is our own code.)
 */
const DEFAULT_SANDBOX = 'allow-scripts allow-same-origin';

/**
 * How the poster says "this is a screenshot, not the running demo":
 *  - 'blur'  the poster is blurred and dimmed, the project name is sharp
 *  - 'label' the poster stays sharp, the name sits over it, semi-transparent
 *  - 'none'  poster only
 */
const DEFAULT_VEIL = 'blur';

/** Below this scale a demo is unreadable, so "Run it" becomes "open full screen". */
const DEFAULT_MIN_SCALE = 0.5;

/**
 * Poster + "Run it". The iframe is created only after the click, so nothing
 * loads or autostarts, and a page full of embeds can't trap touch scrolling.
 *
 * Two sizing modes, chosen by the media data:
 *  - fluid  (no width/height): the iframe fills a 16:9 stage and the demo
 *    lays itself out for whatever size it gets.
 *  - scaled (media.width + media.height, in CSS px): the demo is a fixed-size
 *    desktop layout. The iframe is rendered at that logical size and shrunk
 *    with transform: scale() to fit the stage; the stage takes the same aspect
 *    ratio. Below `minScale` the demo is not run in the window at all.
 */
export function EmbedFrame({
  title,
  src,
  poster,
  fullUrl,
  sandbox = DEFAULT_SANDBOX,
  width,
  height,
  minScale = DEFAULT_MIN_SCALE,
  veil = DEFAULT_VEIL,
}) {
  const logical = width > 0 && height > 0 ? { w: Number(width), h: Number(height) } : null;

  const root = h('div', { class: logical ? 'embed embed--scaled' : 'embed embed--fluid', dataset: { veil } });
  const stage = h('div', { class: 'embed__stage' });
  if (logical) stage.style.aspectRatio = `${logical.w} / ${logical.h}`;

  const run = h(
    'button',
    { type: 'button', class: 'embed__run' },
    'Run it',
    h('span', { class: 'visually-hidden' }, `: ${title}`)
  );
  const hint = h(
    'p',
    { class: 'embed__hint' },
    'Too small to run here. Use “Open full screen”.'
  );

  let frame = null;

  /** Fit the logical size to the stage; below minScale the demo is not run here. */
  function layout() {
    if (!logical) return;
    const scale = stage.clientWidth / logical.w;
    stage.classList.toggle('is-compact', scale < minScale);
    if (!frame) return;

    if (scale >= 1) {
      // Room to spare: let the demo fill the stage at its own size.
      frame.classList.remove('embed__frame--scaled');
      frame.style.width = '';
      frame.style.height = '';
      frame.style.transform = '';
    } else {
      frame.classList.add('embed__frame--scaled');
      frame.style.width = `${logical.w}px`;
      frame.style.height = `${logical.h}px`;
      frame.style.transform = `scale(${scale})`;
    }
  }

  run.addEventListener('click', () => {
    frame = h('iframe', {
      class: 'embed__frame',
      title: `${title} (interactive demo)`,
      src: src && !isPlaceholder(src) ? src : 'about:blank',
      sandbox,
      allow: 'fullscreen',
    });
    stage.replaceChildren(frame);
    root.classList.add('is-running');
    layout();
    frame.focus();
  });

  stage.append(
    picture(poster, '', 'embed__poster'),
    veil === 'none' ? null : h('div', { class: 'embed__title', 'aria-hidden': 'true' }, title),
    run,
    hint
  );

  root.append(
    stage,
    h(
      'div',
      { class: 'embed__bar' },
      h('span', { class: 'embed__label' }, 'Interactive demo'),
      link('Open full screen', fullUrl, { className: 'link embed__full' })
    )
  );

  if (logical && typeof ResizeObserver === 'function') {
    new ResizeObserver(layout).observe(stage);
  }
  return root;
}

import { h } from '../lib/dom.js';

/**
 * Shared window shell: title bar, close control, scrollable content area.
 * It knows nothing about state, focus order or dragging (WindowManager owns
 * those) and nothing about what a window shows: `content` is any Node.
 *
 * Returns { el, titlebar, closeButton } so the manager can wire interactions.
 */
export function Window({ id, title, content, onClose }) {
  const titleId = `window-title-${id}`;

  const closeButton = h(
    'button',
    {
      class: 'window__close',
      type: 'button',
      'aria-label': `Close ${title}`,
      onclick: () => onClose(id),
    },
    h('span', { class: 'window__close-icon', 'aria-hidden': 'true' }, '×'),
    h('span', { class: 'window__close-label', 'aria-hidden': 'true' }, '← Back')
  );

  const titlebar = h(
    'div',
    { class: 'window__titlebar' },
    h('h2', { class: 'window__title', id: titleId }, title),
    closeButton
  );

  const body = h(
    'div',
    { class: 'window__body', tabindex: 0, role: 'region', 'aria-labelledby': titleId },
    content
  );

  const el = h(
    'div',
    {
      class: 'window',
      role: 'dialog',
      'aria-labelledby': titleId,
      tabindex: -1,
      dataset: { windowId: id },
    },
    titlebar,
    body
  );

  return { el, titlebar, closeButton };
}

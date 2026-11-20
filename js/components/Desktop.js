import { h } from '../lib/dom.js';
import { DesktopMenu } from './DesktopMenu.js';
import { WindowManager } from './WindowManager.js';

/**
 * Fixed, non-scrolling landing screen: identity title + floating menu,
 * with a window layer on top. Data comes in from main.js.
 */
export function Desktop({ site, projects, experience }) {
  const stage = h('main', { class: 'desktop__stage', id: 'main', tabindex: -1 });

  const windows = WindowManager({
    // A full-screen mobile window covers the stage: keep it out of tab order.
    onChange: ({ fullscreen }) => {
      stage.inert = fullscreen;
    },
  });

  stage.append(
    h('h1', { class: 'desktop__title' }, site.name.toLocaleUpperCase('tr-TR')),
    DesktopMenu({ site, projects, experience, onOpen: windows.open })
  );

  return h('div', { class: 'desktop' }, stage, windows.el);
}

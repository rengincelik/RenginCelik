import { h } from '../lib/dom.js';
import { Background } from './Background.js';
import { DesktopMenu } from './DesktopMenu.js';
import { WindowManager } from './WindowManager.js';
import { Monogram } from './Monogram.js';

/**
 * Fixed, non-scrolling landing screen: animated background, identity title +
 * floating menu, and a window layer on top. Data comes in from main.js.
 */
export function Desktop({ site, projects, experience }) {
  const background = Background();
  const stage = h('main', { class: 'desktop__stage', id: 'main', tabindex: -1 });

  const windows = WindowManager({
    // A full-screen mobile window covers the stage: keep it out of tab order
    // and stop drawing the background behind it.
    onChange: ({ fullscreen }) => {
      stage.inert = fullscreen;
      background.setPaused(fullscreen);
    },
  });

  // Hovering an open window shows that window's background image.
  windows.el.addEventListener('pointerover', (e) => {
    const win = e.target.closest('.window');
    if (win && e.pointerType !== 'touch') background.preview(win.dataset.windowId);
  });
  windows.el.addEventListener('pointerout', (e) => {
    if (e.target.closest('.window') && !e.relatedTarget?.closest?.('.window')) background.preview(null);
  });

  stage.append(
    Monogram(),
    h('h1', { class: 'desktop__title' }, site.name.toLocaleUpperCase('tr-TR')),
    DesktopMenu({
      site,
      projects,
      experience,
      onOpen: windows.open,
      onPreview: background.preview,
    })
  );

  return h('div', { class: 'desktop' }, background.el, stage, windows.el);
}

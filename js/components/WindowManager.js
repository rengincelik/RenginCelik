import { h } from '../lib/dom.js';
import { Window } from './Window.js';
import { renderContent } from './windowContent.js';

/**
 * Owns window state and interactions: open / close, one window per id,
 * z-index order, dragging, viewport clamping and the one-window mobile mode.
 *
 * Record per open window:
 *   { id, title, type, position: {x, y}, zIndex, el, titlebar, opener }
 */

const MOBILE_QUERY = '(max-width: 720px)';
const BASE_Z = 10;
const CASCADE_START = { x: 120, y: 100 };
const CASCADE_STEP = 32;
const CASCADE_SLOTS = 6;
const KEEP_VISIBLE = 80; // px of a window that must stay on screen

/** Fallback for a window type that has no content component (or no data). */
function placeholder(spec) {
  return h(
    'div',
    { class: 'window__placeholder' },
    h('p', {}, `${spec.title} — placeholder content.`),
    h('p', { class: 'window__hint' }, 'No content component for this window yet.')
  );
}

/**
 * @param {{ onChange?: (state: {count: number, fullscreen: boolean}) => void }} [options]
 * @returns {{ el: HTMLElement, open: Function, close: Function }}
 */
export function WindowManager({ onChange } = {}) {
  const layer = h('div', { class: 'desktop__windows' });
  const mobile = window.matchMedia(MOBILE_QUERY);
  const windows = new Map();
  let topZ = BASE_Z;
  let cascade = 0;

  const notify = () =>
    onChange?.({ count: windows.size, fullscreen: mobile.matches && windows.size > 0 });

  const topWindow = () =>
    [...windows.values()].reduce((a, b) => (!a || b.zIndex > a.zIndex ? b : a), null);

  function place(win) {
    win.el.style.left = `${win.position.x}px`;
    win.el.style.top = `${win.position.y}px`;
  }

  /** Keep the title bar reachable: never let a window leave the screen. */
  function clamp(win) {
    const maxX = layer.clientWidth - KEEP_VISIBLE;
    const maxY = layer.clientHeight - win.titlebar.offsetHeight;
    const minX = KEEP_VISIBLE - win.el.offsetWidth;
    win.position.x = Math.min(Math.max(win.position.x, minX), maxX);
    win.position.y = Math.min(Math.max(win.position.y, 0), Math.max(maxY, 0));
  }

  function raise(id) {
    const win = windows.get(id);
    if (!win) return;
    if (win.zIndex < topZ || windows.size === 1) win.zIndex = ++topZ;
    win.el.style.zIndex = win.zIndex;
    for (const w of windows.values()) w.el.classList.toggle('is-active', w === win);
  }

  function focus(id) {
    raise(id);
    windows.get(id)?.el.focus({ preventScroll: true });
  }

  function remove(id) {
    const win = windows.get(id);
    if (!win) return null;
    windows.delete(id);
    win.el.remove();
    return win;
  }

  function close(id) {
    const win = remove(id);
    if (!win) return;
    notify();
    const next = topWindow();
    if (next) raise(next.id);
    // Return focus to what opened the window, else to the next window.
    const opener = win.opener;
    if (opener?.isConnected && opener.getClientRects().length) opener.focus();
    else if (next) focus(next.id);
  }

  function startDrag(win, e) {
    if (mobile.matches || e.button !== 0 || e.target.closest('button')) return;
    const { titlebar, el } = win;
    const offsetX = e.clientX - win.position.x;
    const offsetY = e.clientY - win.position.y;

    titlebar.setPointerCapture(e.pointerId);
    el.classList.add('is-dragging');

    const move = (ev) => {
      win.position.x = ev.clientX - offsetX;
      win.position.y = ev.clientY - offsetY;
      clamp(win);
      place(win);
    };
    const end = () => {
      el.classList.remove('is-dragging');
      titlebar.removeEventListener('pointermove', move);
      titlebar.removeEventListener('pointerup', end);
      titlebar.removeEventListener('pointercancel', end);
      titlebar.removeEventListener('lostpointercapture', end);
      if (titlebar.hasPointerCapture?.(e.pointerId)) titlebar.releasePointerCapture(e.pointerId);
    };
    titlebar.addEventListener('pointermove', move);
    titlebar.addEventListener('pointerup', end);
    titlebar.addEventListener('pointercancel', end);
    titlebar.addEventListener('lostpointercapture', end);
  }

  /**
   * Open a window, or bring it to the front if its id is already open.
   * @param {{ id: string, title: string, type?: string, data?: object, content?: Node }} spec
   */
  function open(spec) {
    if (windows.has(spec.id)) {
      focus(spec.id);
      return;
    }
    // Mobile shows a single full-screen window at a time.
    if (mobile.matches) [...windows.keys()].forEach(remove);

    const shell = Window({
      id: spec.id,
      title: spec.title,
      type: spec.type,
      content: spec.content ?? renderContent(spec) ?? placeholder(spec),
      onClose: close,
    });
    const slot = cascade++ % CASCADE_SLOTS;
    const win = {
      id: spec.id,
      title: spec.title,
      type: spec.type,
      position: {
        x: CASCADE_START.x + slot * CASCADE_STEP,
        y: CASCADE_START.y + slot * CASCADE_STEP,
      },
      zIndex: 0,
      el: shell.el,
      titlebar: shell.titlebar,
      opener: document.activeElement,
    };
    windows.set(win.id, win);

    shell.titlebar.addEventListener('pointerdown', (e) => startDrag(win, e));
    win.el.addEventListener('pointerdown', () => raise(win.id));
    win.el.addEventListener('focusin', () => raise(win.id));
    win.el.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close(win.id);
    });

    layer.append(win.el);
    clamp(win);
    place(win);
    notify();
    focus(win.id);
  }

  const clampAll = () => windows.forEach((win) => { clamp(win); place(win); });
  window.addEventListener('resize', clampAll);
  mobile.addEventListener('change', () => {
    if (mobile.matches) {
      const keep = topWindow();
      [...windows.keys()].filter((id) => id !== keep?.id).forEach(remove);
    } else {
      clampAll();
    }
    notify();
  });

  return { el: layer, open, close };
}

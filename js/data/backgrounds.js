/**
 * Background images (dithered by the shader behind the desktop).
 * Edit this file to change what the background shows; no other file needs to change.
 *
 * images   key -> { src }          Any PNG/JPG/SVG path. Transparent PNGs work best:
 *                                  light, high-contrast shapes on a transparent ground.
 * cycle    keys shown in turn      when nothing is hovered (default mode).
 * windows  window id -> image key  shown while that menu item / open window is hovered
 *                                  or keyboard-focused. A window id with no entry here
 *                                  just returns to the default cycle.
 *
 * Window ids: about, contact, project-<project.id>, job-<experience.id>
 * (the ids come from js/data/projects.js and js/data/experience.js).
 */
export const backgrounds = {
  intervalMs: 7000,

  images: {
    'i-fall-suddenly': { src: 'i-fall-suddenly-gulen-seffaf.png' },
    'day-timeline': { src: 'Pastel Uykulu Günün Zaman Çizelgesi.png' },
  },

  cycle: ['i-fall-suddenly', 'day-timeline'],

  windows: {
    about: 'day-timeline',
    contact: 'i-fall-suddenly',
    'project-i-fall-suddenly': 'i-fall-suddenly',
    // 'project-pipeflow': '...',
    // 'project-navier-stokes-2d': '...',
    // 'job-ibright': '...',
  },
};

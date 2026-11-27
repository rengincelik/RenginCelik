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
	intervalMs2: 5000,

		images: {
			'muscle-weakness': {
				src: 'assets/background/03-muscle-weakness.png',
			},
			'cataplexy-episode': {
				src: 'assets/background/04-cataplexy-episode.png',
			},
			'day-timeline': {
				src: 'assets/background/Pastel Uykulu Günün Zaman Çizelgesi.png',
			},
			'cfd-name-dark': {
				src: 'assets/background/cfd-solver-name-dark.png',
			},
			'cfd-name-light': {
				src: 'assets/background/cfd-solver-name-light.png',
			},
			'i-fall-suddenly': {
				src: 'assets/background/i-fall-suddenly-gulen-seffaf.png',
			},
			'i-fall-suddenly-name-dark': {
				src: 'assets/background/i-fall-suddenly-name-dark.png',
			},
			'i-fall-suddenly-name-light': {
				src: 'assets/background/i-fall-suddenly-name-light.png',
			},
			'pipeflow-name-dark': {
				src: 'assets/background/pipeflow-name-dark.png',
			},
			'pipeflow-name-light': {
				src: 'assets/background/pipeflow-name-light.png',
			},
		},


	cycle: [
		'i-fall-suddenly',
		'muscle-weakness',
		'cataplexy-episode',
		'day-timeline',
	],

	cycle2: [
		'cfd-name-dark',
		'cfd-name-light',
		'pipeflow-name-dark',
		'pipeflow-name-light',
		'i-fall-suddenly-name-dark',
		'i-fall-suddenly-name-light',
	],

  windows: {
    about: 'day-timeline',
    contact: 'i-fall-suddenly',

	  'project-i-fall-suddenly': 'i-fall-suddenly-name-dark',
	  'project-pipeflow': 'pipeflow-name-dark',
	  'project-navier-stokes-2d': 'cfd-name-dark',

    // 'job-ibright': '...',

  },

};
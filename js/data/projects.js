/**
 * Projects, in display order. The Work section is rendered entirely from
 * this array: to add a project, add an object. No HTML, CSS or JS changes.
 * The list number (01, 02, ...) comes from the position in the array.
 *
 * @typedef {Object} Project
 * @property {string}   id          Unique slug; used for the #project-<id> anchor.
 * @property {string}   title
 * @property {'live'|'in-progress'|'archive'} status   'in-progress' shows a badge.
 * @property {'open'|'collapsed'} layout   open = large feature block;
 *                                         collapsed = numbered row that expands into a spec card.
 * @property {string}   summary     One or two sentences.
 * @property {string}   [note]      Optional caveat shown under the summary (e.g. a disclaimer).
 * @property {string[]} tags
 * @property {Object}   media
 * @property {'embed'|'image'|'none'} media.type
 * @property {string}   [media.src]      embed: iframe URL. image: image path.
 * @property {string}   [media.poster]   embed: poster image shown before "Run it".
 * @property {string}   [media.fullUrl]  embed: target of "Open full screen".
 * @property {string}   [media.alt]      image: alt text.
 * @property {string}   [media.sandbox]  embed: override the default sandbox tokens.
 * @property {number}   [media.width]    embed: logical width in px. With height, the demo is
 *                                         rendered at this size and scaled to fit the window.
 * @property {number}   [media.height]   embed: logical height in px (see width).
 * @property {number}   [media.minScale] embed: below this scale (default 0.5) "Run it" is
 *                                         replaced by a pointer to full screen.
 * @property {Object}   spec
 * @property {string}   spec.what
 * @property {string[]} spec.stack
 * @property {string[]} spec.decisions   Key decisions, one per item.
 * @property {{label: string, url: string}[]} spec.links
 */

/** @type {Project[]} */
export const projects = [
	{
		id: 'i-fall-suddenly',
		title: 'I Fall Suddenly',
		status: 'live',
		layout: 'open',
		summary:
			'A bilingual (Turkish/English) web app with interactive screening questionnaires, built without a framework, plus a small serverless API for anonymous usage stats. Topic: narcolepsy awareness.',
		note: 'A screening aid, not a diagnosis. The results only suggest whether it is worth talking to a sleep specialist; only a clinician can diagnose narcolepsy.',
		tags: ['Vanilla JS · ES Modules', 'Cloudflare Workers', 'D1 (SQLite)', 'i18n', 'Unit tests'],
		media: {
			type: 'image',
			src: 'assets/i-fall-suddenly-poster.webp',
			alt: 'The I Fall Suddenly site in English (light theme) and Turkish (dark theme), showing the screening test.',
		},
		spec: {
			what: 'A static front end with no build step, talking to a Cloudflare Worker + D1 API. Users take one of two questionnaires (SNS and ESS) and get a scored, explained result in their language.',
			stack: [
				'HTML5',
				'CSS3',
				'JavaScript (ES Modules)',
				'Cloudflare Workers & D1',
				'GitHub Pages',
			],
			decisions: [
				'Scoring logic kept free of the DOM and covered by unit tests (node:test)',
				'Own translation engine; languages are separate modules loaded with dynamic import (English always loads as the fallback)',
				'Serverless counter API on Cloudflare Workers + D1: origin check, content-type check and per-IP rate limiting on writes (30 requests/min)',
				'Privacy by design: answers and scores never leave the browser; only anonymous counters are stored',
				'Data-driven questionnaires: scoring rules (weights, thresholds, bands) live in config, and a new test needs a config entry, its translations and one ID in the API allow-list, not new UI code',
			],
			links: [
				{ label: 'Live site', url: 'https://rengincelik.github.io/ifallsuddenly/' },
				{ label: 'Source', url: 'https://github.com/rengincelik/ifallsuddenly' },
			],
		},
	},

  {
    id: 'pipeflow',
    title: 'PipeFlow',
    status: 'live',
    layout: 'open',
    summary:
      'A real-time simulation app that runs entirely in the browser: users build a pipe system by drag and drop, and the engine recalculates pressures and flows every 100 ms. Plain JavaScript, zero dependencies, no build step.',
    tags: [
      'Vanilla JS · ES Modules',
      'State Machine',
      'Event-driven',
      'SVG + Canvas 2D',
      'Zero Dependencies',
    ],
    media: {
      type: 'embed',
      src: 'https://rengincelik.github.io/pipeFlow/',
      poster: 'assets/pipeflow-poster.webp',
      fullUrl: 'https://rengincelik.github.io/pipeFlow/',
      // PipeFlow is a fixed desktop layout with no breakpoints: render it at
      // this size and scale it down to the window.
      width: 960,
      height: 600,
      // same-origin is required (PipeFlow uses localStorage); downloads are for Export JSON.
      sandbox: 'allow-scripts allow-same-origin allow-downloads',
    },
    spec: {
      what: 'A tick-based simulation engine with a drag-and-drop editor. Users place pumps, pipes, valves, elbows and reducers; every 100 ms the engine solves the system and the UI, charts and diagnostics update.',
      stack: ['Vanilla JS (ES modules)', 'SVG rendering', 'Canvas 2D', 'localStorage'],
      decisions: [
        'Simulation layer with no DOM access: physics written as plain functions, run by a separate engine class',
        'State changes published through a custom EventEmitter, keeping UI and data decoupled',
        'Explicit state machine: IDLE → RUNNING → ALARM',
        'Rule engine: 22 diagnostic rules evaluated alongside the simulation, each with a severity level and advice; loss coefficients from Crane TP-410 / ISA-75.01',
        'Iterative solvers every tick: fixed-point iteration for pipe friction, bisection for the pump operating point',
        'Override system: values the user sets take precedence over propagated defaults',
        'Project files: JSON import/export plus per-tab auto-save in localStorage',
      ],
      links: [
        { label: 'Live demo', url: 'https://rengincelik.github.io/pipeFlow/' },
        { label: 'GitHub', url: 'https://github.com/rengincelik/pipeFlow' },
      ],
    },
  },

  {
    id: 'navier-stokes-2d',
    title: 'C++ simulation engine',
    status: 'in-progress',
    layout: 'collapsed',
    summary:
      'A from-scratch C++17 engine that simulates 2D fluid flow and heat transfer. The same solver code runs as a native desktop app and, compiled to WebAssembly, in the browser.',
    tags: ['C++17', 'CMake', 'WebAssembly', 'Numerical methods'],
    media: {
      type: 'embed',
      src: 'https://rengincelik.github.io/cfd-simulation/',
      poster: 'assets/cfd-poster.webp',
      fullUrl: 'https://rengincelik.github.io/cfd-simulation/',
      // The page lays itself out (fluid mode) and keeps no state, so same-origin is
      // left out and the sandbox is real. allow-downloads is for Export CSV.
      sandbox: 'allow-scripts allow-downloads',
    },
    spec: {
      what: 'A 2D incompressible Navier–Stokes and heat transfer solver with real-time SDL2 visualization, draggable objects and a browser version built from the same C++ code.',
      stack: ['C++17', 'CMake', 'SDL2', 'Emscripten / WebAssembly'],
      decisions: [
        'Interface-based design (IGrid, IPDESolver, IBoundaryCondition) with a one-way dependency flow: apps → engine / visualization → interfaces',
        'One codebase, two targets: native SDL2 apps, and a WebAssembly build that exposes the solver through a small C API',
        'Config-driven runs: parameters live in .cfg files, so no recompiling between experiments',
        'Fields stored in flat, contiguous arrays with row-major indexing for cache-friendly loops',
        "Numerics: Chorin's projection method with an iterative Gauss–Seidel pressure solve",
        'Automated validation against a published reference (Ghia et al. 1982) with L₂/L∞ error norms; 64×64 complete, 128×128 in progress',
      ],
      links: [
        { label: 'Live demo', url: 'https://rengincelik.github.io/cfd-simulation/' },
        { label: 'GitHub', url: 'https://github.com/rengincelik/cfd-simulation' },
      ],
    },
  },

];
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
			'Bilingual Narcolepsy Awareness Platform. A bilingual (Turkish/English) web platform designed to raise awareness about narcolepsy, provide educational resources, and help users recognize potential symptoms through interactive screening tools.',
		note: 'A screening aid, not a diagnosis. The results only suggest whether it is worth talking to a sleep specialist; only a clinician can diagnose narcolepsy.',
		tags: ['Vanilla JS', 'i18n', 'Web Worker', 'dual theme'],
		media: {
			type: 'image',
			src: 'assets/projects/i-fall-suddenly-poster.webp',
			alt: 'The I Fall Suddenly site in English (light theme) and Turkish (dark theme), showing the screening test.',
		},
		spec: {
			what: 'A bilingual (Turkish/English) platform with interactive Narcolepsy Type 1 (SNS) and Epworth Sleepiness Scale (ESS) assessments.',
			stack: [
				'HTML5',
				'CSS3',
				'JavaScript (ES Modules)',
				'Cloudflare Workers & D1',
				'GitHub Pages',
			],
			decisions: [
				'Interactive SNS and ESS assessments with visual results and personalized explanations',
				'Educational content covering symptoms, diagnosis, and treatment',
				'Responsive design with dark/light themes',
				'Privacy-conscious data handling and anonymous usage statistics',
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
      'Browser-based pipeline hydraulics simulator for process engineers. A real-time pipeline flow simulator that runs entirely in the browser with zero external dependencies and no build step.',
    tags: [
      'Vanilla JS · ES Modules',
      'SVG Rendering',
      'Canvas 2D',
      'Darcy-Weisbach',
      'State Machine',
      'Zero Dependencies',
    ],
    media: {
      type: 'embed',
      src: 'https://rengincelik.github.io/pipeFlow/',
      poster: 'assets/projects/pipeflow-poster.webp',
      fullUrl: 'https://rengincelik.github.io/pipeFlow/',
      // PipeFlow is a fixed desktop layout with no breakpoints: render it at
      // this size and scale it down to the window.
      width: 960,
      height: 600,
      // same-origin is required (PipeFlow uses localStorage); downloads are for Export JSON.
      sandbox: 'allow-scripts allow-same-origin allow-downloads',
    },
    spec: {
      what: 'Engineers drag and drop pumps, pipes, valves, elbows and reducers, and the system calculates pressure, velocity, flow rate and energy losses every 100 ms.',
      stack: ['Vanilla JS (ES modules)', 'SVG rendering', 'Canvas 2D'],
      decisions: [
        'Genuine physics model: Darcy-Weisbach friction losses with Colebrook-White (fixed-point iteration), Borda-Carnot expansion losses, pump H-Q curve resolved each tick by bisection',
        'Parallel diagnostic engine: 21 hydraulic rules against industry thresholds (Crane TP-410, ISA 75.01), each with severity level and corrective advice',
        'Fully decoupled modules via custom EventEmitter',
        'State machine: IDLE → RUNNING → ALARM',
        'OverrideMixin: user overrides resolve over system defaults',
      ],
      links: [
        { label: 'Live demo', url: 'https://rengincelik.github.io/pipeFlow/' },
        { label: 'GitHub', url: 'https://github.com/rengincelik/pipeFlow' },
      ],
    },
  },

  {
    id: 'navier-stokes-2d',
    title: '2D Navier–Stokes solver',
    status: 'in-progress',
    layout: 'collapsed',
    summary:
      'From-scratch incompressible CFD with conjugate heat transfer. A 2D incompressible Navier-Stokes solver built in C++ with zero external framework dependencies.',
    tags: ['C++', 'CFD', 'numerical methods'],
    media: {
      type: 'embed',
      src: 'https://rengincelik.github.io/cfd-simulation/',
      poster: 'assets/projects/cfd-poster.webp',
      fullUrl: 'https://rengincelik.github.io/cfd-simulation/',
      // The page lays itself out (fluid mode) and keeps no state, so same-origin is
      // left out and the sandbox is real. allow-downloads is for Export CSV.
      sandbox: 'allow-scripts allow-downloads',
    },
    spec: {
      what: 'A 2D incompressible Navier-Stokes solver in C++ with a conjugate heat transfer solver, interactive draggable rigid bodies (Dirichlet disk, Neumann obstacle) and SDL2 real-time visualization with dynamic colormaps.',
      stack: ['C++17', 'SDL2', 'CMake'],
      decisions: [
        "Chorin's projection method: fractional step approach decoupling velocity and pressure",
        'Gauss-Seidel pressure iteration with CFL-stable time stepping',
        'Validated against the Ghia et al. (1982) lid-driven cavity benchmark with automated L₂/L∞ error norms at Re = 400',
        'Currently validating at increasing mesh resolutions: 64×64 complete, 128×128 with bilinear interpolation in progress',
      ],
      links: [
        { label: 'Live demo', url: 'https://rengincelik.github.io/cfd-simulation/' },
        { label: 'GitHub', url: 'https://github.com/rengincelik/cfd-simulation' },
      ],
    },
  },

];
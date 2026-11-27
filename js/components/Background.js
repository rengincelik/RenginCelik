import { h } from '../lib/dom.js';
import { backgrounds } from '../data/backgrounds.js';
import { VERTEX, FRAGMENT } from '../lib/backgroundShader.js';

const MAX_TEX_H = 440;
const MAX_TEX_W = 1100;
const FADE_MS = 700;
const HOVER_IN_MS = 120;
const HOVER_OUT_MS = 400;

const hexToRgb = (value, fallback) => {
	const m = /^#?([0-9a-f]{6})$/i.exec(String(value).trim());
	const n = parseInt(m ? m[1] : fallback, 16);
	return [
		((n >> 16) & 255) / 255,
		((n >> 8) & 255) / 255,
		(n & 255) / 255,
	];
};

/**
 * Animated desktop background (WebGL2 canvas behind everything).
 *
 * Two independent image sequences can run simultaneously:
 * - cycle: first image sequence
 * - cycle2: second image sequence
 *
 * Each sequence has its own transition state and interval.
 * Window previews affect the first sequence only.
 *
 * setTitle(node) draws the page title into the shader as a dithered layer.
 *
 * @returns {{
 *   el: HTMLCanvasElement,
 *   preview: (id: string|null) => void,
 *   setPaused: (p: boolean) => void,
 *   setTitle: (node: HTMLElement) => void
 * }}
 */
export function Background(config = backgrounds) {
	const el = h('canvas', {
		class: 'desktop__bg',
		'aria-hidden': 'true',
	});

	const none = {
		el,
		preview() {},
		setPaused() {},
		setTitle() {},
	};

	const reduce = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;

	// First image sequence
	const cycle = (config.cycle ?? []).filter(
		(k) => config.images?.[k]
	);

	if (!cycle.length) return none;

	// Second image sequence
	const cycle2 = (config.cycle2 ?? []).filter(
		(k) => config.images?.[k]
	);

	const secondaryEnabled = cycle2.length > 0;
	const secondaryCycle = secondaryEnabled ? cycle2 : [cycle[0]];

	/* ---------- WebGL ---------- */

	let gl = null;

	try {
		gl = el.getContext('webgl2', {
			alpha: false,
			antialias: false,
		});
	} catch (err) {
		console.warn('Background: WebGL2 unavailable', err);
	}

	if (!gl) return none;

	/* ---------- program ---------- */

	const compile = (type, src) => {
		const s = gl.createShader(type);

		gl.shaderSource(s, src);
		gl.compileShader(s);

		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(s));
		}

		return s;
	};

	let program;

	try {
		program = gl.createProgram();

		gl.attachShader(
			program,
			compile(gl.VERTEX_SHADER, VERTEX)
		);

		gl.attachShader(
			program,
			compile(gl.FRAGMENT_SHADER, FRAGMENT)
		);

		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program));
		}
	} catch (err) {
		console.warn('Background: shader failed', err);
		return none;
	}

	const uniforms = {};

	const u = (name) =>
		name in uniforms
			? uniforms[name]
			: (uniforms[name] = gl.getUniformLocation(program, name));

	/* ---------- textures ---------- */

	const textures = {};

	function setParams() {
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.LINEAR
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			gl.CLAMP_TO_EDGE
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			gl.CLAMP_TO_EDGE
		);
	}

	function loadTexture(key) {
		const entry = {
			tex: gl.createTexture(),
			aspect: 1,
		};

		gl.bindTexture(gl.TEXTURE_2D, entry.tex);

		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array(4)
		);

		setParams();

		const img = new Image();
		img.decoding = 'async';

		img.onload = () => {
			const k = Math.min(
				1,
				MAX_TEX_H / img.naturalHeight,
				MAX_TEX_W / img.naturalWidth
			);

			const w = Math.max(
				1,
				Math.round(img.naturalWidth * k)
			);

			const hh = Math.max(
				1,
				Math.round(img.naturalHeight * k)
			);

			const c = document.createElement('canvas');

			c.width = w;
			c.height = hh;

			c.getContext('2d').drawImage(img, 0, 0, w, hh);

			gl.bindTexture(gl.TEXTURE_2D, entry.tex);

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				c
			);

			setParams();

			entry.aspect = w / hh;

			requestFrame();
		};

		img.onerror = () => {
			console.warn(
				`Background: could not load "${config.images[key].src}"`
			);
		};

		img.src = config.images[key].src;

		textures[key] = entry;
	}

	// Load images used by both sequences and window previews.
	const used = new Set([
		...cycle,
		...cycle2,
		...Object.values(config.windows ?? {}),
	]);

	used.forEach((key) => {
		if (config.images[key]) loadTexture(key);
	});

	/* ---------- title text mask ---------- */

	const getDpr = () =>
		Math.min(window.devicePixelRatio || 1, 1.5);

	const title = {
		node: null,
		tex: gl.createTexture(),
		ready: false,
	};

	gl.bindTexture(gl.TEXTURE_2D, title.tex);

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array(4)
	);

	setParams();

	function renderTitle() {
		const node = title.node;
		const text = node?.firstChild;

		if (!text || text.nodeType !== Node.TEXT_NODE) return;

		const r = node.getBoundingClientRect();

		if (r.width < 1 || r.height < 1) return;

		const dpr = getDpr();
		const cs = getComputedStyle(node);

		const c = document.createElement('canvas');

		c.width = Math.ceil(r.width * dpr);
		c.height = Math.ceil(r.height * dpr);

		const ctx = c.getContext('2d');

		ctx.scale(dpr, dpr);

		ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

		if ('letterSpacing' in ctx) {
			ctx.letterSpacing =
				cs.letterSpacing === 'normal'
					? '0px'
					: cs.letterSpacing;
		}

		ctx.fillStyle = '#fff';
		ctx.textBaseline = 'alphabetic';

		const m = ctx.measureText(text.data);
		const size = parseFloat(cs.fontSize);

		const asc = m.fontBoundingBoxAscent ?? size * 0.8;
		const desc = m.fontBoundingBoxDescent ?? size * 0.2;

		const range = document.createRange();

		for (const word of text.data.matchAll(/\S+/g)) {
			range.setStart(text, word.index);
			range.setEnd(text, word.index + word[0].length);

			const w = range.getBoundingClientRect();

			const baseline =
				w.top -
				r.top +
				(w.height - asc - desc) / 2 +
				asc;

			ctx.fillText(
				word[0],
				w.left - r.left,
				baseline
			);
		}

		gl.bindTexture(gl.TEXTURE_2D, title.tex);

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			c
		);

		gl.generateMipmap(gl.TEXTURE_2D);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_LINEAR
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.LINEAR
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			gl.CLAMP_TO_EDGE
		);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			gl.CLAMP_TO_EDGE
		);

		title.ready = true;

		node.classList.add('is-drawn');

		requestFrame();
	}

	function setTitle(node) {
		title.node = node;

		new ResizeObserver(renderTitle).observe(node);

		document.fonts?.ready.then(renderTitle);
	}

	/* ---------- theme ---------- */

	let theme = {
		bg: [0.133, 0.133, 0.133],
		fg: [0.953, 0.953, 0.945],
		acc: [0.961, 0.408, 0.239],
	};

	function readTheme() {
		const cs = getComputedStyle(document.documentElement);

		theme = {
			bg: hexToRgb(
				cs.getPropertyValue('--bg'),
				'222222'
			),

			fg: hexToRgb(
				cs.getPropertyValue('--fg'),
				'f3f3f1'
			),

			acc: hexToRgb(
				cs.getPropertyValue('--accent'),
				'f5683d'
			),
		};
	}

	readTheme();

	new MutationObserver(() => {
		readTheme();
		requestFrame();
	}).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['style', 'data-tone'],
	});

	/* ---------- first image sequence ---------- */

	let cycleIndex = 0;

	let shownA = cycle[0];
	let shownB = cycle[0];

	let mix = 1;

	/* ---------- second image sequence ---------- */

	let cycleIndex2 = 0;

	let shownC = secondaryCycle[0];
	let shownD = secondaryCycle[0];

	let mix2 = 1;

	/* ---------- preview and pause state ---------- */

	let previewKey = null;
	let previewTimer = 0;

	let paused = false;

	el.dataset.image = shownB;

	/* ---------- first sequence transition ---------- */

	function setTarget(key) {
		if (!key || key === shownB || !textures[key]) return;

		if (reduce) {
			shownA = shownB = key;
			mix = 1;
		} else {
			shownA = mix >= 0.5 ? shownB : shownA;
			shownB = key;
			mix = 0;
		}

		el.dataset.image = key;

		requestFrame();
	}

	/* ---------- second sequence transition ---------- */

	function setTarget2(key) {
		if (
			!secondaryEnabled ||
			!key ||
			key === shownD ||
			!textures[key]
		) {
			return;
		}

		if (reduce) {
			shownC = shownD = key;
			mix2 = 1;
		} else {
			shownC = mix2 >= 0.5 ? shownD : shownC;
			shownD = key;
			mix2 = 0;
		}

		requestFrame();
	}

	/* ---------- window preview ---------- */

	function preview(id) {
		clearTimeout(previewTimer);

		const key = id == null
			? null
			: config.windows?.[id];

		if (!key || !textures[key]) {
			if (id == null || previewKey) {
				previewTimer = setTimeout(() => {
					previewKey = null;
					setTarget(cycle[cycleIndex]);
				}, HOVER_OUT_MS);
			}

			return;
		}

		previewTimer = setTimeout(() => {
			previewKey = key;
			setTarget(key);
		}, HOVER_IN_MS);
	}

	const animating = () =>
		!reduce && !paused && !document.hidden;

	/* ---------- independent timers ---------- */

	if (!reduce && cycle.length > 1) {
		setInterval(() => {
			if (!animating() || previewKey) return;

			cycleIndex = (cycleIndex + 1) % cycle.length;

			setTarget(cycle[cycleIndex]);
		}, config.intervalMs ?? 7000);
	}

	if (!reduce && cycle2.length > 1) {
		setInterval(() => {
			if (!animating()) return;

			cycleIndex2 =
				(cycleIndex2 + 1) % cycle2.length;

			setTarget2(cycle2[cycleIndex2]);
		}, config.intervalMs2 ?? 5000);
	}

	/* ---------- pointer ---------- */

	const pointer = {
		x: 0,
		y: 0,
		moved: 0,
		has: false,
	};

	window.addEventListener('pointermove', (e) => {
		const r = el.getBoundingClientRect();

		pointer.x = e.clientX - r.left;
		pointer.y = e.clientY - r.top;

		pointer.moved = performance.now();
		pointer.has = true;
	});

	/* ---------- animation state ---------- */

	let raf = 0;
	let last = null;

	let mx = 0;
	let my = 0;

	let started = false;

	/* ---------- image placement ---------- */

	const placements = new Map();

	/**
	 * First sequence:
	 *   Uses the existing random placement and size variation.
	 *
	 * Second sequence:
	 *   Uses a smaller size and a position opposite to the first image.
	 *
	 * Separate cache keys keep the two placement systems independent.
	 */
	function fit(aspect, W, H, key, layer = 1, primary = null) {
		const landscape = W / H > 0.9;
		const wide = aspect > 1.6;

		const maxW = wide
			? W * (landscape ? 0.72 : 0.9)
			: landscape
				? W * 0.62
				: W * 0.86;

		const maxH = landscape ? H * 0.8 : H * 0.34;

		const baseH = Math.min(maxH, maxW / aspect);

		const cacheKey = `${layer}:${key}:${W}x${H}`;

		if (!placements.has(cacheKey)) {
			const scale = layer === 1
				? 0.88 + Math.random() * 0.22
				: 0.68 + Math.random() * 0.10;

			const hh = baseH * scale;
			const size = [hh * aspect, hh];

			const padX = W * 0.035;
			const padY = H * 0.06;

			const minX = size[0] / 2 + padX;
			const maxX = W - size[0] / 2 - padX;

			const minY = size[1] / 2 + padY;
			const maxY = H - size[1] / 2 - padY;

			const clamp = (value, min, max) =>
				Math.max(min, Math.min(max, value));

			const randomBetween = (min, max) =>
				min <= max
					? min + Math.random() * (max - min)
					: (min + max) / 2;

			let center;

			if (layer === 1 || !primary) {
				center = [
					randomBetween(minX, maxX),
					randomBetween(minY, maxY),
				];
			} else {
				// Place the second sequence in the opposite screen quadrant.
				const targetX =
					primary.center[0] < W * 0.5
						? W * 0.72
						: W * 0.28;

				const targetY =
					primary.center[1] < H * 0.5
						? H * 0.72
						: H * 0.28;

				center = [
					clamp(targetX, minX, maxX),
					clamp(targetY, minY, maxY),
				];
			}

			placements.set(cacheKey, {
				size,
				center,
			});
		}

		return placements.get(cacheKey);
	}

	/* ---------- drawing ---------- */

	function frame(ms) {
		raf = 0;

		const dpr = getDpr();

		const W = Math.max(
			1,
			Math.round(el.clientWidth * dpr)
		);

		const H = Math.max(
			1,
			Math.round(el.clientHeight * dpr)
		);

		if (el.width !== W || el.height !== H) {
			el.width = W;
			el.height = H;
		}

		const dt = last == null
			? 0
			: Math.min((ms - last) / 1000, 0.05);

		last = ms;

		// Advance both transitions independently.
		if (mix < 1) {
			mix = Math.min(
				1,
				mix + (dt * 1000) / FADE_MS
			);
		}

		if (mix2 < 1) {
			mix2 = Math.min(
				1,
				mix2 + (dt * 1000) / FADE_MS
			);
		}

		if (mix >= 1) shownA = shownB;
		if (mix2 >= 1) shownC = shownD;

		// First sequence placements.
		const A = fit(
			textures[shownA].aspect,
			W,
			H,
			shownA,
			1
		);

		const B = fit(
			textures[shownB].aspect,
			W,
			H,
			shownB,
			1
		);

		// Second sequence placements use the corresponding first-layer
		// placements as reference points.
		const C = fit(
			textures[shownC].aspect,
			W,
			H,
			shownC,
			2,
			A
		);

		const D = fit(
			textures[shownD].aspect,
			W,
			H,
			shownD,
			2,
			B
		);

		const t = reduce ? 6 : ms / 1000;

		let tx;
		let ty;

		if (
			pointer.has &&
			performance.now() - pointer.moved < 4000
		) {
			tx = pointer.x * dpr;
			ty = H - pointer.y * dpr;
		} else {
			tx = B.center[0] +
				Math.sin(t * 0.5) * B.size[0] * 0.3;

			ty = B.center[1] +
				Math.sin(t * 0.37 + 1) * B.size[1] * 0.3;
		}

		if (!started) {
			mx = tx;
			my = ty;
			started = true;
		}

		mx += (tx - mx) * 0.08;
		my += (ty - my) * 0.08;

		/* ---------- uniforms ---------- */

		gl.viewport(0, 0, W, H);
		gl.useProgram(program);

		gl.uniform2f(u('uRes'), W, H);
		gl.uniform1f(u('uTime'), t);
		gl.uniform2f(u('uMouse'), mx, my);
		gl.uniform1f(u('uDpr'), dpr);

		gl.uniform3fv(u('uBg'), theme.bg);
		gl.uniform3fv(u('uFg'), theme.fg);
		gl.uniform3fv(u('uAcc'), theme.acc);

		// First sequence positions and transition.
		gl.uniform2f(
			u('uCA'),
			A.center[0],
			A.center[1]
		);

		gl.uniform2f(
			u('uSA'),
			A.size[0],
			A.size[1]
		);

		gl.uniform2f(
			u('uCB'),
			B.center[0],
			B.center[1]
		);

		gl.uniform2f(
			u('uSB'),
			B.size[0],
			B.size[1]
		);

		gl.uniform1f(u('uMix'), mix);

		// Second sequence positions and transition.
		gl.uniform2f(
			u('uCC'),
			C.center[0],
			C.center[1]
		);

		gl.uniform2f(
			u('uSC'),
			C.size[0],
			C.size[1]
		);

		gl.uniform2f(
			u('uCD'),
			D.center[0],
			D.center[1]
		);

		gl.uniform2f(
			u('uSD'),
			D.size[0],
			D.size[1]
		);

		gl.uniform1f(u('uMix2'), mix2);

		gl.uniform1f(
			u('uLayer2On'),
			secondaryEnabled ? 1 : 0
		);

		/* ---------- texture units ---------- */

		// Texture 0: first sequence image A
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(
			gl.TEXTURE_2D,
			textures[shownA].tex
		);
		gl.uniform1i(u('uTexA'), 0);

		// Texture 1: first sequence image B
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(
			gl.TEXTURE_2D,
			textures[shownB].tex
		);
		gl.uniform1i(u('uTexB'), 1);

		// Texture 2: second sequence image C
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(
			gl.TEXTURE_2D,
			textures[shownC].tex
		);
		gl.uniform1i(u('uTexC'), 2);

		// Texture 3: second sequence image D
		gl.activeTexture(gl.TEXTURE3);
		gl.bindTexture(
			gl.TEXTURE_2D,
			textures[shownD].tex
		);
		gl.uniform1i(u('uTexD'), 3);

		// Texture 4: title mask
		gl.activeTexture(gl.TEXTURE4);
		gl.bindTexture(gl.TEXTURE_2D, title.tex);
		gl.uniform1i(u('uName'), 4);

		gl.uniform1f(
			u('uNameOn'),
			title.ready ? 1 : 0
		);

		if (title.ready) {
			const r = title.node.getBoundingClientRect();
			const b = el.getBoundingClientRect();

			gl.uniform2f(
				u('uCN'),
				(r.left - b.left + r.width / 2) * dpr,
				H - (r.top - b.top + r.height / 2) * dpr
			);

			gl.uniform2f(
				u('uSN'),
				Math.ceil(r.width * dpr),
				Math.ceil(r.height * dpr)
			);
		}

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		if (
			animating() ||
			mix < 1 ||
			mix2 < 1
		) {
			requestFrame();
		}
	}

	function requestFrame() {
		if (!raf) {
			raf = requestAnimationFrame(frame);
		}
	}

	/* ---------- pause ---------- */

	function setPaused(value) {
		paused = value;
		last = null;

		if (!paused) requestFrame();
	}

	/* ---------- events ---------- */

	window.addEventListener('resize', requestFrame);

	document.addEventListener('visibilitychange', () => {
		last = null;
		requestFrame();
	});

	requestFrame();

	return {
		el,
		preview,
		setPaused,
		setTitle,
	};
}
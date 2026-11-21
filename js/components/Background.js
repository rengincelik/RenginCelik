import { h } from '../lib/dom.js';
import { backgrounds } from '../data/backgrounds.js';
import { VERTEX, FRAGMENT } from '../lib/backgroundShader.js';

const MAX_TEX_H = 440; // images are downscaled before upload; dots are ~3px cells
const MAX_TEX_W = 1100;
const FADE_MS = 700; // dissolve duration
const HOVER_IN_MS = 120; // small delays so sweeping the cursor doesn't flicker
const HOVER_OUT_MS = 400;

const hexToRgb = (value, fallback) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(value).trim());
  const n = parseInt(m ? m[1] : fallback, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * Animated desktop background (WebGL2 canvas behind everything).
 * Default mode cycles through `config.cycle`; preview(windowId) shows the image
 * mapped to that window while it is hovered/focused. Falls back to the plain
 * page colour when WebGL2 is unavailable.
 *
 * @returns {{ el: HTMLCanvasElement, preview: (id: string|null) => void, setPaused: (p: boolean) => void }}
 */
export function Background(config = backgrounds) {
  const el = h('canvas', { class: 'desktop__bg', 'aria-hidden': 'true' });
  const none = { el, preview() {}, setPaused() {} };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cycle = (config.cycle ?? []).filter((k) => config.images?.[k]);
  if (!cycle.length) return none;

  let gl = null;
  try {
    gl = el.getContext('webgl2', { alpha: false, antialias: false });
  } catch (err) {
    console.warn('Background: WebGL2 unavailable', err);
  }
  if (!gl) return none;

  /* ---------- program ---------- */
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (err) {
    console.warn('Background: shader failed', err);
    return none;
  }
  const uniforms = {};
  const u = (name) => (name in uniforms ? uniforms[name] : (uniforms[name] = gl.getUniformLocation(program, name)));

  /* ---------- textures ---------- */
  const textures = {};
  function loadTexture(key) {
    const entry = { tex: gl.createTexture(), aspect: 1 };
    gl.bindTexture(gl.TEXTURE_2D, entry.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    setParams();
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const k = Math.min(1, MAX_TEX_H / img.naturalHeight, MAX_TEX_W / img.naturalWidth);
      const w = Math.max(1, Math.round(img.naturalWidth * k));
      const hh = Math.max(1, Math.round(img.naturalHeight * k));
      const c = document.createElement('canvas');
      c.width = w;
      c.height = hh;
      c.getContext('2d').drawImage(img, 0, 0, w, hh);
      gl.bindTexture(gl.TEXTURE_2D, entry.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      setParams();
      entry.aspect = w / hh;
      requestFrame();
    };
    img.onerror = () => console.warn(`Background: could not load "${config.images[key].src}"`);
    img.src = config.images[key].src;
    textures[key] = entry;
  }
  function setParams() {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  const used = new Set([...cycle, ...Object.values(config.windows ?? {})]);
  used.forEach((key) => config.images[key] && loadTexture(key));

  /* ---------- theme (reads the site's colour variables) ---------- */
  let theme = { bg: [0.133, 0.133, 0.133], fg: [0.953, 0.953, 0.945], acc: [0.961, 0.408, 0.239] };
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    theme = {
      bg: hexToRgb(cs.getPropertyValue('--bg'), '222222'),
      fg: hexToRgb(cs.getPropertyValue('--fg'), 'f3f3f1'),
      acc: hexToRgb(cs.getPropertyValue('--accent'), 'f5683d'),
    };
  }
  readTheme();
  new MutationObserver(() => {
    readTheme();
    requestFrame();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-tone'] });

  /* ---------- which image is shown ---------- */
  let cycleIndex = 0;
  let shownA = cycle[0];
  let shownB = cycle[0];
  let mix = 1;
  let previewKey = null;
  let previewTimer = 0;
  let paused = false;
  el.dataset.image = shownB;

  function setTarget(key) {
    if (!key || key === shownB || !textures[key]) return;
    if (reduce) {
      shownA = shownB = key;
      mix = 1;
    } else {
      shownA = mix >= 0.5 ? shownB : shownA; // keep whichever is mostly visible
      shownB = key;
      mix = 0;
    }
    el.dataset.image = key;
    requestFrame();
  }

  function preview(id) {
    clearTimeout(previewTimer);
    const key = id == null ? null : config.windows?.[id];
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

  const animating = () => !reduce && !paused && !document.hidden;

  if (!reduce && cycle.length > 1) {
    setInterval(() => {
      if (!animating() || previewKey) return;
      cycleIndex = (cycleIndex + 1) % cycle.length;
      setTarget(cycle[cycleIndex]);
    }, config.intervalMs ?? 7000);
  }

  /* ---------- drawing ---------- */
  const pointer = { x: 0, y: 0, moved: 0, has: false };
  window.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.moved = performance.now();
    pointer.has = true;
  });

  let raf = 0;
  let last = null;
  let mx = 0;
  let my = 0;
  let started = false;

  /** Size and centre (in canvas px, y up) of an image on screen. */
  function fit(aspect, W, H) {
    const landscape = W / H > 0.9;
    const wide = aspect > 1.6; // panoramic images sit low and centred, under the menu
    const maxW = wide ? W * (landscape ? 0.72 : 0.9) : landscape ? W * 0.62 : W * 0.86;
    const maxH = landscape ? H * 0.8 : H * 0.34;
    const hh = Math.min(maxH, maxW / aspect);
    const size = [hh * aspect, hh];
    let center;
    if (!landscape) center = [W * 0.5, H * 0.19];
    else if (wide) center = [W * 0.5, H * 0.25];
    else center = [W - size[0] / 2 - W * 0.04, H * 0.5];
    return { size, center };
  }

  function frame(ms) {
    raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(1, Math.round(el.clientWidth * dpr));
    const H = Math.max(1, Math.round(el.clientHeight * dpr));
    if (el.width !== W || el.height !== H) {
      el.width = W;
      el.height = H;
    }
    const dt = last == null ? 0 : Math.min((ms - last) / 1000, 0.05);
    last = ms;
    if (mix < 1) mix = Math.min(1, mix + (dt * 1000) / FADE_MS);
    if (mix >= 1) shownA = shownB;

    const A = fit(textures[shownA].aspect, W, H);
    const B = fit(textures[shownB].aspect, W, H);
    const t = reduce ? 6 : ms / 1000;
    let tx;
    let ty;
    if (pointer.has && performance.now() - pointer.moved < 4000) {
      tx = pointer.x * dpr;
      ty = H - pointer.y * dpr;
    } else {
      tx = B.center[0] + Math.sin(t * 0.5) * B.size[0] * 0.3;
      ty = B.center[1] + Math.sin(t * 0.37 + 1) * B.size[1] * 0.3;
    }
    if (!started) {
      mx = tx;
      my = ty;
      started = true;
    }
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;

    gl.viewport(0, 0, W, H);
    gl.useProgram(program);
    gl.uniform2f(u('uRes'), W, H);
    gl.uniform1f(u('uTime'), t);
    gl.uniform2f(u('uMouse'), mx, my);
    gl.uniform1f(u('uDpr'), dpr);
    gl.uniform3fv(u('uBg'), theme.bg);
    gl.uniform3fv(u('uFg'), theme.fg);
    gl.uniform3fv(u('uAcc'), theme.acc);
    gl.uniform2f(u('uCA'), A.center[0], A.center[1]);
    gl.uniform2f(u('uSA'), A.size[0], A.size[1]);
    gl.uniform2f(u('uCB'), B.center[0], B.center[1]);
    gl.uniform2f(u('uSB'), B.size[0], B.size[1]);
    gl.uniform1f(u('uMix'), mix);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[shownA].tex);
    gl.uniform1i(u('uTexA'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[shownB].tex);
    gl.uniform1i(u('uTexB'), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (animating() || mix < 1) requestFrame();
  }

  function requestFrame() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function setPaused(value) {
    paused = value;
    last = null;
    if (!paused) requestFrame();
  }

  window.addEventListener('resize', requestFrame);
  document.addEventListener('visibilitychange', () => {
    last = null;
    requestFrame();
  });
  requestFrame();

  return { el, preview, setPaused };
}

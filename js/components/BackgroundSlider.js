import { h } from '../lib/dom.js';

/**
 * Background slider: one number (0-100) drives every colour on the page.
 *
 *   0 = near-white  ...  gray  ...  near-black = 100
 *
 * To guarantee WCAG AA at every position, the gray ramp has a deliberate
 * seam: it runs near-white -> LIGHT_FLOOR, then jumps to DARK_CEIL ->
 * near-black. The mid-gray band between the two (where neither dark nor light
 * text can reach 4.5:1 together with a coloured accent) is skipped, so the
 * slider never rests in a dead zone. Text is dark above the seam, light below.
 * Muted text and the accent are fitted per position to stay >= MIN_CONTRAST.
 *
 * computeTheme() is pure (no DOM) so it can be tested in Node.
 */

const STORAGE_KEY = 'rc-bg-tone';

// ---- Tone model (gray levels are sRGB 0-255) ----------------------------
const GRAY_LIGHTEST = 245; // near-white
const GRAY_DARKEST = 14; // near-black
const GRAY_LIGHT_FLOOR = 135; // darkest background that still gets dark text
const GRAY_DARK_CEIL = 88; // lightest background that still gets light text
const DEFAULT_GRAY = 34; // dark charcoal

const INK_DARK = [17, 17, 17];
const INK_LIGHT = [243, 243, 241];
const MIN_CONTRAST = 4.6; // WCAG AA is 4.5; small safety margin
const ACCENT_HUE = 14; // one accent: vermilion
const ACCENT_SAT = 0.9;

const LIGHT_SPAN = GRAY_LIGHTEST - GRAY_LIGHT_FLOOR;
const DARK_SPAN = GRAY_DARK_CEIL - GRAY_DARKEST;
const TOTAL_SPAN = LIGHT_SPAN + DARK_SPAN;

export const DEFAULT_VALUE = Math.round(
  ((LIGHT_SPAN + (GRAY_DARK_CEIL - DEFAULT_GRAY)) / TOTAL_SPAN) * 100
);

// ---- Colour maths -------------------------------------------------------
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const toLinear = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const luminance = ([r, g, b]) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

const toHex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');

function hslToRgb(hue, sat, light) {
  const k = (n) => (n + hue / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

/** Largest mix of fg toward bg (muted look) that still meets MIN_CONTRAST. */
function fitMuted(fg, bg) {
  for (let t = 0.4; t > 0; t -= 0.01) {
    const c = mix(fg, bg, t);
    if (contrast(c, bg) >= MIN_CONTRAST) return c;
  }
  return fg;
}

/** Accent: fixed hue, lightness walked away from the bg until AA is met. */
function fitAccent(bg, onLightBg) {
  const [from, to, step] = onLightBg ? [0.42, 0.1, -0.01] : [0.6, 0.92, 0.01];
  let rgb = hslToRgb(ACCENT_HUE, ACCENT_SAT, from);
  for (let l = from; onLightBg ? l >= to : l <= to; l += step) {
    rgb = hslToRgb(ACCENT_HUE, ACCENT_SAT, l);
    if (contrast(rgb, bg) >= MIN_CONTRAST) return rgb;
  }
  return rgb;
}

/** Slider value (0-100) -> background gray level, skipping the dead band. */
export function grayForValue(value) {
  const pos = (clamp(value, 0, 100) / 100) * TOTAL_SPAN;
  const gray =
    pos <= LIGHT_SPAN ? GRAY_LIGHTEST - pos : GRAY_DARK_CEIL - (pos - LIGHT_SPAN);
  return Math.round(gray);
}

/** Slider value -> every colour token (hex strings) plus raw RGB for tests. */
export function computeTheme(value) {
  const gray = grayForValue(value);
  const bg = [gray, gray, gray];
  const onLight = gray > (GRAY_LIGHT_FLOOR + GRAY_DARK_CEIL) / 2;
  const fg = onLight ? INK_DARK : INK_LIGHT;
  const muted = fitMuted(fg, bg);
  const accent = fitAccent(bg, onLight);
  return {
    scheme: onLight ? 'light' : 'dark',
    rgb: { bg, fg, muted, accent },
    css: {
      '--bg': toHex(bg),
      '--fg': toHex(fg),
      '--muted': toHex(muted),
      '--line': toHex(mix(fg, bg, 0.84)),
      '--line-strong': toHex(mix(fg, bg, 0.55)),
      '--accent': toHex(accent),
    },
  };
}

// ---- DOM side -----------------------------------------------------------
export function applyTone(value) {
  const { css, scheme } = computeTheme(value);
  const root = document.documentElement;
  for (const [name, val] of Object.entries(css)) root.style.setProperty(name, val);
  root.style.colorScheme = scheme;
  root.dataset.tone = scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', css['--bg']);
}

export function loadTone() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = Number(raw);
    if (raw !== null && raw !== '' && Number.isFinite(n)) return clamp(Math.round(n), 0, 100);
  } catch {
    /* storage unavailable: fall through to the default */
  }
  return DEFAULT_VALUE;
}

function saveTone(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

/** Call once, before rendering, so the first paint already has the right colours. */
export function initBackground() {
  applyTone(loadTone());
}

export function BackgroundSlider() {
  const value = loadTone();
  const describe = (v) =>
    `${v} of 100, ${computeTheme(v).scheme === 'dark' ? 'dark' : 'light'} background`;

  const input = h('input', {
    id: 'bg-slider',
    class: 'bg-slider__input',
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    value,
    'aria-valuetext': describe(value),
  });

  input.addEventListener('input', () => {
    const v = Number(input.value);
    applyTone(v);
    input.setAttribute('aria-valuetext', describe(v));
    saveTone(v);
  });

  return h(
    'div',
    { class: 'bg-slider' },
    h(
      'label',
      { class: 'bg-slider__label', for: 'bg-slider' },
      h('span', { 'aria-hidden': 'true' }, 'Bg'),
      h('span', { class: 'visually-hidden' }, 'Background brightness')
    ),
    input
  );
}

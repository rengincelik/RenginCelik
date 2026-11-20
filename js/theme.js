// Background slider palette.
//
// One value (0-100) drives every colour token. 0 = near-white, 100 = near-black.
//
// Why there is a deliberate jump at SPLIT:
// Around a mid-gray background (relative luminance ~0.18) NO text colour can
// reach much more than 4.58:1 against it, so body text, muted text and the
// accent could not all keep WCAG AA. Instead of crossing that dead zone, the
// slider moves continuously through the light half, then steps once over the
// dead zone into the dark half and moves continuously again. Both halves
// still read as "gray"; neither contains an unreadable position.

export const STORAGE_KEY = 'portfolio:bg';
export const SPLIT = 50;            // values < SPLIT use dark text, >= SPLIT use light text
export const DEFAULT_VALUE = 84;    // dark charcoal

const STOPS = {
  light: { from: '#f7f6f3', to: '#b4b4b3' }, // near-white -> light gray
  dark:  { from: '#404042', to: '#0d0d0e' }, // dark gray  -> near-black
};
const INK = { light: '#0b0b0c', dark: '#f5f4f1' };

const ACCENT_HUE = 16;   // one accent colour (orange-red), lightness is solved per position
const ACCENT_SAT = 85;
const MIN = { muted: 5, accent: 4.6 }; // targets; WCAG AA floor is 4.5

/* ---------- colour maths ---------- */
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb) => '#' + rgb.map((n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((n, i) => n + (B[i] - n) * t));
};
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function hsl(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex([f(0), f(8), f(4)].map((v) => v * 255));
}

/* ---------- palette ---------- */
function solveMuted(fg, bg) {
  for (let m = 0.45; m >= 0; m -= 0.05) {
    const c = mix(fg, bg, m);
    if (contrast(c, bg) >= MIN.muted) return c;
  }
  return fg;
}
function solveAccent(tone, bg, fg) {
  // Start at a pleasant lightness and walk away from the background until AA is met.
  const start = tone === 'dark' ? 62 : 38;
  const step = tone === 'dark' ? 1 : -1;
  for (let l = start; l >= 0 && l <= 100; l += step) {
    const c = hsl(ACCENT_HUE, ACCENT_SAT, l);
    if (contrast(c, bg) >= MIN.accent) return c;
  }
  return fg;
}

export function paletteAt(value) {
  const v = clamp(Math.round(Number(value)), 0, 100);
  const tone = v < SPLIT ? 'light' : 'dark';
  const t = tone === 'light' ? v / (SPLIT - 1) : (v - SPLIT) / (100 - SPLIT);
  const bg = mix(STOPS[tone].from, STOPS[tone].to, t);
  const fg = INK[tone];
  return {
    value: v,
    tone,
    bg,
    fg,
    muted: solveMuted(fg, bg),
    border: mix(fg, bg, 0.82), // decorative hairline, not text
    accent: solveAccent(tone, bg, fg),
  };
}

/* ---------- DOM + storage (browser only) ---------- */
export function applyPalette(value, root = document.documentElement) {
  const p = paletteAt(value);
  root.style.setProperty('--bg', p.bg);
  root.style.setProperty('--fg', p.fg);
  root.style.setProperty('--muted', p.muted);
  root.style.setProperty('--border', p.border);
  root.style.setProperty('--accent', p.accent);
  root.style.colorScheme = p.tone;
  root.dataset.tone = p.tone;
  return p;
}

export function loadValue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isFinite(n)) return clamp(Math.round(n), 0, 100);
    }
  } catch { /* storage unavailable: fall through to default */ }
  return DEFAULT_VALUE;
}

export function saveValue(value) {
  try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* ignore */ }
}

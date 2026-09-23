// Pure color utilities. No DOM access. Unit-testable.

export function clamp(value, min = 0, max = 255) {
  return Math.min(Math.max(value, min), max);
}

// ---------- RGB <-> HEX ----------

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(x => Math.round(clamp(x)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export function hexToRgb(hex) {
  let value = String(hex).trim().replace(/^#/, '');
  if (/^[a-f\d]{3}$/i.test(value)) {
    value = value.split('').map(c => c + c).join('');
  }
  if (!/^[a-f\d]{6}$/i.test(value)) {
    return null;
  }
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

// Accepts partial inputs like "FF00", "f0", "12ab" and expands to a full hex.
export function parseHexInput(input) {
  const value = String(input).replace(/[^a-f\d]/gi, '').slice(0, 6);
  const padded = value.padEnd(6, '0');
  return rgbToHex(
    parseInt(padded.slice(0, 2), 16),
    parseInt(padded.slice(2, 4), 16),
    parseInt(padded.slice(4, 6), 16)
  );
}

// ---------- RGB <-> HSL ----------

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255)
  };
}

// ---------- RGB <-> HSV ----------

export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const v = max;

  if (d !== 0) {
    s = d / max;
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  v = clamp(v, 0, 100) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255)
  };
}

// ---------- RGB <-> CMY K ----------

export function rgbToCmyk(r, g, b) {
  if (r === 0 && g === 0 && b === 0) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100)
  };
}

// ---------- WCAG contrast ----------

function linearizeChannel(c) {
  return c <= 0.03928
    ? c / 12.92
    : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(r, g, b) {
  const [rl, gl, bl] = [r, g, b].map(x => linearizeChannel(clamp(x) / 255));
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function contrastRatio(lumA, lumB) {
  const [l1, l2] = [lumA, lumB].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function getContrast({ r, g, b }, syntax = 'avg') {
  const lum = relativeLuminance(r, g, b);
  return contrastRatio(lum, 0);
}

export function bestTextColor(r, g, b) {
  const lum = relativeLuminance(r, g, b);
  return lum > 0.179 ? '#000000' : '#ffffff';
}

export function wcagRating(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-Large';
  return '';
}

// ---------- String helpers ----------

export function rgbToHexString(r, g, b) {
  return rgbToHex(r, g, b);
}

export function rgbToRgbString(r, g, b) {
  return `rgb(${Math.round(clamp(r))}, ${Math.round(clamp(g))}, ${Math.round(clamp(b))})`;
}

export function rgbToHslString(r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function rgbToCmykString(r, g, b) {
  const { c, m, y, k } = rgbToCmyk(r, g, b);
  return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
}

// ---------- Harmonías de color (basadas en tono) ----------

function hueShift(h, delta) {
  return ((h + delta) % 360 + 360) % 360;
}

export function generateHarmonies({ r, g, b }) {
  const { h, s, v } = rgbToHsv(r, g, b);
  const shift = (delta, count = 1, pad = true) =>
    Array.from({ length: count }, (_, i) =>
      hueShift(h, delta * (pad ? i + 1 : i))
    );

  const toRgb = hue => hsvToRgb(hue, s, v);

  return [
    {
      id: 'complementary',
      colors: [h, hueShift(h, 180)].map(toRgb)
    },
    {
      id: 'analogous',
      colors: shift(-30, 3, false).map(toRgb)
    },
    {
      id: 'triadic',
      colors: shift(120, 2).map(toRgb)
    },
    {
      id: 'split',
      colors: [hueShift(h, 150), hueShift(h, 210)].map(toRgb)
    },
    {
      id: 'tetradic',
      colors: [hueShift(h, 90), hueShift(h, 180), hueShift(h, 270)].map(toRgb)
    }
  ];
}

// ---------- Random ----------

export function randomColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  };
}

export function isDark(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  return relativeLuminance(rgb.r, rgb.g, rgb.b) < 0.179;
}
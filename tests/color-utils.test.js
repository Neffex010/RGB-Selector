import { describe, it, expect } from 'vitest';
import {
  clamp,
  rgbToHex,
  hexToRgb,
  parseHexInput,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToCmyk,
  relativeLuminance,
  contrastRatio,
  wcagRating,
  bestTextColor,
  generateHarmonies,
  randomColor,
  isDark
} from '../js/color-utils.js';

describe('clamp', () => {
  it('limita valores fuera de rango', () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(300)).toBe(255);
    expect(clamp(128)).toBe(128);
  });
});

describe('rgbToHex', () => {
  it('convierte colores básicos', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00FF00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000FF');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    expect(rgbToHex(128, 128, 128)).toBe('#808080');
  });

  it('rellena con ceros', () => {
    expect(rgbToHex(1, 2, 0)).toBe('#010200');
  });
});

describe('hexToRgb', () => {
  it('parsea hex de 6 dígitos', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('00FF00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('expande hex de 3 dígitos', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#f0f')).toEqual({ r: 255, g: 0, b: 255 });
  });

  it('devuelve null en entradas inválidas', () => {
    expect(hexToRgb('xyz')).toBeNull();
    expect(hexToRgb('#12')).toBeNull();
    expect(hexToRgb('#1234567')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
});

describe('parseHexInput', () => {
  it('expande entradas parciales rellenando con ceros', () => {
    expect(parseHexInput('ff')).toBe('#FF0000');
    expect(parseHexInput('f')).toBe('#F00000');
    expect(parseHexInput('12ab')).toBe('#12AB00');
  });

  it('ignora caracteres no hexadecimales y limita a 6', () => {
    expect(parseHexInput('xyz#ff')).toBe('#FF0000');
    expect(parseHexInput('1234567890')).toBe('#123456');
  });
});

describe('rgbToHsl', () => {
  it('convierte primarios', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
  });

  it('maneja neutros', () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });
});

describe('hslToRgb', () => {
  it('invierte el primario rojo', () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('hace round-trip con tolerancia (pérdida por redondeo)', () => {
    const samples = [
      [255, 0, 0], [0, 255, 0], [0, 0, 255], [12, 189, 243], [200, 40, 190], [90, 90, 90]
    ];
    for (const [r, g, b] of samples) {
      const { h, s, l } = rgbToHsl(r, g, b);
      const { r: rr, g: rg, b: rb } = hslToRgb(h, s, l);
      expect(Math.abs(rr - r)).toBeLessThanOrEqual(1);
      expect(Math.abs(rg - g)).toBeLessThanOrEqual(1);
      expect(Math.abs(rb - b)).toBeLessThanOrEqual(1);
    }
  });
});

describe('rgbToHsv / hsvToRgb', () => {
  it('convierte primarios', () => {
    expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });
    expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 });
    expect(rgbToHsv(255, 255, 255)).toEqual({ h: 0, s: 0, v: 100 });
    expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 });
  });

  it('hace round-trip con tolerancia', () => {
    const samples = [
      [255, 0, 0], [0, 120, 255], [30, 200, 60], [150, 30, 200], [90, 90, 90]
    ];
    for (const [r, g, b] of samples) {
      const { h, s, v } = rgbToHsv(r, g, b);
      const { r: rr, g: rg, b: rb } = hsvToRgb(h, s, v);
      expect(Math.abs(rr - r)).toBeLessThanOrEqual(3);
      expect(Math.abs(rg - g)).toBeLessThanOrEqual(3);
      expect(Math.abs(rb - b)).toBeLessThanOrEqual(3);
    }
  });
});

describe('rgbToCmyk', () => {
  it('convierte casos límite', () => {
    expect(rgbToCmyk(0, 0, 0)).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    expect(rgbToCmyk(255, 255, 255)).toEqual({ c: 0, m: 0, y: 0, k: 0 });
    expect(rgbToCmyk(255, 0, 0)).toEqual({ c: 0, m: 100, y: 100, k: 0 });
    expect(rgbToCmyk(0, 255, 0)).toEqual({ c: 100, m: 0, y: 100, k: 0 });
  });
});

describe('contraste WCAG', () => {
  it('luminancia de extremos', () => {
    expect(relativeLuminance(0, 0, 0)).toBe(0);
    expect(relativeLuminance(255, 255, 255)).toBe(1);
  });

  it('contraste blanco/negro ≈ 21:1', () => {
    const ratio = contrastRatio(relativeLuminance(255, 255, 255), relativeLuminance(0, 0, 0));
    expect(ratio).toBeGreaterThanOrEqual(20.9);
    expect(ratio).toBeLessThanOrEqual(21.1);
  });

  it('clasifica niveles AA/AAA', () => {
    expect(wcagRating(21)).toBe('AAA');
    expect(wcagRating(7)).toBe('AAA');
    expect(wcagRating(5)).toBe('AA');
    expect(wcagRating(4.5)).toBe('AA');
    expect(wcagRating(3.9)).toBe('AA-Large');
    expect(wcagRating(2)).toBe('');
  });

  it('elige texto negro sobre fondos claros y viceversa', () => {
    expect(bestTextColor(255, 255, 255)).toBe('#000000');
    expect(bestTextColor(0, 0, 0)).toBe('#ffffff');
    expect(bestTextColor(255, 255, 0)).toBe('#000000');
  });
});

describe('generateHarmonies', () => {
  const base = { r: 255, g: 0, b: 0 };
  const harmonies = generateHarmonies(base);

  it('genera los 5 esquemas', () => {
    expect(harmonies.map(s => s.id)).toEqual(
      ['complementary', 'analogous', 'triadic', 'split', 'tetradic']
    );
  });

  it('contiene la cantidad correcta de colores por esquema', () => {
    const byId = Object.fromEntries(harmonies.map(h => [h.id, h.colors.length]));
    expect(byId).toEqual({
      complementary: 2,
      analogous: 3,
      triadic: 2,
      split: 2,
      tetradic: 3
    });
  });

  it('todos los colores generados están en rango válido', () => {
    for (const scheme of harmonies) {
      for (const c of scheme.colors) {
        expect(c.r).toBeGreaterThanOrEqual(0);
        expect(c.r).toBeLessThanOrEqual(255);
        expect(c.g).toBeGreaterThanOrEqual(0);
        expect(c.g).toBeLessThanOrEqual(255);
        expect(c.b).toBeGreaterThanOrEqual(0);
        expect(c.b).toBeLessThanOrEqual(255);
      }
    }
  });

  it('el complementario de rojo es cian', () => {
    const comp = harmonies.find(h => h.id === 'complementary').colors[1];
    expect(rgbToHex(comp.r, comp.g, comp.b)).toBe('#00FFFF');
  });
});

describe('randomColor / isDark', () => {
  it('genera colores aleatorios válidos', () => {
    for (let i = 0; i < 50; i++) {
      const { r, g, b } = randomColor();
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    }
  });

  it('clasifica oscuros y claros', () => {
    expect(isDark('#000000')).toBe(true);
    expect(isDark('#FFFFFF')).toBe(false);
    expect(isDark('#606060')).toBe(true);
    expect(isDark('#808080')).toBe(false);
    expect(isDark('#FFE000')).toBe(false);
  });
});
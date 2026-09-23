import {
  clamp,
  rgbToHex,
  hexToRgb,
  parseHexInput,
  rgbToHsv,
  hsvToRgb,
  rgbToRgbString,
  rgbToHslString,
  rgbToCmykString,
  relativeLuminance,
  contrastRatio,
  wcagRating,
  bestTextColor,
  generateHarmonies,
  randomColor
} from './color-utils.js';

// ---------------------------------------------------------------- DOM refs
const $ = id => document.getElementById(id);

const els = {
  preview: $('color-display'),
  contrastText: $('contrast-text'),
  fullValue: $('full-color-value'),
  contrastInfo: $('contrast-info'),
  copyAllBtn: $('copy-all-btn'),

  svCanvas: $('sv-picker'),
  svWrap: $('sv-wrap'),
  svMarker: $('sv-marker'),

  hueSlider: $('hue-slider'),
  hueValue: $('hue-value'),

  redSlider: $('red-slider'),
  greenSlider: $('green-slider'),
  blueSlider: $('blue-slider'),
  redInput: $('red-input'),
  greenInput: $('green-input'),
  blueInput: $('blue-input'),
  redValue: $('red-value'),
  greenValue: $('green-value'),
  blueValue: $('blue-value'),

  hexInput: $('hex-input'),
  nativeColor: $('native-color'),
  nativeColorBtn: $('native-color-btn'),

  randomBtn: $('random-color-btn'),
  randomPaletteBtn: $('random-palette-btn'),
  saveBtn: $('save-color-btn'),

  hexValue: $('hex-value'),
  rgbValue: $('rgb-value'),
  hslValue: $('hsl-value'),
  cmykValue: $('cmyk-value'),

  harmonyList: $('harmony-list'),
  randomPaletteList: $('random-palette-list'),
  randomPaletteWrap: $('random-palette-wrap'),

  savedList: $('saved-colors-list'),
  clearSavedBtn: $('clear-saved-btn'),

  exportCssBtn: $('export-css-btn'),
  exportPngBtn: $('export-png-btn'),

  langBtn: $('lang-toggle'),
  shareBtn: $('share-btn'),
  toast: $('toast'),
  toastBody: $('toast-body')
};

// ---------------------------------------------------------------- i18n
const I18N = {
  es: {
    lang: 'en',
    langBtn: 'EN',
    title: 'Color Picker Profesional',
    tagline: 'Diseña, combina y exporta tu paleta de colores',
    preview: 'Vista previa',
    picker: 'Selector visual',
    hue: 'Matiz',
    rgb: 'RGB',
    base: 'Base',
    random: 'Color aleatorio',
    randomPalette: 'Paleta aleatoria',
    save: 'Guardar color',
    saved: 'Colores guardados',
    clearAll: 'Limpiar todos',
    harmonies: 'Armonías de color',
    copypalette: 'Copiar hexes',
    copied: '¡Copiado!',
    copyAll: 'Copiar todo',
    copyHex: 'Copiar HEX',
    nativePicker: 'Selector de color del navegador',
    copyRgb: 'Copiar RGB',
    copyHsl: 'Copiar HSL',
    copyCmyk: 'Copiar CMYK',
    share: 'Compartir',
    export: 'Exportar',
    exportCss: 'CSS',
    exportPng: 'PNG',
    emptySaved: 'Aún no guardás colores',
    noPalette: 'Generá una paleta para verla aquí',
    saveSuccess: 'Color guardado correctamente',
    saveDuplicate: 'Ese color ya está guardado',
    savedRemoved: 'Color eliminado',
    allRemoved: 'Se eliminaron todos los colores',
    urlCopied: 'Link con tu color copiado',
    cssCopied: 'Variables CSS copiadas',
    pngExported: 'Paleta exportada como PNG',
    clipError: 'No se pudo copiar en este navegador',
    rating: (ratio, tag) => `Contraste ${ratio}:1 · ${tag}`,
    schemes: {
      complementary: 'Complementaria',
      analogous: 'Análoga',
      triadic: 'Triádica',
      split: 'Complementaria dividida',
      tetradic: 'Tetrádica'
    },
    paletteHere: 'Aqui'
  },
  en: {
    lang: 'es',
    langBtn: 'ES',
    title: 'Professional Color Picker',
    tagline: 'Design, combine and export your color palette',
    preview: 'Preview',
    picker: 'Visual picker',
    hue: 'Hue',
    rgb: 'RGB',
    base: 'Base',
    random: 'Random color',
    randomPalette: 'Random palette',
    save: 'Save color',
    saved: 'Saved colors',
    clearAll: 'Clear all',
    harmonies: 'Color harmonies',
    copypalette: 'Copy hexes',
    copied: 'Copied!',
    copyAll: 'Copy all',
    copyHex: 'Copy HEX',
    nativePicker: 'Browser color picker',
    copyRgb: 'Copy RGB',
    copyHsl: 'Copy HSL',
    copyCmyk: 'Copy CMYK',
    share: 'Share',
    export: 'Export',
    exportCss: 'CSS',
    exportPng: 'PNG',
    emptySaved: 'No saved colors yet',
    noPalette: 'Generate a palette to see it here',
    saveSuccess: 'Color saved successfully',
    saveDuplicate: 'This color is already saved',
    savedRemoved: 'Color removed',
    allRemoved: 'All colors removed',
    urlCopied: 'URL with your color copied',
    cssCopied: 'CSS variables copied',
    pngExported: 'Palette exported as PNG',
    clipError: 'Could not copy in this browser',
    rating: (ratio, tag) => `Contrast ${ratio}:1 · ${tag}`,
    schemes: {
      complementary: 'Complementary',
      analogous: 'Analogous',
      triadic: 'Triadic',
      split: 'Split-complementary',
      tetradic: 'Tetradic'
    },
    paletteHere: 'Here'
  }
};

// ---------------------------------------------------------------- state
const state = {
  color: { r: 128, g: 128, b: 128 },
  savedColors: [],
  lang: 'es',
  harmonies: [],
  sv: { h: 0, s: 0, v: 100 }
};

// ---------------------------------------------------------------- helpers
function t(key) {
  const dict = I18N[state.lang] || I18N.es;
  return key in dict ? dict[key] : key;
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  els.langBtn.textContent = t('langBtn');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  renderHarmonies();
}

function showToast(message, variant = 'success') {
  els.toast.classList.remove('toast--success', 'toast--error');
  els.toast.classList.add(`toast--${variant}`);
  els.toastBody.textContent = message;
  els.toast.classList.add('toast--visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.remove('toast--visible');
  }, 2400);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (err2) {
      return false;
    }
  }
}

function setUrlHex() {
  try {
    const hex = rgbToHex(state.color.r, state.color.g, state.color.b);
    const url = `${location.pathname}?color=${hex}`;
    history.replaceState(null, '', url);
  } catch (err) {
    // file:// o entorno sin soporte: ignora
  }
}

// ---------------------------------------------------------------- refresh pipeline
function refresh() {
  const { r, g, b } = state.color;
  const hex = rgbToHex(r, g, b);
  const { h, s, v } = rgbToHsv(r, g, b);

  // DOM state
  els.preview.style.backgroundColor = hex;
  els.contrastText.style.color = bestTextColor(r, g, b);
  els.fullValue.textContent = `RGB(${r}, ${g}, ${b}) · ${hex}`;

  // HSV state + hue slider
  state.sv = { h, s, v };
  els.hueSlider.value = h;
  els.hueValue.textContent = `${h}°`;
  drawSvPicker(h);
  positionSvMarker();

  // RGB controls
  els.redSlider.value = r;
  els.greenSlider.value = g;
  els.blueSlider.value = b;
  els.redInput.value = r;
  els.greenInput.value = g;
  els.blueInput.value = b;
  els.redValue.textContent = r;
  els.greenValue.textContent = g;
  els.blueValue.textContent = b;
  els.redSlider.style.setProperty('--fill', `${(r / 255) * 100}%`);
  els.greenSlider.style.setProperty('--fill', `${(g / 255) * 100}%`);
  els.blueSlider.style.setProperty('--fill', `${(b / 255) * 100}%`);

  // Formato
  els.hexInput.value = hex;
  els.hexValue.textContent = hex;
  els.rgbValue.textContent = rgbToRgbString(r, g, b);
  els.hslValue.textContent = rgbToHslString(r, g, b);
  els.cmykValue.textContent = rgbToCmykString(r, g, b);
  els.contrastText.textContent = t('preview');
  els.nativeColor.value = hex;

  updateContrast();
  renderHarmonies();
  setUrlHex();
}

function updateContrast() {
  const { r, g, b } = state.color;
  const lumBg = relativeLuminance(r, g, b);
  const [textR, textG, textB] = bestTextColor(r, g, b) === '#000000' ? [0, 0, 0] : [255, 255, 255];
  const lumFg = relativeLuminance(textR, textG, textB);
  const ratio = contrastRatio(lumBg, lumFg);
  const tag = wcagRating(ratio);
  els.contrastInfo.innerHTML = `${ratio.toFixed(1)}:1 ${tag ? `<b>${tag}</b>` : ''}`;
}

// ---------------------------------------------------------------- SV picker (canvas)
const CANVAS_W = 360;
const CANVAS_H = 260;

function drawSvPicker(hue) {
  const canvas = els.svCanvas;
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(CANVAS_W, CANVAS_H);
  const { data } = image;

  let i = 0;
  for (let y = 0; y < CANVAS_H; y++) {
    const v = 1 - y / (CANVAS_H - 1);
    for (let x = 0; x < CANVAS_W; x++) {
      const s = x / (CANVAS_W - 1);
      const rgb = hsvToRgb(hue, s * 100, v * 100);
      data[i++] = rgb.r;
      data[i++] = rgb.g;
      data[i++] = rgb.b;
      data[i++] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function positionSvMarker() {
  const s = state.sv.s / 100;
  const v = state.sv.v / 100;
  els.svMarker.style.left = `${(s * 100).toFixed(2)}%`;
  els.svMarker.style.top = `${((1 - v) * 100).toFixed(2)}%`;
}

function svPointerPos(clientX, clientY) {
  const rect = els.svCanvas.getBoundingClientRect();
  let x = ((clientX - rect.left) / rect.width) * 100;
  let y = ((clientY - rect.top) / rect.height) * 100;
  x = clamp(x, 0, 99.9);
  y = clamp(y, 0, 99.9);
  return { s: x, v: 100 - y };
}

function updateFromSvPointer(clientX, clientY) {
  const { s, v } = svPointerPos(clientX, clientY);
  state.color = hsvToRgb(state.sv.h, s, v);
  refresh();
}

// ---------------------------------------------------------------- color setters
function setColor(rgb) {
  state.color = { r: clamp(Math.round(rgb.r)), g: clamp(Math.round(rgb.g)), b: clamp(Math.round(rgb.b)) };
  refresh();
}

function updateFromSliders() {
  setColor({
    r: +els.redSlider.value,
    g: +els.greenSlider.value,
    b: +els.blueSlider.value
  });
}

function updateFromInputs() {
  setColor({
    r: +els.redInput.value || 0,
    g: +els.greenInput.value || 0,
    b: +els.blueInput.value || 0
  });
}

function updateFromHue() {
  const hue = +els.hueSlider.value;
  state.color = hsvToRgb(hue, state.sv.s, state.sv.v);
  refresh();
}

function applyHexInput() {
  const parsed = hexToRgb(els.hexInput.value);
  if (parsed) {
    setColor(parsed);
  } else {
    els.hexInput.value = rgbToHex(state.color.r, state.color.g, state.color.b);
  }
  els.hexInput.style.background = '';
  els.hexInput.style.color = '';
}

function generateRandomColor() {
  setColor(randomColor());
}

// ---------------------------------------------------------------- armonías
function renderHarmonies() {
  state.harmonies = generateHarmonies(state.color);
  els.harmonyList.innerHTML = '';

  state.harmonies.forEach(scheme => {
    const row = document.createElement('div');
    row.className = 'harmony-row';

    const label = document.createElement('div');
    label.className = 'harmony-label';
    label.textContent = t('schemes')[scheme.id] || scheme.id;

    const swatches = document.createElement('div');
    swatches.className = 'harmony-swatches';

    scheme.colors.forEach(rgb => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'color-chip';
      sw.style.backgroundColor = rgbToHex(rgb.r, rgb.g, rgb.b);
      sw.title = rgbToHex(rgb.r, rgb.g, rgb.b);
      sw.dataset.hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      sw.addEventListener('click', () => setColor(rgb));
      swatches.appendChild(sw);
    });

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'btn-icon';
    copy.title = t('copypalette');
    copy.setAttribute('aria-label', t('copypalette'));
    copy.innerHTML = '<i class="bi bi-clipboard"></i>';
    copy.addEventListener('click', () => copyHexList(scheme.colors));

    row.appendChild(label);
    row.appendChild(swatches);
    row.appendChild(copy);
    els.harmonyList.appendChild(row);
  });
}

async function copyHexList(colors) {
  const hexes = colors.map(c => rgbToHex(c.r, c.g, c.b)).join(' ');
  const ok = await copyText(hexes);
  showToast(ok ? t('copied') : t('clipError'), ok ? 'success' : 'error');
}

// ---------------------------------------------------------------- paleta aleatoria
function generateRandomPalette() {
  els.randomPaletteList.innerHTML = '';
  const palette = Array.from({ length: 5 }, randomColor);

  palette.forEach(rgb => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'color-chip color-chip--large';
    sw.style.backgroundColor = hex;
    sw.title = hex;
    sw.addEventListener('click', () => setColor(rgb));
    els.randomPaletteList.appendChild(sw);
  });

  els.randomPaletteWrap.classList.remove('is-hidden');
}

// ---------------------------------------------------------------- colores guardados
function saveCurrentColor() {
  const hex = rgbToHex(state.color.r, state.color.g, state.color.b);
  if (state.savedColors.includes(hex)) {
    showToast(t('saveDuplicate'), 'error');
    return;
  }
  state.savedColors.push(hex);
  persistSavedColors();
  renderSavedColors();
  showToast(t('saveSuccess'));
}

function persistSavedColors() {
  try {
    localStorage.setItem('savedColors', JSON.stringify(state.savedColors));
  } catch (err) {
    // almacenamiento no disponible
  }
}

function loadSavedColors() {
  try {
    state.savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
  } catch (err) {
    state.savedColors = [];
  }
}

function renderSavedColors() {
  els.savedList.innerHTML = '';

  if (state.savedColors.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<i class="bi bi-inbox"></i>';
    const text = document.createElement('p');
    text.textContent = t('emptySaved');
    empty.appendChild(text);
    els.savedList.appendChild(empty);
    els.clearSavedBtn.style.display = 'none';
    return;
  }

  els.clearSavedBtn.style.display = 'inline-flex';

  state.savedColors.forEach((hex, index) => {
    const item = document.createElement('div');
    item.className = 'saved-item';

    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'color-chip color-chip--large';
    sw.style.backgroundColor = hex;
    sw.title = hex;
    sw.addEventListener('click', () => {
      const rgb = hexToRgb(hex);
      if (rgb) setColor(rgb);
    });
    sw.setAttribute('aria-label', hex);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'saved-remove';
    remove.setAttribute('aria-label', t('savedRemoved'));
    remove.innerHTML = '<i class="bi bi-x-lg"></i>';
    remove.addEventListener('click', () => {
      state.savedColors.splice(index, 1);
      persistSavedColors();
      renderSavedColors();
      showToast(t('savedRemoved'));
    });

    item.appendChild(sw);
    item.appendChild(remove);
    els.savedList.appendChild(item);
  });
}

function clearSavedColors() {
  state.savedColors = [];
  persistSavedColors();
  renderSavedColors();
  showToast(t('allRemoved'));
}

// ---------------------------------------------------------------- export
function getExportPalette() {
  const seen = new Set();
  const palette = [];
  const add = rgb => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    if (!seen.has(hex)) {
      seen.add(hex);
      palette.push({ rgb, hex });
    }
  };
  add(state.color);
  state.harmonies.forEach(scheme => scheme.colors.forEach(add));
  return palette.slice(0, 12);
}

async function exportCss() {
  const palette = getExportPalette();
  const lines = palette.map((item, i) => `  --color-${i + 1}: ${item.hex};`);
  const css = `:root {\n${lines.join('\n')}\n}`;
  const ok = await copyText(css);
  showToast(ok ? t('cssCopied') : t('clipError'), ok ? 'success' : 'error');
}

function exportPng() {
  const palette = getExportPalette();
  const swatchW = 64;
  const labelH = 26;
  const canvas = document.createElement('canvas');
  canvas.width = palette.length * swatchW;
  canvas.height = 64 + labelH;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  palette.forEach((item, i) => {
    ctx.fillStyle = item.hex;
    ctx.fillRect(i * swatchW, 0, swatchW, 64);

    ctx.fillStyle = bestTextColor(item.rgb.r, item.rgb.g, item.rgb.b);
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.hex, i * swatchW + swatchW / 2, 64 + labelH - 8);
  });

  const link = document.createElement('a');
  link.download = `paleta-${rgbToHex(state.color.r, state.color.g, state.color.b).slice(1)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast(t('pngExported'));
}

async function shareColor() {
  const hex = rgbToHex(state.color.r, state.color.g, state.color.b);
  const url = `${location.origin}${location.pathname}?color=${hex}`;
  const ok = await copyText(url);
  showToast(ok ? t('urlCopied') : t('clipError'), ok ? 'success' : 'error');
}

async function copyFormat(format) {
  const value = {
    hex: els.hexValue.textContent,
    rgb: els.rgbValue.textContent,
    hsl: els.hslValue.textContent,
    cmyk: els.cmykValue.textContent
  }[format];

  if (!value) return;
  const ok = await copyText(value);
  showToast(ok ? t('copied') : t('clipError'), ok ? 'success' : 'error');
}

async function copyAllFormats() {
  const text = [
    `HEX: ${els.hexValue.textContent}`,
    `RGB: ${els.rgbValue.textContent}`,
    `HSL: ${els.hslValue.textContent}`,
    `CMYK: ${els.cmykValue.textContent}`
  ].join('\n');
  const ok = await copyText(text);
  showToast(ok ? t('copied') : t('clipError'), ok ? 'success' : 'error');
}

// ---------------------------------------------------------------- eventos
function bindEvents() {
  els.hueSlider.addEventListener('input', updateFromHue);

  [els.redSlider, els.greenSlider, els.blueSlider].forEach(sl =>
    sl.addEventListener('input', updateFromSliders)
  );

  [els.redInput, els.greenInput, els.blueInput].forEach(inp =>
    inp.addEventListener('input', updateFromInputs)
  );

  els.hexInput.addEventListener('change', applyHexInput);
  els.hexInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyHexInput();
  });
  els.hexInput.addEventListener('input', () => {
    const str = els.hexInput.value.replace(/[^a-f\d]/gi, '');
    if (str.length === 6) {
      const rgb = hexToRgb(str);
      if (rgb) {
        setColor(rgb);
        els.hexInput.style.background = '';
        els.hexInput.style.color = '';
      }
      return;
    }
    if (str.length === 0) {
      els.hexInput.style.background = '';
      els.hexInput.style.color = '';
      return;
    }
    const preview = parseHexInput(str);
    const p = hexToRgb(preview);
    if (p) {
      els.hexInput.style.background = preview;
      els.hexInput.style.color = bestTextColor(p.r, p.g, p.b);
    }
  });

  els.nativeColorBtn.addEventListener('click', () => els.nativeColor.click());
  els.nativeColor.addEventListener('input', () => {
    const rgb = hexToRgb(els.nativeColor.value);
    if (rgb) setColor(rgb);
  });

  els.randomBtn.addEventListener('click', generateRandomColor);
  els.randomPaletteBtn.addEventListener('click', generateRandomPalette);
  els.saveBtn.addEventListener('click', saveCurrentColor);
  els.clearSavedBtn.addEventListener('click', clearSavedColors);
  els.copyAllBtn.addEventListener('click', copyAllFormats);

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => copyFormat(btn.dataset.format));
  });

  els.exportCssBtn.addEventListener('click', exportCss);
  els.exportPngBtn.addEventListener('click', exportPng);
  els.shareBtn.addEventListener('click', shareColor);

  els.langBtn.addEventListener('click', () => {
    state.lang = state.lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', state.lang); } catch (err) {}
    applyI18n();
    refresh();
  });

  // SV picker: puntero
  let dragging = false;
  const startDrag = e => {
    dragging = true;
    updateFromSvPointer(e.clientX, e.clientY);
    e.preventDefault();
  };
  els.svCanvas.addEventListener('pointerdown', startDrag);
  window.addEventListener('pointermove', e => {
    if (dragging) updateFromSvPointer(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', () => { dragging = false; });

  // Teclado: Espacio = color aleatorio
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;
    const active = document.activeElement;
    const tag = active && active.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || (active && active.isContentEditable)) return;
    e.preventDefault();
    generateRandomColor();
  });
}

// ---------------------------------------------------------------- init
function init() {
  loadSavedColors();

  try {
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'es' || savedLang === 'en') state.lang = savedLang;
  } catch (err) {}

  const urlHex = new URLSearchParams(location.search).get('color');
  const urlRgb = urlHex ? hexToRgb(urlHex) : null;
  if (urlRgb) state.color = urlRgb;

  applyI18n();
  bindEvents();
  refresh();
  renderSavedColors();
}

init();
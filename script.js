// Elements
const colorDisplay = document.getElementById('color-display');
const contrastText = document.getElementById('contrast-text');
const fullColorValue = document.getElementById('full-color-value');
const copyAllBtn = document.getElementById('copy-all-btn');

const redSlider = document.getElementById('red-slider');
const greenSlider = document.getElementById('green-slider');
const blueSlider = document.getElementById('blue-slider');

const redInput = document.getElementById('red-input');
const greenInput = document.getElementById('green-input');
const blueInput = document.getElementById('blue-input');

const redValue = document.getElementById('red-value');
const greenValue = document.getElementById('green-value');
const blueValue = document.getElementById('blue-value');

const hexValue = document.getElementById('hex-value');
const rgbValue = document.getElementById('rgb-value');
const hslValue = document.getElementById('hsl-value');
const cmykValue = document.getElementById('cmyk-value');

const saveColorBtn = document.getElementById('save-color-btn');
const randomColorBtn = document.getElementById('random-color-btn');
const savedColorsList = document.getElementById('saved-colors-list');
const emptyState = document.getElementById('empty-state');

const copyToast = document.getElementById('copy-toast');
const toast = new bootstrap.Toast(copyToast, { delay: 2000 });

// State
let currentColor = { r: 128, g: 128, b: 128 };
let savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];

// Initialize
updateColorDisplay();
renderSavedColors();

// Event Listeners
[redSlider, greenSlider, blueSlider].forEach(slider => {
  slider.addEventListener('input', updateFromSliders);
});

[redInput, greenInput, blueInput].forEach(input => {
  input.addEventListener('input', updateFromInputs);
});

saveColorBtn.addEventListener('click', saveCurrentColor);
randomColorBtn.addEventListener('click', generateRandomColor);
copyAllBtn.addEventListener('click', copyAllFormats);

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const format = this.getAttribute('data-format');
    copyToClipboard(format);
  });
});

// Functions
function updateFromSliders() {
  currentColor = {
    r: parseInt(redSlider.value),
    g: parseInt(greenSlider.value),
    b: parseInt(blueSlider.value)
  };
  
  updateInputs();
  updateColorDisplay();
}

function updateFromInputs() {
  currentColor = {
    r: clampValue(parseInt(redInput.value) || 0),
    g: clampValue(parseInt(greenInput.value) || 0),
    b: clampValue(parseInt(blueInput.value) || 0)
  };
  
  updateSliders();
  updateColorDisplay();
}

function clampValue(value) {
  return Math.min(Math.max(value, 0), 255);
}

function updateSliders() {
  redSlider.value = currentColor.r;
  greenSlider.value = currentColor.g;
  blueSlider.value = currentColor.b;
  
  redValue.textContent = currentColor.r;
  greenValue.textContent = currentColor.g;
  blueValue.textContent = currentColor.b;
}

function updateInputs() {
  redInput.value = currentColor.r;
  greenInput.value = currentColor.g;
  blueInput.value = currentColor.b;
  
  redValue.textContent = currentColor.r;
  greenValue.textContent = currentColor.g;
  blueValue.textContent = currentColor.b;
}

function updateColorDisplay() {
  const rgbString = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
  const hexString = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
  
  // Update display
  colorDisplay.style.backgroundColor = rgbString;
  
  // Update text contrast
  updateTextContrast();
  
  // Update values
  fullColorValue.textContent = `RGB(${currentColor.r}, ${currentColor.g}, ${currentColor.b}) - ${hexString}`;
  hexValue.textContent = hexString;
  rgbValue.textContent = rgbString;
  hslValue.textContent = rgbToHsl(currentColor.r, currentColor.g, currentColor.b);
  cmykValue.textContent = rgbToCmyk(currentColor.r, currentColor.g, currentColor.b);
  
  updateSliders();
  updateInputs();
}

function updateTextContrast() {
  // Calculate relative luminance (perceived brightness)
  const r = currentColor.r / 255;
  const g = currentColor.g / 255;
  const b = currentColor.b / 255;
  
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  // Use white text for dark backgrounds, black for light
  contrastText.style.color = luminance > 0.5 ? 'black' : 'white';
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function rgbToCmyk(r, g, b) {
  if (r === 0 && g === 0 && b === 0) {
    return 'cmyk(0%, 0%, 0%, 100%)';
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  
  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
}

function saveCurrentColor() {
  const hexColor = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
  
  // Check if color is already saved
  if (!savedColors.includes(hexColor)) {
    savedColors.push(hexColor);
    localStorage.setItem('savedColors', JSON.stringify(savedColors));
    renderSavedColors();
  }
}

function renderSavedColors() {
  if (savedColors.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  savedColorsList.innerHTML = '';
  
  savedColors.forEach((color, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.title = color;
    
    swatch.addEventListener('click', () => {
      const rgb = hexToRgb(color);
      if (rgb) {
        currentColor = rgb;
        updateColorDisplay();
      }
    });
    
    // Add delete button on long press
    let pressTimer;
    swatch.addEventListener('mousedown', () => {
      pressTimer = window.setTimeout(() => {
        deleteColor(index);
      }, 1000);
    });
    
    swatch.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });
    
    swatch.addEventListener('touchstart', () => {
      pressTimer = window.setTimeout(() => {
        deleteColor(index);
      }, 1000);
    });
    
    swatch.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
    
    savedColorsList.appendChild(swatch);
  });
}

function deleteColor(index) {
  savedColors.splice(index, 1);
  localStorage.setItem('savedColors', JSON.stringify(savedColors));
  renderSavedColors();
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function generateRandomColor() {
  currentColor = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  };
  
  updateColorDisplay();
}

function copyToClipboard(format) {
  let text;
  
  switch (format) {
    case 'hex':
      text = hexValue.textContent;
      break;
    case 'rgb':
      text = rgbValue.textContent;
      break;
    case 'hsl':
      text = hslValue.textContent;
      break;
    case 'cmyk':
      text = cmykValue.textContent;
      break;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    toast.show();
  });
}

function copyAllFormats() {
  const text = `HEX: ${hexValue.textContent}\nRGB: ${rgbValue.textContent}\nHSL: ${hslValue.textContent}\nCMYK: ${cmykValue.textContent}`;
  
  navigator.clipboard.writeText(text).then(() => {
    toast.show();
  });
}
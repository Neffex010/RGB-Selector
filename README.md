# RGB Selector · Color Picker Profesional

Un color picker web completo, moderno y accesible: combina un **selector visual HSB**, sliders RGB, y conversión en vivo entre **HEX, RGB, HSL y CMYK**, con generación de **armonías de color**, cálculo de **contraste WCAG AA/AAA**, exportación a **CSS/PNG** y persistencia local.

> Aplicación 100% cliente: sin backend, sin dependencias de build, lista para GitHub Pages.

![Stack](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Stack](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Stack](https://img.shields.io/badge/JavaScript-ES2022-%23F7DF1E?style=flat&logo=javascript&logoColor=black)
![Tests](https://img.shields.io/badge/tests-Vitest-6BA81B?logo=vitest)

---

## ✨ Características

- 🎨 **Selector visual 2D** (canvas HSB: saturación × valor) con slider de matiz.
- 🎚 **Controles RGB** sincronizados (sliders + inputs numéricos) y **campo HEX** editable.
- 🖌 **Selector nativo** del navegador integrado.
- 🔄 Conversión en vivo entre **HEX, RGB, HSL y CMYK**.
- 🌈 **5 armonías de color**: complementaria, análoga, triádica, complementaria dividida y tetrádica (clic para aplicar).
- ♿ **Contraste WCAG**: luminancia relativa, ratio y etiqueta AA/AAA en el texto de la vista previa.
- 📊 **Paletas aleatorias** de 5 colores.
- 💾 **Colores guardados** en `localStorage` (clic para cargar, hover para eliminar).
- 📤 **Exportación**: variables CSS (`:root { --color-1: … }`) y **PNG** descargable de la paleta.
- 🔗 **Compartir por URL** (`?color=#FF0000`) y estado en el historial.
- 🌍 **Bilingüe** (ES/EN) y ⌨️ **atajos de teclado** (`Espacio` = color aleatorio).
- 🦿 Accesible: `aria-label`, `focus-visible`, `prefers-reduced-motion`, títulos descriptivos.
- ✅ **25 tests unitarios** (Vitest) sobre las funciones puras de color.

## 🛠 Stack

| Capa | Tecnología |
|------|------------|
| Marca | HTML5 semántico + [Bootstrap Icons](https://icons.getbootstrap.com/) |
| Estilos | CSS3 puro (glassmorphism, CSS Grid, variables) |
| Lógica | JavaScript ES2022 (módulos nativos, sin frameworks) |
| Tests | [Vitest](https://vitest.dev) |

## 🚀 Demo

Disponible en GitHub Pages: **<inserte link de su deploy aquí>**

## ▶️ Uso local

Proyecto estático, sin build. Solo servirlo:

```bash
# opción A: Python
python -m http.server 8000

# opción B: Node
npx serve .
```

Abrir `http://localhost:8000`.

**Ejecutar tests:**

```bash
npm install
npm test
```

## 📁 Estructura

```
├── index.html          # Interfaz + metadata SEO
├── style.css           # Diseño, accesibilidad, responsive
├── js/
│   ├── color-utils.js  # Funciones puras de color (testeables)
│   └── main.js         # Lógica de UI y estado
├── tests/
│   └── color-utils.test.js
├── favicon.svg
└── package.json
```

La separación de `color-utils.js` (funciones puras, sin DOM) permite **testeo unitario** y reutilización.

## 🌐 Deploy en GitHub Pages

1. Crear repo y subir el proyecto.
2. `Settings → Pages → Deploy from a branch → main / root`.
3. Listo: la app corre en `https://<usuario>.github.io/<repo>/`.

## 🧠 Bugs corregidos de la v1

- Luminancia de contraste corregida a la **fórmula WCAG** (gamma sRGB), antes usaba canales crudos.
- El estado vacío de "colores guardados" **ya no se pierde** al vaciar la lista.
- `navigator.clipboard` ahora tiene **fallback** y manejo de errores.
- Se cargó la fuente **Fira Code** (se referenciaba sin existir).
- Feedback claro al guardar duplicados y al eliminar colores.

## 📜 Roadmap

- [x] Selector visual 2D y armonías de color
- [x] Export a CSS variables y PNG
- [x] i18n ES/EN y contraste WCAG
- [ ] PWA (offline con Service Worker)
- [ ] Guardado de paletas nombradas y compartidas

## 📄 Licencia

MIT — hacelo tuyo.
// Ropa del bebé. Todo se dibuja en las coordenadas del bebé (ver bebe.js):
// (0, 0) entre sus pompis, la cabeza en (0, -300) y los pies en (±100, -14).
//
// dibujo() regresa solo las partes que usa la prenda:
//   defs (estampados), torso, piernas, mangas, capucha (gorro de los disfraces),
//   sombrero (cosas de la cabeza) y pies.

let siguienteId = 0;
const nuevoId = (prefijo) => `${prefijo}-${++siguienteId}`;
const r1 = (v) => Math.round(v * 10) / 10;

const aRgb = (hex) => {
  const v = parseInt(hex.slice(1, 7), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const oscurecer = (hex, k = 0.7) =>
  '#' + aRgb(hex).map((c) => Math.round(c * k).toString(16).padStart(2, '0')).join('');

const espejo = (svg) => `<g transform="scale(-1 1)">${svg}</g>`;
const ambos = (svg) => svg + espejo(svg);

const pieza = (d, color, borde = oscurecer(color), extra = '') =>
  `<path d="${d}" fill="${color}" stroke="${borde}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const ovalo = (cx, cy, rx, ry, color, borde = oscurecer(color), extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" stroke="${borde}" stroke-width="4" ${extra}/>`;
const punto = (cx, cy, r, color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
const linea = (d, color, ancho = 4, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

function estrella(x, y, r, puntas = 5, interior = 0.45) {
  let d = '';
  for (let i = 0; i < puntas * 2; i++) {
    const radio = i % 2 ? r * interior : r;
    const a = -Math.PI / 2 + (i * Math.PI) / puntas;
    d += `${i ? ' L ' : 'M '}${r1(x + radio * Math.cos(a))} ${r1(y + radio * Math.sin(a))}`;
  }
  return `${d} Z`;
}

function corazon(x, y, s) {
  const P = (u, v) => `${r1(x + u * s)} ${r1(y + v * s)}`;
  return `M ${P(0, 0.9)} C ${P(-0.9, 0.3)} ${P(-1, -0.2)} ${P(-0.75, -0.55)} C ${P(-0.5, -0.9)} ${P(-0.1, -0.8)} ${P(0, -0.4)} ` +
    `C ${P(0.1, -0.8)} ${P(0.5, -0.9)} ${P(0.75, -0.55)} C ${P(1, -0.2)} ${P(0.9, 0.3)} ${P(0, 0.9)} Z`;
}

function flor(x, y, r, petalo, centro = '#ffd84d') {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    s += punto(r1(x + Math.cos(a) * r * 0.62), r1(y + Math.sin(a) * r * 0.62), r1(r * 0.46), petalo);
  }
  return s + punto(x, y, r1(r * 0.36), centro);
}

/** Orilla de holanes de (x1, y) a (x2, y); se pega dentro de un path que ya está en (x1, y). */
function holanes(x1, x2, y, n, hondo) {
  const paso = (x2 - x1) / n;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = x1 + paso * i;
    d += ` Q ${r1(a + paso / 2)} ${r1(y + hondo * 2)} ${r1(a + paso)} ${y}`;
  }
  return d;
}

function patron(tipo, fondo, tinta, tam) {
  const id = nuevoId('tela');
  const q = tam / 4;
  const dibujos = {
    rayas: `<rect width="${tam}" height="${tam / 2}" fill="${tinta}"/>`,
    estrellas: `<path d="${estrella(q, q, tam * 0.16)}" fill="${tinta}"/><path d="${estrella(3 * q, 3 * q, tam * 0.12)}" fill="${tinta}"/>`,
    bolitas: punto(q, q, r1(tam * 0.12), tinta) + punto(3 * q, 3 * q, r1(tam * 0.12), tinta),
  };
  return {
    defs: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${tam}" height="${tam}">` +
      `<rect width="${tam}" height="${tam}" fill="${fondo}"/>${dibujos[tipo]}</pattern>`,
    url: `url(#${id})`,
  };
}

// ---------- Piezas que comparten varias prendas ----------

const BRAZO = 'M -70 -170 Q -100 -130 -109 -98';

/** Mameluco: cuerpo, muslos, mangas cortas o largas y, si tiene patas, los pies tapados. */
function mameluco({ fondo, borde, largas = false, patas = false }) {
  const torso = `<ellipse cx="0" cy="-112" rx="93" ry="99" fill="${fondo}" stroke="${borde}" stroke-width="4"/>`;
  const piernas = ambos(`<ellipse cx="-50" cy="-24" rx="53" ry="34" transform="rotate(-10 -50 -24)" fill="${fondo}" stroke="${borde}" stroke-width="4"/>`) +
    (patas ? ambos(`<ellipse cx="-100" cy="-14" rx="29" ry="23" transform="rotate(-25 -100 -14)" fill="${fondo}" stroke="${borde}" stroke-width="4"/>`) : '');
  const mangas = largas
    ? ambos(linea(BRAZO, borde, 50) + linea(BRAZO, fondo, 43))
    : ambos(`<circle cx="-74" cy="-160" r="27" fill="${fondo}" stroke="${borde}" stroke-width="4"/>`);
  return { torso, piernas, mangas };
}

/** Gorro de disfraz: una banda alrededor de la cara. Lo de `atras` (orejas) va detrás. */
const capucha = (color, borde, atras = '', encima = '') => atras +
  `<path d="M -128 -294 Q -132 -446 0 -446 Q 132 -446 128 -294 L 108 -294 Q 108 -420 0 -420 Q -108 -420 -108 -294 Z"
    fill="${color}" stroke="${borde}" stroke-width="4" stroke-linejoin="round"/>` + encima;

const broches = (color) => [-16, 0, 16].map((x) => punto(x, x ? -34 : -32, 4, color)).join('');

/**
 * Zapatos: el izquierdo se dibuja alrededor de (0, 0) y se coloca sobre el pie del bebé.
 * `par` es el par juntito, para la miniatura del ropero.
 */
function pie(svg) {
  const izquierdo = `<g transform="translate(-100 -14) rotate(-25)">${svg}</g>`;
  return { pies: ambos(izquierdo), par: izquierdo + `<g transform="translate(-136 0) scale(-1 1)">${izquierdo}</g>` };
}

// ---------- Cajones del ropero ----------

const icono = (contenido) => `<svg viewBox="0 0 100 100" aria-hidden="true">${contenido}</svg>`;

export const ICONO_MAMELUCO = icono(`
  <path d="M 30 18 L 42 14 Q 50 24 58 14 L 70 18 L 88 34 L 78 46 L 70 40 L 70 70 Q 70 80 62 82 L 58 90 L 42 90 L 38 82 Q 30 80 30 70 L 30 40 L 22 46 L 12 34 Z"
    fill="#ffe08a" stroke="#d9b24a" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 50 62 C 44 57 38 53 38 47 C 38 42 45 40 50 46 C 55 40 62 42 62 47 C 62 53 56 57 50 62 Z" fill="#ff8cc6"/>`);

export const CAJONES = [
  { id: 'ropa', color: '#ffd84d', icono: ICONO_MAMELUCO },
  {
    id: 'cabeza', color: '#b49cff',
    icono: icono(`
      <path d="M 16 68 C 14 22 86 22 84 68 Z" fill="#c9b6ff" stroke="#8a6fd6" stroke-width="5" stroke-linejoin="round"/>
      <path d="M 12 62 Q 50 54 88 62 L 88 78 Q 50 70 12 78 Z" fill="#e6dcff" stroke="#8a6fd6" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="50" cy="20" r="12" fill="#fff" stroke="#8a6fd6" stroke-width="5"/>`),
  },
  {
    id: 'pies', color: '#ff8cc6',
    icono: icono(`
      <path d="M 40 10 L 64 10 L 64 56 Q 64 86 38 88 L 22 88 Q 8 86 10 72 Q 12 60 26 58 L 40 56 Z" fill="#ffc4dc" stroke="#d9568f" stroke-width="5" stroke-linejoin="round"/>
      <path d="M 40 26 L 64 26 M 40 42 L 64 42" stroke="#ff6fa8" stroke-width="7"/>`),
  },
];

// ---------- Las prendas ----------

const PATITO_PECHO = `
  <g transform="translate(0 -118) scale(0.5)">
    <ellipse cx="6" cy="10" rx="34" ry="24" fill="#fff" stroke="#d9b24a" stroke-width="5"/>
    <circle cx="-14" cy="-18" r="18" fill="#fff" stroke="#d9b24a" stroke-width="5"/>
    <path d="M -32 -16 L -46 -10 L -32 -6 Z" fill="#ff9f43"/>
    <circle cx="-16" cy="-22" r="3.5" fill="#3d2b4f"/>
  </g>`;

function picos(color) {
  let s = '';
  for (const grados of [-150, -120, -90, -60, -30]) {
    const a = (grados * Math.PI) / 180;
    const p = (r, da = 0) => `${r1(Math.cos(a + da) * r)} ${r1(-300 + Math.sin(a + da) * r)}`;
    s += pieza(`M ${p(134, -0.14)} L ${p(172)} L ${p(134, 0.14)} Z`, color);
  }
  return s;
}

export const PRENDAS = [
  // ===== Ropa =====
  {
    id: 'patito', cajon: 'ropa', nombre: 'Mameluco de patito',
    dibujo() {
      const m = mameluco({ fondo: '#ffe08a', borde: '#d9b24a' });
      m.torso += PATITO_PECHO + broches('#ffffff');
      return m;
    },
  },
  {
    id: 'estrellas', cajon: 'ropa', nombre: 'Pijama de estrellas',
    dibujo() {
      const t = patron('estrellas', '#9ec9ff', '#fff3a0', 42);
      const m = mameluco({ fondo: t.url, borde: '#5f97d9', largas: true, patas: true });
      m.torso += pieza(estrella(0, -120, 30), '#fff3a0', '#e0b400');
      return { defs: t.defs, ...m };
    },
  },
  {
    id: 'osito', cajon: 'ropa', nombre: 'Mameluco de osito',
    dibujo() {
      const c = '#c99368';
      const b = '#946542';
      const m = mameluco({ fondo: c, borde: b, largas: true, patas: true });
      m.torso += ovalo(0, -100, 52, 58, '#ecc9a3', b);
      m.capucha = capucha(c, b, ambos(ovalo(-86, -418, 28, 28, c, b) + punto(-86, -418, 14, '#ecc9a3')));
      return m;
    },
  },
  {
    id: 'dino', cajon: 'ropa', nombre: 'Mameluco de dinosaurio',
    dibujo() {
      const c = '#8fd694';
      const b = '#5aa865';
      const m = mameluco({ fondo: c, borde: b, largas: true, patas: true });
      m.torso += ovalo(0, -98, 50, 60, '#e6f5a8', b) +
        [[-70, -150], [-74, -80], [70, -150], [74, -80], [-56, -186], [56, -186]].map(([x, y]) => punto(x, y, 9, '#6cc077')).join('');
      m.capucha = capucha(c, b, picos('#ffb347'));
      return m;
    },
  },
  {
    id: 'conejo', cajon: 'ropa', nombre: 'Mameluco de conejito',
    dibujo() {
      const c = '#fff0f6';
      const b = '#e7a3c0';
      const m = mameluco({ fondo: c, borde: b, largas: true, patas: true });
      m.torso += pieza(corazon(0, -116, 26), '#ff8cc6');
      m.capucha = capucha(c, b, ambos(
        ovalo(-48, -476, 22, 64, c, b, 'transform="rotate(-12 -48 -476)"') +
        `<ellipse cx="-48" cy="-470" rx="11" ry="46" fill="#ffc4dc" transform="rotate(-12 -48 -470)"/>`));
      return m;
    },
  },
  {
    id: 'vestido', cajon: 'ropa', nombre: 'Vestido de holanes',
    dibujo() {
      const c = '#ff9ccf';
      const b = '#e06aa8';
      return {
        torso: `<ellipse cx="0" cy="-112" rx="93" ry="99" fill="${c}" stroke="${b}" stroke-width="4"/>` +
          ambos(pieza('M 0 -184 Q -30 -170 -58 -190 Q -62 -166 -32 -156 Q -8 -152 0 -172 Z', '#ffffff', '#e7a3c0')) +
          flor(0, -110, 16, '#ffffff'),
        piernas: pieza(`M -96 -84 L 96 -84 L 136 -12${holanes(136, -136, -12, 9, 6)} Z`, '#ffffff', '#e7a3c0') +
          pieza(`M -88 -96 Q 0 -78 88 -96 L 128 -22${holanes(128, -128, -22, 8, 6)} Z`, c, b),
        mangas: ambos(`<circle cx="-76" cy="-162" r="31" fill="#ffc4e1" stroke="${b}" stroke-width="4"/>`),
      };
    },
  },
  {
    id: 'overol', cajon: 'ropa', nombre: 'Overol de mezclilla',
    dibujo() {
      const t = patron('rayas', '#ffffff', '#ff6b6b', 18);
      const mezclilla = '#5b8ad6';
      const b = '#3f6bb3';
      return {
        defs: t.defs,
        torso: `<ellipse cx="0" cy="-112" rx="93" ry="99" fill="${t.url}" stroke="#d94f4f" stroke-width="4"/>` +
          pieza('M -46 -168 L 46 -168 L 50 -112 Q 84 -100 92 -64 Q 96 -34 82 -18 L -82 -18 Q -96 -34 -92 -64 Q -84 -100 -50 -112 Z', mezclilla, b) +
          linea('M -42 -166 L -64 -198 M 42 -166 L 64 -198', mezclilla, 12) +
          pieza('M -22 -150 L 22 -150 L 22 -122 Q 0 -114 -22 -122 Z', '#6f9be0', b) +
          punto(-38, -158, 5, '#ffd84d') + punto(38, -158, 5, '#ffd84d') +
          linea('M -86 -40 Q 0 -26 86 -40', '#f4b860', 3, 'stroke-dasharray="6 6"'),
        piernas: ambos(`<ellipse cx="-50" cy="-24" rx="53" ry="34" transform="rotate(-10 -50 -24)" fill="${mezclilla}" stroke="${b}" stroke-width="4"/>`),
        mangas: ambos(`<circle cx="-74" cy="-160" r="27" fill="${t.url}" stroke="#d94f4f" stroke-width="4"/>`),
      };
    },
  },
  {
    id: 'marinero', cajon: 'ropa', nombre: 'Traje de marinero',
    dibujo() {
      const t = patron('rayas', '#ffffff', '#3d5a99', 22);
      const azul = '#2c4377';
      const m = mameluco({ fondo: t.url, borde: azul });
      m.piernas = ambos(`<ellipse cx="-50" cy="-24" rx="53" ry="34" transform="rotate(-10 -50 -24)" fill="${azul}" stroke="#1d2d52" stroke-width="4"/>`);
      m.torso += ambos(pieza('M 0 -150 L -68 -200 L -88 -176 L -6 -128 Z', azul, '#1d2d52') +
        linea('M -8 -138 L -76 -180', '#ffffff', 3)) +
        pieza('M 0 -140 L -20 -152 L -20 -128 Z M 0 -140 L 20 -152 L 20 -128 Z', '#ff5d6c') + punto(0, -140, 6, '#ff5d6c');
      return { defs: t.defs, ...m };
    },
  },

  // ===== Cabeza =====
  {
    id: 'gorrito', cajon: 'cabeza', nombre: 'Gorrito con pompón',
    dibujo() {
      const c = '#c9b6ff';
      return {
        sombrero: pieza('M -112 -352 C -116 -456 116 -456 112 -352 Z', c) +
          pieza('M -118 -370 Q 0 -388 118 -370 L 120 -344 Q 0 -362 -120 -344 Z', '#e6dcff', '#8a6fd6') +
          linea('M -90 -372 L -90 -350 M -54 -378 L -54 -356 M -18 -381 L -18 -359 M 18 -381 L 18 -359 M 54 -378 L 54 -356 M 90 -372 L 90 -350', '#b49cff', 3) +
          ovalo(0, -456, 26, 26, '#ffffff', '#b49cff'),
      };
    },
  },
  {
    id: 'mono', cajon: 'cabeza', nombre: 'Moño',
    dibujo() {
      const c = '#ff6fb3';
      return {
        sombrero: linea('M -106 -336 C -102 -432 102 -432 106 -336', '#ff9ccf', 8) +
          pieza('M 54 -404 Q 6 -446 12 -400 Q 18 -366 54 -404 Z', c) +
          pieza('M 54 -404 Q 104 -448 98 -398 Q 92 -364 54 -404 Z', c) +
          ovalo(54, -404, 11, 11, c) + punto(28, -410, 4, '#ffffff') + punto(82, -410, 4, '#ffffff'),
      };
    },
  },
  {
    id: 'flores', cajon: 'cabeza', nombre: 'Diadema de flores',
    dibujo() {
      const colores = ['#ff8cc6', '#ffd84d', '#b49cff', '#ffffff', '#ff8cc6'];
      let flores = '';
      colores.forEach((col, i) => {
        const a = ((215 + i * 27.5) * Math.PI) / 180;
        flores += flor(r1(Math.cos(a) * 116), r1(-300 + Math.sin(a) * 116), 20, col, col === '#ffd84d' ? '#ff9f43' : '#ffd84d');
      });
      return { sombrero: linea('M -100 -360 C -80 -430 80 -430 100 -360', '#6fcf7f', 6) + flores };
    },
  },
  {
    id: 'gorro-osito', cajon: 'cabeza', nombre: 'Gorro de osito',
    dibujo() {
      const c = '#c99368';
      const b = '#946542';
      return {
        sombrero: ambos(ovalo(-80, -420, 28, 28, c, b) + punto(-80, -420, 14, '#ecc9a3')) +
          pieza('M -112 -352 C -116 -456 116 -456 112 -352 Z', c, b) +
          pieza('M -118 -370 Q 0 -388 118 -370 L 120 -344 Q 0 -362 -120 -344 Z', '#ecc9a3', b),
      };
    },
  },
  {
    id: 'sombrero', cajon: 'cabeza', nombre: 'Sombrero de sol',
    dibujo() {
      const paja = '#f5d18a';
      return {
        sombrero: ovalo(0, -370, 152, 28, paja) +
          pieza('M -86 -370 C -86 -468 86 -468 86 -370 Z', paja) +
          pieza('M -87 -392 Q 0 -400 87 -392 L 86 -372 Q 0 -380 -86 -372 Z', '#ff8cc6') +
          flor(66, -384, 18, '#ffffff'),
      };
    },
  },
  {
    id: 'fiesta', cajon: 'cabeza', nombre: 'Gorro de fiesta',
    dibujo() {
      const t = patron('bolitas', '#7cc7ff', '#ffffff', 22);
      return {
        defs: t.defs,
        sombrero: `<g transform="rotate(14 0 -400)">` +
          pieza('M -42 -394 L 0 -512 L 42 -394 Q 0 -382 -42 -394 Z', t.url, '#3f8fd0') +
          pieza('M -44 -398 Q 0 -386 44 -398 L 42 -388 Q 0 -376 -42 -388 Z', '#ffd84d') +
          ovalo(0, -514, 15, 15, '#ff6fb3') + '</g>',
      };
    },
  },

  // ===== Pies =====
  {
    id: 'calcetines', cajon: 'pies', nombre: 'Calcetines de rayas',
    dibujo() {
      const t = patron('rayas', '#ffffff', '#ff8cc6', 14);
      return {
        defs: t.defs,
        ...pie(`<ellipse rx="30" ry="24" fill="${t.url}" stroke="#d9568f" stroke-width="4"/>` +
          `<rect x="14" y="-22" width="18" height="44" rx="8" fill="#ff8cc6" stroke="#d9568f" stroke-width="4"/>`),
      };
    },
  },
  {
    id: 'botitas', cajon: 'pies', nombre: 'Botitas tejidas',
    dibujo() {
      const c = '#a8e0ff';
      return {
        ...pie(ovalo(0, 0, 31, 25, c) +
          linea('M -16 -20 Q -22 0 -16 20 M -2 -24 Q -8 0 -2 24', oscurecer(c), 3) +
          `<rect x="12" y="-24" width="22" height="48" rx="9" fill="#ffffff" stroke="${oscurecer(c)}" stroke-width="4"/>` +
          punto(-14, -24, 7, '#ff8cc6')),
      };
    },
  },
  {
    id: 'zapatitos', cajon: 'pies', nombre: 'Zapatitos rojos',
    dibujo() {
      const c = '#e63958';
      return {
        ...pie(ovalo(0, 0, 30, 23, c) + linea('M 2 -22 L 8 21', oscurecer(c), 6) +
          punto(6, 6, 4, '#ffd84d') + '<ellipse cx="-14" cy="-8" rx="7" ry="4" fill="#ffffff" opacity="0.6"/>'),
      };
    },
  },
  {
    id: 'pantuflas', cajon: 'pies', nombre: 'Pantuflas de conejo',
    dibujo() {
      return {
        ...pie(
          ovalo(-6, -28, 7, 18, '#ffffff', '#c9c9d6', 'transform="rotate(-20 -6 -28)"') +
          ovalo(10, -28, 7, 18, '#ffffff', '#c9c9d6', 'transform="rotate(20 10 -28)"') +
          ovalo(0, 0, 32, 25, '#ffffff', '#c9c9d6') +
          punto(-10, -4, 3, '#3d2b4f') + punto(8, -4, 3, '#3d2b4f') + punto(-1, 6, 4, '#ff8fab')),
      };
    },
  },
  {
    id: 'tenis', cajon: 'pies', nombre: 'Tenis',
    dibujo() {
      const c = '#74c0fc';
      return {
        ...pie(ovalo(0, 0, 31, 24, c) +
          pieza('M -30 6 Q 0 30 30 6 L 30 12 Q 0 36 -30 12 Z', '#ffffff', '#5aa9d6') +
          linea('M -6 -14 L 10 -12 M -8 -4 L 10 -2', '#ffffff', 4)),
      };
    },
  },
];

const POR_ID = new Map(PRENDAS.map((p) => [p.id, p]));
export const prendaPorId = (id) => POR_ID.get(id);
export const ROPA_INICIAL = { ropa: 'patito', cabeza: null, pies: null };

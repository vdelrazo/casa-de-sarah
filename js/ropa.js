// Catálogo de ropa. Cada prenda se dibuja en SVG sobre el lienzo de la muñeca (300 × 600).
// La muñeca mira de frente; "izquierda" quiere decir la izquierda de la pantalla.
// Las prendas simétricas dibujan solo el lado izquierdo y lo copian con ambos().
//
// Cada prenda dice en qué capa va (ver CAPAS_DE_ROPA en muneca.js). Las blusas y los
// vestidos regresan { principal, mangas }: las mangas van en otra capa, encima de los brazos.

// ---------- Herramientas de dibujo ----------

let siguienteId = 0;
const nuevoId = (prefijo) => `${prefijo}-${++siguienteId}`;
const r1 = (v) => Math.round(v * 10) / 10;
const xy = ([x, y]) => `${r1(x)} ${r1(y)}`;

const aRgb = (hex) => {
  const v = parseInt(hex.slice(1, 7), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
const aHex = (rgb) => '#' + rgb
  .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0'))
  .join('');

export const oscurecer = (hex, k = 0.68) => aHex(aRgb(hex).map((c) => c * k));
export const aclarar = (hex, k = 0.5) => aHex(aRgb(hex).map((c) => c + (255 - c) * k));

/** Una figura con contorno. `relleno` puede ser un color o un url(#patron). */
function forma(d, relleno, borde, extra = '') {
  return `<path d="${d}" fill="${relleno}" stroke="${borde}" stroke-width="3" ` +
    `stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}
/** Figura de un solo color, con el contorno del mismo color más oscuro. */
const pieza = (d, color, extra = '') => forma(d, color, oscurecer(color), extra);
const ovalo = (cx, cy, rx, ry, color, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" stroke="${oscurecer(color)}" stroke-width="3" ${extra}/>`;
const linea = (d, color, ancho = 3, extra = '') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const punto = (cx, cy, r, color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;

/** Copia en espejo: lo dibujado a la izquierda aparece también a la derecha. */
const espejo = (svg) => `<g transform="matrix(-1 0 0 1 300 0)">${svg}</g>`;
const ambos = (svg) => svg + espejo(svg);

function corazon(x, y, s) {
  const P = (u, v) => `${r1(x + u * s)} ${r1(y + v * s)}`;
  return `M ${P(0, 0.9)} C ${P(-0.9, 0.3)} ${P(-1, -0.2)} ${P(-0.75, -0.55)} ` +
    `C ${P(-0.5, -0.9)} ${P(-0.1, -0.8)} ${P(0, -0.4)} ` +
    `C ${P(0.1, -0.8)} ${P(0.5, -0.9)} ${P(0.75, -0.55)} ` +
    `C ${P(1, -0.2)} ${P(0.9, 0.3)} ${P(0, 0.9)} Z`;
}

function estrella(x, y, r, puntas = 5, interior = 0.45) {
  let d = '';
  for (let i = 0; i < puntas * 2; i++) {
    const radio = i % 2 ? r * interior : r;
    const a = -Math.PI / 2 + (i * Math.PI) / puntas;
    d += (i ? ' L ' : 'M ') + xy([x + radio * Math.cos(a), y + radio * Math.sin(a)]);
  }
  return d + ' Z';
}

function flor(x, y, r, petalo, centro = '#ffd84d') {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    s += punto(r1(x + Math.cos(a) * r * 0.62), r1(y + Math.sin(a) * r * 0.62), r1(r * 0.46), petalo);
  }
  return s + punto(x, y, r1(r * 0.36), centro);
}

/** Destello de cuatro puntas. */
const brillo = (x, y, r, color = '#ffffff') => `<path d="${estrella(x, y, r, 4, 0.32)}" fill="${color}"/>`;

/** Moño pequeño centrado en (x, y). */
function monito(x, y, color, s = 1) {
  return pieza(`M ${x} ${y} L ${x - 16 * s} ${y - 10 * s} L ${x - 16 * s} ${y + 10 * s} Z`, color) +
    pieza(`M ${x} ${y} L ${x + 16 * s} ${y - 10 * s} L ${x + 16 * s} ${y + 10 * s} Z`, color) +
    ovalo(x, y, 5 * s, 5 * s, color);
}

/**
 * Orilla de holanes de (x1, y) a (x2, y). Regresa solo los segmentos (" Q ..."),
 * para pegarlos dentro de un path que ya está en (x1, y).
 */
function holanes(x1, x2, y, n, hondo) {
  const paso = (x2 - x1) / n;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = x1 + paso * i;
    const b = a + paso;
    d += ` Q ${r1((a + b) / 2)} ${r1(y + hondo * 2)} ${r1(b)} ${y}`;
  }
  return d;
}

/** Estampado que se repite. Regresa { defs, url } para usar como relleno. */
function patron(tipo, fondo, tinta, tam = 24) {
  const id = nuevoId('patron');
  const t = tam;
  const m = t / 2;
  const q = t / 4;
  const dibujos = {
    bolitas: punto(q, q, r1(t * 0.13), tinta) + punto(3 * q, 3 * q, r1(t * 0.13), tinta),
    rayas: `<rect width="${t}" height="${m}" fill="${tinta}"/>`,
    cuadros: `<rect width="${t}" height="${m}" fill="${tinta}" opacity="0.4"/>` +
      `<rect width="${m}" height="${t}" fill="${tinta}" opacity="0.4"/>`,
    estrellas: `<path d="${estrella(q, q, t * 0.17)}" fill="${tinta}"/>` +
      `<path d="${estrella(3 * q, 3 * q, t * 0.17)}" fill="${tinta}"/>`,
    flores: flor(q, q, t * 0.2, tinta) + flor(3 * q, 3 * q, t * 0.2, tinta),
    brillos: brillo(q, q, t * 0.15, tinta) + brillo(3 * q, 3 * q, t * 0.1, tinta),
    escamas: `<path d="M 0 ${m} A ${q} ${q} 0 0 0 ${m} ${m} A ${q} ${q} 0 0 0 ${t} ${m} ` +
      `M ${-q} ${t} A ${q} ${q} 0 0 0 ${q} ${t} A ${q} ${q} 0 0 0 ${3 * q} ${t} A ${q} ${q} 0 0 0 ${5 * q} ${t} ` +
      `M ${-q} 0 A ${q} ${q} 0 0 0 ${q} 0 A ${q} ${q} 0 0 0 ${3 * q} 0 A ${q} ${q} 0 0 0 ${5 * q} 0" ` +
      `fill="none" stroke="${tinta}" stroke-width="2"/>`,
  };
  return {
    defs: `<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${t}" height="${t}">` +
      `<rect width="${t}" height="${t}" fill="${fondo}"/>${dibujos[tipo]}</pattern></defs>`,
    url: `url(#${id})`,
  };
}

// ---------- Medidas del cuerpo que usan las prendas ----------

// Brazo izquierdo: del hombro a la muñeca. El derecho es su espejo.
const HOMBRO = [100, 250];
const MUNECA = [82, 386];
const LARGO_BRAZO = Math.hypot(MUNECA[0] - HOMBRO[0], MUNECA[1] - HOMBRO[1]);
const DIR = [(MUNECA[0] - HOMBRO[0]) / LARGO_BRAZO, (MUNECA[1] - HOMBRO[1]) / LARGO_BRAZO];
const HACIA_DENTRO = [DIR[1], -DIR[0]];

/** Punto sobre el brazo: t = 0 en el hombro, 1 en la muñeca; lado > 0 hacia el cuerpo. */
function enBrazo(t, lado = 0) {
  const l = LARGO_BRAZO * t;
  return [
    HOMBRO[0] + DIR[0] * l + HACIA_DENTRO[0] * lado,
    HOMBRO[1] + DIR[1] * l + HACIA_DENTRO[1] * lado,
  ];
}

/** Manga izquierda, del hombro hasta `largo` (0 a 1). `inflada` la hace abombada. */
function manga(largo, anchoArriba = 21, anchoAbajo = 18, inflada = 0) {
  const arribaFuera = enBrazo(-0.09, -anchoArriba);
  const arribaDentro = enBrazo(-0.09, anchoArriba);
  const abajoFuera = enBrazo(largo, -anchoAbajo);
  const abajoDentro = enBrazo(largo, anchoAbajo);
  const tapa = enBrazo(-0.24, 0);
  const costado = enBrazo((largo - 0.09) / 2, -(anchoArriba + anchoAbajo) / 2 - inflada);
  const basta = enBrazo(largo + 0.04, 0);
  return `M ${xy(arribaDentro)} Q ${xy(tapa)} ${xy(arribaFuera)} Q ${xy(costado)} ${xy(abajoFuera)} ` +
    `Q ${xy(basta)} ${xy(abajoDentro)} Z`;
}

/** Puño de una manga larga. */
function puno(t, ancho, alto = 0.08) {
  return `M ${xy(enBrazo(t, -ancho))} L ${xy(enBrazo(t, ancho))} ` +
    `L ${xy(enBrazo(t + alto, ancho))} L ${xy(enBrazo(t + alto, -ancho))} Z`;
}

// Blusa suelta: del cuello a la cadera.
const BLUSA = 'M 116 222 Q 150 246 184 222 C 198 225 208 236 210 252 L 202 352 Q 150 360 98 352 L 90 252 C 92 236 102 225 116 222 Z';
const BASTA_BLUSA = 'M 99 340 Q 150 348 201 340 L 202 352 Q 150 360 98 352 Z';
// Blusa de tirantes, sin mangas.
const TIRANTES = 'M 118 222 L 130 222 Q 150 240 170 222 L 182 222 Q 186 248 200 264 L 200 350 Q 150 358 100 350 L 100 264 Q 114 248 118 222 Z';
// Parte de arriba de los vestidos: ajustada hasta la cintura.
const CORPINO = 'M 116 222 Q 150 244 184 222 C 198 225 206 236 206 252 L 193 316 L 107 316 L 94 252 C 94 236 102 225 116 222 Z';
const CORPINO_TIRANTES = 'M 118 222 L 130 222 Q 150 240 170 222 L 182 222 Q 188 248 202 262 L 193 316 L 107 316 L 98 262 Q 112 248 118 222 Z';
// Cinturilla de faldas y pantalones.
const CINTURILLA = 'M 110 300 L 190 300 L 191 315 L 109 315 Z';

function cuelloRedondo(color) {
  return ambos(pieza('M 150 236 Q 132 234 115 223 Q 106 238 120 248 Q 138 255 150 236 Z', color));
}

/** Falda en forma de A, de la cintura a `basta`. */
const falda = (basta, ancho) =>
  `M 110 302 L 190 302 L ${150 + ancho} ${basta} Q 150 ${basta + 14} ${150 - ancho} ${basta} Z`;

/** Pantalón: piernas de medio ancho h que llegan hasta `basta`. */
const pantalon = (basta, h) =>
  `M 110 302 L 190 302 L 200 356 L ${172 + h} ${basta} L ${172 - h} ${basta} L 151 382 L 149 382 ` +
  `L ${128 + h} ${basta} L ${128 - h} ${basta} L 100 356 Z`;

// ---------- Cajones del ropero ----------

const icono = (contenido) =>
  `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${contenido}</g></svg>`;

export const CATEGORIAS = [
  {
    id: 'blusas', nombre: 'Blusas', color: '#ff7eb9',
    icono: icono('<path d="M 32 20 L 42 15 Q 50 25 58 15 L 68 20 L 86 38 L 74 50 L 68 44 L 68 84 L 32 84 L 32 44 L 26 50 L 14 38 Z"/>'),
  },
  {
    id: 'abajo', nombre: 'Faldas y pantalones', color: '#5cb8ff',
    icono: icono('<path d="M 34 18 L 66 18 L 66 28 L 34 28 Z"/><path d="M 34 30 L 66 30 L 84 80 Q 50 90 16 80 Z"/>'),
  },
  {
    id: 'vestidos', nombre: 'Vestidos', color: '#b484ff',
    icono: icono('<path d="M 38 10 L 45 10 Q 50 18 55 10 L 62 10 L 64 40 L 86 84 Q 50 94 14 84 L 36 40 Z"/>'),
  },
  {
    id: 'zapatos', nombre: 'Zapatos', color: '#ff9f43',
    icono: icono('<path d="M 12 70 L 16 36 Q 28 42 40 36 L 52 50 Q 80 54 88 68 L 88 78 L 12 78 Z"/>'),
  },
  {
    id: 'cabeza', nombre: 'Para la cabeza', color: '#f7c600',
    icono: icono('<path d="M 18 76 L 12 30 L 34 50 L 50 20 L 66 50 L 88 30 L 82 76 Z"/>'),
  },
  {
    id: 'accesorios', nombre: 'Accesorios', color: '#3cc9a0',
    icono: icono('<path d="M 34 46 Q 34 18 50 18 Q 66 18 66 46" fill="none"/><path d="M 18 44 L 82 44 L 86 84 L 14 84 Z"/>'),
  },
];

// ---------- Las prendas ----------

export const PRENDAS = [
  // ===== Blusas =====
  {
    id: 'playera-corazon', cat: 'blusas', capa: 'arriba', nombre: 'Playera con corazón',
    dibujo() {
      const c = '#ff9ccf';
      return {
        principal: pieza(BLUSA, c) + pieza(corazon(150, 288, 20), '#ff3d7f') + brillo(144, 282, 4),
        mangas: ambos(pieza(manga(0.32), c)),
      };
    },
  },
  {
    id: 'blusa-estrellas', cat: 'blusas', capa: 'arriba', nombre: 'Blusa de estrellas',
    dibujo() {
      const c = '#ffd84d';
      const p = patron('estrellas', c, '#ff9f1c', 30);
      return {
        principal: p.defs + forma(BLUSA, p.url, oscurecer(c)),
        mangas: ambos(forma(manga(0.3, 24, 19, 6), p.url, oscurecer(c))),
      };
    },
  },
  {
    id: 'sueter-rayas', cat: 'blusas', capa: 'arriba', nombre: 'Suéter de rayas',
    dibujo() {
      const c = '#a07cff';
      const p = patron('rayas', c, '#dccfff', 24);
      return {
        principal: p.defs + forma(BLUSA, p.url, oscurecer(c)) + pieza(BASTA_BLUSA, c),
        mangas: ambos(forma(manga(0.9, 21, 16), p.url, oscurecer(c)) + pieza(puno(0.84, 17), c)),
      };
    },
  },
  {
    id: 'blusa-tirantes', cat: 'blusas', capa: 'arriba', nombre: 'Blusa de tirantes',
    dibujo() {
      const c = '#5fd6e0';
      return {
        principal: pieza(TIRANTES, c) + flor(150, 284, 16, '#ffffff') +
          linea('M 102 338 Q 150 346 198 338', '#ffffff', 3, 'stroke-dasharray="2 7"'),
        mangas: '',
      };
    },
  },
  {
    id: 'chamarra-mezclilla', cat: 'blusas', capa: 'arriba', nombre: 'Chamarra de mezclilla',
    dibujo() {
      const c = '#5b8ad6';
      const oscuro = '#4a76bd';
      const costura = '#f4b860';
      const bolsillos = ambos(pieza('M 114 264 L 140 264 L 140 286 L 114 286 Z', c) +
        pieza('M 113 260 L 141 260 L 141 270 L 113 270 Z', oscuro));
      const botones = [262, 290, 318].map((y) => punto(150, y, 4, costura)).join('');
      return {
        principal: pieza(BLUSA, c) + linea('M 150 238 L 150 354', oscurecer(c), 3) + bolsillos + botones +
          linea('M 100 340 Q 150 348 200 340', costura, 2.5, 'stroke-dasharray="6 5"') +
          ambos(pieza('M 116 222 L 128 258 L 149 238 Q 132 236 116 222 Z', oscuro)),
        mangas: ambos(pieza(manga(0.9, 21, 17), c) + pieza(puno(0.84, 18), oscuro)),
      };
    },
  },
  {
    id: 'blusa-bolitas', cat: 'blusas', capa: 'arriba', nombre: 'Blusa de bolitas',
    dibujo() {
      const c = '#ff5d73';
      const p = patron('bolitas', c, '#ffffff', 26);
      return {
        principal: p.defs + forma(BLUSA, p.url, oscurecer(c)) + cuelloRedondo('#ffffff'),
        mangas: ambos(forma(manga(0.26, 26, 20, 9), p.url, oscurecer(c))),
      };
    },
  },
  {
    id: 'playera-arcoiris', cat: 'blusas', capa: 'arriba', nombre: 'Playera de arcoíris',
    dibujo() {
      const c = '#f7f3ff';
      const colores = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'];
      const arcos = colores.map((col, i) => {
        const r = 34 - i * 5;
        return linea(`M ${150 - r} 304 A ${r} ${r} 0 0 1 ${150 + r} 304`, col, 5.5);
      }).join('');
      const nubes = [116, 184].map((x) => ovalo(x, 304, 13, 8, '#ffffff')).join('');
      return {
        principal: pieza(BLUSA, c) + arcos + nubes,
        mangas: ambos(pieza(manga(0.32), c)),
      };
    },
  },
  {
    id: 'sudadera-gatito', cat: 'blusas', capa: 'arriba', nombre: 'Sudadera de gatito',
    dibujo() {
      const c = '#b8a4ff';
      const gato = pieza('M 128 284 L 126 258 L 140 270 Q 150 266 160 270 L 174 258 L 172 284 Q 172 302 150 302 Q 128 302 128 284 Z', '#ffffff') +
        punto(141, 282, 3, '#3d2b4f') + punto(159, 282, 3, '#3d2b4f') +
        '<path d="M 146 289 L 154 289 L 150 294 Z" fill="#ff8fab"/>' +
        linea('M 122 288 L 137 291 M 122 295 L 137 295 M 178 288 L 163 291 M 178 295 L 163 295', '#9a90b0', 1.5);
      return {
        principal: pieza(BLUSA, c) + pieza('M 118 314 L 182 314 L 190 342 L 110 342 Z', c) + gato +
          pieza(BASTA_BLUSA, aclarar(c, 0.35)),
        mangas: ambos(pieza(manga(0.9, 22, 17), c) + pieza(puno(0.84, 18), aclarar(c, 0.35))),
      };
    },
  },

  // ===== Faldas y pantalones =====
  {
    id: 'tutu', cat: 'abajo', capa: 'abajo', nombre: 'Falda de tutú',
    dibujo() {
      const capas = [['#ffb6dc', 394, 84], ['#ff9fd0', 380, 76], ['#ffd0e8', 364, 68]];
      return capas.map(([c, y, a]) => pieza(
        `M 112 304 L 188 304 Q ${150 + a - 6} ${y - 40} ${150 + a} ${y}${holanes(150 + a, 150 - a, y, 8, 9)} ` +
        `Q ${150 - a + 6} ${y - 40} 112 304 Z`, c, 'fill-opacity="0.94"')).join('') +
        pieza(CINTURILLA, '#ff6fb3') + brillo(124, 368, 6) + brillo(182, 356, 5) + brillo(160, 384, 4);
    },
  },
  {
    id: 'falda-mezclilla', cat: 'abajo', capa: 'abajo', nombre: 'Falda de mezclilla',
    dibujo() {
      const c = '#5b8ad6';
      const costura = '#f4b860';
      return pieza(falda(392, 46), c) + pieza(CINTURILLA, '#4a76bd') +
        linea('M 150 316 L 150 398', oscurecer(c), 2.5) +
        linea('M 114 326 Q 126 340 138 324 M 186 326 Q 174 340 162 324', oscurecer(c), 2.5) +
        linea('M 108 382 Q 150 394 192 382', costura, 2.5, 'stroke-dasharray="6 5"') +
        punto(150, 308, 4, costura);
    },
  },
  {
    id: 'pantalon-mezclilla', cat: 'abajo', capa: 'abajo', nombre: 'Pantalón de mezclilla',
    dibujo() {
      const c = '#4f7fd0';
      const costura = '#f4b860';
      return pieza(pantalon(546, 20), c) + pieza(CINTURILLA, oscurecer(c, 0.85)) +
        ambos(pieza('M 107 528 L 149 528 L 149 546 L 107 546 Z', '#7ea4e6')) +
        linea('M 150 315 Q 153 340 150 364', oscurecer(c), 2.5) +
        linea('M 112 324 Q 124 336 136 322 M 188 324 Q 176 336 164 322', costura, 2.5, 'stroke-dasharray="5 4"') +
        punto(150, 307, 4, costura);
    },
  },
  {
    id: 'short-amarillo', cat: 'abajo', capa: 'abajo', nombre: 'Short amarillo',
    dibujo() {
      const c = '#ffd23f';
      return pieza(pantalon(406, 21), c) + pieza(CINTURILLA, oscurecer(c, 0.88)) +
        ambos(pieza('M 106 396 L 150 396 L 150 406 L 106 406 Z', aclarar(c, 0.45))) +
        punto(150, 307, 4, '#ff8fab') + flor(124, 360, 9, '#ffffff');
    },
  },
  {
    id: 'mallas-estrellas', cat: 'abajo', capa: 'abajo', nombre: 'Mallas de estrellas',
    dibujo() {
      const c = '#8f6cf0';
      const p = patron('estrellas', c, '#ffe066', 28);
      return p.defs + forma(pantalon(540, 18), p.url, oscurecer(c)) + pieza(CINTURILLA, oscurecer(c, 0.85));
    },
  },
  {
    id: 'falda-flores', cat: 'abajo', capa: 'abajo', nombre: 'Falda larga de flores',
    dibujo() {
      const c = '#8fdcc0';
      const p = patron('flores', c, '#ff8fc7', 36);
      return p.defs +
        forma('M 110 304 L 190 304 C 200 380 214 460 222 520 Q 150 536 78 520 C 86 460 100 380 110 304 Z', p.url, oscurecer(c)) +
        pieza(`M 80 506 Q 150 522 220 506 L 224 520${holanes(224, 76, 520, 9, 6)} Z`, aclarar(c, 0.45)) +
        pieza(CINTURILLA, '#ff8fc7');
    },
  },
  {
    id: 'falda-cuadros', cat: 'abajo', capa: 'abajo', nombre: 'Falda de cuadros',
    dibujo() {
      const c = '#ef5b7a';
      const p = patron('cuadros', c, '#7a2e8e', 28);
      return p.defs + forma(falda(390, 50), p.url, oscurecer(c)) +
        linea('M 128 316 L 120 398 M 150 316 L 150 402 M 172 316 L 180 398', oscurecer(c), 2) +
        pieza(CINTURILLA, oscurecer(c, 0.85));
    },
  },

  // ===== Vestidos =====
  {
    id: 'vestido-princesa', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de princesa',
    dibujo() {
      const rosa = '#ff8cc6';
      const claro = '#ffc8e3';
      const oro = '#ffcf4d';
      const p = patron('brillos', rosa, '#ffffffcc', 34);
      const gemas = [1, 2, 3, 4].map((i) => pieza(corazon(224 - i * 29.6, 478, 6.5), oro)).join('');
      return {
        principal: p.defs +
          forma(`M 108 312 L 192 312 C 210 380 240 452 256 524${holanes(256, 44, 524, 9, 8)} C 60 452 90 380 108 312 Z`, p.url, oscurecer(rosa)) +
          pieza(`M 114 314 L 186 314 C 198 372 214 430 224 474${holanes(224, 76, 474, 5, 14)} C 86 430 102 372 114 314 Z`, claro) +
          gemas +
          pieza('M 106 240 Q 128 222 150 242 Q 172 222 194 240 L 206 256 L 194 318 L 106 318 L 94 256 Z', '#ff6fb3') +
          pieza('M 104 308 L 196 308 L 196 320 L 104 320 Z', oro) +
          pieza(estrella(150, 268, 9), oro),
        mangas: ambos(pieza(manga(0.22, 27, 22, 12), claro)),
      };
    },
  },
  {
    id: 'vestido-fiesta', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de fiesta',
    dibujo() {
      const c = '#7c6cf2';
      const p = patron('brillos', c, '#ffffffb0', 30);
      const borde = oscurecer(c);
      return {
        principal: p.defs +
          pieza(`M 107 314 L 193 314 Q 222 380 232 452${holanes(232, 68, 452, 8, 7)} Q 78 380 107 314 Z`, '#c4bcff', 'fill-opacity="0.75"') +
          forma('M 107 314 L 193 314 Q 214 380 222 436 Q 150 450 78 436 Q 86 380 107 314 Z', p.url, borde) +
          forma(CORPINO_TIRANTES, p.url, borde) +
          monito(150, 318, '#ff8cc6'),
        mangas: '',
      };
    },
  },
  {
    id: 'vestido-verano', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de verano',
    dibujo() {
      const c = '#ffd84d';
      const p = patron('flores', c, '#ffffff', 34);
      const borde = oscurecer(c);
      return {
        principal: p.defs +
          forma('M 107 314 L 193 314 L 216 426 Q 150 440 84 426 Z', p.url, borde) +
          forma(CORPINO_TIRANTES, p.url, borde) +
          pieza('M 106 308 L 194 308 L 194 319 L 106 319 Z', '#ff9f43'),
        mangas: '',
      };
    },
  },
  {
    id: 'vestido-sirena', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de sirena',
    dibujo() {
      const c = '#3cc8c0';
      const p = patron('escamas', c, '#2a9d96', 22);
      const borde = oscurecer(c);
      return {
        principal: p.defs +
          pieza('M 112 456 L 188 456 Q 210 500 240 542 Q 150 558 60 542 Q 90 500 112 456 Z', '#8ff0e3') +
          linea('M 150 462 L 150 550 M 134 462 L 112 548 M 166 462 L 188 548 M 120 462 L 84 542 M 180 462 L 216 542', '#4fbfb3', 2) +
          forma('M 107 314 L 193 314 Q 206 390 188 462 Q 150 470 112 462 Q 94 390 107 314 Z', p.url, borde) +
          forma(CORPINO_TIRANTES, p.url, borde) +
          pieza(estrella(170, 262, 12), '#ff9f80'),
        mangas: '',
      };
    },
  },
  {
    id: 'vestido-hada', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de hada',
    dibujo() {
      const c1 = '#7fdc95';
      const c2 = '#b5f0c2';
      const c3 = '#5cc47a';
      const petalos = [
        ['M 110 312 Q 64 380 82 446 Q 118 414 132 316 Z', c3],
        ['M 190 312 Q 236 380 218 446 Q 182 414 168 316 Z', c3],
        ['M 116 314 Q 98 404 122 462 Q 148 404 150 316 Z', c1],
        ['M 184 314 Q 202 404 178 462 Q 152 404 150 316 Z', c1],
        ['M 132 316 Q 124 420 150 478 Q 176 420 168 316 Z', c2],
      ].map(([d, c]) => pieza(d, c)).join('');
      return {
        principal: petalos +
          linea('M 150 330 L 150 462 M 104 330 Q 92 380 88 430 M 196 330 Q 208 380 212 430', '#ffffff', 2, 'stroke-opacity="0.6"') +
          pieza(CORPINO_TIRANTES, c3) +
          flor(150, 316, 12, '#ffffff') + flor(124, 314, 8, '#ff9ccf', '#ffffff') + flor(176, 314, 8, '#ff9ccf', '#ffffff') +
          brillo(110, 400, 6) + brillo(190, 380, 5) + brillo(150, 440, 5),
        mangas: '',
      };
    },
  },
  {
    id: 'vestido-bolitas', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de bolitas',
    dibujo() {
      const c = '#ff5d73';
      const p = patron('bolitas', c, '#ffffff', 26);
      const borde = oscurecer(c);
      return {
        principal: p.defs +
          pieza(`M 104 330 L 196 330 L 234 426${holanes(234, 66, 426, 9, 7)} Z`, '#ffffff') +
          forma('M 107 314 L 193 314 C 212 358 224 396 228 422 Q 150 436 72 422 C 76 396 88 358 107 314 Z', p.url, borde) +
          forma(CORPINO, p.url, borde) + cuelloRedondo('#ffffff') +
          pieza('M 106 308 L 194 308 L 194 319 L 106 319 Z', '#ffffff') + monito(150, 313, '#ffffff'),
        mangas: ambos(forma(manga(0.25, 26, 20, 9), p.url, borde)),
      };
    },
  },
  {
    id: 'vestido-arcoiris', cat: 'vestidos', capa: 'vestido', nombre: 'Vestido de arcoíris',
    dibujo() {
      const id = nuevoId('arcoiris');
      const colores = ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'];
      const paradas = colores.map((col, i) =>
        `<stop offset="${(i / 6).toFixed(3)}" stop-color="${col}"/><stop offset="${((i + 1) / 6).toFixed(3)}" stop-color="${col}"/>`).join('');
      return {
        principal: `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="318" x2="0" y2="446">${paradas}</linearGradient></defs>` +
          forma('M 107 314 L 193 314 C 212 360 224 400 228 440 Q 150 456 72 440 C 76 400 88 360 107 314 Z', `url(#${id})`, '#8f7ad6') +
          pieza(CORPINO, '#ffffff') + pieza(estrella(150, 270, 14), '#ffd84d'),
        mangas: ambos(pieza(manga(0.24, 25, 20, 8), '#ffffff')),
      };
    },
  },

  // ===== Zapatos =====
  {
    id: 'tenis', cat: 'zapatos', capa: 'zapatos', nombre: 'Tenis rosas',
    dibujo() {
      return ambos(
        pieza('M 104 548 Q 104 534 118 534 L 132 534 Q 145 534 145 548 L 146 558 L 103 558 Z', '#ff8cc6') +
        pieza('M 102 556 L 147 556 L 147 562 Q 147 569 138 569 L 110 569 Q 101 569 102 562 Z', '#ffffff') +
        linea('M 116 541 L 132 541 M 115 548 L 133 548', '#ffffff', 3));
    },
  },
  {
    id: 'botas-lluvia', cat: 'zapatos', capa: 'zapatos', nombre: 'Botas de lluvia',
    dibujo() {
      const c = '#ffd23f';
      return ambos(
        pieza('M 108 466 L 148 466 L 148 552 Q 150 569 136 569 L 112 569 Q 101 569 102 558 L 108 546 Z', c) +
        pieza('M 107 462 L 149 462 L 149 476 L 107 476 Z', oscurecer(c, 0.9)) +
        linea('M 116 486 L 116 530', '#ffffff', 4, 'stroke-opacity="0.6"'));
    },
  },
  {
    id: 'zapatillas-cristal', cat: 'zapatos', capa: 'zapatos', nombre: 'Zapatillas de cristal',
    dibujo() {
      return ambos(
        pieza('M 104 550 Q 124 538 144 550 L 145 560 Q 144 568 134 568 L 112 568 Q 103 567 103 558 Z', '#bfe8ff', 'fill-opacity="0.9"') +
        brillo(114, 557, 6) + brillo(137, 553, 4) + pieza(estrella(124, 545, 6), '#ffffff'));
    },
  },
  {
    id: 'sandalias', cat: 'zapatos', capa: 'zapatos', nombre: 'Sandalias',
    dibujo() {
      const c = '#ff9f43';
      return ambos(
        pieza('M 102 562 L 146 562 Q 146 570 136 570 L 112 570 Q 102 570 102 562 Z', '#c98b5b') +
        pieza('M 107 551 L 141 551 L 142 560 L 106 560 Z', c) +
        pieza('M 112 537 L 144 537 L 144 545 L 112 545 Z', c) +
        flor(124, 555, 6, '#ffffff'));
    },
  },
  {
    id: 'botas-vaqueras', cat: 'zapatos', capa: 'zapatos', nombre: 'Botas vaqueras',
    dibujo() {
      const c = '#b0703f';
      return ambos(
        pieza('M 108 466 Q 128 478 148 466 L 148 552 Q 150 570 132 570 L 112 570 Q 100 569 102 558 L 108 546 Z', c) +
        pieza(estrella(128, 502, 9), '#ffd84d') +
        linea('M 112 524 Q 128 532 144 524', oscurecer(c), 2.5));
    },
  },
  {
    id: 'pantuflas-conejo', cat: 'zapatos', capa: 'zapatos', nombre: 'Pantuflas de conejito',
    dibujo() {
      const blanco = '#ffffff';
      const rosa = '#ffb3d1';
      return ambos(
        pieza('M 110 544 Q 101 512 109 502 Q 121 508 121 542 Z', blanco) +
        pieza('M 112 536 Q 108 518 110 512 Q 116 518 117 536 Z', rosa) +
        pieza('M 129 542 Q 131 508 143 502 Q 149 514 139 544 Z', blanco) +
        pieza('M 133 536 Q 135 518 141 512 Q 143 522 137 538 Z', rosa) +
        pieza('M 102 556 Q 102 536 124 536 Q 146 536 146 556 Q 146 572 124 572 Q 102 572 102 556 Z', blanco) +
        punto(117, 550, 2.6, '#3d2b4f') + punto(131, 550, 2.6, '#3d2b4f') + punto(124, 557, 3.4, '#ff8fab'));
    },
  },
  {
    id: 'zapatos-charol', cat: 'zapatos', capa: 'zapatos', nombre: 'Zapatos de charol',
    dibujo() {
      const c = '#e63958';
      return ambos(
        pieza('M 110 528 L 146 528 L 146 546 L 110 546 Z', '#ffffff') +
        pieza('M 103 556 Q 104 544 124 544 Q 145 544 145 556 L 145 561 Q 144 569 134 569 L 113 569 Q 103 569 103 561 Z', c) +
        linea('M 108 549 L 140 549', oscurecer(c), 4) + punto(138, 549, 3, '#ffd84d') +
        '<ellipse cx="114" cy="558" rx="5" ry="3" fill="#ffffff" opacity="0.6"/>');
    },
  },
  {
    id: 'botas-nieve', cat: 'zapatos', capa: 'zapatos', nombre: 'Botas de nieve',
    dibujo() {
      const c = '#b49cff';
      return ambos(
        pieza('M 108 484 L 148 484 L 148 552 Q 150 569 136 569 L 112 569 Q 101 569 102 558 L 108 546 Z', c) +
        pieza(`M 104 472 Q 128 464 152 472 L 152 488${holanes(152, 104, 488, 4, 5)} Z`, '#ffffff') +
        pieza(estrella(128, 522, 9, 6, 0.4), '#ffffff'));
    },
  },

  // ===== Para la cabeza =====
  {
    id: 'corona', cat: 'cabeza', capa: 'cabeza', nombre: 'Corona',
    dibujo() {
      const oro = '#ffcf4d';
      return pieza('M 112 56 L 106 18 L 128 38 L 150 8 L 172 38 L 194 18 L 188 56 Q 150 64 112 56 Z', oro) +
        ovalo(106, 18, 5, 5, oro) + ovalo(150, 8, 5, 5, oro) + ovalo(194, 18, 5, 5, oro) +
        punto(150, 44, 7, '#ff4d8d') + punto(127, 48, 4.5, '#5cc4ff') + punto(173, 48, 4.5, '#6fdc8c') +
        brillo(118, 46, 4);
    },
  },
  {
    id: 'mono', cat: 'cabeza', capa: 'cabeza', nombre: 'Moño',
    dibujo() {
      const c = '#ff6fb3';
      return pieza('M 194 60 L 182 94 L 193 88 Z', c) + pieza('M 202 60 L 214 94 L 203 88 Z', c) +
        pieza('M 198 54 Q 160 22 162 58 Q 166 84 198 54 Z', c) +
        pieza('M 198 54 Q 238 24 234 62 Q 228 86 198 54 Z', c) +
        ovalo(198, 55, 9, 9, c) + punto(176, 48, 3, '#ffffff') + punto(220, 50, 3, '#ffffff');
    },
  },
  {
    id: 'sombrero', cat: 'cabeza', capa: 'cabeza', nombre: 'Sombrero',
    dibujo() {
      const paja = '#f5d18a';
      return ovalo(150, 64, 104, 22, paja) +
        pieza('M 96 64 C 96 6 204 6 204 64 Z', paja) +
        pieza('M 97 50 Q 150 58 203 50 L 204 64 Q 150 70 96 64 Z', '#ff8cc6') +
        flor(188, 57, 14, '#ffffff');
    },
  },
  {
    id: 'orejas-gato', cat: 'cabeza', capa: 'cabeza', nombre: 'Orejas de gato',
    dibujo() {
      const c = '#4a4060';
      return linea('M 84 104 C 76 36 224 36 216 104', c, 8) +
        ambos(pieza('M 94 66 L 92 18 L 128 46 Z', c) + '<path d="M 101 57 L 100 32 L 120 47 Z" fill="#ff9ccf"/>');
    },
  },
  {
    id: 'corona-flores', cat: 'cabeza', capa: 'cabeza', nombre: 'Corona de flores',
    dibujo() {
      const colores = ['#ff8cc6', '#ffd84d', '#b49cff', '#ffffff', '#ff8cc6', '#ffd84d', '#b49cff'];
      const enArco = (grados) => {
        const a = (grados * Math.PI) / 180;
        return [150 + 72 * Math.cos(a), 104 + 62 * Math.sin(a)];
      };
      let hojas = '';
      let flores = '';
      colores.forEach((col, i) => {
        const [x, y] = enArco(202 + i * 22.7);
        const [hx, hy] = enArco(213 + i * 22.7);
        if (i < colores.length - 1) hojas += ovalo(r1(hx), r1(hy), 9, 5, '#6fcf7f', `transform="rotate(${r1(213 + i * 22.7 + 90)} ${r1(hx)} ${r1(hy)})"`);
        flores += flor(r1(x), r1(y), 15, col, col === '#ffd84d' ? '#ff9f43' : '#ffd84d');
      });
      return linea('M 84 92 C 84 30 216 30 216 92', '#6fcf7f', 4) + hojas + flores;
    },
  },
  {
    id: 'diadema-unicornio', cat: 'cabeza', capa: 'cabeza', nombre: 'Diadema de unicornio',
    dibujo() {
      return linea('M 84 104 C 76 36 224 36 216 104', '#ffb3d9', 8) +
        ambos(pieza('M 102 62 L 104 34 L 124 52 Z', '#ffffff') + '<path d="M 107 55 L 108 42 L 117 51 Z" fill="#ffb3d9"/>') +
        pieza('M 138 48 L 150 2 L 162 48 Z', '#ffd84d') +
        linea('M 141 38 L 158 32 M 143 26 L 156 21 M 146 15 L 153 12', '#e0a800', 2.5) +
        flor(129, 50, 10, '#ff8cc6') + flor(171, 50, 10, '#b49cff');
    },
  },
  {
    id: 'gorro', cat: 'cabeza', capa: 'cabeza', nombre: 'Gorro de invierno',
    dibujo() {
      const c = '#ff8cc6';
      const claro = '#ffc4e1';
      return pieza('M 78 100 C 70 22 230 22 222 100 Z', c) +
        pieza('M 76 86 Q 150 74 224 86 L 226 108 Q 150 96 74 108 Z', claro) +
        linea('M 96 84 L 95 104 M 116 80 L 116 100 M 136 78 L 136 98 M 156 78 L 156 98 M 176 79 L 177 99 M 196 82 L 197 102', oscurecer(claro), 2) +
        ovalo(150, 26, 18, 18, '#ffffff');
    },
  },

  // ===== Accesorios =====
  {
    id: 'alas-hada', cat: 'accesorios', capa: 'alas', nombre: 'Alas de hada',
    dibujo() {
      const c = '#bfe3ff';
      return ambos(
        pieza('M 142 262 C 96 170 2 108 4 184 C 6 262 70 300 142 290 Z', c, 'fill-opacity="0.9"') +
        pieza('M 142 292 C 84 296 22 338 40 394 C 62 440 128 370 144 310 Z', '#d9c8ff', 'fill-opacity="0.9"') +
        linea('M 136 272 Q 70 220 22 176 M 136 300 Q 80 334 56 390', '#ffffff', 2.5, 'stroke-opacity="0.8"') +
        brillo(34, 214, 8) + brillo(60, 372, 6));
    },
  },
  {
    id: 'varita', cat: 'accesorios', capa: 'mano-izq', nombre: 'Varita mágica',
    dibujo() {
      return linea('M 88 410 L 44 318', '#c9a0dc', 11) + linea('M 88 410 L 44 318', '#ffffff', 6) +
        pieza(estrella(42, 308, 24), '#ffd84d') + brillo(36, 302, 5) +
        brillo(14, 284, 7, '#ffe066') + brillo(70, 278, 5, '#ffe066') + brillo(22, 340, 5, '#ffe066') +
        '<circle class="piel" cx="80" cy="394" r="14"/>';
    },
  },
  {
    id: 'osito', cat: 'accesorios', capa: 'mano-izq', nombre: 'Osito de peluche',
    dibujo() {
      const c = '#c68a5a';
      const claro = '#ecc9a3';
      // El osito cuelga de la mano: su bracito llega hasta ella.
      return '<g transform="translate(12 -8)">' +
        ovalo(52, 468, 24, 28, c) + ovalo(40, 494, 10, 10, c) + ovalo(64, 494, 10, 10, c) +
        ovalo(52, 472, 13, 15, claro) +
        ovalo(34, 408, 9, 9, c) + ovalo(68, 406, 9, 9, c) +
        ovalo(51, 426, 23, 22, c) + ovalo(51, 434, 10, 8, claro) +
        punto(43, 421, 3, '#3d2b4f') + punto(59, 421, 3, '#3d2b4f') + punto(51, 431, 3.5, '#3d2b4f') +
        ovalo(70, 412, 7, 15, c, 'transform="rotate(-40 70 412)"') +
        '</g><circle class="piel" cx="80" cy="394" r="14"/>';
    },
  },
  {
    id: 'bolsa', cat: 'accesorios', capa: 'mano-der', nombre: 'Bolsa',
    dibujo() {
      const c = '#ff8cc6';
      return linea('M 206 422 Q 220 370 240 422', '#d94f93', 9) + linea('M 206 422 Q 220 370 240 422', c, 4) +
        pieza('M 198 418 L 246 418 L 252 462 Q 252 470 244 470 L 200 470 Q 192 470 192 462 Z', c) +
        pieza('M 198 418 L 246 418 L 240 438 Q 222 446 204 438 Z', '#ff6fb3') +
        pieza(corazon(222, 440, 7), '#ffcf4d') +
        '<circle class="piel" cx="220" cy="394" r="14"/>';
    },
  },
  {
    id: 'globo', cat: 'accesorios', capa: 'mano-der', nombre: 'Globo',
    dibujo() {
      return linea('M 220 400 C 236 360 250 300 262 226', '#8a7f99', 2) +
        pieza('M 256 232 L 262 222 L 268 232 Z', '#ff4d6d') +
        ovalo(262, 186, 30, 36, '#ff4d6d') +
        '<ellipse cx="251" cy="172" rx="7" ry="12" fill="#ffffff" opacity="0.55" transform="rotate(20 251 172)"/>' +
        '<circle class="piel" cx="220" cy="394" r="14"/>';
    },
  },
  {
    id: 'lentes-corazon', cat: 'accesorios', capa: 'lentes', nombre: 'Lentes de corazón',
    dibujo() {
      const marco = '#ff2d6f';
      return [124, 176].map((x) =>
        `<path d="${corazon(x, 138, 23)}" fill="#ff9ccf" fill-opacity="0.35" stroke="${marco}" stroke-width="5" stroke-linejoin="round"/>`).join('') +
        linea('M 145 130 Q 150 125 155 130 M 104 128 L 82 122 M 196 128 L 218 122', marco, 4);
    },
  },
  {
    id: 'lentes-estrella', cat: 'accesorios', capa: 'lentes', nombre: 'Lentes de estrella',
    dibujo() {
      const marco = '#8a5cf6';
      return [124, 176].map((x) =>
        `<path d="${estrella(x, 139, 25, 5, 0.55)}" fill="#c9b5ff" fill-opacity="0.35" stroke="${marco}" stroke-width="5" stroke-linejoin="round"/>`).join('') +
        linea('M 146 134 Q 150 130 154 134 M 102 132 L 82 126 M 198 132 L 218 126', marco, 4);
    },
  },
  {
    id: 'collar-perlas', cat: 'accesorios', capa: 'cuello', nombre: 'Collar de perlas',
    dibujo() {
      let perlas = '';
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = (1 - t) * (1 - t) * 124 + 2 * (1 - t) * t * 150 + t * t * 176;
        const y = (1 - t) * (1 - t) * 226 + 2 * (1 - t) * t * 262 + t * t * 226;
        perlas += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="#fffaf2" stroke="#d6c4b0" stroke-width="2"/>`;
      }
      return perlas + pieza(corazon(150, 256, 8), '#ff8cc6');
    },
  },
  {
    id: 'bufanda', cat: 'accesorios', capa: 'cuello', nombre: 'Bufanda',
    dibujo() {
      const c = '#ff5d6c';
      const p = patron('rayas', c, '#ffffff', 16);
      return p.defs +
        forma('M 160 236 L 184 236 L 192 330 L 166 332 Z', p.url, oscurecer(c)) +
        linea('M 170 334 L 170 344 M 178 333 L 179 343 M 186 332 L 188 342', c, 3) +
        forma('M 120 206 Q 150 226 180 206 L 186 232 Q 150 256 114 232 Z', p.url, oscurecer(c));
    },
  },
];

const PRENDA_POR_ID = new Map(PRENDAS.map((p) => [p.id, p]));
export const prendaPorId = (id) => PRENDA_POR_ID.get(id);

/** Dibuja una prenda y siempre regresa { principal, mangas }. */
export function dibujarPrenda(prenda) {
  const r = prenda.dibujo();
  return typeof r === 'string' ? { principal: r, mangas: '' } : r;
}

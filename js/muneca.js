// La muñeca: un SVG de 300 × 600 armado por capas, de atrás hacia adelante.
// El cuerpo, el pelo y los brazos son fijos; las demás capas se llenan con la ropa puesta.

import { prendaPorId, dibujarPrenda } from './ropa.js';

const ORDEN = [
  'alas', 'pelo-atras', 'cuerpo', 'base',
  'abajo', 'arriba', 'vestido',
  'brazos', 'arriba-mangas', 'vestido-mangas',
  'zapatos', 'cuello', 'pelo-frente', 'cabeza', 'lentes', 'mano-izq', 'mano-der',
];

/** Lugares donde se puede poner ropa (una prenda por lugar). */
export const LUGARES = ['alas', 'abajo', 'arriba', 'vestido', 'zapatos', 'cuello', 'cabeza', 'lentes', 'mano-izq', 'mano-der'];

// ---------- Partes fijas ----------

const PELO_ATRAS = `
  <path class="pelo" d="M 150 26 C 236 26 254 92 248 170 C 244 236 254 292 238 334
    Q 220 350 200 340 Q 176 354 150 344 Q 124 354 100 340 Q 80 350 62 334
    C 46 292 56 236 52 170 C 46 92 64 26 150 26 Z"/>`;

const CUERPO = `
  <path class="extremidad-borde" d="M 130 356 L 128 544 M 170 356 L 172 544" stroke-width="34"/>
  <path class="extremidad" d="M 130 356 L 128 544 M 170 356 L 172 544" stroke-width="28"/>
  <ellipse class="piel" cx="124" cy="552" rx="17" ry="10"/>
  <ellipse class="piel" cx="176" cy="552" rx="17" ry="10"/>
  <rect class="piel" x="137" y="176" width="26" height="54" rx="10"/>
  <path class="piel" d="M 116 222 C 100 226 92 236 94 250 L 110 312 Q 104 336 102 360
    Q 150 382 198 360 Q 196 336 190 312 L 206 250 C 208 236 200 226 184 222 Z"/>
  <ellipse class="piel" cx="150" cy="118" rx="72" ry="76"/>

  <g class="ojos">
    <ellipse cx="124" cy="138" rx="10" ry="13" fill="#3d2b4f"/>
    <ellipse cx="176" cy="138" rx="10" ry="13" fill="#3d2b4f"/>
    <circle cx="128" cy="133" r="4.5" fill="#fff"/><circle cx="121" cy="143" r="2" fill="#fff"/>
    <circle cx="180" cy="133" r="4.5" fill="#fff"/><circle cx="173" cy="143" r="2" fill="#fff"/>
    <path d="M 115 129 L 108 124 M 114 135 L 106 133 M 185 129 L 192 124 M 186 135 L 194 133"
      stroke="#3d2b4f" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="ojos-felices">
    <path d="M 113 141 Q 124 126 135 141 M 165 141 Q 176 126 187 141" fill="none"
      stroke="#3d2b4f" stroke-width="4.5" stroke-linecap="round"/>
  </g>
  <path class="ceja" d="M 112 115 Q 124 109 136 114 M 164 114 Q 176 109 188 115"/>
  <ellipse cx="104" cy="162" rx="13" ry="8" fill="#ff8fab" opacity="0.55"/>
  <ellipse cx="196" cy="162" rx="13" ry="8" fill="#ff8fab" opacity="0.55"/>
  <path class="nariz" d="M 146 154 Q 150 158 154 154"/>
  <path class="boca" d="M 136 168 Q 150 184 164 168 Q 150 172 136 168 Z"
    fill="#e0567f" stroke="#b83a63" stroke-width="2" stroke-linejoin="round"/>
  <g class="boca-risa">
    <path d="M 131 165 Q 150 198 169 165 Q 150 170 131 165 Z" fill="#c9184a" stroke="#9d1238" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="150" cy="182" rx="8" ry="5" fill="#ff8fa3"/>
  </g>`;

// Ropa básica: top sin tirantes y short. Así la muñeca nunca queda sin ropa.
const BASE = `
  <path class="base" d="M 100 252 Q 150 244 200 252 L 190 312 Q 196 336 198 360 L 188 394 L 153 394
    L 150 380 L 147 394 L 112 394 L 102 360 Q 104 336 110 312 Z"/>
  <path d="M 104 262 Q 150 254 196 262" fill="none" stroke="#fff" stroke-width="3" stroke-opacity="0.7" stroke-dasharray="2 6" stroke-linecap="round"/>`;

const BRAZOS = `
  <path class="extremidad-borde" d="M 100 250 L 82 386 M 200 250 L 218 386" stroke-width="30"/>
  <path class="extremidad" d="M 100 250 L 82 386 M 200 250 L 218 386" stroke-width="24"/>
  <circle class="piel" cx="80" cy="394" r="14"/>
  <circle class="piel" cx="220" cy="394" r="14"/>`;

const PELO_FRENTE = `
  <path class="pelo" d="M 74 140 C 62 64 108 34 150 34 C 192 34 238 64 226 140
    C 220 116 208 100 194 92 C 184 108 160 114 134 106 C 118 102 104 106 94 118 C 86 126 80 132 74 140 Z"/>
  <path class="pelo" d="M 76 120 C 66 156 68 196 82 222 C 86 196 90 164 96 128 Z"/>
  <path class="pelo" d="M 224 120 C 234 156 232 196 218 222 C 214 196 210 164 204 128 Z"/>
  <path d="M 108 54 Q 136 42 166 46" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="7" stroke-linecap="round"/>`;

// ---------- La muñeca ----------

export function crearMuneca(svg) {
  svg.setAttribute('viewBox', '0 0 300 600');
  svg.innerHTML =
    '<ellipse cx="150" cy="570" rx="80" ry="12" fill="#7a3e6b" opacity="0.16"/>' +
    '<g class="respirar"><g class="animado">' +
    ORDEN.map((c) => `<g data-capa="${c}"></g>`).join('') +
    '</g></g>';

  const capa = {};
  for (const g of svg.querySelectorAll('[data-capa]')) capa[g.dataset.capa] = g;
  capa['pelo-atras'].innerHTML = PELO_ATRAS;
  capa.cuerpo.innerHTML = CUERPO;
  capa.base.innerHTML = BASE;
  capa.brazos.innerHTML = BRAZOS;
  capa['pelo-frente'].innerHTML = PELO_FRENTE;

  const animado = svg.querySelector('.animado');
  let finRisa = 0;

  /** Pone en cada lugar la prenda indicada en `puesto` ({ lugar: id }). */
  function vestir(puesto) {
    for (const lugar of LUGARES) {
      const prenda = prendaPorId(puesto[lugar]);
      const id = prenda ? prenda.id : '';
      if (capa[lugar].dataset.prenda === id) continue;   // no cambió
      capa[lugar].dataset.prenda = id;
      const { principal, mangas } = prenda ? dibujarPrenda(prenda) : { principal: '', mangas: '' };
      capa[lugar].innerHTML = principal;
      if (capa[`${lugar}-mangas`]) capa[`${lugar}-mangas`].innerHTML = mangas;
    }
  }

  /** Brinquito, vuelta o cosquillas: reinicia la animación aunque ya esté corriendo. */
  function animar(nombre) {
    animado.classList.remove('saltar', 'girar', 'cosquillas');
    animado.getBoundingClientRect();   // para que la animación vuelva a empezar
    animado.classList.add(nombre);
  }
  animado.addEventListener('animationend', (e) => {
    if (e.target === animado) animado.classList.remove('saltar', 'girar', 'cosquillas');
  });

  function reir() {
    const ahora = performance.now();
    if (ahora < finRisa) return false;
    finRisa = ahora + 1200;
    svg.classList.add('riendo');
    animar('cosquillas');
    setTimeout(() => svg.classList.remove('riendo'), 1200);
    return true;
  }

  /** Centro en pantalla de una capa (o de toda la muñeca si está vacía). */
  function centroDe(lugar) {
    let r = capa[lugar]?.getBoundingClientRect();
    if (!r || r.width === 0) r = svg.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  return { vestir, animar, reir, centroDe };
}

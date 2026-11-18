// Dibujos de los botones y de las herramientas, todos en una caja de 100 × 100.

import { ICONO_MAMELUCO } from './ropa-bebe.js';

const svg = (contenido) => `<svg viewBox="0 0 100 100" aria-hidden="true">${contenido}</svg>`;

// ---------- Actividades (barra de abajo y burbuja de pedidos) ----------

export function biberon(nivel = 1) {
  const alto = 56 * Math.max(0, Math.min(1, nivel));
  return `<g transform="rotate(-45 50 50)">
    <path d="M 44 23 Q 44 6 50 6 Q 56 6 56 23 Z" fill="#f5d5a8" stroke="#c99a5e" stroke-width="3"/>
    <rect x="37" y="20" width="26" height="13" rx="4" fill="#ff8cc6" stroke="#d94f93" stroke-width="3"/>
    <rect x="34" y="31" width="32" height="62" rx="10" fill="#eaf6ff" stroke="#8fb8d8" stroke-width="3"/>
    <rect x="37" y="${(90 - alto).toFixed(1)}" width="26" height="${alto.toFixed(1)}" rx="7" fill="#fffdf5"/>
    <path d="M 40 50 L 48 50 M 40 62 L 48 62 M 40 74 L 48 74" stroke="#8fb8d8" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;
}

const PATITO = `
  <ellipse cx="54" cy="64" rx="34" ry="23" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
  <path d="M 80 52 Q 94 44 90 62" fill="#ffd84d" stroke="#d9a81c" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="38" cy="36" r="19" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
  <path d="M 21 38 L 6 44 L 21 49 Z" fill="#ff9f43" stroke="#e07c1c" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="35" cy="32" r="3.5" fill="#3d2b4f"/>
  <path d="M 42 64 Q 56 76 70 62" fill="none" stroke="#d9a81c" stroke-width="4" stroke-linecap="round"/>`;

const PANAL_LIMPIO = `
  <path d="M 10 30 Q 50 42 90 30 L 84 58 Q 74 86 50 88 Q 26 86 16 58 Z" fill="#ffffff" stroke="#8fc3e8" stroke-width="5" stroke-linejoin="round"/>
  <rect x="6" y="24" width="20" height="14" rx="5" fill="#9ad8ff"/><rect x="74" y="24" width="20" height="14" rx="5" fill="#9ad8ff"/>
  <path d="M 50 70 C 44 65 38 61 38 55 C 38 50 45 48 50 54 C 55 48 62 50 62 55 C 62 61 56 65 50 70 Z" fill="#ff9fc4"/>`;

const SONAJA = `
  <path d="M 62 62 L 88 88" stroke="#ff8cc6" stroke-width="11" stroke-linecap="round"/>
  <circle cx="90" cy="90" r="7" fill="#ff8cc6"/>
  <circle cx="40" cy="40" r="28" fill="#ffd84d" stroke="#d9a81c" stroke-width="4"/>
  <path d="M 16 32 Q 40 44 64 32 M 14 48 Q 40 60 66 48" fill="none" stroke="#ff8cc6" stroke-width="6"/>
  <circle cx="30" cy="28" r="5" fill="#ffffff" opacity="0.7"/>`;

export const ICONO_ACTIVIDAD = {
  jugar: svg(SONAJA),
  panal: svg(PANAL_LIMPIO),
  comer: svg(biberon(1)),
  banar: svg(PATITO),
  vestir: ICONO_MAMELUCO,
  dormir: svg(`
    <path d="M 58 12 A 38 38 0 1 0 88 66 A 30 30 0 1 1 58 12 Z" fill="#ffd84d" stroke="#d9a81c" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 78 14 L 81 22 L 89 23 L 83 28 L 85 36 L 78 32 L 71 36 L 73 28 L 67 23 L 75 22 Z" fill="#b49cff"/>`),
};

// ---------- Herramientas ----------
// `punta` es el punto (en la caja de 100 × 100) que hace efecto: la cuchara, el chupón del
// biberón, etc. Al arrastrar, ese punto queda debajo del dedo.

export const HERRAMIENTAS = {
  cuchara: {
    punta: [32, 32],
    icono: (llena, color) => svg(`
      <path d="M 86 86 L 46 46" stroke="#b9b9cc" stroke-width="11" stroke-linecap="round"/>
      <ellipse cx="32" cy="32" rx="22" ry="15" transform="rotate(45 32 32)" fill="#ececf5" stroke="#9a9ab0" stroke-width="3"/>
      ${llena ? `<ellipse cx="31" cy="31" rx="16" ry="10" transform="rotate(45 31 31)" fill="${color}"/>` : ''}`),
  },
  biberon: {
    punta: [19, 19],
    icono: (nivel) => svg(biberon(nivel)),
  },
  servilleta: {
    punta: [50, 50],
    icono: () => svg(`
      <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="#ffd6e7" stroke="#e58fb4" stroke-width="4" stroke-linejoin="round"/>
      <path d="M 18 50 L 82 50" stroke="#e58fb4" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round"/>
      <path d="M 50 40 C 46 36 40 34 40 30 C 40 26 46 25 50 30 C 54 25 60 26 60 30 C 60 34 54 36 50 40 Z" fill="#ff8cc6"/>`),
  },
  jabon: {
    punta: [50, 56],
    icono: () => svg(`
      <rect x="18" y="36" width="64" height="40" rx="16" fill="#ff9fc4" stroke="#d96b98" stroke-width="4" transform="rotate(-12 50 56)"/>
      <ellipse cx="40" cy="48" rx="13" ry="5" fill="#fff" opacity="0.6" transform="rotate(-12 40 48)"/>
      <circle cx="78" cy="22" r="8" fill="#fff" stroke="#9ad8ff" stroke-width="2.5"/>
      <circle cx="90" cy="38" r="5" fill="#fff" stroke="#9ad8ff" stroke-width="2.5"/>
      <circle cx="64" cy="14" r="5" fill="#fff" stroke="#9ad8ff" stroke-width="2.5"/>`),
  },
  regadera: {
    punta: [42, 40],
    icono: () => svg(`
      <path d="M 60 58 L 90 90" stroke="#9aa7b8" stroke-width="13" stroke-linecap="round"/>
      <circle cx="42" cy="40" r="27" fill="#cfd8e3" stroke="#8a97a8" stroke-width="4"/>
      <circle cx="42" cy="40" r="18" fill="#eef3f8"/>
      <g fill="#7fb6e0"><circle cx="42" cy="40" r="2.6"/><circle cx="33" cy="35" r="2.6"/><circle cx="51" cy="35" r="2.6"/>
      <circle cx="33" cy="46" r="2.6"/><circle cx="51" cy="46" r="2.6"/><circle cx="42" cy="29" r="2.6"/><circle cx="42" cy="51" r="2.6"/></g>`),
  },
  toalla: {
    punta: [50, 52],
    icono: () => svg(`
      <rect x="12" y="24" width="76" height="56" rx="12" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="4"/>
      <path d="M 12 46 L 88 46 M 12 62 L 88 62" stroke="#ffffff" stroke-width="6"/>
      <path d="M 12 36 Q 50 48 88 36" fill="none" stroke="#5aa9d6" stroke-width="3"/>`),
  },
  toallitas: {
    punta: [50, 46],
    icono: () => svg(`
      <rect x="12" y="34" width="76" height="50" rx="14" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="4"/>
      <ellipse cx="50" cy="44" rx="20" ry="6" fill="#5aa9d6"/>
      <path d="M 36 44 Q 34 22 46 14 Q 52 24 58 12 Q 68 24 64 44 Z" fill="#ffffff" stroke="#9ab8cc" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 50 74 C 45 70 40 67 40 62 C 40 58 46 56 50 61 C 54 56 60 58 60 62 C 60 67 55 70 50 74 Z" fill="#ffffff"/>`),
  },
  talco: {
    punta: [40, 14],
    icono: () => svg(`
      <rect x="26" y="26" width="40" height="64" rx="14" fill="#ffffff" stroke="#c9c9d6" stroke-width="4"/>
      <path d="M 30 26 Q 30 10 46 10 Q 62 10 62 26 Z" fill="#ff9fc4" stroke="#e07aa5" stroke-width="4"/>
      <circle cx="40" cy="17" r="2.5" fill="#e07aa5"/><circle cx="48" cy="15" r="2.5" fill="#e07aa5"/><circle cx="54" cy="19" r="2.5" fill="#e07aa5"/>
      <path d="M 46 60 C 41 56 36 53 36 48 C 36 44 42 42 46 47 C 50 42 56 44 56 48 C 56 53 51 56 46 60 Z" fill="#ffc4dc"/>
      <g fill="#ffffff" stroke="#e3e3ee" stroke-width="2"><circle cx="76" cy="20" r="9"/><circle cx="86" cy="32" r="6"/><circle cx="70" cy="8" r="5"/></g>`),
  },
  panal: {
    punta: [50, 56],
    icono: () => svg(PANAL_LIMPIO),
  },
  mantita: {
    punta: [50, 50],
    icono: () => svg(`
      <path d="M 12 22 Q 50 10 88 22 L 84 80 Q 50 92 16 80 Z" fill="#cdbbff" stroke="#9b86d6" stroke-width="4" stroke-linejoin="round"/>
      <g fill="#fff6c2"><circle cx="34" cy="38" r="5"/><circle cx="62" cy="34" r="5"/><circle cx="48" cy="58" r="5"/><circle cx="72" cy="64" r="5"/><circle cx="28" cy="68" r="5"/></g>
      <path d="M 16 80 Q 50 92 84 80" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="2 8" stroke-linecap="round"/>`),
  },
  burbujero: {
    punta: [30, 30],
    icono: () => svg(`
      <path d="M 44 44 L 88 88" stroke="#7cc7ff" stroke-width="9" stroke-linecap="round"/>
      <circle cx="30" cy="30" r="18" fill="rgba(255,255,255,0.5)" stroke="#ff8cc6" stroke-width="7"/>
      <g fill="rgba(255,255,255,0.6)" stroke="#9ad8ff" stroke-width="3"><circle cx="66" cy="20" r="10"/><circle cx="84" cy="44" r="7"/><circle cx="14" cy="66" r="6"/></g>`),
  },
  sonaja: {
    punta: [40, 40],
    icono: () => svg(SONAJA),
  },
  chupon: {
    punta: [50, 46],
    icono: () => svg(`
      <circle cx="50" cy="74" r="15" fill="none" stroke="#ff8cc6" stroke-width="7"/>
      <ellipse cx="50" cy="48" rx="33" ry="21" fill="#8fd3ff" stroke="#4fa8dd" stroke-width="4"/>
      <ellipse cx="50" cy="45" rx="10" ry="11" fill="#d6f1ff"/>`),
  },
};

// ---------- Otros ----------

/** El pañal sucio abierto, con su popó de caricatura (va en el dedo rumbo al bote). */
export const PANAL_SUCIO_ABIERTO = svg(`
  <path d="M 12 24 Q 50 36 88 24 L 80 50 Q 66 60 66 74 L 70 92 Q 50 98 30 92 L 34 74 Q 34 60 20 50 Z"
    fill="#f6e9c4" stroke="#cdb57a" stroke-width="4" stroke-linejoin="round"/>
  <rect x="6" y="18" width="18" height="13" rx="4" fill="#9ad8ff"/><rect x="76" y="18" width="18" height="13" rx="4" fill="#9ad8ff"/>
  <g stroke="#5e3a17" stroke-width="3">
    <ellipse cx="50" cy="70" rx="19" ry="9" fill="#8b5a2b"/>
    <ellipse cx="50" cy="60" rx="14" ry="8" fill="#9a6532"/>
    <ellipse cx="50" cy="51" rx="9" ry="6" fill="#a8703a"/>
  </g>
  <path d="M 50 46 Q 56 38 49 34" fill="none" stroke="#a8703a" stroke-width="6" stroke-linecap="round"/>
  <path d="M 40 58 Q 44 55 48 57" fill="none" stroke="#d6a26b" stroke-width="3" stroke-linecap="round"/>
  <g fill="none" stroke="#9bd16b" stroke-width="3.5" stroke-linecap="round">
    <path d="M 30 30 q 6 -6 0 -12 q -6 -6 0 -12"/><path d="M 70 30 q 6 -6 0 -12 q -6 -6 0 -12"/>
  </g>`);

export const CAMARA = svg(`
  <rect x="8" y="28" width="84" height="58" rx="14" fill="#7cc7ff" stroke="#3f8fd0" stroke-width="5"/>
  <path d="M 32 28 L 38 16 L 62 16 L 68 28 Z" fill="#7cc7ff" stroke="#3f8fd0" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="50" cy="57" r="20" fill="#ffffff" stroke="#3f8fd0" stroke-width="5"/>
  <circle cx="50" cy="57" r="10" fill="#3d2b4f"/><circle cx="46" cy="53" r="3.5" fill="#ffffff"/>
  <circle cx="80" cy="40" r="5" fill="#ffd84d"/>`);

export const ALBUM = svg(`
  <rect x="14" y="20" width="56" height="62" rx="6" fill="#ffffff" stroke="#c9b6e8" stroke-width="5" transform="rotate(-10 42 51)"/>
  <rect x="30" y="16" width="56" height="62" rx="6" fill="#ffffff" stroke="#b49cff" stroke-width="5" transform="rotate(8 58 47)"/>
  <g transform="rotate(8 58 47)">
    <rect x="37" y="23" width="42" height="36" rx="3" fill="#bfe8ff"/>
    <circle cx="66" cy="33" r="6" fill="#ffd84d"/>
    <path d="M 37 59 L 50 44 L 60 54 L 66 48 L 79 59 Z" fill="#8fdcc0"/>
  </g>`);

export const CERRAR = svg(`
  <path d="M 28 28 L 72 72 M 72 28 L 28 72" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>`);

export const MANITA = svg(`
  <path d="M 30 12 Q 30 3 37 3 Q 44 3 44 12 L 44 42 L 50 40 Q 57 38 59 45 L 64 43 Q 71 41 73 48 L 77 47
    Q 85 46 86 54 L 86 72 Q 86 95 62 96 L 50 96 Q 36 96 28 82 L 14 58 Q 10 50 17 47 Q 24 45 29 53 L 30 56 Z"
    fill="#ffffff" stroke="#6b2d5c" stroke-width="4" stroke-linejoin="round"/>`);

export const ESTRELLA = svg(`
  <path d="M 50 6 L 62 36 L 94 38 L 69 58 L 78 90 L 50 72 L 22 90 L 31 58 L 6 38 L 38 36 Z"
    fill="#ffd84d" stroke="#e0a800" stroke-width="5" stroke-linejoin="round"/>`);

export const SOL = svg(`
  <g stroke="#ff9f1c" stroke-width="7" stroke-linecap="round">
    <path d="M 50 4 L 50 16 M 50 84 L 50 96 M 4 50 L 16 50 M 84 50 L 96 50 M 17 17 L 26 26 M 74 74 L 83 83 M 17 83 L 26 74 M 74 26 L 83 17"/>
  </g>
  <circle cx="50" cy="50" r="27" fill="#ffd84d" stroke="#ff9f1c" stroke-width="5"/>
  <path d="M 39 52 Q 50 62 61 52" fill="none" stroke="#e07c1c" stroke-width="4" stroke-linecap="round"/>
  <circle cx="41" cy="44" r="3.5" fill="#e07c1c"/><circle cx="59" cy="44" r="3.5" fill="#e07c1c"/>`);

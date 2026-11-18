// El bebé, dibujado en SVG. Sus coordenadas tienen el (0, 0) entre sus pompis:
// hacia arriba es negativo. La cabeza está en (0, -300) y la boca en (0, -238).
// Cada lugar lo coloca con un translate (ver main.js).
//
// La cara y la pose se cambian con atributos data-* y el CSS hace el resto.
// La ropa viene de ropa-bebe.js; aquí solo están el pañal, el babero, la toalla y la cobija.

import { prendaPorId } from './ropa-bebe.js';

const NS = 'http://www.w3.org/2000/svg';
const espejo = (svg) => `<g transform="scale(-1 1)">${svg}</g>`;
const ambos = (svg) => svg + espejo(svg);

export const BOCA = [0, -238];
const CABEZA = [0, -300];

// ---------- Partes fijas ----------

const TORSO = `
  <ellipse class="piel" cx="0" cy="-112" rx="90" ry="96"/>
  <path class="trazo-piel" d="M -5 -66 Q 0 -60 5 -66"/>`;

const PIERNAS = ambos(`
  <ellipse class="piel" cx="-50" cy="-24" rx="50" ry="31" transform="rotate(-10 -50 -24)"/>
  <ellipse class="piel" cx="-100" cy="-14" rx="26" ry="20" transform="rotate(-25 -100 -14)"/>
  <path class="trazo-piel" d="M -118 -22 L -116 -16 M -110 -28 L -108 -21"/>`);

const BRAZOS = ambos(`
  <path class="extremidad-borde" d="M -70 -170 Q -100 -130 -112 -86" stroke-width="46"/>
  <path class="extremidad" d="M -70 -170 Q -100 -130 -112 -86" stroke-width="40"/>
  <circle class="piel" cx="-116" cy="-78" r="22"/>`);

const CABEZA_SVG = `
  ${ambos('<circle class="piel" cx="-110" cy="-292" r="22"/><path class="trazo-piel" d="M -116 -302 Q -126 -292 -114 -281"/>')}
  <circle class="piel" cx="0" cy="-300" r="112"/>
  <path class="pelo-trazo" d="M -6 -410 C -10 -442 26 -448 27 -424 C 28 -409 9 -405 8 -419"/>
  <path class="pelo-trazo" d="M -30 -406 Q -36 -424 -22 -432 M 24 -408 Q 34 -422 48 -421" stroke-width="5"/>
  <path class="ceja" d="M -60 -336 Q -46 -344 -32 -337 M 32 -337 Q 46 -344 60 -336"/>
  ${ambos('<ellipse class="cachete" cx="-72" cy="-256" rx="22" ry="14"/>')}
  <ellipse class="nariz" cx="0" cy="-268" rx="9" ry="6"/>

  <g class="ojos-abiertos">
    <ellipse cx="-44" cy="-296" rx="15" ry="18" fill="#3d2b4f"/>
    <ellipse cx="44" cy="-296" rx="15" ry="18" fill="#3d2b4f"/>
    <circle cx="-39" cy="-303" r="6" fill="#fff"/><circle cx="-49" cy="-289" r="2.5" fill="#fff"/>
    <circle cx="49" cy="-303" r="6" fill="#fff"/><circle cx="39" cy="-289" r="2.5" fill="#fff"/>
  </g>
  <g class="parpados"></g>
  <path class="ojos-felices" d="M -60 -290 Q -44 -310 -28 -290 M 28 -290 Q 44 -310 60 -290"
    fill="none" stroke="#3d2b4f" stroke-width="5" stroke-linecap="round"/>
  <g class="ojos-dormidos" fill="none" stroke="#3d2b4f" stroke-width="4.5" stroke-linecap="round">
    <path d="M -60 -296 Q -44 -282 -28 -296 M 28 -296 Q 44 -282 60 -296"/>
    <path d="M -56 -290 L -60 -283 M -44 -287 L -44 -279 M 56 -290 L 60 -283 M 44 -287 L 44 -279" stroke-width="2.5"/>
  </g>
  <g class="tristeza">
    <path class="ceja" d="M -58 -328 Q -46 -338 -32 -344 M 32 -344 Q 46 -338 58 -328"/>
    <path d="M -58 -276 Q -66 -261 -58 -255 Q -50 -261 -58 -276 Z" fill="#8fd3ff" stroke="#4fa8dd" stroke-width="1.5"/>
  </g>

  <path class="boca boca-sonrisa" d="M -20 -246 Q 0 -222 20 -246 Q 0 -238 -20 -246 Z"
    fill="#e0567f" stroke="#b83a63" stroke-width="2.5" stroke-linejoin="round"/>
  <g class="boca boca-abierta">
    <ellipse cx="0" cy="-238" rx="15" ry="18" fill="#9d1238"/>
    <ellipse cx="0" cy="-228" rx="9" ry="6" fill="#ff8fa3"/>
  </g>
  <path class="boca boca-mastica" d="M -14 -240 Q -7 -233 0 -240 Q 7 -247 14 -240"
    fill="none" stroke="#b83a63" stroke-width="4" stroke-linecap="round"/>
  <g class="boca boca-risa">
    <path d="M -28 -252 Q 0 -204 28 -252 Q 0 -246 -28 -252 Z" fill="#c9184a" stroke="#9d1238" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="0" cy="-226" rx="10" ry="6" fill="#ff8fa3"/>
  </g>
  <g class="boca boca-puchero" fill="none" stroke-linecap="round">
    <path d="M -18 -230 Q 0 -248 18 -230" stroke="#b83a63" stroke-width="4.5"/>
    <path d="M -8 -227 Q 0 -221 8 -227" stroke="#e0567f" stroke-width="3"/>
  </g>
  <ellipse class="boca boca-bostezo" cx="0" cy="-234" rx="17" ry="24" fill="#9d1238"/>
  <ellipse class="boca boca-chupa" cx="0" cy="-238" rx="9" ry="10" fill="#9d1238"/>
  <g class="boca boca-chupon">
    <circle cx="0" cy="-219" r="13" fill="none" stroke="#ff8cc6" stroke-width="6"/>
    <ellipse cx="0" cy="-238" rx="28" ry="17" fill="#8fd3ff" stroke="#4fa8dd" stroke-width="4"/>
    <ellipse cx="0" cy="-240" rx="8" ry="9" fill="#d6f1ff"/>
  </g>`;

// ---------- Lo que no está en el ropero ----------

// Pañal: se ve cuando el bebé no trae ropa (menos en la tina).
const PANAL = `
  <path d="M -88 -80 Q 0 -60 88 -80 L 100 -36 Q 76 4 0 8 Q -76 4 -100 -36 Z" fill="#ffffff" stroke="#b9d6ee" stroke-width="4" stroke-linejoin="round"/>
  <rect x="-94" y="-80" width="24" height="16" rx="5" fill="#9ad8ff"/><rect x="70" y="-80" width="24" height="16" rx="5" fill="#9ad8ff"/>
  <path d="M -20 -40 C -26 -46 -32 -50 -32 -56 C -32 -61 -25 -63 -20 -57 C -15 -63 -8 -61 -8 -56 C -8 -50 -14 -46 -20 -40 Z" fill="#ffc4dc"/>`;

// Pañal sucio: amarillento, con una manchita café asomándose.
const PANAL_SUCIO = `
  <path d="M -88 -80 Q 0 -60 88 -80 L 100 -36 Q 76 4 0 8 Q -76 4 -100 -36 Z" fill="#f6e9c4" stroke="#cdb57a" stroke-width="4" stroke-linejoin="round"/>
  <rect x="-94" y="-80" width="24" height="16" rx="5" fill="#9ad8ff"/><rect x="70" y="-80" width="24" height="16" rx="5" fill="#9ad8ff"/>
  <path d="M -30 -72 Q -10 -62 6 -72 Q 20 -64 34 -72 Q 26 -52 0 -50 Q -24 -52 -30 -72 Z" fill="#a8743f" opacity="0.75"/>
  <path d="M -20 -40 C -26 -46 -32 -50 -32 -56 C -32 -61 -25 -63 -20 -57 C -15 -63 -8 -61 -8 -56 C -8 -50 -14 -46 -20 -40 Z" fill="#d9c08d"/>`;

const BABERO = `
  <path d="M -62 -200 Q 0 -176 62 -200 L 70 -128 Q 0 -86 -70 -128 Z" fill="#ffffff" stroke="#e58fb4" stroke-width="4" stroke-linejoin="round"/>
  <path d="M -60 -126 Q 0 -94 60 -126" fill="none" stroke="#ff9fc4" stroke-width="4" stroke-dasharray="3 8" stroke-linecap="round"/>
  <path d="M 0 -128 C -9 -136 -22 -144 -22 -156 C -22 -166 -10 -170 0 -160 C 10 -170 22 -166 22 -156 C 22 -144 9 -136 0 -128 Z" fill="#ff8cc6"/>`;

const TOALLA = {
  encima: `<path d="M -102 -192 Q -122 -100 -106 -16 L 106 -16 Q 122 -100 102 -192 Q 0 -218 -102 -192 Z" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="4" stroke-linejoin="round"/>
    <path d="M -112 -70 Q 0 -54 112 -70 M -116 -110 Q 0 -94 116 -110" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>`,
  capucha: `${ambos('<circle cx="-82" cy="-410" r="22" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="4"/><circle cx="-82" cy="-410" r="11" fill="#ffc4e1"/>')}
    <path d="M -126 -296 Q -128 -436 0 -436 Q 128 -436 126 -296 L 106 -296 Q 106 -412 0 -412 Q -106 -412 -106 -296 Z" fill="#9ad8ff" stroke="#5aa9d6" stroke-width="4" stroke-linejoin="round"/>`,
};

const COBIJA = {
  atras: '<ellipse cx="0" cy="-292" rx="164" ry="74" fill="#ffffff" stroke="#d6c8f0" stroke-width="4"/>',
  encima: `<path d="M -158 -196 Q 0 -214 158 -196 L 168 -24 Q 0 -6 -168 -24 Z" fill="url(#cobija-estrellas)" stroke="#9b86d6" stroke-width="4" stroke-linejoin="round"/>
    <path d="M -158 -196 Q 0 -214 158 -196 L 160 -172 Q 0 -190 -160 -172 Z" fill="#ffffff" stroke="#9b86d6" stroke-width="4" stroke-linejoin="round"/>
    <circle class="piel" cx="-58" cy="-192" r="20"/><circle class="piel" cx="58" cy="-192" r="20"/>`,
};

const DEFS = `
  <defs>
    <pattern id="cobija-estrellas" patternUnits="userSpaceOnUse" width="48" height="48">
      <rect width="48" height="48" fill="#cdbbff"/>
      <path d="M 12 4 L 14.6 9.6 L 20.6 10.2 L 16 14.2 L 17.4 20 L 12 17 L 6.6 20 L 8 14.2 L 3.4 10.2 L 9.4 9.6 Z" fill="#fff6c2"/>
      <circle cx="36" cy="34" r="4" fill="#ffffff" opacity="0.8"/>
    </pattern>
  </defs>`;

// ---------- El bebé ----------

export function crearBebe(contenedor) {
  contenedor.innerHTML = `${DEFS}
    <g class="bebe-respirar"><g class="bebe-anim"><g class="bebe" data-pose="sentado"
        data-ojos="abiertos" data-boca="sonrisa">
      <defs class="b-defs"></defs>
      <g class="b-atras"></g>
      <g class="b-cuerpo">${TORSO}</g>
      <g class="b-ropa-torso"></g>
      <g class="b-piernas">${PIERNAS}</g>
      <g class="b-panal"></g>
      <g class="b-ropa-piernas"></g>
      <g class="b-pies"></g>
      <g class="b-brazos">${BRAZOS}</g>
      <g class="b-ropa-mangas"></g>
      <g class="b-encima"></g>
      <g class="b-cabeza">${CABEZA_SVG}</g>
      <g class="b-capucha"></g>
      <g class="b-sombrero"></g>
      <g class="b-manchas"></g>
      <g class="b-espuma"></g>
    </g></g></g>`;

  const bebe = contenedor.querySelector('.bebe');
  const anim = contenedor.querySelector('.bebe-anim');
  const parte = (nombre) => contenedor.querySelector(`.b-${nombre}`);
  const espuma = parte('espuma');

  let puesto = {};
  let modo = 'puesta';
  let panal = 'limpio';   // en el cambiador: 'limpio', 'sucio' o 'ninguno'
  let conBabero = false;

  function dibujarRopa() {
    const desnudo = modo === 'nada' || modo === 'toalla' || modo === 'panal';
    const dibujo = (lugar) => {
      const p = !desnudo && prendaPorId(puesto[lugar]);
      return p ? p.dibujo() : {};
    };
    const ropa = dibujo('ropa');
    const cabeza = dibujo('cabeza');
    const pies = dibujo('pies');
    parte('defs').innerHTML = (ropa.defs || '') + (cabeza.defs || '') + (pies.defs || '');
    parte('ropa-torso').innerHTML = ropa.torso || '';
    parte('ropa-piernas').innerHTML = ropa.piernas || '';
    parte('ropa-mangas').innerHTML = ropa.mangas || '';
    if (modo === 'panal') parte('panal').innerHTML = { limpio: PANAL, sucio: PANAL_SUCIO }[panal] || '';
    else parte('panal').innerHTML = modo !== 'nada' && !ropa.torso ? PANAL : '';
    parte('pies').innerHTML = pies.pies || '';
    // Si trae algo en la cabeza, se quita la capucha del disfraz.
    parte('capucha').innerHTML = modo === 'toalla' ? TOALLA.capucha : (!cabeza.sombrero && ropa.capucha) || '';
    parte('sombrero').innerHTML = cabeza.sombrero || '';
    parte('encima').innerHTML = { toalla: TOALLA.encima, cobija: COBIJA.encima }[modo] || (conBabero ? BABERO : '');
    parte('atras').innerHTML = modo === 'cobija' ? COBIJA.atras : '';
  }

  let base = { ojos: 'abiertos', boca: 'sonrisa' };
  let finExpresion = 0;
  let temporizador = null;

  function aplicarCara(ojos, boca) {
    bebe.dataset.ojos = ojos;
    bebe.dataset.boca = boca;
  }

  const api = {
    elemento: bebe,

    pose(p) { bebe.dataset.pose = p; },

    /** Ropa del ropero: { ropa, cabeza, pies } con el id de cada prenda (o null). */
    vestir(nuevo) {
      puesto = { ...nuevo };
      dibujarRopa();
    },

    /** Pañal en el cambiador: 'limpio', 'sucio' o 'ninguno'. Solo se ve en modo 'panal'. */
    panal(estado) {
      panal = estado;
      dibujarRopa();
    },

    /** 'puesta' (su ropa), 'nada' (en la tina), 'toalla', 'panal' (sin ropa, en el cambiador)
     *  o 'cobija' (acostado en la cuna). */
    modo(m) {
      modo = m;
      dibujarRopa();
    },

    babero(si) {
      conBabero = si;
      dibujarRopa();
    },

    /** Cara de siempre (a la que regresa después de reírse, comer, etc.). */
    base(ojos, boca) {
      base = { ojos, boca };
      if (performance.now() >= finExpresion) aplicarCara(ojos, boca);
    },

    /** Cara por un ratito; luego vuelve a la de siempre. */
    expresion(ojos, boca, ms = 1000) {
      finExpresion = performance.now() + ms;
      aplicarCara(ojos, boca);
      clearTimeout(temporizador);
      temporizador = setTimeout(() => aplicarCara(base.ojos, base.boca), ms);
    },

    /** Sueño de 0 a 1: los párpados bajan poco a poco. */
    sueno(s) {
      const g = parte('cabeza').querySelector('.parpados');
      if (s <= 0.02) { g.innerHTML = ''; return; }
      const y = -318 + Math.min(s, 1) * 38;
      g.innerHTML = ambos(
        `<path class="parpado" d="M -64 -322 L -24 -322 L -24 ${y} Q -44 ${y + 6} -64 ${y} Z"/>` +
        `<path d="M -62 ${y} Q -44 ${y + 6} -26 ${y}" fill="none" stroke="#3d2b4f" stroke-width="3" stroke-linecap="round"/>`);
    },

    hipo(si) { if (si) bebe.dataset.hipo = 'si'; else delete bebe.dataset.hipo; },

    animar(nombre) {
      anim.classList.remove('salto', 'cosquillas', 'palmada', 'estirarse');
      anim.getBoundingClientRect();   // para que la animación vuelva a empezar
      anim.classList.add(nombre);
    },

    /** Manchas de lodo o de comida: [{ x, y, color, vida }] en coordenadas del bebé. */
    manchas(lista) {
      parte('manchas').innerHTML = lista.map((m) => {
        const r = m.tam || 16;
        return `<g opacity="${Math.max(0, m.vida).toFixed(2)}" fill="${m.color}">` +
          `<circle cx="${m.x}" cy="${m.y}" r="${r}"/>` +
          `<circle cx="${m.x + r * 0.65}" cy="${m.y - r * 0.4}" r="${r * 0.7}"/>` +
          `<circle cx="${m.x - r * 0.55}" cy="${m.y + r * 0.45}" r="${r * 0.6}"/></g>`;
      }).join('');
    },

    // Espuma del baño: bolitas sueltas que se agregan y se quitan.
    agregarEspuma(x, y) {
      const r = 9 + Math.random() * 9;
      const b = document.createElementNS(NS, 'g');
      b.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      b.dataset.x = x;
      b.dataset.y = y;
      b.innerHTML = `<circle r="${r.toFixed(1)}" fill="#ffffff" stroke="#bfe6ff" stroke-width="2"/>` +
        `<circle cx="${(-r * 0.35).toFixed(1)}" cy="${(-r * 0.35).toFixed(1)}" r="${(r * 0.28).toFixed(1)}" fill="#e3f5ff"/>`;
      espuma.append(b);
    },
    quitarEspumaCerca(x, y, radio) {
      let quitadas = 0;
      for (const b of [...espuma.children]) {
        if (Math.hypot(b.dataset.x - x, b.dataset.y - y) < radio) {
          b.remove();
          quitadas++;
        }
      }
      return quitadas;
    },
    espumaCerca(x, y, radio) {
      return [...espuma.children].some((b) => Math.hypot(b.dataset.x - x, b.dataset.y - y) < radio);
    },
    cuantaEspuma: () => espuma.children.length,
    primeraEspuma: () => {
      const b = espuma.firstElementChild;
      return b ? [Number(b.dataset.x), Number(b.dataset.y)] : null;
    },
    limpiarEspuma() { espuma.innerHTML = ''; },

    /** ¿El punto (en coordenadas del bebé) cae sobre el bebé? */
    contiene([x, y]) {
      if (Math.hypot(x - CABEZA[0], y - CABEZA[1]) < 120) return true;
      if (bebe.dataset.pose === 'acostado') return x > -170 && x < 170 && y > -210 && y < -10;
      if (((x / 96) ** 2 + ((y + 112) / 102) ** 2) < 1) return true;
      if (Math.abs(x) < 150 && y > -60 && y < 10) return true;          // piernas
      return Math.abs(x) > 60 && Math.abs(x) < 145 && y > -190 && y < -55;   // brazos
    },
  };

  return api;
}

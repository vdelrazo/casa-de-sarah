// Casa de Sarah: cuidar a un bebé. Aquí se arma la pantalla y se reparten los toques
// a la actividad del momento (jugar, comer, pañal, bañar, vestir, dormir).

import { crearBebe } from './bebe.js';
import { dibujarFondo, LUGARES } from './escenas.js';
import { ICONO_ACTIVIDAD, HERRAMIENTAS, MANITA, ESTRELLA, SOL, CAMARA, ALBUM, CERRAR } from './iconos.js';
import { tomarFoto, cargarFotos, guardarFotos } from './camara.js';
import { prendaPorId, ROPA_INICIAL } from './ropa-bebe.js';
import { pompaEn } from './pompas.js';
import * as sonido from './sonido.js';
import jugar from './jugar.js';
import comer from './comer.js';
import panal from './panal.js';
import banar from './banar.js';
import vestir from './vestir.js';
import dormir from './dormir.js';

const ACTIVIDADES = { jugar, comer, panal, banar, vestir, dormir };
const BARRA = ['jugar', 'comer', 'panal', 'banar', 'vestir', 'dormir'];
// Lo que el bebé va pidiendo, en orden, como un día de bebé.
const CICLO = ['comer', 'panal', 'banar', 'vestir', 'jugar', 'dormir'];
const CLAVE = 'casa-de-sarah.bebe';
const ESPERA_PISTA = 6000;   // ms sin tocar nada antes de que salga la manita
const LEVANTAR = 36;          // la herramienta va un poco arriba del dedo, para que se vea

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const escenario = $('escenario');
const escena = $('escena');

// ---------- Guardar en el iPad ----------

function cargar() {
  try {
    localStorage.removeItem('casa-de-sarah.ropa');   // del vestidor anterior
    const g = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    const ropa = { ...ROPA_INICIAL };
    if (g.ropa && typeof g.ropa === 'object') {
      for (const lugar of Object.keys(ropa)) {
        const p = prendaPorId(g.ropa[lugar]);
        ropa[lugar] = p && p.cajon === lugar ? p.id : null;
      }
    }
    return {
      estrellas: Number.isInteger(g.estrellas) && g.estrellas >= 0 ? g.estrellas : 0,
      pide: CICLO.includes(g.pide) ? g.pide : 'comer',
      ropa,
    };
  } catch {
    return { estrellas: 0, pide: 'comer', ropa: { ...ROPA_INICIAL } };
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch { /* sin guardar: el juego sigue igual */ }
}

const estado = cargar();

// ---------- La escena ----------

escena.setAttribute('viewBox', '0 0 600 640');
escena.setAttribute('preserveAspectRatio', 'xMidYMax meet');
escena.innerHTML = `
  <g id="mecedora"><g id="aura"></g><g id="atras"></g><g id="bebe-pos"></g><g id="frente"></g></g>
  <g id="fijos"></g><g id="efectos"></g><g id="globo"></g>`;

const bebe = crearBebe($('bebe-pos'));
let actual = null;

function aEscena(x, y) {
  const p = new DOMPoint(x, y).matrixTransform(escena.getScreenCTM().inverse());
  return [p.x, p.y];
}

function aPantalla([x, y]) {
  const p = new DOMPoint(x, y).matrixTransform(escena.getScreenCTM());
  return { x: p.x, y: p.y };
}

// Lo que las actividades pueden usar.
const ctx = {
  bebe,
  sonido,
  aBebe([x, y]) {
    const b = LUGARES[actual.id].bebe;
    return [x - b.x, y - b.y];
  },
  deBebe([x, y]) {
    const b = LUGARES[actual.id].bebe;
    return [x + b.x, y + b.y];
  },
  aEscena,
  aPantalla: (p) => aPantalla(p),
  corazones: (p) => lanzarChispas(aPantalla(p), 'corazon'),
  grupo: (id) => escena.querySelector(`#${id}`) || escena.querySelector(`.${id}`),
  refrescarHerramienta,
  terminar,
  cosquillas,
  chispas: (p) => lanzarChispas(aPantalla(p)),
  noche: (si) => escenario.classList.toggle('noche', si),
  dibujarGlobo: () => dibujarGlobo(),
  mostrarSol: (si) => { $('btn-sol').hidden = !si; },
  repasar,

  // Ropa del bebé: { ropa, cabeza, pies }.
  ropa: () => estado.ropa,
  cambiarRopa(lugar, id) {
    estado.ropa[lugar] = id;
    guardar();
    bebe.vestir(estado.ropa);
  },
  quitarRopa() {
    estado.ropa = { ropa: null, cabeza: null, pies: null };
    guardar();
    bebe.vestir(estado.ropa);
  },

  arrastrable,
  fantasma: (html) => crearFantasma(html),
  /** Brillo detrás del bebé mientras se le acerca algo para ponérselo. */
  resaltarBebe(si) {
    const b = LUGARES[actual.id].bebe;
    $('aura').innerHTML = si
      ? `<ellipse class="aura" cx="${b.x}" cy="${b.y - 230}" rx="215" ry="270"/>`
      : '';
  },
  /** Enseña un movimiento con la manita de inmediato. */
  ensenar(p) {
    ocultarManita();
    mostrarManita(p);
  },
};

function irA(id) {
  if (actual?.id === id) return;
  actual?.salir?.(ctx);
  ocultarManita();
  actual = ACTIVIDADES[id];
  const lugar = LUGARES[id];

  dibujarFondo($('fondo'), lugar.fondo);
  $('atras').innerHTML = lugar.atras;
  $('frente').innerHTML = lugar.frente;
  $('fijos').innerHTML = lugar.fijos || '';
  $('efectos').innerHTML = '';
  const mecedora = $('mecedora');
  mecedora.style.transition = 'none';
  mecedora.style.transform = '';
  escenario.classList.remove('noche');
  $('btn-sol').hidden = true;

  $('bebe-pos').setAttribute('transform', `translate(${lugar.bebe.x} ${lugar.bebe.y})`);
  $('aura').innerHTML = '';
  bebe.pose(lugar.bebe.pose);
  bebe.modo(lugar.bebe.modo);
  bebe.babero(!!lugar.bebe.babero);
  bebe.sueno(0);
  bebe.hipo(false);
  bebe.manchas([]);
  bebe.limpiarEspuma();

  actual.entrar(ctx);
  mostrarHerramientas();
  marcarBarra();
  dibujarGlobo();
  repasar();
  pidioDesde = performance.now();
}

// ---------- Barra de abajo ----------

function armarBarra() {
  $('barra').replaceChildren(...BARRA.map((id) => {
    const b = document.createElement('button');
    b.className = 'actividad';
    b.dataset.id = id;
    b.setAttribute('aria-label', id);
    b.innerHTML = ICONO_ACTIVIDAD[id];
    b.addEventListener('click', () => {
      sonido.boton();
      irA(id);
    });
    return b;
  }));
}

function marcarBarra() {
  for (const b of $('barra').children) {
    b.classList.toggle('activa', b.dataset.id === actual.id);
    b.classList.toggle('late', b.dataset.id === estado.pide && estado.pide !== actual.id);
  }
}

// ---------- Herramientas y ropa que se arrastran ----------

const iconoDe = (id) => actual.icono?.(id) ?? HERRAMIENTAS[id].icono();
let fantasma = null;   // lo que va en el dedo: { id, el, mover, quitar }

/** Dibujo que sigue al dedo. Su `punta` (en la caja de 100 × 100) queda un poco arriba del dedo. */
function crearFantasma(html, punta = [50, 50], id = null) {
  const tam = 150;
  const el = document.createElement('div');
  el.className = 'fantasma';
  el.innerHTML = html;
  document.body.append(el);
  const f = {
    id,
    el,
    mover(x, y) {
      el.style.transform = `translate(${x - (punta[0] / 100) * tam}px, ${y - LEVANTAR - (punta[1] / 100) * tam}px)`;
    },
    quitar() {
      el.remove();
      if (fantasma === f) fantasma = null;
    },
  };
  fantasma?.quitar();
  fantasma = f;
  return f;
}

/**
 * Hace que un botón se pueda arrastrar. Mientras se mueve llama alMover(punto de la escena);
 * al soltar, alSoltar(punto, cancelado). Si casi no se movió y hay alTocar, llama alTocar().
 */
function arrastrable(boton, { icono, punta = [50, 50], alMover, alSoltar, alTocar }) {
  let dedo = null;
  let inicio = null;
  let movio = false;
  let f = null;
  const enEscena = (e) => aEscena(e.clientX, e.clientY - LEVANTAR);

  boton.addEventListener('pointerdown', (e) => {
    if (dedo !== null || fantasma) return;
    tocoAlgo();
    dedo = e.pointerId;
    inicio = { x: e.clientX, y: e.clientY };
    movio = false;
    boton.setPointerCapture(e.pointerId);
    f = crearFantasma(icono(), punta, boton.dataset.id);
    f.mover(e.clientX, e.clientY);
    boton.classList.add('en-uso');
    sonido.tomar();
  });

  boton.addEventListener('pointermove', (e) => {
    if (e.pointerId !== dedo) return;
    f.mover(e.clientX, e.clientY);
    if (Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 12) movio = true;
    alMover?.(enEscena(e));
  });

  const soltar = (e, cancelado) => {
    if (e.pointerId !== dedo) return;
    dedo = null;
    f.quitar();
    boton.classList.remove('en-uso');
    tocoAlgo();   // antes de alTocar, que puede encender la manita a propósito
    if (!movio && !cancelado && alTocar) alTocar();
    else alSoltar?.(enEscena(e), cancelado);
    repasar();
  };
  boton.addEventListener('pointerup', (e) => soltar(e, false));
  boton.addEventListener('pointercancel', (e) => soltar(e, true));
}

function mostrarHerramientas() {
  const caja = $('herramientas');
  caja.classList.toggle('con-ropero', !!actual.panel);
  if (actual.panel) {
    actual.panel(ctx, caja);
    return;
  }
  caja.replaceChildren(...actual.herramientas.map((id) => {
    const b = document.createElement('button');
    b.className = 'herramienta';
    b.dataset.id = id;
    b.setAttribute('aria-label', id);
    b.innerHTML = iconoDe(id);
    arrastrable(b, {
      icono: () => iconoDe(id),
      punta: HERRAMIENTAS[id].punta,
      alMover: (p) => actual.alMover?.(id, p, ctx),
      alSoltar: (p) => actual.alSoltar?.(id, p, ctx),
    });
    return b;
  }));
}

function refrescarHerramienta(id) {
  const icono = iconoDe(id);
  const b = $('herramientas').querySelector(`[data-id="${id}"]`);
  if (b) b.innerHTML = icono;
  if (fantasma?.id === id) fantasma.el.innerHTML = icono;
}

// ---------- Toques en la escena ----------

let toque = null;   // { id, x, y, p, arrastrando, ignorar }
const cliente = (e) => ({ x: e.clientX, y: e.clientY });

escena.addEventListener('pointerdown', (e) => {
  tocoAlgo();
  if (toque || fantasma) return;
  const p = aEscena(e.clientX, e.clientY);
  // La burbuja de pedidos lleva a lo que pide (salvo que haya una pompa de jabón encima).
  if (globo && Math.hypot(p[0] - globo.x, p[1] - globo.y) < 80 && !pompaEn($('efectos'), cliente(e))) {
    sonido.boton();
    irA(estado.pide);
    return;
  }
  toque = { id: e.pointerId, x: e.clientX, y: e.clientY, p, arrastrando: false, ignorar: false };
  escena.setPointerCapture(e.pointerId);
});

escena.addEventListener('pointermove', (e) => {
  if (!toque || e.pointerId !== toque.id || toque.ignorar) return;
  const p = aEscena(e.clientX, e.clientY);
  if (!toque.arrastrando) {
    if (Math.hypot(e.clientX - toque.x, e.clientY - toque.y) < 10) return;
    toque.arrastrando = true;
    if (!actual.alArrastrar?.(toque.p, 'inicio', ctx, cliente(e))) {
      toque.ignorar = true;
      return;
    }
  }
  actual.alArrastrar(p, 'mover', ctx, cliente(e));
});

const terminarToque = (e, cancelado) => {
  if (!toque || e.pointerId !== toque.id) return;
  const p = aEscena(e.clientX, e.clientY);
  if (toque.arrastrando && !toque.ignorar) actual.alArrastrar(p, cancelado ? 'cancelar' : 'fin', ctx, cliente(e));
  else if (!toque.arrastrando && !cancelado) actual.alTocar?.(p, ctx, cliente(e));
  toque = null;
  repasar();
};
escena.addEventListener('pointerup', (e) => terminarToque(e, false));
escena.addEventListener('pointercancel', (e) => terminarToque(e, true));

// ---------- El bebé se ríe y gana estrellas ----------

let finRisa = 0;

function cosquillas() {
  const ahora = performance.now();
  if (ahora < finRisa) return;
  finRisa = ahora + 1100;
  bebe.expresion('felices', 'risa', 1100);
  bebe.animar('cosquillas');
  sonido.risa();
  lanzarChispas(aPantalla(ctx.deBebe([0, -300])), 'corazon');
}

function terminar({ dormido = false } = {}) {
  estado.estrellas++;
  if (estado.pide === actual.id) {
    estado.pide = CICLO[(CICLO.indexOf(actual.id) + 1) % CICLO.length];
    pidioDesde = performance.now();
  }
  guardar();

  if (!dormido) {
    bebe.expresion('felices', 'risa', 1400);
    bebe.animar('salto');
    setTimeout(() => sonido.risa(), 400);
  }
  sonido.estrella();
  const cabeza = aPantalla(ctx.deBebe([0, -300]));
  lanzarChispas(cabeza);
  volarEstrella(cabeza);
  setTimeout(() => {
    dibujarGlobo();
    marcarBarra();
    repasar();
  }, 1300);
}

function volarEstrella(desde) {
  const destino = $('contador').querySelector('svg').getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'estrella-vuela';
  el.innerHTML = ESTRELLA;
  document.body.append(el);
  const dx = destino.left + destino.width / 2 - desde.x;
  const dy = destino.top + destino.height / 2 - desde.y;
  el.style.left = `${desde.x}px`;
  el.style.top = `${desde.y}px`;
  el.animate([
    { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
    { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 1, offset: 0.25 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.7)`, opacity: 1 },
  ], { duration: 1100, easing: 'ease-in-out' }).onfinish = () => {
    el.remove();
    mostrarEstrellas(true);
  };
}

function mostrarEstrellas(saltar) {
  const c = $('contador');
  c.querySelector('span').textContent = estado.estrellas;
  if (!saltar) return;
  c.classList.remove('salta');
  void c.offsetWidth;
  c.classList.add('salta');
}

// ---------- Brillitos y corazones ----------

const COLORES = ['#ffc800', '#ff6fb3', '#a77bff', '#4fb8f5'];
const CHISPA = 'M 0 -9 L 2.4 -2.4 L 9 0 L 2.4 2.4 L 0 9 L -2.4 2.4 L -9 0 L -2.4 -2.4 Z';
const CORAZON = 'M 0 8 C -8 2 -10 -2 -10 -5 C -10 -9 -5 -11 0 -6 C 5 -11 10 -9 10 -5 C 10 -2 8 2 0 8 Z';

function lanzarChispas({ x, y }, forma = 'chispa') {
  const caja = $('chispas');
  const r = caja.getBoundingClientRect();
  const n = forma === 'corazon' ? 5 : 10;
  for (let i = 0; i < n; i++) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '-10 -10 20 20');
    s.setAttribute('class', 'chispa');
    const color = forma === 'corazon' ? '#ff6fb3' : COLORES[i % COLORES.length];
    s.innerHTML = `<path d="${forma === 'corazon' ? CORAZON : CHISPA}" fill="${color}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>`;
    s.style.left = `${x - r.left}px`;
    s.style.top = `${y - r.top}px`;
    caja.append(s);
    const angulo = forma === 'corazon'
      ? -Math.PI / 2 + (i - (n - 1) / 2) * 0.45
      : (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const d = forma === 'corazon' ? 120 + Math.random() * 40 : 90 + Math.random() * 70;
    const dx = Math.cos(angulo) * d;
    const dy = Math.sin(angulo) * d;
    s.animate([
      { transform: 'translate(0, 0) scale(0.5)', opacity: 1 },
      { transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) scale(1.1)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.8)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 250, easing: 'ease-out' }).onfinish = () => s.remove();
  }
}

// ---------- Burbuja: lo que pide el bebé ----------

let globo = null;   // { x, y } centro en la escena, o null si no se ve
let pidioDesde = performance.now();

function dibujarGlobo() {
  const g = $('globo');
  const dormido = bebe.elemento.dataset.ojos === 'dormidos';   // dormido no pide nada
  if (!estado.pide || estado.pide === actual.id || dormido) {
    g.innerHTML = '';
    globo = null;
    return;
  }
  const [hx, hy] = ctx.deBebe([0, -300]);
  const x = Math.min(522, hx + 175);
  const y = Math.max(78, hy - 140);
  globo = { x, y };
  const nubes = [[-40, 6, 34], [0, -18, 42], [40, 6, 34], [0, 22, 36]];
  const icono = ICONO_ACTIVIDAD[estado.pide].replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  g.innerHTML = `<g class="globo-in">
    <circle cx="${hx + 92}" cy="${hy - 58}" r="9" fill="#fff" stroke="#c9b6e8" stroke-width="4"/>
    <circle cx="${hx + 122}" cy="${hy - 88}" r="14" fill="#fff" stroke="#c9b6e8" stroke-width="4"/>
    ${nubes.map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#fff" stroke="#c9b6e8" stroke-width="9"/>`).join('')}
    ${nubes.map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#fff"/>`).join('')}
    <svg x="${x - 40}" y="${y - 40}" width="80" height="80" viewBox="0 0 100 100">${icono}</svg>
  </g>`;
}

// Cada ratito el bebé "recuerda" lo que quiere: la burbuja brinca y balbucea.
// Si lleva mucho esperando en el tapete, hace un pucherito (nunca llora fuerte); si pide pañal, "pfff".
setInterval(() => {
  if (!jugando || !globo || toque || fantasma) return;
  const g = $('globo').firstElementChild;
  g?.classList.remove('brinca');
  g?.getBoundingClientRect();
  g?.classList.add('brinca');
  const esperando = performance.now() - pidioDesde;
  if (estado.pide === 'panal' && Math.random() < 0.5) {
    sonido.pedo();   // "pfff": ya necesita cambio de pañal
  } else if (actual.id === 'jugar' && esperando > 40000 && Math.random() < 0.5) {
    bebe.expresion('tristes', 'puchero', 1800);
    sonido.puchero();
  } else {
    sonido.balbuceo();
  }
}, 13000);

// ---------- Pistas: lo que toca hacer brilla, y si no, sale una manita ----------

let ultimoToque = performance.now();
let manita = null;

function pistaActual() {
  const p = actual.pista?.(ctx);
  if (p) return p;
  if (globo) return { tocar: [globo.x, globo.y] };
  return null;
}

function repasar() {
  const p = pistaActual();
  for (const b of $('herramientas').querySelectorAll('[data-id], [data-cajon]')) {
    const brilla = Boolean(p && ((p.herramienta && p.herramienta === b.dataset.id) || (p.elemento && b.matches(p.elemento))));
    b.classList.toggle('brilla', brilla);
  }
}

function tocoAlgo() {
  ultimoToque = performance.now();
  ocultarManita();
}

function ocultarManita() {
  if (!manita) return;
  manita.cancel();
  manita = null;
  $('manita').hidden = true;
}

function centro(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function mostrarManita(p = pistaActual()) {
  if (!p) return;
  const el = $('manita');
  // La punta del dedo de la manita está en (37, 4) de su dibujo de 100 × 100; mide 90 px.
  const en = ({ x, y }, extra = {}) => ({ transform: `translate(${x - 33}px, ${y - 4}px) scale(${extra.s || 1})`, opacity: extra.o ?? 1 });
  let cuadros = [];
  if (p.herramienta) {
    const boton = $('herramientas').querySelector(`[data-id="${p.herramienta}"]`);
    if (!boton) return;
    const inicio = centro(boton);
    const puntos = p.hasta.map(aPantalla);
    const fin = puntos[puntos.length - 1];
    cuadros = [en(inicio, { o: 0 }), en(inicio), en(inicio, { s: 0.85 }), ...puntos.map((q) => en(q, { s: 0.85 }))];
    if (p.frotar) cuadros.push(en({ x: fin.x - 30, y: fin.y }, { s: 0.85 }), en({ x: fin.x + 30, y: fin.y }, { s: 0.85 }), en(fin, { s: 0.85 }));
    if (p.sostener) cuadros.push(en(fin, { s: 0.85 }), en(fin, { s: 0.85 }));
    cuadros.push(en(fin, { o: 0 }));
  } else if (p.tocar || p.elemento) {
    const q = p.tocar ? aPantalla(p.tocar) : centro(document.querySelector(p.elemento));
    cuadros = [en({ x: q.x + 40, y: q.y + 60 }, { o: 0 }), en(q), en(q, { s: 0.8 }), en(q), en(q, { s: 0.8 }), en(q, { o: 0 })];
  } else if (p.arrastrar) {
    // Arrastrar algo de la escena (el pañal sucio al bote).
    const [a, b] = p.arrastrar.map(aPantalla);
    cuadros = [en(a, { o: 0 }), en(a), en(a, { s: 0.85 }), en(b, { s: 0.85 }), en(b, { s: 0.85 }), en(b, { o: 0 })];
  } else if (p.mecer) {
    const q = aPantalla(p.mecer);
    const izq = { x: q.x - 80, y: q.y };
    const der = { x: q.x + 80, y: q.y };
    cuadros = [en(izq, { o: 0 }), en(izq, { s: 0.85 }), en(der, { s: 0.85 }), en(izq, { s: 0.85 }), en(der, { s: 0.85 }), en(der, { o: 0 })];
  }
  if (!cuadros.length) return;
  el.hidden = false;
  manita = el.animate(cuadros, { duration: 2600, iterations: 2, easing: 'ease-in-out' });
  manita.onfinish = () => {
    el.hidden = true;
    manita = null;
    ultimoToque = performance.now();
  };
}

setInterval(() => {
  if (!jugando || manita || toque || fantasma || !$('album').hidden) return;
  if (performance.now() - ultimoToque > ESPERA_PISTA) mostrarManita();
}, 500);

// ---------- Cámara y álbum ----------

let fotos = cargarFotos();
let tomando = false;

function mostrarCuantas(saltar) {
  const c = $('btn-album').querySelector('.cuantas');
  c.hidden = !fotos.length;
  c.textContent = fotos.length;
  if (!saltar) return;
  const b = $('btn-album');
  b.classList.remove('salta');
  void b.offsetWidth;
  b.classList.add('salta');
}

/** La foto recién tomada vuela, en su marquito, hasta el botón del álbum. */
function volarFoto(foto) {
  const r = escena.getBoundingClientRect();
  const destino = $('btn-album').getBoundingClientRect();
  const ancho = Math.min(r.width * 0.55, 420);
  const x = r.left + r.width / 2 - ancho / 2;
  const y = r.top + r.height * 0.12;
  const img = new Image();
  img.src = foto;
  img.className = 'foto-vuela';
  img.style.width = `${ancho}px`;
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;
  document.body.append(img);
  const dx = destino.left + destino.width / 2 - (x + ancho / 2);
  const dy = destino.top + destino.height / 2 - (y + ancho / 2);
  img.animate([
    { transform: 'scale(0.9) rotate(0deg)', opacity: 0 },
    { transform: 'scale(1) rotate(-4deg)', opacity: 1, offset: 0.2 },
    { transform: 'scale(1) rotate(-4deg)', opacity: 1, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(-14deg)`, opacity: 0.7 },
  ], { duration: 1500, easing: 'ease-in-out' }).onfinish = () => {
    img.remove();
    mostrarCuantas(true);
  };
}

$('btn-camara').insertAdjacentHTML('afterbegin', CAMARA);
$('btn-album').insertAdjacentHTML('afterbegin', ALBUM);
$('btn-cerrar-album').innerHTML = CERRAR;

$('btn-camara').addEventListener('click', async () => {
  if (tomando || fantasma) return;
  tomando = true;
  tocoAlgo();
  // ¡Sonríe para la foto! (si está dormido, se queda dormidito)
  if (bebe.elemento.dataset.ojos !== 'dormidos') bebe.expresion('felices', 'risa', 900);
  sonido.obturador();
  $('flash').animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 450, easing: 'ease-out' });
  try {
    const foto = await tomarFoto({ fondo: $('fondo'), escena, noche: escenario.classList.contains('noche') });
    fotos = guardarFotos([...fotos, foto]);
    volarFoto(foto);
  } catch (err) {
    console.warn('No se pudo tomar la foto', err);
  }
  tomando = false;
});

function abrirAlbum() {
  const caja = $('fotos');
  caja.replaceChildren();
  if (!fotos.length) caja.innerHTML = `<div class="vacio">${CAMARA}</div>`;
  // La más nueva primero.
  [...fotos].reverse().forEach((foto, i) => {
    const b = document.createElement('button');
    b.className = 'foto';
    b.style.setProperty('--giro', `${((i * 37) % 7) - 3}deg`);
    const img = new Image();
    img.src = foto;
    img.alt = '';
    b.append(img);
    b.addEventListener('click', () => {
      sonido.boton();
      $('foto-grande').querySelector('img').src = foto;
      $('foto-grande').hidden = false;
    });
    caja.append(b);
  });
  $('album').hidden = false;
  $('album').scrollTop = 0;
}

$('btn-album').addEventListener('click', () => {
  tocoAlgo();
  sonido.boton();
  abrirAlbum();
});
$('btn-cerrar-album').addEventListener('click', () => {
  sonido.boton();
  $('album').hidden = true;
});
$('foto-grande').addEventListener('click', () => {
  $('foto-grande').hidden = true;
});

// ---------- Botones sueltos ----------

$('btn-sol').innerHTML = SOL;
$('btn-sol').addEventListener('click', () => {
  tocoAlgo();
  actual.despertar?.(ctx);
});

$('contador').insertAdjacentHTML('afterbegin', ESTRELLA);
$('manita').innerHTML = MANITA;

let jugando = false;

// "click" a propósito: es el evento con el que iOS deja activar el audio.
$('btn-jugar').addEventListener('click', () => {
  sonido.iniciarAudio();
  $('inicio').hidden = true;
  jugando = true;
  tocoAlgo();
  bebe.animar('salto');
  sonido.balbuceo();
  pidioDesde = performance.now();
});

// iOS no deja hacer zoom con dos dedos si se cancela este gesto.
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// ---------- Arranque ----------

armarBarra();
mostrarEstrellas(false);
mostrarCuantas(false);
bebe.vestir(estado.ropa);
irA('jugar');

if (new URLSearchParams(location.search).has('depurar')) {
  window.__juego = {
    estado,
    irA,
    ctx,
    get actual() { return actual.id; },
    pista: pistaActual,
    manita: mostrarManita,
    aPantalla,
    deBebe: (p) => ctx.deBebe(p),
    fotos: () => fotos,
  };
}

$('btn-jugar').hidden = false;

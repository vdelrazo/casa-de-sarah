// Casa de Sarah: el vestidor. Ropero, toques, arrastre, dado, gancho y cosquillas.

import { crearMuneca, LUGARES } from './muneca.js';
import { PRENDAS, CATEGORIAS, prendaPorId, dibujarPrenda, aclarar } from './ropa.js';
import { dibujarCuarto } from './cuarto.js';
import * as sonido from './sonido.js';

const $ = (id) => document.getElementById(id);
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const CLAVE = 'casa-de-sarah.ropa';

const ELOGIOS = ['¡Me encanta!', '¡Qué bonito!', '¡Me queda muy bien!', '¡Mírame!'];
const COSQUILLAS = ['¡Jijiji, cosquillas!', '¡Me haces cosquillas!', '¡Jajaja!'];

const escenario = $('escenario');
const ropero = $('ropero');
const muneca = crearMuneca($('muneca'));
dibujarCuarto($('cuarto'));

let puesto = cargar();
let categoria = CATEGORIAS[0];

// ---------- Guardar en el iPad ----------

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    const limpio = {};
    for (const lugar of LUGARES) {
      const prenda = prendaPorId(guardado[lugar]);
      if (prenda && prenda.capa === lugar) limpio[lugar] = prenda.id;
    }
    return limpio;
  } catch {
    return {};
  }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(puesto));
  } catch { /* sin guardar: el juego sigue igual */ }
}

// ---------- Poner y quitar ----------

const estaPuesta = (prenda) => puesto[prenda.capa] === prenda.id;

function actualizar() {
  muneca.vestir(puesto);
  for (const b of $('prendas').children) {
    b.classList.toggle('puesta', estaPuesta(prendaPorId(b.dataset.id)));
  }
  guardar();
}

function ponerse(prenda) {
  if (prenda.capa === 'vestido') {
    delete puesto.arriba;
    delete puesto.abajo;
  }
  if (prenda.capa === 'arriba' || prenda.capa === 'abajo') delete puesto.vestido;
  puesto[prenda.capa] = prenda.id;
  actualizar();
  muneca.animar('saltar');
  lanzarChispas(muneca.centroDe(prenda.capa));
  sonido.sonidoPoner();
  sonido.decir(Math.random() < 0.35 ? `¡${prenda.nombre}! ${azar(ELOGIOS)}` : `¡${prenda.nombre}!`);
}

function quitarse(prenda) {
  delete puesto[prenda.capa];
  actualizar();
  sonido.sonidoQuitar();
  sonido.decir(`¡Adiós, ${prenda.nombre.charAt(0).toLowerCase()}${prenda.nombre.slice(1)}!`);
}

// ---------- Ropero: cajones ----------

function mostrarPestanas() {
  $('pestanas').replaceChildren(...CATEGORIAS.map((cat) => {
    const b = document.createElement('button');
    b.className = 'pestana';
    b.dataset.cat = cat.id;
    b.style.setProperty('--color', cat.color);
    b.setAttribute('aria-label', cat.nombre);
    b.innerHTML = cat.icono;
    b.addEventListener('click', () => elegirCategoria(cat));
    return b;
  }));
  marcarPestana();
}

function elegirCategoria(cat) {
  if (cat !== categoria) {
    categoria = cat;
    marcarPestana();
    mostrarPrendas();
  }
  sonido.sonidoPestana();
  sonido.decir(cat.nombre);
}

function marcarPestana() {
  for (const b of $('pestanas').children) b.classList.toggle('activa', b.dataset.cat === categoria.id);
  ropero.style.setProperty('--fondo-cajon', aclarar(categoria.color, 0.84));
  ropero.style.setProperty('--color-cajon', categoria.color);
}

// ---------- Ropero: prendas ----------

function mostrarPrendas() {
  document.querySelectorAll('.fantasma').forEach((f) => f.remove());
  escenario.classList.remove('recibir');
  const botones = PRENDAS.filter((p) => p.cat === categoria.id).map(crearBotonPrenda);
  $('prendas').replaceChildren(...botones);
  for (const b of botones) ajustarMiniatura(b.querySelector('svg'));
  actualizar();
}

function crearBotonPrenda(prenda) {
  const b = document.createElement('button');
  b.className = 'prenda';
  b.dataset.id = prenda.id;
  b.setAttribute('aria-label', prenda.nombre);
  const { principal, mangas } = dibujarPrenda(prenda);
  b.innerHTML = `<svg viewBox="0 0 300 600" aria-hidden="true"><g>${principal}${mangas}</g></svg>`;
  manejarToque(b, prenda);
  return b;
}

/** Recorta la miniatura para que la prenda llene su cuadrito. */
function ajustarMiniatura(svg) {
  const caja = svg.firstElementChild.getBBox();
  if (!caja.width) return;
  const lado = Math.max(caja.width, caja.height) * 1.1 + 8;
  const cx = caja.x + caja.width / 2;
  const cy = caja.y + caja.height / 2;
  svg.setAttribute('viewBox', `${cx - lado / 2} ${cy - lado / 2} ${lado} ${lado}`);
}

/** Un toque pone o quita la prenda; arrastrarla hasta la muñeca se la pone. */
function manejarToque(boton, prenda) {
  let inicio = null;
  let fantasma = null;

  boton.addEventListener('pointerdown', (e) => {
    if (inicio) return;   // ya hay otro dedo sobre esta prenda
    inicio = { x: e.clientX, y: e.clientY, id: e.pointerId };
    boton.setPointerCapture(e.pointerId);
    boton.classList.add('apretada');
  });

  boton.addEventListener('pointermove', (e) => {
    if (!inicio || e.pointerId !== inicio.id) return;
    if (!fantasma && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 14) {
      fantasma = document.createElement('div');
      fantasma.className = 'fantasma';
      fantasma.append(boton.querySelector('svg').cloneNode(true));
      document.body.append(fantasma);
      sonido.sonidoTomar();
    }
    if (fantasma) {
      fantasma.style.left = `${e.clientX}px`;
      fantasma.style.top = `${e.clientY}px`;
      escenario.classList.toggle('recibir', sobreEscenario(e));
    }
  });

  const terminar = (e, cancelado) => {
    if (!inicio || e.pointerId !== inicio.id) return;
    boton.classList.remove('apretada');
    if (fantasma) {
      fantasma.remove();
      fantasma = null;
      escenario.classList.remove('recibir');
      if (!cancelado && sobreEscenario(e)) ponerse(prenda);
    } else if (!cancelado) {
      if (estaPuesta(prenda)) quitarse(prenda);
      else ponerse(prenda);
    }
    inicio = null;
  };
  boton.addEventListener('pointerup', (e) => terminar(e, false));
  boton.addEventListener('pointercancel', (e) => terminar(e, true));
}

function sobreEscenario(e) {
  const r = escenario.getBoundingClientRect();
  return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
}

// ---------- Brillitos ----------

const COLORES_CHISPA = ['#ffc800', '#ff6fb3', '#a77bff', '#4fb8f5'];

function lanzarChispas({ x, y }) {
  const caja = $('chispas');
  const r = caja.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const chispa = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chispa.setAttribute('viewBox', '-10 -10 20 20');
    chispa.setAttribute('class', 'chispa');
    chispa.innerHTML = `<path d="M 0 -9 L 2.4 -2.4 L 9 0 L 2.4 2.4 L 0 9 L -2.4 2.4 L -9 0 L -2.4 -2.4 Z" ` +
      `fill="${azar(COLORES_CHISPA)}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>`;
    chispa.style.left = `${x - r.left}px`;
    chispa.style.top = `${y - r.top}px`;
    caja.append(chispa);
    const angulo = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
    const distancia = 70 + Math.random() * 70;
    const dx = Math.cos(angulo) * distancia;
    const dy = Math.sin(angulo) * distancia;
    const animacion = chispa.animate([
      { transform: 'translate(0, 0) scale(0.5) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) scale(1.1) rotate(120deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.8) rotate(180deg)`, opacity: 0 },
    ], { duration: 800 + Math.random() * 250, easing: 'ease-out' });
    animacion.onfinish = () => chispa.remove();
  }
}

// ---------- Dado mágico y gancho ----------

function ropaSorpresa() {
  const de = (lugar) => azar(PRENDAS.filter((p) => p.capa === lugar));
  const nuevo = {};
  const poner = (p) => { nuevo[p.capa] = p.id; };
  if (Math.random() < 0.45) {
    poner(de('vestido'));
  } else {
    poner(de('arriba'));
    poner(de('abajo'));
  }
  poner(de('zapatos'));
  if (Math.random() < 0.7) poner(de('cabeza'));
  const cuantos = Math.floor(Math.random() * 3);   // 0, 1 o 2 accesorios
  const accesorios = PRENDAS.filter((p) => p.cat === 'accesorios').sort(() => Math.random() - 0.5);
  let puestos = 0;
  for (const p of accesorios) {
    if (puestos >= cuantos) break;
    if (nuevo[p.capa]) continue;
    poner(p);
    puestos++;
  }
  return nuevo;
}

let girando = false;
$('btn-dado').addEventListener('click', () => {
  if (girando) return;
  girando = true;
  sonido.sonidoDado();
  muneca.animar('girar');
  // A la mitad de la vuelta, cuando la muñeca está de lado, cambia la ropa.
  setTimeout(() => {
    puesto = ropaSorpresa();
    actualizar();
  }, 220);
  setTimeout(() => {
    girando = false;
    lanzarChispas(muneca.centroDe('cuerpo'));
    sonido.decir(azar(['¡Ta-dá!', '¡Sorpresa!', '¡Ta-dá! ¿Te gusta?']));
  }, 620);
});

$('btn-quitar').addEventListener('click', () => {
  puesto = {};
  actualizar();
  muneca.animar('saltar');
  sonido.sonidoQuitar();
  sonido.decir('¡Toda la ropa a su lugar!');
});

// ---------- Cosquillas ----------

$('muneca').addEventListener('pointerdown', (e) => {
  if (e.target === e.currentTarget) return;   // tocó el espacio vacío alrededor
  if (!muneca.reir()) return;
  sonido.sonidoRisa();
  sonido.decir(azar(COSQUILLAS));
});

// ---------- Pantalla de inicio ----------

// "click" a propósito: es el evento con el que iOS deja activar el audio y la voz.
$('btn-jugar').addEventListener('click', () => {
  sonido.iniciarAudio();
  sonido.decir('¡Hola! ¿Me ayudas a escoger mi ropa?');
  $('inicio').hidden = true;
  muneca.animar('saltar');
});

// iOS no deja hacer zoom con dos dedos si se cancela este gesto.
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// ---------- Arranque ----------

mostrarPestanas();
mostrarPrendas();

// Para revisar el estado desde la consola o en pruebas automáticas: agregar ?depurar a la dirección.
if (new URLSearchParams(location.search).has('depurar')) {
  window.__juego = {
    get puesto() { return { ...puesto }; },
    ponerse: (id) => ponerse(prendaPorId(id)),
    vestir: (nuevo) => { puesto = { ...nuevo }; actualizar(); },
    elegirCategoria: (id) => elegirCategoria(CATEGORIAS.find((c) => c.id === id)),
  };
}

$('btn-jugar').hidden = false;

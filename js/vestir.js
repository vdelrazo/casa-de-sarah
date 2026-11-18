// Vestir: el bebé en su cambiador y un ropero con tres cajones (ropa, cabeza, pies).
// La ropa se pone SOLO arrastrándola hasta el bebé; tocarla en el ropero no la pone,
// solo hace que la manita enseñe a arrastrar. Para quitarla, se jala del bebé hacia afuera.

import { CAJONES, PRENDAS, prendaPorId } from './ropa-bebe.js';

const NS = 'http://www.w3.org/2000/svg';
const PARTES = ['torso', 'piernas', 'mangas', 'capucha', 'sombrero', 'pies'];
// Dónde cae cada cosa en el bebé (para los brillitos y la manita).
const ZONA = { ropa: [0, -120], cabeza: [0, -400], pies: [-100, -14] };

const r1 = (v) => Math.round(v * 10) / 10;
let e = null;
const cajas = new Map();   // id de la prenda → viewBox de su miniatura

// ---------- Miniaturas ----------

function contenidoDe(prenda) {
  const d = prenda.dibujo();
  // Los zapatos se ven mejor como par juntito que en los pies separados del bebé.
  const partes = prenda.cajon === 'pies' ? [d.par] : PARTES.map((k) => d[k] || '');
  return `<defs>${d.defs || ''}</defs>` + partes.join('');
}

/** Recorte de la miniatura: se mide una sola vez, fuera de la pantalla. */
function cajaDe(prenda) {
  if (cajas.has(prenda.id)) return cajas.get(prenda.id);
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden');
  s.innerHTML = `<g>${contenidoDe(prenda)}</g>`;
  document.body.append(s);
  const b = s.firstElementChild.getBBox();
  s.remove();
  const lado = Math.max(b.width, b.height) * 1.08 + 12;
  const caja = `${r1(b.x + b.width / 2 - lado / 2)} ${r1(b.y + b.height / 2 - lado / 2)} ${r1(lado)} ${r1(lado)}`;
  cajas.set(prenda.id, caja);
  return caja;
}

const miniatura = (prenda) =>
  `<svg viewBox="${cajaDe(prenda)}" aria-hidden="true">${contenidoDe(prenda)}</svg>`;

// ---------- ¿Dónde está el dedo? ----------

/** Para ponerse ropa basta con soltarla cerca del bebé. */
function cercaDelBebe(p, ctx) {
  const [x, y] = ctx.aBebe(p);
  return Math.abs(x) < 175 && y > -490 && y < 40;
}

/** Qué prenda puesta hay bajo el dedo, para jalarla. */
function prendaBajo(p, ctx) {
  const l = ctx.aBebe(p);
  const ropa = ctx.ropa();
  if (ropa.cabeza && l[1] < -330 && l[1] > -545 && Math.abs(l[0]) < 160) return 'cabeza';
  if (ropa.pies && l[1] > -52 && l[1] < 40 && Math.abs(l[0]) > 64 && Math.abs(l[0]) < 140) return 'pies';
  if (ropa.ropa && l[1] > -205 && ctx.bebe.contiene(l)) return 'ropa';
  return null;
}

// ---------- Poner y quitar ----------

function ponerse(prenda, ctx) {
  ctx.cambiarRopa(prenda.cajon, prenda.id);
  ctx.bebe.animar('salto');
  ctx.bebe.expresion('felices', 'risa', 900);
  ctx.sonido.ponerRopa();
  ctx.chispas(ctx.deBebe(prenda.cajon === 'pies' ? [0, -20] : ZONA[prenda.cajon]));
  marcar(ctx);
  const r = ctx.ropa();
  if (!e.estrella && r.ropa && r.pies) {
    e.estrella = true;
    setTimeout(() => e && ctx.terminar(), 600);
  }
  ctx.repasar();
}

/** Tocar una prenda no la pone: la sacude y la manita enseña a arrastrarla. */
function ensenar(boton, prenda, ctx) {
  boton.classList.remove('sacudir');
  void boton.offsetWidth;
  boton.classList.add('sacudir');
  ctx.sonido.boton();
  ctx.ensenar({ herramienta: prenda.id, hasta: [ctx.deBebe(ZONA[prenda.cajon])] });
}

// ---------- El ropero ----------

function mostrarPrendas(ctx) {
  e.prendas.replaceChildren(...PRENDAS.filter((p) => p.cajon === e.cajon).map((prenda) => {
    const b = document.createElement('button');
    b.className = 'prenda-bebe';
    b.dataset.id = prenda.id;
    b.setAttribute('aria-label', prenda.nombre);
    b.innerHTML = miniatura(prenda);
    ctx.arrastrable(b, {
      icono: () => b.innerHTML,
      alMover: (p) => ctx.resaltarBebe(cercaDelBebe(p, ctx)),
      alSoltar: (p, cancelado) => {
        ctx.resaltarBebe(false);
        if (!cancelado && cercaDelBebe(p, ctx)) ponerse(prenda, ctx);
      },
      alTocar: () => ensenar(b, prenda, ctx),
    });
    return b;
  }));
  marcar(ctx);
}

function marcar(ctx) {
  if (!e) return;
  const r = ctx.ropa();
  for (const b of e.cajones.children) b.classList.toggle('activo', b.dataset.cajon === e.cajon);
  for (const b of e.prendas.children) {
    const p = prendaPorId(b.dataset.id);
    b.classList.toggle('puesta', r[p.cajon] === p.id);
  }
}

export default {
  id: 'vestir',
  herramientas: [],

  panel(ctx, caja) {
    const ropero = document.createElement('div');
    ropero.className = 'ropero';
    e.cajones = document.createElement('div');
    e.cajones.className = 'cajones';
    e.prendas = document.createElement('div');
    e.prendas.className = 'prendas-bebe';
    for (const c of CAJONES) {
      const b = document.createElement('button');
      b.className = 'cajon';
      b.dataset.cajon = c.id;
      b.style.setProperty('--color', c.color);
      b.setAttribute('aria-label', c.id);
      b.innerHTML = c.icono;
      b.addEventListener('click', () => {
        ctx.sonido.boton();
        if (e.cajon === c.id) return;
        e.cajon = c.id;
        mostrarPrendas(ctx);
        ctx.repasar();
      });
      e.cajones.append(b);
    }
    ropero.append(e.cajones, e.prendas);
    caja.replaceChildren(ropero);
    mostrarPrendas(ctx);
  },

  entrar(ctx) {
    const r = ctx.ropa();
    e = { cajon: r.ropa ? (r.pies ? 'cabeza' : 'pies') : 'ropa', estrella: false, jalando: null };
    ctx.bebe.base('abiertos', 'sonrisa');
  },

  salir(ctx) {
    e?.jalando?.fantasma.quitar();
    ctx.resaltarBebe(false);
    e = null;
  },

  alArrastrar(p, fase, ctx, cliente) {
    if (fase === 'inicio') {
      const lugar = prendaBajo(p, ctx);
      if (!lugar) return false;
      const prenda = prendaPorId(ctx.ropa()[lugar]);
      ctx.cambiarRopa(lugar, null);
      ctx.sonido.tomar();
      e.jalando = { prenda, fantasma: ctx.fantasma(miniatura(prenda)) };
      e.jalando.fantasma.mover(cliente.x, cliente.y);
      marcar(ctx);
      return true;
    }
    if (!e?.jalando) return false;
    if (fase === 'mover') {
      e.jalando.fantasma.mover(cliente.x, cliente.y);
      ctx.resaltarBebe(ctx.bebe.contiene(ctx.aBebe(p)));
      return true;
    }
    // Al soltar: si quedó sobre el bebé, se la vuelve a poner; si no, se la quitó.
    const { prenda, fantasma } = e.jalando;
    e.jalando = null;
    fantasma.quitar();
    ctx.resaltarBebe(false);
    if (fase === 'fin' && ctx.bebe.contiene(ctx.aBebe(p))) {
      ctx.cambiarRopa(prenda.cajon, prenda.id);
    } else {
      ctx.sonido.quitarRopa();
    }
    marcar(ctx);
    ctx.repasar();
    return true;
  },

  alTocar(p, ctx) {
    if (ctx.bebe.contiene(ctx.aBebe(p))) ctx.cosquillas();
  },

  pista(ctx) {
    if (!e || e.estrella || e.jalando) return null;
    const r = ctx.ropa();
    const falta = !r.ropa ? 'ropa' : !r.pies ? 'pies' : null;
    if (!falta) return null;
    if (e.cajon !== falta) return { elemento: `.cajon[data-cajon="${falta}"]` };
    const primera = PRENDAS.find((p) => p.cajon === falta);
    return { herramienta: primera.id, hasta: [ctx.deBebe(ZONA[falta])] };
  },
};

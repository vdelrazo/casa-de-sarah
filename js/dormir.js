// Dormir: el bebé en su moisés. Mecerlo (arrastrando de lado a lado, o tocando la cuna)
// toca la canción de cuna y le da sueño; el chupón ayuda. Ya dormido, se apaga la lámpara.
// Con la luz apagada aparece un sol: al tocarlo, el bebé despierta.

import { BOCA } from './bebe.js';

const NS = 'http://www.w3.org/2000/svg';
const LAMPARA = [565, 340];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const limitar = (v, min, max) => Math.max(min, Math.min(max, v));

let e = null;

const enLampara = (p) => p[0] > 512 && p[1] > 290 && p[1] < 600;
const enCuna = (p) => !enLampara(p) && p[0] > 60 && p[0] < 540 && p[1] > 150 && p[1] < 640;

function inclinar(ctx, grados, suave) {
  const m = ctx.grupo('mecedora');
  m.style.transition = suave ? 'transform 0.9s cubic-bezier(.34,1.56,.64,1)' : 'none';
  m.style.transform = `rotate(${grados}deg)`;
  e.angulo = grados;
}

function unaMecida(ctx) {
  ctx.sonido.compasCuna();
  if (e.dormido) return;
  e.sueno = Math.min(1, e.sueno + (e.chupon ? 0.17 : 0.11));
  actualizarSueno(ctx);
  ctx.repasar();
}

function actualizarSueno(ctx) {
  ctx.bebe.sueno(e.sueno);
  if ((e.sueno >= 0.4 && e.bostezos === 0) || (e.sueno >= 0.75 && e.bostezos === 1)) {
    e.bostezos++;
    ctx.bebe.expresion('abiertos', 'bostezo', 1100);
    ctx.sonido.bostezo();
  }
  if (e.sueno >= 1) {
    e.dormido = true;
    ctx.bebe.sueno(0);
    ctx.bebe.base('dormidos', e.chupon ? 'chupon' : 'sonrisa');
    zetas(ctx, true);
    ctx.dibujarGlobo();   // dormido no pide nada
  }
}

/** Mecida automática al tocar la cuna (más fácil que arrastrar para los más chicos). */
function mecerSolo(ctx) {
  const m = ctx.grupo('mecedora');
  m.style.transition = 'none';
  m.style.transform = 'rotate(0deg)';
  m.animate([
    { transform: 'rotate(0deg)' }, { transform: 'rotate(9deg)' },
    { transform: 'rotate(-8deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' },
  ], { duration: 1300, easing: 'ease-in-out' });
  unaMecida(ctx);
}

function zetas(ctx, si) {
  const efectos = ctx.grupo('efectos');
  efectos.querySelector('.zetas')?.remove();
  if (!si) return;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'zetas');
  const [x, y] = ctx.deBebe([70, -380]);
  g.innerHTML = [0, 1, 2].map((i) =>
    `<text class="zeta" x="${x + i * 22}" y="${y - i * 26}" style="animation-delay:${i * 0.8}s">Z</text>`).join('');
  efectos.append(g);
}

function cambiarLuz(ctx) {
  e.luz = !e.luz;
  ctx.sonido.click();
  ctx.noche(!e.luz);
  ctx.mostrarSol(!e.luz);
  if (!e.luz && e.dormido && !e.terminado) {
    e.terminado = true;
    ctx.terminar({ dormido: true });
  }
  ctx.repasar();
}

export default {
  id: 'dormir',
  herramientas: ['chupon'],

  entrar(ctx) {
    e = { sueno: 0, chupon: false, dormido: false, luz: true, angulo: 0, lado: 0, arrastre: null, bostezos: 0, terminado: false };
    ctx.bebe.base('abiertos', 'sonrisa');
    ctx.bebe.sueno(0);
    inclinar(ctx, 0, false);
  },

  salir(ctx) {
    ctx.noche(false);
    ctx.mostrarSol(false);
    zetas(ctx, false);
    ctx.bebe.sueno(0);
    e = null;
  },

  alMover(id, p, ctx) {
    if (id !== 'chupon' || e.chupon || dist(p, ctx.deBebe(BOCA)) > 56) return;
    e.chupon = true;
    ctx.sonido.trago();
    ctx.bebe.base(e.dormido ? 'dormidos' : 'abiertos', 'chupon');
    e.sueno = Math.min(1, e.sueno + 0.2);
    if (!e.dormido) actualizarSueno(ctx);
    ctx.repasar();
  },

  alArrastrar(p, fase, ctx) {
    if (fase === 'inicio') {
      if (!enCuna(p)) return false;
      e.arrastre = { x0: p[0], a0: e.angulo };
      return true;
    }
    if (!e.arrastre) return false;
    if (fase === 'mover') {
      const a = limitar((p[0] - e.arrastre.x0) * 0.12 + e.arrastre.a0, -13, 13);
      inclinar(ctx, a, false);
      const lado = a > 5 ? 1 : a < -5 ? -1 : 0;
      if (lado && lado !== e.lado) {
        if (e.lado) unaMecida(ctx);
        e.lado = lado;
      }
    } else {
      e.arrastre = null;
      e.lado = 0;
      inclinar(ctx, 0, true);
    }
    return true;
  },

  alTocar(p, ctx) {
    if (enLampara(p)) cambiarLuz(ctx);
    else if (enCuna(p)) mecerSolo(ctx);
  },

  /** El sol: prende la luz y el bebé despierta. */
  despertar(ctx) {
    if (!e) return;
    e.luz = true;
    ctx.noche(false);
    ctx.mostrarSol(false);
    if (e.dormido) {
      Object.assign(e, { dormido: false, sueno: 0, bostezos: 0, chupon: false });
      zetas(ctx, false);
      ctx.bebe.sueno(0);
      ctx.bebe.base('abiertos', 'sonrisa');
      ctx.bebe.animar('estirarse');
      ctx.sonido.despertar();
      setTimeout(() => e && ctx.cosquillas(), 900);
    }
    ctx.dibujarGlobo();
    ctx.repasar();
  },

  pista(ctx) {
    if (!e) return null;
    if (!e.luz) return { elemento: '#btn-sol' };
    if (e.dormido) return e.terminado ? null : { tocar: LAMPARA };
    if (!e.chupon && e.sueno >= 0.3) return { herramienta: 'chupon', hasta: [ctx.deBebe(BOCA)] };
    return { mecer: [300, 470] };
  },
};

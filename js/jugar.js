// Jugar: el bebé en su tapete. Mantita para "¿dónde está el bebé?", burbujero, sonaja
// y la pelota del tapete. Con 3 juegos distintos gana una estrella. Tocarlo le da cosquillas.

import { soltarPompa, reventarPompa } from './pompas.js';
import { HERRAMIENTAS } from './iconos.js';

const NS = 'http://www.w3.org/2000/svg';
const CABEZA = [0, -300];
const MANO = [116, -78];          // mano derecha del bebé (en la pantalla)
const PELOTA = [532, 566];        // en la escena
const ORDEN = ['mantita', 'burbujas', 'sonaja', 'pelota'];
const POMPAS_PARA_CONTAR = 5;

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

let e = null;

function divertido(ctx, juego) {
  if (e.hechos.has(juego)) return;
  e.hechos.add(juego);
  if (!e.estrella && e.hechos.size >= 3) {
    e.estrella = true;
    setTimeout(() => e && ctx.terminar(), 1200);
  }
  ctx.repasar();
}

// ---------- ¿Dónde está el bebé? ----------

const cercaDeLaCabeza = (p, ctx) => dist(ctx.aBebe(p), CABEZA) < 175;

function taparCara(ctx) {
  const [bx, by] = ctx.deBebe([0, 0]);
  const fuera = document.createElementNS(NS, 'g');
  fuera.setAttribute('transform', `translate(${bx} ${by})`);
  const ondas = [];
  for (let i = 0; i < 7; i++) {
    const a = 150 - i * (300 / 7);
    const b = a - 300 / 7;
    ondas.push(`Q ${((a + b) / 2).toFixed(1)} -214 ${b.toFixed(1)} -232`);
  }
  fuera.innerHTML = `<g class="manta-cara">
    <path d="M -150 -232 Q -162 -452 0 -458 Q 162 -452 150 -232 ${ondas.join(' ')} Z"
      fill="#cdbbff" stroke="#9b86d6" stroke-width="5" stroke-linejoin="round"/>
    <g fill="#fff6c2"><circle cx="-70" cy="-380" r="9"/><circle cx="40" cy="-410" r="9"/><circle cx="-20" cy="-320" r="9"/>
      <circle cx="80" cy="-330" r="9"/><circle cx="-90" cy="-290" r="9"/><circle cx="30" cy="-270" r="9"/></g>
  </g>`;
  ctx.grupo('efectos').append(fuera);
  e.tapado = fuera;
  ctx.sonido.frotar();
  ctx.repasar();
}

function destapar(ctx) {
  const fuera = e.tapado;
  e.tapado = null;
  fuera.firstElementChild.animate([
    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
    { transform: 'translate(160px, -260px) rotate(35deg)', opacity: 0 },
  ], { duration: 550, easing: 'ease-in' }).onfinish = () => fuera.remove();
  // "¡Aquí está!": carcajada.
  ctx.bebe.expresion('felices', 'risa', 1800);
  ctx.bebe.animar('salto');
  ctx.sonido.carcajada();
  ctx.corazones(ctx.deBebe(CABEZA));
  divertido(ctx, 'mantita');
}

// ---------- Burbujero ----------

function hacerBurbujas(p, ctx) {
  if (e.ultimaPompa && dist(p, e.ultimaPompa) < 24) return;
  e.ultimaPompa = p;
  const efectos = ctx.grupo('efectos');
  if (efectos.querySelectorAll('.pompa').length > 26) return;
  soltarPompa(efectos, p, { subir: 260, radio: [12, 24], duracion: [4000, 5500] });
}

// ---------- Sonaja ----------

function agitarSonaja(p, ctx) {
  if (e.ultimaSonaja && dist(p, e.ultimaSonaja) < 22) return;
  e.ultimaSonaja = p;
  const ahora = performance.now();
  if (ahora - e.ultimoSonido > 130) {
    ctx.sonido.sonaja();
    e.ultimoSonido = ahora;
  }
  const cerca = dist(ctx.aBebe(p), [0, -200]) < 280;
  ctx.bebe.base('abiertos', cerca ? 'abierta' : 'sonrisa');
  if (cerca && ++e.agitadas === 8) {
    ctx.bebe.expresion('felices', 'risa', 1000);
    ctx.sonido.risa();
    divertido(ctx, 'sonaja');
  }
}

/** Si se suelta la sonaja en el bebé, la agarra y la sacude un ratito. */
function darSonaja(ctx) {
  e.sostiene?.remove();
  const [x, y] = ctx.deBebe(MANO);
  const g = document.createElementNS(NS, 'g');
  g.innerHTML = `<g class="agitar">${HERRAMIENTAS.sonaja.icono()
    .replace('<svg ', `<svg x="${x - 76}" y="${y - 82}" width="90" height="90" `)}</g>`;
  ctx.grupo('efectos').append(g);
  e.sostiene = g;
  [0, 400, 800].forEach((ms) => setTimeout(() => e && ctx.sonido.sonaja(), ms));
  ctx.bebe.expresion('felices', 'risa', 1200);
  setTimeout(() => {
    if (e?.sostiene === g) e.sostiene = null;
    g.remove();
  }, 3500);
  divertido(ctx, 'sonaja');
}

// ---------- Pelota ----------

function botarPelota(ctx) {
  const pelota = ctx.grupo('pelota')?.querySelector('.rebota');
  if (!pelota) return;
  pelota.animate([
    { transform: 'translateY(0)' }, { transform: 'translateY(-110px)' }, { transform: 'translateY(0)' },
    { transform: 'translateY(-40px)' }, { transform: 'translateY(0)' },
  ], { duration: 1000, easing: 'ease-in-out' });
  ctx.sonido.rebote();
  setTimeout(() => e && ctx.sonido.rebote(), 500);
  setTimeout(() => {
    if (!e) return;
    ctx.bebe.expresion('felices', 'risa', 1000);
    ctx.sonido.risa();
  }, 350);
  divertido(ctx, 'pelota');
}

export default {
  id: 'jugar',
  herramientas: ['mantita', 'burbujero', 'sonaja'],

  entrar(ctx) {
    e = {
      hechos: new Set(), estrella: false, tapado: null, sostiene: null,
      pompas: 0, agitadas: 0, ultimaPompa: null, ultimaSonaja: null, ultimoSonido: 0,
    };
    ctx.bebe.base('abiertos', 'sonrisa');
  },

  salir(ctx) {
    ctx.resaltarBebe(false);
    e = null;
  },

  alMover(id, p, ctx) {
    if (id === 'mantita') ctx.resaltarBebe(!e.tapado && cercaDeLaCabeza(p, ctx));
    else if (id === 'burbujero') hacerBurbujas(p, ctx);
    else if (id === 'sonaja') agitarSonaja(p, ctx);
  },

  alSoltar(id, p, ctx) {
    ctx.resaltarBebe(false);
    if (id === 'mantita' && !e.tapado && cercaDeLaCabeza(p, ctx)) taparCara(ctx);
    if (id === 'sonaja') {
      ctx.bebe.base('abiertos', 'sonrisa');
      if (ctx.bebe.contiene(ctx.aBebe(p))) darSonaja(ctx);
    }
  },

  alTocar(p, ctx, cliente) {
    if (reventarPompa(ctx.grupo('efectos'), cliente)) {
      ctx.sonido.pop();
      if (++e.pompas === POMPAS_PARA_CONTAR) {
        ctx.bebe.expresion('felices', 'risa', 900);
        ctx.sonido.risa();
        divertido(ctx, 'burbujas');
      }
      return;
    }
    if (dist(p, PELOTA) < 52) {
      botarPelota(ctx);
      return;
    }
    const l = ctx.aBebe(p);
    if (e.tapado && (ctx.bebe.contiene(l) || dist(l, CABEZA) < 175)) destapar(ctx);
    else if (ctx.bebe.contiene(l)) ctx.cosquillas();
  },

  pista(ctx) {
    if (!e) return null;
    if (e.tapado) return { tocar: ctx.deBebe([0, -330]) };
    if (e.estrella) return null;
    const falta = ORDEN.find((j) => !e.hechos.has(j));
    if (falta === 'mantita') return { herramienta: 'mantita', hasta: [ctx.deBebe(CABEZA)] };
    if (falta === 'burbujas') {
      return { herramienta: 'burbujero', hasta: [ctx.deBebe([-170, -330]), ctx.deBebe([170, -330])], frotar: true };
    }
    if (falta === 'sonaja') return { herramienta: 'sonaja', hasta: [ctx.deBebe(MANO)], frotar: true };
    if (falta === 'pelota') return { tocar: PELOTA };
    return null;
  },
};

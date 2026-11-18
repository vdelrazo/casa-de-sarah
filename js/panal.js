// Pañal: el bebé llega con el pañal sucio (olor y una mosquita). Se jala el pañal y vuela
// solo al bote enseñando la popó de caricatura; luego toallitas, talco y pañal limpio.

import { BOTE_CENTRO } from './escenas.js';
import { PANAL_SUCIO_ABIERTO } from './iconos.js';

const NS = 'http://www.w3.org/2000/svg';
// Manchitas de popó (coordenadas del bebé) que quedan al quitar el pañal.
const MANCHAS = [[-56, -48], [50, -42], [-8, -24], [24, -76]];
const CADERA = [0, -48];
const TALCO = 8;   // polvitos de talco para que cuente

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const entre = (a, b) => a + Math.random() * (b - a);

let e = null;

function sonar(nombre, ms, ctx) {
  const ahora = performance.now();
  if (ahora - (e.ultimo[nombre] || 0) < ms) return;
  e.ultimo[nombre] = ahora;
  ctx.sonido[nombre]();
}

// ---------- Olor y mosquita ----------

function olor(ctx, si) {
  const efectos = ctx.grupo('efectos');
  efectos.querySelector('.olor')?.remove();
  if (!si) return;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'olor');
  // A los lados del pañal, para que no parezcan rayones en la pancita.
  g.innerHTML = [-150, 150, -185, 185].map((dx, i) => {
    const [x, y] = ctx.deBebe([dx, Math.abs(dx) > 160 ? -40 : -10]);
    return `<path class="olor-linea" style="animation-delay:${i * 0.5}s"
      d="M ${x} ${y} q 10 -12 0 -24 q -10 -12 0 -24 q 10 -12 0 -24"/>`;
  }).join('');
  efectos.append(g);
}

function mosca(ctx, si) {
  const efectos = ctx.grupo('efectos');
  if (e.mosca) {
    e.mosca.remove();
    e.mosca = null;
  }
  if (!si) return;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'mosca');
  g.innerHTML = `<g transform="scale(1.7)">
    <g class="alas"><ellipse cx="-6" cy="-8" rx="7" ry="10" fill="#ffffff" fill-opacity="0.85" stroke="#9ab" stroke-width="1.5"/>
      <ellipse cx="6" cy="-8" rx="7" ry="10" fill="#ffffff" fill-opacity="0.85" stroke="#9ab" stroke-width="1.5"/></g>
    <ellipse cx="0" cy="0" rx="9" ry="7" fill="#3d3d4f"/>
    <circle cx="-6" cy="-2" r="2.5" fill="#ff6b6b"/></g>`;
  efectos.append(g);
  // Da vueltas alrededor de la cadera del bebé.
  const [cx, cy] = ctx.deBebe([0, -70]);
  const vuelta = [];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    vuelta.push({ transform: `translate(${cx + Math.cos(a) * 150}px, ${cy + Math.sin(a) * 70 - 20 * Math.sin(a * 3)}px)` });
  }
  g.animate(vuelta, { duration: 3400, iterations: Infinity });
  e.mosca = g;
}

function espantarMosca(ctx, cliente) {
  if (!e.mosca) return false;
  const r = e.mosca.getBoundingClientRect();
  if (Math.hypot(cliente.x - (r.left + r.width / 2), cliente.y - (r.top + r.height / 2)) > 50) return false;
  const g = e.mosca;
  e.mosca = null;
  const [x, y] = [r.left + r.width / 2, r.top + r.height / 2];
  const desde = ctx.aEscena(x, y);
  g.getAnimations().forEach((a) => a.cancel());
  g.animate([
    { transform: `translate(${desde[0]}px, ${desde[1]}px)` },
    { transform: `translate(${desde[0] + 260}px, ${desde[1] - 320}px)` },
  ], { duration: 700, easing: 'ease-in' }).onfinish = () => g.remove();
  ctx.sonido.zumbido();
  return true;
}

// ---------- Quitar el pañal sucio ----------

function tirarAlBote(ctx) {
  const { fantasma } = e.jalando;
  e.jalando = null;
  const destino = ctx.aPantalla(BOTE_CENTRO);
  const r = fantasma.el.getBoundingClientRect();
  fantasma.el.animate([
    { transform: fantasma.el.style.transform },
    { transform: `translate(${destino.x - r.width / 2}px, ${destino.y - r.height / 2}px) scale(0.25) rotate(200deg)` },
  ], { duration: 450, easing: 'ease-in' }).onfinish = () => {
    fantasma.quitar();
    ctx.sonido.boing();
    ctx.grupo('bote')?.querySelector('.tapa')?.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-55deg)' }, { transform: 'rotate(0deg)' },
    ], { duration: 500, easing: 'ease-out' });
  };
}

// ---------- Herramientas ----------

function limpiar(p, ctx) {
  if (e.fase !== 'sin') return;
  const l = ctx.aBebe(p);
  let cambio = false;
  for (const m of e.manchas) {
    if (dist([m.x, m.y], l) < 46) {
      m.vida -= 0.16;
      cambio = true;
    }
  }
  if (!cambio) return;
  sonar('frotar', 140, ctx);
  e.manchas = e.manchas.filter((m) => m.vida > 0);
  ctx.bebe.manchas(e.manchas);
  if (!e.manchas.length) {
    e.fase = 'limpio';
    ctx.chispas(ctx.deBebe(CADERA));
    ctx.bebe.expresion('felices', 'sonrisa', 800);
    ctx.repasar();
  }
}

function echarTalco(p, ctx) {
  if (e.fase !== 'limpio') return;
  const l = ctx.aBebe(p);
  if (l[1] < -175 || !ctx.bebe.contiene(l)) return;
  if (e.ultimoTalco && dist(l, e.ultimoTalco) < 18) return;
  e.ultimoTalco = l;
  sonar('talco', 150, ctx);
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('class', 'polvo');
  c.setAttribute('cx', (p[0] + entre(-10, 10)).toFixed(1));
  c.setAttribute('cy', (p[1] + entre(-6, 14)).toFixed(1));
  c.setAttribute('r', entre(9, 15).toFixed(1));
  ctx.grupo('efectos').append(c);
  c.animate([
    { transform: 'scale(0.4)', opacity: 0.95 },
    { transform: 'scale(1.6) translateY(-6px)', opacity: 0 },
  ], { duration: 900, easing: 'ease-out' }).onfinish = () => c.remove();
  e.talco++;
  if (e.talco === TALCO) {
    ctx.chispas(ctx.deBebe(CADERA));
    ctx.repasar();
  }
}

function ponerPanal(ctx) {
  if (e.fase === 'listo') return;
  if (e.fase !== 'limpio') {
    // Todavía no: primero quitar el sucio y limpiar. Pucherito y la pista lo guía.
    ctx.bebe.expresion('tristes', 'puchero', 1300);
    ctx.sonido.puchero();
    ctx.repasar();
    return;
  }
  e.fase = 'listo';
  ctx.bebe.panal('limpio');
  ctx.bebe.base('abiertos', 'sonrisa');
  ctx.sonido.ponerRopa();
  ctx.chispas(ctx.deBebe(CADERA));
  ctx.terminar();
}

export default {
  id: 'panal',
  herramientas: ['toallitas', 'talco', 'panal'],

  entrar(ctx) {
    e = { fase: 'sucio', manchas: [], talco: 0, jalando: null, mosca: null, ultimo: {}, ultimoTalco: null };
    ctx.bebe.panal('sucio');
    ctx.bebe.base('abiertos', 'puchero');
    olor(ctx, true);
    mosca(ctx, true);
    setTimeout(() => e?.fase === 'sucio' && ctx.sonido.pedo(), 500);
  },

  salir(ctx) {
    e.jalando?.fantasma.quitar();
    ctx.bebe.panal('limpio');
    ctx.resaltarBebe(false);
    e = null;
  },

  alMover(id, p, ctx) {
    if (id === 'toallitas') limpiar(p, ctx);
    else if (id === 'talco') echarTalco(p, ctx);
    else if (id === 'panal') ctx.resaltarBebe(ctx.bebe.contiene(ctx.aBebe(p)));
  },

  alSoltar(id, p, ctx) {
    if (id !== 'panal') return;
    ctx.resaltarBebe(false);
    if (ctx.bebe.contiene(ctx.aBebe(p))) ponerPanal(ctx);
  },

  /** Jalar el pañal sucio: sale del bebé y, al soltarlo, vuela al bote. */
  alArrastrar(p, fase, ctx, cliente) {
    if (fase === 'inicio') {
      const l = ctx.aBebe(p);
      if (e.fase !== 'sucio' || Math.abs(l[0]) > 112 || l[1] < -104 || l[1] > 24) return false;
      e.fase = 'sin';
      ctx.bebe.panal('ninguno');
      ctx.bebe.base('abiertos', 'sonrisa');
      e.manchas = MANCHAS.map(([x, y]) => ({ x, y, color: '#8b5a2b', vida: 1, tam: 11 }));
      ctx.bebe.manchas(e.manchas);
      olor(ctx, false);
      mosca(ctx, false);
      ctx.sonido.tomar();
      e.jalando = { fantasma: ctx.fantasma(PANAL_SUCIO_ABIERTO) };
      e.jalando.fantasma.mover(cliente.x, cliente.y);
      return true;
    }
    if (!e?.jalando) return false;
    if (fase === 'mover') e.jalando.fantasma.mover(cliente.x, cliente.y);
    else tirarAlBote(ctx);
    return true;
  },

  alTocar(p, ctx, cliente) {
    if (espantarMosca(ctx, cliente)) return;
    if (ctx.bebe.contiene(ctx.aBebe(p))) ctx.cosquillas();
  },

  pista(ctx) {
    if (!e) return null;
    if (e.fase === 'sucio') return { arrastrar: [ctx.deBebe(CADERA), BOTE_CENTRO] };
    if (e.fase === 'sin') {
      const m = e.manchas[0];
      return { herramienta: 'toallitas', hasta: [ctx.deBebe([m.x, m.y])], frotar: true };
    }
    if (e.fase === 'limpio' && e.talco < TALCO) return { herramienta: 'talco', hasta: [ctx.deBebe([0, -70])], frotar: true };
    if (e.fase === 'limpio') return { herramienta: 'panal', hasta: [ctx.deBebe(CADERA)] };
    return null;
  },
};
